# Codex 작업 지시서 — 골뱅이 대시보드 v2

- 발행: 2026-08-13 / Claude Code
- 상위 기획서: `docs/WHELK_REDESIGN_PLAN_2026-08-13.md` (승인 완료)
- 담당: **Codex** (P1~P3) / **OpenCode** (P4) / 검증: Claude Code (P5)

---

## ⚠️ 0. 시작 전 필수 확인

### 0.1 브랜치 — 현재 작업트리는 오염 상태다

```
현재 브랜치: squid-v5
git status: D 42개 / ?? 35개 / M 4개  ← 오징어 v5 작업 진행 중
```

**이 상태에서 작업하지 말 것.** 반드시 별도 워크트리를 만들어라.

```bash
cd ~/my-project/tuna-dashboard
git worktree add ../tuna-dashboard-whelk-v2 -b codex/whelk-v2 main
cd ../tuna-dashboard-whelk-v2
npm install
```

작업은 전부 `codex/whelk-v2` 브랜치에서. `squid-v5` 브랜치의 파일은 **절대 건드리지 말 것**.

### 0.2 선독 문서

1. `AGENTS.md` — 세션 규율, 알려진 함정
2. `COMPREHENSIVE_RULEBOOK.md` — L-03(빌드 게이트), L-09(정직 LIVE), L-12(isLive 표준), W-04(pillar 의무)
3. `UI_RULES.md` — Glassmorphism, 한글 7자 축약, Recharts 규약
4. `scripts/squid_build/README.md` — **이번 작업이 복제할 원본 아키텍처**
5. `node_modules/next/dist/docs/` — 이 저장소 Next.js는 학습 데이터와 다르다. 코드 쓰기 전 해당 가이드를 읽어라.

### 0.3 절대 금지

| 금지 | 이유 |
|---|---|
| Google Drive 아카이브에 **쓰기** | 아카이브는 읽기전용 원천. 2026-06-08 Drive sync 손실 전례 |
| 프로덕션·Vercel 배포 | 사용자 "배포" 명시 지시 전까지 금지 |
| `telemetry: 'LIVE'` 표기 | 정적 JSON 소비 위젯에 LIVE 금지 (L-09) |
| `data ? 'SYNCED' : 'STATIC'` 식 truthiness 격상 | 라우트 선언값을 그대로 전달 (L-12) |
| 아카이브에 근거 없는 수치 생성 | 없으면 빈 카드로 남긴다 |
| `components/Squid*.tsx` 수정 | 타 브랜치 작업 중 |

---

## 1. 담당 파일 (Codex 잠금)

```
scripts/whelk_build/**                      신규
scripts/validate_whelk_v2.py                신규
public/data/whelk_v2.json                   신규 (빌더 산출물)
app/api/_shared/hs-codes.ts                 수정 (whelk_* 항목만)
app/api/whelk/kcs/route.ts                  수정
app/api/whelk/live/route.ts                 수정
components/WhelkDashboard.tsx               수정
components/WhelkFTAQuarterly.tsx            수정 (telemetry 부착만)
```

그 외 파일은 손대지 말 것.

---

## 2. 아카이브 경로 (읽기전용)

루트:
```
/Users/idong-geon/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data/01_수산물(Seafood)/whelk/00_골뱅이_관련자료
```

| ID | 파일 | 규모 |
|---|---|---|
| D1 | `11_분석·가공데이터/FAO_FishStat/updates/2026-07-06/FishStat_2026.1.0_capture_whelk.csv` | 2,707행 / 1950~2024 |
| D2 | `…/FishStat_2026.1.0_aquaculture_whelk.csv` | 124행 |
| D3 | `…/FishStat_2026.1.0_global_production_whelk.csv` | 2,831행 |
| D3b | `…/FishStat_2026.1.0_species_codes_whelk.csv` | 28종 |
| D3c | `…/FishStat_2026.1.0_latest_top_countries_whelk.csv` | 43행 |
| D4 | `11_분석·가공데이터/KCS_trade/updates/2026-07-06/KCS_2026YTD_HS_whelk.csv` | 376행 / 2026.01~05 |
| D5 | `10_원본데이터셋/KCS_trade/2023_2024/kcs_HS{030781,030783,030789,030791,030799,160558,160559}_{2023,2024}.xml` | 14파일 |
| D6 | `11_분석·가공데이터/KMI_FTA_imports/whelk_fta_quarterly.json` | 21분기 |
| D7 | `11_분석·가공데이터/trade_classification/updates/2026-07-06/HS_matrix_whelk.csv` | 4행 |
| D8 | (repo) `docs/2026_whelk_industry_sources.md` | 1차 출처 14건 |

