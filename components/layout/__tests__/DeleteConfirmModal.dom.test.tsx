import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteConfirmModal } from "../DeleteConfirmModal";

describe("DeleteConfirmModal", () => {
  it("자식 개수 노출", () => {
    render(
      <DeleteConfirmModal
        open
        childCount={3}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText(/하위 페이지 3개/)).toBeInTheDocument();
  });

  it("확인 클릭 시 onConfirm 호출", () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmModal
        open
        childCount={2}
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
