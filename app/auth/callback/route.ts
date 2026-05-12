import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertUserAfterAuth } from "@/lib/auth/upsert-user";

/**
 * Supabase OAuth 콜백 (Kakao provider).
 *
 * 흐름:
 * 1. 클라이언트가 supabase.auth.signInWithOAuth({provider:'kakao'}) 호출
 * 2. 카카오 → Supabase → 이 라우트로 ?code=... 전달
 * 3. exchangeCodeForSession으로 세션 쿠키 발급
 * 4. public.users에 row upsert (신규면 status='pending')
 * 5. nickname/status에 따라 리다이렉트:
 *    - nickname=null → /signup (가입 폼 미작성)
 *    - status='pending' → /pending
 *    - status='approved' → /dashboard
 *    - status='rejected'|'banned' → /rejected
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(
        `/?auth_error=${encodeURIComponent(errorDescription ?? errorParam)}`,
        origin,
      ),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?auth_error=missing_code", origin));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      new URL(
        `/?auth_error=${encodeURIComponent(error?.message ?? "exchange_failed")}`,
        origin,
      ),
    );
  }

  // public.users upsert (신규/기존)
  let upsertResult;
  try {
    upsertResult = await upsertUserAfterAuth(data.user);
  } catch (e) {
    const message = e instanceof Error ? e.message : "upsert_failed";
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(message)}`, origin),
    );
  }

  // 상태별 리다이렉트
  if (!upsertResult.nickname) {
    return NextResponse.redirect(new URL("/signup", origin));
  }
  if (upsertResult.status === "approved") {
    return NextResponse.redirect(new URL("/dashboard", origin));
  }
  if (upsertResult.status === "pending") {
    return NextResponse.redirect(new URL("/pending", origin));
  }
  // rejected | banned
  return NextResponse.redirect(new URL("/rejected", origin));
}
