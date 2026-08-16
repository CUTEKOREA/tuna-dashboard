# 골뱅이(whelk) 밸류체인 학습 페이지 — 자료 정찰

- 작성: 2026-08-17 [CC]
- 아카이브: `~/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data/01_수산물(Seafood)/whelk/`
- 원칙: **파일을 열어 확인한 것만 기재.** 열지 못한 것은 §6에 명시.

---

## 1. 아카이브에 실제로 있는 것

총 298개 파일. 단 **`extras/` 하위 8개 폴더(fishstat·kcs_trade·mof_kcs·oec_trade·kamis·kosis·fao_global·rfmo)와
`faostat/raw`·`faostat/filtered`·`processed_data`·`usda_psd`·`worldbank`는 전부 빈 디렉터리다.**
`update_2026-07-06/`도 `.DS_Store` 하나뿐이다. 실물은 전량 `00_골뱅이_관련자료/` 아래에 있다.

| 폴더 | 파일 | 성격 |
|---|---:|---|
| `00_운영` | 36 | 재편성 매니페스트·source_registry.csv·검증 로그 |
| `01_자연산_어획·자원` | 45 | ICES·DEFRA·MMO·Ifremer·MFRI·DFO·TURKSTAT·CONAPESCA·KOSTAT |
| `02_양식·종묘·사료·질병` | 5 | China MOA 어업경제통계공보뿐 |
| `03_무역·가격` | 18 | HMRC·EUMOFA·KMI FTA·Seafish·CSO·NOAA·UK MMO |
| `04_가공·완제품·기업` | 2 | DART 검색 결과(§5 참조) |
| `05_시장·소매·소비` | 6 | KAMIS 스크린샷 + FAO GLOBEFISH |
| `06_식품안전·검역·통관` | 18 | — |
| `07_지속가능성·인증·ESG` | 2 | DEFRA FMP 환경보고서 |
| `08_국가·산업리포트` | 8 | SOFIA 2026·GFCM·BIM·USDA GAIN |
| `10_원본데이터셋` | 94 | **FAO FishStat 원본·KCS XML·KOSIS JSON·COMTRADE JSON** |
| `11_분석·가공데이터` | 48 | **위 원본의 파생 CSV — 여기가 핵심** |

`10`·`11`이 실질이다. 최신 갱신은 **2026-08-16**(어제)로, 참치·오징어 아카이브보다 파일 수는 적어도
**기계가독 1차 자료의 밀도는 낮지 않다.** 특히 `11_분석·가공데이터`의 README들이
바스켓 함정을 이미 명시적으로 경고하고 있다 — 이건 이 아카이브의 강점이다.

---

## 2. 이 품목의 밸류체인 축

### 2-1. 축은 어법이 아니다 — **종 구분 × 제품 형태**다

참치(선망/연승)·오징어(채낚기/트롤)와 달리 골뱅이는 어법이 축이 될 수 없다. 이유는 §2-4.
실측으로 확인된 축은 두 개다.

### 2-2. 제1축 — 종 구분: 「골뱅이」는 **4개 과(科)가 섞인 바스켓**이다

`11_분석·가공데이터/FAO_FishStat/updates/2026-08-16/species_groups/README.md`가 직접 못박는다:

> Do not add groups together as "world whelk".

FAO 2026.1.0 기준 28개 ASFIS 코드를 과(科)별로 갈랐을 때 **2024년 생산량(톤, 활중량)**:

| 그룹 | 과(Family) | 어획 | 양식 | 합계 | 비중 |
|---|---|---:|---:|---:|---:|
| **rapana** (피뿔고둥류) | MURICIDAE | 14,295.1 | 361,919.0 | 376,214.1 | **83.2%** |
| **buccinum** (참골뱅이류) | BUCCINIDAE | 35,743.5 | 0.0 | 35,743.5 | 7.9% |
| **residual_nei** (고둥류 NEI) | 혼합 | 35,090.4 | 3.4 | 35,093.8 | 7.8% |
| **babylonia** (동풍라류) | BABYLONIIDAE | 3,867.0 | 0.0 | 3,867.0 | 0.9% |
| **busycon** (미국고둥류) | MELONGENIDAE | 1,118.0 | 0.0 | 1,118.0 | 0.2% |

