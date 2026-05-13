"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PageNode } from "@/lib/pages/types";
import { PageTree } from "./PageTree";
import { EmptyPagesState } from "./EmptyPagesState";

interface SidebarMobileProps {
  userName: string;
  pages: PageNode[];
}

/**
 * 모바일 사이드바 (md 미만에서만 표시).
 * 햄버거 버튼 클릭 → 좌측 Sheet로 사이드바 내용 표시.
 * 풀 모바일 UX(즐겨찾기, 검색 등)는 T21에서 완성 예정.
 */
export function SidebarMobile({ userName, pages }: SidebarMobileProps) {
  const hasPages = pages.length > 0;

  return (
    <div className="flex items-center justify-between">
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="메뉴 열기"
            className="rounded-md p-2 text-text-primary hover:bg-background"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex w-[280px] flex-col border-r border-border bg-sidebar p-0"
        >
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle asChild>
              <Link
                href="/dashboard"
                className="text-h1 font-bold text-primary"
              >
                younest
              </Link>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <div className="px-2 py-3">
              <h3 className="px-2 text-caption uppercase tracking-wider text-text-tertiary">
                내 페이지
              </h3>
              {hasPages ? (
                <PageTree pages={pages} />
              ) : (
                <EmptyPagesState />
              )}
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
              <p className="text-body font-medium text-text-primary">
                {userName}
              </p>
              <Link
                href="/settings"
                className="text-caption text-text-secondary hover:text-primary"
              >
                설정
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Link
        href="/dashboard"
        className="text-h1 font-bold text-primary md:hidden"
      >
        younest
      </Link>

      <div className="w-9" aria-hidden />
    </div>
  );
}
