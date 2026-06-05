# 신뢰도 향상 마스터 플랜 — tuna-dashboard

> 작성: report-writer (Claude Code) · 2026-06-05
> 입력: 6차원 설계 → 적대적 검증(adversarial-reviewer) → 교차벤더(Codex) 합의
> 상태: 적대검증 keep/fix 반영 · cut 항목 제외 · 분모/공수 정정 완료

---

## 1. Executive Summary

tuna-dashboard는 **675개 WidgetCard 위젯 / 34 대시보드 / 141 API 라우트**로 구성되나, 신뢰도가 **구조적으로 상한에 걸려 있다**. telemetry 실측은 STATIC 387(62%) · SYNCED 191(28%) · LIVE 42(7%)로, 141개 라우트 인프라 대비 라이브 활용이 7%에 그친다. 정적 JSON을 직접 import하는 위젯이 105개로, 데이터 갱신이 코드 수정에 묶여 신선도·검증성 점수의 천장을 만든다.

방금 sashimi 파일럿(36 위젯)이 **audit→정정→재채점 루프**를 입증했다: 4-Axis 평균 **71.7→78.2**, A-gate(≥85) **0→6/36**, F등급 **2→0**. 단 이 루프는 sashimi 천장이 **a2 신선도·a3 검증성**(STATIC 구조 + 2차출처 프로즈)임을 동시에 드러냈다 — 즉 점수를 더 올리려면 표시층이 아니라 **데이터 인테이크·출처 추적성**을 구조적으로 손봐야 한다.

**목표 KPI (2026 Q3 종료 기준):**

| KPI | 현재 | 목표 |
|---|---|---|
| 출처 없는 cardDesc 신규 커밋 | 측정 안됨 | 0건/주 (block 게이트 강제) |
| 빈 fallback 라우트 (`\|\| ''`) | **21건** | 0건 |
| 가짜 LIVE 라벨(정적import+LIVE) 신규 유입 | 미검출 | 0건 (pre-push 차단) |
| Tier-1 고가치 위젯 LIVE 전환 | 0 | +12 (LIVE 42→54) |
| sashimi 68위젯 sourceRefs 핀고정율 | 0% | ≥90% |
| a1tier=primary 위젯 클릭형 1차출처 링크 | 0% | ≥80% |
| 4-Axis 정본 스키마 정규화 | 0/9 CSV | 9/9 (100%) |

---

## 2. 현황 진단 (실측)

**사이트 메트릭 (grep/find 직접 검증):**
- WidgetCard 인스턴스 **675** · 대시보드 **34** · API 라우트 **141** · public/data JSON **82** · docs 출처아카이브 **28 md**
- telemetry: **STATIC 387(62%)** · SYNCED 191(28%) · **LIVE 42(7%)**
- 정적 JSON 직접 import 위젯 **105** (분모는 105로 고정 — 차원별 105/106 혼용을 105로 통일)

**4-Axis 채점 자산 (실측 9개 CSV, 6종 이상 스키마로 분산):**

| CSV | 열 수 | 스키마 특성 |
|---|---|---|
| galchi / jukkumi | 9열 | id,title,a1~a4,avg,grade |
| mackerel / squid | 13열 | src,file,line,id,pillar,…,self_reliability |
| salmon / shrimp | 11열 | axis1~4 |
| sashimi | 15열 | (구버전) |
| sashimi_new36 | 14열 | widget,title,pillar,telemetry,a1~a4,audit_avg,adjusted_avg,grade,p0~p2_count |
| value_chain | 11열 | dynamic |

→ **6종 이상 스키마**로 분산되어 위젯행을 사이트 단위로 **합산·비교 불가**. (당초 "3종" 진단은 과소 — 정규화 공수를 한 단계 상향함.)