출처: `species_groups/{global_production,capture,aquaculture}_2024_by_group.csv`

**세계 「골뱅이」 생산량의 83%가 사실은 참골뱅이가 아니다.**
rapana 376,214 t 중 361,919 t은 **중국 양식 피뿔고둥(*Rapana venosa*, 脉红螺)** 이다.
한국이 통조림으로 먹는 참골뱅이(*Buccinum undatum*)와는 과(科)가 다르다.

2024년 buccinum 어획 상위 (`capture_2024_by_group_country.csv`):
영국 16,511.0 / 프랑스 7,695.6 / 캐나다 5,410.2 / 아일랜드 4,590.4 / 노르웨이 458.0 —
**한국은 0이다.**

### 2-3. 제2축 — 국산 vs 수입: **다른 종이자 다른 제품**

**국산 측 — 한국은 FAO에 종을 보고하지 않는다.**

`capture_with_group.csv`(2,707행, 1950–2024)를 한국으로 필터하면
**1970–2024년 55개 연도 전부 단일 코드 `GAS`(Gastropods NEI, 고둥류 미분류)** 다.
참골뱅이(WHE)·피뿔고둥(RPW) 등 종 단위 보고는 **단 한 해도 없다.**

| 연도 | 한국 FAO 보고 | KOSIS 대응 |
|---|---|---|
| 1990 | GAS 6,389 t | 골뱅이(130303) 6,382 t |
| 2010 | GAS 7,242 t | 고둥류(130311) 7,242 t |
| 2020 | GAS 9,530.203 t | 고둥류 9,530.20341 t |
| 2024 | GAS 9,669.783 t | 고둥류 9,669.78291 t |

소수점까지 일치한다 — **FAO의 한국 수치는 KOSIS 고둥류의 그대로 넘어간 값이다.**

여기에 **국내 통계 자체의 코드 단절**이 겹친다
(`10_원본데이터셋/KOSIS/KOSIS_DT_1EW0004_extract_20260816.md`):

- `130303 골뱅이 / Whelk` — **1990–2009**. 2010년 이후 셀 없음(err 30)
- `130311 고둥류 / Gastropoda` — **2010–2025**
- `130310 소라 / Sea snail` — **별도 종. 합산 금지** (2024 2,652.8 t / 2025 3,543.5 t)

즉 국내 시계열도 1990–2009와 2010–2025가 **다른 코드**다. 골뱅이 130303은
1993년 8,352 t 정점 이후 2009년 1,288 t까지 붕괴하고 단절된다.
고둥류 130311은 2010년 7,242 t에서 2023년 10,757.3 t까지 올랐다가 2025년 9,170.8 t.
**두 계열을 한 선으로 그으면 안 된다.**

**수입 측 — 영국·아일랜드산 *Buccinum*, 조제저장품.**

KCS 2024 HS 160559 수입 (`KCS_2024_160559_import_by_partner.csv`):

| HS10 | 상대국 | 수입액 USD | 수입량 kg | 시사단가 $/kg |
|---|---|---:|---:|---:|
| 1605591090 | 영국 | 30,455,373 | 2,388,236 | 12.75 |
| 1605591090 | 아일랜드 | 7,574,115 | 617,040 | 12.27 |
| 1605599090 | 중국 | 3,893,052 | 590,673 | 6.59 |
| 1605599090 | 튀르키예 | 3,619,733 | 271,300 | 13.34 |
| 1605599090 | 세네갈 | 3,612,721 | 766,014 | 4.72 |
| 1605599090 | 모리타니 | 1,717,610 | 438,638 | 3.92 |
| 1605599090 | 베트남 | 1,165,746 | 470,738 | 2.48 |

**단가가 종을 배신한다.** 영·아 12~13 $/kg(북대서양 *Buccinum*) vs
세네갈·모리타니·베트남 2.5~4.7 $/kg. 3~5배 격차는 같은 종일 수 없다.
튀르키예 13.34는 TURKSTAT 확인상 *Rapana venosa*(deniz salyangozu)다.

