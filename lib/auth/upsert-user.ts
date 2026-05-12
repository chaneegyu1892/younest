import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

interface UpsertResult {
  isNewUser: boolean;
  kakaoId: string;
  nickname: string | null;
  status: string;
  isAdmin: boolean;
}

/**
 * Supabase auth.users에 로그인한 사용자를 public.users에 upsert.
 * 신규 사용자: status='pending', nickname=null, kakao_id 추출, ADMIN_KAKAO_IDS 매칭 시 is_admin=true.
 * 기존 사용자: 변경 없이 현재 row 반환.
 *
 * 호출 위치: app/auth/callback/route.ts (콜백 직후).
 * service-role 사용 — RLS 우회 필수 (users INSERT는 일반 session으로 차단됨).
 */
export async function upsertUserAfterAuth(authUser: User): Promise<UpsertResult> {
  const admin = createSupabaseAdminClient();

  const kakaoId = extractKakaoId(authUser);
  if (!kakaoId) {
    throw new Error(
      "카카오 OAuth 응답에서 kakao_id를 찾을 수 없습니다. provider 설정 확인 필요.",
    );
  }

  // 기존 row 조회
  const { data: existing } = await admin
    .from("users")
    .select("id, kakao_id, nickname, status, is_admin")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existing) {
    return {
      isNewUser: false,
      kakaoId: existing.kakao_id,
      nickname: existing.nickname,
      status: existing.status,
      isAdmin: existing.is_admin,
    };
  }

  // 신규 INSERT
  const isAdmin = isAdminKakaoId(kakaoId);
  const { data: inserted, error } = await admin
    .from("users")
    .insert({
      id: authUser.id,
      kakao_id: kakaoId,
      nickname: null,
      status: isAdmin ? "approved" : "pending",
      is_admin: isAdmin,
    })
    .select("id, kakao_id, nickname, status, is_admin")
    .single();

  if (error || !inserted) {
    throw new Error(`users INSERT 실패: ${error?.message ?? "unknown"}`);
  }

  return {
    isNewUser: true,
    kakaoId: inserted.kakao_id,
    nickname: inserted.nickname,
    status: inserted.status,
    isAdmin: inserted.is_admin,
  };
}

/**
 * auth.users 응답에서 카카오 사용자 ID 추출.
 * Supabase Kakao provider는 identities[].provider_id에 numeric 카카오 ID를 string으로 저장.
 * Fallback: user_metadata.provider_id (드물지만 일부 버전에서).
 */
function extractKakaoId(user: User): string | null {
  const kakaoIdentity = user.identities?.find((i) => i.provider === "kakao");
  if (kakaoIdentity?.id) return kakaoIdentity.id;
  if (kakaoIdentity?.identity_data?.["provider_id"]) {
    return String(kakaoIdentity.identity_data["provider_id"]);
  }
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (meta?.["provider_id"]) return String(meta["provider_id"]);
  if (meta?.["sub"]) return String(meta["sub"]);
  return null;
}

/**
 * ADMIN_KAKAO_IDS 환경변수에 포함된 카카오 ID인지 확인.
 * 콤마 구분, 공백 trim.
 */
function isAdminKakaoId(kakaoId: string): boolean {
  const adminIds = (process.env.ADMIN_KAKAO_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return adminIds.includes(kakaoId);
}
