import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabase 모킹 (DB 호출 차단, Zod·cycle 로직만 검증)
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({
  getSessionUser: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createPage, renamePage, setPageIcon, toggleFavorite, movePage, softDeletePage, restorePage } from "@/lib/actions/pages";
import { moveSchema } from "@/lib/actions/pages-schemas";
import { getSessionUser } from "@/lib/auth/session";

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

describe("createPage Zod", () => {
  it("type이 document가 아니면 reject", async () => {
    const res = await createPage({ parentPageId: null, type: "database" as never });
    expect(res.ok).toBe(false);
  });

  it("title이 200자 초과 시 reject", async () => {
    const res = await createPage({
      parentPageId: null,
      type: "document",
      title: "x".repeat(201),
    });
    expect(res.ok).toBe(false);
  });
});

describe("renamePage Zod", () => {
  it("title이 200자 초과 시 reject", async () => {
    const res = await renamePage("00000000-0000-0000-0000-000000000000", "x".repeat(201));
    expect(res.ok).toBe(false);
  });

  it("id가 uuid 아니면 reject", async () => {
    const res = await renamePage("not-a-uuid", "hello");
    expect(res.ok).toBe(false);
  });
});

describe("setPageIcon Zod", () => {
  it("emoji 길이 16자 초과 시 reject", async () => {
    const res = await setPageIcon(
      "00000000-0000-0000-0000-000000000000",
      "x".repeat(17),
    );
    expect(res.ok).toBe(false);
  });
});

describe("toggleFavorite Zod", () => {
  it("uuid 아니면 reject", async () => {
    const res = await toggleFavorite("not-uuid");
    expect(res.ok).toBe(false);
  });
});

describe("movePage Zod", () => {
  it("id가 uuid 아니면 reject", async () => {
    const res = await movePage("not-uuid", null);
    expect(res.ok).toBe(false);
  });
  it("newParentId가 잘못된 uuid면 reject", async () => {
    const res = await movePage(
      "00000000-0000-0000-0000-000000000000",
      "not-uuid",
    );
    expect(res.ok).toBe(false);
  });

  it("newPosition은 음수도 허용 (맨 위 끼우기)", () => {
    expect(
      moveSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
        newParentId: null,
        newPosition: -1.5,
      }).success,
    ).toBe(true);
  });

  it("newPosition은 소수도 허용 (fractional)", () => {
    expect(
      moveSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
        newParentId: null,
        newPosition: 2.5,
      }).success,
    ).toBe(true);
  });

  it("newPosition은 Infinity reject", () => {
    expect(
      moveSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
        newParentId: null,
        newPosition: Infinity,
      }).success,
    ).toBe(false);
  });

  it("newPosition은 NaN reject", () => {
    expect(
      moveSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
        newParentId: null,
        newPosition: NaN,
      }).success,
    ).toBe(false);
  });
});

describe("softDeletePage Zod", () => {
  it("uuid 아니면 reject", async () => {
    const res = await softDeletePage("not-uuid");
    expect(res.ok).toBe(false);
  });
});

describe("restorePage Zod", () => {
  it("빈 배열은 reject", async () => {
    const res = await restorePage([]);
    expect(res.ok).toBe(false);
  });
  it("uuid 아닌 ID 포함 시 reject", async () => {
    const res = await restorePage(["not-uuid"]);
    expect(res.ok).toBe(false);
  });
});