KMI 확인 (`KMI_FTA_imports/whelk_fta_quarterly.md`):
2020→2024 수입 물량 −44.3% / 금액 −49.4%, 2025 H1 +17.6% / +36.2% 회복.
영국 점유율 2024 76.0% → 2025 H1 **84.7%**. 조제저장 처리 **99.9%**.
그리고 **2025년부터 KMI 통계명이 「골뱅이」→「고둥」으로 재분류**됐다 — 이름 자체가 흔들린다.

### 2-4. 어법 — 축으로 못 쓴다

영국 측은 자료가 충분하다. DEFRA FMP(`20231214-UK_DEFRA-Whelk_FMP_English_waters.md` L680):

> The common whelk fishery is primarily targeted by vessels under 10 metres,
> fishing almost exclusively with **baited pots**

ICES WKWF 2025는 pot selectivity·soak time·LPUE(kg/100 pots)까지 다룬다.
프랑스는 경보기준선 110 kg/100 pots, 저지는 0.62 kg/pot.

**그러나 한국 측 어법(통발) 자료는 아카이브에 없다.** KOSIS DT_1EW0004는 `objL1=1 연근해어업`
단일 값이고 어법 분해가 없다. 어법을 축으로 세우면 **영국 이야기만 하는 페이지**가 된다.
어법은 축이 아니라 「영국 원물 공급 리스크」 위젯의 근거로 쓰는 게 맞다.

### 2-5. 제품 형태 — 측정 가능한 제2축

HS 章 분리가 가장 깨끗하다 (`trade_classification/HS_matrix_whelk.csv`).
그리고 **한국은 수입과 수출에서 서로 다른 물건을 다룬다** (`KCS_2023_2024_scoped_partner_annual.csv`):

| 흐름 | HS10 | 품명 | 상대국 | 2024 금액 | 물량 |
|---|---|---|---|---:|---:|
| 수입 | 1605591090 | 조제저장(기타) | 영국 | $30.46M | 2,388 t |
| **수출** | 0307911000 | **소라(활·신선)** | 일본 | $3.19M | 828 t |
| **수출** | 0307919000 | 기타(활·신선) | 중국 | $11.01M | 3,876 t |
| **수출** | 1605591010 | 밀폐용기 조제 | 미국 | $2.36M | 222 t |

**국산 원물은 활·신선으로 일본·중국에 나가고, 통조림 원료는 조제저장품으로 영국에서 들어온다.**
이건 한 품목의 두 개 밸류체인이 반대 방향으로 흐르는 구조다. 페이지의 중심 서사가 될 수 있다.

---

## 3. 원자료 후보 (전부 열어서 확인)

### 3-1. FAO FishStat — 있다. 종 그룹 분해까지 끝나 있다

`11_분석·가공데이터/FAO_FishStat/updates/2026-08-16/species_groups/`

| 파일 | 내용 |
|---|---|
| `capture_with_group.csv` | **2,707행 · 1950–2024 · 28종 · 39개국.** `species_group` 컬럼 부착 완료 |
| `global_production_with_group.csv` | 2,831행 (어획+양식) |
| `aquaculture_with_group.csv` | 124행 |
| `species_group_mapping.csv` | ASFIS alpha3 → 5개 그룹 매핑 |
| `{capture,aquaculture,global_production}_2024_by_group[_country].csv` | 2024 집계 |
| `capture_korea_2024_by_group.csv` | 한국 = residual_nei 9,669.783 단일 행 |

컬럼: `COUNTRY.UN_CODE, SPECIES.ALPHA_3_CODE, AREA.CODE, MEASURE, PERIOD, VALUE, STATUS,
SPECIES.Name_En, SPECIES.Scientific_Name, SPECIES.ISSCAAP_Group_En, COUNTRY.Name_En, species_group`

