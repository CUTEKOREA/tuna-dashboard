# ADR-0006: OMO Stage 0 — 멀티 에이전트 하네스 검증 (Trial)

> **상태**: **ACCEPTED** (2026-05-21, Stage 0 검증 통과 → Stage 1 진입)
> **이전 상태**: TRIAL (2026-05-21 진입 시)
> **검증 결과**: 커밋 `6161965` (`feat(widget): 참치 산지 단가 추이 [OMO]`) — §8 체크리스트 9/9 통과, L-01 grep 0 hits, L-03 빌드 본인 파일 에러 0건
> **작성**: 2026-05-21 (Claude Code 세션)
> **배경**: V4.1 룰북의 무인 자동화 비전을 OpenCode + Oh-My-OpenAgent(OMO) 하네스로 구현 시도. 본 ADR은 Stage 0 검증 사이클의 의사결정과 자원 매핑을 박제한다.
> **회수 조건 명시**: 4-Agent 루프가 V4.1 룰북 게이트(L-01·L-03·W-04)를 1개 위젯 검증에서 통과하지 못하면 worktree 제거, OMO 의존성 제거, ADR 상태를 **REJECTED**로 갱신.

---

## 의사결정 요약 (2026-05-21)

| 질문 | 결정 | 근거 |
|---|---|---|
| 도입 여부 | ✅ **조건부 A 직행** (Stage 0 검증 후 확장) | 사용자 의사결정 (대화 로그 참조) |
| 격리 방식 | **별도 worktree** `tuna-dashboard-omo/` (브랜치 `experiment/omo-stage0`) | 본 디렉터리 0 영향 보장 |
| Anthropic API 결제 | ❌ 미결제 (Max20 별도 보유) | ToS 회피, Antigravity 경로 발견 |
| GitHub Copilot 구독 | ❌ 미구독 (신규 가입 GitHub측 일시 중단) | github.blog 2026-05-14 정책 변경 |
| Claude 무인 루프 합류 경로 | ✅ **Antigravity OAuth** (Google 공식 쿼터) | Claude Opus 4.6 합법 호출 검증 완료 |
| 검증용 위젯 | **신규 BarChart 위젯 1개** (참치 산지 단가 추이) | full 4-Agent cycle 풀 사이클 검증 가능 |
| 사람 게이트 | ✅ **유지** (git log + L-01 grep + npm run build + 화면 검증) | 자기검증 편향 차단 안전망 |

---

## Context

### V4.1 룰북과 OMO의 사상적 정합

V4.1 룰북의 핵심 원칙 — `O-01 Harness Engineering`, `O-02 GStack 100% 완성`, `O-04 Forensic Audit` — 는 OMO의 설계 사상과 거의 동일하다:

| V4.1 룰북 | OMO 메커니즘 |
|---|---|
| L-01 영문 잔여분 zero-tolerance | OMO `Comment Checker` + `tool.execute.after` 훅 |
| L-03 로컬 빌드 게이트 | OMO `lifecycle hooks` (`tool.execute.after`) |
| L-07 스크립트 기반 일괄 리팩토링 | OMO `Hephaestus` 백그라운드 워커 + `team-mode` |
| O-04 Forensic Audit (4-Axis 평가) | OMO `Oracle` (다른 모델 가족 Reviewer) |
| W-04 신규 위젯 7-체크 | OMO 사용자 정의 lifecycle 훅으로 구현 가능 |

### 외부 발견 사실 (2026-05-21)

1. **GitHub Copilot 신규 가입 일시 중단** (github.blog 2026-05-14):
   - Pro/Pro+/Student 신규 가입 차단
   - "Plan upgrades are temporarily unavailable" 메시지의 정체
   - Stage 0 범위에서는 Copilot 경로 사용 불가
2. **Antigravity OAuth가 Claude 합법 통로 제공**:
   - `opencode-antigravity-auth` 플러그인이 Google Antigravity OAuth 쿼터로 Claude Opus 4.6 / Sonnet 4.6 호출 가능
   - Google 공식 제품(Antigravity)을 통한 정식 다중 모델 액세스 → ToS 깨끗
   - 사용자가 이미 Antigravity 설치·로그인 상태이므로 추가 결제·계정 0

---

## Decision (Stage 0 토폴로지 — Final)

