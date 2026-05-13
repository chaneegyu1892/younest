import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PageTreeNode } from "../PageTreeNode";
import type { PageTreeNode as Node } from "@/lib/pages/types";

// useRouter — 제목 클릭 시 router.push가 호출되므로 모킹 필수
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

function makeNode(over: Partial<Node> = {}): Node {
  return {
    id: "p1",
    user_id: "u",
    parent_page_id: null,
    type: "document",
    title: "Hello",
    icon: null,
    is_favorite: false,
    position: 0,
    content: null,
    content_text: null,
    created_at: "",
    updated_at: "",
    children: [],
    depth: 0,
    ...over,
  };
}

function baseProps(over: Partial<React.ComponentProps<typeof PageTreeNode>> = {}) {
  return {
    node: makeNode(),
    expanded: new Set<string>(),
    onToggleExpand: vi.fn(),
    onRename: vi.fn(),
    onAddChild: vi.fn(),
    onToggleFavorite: vi.fn(),
    onMove: vi.fn(),
    onDelete: vi.fn(),
    onSetIcon: vi.fn(),
    ...over,
  };
}

/**
 * 제목 영역은 250ms 윈도우로 single/double click을 구분한다.
 * 두 번째 click이 들어오면 예약된 navigate가 취소되고 편집 모드 진입.
 */
function enterEditMode(label = "Hello") {
  const title = screen.getByText(label);
  fireEvent.click(title);
  fireEvent.click(title);
}

describe("PageTreeNode", () => {
  it("연속 클릭(더블클릭) → 인라인 input 노출", () => {
    render(<PageTreeNode {...baseProps()} />);
    enterEditMode();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("Enter로 저장 → onRename 호출", () => {
    const onRename = vi.fn();
    render(<PageTreeNode {...baseProps({ onRename })} />);
    enterEditMode();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onRename).toHaveBeenCalledWith("p1", "New");
  });

  it("Esc는 저장하지 않고 닫음", () => {
    const onRename = vi.fn();
    render(<PageTreeNode {...baseProps({ onRename })} />);
    enterEditMode();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onRename).not.toHaveBeenCalled();
  });

  it("IME 변환 중 Enter는 저장하지 않음", () => {
    const onRename = vi.fn();
    render(<PageTreeNode {...baseProps({ onRename })} />);
    enterEditMode();
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: "한글" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onRename).not.toHaveBeenCalled();
  });
});
