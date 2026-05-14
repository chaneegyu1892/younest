import { describe, it, expect, vi, beforeEach } from "vitest";

const orderMock = vi.fn();
const selectMock = vi.fn();
const fromMock = vi.fn();
const getPublicUrlMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    from: fromMock,
    storage: { from: () => ({ getPublicUrl: getPublicUrlMock }) },
  })),
}));

import { fetchUserImages } from "@/lib/supabase/queries/images";

beforeEach(() => {
  orderMock.mockReset();
  selectMock.mockReset();
  fromMock.mockReset();
  getPublicUrlMock.mockReset();

  // chain: from('images').select(...).order(...) → { data, error }
  orderMock.mockResolvedValue({
    data: [
      {
        id: "11111111-1111-4111-8111-aaaaaaaaaaaa",
        storage_path: "u1/abc.webp",
        size_bytes: 1000,
        page_id: null,
        created_at: "2026-05-14T00:00:00Z",
      },
    ],
    error: null,
  });
  selectMock.mockReturnValue({ order: orderMock });
  fromMock.mockReturnValue({ select: selectMock });
  getPublicUrlMock.mockReturnValue({ data: { publicUrl: "https://example.com/u1/abc.webp" } });
});

describe("fetchUserImages", () => {
  it("images 테이블 select + created_at desc + public_url 매핑", async () => {
    const rows = await fetchUserImages();
    expect(fromMock).toHaveBeenCalledWith("images");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.public_url).toBe("https://example.com/u1/abc.webp");
    expect(rows[0]!.id).toBe("11111111-1111-4111-8111-aaaaaaaaaaaa");
  });
});
