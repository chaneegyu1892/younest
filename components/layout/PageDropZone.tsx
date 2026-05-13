"use client";

import { useDroppable } from "@dnd-kit/core";

interface Props {
  /** 드롭존 ID — `${pageId}-above` 또는 `${pageId}-below` 형식 */
  id: string;
  /** drop 시 disabled (사이클 방지) */
  disabled?: boolean;
}

/**
 * 페이지 트리 노드의 위/아래 4px 영역에 표시되는 drop target.
 * isOver 상태일 때만 시각적으로 강조 (얇은 라인).
 */
export function PageDropZone({ id, disabled = false }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      className={`h-[4px] ${isOver && !disabled ? "bg-primary" : ""}`}
      aria-hidden
    />
  );
}
