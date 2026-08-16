# 새우 밸류체인 학습 페이지 — 자료 정찰

**작성:** 2026-08-17 · 정찰만 수행, 페이지 미제작
**아카이브:** `~/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data/01_수산물(Seafood)/shrimp/00_새우_관련자료`
**저장소:** `/private/tmp/squid-fix-20260817`

> 이 문서의 모든 수치는 **파일을 열어 확인한 것**이다. 열지 못한 것은 §3에 «미열람»으로 명시했다.

---

## 0. 한 줄 결론

새우의 축은 **어법이 아니라 «양식 vs 자연산»** 이다. 어법으로 축을 세우려 해도 **아카이브에 새우 어법별
어획 통계가 없다**(§5-b). 반면 양식/자연산은 FAO FishStat 원본에 `PRODUCTION_SOURCE_DET.CODE` 컬럼으로
1950~2024년 전 구간에 걸쳐 박혀 있어, 집계 스크립트로 곧바로 시계열이 나온다.

---

## 1. 아카이브에 실제로 있는 것

`00_새우_관련자료` 이하 13개 주제 폴더 + `tools`. 총 약 5,000 파일 · 약 1.4GB.

| 폴더 | 파일 수 | 용량 | 성격 |
| --- | ---: | ---: | --- |
| `00_운영` | 1,762 | 19M | 수집 파이프라인 운영 산출 — 매니페스트·수집영수증·이관로그 CSV. **1차 자료 아님** |
| `01_자연산_어획·자원` | 60 | 168M | 아르헨티나 SAGyP(양륙 xlsx)·INIDEP(자원조사)·CFP(규제) + FAO FishStat legacy |
| `02_양식·종묘·사료·질병` | 57 | 13M | NACA 분기 질병보고(xlsx 5개국)·**한국 KOSIS**·FAO FishStat legacy·인도네시아 GPMT |
| `03_무역·가격` | 1,693 | 465M | **최대 자산.** 15개 기관 — KCS·Eurostat·일본관세·태국MOC·NOAA·CNA·VASEP·SEAI·MPEDA·INDEC·BCE·FAO FPI·GLOBEFISH 가격·KMI FTA |
| `04_가공·완제품·기업` | 20 | 22M | Avanti Feeds·CPF 연차보고서 + FAO 가공생산 CSV |
| `05_시장·소매·소비` | 45 | 30M | FAO GLOBEFISH(분기 새우분석)·**KAMIS 도매가**·EUMOFA |
| `06_식품안전·검역·통관` | 15 | 3.5M | 한국 MFDS·미국 FDA 경보/수입거부·아르헨티나 SENASA·미국 무역구제 |
| `07_지속가능성·인증·ESG` | 11 | 2.8M | ASC·GDST·MSC·노동 |
| `08_국가·산업리포트` | 1,087 | 348M | FAO SOFIA 2026·인도 MPEDA·인도네시아 협회(AP5I/SCI/FUI)·FAO global |
| `09_이벤트·컨퍼런스` | 6 | 38M | INFOFISH International |
| `10_원본데이터셋` | 57 | 259M | **FAO FishStat 2026.1.0 스냅샷(2026-07-06)** + legacy 2024.1.0 + OEC |
| `11_분석·가공데이터` | 15 | 88K | 이전 세대 가공 JSON. **현행 아님**(§3 주의) |
| `99_격리·검토대기` | 214 | 21M | 범위외(참치)·판정대기 |

PDF는 전부 `.md` 짝을 갖는다(FAO SOFIA·GLOBEFISH·INIDEP·CFP·KMI 등 확인).

---

## 2. 이 품목의 밸류체인 축

### 2-1. 1순위 축 — 양식 vs 자연산 (그리고 그 역전의 역사)

참치·오징어에서 어법이 축이었던 이유(잡는 종·어장·배·시장이 전부 갈린다)를 새우에 그대로 적용하면
갈라지는 지점이 **양식이냐 자연산이냐**다. 종·지리·원가구조·계절성·리스크(질병 vs 자원)·인증체계가
이 한 갈래에서 전부 갈린다.

