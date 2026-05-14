// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";

const imageCompressionMock = vi.fn();
vi.mock("browser-image-compression", () => ({
  default: (...args: unknown[]) => imageCompressionMock(...args),
}));

import { compressImage } from "@/lib/images/compress";

beforeEach(() => {
  imageCompressionMock.mockReset();
});

function makeFile(name: string, sizeBytes: number, type: string): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type });
  return new File([blob], name, { type });
}

describe("compressImage", () => {
  it("WebP 압축 결과를 반환 + filename은 uuid.webp 형식", async () => {
    const compressed = new Blob([new Uint8Array(1000)], { type: "image/webp" });
    imageCompressionMock.mockResolvedValue(compressed);

    const result = await compressImage(makeFile("photo.jpg", 5_000_000, "image/jpeg"));
    expect(result.blob).toBe(compressed);
    expect(result.sizeBytes).toBe(1000);
    expect(result.filename).toMatch(/^[0-9a-f-]{36}\.webp$/);
  });

  it("imageCompression에 1920/0.8/webp 옵션 전달", async () => {
    imageCompressionMock.mockResolvedValue(new Blob([new Uint8Array(100)], { type: "image/webp" }));
    await compressImage(makeFile("a.jpg", 1000, "image/jpeg"));
    const opts = imageCompressionMock.mock.calls[0]![1] as Record<string, unknown>;
    expect(opts.maxWidthOrHeight).toBe(1920);
    expect(opts.fileType).toBe("image/webp");
    expect(opts.useWebWorker).toBe(true);
    expect(opts.initialQuality).toBeCloseTo(0.8);
  });

  it("압축 라이브러리가 throw하면 사용자 메시지로 변환", async () => {
    imageCompressionMock.mockRejectedValue(new Error("Unsupported"));
    await expect(
      compressImage(makeFile("a.heic", 1000, "image/heic")),
    ).rejects.toThrow("이미지 형식이 지원되지 않습니다.");
  });

  it("0바이트 파일 reject", async () => {
    await expect(
      compressImage(makeFile("empty.jpg", 0, "image/jpeg")),
    ).rejects.toThrow();
  });
});
