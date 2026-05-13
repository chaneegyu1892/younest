import { describe, it, expect } from "vitest";
import { calculateDrop } from "@/lib/pages/dnd-calculate";
import type { PageNode } from "@/lib/pages/types";

function makePage(
  id: string,
  parent_page_id: string | null,
  position: number,
): PageNode {
  return {
    id,
    user_id: "u",
    parent_page_id,
    type: "document",
    title: id,
    icon: null,
    is_favorite: false,
    position,
    content: null,
    content_text: null,
    created_at: "2026-05-14T00:00:00Z",
    updated_at: "2026-05-14T00:00:00Z",
    deleted_at: null,
  };
}

describe("calculateDrop", () => {
  it("draggedId === targetId → error: self", () => {
    const pages = [makePage("a", null, 1)];
    const result = calculateDrop({
      draggedId: "a",
      targetId: "a",
      zone: "above",
      pages,
    });
    expect(result).toEqual({ error: "self" });
  });

  it("body zone: target이 부모, position은 부모의 마지막 자식 다음", () => {
    const pages = [
      makePage("parent", null, 1),
      makePage("child1", "parent", 1),
      makePage("child2", "parent", 2),
      makePage("dragged", null, 5),
    ];
    const result = calculateDrop({
      draggedId: "dragged",
      targetId: "parent",
      zone: "body",
      pages,
    });
    expect(result).toEqual({ newParentId: "parent", newPosition: 3 });
  });

  it("후손 body drop → error: cycle", () => {
    const pages = [
      makePage("a", null, 1),
      makePage("b", "a", 1),
    ];
    const result = calculateDrop({
      draggedId: "a",
      targetId: "b",
      zone: "body",
      pages,
    });
    expect(result).toEqual({ error: "cycle" });
  });

  it("above zone: target의 부모로 이동, position은 target 바로 위", () => {
    const pages = [
      makePage("p", null, 1),
      makePage("x", "p", 1),
      makePage("y", "p", 2),
      makePage("dragged", null, 5),
    ];
    const result = calculateDrop({
      draggedId: "dragged",
      targetId: "y",
      zone: "above",
      pages,
    });
    // x(1) < newPosition < y(2)
    expect(result).toEqual({ newParentId: "p", newPosition: 1.5 });
  });

  it("below zone: target의 부모로 이동, position은 target 바로 아래", () => {
    const pages = [
      makePage("p", null, 1),
      makePage("x", "p", 1),
      makePage("y", "p", 2),
      makePage("dragged", null, 5),
    ];
    const result = calculateDrop({
      draggedId: "dragged",
      targetId: "x",
      zone: "below",
      pages,
    });
    // x(1) < newPosition < y(2)
    expect(result).toEqual({ newParentId: "p", newPosition: 1.5 });
  });

  it("RootDropZone (targetId=null): 루트의 마지막 다음", () => {
    const pages = [
      makePage("a", null, 1),
      makePage("b", null, 2),
    ];
    const result = calculateDrop({
      draggedId: "b",
      targetId: null,
      zone: "body",
      pages,
    });
    expect(result).toEqual({ newParentId: null, newPosition: 3 });
  });
});
