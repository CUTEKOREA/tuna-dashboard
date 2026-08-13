# squid v5 작업 지시서 (Codex / OpenCode)

기획: [`SQUID_REDESIGN_2026-08_PLAN.md`](./SQUID_REDESIGN_2026-08_PLAN.md)
정본 명세: [`squid_v5_widget_spec.csv`](./squid_v5_widget_spec.csv) — **39행 = 작업 목록. 이 CSV가 진실의 원천.**

---

## 공통 규칙 (전 세션 필독)

1. **아카이브는 읽기 전용.** `~/Library/CloudStorage/GoogleDrive-.../agri_data/01_수산물(Seafood)/squid/` 에 절대 쓰지 않는다. Drive sync가 2026-06-08에 파이프라인 전체를 날린 전례가 있다.
2. **파이프라인 코드는 `~/my-project/tuna-dashboard/scripts/squid_build/`.** ⚠️ `~/agri_pipeline/` 은 현재 `logs/` 만 남고 비어 있다 (launchd `com.agri.monthly-refresh` 가 `monthly_refresh.sh` 없음으로 계속 실패 중 — 2026-06-08 이후 두 번째 소실). 없는 파이프라인에 얹지 않고 대시보드 repo 안에 둔다. 비-Drive · git 추적 조건은 동일하게 충족한다.
3. **추정치 생성 금지.** 원문에서 수치를 못 뽑으면 그 위젯은 `data: []` + `chartType: "card"` 로 강등하고 원문 링크만 남긴다. 그럴듯한 숫자를 채워 넣지 않는다.
4. **`telemetry` 는 `SYNCED` 또는 `STATIC`.** `LIVE` 금지 (룰북 L-09).
5. **완료 판정은 검증기가 한다.** `python3 scripts/validate_squid_v5.py public/data/squid_v5.json` 이 exit 0 이어야 한다. 스스로 "완료"라고 선언하지 않는다.
6. UI 작업은 `UI_RULES.md` + `COMPREHENSIVE_RULEBOOK.md` 준수. 특히 L-01(영문 잔여 0) · L-02(X축 한글 ≤7자) · L-05(ResponsiveContainer) · L-06(dead import).

---

## P1 — 추출기 (Codex)

**목표:** 아카이브 원문 → `squid_v5.json`. 검증기 통과.

**작업 위치:** `~/my-project/tuna-dashboard/scripts/squid_build/`

```
scripts/squid_build/
  __main__.py       # python -m squid_build --out <path> [--only <widget_id>]
  spec.py           # squid_v5_widget_spec.csv 로더
  governance.py     # source_registry / measurement_gate / monitoring_calendar → E 섹션 5위젯 + sources[]/gates[]/monitoring[]
  derive.py         # 신호등·거래단계판·랜딩코스트·신선도 (다른 위젯 산출물에서 파생)
  extract/
    md_extract.py   # .md/.html 우선, 필요 시 PDF layout 재추출. 위젯별 config 주도
    eu_prices.py    # EFPR Squid/Loligo/Illex 49행 + 단일단계 가격 계단
    official_tables.py # MOF TAC 적용범위·SPRFMO effort 표 구조화
    kcs.py          # 3위젯
    kmi_price.py    # 1
    peru_pota.py    # 1
    chile_jibia.py  # 1  (XLSX)
    fishstat.py     # 1  (종코드 화이트리스트 필터)
    comtrade.py     # 1  (커버리지 매트릭스만)
    hs_map.py       # 1
  configs/          # md_extract 용 위젯별 config (21개 YAML/JSON)
  tests/test_squid_build.py
```

**순서**
1. `spec.py` + `governance.py` 먼저. 이것만으로 E 섹션 5위젯 + `sources[]`/`gates[]`/`monitoring[]` 이 채워진다. 이 시점에 검증기를 한 번 돌려 구조를 확인한다.
2. `kmi_price.py` → 가장 쉬운 실제 데이터 (CSV 1행, 이미 정제됨). 파이프라인 왕복을 여기서 검증한다.
3. `fishstat.py` → **종코드 필터가 이 개편의 핵심.** `FishStat_2026.1.0_species_codes_squid.csv` 231행에 `Sepia` 속과 `Cephalopoda` 가 섞여 있다. `Scientific_Name` 이 4종 화이트리스트에 있는 행만 통과시킨다. 필터 전후 행 수를 로그로 남긴다.
4. `kcs.py` · `comtrade.py` · `hs_map.py` (CSV 기반, 결정적)
5. `peru_pota.py` · `chile_jibia.py` (문서·XLSX 기반)
6. `md_extract.py` + config 21개 (가장 오래 걸림, 실패 시 강등 허용)
7. `derive.py` (다른 위젯 산출물 의존 — 마지막)