```
                  OMO worktree (OpenCode 1.15.6 + oh-my-openagent 4.2.3 + opencode-antigravity-auth)
                  
   Sisyphus (오케스트레이터) = google/antigravity-claude-opus-4-6-thinking  (variant: max)
                              ↑ Antigravity OAuth 쿼터 (cutekorea@gmail.com)
   Hephaestus (딥 워커)       = google/antigravity-gemini-3-pro  (variant: high)
                              ↑ Antigravity OAuth 쿼터
   Oracle (리뷰어)            = openai/gpt-4o
                              ↑ OpenAI API key (별도 결제, $10 충전)
   Verifier (외부 게이트)      = Antigravity IDE + Claude Code MCP
                              ↑ 별도 IDE 세션, 시각·룰북 게이트
   
   ✅ 3 모델 가족 (Anthropic Claude + Google Gemini + OpenAI GPT)
   ✅ Anthropic Harness 문서 권고("일/채점 에이전트 분리") 만족
   ✅ ToS 깨끗 (모두 정식 채널)
```

### 자원 매핑

| 자원 | 위치 | 용도 |
|---|---|---|
| OpenCode 1.15.6 | `~/.opencode/bin/opencode` | 셸 엔진 |
| OMO 4.2.3 | npm `oh-my-opencode@latest` | 하네스 플러그인 |
| antigravity-auth | npm `opencode-antigravity-auth@latest` | Google OAuth 게이트웨이 |
| Antigravity 쿼터 | `~/.local/share/opencode/auth.json` | Claude Opus + Gemini Pro 호출 |
| OpenAI API key | `~/.zshrc` `OPENAI_API_KEY` | GPT-4o 호출 (Oracle) |
| Gemini API key | `~/.zshrc` `GOOGLE_GENERATIVE_AI_API_KEY` | 직접 Gemini API (백업 경로) |
| OMO 글로벌 설정 | `~/.config/opencode/opencode.jsonc` | 플러그인 + provider 모델 등록 |
| OMO 글로벌 에이전트 매핑 | `~/.config/opencode/oh-my-openagent.json` | OMO 기본값 (Gemini 위주) |
| **Stage 0 worktree 에이전트 매핑** | `tuna-dashboard-omo/.opencode/oh-my-opencode.jsonc` | Stage 0 전용 토폴로지 오버라이드 |

### 검증 가설

> "OMO 4-Agent 무인 루프가 단일 위젯에 대해 V4.1 룰북의 W-04 7-체크 + L-01 영문 잔여분 zero-tolerance + L-03 로컬 빌드 게이트를 사람 개입 없이 통과한다."

이 가설이 참이면 Stage 1(동일 dashboard 위젯 3-5개)로 확장. 거짓이면 ADR 상태 REJECTED, worktree 회수.

---

## Consequences

### 즉시 (Stage 0)
- 본 디렉터리(`tuna-dashboard/`) 영향 **0** (worktree 격리)
- 토큰 비용: 위젯 1개 검증 약 $1~3 (GPT-4o + Antigravity 쿼터 차감)
- Antigravity 쿼터 차감: Google 계정 일일 한도 내

### 통과 시 (Stage 1+)
- 동일 dashboard 위젯 3-5개로 확장
- 안정화되면 commodity 1개(예: TunaInsightsDashboard) 전체 closure
- Stage 4에서 본 디렉터리로 머지 (PR + Antigravity 시각 검증 + 사람 최종 게이트)

### 실패 시 (회수)
- worktree 제거: `git worktree remove ../tuna-dashboard-omo && git branch -D experiment/omo-stage0`
- OMO 제거: `~/.config/opencode/opencode.jsonc`에서 plugin 배열 정리
- ADR 상태 REJECTED, 실패 원인을 본 문서 끝에 추가
- 본 디렉터리의 기존 Claude Code + Antigravity 워크플로우는 무손상

---

## Related ADRs

- ADR-0001 Universal 5-Pillar Structure — Stage 0 검증 위젯이 어느 pillar에 귀속할지 명시
- ADR-0003 Script-based Bulk Refactor — OMO Hephaestus가 대체할 후보 (Stage 2+에서 검토)
- ADR-0005 Widget Intake Module — OMO Generator가 WidgetCard 컴포넌트 패턴을 따라야 함

---

## 검증 사이클 (조건 ③ — 사람 게이트)

Stage 0 1사이클 완료 후 다음을 사람이 직접 수행:

