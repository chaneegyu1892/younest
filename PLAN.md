# younest M0 셋업 & PoC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js 15 + Supabase + Tailwind 골격을 세우고, BlockNote PoC 4종을 검증해 M1 인증 단계로 진입할 준비를 마친다.

**Architecture:** Next.js 15 App Router 라우트 그룹 4개(`marketing`/`auth`/`app`/`admin`)로 가드 정책을 분리하고, Supabase(PostgreSQL+Auth+Storage)를 백엔드로 사용. BlockNote는 M0 PoC 통과 시 확정, 실패 시 Tiptap으로 폴백. 모든 비공개 콘텐츠는 Web Crypto API로 클라이언트 측 AES-GCM-256 암호화.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Tailwind CSS, shadcn/ui, Supabase JS client (`@supabase/ssr`), BlockNote, Zustand, TanStack Query, Web Crypto API

---

## 운영 규칙 (모든 Phase에 공통 적용)

1. **각 Phase 시작 전 사용자 확인 필수** — "Phase N 시작합니다" 메시지 후 승인 받기
2. **각 Phase 완료 시 보고** — typecheck/lint/실행 가능 여부 검증 결과
3. **Danger Zones 작업 사전 확인** — `src/lib/crypto/`, `src/lib/auth/`, `middleware.ts`, `supabase/migrations/`, RLS 정책 수정 전 반드시 사용자 확인
4. **외부 서비스 등록은 사용자 안내** — Supabase/카카오 디벨로퍼스 가입은 "어디 가서 무엇을 클릭" 명확히
5. **라이브러리 버전 확인** — 설치 전 npm registry로 최신 안정 버전 확인. 특히 BlockNote, Next.js 15, React 19 호환성
6. **응답 언어**: 한국어. 코드 주석도 한국어 우선
7. **커밋**: Conventional Commits (한국어 OK). Phase 단위가 아니라 작업 단위로 자주 커밋

---

## Phase 1: 프로젝트 초기화

> **목표**: 빈 디렉토리 상태에서 `npm run dev`가 동작하는 Next.js 15 + TS strict + Tailwind + shadcn/ui 프로젝트로 만든다.

**Files (이 Phase 종료 시 존재해야 하는 파일)**:
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `.prettierrc`, `.gitignore`, `.env.example`
- Create: `app/layout.tsx`, `app/page.tsx` (임시 랜딩 placeholder)
- Create: `app/(marketing)/layout.tsx`, `app/(auth)/layout.tsx`, `app/(app)/layout.tsx`, `app/admin/layout.tsx`
- Create: `app/globals.css`, `components/`, `lib/`, `hooks/` 디렉토리

### Task 1.1: Next.js 15 프로젝트 생성

- [ ] **Step 1: 라이브러리 호환성 확인**

`docs-lookup` 또는 npm registry로 다음 패키지 최신 안정 버전 확인:
- `next` (15.x 안정)
- `react` (19.x)
- `react-dom` (19.x)
- `typescript` (5.x)
- `tailwindcss` (**v3.x 안정** — 결정사항 #1)

결과를 사용자에게 보고: "다음 버전으로 진행해도 될까요?" 형태.

- [ ] **Step 2: `package.json` 생성**

`/Users/jinkyu/younest/package.json`:
```json
{
  "name": "younest",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```
의존성은 `npm install` 단계에서 추가.

- [ ] **Step 3: 핵심 의존성 설치**

```bash
cd /Users/jinkyu/younest && \
npm install next@latest react@latest react-dom@latest && \
npm install -D typescript @types/react @types/react-dom @types/node \
  eslint eslint-config-next prettier prettier-plugin-tailwindcss \
  tailwindcss postcss autoprefixer
```
Expected: `node_modules/`, `package-lock.json` 생성.

- [ ] **Step 4: `tsconfig.json` 작성 (strict 모드)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: `next.config.ts` 작성**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      // Supabase Storage 도메인은 환경변수로 받은 후 추가
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 6: `.gitignore` 작성**

```
node_modules/
.next/
out/
build/
dist/
*.log
.env
.env.local
.env*.local
.DS_Store
coverage/
.idea/
.vscode/
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 7: 커밋**

```bash
cd /Users/jinkyu/younest && \
git init && \
git add package.json tsconfig.json next.config.ts .gitignore && \
git commit -m "chore: Next.js 15 + TypeScript strict 초기 셋업"
```
(이미 git 저장소라면 `git init` 생략. `git status`로 먼저 확인)

### Task 1.2: Tailwind CSS + 디자인 토큰 연동

- [ ] **Step 1: `tailwind.config.ts` 작성 — design-tokens.json 연동**

`/Users/jinkyu/younest/tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";
import tokens from "./design/design-tokens.json";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        "primary-hover": tokens.colors.primaryHover,
        private: tokens.colors.private,
        background: tokens.colors.background,
        surface: tokens.colors.surface,
        sidebar: tokens.colors.sidebar,
        border: tokens.colors.border,
        "text-primary": tokens.colors.text.primary,
        "text-secondary": tokens.colors.text.secondary,
        "text-tertiary": tokens.colors.text.tertiary,
        success: tokens.colors.status.success,
        warning: tokens.colors.status.warning,
        error: tokens.colors.status.error,
      },
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      fontFamily: {
        sans: tokens.typography.fontFamily.split(",").map((s) => s.trim()),
      },
      fontSize: tokens.typography.sizes,
      fontWeight: tokens.typography.weights,
      boxShadow: tokens.shadows,
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: `postcss.config.mjs` 작성**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: `app/globals.css` 작성**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: var(--font-sans, system-ui, sans-serif);
}

