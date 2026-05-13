"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SearchSort } from "@/lib/search/types";

const SORTS: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "관련도순" },
  { value: "recent", label: "최근 수정순" },
];

interface Props {
  current: SearchSort;
}

export function SortToggle({ current }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function setSort(s: SearchSort) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", s);
    next.set("page", "1");
    router.push(`/search?${next.toString()}`);
  }

  return (
    <div className="flex gap-2" role="radiogroup" aria-label="정렬">
      {SORTS.map((s) => (
        <button
          key={s.value}
          type="button"
          role="radio"
          aria-checked={current === s.value}
          onClick={() => setSort(s.value)}
          className={`rounded-md px-3 py-1 text-caption ${
            current === s.value
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary hover:bg-background"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
