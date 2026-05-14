// @vitest-environment happy-dom
import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FavoritesWidget } from "../FavoritesWidget";
import type { PageNode } from "@/lib/pages/types";

function makePage(overrides: Partial<PageNode>): PageNode {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "u1",
    parent_page_id: null,
    type: "document",
    title: "Untitled",
    icon: null,
    is_favorite: false,
    position: 0,
    content: null,
    content_text: null,
    created_at: "2026-05-14T00:00:00Z",
    updated_at: "2026-05-14T00:00:00Z",
    deleted_at: null,
    ...overrides,
  };
}

describe("FavoritesWidget", () => {
  it("즐겨찾기 0건이면 null 반환 (섹션 자체 안 보임)", () => {
    const { container } = render(<FavoritesWidget pages={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("9건 중 8개만 슬라이스되어 렌더", () => {
    const pages = Array.from({ length: 9 }, (_, i) =>
      makePage({
        id: `1111111${i}-1111-4111-8111-111111111111`,
        title: `즐겨${i}`,
        is_favorite: true,
      }),
    );
    const { getAllByRole } = render(<FavoritesWidget pages={pages} />);
    const links = getAllByRole("link");
    expect(links).toHaveLength(8);
  });

  it("icon 없으면 ⭐ fallback", () => {
    const pages = [makePage({ title: "즐겨", is_favorite: true, icon: null })];
    const { getByText } = render(<FavoritesWidget pages={pages} />);
    expect(getByText("⭐")).toBeTruthy();
  });
});
