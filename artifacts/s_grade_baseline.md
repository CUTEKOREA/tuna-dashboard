# S-Grade UI 표준화 베이스라인 측정

## 요약

- 진입점 dashboard: 3

- 유니크 검증 파일: 23


## Dashboard: `TunaDashboard.tsx`

- closure 크기: 14개 파일


| 파일 | 줄 | cardDesc | TelemetryBadge | TakeawayBox | unit-parens | EN-잔존 | 위젯? |
|---|---:|---:|---:|---:|---:|---:|:---:|
| `SafeResponsiveContainer.tsx` | 105 | 0 | 0 | 0 | 0 | 0 | 🧩 |
| `TermTooltip.tsx` | 84 | 0 | 0 | 0 | 0 | 0 |  |
| `TunaComplianceRadar.tsx` | 141 | 1 | 0 | 1 | 0 | 0 | 🧩 |
| `TunaDashboard.tsx` | 724 | 1 | 2 | 1 | 0 | 6 | 🧩 |
| `TunaHSClassifier.tsx` | 141 | 1 | 0 | 1 | 2 | 0 | 🧩 |
| `TunaKfasResearch.tsx` | 306 | 4 | 0 | 4 | 2 | 0 | 🧩 |
| `TunaLiveTicker.tsx` | 197 | 0 | 0 | 0 | 1 | 4 |  |
| `TunaNewInsightsA.tsx` | 183 | 3 | 0 | 3 | 1 | 0 | 🧩 |
| `TunaNewInsightsB.tsx` | 185 | 3 | 0 | 3 | 1 | 2 | 🧩 |
| `TunaPetCareMargin.tsx` | 129 | 0 | 0 | 1 | 0 | 0 | 🧩 |
| `TunaPolicyRiskRadar.tsx` | 153 | 2 | 0 | 2 | 0 | 0 | 🧩 |
| `TunaPrecisionFishing.tsx` | 93 | 1 | 0 | 1 | 0 | 0 | 🧩 |
| `TunaPriceDecoupling.tsx` | 117 | 0 | 0 | 1 | 4 | 0 | 🧩 |
| `TunaSupplierHub.tsx` | 200 | 1 | 0 | 1 | 0 | 0 | 🧩 |

## Dashboard: `TunaExtractDashboard.tsx`

- closure 크기: 10개 파일


| 파일 | 줄 | cardDesc | TelemetryBadge | TakeawayBox | unit-parens | EN-잔존 | 위젯? |
|---|---:|---:|---:|---:|---:|---:|:---:|
| `SafeResponsiveContainer.tsx` | 105 | 0 | 0 | 0 | 0 | 0 | 🧩 |
| `TermTooltip.tsx` | 84 | 0 | 0 | 0 | 0 | 0 |  |
| `TunaBioUpcyclingGap.tsx` | 71 | 0 | 0 | 1 | 0 | 0 | 🧩 |
| `TunaEsgRiskRadar.tsx` | 83 | 0 | 0 | 1 | 1 | 0 | 🧩 |
| `TunaExtractDashboard.tsx` | 850 | 0 | 21 | 20 | 14 | 1 | 🧩 |
| `TunaGlobalHalalStrategy.tsx` | 72 | 0 | 0 | 1 | 0 | 0 | 🧩 |
| `TunaPeptideEfficacy.tsx` | 46 | 0 | 0 | 1 | 0 | 0 | 🧩 |
| `TunaPngHubStrategy.tsx` | 75 | 0 | 0 | 1 | 2 | 0 | 🧩 |
| `TunaSdgCircular.tsx` | 117 | 0 | 0 | 1 | 0 | 0 | 🧩 |
| `TunaTacMonitor.tsx` | 142 | 0 | 0 | 1 | 0 | 0 | 🧩 |

## Dashboard: `TunaInsightsDashboard.tsx`

- closure 크기: 5개 파일


| 파일 | 줄 | cardDesc | TelemetryBadge | TakeawayBox | unit-parens | EN-잔존 | 위젯? |
|---|---:|---:|---:|---:|---:|---:|:---:|
| `SafeResponsiveContainer.tsx` | 105 | 0 | 0 | 0 | 0 | 0 | 🧩 |
| `TermTooltip.tsx` | 84 | 0 | 0 | 0 | 0 | 0 |  |
| `TunaInsightsDashboard.tsx` | 831 | 15 | 0 | 15 | 6 | 28 | 🧩 |
| `TunaNewInsightsA.tsx` | 183 | 3 | 0 | 3 | 1 | 0 | 🧩 |
| `TunaNewInsightsB.tsx` | 185 | 3 | 0 | 3 | 1 | 2 | 🧩 |

