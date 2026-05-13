import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PageTreeNode } from "../PageTreeNode";
import type { PageTreeNode as Node } from "@/lib/pages/types";

function makeNode(over: Partial<Node> = {}): Node {
  return {
    id: "p1", user_id: "u", parent_page_id: null, type: "document",
    title: "Hello", icon: null, is_favorite: false, position: 0,
    created_at: "", updated_at: "", children: [], depth: 0,
    ...over,
  };
}

describe("PageTreeNode", () => {
  it("더블클릭 → 인라인 input 노출", () => {
    render(
      <PageTreeNode
        node={makeNode()}
        expanded={new Set()}
        onToggleExpand={vi.fn()}
        onRename={vi.fn()}
        onAddChild={vi.fn()}
      />,
    );
    fireEvent.doubleClick(screen.getByText("Hello"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("Enter로 저장 → onRename 호출", () => {
    const onRename = vi.fn();
    render(
      <PageTreeNode
        node={makeNode()}
        expanded={new Set()}
        onToggleExpand={vi.fn()}
        onRename={onRename}
        onAddChild={vi.fn()}
      />,
    );
    fireEvent.doubleClick(screen.getByText("Hello"));
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onRename).toHaveBeenCalledWith("p1", "New");
  });

  it("Esc는 저장하지 않고 닫음", () => {
    const onRename = vi.fn();
    render(
      <PageTreeNode
        node={makeNode()}
        expanded={new Set()}
        onToggleExpand={vi.fn()}
        onRename={onRename}
        onAddChild={vi.fn()}
      />,
    );
    fireEvent.doubleClick(screen.getByText("Hello"));
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onRename).not.toHaveBeenCalled();
  });

  it("IME 변환 중 Enter는 저장하지 않음", () => {
    const onRename = vi.fn();
    render(
      <PageTreeNode
        node={makeNode()}
        expanded={new Set()}
        onToggleExpand={vi.fn()}
        onRename={onRename}
        onAddChild={vi.fn()}
      />,
    );
    fireEvent.doubleClick(screen.getByText("Hello"));
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "한글" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onRename).not.toHaveBeenCalled();
  });
});
