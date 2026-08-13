# 고등어 대시보드 전면 개편 기획서

- 작성일: 2026-08-13
- 대상: https://leedonggun.co.kr/mackerel (`components/MackerelDashboard.tsx`)
- 자료 원본: `~/Library/CloudStorage/GoogleDrive-cutekorea@gmail.com/내 드라이브/agri_data/01_수산물(Seafood)/mackerel/00_고등어_관련자료` (2026-08-12 아카이브, 821파일)
- 확정된 방향: **데이터 진실성 재구축 중심** / 주 독자 **사내 실무 의사결정** / 위젯 **축소 + 신규 추가**

---

## 0. 한 줄 요약

이 페이지의 문제는 위젯이 적어서가 아니라 **위젯이 무엇을 근거로 말하는지 추적이 안 되고, 근거의 절반이 2019~2023년에 멈춰 있다**는 것이다. 2026-08-12 아카이브는 그 근거를 전부 2026년 1차출처로 교체할 수 있는 재료를 이미 갖고 있다. 이번 개편은 **아카이브 → 결정적 ETL → 위젯**의 단방향 파이프라인을 깔고, 그 파이프라인을 통과하지 못하는 위젯을 걷어내는 작업이다.

---

## 1. 현 상태 실측

### 1.1 렌더링 실체

| 항목 | 수치 | 근거 |
|---|---:|---|
| 렌더되는 위젯 | **90** | JSON 83 (`public/data/mackerel_real_data_v13.json`) + TSX 7 (`EXTRA_BY_PILLAR`) |
| 존재하지만 **렌더 안 되는** TSX 컴포넌트 | **16** | `components/Mackerel*.tsx` 24개 중 `MackerelDashboard.tsx`가 import하는 건 7개뿐 |
| 죽은 코드 | 약 **1,554 LOC** | 위 16개 합계 (`MackerelStrategy.tsx` 256줄 포함 — 컴포넌트는 미사용, `.module.css`만 19개 대시보드가 공유) |
| 페이지 데이터 | 209 KB 단일 JSON | 파트 전환과 무관하게 전량 로드 |
| 전용 API 라우트 | 3 (`mackerel-comtrade`, `mackerel-kcs`, `mackerel-ticker`) + 공통 8 | |

죽은 컴포넌트 16개: `AltSourcingIndex`, `Blackhole`, `FeedRatio`, `FilletPenetration`, `GhanaStrategy`, `MacroCycle`, `NorwaySpread`, `ProcessedWidgets`, `Sankey`, `SizePremium`, `SpreadWinners`, `StorageTurnover`, `TrioRadar`, `TRQMeter`, `UnitPrice`, `Strategy`.

### 1.2 2026-05-28 감사 이후 변경점 (재확인)

기존 감사서(`artifacts/mackerel_audit_2026_05_28.md`)가 지목한 **P0 2건은 이미 해소**되어 있다. 기획의 출발점을 잘못 잡지 않기 위해 먼저 정정한다.

| 감사 지적 | 현재 코드 | 판정 |
|---|---|---|
| `mackerel-comtrade` 하드코딩에 `isLive=true` | `route.ts:64-67` — `parsed.length > 0`일 때만 `isLive=true`, fallback은 `'UN Comtrade Fallback (정적 매핑)'` 라벨 | **해소** |
| `MackerelFTAQuarterly` STATIC에 SYNCED 표기 | `:201` — `status: 'STATIC'`, `syncDate: 'KMI FTA 수입동향 보고서 21건 수동 추출'` | **해소** |

따라서 이번 개편의 P0는 "허위 라이브"가 아니라 **"데이터 신선도와 재현성"**이다.

### 1.3 남아 있는 진짜 문제 4가지

**D1. 근거가 2019~2023에 멈춰 있다.** 4-Axis 평균 78점(B), D등급 7건은 전부 동일 패턴 — `a1=60`(출처 키워드 없음) + `a2=40`(syncDate 연도 부재/과거) + `a3=55`(STATIC). 자급률·양식·블랙홀·매크로사이클·어분·후쿠시마 프리미엄 위젯이 여기 해당한다. 아카이브에는 이 7건을 2026년 데이터로 대체할 소스가 **전부** 있다.

**D2. 아카이브와 대시보드가 끊겨 있다.** FTA 위젯은 "KMI PDF 21건 수동 추출"이다. 정직한 표기라는 점은 좋지만, **재현 불가**다. 다음 분기에 누가 어떻게 갱신하는지 코드 어디에도 없다. 아카이브의 FAO FishStat 필터본(`11_분석·가공데이터/collections/2026-08-12/fao_filtered/`, 5종 38MB)은 컬럼 스키마가 정리된 CSV인데 대시보드는 이걸 한 번도 읽지 않는다.

