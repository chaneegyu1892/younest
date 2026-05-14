import { fetchDeletedPages } from "@/lib/supabase/queries/pages";
import { TrashListClient } from "./TrashListClient";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function TrashPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const trimmed = (q ?? "").trim();
  const pages = await fetchDeletedPages(trimmed || undefined);
  return <TrashListClient pages={pages} initialQ={trimmed} />;
}
