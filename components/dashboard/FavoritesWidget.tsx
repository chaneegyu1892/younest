import React from "react";
import Link from "next/link";
import type { PageNode } from "@/lib/pages/types";

interface Props {
  pages: PageNode[];
}

/**
 * 대시보드 즐겨찾기 위젯 — 최대 8건 카드 그리드.
 * 즐겨찾기 0건이면 null (섹션 자체 숨김).
 */
export function FavoritesWidget({ pages }: Props) {
  const favorites = pages.filter((p) => p.is_favorite).slice(0, 8);
  if (favorites.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-h2 font-medium text-text-primary">
        즐겨찾기 <span className="text-caption text-text-tertiary">({favorites.length})</span>
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {favorites.map((p) => (
          <Link
            key={p.id}
            href={`/p/${p.id}`}
            className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-body text-text-primary hover:bg-background"
          >
            <span className="text-h2">{p.icon ?? "⭐"}</span>
            <span className="truncate">{p.title ?? "제목 없음"}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
