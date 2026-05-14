"use client";

import dynamic from "next/dynamic";
import type { PageNode } from "@/lib/pages/types";

// dnd-kit이 SSR/client describedBy 카운터 불일치로 hydration 에러 발생.
// PageTree를 client-only로 동적 로드해서 회피.
const PageTree = dynamic(() => import("./PageTree").then((m) => m.PageTree), {
  ssr: false,
  loading: () => (
    <div className="px-2 py-2 text-caption text-text-tertiary">불러오는 중…</div>
  ),
});

interface Props {
  pages: PageNode[];
}

export function PageTreeMount({ pages }: Props) {
  return <PageTree pages={pages} />;
}
