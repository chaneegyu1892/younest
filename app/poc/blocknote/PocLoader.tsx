"use client";

import dynamic from "next/dynamic";

const PocClient = dynamic(() => import("./PocClient"), {
  ssr: false,
  loading: () => (
    <p className="text-sm text-text-secondary">에디터 로딩 중...</p>
  ),
});

export default function PocLoader() {
  return <PocClient />;
}