**D3. 위젯 과잉과 중복.** 90개 중 "블랙홀/신흥시장" 계열만 3개, "네덜란드 중계무역" 3개(w10/w18/w36), "아프리카 수출" 4개가 서로 다른 기간·정의로 흩어져 있다. 사내 실무자가 수입 소싱을 판단하려고 들어오면 어느 걸 봐야 할지 알 수 없다.

**D4. 출처 표기가 문자열이다.** `source: "FAO FishStatJ 2024, INFOFISH Magazine Issue 1/2026"` 같은 자유 텍스트라 기계 검증이 불가능하고, 4건은 `source: null`이다.

---

## 2. 목표와 성공 기준

사내 실무 의사결정용이므로 화려함이 아니라 **"이 숫자 어디서 나왔냐"에 3초 안에 답할 수 있는가**를 기준으로 삼는다.

| 지표 | 현재 | 목표 | 검증 방법 |
|---|---:|---:|---|
| 렌더 위젯 수 | 90 | **58 ± 3** | `PILLAR_WIDGET_IDS` + `EXTRA_BY_PILLAR` 카운트 |
| 4-Axis 평균 | 78.0 (B) | **88+ (A-)** | `scripts/extract_mackerel_widgets.py` 재실행 후 재채점 |
| D등급 위젯 | 7 | **0** | 동일 |
| 아카이브 파생 위젯 비중 | 0% | **≥ 70%** | provenance 블록에 `source_id` 존재하는 위젯 / 전체 |
| provenance 누락 위젯 | 4 (`source: null`) + 전량 자유텍스트 | **0** | 스키마 검증 스크립트 |
| 죽은 TSX LOC | 1,554 | **0** | 미참조 컴포넌트 0 |
| 데이터 페이로드 | 209 KB 일괄 | **파트별 분할 로드** | 초기 전송 바이트 |
| 갱신 재현성 | 수동 PDF 추출 | **`make mackerel` 1커맨드** | 두 번 돌려 결과 동일(해시 일치) |

---

## 3. 아키텍처 — 3계층 단방향

```
L1  아카이브 (SSOT, 불변)
    Google Drive .../mackerel/00_고등어_관련자료/
    ├── 10_원본데이터셋/collections/2026-08-12/   원본 CSV (읽기 전용)
    ├── 11_분석·가공데이터/collections/.../fao_filtered/  고등어 필터본 5종
    ├── 01~09 레인/                              1차 보고서 PDF + MD 짝
    └── 00_운영/source_registry.csv               소스 원장 (source_id 권위)
                    │
                    ▼  (읽기 전용, 절대 역방향 쓰기 금지)
L2  ETL — scripts/mackerel/build_*.py  (결정적, 재실행 가능)
    입력: 위 경로 + source_registry.csv
    출력: data/mackerel/<widget_id>.json  (provenance 블록 필수)
    부산물: data/mackerel/_manifest.json  (전체 위젯 ↔ 소스 매핑 + 입력 SHA-256)
                    │
                    ▼
L3  렌더 — lib/data/mackerel.ts → components/MackerelDashboard.tsx
    provenance 블록 → TelemetryBadge + 출처 툴팁 자동 생성
```

L2/L3는 이미 있는 구조를 **재사용**한다. `lib/data/mackerel.ts`가 이미 20개 데이터셋을 중앙 집중 export하고 있으므로 새 레이어를 만들지 않고 여기에 붙인다.

### 3.1 provenance 스키마 (신설, 필수)

모든 위젯 JSON에 다음 블록을 강제한다. 자유 텍스트 `source` 필드는 폐기.

```json
{
  "id": "w01",
  "provenance": {
    "source_id": "FAO_FISHSTAT_CAPTURE",        // source_registry.csv의 source_id와 일치해야 통과
    "publisher": "FAO",
    "series": "FishStat Capture 2026.1.0",
    "period": "1995-2024",
    "extract_date": "2026-08-12",
    "input_files": ["11_분석·가공데이터/collections/2026-08-12/fao_filtered/mackerel_capture.csv"],
    "input_sha256": ["a3f1..."],
    "method": "script",                          // script | manual_extract | api_live
    "rebuild": "python scripts/mackerel/build_capture.py",
    "grade": "A"                                 // A=1차출처 기계추출, B=1차출처 수동추출, C=2차/추정
  }
}
```

