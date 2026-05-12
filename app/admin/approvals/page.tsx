import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { StatusActionButtons } from "../_components/StatusActionButtons";

export const dynamic = "force-dynamic";

/**
 * 가입 신청 목록 — status='pending' + nickname IS NOT NULL.
 * (nickname=null인 사용자는 아직 폼 제출 전이라 제외)
 */
export default async function ApprovalsPage() {
  const admin = createSupabaseAdminClient();
  const { data: pendingUsers, error } = await admin
    .from("users")
    .select("id, kakao_id, nickname, status, created_at")
    .eq("status", "pending")
    .not("nickname", "is", null)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin"
          className="text-caption text-text-secondary hover:text-primary"
        >
          ← 어드민
        </Link>
        <h1 className="mt-2 text-h1 font-semibold text-text-primary">
          가입 신청 목록
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          {pendingUsers ? `${pendingUsers.length}건 대기 중` : ""}
        </p>
      </header>

      {error && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-caption text-error">
          조회 실패: {error.message}
        </p>
      )}

      {pendingUsers && pendingUsers.length === 0 && (
        <p className="rounded-md border border-border bg-surface p-6 text-center text-body text-text-secondary">
          승인 대기 중인 신청이 없어요.
        </p>
      )}

      {pendingUsers && pendingUsers.length > 0 && (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {pendingUsers.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="text-body font-medium text-text-primary">
                  {u.nickname}
                </p>
                <p className="text-caption text-text-tertiary">
                  카카오 ID: {u.kakao_id} · 신청{" "}
                  {new Date(u.created_at).toLocaleString("ko-KR")}
                </p>
              </div>
              <StatusActionButtons
                userId={u.id}
                buttons={[
                  { action: "approve", label: "승인", variant: "primary" },
                  { action: "reject", label: "거절", variant: "danger" },
                ]}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
