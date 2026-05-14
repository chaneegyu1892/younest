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

const idsSchema = z.array(z.string().uuid()).min(1);

/**
 * 이미지 일괄 삭제 — Storage + DB 둘 다.
 * Storage 실패는 swallow (DB 정리 우선). 부분 성공 가능.
 */
export async function deleteImages(
  ids: string[],
): Promise<ActionResult<{ deletedCount: number }>> {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return { ok: false, error: "삭제할 이미지가 없습니다." };

  const me = await getSessionUser();
  if (!me) return { ok: false, error: "로그인이 필요합니다." };

  const supabase = await createSupabaseServerClient();

  // 1. storage_path 수집 (RLS로 본인 것만)
  const { data: rows, error: readErr } = await supabase
    .from("images")
    .select("storage_path")
    .in("id", parsed.data);
  if (readErr) return { ok: false, error: readErr.message };

  const paths = (rows ?? []).map((r) => r.storage_path).filter(Boolean);

  // 2. Storage .remove (실패해도 DB 정리는 진행)
  if (paths.length > 0) {
    await supabase.storage.from("images").remove(paths).catch(() => {});
  }

  // 3. DB delete
  const { error: delErr } = await supabase
    .from("images")
    .delete()
    .in("id", parsed.data);
  if (delErr) return { ok: false, error: delErr.message };

  revalidatePath("/settings/storage");
  return { ok: true, data: { deletedCount: paths.length } };
}

interface BlockLike {
  type?: string;
  props?: { url?: string };
  children?: BlockLike[];
}

/**
 * BlockNote content jsonb에서 image 블록의 props.url을 set에 추가 (재귀).
 */
function extractImageUrls(content: unknown, into: Set<string>): void {
  if (!Array.isArray(content)) return;
  for (const block of content as BlockLike[]) {
    if (block?.type === "image" && typeof block.props?.url === "string") {
      into.add(block.props.url);
    }
    if (Array.isArray(block?.children)) {
      extractImageUrls(block.children, into);
    }
  }
}

/**
 * 어느 페이지에서도 참조되지 않는 이미지 id 목록.
 * - 살아있는 페이지(deleted_at IS NULL)의 content jsonb를 재귀 탐색
 * - block.type === 'image'의 props.url과 getPublicUrl로 생성한 URL을 비교
 * - 휴지통 페이지의 이미지는 orphan으로 분류 (content 안 봄)
 */
export async function listOrphanImages(): Promise<ActionResult<{ ids: string[] }>> {
  const me = await getSessionUser();
  if (!me) return { ok: false, error: "로그인이 필요합니다." };

  const supabase = await createSupabaseServerClient();

  const { data: pages, error: pagesErr } = await supabase
    .from("pages")
    .select("id, content")
    .is("deleted_at", null)
    .eq("user_id", me.id);
  if (pagesErr) return { ok: false, error: pagesErr.message };

  const usedUrls = new Set<string>();
  for (const p of pages ?? []) {
    extractImageUrls(p.content, usedUrls);
  }

  const { data: images, error: imgErr } = await supabase
    .from("images")
    .select("id, storage_path")
    .eq("user_id", me.id);
  if (imgErr) return { ok: false, error: imgErr.message };

  const orphanIds = (images ?? [])
    .filter((img) => {
      const publicUrl = supabase.storage
        .from("images")
        .getPublicUrl(img.storage_path).data.publicUrl;
      return !usedUrls.has(publicUrl);
    })
    .map((img) => img.id);

  return { ok: true, data: { ids: orphanIds } };
}
