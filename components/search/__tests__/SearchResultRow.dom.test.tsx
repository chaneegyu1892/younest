import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SearchResultRow } from "@/components/search/SearchResultRow";

const hit = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "내 페이지",
  icon: "📝",
  parent_page_id: null,
  updated_at: "2026-05-13T00:00:00Z",
};

describe("SearchResultRow", () => {
  it("제목과 아이콘 렌더", () => {
    render(<SearchResultRow hit={hit} onSelect={() => {}} />);
    expect(screen.getByText("내 페이지")).toBeTruthy();
    expect(screen.getByText("📝")).toBeTruthy();
  });

  it("아이콘 없을 때 기본 이모지", () => {
    render(
      <SearchResultRow hit={{ ...hit, icon: null }} onSelect={() => {}} />,
    );
    expect(screen.getByText("📄")).toBeTruthy();
  });

  it("제목 null 이면 '제목 없음'", () => {
    render(
      <SearchResultRow hit={{ ...hit, title: null }} onSelect={() => {}} />,
    );
    expect(screen.getByText("제목 없음")).toBeTruthy();
  });

  it("클릭 시 onSelect(hit) 호출", () => {
    const onSelect = vi.fn();
    render(<SearchResultRow hit={hit} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(hit);
  });
});
