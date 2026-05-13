import { describe, it, expect, beforeEach } from "vitest";
import {
  loadExpandedIds,
  saveExpandedIds,
  toggleExpanded,
} from "@/lib/pages/expanded-state";

beforeEach(() => {
  localStorage.clear();
});

describe("expanded-state", () => {
  it("초기엔 빈 Set", () => {
    expect(loadExpandedIds().size).toBe(0);
  });

  it("save 후 load 가능", () => {
    saveExpandedIds(new Set(["a", "b"]));
    expect(loadExpandedIds()).toEqual(new Set(["a", "b"]));
  });

  it("toggle: 없으면 추가, 있으면 제거", () => {
    expect(toggleExpanded(new Set(), "a")).toEqual(new Set(["a"]));
    expect(toggleExpanded(new Set(["a"]), "a")).toEqual(new Set());
  });

  it("손상된 JSON 은 빈 Set 반환", () => {
    localStorage.setItem("younest:tree-expanded", "not-json");
    expect(loadExpandedIds().size).toBe(0);
  });
});
