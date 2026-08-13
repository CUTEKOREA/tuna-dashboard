# /shrimp 전면 개편 — 변환기 구현 명세 (P1)

> 목적: 새우 **산업의 이해**. 조달 의사결정 도구 아님.
> 산출: `scripts/shrimp_archive_to_widgets.py` → `public/data/shrimp_real_data_v4.json`
> 결과: 위젯 80 → 21, 신규 렌더러 0, LIVE 0

---

## 0. 절대 규칙

1. **Drive 아카이브는 읽기 전용 원천.** `ARCHIVE` 경로 아래에 쓰기·이동·삭제 금지. 출력은 레포 안에만.
2. **§2 캐노니컬 상수 밖의 생산 수치를 만들어내지 마라.** 보간·추정·합성 금지. 결측은 결측으로 둔다.
3. **선형보간 절대 금지.** 현행 `w01`이 상수 델타 보간으로 실측을 위장한 것이 이번 개편의 최대 사유다.
4. **narrative 출처(MD/PDF) 위젯은 원문 수치를 그대로 옮긴다.** 재계산·환산·연환산 금지. 각 위젯에 `sourceQuote` 필드로 원문 문장/표 라인을 남긴다.
5. **`syncDate`는 스냅샷 일자가 아니라 데이터 빈티지다.**
6. 실패는 조용히 넘어가지 말고 예외로 던진다. 부분 산출 금지.

```python
ARCHIVE = "/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data/01_수산물(Seafood)/shrimp/00_새우_관련자료"
```

---

## 1. CLI

```
python3 scripts/shrimp_archive_to_widgets.py            # v4 JSON 생성
python3 scripts/shrimp_archive_to_widgets.py --verify   # assert 게이트만 실행, 파일 미기록
```

`--verify`는 §6 assert 6건을 돌리고 통과 시 exit 0, 실패 시 어긋난 값을 출력하고 exit 1.

의존성은 표준 라이브러리 + `openpyxl`만. pandas 사용 금지(레포 런타임 의존성 아님).

---

## 2. 캐노니컬 상수 — 하드코딩 금지, 산출 결과가 이 값과 일치해야 함

FishStat CSV에는 새우와 **담수갑각류가 섞여 있다.** `SPECIES.ISSCAAP_Group_En == 'Shrimps, prawns'` 필터 필수.

| 지표 (2024) | 필터 후 (**정본**) | 필터 전 (등장 금지) |
|---|---:|---:|
| 양식 | **8,810,922 t** | 9,501,198 |
| 자연산 어획 | **3,135,769 t** | 3,267,045 |
| 총생산 | **11,946,690 t** | 12,768,242 |
| 양식 비중 | **73.8 %** | 74.4 % |
| 흰다리 비중 | **64.1 %** | 60.0 % |

교차검증: 필터 후 양식 8,810,922 t ↔ FAO SOFIA 2026 Marine shrimps **8,811천 t**.

> ⚠️ `FishStat_2026.1.0_latest_top_countries_shrimp.csv`는 **미필터 집계다. 사용 금지.** long CSV에서 `filter_shrimp_species()`로 재집계한다. 그대로 쓰면 Top국 막대(중국 양식 3,219,603)와 종별 파이(필터 후 2,698,379)가 19% 어긋나고 양식 2위가 인도→베트남으로 순위까지 바뀐다.

---

## 3. 공유 함수 3개 (중복 구현 금지)

두 곳에서 따로 필터링하면 합계가 어긋난다. 반드시 단일 함수를 공유한다.

```python
def filter_shrimp_species(rows):
    """ISSCAAP 'Shrimps, prawns'만. 담수갑각류 93종 제외."""
    return [r for r in rows if r["SPECIES.ISSCAAP_Group_En"] == "Shrimps, prawns"]

def cna_resumen_monthly(ws):
    """CNA RESUMEN 시트 10~122행만 슬라이스 (AB~AE열: Mes/Libras/Dólares/Precio)."""

def truncate_pinksheet(rows):
    """2023M10 이후 절단. 2023M11~2026M03 29개월이 전부 '1079' 상수 손상."""
```

