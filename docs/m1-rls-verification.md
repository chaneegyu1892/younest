# M1.4 — RLS 동작 검증

> PRD §5.2 / §8.5 핵심 원칙: 사용자는 본인 데이터만, 어드민은 콘텐츠 SELECT 금지.

## 자동 검증 (Vitest 정적 분석)

`lib/__tests__/rls-coverage.test.ts` — 22건 PASS.

검증 항목:
- 8개 보호 테이블(`users`/`pages`/`blocks`/`db_properties`/`db_views`/`db_rows`/`images`/`audit_logs`) 모두 `enable row level security`
- 사용자 데이터 테이블에 본인 격리 정책
  - 직접 격리(`auth.uid() = user_id`): `pages`, `images`
  - 간접 격리(`pages` 통해): `blocks`, `db_properties`, `db_views`, `db_rows`
- `users`: 본인만 SELECT/UPDATE (`auth.uid() = id`)
- `audit_logs`: 본인 행위만 SELECT (`auth.uid() = actor_id`)
- **어드민 UI 코드(`app/admin/**`)가 콘텐츠 테이블 `from()` 호출 없음** — service-role을 쓰더라도 코드 자체에 없으면 우회 가능성 차단

## 동적 검증 (수동)

자동 테스트는 정책 *정의*만 확인. 실제 *동작*은 M2 이후 콘텐츠 CRUD가 생기는 시점에 확인 가능.

**M2 진입 시 추가할 시나리오** (현재 콘텐츠 미생성이라 보류):
1. 사용자 A: 페이지 생성 (`pages` row).
2. 사용자 B (어드민 권한): A의 `pages` row를 `from("pages").select("*").eq("id", A의page_id)` 시도 → RLS로 차단 (반환 0건).
3. 사용자 B가 자기 `pages`만 보임.
4. 어드민이 `from("users").select("*")` (service-role 통해) → 모든 사용자 메타 보임 OK. 단 `from("pages")`는 정책상 차단.

**Supabase Dashboard Advisors**:
- 대시보드 → Authentication → Policies 또는 Database → Linter
- 모든 테이블에 RLS 활성화 + 정책 존재 확인
- (Supabase MCP는 다른 프로젝트에 연결돼있어 사용 불가 — 대시보드 GUI 사용)

## 어드민 셋업 (1인 dev)

본인을 어드민으로 만드는 흐름:

### 첫 회원 가입 후 (코드 변경 후 가능)
**`upsertUserAfterAuth`가 로그인마다 ADMIN_KAKAO_IDS와 동기화**하므로:
1. `.env.local`의 `ADMIN_KAKAO_IDS=`에 본인 카카오 ID 채우기 (콤마 구분)
2. dev 서버 재시작 (env 반영)
3. 로그아웃 후 재로그인 → `is_admin=true` 자동 전환 + (status='pending'이었다면) `status='approved'`로 승격
4. `/admin` 접근 가능

### 본인 카카오 ID 확인 방법
- Supabase Dashboard → Table Editor → `users` → 본인 row → `kakao_id` 컬럼 값

## 미래 검증 체크리스트 (M2/M3에서)

- [ ] 사용자가 본인이 만들지 않은 page_id로 SELECT 시 0건 반환
- [ ] 사용자가 본인이 만들지 않은 block의 UPDATE 시 0 rows affected
- [ ] 어드민이 `from("pages")` 호출 시 본인 페이지만 반환 (service-role 사용 안 한 경우)
- [ ] 어드민이 service-role로 `from("pages")` 호출하는 코드가 코드베이스에 없음 (이번 정적 테스트가 커버)
