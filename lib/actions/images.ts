"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/pages/types";
import { STORAGE_LIMIT_BYTES } from "@/lib/images/constants";

// storage path: "{uuid}/{uuid}.webp" (user_id/filename)
const STORAGE_PATH_RE = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/;

const recordSchema = z.object({
  storagePath: z.string().regex(STORAGE_PATH_RE),
  sizeBytes: z.number().int().positive(),
  pageId: z.string().uuid().nullable(),
});

function sumSizes(rows: Array<{ size_bytes: number | null }>): number {
  return rows.reduce((acc, r) => acc + (r.size_bytes ?? 0), 0);
}

/**
 * 현재 사용자의 Storage 사용량 + 한도 반환.
 */
export async function getStorageUsage(): Promise<
  ActionResult<{ usedBytes: number; limitBytes: number }>
> {
  const me = await getSessionUser();
  if (!me) return { ok: false, error: "로그인이 필요합니다." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .select("size_bytes")
    .eq("user_id", me.id);
  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    data: { usedBytes: sumSizes(data ?? []), limitBytes: STORAGE_LIMIT_BYTES },
  };
}

/**
 * 업로드된 이미지 메타를 INSERT.
 * - post-check: 트랜잭션 외 race 방지를 위해 다시 sum 계산해 한도 검사
 * - 초과 시 호출자가 Storage에서 즉시 .remove() 해야 함 (atomic 트랜잭션 불가)
 */
export async function recordImage(input: {
  storagePath: string;
  sizeBytes: number;
  pageId: string | null;
}): Promise<ActionResult<{ id: string; url: string }>> {
  const parsed = recordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "잘못된 입력입니다." };

  const me = await getSessionUser();
  if (!me) return { ok: false, error: "로그인이 필요합니다." };

  const supabase = await createSupabaseServerClient();

  // post-check: INSERT 전 현재 사용량 재계산으로 quota 검사
  const { data: usageRows, error: sumErr } = await supabase
    .from("images")
    .select("size_bytes")
    .eq("user_id", me.id);
  if (sumErr) return { ok: false, error: sumErr.message };

  const used = sumSizes(usageRows ?? []);
  if (used + parsed.data.sizeBytes > STORAGE_LIMIT_BYTES) {
    return { ok: false, error: "quota" };
  }

  // INSERT
  const { data: inserted, error: insErr } = await supabase
    .from("images")
    .insert({
      user_id: me.id,
      page_id: parsed.data.pageId,
      storage_path: parsed.data.storagePath,
      encrypted: false,
      size_bytes: parsed.data.sizeBytes,
    })
    .select("id")
    .single();
  if (insErr || !inserted) {
    return { ok: false, error: insErr?.message ?? "이미지 기록 실패" };
  }

  const url = supabase.storage
    .from("images")
    .getPublicUrl(parsed.data.storagePath).data.publicUrl;

  if (parsed.data.pageId) {
    revalidatePath(`/p/${parsed.data.pageId}`);
  }
  return { ok: true, data: { id: inserted.id, url } };
}
