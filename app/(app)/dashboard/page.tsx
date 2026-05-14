import { fetchUserPages, fetchRecentPages } from "@/lib/supabase/queries/pages";
import { QuickCreate } from "@/components/dashboard/QuickCreate";
import { FavoritesWidget } from "@/components/dashboard/FavoritesWidget";
import { RecentWidget } from "@/components/dashboard/RecentWidget";

/**
 * 대시보드 (S-010).
 * - 빠른 작성: 메모/일기/기도제목 3 템플릿
 * - 즐겨찾기: 최대 8건 카드 (0건이면 섹션 숨김)
 * - 최근 수정: 최대 10건 리스트 (0건이면 섹션 숨김)
 *
 * 빈 계정(페이지 0)도 동일 페이지에서 처리 — 빠른 작성 버튼이 곧 CTA.
 */
export default async function DashboardPage() {
  const [pages, recent] = await Promise.all([
    fetchUserPages(),
    fetchRecentPages(10),
  ]);

  const isEmpty = pages.length === 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header>
        <h1 className="text-h1 font-semibold text-text-primary">대시보드</h1>
        <p className="mt-2 text-body text-text-secondary">
          {isEmpty
            ? "아직 페이지가 없어요. 아래 버튼으로 첫 페이지를 만들어보세요."
            : "오늘도 잘 다녀왔어요."}
        </p>
      </header>

      <QuickCreate />
      <FavoritesWidget pages={pages} />
      <RecentWidget pages={recent} />
    </div>
  );
}