---

## 4. 데이터 함정 15건 — 전부 실측 확인됨

| # | 함정 | 처리 |
|---|---|---|
| T1 | FishStat 담수갑각류 혼입 | `filter_shrimp_species()` |
| T2 | Comtrade 총계행 미필터 | (이번 범위에서 Comtrade 미사용) |
| T3 | Comtrade 최신연도 커버리지 2025 리포터 47(29%) | 세계 순위는 GLOBEFISH 표 사용, Comtrade 재집계 금지 |
| T4 | PinkSheet 2023M11 이후 29개월 `1079` 상수 손상 | `truncate_pinksheet()`. **"실질가격" 문구 금지** — 디플레이터 없는 명목 단일 계열 |
| T5 | SAGyP 8월 3,067.9 t은 **8/1~8/4 나흘치** | `partial: true` 플래그 부여. 그대로 그리면 7월 45,552 t 대비 -93% 붕괴 착시 |
| T6 | CNA RESUMEN 122행 아래 126행부터 `VARIACIÓN HISTÓRICA MENSUAL`·`RESUMEN DEL PERÍODO ACUMULADO` 두 블록이 **같은 열에 이어 붙음** | 10~122행만. 미적용 시 ene-may 누적 1,474,371,079 lbs를 한 달로 오독 |
| T7 | KCS `030617`만 집계 시 조제(1605) 누락 | **356행 4개 HS 전체 사용.** 030617만 쓰면 베트남 $131.5M→$72.5M(45% 소실), 태국은 상위 6위 밖으로 사라져 "가공은 제3국에서" 논지가 자멸 |
| T8 | 에콰도르 CNA vs BCE -11% 불일치 | CNA만 사용. BCE 미채택 |
| T9 | `legacy_raw_data/5~8번` 파일명 역전 | (이번 범위 미사용) |
| T10 | `Aquaculture_Value.csv` 2022 종료 + ISSCAAP 컬럼 없음 | **미채택** |
| T11 | NACA 셀값 범주형(`-`,`+()`,`***`) | **미채택** |
| T12 | FDA IA 16-18·USITC HTML에 `<table>` 0개 | **미채택**. 미국 관세는 #14 SIT/TAK 서술로 |
| T13 | MFDS 새우 363행이 **전부 제조국=아르헨티나 단일** | **미채택**. 채택 시 아르헨티나 주인공화 |
| T14 | 가공생산 CSV의 `Totals - Tonnes – net product weight` 행 | 국가 집계에서 **반드시 제외**. 파일 마지막 CC-BY 인용문 1줄(1컬럼)도 skip |
| T15 | EU 1인당 소비 실수치 4개뿐(2019·2020 결측) | **미채택** |

---

## 5. 위젯 21 + KPI 6

### 5.1 v3에서 그대로 승계 (7개)

`public/data/shrimp_real_data_v3.json`에서 아래 id를 읽어 v4로 옮긴다. **`data` 배열은 손대지 않는다.** 단 아래 두 가지는 고친다.

- `telemetry` → `SYNCED` 또는 `STATIC` (LIVE 금지)
- `syncDate` → 실제 데이터 빈티지 (아래 표)

| v3 id | v4 pillar | syncDate 교정 |
|---|---|---|
| `w03_processing` | S2 | `FAO 가공생산 2023년` |
| `w_proc1_type_production` | S2 | `FAO 가공생산 2023년` |
| `w_proc2_kr_import_type` | S4 | `KMI 2026년 1분기` |
| `w50_kfas_bft_pathogen` | S1 | `2021년 서해권역 조사 (Gye et al., 2023)` |
| `w_kr_shrimp_origin_price` | S4 | `KMI 2026년 1분기` |
| `w_india_shaphari` | S5 | `MPEDA 2026-03-05` |
| `w_vn_traceability_risk` | S5 | `Seafood Watch SSRT V2 (2026-01-07)` |

