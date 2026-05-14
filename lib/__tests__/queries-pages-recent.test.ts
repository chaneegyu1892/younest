import { describe, it, expect, vi, beforeEach } from "vitest";

const limitMock = vi.fn();
const orderMock = vi.fn();
const isMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: fromMock,
  })),
}));

import { fetchRecentPages } from "@/lib/supabase/queries/pages";

beforeEach(() => {
  limitMock.mockReset();
  orderMock.mockReset();
  isMock.mockReset();
  selectMock.mockReset();
  fromMock.mockReset();

  // chain: from().select().is().order().limit() → { data, error }
  limitMock.mockResolvedValue({ data: [], error: null });
  orderMock.mockReturnValue({ limit: limitMock });
  isMock.mockReturnValue({ order: orderMock });
  selectMock.mockReturnValue({ is: isMock });
  fromMock.mockReturnValue({ select: selectMock });
});

describe("fetchRecentPages", () => {
  it("deleted_at IS NULL + updated_at desc + limit 적용", async () => {
    await fetchRecentPages(10);
    expect(fromMock).toHaveBeenCalledWith("pages");
    expect(isMock).toHaveBeenCalledWith("deleted_at", null);
    expect(orderMock).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(limitMock).toHaveBeenCalledWith(10);
  });

  it("limit 인자가 그대로 전달됨", async () => {
    await fetchRecentPages(5);
    expect(limitMock).toHaveBeenCalledWith(5);
  });
});
