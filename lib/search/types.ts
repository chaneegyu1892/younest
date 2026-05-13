export type SearchSort = "relevance" | "recent";

export interface SearchOpts {
  limit?: number;
  offset?: number;
  sort?: SearchSort;
}

/**
 * 검색 결과 행. PageNode와 별개 — 검색에 필요한 필드만.
 * breadcrumb은 클라이언트에서 트리 컨텍스트로 계산하므로 여기 없음.
 */
export interface SearchHit {
  id: string;
  title: string | null;
  icon: string | null;
  parent_page_id: string | null;
  updated_at: string;
}
