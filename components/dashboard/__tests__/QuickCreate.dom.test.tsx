// @vitest-environment happy-dom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const createQuickPageMock = vi.fn();
vi.mock("@/lib/actions/quick-create", () => ({
  createQuickPage: (...args: unknown[]) => createQuickPageMock(...args),
}));

const toastErrorMock = vi.fn();
vi.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => toastErrorMock(...args) },
}));

import { QuickCreate } from "../QuickCreate";

beforeEach(() => {
  pushMock.mockReset();
  createQuickPageMock.mockReset();
  toastErrorMock.mockReset();
});

describe("QuickCreate", () => {
  it("메모 버튼 클릭 → createQuickPage('memo') + push(자식 id)", async () => {
    createQuickPageMock.mockResolvedValue({
      ok: true,
      data: { pageId: "11111111-1111-4111-8111-111111111111" },
    });
    const { getByText } = render(<QuickCreate />);
    fireEvent.click(getByText("메모"));
    await waitFor(() => expect(createQuickPageMock).toHaveBeenCalled());
    expect(createQuickPageMock).toHaveBeenCalledWith("memo");
    expect(pushMock).toHaveBeenCalledWith(
      "/p/11111111-1111-4111-8111-111111111111",
    );
  });

  it("일기 버튼 클릭 → createQuickPage('diary')", async () => {
    createQuickPageMock.mockResolvedValue({
      ok: true,
      data: { pageId: "22222222-2222-4222-8222-222222222222" },
    });
    const { getByText } = render(<QuickCreate />);
    fireEvent.click(getByText("일기"));
    await waitFor(() => expect(createQuickPageMock).toHaveBeenCalled());
    expect(createQuickPageMock).toHaveBeenCalledWith("diary");
  });

  it("기도제목 버튼 클릭 → createQuickPage('prayer')", async () => {
    createQuickPageMock.mockResolvedValue({
      ok: true,
      data: { pageId: "33333333-3333-4333-8333-333333333333" },
    });
    const { getByText } = render(<QuickCreate />);
    fireEvent.click(getByText("기도제목"));
    await waitFor(() => expect(createQuickPageMock).toHaveBeenCalled());
    expect(createQuickPageMock).toHaveBeenCalledWith("prayer");
  });

  it("실패 시 toast.error 호출 + push 안 함", async () => {
    createQuickPageMock.mockResolvedValue({ ok: false, error: "DB 오류" });
    const { getByText } = render(<QuickCreate />);
    fireEvent.click(getByText("메모"));
    await waitFor(() => expect(toastErrorMock).toHaveBeenCalled());
    expect(toastErrorMock).toHaveBeenCalledWith(
      expect.stringContaining("DB 오류"),
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