- `method: "manual_extract"`는 금지가 아니라 **표기 의무**다. 등급이 B로 내려가고 위젯 하단에 그대로 노출된다.
- `grade: "C"` 위젯은 카드에 "추정" 배지를 강제 표시한다. 현재 `SIMULATION_WIDGET_IDS` 상수를 이 필드로 대체한다.
- 검증기 `scripts/mackerel/validate_provenance.py`가 CI 게이트에 들어간다: `source_id`가 원장에 없거나 `input_sha256` 불일치면 빌드 실패.

---

## 4. 위젯 재편 매트릭스

### 4.1 판정 규칙

| 판정 | 조건 |
|---|---|
| **KEEP** | 아카이브 소스로 재생성 가능 + 2025~2026 데이터 + 실무 의사결정에 직접 쓰임 |
| **EDIT** | 소스는 있으나 기간·정의·라벨 정정 필요 |
| **MERGE** | 동일 주제 위젯 2개 이상 → 기간·정의 통일해 1개로 |
| **DELETE** | 아카이브에 근거 없음 + 2024년 이전 데이터 + 대체 위젯 존재 |
| **NEW** | 아카이브에 있는데 대시보드가 안 쓰는 소스 |

### 4.2 확정 DELETE (1차, 코드 정리)

렌더되지 않는 TSX 16개 전량 삭제. `MackerelStrategy.module.css`는 19개 대시보드가 공유하므로 **CSS는 보존**, `.tsx`만 삭제. 근거가 살아 있는 3건(`Sankey`, `TRQMeter`, `UnitPrice`)은 삭제 전 JSON 위젯으로 흡수 가능성을 Phase 1에서 판정한다.

### 4.3 MERGE 후보 (Phase 1에서 확정)

| 묶음 | 대상 | 통합 후 |
|---|---|---|
| 블랙홀/신흥시장 | `MackerelBlackhole.tsx` + w49 계열 + w52 | 1개 — FAO trade_partners 2021–2024 CAGR 기준 통일 |
| 네덜란드 중계무역 | w10 / w18 / w36 | 1개 — EUMOFA 기준 "가공(훈제) + 중계" 양립 명시 |
| 아프리카 수출 | w11 / w31 / w52 + `AfricanExportROI` | 2개 — (물량·단가) / (수출 채산성 시뮬레이션, grade C 명시) |
| 노르웨이 의존 | w14 + `NorwayAlt` + `NorwaySpread` | 1개 — **의존도 정의 통일**(감사 지적: subtitle 52% vs 자체 데이터 67% vs 외부 80~90% 불일치) |

### 4.4 NEW 위젯 후보 12건 — 전부 아카이브에 원본 존재

사내 실무(수입 소싱·단가 협상·재고 판단) 관점에서 우선순위 순.

| # | 위젯 | 소스 (아카이브 경로) | 실무 용도 |
|---|---|---|---|
| N1 | **ICES 권고 TAC vs 실제 어획 초과율** | `01_.../ices/2026-08-12_full/ICES_Atlantic_mackerel_advice_2026.pdf` | 내년 대서양 물량·가격 방향 선행지표 |
| N2 | **노르웨이 주간 수출 물량·단가 (W32/2026)** | `03_.../norwegian_seafood_council/NSC_herring_mackerel_week_32_2026.xlsx` | 주간 단가 협상 레퍼런스 — 유일한 주간 해상도 |
| N3 | **한국 수입 파트너 시프트 맵** | `fao_filtered/mackerel_trade_partners.csv` (148k행) | 노르웨이 대체선 실제 이동 추적 |
| N4 | **MFDS 수입식품 부적합·검사 이력** | `06_.../mfds/MFDS_mackerel_imported_food_products_2025.csv` | 신규 거래처 리스크 스크리닝 |
| N5 | **NPFC 태평양참고등어 자원평가 상태** | `01_.../npfc/NPFC_TWG_CMSA11_report_2025.pdf` | 국내산·중국산 물량 전망 |
| N6 | **EUMOFA 가치사슬 가격 피라미드** | `05_.../eumofa/EUMOFA_Monthly_Highlights_4_2026_annex.xlsx` | 산지→도매→소매 마진 구간 확인 |
| N7 | **미국 시장 수입 동향 (월별)** | `10_.../usda_gats/mackerel_trade_usda.csv` (2025-01~2026-06) | 미국 수출 검토 시 경쟁 물량 |
| N8 | **가공품(trade_pp) 형태별 교역** | `fao_filtered/mackerel_trade_pp.csv` | 필렛·염장·통조림 부가가치 구간 |
| N9 | **MSC 인증 커버리지 추이** | `07_.../msc/MSC_small_pelagic_yearbook_2026.pdf` | 유럽·미국 바이어 요구 대응 |
| N10 | **GLOBEFISH 소형부어류 수급 브리핑** | `05_.../globefish/FAO_GLOBEFISH_small_pelagics_May_2026.pdf` | 분기 수급 내러티브 |
| N11 | **KMI 인기어종 6월 국내 가격** | `03_.../kmi_fishdata/KMI_popular_fish_June_2026.pdf` | 국내 판매가 벤치마크 |
| N12 | **UN Comtrade 5개 HS6 교역 매트릭스 (2021–2025)** | `10_.../un_comtrade/mackerel_trade_comtrade.csv` (164k행) | 기존 `mackerel-comtrade` fallback을 실데이터로 대체 |

