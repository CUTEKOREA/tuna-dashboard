# 디자인 랩 3라운드 시안 브리프 (에이전트 공용)

## 배경 판정 (입력)

- 2라운드 히어로 3종 전원 ★3: A 현행 KPI형(«한눈에 이해»), B 밀도형 스탯 스트립(«만족 — 단,
  가격 상승=빨강, 하락=파랑 주식 컨벤션 요청»), C 추세형 스파크라인(«직관적»).
- 3라운드 = 조합·개량 6종. 전 시안 공통으로 **주식 컬러 컨벤션** 적용.

## 공통 계약 (전 시안 의무)

1. 파일 1개 = 시안 1개. `components/design-lab/r3/<이름>.tsx`,
   `export default function <이름>({ rows }: { rows: AtunaPriceRow[] })`.
   데이터 fetch 금지 — rows는 호출부가 주입한다. rows 외 데이터 창작 금지.
2. import 가능: react, recharts, `../../../lib/data/atuna-price-summary`
   (SKJ_ATUNA_HUBS·YF_ATUNA_HUBS·latestTwoForAtunaHub·calcAtunaDeltaPct·AtunaPriceRow).
   신규 의존성·CSS 파일 금지 — inline style만.
3. **주식 컬러**: 상승 `#ef4444`, 하락 `#3b82f6`, 보합/불명 `var(--text-muted)`.
   증감 표시는 ▲/▼ + %.
4. 컨테이너: `<div className="dsc-card" style={{ padding: '20px 22px' }}>` 기본.
   글자색 본문 `var(--text-main)`, 보조 `var(--text-muted)`, 보더 `var(--card-border, #e2e4e9)`.
5. 폰트 웨이트는 400/700/900만. 대형 숫자 900 + `fontVariantNumeric: 'tabular-nums'`.
6. 사용자 노출 문자열 100% 한글, 단위 괄호 `($/MT)`. **기준일 표기 의무**
   (`기준일 YYYY.MM.DD` — 최신 관측의 date).
7. 차트는 고정 width의 recharts (ResponsiveContainer 금지 — 갤러리 컨텍스트 안전).
   `isAnimationActive={false}`.
8. 관측이 없으면 `—` 또는 «직전 없음» — 임의 값 금지.
9. TypeScript strict 통과. `npx tsc --noEmit` 로컬 확인.

## 시안 정의 (담당별)

| 파일 | 컨셉 |
| --- | --- |
| HeroFull.tsx | **풀 하이브리드** — 좌: 방콕 SKJ 대형 KPI+증감, 중: 12주 스파크라인(마지막 점 강조), 하: 8허브 스탯 스트립 1행. B+C 결합 |
| HeroHubSpark.tsx | **허브별 미니 스파크** — 8허브 카드 각각에 최신가+증감+8주 미니 스파크라인(80×28) |
| HeroStripStock.tsx | **B 개량** — 2라운드 밀도형 그대로 + 주식 컬러. 증감 0.0%는 보합색. SKJ/YF 시각 구분(라벨 배지) |
| HeroKpiStock.tsx | **A 개량** — 현행 KPI형 구성(주 KPI+보조 3개)을 자체 마크업으로 재현 + 주식 컬러·▲▼ |
| HeroSparkPlus.tsx | **C 개량** — 대형 KPI+스파크라인에 12주 최고·최저 가로 점선(ReferenceLine)+값 라벨, 마지막 점 dot 강조 |
| HeroSpread.tsx | **스프레드 포커스** — 방콕 KPI + SKJ 허브 min~max 가로 스프레드 바(각 허브 위치 점, 최저·최고 라벨). 어디서 사고 어디가 비싼지 한 줄 |

## 검수 기준 (통과 못 하면 반려)

- 5초 안에 오늘의 숫자가 읽히는가. 주식 컬러 정확 적용. 기준일 존재. tsc 통과.
