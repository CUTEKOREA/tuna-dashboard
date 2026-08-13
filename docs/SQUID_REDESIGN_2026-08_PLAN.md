# 오징어 대시보드 전면 개편 기획서 (v5)

**대상:** `https://leedonggun.co.kr/squid` (`components/SquidDashboard.tsx` 외 33개 컴포넌트)
**자료 원천:** `~/agri_data/01_수산물(Seafood)/squid/` (13GB / 1,166파일)
**작성:** 2026-08-13 · Claude Code
**확정 전제:** ① 압축 재편(156→40~46) ② 1차 독자 = 조달·트레이딩 실무 ③ measurement_gate 전 위젯 강제 ④ 정적 JSON + 월간 배치

---

## 1. 진단

### 1-1. 현 상태 (실측)

| 항목 | 값 |
|---|---|
| 위젯 수 | **156개** (TSX 81 + JSON 75) |
| 코드량 | `SquidDashboard.tsx` 927줄 / 60KB, Squid*.tsx 33개 합계 ~290KB |
| 데이터 | `public/data/squid_real_data_v4.json` 320KB, **2026-07-03 생성** |
| API 라우트 | 8종(hsping·importyeti·kosis·mfds·ofac·wto·forecast·sourcing) — **전부 mock fallback** |
| 최근 감사 | 2026-05-28, 4-Axis 평균 81.5 (A 32·B 113·C 11·D 0) |
| 구조 | 5-Pillar (원료→가공→물류→판매→ESG), 가치사슬 서사형 |

### 1-2. 문제 4가지

**P1. 데이터 시차 2년.** KPI가 "2024 글로벌 총 어획량", "2023 글로벌 수출 시장 규모"를 머리에 걸고 있다. 아카이브는 2026-07~08 기준 원문을 이미 갖고 있다 — Peru pota 2026-07-24 중단공지, Chile jibia 2026-08-06 쿼터소진, KMI 2026-08-11 가격, FAO EFPR 2026-07, SPRFMO CMM18 2026-06-05. **자료가 없어서가 아니라 연결이 안 돼 있다.**

**P2. 종(species) 혼재.** 대시보드는 Loligo gahi(포클랜드)·Illex argentinus(아르헨티나)·Dosidicus gigas(페루·칠레)·Todarodes pacificus(한국 살오징어) 4종을 상당수 위젯에서 "오징어"로 뭉갠다. FishStat 원본 종코드 231행에는 갑오징어(Sepia 속)·Cephalopods NEI까지 섞여 있다. 어기·가격대·조달처가 전부 다른 4종을 합산한 지표는 조달 실무에서 쓸 수 없다.

**P3. 조달 실무 관점 부재.** 현 IA는 가치사슬 서사(원료→가공→물류→판매→ESG)다. 읽을거리로는 훌륭하지만 "이번 주 페루산 살 수 있나", "칠레 쿼터 얼마 남았나", "지금 KMI 가격이 5년평균 대비 어디인가"에 답하지 않는다. PEF 밸류에이션·Earn-out 시뮬 위젯군(w56, w65~w70)은 조달 실무와 무관하며 출처 검증도 어렵다.

**P4. 서사 위젯 비대.** "자원의 저주", "스태그플레이션 역설", "크리스마스 수요 스파이크" 류 위젯이 같은 데이터를 다른 제목으로 반복한다. C등급 11건 중 VC 1~5(65.0점)는 전부 정성 서술이다.

### 1-3. 미사용 자산 — 개편의 근거

`00_오징어_관련자료/01_오징어_시장·가격/` (2026-08-12 구축, **현 대시보드에서 1건도 안 씀**):

- 검증 원문 **42건** (PDF 28 · 공식 HTML 스냅샷 13 · XLSX 1), PDF 948쪽, 75.4MB, SHA-256 원장 보유
- `00_운영/source_registry.csv` — 상시 출처 **36개**, P0 21·P1 9·P2 6, A/B/C 등급, landing_url·갱신주기 포함
- `00_운영/measurement_gate.csv` — **G-001~G-011 측정 게이트** (어종/두족류혼재/중량기준/KCS범위/Comtrade커버리지/Peru LMCTP/TAC정의/가격단계/통화/출처등급/최신성)
- `00_운영/monitoring_calendar.csv` — 15계열의 `latest_verified`·`next_check`·`status`(active / active_gap / pipeline_gap / coverage_gap / manual_export_gap)
- `00_운영/legacy_dataset_inventory_20260812.csv` — 기존 데이터셋 4건의 실제 커버리지와 금지 용법

