"use client";

import React, { useEffect, useState } from "react";
import type { AutosaveStatus } from "@/lib/blocknote/useAutosave";

interface Props {
  status: AutosaveStatus;
  lastSavedAt: string | null;
  onRetry: () => void;
}

function formatRelative(iso: string): string {
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 5) return "방금 저장됨";
  if (diffSec < 60) return `저장됨 · ${diffSec}초 전`;
  return "저장됨";
}

export function SaveStatusBadge({ status, lastSavedAt, onRetry }: Props) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (status !== "saved" || !lastSavedAt) return;
    const t = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [status, lastSavedAt]);

  if (status === "saving") {
    return <span className="text-caption text-text-tertiary">저장 중…</span>;
  }
  if (status === "error") {
    return (
      <span className="text-caption text-error inline-flex items-center gap-2">
        저장 실패
        <button
          type="button"
          onClick={onRetry}
          className="rounded px-2 py-0.5 text-xs underline"
        >
          다시 시도
        </button>
      </span>
    );
  }
  if (status === "saved" && lastSavedAt) {
    void now;
    return (
      <span className="text-caption text-text-tertiary">
        {formatRelative(lastSavedAt)}
      </span>
    );
  }
  return <span aria-hidden />;
}
