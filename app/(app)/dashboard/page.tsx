import { fetchUserPages } from "@/lib/supabase/queries/pages";
import { EmptyDashboard } from "@/components/layout/EmptyDashboard";

/**
 * 대시보드 페이지.
 * - 페이지가 없으면 EmptyDashboard(빈 상태 CTA) 표시
 * - 페이지가 있으면 헤더만 표시 (위젯은 M3에서 추가)
 */
export default async function DashboardPage() {
  const pages = await fetchUserPages();
  if (pages.length === 0) return <EmptyDashboard />;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-h1 font-semibold">대시보드</h1>
      <p className="mt-2 text-body text-text-secondary">
        위젯은 M3에서 추가됩니다.
      </p>
    </div>
  );
}
