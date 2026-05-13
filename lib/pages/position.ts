import type { PageNode } from "./types";

/**
 * 같은 parent 내 최대 position + 1을 반환.
 * 빈 경우 (자식 없음) 0을 반환.
 *
 * @param nodes 모든 페이지 노드
 * @param parentId 부모 페이지 ID (null인 경우 루트)
 * @returns 다음 position
 */
export function nextPosition(
  nodes: readonly Pick<PageNode, "parent_page_id" | "position">[],
  parentId: string | null,
): number {
  const siblings = nodes.filter((n) => n.parent_page_id === parentId);
  if (siblings.length === 0) return 0;
  return Math.max(...siblings.map((s) => s.position)) + 1;
}