### 2.1 파싱 주의사항

- **D4 총계행 제외**: `year == '총계'` 행은 소계다. 합산에 넣으면 2배가 된다.
- **D5 XML**: 관세청은 `type=json` 요청에도 XML을 반환한다. `xml.etree.ElementTree` 로 `.//item` 파싱. 필드: `hsCd, statCd, statCdCntnKor1, statKor, year, impDlr, impWgt, expDlr, expWgt, balPayments`. `statCdCntnKor1 == '-'` 행이 총계다 — 제외.
- **D1/D3 집계행**: `VALUE` 빈 문자열 존재. `float(v or 0)`.
- **D1 종 스코프**: 28종 전부가 Buccinidae는 아니다. `SPECIES.Scientific_Name` 을 보존해 위젯 basis 에 기록하고, 화면에 "28종 합산" 방법론 고지를 반드시 낸다.

---

## 3. P1 — HS 코드 정정 🔴 최우선

### 3.1 문제

`app/api/_shared/hs-codes.ts:88-97` 현재값이 **골뱅이가 아닌 품목**을 가리킨다.

```ts
whelk_frozen: { hsSgn: '0307600000' },   // HS 0307.60 = 바다달팽이를 제외한 달팽이 (에스카르고)
whelk_canned: { hsSgn: '1605550000' },   // HS 1605.55 = 문어(Octopus)
```

### 3.2 정정값

D7(`HS_matrix_whelk.csv`)과 아카이브 루트 README가 확정한 체계:

| 키 | 라벨 | HS6 | HSK 10자리 (D4 실측) |
|---|---|---|---|
| `whelk_live_fresh` | 활·신선·냉장 바다고둥 | 0307.91 | `0307911000`(소라) / `0307919000`(기타) |
| `whelk_frozen` | 냉동 바다고둥 | 0307.92 | D4 `030792` 조회 결과 참조 |
| `whelk_prepared` | 조제·보존 골뱅이 (통조림) | **1605.59** | `1605591010` `1605591090` `1605592010` `1605592090` `1605599010` `1605599090` |

`whelk_canned` 키는 `whelk_prepared` 로 이름을 바꾸되, 기존 참조가 깨지지 않도록 `app/api/whelk/kcs/route.ts` 의 `WHELK_HS` 매핑을 같이 고쳐라.

### 3.3 route.ts 정리

- 주석의 `0307600000` / `1605550000` 언급 전부 제거.
- `FALLBACK_DATA` 의 수치는 근거 없는 추정치다. D5 2024 실측으로 교체:
  ```
  HS 1605.59 2024 수입 총액 $58,504,760 / 6,215,357 kg
  영국 $30,455,407 / 2,388,238kg · 아일랜드 $7,574,115 / 617,040kg
  중국 $4,884,764 / 766,588kg · 튀르키예 $4,169,468 / 311,300kg
  세네갈 $3,634,888 / 768,498kg
  ```
- `isLive: false` 명시 유지 (L-12).

**게이트**: `npm run typecheck` 통과.

---

## 4. P2 — `scripts/whelk_build/` 빌더

`scripts/squid_build/` 구조를 그대로 복제한다. 새 설계를 하지 말 것.

```
scripts/whelk_build/
├── __init__.py
├── __main__.py          python3 -m scripts.whelk_build 진입점
├── spec.py              위젯 명세 (id·section·title·chartType) — 5장 위젯표를 그대로 코드화
├── governance.py        sources[] · gates[] · monitoring[]
├── derive.py            파생 위젯 (점유율 전환·단가 사다리)
├── extract/
│   ├── fishstat.py      D1·D2·D3·D3b
│   ├── kcs.py           D4(CSV) + D5(XML)
│   ├── kmi.py           D6
│   └── hs_map.py        D7
├── configs/             위젯별 추출 설정 JSON (squid configs/ 와 동일 형식)
└── tests/test_whelk_build.py
```

### 4.1 산출 계약 — `public/data/whelk_v2.json`

