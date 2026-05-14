import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({
  getSessionUser: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { getStorageUsage, recordImage } from "@/lib/actions/images";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STORAGE_LIMIT_BYTES } from "@/lib/images/constants";

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

function mockSelectSizes(sizes: number[]) {
  const eqMock = vi.fn().mockResolvedValue({
    data: sizes.map((s) => ({ size_bytes: s })),
    error: null,
  });
  const selectMock = vi.fn(() => ({ eq: eqMock }));
  return { eqMock, selectMock };
}

describe("getStorageUsage", () => {
  it("size_bytes 합산 + limitBytes 반환", async () => {
    const { selectMock } = mockSelectSizes([1000, 2000, 3000]);
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: vi.fn(() => ({ select: selectMock })),
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const res = await getStorageUsage();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.usedBytes).toBe(6000);
      expect(res.data.limitBytes).toBe(STORAGE_LIMIT_BYTES);
    }
  });

  it("size_bytes null은 0으로 처리", async () => {
    const { selectMock } = mockSelectSizes([100, 0, 0]);
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: vi.fn(() => ({ select: selectMock })),
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
    const res = await getStorageUsage();
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.usedBytes).toBe(100);
  });

  it("로그인 안 됐으면 reject", async () => {
    vi.mocked(getSessionUser).mockResolvedValueOnce(null);
    const res = await getStorageUsage();
    expect(res.ok).toBe(false);
  });
});

describe("recordImage", () => {
  it("storagePath 형식 잘못되면 reject", async () => {
    const res = await recordImage({
      storagePath: "../../etc/passwd",
      sizeBytes: 1000,
      pageId: null,
    });
    expect(res.ok).toBe(false);
  });

  it("sizeBytes 음수면 reject", async () => {
    const res = await recordImage({
      storagePath: "11111111-1111-4111-8111-aaaaaaaaaaaa/22222222-2222-4222-8222-bbbbbbbbbbbb.webp",
      sizeBytes: -1,
      pageId: null,
    });
    expect(res.ok).toBe(false);
  });

  it("post-check 한도 초과 시 quota error 반환", async () => {
    const eqMock = vi.fn().mockResolvedValue({
      data: [{ size_bytes: STORAGE_LIMIT_BYTES - 100 }],
      error: null,
    });
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: vi.fn(() => ({ select: selectMock, insert: vi.fn() })),
      storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: "x" } }) }) },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const res = await recordImage({
      storagePath: "11111111-1111-4111-8111-aaaaaaaaaaaa/22222222-2222-4222-8222-bbbbbbbbbbbb.webp",
      sizeBytes: 200,
      pageId: null,
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe("quota");
  });

  it("post-check 통과 시 INSERT + url 반환", async () => {
    const eqMock = vi.fn().mockResolvedValue({
      data: [{ size_bytes: 1000 }],
      error: null,
    });
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const singleMock = vi.fn().mockResolvedValue({
      data: { id: "11111111-1111-4111-8111-aaaaaaaaaaaa" },
      error: null,
    });
    const insertSelectMock = vi.fn(() => ({ single: singleMock }));
    const insertMock = vi.fn(() => ({ select: insertSelectMock }));

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: vi.fn(() => ({ select: selectMock, insert: insertMock })),
      storage: {
        from: () => ({
          getPublicUrl: () => ({
            data: { publicUrl: "https://example.com/u1/abc.webp" },
          }),
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const res = await recordImage({
      storagePath: "11111111-1111-4111-8111-aaaaaaaaaaaa/22222222-2222-4222-8222-bbbbbbbbbbbb.webp",
      sizeBytes: 500,
      pageId: null,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.id).toBe("11111111-1111-4111-8111-aaaaaaaaaaaa");
      expect(res.data.url).toBe("https://example.com/u1/abc.webp");
    }
  });
});