html, body {
  background-color: theme("colors.background");
  color: theme("colors.text-primary");
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: `app/layout.tsx` 루트 레이아웃 작성**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "younest",
  description: "너만의 디지털 둥지",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: 임시 `app/page.tsx`로 dev 서버 확인**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-md bg-surface p-8 shadow-card">
        <h1 className="text-display font-bold text-primary">younest</h1>
        <p className="mt-2 text-text-secondary">M0 셋업 진행 중</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: dev 서버 실행 확인**

```bash
cd /Users/jinkyu/younest && npm run dev
```
브라우저로 `http://localhost:3000` 열어 화면 확인. 사용자에게 "디자인 토큰이 적용된 임시 홈 화면 확인됐나요?" 보고.

- [ ] **Step 7: typecheck 통과 확인**

```bash
cd /Users/jinkyu/younest && npm run typecheck
```
Expected: 에러 0건.

- [ ] **Step 8: 커밋**

```bash
git add tailwind.config.ts postcss.config.mjs app/ && \
git commit -m "feat: Tailwind + design-tokens 연동, 루트 레이아웃 추가"
```

### Task 1.3: ESLint + Prettier 설정

- [ ] **Step 1: `.eslintrc.json` 작성**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

- [ ] **Step 2: `.prettierrc` 작성**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 3: `.prettierignore` 작성**

```
node_modules
.next
out
build
dist
coverage
*.lock
package-lock.json
design/stitch-exports/html-css
```

- [ ] **Step 4: lint 통과 확인**

```bash
cd /Users/jinkyu/younest && npm run lint
```
Expected: 에러 0건 (warning만 허용).

- [ ] **Step 5: 커밋**

```bash
git add .eslintrc.json .prettierrc .prettierignore && \
git commit -m "chore: ESLint + Prettier 설정 추가"
```

### Task 1.4: 라우트 그룹 4개 골격 생성

- [ ] **Step 1: `(marketing)` 그룹 생성**

`app/(marketing)/layout.tsx`:
```tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
```

`app/(marketing)/page.tsx` (S-001 랜딩 placeholder):
```tsx
export default function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="rounded-md bg-surface p-8 shadow-card">
        <h1 className="text-display font-bold text-primary">younest</h1>
        <p className="mt-2 text-text-secondary">너만의 디지털 둥지</p>
        <button className="mt-6 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-hover">
          카카오로 시작하기 (M1에서 구현)
        </button>
      </div>
    </main>
  );
}
```
**주의**: 이전 `app/page.tsx`는 삭제. 라우트 그룹의 `page.tsx`가 `/`를 차지.

- [ ] **Step 2: `(auth)` 그룹 생성**

`app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
```

`app/(auth)/signup/page.tsx` (S-002 placeholder):
```tsx
export default function SignupPage() {
  return <main className="p-6"><h1 className="text-h1">가입 신청 (M1에서 구현)</h1></main>;
}
```

`app/(auth)/pending/page.tsx` (S-003 placeholder):
```tsx
export default function PendingPage() {
  return <main className="p-6"><h1 className="text-h1">승인 대기 중 (M1에서 구현)</h1></main>;
}
```

`app/(auth)/rejected/page.tsx` (S-004 placeholder):
```tsx
export default function RejectedPage() {
  return <main className="p-6"><h1 className="text-h1">가입이 거절되었어요 (M1에서 구현)</h1></main>;
}
```

`app/(auth)/recover/page.tsx` (S-040 placeholder):
```tsx
export default function RecoverPage() {
  return <main className="p-6"><h1 className="text-h1">PIN 복구 (M5에서 구현)</h1></main>;
}
```

- [ ] **Step 3: `(app)` 그룹 생성**

`app/(app)/layout.tsx`:
```tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* 사이드바는 Phase 5에서 추가 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

`app/(app)/dashboard/page.tsx` (S-010 placeholder):
```tsx
export default function DashboardPage() {
  return <div className="p-6"><h1 className="text-h1">대시보드 (M3에서 구현)</h1></div>;
}
```

`app/(app)/p/[pageId]/page.tsx` (S-011/S-012 placeholder):
```tsx
export default async function PageView({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  return <div className="p-6"><h1 className="text-h1">페이지 {pageId} (M2에서 구현)</h1></div>;
}
```

`app/(app)/trash/page.tsx`, `app/(app)/search/page.tsx`,
`app/(app)/settings/page.tsx`, `app/(app)/settings/security/page.tsx`,
`app/(app)/settings/storage/page.tsx`, `app/(app)/settings/recovery/page.tsx` — 각각 placeholder.

- [ ] **Step 4: `admin/` 그룹 생성**

`app/admin/layout.tsx`:
```tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background"><main className="p-6">{children}</main></div>;
}
```

`app/admin/page.tsx`, `app/admin/approvals/page.tsx`, `app/admin/users/page.tsx`, `app/admin/stats/page.tsx` — placeholder.

- [ ] **Step 5: 시스템 페이지**

`app/not-found.tsx` (S-041):
```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-h1 font-semibold">404</h1>
      <p className="mt-2 text-text-secondary">길을 잃었어요</p>
      <Link href="/" className="mt-4 text-primary underline">홈으로</Link>
    </main>
  );
}
```

`app/error.tsx` (S-042):
```tsx
"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-h1 font-semibold">문제가 발생했어요</h1>
      <button onClick={reset} className="mt-4 rounded-md bg-primary px-4 py-2 text-white">
        다시 시도
      </button>
    </main>
  );
}
```

- [ ] **Step 6: typecheck + dev 서버 확인**

```bash
cd /Users/jinkyu/younest && npm run typecheck && npm run dev
```
브라우저로 다음 경로들 직접 접근해서 placeholder 화면 확인:
- `/` (S-001)
- `/signup`, `/pending`, `/rejected`, `/recover`
- `/dashboard`, `/p/test`, `/trash`, `/search`, `/settings`
- `/admin`, `/admin/approvals`

- [ ] **Step 7: 커밋**

```bash
git add app/ && \
git commit -m "feat: App Router 라우트 그룹 4개 (marketing/auth/app/admin) 골격 추가"
```

### Task 1.5: shadcn/ui 초기화

- [ ] **Step 1: shadcn/ui CLI로 초기화**

`docs-lookup`으로 shadcn/ui Next.js 15 + Tailwind v3/v4 호환 초기화 명령 확인. 일반적으로:
```bash
cd /Users/jinkyu/younest && npx shadcn@latest init
```
대화형 프롬프트에서 다음 선택:
- TypeScript: Yes
- Style: Default
- Base color: Neutral (이후 디자인 토큰으로 덮어쓰기)
- Components dir: `components/`
- Utils dir: `lib/utils.ts`
- React Server Components: Yes
- Import alias: `@/*`

- [ ] **Step 2: 기본 컴포넌트 3개 설치**

```bash
cd /Users/jinkyu/younest && npx shadcn@latest add button input dialog
```

- [ ] **Step 3: shadcn CSS 변수를 디자인 토큰으로 덮어쓰기 (결정사항 #2)**

`app/globals.css`의 `:root` 블록에 shadcn이 추가한 `--primary`, `--background`, `--foreground`, `--border` 등의 HSL 값을 디자인 토큰의 HEX → HSL 변환값으로 교체.

예시:
```css
:root {
  /* shadcn 변수를 younest 디자인 토큰으로 덮어씀 */
  --background: 60 14% 97%;         /* #FAFAF8 */
  --foreground: 0 0% 10%;           /* #1A1A1A */
  --primary: 10 100% 77%;           /* #FF9F8A */
  --primary-foreground: 0 0% 100%;  /* white */
  --secondary: 40 18% 95%;          /* sidebar 계열 */
  --muted: 0 0% 42%;                /* text-secondary #6B6B6B */
  --border: 40 14% 90%;             /* #E8E6E1 */
  --radius: 0.625rem;               /* 10px = 디자인 토큰 md */
  /* ... 나머지 변수도 동일 패턴 */
}
```

HEX → HSL 변환은 https://www.w3.org/TR/css-color-4/ 표준 변환 또는 온라인 도구 사용. 변환 결과는 `lib/design-tokens-hsl.md`에 표로 기록해서 재현성 확보.

- [ ] **Step 4: 임시 랜딩 페이지에서 shadcn Button 사용 확인**

`app/(marketing)/page.tsx`의 button을 shadcn `<Button>`으로 교체. dev 서버에서 렌더링 확인.

- [ ] **Step 5: 커밋**

```bash
git add components/ lib/utils.ts components.json app/(marketing)/page.tsx && \
git commit -m "feat: shadcn/ui 초기화 + 기본 컴포넌트 (button/input/dialog) 추가"
```

### Phase 1 완료 보고 항목

사용자에게 보고:
- [ ] `npm run dev` 정상 동작 (포트 3000)
- [ ] `npm run typecheck` 통과 (에러 0)
- [ ] `npm run lint` 통과
- [ ] 모든 라우트 그룹 placeholder 페이지 접근 가능
- [ ] 디자인 토큰이 Tailwind 클래스로 적용됨 (`bg-primary`, `text-text-secondary` 등)
- [ ] git log: 5개 정도 커밋

---

## Phase 2: Supabase 셋업 & 데이터 모델

> **목표**: Supabase 클라이언트 코드 + 마이그레이션 8개 테이블 + RLS 정책 + TypeScript 타입 생성 파이프라인.
>
> **외부 서비스 등록 필요**: 사용자가 Supabase 프로젝트를 직접 생성해야 함. 등록 순서 안내 필수.

**Files**:
- Create: `lib/supabase/client.ts` (브라우저용)
- Create: `lib/supabase/server.ts` (서버 컴포넌트/Route Handler용)
- Create: `lib/supabase/middleware.ts` (미들웨어용)
- Create: `lib/database.types.ts` (자동 생성)
- Create: `supabase/migrations/00001_initial_schema.sql`
- Create: `supabase/migrations/00002_rls_policies.sql`
- Create: `supabase/migrations/00003_indexes.sql`
- Create: `.env.example` 완성
- Modify: `package.json` scripts에 `supabase:types`, `supabase:migrate` 추가

### Task 2.1: Supabase 프로젝트 생성 사용자 안내 (외부)

- [ ] **Step 1: 사용자에게 안내 메시지 출력**

```
다음을 직접 진행해주세요. 끝나면 알려주세요.