이 거버넌스 레이어가 이번 개편의 **핵심 차별점**이다. 다른 어떤 상용 수산 대시보드도 "이 숫자를 이렇게 쓰면 안 된다"를 화면에 표시하지 않는다.

---

## 2. 개편 원칙 5조

1. **조달 결정 흐름이 IA다.** 가치사슬 서사 → "지금 살 수 있나 / 얼마인가 / 위험한가 / 근거는 뭔가" 순서.
2. **모든 숫자는 `basis`를 갖는다.** 어종·중량기준·거래단계·통화·기준일·출처ID를 붙이지 못하는 숫자는 화면에 올리지 않는다. 빌드 타임에 강제한다.
3. **한계는 숨기지 않고 표시한다.** KCS는 2026-01~05만 관측됨, Comtrade는 7 reporter 2021-2023 결측 있음, INIDEP 2026 주간자료 공백 — 전부 위젯 안에 라벨로 노출.
4. **LIVE 라벨 금지.** 정적 JSON + 월간 배치이므로 `SYNCED`(빌드 시각) / `STATIC`(고정 스냅샷)만 쓴다. 룰북 L-09 준수.
5. **위젯은 줄인다.** 156 → 40~46. 한 화면에서 판단이 서야 실무 도구다.

---

## 3. 신 정보구조 (IA)

### 3-0. 최상단 — 조달 신호 배너 (Sourcing Signal Bar)

산지 5곳 신호등 + 경보 3칸. 스크롤 없이 첫 화면에서 판단.

| 산지 | 어종 | 신호 근거 |
|---|---|---|
| 페루 | *Dosidicus gigas* (pota) | PRODUCE LMCTP·누적하역·중단공지 (2026-07-24 중단) |
| 칠레 | *Dosidicus gigas* (jibia) | SERNAPESCA 쿼터소진 XLSX (2026-08-06) |
| 아르헨티나 | *Illex argentinus* | INIDEP 주간공보 (**2026 공백 — active_gap 표시**) |
| 포클랜드 | *Doryteuthis gahi* (Loligo) | FIFD 어기전/2차어기 조사·2026 licensing advice |
| 한국 | *Todarodes pacificus* (살오징어) | MOF TAC 2026-2027 (2026-06-30) |

각 신호등은 **3색 아님 → 4상태**: `조업중` / `중단·제한` / `어기외` / `데이터공백`. 데이터공백을 정상 상태와 구분하는 것이 핵심 — 없는 걸 초록으로 칠하지 않는다.

### 3-1. 5개 섹션 / 39 위젯

> 확정 명세: [`docs/squid_v5_widget_spec.csv`](./squid_v5_widget_spec.csv) — 39행, 위젯별 `basis` 필수값·원문 경로·추출기·담당까지 기계 판독 가능. 아래 표는 요약이며 **CSV가 정본**이다.

#### A. 조달 가능성 (Sourcing Availability) — 10
| ID | 위젯 | 원천 |
|---|---|---|
| A1 | 산지 5곳 신호등 보드 | 아래 A2~A6 종합 |
| A2 | 페루 pota — LMCTP vs 누적하역 vs 중단공지 타임라인 | PRODUCE RM00191·Catch_Progress·Suspension |
| A3 | 칠레 jibia — 쿼터 소진율 게이지 | SERNAPESCA XLSX 2026-08-06 |
| A4 | 포클랜드 Loligo — 어기 캘린더 + 어기전 바이오매스 | FIFD 3건 (2025 조사 · 2026 advice) |
| A5 | 아르헨티나 Illex — 어기 타임라인 + **공백 경보** | INIDEP (2024 최종보고 + 2025 주간, 2026 미공개) |
| A6 | 한국 살오징어 TAC 2026-2027 배분 | MOF 2026-06-30 |
| A7 | 일본 스루메이카 TAC·자원평가 (동해 공유자원) | JFA 3건 (2026-01·02·03) |
| A8 | SPRFMO CMM18 — **effort 기반** 선박수 상한 | SPRFMO 2026-06-05 (TAC 아님, 2026-05 감사 정정 반영) |
| A9 | 4종 분리 생산 시계열 1980~2024 | FishStat 2026.1.0 + **종코드 필터** |
| A10 | 기후·자원 브리핑 (수온·어장이동) | NIFS 2026-06 · NOAA Longfin |

