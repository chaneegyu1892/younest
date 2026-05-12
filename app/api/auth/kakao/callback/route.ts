import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  // M1에서 구현 예정:
  // 1. searchParams에서 code 추출
  // 2. exchangeCodeForTokens(code)
  // 3. fetchKakaoProfile(access_token)
  // 4. users 테이블에서 kakao_id로 조회 / 없으면 INSERT (status='pending')
  // 5. Supabase Auth 세션 생성 (kakao_id ↔ auth.uid() 매핑)
  // 6. status별 리다이렉트: approved → /dashboard, pending → /pending, rejected → /rejected
  return NextResponse.json(
    { error: "카카오 OAuth는 M1에서 구현 예정입니다." },
    { status: 501 },
  );
}