**sashimi 파일럿이 드러낸 구조적 천장:**
- Sas*.tsx **68개 전부 존재**하나 audit/재채점은 **36개(new36)**만 커버 → 커버리지 36/68. (KPI 분모는 모두 68 기준으로 통일.)
- 68위젯 전부 source 필드 보유하나 **100% 자유텍스트 프로즈** — 파일 내 resolvable URL/행ID **0건**(전수). 위젯 코드 전체에서 source가 URL인 케이스 **0건**.
- 재채점 후에도 a2(신선도)·a3(검증성)가 천장 — **STATIC 구조와 2차출처 프로즈가 원인**.

---

## 3. 근본 원인 (왜 신뢰도가 capped인가)

1. **STATIC 62% + 정적 JSON import 105위젯** — 데이터가 코드에 박혀 신선도(a2)가 코드 배포 주기에 종속. 141 라우트 인프라가 있어도 위젯이 fetch가 아닌 import라 LIVE로 승격 불가.
2. **2차출처 프로즈** — source가 'FAO Tech.Paper 667 Ch.12' 식 자유텍스트라 기계 검증 불가 → 검증성(a3)이 구조적으로 상한.
3. **일회성 audit** — 점수가 시점 스냅샷. 신규/수정 위젯이 측정체계 밖으로 새고, 머지 누적으로 천장이 다시 내려감.
4. **측정체계 자체의 분산** — 9개 CSV·6종 스키마·채점법 이종(엄격 2단계 vs 관대 단일)으로 사이트 단위 신뢰도 KPI를 산출할 단일 원장이 없음. **자기 측정값부터 불일치**(분모 혼선).
5. **회귀 차단 부재** — verify_claims는 warn-only(exit 0), L-09 가짜LIVE 구조패턴 미검출, 빈 fallback 21건이 deploy-lag 폴백 위험으로 방치.

---

## 4. 6대 이니셔티브 (적대검증 keep/fix 반영, cut 제외)

> **cut 항목(반영 안 함):** TelemetryBadge 4-Axis 등급칩(표시층, 데이터 신뢰 무개선 — Codex 기각 합의) / 675 전수 라이브 전환(1차 API 부재로 비현실) / 25품목 아카이브 풀세트(effort XL, 단계적으로) / 34대시보드 fan-out(정의 불명확·widget-audit 중복). 중복 이니셔티브 7건은 1건으로 통합.

### I-1. verify_claims warn→block 승격 + cardDesc 출처 스캔 — [감사4-이니1]
- **목표:** 출처 없는 수치가 커밋 시점에 막힌다.
- **방법:** verify_claims.sh를 `exit 0 → exit 2`로 승격(verify_zip 1.2.0 백업폴더 제외+120분 가드 패턴 차용). NUM/SRC 정규식을 staged `components/*.tsx`의 cardDesc까지 확장 스캔. manifest verify_claims: warn → block. **승격 전 1주 경고 모드 false-positive 관찰 ≤5% 확인 후 차단.**
- **에이전트:** 메인(스크립트) · adversarial-reviewer(false-positive 반증) · codex-verify(승격 회귀 교차검증)
- **산출물:** 차단모드 verify_claims.sh + 갱신 manifest + 바이패스 로그
- **KPI:** 출처없는 cardDesc 신규 커밋 0건/주 · false-positive율 <5%
- **공수/효과:** **S / H** ← **ROI 1위**