1. https://supabase.com/dashboard 접속 → 로그인 (GitHub 추천)
2. 우측 상단 "New project" 클릭
3. 프로젝트 정보 입력:
   - Organization: 본인 계정
   - Name: younest
   - Database Password: 강력한 비밀번호 (1Password 등에 저장)
   - Region: Northeast Asia (Seoul) — ap-northeast-2
   - Pricing Plan: Free
4. "Create new project" 클릭 → 약 1-2분 대기
5. 좌측 메뉴 "Project Settings" → "API"에서 다음 3개 값 복사해서 알려주세요:
   - Project URL (https://xxxx.supabase.co)
   - anon public key
   - service_role key (⚠️ 절대 클라이언트에 노출 금지)
6. "Project Settings" → "Database" → Connection string (URI) 도 복사

값들은 메시지로 전달하지 마시고, .env.local 파일에 직접 붙여넣을 거예요.
일단 "프로젝트 생성됐어요" 만 알려주세요.
```

→ **Phase 진행 차단**: 사용자가 "완료" 알리기 전까지 다음 Task 진행 금지.

- [ ] **Step 2: `.env.example` 작성**

`/Users/jinkyu/younest/.env.example`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://...

# 카카오 OAuth (Phase 3에서 설정)
KAKAO_REST_API_KEY=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback

# 어드민 본인 카카오 ID
ADMIN_KAKAO_IDS=

# 세션
SESSION_SECRET=
```

- [ ] **Step 3: 사용자 본인의 `.env.local` 생성 안내**

`.env.example`을 `.env.local`로 복사하고 실제 값 채우는 방법 안내. `.env.local`은 절대 커밋되지 않음(.gitignore에 이미 포함).

- [ ] **Step 4: 커밋**

```bash
git add .env.example && \
git commit -m "chore: 환경변수 템플릿 (.env.example) 추가"
```

### Task 2.2: Supabase 클라이언트 코드 작성

- [ ] **Step 1: 의존성 설치**

```bash
cd /Users/jinkyu/younest && npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: `lib/supabase/client.ts` (브라우저용)**

```ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 3: `lib/supabase/server.ts` (RSC/Route Handler용)**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 호출 시 무시 (middleware에서 처리)
          }
        },
      },
    },
  );
}
```

- [ ] **Step 4: `lib/supabase/middleware.ts` (미들웨어용 헬퍼)**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
```

- [ ] **Step 5: `lib/database.types.ts` 빈 파일 (자동 생성될 자리)**

```ts
// 이 파일은 `npm run supabase:types`로 자동 생성됩니다.
// 직접 수정하지 마세요.
export type Database = unknown;
```

- [ ] **Step 6: 커밋**

```bash
git add lib/supabase/ lib/database.types.ts && \
git commit -m "feat: Supabase 클라이언트 (브라우저/서버/미들웨어) 추가"
```

### Task 2.3: 마이그레이션 작성 — 초기 스키마

> **⚠️ Danger Zone**: `supabase/migrations/` 작업. 작성 전 사용자에게 "마이그레이션 작성 시작합니다" 확인 받기.

- [ ] **Step 1: Supabase CLI 설치 (마이그레이션 파일 관리용)**

```bash
brew install supabase/tap/supabase
# 또는
npm install -D supabase
```
> 결정사항 #3: **로컬 Docker 스택은 사용하지 않음.** CLI는 마이그레이션 파일 작성/푸시 + 타입 생성용으로만 사용.

- [ ] **Step 2: Supabase 프로젝트 링크 (원격만)**

```bash
cd /Users/jinkyu/younest && supabase init
supabase link --project-ref <사용자가 알려준 project ref>
```
사용자에게 "Project ref는 Supabase 대시보드 URL의 `https://supabase.com/dashboard/project/XXXX`에서 XXXX 부분" 안내.

⚠️ `supabase start` (로컬 Docker 스택) 실행 금지. 모든 DB 변경은 원격 프로젝트에 직접 반영.

- [ ] **Step 3: `supabase/migrations/00001_initial_schema.sql` 작성**

PRD §9 데이터 모델 기반. 다음 테이블 모두 포함:
- `users` (id, kakao_id, nickname, status, is_admin, e2e_salt, wrapped_dek, wrapped_dek_recovery, created_at)
- `pages` (id, user_id, parent_page_id, type, title, title_encrypted, icon, cover_url, is_private, is_favorite, position, deleted_at, created_at, updated_at)
- `blocks` (id, page_id, parent_block_id, type, content, content_encrypted, position, created_at, updated_at)
- `db_properties` (id, page_id, name, type, options, position)
- `db_views` (id, page_id, name, type, config, position, is_default)
- `db_rows` (id, page_id, row_page_id, property_values, property_values_encrypted, position, created_at, updated_at)
- `images` (id, user_id, page_id, storage_path, encrypted, size_bytes, created_at)
- `audit_logs` (id, actor_id, action, target_table, target_id, created_at)

CHECK 제약, FK 제약, `updated_at` 자동 갱신 트리거 포함. 정확한 DDL은 PRD §9의 sql 블록 그대로 + 누락된 필드 추가.

전체 SQL을 파일에 작성. (길어서 여기에는 요약만 표기 — 작성 시 PRD §9 코드 블록을 그대로 옮기고 누락분 추가)

- [ ] **Step 4: `supabase/migrations/00002_rls_policies.sql` 작성**

각 테이블에 RLS 활성화 + 정책. 기본 원칙:
- `users`: 본인만 SELECT/UPDATE (단, kakao_id로 신규 INSERT는 service_role)
- `pages`, `blocks`, `db_properties`, `db_views`, `db_rows`, `images`: `auth.uid() = user_id` (또는 `pages.user_id` 통한 간접 확인)
- `audit_logs`: 본인만 SELECT, INSERT는 어드민/시스템만
- **어드민은 콘텐츠 테이블 SELECT 차단** (PRD §8.5)

예시 정책:
```sql
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages_select_own" ON pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "pages_insert_own" ON pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pages_update_own" ON pages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "pages_delete_own" ON pages
  FOR DELETE USING (auth.uid() = user_id);
```
모든 테이블에 4종 정책 작성. blocks/db_*는 `EXISTS (SELECT 1 FROM pages WHERE pages.id = page_id AND pages.user_id = auth.uid())` 형태.

- [ ] **Step 5: `supabase/migrations/00003_indexes.sql` 작성**

```sql
CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_parent ON pages(parent_page_id);
CREATE INDEX idx_pages_user_deleted ON pages(user_id, deleted_at);
CREATE INDEX idx_blocks_page_id ON blocks(page_id);
CREATE INDEX idx_blocks_position ON blocks(page_id, position);
CREATE INDEX idx_db_rows_page ON db_rows(page_id);
CREATE INDEX idx_db_views_page ON db_views(page_id);
CREATE INDEX idx_db_properties_page ON db_properties(page_id);
CREATE INDEX idx_images_user ON images(user_id);
-- 전문 검색 (공개 페이지만)
CREATE INDEX idx_pages_title_search ON pages USING gin(to_tsvector('simple', title))
  WHERE is_private = false AND deleted_at IS NULL;
```

- [ ] **Step 6: 마이그레이션 적용 — 사용자 확인 필수**

