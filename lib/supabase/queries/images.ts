import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ImageRow } from "@/lib/images/types";

const IMAGE_SELECT = "id, storage_path, size_bytes, page_id, created_at";

/**
 * 현재 사용자의 모든 이미지 row를 created_at desc로 반환.
 * RLS가 user_id 자동 필터링.
 */
export async function fetchUserImages(): Promise<ImageRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("images")
    .select(IMAGE_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as Array<{
    id: string;
    storage_path: string;
    size_bytes: number | null;
    page_id: string | null;
    created_at: string;
  }>;

  return rows.map((r) => ({
    ...r,
    public_url: supabase.storage.from("images").getPublicUrl(r.storage_path).data
      .publicUrl,
  }));
}
