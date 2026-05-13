# 🥜 캐슈넛 인텔리전스 대시보드 — 하네스 포렌식 감사 리포트

> **평가 기준:** `.harness/skills/widget-reliability-audit/SKILL.md` (4축 100점 스코어링)  
> **대상 컴포넌트:** `CashewStrategy.tsx` (39 charts) + `CashewIntelligence.tsx` (50 KPIs)  
> **감사 일시:** 2026-05-07T22:58 KST

---

## 1. 하네스 무결성 검증 (Harness Integrity Check)

| 검증 항목 | 상태 | 비고 |
|---|---|---|
| **컴파일/빌드 무결성** | 🟢 PASS | `npm run build` → 0 Error |
| **데이터 파이프라인** | 🟢 PASS | `/data/cashew_data.json` 정상 로드 |
| **6-Part 구조 준수** | 🟢 PASS | 5-Part 밸류체인 구조 (Raw→Processing→Logistics→Sales→ESG) |
| **SIT/STRAT 구조화** | 🟢 PASS | 39개 위젯 전량 TakeawayBox 탑재 |
| **LIVE 뱃지 오남용** | 🔴 FAIL | 9대 네트워크 전부 하드코딩 `'live'`, SCSI=78 하드코딩 |
| **신뢰도 점수 오남용** | 🔴 FAIL | Intelligence 위젯 50개 전부 `reliability: 100` 하드코딩 |

---

## 2. 종합 스코어보드

### Part A: CashewStrategy (39 차트 위젯)

| 위젯 | 제목 | 점수 | 등급 | 핵심 출처 |
|---|---|---|---|---|
| w01 | 글로벌 캐슈넛 생산량 추이 | **95** | 🟢 S | FAOSTAT QCL 2000-2024 |
| w02 | 주요 7개국 생산량 경쟁 | **95** | 🟢 S | FAOSTAT QCL 2010-2024 |
| w03 | 아프리카 가공 혁명 Radar | **82** | 🟢 A | FAOSTAT + NotebookLM 융합 |
| w04 | 생산성 혁명: 주요국 단수(Yield) | **93** | 🟢 S | FAOSTAT QCL Yield |
| w05 | 원물 수매 가격 스프레드 | **80** | 🟢 A | FAOSTAT PP + 현지 가격 |
| w06 | 글로벌 RCN 수출 물량과 단가 사이클 | **93** | 🟢 S | FAOSTAT TM 2010-2024 |
| w07 | 주요국 생산자가격 비교 | **88** | 🟢 A | FAOSTAT PP (11개 null값 존재) |
| w08 | 아시아 가공 허브 수입 점유율 | **85** | 🟢 A | FAOSTAT TM |
| w09 | 총생산가치(GPV) Top 10 | **83** | 🟢 A | FAOSTAT QV (**데이터 오류 1건**) |
| w10 | 캐슈넛 '기근 달력' 시즌 | **78** | 🟡 B | NotebookLM + 현지 작황 |
| w11 | 글로벌 공급망 전환 레이더 | **80** | 🟢 A | FAOSTAT + 추정치(2025E,2026E) |
| w12 | 프리미엄 커널 등급별 가격 | **78** | 🟡 B | 현지 커널 시세 (VINACAS 참조) |
| w13 | SEZ 투자 매력도 매트릭스 | **72** | 🟡 B | 복합 추산 (GDIZ, PIA 등) |
| w14 | 아프리카 산지 가공 손실률 | **75** | 🟡 B | NotebookLM 팩토리 분석 |
| w15 | 커널 등급별 출하 비율 | **78** | 🟡 B | 현지 가공 QC 데이터 |
| w16 | 물류 히트맵: 원산지별 CIF 비용 | **80** | 🟢 A | 해운 물류 지수 |
| w17 | Chokepoint 분석 | **75** | 🟡 B | 글로벌 해운 인덱스 |
| w18 | 아프리카 원물 수매 추적기 | **82** | 🟢 A | FAOSTAT + 현지 가격 |
| w19 | 동남아 역내 소싱 비용 분석 | **80** | 🟢 A | FAOSTAT TM |
| w20 | 글로벌 커널 Top 10 수출 분석 | **90** | 🟢 S | FAOSTAT TM 2024 |
| w21 | 프리미엄 커널 등급별 가격 매트릭스 | **78** | 🟡 B | 현지 커널 시세 |
| w22 | 서플라이 체인 탄소 발자국 비교 | **72** | 🟡 B | ESG 모델링 (추정치 포함) |
| w23 | 운전자본(Working Capital)의 덫 | **75** | 🟡 B | NotebookLM 재무 분석 |
| w24 | 보르마(Borma) 수출 트렌드 | **82** | 🟢 A | FAOSTAT TM + 현지 통관 |
| w25 | 비건 대체유 시장 프리미엄 | **70** | 🟡 B | 시장 리포트 기반 추정 |
| w26 | CNSL 정제 단계별 부가가치 | **68** | 🟡 B | 화학공업 시세 + 추산 |
| w27 | 지정학적 차익거래: 토고 우회 수출 | **82** | 🟢 A | FAOSTAT TM + PIA 법령 |
| w28 | YOLOv8 AI 비전 선별기 혁신 | **72** | 🟡 B | AI 논문 데이터 |
| w29 | 보르마 vs 직수출 프리미엄 패러독스 | **75** | 🟡 B | 가격 비교 추산 |
| w30 | CNSL 제로 웨이스트 가치 창출 | **68** | 🟡 B | 부산물 가치 추산 |
| w31 | 캄보디아 캐슈 서프라이즈 | **85** | 🟢 A | FAOSTAT QCL+TM |
| w32 | 단수 혁신 ROI 시뮬레이터 | **78** | 🟡 B | FAOSTAT + 자체 시뮬레이션 |
| w33 | RCN vs Kernel 수출 가치 비교 | **85** | 🟢 A | FAOSTAT TM |
| w34 | SCSI 종합 지표 | **65** | 🟡 B | 복합 자체 모델링 |
| w35 | 마진 스퀴즈 분석 | **75** | 🟡 B | KCS+DART 교차 분석 |
| w36 | 단백질 전환 지표 | **72** | 🟡 B | 글로벌 영양 통계 추정 |
| w37 | 식약처 살모넬라 적발율 | **85** | 🟢 A | MFDS API 기반 |
| w38 | 제조사 Margin Squeeze | **78** | 🟡 B | KCS+DART 교차 |
| w51 | IMO 2023 환경규제 물류비 | **72** | 🟡 B | IMO 규제 기반 추정 |

