import { notFound } from "next/navigation";
import { fetchPage } from "@/lib/supabase/queries/pages";
import { PageHeader } from "./PageHeader";
import { PageBodyPlaceholder } from "./PageBodyPlaceholder";

type PageProps = { params: Promise<{ pageId: string }> };

export default async function PageView({ params }: PageProps) {
  const { pageId } = await params;
  const page = await fetchPage(pageId);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <PageHeader
        id={page.id}
        initialTitle={page.title}
        initialIcon={page.icon}
        initialFavorite={page.is_favorite}
      />
      <PageBodyPlaceholder />
    </div>
  );
}
