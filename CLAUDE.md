# CLAUDE.md — younest 프로젝트

> 이 파일은 Claude Code가 매 세션 시작 시 자동으로 읽습니다.
> 짧고 명확하게 유지하세요. 상세 내용은 다른 문서를 참조하도록 합니다.

---

## WHY — 프로젝트 목적

**younest**는 1인 개발자가 만드는 노션 라이트 버전 웹앱입니다. 타겟은 20-30대 여성, 핵심 가치는 무료·무제한·프라이버시. 일기·기도제목 같은 사적 콘텐츠를 본인만 볼 수 있도록 E2E 암호화를 제공합니다.

상세 기획: `@docs/PRD_v0.3.md`

---

## WHAT — 기술 스택 & 구조

**스택** (PRD §7 참조)
- Next.js 15 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage + RLS)
- BlockNote (블록 에디터, Tiptap 기반)
- TanStack Table + dnd-kit + FullCalendar (데이터베이스 뷰)
- 카카오 OAuth (단일 로그인)
- Vercel 호스팅, PWA

**라우팅 구조** (PRD §12.4 참조)
- `app/(marketing)/` — 비로그인
- `app/(auth)/` — 가입·승인대기·복구
- `app/(app)/` — 승인된 사용자 (사이드바 포함)
- `app/admin/` — 어드민 전용

**핵심 아키텍처 원칙** (PRD §7.4)
- 블록 에디터(BlockNote)와 데이터베이스 시스템(직접 구현)은 **완전히 분리된 시스템**
- 페이지 타입: `document` (BlockNote) | `database` (속성 + 다중 뷰)
- 같은 페이지 트리 안에 공존하지만 내부 구현은 별개

---

## HOW — 작업 방식

### 응답 언어
**항상 한국어로 응답하세요.** 코드 주석도 한국어 우선 (영어도 OK).

### 코드 스타일
- TypeScript strict 모드. `any` 사용 금지, 필요 시 명시적 주석으로 정당화.
- 함수 컴포넌트 + Hooks. 클래스 컴포넌트 금지.
- 서버 컴포넌트 우선 (RSC), 인터랙티브 부분만 `'use client'`.
- 파일명: 컴포넌트는 PascalCase, 유틸/훅은 camelCase.
- import 순서: 외부 라이브러리 → 절대 경로(`@/`) → 상대 경로.
- 한 컴포넌트 = 한 책임. 200줄 넘으면 분리 검토.

### 디자인 시스템
- 디자인 토큰: `@design/design-tokens.json`
- 토큰 변경 시 `tailwind.config.ts`에도 반영.
- 화면 디자인 참고: `@design/stitch-exports/screens/`
- 화면 ID(S-001 등)는 PRD §12와 1:1 매핑.

### 검증 워크플로우
변경 후 항상 아래 실행:
```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # 해당 부분만, 전체 X
```
빌드 검증은 큰 변경 후에만:
```bash
npm run build
```

### 커밋 메시지
Conventional Commits 형식 (한국어 OK):
```
feat: 카카오 OAuth 콜백 라우트 추가
fix: 비공개 페이지 복호화 실패 시 폴백 처리
docs: PRD v0.3 데이터베이스 섹션 수정
refactor: BlockNote 커스텀 블록 분리
```

---

## 🚨 Danger Zones — 절대 함부로 건드리지 않을 영역

| 경로 | 규칙 |
|---|---|
| `src/lib/crypto/` | 암호화 로직 (Web Crypto API). 변경 시 반드시 사용자 확인 + 단위 테스트 통과 |
| `src/lib/auth/` | 카카오 OAuth, 세션 관리. 변경 시 반드시 사용자 확인 |
| `supabase/migrations/` | DB 마이그레이션. 새 파일만 추가, 기존 파일 수정 금지 |
| `src/middleware.ts` | 라우트 가드. 변경 시 반드시 사용자 확인 |
| `.env*` | 환경변수 파일. 절대 커밋하지 말 것 (`.env.example`만 OK) |
| RLS 정책 | Supabase Row Level Security. 변경 시 모든 영향받는 쿼리 검증 |

