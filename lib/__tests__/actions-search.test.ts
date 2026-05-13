import { describe, it, expect, vi, beforeEach } from "vitest";

const searchPagesMock = vi.fn();
const getSessionUserMock = vi.fn();

vi.mock("@/lib/search/search-pages", () => ({
  searchPages: (...args: unknown[]) => searchPagesMock(...args),
}));

vi.mock("@/lib/auth/session", () => ({
  getSessionUser: (...args: unknown[]) => getSessionUserMock(...args),
}));

import { searchPagesAction } from "@/lib/search/actions-search";

beforeEach(() => {
  searchPagesMock.mockReset();
  getSessionUserMock.mockReset();
});

describe("searchPagesAction", () => {
  it("미인증 시 unauthorized", async () => {
    getSessionUserMock.mockResolvedValue(null);
    const result = await searchPagesAction({ q: "hello" });
    expect(result).toEqual({ ok: false, error: "unauthorized" });
    expect(searchPagesMock).not.toHaveBeenCalled();
  });

  it("정상 호출", async () => {
    getSessionUserMock.mockResolvedValue({ id: "uid" });
    searchPagesMock.mockResolvedValue([{ id: "p1" }]);
    const result = await searchPagesAction({ q: "hello", limit: 10 });
    expect(result).toEqual({ ok: true, data: { hits: [{ id: "p1" }] } });
    expect(searchPagesMock).toHaveBeenCalledWith("hello", {
      limit: 10,
      sort: "relevance",
    });
  });

  it("Zod: q가 string 아니면 invalid_input", async () => {
    getSessionUserMock.mockResolvedValue({ id: "uid" });
    const result = await searchPagesAction({ q: 123 as unknown as string });
    expect(result).toEqual({ ok: false, error: "invalid_input" });
  });

  it("Zod: limit 1~50 범위", async () => {
    getSessionUserMock.mockResolvedValue({ id: "uid" });
    const result = await searchPagesAction({ q: "x", limit: 999 });
    expect(result).toEqual({ ok: false, error: "invalid_input" });
  });

  it("Zod: sort enum 외 값", async () => {
    getSessionUserMock.mockResolvedValue({ id: "uid" });
    const result = await searchPagesAction({
      q: "x",
      sort: "garbage" as never,
    });
    expect(result).toEqual({ ok: false, error: "invalid_input" });
  });
});
