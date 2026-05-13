"use client";

import React, { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onArrowDown: () => void;
  onArrowUp: () => void;
  onEnter: (modCmd: boolean) => void;
  onEscape: () => void;
}

export function SearchInput({
  value,
  onChange,
  onArrowDown,
  onArrowUp,
  onEnter,
  onEscape,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          onArrowDown();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          onArrowUp();
        } else if (e.key === "Enter") {
          e.preventDefault();
          onEnter(e.metaKey || e.ctrlKey);
        } else if (e.key === "Escape") {
          e.preventDefault();
          onEscape();
        }
      }}
      placeholder="검색어를 입력하세요..."
      maxLength={200}
      className="w-full border-b border-border bg-transparent px-4 py-3 text-body outline-none placeholder:text-text-tertiary"
      aria-label="검색"
    />
  );
}
