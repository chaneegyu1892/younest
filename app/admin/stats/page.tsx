import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const admin = createSupabaseAdminClient();

  const [total, active, pendingWithNickname, pendingNoNickname, rejected, banned] =
    await Promise.all([
      admin.from("users").select("*", { count: "exact", head: true }),
      admin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved"),
      admin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .not("nickname", "is", null),
      admin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .is("nickname", null),
      admin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("status", "rejected"),
      admin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("status", "banned"),
    ]);

  const stats = [
    { label: "전체", value: total.count ?? 0 },
    { label: "활성 사용자", value: active.count ?? 0 },
    { label: "승인 대기", value: pendingWithNickname.count ?? 0 },
    { label: "폼 미작성", value: pendingNoNickname.count ?? 0 },
    { label: "거절", value: rejected.count ?? 0 },
    { label: "차단", value: banned.count ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin"
          className="text-caption text-text-secondary hover:text-primary"
        >
          ← 어드민
        </Link>
        <h1 className="mt-2 text-h1 font-semibold text-text-primary">통계</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-border bg-surface p-4"
          >
            <p className="text-caption text-text-secondary">{s.label}</p>
            <p className="mt-1 text-display font-bold text-text-primary">
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