## 영문 잔존 상세 (위반 후보)

### `TunaDashboard.tsx` — 6건
- L121 [text] `ESTIMATE`
- L160 [text] `No Data`
- L269 [text] `Unsupported`
- L339 [text] `Unsupported`
- L421 [text] `Loading Strategic Intelligence...`
- L456 [text] `Connected`

### `TunaExtractDashboard.tsx` — 1건
- L522 [text] `HS Code`

### `TunaInsightsDashboard.tsx` — 28건
- L161 [text] `Current Spread (USD/t)`
- L203 [text] `Tariff advantage to EU`
- L237 [text] `Top Emerging Market`
- L238 [text] `Nigeria`
- L289 [text] `Atlantic Compensation Rate`
- L291 [text] `During Pacific Shocks`
- L328 [text] `Correlation (Tuna-Mackerel)`
- L330 [text] `Strongly Negative (Hedgable)`
- L367 [text] `Largest Discrepancy Margin`
- L369 [text] `Pacific Islands Route`
- L409 [text] `Aquaculture Premium`
- L411 [text] `vs Wild Catch (2024)`
- L453 [text] `UAE (Dubai)`
- L492 [text] `Current HHI Index`
- L531 [text] `Projected Shift by 2035`
- L533 [text] `Warm-Water Species Dominance`
- L574 [text] `Fuel Cost Reduction`
- L576 [text] `vs 2018 Baseline`
- L612 [text] `Thai Export Impact`
- L614 [text] `Estimated Drop by 2026`
- L654 [text] `Max Retail Premium`
- L656 [text] `Dual Certified Products`
- L693 [text] `Alt-Protein Projection`
- L695 [text] `Target by 2030 (7.8% CAGR)`
- L731 [text] `Upcycled PetCare Margin`
- L733 [text] `vs 8.5% (Canned Tuna)`
- L231 [prop] `CAGR Growth (%)`
- L642 [prop] `Retail Price Index`

### `TunaLiveTicker.tsx` — 4건
- L85 [text] `LIVE INTELLIGENCE TICKER`
- L114 [text] `Refresh`
- L167 [text] `Live`
- L171 [text] `Cached`

### `TunaNewInsightsB.tsx` — 2건
- L126 [text] `Avg. Tax Rate Impact`
- L170 [text] `Tan Phat Foods`

## 규칙별 누락 후보 (위젯 파일인데 패턴이 0인 경우)

### cardDesc 누락 (11개)
- `SafeResponsiveContainer.tsx`
- `TunaPetCareMargin.tsx`
- `TunaPriceDecoupling.tsx`
- `TunaBioUpcyclingGap.tsx`
- `TunaEsgRiskRadar.tsx`
- `TunaExtractDashboard.tsx`
- `TunaGlobalHalalStrategy.tsx`
- `TunaPeptideEfficacy.tsx`
- `TunaPngHubStrategy.tsx`
- `TunaSdgCircular.tsx`
- `TunaTacMonitor.tsx`

### TelemetryBadge 누락 (19개)
- `SafeResponsiveContainer.tsx`
- `TunaComplianceRadar.tsx`
- `TunaHSClassifier.tsx`
- `TunaKfasResearch.tsx`
- `TunaNewInsightsA.tsx`
- `TunaNewInsightsB.tsx`
- `TunaPetCareMargin.tsx`
- `TunaPolicyRiskRadar.tsx`
- `TunaPrecisionFishing.tsx`
- `TunaPriceDecoupling.tsx`
- `TunaSupplierHub.tsx`
- `TunaBioUpcyclingGap.tsx`
- `TunaEsgRiskRadar.tsx`
- `TunaGlobalHalalStrategy.tsx`
- `TunaPeptideEfficacy.tsx`
- `TunaPngHubStrategy.tsx`
- `TunaSdgCircular.tsx`
- `TunaTacMonitor.tsx`
- `TunaInsightsDashboard.tsx`

### TakeawayBox 누락 (1개)
- `SafeResponsiveContainer.tsx`
