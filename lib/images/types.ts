export interface ImageRow {
  id: string;
  storage_path: string;
  size_bytes: number | null;
  page_id: string | null;
  created_at: string;
  public_url: string;
}
