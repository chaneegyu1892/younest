"use client";

import React, { useState, useMemo } from "react";

export type PickerPage = {
  id: string;
  title: string;
  icon: string | null;
};

interface Props {
  open: boolean;
  pages: PickerPage[];
  onChoose: (pageId: string, title: string) => void;
  onClose: () => void;
}

export function PageLinkPickerModal({ open, pages, onChoose, onClose }: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => p.title.toLowerCase().includes(q));
  }, [pages, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="페이지 검색"
          className="w-full border-b px-4 py-3 outline-none"
        />
        <ul className="max-h-72 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-500">
              일치하는 페이지가 없습니다
            </li>
          )}
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-50"
                onClick={() => onChoose(p.id, p.title)}
              >
                <span aria-hidden>{p.icon ?? "📄"}</span>
                <span>{p.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
