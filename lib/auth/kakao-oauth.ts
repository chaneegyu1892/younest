/**
 * 카카오 OAuth 2.0 / OIDC 직접 구현.
 *
 * Supabase Kakao provider의 기본 scope에 account_email이 강제로 포함돼서
 * 비즈 앱(사업자 등록)이 아닌 경우 카카오가 OAuth 요청을 거부.
 * → 우리가 직접 OIDC 흐름을 돌리고, 받은 id_token을 signInWithIdToken으로 Supabase에 넘김.
 *
 * 서버 전용 (CLIENT_SECRET 사용).
 */

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";

export interface KakaoTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

/**
 * 64-char hex 문자열. state(CSRF)/nonce(OIDC replay 방어)용.
 */
export function generateRandomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * SHA-256(raw) → hex. OIDC nonce를 카카오에 보낼 때 사용.
 *
 * 패턴 (Supabase signInWithIdToken 호환):
 * 1. raw nonce 생성 → 쿠키에 저장
 * 2. SHA-256(raw) hex → 카카오 authorize URL의 nonce 파라미터
 * 3. 카카오가 id_token.nonce 클레임에 해시값 포함
 * 4. signInWithIdToken({nonce: raw}) → Supabase가 SHA-256(raw) 후 id_token nonce와 비교
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export async function buildKakaoAuthorizeUrl(params: {
  redirectUri: string;
  state: string;
  /** raw nonce — 함수 내부에서 SHA-256 해시 후 URL에 포함 */
  rawNonce: string;
}): Promise<string> {
  const clientId = process.env.KAKAO_REST_API_KEY;
  if (!clientId) throw new Error("KAKAO_REST_API_KEY 환경변수가 비어있습니다.");

  const hashedNonce = await sha256Hex(params.rawNonce);

  const url = new URL(KAKAO_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  // openid: OIDC id_token 발급 / profile_nickname: 닉네임 동의 (account_email 명시 제외)
  url.searchParams.set("scope", "openid profile_nickname");
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", hashedNonce);
  return url.toString();
}

export async function exchangeKakaoCodeForTokens(params: {
  code: string;
  redirectUri: string;
}): Promise<KakaoTokenResponse> {
  const clientId = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  if (!clientId) throw new Error("KAKAO_REST_API_KEY 환경변수가 비어있습니다.");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: params.redirectUri,
    code: params.code,
  });
  // Kakao Dev에서 client_secret 활성화한 경우만 필요. 활성화 안 됐어도 보내면 무시됨.
  if (clientSecret) body.set("client_secret", clientSecret);

  const response = await fetch(KAKAO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`카카오 토큰 교환 실패 (HTTP ${response.status}): ${text}`);
  }

  const json = (await response.json()) as KakaoTokenResponse;
  if (!json.id_token) {
    throw new Error(
      "카카오 응답에 id_token이 없습니다. OpenID Connect 활성화 확인 필요.",
    );
  }
  return json;
}