`public/data/squid_v5.json` 과 **동일 스키마**. 최상위 키: `meta` / `sources` / `gates` / `monitoring` / `widgets`.

```jsonc
{
  "meta": {
    "built_at": "…+09:00",
    "builder_version": "whelk_build/1.0.0",
    "archive_snapshot": "whelk archive @ 2026-08-12",
    "gate_version": "measurement_gate 2026-08-13",
    "telemetry": "SYNCED"
  },
  "widgets": {
    "<widget_id>": {
      "section": "S1|S2|S3|S4|S5",
      "title": "…",
      "chartType": "bar|line|area|pie|scatter|radar|signal|card",
      "data": [ … ],
      "methodology": "산식·필터 조건 서술",
      "basis": {
        "species": ["Buccinum undatum"],
        "taxon_scope": "buccinum_only|gastropoda_aggregate|sea_snail_prepared",
        "weight_basis": "live_weight|net_weight",
        "market_stage": "capture|live_fresh|frozen|prepared_preserved|n/a",
        "aggregation": "sum_by_country|sum_by_year|none",
        "metrics": ["value_usd","weight_kg","share_pct","unit_price_usd_per_kg"],
        "claim_type": "descriptive|comparative|hypothesis",
        "currency": "USD", "currency_converted": false, "fx_date": null,
        "nominal_real": "nominal",
        "coverage_start": "…", "coverage_end": "…",
        "published_at": "…", "retrieved_at": "…",
        "source_ids": ["WH-…"], "source_grade": "A|B|C"
      }
    }
  }
}
```

### 4.2 sources[] 최소 등록 (governance.py)

| source_id | publisher | series | grade | latest_verified |
|---|---|---|---|---|
| `WH-PROD-FAO-FISHSTAT` | FAO | FishStat capture/aquaculture/global production 2026.1.0 | A | 2024 |
| `WH-TRADE-KCS` | 관세청 | nitemtrade HS 무역통계 | A | 2026-05 |
| `WH-TRADE-KMI-FTA` | KMI | FTA 체결국 수산물 수입동향 | A | 2026Q1 |
| `WH-REG-DEFRA-FMP` | Defra | Whelk Fisheries Management Plan | B | 2025 |
| `WH-REG-DSIFCA` | D&S IFCA | MCRS 규정 | B | 2025 |
| `WH-REG-DFO-CA` | DFO Canada | Whelk IFMP / Quota Report | B | 2025 |

D8(`docs/2026_whelk_industry_sources.md`) 14건 중 실제 위젯이 인용하는 것만 등록. 인용하지 않는 출처는 넣지 말 것.

### 4.3 gates[] 필수 3건

| gate_id | subject | allowed_use | blocked_use |
|---|---|---|---|
| G-001 | 어종 | *Buccinum* / *Rapana* 구분 표기 | 둘을 단일 "골뱅이"로 합산해 양식 가능 여부 단정 |
| G-002 | 기간 | 2026년은 1~5월 월별 원계열로만 표시 | 2026 YTD 연환산·전년 대비 증감률 산출 |
| G-003 | HS 범위 | 1605.59 를 조제 골뱅이 대리지표로 사용하되 "광의" 명시 | 1605.59 = 골뱅이 100% 라고 서술 |

### 4.4 자체 검증

`tests/test_whelk_build.py` — pytest 없이 `assert` + `__main__` 실행형 (squid 방식). 최소 항목:

1. D4 총계행이 합산에서 제외됐는가 (`year == '총계'` 배제 확인)
2. D5 XML `statCdCntnKor1 == '-'` 총계행 배제 확인
3. 2024 HS 1605.59 수입 총액이 **$58,504,760 ± 1** 인가
4. 2026.01~05 HS 1605.59 수입 총액이 **$12,531,808 ± 1** 인가
5. D1 2024 한국 어획이 **9,669.783 t ± 0.001** 인가
6. D1 2024 세계 1위가 영국(16,511.020 t)인가
7. D2 2024 양식 총량 중 중국 Rapana 비중이 99.9% 이상인가
8. 모든 위젯이 `basis.source_ids` 를 비어있지 않게 갖는가
9. `meta.telemetry` 가 `"SYNCED"` 인가 (LIVE 금지)
10. 빈 카드(`data: []`)는 `methodology` 에 공백 사유가 있는가