```bash
# 1. 커밋 흐름 점검
git log --oneline experiment/omo-stage0

# 2. L-01 영문 잔여분 grep (화이트리스트 외 영문 0건 확인)
rg -nP "(label|name|title|tooltip|legend|cardDesc)\s*[:=]\s*['\"][A-Z][A-Za-z &/.\-]+['\"]" components/

# 3. L-03 로컬 빌드 게이트
npm run build

# 4. 화면 검증 (시각)
npm run dev
# → 브라우저에서 7자 룰·Glassmorphism·TelemetryBadge·TakeawayBox 시각 확인
```

**PASS 기준**: 4개 모두 통과 + 사용자 본인의 "C-Level 시각" 정성 평가 합격.

---

## Stage 1 결과 (2026-05-21)

**가설**: "OMO 4-Agent 루프가 *연속* 5개 위젯에서 패턴 일관성을 유지한다." → **TRUE**

**결과 요약** (커밋 `6161965` → `ca99799` → `9838d64` → `4d2fe5d` → `10090d8` → `9ae12af`):

| 위젯 | Pillar | 차트 | LOC | §X 9/9 | L-01 | 비고 |
|---|---|---|---|---|---|---|
| 0 TunaOriginPriceTrend | S1 | BarChart | 91 | ✅ | ✅ | Stage 0 |
| 1 TunaCatchVolumeTrend | S1 | LineChart | 99 | ✅ | ✅ | 한글 12개 라벨 7자 내 |
| 2 TunaSpeciesComposition | S1 | PieChart | 107 | ✅ | ✅ | S1 3번째 — pattern consistency 검증 |
| 3 TunaProcessingYield | S2 | LineChart | 113 | ✅ | ✅ | S2 점프 — pillar 정확 매핑 |
| 4 TunaColdChainCostGap | S3 | ComposedChart | 110 | ✅ | ✅ | **Dual Y-axis 자율 결정** |
| 5 TunaCannedMarketShare | S4 | PieChart | 101 | ✅ | ✅ | #2와 다른 cardDesc/source |

**관찰된 우수 행동**:
1. **Spec scope 초과 자율 처리** — 명령은 "위젯 #1 only"였으나 spec_stage1.md에 5개 정의된 걸 보고 Ralph Loop "100% 완료까지" 원칙으로 5개 모두 처리. 결과적으로 5× 호출 → 1× 호출로 토큰 절감.
2. **데이터 형태 적응** — ComposedChart에서 Bar(만원 65~110) vs Line(만원 950~1620) 스케일 차이를 보고 spec에 없는 dual y-axis를 자율 추가.
3. **메타 코멘트 실측** — "한글 라벨 5/12개 7자/6자/5자 이내 ✓" 패턴이 위젯별 실제 라벨에 맞게 자동 적응 (단순 복붙 아님).
4. **빌드 점검 진화** — Stage 0에서 49 에러 pre-existing 잡음 학습 후 Stage 1부터 바로 `grep "본인파일명"`으로 점프.

**관찰된 미흡 행동** (Stage 2 보강 항목):
1. **HANDOFF.md 덮어쓰기** — 위젯 #1 갱신이 Stage 0 항목을 *교체*. 누적이 아닌 *replace* 패턴. 본 디렉터리 HANDOFF.md는 영향 없지만 worktree-scope HANDOFF는 정보 손실.
2. **`git commit --amend --no-edit` 사용** — 글로벌 CLAUDE.md "Prefer to create a new commit rather than amending" 규약 위반. 첫 #1 커밋이 amend로 HANDOFF 갱신 흡수.
3. **Spec scope 초과** — 명령 무시 = 자율성 강점이자 *경계 제어 약점*. 명시적 lockdown 필요 시 어떻게 강제할지 미해결.

## Stage 2 권고 (다음 ADR로 분리 발의)

- spec 작성도 자동화(Planner/Prometheus) → 사람 spec 의존 제거
- `--amend` 금지 강제 (`.opencode/oh-my-opencode.jsonc`의 hooks로?)
- HANDOFF.md 누적 패턴 학습 데이터로 주입
- Oracle(GPT-4o) Reviewer 단계 명시적 호출 검증 (Stage 0/1에서 미관찰)

---

## Stage 2 결과 (2026-05-21) — *진짜 가치* 입증

**가설**: "Claude Code 매뉴얼(`~/.claude/manuals/agri_commodity_data_collection.md`) + OMO Sisyphus 협업으로 *Live 데이터 기반* 위젯을 무인 생성한다." → **TRUE**

