import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const me = await getSessionUser();
  const admin = createSupabaseAdminClient();

  const [pendingCount, totalCount] = await Promise.all([
    admin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .not("nickname", "is", null),
    admin.from("users").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h1 font-semibold text-text-primary">어드민</h1>
        <p className="mt-1 text-body text-text-secondary">
          {me?.nickname && `${me.nickname}님, `}
          가입 신청 검토 · 사용자 관리 · 통계
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/admin/approvals"
          className="block rounded-md border border-border bg-surface p-5 hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-semibold text-text-primary">
              가입 신청
            </h2>
            <span className="rounded-full bg-warning/10 px-2 py-0.5 text-caption text-warning">
              {pendingCount.count ?? 0}건
            </span>
          </div>
          <p className="mt-2 text-caption text-text-secondary">
            대기 중인 신청 승인/거절
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="block rounded-md border border-border bg-surface p-5 hover:border-primary"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-semibold text-text-primary">
              전체 사용자
            </h2>
            <span className="rounded-full bg-border/40 px-2 py-0.5 text-caption text-text-secondary">
              {totalCount.count ?? 0}명
            </span>
          </div>
          <p className="mt-2 text-caption text-text-secondary">
            사용자 목록 / 차단·해제
          </p>
        </Link>

        <Link
          href="/admin/stats"
          className="block rounded-md border border-border bg-surface p-5 hover:border-primary"
        >
          <h2 className="text-h2 font-semibold text-text-primary">통계</h2>
          <p className="mt-2 text-caption text-text-secondary">
            상태별 사용자 수
          </p>
        </Link>
      </div>
    </div>
  );
}