```
Danger Zone 확인: 다음 마이그레이션 3개를 Supabase 프로젝트에 적용합니다.
- 00001_initial_schema.sql (8개 테이블 생성)
- 00002_rls_policies.sql (모든 테이블 RLS 활성화)
- 00003_indexes.sql (성능 인덱스)

방법 2가지 중 택1:
A) `supabase db push` (로컬 CLI에서 직접 푸시 — 권장)
B) Supabase 대시보드 → SQL Editor에서 각 파일 내용 붙여넣기

진행해도 될까요?
```

승인 후:
```bash
cd /Users/jinkyu/younest && supabase db push
```

- [ ] **Step 7: 마이그레이션 적용 검증**

Supabase 대시보드 → Table Editor에서 8개 테이블 모두 존재 확인. Authentication → Policies에서 RLS 정책 다수 확인.

또는 MCP로:
```
mcp__supabase__list_tables 호출 → 8개 테이블 응답 확인
mcp__supabase__get_advisors 호출 → 보안 권고 확인
```

- [ ] **Step 8: 커밋**

```bash
git add supabase/ && \
git commit -m "feat: 초기 스키마 + RLS 정책 + 인덱스 마이그레이션 추가"
```

### Task 2.4: TypeScript 타입 자동 생성

- [ ] **Step 1: `package.json`에 스크립트 추가**

```json
{
  "scripts": {
    "supabase:types": "supabase gen types typescript --linked > lib/database.types.ts",
    "supabase:migrate": "supabase db push"
  }
}
```

- [ ] **Step 2: 타입 생성 실행**

```bash
cd /Users/jinkyu/younest && npm run supabase:types
```
Expected: `lib/database.types.ts`에 모든 테이블 타입 자동 작성.

- [ ] **Step 3: typecheck 통과 확인**

```bash
npm run typecheck
```
Expected: 에러 0건. `Database` 타입이 `client.ts`/`server.ts`에서 정상 추론.

- [ ] **Step 4: 커밋**

```bash
git add lib/database.types.ts package.json && \
git commit -m "chore: Supabase TypeScript 타입 자동 생성 스크립트 추가"
```

### Phase 2 완료 보고 항목

- [ ] Supabase 프로젝트 생성 완료 (사용자가 확인)
- [ ] 8개 테이블 + RLS 정책 + 인덱스 적용 완료
- [ ] `lib/database.types.ts` 자동 생성됨
- [ ] `npm run typecheck` 통과
- [ ] `mcp__supabase__get_advisors` 결과에 보안 경고 없음

---

## Phase 3: 인증 가드 골격 (M1 준비)

> **목표**: middleware.ts에서 라우트 그룹별 가드 + 사용자 상태별 리다이렉트. 카카오 OAuth는 인터페이스만 정의 (실제 콜백은 M1).
>
> **⚠️ Danger Zone**: `middleware.ts`, `src/lib/auth/` 작업. 사전 사용자 확인 필수.

**Files**:
- Create: `middleware.ts` (프로젝트 루트)
- Create: `lib/auth/session.ts` (세션 헬퍼)
- Create: `lib/auth/kakao.ts` (카카오 OAuth 인터페이스 — M1에서 구현)
- Create: `lib/auth/types.ts` (UserStatus 등 enum)
- Create: `app/api/auth/kakao/callback/route.ts` (placeholder, M1에서 구현)
- Create: `app/api/auth/logout/route.ts` (placeholder)

### Task 3.1: 사용자 상태/세션 타입 정의

- [ ] **Step 1: `lib/auth/types.ts` 작성**

```ts
export type UserStatus = "pending" | "approved" | "rejected" | "banned";

export type SessionUser = {
  id: string;
  kakaoId: string;
  nickname: string;
  status: UserStatus;
  isAdmin: boolean;
};
```

- [ ] **Step 2: `lib/auth/session.ts` 작성**

```ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SessionUser } from "./types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, kakao_id, nickname, status, is_admin")
    .eq("id", authUser.id)
    .single();

  if (error || !profile) return null;

  return {
    id: profile.id,
    kakaoId: profile.kakao_id,
    nickname: profile.nickname ?? "",
    status: profile.status as SessionUser["status"],
    isAdmin: profile.is_admin,
  };
}
```

- [ ] **Step 3: `lib/auth/kakao.ts` 인터페이스 정의 (스텁)**

```ts
// M1에서 구현 예정. 현재는 인터페이스만 정의.

export type KakaoTokens = {
  access_token: string;
  refresh_token: string;
};

export type KakaoProfile = {
  id: string;
  nickname: string;
};

export async function exchangeCodeForTokens(_code: string): Promise<KakaoTokens> {
  throw new Error("M1에서 구현 예정");
}

export async function fetchKakaoProfile(_accessToken: string): Promise<KakaoProfile> {
  throw new Error("M1에서 구현 예정");
}
```

- [ ] **Step 4: 커밋**

```bash
git add lib/auth/ && \
git commit -m "feat: 인증 타입/세션 헬퍼 + 카카오 OAuth 인터페이스 스텁"
```

### Task 3.2: middleware.ts 가드 작성

> **Danger Zone 사전 확인**: "middleware.ts 작성합니다. 4개 라우트 그룹별 가드 정책: marketing 자유, auth 미승인만, app approved만, admin is_admin만. 진행할까요?"

- [ ] **Step 1: `middleware.ts` 작성**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/api/auth/kakao/callback"];
const AUTH_PATHS = ["/signup", "/pending", "/rejected", "/recover"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // user.id로 우리 users 테이블 조회 — Phase 3 시점에는 service_role 클라이언트가 없으므로
  // RSC/Route Handler에서 처리. 미들웨어에서는 supabase auth user 존재만 체크.
  // 상세 상태별 리다이렉트는 (app)/layout.tsx, admin/layout.tsx의 RSC에서 처리.

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**주의**: 미들웨어에서 DB 조회는 Edge runtime 제약상 어려움. 상태별 리다이렉트는 RSC 레이아웃에서 처리.

- [ ] **Step 2: `app/(app)/layout.tsx` 가드 추가**

```tsx
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect("/");
  if (user.status === "pending") redirect("/pending");
  if (user.status === "rejected" || user.status === "banned") redirect("/rejected");
  // status === "approved" → 통과

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: `app/admin/layout.tsx` 가드 추가**

```tsx
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) redirect("/");

  return <div className="min-h-screen bg-background"><main className="p-6">{children}</main></div>;
}
```

- [ ] **Step 4: `app/(auth)/layout.tsx` 가드 — 이미 승인된 사용자는 대시보드로**

```tsx
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user?.status === "approved") redirect("/dashboard");

  return <div className="min-h-screen bg-background">{children}</div>;
}
```

- [ ] **Step 5: typecheck + lint 통과 확인**

```bash
npm run typecheck && npm run lint
```

- [ ] **Step 6: 커밋**

```bash
git add middleware.ts app/ && \
git commit -m "feat: middleware + 라우트 그룹별 가드 (RSC 레이아웃) 추가"
```

### Task 3.3: 카카오 OAuth Route Handler 스텁

- [ ] **Step 1: `app/api/auth/kakao/callback/route.ts` 작성**

```ts
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  // M1에서 구현 예정:
  // 1. code 파라미터 추출
  // 2. exchangeCodeForTokens(code)
  // 3. fetchKakaoProfile(token)
  // 4. users 테이블에서 kakao_id로 조회/생성
  // 5. Supabase Auth 세션 생성
  // 6. status별 리다이렉트
  return NextResponse.json(
    { error: "카카오 OAuth는 M1에서 구현 예정입니다." },
    { status: 501 },
  );
}
```

- [ ] **Step 2: `app/api/auth/logout/route.ts` 작성**

```ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
```

- [ ] **Step 3: 커밋**

```bash
git add app/api/ && \
git commit -m "feat: 카카오 OAuth callback + logout route handler 스텁"
```

### Phase 3 완료 보고 항목

- [ ] `middleware.ts` 동작 (모든 경로에서 401/리다이렉트 패턴 동작)
- [ ] 비로그인 상태로 `/dashboard` 접근 시 `/`로 리다이렉트
- [ ] `npm run typecheck` 통과
- [ ] M1 진입 시 채워야 할 코드 위치 명시 (`lib/auth/kakao.ts`, `app/api/auth/kakao/callback/route.ts`)

---

## Phase 4: BlockNote PoC (가장 중요)

> **목표**: PRD §7.3의 폴백 조건 4가지를 모두 통과시키거나, 실패 시 즉시 사용자에게 보고.
>
> **⚠️ Danger Zone**: `src/lib/crypto/` 신규 작성. 사전 사용자 확인 필수.
>
> **PoC 페이지는 영구 코드가 아닌 검증용**. M0 종료 후 정리하거나 `/poc` 경로에 별도 보관.

**Files**:
- Create: `lib/crypto/aes-gcm.ts` (encrypt/decrypt 헬퍼)
- Create: `lib/crypto/pbkdf2.ts` (PIN → MK 유도)
- Create: `lib/crypto/__tests__/` (단위 테스트, Vitest)
- Create: `lib/blocknote/custom-blocks/toggle.tsx`
- Create: `lib/blocknote/custom-blocks/callout.tsx`
- Create: `lib/blocknote/custom-blocks/page-link.tsx`
- Create: `lib/blocknote/schema.ts` (커스텀 블록 등록 스키마)
- Create: `app/poc/blocknote/page.tsx` (PoC 페이지)
- Create: `app/poc/blocknote/PocClient.tsx` (클라이언트 컴포넌트)
- Create: `app/poc/layout.tsx` (PoC 전용 레이아웃, 가드 없음)
- Modify: `package.json` (vitest 추가)

### Task 4.1: 테스트 환경 + 암호화 유틸 (TDD)

- [ ] **Step 1: Vitest 설치**

```bash
cd /Users/jinkyu/younest && \
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: `vitest.config.ts` 작성**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