N12는 부수 효과가 크다 — 현재 `FALLBACK_FLOW` 하드코딩 8줄이 164k행 실측으로 교체되고, API 실패 시에도 정직한 아카이브 스냅샷을 반환하게 된다.

### 4.5 최종 위젯 수 산정

```
현재 렌더                 90
  DELETE (근거 없음·중복)  -44
  MERGE 로 흡수            -가산 없음(위 44에 포함)
  KEEP/EDIT                46
  NEW                      +12
────────────────────────────
목표                       58
```

---

## 5. 실행 계획

### Phase 0 — 기준선 고정 (Claude Code, 0.5일)

- 현재 페이지 4-Axis 재채점 (감사서가 3개월 전이므로 재실행)
- `docs/mackerel_widget_ledger.csv` 생성: 위젯 90건 × (id, pillar, 현재 소스, 데이터 최신연도, 아카이브 매핑 가능 소스, 판정안)
- 산출물: 원장 CSV 1개. **이게 이후 모든 작업의 작업지시서다.**

### Phase 1 — 판정 확정 (Claude Code + 사용자 검토, 0.5일)

- 원장의 KEEP/EDIT/MERGE/DELETE/NEW 판정 확정
- **게이트: 사용자 승인.** 44건 삭제는 되돌리기 비싸므로 여기서 한 번 끊는다.

### Phase 2 — ETL 파이프라인 (Claude Code, 1.5일)

- `scripts/mackerel/build_*.py` — 소스별 빌더. 표준 라이브러리 + 기존 `scratch/analyze_mackerel_*.py` 재사용
- `scripts/mackerel/validate_provenance.py` — 스키마·해시·source_id 검증기
- `Makefile` 타깃 `mackerel` — 전체 재생성 1커맨드
- **게이트: 두 번 돌려 출력 해시 동일** (결정성 확인)
- 자체 검증: `scripts/mackerel/test_build.py` — assert 기반, 프레임워크 없음

### Phase 3 — 데이터 생성 + 위젯 정리 (병렬)

| 담당 | 범위 | 파일 소유권 (배타) |
|---|---|---|
| **Claude Code** | ETL 빌더 12건 실행·검수, provenance 채우기, MERGE 4묶음 정의 통일 | `scripts/mackerel/**`, `data/mackerel/**`, `lib/data/mackerel.ts` |
| **Codex** | 죽은 TSX 16개 삭제, 잔존 TSX 7개를 WidgetCard 패턴·provenance 배지로 통일 | `components/Mackerel*.tsx` |
| **OpenCode** | JSON 위젯 83건의 `source` 자유텍스트 → `provenance` 블록 기계 변환 | `public/data/mackerel_real_data_v13.json` → `v14.json` |

**충돌 방지 규약** (기존 `CODEX_TASK.md` 패턴 그대로 적용):
- 위 표의 파일 소유권은 배타적이다. 남의 칸 파일은 읽기만 하고 절대 수정하지 않는다.
- 각자 별도 브랜치, 순차 머지. 머지 순서: Codex(삭제) → OpenCode(JSON 변환) → Claude(ETL 결과 주입).
- 각 브랜치는 머지 전 `npm run build` 통과 필수 (L-03 빌드 게이트).

### Phase 4 — 신규 위젯 12건 구현 (Claude Code + Codex, 2일)

- Claude: N1~N12 데이터 빌더 + SIT/TAK 인사이트 작성 (UI_RULES 2-1 준수)
- Codex: 차트 컴포넌트 구현 (Recharts, 기존 WidgetCard 패턴)
- 각 위젯은 provenance 블록 없으면 머지 불가

