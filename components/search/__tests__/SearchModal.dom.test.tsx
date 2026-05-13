import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";

const pushMock = vi.fn();
const actionMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/lib/search/actions-search", () => ({
  searchPagesAction: (...args: unknown[]) => actionMock(...args),
}));

import { SearchModal } from "@/components/search/SearchModal";

const HIT = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Hello world",
  icon: null,
  parent_page_id: null,
  updated_at: "2026-05-13T00:00:00Z",
};

beforeEach(() => {
  pushMock.mockReset();
  actionMock.mockReset();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SearchModal", () => {
  it("닫혀 있으면 렌더 안 됨", () => {
    render(<SearchModal isOpen={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("열려 있고 빈 입력이면 안내 텍스트", () => {
    render(<SearchModal isOpen onClose={() => {}} />);
    expect(screen.getByPlaceholderText("검색어를 입력하세요...")).toBeTruthy();
  });

  it("입력 후 debounce 만료 시 action 호출", async () => {
    actionMock.mockResolvedValue({ ok: true, data: { hits: [HIT] } });
    render(<SearchModal isOpen onClose={() => {}} />);

    const input = screen.getByPlaceholderText(/검색어/);
    fireEvent.change(input, { target: { value: "hello" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    expect(actionMock).toHaveBeenCalledWith({ q: "hello", limit: 10 });
    expect(screen.getByText("Hello world")).toBeTruthy();
  });

  it("결과 행 클릭 시 페이지 이동 + 닫기", async () => {
    actionMock.mockResolvedValue({ ok: true, data: { hits: [HIT] } });
    const onClose = vi.fn();
    render(<SearchModal isOpen onClose={onClose} />);

    const input = screen.getByPlaceholderText(/검색어/);
    fireEvent.change(input, { target: { value: "hello" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    const row = screen.getByText("Hello world");
    fireEvent.click(row);

    expect(pushMock).toHaveBeenCalledWith(`/p/${HIT.id}`);
    expect(onClose).toHaveBeenCalled();
  });
});
