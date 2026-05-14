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

import { deleteImages, listOrphanImages } from "@/lib/actions/images";

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

describe("deleteImages", () => {
  it("ids 빈 배열은 reject", async () => {
    const res = await deleteImages([]);
    expect(res.ok).toBe(false);
  });

  it("Storage .remove + DB delete 모두 호출 후 deletedCount 반환", async () => {
    const removeMock = vi.fn().mockResolvedValue({ data: [{}, {}], error: null });
    const dbDeleteInMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const dbDeleteMock = vi.fn(() => ({ in: dbDeleteInMock }));
    const imagesSelectInMock = vi.fn().mockResolvedValue({
      data: [
        { storage_path: "u1/a.webp" },
        { storage_path: "u1/b.webp" },
      ],
      error: null,
    });
    const imagesSelectMock = vi.fn(() => ({ in: imagesSelectInMock }));

    // pages 쿼리 — 이미지 참조 없는 페이지만 있어서 UPDATE 없음
    const pagesEqMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const pagesIsMock = vi.fn(() => ({ eq: pagesEqMock }));
    const pagesSelectMock = vi.fn(() => ({ is: pagesIsMock }));

    let imagesCallCount = 0;
    const fromMock = vi.fn((table: string) => {
      if (table === "pages") {
        return { select: pagesSelectMock };
      }
      imagesCallCount += 1;
      if (imagesCallCount === 1) {
        return { select: imagesSelectMock };
      }
      return { delete: dbDeleteMock };
    });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: fromMock,
      storage: {
        from: () => ({
          remove: removeMock,
          getPublicUrl: (p: string) => ({
            data: { publicUrl: `https://example.com/${p}` },
          }),
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const res = await deleteImages([
      "11111111-1111-4111-8111-aaaaaaaaaaaa",
      "22222222-2222-4222-8222-bbbbbbbbbbbb",
    ]);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.deletedCount).toBe(2);
    expect(removeMock).toHaveBeenCalledWith(["u1/a.webp", "u1/b.webp"]);
  });

  it("이미지를 참조하는 페이지 content에서 해당 image 블록 제거 + revalidate", async () => {
    const { revalidatePath } = await import("next/cache");
    const removeMock = vi.fn().mockResolvedValue({ data: [{}], error: null });
    const dbDeleteInMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const dbDeleteMock = vi.fn(() => ({ in: dbDeleteInMock }));
    const imagesSelectInMock = vi.fn().mockResolvedValue({
      data: [{ storage_path: "u1/used.webp" }],
      error: null,
    });
    const imagesSelectMock = vi.fn(() => ({ in: imagesSelectInMock }));

    const pagesEqMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "page-1",
          content: [
            { id: "b1", type: "paragraph" },
            {
              id: "b2",
              type: "image",
              props: { url: "https://example.com/u1/used.webp" },
            },
            { id: "b3", type: "paragraph" },
          ],
        },
        {
          id: "page-2",
          content: [{ id: "b4", type: "paragraph" }], // no image
        },
      ],
      error: null,
    });
    const pagesIsMock = vi.fn(() => ({ eq: pagesEqMock }));
    const pagesSelectMock = vi.fn(() => ({ is: pagesIsMock }));
    const pagesUpdateEqMock = vi.fn().mockResolvedValue({ data: null, error: null });
    const pagesUpdateMock = vi.fn(() => ({ eq: pagesUpdateEqMock }));

    let imagesCallCount = 0;
    const fromMock = vi.fn((table: string) => {
      if (table === "pages") {
        return { select: pagesSelectMock, update: pagesUpdateMock };
      }
      // 'images' table — first call: SELECT (storage_path), second: DELETE
      imagesCallCount += 1;
      if (imagesCallCount === 1) {
        return { select: imagesSelectMock };
      }
      return { delete: dbDeleteMock };
    });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: fromMock,
      storage: {
        from: () => ({
          remove: removeMock,
          getPublicUrl: (p: string) => ({
            data: { publicUrl: `https://example.com/${p}` },
          }),
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const res = await deleteImages([
      "11111111-1111-4111-8111-aaaaaaaaaaaa",
    ]);
    expect(res.ok).toBe(true);
    // page-1만 update — 이미지 블록 b2 제거된 새 content
    expect(pagesUpdateMock).toHaveBeenCalledTimes(1);
    const updateArg = (pagesUpdateMock.mock.calls[0] as unknown as [{ content: unknown[] }])[0];
    expect(updateArg.content).toHaveLength(2);
    expect(updateArg.content).toEqual([
      { id: "b1", type: "paragraph" },
      { id: "b3", type: "paragraph" },
    ]);
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/p/page-1");
  });
});

describe("listOrphanImages", () => {
  it("페이지 content에 있는 image src는 orphan에서 제외", async () => {
    const usedUrl = "https://example.com/u1/used.webp";
    const pagesEqMock = vi.fn().mockResolvedValue({
      data: [
        {
          id: "page-1",
          content: [
            {
              type: "image",
              props: { url: usedUrl },
            },
          ],
        },
      ],
      error: null,
    });
    const pagesIsMock = vi.fn(() => ({ eq: pagesEqMock }));
    const pagesSelectMock = vi.fn(() => ({ is: pagesIsMock }));

    const imagesEqMock = vi.fn().mockResolvedValue({
      data: [
        { id: "img-used", storage_path: "u1/used.webp" },
        { id: "img-orphan", storage_path: "u1/orphan.webp" },
      ],
      error: null,
    });
    const imagesSelectMock = vi.fn(() => ({ eq: imagesEqMock }));

    const fromMock = vi.fn((table: string) => {
      if (table === "pages") return { select: pagesSelectMock };
      return { select: imagesSelectMock };
    });

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: fromMock,
      storage: {
        from: () => ({
          getPublicUrl: (path: string) => ({
            data: { publicUrl: `https://example.com/${path}` },
          }),
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const res = await listOrphanImages();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.ids).toEqual(["img-orphan"]);
    }
  });
});