**FAO FishStat 2026.1.0 · ISSCAAP `Shrimps, prawns` · 2024년:**

| 구분 | 생산량 | 비중 |
| --- | ---: | ---: |
| 양식 | 8,810,922 t | **73.8%** |
| 자연산 | 3,135,769 t | 26.2% |
| 합계 | 11,946,690 t | 100% |

이건 정적인 비율이 아니라 **역전의 결과**라서 가르칠 거리가 된다. 1950년 양식은 1,325 t로 전체의
**0.3%**였다(자연산 412,165 t). 자연산은 1990년대 이후 150만~160만 t대에서 사실상 정체했고, 늘어난 수요를
양식이 전부 흡수했다. 새우는 **양식이 이긴 유일한 주요 수산 품목**이며, 이것이 참치·오징어와 근본적으로
갈리는 지점이다.

### 2-2. 2순위 축 — 단일종 지배 (흰다리새우)

**2024년 종별 생산 집중도:**

| 종 | 생산량 | 비중 |
| --- | ---: | ---: |
| 흰다리새우 (바나메이) | 7,662,369 t | **64.1%** |
| 블랙타이거 | 1,020,085 t | 8.5% |
| 새우류 기타 | 769,285 t | 6.4% |
| 젓새우 | 343,018 t | 2.9% |
| 북방새우 | 259,880 t | 2.2% |
| 기타 | 1,892,053 t | 15.8% |

한 종이 세계 생산의 **3분의 2**를 차지한다. 참치(가다랑어·황다랑어·눈다랑어 분산)나
오징어(살오징어·아르헨티나짧은지느러미 등 분산)에는 없는 구조다. 축 2는 여기서 나온다 —
**단일종 모노컬처 리스크**. 질병(EHP·WSSV·AHPND) 한 방이 세계 공급의 64%를 동시에 때릴 수 있다.

### 2-3. 3순위 축 — 한국은 세계와 정반대다 (도입부용 훅)

**KOSIS 어업생산동향 DT_1EW0004 · 2024년 한국 (열어서 집계, 합계행 제외):**

| 어업별 | 생산량 | 비중 |
| --- | ---: | ---: |
| 연근해어업 (자연산) | 26,566 t | **77.2%** |
| 해면양식업 (양식) | 7,839 t | 22.8% |
| 합계 | 34,405 t | 100% |

**세계는 양식 73.8% / 한국은 자연산 77.2%.** 비율이 뒤집혀 있다. 게다가 한국 품종 구성도 다르다 —
1위가 **젓새우류 17,176 t (49.9%)** 로, 새우젓이라는 한국 특유의 소비형태가 통계에 그대로 찍힌다.
흰다리새우 7,839 t(22.8%)는 **전량이 해면양식업**이다(양식 합계와 정확히 일치).

그리고 한국은 자국 생산을 압도적으로 초과해 수입한다 — 2023년 수입 **96,299 t** vs 2024년 국내생산
34,405 t로 약 **2.8배**. 2026년 1~5월 누계는 38,366 t · 3.029억 달러다(관세청).

→ 페이지 도입부의 훅: **"새우는 잡는 것"이라는 한국 독자의 직관이 세계 기준으로는 정확히 거꾸로다.**

### 2-4. 주요 생산국 — 양식/자연산으로 나누면 나라 성격이 갈린다

**2024년 상위 10개국 (양식 기준 정렬):**

| 국가 | 양식 | 자연산 | 양식 비중 |
| --- | ---: | ---: | ---: |
| 중국 | 2,698,379 | 1,003,346 | 72.9% |
| 베트남 | 1,287,327 | 147,503 | 89.7% |
| 인도 | 1,278,514 | 429,417 | 74.9% |
| **에콰도르** | 1,218,000 | 9,082 | **99.3%** |
| 인도네시아 | 956,464 | 272,660 | 77.8% |
| 태국 | 389,793 | 69,441 | 84.9% |
| 멕시코 | 215,954 | 42,638 | 83.5% |
| 브라질 | 146,832 | 37,306 | 79.7% |
| 방글라데시 | 90,241 | 0 | 100% |
| 베네수엘라 | 72,500 | 1,685 | 97.7% |

