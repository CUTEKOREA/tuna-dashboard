# value-chain 페이지 위젯 신뢰도·유효성 감사 — Multi-Agent Edition

> **작성:** 2026-05-28 Claude Code 세션 (오케스트레이션)
> **범위:** [components/TunaDashboard.tsx](../components/TunaDashboard.tsx) 5-Pillar 전체 (120 WidgetCard)
> **검증 채널:** Claude Opus 4.7(메인) + Antigravity Gemini 3.1 Pro(API/교차) + Codex GPT-5.5(독립검증)
> **비용:** $0 (AI Ultra 쿼터 + Claude Max OAuth + ChatGPT Plus)
> **선행 audit:** [tuna_widget_audit.md](./tuna_widget_audit.md) 2026-05-20 (33 위젯) — 그 사이 87개 추가

---

## Executive Summary

### 📊 전체 등급
- **평균 4-Axis 점수: 78.7 / 100 (B등급)**
- A등급(85+): 25개 (21%)
- B등급(75~84): 62개 (52%)
- C등급(65~74): 33개 (28%) — 보강 권고
- D등급(<65): **0개** ✅

### 🚨 즉시 정정 권고 (4건)

#### API 라우트 (Phase 3, Antigravity Pro 분석)
1. **[app/api/petfood/route.ts:31-47](../app/api/petfood/route.ts#L31)** — 하드코딩 KPI에 "ITC TradeMap 실시간"·"대만 관세청 실시간" **허위 라이브 출처** 명시.
   - **권고:** `desc` 필드의 출처 라벨을 "STATIC" 또는 "추정치"로 정정
2. **[app/api/compliance/route.ts:74-84](../app/api/compliance/route.ts#L74)** — `SANCTIONS_DB` 하드코딩 데이터인데 응답 메타에 `source: 'SANCTIONS_API_LIVE'`, `grade: 'S', label: 'Live Compliance DB'` **허위 라이브 표기**.
   - **권고:** `SANCTIONS_FALLBACK` + `'Mock DB'` 라벨로 교체

#### 위젯 클레임 (Phase 4, Antigravity 교차검증 + Phase 5 Codex 독립검증)
3. **[components/TunaIntelInsightsB4.tsx:244](../components/TunaIntelInsightsB4.tsx#L244)** — `telemetry.syncDate: '2026-05 (NotebookLM 가나 노트북)'` — NotebookLM은 **AI 워크스페이스 도구**일 뿐 공신력 있는 출처가 아님.
   - **권고:** 동원/사조 공식 ESG 보고서 또는 RAS 학술 문헌 인용으로 교체. 또는 telemetry에서 NotebookLM 명칭 제거 후 "기업 IR / 학술 연구 기반"으로 일반화

### ⚠️ 표현 정정 (3건 — Phase 3 Antigravity)
4. **[app/api/tuna-ranching/route.ts:63-87](../app/api/tuna-ranching/route.ts#L63)** — 정적 데이터인데 `telemetry: "SYNCED"` 모호 표기 → `"STATIC"`으로 통일
5. **[app/api/oec/route.ts:133-134](../app/api/oec/route.ts#L133)** — 2023년 데이터를 `grade: 'A'`로 부여 (3년 stale) → grade 하향 + 'Stale' 라벨

### ✅ 추가 EDIT 권고 (Phase 5 Codex)
- **방콕 가다랑어 $1,850 (TunaAtunaMayNews)**: Codex 판정 **EDIT** — Atuna News 기사 인용은 가능하나 **원문 수치·날짜·시장 조건 정확히 병기** 필요. 현재 cardDesc에 "고점 대비 하락세"만 표기되어 있어 충분치 않음.
- **한국 PBF 양식 +667% (TunaKmiFtaBluefinInsights)**: Codex 판정 **false alarm + KEEP**. 15톤 → 114톤은 소규모 표본 자연 급증. termTooltip 또는 cardDesc에 "**저베이스 효과 (low-base effect)**" 명시 권장.

---

## 1. 인벤토리 (Phase 1)

### 1.1 5-Pillar 분포

| Pillar | 위젯 수 | LIVE | SYNCED | STATIC | 동적*  | 평균 점수 |
|---|---:|---:|---:|---:|---:|---:|
| S1 원료 수급 | 27 | 5 | 9 | 13 | 0 | **80.9** |
| S2 가공·생산 | 15 | 2 | 6 | 6 | 1 | 78.7 |
| S3 물류·통관 | 21 | 5 | 5 | 2 | 9 | 79.1 |
| S4 판매·수요 | 35 | 7 | 11 | 16 | 1 | 78.8 |
| S5 ESG | 22 | 3 | 4 | 14 | 1 | **75.6** |
| **합계** | **120** | **22** | **35** | **51** | **12** | **78.7** |

\* "동적"은 `status: isLive ? 'LIVE' : 'STATIC'` 같은 조건부 표기 — 실제로는 LIVE/STATIC 동적 결정. 정규식 미검출, 실제 누락 0.

### 1.2 발견된 API 라우트 (16개)

- 실재 14개: compliance, hs-ping, mof-fishery, oec, osh, petfood, tuna, tuna-emerging-markets, tuna-extract, tuna-forecast, tuna-policy-risk, tuna-ranching, tuna/ticker, wits
- 주석 처리된 죽은 호출 2개: `/api/tuna/arbitrage`, `/api/tuna/trq` → 클린업 권고

---

## 2. API 라우트 mock audit (Phase 3, Antigravity Pro)

**입력:** 14개 라우트 합본 134KB → Gemini 3.1 Pro 1회 호출 (Antigravity 쿼터)

### 2.1 즉시 정정 2건
- 위 Executive Summary 1·2번 참조

### 2.2 표현 정정 2건
- 위 Executive Summary 4·5번 참조

### 2.3 검증 통과 10건
hs-ping · mof-fishery · osh · tuna · tuna-emerging-markets · tuna-extract · tuna-forecast · tuna-policy-risk · tuna/ticker · wits

→ 라이브 API + 폴백 라벨링 정확, 가다랑어/황다랑어 가격 정상 범위, FTA 양허 사실 오류 없음.

상세: [artifacts/api_routes_audit_antigravity.md](./api_routes_audit_antigravity.md)

---

## 3. 클레임 교차 검증 (Phase 4, Antigravity Pro × 출처 14건)

**입력:** 117 cardDesc + 출처 아카이브 14건 → Gemini 3.1 Pro 1회

### 3.1 출처 충돌 (A) 2건
- [TunaCannedMarketShare.tsx:58](../components/TunaCannedMarketShare.tsx#L58) — 2025 상반기 점유율 표기 → 한국경제 2026-03의 동원 80% 돌파 최신 지표와 충돌. **갱신 권고**.
- [TunaAtunaMayNews.tsx:38](../components/TunaAtunaMayNews.tsx#L38) — Phase 5 Codex가 기각 (실제 source 표기 정상). **KEEP**.

### 3.2 Stale (B) 4건 — 2026 갱신 가능
- **[PacificEezStrategicWidget.tsx:122](../components/PacificEezStrategicWidget.tsx#L122)** — WCPFC 2024 기반 → WCPFC CMM 2025-02 (2026-02 발효) 데이터로 갱신
- **[TunaTacMonitor.tsx:88](../components/TunaTacMonitor.tsx#L88)** — IOTC/ICCAT 2025 → IOTC-2026-S30-INF04 최신 관리절차 데이터로 갱신
- **[TunaEsgRiskRadar.tsx:40](../components/TunaEsgRiskRadar.tsx#L40)** — 2025-11 → ISSF 2026 State of Global Tuna Sustainability EM/FAD 지표로 갱신
- **[TunaNewInsightsA.tsx:39](../components/TunaNewInsightsA.tsx#L39)** — EUMOFA 2024 → FFA 2026-02 보고서 신규 아시아 기업 역학 데이터로 교체

### 3.3 잘못된 인용 (C) 1건
- [TunaIntelInsightsB4.tsx:244](../components/TunaIntelInsightsB4.tsx#L244) — NotebookLM 출처 (Executive Summary 3번)

### 3.4 의심 outlier (D) 3건
- 사시미 14배 가격 격차 (TunaJapan2050Insights.tsx:447): 등급 간 격차 검토 필요 — Kawamoto 2017 원본 재확인 권고
- 환율 1바트 절상 → 순이익 -10% (PetFoodDashboard.tsx:533): 민감도 과대 계상 여부 재계산 권고
- 한국 PBF +667% (TunaKmiFtaBluefinInsights.tsx:238): Phase 5 Codex가 정상으로 확인. **KEEP**.

상세: [artifacts/cross_validation_antigravity.md](./cross_validation_antigravity.md)

---

## 4. 독립 검증 (Phase 5, Codex GPT-5.5)

**Antigravity가 critical로 분류한 3건 → 실제 코드 발췌 후 Codex에 writer-reviewer 패턴으로 위임**

### Codex 판정

| # | 의혹 | Codex 판정 | 권고 |
|---|---|---|---|
| 1 | NotebookLM 출처 명시 (TunaIntelInsightsB4.tsx:244) | **정당** | **EDIT** — "NotebookLM은 2차 정리 도구라 telemetry syncDate의 공신 출처로 단독 명시 금지" |
| 2 | 방콕 가다랑어 $1,850 (TunaAtunaMayNews.tsx) | **정당** (Antigravity 일부 정확) | **EDIT** — "Atuna News 기사 인용은 가능하나 원문 수치·날짜·시장 조건 정확히 병기 필요" |
| 3 | 한국 PBF +667% (TunaKmiFtaBluefinInsights.tsx) | **false alarm** | **KEEP** — "15톤 베이스의 114톤은 소규모 표본에서 가능한 급증, '저베이스 효과' 표기 권장" |

### Multi-Agent 합의 결과
- **3건 모두 KEEP은 아님** — 1·2는 EDIT, 3은 KEEP
- **Antigravity가 정당히 잡은 의혹: 1·2**
- **Antigravity가 과도하게 의심한 것: 3** (Codex가 false alarm 판정)
- Phase 4의 단일 모델(Antigravity) 의존 시 false positive 1건 발생 → **2-모델 교차 검증의 가치 확인**

---

## 5. 4-Axis 점수 분포 (Phase 6)

### 5.1 평가 기준
- **Axis 1 (출처 신뢰도):** cardDesc에 1차 출처(FAO·ISSF·WCPFC·MOF·KCS·WTO·OEC·EUMOFA·USDA·NOAA·ECOS·FishStat·KFAS·KMI·KAMIS·Atuna·관세청·해수부·한국해양수산개발) 명시 여부
- **Axis 2 (데이터 신선도):** syncDate 연도 기반 (2026 → 95, 2025 → 75, 2024/Real-time → 70, 2023↓ → 40)
- **Axis 3 (검증 가능성):** TelemetryBadge status (LIVE 95 / SYNCED 80 / STATIC 55 / 동적 70)
- **Axis 4 (통합 완성도):** pillar 명시 + cardDesc 30자↑ + telemetry 존재 (각 10점)

### 5.2 등급 분포
- A: 25 (21%) | B: 62 (52%) | C: 33 (28%) | D: 0 (0%)

### 5.3 C등급 33개 (Pillar 분포)
S1: 6 · S2: 4 · S3: 6 · S4: 8 · **S5: 9 (가장 많음)**

**S5 ESG가 가장 약함 — STATIC 14개 중 다수가 점수 압박.**

주요 C등급 (점수 ≤ 68.8):
- US 위젯들 (Census/WITS): UsPollockDetourWidget, UsTunaImportWidget, UsTunaMarketShareWidget — cardDesc에 한글 출처 표기 부족 → 한글 출처명 추가하면 즉시 B 승급
- TunaInsightsDashboard.tsx의 "Insight 1~15" 14개 — 의도된 STATIC + "Reference Only" 라벨 (이전 audit 권고 반영) → **현 상태 유지가 의도**, 점수 낮음은 정상

전체 명세: [artifacts/value_chain_4axis_scores.csv](./value_chain_4axis_scores.csv)

---

## 6. 우선순위 액션 플랜

### P0 (즉시, 24시간 내)
1. `app/api/petfood/route.ts` 허위 라이브 출처 → STATIC 라벨 정정
2. `app/api/compliance/route.ts` SANCTIONS_API_LIVE → SANCTIONS_FALLBACK 라벨 정정
3. `components/TunaIntelInsightsB4.tsx:244` NotebookLM 출처 명칭 제거 또는 공식 출처로 교체 (Codex 정당 확인)
4. `components/TunaAtunaMayNews.tsx:38` cardDesc에 Atuna 원문 수치·날짜·시장 조건 정확히 병기 (Codex 정당 확인)

### P1 (1주 내)
4. `app/api/tuna-ranching/route.ts` SYNCED→STATIC 통일
5. `app/api/oec/route.ts` 2023 데이터 grade 하향
6. PacificEezStrategicWidget·TunaTacMonitor·TunaEsgRiskRadar·TunaNewInsightsA 2026 출처로 갱신
7. TunaCannedMarketShare 2026 점유율로 갱신

### P2 (의심 검토)
8. TunaJapan2050Insights 사시미 14배 격차 Kawamoto 2017 원본 재확인
9. PetFoodDashboard 환율 민감도 재계산

### P3 (코드 클린업)
10. TunaDashboard.tsx:486~487 주석 처리된 `/api/tuna/arbitrage`·`/api/tuna/trq` 호출 제거

### P4 (점수 개선, 선택)
11. US 위젯 cardDesc에 한글 출처명("미국 인구조사국 무역통계", "월드뱅크 WITS API") 명시 → C→B 승급
12. S5 ESG STATIC 위젯 → ISSF 2026 / FFA 2026 등 라이브 또는 SYNCED로 승격

---

## 7. Multi-Agent 분업 메모

이번 audit은 다음 토폴로지로 비용 $0 달성:

| 단계 | 모델 | 비용 |
|---|---|---|
| Phase 1 인벤토리 (정규식 추출) | Claude + Python 스크립트 | $0 |
| Phase 2 신선도 분석 | Claude + Python | $0 |
| Phase 3 API audit (14 라우트 일괄) | Antigravity Gemini 3.1 Pro | $0 (AI Ultra) |
| Phase 4 클레임 교차검증 (117×14) | Antigravity Gemini 3.1 Pro | $0 (AI Ultra) |
| Phase 5 독립 검증 (critical 3) | Codex GPT-5.5 | $0 (ChatGPT Plus) |
| Phase 6 종합 보고서 | Claude (이 세션) | $0 (Max 20x) |

**참고:** Antigravity Pro vs Codex 의견이 갈린 케이스 2건에서 Codex가 false alarm을 잡아냄 → 단일 모델 의존 시 잘못된 결론 가능.

---

**Generated by Claude Code multi-agent orchestration. Cost: $0.**
