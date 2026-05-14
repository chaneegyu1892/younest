import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ImageGrid } from "../ImageGrid";
import type { ImageRow } from "@/lib/images/types";

function makeImage(id: string, url: string): ImageRow {
  return {
    id,
    storage_path: `u1/${id}.webp`,
    size_bytes: 1000,
    page_id: null,
    created_at: "2026-05-14T00:00:00Z",
    public_url: url,
  };
}

describe("ImageGrid", () => {
  it("0건이면 빈 상태 메시지", () => {
    const { getByText } = render(
      <ImageGrid images={[]} onDelete={vi.fn()} />,
    );
    expect(getByText(/이미지가 없어요|업로드된 이미지가 없어요/)).toBeTruthy();
  });

  it("이미지를 그리드로 렌더 + 체크박스 표시", () => {
    const imgs = [
      makeImage("a", "https://example.com/a.webp"),
      makeImage("b", "https://example.com/b.webp"),
    ];
    const { getAllByRole } = render(
      <ImageGrid images={imgs} onDelete={vi.fn()} />,
    );
    const checkboxes = getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
  });

  it("선택 후 삭제 버튼 클릭 시 onDelete가 선택된 ids로 호출", () => {
    const imgs = [
      makeImage("a", "https://example.com/a.webp"),
      makeImage("b", "https://example.com/b.webp"),
    ];
    const onDelete = vi.fn();
    const { getAllByRole, getByRole } = render(
      <ImageGrid images={imgs} onDelete={onDelete} />,
    );
    const checkboxes = getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]!);

    const deleteBtn = getByRole("button", { name: /삭제/ });
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(["a"]);
  });

  it("선택 없이 삭제 버튼은 disabled", () => {
    const imgs = [makeImage("a", "https://example.com/a.webp")];
    const onDelete = vi.fn();
    const { getByRole } = render(
      <ImageGrid images={imgs} onDelete={onDelete} />,
    );
    const deleteBtn = getByRole("button", { name: /삭제/ }) as HTMLButtonElement;
    expect(deleteBtn.disabled).toBe(true);
  });
});
