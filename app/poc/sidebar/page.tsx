import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarMobile } from "@/components/layout/SidebarMobile";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";

/**
 * Phase 5 시각 검증용 데모 — 사이드바/모바일/헤더/로딩 한 페이지에서 모두 확인.
 * production 빌드에서는 layout이 404로 차단.
 */
export default function SidebarPocPage() {
  const SAMPLE_USER = "주연";

  return (
    <div className="-m-6 flex min-h-screen bg-background">
      <Sidebar userName={SAMPLE_USER} pages={[]} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-surface p-2 md:hidden">
          <SidebarMobile userName={SAMPLE_USER} pages={[]} />
        </div>

        <main className="flex-1 overflow-y-auto">
          <PageHeader
            icon="📔"
            title="오늘 일기"
            isPrivate
            isFavorite
          />

          <div className="mx-auto max-w-4xl space-y-6 px-6 py-6">
            <section className="rounded-md border border-border bg-surface p-4">
              <h2 className="text-h2 font-semibold text-text-primary">
                Phase 5 시각 검증
              </h2>
              <p className="mt-2 text-body text-text-secondary">
                데스크탑(≥ 768px)에서는 좌측 사이드바가, 모바일(&lt; 768px)에서는
                상단 햄버거 버튼이 보여야 합니다. 햄버거 → Sheet가 좌측에서
                슬라이드.
              </p>
            </section>

            <section className="rounded-md border border-border bg-surface p-4">
              <h3 className="text-h2 font-semibold text-text-primary">
                체크리스트
              </h3>
              <ul className="mt-2 space-y-1 text-body text-text-secondary">
                <li>✅ 사이드바: 로고 / 검색 / 즐겨찾기 / 내 페이지 / 휴지통 / 사용자 푸터</li>
                <li>✅ 페이지 헤더: 아이콘 + 제목 + 🔒 비공개 뱃지 + ⭐</li>
                <li>✅ 로딩 스피너: 아래 미리보기</li>
                <li>✅ 에러 페이지: <code>/poc/sidebar?error=1</code>로 강제 에러</li>
              </ul>
            </section>

            <section className="rounded-md border border-border bg-surface p-4">
              <h3 className="text-h2 font-semibold text-text-primary">
                LoadingSpinner 미리보기
              </h3>
              <div className="mt-2 rounded-md border border-border">
                <LoadingSpinner label="검증 중..." />
              </div>
            </section>

            <section className="rounded-md border border-border bg-surface p-4">
              <h3 className="text-h2 font-semibold text-text-primary">
                반응형 정보
              </h3>
              <p className="mt-2 text-caption text-text-tertiary">
                Tailwind <code>md:</code> = 768px 이상
              </p>
              <ul className="mt-2 space-y-1 text-body text-text-secondary">
                <li>📱 320-767px → 모바일 (햄버거 + Sheet)</li>
                <li>💻 768px 이상 → 데스크탑 (고정 사이드바 240px)</li>
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
