"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { nextPosition } from "@/lib/pages/position";
import type { ActionResult, PageNode } from "@/lib/pages/types";

// ─── 스키마 ───────────────────────────────────────────────────────────────────

const createSchema = z.object({
  parentPageId: z.string().uuid().nullable(),
  type: z.literal("document"),
  title: z.string().max(200).optional(),
});

const renameSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(200),
});

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

/** select 컬럼 목록 — PageNode와 1:1 대응 */
const PAGE_SELECT =
  "id, user_id, parent_page_id, type, title, icon, is_favorite, position, created_at, updated_at";

/** 사이드바 트리가 포함된 레이아웃 전체를 재검증 */
function revalidateAppLayout() {
  revalidatePath("/", "layout");
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * 새 document 페이지를 생성한다.
 * - parentPageId: 루트이면 null, 자식이면 부모 UUID
 * - position은 같은 parent의 형제 중 최댓값 + 1로 자동 계산
 */
export async function createPage(input: {
  parentPageId: string | null;
  type: "document";
  title?: string;
}): Promise<ActionResult<PageNode>> {
  // Zod 검증
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "잘못된 입력입니다." };

  // 인증 확인
  const me = await getSessionUser();
  if (!me) return { ok: false, error: "로그인이 필요합니다." };

  const supabase = await createSupabaseServerClient();

  // 같은 parent의 형제 페이지 position 계산
  // parentPageId가 null이면 .is() 필터, 아니면 .eq() 필터 사용 (eq는 null 비허용)
  const siblingsQuery = supabase
    .from("pages")
    .select("parent_page_id, position")
    .is("deleted_at", null);

  const { data: siblings } =
    parsed.data.parentPageId === null
      ? await siblingsQuery.is("parent_page_id", null)
      : await siblingsQuery.eq("parent_page_id", parsed.data.parentPageId);

  const position = nextPosition(siblings ?? [], parsed.data.parentPageId);

  // 페이지 삽입
  const { data, error } = await supabase
    .from("pages")
    .insert({
      user_id: me.id,
      parent_page_id: parsed.data.parentPageId,
      type: "document",
      title: parsed.data.title ?? null,
      position,
    })
    .select(PAGE_SELECT)
    .single();

  if (error) return { ok: false, error: error.message };

  revalidateAppLayout();
  return { ok: true, data: data as PageNode };
}

/**
 * 페이지 제목을 변경한다.
 * - 200자 초과, UUID가 아닌 id는 Zod에서 차단
 */
export async function renamePage(
  id: string,
  title: string,
): Promise<ActionResult<{ id: string; title: string }>> {
  // Zod 검증
  const parsed = renameSchema.safeParse({ id, title });
  if (!parsed.success) {
    return { ok: false, error: "제목은 200자 이내로 입력해주세요." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("pages")
    .update({ title: parsed.data.title })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, error: error.message };

  // 레이아웃(사이드바) + 해당 페이지 재검증
  revalidateAppLayout();
  revalidatePath(`/p/${parsed.data.id}`, "page");

  return { ok: true, data: { id: parsed.data.id, title: parsed.data.title } };
}
