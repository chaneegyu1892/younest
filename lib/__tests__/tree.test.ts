import { describe, it, expect } from "vitest";
import {
  buildTree,
  isDescendant,
  collectDescendantIds,
} from "@/lib/pages/tree";
import type { PageNode } from "@/lib/pages/types";

function makeNode(id: string, parent: string | null, position = 0): PageNode {
  return {
    id,
    user_id: "u1",
    parent_page_id: parent,
    type: "document",
    title: id,
    icon: null,
    is_favorite: false,
    position,
    content: null,
    created_at: "2026-05-13T00:00:00Z",
    updated_at: "2026-05-13T00:00:00Z",
  };
}

describe("buildTree", () => {
  it("빈 입력은 빈 배열", () => {
    expect(buildTree([])).toEqual([]);
  });

  it("position 오름차순 정렬", () => {
    const tree = buildTree([
      makeNode("b", null, 2),
      makeNode("a", null, 1),
    ]);
    expect(tree.map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("부모-자식 nest + depth 부여", () => {
    const tree = buildTree([
      makeNode("p", null, 0),
      makeNode("c1", "p", 0),
      makeNode("c2", "p", 1),
      makeNode("gc", "c1", 0),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.id).toBe("p");
    expect(tree[0]!.depth).toBe(0);
    expect(tree[0]!.children.map((n) => n.id)).toEqual(["c1", "c2"]);
    expect(tree[0]!.children[0]!.depth).toBe(1);
    expect(tree[0]!.children[0]!.children[0]!.id).toBe("gc");
    expect(tree[0]!.children[0]!.children[0]!.depth).toBe(2);
  });

  it("고아 노드(부모 ID 가리키나 부모 없음)는 루트로 승격", () => {
    const tree = buildTree([makeNode("orphan", "missing-parent", 0)]);
    expect(tree).toHaveLength(1);
    expect(tree[0]!.id).toBe("orphan");
    expect(tree[0]!.depth).toBe(0);
  });
});

describe("isDescendant", () => {
  const nodes = [
    makeNode("a", null),
    makeNode("b", "a"),
    makeNode("c", "b"),
    makeNode("d", null),
  ];

  it("자기 자신은 후손으로 간주", () => {
    expect(isDescendant(nodes, "a", "a")).toBe(true);
  });

  it("직계 자식은 후손", () => {
    expect(isDescendant(nodes, "a", "b")).toBe(true);
  });

  it("손자는 후손", () => {
    expect(isDescendant(nodes, "a", "c")).toBe(true);
  });

  it("형제는 후손 아님", () => {
    expect(isDescendant(nodes, "a", "d")).toBe(false);
  });

  it("부모는 자식의 후손 아님(역방향)", () => {
    expect(isDescendant(nodes, "b", "a")).toBe(false);
  });
});

describe("collectDescendantIds", () => {
  const nodes = [
    makeNode("a", null),
    makeNode("b", "a"),
    makeNode("c", "a"),
    makeNode("d", "b"),
    makeNode("e", null),
  ];

  it("자기 + 모든 후손 ID 반환", () => {
    const result = collectDescendantIds(nodes, "a");
    expect(new Set(result)).toEqual(
      new Set(["a", "b", "c", "d"]),
    );
  });

  it("자식 없는 노드는 자기만", () => {
    const result = collectDescendantIds(nodes, "e");
    expect(result).toEqual(["e"]);
  });
});