#### B. 가격·마진 (Price & Margin) — 8
| ID | 위젯 | 원천 |
|---|---|---|
| B1 | KMI 주간 소비자가 — 5년평균/전년/전월/전주 대비 | KMI FishData 2026-08-11 |
| B2 | 유럽 어가 월별 (European Fish Price Report) | FAO EFPR 2026-07 |
| B3 | 한국 수입단가 월별 (2026-01~05) + **범위 제한 라벨** | KCS 2026 YTD (G-004) |
| B4 | **거래단계 분리 비교판** (소비자/1차판매/수입단가 — 평균 금지) | G-008 강제 |
| B5 | 랜딩코스트 계산기 (수입단가 × HS관세 × 환율) | HS_matrix + KCS + 수기 관세 |
| B6 | EU 1차판매가 vs 수입단가 스프레드 | EUMOFA squid profile |
| B7 | GLOBEFISH 두족류 시황 요약 | FAO GLOBEFISH 2026 Issue 2 · Cephalopods May 2026 |
| B8 | **가격 지표 신선도 보드** (지표별 기준일 경과일수) | monitoring_calendar |

> **환율 위젯 제외 확정.** `extras/ecos_fred/`는 KRW/USD **2020~2024**만 보유. 2년 묵은 환율은 조달 실무에 쓸모없고, 게이트 G-009상 표시할 근거도 약하다. B5 랜딩코스트의 **사용자 입력 슬라이더**로 대체 — 사용자가 넣은 환율은 데이터 클레임이 아니므로 게이트 대상이 아니다.

#### C. 무역 흐름 (Trade Flow) — 8
| ID | 위젯 | 원천 |
|---|---|---|
| C1 | HS 분류 맵 (030741/42/43/49 × 제품형태) | FAO HS Codes for Cephalopods 2026 |
| C2 | 한국 수입 월별 × 상대국 (2026-01~05) | KCS 2026 YTD HS |
| C3 | 한국 수입 의존도 상위국 + 집중도 | KCS |
| C4 | **Comtrade 커버리지 매트릭스** (7 reporter × 2021-2023, 결측 셀 명시) | G-005 — 총액·점유율·CAGR 산출 차단 |
| C5 | 인도 MPEDA 수출 실적 2025-26 | MPEDA 2026-06 |
| C6 | FTA 수산물 수입 트렌드 | KMI 2026 |
| C7 | 스페인·EU 가공허브 물동량 | EUMOFA · USDA Spain 2023~2025 |
| C8 | USDA GAIN 한국 수산시장 업데이트 | USDA GAIN 2025-12 |

#### D. 규제·리스크 (Compliance & Risk) — 8
| ID | 위젯 | 원천 |
|---|---|---|
| D1 | SPRFMO IUU 선박 리스트 2026 (조회형) | SPRFMO 2026-02-20 |
| D2 | SPRFMO 준수보고서 2024-2025 요약 | SPRFMO 2026-02-20 |
| D3 | NOAA SIMP 대상 품목·요구서류 체크리스트 | NOAA 2026-08-12 |
| D4 | EJF 글로벌 스퀴드 리포트 2026 — 리스크 지도 | EJF 2026-06-04 (C등급 → 보조검증 라벨) |
| D5 | 원양어업 강제노동 리스크 | US DOL 2026-05 |
| D6 | MSC 인증 오징어 어장 현황 | MSC 2026-08-12 |
| D7 | 남미 규제 변동 타임라인 | ARG Resolution 6/2026 · CTMFM 2/2026 · SUBPESCA Jibia 2026 |
| D8 | 국내 원산지 표시·식품 규제 | intelligence_reports (기존 자산 재활용) |

#### E. 근거·거버넌스 (Evidence) — 5 ★ 신설
| ID | 위젯 | 원천 |
|---|---|---|
| E1 | 출처 원장 36건 (P0/P1/P2 · A/B/C · landing_url) | source_registry.csv |
| E2 | **측정 게이트 상태판 G-001~011** (게이트별 적용 위젯 수 · 위반 0 확인) | measurement_gate.csv |
| E3 | 모니터링 캘린더 15계열 (다음 갱신일 · gap 상태) | monitoring_calendar.csv |
| E4 | 데이터 신선도 히트맵 (전 지표 기준일 경과) | 빌드 산출 |
| E5 | 정정 이력 (2026-05 감사 P0 9 / P1 8 + 이번 개편) | 감사 아카이브 |

