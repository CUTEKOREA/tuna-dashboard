# ADR 0007 — Librarian Role (Gemini Direct API 전용 non-agentic batch worker)

**Status**: ACCEPTED (2026-05-22, Claude Code 세션)
**Supersedes**: 없음 (ADR 0006의 "fallback 토폴로지"를 정식 결정으로 승격)
**Related**: [ADR 0006 — OMO Stage 0 Trial](0006-omo-stage0-trial.md)

## Context

ADR 0006 Stage 0~2 운영 중 발견된 두 가지 압박:

1. **Antigravity Claude Opus 4.6 thinking 쿼터 락**: 일 6-10 호출 후 락 (Stage 0+1+Pollock Pilot만에 소진, 17:06 reset 실측, ADR 0006 line 230). Sisyphus가 비싼 Claude로 모든 plan을 잡아 burn 가속.
2. **Antigravity 전체 throttle**: $200/월 한도 도달 시 Claude + Gemini OAuth 경로 동시 정지 → OMO Sisyphus/Hephaestus 둘 다 가동 불가.
3. **무료 자산 방치**: Google AI Ultra 구독에 포함된 **Gemini Direct API $100/월 무료 크레딧**이 fallback 3순위로만 등록되고 실제로는 거의 호출 0건.
4. **OMO Oracle 미작동**: GPT-4o Reviewer 단계가 Stage 0/1에서 명시적 호출 0건 (ADR 0006 line 176) → 자기검증 편향 차단 안전망 부재.

또한 ADR 0006 line 243에 결정적 함정 기록:
> "google/gemini-2.5-pro 및 google/gemini-3.1-pro-preview 직접 API는 *agentic tool-use 약함* 관찰됨 (55분·11분 hang). fallback 가치는 있으나 1순위로 쓰면 안 됨."

즉 Direct API를 Sisyphus/Hephaestus 슬롯에 그냥 끼우면 hang. 새로운 격리 패턴 필요.

## Decision

**Librarian** 이라는 신규 OMO 역할을 정식 도입한다.

### Librarian 정의

| 속성 | 값 |
|---|---|
| **결제선** | Google AI Ultra → Gemini Direct API ($100/월 무료) |
| **모델** | `gemini-3.5-flash` (1순위, 단순 대량) → `gemini-3.1-pro-preview` (2순위, heavy) → `gemini-2.5-flash` (3순위, 한도 초과) |
| **tool-use** | **`max_tools: 0`** — 도구 호출 일체 금지 (hang 회피, ADR 0006 line 243) |
| **입출력** | 텍스트 in / 텍스트 out 만 |
| **routing** | 입력 토큰 < 50k → Flash, ≥ 50k → Pro Preview |
| **호출 조건** | Antigravity 락 무관, **항상 가동 가능** |

### 작업 카탈로그 (Librarian이 잘하는 것)

1. **Long-context audit** — dashboard closure 50+ widget을 한 호출에 투입, L-01 영문 잔존·W-04 cardDesc 누락·TelemetryBadge 누락·SIT/TAK 누락 grep 결과 반환
2. **L-07 변환 스크립트 generator** — sed/Python regex 일괄 변환기 생성 (dry-run 결과는 사람·Sisyphus가 검토 후 실행)
3. **cardDesc·alt-text 위젯별 fan-out** — 위젯명·차트 종류만 보고 W-04 의무 cardDesc 1줄 작성, 33위젯 동시 병렬
4. **PDF→MD 변환·요약** — `~/agri_data/` 신규 PDF를 MD로 변환 + 핵심 요약 (사용자 메모리 R-04 룰 자동화)
5. **NotebookLM 쿼리 결과 정형화** — NotebookLM이 반환한 raw 답변을 SIT/TAK 형식으로 가공
6. **번역·요약** — 영문 PDF·EUMOFA 보고서 한국어화 (L-01 위반 제거 보조)
7. **commit 톤 audit** — `[CC]`/`[AG]`/`[OMO-Codex]` 커밋 메시지 GS-Analyst tone 위반 검사

### 작업 금지 카탈로그 (Librarian이 못하는 것)

- ❌ JSX/TSX 직접 편집 (Edit/Write 도구 사용 불가)
- ❌ git 작업 (Bash 도구 사용 불가)
- ❌ Multi-step planning (Sisyphus 영역)
- ❌ 인터랙티브 grilling (사람 + Claude Max 영역)
- ❌ Forensic Audit 최종 평가 (Oracle GPT-4o 영역, 자기검증 편향 차단)

### 토폴로지 (전체)

