import { isDescendant } from "./tree";
import {
  positionBetween,
  FractionalPrecisionError,
} from "./fractional-position";
import { nextPosition } from "./position";
import type { PageNode } from "./types";

export type DropZone = "above" | "below" | "body";

export interface DropResult {
  newParentId: string | null;
  newPosition: number;
}

export type CalculateDropOutcome = DropResult | { error: "self" | "cycle" };

/**
 * DnD drop 결과를 새 parent + fractional position으로 변환.
 * - body: target이 새 부모, 마지막 자식 다음에 배치
 * - above/below: target의 부모 안에서 형제 사이로 배치
 * - 자기 자신·후손 drop은 error 반환 (호출자가 토스트 등 처리)
 */
export function calculateDrop(args: {
  draggedId: string;
  targetId: string | null;
  zone: DropZone;
  pages: readonly PageNode[];
}): CalculateDropOutcome {
  const { draggedId, targetId, zone, pages } = args;

  // 자기 자신에 drop
  if (targetId === draggedId) return { error: "self" };

  // body zone — target.id가 새 부모. 후손 체크.
  if (zone === "body") {
    // 루트 영역(targetId === null)은 사이클 불가
    if (targetId !== null && isDescendant(pages, draggedId, targetId)) {
      return { error: "cycle" };
    }
    const newParentId = targetId; // null이면 루트
    return {
      newParentId,
      newPosition: nextPosition(pages, newParentId),
    };
  }

  // above/below — target의 부모로 이동
  if (targetId === null) {
    // above/below + 루트 zone은 의미 없음 (RootDropZone은 body로만)
    return { error: "self" };
  }

  const target = pages.find((p) => p.id === targetId);
  if (!target) return { error: "self" };

  const newParentId = target.parent_page_id;

  // 형제들 (dragged 제외) sort
  const siblings = pages
    .filter((p) => p.parent_page_id === newParentId && p.id !== draggedId)
    .sort((a, b) => a.position - b.position);
  const targetIdx = siblings.findIndex((s) => s.id === targetId);

  let before: number | null;
  let after: number | null;
  if (zone === "above") {
    before = targetIdx > 0 ? siblings[targetIdx - 1]!.position : null;
    after = target.position;
  } else {
    // below
    before = target.position;
    after =
      targetIdx >= 0 && targetIdx < siblings.length - 1
        ? siblings[targetIdx + 1]!.position
        : null;
  }

  try {
    return {
      newParentId,
      newPosition: positionBetween(before, after),
    };
  } catch (e) {
    if (e instanceof FractionalPrecisionError) {
      console.warn(
        "[M2.4] fractional precision limit — fallback to nextPosition",
        { before, after },
      );
      return {
        newParentId,
        newPosition: nextPosition(pages, newParentId),
      };
    }
    throw e;
  }
}