**합계 39** (A10 · B8 · C8 · D8 · E5, 신호등 보드는 A 섹션 첫 위젯).

---

## 4. 위젯 처분 (156 → 39)

| 처분 | 수 | 기준 |
|---|---:|---|
| **개보수** | **13 위젯** (구 ID 22개 흡수) | 2026 아카이브 원문으로 재검증 가능. `basis` 메타 주입 + 기준일 갱신 + 통합 |
| **폐기** | **구 ID 77개** + ID 없는 TSX 위젯 | 아래 4개 사유 중 하나 이상 |
| **신규** | **26 위젯** | 아카이브 신규 원천 기반 (섹션 A·D·E 다수) |

ID 실측(2026-08-13): `squid_real_data_v4.json` 81개 ∪ `PILLAR_WIDGET_IDS` 92개 = **고유 ID 99개**. 이 중 22개가 신 위젯 13개로 흡수되고 **77개 폐기**. 폐기 후보 전량은 [`squid_v5_prune_list.txt`](./squid_v5_prune_list.txt). ID 없이 TSX에 직접 그려진 위젯(2026-05 감사 기준 TSX 81개)은 컴포넌트 단위로 별도 처분한다.

개보수 13개의 `legacy_ids` 매핑은 명세 CSV에 있다. 통합 사례: `w35_spain_trade_hub` + `w47_spain_processing_empire` + `w38_vigo_chokepoint_monopoly` 3개 → `C_eu_processing_hub` 1개 (미검증 "80% 독점" 수치 제거, EUMOFA 원문 수치만).

**참조 안전성 사전 확인 완료** — `components/Squid*.tsx` 33개 중 squid 외부에서 참조되는 것은 없다. `app/falkland/page.tsx` 의 매칭은 `FalklandSquidDashboard` 부분문자열로 인한 오탐이며, 해당 라우트는 독립 페이지로 유지한다.

**폐기 사유**
1. **추정·시뮬 (검증 불가)** — w56 PE valuation, w65 M&A 스코어카드, w67 Earn-out 시뮬, w70 가치창출, w29 2029 capex shock, w43 자원의 저주
2. **서사 중복** — w36 스태그플레이션 역설, w41 시간차 차익, w44 무역루트 차익, w45 크리스마스 스파이크, w46 명절효과·프랑스 프리미엄 (차익거래 계열 5→1 통합)
3. **정성 서술 (C등급)** — VC 1~5 (65.0점) → E1 출처 원장으로 대체
4. **종 혼재 해소 불가** — 4종 합산이 전제인데 원본 분리 불가한 위젯

**이관** — 포클랜드 상세 위젯군은 이미 존재하는 `/falkland` 라우트로 링크. squid 메인은 A4 요약 1개만.

---

## 5. 데이터 계약 — `squid_v5.json`

개편의 **기술적 심장**. 이 스키마가 있어야 Codex/OpenCode 병렬 작업이 충돌 없이 굴러간다.

```jsonc
{
  "meta": {
    "built_at": "2026-08-13T09:00:00+09:00",
    "builder_version": "squid_build/1.0.0",
    "archive_snapshot": "00_오징어_관련자료 @ 2026-08-12",
    "gate_version": "measurement_gate 2026-08-12",
    "telemetry": "SYNCED"          // LIVE 금지 (L-09)
  },
  "sources":    [ /* source_registry.csv 36행 그대로 */ ],
  "gates":      [ /* measurement_gate.csv 11행 그대로 */ ],
  "monitoring": [ /* monitoring_calendar.csv 15행 그대로 */ ],

  "widgets": {
    "B1_kmi_consumer_price": {
      "section": "B",
      "title": "오징어 소비자가 — 원양 냉동 中 1마리",
      "chartType": "bar",
      "data": [ /* ... */ ],

      "basis": {                                  // ← 게이트 강제 필드
        "species":       ["Todarodes pacificus", "Dosidicus gigas"],  // G-001
        "taxon_scope":   "squid_only",            // G-002  squid_only|incl_cuttlefish|cephalopods_nei
        "weight_basis":  "product_weight",        // G-003  live_weight|product_weight|n/a
        "product_form":  "frozen_whole",
        "market_stage":  "consumer",              // G-008  consumer|wholesale|import_unit|first_sale
        "currency":      "KRW",                   // G-009
        "fx_date":       null,
        "nominal_real":  "nominal",
        "coverage_start":"2026-08-07",            // G-011
        "coverage_end":  "2026-08-11",
        "published_at":  "2026-08-11",
        "retrieved_at":  "2026-08-12",
        "source_ids":    ["SQ-PRC-KMI"],          // G-010
        "source_grade":  "A",
        "archive_path":  "04_가격·도매/20260812-KMI-FishData_Price_Trends.html",
        "restrictions":  [],                      // 예: ["G-004: 2026-01~05만 관측"]
        "blocked_use":   ["다른 거래단계 가격과 평균"]
      }
    }
  }
}
```

