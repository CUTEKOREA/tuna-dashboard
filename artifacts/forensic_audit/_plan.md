# Forensic Audit Plan — 위젯 신뢰도 4-Axis 검증 (2026-05-23 작성)

> 룰북 V4.1 **O-04** 적용 — 모든 신규/기존 위젯의 4-Axis 평균 A등급(85+) 미달 시 머지 차단.
> 어제 ADR 0006의 Tuna Phase A~F 패턴 (커밋 `7e8a032` ~ `b63c23f`)을 22개 dashboard로 일반화.

## 목적

신라교역 dashboard 전 위젯(~350개)의 데이터 신뢰성을 자동·반자동으로 검증.
1차 자료 부재 / 시기 미명시 / 출처 매핑 오류 / 가짜 LIVE 표시 등 C-Level 의사결정 위협 요소 식별.

## 4-Axis Schema

| Axis | 점수 기준 | 평가 evidence |
|---|---|---|
| **Source Reliability** | 1차 자료 100 / 2차 기관 75 / 추정 40 / 미상 0 | 출처 명시 여부, URL/문서 유효성 |
| **Data Freshness** | <6개월 100 / <1년 75 / <2년 50 / >2년 25 / 미상 0 | syncDate vs 발행 시점 |
| **Verifiability** | NotebookLM/외부 cross-check 100 / 부분 70 / 불가 30 | 원본 자료 첨부·인용 가능 여부 |
| **Integration Completeness** | SIT 수치=chart=TAK 정합 100 / 부분 60 / 모순 0 | 위젯 내 데이터·문장 정합성 |

**합격선**: 평균 ≥ 85 (A grade) → 머지 통과
**조건부**: 70-84 (B) → 정정 후 재검증
**차단**: < 70 (C/D/F) → 머지 차단 + 위젯 재작성

## 모델·인증 토폴로지

| Stage | 모델 | 호출 경로 | 비용 |
|---|---|---|---|
| 데이터 추출 | Gemini 3.5 Flash (Librarian) | Direct API (Tier 1) | $0.001/위젯 |
| **4-Axis 평가** | **Antigravity Claude Opus 4.6 thinking** (Sisyphus) | OpenCode `ultrawork` | $0 (Ultra 쿼터) |
| Pro 락 시 fallback | **Antigravity Gemini 3.1 Pro** (Hephaestus) | OpenCode | $0 |
| NotebookLM cross-check | NotebookLM 10+ 노트북 | MCP `notebooklm-mcp` | $0 (Ultra) |
| 합산·grade·정정 권고 | Claude Opus 4.7 (Claude Code) | Claude Max20 | $0 |
| (선택) Oracle 의무 | OpenAI GPT-4o | OpenAI API | ~$0.005/위젯 |

## 검증 범위 (22 dashboards, ~350 위젯)

| 카테고리 | dashboards | 위젯 추정 | 정책 |
|---|---|---|---|
| 수산 (Tuna closure 제외) | Mackerel·Salmon·Squid·Pollock·Galchi·Whelk·Shrimp | ~120 | 즉시 가능 |
| 수산 (Tuna closure) | TunaDashboard·Insights·Extract·Ranching·Operational + Insight 시리즈 | ~80 | 2026-06-04 이후 |
| 농산 | Carrot·Cocoa·Garlic·Mangosteen·Cassava·Cashew | ~100 | 즉시 가능 |
| 축산 | Pork·Chicken (Beef 신설 예정) | ~30 | 즉시 가능 |
| 인프라 | ColdStorage·SEAsiaOEM·RetailPOS·Market·UsedCar | ~20 | 즉시 가능 |

## Phase 패턴 (commodity별)

| Phase | 작업 | 모델 | 추정 시간 |
|---|---|---|---|
| **A. 풀스캔** | 각 위젯 4-Axis 자동 점수 + 신규 위젯 후보 식별 | Sisyphus | 1-2h |
| **B. 즉시 정정 (high impact)** | 명백한 거짓 수치, 반대 방향, 잘못된 매핑 | Hephaestus + 사람 | 30-60min |
| **C. EDIT (moderate)** | 출처 명확화, 범위 표기, 약어 정의 | Hephaestus | 1h |
| **D. RECONCILE** | 동일 지표 다른 정의 (예: ISSF 87% vs 65%) 정합화 | 사람 + Hephaestus | 30-60min |
| **E. STATIC 라벨링** | Mock·추정 데이터 명시 (가짜 LIVE 제거) | Hephaestus (script) | 15min |
| **F. 외부 출처 후속** | 정정안의 출처를 EUMOFA·ISSF·IMARC 등 직접 확인 | 사람 + NotebookLM | 30min |

**dashboard 1개당 ~5시간** × 19 dashboards (Tuna closure 제외) = **~95시간 → 11주 sprint** (주 2 dashboard).

## 도메인 특수 검증 카테고리

| 카테고리 | 사례 (ADR 0006 Tuna) |
|---|---|
| **반대 방향 수치** | "+60% 성장" → 실제 "-60% 감소" (Thailand-US USTR 사례) |
| **잘못된 매핑** | "콜라겐 $12.8B → DHA $48.2B" 같은 시장 매핑 오류 |
| **단일값 → 범위 표기** | "$70M / 700억 / 950억" → "700~1,000억원" 통일 |
| **시기 명시** | "MGO 2018-2024 평시 vs 2026-Q2 외생 충격" 시점 명확화 |
| **과장 톤다운** | "최초", "유일" → "선도", "주요" 완화 |
| **약어 풀네임 / 다정의 명시** | "ISSF 87%(어획량) vs 65%(stock)" |
| **STATIC mock 라벨링** | "(Conviction Buy)" "(Strong Buy)" 가짜 LIVE 제거 |
| **API endpoint mock 정렬** | 위젯 코드 정정 후 `/api/*` mock도 동일 정정 (Phase E 교훈) |