### 4.5 검증기 `scripts/validate_whelk_v2.py`

`scripts/validate_squid_v5.py` 를 골뱅이 스키마로 이식. 게이트 위반 0건이어야 한다. 검증기 자체 self-test 포함.

**게이트**: `python3 -m scripts.whelk_build` 성공 + `python3 scripts/whelk_build/tests/test_whelk_build.py` 전항 PASS + `python3 scripts/validate_whelk_v2.py public/data/whelk_v2.json` 위반 0.

---

## 5. P3 — 신규 위젯 9종 (N1~N9)

### N1. 원산지 포트폴리오 전환 (2024 → 2026 YTD) · S3 · `bar`

**이 개편의 헤드라인 위젯이다.**

- 데이터: D5(2024 `kcs_HS160559_2024.xml`) + D4(2026 YTD `hs_query == '160559'`)
- 산식: 국가별 `impDlr` 합산 → 각 기간 총액 대비 점유율
- 실측 (빌더 출력이 이 값과 일치해야 함):

| 원산지 | 2024 점유 | 2026 YTD 점유 |
|---|---:|---:|
| 영국 | 52.1% | 47.2% |
| 중국 | 8.3% | 21.2% |
| 캐나다 | ~0% (10위권 밖) | 15.1% |
| 아일랜드 | 12.9% | 10.1% |
| 영국+아일랜드 합산 | 65.0% | 57.3% |

- `cardDesc` 논지: "영국 단일 의존 심화" 서사는 2025 상반기까지의 이야기다. 2026년 들어 중국·캐나다로 실질 다변화가 시작됐고, **캐나다 단가가 영국보다 높아 다변화의 대가는 원가 상승**이다.
- G-002 준수: 2026은 "1~5월 누적"으로 라벨링. 연환산 금지.

### N2. 조제 골뱅이 월별 수입 원계열 · S3 · `composed`

- 데이터: D4 `hs_query=='160559'`, `year != '총계'`
- 실측 월별 `impDlr`: 2026.01 $2,802,424 / 02 $2,476,450 / 03 $1,536,305 / 04 $3,617,647 / 05 $2,098,982
- 바 = 금액, 라인 = 시사단가(`impDlr/impWgt`)

### N3. 원산지별 CIF 단가 사다리 · S3 · `bar`

- 2024 vs 2026 YTD 병렬. 실측 2026 YTD($/kg): 튀르키예 20.56 / 노르웨이 18.23 / **캐나다 16.55** / **영국 14.66** / 아일랜드 14.39 / 태국 10.26 / **중국 7.20** / 베트남 2.54
- 2024 영국 $12.75 → 2026 $14.66 (**+15.0%**) 강조

### N4. 글로벌 어획 상위국 (2024 확정) · S1 · `bar`

- D1 `PERIOD == '2024'` 국가 합산 top 10
- 실측: 영국 16,511 / 멕시코 14,970 / **한국 9,670** / 프랑스 7,699 / 튀르키예 6,962 / 러시아 6,233 / 캐나다 5,410 / 아일랜드 4,590
- **기존 위젯의 "한국 세계 5위(2022)" 표기를 3위로 정정**

### N5. 한국 어획 시계열 1950~2024 · S1 · `area`

- D1 `COUNTRY.UN_CODE == '410'` 연도 합산
- 실측: 2018 8,162 / 2019 10,190 / 2020 9,530 / 2021 8,954 / 2022 9,063 / **2023 10,757(역대 최고)** / 2024 9,670
- **기존 위젯의 "2019 사상 최고" 표기 정정** — 실제 최고점은 2023년

### N6. 영국 어획 자원 vs 한국 對영 수입 · S1·S3 · `composed`

- D1 UK(코드 826) + D5/D4 영국 수입액. 이중축.
- 실측 UK 어획: 2018 18,496 / 2020 21,280(최고) / 2022 14,298 / 2023 16,439 / 2024 16,511

### N7. 양식 가능성 종별 분해 · S1 · `bar` — **P0-4 정정 위젯**

- D2 2024: 중국 *Rapana* spp. **361,919 t** (전체 361,922 t 의 99.999%), *Buccinum* 양식 실적 **0**
- 논지: "골뱅이는 양식 불가"는 **북해산 *B. undatum* 에 한해** 참이다. 중국은 *Rapana venosa* 계열을 36만 톤 양식한다. 한국 통조림 수입의 중국 비중이 2026년 21.2%까지 오른 상황에서 이 구분은 조달 판단을 뒤집는다.
- G-001 게이트 적용 대상.

