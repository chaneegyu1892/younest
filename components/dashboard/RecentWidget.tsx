import React from "react";
import Link from "next/link";
import type { PageNode } from "@/lib/pages/types";
import { formatRelativeTime } from "@/lib/utils/relative-time";

interface Props {
  pages: PageNode[];
}

/**
 * 대시보드 최근 수정 위젯 — updated_at desc 순 리스트.
 * 0건이면 null (섹션 자체 숨김).
 */
export function RecentWidget({ pages }: Props) {
  if (pages.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-h2 font-medium text-text-primary">
        최근 수정 <span className="text-caption text-text-tertiary">({pages.length})</span>
      </h2>
      <ul className="divide-y divide-border rounded-md border border-border bg-surface">
        {pages.map((p) => (
          <li key={p.id}>
            <Link
              href={`/p/${p.id}`}
              className="flex items-center gap-2 px-3 py-2 text-body text-text-primary hover:bg-background"
            >
              <span>{p.icon ?? "📄"}</span>
              <span className="flex-1 truncate">{p.title ?? "제목 없음"}</span>
              <time className="text-caption text-text-tertiary">
                {formatRelativeTime(p.updated_at)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