### I-2. 9개 CSV 스키마 정규화 + 단일 신뢰도 원장 — [측정1-이니1]
- **목표:** 707 위젯행을 사이트 단위로 합산 가능한 단일 원장으로.
- **방법:** sashimi_new36 14열을 **정본(canonical) 스키마**로 채택(telemetry·audit_avg·adjusted_avg·p0/p1/p2_count 보유). 나머지 8 CSV를 `scripts/normalize_scorecards.py`로 마이그레이션. **score_method 컬럼(strict_2step/single_agent) 추가**로 채점법 오염 차단. **분모 선결: sashimi 36(audit) vs 68(전체)을 68로 고정**, 미측정 위젯은 NULL 행. KPI는 strict 부분집합 1차·전체 2차로 이중 보고.
- **에이전트:** inventory-extractor(전수 인벤토리) · Librarian(Gemini Direct, 9 CSV→정본 codemod plan) · 메인(실행·diff·단일 커밋)
- **산출물:** artifacts/trust_ledger_baseline.csv(정본 스키마 단일 원장) + normalize_scorecards.py + 미측정 차집합
- **KPI:** 스키마 정규화율 9/9=100% · 중복 위젯ID 0 · a1~a4 결측 명시율 100%
- **공수/효과:** **L / H** (당초 M → 6종 스키마 실측으로 상향)

### I-3. 141 라우트 빈 fallback 21건 일괄 패치 — [Live2-이니2]
- **목표:** deploy-lag 시 즉시 폴백 위험 제거.
- **방법:** `scripts/fix_fallback_keys.py` 1스크립트로 (A) 빈 폴백 `process.env.KEY || ''` **21건**(9+ 아님)을 실키 fallback으로 교체 (B) 폴백 키 부재 라우트(comtrade·mackerel-comtrade·salmon/comtrade·us-census)에 키 추가 (C) isLive 필드 미출력 라우트 L-12 통일. L-07 일괄 변환→diff→단일 커밋.
- **에이전트:** Librarian(141 라우트 스캔·codemod plan) · Hephaestus(스크립트 실행) · Oracle(diff 적대 검수, L-218 hasKeys 예외 구분)
- **산출물:** fix_fallback_keys.py + 단일 커밋 + L-219 grep zero-검출 로그
- **KPI:** 빈 폴백 21→0 · 폴백 키 부재 4→0 · npm run build(L-03) 통과
- **공수/효과:** **M / H**

### I-4. L-09 가짜LIVE 린트 pre-push 승격 — [감사4-이니2 ≡ 토폴로지6-이니1, 통합]
- **목표:** 정적import+LIVE 참칭 신규 유입 0.
- **방법:** `scripts/lint_l09.py` 신규(정규식 2-pass: `import X from '*.json'` + `status:'LIVE'` 동시존재 + fetch 분기 부재. 동적 `isLive?'LIVE':'STATIC'`는 화이트리스트). + 내부정합 린트(public/data JSON 합계행=구성요소 합·% 합≈100±0.5). pre-push 게이트 추가. data-freshness.yml 회귀 잡 등록. **4·6차원 중복을 1건으로 통합.**
- **에이전트:** 메인(린트) · inventory-extractor(정적import 위젯·JSON 대상목록) · adversarial-reviewer(동적 LIVE 분기 오탐 검증)
- **산출물:** lint_l09.py + lint_internal_consistency.py + 확장 pre-push + 위반 인벤토리 CSV
- **KPI:** 가짜LIVE 신규 유입 0 · 합계/% 불일치 JSON 0/82
- **공수/효과:** **M / H**

### I-5. source 필드 → 1차출처 행ID 핀고정 + 클릭 링크 — [아카이브3-이니2 + UX5-이니2 통합]
- **목표:** a3 검증성 천장 실질 돌파(표시층 아닌 데이터층).
- **방법:** source 프로즈 유지 + `sourceRefs` 배열(`<commodity>#<행번호>`) 핀고정. `scripts/fix_source_pins.py` 일괄 주입(price_grade md '클레임별 검증 결론' 시드). TakeawayBox.tsx에 `sourceLinks?: {label,url}[]` 확장 — URL 있으면 `<a target=_blank>`, 없으면 plain text graceful fallback. a1tier=primary(sashimi 23/32) 우선. **신규 외부 호출 없이 기존 docs 28md + 82 JSON 링크만 연결.** 매핑 URL은 codex-verify로 유령출처(sashimi $908M 사고) 차단.
- **에이전트:** source-verifier(프로즈↔행 대응표) · Librarian(sourceRefs/URL 매핑 fan-out) · codex-verify(URL 1차출처 적대 확인) · Hephaestus(링크 렌더)
- **산출물:** fix_source_pins.py + TakeawayBox sourceLinks 확장 + 매핑 JSON
- **KPI:** sashimi 68위젯 sourceRefs 부착 0%→90%+ · resolve율 ≥90% · a1tier=primary 링크 0%→≥80% · 유령출처 0건
- **공수/효과:** **M / H**