### N8. HS 코드 체계 해설 · S3 · `card`

- D7 + D4 HSK 10자리 실측. 0307.81/91/92 · 1605.59 체계 설명 + 1605.59가 "기타 조제 연체동물" 광의 코드라는 한계 고지(G-003).

### N9. 종 코드 커버리지 고지 · 공통 · `card`

- D3b 28종 목록. "본 대시보드의 FAO 어획 수치는 Buccinidae/Gastropoda 28종 합산이며 *B. undatum* 단독이 아니다" 명시.

### 5.1 위젯 공통 요구

- `WidgetCard` 사용 (`pillar` prop 필수, W-04).
- `telemetry={{ status: 'SYNCED', syncDate: <데이터 빈티지> }}` — LIVE 금지.
  ⚠️ **정정(2026-08-13)**: 초판은 `syncDate` 를 `meta.built_at` 에서 유도하라고 적었으나 **틀렸다**. 이 저장소의 `syncDate` 관례는 원데이터 시점이다(`'KCS 2024 연간'`, `'2024.2H'`). 빌드 시각을 넣으면 2024년 FAO 데이터가 "2026-08-13 동기화"로 보여 신선도를 과대표기한다(L-09 정신 위반). 각 위젯 `basis.coverage_end` / `published_at` 에서 유도할 것.
- 사용자 노출 문자열 100% 한글 (L-01). 약어는 `TermTooltip`.
- X축 라벨 한글 7자 축약 (UI_RULES).
- 데이터는 `/api/whelk/live` 가 반환하는 `whelk_v2.json` 에서만 읽는다. 컴포넌트에서 JSON 직접 import 금지.

---

## 6. P4 — 기존 위젯 정리 (**OpenCode 담당**)

P3 완료 후 착수. 판단이 필요한 작업이 아니라 기계적 편집이다.

### 6.0 위젯 개수 처리 방식 — **옵션 C 확정 (2026-08-13)**

P3 종료 시점 위젯 수가 **41개**(WhelkDashboard 36 + FTA 1 + KFAS 동적 5)로 늘어, 승인된 Q5 목표 "30개 내외"를 초과했다. 신규 9개를 추가하고 구버전 4개만 대체 제거한 결과다.

Q1(격리)·Q5(30개 내외) 두 확정 사항을 동시에 만족시키는 처리는 하나뿐이므로 아래로 확정한다:

- 6.1의 근거 없는 위젯 10개를 **삭제하지 않고**, 각 Pillar 하단의 **접힘(collapsed) 영역 "📌 가설·시나리오 (실측 데이터 없음)"** 으로 이동한다.
- 접힘 영역은 **기본 닫힘** 상태. 사용자가 펼쳐야 보인다.
- 따라서 **기본 화면 위젯 = 31개**(41 − 가설 10), 정보는 100% 보존.
- 접힘 헤더에 해당 Pillar의 가설 위젯 개수를 표시한다. 예: `📌 가설·시나리오 (실측 데이터 없음) · 3개`.
- 접힘 영역 내 위젯은 `WidgetCard` 를 그대로 쓰되 `telemetry.status` 를 `STATIC` 으로 두고, 카드 상단에 "실측 데이터 없음 — 가설" 배지를 단다. **`SYNCED`·`LIVE` 로 표기 금지.**

### 6.1 가설 영역으로 이동할 위젯 10개

아카이브 레인 02~09가 전부 0 파일이므로 근거가 없다. 삭제하지 말고 **`methodology` 에 공백 사유를 명시**한 뒤 6.0의 접힘 영역으로 옮긴다. (오징어 v5 의 빈 링크 카드 7개와 같은 정직성 처리)

