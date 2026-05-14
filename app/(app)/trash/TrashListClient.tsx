"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { restorePage, hardDeletePages } from "@/lib/actions/pages";
import { DeleteConfirmModal } from "@/components/layout/DeleteConfirmModal";
import type { PageNode } from "@/lib/pages/types";
import { TrashRow } from "./TrashRow";
import { TrashSearchInput } from "./TrashSearchInput";

interface Props {
  pages: PageNode[];
  initialQ: string;
}

/**
 * 휴지통 목록 클라이언트.
 * - 체크박스 다중 선택 + 일괄 복원/영구삭제
 * - 영구삭제는 DeleteConfirmModal로 한 번 더 확인
 * - 검색은 자식 TrashSearchInput이 URL ?q= 업데이트 (RSC 재실행)
 */
export function TrashListClient({ pages, initialQ }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmHardDelete, setConfirmHardDelete] = useState<string[] | null>(
    null,
  );
  const [, startTransition] = useTransition();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // pages 표시 순서대로 선택된 ID 배열 반환 (테스트 순서 보장)
  const orderedSelected = (): string[] =>
    pages.filter((p) => selected.has(p.id)).map((p) => p.id);

  const doRestore = (ids: string[]) => {
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await restorePage(ids);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${ids.length}개 항목 복원됨`);
      setSelected(new Set());
    });
  };

  const doHardDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await hardDeletePages(ids);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${res.data.deletedCount}개 항목 영구 삭제됨`);
      setSelected(new Set());
    });
  };

  const isEmpty = pages.length === 0;
  const hasQuery = initialQ.trim().length > 0;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-h1 font-semibold">휴지통</h1>
      <div className="mb-4">
        <TrashSearchInput initialQ={initialQ} />
      </div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2">
          <span className="text-body text-text-secondary">
            선택 {selected.size}개
          </span>
          <button
            type="button"
            onClick={() => doRestore(orderedSelected())}
            className="rounded px-3 py-1 text-caption text-primary hover:underline"
          >
            선택 복원
          </button>
          <button
            type="button"
            onClick={() => setConfirmHardDelete(orderedSelected())}
            className="rounded px-3 py-1 text-caption text-error hover:underline"
          >
            선택 영구삭제
          </button>
        </div>
      )}
      {isEmpty ? (
        <p className="py-8 text-center text-text-tertiary">
          {hasQuery ? "검색 결과가 없습니다" : "휴지통이 비어있습니다"}
        </p>
      ) : (
        <ul className="rounded-md border border-border bg-surface">
          {pages.map((p) => (
            <TrashRow
              key={p.id}
              page={p}
              selected={selected.has(p.id)}
              onToggleSelect={toggleSelect}
              onRestore={(id) => doRestore([id])}
              onHardDelete={(id) => setConfirmHardDelete([id])}
            />
          ))}
        </ul>
      )}
      <DeleteConfirmModal
        open={confirmHardDelete !== null}
        title="영구 삭제"
        message={`선택한 ${confirmHardDelete?.length ?? 0}개 항목을 영구히 삭제합니다. 복구할 수 없습니다.`}
        confirmLabel="영구 삭제"
        onCancel={() => setConfirmHardDelete(null)}
        onConfirm={() => {
          const ids = confirmHardDelete!;
          setConfirmHardDelete(null);
          doHardDelete(ids);
        }}
      />
    </div>
  );
}