### 빌드 게이트 (강제 방식)

`scripts/validate_squid_v5.py` — 다음 중 하나라도 걸리면 **빌드 실패**:

- `basis` 누락 또는 필수 키 결측
- `species`가 게이트 화이트리스트(4종 + 명시 NEI) 밖
- `taxon_scope != "squid_only"`인데 제목에 "오징어 시장"류 총계 표현 사용 (G-002)
- 서로 다른 `market_stage`가 한 위젯 안에서 평균·합산 (G-008)
- `source_ids`가 `sources[]`에 없음 / `source_grade == "C"` 단독으로 법규·시장규모 확정 (G-010)
- `coverage_end`가 `published_at`보다 미래 / `retrieved_at`을 데이터 기준일로 표기 (G-011)

`npm run build` 앞단에 붙인다 (룰북 L-03 게이트와 결합).

### UI 계약

모든 `WidgetCard` 하단에 **근거 칩 1행** 고정:

```
🦑 Dosidicus gigas · ⚖ 제품중량 · 🏷 소비자가 · 📅 2026-08-11 (D+2) · 🅰 KMI
```

칩 클릭 → 아카이브 원문 경로 + landing_url 팝오버. `restrictions`가 있으면 주황 칩으로 앞에 붙는다 (`⚠ 2026-01~05만 관측`).

---

## 6. 파이프라인 — 정적 JSON + 월간 배치

> ⚠️ **경로 변경 (2026-08-13 확인).** 기획 초안은 `~/agri_pipeline/` 을 전제했으나, 실제로 그 디렉터리는 **`logs/` 만 남고 비어 있다.** launchd `com.agri.monthly-refresh` 는 `monthly_refresh.sh` 부재로 계속 실패 중 — 2026-06-08 소실 이후 **두 번째 소실**이다. 없는 파이프라인 위에 짓지 않고 대시보드 repo 안에 둔다. 비-Drive · git 추적이라는 원래 규칙의 취지는 그대로 충족한다. (agri_data 파이프라인 자체의 복구는 이 개편과 별건 — 사용자 판단 필요.)

Drive에는 쓰지 않는다.

```
tuna-dashboard/
  scripts/squid_build/
    __main__.py          # python -m squid_build --out squid_v5.json
    spec.py              # docs/squid_v5_widget_spec.csv 로더 (39행 = 작업 목록)
    governance.py        # source_registry / measurement_gate / monitoring_calendar → 5 위젯   [5]
    extract/
      md_extract.py      # .md/.html 표·불릿 → 행. config 주도, 21개 위젯 공용            [21]
      kcs.py             # KCS 2020-2024 + 2026YTD → 월별·국가별·집중도                   [3]
      kmi_price.py       # KMI 주간 소비자가 CSV                                          [1]
      peru_pota.py       # PRODUCE 3문서 → LMCTP·누적하역·중단 타임라인 (G-006 순서 보정)  [1]
      chile_jibia.py     # SERNAPESCA XLSX → 쿼터 소진율                                  [1]
      fishstat.py        # 종코드 화이트리스트 필터 → 4종 분리 생산                        [1]
      comtrade.py        # legacy → 커버리지 매트릭스만 (총액·점유율·CAGR 산출 금지)        [1]
      hs_map.py          # HS_matrix + FAO HS 문서 → 분류 맵                              [1]
    derive.py            # 신호등·거래단계판·랜딩코스트·신선도 — 위 산출물에서 파생        [4]
```

