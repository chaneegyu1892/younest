import Link from "next/link";
import type { SearchHit } from "@/lib/search/types";

interface Props {
  hits: SearchHit[];
}

export function SearchResultList({ hits }: Props) {
  if (hits.length === 0) {
    return <p className="py-8 text-center text-text-tertiary">검색 결과가 없습니다</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {hits.map((hit) => {
        const title = hit.title?.trim() ? hit.title : "제목 없음";
        const icon = hit.icon ?? "📄";
        return (
          <li key={hit.id}>
            <Link
              href={`/p/${hit.id}`}
              className="flex items-center gap-3 py-3 hover:bg-background"
            >
              <span className="text-lg leading-none">{icon}</span>
              <span className="flex-1 truncate text-body text-text-primary">{title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
