import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface AuditEntry {
  actorId: string;
  action: string;
  targetTable?: string;
  targetId?: string;
}

/**
 * 어드민 행위 기록. service-role 사용 (audit_logs INSERT는 RLS로 차단됨).
 * 실패해도 메인 흐름은 막지 않음 — 로그가 빠지면 손해지만 작업 자체는 진행.
 */
export async function logAuditAction(entry: AuditEntry): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("audit_logs").insert({
      actor_id: entry.actorId,
      action: entry.action,
      target_table: entry.targetTable ?? null,
      target_id: entry.targetId ?? null,
    });
  } catch {
    // intentionally swallow — audit log 실패가 메인 액션 차단 사유는 아님
  }
}
