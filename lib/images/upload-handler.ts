import { compressImage } from "./compress";
import { getStorageUsage, recordImage } from "@/lib/actions/images";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const QUOTA_EVENT = "storage-quota-exceeded";

function dispatchQuotaEvent(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(QUOTA_EVENT));
  }
}

/**
 * BlockNote uploadFile 콜백 팩토리.
 * - preflight 쿼터 체크 → 압축 → Storage 업로드 → recordImage post-check
 * - 어느 단계든 실패하면 throw (BlockNote가 placeholder 유지)
 */
export function createUploadFileHandler(
  pageId: string,
): (file: File) => Promise<string> {
  return async (file: File): Promise<string> => {
    // 1) preflight: 현재 사용량 확인
    const usage = await getStorageUsage();
    if (!usage.ok) throw new Error(usage.error);
    if (usage.data.usedBytes + file.size > usage.data.limitBytes) {
      dispatchQuotaEvent();
      throw new Error("저장 용량 한도를 초과했어요.");
    }

    // 2) 이미지 압축 (WebP)
    const { blob, sizeBytes, filename } = await compressImage(file);

    // 3) 인증 사용자 확인
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("로그인이 필요합니다.");

    const storagePath = `${user.id}/${filename}`;

    // 4) Supabase Storage 업로드
    const { error: uploadErr } = await supabase.storage
      .from("images")
      .upload(storagePath, blob, {
        contentType: "image/webp",
        upsert: false,
      });
    if (uploadErr) throw new Error(uploadErr.message);

    // 5) DB 기록 + post-check (quota race 방지)
    const result = await recordImage({ storagePath, sizeBytes, pageId });
    if (!result.ok) {
      // 업로드된 파일 정리 후 에러 전파 (실패해도 무시)
      try {
        await supabase.storage.from("images").remove([storagePath]);
      } catch {
        // Storage 정리 실패는 무시
      }
      if (result.error === "quota") {
        dispatchQuotaEvent();
        throw new Error("저장 용량 한도를 초과했어요.");
      }
      throw new Error(result.error);
    }

    return result.data.url;
  };
}