승계 시 SIT/TAK 텍스트도 함께 옮기되, **`w03_processing`의 SIT 중 "85.3%"는 파이 자체 분모로는 87.92%이므로 87.9%로 교정한다.**

### 5.2 신규 생성 (14개)

공통 필드: `id`, `title`(한글+단위 괄호), `subtitle`, `chartType`, `pillar`, `telemetry`, `syncDate`, `source`, `sourceQuote`, `sit`, `strat`, 그리고 차트 데이터.

> **차트 포맷 주의**: `renderChart`의 NEW FORMAT 분기는 `xKey`/`bars`/`lines`/`areas` 중 하나라도 있으면 진입하며 `pie`·`area`·`bar`·`composed`만 지원한다. **`line`은 NEW FORMAT에서 "Unsupported"로 떨어진다.** `line` 차트는 반드시 OLD FORMAT(`xAxis` + `series` 배열)으로 emit할 것. 해당 위젯은 `W15`뿐이다.

---

#### S1 원료 수급 (5) — 이 산업의 공급은 무엇으로 이루어져 있는가

**W01 · 양식과 자연산의 교차 (톤)** — `area`
- 출처: `10_원본데이터셋/FAO_FishStat/snapshot_2026-07-06/FishStat_2026.1.0_global_production_shrimp.csv`
- `filter_shrimp_species()` 후 `PERIOD` × `PRODUCTION_SOURCE_DET.CODE` 집계.
  - 양식 = `BRACKISHWATER` + `FRESHWATER` + `MARINE`, 자연산 = `CAPTURE`
- x축 `PERIOD` 1950~2024 전 연도. **결측 연도를 보간하지 마라.**
- `fate`: REFRESH:`w01_paradigm_shift` (기존 보간 계열 전량 폐기)
- syncDate: `FishStat 2026.1.0 (2024년 기준)`

**W02 · 상위 10개국 생산 — 양식과 자연산 (톤)** — `bar` (bars 2개)
- 같은 CSV, `PERIOD == '2024'`, `filter_shrimp_species()` 후 `COUNTRY.Name_En` 집계.
- 양식·자연산 두 계열을 각각 산출하고, **양식 기준 상위 10개국**으로 x축 고정.
- `fate`: MERGE:`w04_top10_aqua`+`w05_top10_catch`
- ⚠️ `latest_top_countries` CSV 사용 금지 (T1)

**W03 · 종별 생산 집중도 (%)** — `pie`
- 같은 CSV, 2024, 필터 후 `SPECIES.Name_En` 집계. 상위 5종 + 기타(잔차).
- 기대값: 흰다리 7,662,369(64.1%) / 블랙타이거 1,020,085(8.5%) / Natantian NEI 769,285(6.4%) / Akiami paste 343,018(2.9%) / Northern prawn 259,880(2.2%)
- 제목·SIT에 **64.1%**를 쓴다. 60%는 미필터 값이므로 금지.

**W04 · 아르헨티나 붉은새우 월별 양륙 (톤)** — `bar`
- 출처: `01_자연산_어획·자원/Argentina_SAGyP/20260804-…Maritime_Landings_2026_through_04_August/260804_Desembarques_2026.xlsx`
- `Especie_Mes` 시트, 헤더는 6~7행, Crustáceos 블록의 `Langostino` 행.
- 기대값(t): 1월 27,522.590 / 2월 15,228.184 / 3월 5,955.048 / 4월 1,753.389 / 5월 6,080.914 / 6월 38,976.113 / 7월 45,552.392 / 8월 3,067.892 → 누계 144,136.522
- **8월 데이터 포인트에 `partial: true` + 라벨 `8월(1~4일)`** (T5). subtitle에 "8월은 8/1~8/4 나흘치" 명시.
- SIT에 선단 구성 추가: Tangoneros 59,962.289(41.6%) / Fresq. Altura 39,871.657(27.7%) / Fresq. Costeros 34,529.076(24.0%) / Rada o Ría 9,761.736(6.8%). 아르헨티나 2026 총양륙 584,927.777 t 중 langostino 24.6%.
- ⚠️ 아르헨티나 위젯은 **이 1개뿐이다.** 항구·선단 별도 위젯을 만들지 마라 (주인공화 금지).

