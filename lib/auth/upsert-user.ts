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
 *
 * 신규 사용자: status='pending', nickname=null. ADMIN_KAKAO_IDS 매칭 시 is_admin=true + status='approved'.
 *
 * 기존 사용자: ADMIN_KAKAO_IDS와 is_admin을 매 로그인마다 동기화.
 *   - kakao_id가 env에 있는데 is_admin=false → is_admin=true로 promote
 *     + status='pending'(폼 미작성 외)이었다면 'approved'로 승격
 *   - kakao_id가 env에 없는데 is_admin=true → is_admin=false로 demote (status는 유지)
 *   - rejected/banned 사용자는 status 자동 승격 안 됨 (어드민 명시 결정 존중)
 *
 * 호출 위치: app/auth/callback/route.ts (콜백 직후).
 * service-role 사용 — RLS 우회 필수.
 */
export async function upsertUserAfterAuth(authUser: User): Promise<UpsertResult> {
  const admin = createSupabaseAdminClient();

  const kakaoId = extractKakaoId(authUser);
  if (!kakaoId) {
    throw new Error(
      "카카오 OAuth 응답에서 kakao_id를 찾을 수 없습니다. provider 설정 확인 필요.",
    );
  }

  const envIsAdmin = isAdminKakaoId(kakaoId);

  // 기존 row 조회
  const { data: existing } = await admin
    .from("users")
    .select("id, kakao_id, nickname, status, is_admin")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existing) {
    // ADMIN_KAKAO_IDS 동기화
    const needsAdminFlip = existing.is_admin !== envIsAdmin;
    // promote 시 pending → approved 자동 승격 (rejected/banned는 유지)
    const shouldAutoApprove =
      envIsAdmin && existing.status === "pending";
    const newStatus = shouldAutoApprove ? "approved" : existing.status;

    if (needsAdminFlip || shouldAutoApprove) {
      const { data: updated, error: updateError } = await admin
        .from("users")
        .update({ is_admin: envIsAdmin, status: newStatus })
        .eq("id", authUser.id)
        .select("id, kakao_id, nickname, status, is_admin")
        .single();
      if (updateError || !updated) {
        throw new Error(
          `users UPDATE 실패 (admin sync): ${updateError?.message ?? "unknown"}`,
        );
      }
      return {
        isNewUser: false,
        kakaoId: updated.kakao_id,
        nickname: updated.nickname,
        status: updated.status,
        isAdmin: updated.is_admin,
      };
    }

    return {
      isNewUser: false,
      kakaoId: existing.kakao_id,
      nickname: existing.nickname,
      status: existing.status,
      isAdmin: existing.is_admin,
    };
  }

  // 신규 INSERT
  const { data: inserted, error } = await admin
    .from("users")
    .insert({
      id: authUser.id,
      kakao_id: kakaoId,
      nickname: null,
      status: envIsAdmin ? "approved" : "pending",
      is_admin: envIsAdmin,
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
