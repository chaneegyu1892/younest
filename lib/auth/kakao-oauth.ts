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

export function buildKakaoAuthorizeUrl(params: {
  redirectUri: string;
  state: string;
  nonce: string;
}): string {
  const clientId = process.env.KAKAO_REST_API_KEY;
  if (!clientId) throw new Error("KAKAO_REST_API_KEY 환경변수가 비어있습니다.");

  const url = new URL(KAKAO_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  // openid: OIDC id_token 발급 / profile_nickname: 닉네임 동의 (account_email 명시 제외)
  url.searchParams.set("scope", "openid profile_nickname");
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
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
