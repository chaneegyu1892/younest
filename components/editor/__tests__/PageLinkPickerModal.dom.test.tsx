import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PageLinkPickerModal } from "@/components/editor/PageLinkPickerModal";

const pages = [
  { id: "11111111-1111-1111-1111-111111111111", title: "일기", icon: "📓" },
  { id: "22222222-2222-2222-2222-222222222222", title: "기도제목", icon: "🙏" },
  { id: "33333333-3333-3333-3333-333333333333", title: "독서노트", icon: "📚" },
];

describe("PageLinkPickerModal", () => {
  it("열렸을 때 모든 페이지 노출", () => {
    render(
      <PageLinkPickerModal
        open
        pages={pages}
        onChoose={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("일기")).toBeTruthy();
    expect(screen.getByText("기도제목")).toBeTruthy();
    expect(screen.getByText("독서노트")).toBeTruthy();
  });

  it("검색어 입력 시 제목으로 필터링 (대소문자/공백 무관)", () => {
    render(
      <PageLinkPickerModal
        open
        pages={pages}
        onChoose={() => {}}
        onClose={() => {}}
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "일기" } });
    expect(screen.getByText("일기")).toBeTruthy();
    expect(screen.queryByText("기도제목")).toBeNull();
  });

  it("페이지 클릭 시 onChoose(pageId, title) 호출", () => {
    const onChoose = vi.fn();
    render(
      <PageLinkPickerModal
        open
        pages={pages}
        onChoose={onChoose}
        onClose={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("기도제목"));
    expect(onChoose).toHaveBeenCalledWith(
      "22222222-2222-2222-2222-222222222222",
      "기도제목",
    );
  });

  it("open=false면 렌더 안 함", () => {
    const { container } = render(
      <PageLinkPickerModal
        open={false}
        pages={pages}
        onChoose={() => {}}
        onClose={() => {}}
      />,
    );
    expect(container.textContent).toBe("");
  });
});
