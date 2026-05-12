# M0 완료 보고서 — 2026-05-12

> M0 마일스톤 (셋업 & BlockNote PoC) 정식 종료. M1 (인증 & 어드민) 진입 준비 완료.

## Phase 검증 요약

| Phase | 상태 | 핵심 산출물 |
|---|---|---|
| 1. 프로젝트 초기화 | ✅ | Next.js 15 + React 19 + TS strict + Tailwind + shadcn 초기화 |
| 2. Supabase + 데이터 모델 | ✅ | 8개 테이블 + RLS 정책 + 인덱스 + 자동 생성 TS 타입 (536줄) |
| 3. 인증 가드 골격 | ✅ | middleware + 라우트 그룹별 가드 + 카카오 OAuth 인터페이스 스텁 |
| 4. BlockNote PoC | ✅ | 커스텀 블록 3종 + 한글 IME 5/5 + 암호화 라운드트립 (`docs/m0-poc-results.md`) |
| 5. UI 골격 | ✅ | Sidebar (desktop sticky + 모바일 Sheet) + PageHeader + Loading + Error |
| 6. 검증 & 정리 | ✅ | README + .env.example 확정 + 본 보고서 |

## 자동 검증 결과 (이 보고서 작성 시점)

- `npm run typecheck` → **0 errors**
- `npm run lint` → **0 errors**
- `npm run test:run` → **11/11 PASS** (AES-GCM 4 + PBKDF2 4 + 라운드트립 3)
- `npm run build` → 성공
- `npm run start` → production 부팅 OK

## Production 스모크 테스트

| 경로 | 기대 | 실제 |
|---|---|---|
| `GET /` (marketing) | 200 | ✅ 200 |
| `GET /dashboard` (비로그인) | 307 → `/` | ✅ |
| `GET /admin` (비로그인) | 307 → `/` | ✅ |
| `GET /signup` (비로그인) | 307 → `/` (PUBLIC_PATHS 미포함) | ✅ |
| `GET /poc/blocknote` | **404 (production 차단)** | ✅ |
| `GET /poc/sidebar` | **404 (production 차단)** | ✅ |
| `GET /api/auth/kakao/callback` | 501 (M1 스텁) | ✅ |
| `POST /api/auth/logout` | 303 → `/` | ✅ |

## 확정된 기술 결정 (M0 종료 시점)

| # | 항목 | 결정 |
|---|---|---|
| 1 | Tailwind 버전 | v3 (안정) |
| 2 | shadcn 색 시스템 | CSS 변수를 디자인 토큰 HSL로 매핑 |
| 3 | Supabase 환경 | 원격 프로젝트만 (로컬 Docker 미사용) |
| 4 | PoC 페이지 격리 | `app/poc/layout.tsx`에서 `NODE_ENV === "production"` 시 `notFound()` |
| 5 | 블록 에디터 | **BlockNote 0.50.0 확정** (Tiptap 폴백 불필요) |
| 6 | Mantine 버전 | **8.3.x 고정** (Next.js 15 번들 React에 `useEffectEvent` 없어서 Mantine 9 충돌. Next 16 업그레이드 전까지 유지) |
| 7 | Vitest 환경 | Node (jsdom은 `.dom.test.{ts,tsx}` 패턴에만) |
| 8 | 사이드바 레이아웃 | sticky top-0 h-screen 패턴 (Notion 스타일) |

## PoC 결과 요약

(`docs/m0-poc-results.md` 참조)

- ✅ 커스텀 블록 3종 (토글/콜아웃/페이지 링크) — 슬래시 메뉴 + 한/영 alias
- ✅ 한글 IME 5/5 시나리오 PASS (백스페이스, 슬래시 트리거, 블록 변환, 빠른 타이핑, 한자)
- ✅ `editor.document` JSON ↔ AES-GCM 라운드트립 — 11/11 Vitest + 수동 브라우저 흐름

## M1 진입 전 결정 필요 사항

- [ ] **카카오 디벨로퍼스 앱 등록** — 사용자 직접 진행
  - REST API 키, Client Secret 발급
  - Redirect URI: `http://localhost:3000/api/auth/kakao/callback` 등록
  - 본인 카카오 ID 확인 (어드민 자동 승인용)
- [ ] **`SESSION_SECRET` 생성** — `openssl rand -base64 32`
- [ ] **`.env.local`에 카카오 + 어드민 + 세션 값 채우기**

## 채울 코드 위치 (M1 진입 시)

- `lib/auth/kakao.ts:exchangeCodeForTokens` — 카카오 토큰 엔드포인트 호출
- `lib/auth/kakao.ts:fetchKakaoProfile` — 카카오 프로필 조회
- `app/api/auth/kakao/callback/route.ts` — 6단계 흐름:
  1. `searchParams`에서 `code` 추출
  2. `exchangeCodeForTokens(code)`
  3. `fetchKakaoProfile(access_token)`
  4. `users` 테이블 upsert (`status='pending'` 초기값)
  5. Supabase Auth 세션 생성
  6. `users.status`에 따른 리다이렉트 (approved→`/dashboard`, pending→`/pending`, rejected→`/rejected`)

## 다음 단계 (M1 — 인증 & 어드민)

PRD §10 M1 범위:
- 카카오 OAuth 콜백 실제 구현
- 가입 신청 화면 (`/signup`)
- 어드민 승인 콘솔 (`/admin/approvals`, `/admin/users`)
- RLS 동작 검증 (어드민 ≠ 사용자 콘텐츠 SELECT)
- 본인 카카오 ID는 자동 승인 + `is_admin=true`

## 남은 정리 사항 (M0 → M1 전환 시)

- PoC 폴더 `app/poc/{blocknote,sidebar}`는 그대로 유지 (production 차단됨, 향후 시각적 디버깅에 재활용 가능). M7 베타 출시 직전에 일괄 정리.
- Supabase MCP는 현재 사용자의 다른 프로젝트 `im_dealer`에 연결돼 있어 younest 작업엔 사용 금지. younest project ref: `uausjolhamvofooyiijr`.