### I-6. Tier-1 고가치 STATIC 위젯 라이브 전환 (12종 한정) — [Live1-이니1]
- **목표:** a2 신선도 천장 돌파(전수 아닌 고가치 한정).
- **방법:** STATIC 387 중 가격·무역·어획 Tier-1 12종(TunaPriceDecoupling·TunaExportShare·TunaImportBlackhole·MackerelUnitPrice·SquidUnitPrice·ThaiTunaTradeStats 등)을 mackerel-kcs/route.ts 기준패턴으로 라우트화: L-10 하드코딩 fallback 키 · L-11 inline regex 자체파싱 · L-12 isLive boolean 출력. 위젯측은 TunaAtuna8YPrice.tsx 전환 레퍼런스(JSON import 제거→fetch+loading state). **675 전수 전환은 1차 API 부재로 비범위.**
- **에이전트:** Sisyphus(우선순위 큐) · Hephaestus(라우트+위젯) · Oracle(writer≠reviewer 머지 전 채점, isLive·fallback 키 실재 검수)
- **산출물:** Tier-1 12개 route.ts + 위젯 fetch 전환 diff + curl isLive 로그 + STATIC→LIVE 매핑표
- **KPI:** LIVE 42→54(+12) · curl isLive=true 12/12 · 전환 위젯 a2 평균 +1등급
- **공수/효과:** **L / H**

---

## 5. 단계별 로드맵

### Phase 매트릭스

| Phase | 이니셔티브 | 공수 | 효과 | 선결조건 |
|---|---|---|---|---|
| **0. 측정** | I-2 (정본 원장) | L | H | sashimi 68 분모 확정 |
| **1. 자동화 게이트 + 출처** | I-1, I-4, I-5 | S+M+M | H·H·H | I-2 원장 |
| **2. Live API 전환** | I-3, I-6 | M+L | H·H | I-4 회귀게이트 |
| **3. Trust UX** | I-5 클릭링크(Phase1과 병행) | M | H | I-5 핀고정 |

> Trust UX는 **I-5 클릭 링크 한정**(데이터층). 등급칩·전수 표시층 확장은 over-engineering으로 비범위.

### Top 5 ROI 우선순위 (impact/effort 재정렬)

| 순위 | 이니셔티브 | 공수/효과 | 근거 |
|---|---|---|---|
| **1** | I-1 verify_claims warn→block + cardDesc 스캔 | S / H | 회귀 즉시 차단, 자산 실재, Codex ROI 1위 합의 |
| **2** | I-2 9 CSV 정규화 + 단일 원장 | L / H | fan-out 효과 최대. 분모 확정·effort 재산정 선결 |
| **3** | I-3 빈 fallback 21건 일괄 패치 | M / H | 1스크립트로 21건 봉합, deploy-lag 위험 제거 |
| **4** | I-4 L-09 가짜LIVE 린트 pre-push (중복 통합) | M / H | 4·6차원 중복 제거하여 1건 |
| **5** | I-5 source 행ID 핀고정 + 클릭링크 | M / H | a3 천장 실질 돌파. UX 등급칩보다 우선 |

---

## 6. 에이전트 토폴로지 (writer≠reviewer · 3요금제 독립)

