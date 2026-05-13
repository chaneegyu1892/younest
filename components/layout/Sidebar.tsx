import Link from "next/link";
import type { PageNode } from "@/lib/pages/types";
import { PageTree } from "./PageTree";
import { EmptyPagesState } from "./EmptyPagesState";
import { SearchTrigger } from "@/components/search/SearchTrigger";

interface SidebarProps {
  userName: string;
  pages: PageNode[];
}

/**
 * 데스크탑 사이드바 (md 이상에서만 표시).
 * - 즐겨찾기 섹션: is_favorite=true인 페이지 최대 8개
 * - 내 페이지 섹션: flat→nest 트리 렌더링 (PageTree)
 */
export function Sidebar({ userName, pages }: SidebarProps) {
  const favorites = pages.filter((p) => p.is_favorite);
  const hasPages = pages.length > 0;

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
        <SearchTrigger />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {favorites.length > 0 && (
          <div className="px-2 py-3">
            <h3 className="px-2 text-caption uppercase tracking-wider text-text-tertiary">
              즐겨찾기
            </h3>
            <div className="mt-1">
              {favorites.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  href={`/p/${p.id}`}
                  className="flex items-center gap-1 truncate rounded px-2 py-1 text-body text-text-primary hover:bg-background"
                >
                  <span className="w-4 text-center">{p.icon ?? "⭐"}</span>
                  <span className="truncate">{p.title ?? "제목 없음"}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="px-2 py-3">
          <h3 className="px-2 text-caption uppercase tracking-wider text-text-tertiary">
            내 페이지
          </h3>
          {hasPages ? <PageTree pages={pages} /> : <EmptyPagesState />}
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