**W05** = §5.1 `w50_kfas_bft_pathogen` 승계

---

#### S2 가공·생산 (4) — 원물은 어디서 형태가 바뀌는가

**W06** = §5.1 `w03_processing` 승계
**W07** = §5.1 `w_proc1_type_production` 승계

**W08 · 국가별 가공생산 역전 (톤)** — `bar` (bars 2개: 2013 / 2023)
- 출처: `04_가공·완제품·기업/legacy_raw_data/9. 새우 가공 생산량 1976-2023.csv`
- 와이드 포맷: `Country (Name), Commodity (Name), Element (Name), Unit (Name), Unit, [1976], S, [1977], S, …, [2023], S`
- **`Totals - Tonnes – net product weight` 행 제외, 마지막 CC-BY 인용문 1컬럼 행 skip** (T14)
- 국가별로 제품형태(24종)를 합산한 뒤 2013·2023 두 해만 취한다.
- x축은 **두 해 각각의 상위 8개국 합집합(9개국)**. 2023년만 기준으로 자르면 최대 하락국 태국이 9위(101,407 t)로 밀려 차트에서 사라지는데 SIT은 그 값을 인용하게 되어 차트-텍스트 비동기가 된다.
- 기대 방향(제품형태 24종 전량 합산 기준): 에콰도르 5.7배 / 인도 3.0배 / 베트남 2.3배 / **태국 -52.7% · 중국 -46.6%**
  > ⚠️ 초기 스캔이 보고한 "태국 -35% · 중국 -22%"는 단일 제품형태 행만 본 값이다. 전량 합산이 정본.
- 이 위젯이 답하는 것: **질병 충격(EMS·AHPND)이 산업 지도를 어떻게 다시 그렸는가.** SIT에 그 인과를 쓰되 "질병" 인과는 GLOBEFISH·INFOFISH 서술을 인용 출처로 달 것. 자체 추정 금지.

**W09 · 사료와 가공의 마진 분리 (%)** — `bar` (bars 2개: FY2024-25 / FY2025-26)
- 출처: `04_가공·완제품·기업/Avanti_Feeds/20260724-Avanti_Feeds-Avanti_Feeds_Annual_Report_2025-26.md`
- x축 2개 사업부(새우사료 / 가공새우), y축 부문 마진율(%).
- 값: 새우사료 11.98 → 12.79 / 가공새우 4.12 → 7.59
- subtitle에 **"인도 새우사료 시장 51~53% 점유 1개사 실적 — 세계 대표값 아님"** 못박기.
- ⚠️ 루피(₹cr) 절대금액을 환율로 환산하지 마라 (A-01). 마진율만 축으로.

---

#### S3 물류·통관 (4 + EXTRA 1) — 사슬은 어디로 흐르는가

**W10 · 세계 수출국 3개년 물량 (천 톤)** — `bar` (bars 3개: 2023/2024/2025)
- 출처: `05_시장·소매·소비/FAO_GLOBEFISH/20260525-…Quarterly_Shrimp_Analysis_-_May_2026.md` (표 "World top exporters of shrimp", 약 90~105행)
- 원문 표 그대로 (천 톤):

| 국가 | 2023 | 2024 | 2025 | 증감 |
|---|---:|---:|---:|---:|
| 에콰도르 | 1220.59 | 1218.58 | 1405.84 | +15 |
| 인도 | 717.61 | 738.51 | 804.20 | +9 |
| 베트남 | 292.99 | 327.86 | 335.28 | +2 |
| 인도네시아 | 220.84 | 213.66 | 218.87 | +2 |
| 중국 | 148.39 | 178.23 | 198.84 | +12 |
| 태국 | 137.29 | 136.77 | 129.31 | -5 |
| 아르헨티나 | 141.05 | 154.07 | 119.77 | **-22** |
| 합계 | 3754.97 | 3822.11 | 3973.84 | +4 |

