"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { PickerPage } from "@/components/editor/PageLinkPickerModal";

const BlockNoteEditor = dynamic(
  () => import("./BlockNoteEditor").then((m) => m.BlockNoteEditor),
  {
    ssr: false,
    loading: () => (
      <div className="mt-6 h-40 animate-pulse rounded-md bg-gray-100" />
    ),
  },
);

interface Props {
  pageId: string;
  initialContent: unknown[] | null;
  availablePages: PickerPage[];
}

/**
 * BlockNote는 window 의존 → ssr:false dynamic import.
 * beforeunload/route change 시 sendBeacon 또는 fetch keepalive로 마지막 변경 flush.
 *
 * 마지막 도큐먼트 스냅샷은 sessionStorage에 'younest:autosave-pending:{pageId}'로 저장하고
 * useAutosave가 schedule될 때마다 갱신 — 이 wrapper가 beforeunload 시 그 값을 sendBeacon.
 *
 * 평시 자동저장은 BlockNoteEditor 내부 useAutosave가 직접 Server Action으로 처리.
 */
export function PageBody({ pageId, initialContent, availablePages }: Props) {
  // beforeunload — 탭 닫기/새로고침 시 sendBeacon으로 best-effort flush
  useEffect(() => {
    const handleBeforeUnload = () => {
      const key = `younest:autosave-pending:${pageId}`;
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      try {
        const body = JSON.stringify({ content: JSON.parse(raw) });
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(`/api/pages/${pageId}/content`, blob);
        sessionStorage.removeItem(key);
      } catch {
        // best-effort
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pageId]);

  // 라우트 변경(앱 내 next/navigation push) 시 pending flush — cleanup에서 keepalive fetch
  useEffect(() => {
    return () => {
      const key = `younest:autosave-pending:${pageId}`;
      const raw = sessionStorage.getItem(key);
      if (!raw) return;
      try {
        const body = JSON.stringify({ content: JSON.parse(raw) });
        fetch(`/api/pages/${pageId}/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
        sessionStorage.removeItem(key);
      } catch {}
    };
  }, [pageId]);

  return (
    <BlockNoteEditor
      pageId={pageId}
      initialContent={initialContent}
      availablePages={availablePages}
    />
  );
}
