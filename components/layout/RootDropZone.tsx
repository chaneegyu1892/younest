"use client";

import { useDroppable } from "@dnd-kit/core";

/**
 * 페이지 트리 컨테이너 하단의 "루트로 이동" 영역.
 * 빈 공간이지만 drop 시 루트 트리의 마지막 자식이 됨.
 */
export function RootDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: "__root__" });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[40px] rounded ${isOver ? "bg-primary/10" : ""}`}
      aria-label="루트로 이동"
    />
  );
}
