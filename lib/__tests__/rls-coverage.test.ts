/**
 * RLS 정책 정적 검증 — 마이그레이션 파일 분석.
 *
 * 동적 검증(어드민 ↔ 사용자 콘텐츠 격리 실제 테스트)은 M2 이후 콘텐츠 CRUD가
 * 생기는 시점에 통합 테스트로. M1 단계에서는 사용자 데이터가 거의 없어
 * 의미 있는 동적 검증 불가.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const REPO_ROOT = join(__dirname, "..", "..");

function readMigration(filename: string): string {
  return readFileSync(
    join(REPO_ROOT, "supabase", "migrations", filename),
    "utf-8",
  );
}

const RLS_SQL = readMigration("20260512160100_rls_policies.sql");

const ALL_TABLES = [
  "users",
  "pages",
  "blocks",
  "db_properties",
  "db_views",
  "db_rows",
  "images",
  "audit_logs",
];

describe("M1.4 RLS — 마이그레이션 정적 검증", () => {
  describe("모든 보호 테이블에 RLS 활성화", () => {
    for (const table of ALL_TABLES) {
      it(`${table}`, () => {
        const pattern = new RegExp(
          `alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`,
          "i",
        );
        expect(RLS_SQL).toMatch(pattern);
      });
    }
  });

  describe("사용자 데이터 테이블은 본인 격리 정책 존재", () => {
    // 직접 user_id 컬럼 가진 테이블
    const userIdOwned = ["pages", "images"];
    for (const table of userIdOwned) {
      it(`${table} — auth.uid() = user_id`, () => {
        const pattern = new RegExp(
          `on\\s+public\\.${table}[\\s\\S]+?auth\\.uid\\(\\)\\s*=\\s*user_id`,
          "i",
        );
        expect(RLS_SQL).toMatch(pattern);
      });
    }

    // 간접 격리 (pages 또는 부모 테이블 통해 — alias `p`로 join)
    const indirectOwned = ["blocks", "db_properties", "db_views", "db_rows"];
    for (const table of indirectOwned) {
      it(`${table} — pages 통해 간접 격리`, () => {
        // exists (select 1 from public.pages p where ... p.user_id = auth.uid())
        const pattern = new RegExp(
          `on\\s+public\\.${table}[\\s\\S]+?from\\s+public\\.pages[\\s\\S]+?user_id\\s*=\\s*auth\\.uid\\(\\)`,
          "i",
        );
        expect(RLS_SQL).toMatch(pattern);
      });
    }
  });

  describe("users 테이블 본인만 SELECT/UPDATE", () => {
    it("users_select_own auth.uid() = id", () => {
      expect(RLS_SQL).toMatch(/users_select_own[\s\S]+?auth\.uid\(\)\s*=\s*id/i);
    });
    it("users_update_own auth.uid() = id", () => {
      expect(RLS_SQL).toMatch(/users_update_own[\s\S]+?auth\.uid\(\)\s*=\s*id/i);
    });
  });

  describe("audit_logs 본인 행위만 SELECT", () => {
    it("audit_logs_select_own auth.uid() = actor_id", () => {
      expect(RLS_SQL).toMatch(
        /audit_logs_select_own[\s\S]+?auth\.uid\(\)\s*=\s*actor_id/i,
      );
    });
  });
});

describe("M1.4 RLS — 어드민 UI는 콘텐츠 테이블 미접근 (PRD §8.5)", () => {
  /**
   * 어드민도 사용자 콘텐츠 (pages, blocks, db_*, images) SELECT 금지.
   * 정책으로 차단되지만, UI 레벨에서도 콘텐츠 테이블을 from()으로 호출하면
   * service-role 사용 시 RLS 우회 가능 → 코드 자체를 두지 않아야 안전.
   */
  const CONTENT_TABLES = ["pages", "blocks", "db_properties", "db_views", "db_rows", "images"];
  const ADMIN_FILES = [
    "app/admin/page.tsx",
    "app/admin/approvals/page.tsx",
    "app/admin/users/page.tsx",
    "app/admin/stats/page.tsx",
    "app/admin/actions.ts",
  ];

  for (const file of ADMIN_FILES) {
    it(`${file} 콘텐츠 테이블 from() 호출 없음`, () => {
      const content = readFileSync(join(REPO_ROOT, file), "utf-8");
      for (const table of CONTENT_TABLES) {
        const pattern = new RegExp(`\\.from\\(["']${table}["']\\)`);
        expect(content, `${file}에 ${table} from() 호출 발견`).not.toMatch(
          pattern,
        );
      }
    });
  }
});
