"use client";

import React from "react";
import type { PageNode } from "@/lib/pages/types";

interface Props {
  page: PageNode;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

export function TrashRow({
  page,
  selected,
  onToggleSelect,
  onRestore,
  onHardDelete,
}: Props) {
  const title = page.title?.trim() ? page.title : "제목 없음";
  const icon = page.icon ?? "📄";
  return (
    <li className="flex items-center gap-3 border-b border-border px-3 py-2">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(page.id)}
        aria-label={`${title} 선택`}
        className="h-4 w-4"
      />
      <span className="text-lg leading-none">{icon}</span>
      <span className="flex-1 truncate text-body text-text-primary">{title}</span>
      <span className="text-caption text-text-tertiary">
        삭제 {formatDate(page.deleted_at)}
      </span>
      <button
        type="button"
        onClick={() => onRestore(page.id)}
        className="rounded px-2 py-1 text-caption text-primary hover:underline"
      >
        복원
      </button>
      <button
        type="button"
        onClick={() => onHardDelete(page.id)}
        className="rounded px-2 py-1 text-caption text-error hover:underline"
      >
        영구삭제
      </button>
    </li>
  );
}
