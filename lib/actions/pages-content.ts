"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { ActionResult } from "@/lib/pages/types";
import type { Json } from "@/lib/database.types";

// ─── 스키마 ───────────────────────────────────────────────────────────────────

const updateSchema = z.object({
  pageId: z.string().uuid(),
  // content는 BlockNote document (array of blocks) 또는 null.
  // Zod는 unknown[]를 검증하지만, DB에 저장될 때 Json으로 취급됨.
  content: z.union([z.array(z.unknown()), z.null()]),
});

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * 페이지 본문(content) 자동저장 Server Action.
 *
 * - service-role 미사용. RLS가 소유자 검증 (M2.1 패턴).
 * - revalidatePath 호출하지 않음 — 자동저장마다 RSC 재실행 비용 회피.
 * - content_encrypted는 절대 손대지 않음 (어드민/콘텐츠 격리 원칙).
 */
export async function updatePageContent(
  input: {
    pageId: string;
    content: Json;
  },
): Promise<ActionResult<{ updatedAt: string }>> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }

  const user = await getSessionUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pages")
    .update({ content: parsed.data.content as Json })
    .eq("id", parsed.data.pageId)
    .select("updated_at")
    .single();

  if (error || !data) {
    return { ok: false, error: "save_failed" };
  }

  return { ok: true, data: { updatedAt: data.updated_at } };
}
