import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({
  getSessionUser: vi.fn(),
}));

import { updatePageContent } from "@/lib/actions/pages-content";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSessionUser).mockResolvedValue({
    id: "u1",
    kakaoId: "k1",
    nickname: "user",
    status: "approved",
    isAdmin: false,
  });
});

describe("updatePageContent Zod", () => {
  it("pageId가 uuid가 아니면 reject", async () => {
    const res = await updatePageContent({
      pageId: "not-a-uuid",
      content: null,
    });
    expect(res.ok).toBe(false);
  });

  it("content가 null 허용", async () => {
    const mockResult = {
      data: { updated_at: "2026-05-13T12:00:00Z" },
      error: null,
    };

    const mockSingle = vi.fn().mockResolvedValue(mockResult);
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: mockFrom,
    } as never);

    const res = await updatePageContent({
      pageId: "11111111-1111-1111-8111-111111111111",
      content: null,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.updatedAt).toBe("2026-05-13T12:00:00Z");
    }
  });

  it("content가 array면 통과", async () => {
    const mockResult = {
      data: { updated_at: "2026-05-13T12:00:00Z" },
      error: null,
    };

    const mockSingle = vi.fn().mockResolvedValue(mockResult);
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: mockFrom,
    } as never);

    const res = await updatePageContent({
      pageId: "11111111-1111-1111-8111-111111111111",
      content: [{ id: "1", type: "paragraph", props: {}, content: [] }],
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.updatedAt).toBe("2026-05-13T12:00:00Z");
    }
  });

  it("content가 객체(배열 아님)이면 reject", async () => {
    const res = await updatePageContent({
      pageId: "11111111-1111-1111-8111-111111111111",
      content: { not: "array" } as never,
    });
    expect(res.ok).toBe(false);
  });

  it("미인증이면 reject", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    const res = await updatePageContent({
      pageId: "11111111-1111-1111-8111-111111111111",
      content: null,
    });
    expect(res.ok).toBe(false);
  });
});
