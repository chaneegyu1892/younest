"use client";

import React from "react";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 쿼터 초과 안내 모달. layout-mounted Mount 컴포넌트가 controlled prop 전달.
 */
export function QuotaExceededModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-h2 font-semibold text-text-primary">
          저장 용량 한도를 초과했어요
        </h2>
        <p className="mt-2 text-body text-text-secondary">
          쓰지 않는 이미지를 정리하면 다시 업로드할 수 있어요.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-body text-text-primary hover:bg-background"
          >
            닫기
          </button>
          <Link
            href="/settings/storage"
            onClick={onClose}
            className="rounded-md bg-primary px-3 py-1.5 text-body font-medium text-white"
          >
            정리하러 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
