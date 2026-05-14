import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

const restoreMock = vi.fn();
const hardDeleteMock = vi.fn();

vi.mock("@/lib/actions/pages", () => ({
  restorePage: (...args: unknown[]) => restoreMock(...args),
  hardDeletePages: (...args: unknown[]) => hardDeleteMock(...args),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { TrashListClient } from "@/app/(app)/trash/TrashListClient";

const PAGES = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "u",
    parent_page_id: null,
    type: "document" as const,
    title: "Page A",
    icon: null,
    is_favorite: false,
    position: 1,
    content: null,
    content_text: null,
    created_at: "2026-05-13T00:00:00Z",
    updated_at: "2026-05-13T00:00:00Z",
    deleted_at: "2026-05-14T00:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    user_id: "u",
    parent_page_id: null,
    type: "document" as const,
    title: "Page B",
    icon: null,
    is_favorite: false,
    position: 2,
    content: null,
    content_text: null,
    created_at: "2026-05-13T00:00:00Z",
    updated_at: "2026-05-13T00:00:00Z",
    deleted_at: "2026-05-14T00:00:00Z",
  },
];

beforeEach(() => {
  restoreMock.mockReset();
  hardDeleteMock.mockReset();
});

describe("TrashListClient", () => {
  it("페이지 0개면 빈 안내", () => {
    render(<TrashListClient pages={[]} initialQ="" />);
    expect(screen.getByText("휴지통이 비어있습니다")).toBeTruthy();
  });

  it("검색어가 있고 결과 0개면 검색 결과 없음", () => {
    render(<TrashListClient pages={[]} initialQ="missing" />);
    expect(screen.getByText("검색 결과가 없습니다")).toBeTruthy();
  });

  it("체크박스로 N개 선택 시 일괄 작업 바 표시", () => {
    render(<TrashListClient pages={PAGES} initialQ="" />);
    expect(screen.queryByText(/선택 \d+개/)).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Page A 선택" }));
    expect(screen.getByText(/선택 1개/)).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Page B 선택" }));
    expect(screen.getByText(/선택 2개/)).toBeTruthy();
  });

  it("일괄 복원 클릭 시 restorePage 호출", () => {
    restoreMock.mockResolvedValue({ ok: true, data: { restoredIds: [] } });
    render(<TrashListClient pages={PAGES} initialQ="" />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Page A 선택" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Page B 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "선택 복원" }));
    expect(restoreMock).toHaveBeenCalledWith([
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    ]);
  });

  it("일괄 영구삭제 클릭 시 확인 모달 → hardDeletePages 호출", () => {
    hardDeleteMock.mockResolvedValue({ ok: true, data: { deletedCount: 2 } });
    render(<TrashListClient pages={PAGES} initialQ="" />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Page A 선택" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Page B 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "선택 영구삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "영구 삭제" }));
    expect(hardDeleteMock).toHaveBeenCalledWith([
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    ]);
  });
});
