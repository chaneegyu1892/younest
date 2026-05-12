import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertUserAfterAuth } from "@/lib/auth/upsert-user";
import { exchangeKakaoCodeForTokens } from "@/lib/auth/kakao-oauth";

const STATE_COOKIE = "kakao_oauth_state";
const NONCE_COOKIE = "kakao_oauth_nonce";

/**
 * 카카오 OAuth 콜백 (직접 OIDC 흐름).
 *
 * 1. ?code, ?state 추출
 * 2. cookie의 state와 일치 검증 (CSRF)
 * 3. 카카오 /oauth/token 호출 → id_token 받기
 * 4. supabase.auth.signInWithIdToken({provider:'kakao', token, nonce}) → Supabase 세션 발급
 * 5. public.users upsert (신규=status='pending')
 * 6. nickname/status에 따라 리다이렉트
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam) {
    return redirectWithError(origin, errorDescription ?? errorParam);
  }
  if (!code || !state) {
    return redirectWithError(origin, "missing_code_or_state");
  }

  // CSRF: state 검증
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;
  const cookieNonce = request.cookies.get(NONCE_COOKIE)?.value;
  if (!cookieState || cookieState !== state) {
    return redirectWithError(origin, "state_mismatch");
  }
  if (!cookieNonce) {
    return redirectWithError(origin, "missing_nonce");
  }

  // 카카오 토큰 교환
  let tokens;
  try {
    tokens = await exchangeKakaoCodeForTokens({
      code,
      redirectUri: `${origin}/auth/callback`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "token_exchange_failed";
    return redirectWithError(origin, message);
  }

  // Supabase 세션 발급 (id_token 검증 포함)
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "kakao",
    token: tokens.id_token,
    nonce: cookieNonce,
  });

  if (error || !data.user) {
    return redirectWithError(origin, error?.message ?? "signin_failed");
  }

  // public.users upsert
  let upsertResult;
  try {
    upsertResult = await upsertUserAfterAuth(data.user);
  } catch (e) {
    const message = e instanceof Error ? e.message : "upsert_failed";
    return redirectWithError(origin, message);
  }

  // 상태별 리다이렉트
  const target = computeRedirectTarget(origin, upsertResult.nickname, upsertResult.status);
  const response = NextResponse.redirect(target);
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(NONCE_COOKIE);
  return response;
}

function redirectWithError(origin: string, message: string) {
  const response = NextResponse.redirect(
    new URL(`/?auth_error=${encodeURIComponent(message)}`, origin),
  );
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(NONCE_COOKIE);
  return response;
}

function computeRedirectTarget(
  origin: string,
  nickname: string | null,
  status: string,
): URL {
  if (!nickname) return new URL("/signup", origin);
  if (status === "approved") return new URL("/dashboard", origin);
  if (status === "pending") return new URL("/pending", origin);
  return new URL("/rejected", origin);
}
