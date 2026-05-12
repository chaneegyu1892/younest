import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SessionUser, UserStatus } from "./types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, kakao_id, nickname, status, is_admin")
    .eq("id", authUser.id)
    .single();

  if (error || !profile) return null;

  return {
    id: profile.id,
    kakaoId: profile.kakao_id,
    nickname: profile.nickname ?? "",
    status: profile.status as UserStatus,
    isAdmin: profile.is_admin,
  };
}
