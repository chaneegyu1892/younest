import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PageNode } from "@/lib/pages/types";

/**
 * 페이지 테이블에서 select할 컬럼들.
 * title_encrypted, cover_url, is_private는 M2.1 범위 밖이라 제외.
 */
const PAGE_SELECT =
  "id, user_id, parent_page_id, type, title, icon, is_favorite, position, content, created_at, updated_at";

/**
 * 현재 사용자의 모든 살아있는(deleted_at IS NULL) 페이지를 flat 배열로 반환.
 * RLS가 자동으로 user_id = auth.uid() 필터링을 적용.
 */
export async function fetchUserPages(): Promise<PageNode[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pages")
    .select(PAGE_SELECT)
    .is("deleted_at", null)
    .order("position", { ascending: true });

  if (error) throw error;
  // string-variable select 시 postgrest-js가 row 타입 추론을 못해 PageNode와 구조 불일치.
  // 런타임 shape은 PAGE_SELECT가 보장하므로 unknown 경유 캐스팅.
  return (data ?? []) as unknown as PageNode[];
}

/**
 * 단일 페이지를 ID로 페치.
 * 본인 페이지가 아니면 RLS 정책에 의해 null을 반환.
 */
export async function fetchPage(pageId: string): Promise<PageNode | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pages")
    .select(PAGE_SELECT)
    .eq("id", pageId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return (data as PageNode | null) ?? null;
}
