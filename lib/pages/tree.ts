import type { PageNode, PageTreeNode } from "./types";

/**
 * flat 페이지 배열을 트리로 변환.
 * - position 오름차순 정렬 (같은 parent 내에서)
 * - 부모 ID가 가리키는 노드가 없으면(고아) 루트로 승격
 * - depth는 0부터 시작
 */
export function buildTree(nodes: readonly PageNode[]): PageTreeNode[] {
  const byId = new Map<string, PageTreeNode>();
  for (const n of nodes) {
    byId.set(n.id, { ...n, children: [], depth: 0 });
  }

  const roots: PageTreeNode[] = [];
  for (const n of nodes) {
    const tn = byId.get(n.id)!;
    const parent = n.parent_page_id ? byId.get(n.parent_page_id) : null;
    if (parent) {
      parent.children.push(tn);
    } else {
      roots.push(tn);
    }
  }

  const sortRec = (arr: PageTreeNode[], depth: number) => {
    arr.sort((a, b) => a.position - b.position);
    for (const node of arr) {
      node.depth = depth;
      sortRec(node.children, depth + 1);
    }
  };
  sortRec(roots, 0);

  return roots;
}

/**
 * targetId가 ancestorId의 후손인지 (자기 자신 포함).
 * movePage 사이클 방지에 사용.
 */
export function isDescendant(
  nodes: readonly PageNode[],
  ancestorId: string,
  targetId: string,
): boolean {
  if (ancestorId === targetId) return true;
  const childrenByParent = new Map<string, string[]>();
  for (const n of nodes) {
    if (n.parent_page_id) {
      const arr = childrenByParent.get(n.parent_page_id) ?? [];
      arr.push(n.id);
      childrenByParent.set(n.parent_page_id, arr);
    }
  }
  const stack = [ancestorId];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === targetId) return true;
    for (const child of childrenByParent.get(cur) ?? []) stack.push(child);
  }
  return false;
}

/**
 * id 노드 자신 + 모든 후손 ID를 반환 (cascade soft delete용).
 */
export function collectDescendantIds(
  nodes: readonly PageNode[],
  id: string,
): string[] {
  const childrenByParent = new Map<string, string[]>();
  for (const n of nodes) {
    if (n.parent_page_id) {
      const arr = childrenByParent.get(n.parent_page_id) ?? [];
      arr.push(n.id);
      childrenByParent.set(n.parent_page_id, arr);
    }
  }
  const result: string[] = [];
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    result.push(cur);
    for (const child of childrenByParent.get(cur) ?? []) stack.push(child);
  }
  return result;
}
