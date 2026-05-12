"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAuditAction } from "@/lib/admin/audit";

export type AdminAction = "approve" | "reject" | "ban" | "unban";

interface ActionResult {
  ok: boolean;
  error?: string;
}

const STATUS_BY_ACTION: Record<AdminAction, string> = {
  approve: "approved",
  reject: "rejected",
  ban: "banned",
  unban: "approved",
};

/**
 * 어드민이 다른 사용자의 status를 변경.
 * - 호출자가 is_admin=true 인지 검증 (defense in depth)
 * - 본인 row 변경 금지 (실수로 자기 자신 banned 방지)
 * - service-role로 UPDATE (RLS는 본인 row만 허용)
 * - audit_logs에 기록
 * - admin 페이지들 revalidatePath
 */
export async function setUserStatus(
  targetUserId: string,
  action: AdminAction,
): Promise<ActionResult> {
  const me = await getSessionUser();
  if (!me?.isAdmin) {
    return { ok: false, error: "권한 없음" };
  }
  if (me.id === targetUserId) {
    return { ok: false, error: "본인 상태는 직접 변경할 수 없습니다." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("users")
    .update({ status: STATUS_BY_ACTION[action] })
    .eq("id", targetUserId);

  if (error) {
    return { ok: false, error: error.message };
  }

  await logAuditAction({
    actorId: me.id,
    action: `user.${action}`,
    targetTable: "users",
    targetId: targetUserId,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/users");
  revalidatePath("/admin/stats");

  return { ok: true };
}
