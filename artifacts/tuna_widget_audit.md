# 참치 페이지 위젯 사실 무결성 감사 — Phase A 풀스캔

> **작성:** 2026-05-20 Claude Code 세션
> **범위:** [components/TunaDashboard.tsx](../components/TunaDashboard.tsx)가 import하는 33개 위젯
> **방법:** (a) 위젯 정적 분석 → 의심 주장 추출, (b) NotebookLM '참치' 관련 10개 노트북 query, (c) `/Users/idong-geon/agri_data/tuna/` 원자료 교차 검증
> **상태:** Phase A 완료 (Phase B 위젯 수정 대기)

## Executive Summary

### 🚨 즉시 정정 권고 (DELETE/완전 EDIT) — 3건

1. **A5-1: 가다랑어 $2,250/MT (2025 Q3, MAPE 4.8%) 예측 — 완전 거짓**
   실측 2025-10 = $1,700, $2,250은 2026-04 위기 호가. Atuna 실데이터로 재구성. → [TunaForecastWidgets.tsx:75](../components/TunaForecastWidgets.tsx#L75)
2. **A2-1: "Thailand→US -60% (2026 예상)" — 방향 반대**
   실제는 미국 상호관세로 ↑ (태국 19%, 베트남 20%, 에콰도르 15%). → [TunaInsightsDashboard.tsx:601](../components/TunaInsightsDashboard.tsx#L601)
3. **A6-1: "해양 콜라겐 $12.8B / DHA $48.2B" — 잘못된 매핑**
   $48.2B는 참치 어획·양식 시장 규모(Mordor), $12.8M은 영국 보조식품 지출액. 콜라겐·DHA 시장 아님. → [TunaUpcyclingWidgets.tsx:95](../components/TunaUpcyclingWidgets.tsx#L95)

### ✅ 검증 통과 (KEEP + 출처 보강) — 3건

1. **A1-3: Block et al. 2026** — 실제로 존재 (2026-03-15 게재 승인, Stanford Digital Repository). 1차 감사 의심은 false alarm.
2. **A6-2: MSC+Dolphin-Safe +81.3% 듀얼 프리미엄** — Fisheries Research 2025 학술논문, Hedonic pricing, Nielsen 데이터. 학술적으로 정당.
3. **A4-3: 스페인 세계 2위 통조림 생산국** — ANFACO-CECOPESCA, USDA FAS, Eurostat Comext 다중 확인.

### ⚠️ 표현 정정 (EDIT) — 7건

- **A1-2**: ISSF "87% 건전"은 어획량 기준, stock 기준은 65% — 둘 다 명시
- **A4-1**: Balfegó QR "최초 도입" 표현 완화
- **A5-2**: FAO SOFIA "33% 급등"은 명목 기준만 (실질 하락 단서 추가)
- **A2-2,3**: $280M/$12M는 박혜진 보고서(2024-06) 출처 명확화 + "추정치" 표시
- **A2-5**: HSK 6자리 → 10자리 정정 (L-04 위반)
- **A3-3**: SCFI/MOF 운임 출처-루트 불일치 정정
- **A5-4**: "동원 중동 헤게모니" → "접근 확보 단계"로 톤 다운

### 🔄 RECONCILE (단일 출처 통일) — 6건 cross-widget

X1~X6 (참치액 시장 규모, 부산물 비율, Ecuador EU M/S, 두바이 단가, Pet care baseline, MGO 방향성)

### 🆕 신규 위젯 후보 — 4건

- 태국 1Q26 원어 수입 (가다랑어 -5% / 황다랑어 -14%) + 인도양 대체
- Frime SA 인수 (스페인 최대 황다랑어 가공사, EU 21% M/S)
- 퍼펙트 스톰 narrative (호르무즈 → MGO + WCPO -22% + 가공업체 저항)
- 동원·사조 RAS 시스템 (지속가능성 혁신)

### 🏷️ STATIC + "Reference Only" 일괄 라벨링 — 14건

[TunaInsightsDashboard.tsx](../components/TunaInsightsDashboard.tsx) 14개 `mock*` 위젯 전부 — 실데이터 교체 전까지 컨빅션 태그 제거 + STATIC 배지로 강등 필요 (A-02·P-03 일괄 위반 해소)

---


## NotebookLM 노트북 매핑 (커버리지)

| 노트북 ID | 제목 | 소스 수 | 주 커버리지 |
|---|---|---|---|
| `1ce41abd…` | 참치 | 529 | 글로벌 시장, MSC, 가다랑어, 식물성 대체 |
| `5477ce3f…` | new 참치 | 264 | FTA 원산지(HS) 규정 |
| `eea443b6…` | 참치액젓 | 168 | 베트남 산업, MMPA, EVFTA, 한국 진출 (제목과 불일치) |
| `f5d65c12…` | 베트남 참치가공회사 | 167 | 2026 수산물, 참다랑어 축양 밸류체인 |
| `f79add79…` | 축양 참치 | 133 | 가나·이탈리아 파트너십, 오메가-3 부산물 |
| `e3e53370…` | 가나 서아프리카 참치 | 82 | 동원 F&B 증권사 보고서, 원어가 |
| `54c3ca50…` | 주요 참치 캔 기업 | 73 | 글로벌 캔 시장 |
| `a298b59e…` | EU·스페인 참치 가공사 | 9 | 스페인 23개사, 갈리시아/바스크 |
| `8f9b350e…` | Atuna | 66 | 가격/뉴스 평론 |
| `4980e9a0…` | Atuna May 2026 News | 6 | 2026-Q2 무역사건 |

## agri_data 원자료 (`/Users/idong-geon/agri_data/tuna/`)

- `fishstat/FishStat_Capture_tuna*.csv` — FAO 어획 통계
- `fishstat/FishStat_Aquaculture_tuna*.csv` — FAO 양식 통계
- `fishstat/FishStat_GlobalProduction_tuna*.csv` — 글로벌 생산
- `Atuna price/` — Atuna 산지가격 데이터
- `공통(General)/ISSF_Status_of_Tuna/` — ISSF stock status
- `공통(General)/IOTC|IATTC|WCPFC|ICCAT_stock_assessments/` — RFMO stock
- `공통(General)/EUMOFA/` — EU 시장 통계
- `공통(General)/FAOSTAT/` — FAOSTAT 전체

---

## 정정 권고 표 (file:line × 주장 × 검증 × 권고)

> **권고 컬럼 약어:**
> - **KEEP** — 검증 통과, 출처 보강만
> - **EDIT** — 수치 또는 표현 정정
> - **DELETE** — 근거 없음, 제거 권고
> - **LABEL** — STATIC + "Reference Only" 라벨링
> - **RECONCILE** — cross-widget 단일 값으로 통일

| # | File:Line | 현재 주장 | 검증 출처 | 검증 결과 | 권고 |
|---|---|---|---|---|---|
| A1-1 | [TunaKfasResearch.tsx:79](../components/TunaKfasResearch.tsx#L79) · [TunaUpcyclingWidgets.tsx:95](../components/TunaUpcyclingWidgets.tsx#L95) | "한국 다랑어 어획량 290천톤 (MOF 2024)" | NotebookLM 참치 노트북 + FishStat v25 (2022) | **WCPFC 2024 = 309,770톤** / FishStat 2022 한국 합계 = **274,405톤** / MOF 290천톤은 두 출처 사이로 plausible | **KEEP** — 출처 라인 명확화 ("MOF 어업생산통계 2024 어종별 표") 권장 |
| A1-2 | [TunaRanching.tsx:529](../components/TunaRanching.tsx#L529) | "ISSF 기준 글로벌 평균 87% 건전" | NotebookLM 참치 노트북 (ISSF 2025-03 보고서) | **2가지 다른 지표 혼동**: stock 기준 = **65%**, catch 기준 = **87%** | **EDIT** — "어획량 기준 87% (stock 기준 65%, ISSF Status of the Stocks 2025-03)" 로 정확히 명시 |
| A1-3 | [TunaRanching.tsx:350,397,509](../components/TunaRanching.tsx#L350) | "Block et al. 2026 (Ensuring the future of Atlantic bluefin tuna)" 3회 인용 | NotebookLM 참치 노트북 (직접 확인) | **검증 통과** — 2025-12 제출, 2026-03-15 게재 승인, Stanford Digital Repository 기탁 | **KEEP** — DOI/URL 추가 권장 (1차 감사에서 의심했으나 실제로 존재함) |
| A2-1 | [TunaInsightsDashboard.tsx:601-608](../components/TunaInsightsDashboard.tsx#L601) `mockTariffHopping` | "Thailand→US -60% (2026 예상)" (관세 회피로 동남아 우회 -60% 감소) | Atuna May 2026 News (Nirsa, Trump tariffs, US Court ruling) | **방향 반대** — 미국은 2025-07-31 태국 19%·베트남 20%·에콰도르 15% 상호관세 부과(↑). 동남아 가공 우회는 *마진 압박*을 받고 있음 | **DELETE 또는 EDIT** — "동남아 우회 관세 페널티" 시나리오로 전면 재작성 |
| A2-2 | [TunaPolicyRiskRadar.tsx:91](../components/TunaPolicyRiskRadar.tsx#L91) | "미국 관세 인상 시 연간 $280M 무역 충격" (source=국가정책연구포털 8건 교차분석·WTO·WITS) | NotebookLM 참치 노트북 (출처 매핑) | 직접 수치 없음. 출처 추정: **국정연 "신통상규범 확대에 따른 수산분야 영향 및 대응방안(2024-06) — 박혜진"**. 산출 근거는 US 참치 관세(in oil 35%/일반 12.5% MFN) × KORUS 0% 차익 | **EDIT** — 출처를 "박혜진(2024-06) 국정연" + "추정치" 명시; WTO/WITS는 derivation 보조용으로 분리 |
| A2-3 | [TunaPolicyRiskRadar.tsx:143](../components/TunaPolicyRiskRadar.tsx#L143) | "KORUS FTA 활용 시 연간 $12M 이상 관세 절감" | NotebookLM 참치 노트북 | 직접 수치 없음. **KORUS 한국 참치 모든 품목 0% 관세 사실은 검증됨**. 정확한 산출식은 박혜진 보고서 원문 필요 | **EDIT** — 동일 출처 표기 + 산출식("한국 대미 수출액 × 35%/12.5%") 보강 |
| A2-4 | [TunaInsightsDashboard.tsx:200](../components/TunaInsightsDashboard.tsx#L200) · [TunaNewInsightsA.tsx:21](../components/TunaNewInsightsA.tsx#L21) | Ecuador EU loin 점유율 26% vs 38~42% (불일치) | NotebookLM 참치 노트북 | **노트북에 데이터 없음** — EU pre-cooked loin imports 2025 = 194,258톤(역대 최고)만 확인. Ecuador 비중은 EUMOFA·Eurostat HS 1604.14 직접 조회 필요 | **EDIT/RECONCILE** — 단일 EUMOFA 출처로 통일, agri_data/공통/EUMOFA 조회 필요 |
| A2-5 | [TunaNewInsightsB.tsx:41](../components/TunaNewInsightsB.tsx#L41) | KCS VKFTA 양허세율 조회 "HS 160414" (6자리) | NotebookLM new 참치 노트북 | 노트북은 EU CN 8자리(예: 03034310, 16041421)만 보유. **한국 HSK 10자리는 노트북에 없음** — 별도 관세청 통합공시 조회 필요 | **EDIT** — L-04 위반: HSK 10자리(1604.14.20.00 류) 정확히 명시 |

**A2 보너스 발견(신규 인사이트 후보):** 태국 2026-Q1 참치 원어 수입 = 가다랑어 143,436톤(-5% YoY) / 황다랑어 38,348톤(-14% YoY). 엘니뇨 영향으로 WCPO 공급 감소 → 인도양(몰디브·세이셸·인도·필리핀) 대체. 새 위젯 또는 [TunaImportBlackhole.tsx](../components/TunaImportBlackhole.tsx) 강화 후보.

| A3-1 | [TunaGlobalHalalStrategy.tsx:64](../components/TunaGlobalHalalStrategy.tsx#L64) · [TunaNewInsightsB.tsx:63](../components/TunaNewInsightsB.tsx#L63) · [TunaExtractDashboard.tsx:189](../components/TunaExtractDashboard.tsx#L189) | 한국 참치액 시장 = $70M vs 700억원 vs 950억원 (3종 불일치) | NotebookLM 참치 노트북 | **노트북에 시장 규모 수치 없음**. 단 KMI "수산물 업사이클링 생태계 조성 방안 연구"가 참치 부산물 관련 출처로 확인됨 (시장 규모 수치는 별도 페이지 확인 필요) | **RECONCILE** — 식약처·aT 식품유통통계 또는 KMI 보고서 원문으로 단일 값 확정, 그 전까지 3개 위젯 모두 STATIC + "추정치" 라벨링 |
| A3-2 | [TunaInsightsDashboard.tsx:724](../components/TunaInsightsDashboard.tsx#L724) · [TunaPetCareMargin.tsx:70](../components/TunaPetCareMargin.tsx#L70) | "동원 펫푸드 영업이익률 28.5% (캔드 8.5% vs 4% 두 baseline)" | NotebookLM 가나 서아프리카 참치 노트북 (동원 증권사 리포트 다수 보유) | **노트북에 28.5% 직접 수치 없음**. 동원 F&B 핵심 기업 언급 + 부산물(오메가-3, TunaOil, 어분) 활용 공정만 확인 | **EDIT** — 28.5%의 정확한 출처(증권사 리포트명·페이지)와 baseline(캔드 4% vs 8.5%) 통일; 출처 없으면 STATIC 라벨링 |
| A3-3 | [TunaMofFisheryWidget.tsx:173-175](../components/TunaMofFisheryWidget.tsx#L173) | 부산-미국 컨테이너 운임 $2,200/$620/$1,900 (source=MOF 해상운임 + SCFI) | (별도 검증 - SCFI는 상하이 발) | **출처-루트 불일치 확정**: SCFI는 상하이 출발 운임, MOF는 컨테이너별 단가 미발행 | **EDIT** — 정확한 출처(KMI 해운지수, KOBC 부산항 데이터) 사용 또는 STATIC |
| A4-1 | [TunaRanching.tsx:432](../components/TunaRanching.tsx#L432) | "Balfegó: 개별 QR 추적성 시스템 **최초 도입**" | NotebookLM EU·스페인 참치 가공사 노트북 | Balfegó의 블루핀 QR 추적 시스템 운영은 사실. **"업계 최초" 표현은 노트북에서 증명 안 됨** | **EDIT** — "최초" 표현 제거, "전 개체 QR 추적성 운영" 정도로 표현 완화 |
| A4-2 | [TunaRanching.tsx:445](../components/TunaRanching.tsx#L445) | "Azzopardi Group: 1999년 몰타 최초 개척" | NotebookLM EU·스페인 노트북 | **Azzopardi 정보 노트북에 전무**. 노트북에는 스페인 Ricardo Fuentes 그룹이 몰타에 진출한 것만 언급 (2000-2010년대) | **DELETE 또는 EDIT** — Azzopardi 출처 없으면 Ricardo Fuentes로 대체하거나 widget에서 제거 |
| A4-3 | (TunaRanching/EU·스페인 narrative 다수) | "스페인 세계 2위 참치 통조림 생산국" | NotebookLM EU·스페인 노트북 | **검증 통과** — 1위 태국, 2위 스페인, 3위 에콰도르. 출처: ANFACO-CECOPESCA, Eurostat Comext, USDA FAS Spain Seafood Report 2025 | **KEEP** — 출처 명확히 표기 |
| A4-4 | (현재 위젯에 없음 — 신규 후보) | Frime SA: 스페인 최대 황다랑어 로인/스테이크 가공사, EU 21% M/S, MSC 인증, 2026 새 소유주 | NotebookLM EU·스페인 + Atuna May 2026 News | **노트북에 사실 확인** — 2026 인수 발생 (구체적 거래 정보는 없으나 소유권 변경 확인) | **NEW WIDGET 후보** — 스페인 가공 거점 + Frime 인수가 위젯에 반영 가능 |
| A5-1 | [TunaForecastWidgets.tsx:75](../components/TunaForecastWidgets.tsx#L75) | "2025 Q3 가다랑어 산지가격 $2,250/MT까지 상승하며 최고점에 도달할 것으로 예측됩니다 (MAPE 4.8%)" | NotebookLM Atuna + agri_data/tuna/Atuna price/skjbkk.csv (직접 검증) | **🚨 완전 거짓** — 실측 2025 Q3 ≈ $1,650-1,700, $2,250은 2026-04 위기 호가, 실측 체결 = $2,100 / 2026-05 = $1,975. 위젯 예측 vs 실측 오차 ~32% (MAPE 4.8% 가짜) | **DELETE** — 예측 자체 폐기. 권장 대체: "퍼펙트 스톰" narrative — 호르무즈 봉쇄로 MGO $2,000+/t, WCPO 1Q26 -22%(-39,000톤), 가공업체 $2,000 저항선. agri_data Atuna 실측 차트로 재구성 |
| A5-2 | [TunaTacMonitor.tsx:134](../components/TunaTacMonitor.tsx#L134) | "FAO에 따르면 2030년까지 수산물 가격 33% 급등 전망" | NotebookLM 참치 노트북 (FAO SOFIA 2022) | **부분 검증 통과** — "명목(nominal) 기준 +33%" 사실. 단 **실질 가격은 하락 예상**이라는 단서 누락 | **EDIT** — "명목 기준" 명시 추가, 실질 기준 단서도 표기 (오해 방지) |
| A5-3 | [TunaRanching.tsx:785,1003](../components/TunaRanching.tsx#L785) | "사우디 콜드체인 $35억→$159억 (2025→2034, CAGR 18.31%) — IMARC" | NotebookLM 참치 노트북 | **노트북에 IMARC 사우디 콜드체인 데이터 없음** (IMARC "사우디 참치 시장(2026-2034)" 및 "중동 수산물 시장(2026-2034)" 보고서만 있음). 콜드체인 수치는 별도 출처 검증 필요 | **EDIT** — 정확한 IMARC 보고서명(콜드체인 vs 참치 시장 vs 수산물 시장) 인용; 출처 확인 안 되면 IMARC 참치/수산물 보고서 수치로 교체 |
| A5-4 | [TunaRanching.tsx:725,787](../components/TunaRanching.tsx#L725) | "두바이 거점 확보 → 중동 전역 $100억+ 수산물 시장 / 동원 중동 헤게모니" | NotebookLM 참치 노트북 (IMARC 중동 수산물) | **부분 검증** — 동원이 에콰도르·세네갈 가공공장 경유 중동 시장 접근 확보(언급). 그러나 중동 핵심 플레이어로는 Thai Union, Century Pacific, Bolton Group이 주로 다뤄지며 **동원은 핵심 글로벌 플레이어로 미언급** | **EDIT** — "동원 헤게모니" 표현 완화, "접근 확보 단계"로 톤 다운 |
| A6-1 | [TunaUpcyclingWidgets.tsx:95](../components/TunaUpcyclingWidgets.tsx#L95) | "해양 콜라겐 시장 $12.8B / DHA 오메가-3 $48.2B" (Grand View Research 출처) | NotebookLM 참치 노트북 | **🚨 잘못된 매핑** — "$48.2B"는 글로벌 참치 어획/양식 시장 규모 (Mordor Intelligence). "$12.8M"은 영국·아일랜드 MSC 수산 보조식품 연간 지출액(£12.8M, 콜라겐 글로벌 아님). 두 개 다른 지표를 잘못 묶음 | **DELETE 또는 EDIT** — Grand View Research 직접 인용으로 정확한 글로벌 콜라겐/DHA 시장 규모 재확인. 출처 미확인 시 STATIC 라벨링 |
| A6-2 | [TunaInsightsDashboard.tsx:642-649](../components/TunaInsightsDashboard.tsx#L642) | "MSC + Dolphin-Safe 듀얼 인증 = +81.3% 프리미엄" | NotebookLM 참치 노트북 | **검증 통과** — Fisheries Research 2025 학술논문 (Nielsen Retail Scanner 2017-19, Hedonic pricing). Dolphin-Safe 단일 25.4%, MSC 단일 44.6%, **듀얼 81.3% (시너지)** | **KEEP** — `mockMSCPremium` 변수명을 실데이터로 교체, source="Fisheries Research 2025 (Hedonic Pricing Analysis)" 명시 |
| A6-3 | [TunaExtractDashboard.tsx:520](../components/TunaExtractDashboard.tsx#L520) | "참치 자숙액 45mg/kg 압도적 (멸치/까나리 대비)" | NotebookLM 참치 노트북 | **노트북에 화학 성분 데이터 없음** (시장 트렌드만 — 2024 판매 +50% 확인). 위젯 출처는 KFAS 한수지 추정인데 노트북에 미수록 | **EDIT** — 정확한 학술논문 인용 (Klomklao & Benjakul 또는 KFAS 한수지 권·호·페이지) 또는 STATIC 라벨링 |
| A6-4 | [TunaUpcyclingWidgets.tsx:151](../components/TunaUpcyclingWidgets.tsx#L151) | "가나 LimoFish 오메가-3 생산 모델 / 부산물 1톤당 추출 수율" | NotebookLM 축양 참치 노트북 | **노트북에 LimoFish 정보 없음**. 가나는 신라교역 자회사(PANOFI, COSMO)가 어획·통조림 운영. 동원·사조는 가나 부산물 오메가-3 모델 도입 사례 없음. 동원은 RAS(부유식 순환여과양식) 시험 운영 중 | **EDIT 또는 DELETE** — LimoFish 출처(예: WASTE2TASTE 프로젝트 또는 Ghana Tema TA 보고서) 명확히 확인하지 않으면 narrative 폐기 |

**A6 보너스 발견(신규 인사이트 후보):** 동원·사조의 부유식 순환여과양식(RAS) 시스템 시험 운영, 가나 PANOFI/COSMO의 EU OEM 통조림 생산, WASTE2TASTE 프로젝트.

---

## Cross-widget 불일치 통일 권고 (A7)

| # | 지표 | 위젯 A | 위젯 B (와 C) | 권고 단일 값 / 출처 |
|---|---|---|---|---|
| X1 | 한국 참치액 시장 규모 | $70M ([TunaGlobalHalalStrategy.tsx:64](../components/TunaGlobalHalalStrategy.tsx#L64)) | 700억원 ([TunaNewInsightsB.tsx:63](../components/TunaNewInsightsB.tsx#L63)) / 950억원 ([TunaExtractDashboard.tsx:189](../components/TunaExtractDashboard.tsx#L189)) | **외부 출처 필요** — 식약처 식품유통통계 또는 aT FIS 식품산업통계로 단일 값 확정. 그 전까지 STATIC + "추정치" 라벨링 |
| X2 | 한국 참치 부산물 비율 | 30~60% ([TunaKfasResearch.tsx:86](../components/TunaKfasResearch.tsx#L86)) | 40~55% ([TunaUpcyclingWidgets.tsx:95](../components/TunaUpcyclingWidgets.tsx#L95)) / 52% 고정 ([TunaPetCareMargin.tsx:52](../components/TunaPetCareMargin.tsx#L52)) | **Klomklao & Benjakul 2016 (30~60%) 정설로 통일**. 52% 고정은 한 가공공정 사례, "범위 30~60% / 동원 평균 52%" 식으로 분리 표기 |
| X3 | Ecuador EU loin M/S | 26% ([TunaInsightsDashboard.tsx:200](../components/TunaInsightsDashboard.tsx#L200)) | 38~42% ([TunaNewInsightsA.tsx:21](../components/TunaNewInsightsA.tsx#L21)) | **EUMOFA HS 1604.14 또는 Eurostat 조회 필요** (agri_data/공통/EUMOFA). 단일 값 확정 전까지 한쪽 STATIC |
| X4 | 두바이/UAE 프리미엄 단가 | $42/kg ([TunaInsightsDashboard.tsx:446](../components/TunaInsightsDashboard.tsx#L446)) | $48/kg ([TunaRanching.tsx:725,975](../components/TunaRanching.tsx#L725)) | IMARC "중동 수산물 시장(2026-2034)" 보고서 또는 Atuna UAE 수입 단가 직접 조회. 단일 값 확정 |
| X5 | Pet care 캔드 baseline | 8.5% ([TunaInsightsDashboard.tsx:724](../components/TunaInsightsDashboard.tsx#L724)) | 4% ([TunaPetCareMargin.tsx:70](../components/TunaPetCareMargin.tsx#L70)) | **A3-2와 동일 — 동원 증권사 리포트로 통일 필요**. 캔드 영업이익률 baseline은 한 값으로 정렬 |
| X6 | MGO 연료 방향성 | "-28%" 효율 승리 ([TunaInsightsDashboard.tsx:99](../components/TunaInsightsDashboard.tsx#L99)) | "$2,100/t 폭등" ([TunaNewInsightsA.tsx:99](../components/TunaNewInsightsA.tsx#L99)) | **A5-1 narrative와 통합** — 2024 효율 -28% (정밀어업), 2026-Q2 호르무즈 봉쇄로 $2,000+ 급등(외생 충격). 두 사실 시점 명시로 모순 해소 |

*(Phase A7 완료. 최종 권고 정리 중)*

---

## Phase A 진행 로그