- 아르헨티나 -22%와 태국 -5%를 색으로 구분해 W04(자연산 축 계절성)·W08(가공 역전)과 서사를 잇는다.
- ⚠️ Comtrade 재집계로 대체하지 마라 (T3).

**W11 · 에콰도르 월별 수출량과 단가 (백만 파운드 · 달러/파운드)** — `composed` (bar=Libras, line=Precio, 이중축)
- 출처: `03_무역·가격/Ecuador_CNA/20260701-…CNA_Ecuador_Shrimp_Export_Statistics_-_May_2026.xlsx`
- `cna_resumen_monthly()` — RESUMEN 시트 **10~122행만** (T6). AB~AE열 = Mes / Libras / Dólares / Precio Prom.
- 2017-01 ~ 2026-05, 113개월. 마지막 행 검증: `2026-05-01 | 364,949,874 | 846,630,195.4 | 2.319853…`
- `fate`: MERGE:`w46_ecuador_dominance`+`w_sales2_exporter_trend`
- SIT에 목적지 재편 추가: 2026 ene-may 중국 51.2% · 미국 21.8% · 유럽 17.8% (2025 유럽 21.9%에서 급락) — `MERCADO PAÍS ACUM` 시트.

**W12 · 재가공 허브의 원료 수입 (톤)** — `bar`
- 출처: `09_이벤트·컨퍼런스/INFOFISH/20260306-…INFOFISH_International_Issue_2_2026.md`
- 값: 베트남 85,000 t (+55%) / 태국 22,320 t (+42%). 2025년 기준. 공급원 에콰도르·인도는 라벨 텍스트로만.
- ⚠️ 원문에서 인도네시아·중국이 180,535 t **동일값으로 인쇄된 오식 의심 구간은 위젯에서 배제**하고 각주로만 언급 (T11 계열).
- 이 위젯이 답하는 것: 왜 산지가 완제품까지 만들지 않고 제3국을 한 번 더 경유하는가.

**W13 · 한국 수입 — 냉동과 조제 (백만 달러)** — `bar` (bars 2개: 0306 냉동 / 1605 조제)
- 출처: `03_무역·가격/Korea_KCS/snapshot_2026-07-06/kcs/KCS_2026YTD_HS_shrimp.csv`
- **356행 4개 HS 전체 사용** (`030616`,`030617`,`160521`,`160529`). `year == '총계'` 행 제외 (T7).
- `hs/HS_matrix_shrimp.csv`로 단계 라벨링(`1_frozen` / `3_prepared`).
- x축 = `statCdCntnKor1`(교역국) 상위 8, y축 `impDlr`.
- 검증 기대값(4개 HS 합, 2026.01~05): 베트남 $131.5M · 중국 $71.8M · 페루 $26.9M · 태국 $23.5M · 말레이시아 $13.6M · 아르헨티나 $12.8M. 총 $302,938,190 / 38,365,684 kg.
- subtitle에 **"2026년 1~5월 누계 — 연환산·전년동기비 산출 불가"** 명시.
- `fate`: REFRESH:`w17`

**EXTRA** — `ShrimpFTAQuarterly` 컴포넌트는 코드에 이미 있다. JSON에서 건드리지 않는다.

---

#### S4 판매·수요 (5) — 값은 어디서 매겨지는가

**W14 · 3대 수입시장 규모 (천 톤)** — `bar` (bars 3개: 2023/2024/2025)
- 출처: 같은 GLOBEFISH Quarterly 표 "World top importers of shrimp" (약 228~247행)
- 원문 표 그대로 (천 톤): 중국 1071.89 / 1000.51 / **989.54 (-1)** · 미국 788.11 / 776.60 / **795.64 (+2)** · 일본 199.94 / 215.44 / 219.22 · 스페인 175.65 / 180.53 / 186.23 · 프랑스 124.90 / 122.22 / 137.17 (+12) · **한국 96.30 / 104.98 / 109.02 (+4)** · 네덜란드 82.29 / 83.99 / 99.55 (+19). 합계 3738.60 / 3683.80 / 3735.91
- 미국 2025 상세는 SIT에: 795,640 t / USD 7,024M.
- **관세는 별도 위젯을 만들지 않는다.** 미국 관세 변화는 이 위젯의 SIT/TAK 서술로만 다루고, 세율 수치를 단정하지 마라 (T12 — USITC HTML은 4,505자 뉴스릴리스로 세율표가 없다).
- EU 종별 구성(warmwater 54% / miscellaneous 35% / coldwater 10%)을 SIT에 인용할 경우 **"2024년 기준"**으로 못박을 것. 2023 아님.