에콰도르는 **순수 양식국**(자연산 0.7%)이고, 아르헨티나는 그 반대편의 **순수 자연산국**(붉은새우
트롤 어업, `01_자연산_어획·자원/Argentina_SAGyP` 월별 양륙 xlsx 보유). 이 두 나라를 양 극단
사례로 세우면 축이 한 화면에서 설명된다.

### 2-5. 가공 단계 축 (보조)

FAO 가공생산 CSV(`9. 새우 가공 생산량 1976-2023.csv`, 174행 · 80개국 · 열어서 확인)는
**25개 가공형태**를 구분한다. 상위 형태와 보고국 수:

`냉동 nei` 71개국 · `조제·보존 nei` 25 · `건조/염장/훈제` 21 · `비밀폐 조제` 9 ·
`꼬리 껍질포함 냉동` 7 · `Shrimp meal(사료용)` 6 · `박피 냉동` 4 · `밀폐용기 조제` 4 ·
`Shrimp paste` 3 · `빵가루 입힘 냉동` 1 등.

한국 수입 가공형태 구성(2026 Q1, KMI): 냉동 73.7% / 조미가공 23.5% / 건조 2.4% / 기타 0.4%.

---

## 3. 원자료 후보

### 3-1. FAO FishStat — 축 1·2를 직접 만들 수 있는 원본

**`10_원본데이터셋/FAO_FishStat/snapshot_2026-07-06/`** (2026-07-06, 6개 CSV):

| 파일 | 크기 |
| --- | ---: |
| `FishStat_2026.1.0_global_production_shrimp.csv` | 3.86M |
| `FishStat_2026.1.0_capture_shrimp.csv` | 2.63M |
| `FishStat_2026.1.0_aquaculture_shrimp.csv` | 910K |
| `FishStat_2026.1.0_species_codes_shrimp.csv` | 76.6K |
| `FishStat_2026.1.0_latest_top_countries_shrimp.csv` | 2.9K |
| `FishStat_2026.1.0_summary_shrimp.csv` | 274B |

**최신 연도 2024.** long 포맷이며 컬럼은
`PERIOD` · `VALUE` · `PRODUCTION_SOURCE_DET.CODE` · `SPECIES.Name_En` · `SPECIES.ISSCAAP_Group_En` ·
`COUNTRY.Name_En`.

`PRODUCTION_SOURCE_DET.CODE`가 축 1의 정본이다 — 양식 = `BRACKISHWATER`+`FRESHWATER`+`MARINE`,
자연산 = `CAPTURE`.

> ⚠ **미열람 — 정직 표기.** 이 6개 파일은 **내용을 읽지 못했다.** 디렉터리 리스팅은 되지만 파일 내용
> 읽기가 Google Drive 스트리밍 단계에서 무한 대기한다(274B 파일에 10분 이상 0바이트, `cp`·`cat` 모두
> 동일). 위에 적은 스키마와 §2의 수치는 **저장소의 `scripts/shrimp_archive_to_widgets.py`(이 파일들을
> 파싱하는 코드) 와 그 산출물 `public/data/shrimp_real_data_v4.json`(각 위젯에 `sourceQuote` provenance
> 보유)를 열어 확인한 것**이다. 원본 대조는 파일을 로컬로 내려받은 뒤 재수행해야 한다.

**legacy FAO FishStat 2024.1.0** (wide 포맷, 1950~2024, 열림 확인):
`Capture_Quantity.csv` 40M · `Global_production_quantity.csv` 56M · `Aquaculture_Quantity.csv` 4.5M ·
`shrimp_global_production.csv` 4.1M · `shrimp_capture.csv` 2.9M, 그리고 한글명 세트
`1. 새우 생산량(전체)` ~ `9. 새우 가공 생산량`. wide 포맷 컬럼은
`Country (Name)` · `ASFIS species (Name)` · `FAO major fishing area (Name)` ·
**`Detailed production source (Name)`** · 연도별 `[1950]`~`[2024]` + 각 연도의 플래그 컬럼 `S`.

