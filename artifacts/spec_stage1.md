# Stage 1 검증 위젯 Spec — 5개 신규 위젯 (S1 ×3 + S2 + S3 + S4)

> **목적**: OMO 4-Agent 루프가 *연속 5개 위젯*을 만들 때 V4.1 룰북 게이트 + 패턴 일관성을 사람 개입 없이 유지하는지 검증.
> **공통 규약**: 5개 위젯 모두 ADR-0005 `WidgetCard` 사용, 참치 commodity → 시그니처 그라디언트 `cyan → blue`, `STATIC` TelemetryBadge + syncDate `2026-05-21`, 한글 100%, [OMO] 접미사로 *각각 별도 커밋*.
> **출처 통일**: 모든 위젯에서 mock data임을 cardDesc + TakeawayBox source에 명시 (Stage 0 룰 동일).

---

## 위젯 #1 — 참치 어획량 추이 (월별, S1, LineChart)

**파일**: `components/TunaCatchVolumeTrend.tsx`
**Pillar**: S1 🐟 원료 수급
**차트**: `LineChart` (Recharts) — X축 월(1-12월 한글), Y축 어획량(천 톤)
**시그니처 그라디언트**: cyan → blue (Line의 stroke를 단색 `#22d3ee` 또는 SVG linearGradient stroke)

### 데이터 (mock)
```typescript
const data = [
  { month: '1월',  catch: 215 }, { month: '2월',  catch: 198 },
  { month: '3월',  catch: 256 }, { month: '4월',  catch: 284 },
  { month: '5월',  catch: 312 }, { month: '6월',  catch: 345 },
  { month: '7월',  catch: 378 }, { month: '8월',  catch: 401 },
  { month: '9월',  catch: 389 }, { month: '10월', catch: 342 },
  { month: '11월', catch: 287 }, { month: '12월', catch: 234 },
];
// 단위: 천 톤
// 출처: WCPFC 2025 Catch Statistics + IATTC 보고 (Stage 1 mock)
```

### 텍스트
- **icon**: `TrendingUp` (lucide-react)
- **cardDesc**: WCPFC/IATTC 2025년 어획 통계 기반 월별 합산 어획량 추이
- **unit**: (천 톤)
- **TermTooltip**: WCPFC·IATTC
- **SIT** (2~3문장): "어획량은 7-8월 peak(401천 톤)에서 1-2월 trough(198천 톤)까지 약 2배 진폭의 명확한 계절성. 9월부터 빠르게 하강하며 동절기 공급 부족 리스크 잠재."
- **TAK** (1~2문장): "8월 peak 진입 전 5-7월 사전 비축으로 동절기 단가 상승(+25~30% 전형) 회피. 콜드체인 가용 capa 사전 점검 필수 — Q3에 capa 한계 도달 시 마진 -1.5pp."

---

## 위젯 #2 — 참치 어종 구성비 (S1, PieChart)

**파일**: `components/TunaSpeciesComposition.tsx`
**Pillar**: S1 🐟 원료 수급
**차트**: `PieChart` (Recharts) — 어종별 점유율

### 데이터 (mock)
```typescript
const data = [
  { species: '가다랑어', share: 58.3 },  // skipjack
  { species: '황다랑어', share: 21.7 },  // yellowfin
  { species: '눈다랑어', share: 12.4 },  // bigeye
  { species: '날개다랑어', share: 5.8 }, // albacore
  { species: '기타',     share: 1.8 },
];
// 단위: %
// 출처: ISSF 2025 Status of the Stocks (Stage 1 mock)
```

