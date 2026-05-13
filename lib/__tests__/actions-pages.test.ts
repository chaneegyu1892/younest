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

import { createPage, renamePage, setPageIcon, toggleFavorite } from "@/lib/actions/pages";
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
