import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    rpc: rpcMock,
  })),
}));

import { searchPages } from "@/lib/search/search-pages";

beforeEach(() => {
  rpcMock.mockReset();
});

describe("searchPages", () => {
  it("빈 쿼리는 DB 호출 없이 빈 배열", async () => {
    const result = await searchPages("");
    expect(result).toEqual([]);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("공백만 있는 쿼리도 빈 배열", async () => {
    const result = await searchPages("   ");
    expect(result).toEqual([]);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("기본 인자로 RPC 호출", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });
    await searchPages("hello");
    expect(rpcMock).toHaveBeenCalledWith("search_pages", {
      q: "hello",
      sort_mode: "relevance",
      result_limit: 30,
      result_offset: 0,
    });
  });

  it("opts로 limit/offset/sort 전달", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });
    await searchPages("hello", { limit: 10, offset: 30, sort: "recent" });
    expect(rpcMock).toHaveBeenCalledWith("search_pages", {
      q: "hello",
      sort_mode: "recent",
      result_limit: 10,
      result_offset: 30,
    });
  });

  it("200자 초과 시 잘림", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });
    const long = "a".repeat(300);
    await searchPages(long);
    const call = rpcMock.mock.calls[0]![1] as { q: string };
    expect(call.q.length).toBe(200);
  });

  it("ILIKE 메타문자 escape", async () => {
    rpcMock.mockResolvedValue({ data: [], error: null });
    await searchPages("100%_");
    expect(rpcMock).toHaveBeenCalledWith("search_pages", expect.objectContaining({
      q: "100\\%\\_",
    }));
  });

  it("SearchHit 필드만 반환", async () => {
    rpcMock.mockResolvedValue({
      data: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          user_id: "uid",
          parent_page_id: null,
          type: "document",
          title: "T",
          icon: null,
          is_favorite: false,
          position: 0,
          content: null,
          content_text: "body",
          created_at: "2026-05-13T00:00:00Z",
          updated_at: "2026-05-13T00:00:00Z",
        },
      ],
      error: null,
    });
    const result = await searchPages("body");
    expect(result).toEqual([
      {
        id: "11111111-1111-1111-1111-111111111111",
        title: "T",
        icon: null,
        parent_page_id: null,
        updated_at: "2026-05-13T00:00:00Z",
      },
    ]);
  });

  it("RPC 에러 시 throw", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(searchPages("hello")).rejects.toThrow();
  });
});