**추출기 10개 모듈로 39 위젯을 만든다.** 원문 파싱이 필요한 건 8개뿐이고, 21개는 마크다운 표를 뽑는 같은 일이라 `md_extract.py` 하나에 위젯별 config만 다르게 넣는다. 실패하면 그 위젯은 **원문 링크 카드로 강등**하고 수치는 비운다 — 추정치를 만들어 넣지 않는다.

- **입력:** Drive 아카이브 = **읽기 전용**
- **출력:** `~/agri_pipeline/data/squid/squid_v5.json` → 배포 시 `tuna-dashboard/public/data/`로 복사
- **주기:** 월간 (`com.agri.monthly-refresh` 기존 launchd에 `--only squid` 추가)
- **PDF 추출:** PDF마다 `.md` 짝이 이미 있다 → `.md`를 파싱한다. PDF 재파싱 불필요.
- **스크레이핑 금지:** 이번 단계에서는 API·크롤러 신규 도입 없음. 아카이브에 있는 것만 쓴다.

---

## 7. 작업 분업 (Claude / Codex / OpenCode / Grok)

| Phase | 담당 | 산출물 | 의존 |
|---|---|---|---|
| **P0. 계약 확정** ✅ | **Claude Code** | `scripts/squid_v5.schema.json`, `scripts/validate_squid_v5.py`(self-test 13케이스), `docs/squid_v5_widget_spec.csv`(39행) | — |
| **P1. 추출기** ✅ | **Codex** (2라운드) | `scripts/squid_build/**` 10모듈 + 자체검사 16건. `squid_v5.json` 39위젯·게이트 위반 0. 데이터 35 / 링크카드 4 | P0 |
| **P2. 폐기·정리** ✅ | **Claude Code** | 구 위젯 컴포넌트 32개·`squid_real_data_v4.json`·mock API 8종 삭제(추적 파일 42건). `SquidDashboard.tsx` 927→**115줄** | P0 |
| **P3. 신규 위젯 TSX** ✅ | **OpenCode ×4** (A·B·C·E) + Claude | 섹션별 1세션, 경계 위반 0. D는 차트 대상 0개(전부 원문 발췌)라 발췌 렌더러로 일괄 처리. 차트 19개 렌더 | P0, P2 |
| **P4. 거버넌스 UI** | **Claude + OpenCode** | E1~E5 (출처 원장·게이트 상태판·캘린더·신선도 히트맵·정정이력) | P1 |
| **P5. 교차검증** | **Grok + Gemini** | Peru 재개 여부·Argentina 2026 어기 등 실시간 사실 확인 / 클레임 적대적 감사 | P3 |
| **P6. 게이트·배포** | **Claude Code** | `validate → tsc --noEmit → npm run build` 통과 후 사용자 "배포" 지시 대기 | 전부 |

**병렬 안전장치**
- P2(삭제)와 P3(신규)는 파일이 겹치지 않게 신규 위젯을 `components/squid/` 새 디렉터리에 격리한다. 기존 `components/Squid*.tsx`는 P2가 단독 소유.
- P3의 5세션은 각자 `components/squid/Section{A..E}.tsx` 1파일씩만 쓴다. 공용 컴포넌트 수정 금지.
- 데이터는 P1이 만든 JSON 하나만 읽는다. 위젯이 직접 CSV를 읽지 않는다.

**CLI 확인됨:** `codex` · `opencode` · `grok` · `gemini` 전부 설치되어 있음.

---

## 8. 일정 (작업일 기준)

| 일 | 내용 |
|---|---|
| D+0 | P0 계약 확정 (스키마·검증기·44 위젯 명세) |
| D+1~2 | P1 추출기 9종 (Codex) — 병렬로 P2 폐기 시작 |
| D+2~3 | P2 완료, `SquidDashboard.tsx` 골격 재작성 |
| D+3~5 | P3 신규 위젯 5세션 병렬 (OpenCode) |
| D+5~6 | P4 거버넌스 UI |
| D+6 | P5 교차검증 → 정정 |
| D+7 | P6 빌드 게이트 통과 · 사용자 확인 후 배포 |

---

## 9. 리스크

