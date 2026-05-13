"use client";

import Link from "next/link";

interface Props {
  q: string;
  sort: string;
  page: number;
  hasMore: boolean;
}

export function Pagination({ q, sort, page, hasMore }: Props) {
  const prevDisabled = page <= 1;
  const qEnc = encodeURIComponent(q);

  return (
    <div className="mt-6 flex justify-between">
      {prevDisabled ? (
        <span className="text-caption text-text-tertiary">이전</span>
      ) : (
        <Link
          href={`/search?q=${qEnc}&sort=${sort}&page=${page - 1}`}
          className="text-caption text-primary hover:underline"
        >
          ← 이전
        </Link>
      )}
      {hasMore ? (
        <Link
          href={`/search?q=${qEnc}&sort=${sort}&page=${page + 1}`}
          className="text-caption text-primary hover:underline"
        >
          다음 →
        </Link>
      ) : (
        <span className="text-caption text-text-tertiary">다음</span>
      )}
    </div>
  );
}