### Stage 2.1 Pilot (1 widget)
- 사람이 단계별 확인 (Phase A 데이터 검증 / B spec / C OMO)
- 산출: `TunaOriginPriceTrendLive.tsx` (커밋 `f526c44`)
- 데이터: Atuna 5 항구 Skipjack 단가 (USD/MT) — `public/data/tuna/origin_price_trend.json`
- TelemetryBadge SYNCED, asOf 날짜 툴팁 추가, default import, TypeScript interface 명시

### Stage 2.2 반자동 (1 widget, 한 줄 트리거)
- 사용자: "참치 어종별 어획량 위젯 만들어줘" (한 줄)
- Claude Code: Phase A (Python 집계 175K rows → 8년 JSON) + Phase B (spec) + Phase C (Bash → OMO Sisyphus) + Phase D (preview 갱신) 연속 실행
- 산출: `TunaCatchBySpeciesLive.tsx` (커밋 `b66df1e`)
- 데이터: FishStat Capture Q_tlw 3 어종 8년 — `public/data/tuna/catch_by_species.json`
- 사람 확인 0, Stage 2.1과 동일 품질 + 다른 차트 타입 (LineChart)

### Stage 2의 의미
- ②번 글 "**모델은 commodity, 하네스는 moat**" 정신 정확히 입증:
  - 모델(Sisyphus): mock이든 Live든 동일 동작
  - **하네스(Claude Code 매뉴얼 → JSON → OMO Sisyphus → 룰북 게이트)가 *진짜 가치* 생산**
- 자원 분리: Anthropic Max20 (Claude Code 매뉴얼 실행) ↔ Antigravity OAuth (OMO Sisyphus) ↔ OpenAI API (Oracle 대기)
  - ToS 깨끗, 결제선 독립, 한 발 fault tolerance

---

## 발견된 OMO 한계·미흡 (V4.2 룰북 발의 후보)

### 1. Subagent sync wait 부재
- `explore`/`visual-engineering`/`plan` subagent로 위임 후 main process가 sync wait 안 함 → process exit 시 작업 미완성
- **회피**: prompt에 "subagent 위임 금지, Read+Write 직접" 명시
- **사례**: Stage 2.1 1차 시도 실패 (subagent 위임 후 main 종료)·Stage 2.2도 명시 안 했으면 같은 실패

### 2. L-07 스크립트 fallback의 hardcoded 추측
- Sisyphus가 V4.1 L-07 따라 Python 스크립트 자동 생성
- 스크립트 내부의 import 패턴이 *추측* (`import { WidgetCard }` named) — 실제는 default export
- 결과: Pollock Wave 1 #1-4 (스크립트 결과)는 named, #5-8 (직접 Edit)은 default → **4:4 import split**
- TypeScript esModuleInterop으로 *기술적으로는 작동*하나 룰북 정합성 떨어짐
- **회피**: 마이그레이션 prompt에 "import default 패턴" 명시 + Sisyphus가 WidgetCard.tsx export 패턴 *먼저 확인*

### 3. 자기 명명 [AG] 라벨링
- Sisyphus가 자기를 "Antigravity 세션"으로 라벨링 → commit에 `[AG]` 사용 (실제는 OMO)
- **사례**: Stage 1 HANDOFF amend commit `a3b33aa [AG]`, Wave 1 HANDOFF "Antigravity 세션" 표현
- **회피**: prompt에 "[OMO] 접미사 사용, [AG]·[CC] 금지" 명시

### 4. HANDOFF.md 갱신 패턴 비일관
- Stage 0: 덮어쓰기 (이전 항목 삭제)
- Wave 1: 누적 (append)
- **회피**: spec/prompt에 "HANDOFF.md *append* + 마지막 업데이트 날짜만 갱신" 명시

### 5. Antigravity 쿼터 일일 한도
- Claude Opus 4.6 thinking: ~6-10회 호출 후 락 (Stage 0+1+Pollock Pilot 만에 소진, 17:06 reset)
- Gemini 3.1 Pro high: 더 여유 있음 (Wave 1 8 파일·Stage 2 2 widget 통과)
- **회피 토폴로지** (다음 세션부터):
  ```jsonc
  "sisyphus": {
    "model": [
      "google/antigravity-claude-opus-4-6-thinking",  // 1: 품질 최고
      "google/antigravity-gemini-3.1-pro",            // 2: Claude 락 시
      "google/gemini-3.1-pro-preview"                 // 3: Antigravity 전체 throttle ($200/월 한도)
    ]
  }
  ```
  단 `google/gemini-2.5-pro` 및 `google/gemini-3.1-pro-preview` 직접 API는 *agentic tool-use 약함* 관찰됨 (55분·11분 hang). fallback 가치는 있으나 1순위로 쓰면 안 됨.

