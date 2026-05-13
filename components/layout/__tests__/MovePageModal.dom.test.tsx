import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MovePageModal } from "../MovePageModal";
import type { PageNode } from "@/lib/pages/types";

function n(id: string, parent: string | null, title: string): PageNode {
  return {
    id, user_id: "u", parent_page_id: parent, type: "document",
    title, icon: null, is_favorite: false, position: 0, content: null,
    content_text: null,
    created_at: "", updated_at: "",
    deleted_at: null,
  };
}

const pages: PageNode[] = [
  n("a", null, "Apple"),
  n("b", "a", "Banana (a의 자식)"),
  n("c", null, "Cherry"),
];

describe("MovePageModal", () => {
  it("자기 자신 옵션 비활성화", () => {
    render(
      <MovePageModal
        open
        movingId="a"
        pages={pages}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const self = screen.getByRole("button", { name: /Apple/ });
    expect(self).toBeDisabled();
  });

  it("후손 옵션 비활성화", () => {
    render(
      <MovePageModal
        open
        movingId="a"
        pages={pages}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Banana/ })).toBeDisabled();
  });

  it("검색 필터 동작", () => {
    render(
      <MovePageModal
        open
        movingId="a"
        pages={pages}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("페이지 검색..."), {
      target: { value: "Cherry" },
    });
    expect(screen.getByRole("button", { name: /Cherry/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Apple/ })).toBeNull();
  });

  it("'최상위로 이동' 클릭 → onSubmit(null)", () => {
    const onSubmit = vi.fn();
    render(
      <MovePageModal
        open
        movingId="a"
        pages={pages}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "최상위로 이동" }));
    expect(onSubmit).toHaveBeenCalledWith(null);
  });
});
