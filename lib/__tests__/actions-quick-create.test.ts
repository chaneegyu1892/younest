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
    // 이후: 부모.content read (maybeSingle) → update 1회
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
      // .single() for INSERT — 1st call returns parent-id, 2nd returns child-id
      obj.single = vi.fn().mockResolvedValue({
        data: { id: insertCallCount === 0 ? "parent-id" : "child-id" },
        error: null,
      });
      obj.insert = (_payload: unknown) => {
        insertCallCount += 1;
        return obj;
      };
      // update は新しい PageLink append ステップで呼ばれる
      obj.update = () => obj;
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
    // 이후: 부모.content read (3rd maybeSingle) → content: null → update 1회
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
        // 3rd call: 부모.content read → content 없음
        if (maybeSingleCallCount === 3) {
          return { data: { content: null }, error: null };
        }
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
      obj.update = () => obj;
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

  it("부모.content에 PageLink가 멱등하게 append됨 (이미 있으면 update X)", async () => {
    // 부모 존재 + dedup 자식 존재 + 부모.content에 이미 그 pageId의 pageLink 존재
    let updateCallCount = 0;
    // mbsCount를 from() 호출 전체에 걸쳐 공유 (각 from() 호출마다 builder가 새로 생성되므로)
    let mbsCount = 0;
    const existingParentContent = [
      {
        id: "block-1",
        type: "pageLink",
        props: { pageId: "existing-diary-id", title: "2026-05-14" },
      },
    ];

    const builder = (): unknown => {
      const obj: Record<string, unknown> = {};
      const chain = () => obj;
      obj.select = chain;
      obj.is = chain;
      obj.eq = chain;
      obj.order = chain;
      obj.limit = chain;
      obj.maybeSingle = vi.fn(async () => {
        mbsCount += 1;
        // 1: 부모 검색 → 존재
        // 2: 일기 dedup → 존재
        // 3: 부모.content read → 이미 PageLink 있음
        if (mbsCount === 3) {
          return { data: { content: existingParentContent }, error: null };
        }
        return {
          data: { id: mbsCount === 1 ? "parent-id" : "existing-diary-id" },
          error: null,
        };
      });
      obj.single = vi.fn();
      obj.insert = () => obj;
      obj.update = () => {
        updateCallCount += 1;
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
    expect(updateCallCount).toBe(0); // 이미 있음 → update 안 함
  });
});
