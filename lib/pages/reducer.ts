import type { OptimisticMutation, PageNode } from "./types";

/**
 * 낙관적 mutation을 받아 새 페이지 flat 배열을 반환. 입력은 mutate하지 않음.
 * restore는 서버 페치로 자연 수렴되므로 reducer에서는 no-op.
 */
export function reduceTree(
  current: readonly PageNode[],
  mutation: OptimisticMutation,
): PageNode[] {
  switch (mutation.kind) {
    case "rename":
      return current.map((n) =>
        n.id === mutation.id ? { ...n, title: mutation.title } : n,
      );
    case "setIcon":
      return current.map((n) =>
        n.id === mutation.id ? { ...n, icon: mutation.icon } : n,
      );
    case "toggleFavorite":
      return current.map((n) =>
        n.id === mutation.id
          ? { ...n, is_favorite: mutation.is_favorite }
          : n,
      );
    case "create":
      return [...current, mutation.node];
    case "move":
      return current.map((n) =>
        n.id === mutation.id
          ? {
              ...n,
              parent_page_id: mutation.newParentId,
              position: mutation.newPosition,
            }
          : n,
      );
    case "softDelete": {
      const removeSet = new Set(mutation.deletedIds);
      return current.filter((n) => !removeSet.has(n.id));
    }
    case "restore":
      return [...current];
  }
}
