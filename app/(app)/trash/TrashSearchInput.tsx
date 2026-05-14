"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

interface Props {
  initialQ: string;
}

const DEBOUNCE_MS = 200;

/**
 * 휴지통 검색 입력. debounce 후 URL ?q= 업데이트 (router.push).
 * 페이지는 RSC라 URL 변경이 곧 재실행 트리거.
 */
export function TrashSearchInput({ initialQ }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const trimmed = q.trim();
      const next =
        trimmed.length === 0
          ? "/trash"
          : (`/trash?q=${encodeURIComponent(trimmed)}` as Route);
      router.push(next);
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [q, router]);

  return (
    <input
      type="text"
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="휴지통 검색..."
      maxLength={200}
      className="w-full max-w-[400px] rounded-md border border-border bg-surface px-3 py-2 text-body outline-none placeholder:text-text-tertiary"
      aria-label="휴지통 검색"
    />
  );
}