| 위젯 | Pillar | 공백 사유 (methodology 에 기재) |
|---|---|---|
| SG 2026 밸류업 × 골뱅이 HMR 로드맵 | S2 | 내부 기획안, 외부 검증 자료 없음 |
| B2C 통조림 브랜드 경쟁력 매핑 | S4 | 브랜드 점유율 1차 출처 미보유 |
| B2C·B2B 채널별 매출 분포 | S4 | 채널 매출 통계 미보유 |
| 미국 캔 르네상스 수출 기회 | S4 | 트렌드 서술, 수치 근거 없음 |
| 헬시플레저 영양 벤치마크 | S4 | KFDA 원자료 아카이브 미보유 |
| 카드뮴 생체축적·식품안전 | S3 | 레인 06 비어 있음 |
| PFAS 리스크 | S5 | 레인 07 비어 있음 |
| EU PPWR 포장 컴플라이언스 | S5 | 레인 07 비어 있음 |
| 할랄·코셔 해양 콜라겐 | S5 | 근거 없음 |
| 국가별 수율 기반 총사용원가(TCU) | S3 | 살수율 수치 출처 없음 |

### 6.2 기계적 정리

- `INLINE_WIDGET_COUNT` 상수를 실제 개수와 동기화하되, **기본 화면 개수(31)와 가설 개수(10)를 분리 표기**한다. 헤더 문구도 "31개 위젯 · 가설 10개 별도" 형태로 바꾼다. 41개를 실측 위젯인 것처럼 세지 말 것.
- `WhelkFTAQuarterly.tsx` telemetry 는 P3에서 처리 완료 (SYNCED / `KMI 2026 Q1`). 재작업 불요.
- 파일 내 `truncateXAxis` 중복 정의가 있으면 단일 유틸로 통합.

### 6.3 P4 완료 조건

```bash
npx tsc --noEmit
npx vitest run
npm run build
python3 scripts/check_s_grade.py WhelkDashboard.tsx   # ⚠️ 파일명만. 경로 붙이면 closure 0개로 공허 통과함
```

- 기본 화면(접힘 펼치기 전) WidgetCard 수 = **31**
- 가설 접힘 영역 위젯 수 = **10**, 전부 `STATIC` + "실측 데이터 없음" 배지
- 실측 위젯의 `SYNCED` 표기는 유지, 가설 위젯에 `SYNCED` 부여 0건

---

## 7. P5 — 검증 (Claude Code)

Codex/OpenCode 작업 완료 후 Claude Code가 수행. Codex는 여기까지 하지 않는다.

화면에 표시되는 모든 숫자를 아카이브 CSV/XML과 1:1 대조한다.

---

## 8. 완료 판정 (Acceptance)

```bash
npm run typecheck                                              # PASS
npm run build                                                  # PASS (L-03 게이트)
python3 -m scripts.whelk_build                                 # whelk_v2.json 생성
python3 scripts/whelk_build/tests/test_whelk_build.py          # 전항 PASS
python3 scripts/validate_whelk_v2.py public/data/whelk_v2.json # 위반 0
python3 scripts/check_s_grade.py WhelkDashboard.tsx            # PASS
npx vitest run                                                 # 전항 PASS
```

> ⚠️ **`check_s_grade.py` 인자 주의 (2026-08-13 정정)**: 이 스크립트는 `ROOT/components` 기준으로 해석하므로 **파일명만** 넘겨야 한다. `components/WhelkDashboard.tsx` 처럼 경로를 붙이면 closure 0개를 검사하고도 `✅ 위반 0건` 을 출력한다 — 공허한 통과다. 초판 지시서가 경로형으로 적어 실제로 오통과를 냈다.

체크리스트:

- [ ] HS 코드가 0307.81/91/92 · 1605.59 체계로 정정됨
- [ ] FAO 기준연도 2024 통일, "한국 5위"·"2019 최고" 잔존 0건
- [ ] 신규 위젯 N1~N9 구현, 전부 `basis.source_ids` 보유
- [ ] 근거 없는 10개 위젯이 빈 링크 카드로 격리됨
- [ ] `meta.telemetry == "SYNCED"`, 어디에도 LIVE 표기 없음
- [ ] 위젯 총 30개 내외
- [ ] Drive 아카이브에 쓰기 발생 0건
- [ ] **미배포** — 로컬 `npm run dev` 확인까지만

---

## 9. 종료 시

1. `HANDOFF.md` 의 "완료된 것" / "다음 단계" / 타임스탬프 갱신.
2. 커밋 (메시지 끝에 에이전트 식별자):
   ```
   feat(whelk): rebuild dashboard on archive-backed data pipeline [Codex]
   ```
3. **배포하지 말 것.** 사용자의 "배포" 명시 지시를 기다린다.
