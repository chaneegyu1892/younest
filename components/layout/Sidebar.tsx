import Link from "next/link";

interface SidebarProps {
  userName: string;
}

/**
 * 데스크탑 사이드바 (md 이상에서만 표시).
 * Phase 5는 골격만 — 페이지 트리는 M2에서 채움.
 */
export function Sidebar({ userName }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] flex-shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="px-4 py-6">
        <Link
          href="/dashboard"
          className="text-h1 font-bold text-primary hover:text-primary-hover"
        >
          younest
        </Link>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-left text-body text-text-secondary hover:bg-background"
        >
          <span>검색...</span>
          <span className="text-caption text-text-tertiary">⌘K</span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="px-2 py-3">
          <h3 className="px-2 text-caption uppercase tracking-wider text-text-tertiary">
            즐겨찾기
          </h3>
          <p className="mt-2 px-2 text-caption text-text-tertiary">
            (M2에서 채움)
          </p>
        </div>
        <div className="px-2 py-3">
          <h3 className="px-2 text-caption uppercase tracking-wider text-text-tertiary">
            내 페이지
          </h3>
          <p className="mt-2 px-2 text-caption text-text-tertiary">
            (M2에서 채움)
          </p>
        </div>
      </nav>

      <div className="border-t border-border px-4 py-3">
        <Link
          href="/trash"
          className="block py-1 text-body text-text-secondary hover:text-primary"
        >
          🗑️ 휴지통
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-body font-medium text-text-primary">{userName}</p>
          <Link
            href="/settings"
            className="text-caption text-text-secondary hover:text-primary"
          >
            설정
          </Link>
        </div>
      </div>
    </aside>
  );
}
