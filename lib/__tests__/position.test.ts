import { describe, it, expect } from "vitest";
import { nextPosition } from "@/lib/pages/position";
import type { PageNode } from "@/lib/pages/types";

function n(id: string, parent: string | null, pos: number): PageNode {
  return {
    id,
    user_id: "u",
    parent_page_id: parent,
    type: "document",
    title: id,
    icon: null,
    is_favorite: false,
    position: pos,
    content: null,
    content_text: null,
    created_at: "",
    updated_at: "",
    deleted_at: null,
  };
}

describe("nextPosition", () => {
  it("빈 parent에서는 0", () => {
    expect(nextPosition([], null)).toBe(0);
  });

  it("같은 parent의 max + 1", () => {
    const nodes = [n("a", null, 0), n("b", null, 3), n("c", "x", 99)];
    expect(nextPosition(nodes, null)).toBe(4);
  });

  it("자식 parent 기준으로만 계산 (다른 parent 무시)", () => {
    const nodes = [n("a", "p1", 5), n("b", "p2", 99)];
    expect(nextPosition(nodes, "p1")).toBe(6);
  });
});