**차트 위젯 가중평균: 79.4점 → A등급 🟢**

---

### Part B: CashewIntelligence (50 매크로 인텔리전스 KPI)

> ⚠️ **일괄 감사 적용:** 50개 위젯 전부 `reliability: 100` 하드코딩은 하네스 규정 위반입니다.

| 탭 | 위젯 수 | 평균 점수 | 등급 | 주요 출처 |
|---|---|---|---|---|
| Tab1: 거시경제 & 타리프 패권 | 10 | **71** | 🟡 B | CBP, 1D1F 법령, TCDA, NotebookLM |
| Tab2: 로컬 파이낸싱 & 딥소싱 | 10 | **65** | 🟡 B | 현지 파이낸싱, NotebookLM, 작황 데이터 |
| Tab3: 스마트 팩토리 ROI | 10 | **68** | 🟡 B | 1D1F CAPEX, AI 논문, NotebookLM |
| Tab4: 제로웨이스트 & B2B | 10 | **67** | 🟡 B | B2B 시세, NotebookLM, 마켓 추정 |
| Tab5: EUDR / ESG 방어 | 10 | **72** | 🟡 B | EUDR, ILO, GIPC, NotebookLM |

**Intelligence KPI 가중평균: 68.6점 → B등급 🟡**

### 주요 감점 사유

| 감점 원인 | 해당 위젯 수 | 감점 범위 |
|---|---|---|
| NotebookLM 단독 출처 (SRC -10~-15) | 11개 | SRC 10~15/25 |
| 모호한 출처명 ("매뉴얼", "인덱스") (SRC -8~-12) | 11개 | SRC 13~17/25 |
| 수치 재현 불가 (VRF -10~-15) | ~30개 | VRF 10~15/25 |
| 범위값 ('180~200', '8~10') (VRF -5) | 4개 | VRF 15~20/25 |

---

## 3. 발견된 치명적 결함 (Critical Defects)

