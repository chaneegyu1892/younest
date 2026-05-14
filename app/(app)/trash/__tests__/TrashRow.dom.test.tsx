import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TrashRow } from "@/app/(app)/trash/TrashRow";

const PAGE = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "u",
  parent_page_id: null,
  type: "document" as const,
  title: "삭제된 페이지",
  icon: "📝",
  is_favorite: false,
  position: 1,
  content: null,
  content_text: null,
  created_at: "2026-05-13T00:00:00Z",
  updated_at: "2026-05-13T00:00:00Z",
  deleted_at: "2026-05-14T00:00:00Z",
};

describe("TrashRow", () => {
  it("제목·아이콘·삭제일 렌더", () => {
    render(
      <TrashRow
        page={PAGE}
        selected={false}
        onToggleSelect={() => {}}
        onRestore={() => {}}
        onHardDelete={() => {}}
      />,
    );
    expect(screen.getByText("삭제된 페이지")).toBeTruthy();
    expect(screen.getByText("📝")).toBeTruthy();
  });

  it("복원 클릭 시 onRestore 호출", () => {
    const onRestore = vi.fn();
    render(
      <TrashRow
        page={PAGE}
        selected={false}
        onToggleSelect={() => {}}
        onRestore={onRestore}
        onHardDelete={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "복원" }));
    expect(onRestore).toHaveBeenCalledWith(PAGE.id);
  });

  it("영구삭제 클릭 시 onHardDelete 호출", () => {
    const onHardDelete = vi.fn();
    render(
      <TrashRow
        page={PAGE}
        selected={false}
        onToggleSelect={() => {}}
        onRestore={() => {}}
        onHardDelete={onHardDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "영구삭제" }));
    expect(onHardDelete).toHaveBeenCalledWith(PAGE.id);
  });

  it("체크박스 클릭 시 onToggleSelect 호출", () => {
    const onToggleSelect = vi.fn();
    render(
      <TrashRow
        page={PAGE}
        selected={false}
        onToggleSelect={onToggleSelect}
        onRestore={() => {}}
        onHardDelete={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggleSelect).toHaveBeenCalledWith(PAGE.id);
  });
});
