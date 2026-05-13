"use client";

import React from "react";

interface Props {
  open: boolean;
  childCount?: number;
  /** 모달 제목 — 기본 "이 페이지를 삭제할까요?" */
  title?: string;
  /** 본문 메시지 — 기본 "하위 페이지 {childCount}개도 같이 휴지통으로 이동돼요." */
  message?: string;
  /** 확인 버튼 라벨 — 기본 "삭제" */
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 삭제 확인 모달.
 * - 기본: 휴지통으로 보내기 (M2.1)
 * - title/message/confirmLabel 커스텀 가능 (영구삭제 등 M2.4)
 * - 배경 클릭 시 onCancel 호출.
 */
export function DeleteConfirmModal({
  open,
  childCount = 0,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;
  const finalTitle = title ?? "이 페이지를 삭제할까요?";
  const finalMessage =
    message ?? `하위 페이지 ${childCount}개도 같이 휴지통으로 이동돼요.`;
  const finalConfirm = confirmLabel ?? "삭제";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onCancel}
    >
      <div
        className="w-[360px] rounded-md border border-border bg-surface p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-h2 font-semibold">{finalTitle}</h2>
        <p className="mt-2 text-body text-text-secondary">{finalMessage}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-3 py-1 text-body text-text-secondary"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded bg-error px-3 py-1 text-body text-white"
          >
            {finalConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
