import { describe, it, expect } from "vitest";
import { reduceTree } from "@/lib/pages/reducer";
import type { PageNode } from "@/lib/pages/types";

function makeNode(
  id: string,
  parent: string | null = null,
  extra: Partial<PageNode> = {},
): PageNode {
  return {
    id,
    user_id: "u1",
    parent_page_id: parent,
    type: "document",
    title: id,
    icon: null,
    is_favorite: false,
    position: 0,
    content: null,
    content_text: null,
    created_at: "2026-05-13T00:00:00Z",
    updated_at: "2026-05-13T00:00:00Z",
    ...extra,
  };
}

describe("reduceTree", () => {
  it("rename 변경", () => {
    const out = reduceTree([makeNode("a")], {
      kind: "rename",
      id: "a",
      title: "Hello",
    });
    expect(out[0]!.title).toBe("Hello");
  });

  it("setIcon 변경 (null 가능)", () => {
    const out = reduceTree(
      [makeNode("a", null, { icon: "🌸" })],
      { kind: "setIcon", id: "a", icon: null },
    );
    expect(out[0]!.icon).toBe(null);
  });

  it("toggleFavorite", () => {
    const out = reduceTree([makeNode("a")], {
      kind: "toggleFavorite",
      id: "a",
      is_favorite: true,
    });
    expect(out[0]!.is_favorite).toBe(true);
  });

  it("create — 새 노드 추가", () => {
    const newNode = makeNode("b", null, { position: 1 });
    const out = reduceTree([makeNode("a")], { kind: "create", node: newNode });
    expect(out).toHaveLength(2);
    expect(out.map((n) => n.id).sort()).toEqual(["a", "b"]);
  });

  it("move — parent_page_id + position 변경", () => {
    const initial = [makeNode("a"), makeNode("b")];
    const out = reduceTree(initial, {
      kind: "move",
      id: "b",
      newParentId: "a",
      newPosition: 5,
    });
    const b = out.find((n) => n.id === "b")!;
    expect(b.parent_page_id).toBe("a");
    expect(b.position).toBe(5);
  });

  it("softDelete cascade — 해당 ID 모두 제거", () => {
    const out = reduceTree(
      [makeNode("a"), makeNode("b", "a"), makeNode("c")],
      { kind: "softDelete", deletedIds: ["a", "b"] },
    );
    expect(out.map((n) => n.id)).toEqual(["c"]);
  });

  it("restore — 노드들 되돌리기는 다음 revalidate에 맡김(낙관적 reducer에서는 no-op)", () => {
    const out = reduceTree([makeNode("a")], {
      kind: "restore",
      restoredIds: ["b"],
    });
    expect(out.map((n) => n.id)).toEqual(["a"]);
  });

  it("입력을 mutate하지 않음 (immutability)", () => {
    const input = [makeNode("a", null, { title: "old" })];
    reduceTree(input, { kind: "rename", id: "a", title: "new" });
    expect(input[0]!.title).toBe("old");
  });
});