| # | 결함 | 심각도 | 위치 |
|---|---|---|---|
| **D1** | 9대 네트워크 전부 하드코딩 `'live'` — 허위 LIVE 뱃지 | 🔴 CRITICAL | `CashewStrategy.tsx:253-263` |
| **D2** | SCSI Index = 하드코딩 `78` — 산출 공식 없음 | 🔴 CRITICAL | `CashewStrategy.tsx:292` |
| **D3** | Intelligence 위젯 50개 전부 `reliability: 100` — 과대 표시 | 🔴 CRITICAL | `CashewIntelligenceData.ts` |
| **D4** | w09: 국가명 오류 `'인도(India)네시아'` → `'인도네시아(Indonesia)'` | 🟠 HIGH | `cashew_data.json` w09 |
| **D5** | w07: 11개 null값 (일부 국가 연도별 가격 미수집) | 🟡 MEDIUM | `cashew_data.json` w07 |
| **D6** | w11: 2025E/2026E 추정치에 Estimate 뱃지 미부착 | 🟡 MEDIUM | `cashew_data.json` w11 |
| **D7** | w01: 2024년 데이터 — FAOSTAT 공식 발표 미확인 (추정 가능성) | 🟡 MEDIUM | `cashew_data.json` w01 |
| **D8** | NotebookLM 출처 11개 위젯에 `[📊 Data Pipeline Verified]` 오남용 | 🟠 HIGH | `CashewIntelligenceData.ts` |
| **D9** | 교육 가이드: "$454/t vs $1,960/t" 인용 — 데이터 일치(✅) 확인 | ✅ PASS | `CashewStrategy.tsx:357` |

---

## 4. 위젯 상세 채점표 (대표 위젯)

### w01: 글로벌 캐슈넛 생산량 추이 — 95점 🟢 S

| 축 | 점수 | 근거 |
|---|---|---|
| SRC | 25/25 | FAOSTAT QCL — UN FAO 공식 DB, Tier-1 |
| FRS | 23/25 | 2000-2024 시계열. 2024 데이터 포함 (검증 필요) |
| VRF | 23/25 | FAOSTAT에서 1:1 대조 가능 (2018/2020/2022 교차검증 완료, 오차 <0.1%) |
| INT | 24/25 | SIT/STRAT가 생산 추이 데이터와 논리적 정합 |

### w09: 총생산가치 Top 10 — 83점 🟢 A

| 축 | 점수 | 근거 |
|---|---|---|
| SRC | 24/25 | FAOSTAT QV — 공식 DB |
| FRS | 22/25 | 2024 데이터 |
| VRF | 18/25 | `'인도(India)네시아'` 표기 오류 발견 → 데이터 무결성 감점 |
| INT | 19/25 | 가치 분석은 타당하나 표기 오류가 프로페셔널리즘 훼손 |

> **감점 사유:** 국가명 `'인도(India)네시아'`는 번역 과정의 버그. `'인도네시아(Indonesia)'`로 수정 필요.

### Tab2-Widget4: 중개상(Middlemen) 누수율 18% — 62점 🟠 C

| 축 | 점수 | 근거 |
|---|---|---|
| SRC | 12/25 | NotebookLM 파이낸싱 모델 — 자체 추산, Tier-4 |
| FRS | 15/25 | 시점 불명 |
| VRF | 10/25 | 18%라는 수치를 제3자가 재현 불가능 |
| INT | 25/25 | 비즈니스 맥락은 정확함 |

> **감점 사유:** `reliability: 100`이나 실제는 C등급. NotebookLM 분석에 `[📊 Data Pipeline Verified]` 뱃지는 과대 표시.

### LIVE Command Center — 40점 🔴 D

| 축 | 점수 | 근거 |
|---|---|---|
| SRC | 5/25 | 9개 API 이름만 나열, 실제 API 호출 로직 0% |
| FRS | 10/25 | timestamp만 실시간, 나머지 정적 |
| VRF | 5/25 | 어떤 네트워크도 실제 health-check하지 않음 |
| INT | 20/25 | 레이아웃/UX는 우수하나 데이터가 거짓 |

---

## 5. 등급별 그룹핑

### Tier 1 — 고신뢰 (80+) : 21개 위젯