```
[Plan] Sisyphus → Antigravity Claude Opus 4.6 thinking
                       ↓ (6-10/일 락)
                  Antigravity Gemini 3.1 Pro
                       ↓ (Antigravity 전체 throttle)
                  중단·다음 윈도우 대기  ❌ Librarian이 Plan 대신 X (tool-use 약함)

[Execute] Hephaestus 병렬 × N → Antigravity Gemini 3 Pro
                                      ↓ (락 시)
                                Antigravity Gemini 3.1 Pro
                                      ↓ (throttle)
                                중단  ❌ Librarian이 코딩 X

[Review] Oracle → OpenAI GPT-4o  ⭐ 위젯 1개 머지 전 의무
                ↑ ADR 0006에서 미작동 → 본 ADR에서 의무화

[Library work] Librarian → Gemini 3.5 Flash Direct API  ⭐ 락 무관, 항상 가동
                            ↓ (RPM 한도)
                          Gemini 3.1 Pro Preview Direct API
                            ↓ (heavy task / 한도)
                          Gemini 2.5 Flash Direct API
              ↑ Plan/Execute와 무관하게 audit·문서·codemod plan·번역 병렬 가동
```

## Budget capacity ($100/월 기준)

Paid Tier 가격 ([Google AI 공식](https://ai.google.dev/gemini-api/docs/pricing)):

| 모델 | Input | Output | 1 호출 평균 비용 (가정) | 월 호출 capacity |
|---|---|---|---|---|
| `gemini-3.5-flash` | $1.50/M | $9.00/M | in 500/out 100 → $0.0016 | **~60,000회/월** |
| `gemini-3.1-pro-preview` ≤200k | $2.00/M | $12.00/M | audit in 200k/out 10k → $0.52 | **~192회/월** |
| `gemini-2.5-flash` | $0.30/M | $2.50/M | in 500/out 100 → $0.0004 | **~250,000회/월** |
| `gemini-2.5-pro` ≤200k | $1.25/M | $10.00/M | audit → $0.35 | **~285회/월** |

### 어제 작업 부하 추정 (실측 기반 $-환산)

| 어제 작업 | 호출 수 | 모델 | 비용 |
|---|---|---|---|
| Phase A 풀스캔 audit (33위젯×10 노트북) | 2 | 3.1 Pro Preview | $1.0 |
| Carrot 30/30 변환 plan 생성 | 1 | 3.1 Pro Preview | $0.5 |
| 위젯당 cardDesc 생성 (Pollock·Mackerel·Squid 100 위젯) | 100 | 3.5 Flash | $0.17 |
| 일간 HANDOFF 요약 × 30일 | 30 | 2.5 Flash | $0.01 |
| **합계** | | | **~$2/월 (전체 $100의 2%)** |

→ **잔여 capacity $98/월** (98%) 미사용. 일간 자동 audit·PDF 변환·뉴스카드 등에 적극 배분 권장.

## Implementation

### 1. `~/.config/opencode/oh-my-openagent.json` 패치

```jsonc
{
  "sisyphus": {
    "models": [
      "google/antigravity-claude-opus-4-6-thinking",
      "google/antigravity-gemini-3.1-pro"
    ]
  },
  "hephaestus": {
    "models": [
      "google/antigravity-gemini-3-pro",
      "google/antigravity-gemini-3.1-pro"
    ]
  },
  "oracle": {
    "models": ["openai/gpt-4o"],
    "required_for_merge": true
  },
  "librarian": {
    "models": [
      "google/gemini-3.5-flash",
      "google/gemini-3.1-pro-preview",
      "google/gemini-2.5-flash"
    ],
    "max_tools": 0,
    "routing": "by_input_tokens",
    "thresholds": { "flash_to_pro": 50000 }
  }
}
```

### 2. 운영 게이트

- 위젯 1개 머지 전: **Oracle GPT-4o 통과** 필수 (ADR 0006 line 176 미작동 시정)
- 일간 09:00: **Librarian audit** 자동 실행 → 결과를 `artifacts/daily_audit_<date>.md`로 저장
- 신규 PDF 감지 시: **Librarian 변환·요약** 자동 실행

### 3. 자원 위치 (재확인)

| 자원 | 경로 |
|---|---|
| Antigravity OAuth | `~/.local/share/opencode/auth.json` |
| OpenAI API key | `~/.zshrc` `OPENAI_API_KEY` |
| Gemini API key | `~/.zshrc` `GEMINI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` |
| OMO 글로벌 설정 | `~/.config/opencode/opencode.jsonc` |
| OMO 에이전트 매핑 | `~/.config/opencode/oh-my-openagent.json` |
| GitHub PAT | macOS Keychain `GH_TOKEN` |

## Consequences

### Positive

- Antigravity 락 발생해도 Librarian이 audit·문서·codemod 작업 계속 → **하루 정지 시간 0**
- 매월 무료 $100 크레딧이 실제로 흡수됨 (어제까지 0% 활용)
- 자기검증 편향 차단 (작성 모델 ≠ 채점 모델 ≠ audit 모델)
- 비용 분산: Claude Max20 $200 + AI Ultra $250 + ChatGPT $20 ≈ $470/월 → 단일 모델 전용 결제 대비 ~$1,500/월 절약 효과

### Negative

- 셋업 복잡도 증가 (4 역할: Sisyphus·Hephaestus·Oracle·Librarian)
- Librarian 출력 형식 표준화 필요 (audit 결과 schema, codemod plan schema)
- Gemini Direct API tool-use 약함 함정 (line 243) 인지 안 한 신규 에이전트가 Librarian에 코딩 task 보낼 위험 → 본 ADR로 명시적 금지

### Neutral

- 매월 1회 Gemini API 사용량 점검 필요 (https://aistudio.google.com/usage)
- Librarian 출력은 사람·Sisyphus가 검토 후 적용 (자율 실행 X)

## Validation

- [x] `~/.config/opencode/oh-my-openagent.json`에 librarian + librarian-heavy 등록 (2026-05-22)
- [ ] Oracle 의무 게이트 enforce (위젯 머지 전 GPT-4o pass 확인)
- [x] **Librarian 첫 작업: carrot_insights.js L-01 audit (2026-05-22)** ✅
  - 결과 보고: [artifacts/librarian_first_run.md](../../artifacts/librarian_first_run.md)
  - Gemini 2.5 Flash, $0.00347, 43초, 15건 검출 (진짜 위반 3건, false positive 11건)
  - 실측 precision 20% — Flash는 1차 audit용, Pro 또는 prompt 강화 필요
  - 3건 진짜 위반 즉시 정정 (영문 보고서 제목 한글 병기)
- [x] **Pro Preview 재검증 시도 + prompt v2/v3 실험 (2026-05-22)** ⚠️ 부분 검증
  - 결과 보고: [artifacts/librarian_second_run.md](../../artifacts/librarian_second_run.md)
  - **API key billing 미연결**: gemini-2.5-pro / gemini-3.1-pro-preview 모두 `free_tier_limit 0` 으로 호출 불가
  - Flash v2 (엄격 prompt) → 0건 (recall 0%로 후퇴)
  - Flash v3 (균형 prompt) → 1건 (false positive)
  - **Flash로는 prompt 튜닝만으로 precision 80%+ 달성 불가** 실측 입증
- [ ] Oracle 의무 게이트 enforce (위젯 머지 전 GPT-4o pass 확인)
- [ ] 일간 09:00 cron으로 Librarian audit 자동화 (다음 세션)
- [ ] 30일 후 $100/월 실제 소진율 점검 — 현재 누적 ~$0.004 (0.004%)
- [ ] **사용자 액션 아이템**: aistudio.google.com에서 API key billing 활성화 (Pro 모델 호출 가능하게)
- [ ] billing 활성화 후 Pro Preview 재검증 (목표: precision 80%+)

### 실측 권장 운영 패턴 (Multi-stage pipeline)

| Stage | 모델 | Prompt | 비용/audit | 역할 |
|---|---|---|---|---|
| 1차 광역 sweep | Flash | v1 (관대) | $0.003 | 위반 후보 광역 검출 (recall 우선) |
| 2차 precision check | Pro Preview | v3 (엄격) | $0.5 | Flash 후보 중 진짜 위반 confirm |
| 3차 final approval | Claude Code or 사람 | $0 | Pro 결과 검토 후 적용 |

$100/월 한도로 약 200 audit pipeline 가능 (Flash + Pro).

## References

- [ADR 0006 — OMO Stage 0 Trial](0006-omo-stage0-trial.md) (lines 230-243 인시던트 5)
- 사용자 메모리: `~/.claude/projects/-Users-idong-geon/memory/ai_budget_topology.md`
- HANDOFF.md 최상단 박스 (모든 세션 1차 인지)
- [Google AI 공식 가격](https://ai.google.dev/gemini-api/docs/pricing)
- [Rate limits](https://aistudio.google.com/rate-limit)

## Implementation Notes (2026-05-22 cont.)

### OMO 실제 schema와의 차이

`~/.config/opencode/oh-my-openagent.json` 실제 schema는 본 ADR 가설(max_tools/routing/tasks 옵션)과 다름. 실제 schema는 `model` + `variant`만 받음. 따라서 본 ADR에서 명시한 `max_tools: 0` 같은 옵션은 OMO standard 외 영역으로, **운영 규율로 enforce**할 필요가 있음:

- OMO에 `librarian` (Gemini 3 Flash Preview) + `librarian-heavy` (Gemini 3.1 Pro Preview) 두 agent로 등록 완료 (commit pending)
- `max_tools: 0` 강제는 OMO 매뉴얼 호출 시점에 도구 호출을 명시적으로 피하는 **사용 규율**로 전환
- routing(by_input_tokens)은 사용자가 task 크기에 따라 librarian vs librarian-heavy를 수동 선택
- 다음 OMO 세션에서 첫 실전: CashewStrategy L-01 영문 잔존 audit + L-07 변환 plan 생성