**필수 자체검사** (`tests/test_squid_build.py`, assert 기반, 프레임워크 없이)
- `fishstat.py`: 필터 후 `Scientific_Name` 집합이 4종 화이트리스트의 부분집합
- `peru_pota.py`: 타임라인이 날짜 오름차순이고, `2026-07-24 중단공지` 가 `2026-07-09 누적치` 뒤에 온다 (G-006)
- `kcs.py`: 2026 구간 산출물의 `coverage_end` 가 `2026-05` 이하
- `comtrade.py`: 산출 `metrics` 에 `share`/`cagr`/`global_total` 없음
- 전체: `validate_squid_v5.py` 가 exit 0

**주의**
- `.md`/`.html`을 우선한다. 같은 이름의 `.md` 짝이 없거나 필요한 표가 유실된 경우에만 `pdftotext -layout <pdf> -`를 허용한다. Drive에는 쓰지 않고, 인용 `archive_path`는 PDF 원본을 유지하며 `methodology`에 layout 재추출을 명시한다. 디스크 캐시가 필요하면 repo의 `scripts/squid_build/.cache/`만 사용하고 git에서 제외한다.
- `MAN-TARIFF-KR` 는 실제 출처가 아니라 수기 상수다. `sources[]` 에 `grade: "C"`, `landing_url` 은 근거 메모로 넣고, 이걸 쓰는 위젯의 `claim_type` 은 `operational` 로 고정한다 (G-010 통과 조건).
- `md_extract.py` config 는 위젯 하나당 하나. 한 config 가 깨져도 나머지 20개가 살아야 한다 — 예외를 삼키고 해당 위젯만 링크 카드로 강등.

**완료 조건:** `python -m squid_build --out /tmp/squid_v5.json` → `python3 scripts/validate_squid_v5.py /tmp/squid_v5.json` exit 0, 위젯 39개.

---

## P2 — 폐기·정리 (Codex, P1과 병렬 가능)

**목표:** 구 오징어 위젯 전부 제거, `SquidDashboard.tsx` 927 → ~120줄의 v5 셸로 교체.

**작업 위치:** `~/my-project/tuna-dashboard/` — 브랜치 `squid-v5` (이미 체크아웃됨).

**존치 위젯은 없다.** 명세 CSV 의 `legacy_ids` 열은 **어떤 구 위젯이 어떤 신 위젯에 흡수됐는지 기록하는 출처 표시**이지 "이 코드를 남겨라"가 아니다. 22개 구 ID 의 내용은 이미 아카이브 원문에서 v5 로 다시 만들어졌다. 구 렌더링 코드는 전부 나간다.

**전제 (Claude 가 이미 완료):**
- `public/data/squid_v5.json` — 39 위젯, 검증기 통과
- `components/squid/SquidCard.tsx` · `BasisChips.tsx` · `GenericWidget.tsx` · `SquidSection.tsx` · `SectionA~E.tsx`
- 섹션 껍데기는 차트 없이도 표로 그려진다 → **삭제 직후에도 `/squid` 가 동작한다**

**순서**
1. **참조 확인** — `components/Squid*.tsx` 33개 각각에 대해 squid 밖 참조를 `grep -rn` 으로 확인. 사전 조사 결과 외부 참조는 0건이나 직접 재확인할 것. 참조가 있으면 삭제하지 말고 보고한다.
2. `SquidDashboard.tsx` 를 v5 셸로 교체:
   - `public/data/squid_v5.json` 을 import
   - 헤더(제목·빌드시각·아카이브 스냅샷·`TelemetryBadge status="SYNCED"`)
   - `SectionA` ~ `SectionE` 를 순서대로 렌더 (각각 `doc` 만 넘긴다)
   - 섹션 앵커 네비게이터 (기존 5-Pillar 네비 자리)
   - `PILLAR_WIDGET_IDS` · `WIDGET_ICONS` · `KPI_THEMES` 등 구 상수 전부 삭제
3. `components/Squid*.tsx` 삭제 — `FalklandSquidDashboard.tsx` 는 **제외(유지)**. `SquidDashboard.tsx` 는 2단계에서 교체되므로 삭제 대상 아님.
4. `public/data/squid_real_data_v4.json` 삭제
5. mock API 라우트 8종 삭제: `app/api/squid/{hsping,importyeti,kosis,mfds,ofac,wto,squid-forecast,squid-sourcing}` — 전부 mock fallback 이고 v5 는 정적 JSON 이다. `.bak_codex` · `.bak_api` 잔여 파일도 함께.
6. 삭제로 깨진 import 정리 (`app/page.tsx` 등)
7. `npx tsc --noEmit` → `npm run build` 통과