> ⚠ **버전 혼용 주의.** `11_분석·가공데이터/legacy_processed_data/shrimp_capture_vs_aqua.json`(열어서 확인)은
> 2024년을 자연산 1,589,438 t / 양식 9,501,242 t = **양식 85.7%** 로 적는다. §2의 73.8%와 다르다.
> 원인은 종 필터 — legacy는 좁은 종 리스트, v4는 `ISSCAAP='Shrimps, prawns'` 전체다. 저장소 HANDOFF에
> **legacy CSV에 담수갑각류가 섞여 2024 총량이 821,552 t(6.4%) 부풀려져 있었고 ISSCAAP 필터가 정정**
> 이라고 기록돼 있으며, 정정값 8,810,922 t는 FAO SOFIA 2026의 8,811천 t와 교차검증됐다.
> **`11_분석·가공데이터`는 폐기 세대로 취급하고 새 집계에 쓰지 말 것.**

### 3-2. 관세·통관 — 열어서 확인한 기계가독 자료

| 자료 | 기간 | 규모 | 컬럼 |
| --- | --- | ---: | --- |
| **한국 관세청** `03_무역·가격/Korea_KCS/extracts/20260816-...nitemtrade_shrimp_HS_partner_202401-202606.csv` | 2024-01 ~ 2026-06 (월별) | 1,775행 | `hs_query,hsCd,statKor,year,statCd,statCdCntnKor1,impDlr,impWgt,expDlr,expWgt,balPayments` |
| **한국 KOSIS** `02_양식·.../Korea_KOSIS/extracts/20260816-...shrimp_species_monthly_202401-202606.csv` | 2024-01 ~ 2026-06 (월별) | 2,724행 | 어업별(연근해/해면양식/내수면) × 품종별(8종) × 판매형태(활어·선어·냉동) × 생산량·생산금액 |
| **한국 KAMIS** `05_시장·.../Korea_KAMIS/extracts/20260816-KAMIS-wholesale_item654_202401-202608.csv` | 2024-01 ~ 2026-08 (일별) | 5,103행 | 도매가 `price` + 시장·등급 코드 |
| **일본 관세청** `03_무역·가격/Japan_Customs/extracts/20260816-...import_shrimp_HS9_partner_2024-2026.csv` | 2024 ~ 2026 (월별) | 341행 | HS9 × 국가 × 월별 수량·금액 |
| **EU Eurostat** `03_무역·가격/EU_Eurostat/extracts/20260816-...EU_import_shrimp_HS6_monthly_2024-2026.csv` | 2024-01 ~ 2026 (월별) | 1,252행 | HS6 × 파트너 × EU27 수입액/중량 |
| **미국 FDA 수입거부** `06_.../USA_FDA_refusals/extracts/20260816-...202401-202607.csv` | 2024-01 ~ 2026-07 | — | 거부 사유 코드 동반(`ACT_SECTION_CHARGES.csv`) |
| **FAO 가공생산** `04_가공·완제품·기업/legacy_raw_data/9. 새우 가공 생산량 1976-2023.csv` | 1976 ~ 2023 | 174행 / 80개국 | 25개 가공형태 × 국가 × 연도 |

### 3-3. 목록만 확인 (내용 미열람)

- **태국 MOC** `Thailand_Customs/extracts/` — HS030617 수출입, 2024 / 2025 / 2026H1 CSV+MD
- **미국 NOAA** `USA_NOAA/extracts/` — US import/export HTS × district, 2024-2026 CSV+MD
- **관세청 스냅샷** `Korea_KCS/snapshot_2026-07-06/` — `KCS_2026YTD_HS_shrimp.csv`, `HS_matrix_shrimp.csv`
  (저장소 파이프라인이 이미 소비 중)