`vitest.setup.ts`:
```ts
import "@testing-library/jest-dom";
```

`package.json` script 추가: `"test": "vitest"`, `"test:run": "vitest run"`

- [ ] **Step 3: 테스트 먼저 작성 (RED) — `lib/crypto/__tests__/aes-gcm.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { encryptString, decryptString, generateDek } from "@/lib/crypto/aes-gcm";

describe("aes-gcm", () => {
  it("encrypt → decrypt 라운드트립이 원본을 복원한다", async () => {
    const dek = await generateDek();
    const plaintext = "안녕하세요, younest!";
    const encrypted = await encryptString(plaintext, dek);
    const decrypted = await decryptString(encrypted, dek);
    expect(decrypted).toBe(plaintext);
  });

  it("BlockNote document JSON 라운드트립이 동작한다", async () => {
    const dek = await generateDek();
    const doc = [
      { id: "1", type: "paragraph", content: [{ type: "text", text: "테스트" }] },
      { id: "2", type: "heading", props: { level: 1 }, content: "헤더" },
    ];
    const json = JSON.stringify(doc);
    const encrypted = await encryptString(json, dek);
    const decrypted = await decryptString(encrypted, dek);
    expect(JSON.parse(decrypted)).toEqual(doc);
  });

  it("다른 DEK로는 복호화에 실패한다", async () => {
    const dek1 = await generateDek();
    const dek2 = await generateDek();
    const encrypted = await encryptString("secret", dek1);
    await expect(decryptString(encrypted, dek2)).rejects.toThrow();
  });
});
```

- [ ] **Step 4: 테스트 실행해서 실패 확인**

```bash
npm run test:run
```
Expected: FAIL — `aes-gcm.ts` 미존재.

- [ ] **Step 5: `lib/crypto/aes-gcm.ts` 구현 (GREEN)**

```ts
export async function generateDek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export type EncryptedPayload = {
  iv: Uint8Array;
  ciphertext: ArrayBuffer;
};

export async function encryptString(plaintext: string, key: CryptoKey): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  return { iv, ciphertext };
}

export async function decryptString(payload: EncryptedPayload, key: CryptoKey): Promise<string> {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: payload.iv },
    key,
    payload.ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}
```

- [ ] **Step 6: 테스트 실행해서 통과 확인**

```bash
npm run test:run
```
Expected: PASS (3건).

- [ ] **Step 7: `lib/crypto/pbkdf2.ts` 작성 (PRD §8.8 코드 그대로)**

```ts
export async function deriveMasterKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 600_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}
```

- [ ] **Step 8: PBKDF2 테스트 추가** — `lib/crypto/__tests__/pbkdf2.test.ts`

같은 PIN+salt로 같은 키 유도되는지, 다른 salt면 다른 키 유도되는지, PIN으로 wrap한 DEK가 다시 풀리는지 테스트.

- [ ] **Step 9: 테스트 모두 통과 확인 + 커밋**

```bash
npm run test:run && \
git add lib/crypto/ vitest.config.ts vitest.setup.ts package.json && \
git commit -m "feat: AES-GCM + PBKDF2 암호화 유틸 (테스트 포함)"
```

### Task 4.2: BlockNote 의존성 설치 + 호환성 확인

- [ ] **Step 1: BlockNote 최신 버전 확인**

`docs-lookup` 또는 npm으로 BlockNote v0.x 현재 안정 버전 + React 19 호환성 확인.
- `@blocknote/core`
- `@blocknote/react`
- `@blocknote/mantine` (UI 테마)

React 19 호환성 이슈 있으면 **즉시 사용자에게 보고**. PoC 자체가 막힐 수 있음.

- [ ] **Step 2: 설치**

```bash
cd /Users/jinkyu/younest && \
npm install @blocknote/core @blocknote/react @blocknote/mantine
```

- [ ] **Step 3: 기본 BlockNote 렌더 확인용 임시 페이지 (개발 환경 한정)**

> 결정사항 #4: **PoC 페이지는 production 빌드에서 자동 제외.**

`app/poc/layout.tsx`:
```tsx
import { notFound } from "next/navigation";

export default function PocLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <main className="min-h-screen bg-background p-6">{children}</main>;
}
```

`process.env.NODE_ENV`는 Next.js가 빌드 시점에 inline해서, production 빌드 시 PoC 페이지 진입 시 404를 반환.

`app/poc/blocknote/page.tsx`:
```tsx
import dynamic from "next/dynamic";

const PocClient = dynamic(() => import("./PocClient"), { ssr: false });

export default function PocPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-h1 font-semibold">BlockNote PoC</h1>
      <p className="mt-2 text-text-secondary">M0 검증 페이지 — 정식 출시 전 제거</p>
      <div className="mt-6 rounded-md border border-border bg-surface p-4">
        <PocClient />
      </div>
    </div>
  );
}
```

`app/poc/blocknote/PocClient.tsx` (기본 BlockNote만):
```tsx
"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export default function PocClient() {
  const editor = useCreateBlockNote();
  return <BlockNoteView editor={editor} />;
}
```

- [ ] **Step 4: dev 서버에서 `/poc/blocknote` 접근 확인**

```bash
npm run dev
```
브라우저로 `http://localhost:3000/poc/blocknote` 접속. 기본 에디터가 뜨고 입력 가능하면 성공.

- [ ] **Step 5: 커밋**

```bash
git add app/poc/ package.json && \
git commit -m "feat: BlockNote PoC 기본 에디터 페이지 추가"
```

### Task 4.3: 커스텀 블록 3종 구현

- [ ] **Step 1: BlockNote 커스텀 블록 API 문서 확인**

`docs-lookup`으로 BlockNote `createReactBlockSpec` API + 커스텀 블록 작성법 확인. 슬래시 메뉴 통합, `props`, `content` 구조 파악.

- [ ] **Step 2: 토글 블록 — `lib/blocknote/custom-blocks/toggle.tsx`**