### Phase 5 — 검증 (Claude Code + 교차벤더, 0.5일)

1. `validate_provenance.py` 전건 통과
2. 4-Axis 재채점 → 평균 88+ / D등급 0 확인
3. **writer ≠ reviewer**: 신규 위젯 12건의 SIT/TAK 클레임을 `source-verifier`로 아카이브 원문 대조 (작성자와 다른 세션)
4. Codex 교차검증: 수치 클레임 12건 (정당 / false alarm) 판정
5. `npm run build` + 페이로드 크기 측정

### Phase 6 — 배포

**사용자 명시 요청 시에만 실행.** `deploy.sh` 실행 전 프리뷰 확인.

---

## 6. 일정

| Phase | 기간 | 게이트 |
|---|---|---|
| 0 기준선 | 0.5일 | 원장 CSV |
| 1 판정 | 0.5일 | **사용자 승인** |
| 2 ETL | 1.5일 | 결정성 해시 일치 |
| 3 정리(병렬) | 1일 | build 통과 × 3브랜치 |
| 4 신규 12건 | 2일 | provenance 전건 |
| 5 검증 | 0.5일 | 4-Axis 88+ |
| **합계** | **6일** | |

---

## 7. 리스크

| 리스크 | 대응 |
|---|---|
| Google Drive 경로가 로컬 동기화 상태에 의존 | ETL은 읽기 전용. 미동기화 시 명확한 에러로 중단, 부분 산출물 생성 안 함 |
| PDF 소스(ICES·NPFC·MSC·GLOBEFISH) 자동 추출 한계 | MD 짝이 이미 있음. `method: "manual_extract"` + grade B로 정직 표기, 추출 근거 문장을 provenance에 인용 |
| 44건 삭제 후 "그거 어디 갔냐" | Phase 1 승인 게이트 + 원장 CSV에 삭제 사유 기록. git revert 가능 |
| EUMOFA·NSC 자동 접근 403 (아카이브 HANDOFF 기재) | 이번 개편은 **아카이브 스냅샷 기준**. 라이브 연동은 범위 밖 |
| KCS API 401 (서비스키 미설정) | 기존 `mackerel-kcs` 라우트 유지. 키 확보는 별건 |

---

## 8. 이번 범위에서 제외

- IA·5-Pillar 구조 변경 (S1~S5 골격 유지)
- 디자인 시스템 변경 (UI_RULES V4.2 그대로)
- 신규 라이브 API 연동 (아카이브 스냅샷 기준으로 고정)
- 다른 품목 대시보드
- 배포 (사용자 요청 시 별도)

---

## 9. 승인 요청

1. **Phase 1 삭제 44건 판정 방식** — 원장 CSV 검토 후 일괄 승인 / 건별 확인 중 선택
2. **신규 12건 우선순위** — 6일이 길면 N1~N6만 먼저 (4일로 단축)
3. **v14.json 전환** — 기존 `v13.json` 보존 여부 (권장: 보존, 롤백용)

---

## 부록 A. 아카이브 즉시 사용 가능 자산

| 자산 | 경로 | 규모 |
|---|---|---|
| FAO FishStat 고등어 필터본 5종 | `11_분석·가공데이터/collections/2026-08-12/fao_filtered/` | 38 MB / capture 14,071행, global_production 14,180행, trade 82,510행, trade_partners 148,031행, trade_pp 4,859행 |
| UN Comtrade | `10_원본데이터셋/collections/2026-08-12/api_extracts/un_comtrade/` | 164,002행 (2021–2025, HS6 5종) |
| USDA GATS | `.../usda_gats/` | 243행 (2025-01–2026-06) |
| MFDS 수입식품 | `10_.../2026-08-12_full/mfds/` | 2025년 전건 |
| 1차 보고서 PDF+MD 짝 | 레인 01~09 | ICES 2026 / NPFC TWG 2025 / NSC W32 2026 / KMI 6월·전망 2026 / GLOBEFISH 2026-05 / EUMOFA 2026-04(+annex) / MSC 2026 / SOFIA 2026 |
| 소스 원장 | `00_운영/source_registry.csv` | 20 소스, source_id·발행처·주기·접근방식·최종확인일 |

## 부록 B. 보안 (아카이브 HANDOFF 인용, 이번 범위 밖이나 미해결)

수집 저장소 GitHub Actions workflow에 API 키 평문 존재. 키 회전 + GitHub Secrets 이전 필요. 대시보드 저장소와는 별건이나 열려 있는 항목이므로 기록해 둔다.
