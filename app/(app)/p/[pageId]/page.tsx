import { notFound } from "next/navigation";
import { fetchPage, fetchUserPages } from "@/lib/supabase/queries/pages";
import { PageHeader } from "./PageHeader";
import { PageBody } from "./PageBody";

type PageProps = { params: Promise<{ pageId: string }> };

export default async function PageView({ params }: PageProps) {
  const { pageId } = await params;
  const page = await fetchPage(pageId);
  if (!page) notFound();

  // PageLink 모달용 — 자기 자신 포함 모든 페이지 (spec §3: 제외 규칙 없음)
  const allPages = await fetchUserPages();
  const availablePages = allPages.map((p) => ({
    id: p.id,
    title: p.title || "제목 없음",
    icon: p.icon,
  }));

  return (
    <div className="mx-auto max-w-3xl p-6">
      <PageHeader
        id={page.id}
        initialTitle={page.title}
        initialIcon={page.icon}
        initialFavorite={page.is_favorite}
      />
      <PageBody
        pageId={page.id}
        initialContent={page.content}
        availablePages={availablePages}
      />
    </div>
  );
}
