import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Service-role Supabase 클라이언트.
 * RLS를 우회하므로 **서버에서만** 사용. 절대 클라이언트(브라우저)에 노출 금지.
 *
 * 용도:
 * - OAuth 콜백에서 public.users 신규 INSERT (RLS는 user_role INSERT 차단)
 * - 어드민 콘솔에서 다른 사용자 데이터 조회 (단, 콘텐츠 테이블은 정책상 차단됨)
 *
 * CLAUDE.md Danger Zone — 이 클라이언트를 RSC/Client Component에서 import 금지.
 * Route Handler 또는 server action에서만.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 비어있습니다.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
