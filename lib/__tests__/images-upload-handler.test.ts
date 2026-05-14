// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { STORAGE_LIMIT_BYTES } from "@/lib/images/constants";

const compressMock = vi.fn();
vi.mock("@/lib/images/compress", () => ({
  compressImage: (...args: unknown[]) => compressMock(...args),
}));

const getStorageUsageMock = vi.fn();
const recordImageMock = vi.fn();
vi.mock("@/lib/actions/images", () => ({
  getStorageUsage: (...args: unknown[]) => getStorageUsageMock(...args),
  recordImage: (...args: unknown[]) => recordImageMock(...args),
}));

const uploadMock = vi.fn();
const removeMock = vi.fn();
const getUserMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { getUser: getUserMock },
    storage: {
      from: () => ({ upload: uploadMock, remove: removeMock }),
    },
  }),
}));

import { createUploadFileHandler } from "@/lib/images/upload-handler";

beforeEach(() => {
  compressMock.mockReset();
  getStorageUsageMock.mockReset();
  recordImageMock.mockReset();
  uploadMock.mockReset();
  removeMock.mockReset();
  getUserMock.mockReset();
});

function makeFile(sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], "a.jpg", { type: "image/jpeg" });
}

describe("createUploadFileHandler", () => {
  it("preflight 한도 초과 시 dispatchEvent + throw, upload 미호출", async () => {
    getStorageUsageMock.mockResolvedValue({
      ok: true,
      data: { usedBytes: STORAGE_LIMIT_BYTES, limitBytes: STORAGE_LIMIT_BYTES },
    });
    const listener = vi.fn();
    window.addEventListener("storage-quota-exceeded", listener);

    const handler = createUploadFileHandler("page-1");
    await expect(handler(makeFile(1000))).rejects.toThrow("저장 용량 한도");
    expect(uploadMock).not.toHaveBeenCalled();
    expect(listener).toHaveBeenCalled();

    window.removeEventListener("storage-quota-exceeded", listener);
  });

  it("compress → upload → record happy path → URL 반환", async () => {
    getStorageUsageMock.mockResolvedValue({
      ok: true,
      data: { usedBytes: 0, limitBytes: STORAGE_LIMIT_BYTES },
    });
    compressMock.mockResolvedValue({
      blob: new Blob([new Uint8Array(500)], { type: "image/webp" }),
      sizeBytes: 500,
      filename: "abc.webp",
    });
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    uploadMock.mockResolvedValue({ data: {}, error: null });
    recordImageMock.mockResolvedValue({
      ok: true,
      data: { id: "img-1", url: "https://example.com/u1/abc.webp" },
    });

    const handler = createUploadFileHandler("page-1");
    const url = await handler(makeFile(1000));
    expect(url).toBe("https://example.com/u1/abc.webp");
    expect(uploadMock).toHaveBeenCalledWith(
      "u1/abc.webp",
      expect.any(Blob),
      expect.objectContaining({ contentType: "image/webp" }),
    );
    expect(recordImageMock).toHaveBeenCalledWith({
      storagePath: "u1/abc.webp",
      sizeBytes: 500,
      pageId: "page-1",
    });
  });

  it("recordImage가 quota 반환 시 Storage .remove 호출 + dispatchEvent", async () => {
    getStorageUsageMock.mockResolvedValue({
      ok: true,
      data: { usedBytes: 0, limitBytes: STORAGE_LIMIT_BYTES },
    });
    compressMock.mockResolvedValue({
      blob: new Blob([new Uint8Array(500)]),
      sizeBytes: 500,
      filename: "abc.webp",
    });
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    uploadMock.mockResolvedValue({ data: {}, error: null });
    recordImageMock.mockResolvedValue({ ok: false, error: "quota" });

    const listener = vi.fn();
    window.addEventListener("storage-quota-exceeded", listener);

    const handler = createUploadFileHandler("page-1");
    await expect(handler(makeFile(1000))).rejects.toThrow("저장 용량 한도");
    expect(removeMock).toHaveBeenCalledWith(["u1/abc.webp"]);
    expect(listener).toHaveBeenCalled();

    window.removeEventListener("storage-quota-exceeded", listener);
  });

  it("getUser null 시 reject, upload 미호출", async () => {
    getStorageUsageMock.mockResolvedValue({
      ok: true,
      data: { usedBytes: 0, limitBytes: STORAGE_LIMIT_BYTES },
    });
    compressMock.mockResolvedValue({
      blob: new Blob([new Uint8Array(500)]),
      sizeBytes: 500,
      filename: "abc.webp",
    });
    getUserMock.mockResolvedValue({ data: { user: null } });

    const handler = createUploadFileHandler("page-1");
    await expect(handler(makeFile(1000))).rejects.toThrow("로그인");
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("Storage upload 에러 시 throw, recordImage 미호출", async () => {
    getStorageUsageMock.mockResolvedValue({
      ok: true,
      data: { usedBytes: 0, limitBytes: STORAGE_LIMIT_BYTES },
    });
    compressMock.mockResolvedValue({
      blob: new Blob([new Uint8Array(500)]),
      sizeBytes: 500,
      filename: "abc.webp",
    });
    getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
    uploadMock.mockResolvedValue({
      data: null,
      error: { message: "network" },
    });

    const handler = createUploadFileHandler("page-1");
    await expect(handler(makeFile(1000))).rejects.toThrow("network");
    expect(recordImageMock).not.toHaveBeenCalled();
  });
});
