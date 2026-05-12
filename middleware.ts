import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = [
  "/",
  "/api/auth/kakao/callback",
  "/api/auth/logout",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (isPublic) return response;

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 상태별(approved/pending/rejected/admin) 리다이렉트는 각 RSC layout에서 처리.
  // Edge runtime에서는 우리 users 테이블 조회 비효율적 — Supabase auth 존재만 확인.
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
