# younest

> 너만의 디지털 둥지. 노션의 핵심 기능을 무료·무제한으로, 민감한 노트는 본인만 볼 수 있게 E2E 암호화한 개인용 워크스페이스.

상세 기획: [`docs/younest_PRD.md`](./docs/younest_PRD.md)

## Status

🚧 M0 (셋업 & PoC) 완료 — 다음 M1 (카카오 OAuth & 어드민)

## 기술 스택

- **프레임워크**: Next.js 15 (App Router) + React 19 + TypeScript strict
- **스타일**: Tailwind CSS + shadcn/ui
- **백엔드**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **에디터**: BlockNote (Tiptap 기반 노션 스타일)
- **데이터베이스 뷰**: TanStack Table + dnd-kit + FullCalendar (M4)
- **암호화**: Web Crypto API — AES-GCM-256 + PBKDF2(600,000회)
- **호스팅**: Vercel (M5 이후)

## 셋업

### 1. 사전 요구사항
- Node.js 20+ (Node 22 권장)
- Supabase 계정 — https://supabase.com
- 카카오 디벨로퍼스 계정 (M1부터 필요)

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수

```bash
cp .env.example .env.local
# .env.local 편집 — Supabase URL/Anon Key부터 채우면 dev 서버 기동 가능
```

`.env.example` 각 키의 출처는 파일 내 주석 참조.

### 4. Supabase 마이그레이션 적용 (한 번만)

```bash
# 1. Supabase 프로젝트 생성 후 project ref 받기
supabase link --project-ref <your-project-ref>

# 2. 마이그레이션 푸시 (8개 테이블 + RLS + 인덱스)
supabase db push

# 3. TS 타입 자동 생성
npm run supabase:types
```

> 결정사항: 로컬 Docker 스택 미사용. 원격 Supabase 프로젝트에 직접 푸시.

### 5. 개발 서버

```bash
npm run dev
```

브라우저: http://localhost:3000

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (포트 3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드된 서버 실행 |
| `npm run typecheck` | TypeScript 타입 검사 (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run test` | Vitest 워치 모드 |
| `npm run test:run` | Vitest 1회 실행 |
| `npm run supabase:types` | 원격 DB → TS 타입 자동 생성 |
| `npm run supabase:migrate` | 마이그레이션 푸시 |

## 디렉토리 구조

```
app/                       # Next.js App Router
├── (marketing)/           # 비로그인 진입
├── (auth)/                # 가입/승인 대기/거절/복구
├── (app)/                 # 승인된 사용자 (사이드바 포함)
├── admin/                 # 어드민 전용
├── api/                   # Route Handlers (OAuth callback, logout)
└── poc/                   # M0 PoC (production 빌드에서 404)
components/
├── layout/                # Sidebar, SidebarMobile, PageHeader, LoadingSpinner
└── ui/                    # shadcn (Button, Input, Dialog, Sheet)
lib/
├── auth/                  # session, types, kakao 스텁
├── blocknote/             # 커스텀 블록 + 스키마
├── crypto/                # AES-GCM, PBKDF2 (+ Vitest 테스트)
└── supabase/              # client/server/middleware
supabase/migrations/       # SQL 마이그레이션 (8개 테이블 + RLS + 인덱스)
design/                    # 디자인 토큰 + Stitch 시안
docs/                      # PRD, PoC 결과, 완료 보고서
middleware.ts              # 라우트 가드 (Edge runtime)
```

## 마일스톤 진행 현황

- [x] **M0** 셋업 & BlockNote PoC
- [ ] **M1** 인증 & 어드민
- [ ] **M2** 에디터 핵심
- [ ] **M3** 대시보드 & 이미지
- [ ] **M4** 데이터베이스 시스템 (5종 뷰)
- [ ] **M5** E2E 암호화
- [ ] **M6** PWA & 모바일 다듬기
- [ ] **M7** 베타 출시

## 보안

- E2E 암호화: PIN → PBKDF2(600,000회 SHA-256) → MK → AES-GCM-256(DEK)
- 비공개 콘텐츠는 클라이언트에서만 복호화
- Supabase RLS — 모든 테이블 `auth.uid()` 기반 사용자별 격리
- 평문 PIN/MK/DEK는 절대 서버 전송 금지
- 어드민도 사용자 콘텐츠 테이블 SELECT 차단

상세: `docs/younest_PRD.md` §8

## AI 어시스턴트 컨텍스트

Claude Code가 매 세션 시작 시 `CLAUDE.md`를 자동 로드. Danger Zone 규칙, 디자인 토큰 매핑, 코드 스타일 모두 거기에.

## 라이선스

(미정 — 1인 프로젝트)