토글 가능한 블록 (열림/닫힘 상태 + 자식 컨텐츠). 구현 패턴은 BlockNote 공식 예제 참고.

- [ ] **Step 3: 콜아웃 블록 — `lib/blocknote/custom-blocks/callout.tsx`**

이모지 + 컬러 배경 + 텍스트. props: `emoji`, `variant` (info/warning/success).

- [ ] **Step 4: 페이지 링크 블록 — `lib/blocknote/custom-blocks/page-link.tsx`**

PRD §5.4의 "페이지 링크" 블록. props: `pageId`. 클릭 시 `/p/[pageId]`로 라우팅 (Next/Link 사용).

- [ ] **Step 5: `lib/blocknote/schema.ts`로 등록**

```ts
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { ToggleBlock } from "./custom-blocks/toggle";
import { CalloutBlock } from "./custom-blocks/callout";
import { PageLinkBlock } from "./custom-blocks/page-link";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    toggle: ToggleBlock,
    callout: CalloutBlock,
    pageLink: PageLinkBlock,
  },
});

export type YounestEditor = typeof schema.BlockNoteEditor;
```

- [ ] **Step 6: PoC 클라이언트에 스키마 + 슬래시 커맨드 통합**

`PocClient.tsx` 수정해서 커스텀 슬래시 메뉴 항목 3개 추가 (`/toggle`, `/callout`, `/page`).

- [ ] **Step 7: 브라우저에서 슬래시 메뉴로 3종 모두 삽입 가능한지 수동 검증**

각각 입력해서 화면에 정상 렌더되는지 + 저장(`editor.document` 확인) 가능한지 체크.

**실패 조건 (즉시 사용자 보고)**:
- 토글 자식 컨텐츠 관리 불가
- 콜아웃 props 변경 시 렌더 깨짐
- 페이지 링크 라우팅 미동작

- [ ] **Step 8: 커밋**

```bash
git add lib/blocknote/ app/poc/ && \
git commit -m "feat: BlockNote 커스텀 블록 3종 (토글/콜아웃/페이지 링크) PoC"
```

### Task 4.4: 한글 IME 안정성 수동 검증

- [ ] **Step 1: 검증 시나리오**

PoC 페이지에서 다음을 수동 테스트 (사용자가 직접 또는 자동화):
1. 한글 단어 입력 중 백스페이스 — selection이 정확한 위치 유지되는가?
2. 한글 입력 중 슬래시 메뉴 트리거 — 입력이 끊기지 않는가?
3. 한글 입력 도중 블록 타입 변환 (예: 헤딩으로) — 글자 깨짐 없는가?
4. 빠른 한글 타이핑 (1초당 5-10자) — 누락/순서 뒤바뀜 없는가?
5. 한자 변환(macOS 한자 키) 동작 시 selection 안정성

- [ ] **Step 2: 발견된 버그 기록**

`docs/m0-poc-results.md` 파일에 다음 형식으로 기록:
```md
# BlockNote PoC 결과 — 2026-MM-DD

## 커스텀 블록 3종
- [ ] 토글: 동작 / 이슈 ___
- [ ] 콜아웃: 동작 / 이슈 ___
- [ ] 페이지 링크: 동작 / 이슈 ___

## 한글 IME
- [ ] 시나리오 1: PASS / FAIL — ___
- [ ] 시나리오 2: PASS / FAIL — ___
...

## 결론
- ✅ BlockNote 확정
- ❌ Tiptap 폴백 결정 필요 (사유: ___)
```

- [ ] **Step 3: 치명적 버그 발생 시 즉시 사용자에게 보고하고 진행 중단**

```
🚨 BlockNote PoC 실패: [구체적 사유]

PRD §7.3 폴백 조건에 해당합니다. Tiptap으로 전환할지 결정해주세요.
- A) Tiptap 폴백 (M0 일정 +1주 예상)
- B) BlockNote 우회책 시도 (사유: ___)
- C) 다른 방향 (논의)
```

- [ ] **Step 4: PoC 결과 커밋**

```bash
git add docs/m0-poc-results.md && \
git commit -m "docs: BlockNote PoC 검증 결과 기록"
```

### Task 4.5: 암호화 라운드트립 통합 검증 (PoC 핵심)

- [ ] **Step 1: PoC 페이지에 암호화/복호화 버튼 추가**

`PocClient.tsx` 확장:
```tsx
"use client";

import { useState, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { schema } from "@/lib/blocknote/schema";
import { generateDek, encryptString, decryptString, type EncryptedPayload } from "@/lib/crypto/aes-gcm";
import { deriveMasterKey, generateSalt } from "@/lib/crypto/pbkdf2";
import "@blocknote/mantine/style.css";

export default function PocClient() {
  const editor = useCreateBlockNote({ schema });
  const dekRef = useRef<CryptoKey | null>(null);
  const [encrypted, setEncrypted] = useState<EncryptedPayload | null>(null);
  const [status, setStatus] = useState("");

  async function ensureDek() {
    if (!dekRef.current) {
      const pin = "test-pin-1234";
      const salt = generateSalt();
      const mk = await deriveMasterKey(pin, salt);
      const dek = await generateDek();
      // 실전에서는 MK로 DEK를 wrap하지만, PoC는 직접 DEK 사용으로 단축
      dekRef.current = dek;
      // MK는 결과 검증용으로만 — 라운드트립이 동작하는지만 보면 됨
      void mk;
    }
    return dekRef.current;
  }

  async function handleEncrypt() {
    const dek = await ensureDek();
    const doc = editor.document;
    const json = JSON.stringify(doc);
    const payload = await encryptString(json, dek);
    setEncrypted(payload);
    setStatus(`암호화 완료. 블록 수: ${doc.length}, ciphertext: ${payload.ciphertext.byteLength} bytes`);
  }

  async function handleDecrypt() {
    if (!encrypted || !dekRef.current) return;
    const json = await decryptString(encrypted, dekRef.current);
    const doc = JSON.parse(json);
    editor.replaceBlocks(editor.document, doc);
    setStatus(`복호화 완료. 블록 ${doc.length}개 복원`);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={handleEncrypt} className="rounded-md bg-primary px-4 py-2 text-white">
          1. 암호화 (editor.document → ciphertext)
        </button>
        <button onClick={() => editor.replaceBlocks(editor.document, [])} className="rounded-md border border-border px-4 py-2">
          2. 에디터 비우기
        </button>
        <button onClick={handleDecrypt} disabled={!encrypted} className="rounded-md bg-private px-4 py-2 text-white disabled:opacity-50">
          3. 복호화 (replaceBlocks)
        </button>
      </div>
      <p className="text-caption text-text-secondary">{status}</p>
      <BlockNoteView editor={editor} />
    </div>
  );
}
```

- [ ] **Step 2: 브라우저 수동 검증**

1. 에디터에 텍스트 + 커스텀 블록 3종 모두 추가
2. "암호화" 클릭 → status에 블록 수/바이트 표시
3. "에디터 비우기" 클릭 → 빈 에디터
4. "복호화" 클릭 → **원본과 동일하게 복원되는지** 확인

**합격 기준**: 텍스트 내용, 블록 순서, 커스텀 블록 props 모두 동일.

- [ ] **Step 3: 라운드트립 자동화 테스트 추가**

`lib/blocknote/__tests__/roundtrip.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { encryptString, decryptString, generateDek } from "@/lib/crypto/aes-gcm";

describe("BlockNote document 라운드트립", () => {
  it("모든 블록 타입 JSON 직렬화 → 암호화 → 복호화 → 동일", async () => {
    const dek = await generateDek();
    const doc = [
      { id: "1", type: "paragraph", props: {}, content: [{ type: "text", text: "안녕" }] },
      { id: "2", type: "heading", props: { level: 1 }, content: "헤더" },
      { id: "3", type: "toggle", props: { open: true }, content: "토글", children: [] },
      { id: "4", type: "callout", props: { emoji: "💡", variant: "info" }, content: "콜아웃" },
      { id: "5", type: "pageLink", props: { pageId: "abc-123" }, content: [] },
    ];
    const json = JSON.stringify(doc);
    const enc = await encryptString(json, dek);
    const dec = await decryptString(enc, dek);
    expect(JSON.parse(dec)).toEqual(doc);
  });
});
```

