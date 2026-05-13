"use client";

import React from "react";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";

// Picker는 클라이언트 전용 + 무겁기 때문에 dynamic import (SSR 비활성화).
// @emoji-mart/react 타입이 React 19와 호환되지 않아 any 캐스팅 필요.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Picker = dynamic(() => import("@emoji-mart/react"), { ssr: false }) as React.ComponentType<any>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (emoji: string | null) => void;
}

export function EmojiPickerPopover({ open, onOpenChange, onSelect }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="mt-20">
        <Picker
          data={data}
          locale="ko"
          previewPosition="none"
          onEmojiSelect={(e: { native: string }) => {
            onSelect(e.native);
            onOpenChange(false);
          }}
        />
        <button
          type="button"
          onClick={() => {
            onSelect(null);
            onOpenChange(false);
          }}
          className="mt-2 w-full rounded bg-surface px-3 py-2 text-body text-text-secondary"
        >
          아이콘 제거
        </button>
      </div>
    </div>
  );
}