**FAO 분류에서 골뱅이가 잡히는 방식**: ISSCAAP Group **52**(고둥류). 전용 코드가 없고
28개 코드에 흩어진다. `ASFIS_sp_2026.1_whelk_related.csv`(28행, 과·목 포함)에서
`FishStat_Data=YES`인 것은 **WHE, WJT, WHX, WKQ, WKO, YJS, RPW, RPN, GAS 9개뿐**이고
나머지 19개는 명목상 코드다. 원본 `ASFIS_sp_2026.1.csv/.xlsx` 전체도
`01_자연산_어획·자원/FAO_FishStat_documentation/`에 있다.

FishStat 원본 코드리스트(`10_원본데이터셋/FAO_FishStat/capture_legacy/`)에
`CL_FI_SPECIES_GROUPS.csv`, `CL_FI_WATERAREA_GROUPS.csv`, `CL_FI_COUNTRY_GROUPS.csv`,
`DSD_FI_CAPTURE.xlsx`, `Capture_Quantity.csv` 동봉.

### 3-2. 관세청(KCS) — 있다. HS 코드 스코프도 정리돼 있다

**HS 코드** (`HS_matrix_whelk.csv` + `KCS_202606_202607_scope.md`):

| HS6 | 단계 | 설명 |
|---|---|---|
| 030791 | 활·신선·냉장 | 기타 연체동물 — 광의 폴백 |
| 030792 | 냉동 | 기타 연체동물 — 광의 폴백 |
| 030799 | 기타 가공 | 기타 연체동물 |
| **160559** | **조제저장** | 기타 연체동물 조제품 — **수입 주력** |

**제외 확정**: `030781`·`030783` = 전복(Haliotis), `160558` = 달팽이.
> Do not sum 030781/030783 into whelk trade.

원본 XML: `10_원본데이터셋/KCS_trade/2023_2024/` 12개 (HS 030781/030783/030789/030791/030799/160558/160559 × 2023·2024),
`2026/` 4개 (0307·1605 × 202606·202607).
파생: `KCS_2023_2024_scoped_partner[_annual].csv`, `KCS_202606_202607_HS_whelk_{scoped,all_matched}.csv`.

**단, HS10 확정은 안 됐다** (`KCS_2024_HS10_note.md`):
> CLIP 공식 10자리 품명 원문은 이번 회차에 못 받았다. **1090을 골뱅이 전용세번으로 단정하지 말 것.**

API `statKor`는 6자리 잔여명 '기타'만 준다. 영·아 물량이 1605591090에 몰리는 건 사실이나
그 세번이 골뱅이 전용이라는 근거는 아직 없다. **페이지에서 이 한계를 명시해야 한다.**

### 3-3. 그 밖의 기계가독 자료 — 전부 열어 확인

| 자료 | 경로 | 내용 |
|---|---|---|
| **KOSIS DT_1EW0004** | `10_원본데이터셋/KOSIS/` JSON 5개 | 골뱅이 130303(1990–2009)·고둥류 130311(2010–2025)·소라 130310, 생산량+생산금액, 월간 2020.01–2026.06, 시도별 2020–2025 |
| **COMTRADE** | `10_원본데이터셋/COMTRADE/` JSON 8개 | UK/IE → KR 2024, HS 030791·030799·160559 미러 |
| **TURKSTAT** | `TURKSTAT/TOB_TUIK_deniz_salyangozu_2015_2025.csv` | 튀르키예 피뿔고둥 11개 연도. 2019 11,646.3 → 2025 6,526.8 t |
| **CONAPESCA** | `CONAPESCA/*.csv` 4개 | 멕시코 caracol 2023·2024, 주(entidad)별. 2024 활중량 15,843.8 t / 양륙 7,573.2 t / 271.3M MXN |
| **HMRC** | `HMRC/HMRC_202606_BDS_03079100_16055900.csv` | 영국 2026.06 comcode·상대국·항구별. KR향 16055900 STN 975,345 GBP / 88,830 kg |
| **KMI FTA** | `KMI_FTA_imports/whelk_fta_quarterly.{md,json}` | 21개 분기 PDF에서 추출. 연도별·원산지 점유·분기 단가 |
| **UK MMO** | `UK_MMO/*.ods` 3개 | SFS2024 Section 2 Landings·Section 4 Trade (매니페스트: "Contains whelk rows") |