```bash
npm run test:run
```
Expected: PASS.

- [ ] **Step 4: PoC 결과 문서 업데이트**

`docs/m0-poc-results.md`의 "암호화 라운드트립" 섹션 채우기.

- [ ] **Step 5: 커밋**

```bash
git add app/poc/ lib/blocknote/__tests__/ docs/m0-poc-results.md && \
git commit -m "feat: BlockNote document AES-GCM 라운드트립 PoC 검증"
```

### Phase 4 완료 보고 항목

- [ ] 커스텀 블록 3종 모두 정상 동작
- [ ] 한글 IME 검증 시나리오 5개 결과 (모두 PASS / FAIL 명시)
- [ ] 암호화 라운드트립 수동 + 자동 테스트 모두 PASS
- [ ] `docs/m0-poc-results.md` 작성됨
- [ ] **최종 결론**: BlockNote 확정 OR Tiptap 폴백 결정 요청

---

## Phase 5: 기본 UI 골격

> **목표**: 사이드바, 페이지 헤더, 모바일 반응형, 로딩/에러 처리 골격. 디자인은 `design/stitch-exports/screens/` 참고.
>
> 실제 사이드바 컨텐츠(페이지 트리)는 M2에서 채움. Phase 5는 컴포넌트 골격만.

**Files**:
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/SidebarMobile.tsx`
- Create: `components/layout/PageHeader.tsx`
- Create: `components/layout/LoadingSpinner.tsx`
- Create: `app/(app)/loading.tsx`
- Modify: `app/(app)/layout.tsx` (사이드바 통합)
- Modify: `app/error.tsx` (에러 바운더리 다듬기)

### Task 5.1: Sidebar 컴포넌트 (데스크탑)

- [ ] **Step 1: 디자인 자산 확인**

`design/stitch-exports/screens/S-003_dashboard_desktop.png` 또는 `S-010` (PRD에 언급된 ID와 화면 파일명이 다름 — `S-003`이 dashboard) 참고.
`design/stitch-exports/html-css/S-003_dashboard_desktop.html` HTML 구조 참고.

- [ ] **Step 2: `components/layout/Sidebar.tsx` 작성**

```tsx
import Link from "next/link";

type SidebarProps = {
  userName: string;
};

