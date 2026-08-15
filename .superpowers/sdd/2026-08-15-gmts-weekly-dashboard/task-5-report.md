# Task 5 보고 — GMTS 대시보드 UI

- 작업 시각: 2026-08-16 07:29 KST
- 작업 경로: `/private/tmp/tuna-gmts-impl.QIPOMn/worktree`
- 범위: Task 5 UI와 부모 렌더 테스트만 구현
- 미수행: 커밋, push, 배포, 패키지 설치, `HANDOFF.md` 수정, 서브에이전트 생성

## TDD 근거

1. 계획의 `.test.tsx` 파일을 먼저 작성하고 지정 명령을 실행했으나, 현재 `vitest.config.ts`의 include가 `__tests__/**/*.test.ts`라서 `No test files found`로 끝났다. 이 실행은 유효한 RED로 계산하지 않았다.
2. 상위 작업자의 명시적 승인에 따라 테스트를 `__tests__/gmts-dashboard-render.test.ts`로 바꾸고 JSX 대신 `React.createElement`를 사용했다. `vitest.config.ts`는 수정하지 않았다.
3. 유효 RED:
   - 명령: `npx vitest run __tests__/gmts-dashboard-render.test.ts`
   - 결과: exit 1
   - 원인: `Cannot find module '../components/gmts/GmtsDashboard'`
4. 구현 직후 GREEN:
   - 명령: `npx vitest run __tests__/gmts-dashboard-render.test.ts`
   - 결과: 1파일, 7/7 테스트 통과, exit 0

## 리뷰 수정 — 가격 툴팁 영문 원문 비노출

- 가격 탭 정적 렌더에서 `No price`, `No offer`, `Around`, `Level`, `under`, `old contract` 비노출과 `가격 없음`, `제안 없음`, `약`, `수준`, `미만`, `기존 계약` 노출을 먼저 단언했다.
- Recharts 툴팁 content는 정적 렌더에 포함되지 않아 이 테스트만으로는 8/8 통과했다. 이 실행은 유효 RED로 계산하지 않았다.
- 두 rawText 렌더 바인딩만 겨냥한 소스 회귀 단언을 추가한 뒤 유효 RED를 확인했다.
  - 명령: `npx vitest run __tests__/gmts-dashboard-render.test.ts`
  - 결과: exit 1, 1실패·7통과
  - 원인: `<small>원문: {row.nonGspRawText/gspRawText}</small>` 일치 항목이 기대 0개가 아니라 2개
- 최소 수정으로 위 두 `<small>` 렌더만 제거했다. `buildGmtsPresentation()`의 rawText 보존과 데이터 출처 계보는 변경하지 않았다.
- 리뷰 GREEN:
  - 명령: `npx vitest run __tests__/gmts-dashboard-render.test.ts`
  - 결과: exit 0, 1파일 8/8 통과

## 구현 내용

- `getGmtsDashboard()`와 `buildGmtsPresentation()`을 모듈 범위에서 한 번만 호출하고, 새 fetch·JSON 직접 import·새 의존성을 만들지 않았다.
- `HeroZone variant="kpi"` 1개, 접근 가능한 `PillTabs` 5개, 활성 패널 단독 마운트, `heroOnly` 조기 반환을 구현했다.
- 상세 운영 탭에 `WidgetCard`를 정확히 6개 배치하고 모든 카드에 동적 `cardDesc`, `STATIC` telemetry, pillar, 단위, 기존 `view.insights` SIT/TAK, 메타데이터 기반 출처 범위를 전달했다.
- 공란 선언 건수와 관찰 행 수, 입항 총화물과 제너럴산토스 명시 배정, 가격 공란과 한정어, 반입량 수정 이력, Celebes 122%를 서로 합치거나 보정하지 않았다.
- 가격은 `원문 분모 미기재`, 제너럴산토스 월별 반입량은 `원문 단위 미기재`로 표시했다. `$/MT`와 개인 `Other` 자료는 렌더하지 않는다.
- 데이터 품질 패널에 30건 원문 보고일·파일명·페이지·해시 앞 12자리와 구조화된 품질 경고를 표시했다.
- 768px 이하 단일 위젯 열, 390px 안전 격자, 선박 표의 모바일 카드화, 원문 표의 가로 스크롤, 고대비 차트 툴팁, focus-visible, reduced-motion 처리를 추가했다.

## 최종 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npx vitest run __tests__/gmts-dashboard-render.test.ts __tests__/gmts-presentation.test.ts __tests__/gmts-dashboard-data.test.ts` | exit 0, 3파일 29/29 통과 |
| `python3 scripts/check_s_grade.py --strict gmts/GmtsDashboard.tsx` | exit 0, 영문 잔존 0, GS 위반 0, 가짜 LIVE 0 |
| `npm run typecheck` | exit 0 |
| `npx eslint components/gmts/GmtsDashboard.tsx __tests__/gmts-dashboard-render.test.ts` | exit 0, 출력 없음 |
| `git diff --check` | exit 0; 별도 fsmonitor IPC 경고 1줄 발생 |
| `git diff --cached --check` | exit 0; 별도 fsmonitor IPC 경고 1줄 발생 |

## 검증상 주의

- S-Grade 보고서는 `GmtsDashboard.tsx`의 상위 디렉터리 import(`../WidgetCard`)를 closure로 추적하지 못해 `TakeawayBox 누락 후보 1개`를 출력한다. strict exit는 0이다. 실제 6개 위젯은 모두 공유 `WidgetCard`의 `takeaway` prop을 사용하고, `WidgetCard`가 `TakeawayBox`를 전이 렌더한다.
- `git diff --check`의 fsmonitor IPC 메시지는 이 worktree가 참조하는 상위 저장소 fsmonitor 데몬 경고이며 명령 자체는 exit 0이다.
- 브라우저 시각 QA와 전체 `npm run verify`는 Task 6 통합 범위이므로 실행하지 않았다.

## 리뷰 수정 스테이징 대상

- `components/gmts/GmtsDashboard.tsx`
- `__tests__/gmts-dashboard-render.test.ts`
- `.superpowers/sdd/2026-08-15-gmts-weekly-dashboard/task-5-report.md`

기존 `components/gmts/GmtsDashboard.module.css`는 리뷰 수정에서 변경하거나 다시 스테이징하지 않았다.
