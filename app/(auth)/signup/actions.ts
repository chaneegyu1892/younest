"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

interface SubmitResult {
  ok: boolean;
  error?: string;
}

const NICKNAME_MIN = 1;
const NICKNAME_MAX = 20;

/**
 * 가입 신청 폼 제출.
 * - 인증된 사용자 본인의 users.nickname 업데이트 (RLS: auth.uid() = id 정책 통과)
 * - status는 'pending' 유지 (어드민 승인 대기)
 * - 어드민이 자동 승인된 사용자(ADMIN_KAKAO_IDS)는 콜백에서 이미 status='approved'였지만
 *   nickname이 비어있어 /signup으로 라우팅됨 → 이 액션 후 /dashboard로 이동 가능 (별도 분기)
 */
export async function submitSignup(formData: FormData): Promise<SubmitResult> {
  const rawNickname = formData.get("nickname");
  if (typeof rawNickname !== "string") {
    return { ok: false, error: "닉네임을 입력해주세요." };
  }

  const nickname = rawNickname.trim();
  if (nickname.length < NICKNAME_MIN) {
    return { ok: false, error: "닉네임을 입력해주세요." };
  }
  if (nickname.length > NICKNAME_MAX) {
    return {
      ok: false,
      error: `닉네임은 ${NICKNAME_MAX}자 이하로 입력해주세요.`,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { ok: false, error: "로그인이 필요합니다." };
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ nickname })
    .eq("id", authUser.id);

  if (updateError) {
    return {
      ok: false,
      error: `저장 실패: ${updateError.message}`,
    };
  }

  return { ok: true };
}
