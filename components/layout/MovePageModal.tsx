"use client";

import React, { useMemo, useState } from "react";
import { isDescendant } from "@/lib/pages/tree";
import type { PageNode } from "@/lib/pages/types";

interface Props {
  open: boolean;
  movingId: string;
  pages: PageNode[];
  onCancel: () => void;
  onSubmit: (newParentId: string | null) => void;
}

/**
 * 페이지 이동 모달.
 * - 자기 자신 및 후손 페이지는 disabled 처리 (사이클 방지)
 * - 검색 필터로 페이지 목록 좁히기 가능
 * - '최상위로 이동' → onSubmit(null)
 */
export function MovePageModal({ open, movingId, pages, onCancel, onSubmit }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return pages.filter((p) =>
      ql ? (p.title ?? "").toLowerCase().includes(ql) : true,
    );
  }, [pages, q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4"
      onClick={onCancel}
    >
      <div
        className="mt-20 w-[420px] rounded-md border border-border bg-surface p-3 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="페이지 검색..."
          className="w-full rounded border border-border bg-background px-3 py-2 text-body"
        />
        <div className="mt-2 max-h-72 space-y-px overflow-y-auto">
          {/* 최상위로 이동 버튼 */}
          <button
            type="button"
            onClick={() => onSubmit(null)}
            className="w-full rounded px-3 py-2 text-left text-body text-primary hover:bg-background"
          >
            최상위로 이동
          </button>
          {filtered.map((p) => {
            // 자기 자신 또는 후손이면 선택 불가 (사이클 방지)
            const disabled = isDescendant(pages, movingId, p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={disabled}
                onClick={() => onSubmit(p.id)}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-body hover:bg-background disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <span className="w-4 text-center">{p.icon ?? "📄"}</span>
                <span className="truncate">{p.title ?? "제목 없음"}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-3 py-1 text-body text-text-secondary"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