## 산출물

```
artifacts/forensic_audit/
├── _plan.md                       # 이 문서
├── <YYYY-MM-DD>/
│   ├── _sprint_summary.md         # 스프린트 grade 분포
│   ├── <Dashboard>/
│   │   ├── _dashboard_summary.json
│   │   ├── w01_<title>.json       # 4-Axis JSON
│   │   ├── w02_<title>.json
│   │   └── ...
│   └── ...
└── _backlog.md                    # 차단·조건부 위젯 누적 큐
```

## 실행 흐름 (사용자 + OMO + 이 세션)

```
[Claude Code 세션] plan 확정 → artifacts/forensic_audit/_plan.md (이 문서)
                                       ↓
[사용자] OpenCode 열기:
  ultrawork --agent sisyphus \
    "MackerelDashboard 위젯 신뢰도 검증 Phase A — \
     artifacts/forensic_audit/_plan.md 참조"
                                       ↓
[Sisyphus = Antigravity Opus 4.6] 각 위젯 4-Axis 점수
  → artifacts/forensic_audit/<DATE>/MackerelDashboard/*.json
                                       ↓
[Antigravity 락 시] Hephaestus = Gemini 3.1 Pro 자동 fallback
                                       ↓
[Claude Code 세션] 결과 검토 + grade 통계 + 정정 권장 commit
                                       ↓
[Phase B~F 반복] dashboard별 sprint
```

## Pilot 시작점 — MackerelDashboard

**선정 이유**:
- 위젯 30+ (다양한 패턴 검증)
- L-01 audit 데이터 누적 (이전 78건 검출 → 정정 후 baseline)
- Tuna closure 대상 아님
- 다른 commodity로 확장 패턴 추출 적합

**사용자 액션**:
```bash
# OpenCode 세션
cd /Users/idong-geon/연구자동화애이전트들/tuna-dashboard
ultrawork --agent sisyphus \
  "MackerelDashboard 신뢰도 4-Axis 검증. \
   대상 위젯 list: components/MackerelDashboard.tsx의 widgets 배열. \
   참고: artifacts/forensic_audit/_plan.md. \
   Schema: 4-Axis JSON per 위젯. \
   출력: artifacts/forensic_audit/$(date +%Y-%m-%d)/MackerelDashboard/. \
   NotebookLM 노트북 사용 가능 시 cross-check."
```

## 사용자 후속 결정 항목 (실행 전 확정)

1. **시작 dashboard**: Mackerel (이 plan default)
2. **속도**: sprint (일 1-2) vs 정기 (주 2)? — 사용자 시간 가용성 따라
3. **OMO 호출**: 사용자가 OpenCode 직접 vs Claude Code가 가이드만 작성?
4. **NotebookLM 노트북 매핑**: 각 commodity별 노트북 URL을 어디에 정리할지 (별도 references 파일?)
5. **Block 처리 정책**: 차단된 위젯을 dashboard에서 hide할지 / 경고 라벨로 노출할지

## 신라교역 도메인 cross-check sources

| Commodity | 참조 (NotebookLM 또는 사람 직접) |
|---|---|
| 참치 | 10+ NotebookLM 노트북 (사용자 메모리) + ICCAT·WCPFC·EUMOFA |
| 고등어 | FAOSTAT·EUMOFA·INFOFISH·NPFC + (NotebookLM 노트북 추정) |
| 연어 | FAOSTAT·NASF·KMI·Norway Seafood Council |
| 오징어 | KOSIS·MFDS·FAOSTAT·CCAMLR |
| 명태 | FAOSTAT·NOAA·Russia 통계 |
| 농산물 | FAOSTAT·USDA PSD·World Bank Commodity Index |
| 축산물 | FAOSTAT QCL·USDA PSD·MAFRA·KAMIS |

## 누적 commit 정책

- Pilot Mackerel 완료 후 `[Forensic]` 접미사 첫 commit
- Phase A 풀스캔 → 1 commit
- Phase B 즉시 정정 → 1 commit per major fix
- Phase C-F → batch commit
- 결과 보고서 `artifacts/forensic_audit/<DATE>/_sprint_summary.md` 함께

## 다음 단계

1. **이 plan 사용자 검토** (5분)
2. **사용자 후속 결정 5항목 확정** (5분)
3. **Pilot Mackerel Phase A 실행** — 사용자 OpenCode `ultrawork` 호출 (~1-2h)
4. **결과 review** — 이 세션에서 grade 통계 + commit
5. **patterns 추출** → 다른 dashboard 적용 가속

## 비용·일정 요약

| 항목 | 추정 |
|---|---|
| **모델 비용** | $0 (Antigravity OAuth = AI Ultra 포함) |
| **Gemini Direct 보조** | ~$5/월 |
| **Oracle GPT-4o (선택, 위젯당 $0.005)** | ~$1.75 (전체 350 위젯) |
| **paid 합계** | **< $10** |
| **사람 시간** | 11주 sprint (주 2 dashboard) — 또는 집중 sprint 시 단축 |
| **첫 Pilot (Mackerel)** | ~5시간 (사용자 + OMO + Claude Code 분담) |