비공개 페이지 데이터(`pages.content_encrypted`, `db_rows.property_values_encrypted` 등)에 직접 접근하는 코드는 작성하지 말 것. 클라이언트 측 복호화만 허용.

---

## 보안 원칙

1. **E2E 암호화** (PRD §8 참조): PIN → MK → DEK 흐름. 평문 PIN/MK/DEK는 절대 서버 전송 금지.
2. **RLS 강제**: 모든 테이블에 RLS 정책 필수. `auth.uid()` 기반 격리.
3. **시크릿**: API 키, 시크릿은 환경변수만. 코드에 하드코딩 금지.
4. **PBKDF2 600,000회**: 변경하려면 사용자 확인.
5. **로그**: 사용자 콘텐츠는 절대 로그에 남기지 말 것. 메타데이터만.

---

## Progressive Disclosure — 필요할 때 읽을 문서

작업 내용에 따라 아래 문서를 **먼저 읽고** 시작하세요:

| 작업 | 참조 문서 |
|---|---|
| 전체 기획 이해 | `@docs/PRD_v0.3.md` |
| 데이터 모델 | `@docs/PRD_v0.3.md` §9 |
| 사용자 플로우 | `@docs/PRD_v0.3.md` §11 (Mermaid 다이어그램) |
| 화면 구조 | `@docs/PRD_v0.3.md` §12 + `@design/stitch-exports/` |
| 암호화 구현 | `@docs/PRD_v0.3.md` §8 |
| 데이터베이스 시스템 | `@docs/PRD_v0.3.md` §5.6 + §7.4 |
| BlockNote 폴백 조건 | `@docs/PRD_v0.3.md` §7.3 |
| 디자인 토큰 | `@design/design-tokens.json` |

긴 PRD를 매번 통째로 읽을 필요 없음. 작업 관련 섹션만 읽으세요.

---

## 단계별 개발 (M0 ~ M7)

상세 마일스톤은 PRD §10 참조. 각 단계 끝나면 사용자 검토 후 다음 단계.

- **M0** 셋업 & PoC ← 현재 위치
- M1 인증 & 어드민
- M2 에디터 핵심
- M3 대시보드 & 이미지
- M4 데이터베이스 시스템
- M5 E2E 암호화
- M6 PWA & 모바일 다듬기
- M7 베타 출시

**M0에서 PoC 통과 조건** (PRD §7.3):
- BlockNote 커스텀 블록 3종 (토글/콜아웃/페이지 링크) 동작
- `editor.document` JSON ↔ AES-GCM 암호화 라운드트립 성공
- 한글 IME 입력 안정성 확인

PoC 실패 시 Tiptap 폴백 필요. 사용자에게 즉시 알리고 결정 받기.

---

## 소통 스타일

- 결론 먼저, 근거는 짧게.
- 큰 변경 전에는 계획부터 보여주고 확인 받기.
- 추측이 아니라 검증된 정보로 답하기. 모르면 모른다고 말하기.
- 외부 라이브러리 사용 시 최신 버전 호환성 확인 (특히 BlockNote, Next.js 15는 빠르게 변함).
- 라이브러리 API 변경 가능성 있으면 검색 후 진행.

---

## 금지 사항

- 사용자 콘텐츠를 평문으로 로깅하지 말 것
- 비공개 페이지 데이터에 어드민 권한으로 접근하는 코드 작성 금지
- PRD에 명시되지 않은 기능 임의 추가 금지 (먼저 확인)
- 노션 UI의 시각 디자인(아이콘, 컬러, 폰트)을 그대로 카피하지 말 것 (인터랙션 패턴만 차용)
- AI 기능, 협업 기능 등 v2 범위는 MVP에 넣지 말 것
- `.env.local` 등 시크릿 파일 git에 추가 금지
- 큰 의존성(`>5MB`) 추가 전 사용자 확인

---

## 외부 서비스 등록 순서 (필요 시 안내)

1. **Supabase**: 프로젝트 생성 → URL/Keys 받기 → `.env.local`
2. **카카오 디벨로퍼스**: 앱 등록 → REST API 키 → Redirect URI 설정 → `.env.local`
3. **Vercel**: M5 이후 배포 시점에

각 단계에서 막히면 사용자에게 명확한 안내 메시지로 도움 요청.
