# BlockNote PoC 결과 — 2026-05-12

> M0 마일스톤 PoC 검증 결과. PRD §7.3 폴백 조건 4가지에 대한 통과/실패 기록.
>
> **최종 결론: ✅ BlockNote 확정.** Tiptap 폴백 불필요.

## 환경
- BlockNote: `@blocknote/core@0.50.0`, `@blocknote/react@0.50.0`, `@blocknote/mantine@0.50.0`
- 피어 디펜던시: `@mantine/core@8.3.18`, `@mantine/hooks@8.3.18`
  - ⚠️ Mantine 9는 React 19.2의 `useEffectEvent`를 직접 임포트 → Next.js 15.5 내장 React에 없어 런타임 에러. Mantine 8로 회피.
- Next.js: 15.5.18 (App Router) + React 19.2.6
- Node: 22.18

## 1. 커스텀 블록 3종

| 블록 | 자동 검증 | 수동 검증 | 비고 |
|---|---|---|---|
| 토글 (`toggle`) | ✅ 스키마 등록 + JSON 라운드트립 | ✅ PASS | alias: `toggle`, `ㅌㅎ`, `tg` |
| 콜아웃 (`callout`) | ✅ 스키마 등록 + JSON 라운드트립 | ✅ PASS | alias: `callout`, `ㅋㅇ`, `co` / variant: info/warning/success |
| 페이지 링크 (`pageLink`) | ✅ 스키마 등록 + JSON 라운드트립 | ✅ PASS | alias: `page`, `link`, `ㅍㅇㅈ` / Next/Link |

## 2. 한글 IME 수동 검증 (PRD §7.3 폴백 조건)

| # | 시나리오 | 결과 |
|---|---|---|
| 1 | 한글 단어 입력 중 백스페이스 — selection 위치 정확 | ✅ PASS |
| 2 | 한글 입력 중 슬래시 메뉴 트리거 — 입력 끊김 없음 | ✅ PASS |
| 3 | 한글 입력 도중 블록 타입 변환 — 글자 깨짐 없음 | ✅ PASS |
| 4 | 빠른 한글 타이핑 (1초당 5-10자) — 누락/순서 뒤바뀜 없음 | ✅ PASS |
| 5 | 한자 변환 — selection 안정 | ✅ PASS |

## 3. 암호화 라운드트립 (PRD §7.3 폴백 조건)

### 자동 테스트 (Vitest)
- ✅ `lib/crypto/__tests__/aes-gcm.test.ts`: 4건 PASS
- ✅ `lib/crypto/__tests__/pbkdf2.test.ts`: 4건 PASS
- ✅ `lib/blocknote/__tests__/roundtrip.test.ts`: 3건 PASS (커스텀 블록 + 6000자 한글 + 한자/이모지)

**총 11/11 PASS** (~1.2초, PBKDF2 600K iter 포함).

### 수동 검증 (브라우저)
- ✅ PoC 페이지에서 텍스트 + 커스텀 블록 3종 모두 추가
- ✅ "1. 암호화" → status에 블록 수 + ciphertext 바이트 표시
- ✅ "2. 에디터 비우기" → 평문 사라짐
- ✅ "3. 복호화" → 원본 내용 + 순서 + props 모두 동일

## 4. 발견된 이슈 / 해결

| 이슈 | 원인 | 해결 |
|---|---|---|
| `useEffectEvent is not a function` 런타임 에러 | Next.js 15.5는 자체 번들 React(`next/dist/compiled/react`)를 사용하고 이 번들에 `useEffectEvent` 없음. Mantine 9가 `'react'`에서 직접 import. | Mantine 9 → 8.3.18 다운그레이드 (BlockNote 0.50 peer dep `^8.3.11 \|\| ^9.0.2` 만족) |

## 5. 최종 결론

- ✅ **BlockNote 확정** — PRD §7.3 4가지 조건 모두 통과
- ❌ ~~Tiptap 폴백 결정 필요~~ (불필요)

## 6. M1 진입 전 확인 사항

- ✅ `app/poc/` 폴더는 production 빌드 시 자동 404 (`app/poc/layout.tsx`)
- ✅ `/poc` 경로는 middleware `PUBLIC_PATHS`에 들어있어 비로그인 접근 가능 (개발 한정)
- M1 진입 시 채울 코드:
  - `lib/auth/kakao.ts` 두 함수 구현
  - `app/api/auth/kakao/callback/route.ts` 6단계 흐름 구현
- Mantine은 8.x로 고정 (Mantine 9는 Next.js 16 업그레이드 후에만 가능)
