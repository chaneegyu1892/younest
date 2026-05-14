// @vitest-environment happy-dom
import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RecentWidget } from "../RecentWidget";
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

describe("RecentWidget", () => {
  it("0건이면 null (섹션 안 보임)", () => {
    const { container } = render(<RecentWidget pages={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("페이지 3건 정렬 그대로 렌더", () => {
    const pages = [
      makePage({ id: "11111111-1111-4111-8111-aaaaaaaaaaaa", title: "A" }),
      makePage({ id: "11111111-1111-4111-8111-bbbbbbbbbbbb", title: "B" }),
      makePage({ id: "11111111-1111-4111-8111-cccccccccccc", title: "C" }),
    ];
    const { getAllByRole } = render(<RecentWidget pages={pages} />);
    const links = getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]!.textContent).toContain("A");
    expect(links[2]!.textContent).toContain("C");
  });

  it("icon 없으면 📄 fallback", () => {
    const pages = [makePage({ title: "Doc", icon: null })];
    const { getByText } = render(<RecentWidget pages={pages} />);
    expect(getByText("📄")).toBeTruthy();
  });
});
