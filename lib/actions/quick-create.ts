"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { nextPosition } from "@/lib/pages/position";
import type { ActionResult } from "@/lib/pages/types";
import type { Json } from "@/lib/database.types";

const templateSchema = z.enum(["memo", "diary", "prayer"]);

interface TemplateMeta {
  label: string;
  icon: string;
  childTitle: (now: Date) => string;
  dedupByTitle: boolean;
}

const META: Record<z.infer<typeof templateSchema>, TemplateMeta> = {
  memo: {
    label: "메모",
    icon: "📝",
    childTitle: (n) => n.toISOString().slice(0, 10),
    dedupByTitle: true,
  },
  diary: {
    label: "일기",
    icon: "📖",
    childTitle: (n) => n.toISOString().slice(0, 10),
    dedupByTitle: true,
  },
  prayer: {
    label: "기도제목",
    icon: "🙏",
    childTitle: (n) => n.toISOString().slice(0, 10),
    dedupByTitle: true,
  },
};

interface PageLinkBlock {
  id: string;
  type: "pageLink";
  props: { pageId: string; title: string };
}

interface BlockMin {
  type?: string;
  props?: { pageId?: string };
}

/**
 * 부모 페이지 content jsonb에 PageLink 블록을 멱등하게 append.
 * 이미 같은 pageId의 pageLink가 있으면 변경 없이 false 반환.
 */
function appendPageLink(
  existingContent: unknown,
  childId: string,
  childTitle: string,
): { content: Json[]; changed: boolean } {
  const blocks: BlockMin[] = Array.isArray(existingContent)
    ? (existingContent as BlockMin[])
    : [];
  const already = blocks.some(
    (b) => b?.type === "pageLink" && b?.props?.pageId === childId,
  );
  if (already) {
    return { content: blocks as unknown as Json[], changed: false };
  }
  const newBlock: PageLinkBlock = {
    id: crypto.randomUUID(),
    type: "pageLink",
    props: { pageId: childId, title: childTitle },
  };
  return { content: [...blocks, newBlock] as unknown as Json[], changed: true };
}

/**
 * 빠른 작성 — 템플릿별 부모 프로젝트 페이지 + 오늘 자식 페이지를 보장하고
 * 자식 pageId를 반환한다.
 *
 * - 부모 식별: title + icon + parent_page_id IS NULL + deleted_at IS NULL 매칭, created_at asc 첫 1건.
 * - 부모 없으면 자동 생성.
 * - 일기는 오늘 날짜 자식이 이미 있으면 그 id 반환 (중복 생성 X).
 * - 부모.content에 PageLink 블록을 멱등하게 append (자식 인덱스 역할).
 */
export async function createQuickPage(
  template: "memo" | "diary" | "prayer",
): Promise<ActionResult<{ pageId: string }>> {
  const parsed = templateSchema.safeParse(template);
  if (!parsed.success) return { ok: false, error: "잘못된 템플릿입니다." };

  const me = await getSessionUser();
  if (!me) return { ok: false, error: "로그인이 필요합니다." };

  const meta = META[parsed.data];
  const supabase = await createSupabaseServerClient();

  // 1) 부모 찾기
  const { data: existingRoot, error: rootErr } = await supabase
    .from("pages")
    .select("id")
    .is("parent_page_id", null)
    .is("deleted_at", null)
    .eq("title", meta.label)
    .eq("icon", meta.icon)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (rootErr) return { ok: false, error: rootErr.message };

  let parentId: string;
  if (existingRoot) {
    parentId = existingRoot.id;
  } else {
    // 루트 형제로 부모 생성
    const { data: rootSiblings, error: rsErr } = await supabase
      .from("pages")
      .select("parent_page_id, position")
      .is("parent_page_id", null)
      .is("deleted_at", null);
    if (rsErr) return { ok: false, error: rsErr.message };

    const rootPosition = nextPosition(rootSiblings ?? [], null);
    const { data: newRoot, error: insRootErr } = await supabase
      .from("pages")
      .insert({
        user_id: me.id,
        parent_page_id: null,
        type: "document",
        title: meta.label,
        icon: meta.icon,
        position: rootPosition,
      })
      .select("id")
      .single();
    if (insRootErr || !newRoot) {
      return { ok: false, error: insRootErr?.message ?? "부모 페이지 생성 실패" };
    }
    parentId = newRoot.id;
  }

  const now = new Date();
  const childTitle = meta.childTitle(now);

  // 2) 자식 pageId 확정 (dedup 또는 신규 INSERT)
  let pageId: string;

  if (meta.dedupByTitle) {
    // (dedup) 일기처럼 오늘 자식이 이미 있으면 그 id 사용
    const { data: existingChild, error: dupErr } = await supabase
      .from("pages")
      .select("id")
      .eq("parent_page_id", parentId)
      .eq("title", childTitle)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();
    if (dupErr) return { ok: false, error: dupErr.message };
    if (existingChild) {
      pageId = existingChild.id;
    } else {
      // dedup 미해당 → 신규 INSERT
      const { data: childSiblings, error: csErr } = await supabase
        .from("pages")
        .select("parent_page_id, position")
        .eq("parent_page_id", parentId)
        .is("deleted_at", null);
      if (csErr) return { ok: false, error: csErr.message };

      const childPosition = nextPosition(childSiblings ?? [], parentId);
      const { data: child, error: insChildErr } = await supabase
        .from("pages")
        .insert({
          user_id: me.id,
          parent_page_id: parentId,
          type: "document",
          title: childTitle,
          icon: meta.icon,
          position: childPosition,
        })
        .select("id")
        .single();
      if (insChildErr || !child) {
        return { ok: false, error: insChildErr?.message ?? "자식 페이지 생성 실패" };
      }
      pageId = child.id;
    }
  } else {
    // 3) 자식 형제 fetch + position 계산 + INSERT
    const { data: childSiblings, error: csErr } = await supabase
      .from("pages")
      .select("parent_page_id, position")
      .eq("parent_page_id", parentId)
      .is("deleted_at", null);
    if (csErr) return { ok: false, error: csErr.message };

    const childPosition = nextPosition(childSiblings ?? [], parentId);
    const { data: child, error: insChildErr } = await supabase
      .from("pages")
      .insert({
        user_id: me.id,
        parent_page_id: parentId,
        type: "document",
        title: childTitle,
        icon: meta.icon,
        position: childPosition,
      })
      .select("id")
      .single();
    if (insChildErr || !child) {
      return { ok: false, error: insChildErr?.message ?? "자식 페이지 생성 실패" };
    }
    pageId = child.id;
  }

  // 4) 부모 페이지 content에 PageLink 자동 추가 (멱등)
  const { data: parentRow, error: parentReadErr } = await supabase
    .from("pages")
    .select("content")
    .eq("id", parentId)
    .maybeSingle();
  if (parentReadErr) return { ok: false, error: parentReadErr.message };

  const { content: nextContent, changed } = appendPageLink(
    parentRow?.content,
    pageId,
    childTitle,
  );
  if (changed) {
    const { error: updateErr } = await supabase
      .from("pages")
      .update({ content: nextContent })
      .eq("id", parentId);
    if (updateErr) return { ok: false, error: updateErr.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, data: { pageId } };
}