| 리스크 | 완화 |
|---|---|
| PDF `.md` 짝의 표 추출 품질이 낮아 수치화 실패 | 추출기별 `assert` 자체검사 필수. 실패 시 해당 위젯은 **원문 링크 카드**로 강등(수치 조작 금지) |
| INIDEP 2026 공백 → 아르헨티나 신호등 산출 불가 | `데이터공백` 4번째 상태로 명시 표시. 추정 금지 |
| 110개 삭제 중 다른 페이지가 참조 | P2 착수 전 `grep -rn` 전체 참조 확인. `/falkland`·`Insight9TunaVsSquidCombo`는 별도 검토 |
| OpenCode 5세션이 UI 규칙(L-01 한글화·L-02 X축 7자·L-05 컨테이너)을 어김 | 세션 프롬프트에 `UI_RULES.md` + `COMPREHENSIVE_RULEBOOK.md` 첨부 강제. P6에서 grep 검증 |
| 위젯 39개로도 여전히 많음 | E 섹션은 접이식(기본 접힘). 첫 화면은 신호등 보드만 |
| `md_extract.py` 하나가 21개 위젯을 떠받침 — 단일 실패점 | 위젯별 config 독립. 한 config가 깨져도 그 위젯만 링크 카드로 강등 |

---

## 10. 성공 기준

1. 전 위젯 `basis` 100% — `validate_squid_v5.py` 통과 없이는 빌드 불가
2. 화면 최신 기준일 **2026-08-11 이내** (현재 2024)
3. 4종 분리 표시 — "오징어" 단일 합산 지표 0개
4. LIVE 라벨 0개 (SYNCED/STATIC만)
5. 위젯 39개, `SquidDashboard.tsx` 300줄 이하
6. 첫 화면(스크롤 0)에서 5개 산지 조달 가부 판단 가능

---

## 11. 결정 기록

| 항목 | 결정 | 근거 |
|---|---|---|
| 랜딩코스트 관세율 | **수기 상수 채택** (`MAN-TARIFF-KR`, "2026-08 기준 수기 입력" 라벨) | `extras/tariffs/` 비어 있음. 환율은 사용자 입력 슬라이더 |
| 국내 원산지 규제(D) | **"참고" 라벨로 진행**, `claim_type=risk_screening` 고정 | `intelligence_reports/` 512건 대부분 뉴스(C등급). G-010상 단독 법규 확정 불가 |
| 환율 위젯 | **제외** | `extras/ecos_fred` 2020~2024만 — 조달 실무 무용 |
| 위젯 총수 | 45 → **39** | 환율 제외 + 스페인 3개 통합 |
| 추출기 모듈 | 33 → **10** | 21개 위젯이 같은 마크다운 표 파싱 |

---

## 12. P0 완료 (2026-08-13)

| 산출물 | 경로 | 상태 |
|---|---|---|
| 데이터 계약 스키마 | `scripts/squid_v5.schema.json` | ✅ |
| 빌드 게이트 검증기 | `scripts/validate_squid_v5.py` | ✅ self-test 13케이스 통과 |
| 39 위젯 명세 (정본) | `docs/squid_v5_widget_spec.csv` | ✅ |

검증기가 기계적으로 막는 것:

| 게이트 | 차단 대상 |
|---|---|
| G-001 | 미승인 어종 (4종 + 명시 NEI 밖) |
| G-002 | `taxon_scope != squid_only` 인데 "오징어 시장/총/전체" 표현 · `taxon_note` 누락 |
| G-003 | 물량 지표인데 `weight_basis=n/a` |
| G-004 | KCS 2026 구간에 관측범위 제한 미표기 |
| G-005 | Comtrade legacy 로 `global_total`·`share`·`cagr` 산출 |
| G-006 | Peru pota 위젯의 `quota_semantics` 누락 |
| G-007 | 법정한도(TAC·LMCTP·effort)를 생산량/재고/조달가능량으로 표기 |
| G-008 | 거래단계 교차 집계 |
| G-009 | 환산 지표의 `fx_date` 누락 · 금액 지표의 `currency=n/a` |
| G-010 | `source_grade` 과대표기 · C등급 단독 법규/시장규모 확정 |
| G-011 | `coverage_end > published_at > retrieved_at` 역전 |
| L-09 | `telemetry: LIVE` |

실행:

```bash
python3 scripts/validate_squid_v5.py --self-test          # 회귀 검사
python3 scripts/validate_squid_v5.py public/data/squid_v5.json
```

`package.json`의 `build` 스크립트 앞단에 붙인다 (룰북 L-03 게이트와 직렬).
