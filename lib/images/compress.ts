import imageCompression from "browser-image-compression";
import {
  COMPRESS_FILE_TYPE,
  COMPRESS_MAX_WIDTH,
  COMPRESS_QUALITY,
} from "./constants";

export interface CompressResult {
  blob: Blob;
  sizeBytes: number;
  filename: string;
}

/**
 * 이미지를 WebP로 압축. max 1920px, quality 0.8.
 * - 0바이트 파일 reject
 * - HEIC/SVG 등 라이브러리가 처리 못 하면 한국어 메시지로 throw
 */
export async function compressImage(file: File): Promise<CompressResult> {
  if (file.size === 0) {
    throw new Error("빈 파일은 업로드할 수 없습니다.");
  }

  let compressed: Blob;
  try {
    compressed = await imageCompression(file, {
      maxWidthOrHeight: COMPRESS_MAX_WIDTH,
      initialQuality: COMPRESS_QUALITY,
      fileType: COMPRESS_FILE_TYPE,
      useWebWorker: true,
    });
  } catch {
    throw new Error("이미지 형식이 지원되지 않습니다.");
  }

  return {
    blob: compressed,
    sizeBytes: compressed.size,
    filename: `${crypto.randomUUID()}.webp`,
  };
}
