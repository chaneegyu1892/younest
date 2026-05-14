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

import { createQuickPage } from "@/lib/actions/quick-create";
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

describe("createQuickPage", () => {
  it("잘못된 template은 reject", async () => {
    // @ts-expect-error invalid template
    const res = await createQuickPage("invalid");
    expect(res.ok).toBe(false);
  });

  it("로그인 안 되어 있으면 reject", async () => {
    vi.mocked(getSessionUser).mockResolvedValueOnce(null);
    const res = await createQuickPage("memo");
    expect(res.ok).toBe(false);
  });

  it("부모가 없으면 부모 INSERT 후 자식 INSERT, 자식 id 반환", async () => {
    // chain: 부모 검색 → null → 루트 siblings fetch → 루트 INSERT → 자식 siblings fetch → 자식 INSERT
    let insertCallCount = 0;

    const builder = (rows: unknown[] | null = null, single?: unknown): unknown => {
      const obj: Record<string, unknown> = {};
      const chain = (..._args: unknown[]) => obj;
      obj.select = chain;
      obj.is = chain;
      obj.eq = chain;
      obj.order = chain;
      obj.limit = chain;
      obj.maybeSingle = vi.fn().mockResolvedValue({ data: single ?? null, error: null });
      // generic await
      (obj as { then: unknown }).then = (resolve: (v: unknown) => void) =>
        resolve({ data: rows ?? [], error: null });
      // .single() for INSERT
      obj.single = vi.fn().mockResolvedValue({
        data: { id: insertCallCount === 0 ? "parent-id" : "child-id" },
        error: null,
      });
      obj.insert = (_payload: unknown) => {
        insertCallCount += 1;
        return obj;
      };
      return obj;
    };

    const fromMock = vi.fn(() => builder());
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: fromMock,
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const res = await createQuickPage("memo");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.pageId).toBe("child-id");
    }
    expect(insertCallCount).toBe(2); // 부모 + 자식
  });

  it("일기 + 오늘 날짜 자식 존재 시 그 id 반환 (재생성 X)", async () => {
    // 부모는 존재, dedup 검색에서 자식 발견 → INSERT는 0회
    let insertCallCount = 0;
    let maybeSingleCallCount = 0;

    const builder = (): unknown => {
      const obj: Record<string, unknown> = {};
      const chain = () => obj;
      obj.select = chain;
      obj.is = chain;
      obj.eq = chain;
      obj.order = chain;
      obj.limit = chain;
      obj.maybeSingle = vi.fn(async () => {
        maybeSingleCallCount += 1;
        // 1st call: 부모 검색 → 존재
        // 2nd call: 일기 dedup → 존재
        return {
          data: { id: maybeSingleCallCount === 1 ? "parent-id" : "existing-diary-id" },
          error: null,
        };
      });
      obj.single = vi.fn();
      obj.insert = () => {
        insertCallCount += 1;
        return obj;
      };
      (obj as { then: unknown }).then = (resolve: (v: unknown) => void) =>
        resolve({ data: [], error: null });
      return obj;
    };

    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: vi.fn(() => builder()),
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);

    const res = await createQuickPage("diary");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.pageId).toBe("existing-diary-id");
    }
    expect(insertCallCount).toBe(0);
  });
});