### 텍스트
- **icon**: `Fish` (lucide-react)
- **cardDesc**: ISSF 2025 Status of the Stocks 기반 글로벌 참치 5개 어종 어획 구성비
- **unit**: (%)
- **색상**: 시그니처 그라디언트 5단 추출 — `#22d3ee → #38bdf8 → #3b82f6 → #6366f1 → #8b5cf6` (cyan → blue → indigo의 자연 확장)
- **TermTooltip**: ISSF
- **SIT**: "가다랑어가 58.3%로 압도적 1위, 황다랑어(21.7%)와 합쳐 상위 2개가 80% 점유. 눈다랑어·날개다랑어는 자원 회복 우려가 큰 12.4%·5.8%로 가공·횟감 수율은 낮으나 단가 프리미엄."
- **TAK**: "가다랑어 의존도 높음 = ENSO·라니냐 한 번에 60% 공급 흔들림. 자원 안정성 위해 황다랑어·날개다랑어 신규 어획권 확보 검토 — 다변화로 공급 변동성 -30%."

---

## 위젯 #3 — 참치 가공 수율 비교 (S2, LineChart)

**파일**: `components/TunaProcessingYield.tsx`
**Pillar**: S2 🏭 가공·생산
**차트**: `LineChart` (Recharts) — 어종 5개 × 가공공정 5단계(원물→두절→삼분할→정형→통조림 충전)별 수율 비교

### 데이터 (mock)
```typescript
const data = [
  { stage: '원물',     skipjack: 100, yellowfin: 100, bigeye: 100, albacore: 100 },
  { stage: '두절',     skipjack: 85,  yellowfin: 83,  bigeye: 82,  albacore: 84 },
  { stage: '삼분할',   skipjack: 68,  yellowfin: 70,  bigeye: 72,  albacore: 71 },
  { stage: '정형',     skipjack: 56,  yellowfin: 60,  bigeye: 63,  albacore: 61 },
  { stage: '충전',     skipjack: 52,  yellowfin: 57,  bigeye: 60,  albacore: 58 },
];
// X축: 가공공정 한글 5자 이내 ✓
// 단위: % (원물 대비 수율)
// 출처: KFAS 한국수산과학회지 2024 + 산업통계 (Stage 1 mock)
```

### 텍스트
- **icon**: `Factory` (lucide-react)
- **cardDesc**: KFAS 산업통계 기반 어종 4종의 5단계 가공공정 수율(원물=100% 기준)
- **unit**: (% / 원물 기준)
- **TermTooltip**: KFAS
- **SIT**: "최종 충전 수율은 가다랑어 52% vs 눈다랑어 60%로 약 8%p 격차. 정형 단계(56% vs 63%)에서 격차가 크게 벌어짐 — 가다랑어는 작은 size로 정형 손실이 큼."
- **TAK**: "가다랑어 정형 자동화 라인 도입 시 수율 +3-5%p 가능 — 연간 원료 비용 환산 ~15억원 절감 추정. CapEx 회수기간 18개월 시뮬레이션 권고."

---

## 위젯 #4 — 콜드체인 운송비 격차 (S3, ComposedChart)

**파일**: `components/TunaColdChainCostGap.tsx`
**Pillar**: S3 🚢 물류·통관
**차트**: `ComposedChart` (Recharts) — Bar(해상 운송비) + Line(항공 운송비) 오버레이로 5개 항로 비교

### 데이터 (mock)
```typescript
const data = [
  { route: '방콕→부산', sea: 95,  air: 1450, gap: 15.3 },
  { route: '발리→부산', sea: 110, air: 1620, gap: 14.7 },
  { route: '마닐라→부산', sea: 85, air: 1280, gap: 15.1 },
  { route: '나하→부산', sea: 65,  air: 950,  gap: 14.6 },
  { route: '하노이→부산', sea: 102, air: 1540, gap: 15.1 },
];
// X축: 항로 한글 6자 이내 ✓
// 단위: 만원/MT (Bar=해상, Line=항공)
// 출처: KMI 2025 Q3 해상물류통계 + 항공운임 자체조사 (Stage 1 mock)
```

