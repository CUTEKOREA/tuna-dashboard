# Task 3 보고 — GMTS 메뉴·라우트·잠금 티저 연결

- 작업 시각: 2026-08-16 07:47 KST
- 작업 경로: `/private/tmp/tuna-gmts-impl.QIPOMn/worktree`
- 범위: 기존 실시간 운영 섹션의 GMTS 레지스트리와 앱 패널 연결
- 미수행: 커밋, push, 배포, 패키지 설치, `HANDOFF.md` 수정, 서브에이전트 생성

## TDD 근거

1. 생산 코드보다 먼저 `__tests__/dashboard-registry.test.ts`에 GMTS의 사이드바 인접 순서,
   잠금, 숫자 단축키 불변, 명령 팔레트, 사이트맵 제외, 패널 순서, 명시적 동적 import와
   full/heroOnly 매핑 계약을 추가했다.
2. 유효 RED:
   - 명령: `npx vitest run __tests__/dashboard-registry.test.ts`
   - 결과: exit 1, 1파일 28건 중 6건 실패·22건 통과
   - 원인: GMTS 설정이 `undefined`였고 사이드바·보호 메뉴·패널 순서에 `gmts`가 없었다.
3. 최소 생산 코드로 레지스트리 3곳과 앱의 동적 import·패널 2곳만 연결했다.
4. GREEN:
   - 명령: `npx vitest run __tests__/dashboard-registry.test.ts`
   - 결과: exit 0, 1파일 28/28 통과

## 구현 결과

- 기존 `operation` 섹션에 `방콕사무소 → GMTS 주간보고 → 메일` 순서를 적용했다.
- GMTS는 `Factory`, cyan accent, `requiresOperationAccess: true`를 사용하고
  `shortcutOrder`를 두지 않았다.
- 기존 `protectedMenuOrderOf(... ?? Number.MAX_SAFE_INTEGER)` 경로를 그대로 사용해
  보호 메뉴 순서는 `fleet, unloading, logistics, bangkok-office, gmts`가 됐다.
- GMTS를 명령 팔레트의 `실시간 운영`, 세션 접근 메뉴, 패널 순서에 한 번씩 연결했다.
- 공개 라우트·사이트맵·숫자 단축키에서는 제외했다. 기존 네 숫자 단축키는 바뀌지 않았다.
- `app/page.tsx`에 로컬 Next 16 문서 형식의 최상위 명시적 dynamic import와
  full 대시보드 및 `heroOnly` 티저 매핑을 각각 한 번 추가했다.
- 전용 `app/gmts/page.tsx`, rewrite, 별도 잠금, fetch 또는 JSON import는 추가하지 않았다.

## 최종 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npx vitest run __tests__/dashboard-registry.test.ts __tests__/gmts-dashboard-render.test.ts` | exit 0, 2파일 36/36 통과 |
| `npm run typecheck` | exit 0 |
| `npx eslint lib/dashboard-registry.ts app/page.tsx __tests__/dashboard-registry.test.ts` | exit 0, 오류 0건·기존 `Command` 미사용 경고 1건 |
| `git diff --check` | exit 0, 별도 fsmonitor IPC 경고 1줄 |
| `git diff --cached --check` | exit 0, 별도 fsmonitor IPC 경고 1줄 |

## 스테이징 대상

- `lib/dashboard-registry.ts`
- `app/page.tsx`
- `__tests__/dashboard-registry.test.ts`
- `.superpowers/sdd/2026-08-15-gmts-weekly-dashboard/task-3-report.md`

## 우려 사항

- 차단 사항은 없다.
- ESLint의 `Command` 미사용 경고와 Git fsmonitor IPC 경고는 이번 변경 전부터 있던
  작업트리 환경 상태이며 두 명령의 exit code는 0이다.
- 전체 `npm run verify`와 브라우저 QA는 Task 6 통합 범위로 남겼다.
