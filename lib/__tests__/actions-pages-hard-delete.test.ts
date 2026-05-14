import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn();
const getSessionUserMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ rpc: rpcMock })),
}));

vi.mock("@/lib/auth/session", () => ({
  getSessionUser: (...args: unknown[]) => getSessionUserMock(...args),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { hardDeletePages } from "@/lib/actions/pages";

beforeEach(() => {
  rpcMock.mockReset();
  getSessionUserMock.mockReset();
});

describe("hardDeletePages", () => {
  it("미인증 시 unauthorized", async () => {
    getSessionUserMock.mockResolvedValue(null);
    const result = await hardDeletePages([
      "11111111-1111-4111-8111-111111111111",
    ]);
    expect(result.ok).toBe(false);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("Zod: 빈 배열 reject", async () => {
    getSessionUserMock.mockResolvedValue({ id: "u" });
    const result = await hardDeletePages([]);
    expect(result.ok).toBe(false);
  });

  it("Zod: uuid 아니면 reject", async () => {
    getSessionUserMock.mockResolvedValue({ id: "u" });
    const result = await hardDeletePages(["not-a-uuid"]);
    expect(result.ok).toBe(false);
  });

  it("정상 호출 시 RPC 호출 + deletedCount 반환", async () => {
    getSessionUserMock.mockResolvedValue({ id: "u" });
    rpcMock.mockResolvedValue({ data: 2, error: null });
    const result = await hardDeletePages([
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    ]);
    expect(rpcMock).toHaveBeenCalledWith("hard_delete_pages", {
      p_ids: [
        "11111111-1111-4111-8111-111111111111",
        "22222222-2222-4222-8222-222222222222",
      ],
    });
    expect(result).toEqual({ ok: true, data: { deletedCount: 2 } });
  });

  it("RPC 에러 시 error 반환", async () => {
    getSessionUserMock.mockResolvedValue({ id: "u" });
    rpcMock.mockResolvedValue({ data: null, error: { message: "boom" } });
    const result = await hardDeletePages([
      "11111111-1111-4111-8111-111111111111",
    ]);
    expect(result.ok).toBe(false);
  });
});