**W15 · 국제 새우가격 1960~2023 (달러/kg)** — `line` — **반드시 OLD FORMAT(`xAxis` + `series`)으로 emit**
- 출처: `03_무역·가격/legacy_raw_data/PinkSheet_Shrimp.csv`
- `truncate_pinksheet()` — 2023M10까지 766포인트. 검증: 첫행 `1960M01, 1.433003`, 마지막 유효 `2023M10, 8.598018`
- **"실질가격" 문구 금지.** 명목 단일 계열이다 (T4). 제목·SIT 모두 "명목" 명기.
- subtitle에 규격 명시: World Bank Pink Sheet의 새우 계열은 `Shrimps, Mexican, west coast, frozen, 26-30 count` 단일 규격 프록시다. "글로벌 새우 국제가"로 일반화하지 마라.
- `fate`: REPLACE:`w_log1_spot_price`

**W16 · 규격별 호가 — 스페인 EXW (유로/kg)** — `bar` (bars 2개: 양식 / 자연산)
- 출처: `03_무역·가격/FAO_GLOBEFISH_prices/20260717-…European_Fish_Price_Report_June_2026.md` (약 1683~1740행)
- **거래조건을 Spain EXW 하나로 통제한다.** 표에는 EXW·FOB·CIF·CFR·wholesale·retail이 뒤섞이고 Reference&Area 칸이 빈칸 상속(forward-fill)이므로, 다른 조건 행을 섞으면 안 된다.
- 값 (EUR/kg):

| 사이즈(pc/kg) | 흰다리새우 Whole | 아르헨티나 붉은새우 Head-on shell-on |
|---|---:|---:|
| 10-20 | — | 9.50 |
| 20-30 | 6.35 | 9.50 |
| 30-40 | 5.85 | 9.50 |
| 40-50 / 40-60 | 5.35 | 8.00 |
| 50-60 | 5.30 | — |

- 이 위젯이 답하는 것: 양식은 사이즈에 따라 계단형으로 값이 내려가는데 자연산은 사이즈 무관 평탄하다 — 두 축이 서로 다른 가격 논리 위에 있다.
- **단발 1개월 빈티지다.** 시계열로 그리지 마라. subtitle에 `2026년 6월 단일 시점` 명시. telemetry `STATIC`.

**W17** = §5.1 `w_kr_shrimp_origin_price` 승계
**W18** = §5.1 `w_proc2_kr_import_type` 승계

---

#### S5 ESG·지속가능성 (3) — 무엇이 사슬을 뒤에서 조이는가

**W19** = §5.1 `w_india_shaphari` 승계
**W20** = §5.1 `w_vn_traceability_risk` 승계 (기존 `w_shrimp_forced_labor_map`·`w58_vn_labor_audit`을 흡수 — 세 위젯이 같은 Seafood Watch 베트남 보고서 1건을 쪼개 같은 중간상 비율을 70/70/72로 제각각 표기했다)

**W21 · 인증·표준 지형** — **차트 없음.** `chartType: "none"` + `customBody` 배열
- 출처: `07_지속가능성·인증·ESG/` 실존 문서 5종
  - ASC Shrimp Standard v1.2.1 (2023-07-01)
  - GDST 1.2 Core Normative Standards (2025-02-01)
  - MSC
  - MPEDA SHAPHARI (2026-03-05)
  - Seafood Watch SSRT V2 (2026-01-07)
