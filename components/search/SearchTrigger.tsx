"use client";

import { useSearchModal } from "./SearchModalProvider";

export function SearchTrigger() {
  const { open } = useSearchModal();
  return (
    <button
      type="button"
      onClick={open}
      className="flex w-full items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-left text-body text-text-secondary hover:bg-background"
      aria-label="검색 열기"
    >
      <span>검색...</span>
      <span className="text-caption text-text-tertiary">⌘K</span>
    </button>
  );
}
