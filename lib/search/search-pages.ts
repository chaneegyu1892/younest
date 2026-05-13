import { createSupabaseServerClient } from "@/lib/supabase/server";
import { escapeIlike } from "./escape";
import type { SearchHit, SearchOpts } from "./types";

const MAX_QUERY_LEN = 200;
const DEFAULT_LIMIT = 30;

/**
 * 단일 검색 진입점. 모달·결과 페이지·향후 백링크가 모두 재사용.
 * RLS는 search_pages RPC가 SECURITY INVOKER로 자연 적용.
 */
export async function searchPages(
  rawQ: string,
  opts: SearchOpts = {},
): Promise<SearchHit[]> {
  const q = (rawQ ?? "").trim();
  if (q.length === 0) return [];

  const truncated = q.slice(0, MAX_QUERY_LEN);
  const escaped = escapeIlike(truncated);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("search_pages", {
    q: escaped,
    sort_mode: opts.sort ?? "relevance",
    result_limit: opts.limit ?? DEFAULT_LIMIT,
    result_offset: opts.offset ?? 0,
  });

  if (error) throw new Error(`search_pages RPC failed: ${error.message}`);

  // SECURITY: RPC가 setof pages를 반환하므로 모든 컬럼이 옴.
  // SearchHit로 슬라이싱해서 호출부에 노출 최소화.
  const rows = (data ?? []) as Array<{
    id: string;
    title: string | null;
    icon: string | null;
    parent_page_id: string | null;
    updated_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    icon: r.icon,
    parent_page_id: r.parent_page_id,
    updated_at: r.updated_at,
  }));
}