- 각 항목 = `{name, issuer, version, date, scope}` 한 줄. 점수·순위·커버리지 % 를 **만들어내지 마라** — 아카이브에 그 수치가 없다.
- 렌더는 `WidgetCard`의 `customBody`로. `ShrimpFTAQuarterly.tsx`가 같은 패턴의 모범이니 참고.

---

### 5.3 KPI 6

| # | title | value | telemetry | syncDate |
|---|---|---|---|---|
| 1 | 세계 새우 총생산 | `11,946,690톤` | STATIC | `FishStat 2026.1.0 · 2024년` |
| 2 | 양식 비중 | `73.8%` | STATIC | `FishStat 2026.1.0 · 2024년` |
| 3 | 흰다리새우 비중 | `64.1%` | STATIC | `FishStat 2026.1.0 · 2024년` |
| 4 | 세계 교역액 | `284.2억 달러` | STATIC | `FAO GLOBEFISH · 2025년` |
| 5 | 최대 수출국 에콰도르 | `1,405,840톤` (trend `+15%`) | STATIC | `FAO GLOBEFISH · 2025년` |
| 6 | 한국 수입 | `3.029억 달러` (desc에 `38,366톤`) | STATIC | `관세청 · 2026년 1~5월 누계` |

KPI 1·2·3은 **W01/W03 산출 결과에서 파생 계산한다.** 하드코딩 금지 — 위젯과 KPI가 어긋나는 것이 현행 결함(KPI 4개 빈티지 오라벨)의 원인이다.
KPI 6은 "5개월 누계"를 `desc`에 못박고 **연환산·YoY를 만들지 마라.**

---

## 6. assert 게이트 (`--verify`)

필터 **후** 값으로 작성한다. 필터 전 값을 고정하면 자체검증이 버그를 지킨다.

```
1. aquaculture 2024        == 8_810_922   ±1
2. capture 2024            == 3_135_769   ±1
3. global_production 2024  == 11_946_690  ±1
4. (1) + (2) == (3)                        ±1
5. 흰다리 비중             == 64.1 %      ±0.1
6. SOFIA 교차               8_810_922 ≈ 8_811_000  (±1,000)
```

추가 무결성 검사:
- v4 위젯 수 == 21, KPI 수 == 6
- 모든 위젯에 `pillar` 필드 존재, 값이 `S1`~`S5` 중 하나 (현행 v3는 pillar가 0개라 `extract_shrimp_widgets.py`가 전건 None을 반환한다)
- pillar 분포 == S1:5, S2:4, S3:4, S4:5, S5:3
- 모든 위젯에 `source`, `syncDate`, `telemetry` 존재. `telemetry ∈ {SYNCED, STATIC}` — **LIVE 0건**
- 금칙 문자열 0건: `illustrative`, `자체 추정`, `업계 추정`, `자체 합성`, `NotebookLM`, `LIVE API 연동`, `실시간 연동중`
- `chartType == 'line'` 인 위젯은 `xAxis`+`series`를 갖고 `xKey`/`bars`/`lines`/`areas`를 **갖지 않아야** 한다 (NEW FORMAT 진입 시 Unsupported로 떨어짐)
- 미필터 값 등장 금지: JSON 전문에 `9501198`, `3267045`, `12768242` 문자열이 없어야 한다

---

## 7. 참고 — 하지 말아야 할 것

- `~/agri_pipeline`에 의존하지 마라. registry·data가 통째로 없어 `agri_convert.py`는 첫 호출에서 `FileNotFoundError`로 죽는다. 이번 변환기는 그 경로를 쓰지 않는다.
- `scripts/build_shrimp_widgets.py`·`process_shrimp_claude.py`를 고치려 들지 마라. 입력 `data/새우/`가 레포에 없어 실행 불가다. 새 파일 1개로 끝낸다.
- `public/data/shrimp_real_data_v3.json`을 덮어쓰지 마라. v4를 새로 만든다.
- 컴포넌트(`components/ShrimpDashboard.tsx`)는 이 작업 범위가 아니다. P2에서 별도로 다룬다.