- **아르헨티나 SAGyP** — 항구×선단×어종×월별 양륙 xlsx 4종 (2026-08-04 / 08-11 판)
- **에콰도르 CNA** — 월별 수출통계 xlsx (2026-05)
- **FAO FPI** `03_무역·가격/FAO_FPI/` — 어가지수 CSV, 2026-06까지
- **EUMOFA** — Monthly Highlights No.7 2026 Annex xlsx
- **NACA** — 분기 수생동물 질병보고 xlsx (인도·인니·베트남·말레이시아·필리핀)
- **인도네시아 AP5I** — `ap5i_all_period.csv`, `ap5i_filtered.csv`
- **OEC legacy** — HS 1030613/1030623 양자교역 CSV 6종
- **한국 MFDS** — 수입식품조회 xlsx (2026-08-11 스냅샷)

### 3-4. narrative 1차 자료 (PDF+MD 짝)

FAO SOFIA 2026 · FAO GLOBEFISH 분기 새우분석(2026-05, 2026-02, 2025-10) · GLOBEFISH Highlights
Issue 2 2026 · GLOBEFISH 유럽 어가보고서(2026-06) · KMI FTA 체결국 수산물 수입동향 2026 Q1·Q2 ·
INIDEP 붉은새우 하계조사(2026-03) · CFP 결의 5/2026·7/2026 · INFOFISH International Issue 2 2026 ·
Avanti Feeds 연차보고서 2025-26 · ASC 새우기준 v1.2.1 · GDST 1.2 · MSC 아르헨티나 붉은새우 인증 ·
MPEDA SHAPHARI 인증농장 목록.

---

## 4. 기존 저장소 자산

### 4-1. 컴포넌트·데이터

| 파일 | 크기 | 상태 |
| --- | ---: | --- |
| `components/ShrimpDashboard.tsx` | 38.4K | JSON 구동. `fetch('/data/shrimp_real_data_v4.json')` → 5-Pillar 렌더. **어디서도 import되지 않는 고아** |
| `components/ShrimpFTAQuarterly.tsx` | 13.8K | KMI 21개 분기 위젯. ShrimpDashboard가 customInject로 주입 |
| `components/ShrimpWidgetCommon.tsx` | 2.4K | 공용 조각 |
| `public/data/shrimp_real_data_v4.json` | 140K | **현행 정본** — KPI 6개 + 위젯 21개 |
| `public/data/shrimp_real_data_v3.json` | 248K | 이전 세대 |
| `app/shrimp/page.tsx` | — | **`notFound()` — 은퇴** (커밋 `2266f16`) |
| `app/api/shrimp/*/route.ts` | 11개 | forecast · usda-fas · sourcing-sim · emerging-markets · customs · dart · compliance · kamis · macro · esg-radar · krungsri |
| `scripts/shrimp_archive_to_widgets.py` | 1,641줄 | 아카이브 → v4 변환기. assert 6건 게이트, 데이터 함정 15건 코드화 |
| `scripts/score_shrimp_4axis.py` | 201줄 | O-04 4축 채점 |
| `artifacts/shrimp_4axis_scores.csv` | 22행 | 평균 90.7 (A 21 / B 1) |

`docs/`: `2026_shrimp_industry_sources.md`(1차 출처 14건) · `2026-08-13_shrimp_redesign_spec.md` ·
`2026-08-13_shrimp_redesign_p2_component.md` · `2026-08-13_shrimp_route_honesty_spec.md`.

### 4-2. 위젯 21개 구성 (v4 JSON, 전부 SYNCED/STATIC · LIVE 없음)

**S1 원료 수급 (5)** — 양식/자연산 교차 · 상위 10개국 양식·자연산 · 종별 집중도 ·
아르헨티나 붉은새우 월별 양륙 · 바이오플락 병원체 모니터링
**S2 가공·생산 (4)** — 가공품 생산 추이(1976-2023) · 가공형태별 생산 · 국가별 가공생산 역전 · 사료/가공 마진 분리
**S3 물류·통관 (4)** — 세계 수출국 3개년 · 에콰도르 월별 수출량·단가 · 재가공 허브 원료수입 · 한국 수입 냉동/조제
**S4 판매·수요 (5)** — 3대 수입시장 · Pink Sheet 명목가격(1960-2023) · 스페인 규격별 출고가 ·
한국 원산지별 단가 · 한국 가공형태별 구성
**S5 ESG (3)** — 인도 SHAPHARI 인증농장 · 베트남 이력추적 리스크 · 인증·표준 지형

