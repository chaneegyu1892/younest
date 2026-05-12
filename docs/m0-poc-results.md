# BlockNote PoC 결과 — 2026-05-12

> M0 마일스톤 PoC 검증 결과. PRD §7.3 폴백 조건 4가지에 대한 통과/실패 기록.

## 환경
- BlockNote: `@blocknote/core@0.50.0`, `@blocknote/react@0.50.0`, `@blocknote/mantine@0.50.0`
- 피어 디펜던시: `@mantine/core@9.2.0`, `@mantine/hooks@9.2.0`
- Next.js: 15.5.18 (App Router) + React 19.2.6
- Node: 22.18

## 1. 커스텀 블록 3종

| 블록 | 자동 검증 | 수동 검증 | 비고 |
|---|---|---|---|
| 토글 (`toggle`) | ✅ 스키마 등록 + JSON 라운드트립 | ⬜ 수동 확인 필요 | 슬래시 메뉴 alias: `toggle`, `ㅌㅎ`, `tg` |
| 콜아웃 (`callout`) | ✅ 스키마 등록 + JSON 라운드트립 | ⬜ 수동 확인 필요 | alias: `callout`, `ㅋㅇ`, `co` / variant: info/warning/success |
| 페이지 링크 (`pageLink`) | ✅ 스키마 등록 + JSON 라운드트립 | ⬜ 수동 확인 필요 | alias: `page`, `link`, `ㅍㅇㅈ` / Next/Link 사용 |

### 수동 검증 시나리오
브라우저에서 `http://localhost:3000/poc/blocknote` 접속 후 (`npm run dev` 필요):

- [ ] 슬래시(/) 메뉴에 "younest 커스텀" 그룹 3개 항목 표시
- [ ] 토글 삽입 → 헤더 텍스트 입력 가능 → ▶ 버튼 클릭 시 회전
- [ ] 콜아웃 삽입 → 이모지 + 컬러 배경 표시 → 내부 텍스트 입력
- [ ] 페이지 링크 삽입 → "📄 샘플 페이지 (demo-pag)" 형태로 표시 → 클릭 시 `/p/demo-page-12345678` 이동 (이 경로는 아직 404이지만 라우팅 자체는 동작해야 함)

**실패 발견 시**: 아래 "이슈 기록" 섹션에 구체 사유 + 스크린샷.

## 2. 한글 IME 수동 검증 (PRD §7.3 폴백 조건)

다음 시나리오를 사용자가 직접 테스트:

| # | 시나리오 | 결과 (PASS / FAIL) | 메모 |
|---|---|---|---|
| 1 | 한글 단어 입력 중 백스페이스 — selection 위치 정확 | ⬜ | |
| 2 | 한글 입력 중 슬래시 메뉴 트리거 — 입력 끊김 없음 | ⬜ | |
| 3 | 한글 입력 도중 블록 타입 변환 (헤딩 등) — 글자 깨짐 없음 | ⬜ | |
| 4 | 빠른 한글 타이핑 (1초당 5-10자) — 누락/순서 뒤바뀜 없음 | ⬜ | |
| 5 | 한자 변환 (macOS 한자 키 / Win 한자 키) — selection 안정 | ⬜ | |

## 3. 암호화 라운드트립 (PRD §7.3 폴백 조건)

### 자동 테스트 (Vitest)
- ✅ `lib/crypto/__tests__/aes-gcm.test.ts`: 4건 PASS
  - 기본 라운드트립, JSON 라운드트립, 다른 DEK 거부, IV 무작위성
- ✅ `lib/crypto/__tests__/pbkdf2.test.ts`: 4건 PASS
  - PIN+salt → 같은 키, 다른 salt → 다른 키, 잘못된 PIN 거부, salt 32byte 새로 생성
- ✅ `lib/blocknote/__tests__/roundtrip.test.ts`: 3건 PASS
  - 커스텀 블록 3종 포함 doc, 6000자 한글, 한자/이모지/특수문자

**총 11/11 PASS** (실행시간 ~1.2초, PBKDF2 600K iter 포함).

### 수동 검증 (브라우저)
- [ ] PoC 페이지에서 텍스트 + 커스텀 블록 3종 모두 추가
- [ ] "1. 암호화" 클릭 → status에 블록 수 + ciphertext 바이트 표시
- [ ] "2. 에디터 비우기" 클릭 → 평문 사라짐 (replaceBlocks 동작 확인)
- [ ] "3. 복호화" 클릭 → 원본 내용 + 순서 + props 모두 동일

## 4. 이슈 기록

```
(여기에 발견된 이슈를 적어주세요. 형식 예시:
- [블록명] 증상 — 재현 방법 — 심각도(BLOCKER/HIGH/MED/LOW)
)
```

## 5. 최종 결론

- [ ] ✅ **BlockNote 확정** — PRD §7.3 4가지 조건 모두 통과
- [ ] ❌ **Tiptap 폴백 결정 필요** — 사유: ____

## 6. M1 진입 전 결정 필요 사항

PRD §7.3 폴백 조건 외에 M1 진입 전에 확인해야 하는 항목:
- [ ] `app/poc/` 폴더는 production 빌드 시 자동 404 (확인됨: `app/poc/layout.tsx`에서 `NODE_ENV === "production"` 시 `notFound()`)
- [ ] `/poc` 경로는 middleware `PUBLIC_PATHS`에 들어있어 비로그인 접근 가능 (개발 한정)
- [ ] M1 진입 시 `lib/auth/kakao.ts` 두 함수 구현 + `/api/auth/kakao/callback` 6단계 흐름 구현