5개 이상 동일 패턴 변경은 `scripts/fix_squid_v5_prune.py` 로 일괄 처리한다 (룰북 L-07 — 수작업 금지).

**금지 — 어기면 P3 다섯 세션이 깨진다**
- `components/squid/` 디렉터리 **일체 수정 금지.** 읽기만 한다.
- `scripts/squid_build/` · `scripts/validate_squid_v5.py` · `scripts/squid_v5.schema.json` · `docs/squid_v5_*` · `public/data/squid_v5.json` 수정 금지.
- `FalklandSquidDashboard.tsx` 와 `/falkland` 라우트 유지 — 별도 페이지다.
- `app/squid-v5/page.tsx` (확인용 미리보기) 유지.

**완료 조건**
```
npx tsc --noEmit
npm run build
python3 scripts/validate_squid_v5.py public/data/squid_v5.json   # 여전히 exit 0
```
그리고 `npm run dev` 로 `/squid` 가 39개 위젯을 렌더한다.

---

## P3 — 신규 위젯 TSX (OpenCode ×5, 섹션별 1세션)

**전제:** P0 계약 + P2 골격 + Claude가 확정한 공용 컴포넌트.

**세션별 소유 파일 (겹치지 않음)**

| 세션 | 파일 | 위젯 |
|---|---|---|
| P3-A | `components/squid/SectionA.tsx` | 10 (조달 가능성) |
| P3-B | `components/squid/SectionB.tsx` | 8 (가격·마진) |
| P3-C | `components/squid/SectionC.tsx` | 8 (무역 흐름) |
| P3-D | `components/squid/SectionD.tsx` | 8 (규제·리스크) |
| P3-E | `components/squid/SectionE.tsx` | 5 (근거·거버넌스) |

**공용 컴포넌트 (Claude 제공, 수정 금지)**
- `components/squid/SquidCard.tsx` — 위젯 껍데기
- `components/squid/BasisChips.tsx` — 근거 칩 1행. `basis` 를 받아 `🦑 어종 · ⚖ 중량기준 · 🏷 거래단계 · 📅 기준일(D+n) · 🅰 등급` 렌더. `restrictions` 있으면 주황 칩 선두 배치, 클릭 시 `archive_path` + `landing_url` 팝오버

**규칙**
- 데이터는 `squid_v5.json` 하나만 읽는다. CSV·다른 JSON 직접 접근 금지.
- 모든 위젯 카드 하단에 `<BasisChips basis={w.basis} />` 필수. 예외 없음.
- 차트는 Recharts + `SafeResponsiveContainer` (기존 패턴 유지).
- X축 한글 라벨 7자 초과가 4개 이상이면 `angle={-45}` + 하단 마진 40~60px (L-02).
- 신호등 상태: 조업중 `#10b981` / 어기중 `#38bdf8` / 중단·제한 `#f59e0b` / 어기외 `#64748b` / **데이터공백 `#8b5cf6` + 빗금 패턴**. `state_evidence.evidence_type=schedule_derived`는 관측 상태와 구분해 공개 일정 파생임을 화면에 표시한다.

---

## P5 — 교차검증 (Grok / Gemini)

P3 완료 후. 검증 대상 클레임:
- 페루 pota 2026-07-24 중단 이후 **재개 여부** (아카이브 기준일 이후 변동)
- 아르헨티나 Illex 2026 어기 실제 진행 상황 (INIDEP 미공개 구간)
- SPRFMO CMM18 effort 규제 선박수 (China 570 · Korea 43 · Taiwan 38) 유효성
- 칠레 jibia 2026 쿼터 소진 진행률 (2026-08-06 이후)

발견 사실은 **아카이브에 추가하지 말고** 보고만 한다. 아카이브 추가는 `00_수집관리` 절차를 따로 탄다.

---

## P6 — 게이트 (Claude Code)

```bash
python3 scripts/validate_squid_v5.py public/data/squid_v5.json   # 게이트
npx tsc --noEmit                                                  # L-06
npm run build                                                     # L-03
grep -rn "LIVE" components/squid/ | grep -v SYNCED                # L-09
```

전부 통과해도 **배포는 사용자가 "배포"라고 말할 때만** 한다.
