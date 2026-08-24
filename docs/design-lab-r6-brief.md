# 디자인 랩 6라운드 시안 브리프 — 지휘형 히어로 번안 (선단·하역)

## 배경

시장 동향에서 채택·검증된 «지휘형» 문법(components/HeroMarketCommand.tsx — 엔티티 카드
클릭 → 상단 대형 KPI·추이 전환, 카드 hover 리프트, 카드별 미니 스파크, 주식 증감색 토큰)을
두 운영 페이지에 번안한다. **시안 단계 — 실페이지·기존 히어로·가드 테스트는 건드리지 않는다.**

## 공통 계약 (r3·r5 승계)

1. 파일 1개 = 시안 1개. `components/design-lab/r6/<이름>.tsx`, default export.
2. **실데이터 의무·창작 금지.** 구조·스타일 idiom은 HeroMarketCommand를 따른다
   (dsc-card, 대형 숫자 900+tabular-nums, muted 라벨, 카드 리프트 translateY(-2px),
   recharts 고정 width + isAnimationActive={false}, 다크 툴팁 #303c46).
3. 증감·상태색: 증감이면 `var(--delta-up/down/flat)`. 상태(하역중/대기/완료)는 증감이
   아니므로 증감색 금지 — muted/액센트로.
4. 한글 100%, 단위 괄호, **기준일 표기 의무**. TypeScript strict.

## 시안 1 — FleetHeroCommand.tsx (선단 운영 번안)

- 소스: `import { purseSeineCatch } from '../../../lib/fleet-operations-2026-08-23'` 단독.
  (히어로의 공개 집계 소스와 기준일·선박명 표기가 달라 섞으면 부정직 — 이 시안은
  «선망선 어획 지휘» 단일 관점으로 감.)
- 카드축: `purseSeineCatch.monthlyByVessel` 10척 — 라벨=선박 코드, 값=`totalMt`(연간 누계),
  미니 스파크=`monthlyMt` 8개(1~8월). 증감 대신 «당월 vs 전월» ▲▼ (delta 토큰 정당).
- 상단: 선택 선박 대형 KPI=연간 누계(MT), 보조=당월(8월)·시즌 일평균(`seasonRanking`에서
  같은 선박 조인 — 코드 일치로만, 못 찾으면 «—»). 추이 차트=8개월 월별 막대 또는 라인
  (x축 1월~8월), hover 툴팁(월·MT).
- 기준일: `purseSeineCatch.period.from~to` — «주간 랭킹 기준 YYYY.MM.DD~MM.DD» 표기.

## 시안 2 — UnloadingHeroCommand.tsx (하역 현황 번안)

- 소스: `fetch('/api/unloading-db')` (갤러리도 게이트 뒤 — 시장 시안과 같은 패턴).
  응답 `vessels[]`: `id·name·status·reportedTotal·actualTotal·location·timeline[]`
  (timeline: `date·dailyAmount·cumAmount`). 실패 시 «데이터 수신 실패» 정직 표기.
- 카드축: 전 선박(9척 안팎) — 라벨=선박명(M/V 프리픽스 유지)+상태 배지(하역중=액센트,
  대기·완료=muted), 값=실적 MT+진행률%(actualTotal/reportedTotal), 미니 스파크=
  timeline dailyAmount 최근 8점 (2점 미만이면 스파크 생략).
- 상단: 선택 선박 대형 KPI=실적 누계(MT)+진행률%, 보조=일평균(dailyAmount 평균)·잔여
  (reportedTotal-actualTotal)·보고 횟수. 추이 차트=누적 하역량 라인(hover 툴팁: 날짜·누계·일일).
- 기준일: 선택 선박 timeline 마지막 date — «최신 보고 YYYY.MM.DD».
- 초기 선택: 하역중(status 진행) 선박 우선, 없으면 첫 척.

## 검수 기준

- 5초 가독, 카드 클릭 전환 동작, 실데이터·기준일, tsc 0 에러. 다른 파일 수정 금지.
