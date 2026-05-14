// @vitest-environment happy-dom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const createPageMock = vi.fn();
vi.mock("@/lib/actions/pages", () => ({
  createPage: (...args: unknown[]) => createPageMock(...args),
}));

const toastErrorMock = vi.fn();
vi.mock("sonner", () => ({
  toast: { error: (...args: unknown[]) => toastErrorMock(...args) },
}));

import { QuickCreate } from "../QuickCreate";

beforeEach(() => {
  pushMock.mockReset();
  createPageMock.mockReset();
  toastErrorMock.mockReset();
});

describe("QuickCreate", () => {
  it("메모 버튼 클릭 → createPage(title='메모', icon='📝') + push", async () => {
    createPageMock.mockResolvedValue({
      ok: true,
      data: { id: "11111111-1111-4111-8111-111111111111" },
    });
    const { getByText } = render(<QuickCreate />);
    fireEvent.click(getByText("메모"));
    await waitFor(() => expect(createPageMock).toHaveBeenCalled());
    expect(createPageMock).toHaveBeenCalledWith({
      parentPageId: null,
      type: "document",
      title: "메모",
      icon: "📝",
    });
    expect(pushMock).toHaveBeenCalledWith(
      "/p/11111111-1111-4111-8111-111111111111",
    );
  });

  it("일기 버튼 클릭 → title이 'YYYY-MM-DD 일기' 형식 + icon='📖'", async () => {
    createPageMock.mockResolvedValue({
      ok: true,
      data: { id: "22222222-2222-4222-8222-222222222222" },
    });
    const { getByText } = render(<QuickCreate />);
    fireEvent.click(getByText("일기"));
    await waitFor(() => expect(createPageMock).toHaveBeenCalled());
    const arg = createPageMock.mock.calls[0]![0] as { title: string; icon: string };
    expect(arg.title).toMatch(/^\d{4}-\d{2}-\d{2} 일기$/);
    expect(arg.icon).toBe("📖");
  });

  it("기도제목 버튼 클릭 → createPage(title='기도제목', icon='🙏')", async () => {
    createPageMock.mockResolvedValue({
      ok: true,
      data: { id: "33333333-3333-4333-8333-333333333333" },
    });
    const { getByText } = render(<QuickCreate />);
    fireEvent.click(getByText("기도제목"));
    await waitFor(() => expect(createPageMock).toHaveBeenCalled());
    expect(createPageMock).toHaveBeenCalledWith({
      parentPageId: null,
      type: "document",
      title: "기도제목",
      icon: "🙏",
    });
  });

  it("createPage 실패 시 toast.error 호출 + push 안 함", async () => {
    createPageMock.mockResolvedValue({ ok: false, error: "DB 오류" });
    const { getByText } = render(<QuickCreate />);
    fireEvent.click(getByText("메모"));
    await waitFor(() => expect(toastErrorMock).toHaveBeenCalled());
    expect(toastErrorMock).toHaveBeenCalledWith(
      expect.stringContaining("DB 오류"),
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
