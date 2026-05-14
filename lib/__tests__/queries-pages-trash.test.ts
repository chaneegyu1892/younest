import { describe, it, expect, vi, beforeEach } from "vitest";

// supabase client chain mock
const orderMock = vi.fn();
const limitMock = vi.fn();
const ilikeMock = vi.fn();
const notMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: fromMock,
  })),
}));

import { fetchDeletedPages } from "@/lib/supabase/queries/pages";

beforeEach(() => {
  orderMock.mockReset();
  limitMock.mockReset();
  ilikeMock.mockReset();
  notMock.mockReset();
  selectMock.mockReset();
  fromMock.mockReset();

  // 체인: from().select().not().[ilike()].order().limit() 최종 await { data, error }
  limitMock.mockResolvedValue({ data: [], error: null });
  orderMock.mockReturnValue({ limit: limitMock });
  ilikeMock.mockReturnValue({ order: orderMock, limit: limitMock });
  notMock.mockReturnValue({ order: orderMock, ilike: ilikeMock });
  selectMock.mockReturnValue({ not: notMock });
  fromMock.mockReturnValue({ select: selectMock });
});

describe("fetchDeletedPages", () => {
  it("q 없으면 ilike 미적용", async () => {
    await fetchDeletedPages();
    expect(fromMock).toHaveBeenCalledWith("pages");
    expect(notMock).toHaveBeenCalledWith("deleted_at", "is", null);
    expect(orderMock).toHaveBeenCalledWith("deleted_at", { ascending: false });
    expect(limitMock).toHaveBeenCalledWith(200);
    expect(ilikeMock).not.toHaveBeenCalled();
  });

  it("q 있으면 ilike + escape 적용", async () => {
    await fetchDeletedPages("100%");
    expect(ilikeMock).toHaveBeenCalledWith("title", "%100\\%%");
  });

  it("200자 초과는 cut", async () => {
    const long = "a".repeat(300);
    await fetchDeletedPages(long);
    const call = ilikeMock.mock.calls[0]!;
    // "%" + 200 a + "%" = 202 chars
    expect((call[1] as string).length).toBe(202);
  });
});
