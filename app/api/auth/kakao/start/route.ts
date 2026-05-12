import { NextResponse, type NextRequest } from "next/server";
import {
  generateRandomToken,
  buildKakaoAuthorizeUrl,
} from "@/lib/auth/kakao-oauth";

const STATE_COOKIE = "kakao_oauth_state";
const NONCE_COOKIE = "kakao_oauth_nonce";
const COOKIE_MAX_AGE_SEC = 600; // OAuth round-trip 여유 10분

/**
 * 카카오 로그인 시작점.
 * - state(CSRF) / nonce(OIDC replay) 생성 후 httpOnly 쿠키 저장
 * - 카카오 인증 URL로 302 리다이렉트
 *
 * 콜백(`/auth/callback`)에서 같은 쿠키 값으로 검증.
 */
export async function GET(request: NextRequest) {
  const state = generateRandomToken();
  const nonce = generateRandomToken();
  const redirectUri = `${request.nextUrl.origin}/auth/callback`;

  const authorizeUrl = buildKakaoAuthorizeUrl({ redirectUri, state, nonce });
  const response = NextResponse.redirect(authorizeUrl);

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOpts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE_SEC,
    path: "/",
  };
  response.cookies.set(STATE_COOKIE, state, cookieOpts);
  response.cookies.set(NONCE_COOKIE, nonce, cookieOpts);

  return response;
}
