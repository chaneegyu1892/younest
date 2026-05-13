import type { Database } from "@/lib/database.types";

export type PageRow = Database["public"]["Tables"]["pages"]["Row"];

/**
 * 사이드바에서 사용하는 페이지 메타 (필요한 컬럼만 select).
 * title_encrypted, cover_url, is_private은 M2.1 범위 밖이라 제외.
 */
export interface PageNode {
  id: string;
  user_id: string;
  parent_page_id: string | null;
  type: "document" | "database";
  title: string | null;
  icon: string | null;
  is_favorite: boolean;
  position: number;
  content: unknown[] | null;
  content_text: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PageTreeNode extends PageNode {
  children: PageTreeNode[];
  depth: number;
}

export type OptimisticMutation =
  | { kind: "create"; node: PageNode }
  | { kind: "rename"; id: string; title: string }
  | { kind: "setIcon"; id: string; icon: string | null }
  | { kind: "toggleFavorite"; id: string; is_favorite: boolean }
  | {
      kind: "move";
      id: string;
      newParentId: string | null;
      newPosition: number;
    }
  | { kind: "softDelete"; deletedIds: string[] }
  | { kind: "restore"; restoredIds: string[] };

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