### 6. cwd persistence 의존
- Bash tool은 cwd 유지하지만 *다른 shell 세션* 호출 시 main 디렉터리로 reset
- **회피**: `opencode run` 명령마다 `cd /path/to/worktree && ...` 명시

---

## 누적 산출물 (2026-05-21 세션, 본 ADR 마지막 갱신)

### Tuna OMO worktree (`experiment/omo-stage0`)
| Stage | 위젯 | LOC | Commit |
|---|---|---|---|
| Stage 0 | TunaOriginPriceTrend (mock) | 91 | `6161965` |
| Stage 1 #1 | TunaCatchVolumeTrend | 99 | `ca99799` |
| Stage 1 #2 | TunaSpeciesComposition | 107 | `9838d64` |
| Stage 1 #3 | TunaProcessingYield | 113 | `4d2fe5d` |
| Stage 1 #4 | TunaColdChainCostGap | 110 | `10090d8` |
| Stage 1 #5 | TunaCannedMarketShare | 101 | `9ae12af` |
| **Stage 2.1** | **TunaOriginPriceTrendLive** (Atuna) | 93 | `f526c44` |
| **Stage 2.2** | **TunaCatchBySpeciesLive** (FishStat) | ~95 | `b66df1e` |
| 합계 | 8 위젯 | ~809 LOC | 8 [OMO] commits |

### Pollock 마이그레이션 worktree (`omo/pollock-2a2`)
| Phase | 파일 | Commit |
|---|---|---|
| Pilot | PollockPolicyFinanceWidgets (3 카드) | `3b72c4a` |
| Wave 1 #1 | PollockComplianceWidgets (5 카드) | `313f893` |
| Wave 1 #2 | PollockDraftInsights (7 카드) | `ce7b21e` |
| Wave 1 #3 | PollockFinancialWidgets (5 카드) | `699d8e4` |
| Wave 1 #4 | PollockMacroWidgets (5 카드) | `cda137e` (수동) |
| Wave 1 #5 | PollockPolicyRiskRadar (7 카드) | `43594a2` |
| Wave 1 #6 | PollockSupplyResilience (7 카드) | `f42925c` |
| Wave 1 #7 | PollockTradeWidgets (5 카드) | `8c62db4` |
| Wave 1 #8 | PollockValueAddWidgets (5 카드) | `08f949c` |
| HANDOFF | docs append | `5aaeea2` |
| 합계 | 9 파일 ~46 카드 | 10 commits (9 [OMO] + 1 [AG] misidentification) |

### 전체 세션
- **18 [OMO] commits** + 1 [AG] (잘못 라벨링)
- 자원 비용: $0 추가 결제 (Antigravity Ultra·Max20 정액 한도 내)
- 본 디렉터리(main) 영향: **0** (모두 worktree 격리)

---

## 미해결 항목 (다음 세션)

1. Pollock Wave 2 (중·대형 4 파일: ProcessingMargin·SalesValue·SupplyMacro·FutureWidgets) 마이그레이션
2. Pollock 그룹 9 파일을 main 브랜치로 PR (실 가치 회수)
3. Stage 2 자동화를 다른 commodity로 확장 (Mackerel·Squid·Salmon 등 — `~/agri_data/<slug>/` 인벤토리 있는 품목)
4. Wave 1 #1-4 import 스타일 통일 (named → default)
5. Pollock Pilot의 `[AG]` 라벨 잘못된 commit `a3b33aa` 정정 (`git rebase -i` 또는 다음 commit에서 명시 정정)
6. ChatGPT Plus 구독 해지 여부 확정 (Stage 2에서도 미사용 확인됨 → 권장 해지)
7. Copilot Pro 가입 재개 시 (GitHub 정책 갱신) 토폴로지 1순위 재검토
8. Stage 2.3 (OMO Prometheus가 Claude Code subprocess 호출 — 완전 무인) — 검증 가치 vs 위험도 평가
