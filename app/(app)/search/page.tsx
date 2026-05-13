import { redirect } from "next/navigation";
import { searchPages } from "@/lib/search/search-pages";
import type { SearchSort } from "@/lib/search/types";
import { SearchResultList } from "./SearchResultList";
import { SortToggle } from "./SortToggle";
import { Pagination } from "./Pagination";

const PAGE_LIMIT = 30;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  if (q.length === 0) redirect("/dashboard");

  const sort: SearchSort = params.sort === "recent" ? "recent" : "relevance";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_LIMIT;

  // hasMore 판정용으로 limit + 1 가져온 뒤 슬라이스
  const oversample = await searchPages(q, {
    sort,
    limit: PAGE_LIMIT + 1,
    offset,
  });
  const hasMore = oversample.length > PAGE_LIMIT;
  const hits = oversample.slice(0, PAGE_LIMIT);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-h1 font-semibold">
          &ldquo;{q}&rdquo; 검색 결과
        </h1>
        <SortToggle current={sort} />
      </div>
      <SearchResultList hits={hits} />
      <Pagination q={q} sort={sort} page={page} hasMore={hasMore} />
    </div>
  );
}