| 역할 | 에이전트 | 벤더/요금제 | 책무 |
|---|---|---|---|
| 오케스트레이터 | Sisyphus | Antigravity(Opus→Gemini fallback) | leg 위임·병렬·컨텍스트 위생(경로/요약만) |
| 딥워커(writer) | Hephaestus | Gemini 3 Pro | 라우트·위젯·스크립트 코드 작성 |
| 리뷰어(reviewer) | Oracle | OpenAI GPT-4o | 머지 전 4-Axis 채점 — **writer와 분리** |
| 교차벤더 검증 | codex-verify | Codex CLI + Grok CLI | 치명 클레임 3~5건 KEEP/EDIT/DELETE (Grok 503 이력 시 Codex 단독='중간' 태그) |
| batch fan-out | Librarian | Gemini Direct API($100/월, max_tools=0) | 9 CSV codemod·sourceRefs 매핑·long-context 스캔(Antigravity 락 무관) |
| 수집·검증 | source-archivist / source-verifier / adversarial-reviewer | (skill) | 출처 아카이브·1차 대조·반증 |

**원칙:** writer≠reviewer 강제. 3요금제(Claude/OpenAI/xAI·Gemini) 결제선 독립으로 단일벤더 환각·자기채점 편향 차단. Phase 5 교차검증 통과 전 정정·배포 금지.

---

## 7. 측정·거버넌스

**KPI 대시보드 (단일 원장 기반):** ①A-gate% (adjusted_avg≥85) ②F-count (<55) ③LIVE% (정직검증분만) ④출처추적성% (sourceRefs resolve율) ⑤내부정합 위반수. **strict 부분집합 1차 · 전체 2차 이중 보고**로 채점법 오염 차단.

**회귀 방지:** pre-commit(L-09·telemetry·W-04 게이트) + pre-push(L-03 빌드·verify_claims block·lint_l09) + data-freshness.yml 주간 회귀 잡. 신규 위젯이 trust_ledger 미등록 시 '미측정' 플래그→audit 큐 라우팅.

**리뷰 주기:** 주 1회 헤드리스 회귀 채점(librarian_daily_audit.sh 확장). 4-Axis 평균 하락 또는 A-gate 감소 품목만 GitHub Issue 에스컬레이션(노이즈 회피). **정정·배포 자동 금지 — Issue까지만, 사람 승인 분리.**

**진행 상태:** 메모리 아닌 HANDOFF.md/artifacts에 기록. 커밋 태그 [CC]/[AG]로 도구 구분.

---

## 8. 리스크 & 비범위

**리스크:**
- **R1 분모 혼선(P0):** sashimi 36/68/32, 정적import 105/106, fallback 9+/21 — 산출물 내부 베이스라인 불일치. **본 플랜은 68/105/21로 확정**. 측정체계가 자기 측정값부터 일치해야 '단일 원장' 목표가 자기반증 안 됨.
- **R2 공수 과소(P0):** CSV 정규화(3종→6종 실측)·아카이브 25품목(XL)·fallback 21건 모두 한 단계씩 과소 → effort 재산정 반영(I-2 M→L).
- **R3 false-positive:** verify_claims block 승격 시 정당 분기 오탐 → 1주 경고 모드 ≤5% 관찰 후 차단.
- **R4 유령출처:** source 링크화 시 존재하지 않는 출처 연결 → codex-verify 적대 검증 필수(sashimi $908M 사고 재발 차단).

**비범위(over-engineering 금지 — sashimi 교훈):**
- ❌ TelemetryBadge 4-Axis 등급칩·인포그래픽 등 표시층 확장 (데이터 신뢰 무개선)
- ❌ 675 위젯 전수 라이브 전환 (대응 1차 API 부재로 비현실)
- ❌ 25품목 아카이브 풀세트 즉시 구축 (effort XL — 위젯수 우선순위로 단계적)
- ❌ 34대시보드 일괄 fan-out (정의 불명확·widget-audit 중복)
- ❌ 검증 안 된 발견 보고·요청 없는 커밋/푸시