export function Sidebar({ userName }: SidebarProps) {
  return (
    <aside className="hidden w-[240px] flex-shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="px-4 py-6">
        <Link href="/dashboard" className="text-h1 font-bold text-primary">
          younest
        </Link>
      </div>
      <div className="px-4">
        <button className="w-full rounded-md border border-border bg-surface px-3 py-2 text-left text-body text-text-secondary">
          검색... <span className="float-right text-caption">⌘K</span>
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {/* 페이지 트리는 M2에서 구현 */}
        <p className="px-2 text-caption text-text-tertiary">페이지 트리 (M2)</p>
      </nav>
      <div className="border-t border-border px-4 py-3">
        <p className="text-body text-text-primary">{userName}</p>
        <Link href="/settings" className="text-caption text-text-secondary hover:text-primary">
          설정
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: `components/layout/SidebarMobile.tsx` (햄버거 메뉴)**

shadcn `Sheet` 컴포넌트 활용:
```bash
npx shadcn@latest add sheet
```

`SidebarMobile.tsx`는 햄버거 버튼 → Sheet로 사이드바 내용 표시.

- [ ] **Step 4: `(app)/layout.tsx` 통합**

```tsx
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarMobile } from "@/components/layout/SidebarMobile";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  if (user.status === "pending") redirect("/pending");
  if (user.status === "rejected" || user.status === "banned") redirect("/rejected");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user.nickname} />
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border p-2 md:hidden">
          <SidebarMobile userName={user.nickname} />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: dev 서버 + 반응형 확인**

브라우저 데스크탑(>768px) + 모바일(375px) 너비에서 모두 확인.

- [ ] **Step 6: 커밋**

```bash
git add components/layout/ app/(app)/layout.tsx && \
git commit -m "feat: Sidebar + SidebarMobile 컴포넌트 + (app) 레이아웃 통합"
```

### Task 5.2: 페이지 헤더 + 로딩/에러

- [ ] **Step 1: `components/layout/PageHeader.tsx`**

```tsx
type PageHeaderProps = {
  icon?: string;
  title: string;
  isPrivate?: boolean;
  isFavorite?: boolean;
};

export function PageHeader({ icon, title, isPrivate, isFavorite }: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-surface px-6 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <span className="text-3xl">{icon}</span>}
          <h1 className="text-h1 font-semibold text-text-primary">{title}</h1>
          {isPrivate && (
            <span className="rounded-full bg-private/10 px-2 py-1 text-caption text-private">
              🔒 비공개
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {/* 자물쇠 토글, 즐겨찾기, 더보기 — M2/M5에서 구현 */}
          {isFavorite && <span>⭐</span>}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: `components/layout/LoadingSpinner.tsx`**

```tsx
export function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  );
}
```

- [ ] **Step 3: `app/(app)/loading.tsx`**

```tsx
import { LoadingSpinner } from "@/components/layout/LoadingSpinner";

export default function Loading() {
  return <LoadingSpinner />;
}
```

- [ ] **Step 4: `app/error.tsx` 다듬기**

```tsx
"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-h1 font-semibold">문제가 발생했어요</h1>
      <p className="text-text-secondary">잠시 후 다시 시도해주세요</p>
      {process.env.NODE_ENV === "development" && (
        <pre className="max-w-2xl overflow-auto rounded-md bg-sidebar p-4 text-caption">
          {error.message}
        </pre>
      )}
      <Button onClick={reset}>다시 시도</Button>
    </main>
  );
}
```

- [ ] **Step 5: 커밋**

```bash
git add components/layout/ app/ && \
git commit -m "feat: PageHeader + 로딩 스피너 + 에러 페이지 다듬기"
```

### Phase 5 완료 보고 항목

- [ ] 데스크탑(>768px)에서 사이드바 표시
- [ ] 모바일(<768px)에서 햄버거 메뉴 → Sheet 사이드바
- [ ] 페이지 헤더 컴포넌트 동작
- [ ] 로딩 상태 보임
- [ ] 에러 페이지 동작 (개발 모드 메시지 포함)
- [ ] `npm run typecheck && npm run lint` 통과

---

## Phase 6: 검증 & 정리

> **목표**: M0 완료. 첫 정식 커밋 가능한 상태로 만들고, README와 .env.example을 완성하고, 빌드까지 검증.

**Files**:
- Modify: `README.md` (실제 setup 가이드)
- Modify: `.env.example` (최종 확정)
- Create: `docs/m0-completion-report.md` (M0 완료 보고서)

### Task 6.1: README.md 작성

- [ ] **Step 1: 기존 README.md 백업 후 새로 작성**

`/Users/jinkyu/younest/README.md`:
```md
# younest

> 너만의 디지털 둥지. 노션의 핵심 기능을 무료·무제한으로, 민감한 노트는 본인만 볼 수 있게 암호화한 개인용 워크스페이스.

상세 기획: [`docs/younest_PRD.md`](./docs/younest_PRD.md)

## 기술 스택

- **프레임워크**: Next.js 15 (App Router) + React 19 + TypeScript strict
- **스타일**: Tailwind CSS + shadcn/ui
- **백엔드**: Supabase (PostgreSQL + Auth + Storage)
- **에디터**: BlockNote
- **데이터베이스 뷰**: TanStack Table + dnd-kit + FullCalendar (M4에서 추가)
- **암호화**: Web Crypto API (AES-GCM-256, PBKDF2 600k 회)

## 셋업

### 1. 사전 요구사항
- Node.js 20+ (LTS 권장)
- Supabase 계정 ([https://supabase.com](https://supabase.com))
- 카카오 디벨로퍼스 계정 (M1부터 필요)

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
```bash
cp .env.example .env.local
# .env.local 편집해서 실제 값 입력
```

필요한 키:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase 대시보드 → Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — 동일 위치 (⚠️ 클라이언트 노출 금지)

### 4. Supabase 마이그레이션 적용
```bash
supabase link --project-ref <your-project-ref>
supabase db push
npm run supabase:types
```

### 5. 개발 서버 실행
```bash
npm run dev
```
브라우저: `http://localhost:3000`

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (포트 3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드된 서버 실행 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run lint` | ESLint |
| `npm run test` | Vitest 워치 모드 |
| `npm run test:run` | Vitest 1회 실행 |
| `npm run supabase:types` | DB → TS 타입 자동 생성 |
| `npm run supabase:migrate` | 마이그레이션 푸시 |

## 디렉토리 구조

```
app/                       # Next.js App Router
├── (marketing)/           # 비로그인 화면 (S-001)
├── (auth)/                # 인증 흐름 (S-002~S-004, S-040)
├── (app)/                 # 승인된 사용자 (S-010~S-019)
├── admin/                 # 어드민 한정 (S-030~S-033)
├── api/                   # Route Handlers
└── poc/                   # M0 PoC 페이지 (개발 전용)
components/                # 재사용 컴포넌트
  ├── layout/              # 사이드바, 헤더
  └── ui/                  # shadcn/ui 컴포넌트
lib/
  ├── auth/                # 세션, 카카오 OAuth
  ├── blocknote/           # 커스텀 블록 + 스키마
  ├── crypto/              # AES-GCM, PBKDF2
  └── supabase/            # 클라이언트 3종
supabase/migrations/       # SQL 마이그레이션
docs/                      # PRD, PoC 결과 등
design/                    # 디자인 토큰, 시안
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

- E2E 암호화: PIN → PBKDF2(600,000회) → MK → AES-GCM-256(DEK)
- 비공개 콘텐츠는 클라이언트에서만 복호화
- Supabase RLS로 사용자별 데이터 격리
- 평문 PIN/MK/DEK는 절대 서버 전송 금지

상세: `docs/younest_PRD.md` §8

## 라이선스

(미정 — 1인 프로젝트)
```

- [ ] **Step 2: 커밋**

```bash
git add README.md && \
git commit -m "docs: README 업데이트 (M0 셋업 가이드)"
```

### Task 6.2: 전체 검증

- [ ] **Step 1: typecheck**

```bash
cd /Users/jinkyu/younest && npm run typecheck
```
Expected: 에러 0건.

- [ ] **Step 2: lint**

```bash
npm run lint
```
Expected: 에러 0건.

- [ ] **Step 3: test**

```bash
npm run test:run
```
Expected: 모든 테스트 PASS (암호화 라운드트립 포함).

- [ ] **Step 4: build**

```bash
npm run build
```
Expected: 빌드 성공. 빌드 출력에서 라우트 그룹 모두 생성된 것 확인.

- [ ] **Step 5: 프로덕션 빌드 실행 + PoC 차단 검증**

```bash
npm run start
```
`http://localhost:3000`에서 모든 placeholder 페이지 정상 동작 확인.
**추가 검증**: `/poc/blocknote` 접근 시 **404 반환**되는지 확인 (production에서 PoC 차단).

- [ ] **Step 6: 모든 검증 결과를 `docs/m0-completion-report.md`에 기록**

```md
# M0 완료 보고서 — 2026-MM-DD

## Phase 검증

| Phase | 결과 | 비고 |
|---|---|---|
| 1. 프로젝트 초기화 | ✅ | — |
| 2. Supabase + 데이터 모델 | ✅ | 8개 테이블 + RLS |
| 3. 인증 가드 골격 | ✅ | M1에서 카카오 OAuth 채울 위치 명시 |
| 4. BlockNote PoC | ✅ / ❌ | (결과 채우기) |
| 5. UI 골격 | ✅ | — |
| 6. 검증 & 정리 | ✅ | — |

## 자동 검증
- typecheck: PASS
- lint: PASS
- test (Vitest): N건 PASS
- build: PASS

## PoC 결과
(`docs/m0-poc-results.md` 참조)

## M1 진입 전 결정 필요 사항
- [ ] BlockNote 확정 vs Tiptap 폴백
- [ ] shadcn 색 시스템 vs 디자인 토큰 매핑 결정

## 다음 단계 (M1)
PRD §10 M1: 카카오 OAuth, 가입 신청 화면, 어드민 승인 콘솔, RLS 동작 검증.
```

- [ ] **Step 7: 최종 커밋**

```bash
git add docs/m0-completion-report.md && \
git commit -m "docs: M0 완료 보고서"
```

### Phase 6 완료 보고 항목

- [ ] `npm run typecheck`, `lint`, `test:run`, `build`, `start` 모두 통과
- [ ] README.md에 실제 setup 가이드 작성됨
- [ ] `.env.example` 모든 키 포함
- [ ] `docs/m0-completion-report.md` 작성됨
- [ ] git log에 Phase별 커밋이 깔끔하게 남아 있음
- [ ] **M1 진입 가능 / Tiptap 폴백 결정 필요 명확화**

---

## 확정된 결정 사항 (2026-05-12)

| # | 항목 | 결정 | 반영 위치 |
|---|---|---|---|
| 1 | Tailwind 버전 | **v3 (안정)** | Phase 1 Task 1.1, 1.2 |
| 2 | shadcn 색 시스템 | **shadcn CSS 변수를 디자인 토큰으로 덮어쓰기** | Phase 1 Task 1.5 Step 3 |
| 3 | Supabase 환경 | **원격 프로젝트만 사용 (로컬 Docker 스택 미사용)** | Phase 2 Task 2.3 Step 2 |
| 4 | PoC 페이지 관리 | **개발 환경에서만 접근 (production 자동 제외)** | Phase 4 Task 4.2 Step 3 + Phase 6 |

## 미결정 사항 (M0 종료 시점에 다시 묻기)

- **카카오 디벨로퍼스 등록**: M1 시작 시 등록 권장 (M0에 미리 등록해도 무방하지만 필수 아님)
- **Sentry 도입**: M6/M7로 미루기 권장 (M0~M5는 dev 환경 콘솔 로그로 충분)

---

## 부록: 외부 서비스 등록 안내 모음

### Supabase (Phase 2)
1. https://supabase.com/dashboard 접속 → GitHub 로그인
2. "New project" → 정보 입력 → Region: **Northeast Asia (Seoul)**
3. Project Settings → API에서 URL, anon key, service_role key 복사
4. Project Settings → Database에서 connection string 복사

### 카카오 디벨로퍼스 (M1, 또는 M0 말미에 미리)
1. https://developers.kakao.com 접속 → 카카오 로그인
2. "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 정보 입력 → REST API 키 복사 (= `KAKAO_REST_API_KEY`)
4. "카카오 로그인" 메뉴 → 활성화 ON
5. "Redirect URI" 등록: `http://localhost:3000/api/auth/kakao/callback` (개발)
6. "동의항목" → 닉네임 필수, 프로필 이미지 선택
7. "보안" → Client Secret 발급 (옵션) → `KAKAO_CLIENT_SECRET`

### Vercel (M7, 배포 시)
- M0~M6에서는 불필요
- M7 시점에 https://vercel.com에서 GitHub 저장소 연결