### 텍스트
- **icon**: `Truck` (lucide-react)
- **cardDesc**: KMI 해상물류통계 + 항공운임 직접 조회로 산출한 5개 동남아 항로 콜드체인 운송비
- **unit**: (만원/MT)
- **TermTooltip**: KMI
- **SIT**: "해상 평균 91만원 vs 항공 평균 1,368만원 — 15배 격차. 그러나 콜드체인 손실(해상 평균 1.8% vs 항공 0.3%)을 감안하면 실효 격차는 8-10배로 축소."
- **TAK**: "MAP(modified atmosphere packaging) 해상 전환으로 해상 손실율을 1.8% → 0.7%로 낮추면 연간 운송비 -38% (현재 항공 의존 30% 기준). Q4 시범 운영 → Q1 26 전사 전환 로드맵 권고."

---

## 위젯 #5 — 참치 통조림 시장점유 (S4, PieChart)

**파일**: `components/TunaCannedMarketShare.tsx`
**Pillar**: S4 📈 판매·수요
**차트**: `PieChart` (Recharts) — 국내 상위 5개 브랜드 점유율

### 데이터 (mock)
```typescript
const data = [
  { brand: '동원참치',     share: 71.2 },
  { brand: '사조참치',     share: 14.8 },
  { brand: '오뚜기',       share: 6.5 },
  { brand: '신라참치',     share: 3.9 },  // 본 프로젝트 발주처
  { brand: '기타',         share: 3.6 },
];
// 단위: %
// 출처: 닐슨IQ 2025 H1 국내 참치 통조림 시장점유율 (Stage 1 mock)
```

### 텍스트
- **icon**: `ShoppingCart` (lucide-react)
- **cardDesc**: 닐슨IQ 2025 상반기 retail audit 기반 국내 참치 통조림 브랜드별 점유율
- **unit**: (%)
- **색상**: 시그니처 그라디언트 5단 — `#22d3ee → #38bdf8 → #3b82f6 → #6366f1 → #8b5cf6` (위젯 #2와 동일 팔레트, 일관성)
- **SIT**: "동원이 71.2%로 카테고리 dominant, 상위 2개(동원+사조)가 86% 점유의 듀오폴리. 신라교역 3.9% — 가공·도매 경쟁력이 retail 브랜드로 transfer되지 못한 구조."
- **TAK**: "B2B(가공·HMR/벤더 OEM) 우위를 B2C 브랜드로 전이하려면 동원·사조와 정면 광고전 대신 *프리미엄 횟감·자숙액 활용 HMR* niche 진입 — 향후 3년 점유율 +2-3%p 목표."

---

## §X 통합 체크리스트 (Stage 0 §8 동일, 5개 모두 적용)

| # | 항목 |
|---|---|
| 1 | cardDesc 1줄 산출 방법론·출처 |
| 2 | TelemetryBadge `STATIC` + syncDate `2026-05-21` |
| 3 | SIT 2~3문장, 객관 숫자 포함 |
| 4 | TAK 1~2문장, 수익성·리스크 기반 |
| 5 | X/Y축·범례·툴팁 100% 한글 |
| 6 | 단위 명기 (W-02) |
| 7 | 5-Pillar 명시 |
| 8 | WidgetCard 사용 (보일러 금지, ADR-0005) |
| 9 | `npm run build` 본 파일 에러 0건 (L-03) |

## 4-Agent 역할 매핑 (Stage 0과 동일)

| Agent | 모델 |
|---|---|
| Sisyphus 오케스트레이터 | `google/antigravity-claude-opus-4-6-thinking` (variant=max) |
| Hephaestus 워커 | `google/antigravity-gemini-3-pro` (variant=high) |
| Oracle 리뷰어 | `openai/gpt-4o` |
| Verifier | Antigravity IDE + Claude Code MCP (외부) |

## Ralph Loop 진입 prompt 템플릿

```
ultrawork: artifacts/spec_stage1.md 의 위젯 #N 섹션에 정의된 위젯을 신규 생성한다.
ADR-0005 WidgetCard 사용. spec §X 체크리스트 9/9 통과까지 자기참조 반복.
완료 시 git commit (메시지 끝에 [OMO] 접미사). 다른 위젯은 건드리지 말 것.
```

각 N=1..5에 대해 순차 실행.