`10_원본데이터셋/external_sources_manifest.csv`와 `00_운영/source_registry.csv`에
**URL·발행일·SHA256·retrieved_at**이 붙어 있다. 출처 추적은 문제없다.

---

## 4. 기존 저장소 자산

| 경로 | 내용 |
|---|---|
| `components/WhelkDashboard.tsx` | 1,064행. WidgetCard 30개 + WhelkFTAQuarterly 1개 |
| `components/WhelkFTAQuarterly.tsx` | 209행 |
| `public/data/whelk_real_data_v1.json` | 31개 계열 |
| `app/whelk/page.tsx` | 라우트 |
| `app/api/whelk/{dart,kcs,live}/route.ts` | 3개 |

**시그니처 그라디언트는 룰북 D-04에 등재돼 있다**: 골뱅이 = `amber → brown` (#fbbf24 → #92400e).

### 4-1. 아카이브와 대조했을 때 기존 JSON의 오류 (실측 대비)

| 계열 | 저장소 값 | 아카이브 실측 | 판정 |
|---|---|---|---|
| `globalCaptureData` 한국 label | `"B. opisoplectum"` | 한국은 1970–2024 전 연도 **GAS 단일**. 종 보고 없음 | **날조** |
| `globalCaptureData` 멕시코 label | `"Rapa whelk"` | 멕시코 2024 = GAS 14,969.7 t. Rapana 아님 | **오류** |
| `globalCaptureData` 러시아 label | `"B. borealis"` | 러시아 2024 = GAS 4,145 + RPW 2,088. Buccinum 없음 | **오류** |
| `koreaCaptureData` 2024 | 8,750 | KOSIS·FAO 공히 **9,669.78** | **오류** |
| `koreaCaptureData` "2026 (E)" | 8,200 | 근거 없음 | **추정치 혼입** |
| `blackSeaSupplyData` 튀르키예 2024 | 4,300 | TURKSTAT·FAO **6,961.6** | **오류(−38%)** |
| `importMarketShare` | 영 30.46 / 아 7.57 / 중 4.88 / 튀 4.17 / 세 3.63 | KCS 2024와 **전부 일치** | **정확** |

`WhelkDashboard.tsx:432` 위젯:
> "한국 골뱅이 어획 글로벌 순위 (FAO 2022) — 한국 세계 5위(**종코드 7종 합산**)"

**아카이브 README가 금지한 바로 그 합산이다.** 순위 자체는 FAO 집계상 성립하지만
(2024 기준 한국 3위), 그건 4개 과를 한 바구니에 넣었기 때문에 나오는 순위다.
**학습 페이지가 해체해야 할 대상이 이미 저장소 안에 있다.**

---

## 5. 없는 것 — 음성 증거도 확인했다

이건 추정이 아니라 **아카이브가 "없음"을 명시적으로 기록한 것**이다.

- **국내 가격 시계열 불가.** `05_시장·소매·소비/KAMIS/20260816-KAMIS-수산물품목_골뱅이고둥소라_없음.md`:
  중도매인 판매가격 수산물 품목 16개(고등어·갈치·명태·물오징어·마른멸치·북어·마른오징어·김·
  마른미역·굴·전복·새우·가리비·건다시마·홍합·삼치)에 **골뱅이·고둥·소라 없음.** 스크린샷 3장 첨부.
- **기업 품목 매출 불가.** `04_가공·완제품·기업/DART/`: 동원F&B·사조씨푸드·사조대림·오뚜기
  2025 사업보고서 `document.xml` 본문에서 「골뱅이·고둥·whelk·피뿔」 **4사 모두 0회.**
  > 품목 매출을 공시에서 만들 수는 없다.
- **한국 양식 자료 없음.** `02_양식·종묘·사료·질병`은 China MOA 5개 파일뿐. 골뱅이 양식은 중국 rapana만.
- **한국 어법(통발) 자료 없음.** §2-4.
- FAO GLOBEFISH Highlights 1-2026: 매니페스트 note "No whelk string in text extract."
- USDA GAIN Korea Seafood 2025: "Mentions snails in shellfish grouping, not a whelk table."

---

## 6. 확인 못 한 것

- `UK_MMO/*.ods` 3개 — 매니페스트가 "Contains whelk rows"라 하나 **직접 열지 않았다.**
  영국 양륙량·무역 수치는 이 파일을 열어야 확정된다.
- `06_식품안전·검역·통관`(18개) 내용 미열람. §5의 "동원F&B 냉동 자숙 골뱅이살 42건/2년 MFDS 조회"는
  `04/README.md`가 인용한 것이지 원본을 본 게 아니다.
- `00_골뱅이_관련자료/99_격리·검토대기`(1개) 미열람.
- `DEFRA FMP_evidence_gaps.ods`, `EUMOFA Annex xlsx`(19.6MB), CONAPESCA `.xlsx` 원본 미열람.
- `app/api/whelk/{dart,kcs,live}/route.ts` 3개 라우트의 LIVE 여부 미검증.
- WhelkDashboard 30개 위젯 중 §4-1에 적은 것 외 나머지 계열은 대조하지 않았다.

---

## 7. 판정 — **만들 만하다. 다만 축을 바꿔서.**

### 근거

1. **바스켓 함정이 참치·오징어보다 선명하다.** 세계 「골뱅이」 생산의 83%가 참골뱅이가 아니고,
   한국은 FAO에 55년간 종을 한 번도 보고하지 않았다. **가르칠 것이 명확히 있다.**
2. **1차 자료가 기계가독이다.** FishStat 2,707행 × 1950–2024 × 종그룹 부착 완료,
   KOSIS 3개 코드 36년, KCS XML 16개, COMTRADE·TURKSTAT·CONAPESCA·HMRC.
   위젯을 원자료에서 다시 계산할 수 있다.
3. **아카이브가 이미 함정을 경고한다.** README 3개가 "합산 금지"를 명시한다.
   페이지는 그 경고를 시각화하면 된다.
4. **기존 저장소에 고칠 것이 있다.** §4-1의 날조 라벨과 −38% 오차는 페이지의 존재 이유가 된다.

### 제안 축 — 「어법」이 아니라 「종 × 방향」

```
축 1  종 구분     4개 과 해체 — rapana 83% / buccinum 7.9% / NEI 7.8% / babylonia / busycon
축 2  통계 정체성  한국 = GAS 단일코드 55년 · KOSIS 130303↔130311 단절 · KMI 「골뱅이」→「고둥」 개명
축 3  두 방향 흐름  수입 = 영국 Buccinum 조제저장 / 수출 = 국산 소라·고둥 활신선 → 일본·중국
축 4  단가 검증    12.75 $/kg(영) vs 2.48 $/kg(베) — 단가로 종을 역추적
```

어법은 **영국 원물 리스크 위젯의 근거**로만 쓴다(pot·MCRS 45mm·LPUE). 축으로 세우지 않는다.
한국 측 어법 데이터가 없어 반쪽이 된다.

### 팀리드가 제안한 대안에 대해

「통조림 원료 조달 구조 집중」은 **축 3의 절반**이다. 그것만 하면 수출 방향(소라 828 t → 일본,
기타 3,876 t → 중국)이 빠지고, 페이지가 「영국 의존도 리스크」 브리핑으로 축소된다.
**조달 구조는 살리되 종 해체를 1축에 두는 것**을 권한다 — 바스켓 함정이 이 품목의 핵심이고,
그게 참치·오징어 페이지와 같은 골격이다.

### 반드시 페이지에 명시할 한계

- HS 1605591090을 골뱅이 전용세번으로 단정 불가 (CLIP 10자리 품명 미확보)
- 국내 소매·도매 가격 시계열 부재 (KAMIS 미수록)
- 기업 품목 매출 부재 (DART 4사 0회)
- 130303↔130311 계열을 한 선으로 연결 금지
- 130310 소라를 고둥류에 합산 금지
