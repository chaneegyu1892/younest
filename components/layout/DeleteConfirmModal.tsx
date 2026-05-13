"use client";

import React from "react";

interface Props {
  open: boolean;
  childCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 페이지 삭제 확인 모달.
 * - childCount > 0 이면 하위 페이지 수를 함께 안내.
 * - 배경 클릭 시 onCancel 호출.
 */
export function DeleteConfirmModal({ open, childCount, onCancel, onConfirm }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={onCancel}
    >
      <div
        className="w-[360px] rounded-md border border-border bg-surface p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-h2 font-semibold">이 페이지를 삭제할까요?</h2>
        <p className="mt-2 text-body text-text-secondary">
          하위 페이지 {childCount}개도 같이 휴지통으로 이동돼요.
        </p>
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
            className="rounded bg-status-error px-3 py-1 text-body text-white"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