### 4-3. ⚠ 반드시 알아야 할 이력

`HANDOFF.md`에 따르면 **이 페이지는 이미 한 번 만들어졌다가 은퇴했다.**

- **2026-08-13** — `/shrimp`를 «산업 이해 중심»으로 전면 개편. 위젯 80 → 21, 전부 아카이브 1차 실측으로
  교체. FishStat 2024.1.0(데이터 ~2022) → 2026.1.0(~2024) 이관. ISSCAAP 필터 정정으로 6.4% 과대계상 제거.
  `SHRIMP_API_SOURCES`·관세/환율 시뮬레이터 제거(출처 없는 발명 상수였음).
- **2026-08-15** — 새우 메뉴를 라이브에서 제거. `/shrimp`는 `notFound()`. `/api/shrimp/*`와 컴포넌트는 존치.
  아카이브 HTML(`intelligence_reports/Shrimp_Dashboard_Archive_2026-08-14.html`)이 대체.

즉 이번 학습 페이지는 **신규 제작이 아니라 부활 + 재구성**에 가깝다. 변환기·provenance 규율·데이터 함정
15건이 이미 코드에 박혀 있으므로 처음부터 다시 짜지 말 것.

---

## 5. 빈칸 — 페이지를 만들려면 필요한데 아카이브에 없는 것

**a. 양식 방식(집약·반집약·조방)의 정량 자료가 없다.**
후보 축이었지만 밀도(PL/m²)·수율·FCR을 국가별로 정리한 1차 통계가 아카이브에 없다. NACA는 질병 발생
보고이고 Avanti Feeds는 기업 재무다. → **양식 방식은 축으로 세울 수 없다.**

**b. 자연산 어법별 어획 통계가 없다.**
FishStat에는 어법 필드 자체가 없다(`FAO major fishing area`는 해역이지 어법이 아니다). 아르헨티나 SAGyP만
선단(flota) 구분을 갖지만 아르헨티나 한정이다. → **참치·오징어식 «어법 축»은 새우에서 성립하지 않는다.**
이것이 축을 양식/자연산으로 가져가야 하는 실증적 근거다.

**c. 종묘(broodstock·PL) 공급 구조가 통째로 비어 있다.**
SPF 종하 공급사 자료가 없다. 밸류체인 최상류가 공백이라 "새우 한 마리가 어디서 시작하는가"를 못 그린다.

**d. 사료 원가 구조 자료가 Avanti Feeds 1건뿐이다.**
어분·대두박 투입 비중, FCR, 생산원가 중 사료비 비율의 1차 수치가 없다. S2 «가공·생산» 기둥에서
원가를 다루려면 외부 수집이 필요하다.

**e. 가격 사다리가 도매에서 끊긴다.**
KAMIS 도매가는 일별로 있으나 **소매가·외식가가 없다.** 수입단가 → 도매 → 소매 마진 전가를 못 그린다.

**f. 원산지 → 재가공 허브 → 한국의 연결 자료가 없다.**
KCS는 HS로 냉동/조제를 나누지만, 어느 나라 양식새우가 어느 허브(태국·베트남)를 거쳐 오는지 잇는 자료가
없다. 현행 w12는 INFOFISH narrative 1건에 의존한다.

**g. 질병의 생산 영향이 정량화돼 있지 않다.**
NACA 분기보고는 국가별 발생 보고이지 생산 손실 톤수가 아니다. §2-2의 «모노컬처 리스크»를 숫자로
받치려면 EHP/WSSV/AHPND의 생산 감소 추정치가 따로 필요하다.

**h. FishStat 2026.1.0 원본 6개 파일을 열지 못했다.**
Drive 스트리밍 hang(§3-1). 수치 자체는 저장소 파이프라인·v4 JSON으로 교차확인했으나, 원본 대조는
파일을 로컬로 내려받은 뒤 재수행해야 한다.
