import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { StatusActionButtons } from "../_components/StatusActionButtons";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  approved: "활성",
  pending: "대기",
  rejected: "거절",
  banned: "차단",
};

const STATUS_COLOR: Record<string, string> = {
  approved: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  rejected: "bg-error/10 text-error",
  banned: "bg-error/10 text-error",
};

export default async function UsersPage() {
  const me = await getSessionUser();
  const admin = createSupabaseAdminClient();
  const { data: users, error } = await admin
    .from("users")
    .select("id, kakao_id, nickname, status, is_admin, created_at")
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
          전체 사용자
        </h1>
        <p className="mt-1 text-body text-text-secondary">
          {users ? `${users.length}명` : ""}
        </p>
      </header>

      {error && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-caption text-error">
          조회 실패: {error.message}
        </p>
      )}

      {users && users.length > 0 && (
        <ul className="divide-y divide-border rounded-md border border-border bg-surface">
          {users.map((u) => {
            const isMe = me?.id === u.id;
            return (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body font-medium text-text-primary">
                      {u.nickname ?? (
                        <span className="text-text-tertiary">(미작성)</span>
                      )}
                    </p>
                    {u.is_admin && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-caption text-primary">
                        어드민
                      </span>
                    )}
                    {isMe && (
                      <span className="rounded-full bg-private/10 px-2 py-0.5 text-caption text-private">
                        나
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-caption ${STATUS_COLOR[u.status] ?? "bg-border/40 text-text-secondary"}`}
                    >
                      {STATUS_LABEL[u.status] ?? u.status}
                    </span>
                  </div>
                  <p className="mt-1 text-caption text-text-tertiary">
                    카카오 ID: {u.kakao_id} · 가입{" "}
                    {new Date(u.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>

                {!isMe && (
                  <StatusActionButtons
                    userId={u.id}
                    buttons={
                      u.status === "banned"
                        ? [
                            {
                              action: "unban",
                              label: "차단 해제",
                              variant: "primary",
                            },
                          ]
                        : [{ action: "ban", label: "차단", variant: "danger" }]
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