w01(95), w02(95), w04(93), w06(93), w20(90), w07(88), w31(85), w37(85), w33(85), w03(82), w18(82), w24(82), w27(82), w08(85), w11(80), w16(80), w19(80), w05(80), w09(83)

> ✅ FAOSTAT 직결 위젯들이 핵심 신뢰 기둥을 형성합니다.

### Tier 2 — 중신뢰 (65~79) : 18개 위젯

w10, w12, w13, w14, w15, w17, w21, w22, w23, w25, w26, w28, w29, w30, w32, w34, w35, w36, w38, w51

> 🟡 NotebookLM 분석 또는 산업 리포트 기반. 실증 앵커링이 필요합니다.

### Tier 3 — 저신뢰 (<65) : LIVE Command Center + Intelligence KPI 일부

> 🔴 LIVE 패널(40점)과 신뢰도 과대표시 Intelligence KPI들.

---

## 6. 신뢰도 향상 로드맵

| 우선순위 | 대상 | 현재 | 목표 | 필요 조치 |
|---|---|---|---|---|
| 🔴 1 | LIVE Command Center | 40 | 75+ | 실제 API health-check 구현 또는 정적 라벨로 전환 |
| 🔴 2 | SCSI Index (78) | 40 | 80+ | 동적 산출 공식 구현 (원물가+환율+물류비+리스크 가중 합산) |
| 🔴 3 | reliability: 100 (50개) | 과대 | 실질 | NotebookLM 출처 → 60~75, 모호 출처 → 50~70으로 개별 조정 |
| 🟠 4 | w09 국가명 버그 | 오류 | 수정 | `'인도(India)네시아'` → `'인도네시아(Indonesia)'` |
| 🟠 5 | `[📊 Data Pipeline Verified]` 오남용 | 11개 | 삭제 | NotebookLM 단독 출처에서 뱃지 제거, `[📐 AI Analysis]`로 교체 |
| 🟡 6 | w11 추정치 라벨 | 미표시 | 표시 | 2025E/2026E에 Estimate 뱃지 부착 |
| 🟡 7 | w07 null값 | 11개 | 채움 | FAOSTAT PP 결측 연도 보충 또는 'N/A' 명시 표시 |

---

## 7. 결론

| 항목 | 결과 |
|---|---|
| **차트 위젯 (39개) 가중평균** | **79.4점 — A등급 🟢** |
| **Intelligence KPI (50개) 가중평균** | **68.6점 — B등급 🟡** |
| **LIVE Command Center** | **40점 — D등급 🔴** |
| **전체 대시보드 종합** | **73.2점 — B등급 🟡** |

### 등급 분포

| 등급 | 위젯 수 | 비율 |
|---|---|---|
| 🟢 S (90+) | 5 | 5.6% |
| 🟢 A (80-89) | 16 | 18.0% |
| 🟡 B (65-79) | 64 | 71.9% |
| 🟠 C (50-64) | 3 | 3.4% |
| 🔴 D (<50) | 1 | 1.1% |

### FAOSTAT 교차검증 결과

| 연도 | 대시보드 | FAOSTAT 공식 | 오차 | 판정 |
|---|---|---|---|---|
| 2018 | 3,712,918t | ~3,713,000t | 0.0% | ✅ |
| 2020 | 3,703,120t | ~3,703,000t | 0.0% | ✅ |
| 2022 | 4,020,956t | ~4,020,000t | 0.0% | ✅ |

> **핵심 판단:** FAOSTAT 직결 차트 위젯은 S/A급 고신뢰를 확보하고 있으나, **LIVE Command Center 허위 뱃지(D1)**, **SCSI 하드코딩(D2)**, **reliability 과대표시(D3)**의 3대 결함이 대시보드 전체 신뢰도를 B등급으로 하락시키고 있습니다.

### 가장 시급한 개선 3건

1. **LIVE 뱃지 진실화:** 9개 API 네트워크 상태를 실제 health-check 기반으로 전환하거나, `'LIVE SYNCING'` 라벨을 `'DATA SOURCES'`로 변경
2. **reliability 정직화:** NotebookLM/모호 출처 위젯의 reliability를 60~75 범위로 개별 재조정
3. **SCSI 동적 산출:** 원물가 변동률 + 환율 + 물류비 + 기후 리스크의 가중 합산 공식 구현
