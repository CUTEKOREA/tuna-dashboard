# ChickenDashboard 8-Axis Forensic Audit (2026-05-24)

> 평가자: Claude Opus 4.7 (Claude Code 세션)
> 기준: `docs/plans/livestock_3_widget_verification.md` 8-Axis schema
> 합격선: A≥85 / B 70~84 / **C<70 즉시 archive**

## 위젯 8-Axis 평가표

| ID | 위젯 | A1 출처 | A2 신선도 | A3 검증 | A4 정합 | A5 시각 | A6 도메인 | A7 모바일 | A8 접근성 | **평균** | **Grade** |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|:---:|
| w_chicken_corporates | 글로벌 Top 양계 기업 지배구조 | **88** | 90 | 80 | 80 | 85 | 95 | 90 | 70 | **84.8** | **B+** |
| w_chicken_processing | 가공 인프라 블랙홀 | 88 | 82 | 80 | 76 | 85 | 90 | 90 | 70 | **82.6** | **B+** |
| w_chicken_parts | 가금류 부위별 차익거래 | 88 | 78 | 72 | 76 | 80 | 85 | 90 | 65 | **79.3** | **B** |
| w_chicken_trade_shift | 글로벌 양계 수출 시장 패권 | 92 | 86 | 70 | 70 | 80 | 80 | 90 | 65 | **79.1** | **B** |
| w_chicken_global_production | 글로벌 양계 생산량 Top 4 | 92 | 76 | 56 | 72 | 80 | 75 | 90 | 70 | **76.4** | **B** |
| w_chicken_feed_cost | 글로벌 사료 원가 트렌드 | 96 | 80 | 64 | 60 | 80 | 85 | 90 | 70 | **78.1** | **B** |
| w_chicken_global_export | 원물 vs 가공육 수출 점유율 | 88 | 72 | 56 | 72 | 80 | 80 | 90 | 70 | **76.0** | **B** |
| w_chicken_arbitrage | 글로벌 수입 원가 vs 국내 도매가 스프레드 | 92 | 76 | 48 | 68 | 75 | 80 | 90 | **55** ⚠️ | **73.0** | **B-** |
| w_chicken_eggs | 계란 수급 리스크 및 가공 의존도 | 84 | 76 | 52 | 60 | 80 | 75 | 90 | 65 | **72.8** | **B-** |
| w_chicken_eudr_esg | EUDR/ESG 규제 대응 스코어카드 | **76** ⚠️ | 64 | **32** ⚠️ | 60 | 70 | 75 | 90 | 65 | **66.5** | **C** 🚫 |
| w_chicken_risk_radar | 기후/질병 리스크 헷징 레이더 | **72** ⚠️ | 64 | **32** ⚠️ | 52 | 70 | 70 | 90 | 65 | **64.4** | **C** 🚫 |

## 통계

- **합격 A (≥85)**: 0건 (0%)
- **조건부 B (70~84)**: 9건 (82%)
- **즉시 archive C (<70)**: **2건 (18%)** — `eudr-esg`, `risk-radar`

## 🚫 즉시 Archive 대상 (사용자 컨펌 (i) 적용)

### 1. `w_chicken_eudr_esg` (66.5점, C)
- **치명적 결함**: 레이더 6개 차원 정량 점수 산출 방법론 전무 (A1 -14)
- **2차 자료 의존**: MSCI/Sustainalytics 공식 ESG 등급과 무관함 명시 (A3 32점)
- **archive 사유**: 자체 추정 ESG 점수는 C-Level 의사결정에 무책임
- **재작성 권장**: MSCI ESG Rating, EU CSRD Reporting 공식 데이터로 재구성

### 2. `w_chicken_risk_radar` (64.4점, C)
- **치명적 결함**: 5축 정량 점수 산출 근거 전무, NotebookLM 정성 분석 기반 (A1 -14)
- **2차 자료 의존**: OIE WAHIS 실측 데이터 미연동 (A3 32점)
- **archive 사유**: HPAI/Heat Stress 리스크는 C-Level 의사결정 핵심 — 정성 추정 위험
- **재작성 권장**: WOAH WAHIS Live API + 기상청 폭염 예보 연계

## 발견된 패턴 (Best practices + 약점)

### ✅ Best Practices
1. **`corporates` 위젯 (84.8)** — JBS/BRF/GFPT/CPF Annual Report 페이지 번호까지 명시 → 모범
2. **`feed-cost` (78.1)** — CBOT Corn Futures 2021-2024 실데이터 → 1차 자료 우수
3. **`processing` (82.6)** — Recharts 데이터 바인딩 완성 + Thai DLD 가공수율 인용
4. **모바일 UX 일관성** — 모든 위젯 `data-mobile-stack` 적용 → A7 평균 90점

### ⚠️ 공통 약점
1. **A3 Verifiability 약함** — 9건 중 8건이 80점 이하, 자체 추출 경로 미공개
2. **A8 Accessibility 일괄 65~70점** — 색맹 대비 + WCAG AA 미준수 (R/G 의존)
3. **시나리오/예측 데이터 표시 미흡** — `2025(HPAI)`/`2026(Est)` 명시는 좋으나 시각적 구분(점선·음영) 부재
4. **A4 Integration 평균 67점** — SIT 수치 ≠ chart 데이터 일부 사례

## 즉시 정정 큐 (Phase 1.2)

| 우선 | 위젯 | 정정 항목 |
|---|---|---|
| High | `risk-radar` + `eudr-esg` | **archive 폴더로 이동** (`_archive/components/`) + Dashboard에서 import 제거 |
| Mid | `eggs` | priceIndex 기준 연도 명시 (`Base: 2020=100`) + chart 데이터 검증 |
| Mid | `arbitrage` | 브라질 0원 → "수입금지" 텍스트 라벨 추가 (시각적 오독 방지) |
| Low | 전체 9 위젯 | 색맹 대비 — Bar 차트에 패턴(빗금) 추가 옵션 검토 |

## 다음 액션

- **Phase 1.2 즉시 정정** (15분): archive 2건 + 즉시 정정 큐 처리
- **Phase 2.1** Beef 평가 (LIVE schema fine-tune 같이)
