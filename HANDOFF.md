# HANDOFF — 현재 작업 상태

> 어느 에이전트(Claude Code / Antigravity / 그 외)에서 세션을 시작하든 이 파일을 먼저 읽으세요. 직전 세션이 끝낸 지점과 다음 단계가 적혀 있습니다.
>
> **마지막 업데이트**: 2026-05-16 (Claude Code 세션 — Phase 1A 2차 완료, baseline grep 기준 EN-잔존 0)

---

## 진행 중인 큰 작업

**TunaDashboard 3종(Dashboard/Extract/Insights) S-Grade UI 표준화** — `COMPREHENSIVE_RULEBOOK.md` V4.1 기준.

- Phase 1: UI 포맷 표준화 (X축, Tooltip, 한글 매핑, TelemetryBadge, cardDesc, 단위 괄호) — *진행 중*
- Phase 2: `artifacts/tuna_extract_upgrade_plan.md` 컨텐츠 재구성 (5대 반직관 인사이트) — *미착수*

## 완료된 것 (직전 세션)

- ✅ `scripts/check_s_grade.py` 작성 — closure 기반 5규칙 grep 검증 도구
- ✅ `artifacts/s_grade_baseline.md` — 베이스라인 측정 보고서
- ✅ `CONTEXT.md` 작성 — 24개 도메인 용어 + 관계도 + 모호점 해소
- ✅ `docs/adr/` 부트스트랩 — README + ADR 0001/0002/0003
- ✅ `CLAUDE.md` 업데이트 (`@CONTEXT.md` 임포트 추가, Claude Code 전용)
- ✅ `improve-codebase-architecture` 스킬 분석 결과: deepening 후보 5+1개 식별
- ✅ `HANDOFF.md` + `AGENTS.md` 강화 (병용 규율, Quick Start, 알려진 함정, 1주 측정 루브릭)
- ✅ `.git/hooks/pre-commit` HANDOFF 갱신 점검 (경고형, 비차단)
- ✅ Claude Code 메모리: HANDOFF 갱신 자발 제안 규율 저장
- ✅ **Phase 1A 1차 완료**: `TunaInsightsDashboard.tsx` 영문 잔존 28→0
  - `scripts/fix_tuna_insights_en_to_ko.py` 작성·실행 (L-07 일괄 변환 패턴)
  - `tsc --noEmit` 통과 (L-06 게이트)
- ✅ **Phase 1A 2차 완료**: 4개 파일 영문 잔존 13→0 (TunaDashboard 6, TunaLiveTicker 4, TunaExtractDashboard 1, TunaNewInsightsB 2)
  - `scripts/fix_tuna_round2_en_to_ko.py` 작성·실행
  - 3개 dashboard closure 전부 baseline grep 기준 EN-잔존 0
  - `tsc --noEmit` 통과

## 베이스라인 (위반 현황)

| 항목 | 건수 |
|---|---|
| 영문 잔존 (사용자 노출 문자열) | ~41건+ |
| TelemetryBadge 누락 위젯 | 19개 |
| cardDesc 누락 위젯 | 11개 |
| TakeawayBox 누락 | 1개 (false positive) |

**가장 심한 단일 파일**: `TunaInsightsDashboard.tsx` (영문 잔존 28건)

**검증 명령**:
```bash
python scripts/check_s_grade.py TunaDashboard.tsx TunaExtractDashboard.tsx TunaInsightsDashboard.tsx
```

## 다음 단계 (우선순위 순)

### 즉시 (Phase 1A)
1. ~~**TunaInsightsDashboard.tsx 영문 잔존 28건 한글화**~~ ✅ 완료 (2026-05-16)
2. ~~**TunaLiveTicker.tsx 4건, TunaDashboard.tsx 6건, TunaExtractDashboard.tsx 1건, TunaNewInsightsB.tsx 2건** 한글화~~ ✅ 완료 (2026-05-16)
3. **추가 발견 잔존 처리**: 베이스라인 grep이 못 잡는 패턴들 (예: `Rising Hub: Ecuador`, `$3,450` 같은 콜론·기호 포함, KPI value, `subtitle` 같은 prop 종류). check_s_grade.py 패턴 개선 또는 수동 grep으로 추가 라운드.
4. ~~모든 closure 재측정 → 영문 잔존 0 확인~~ ✅ baseline 기준 0 (2026-05-16)

### Phase 1B (영문 박멸 완료 후)
4. **TelemetryBadge 단일 Module 추출** — 10개 commodity dashboard에 자기 복사본이 있고 9개 vs 1개로 타입 불일치 (룰북 위반 상태). `components/TelemetryBadge.tsx` 1개로 통합.
5. **truncateKoreanLabel 모듈화** — 30개 Tuna 파일에 복사된 truncate 함수를 `lib/chart-standards.ts`로 통합.

### Phase 1C
6. **cardDesc 누락 11개 추가** — TunaExtractDashboard의 패턴이 다른지 먼저 확인 (false positive 가능).

### Phase 2
7. `artifacts/tuna_extract_upgrade_plan.md` 5대 인사이트 컨텐츠 적용 — *기획안 승인 단계* 자체가 미확정.

## 식별된 Deepening 후보 (improve-codebase-architecture 분석)

상세는 직전 세션 대화 또는 향후 별도 문서화. 요약:

1. **위젯 인테이크 Module** — 100+ 위젯의 5단 합성 보일러플레이트 통합. 가장 큰 leverage. *큰 작업*.
2. **TelemetryBadge Module** — Phase 1B에 포함됨. 가장 빠른 win.
3. **Korean chart standards Module** — Phase 1B에 포함됨.
4. **Widget data intake Module** — Python `fix_*.py` 200+개의 근본 원인. *ADR-0003과 충돌, 재검토 필요*.
5. **5-Pillar Layout Module** — 룰북 표준이 코드에 강제되지 않음. ADR-0001 코드 강제화.
6. **Tuna 3 dashboard 분리 ADR화** — 정보 부족, 후보 1 진행 후 자연 해결 가능성.

## 핵심 참조 파일

- `COMPREHENSIVE_RULEBOOK.md` — V4.1 종합 규칙서 (P/R/D/W/A/O/L 조항)
- `UI_RULES.md` — UI/UX 디자인 시스템
- `AGENTS.md` — Next.js 변경사항 + 배포 프로토콜
- `CONTEXT.md` — 도메인 어휘집 (이 프로젝트만의 용어)
- `docs/adr/` — Architecture Decision Records (3건)
- `scripts/check_s_grade.py` — UI 표준화 검증 도구
- `artifacts/s_grade_baseline.md` — 직전 측정 결과
- `artifacts/tuna_extract_upgrade_plan.md` — Phase 2 기획안

## 세션 간 규율 (병용 시)

1. **세션 시작 시**: 이 파일을 *먼저* 읽기. `git log --oneline -10`으로 직전 변경 확인.
2. **세션 종료 시**: 이 파일의 "완료된 것" / "다음 단계"를 *반드시* 갱신하고 커밋.
3. **동시 작업 금지**: 한 브랜치에 두 에이전트가 동시 입력 X. worktree 분리 또는 시간차 작업.
4. **에이전트 의존 기능 사용 시 표시**: superpowers·grill-me 등 특정 도구 호출 결과는 *결정 자체*만 이 파일에 남기고 도구 호출 흔적은 남기지 않기 (다른 에이전트에 의미 없음).

## 미해결 결정

- `superpowers` 플러그인 설치 여부 — **1주 측정 후 재결정 (2026-05-23 디시전 데드라인)**. 아래 측정표 참조.
- ADR-0003 (스크립트 일괄 리팩토링) — 후보 4 (Widget data intake)과 충돌. Phase 2 후 재검토.
- `tuna_extract_upgrade_plan.md` 승인 상태 — "승인 시 즉시 돌입"으로 끝남, 실제 승인 여부 불명확.

---

## 📊 1주 병용 측정 (2026-05-16 ~ 2026-05-23)

목적: Claude Code와 Antigravity의 *실제 사용 비율과 강점 분포*를 측정해, superpowers 설치 가치를 데이터로 판단.

### 수집 데이터 (자동)

git log에 이미 `[CC]` / `[AG]` 접두어가 강제되므로 1주 후 다음 명령으로 자동 집계 가능:

```bash
# 한 주의 에이전트별 커밋 수
git log --since="2026-05-16" --until="2026-05-23" --oneline | grep -c "\[CC\]"
git log --since="2026-05-16" --until="2026-05-23" --oneline | grep -c "\[AG\]"

# 작업 유형별 분포 (refactor/feat/fix/chore)
git log --since="2026-05-16" --until="2026-05-23" --oneline | awk '{print $2}' | sort | uniq -c
```

### 수집 데이터 (수동 1줄 일지)

매일 작업 종료 시 아래 표에 1행 추가. 30초 이하의 부담:

| 날짜 | 에이전트 | 작업 유형 | 시간(분) | 마찰 | 승리 |
|---|---|---|---|---|---|
| 2026-05-16 | CC | bootstrap (CONTEXT/ADR/HANDOFF) | 90 | — | grill-me + CONTEXT.md 한 번에 완성 |
| 2026-05-16 | CC | ui-fix (TunaInsights 영문 박멸 28건) | 20 | grep이 콜론·기호 포함 영문 못 잡음 (추가 라운드 필요) | L-07 일괄 변환 스크립트로 28건 무손실 치환, tsc 통과 |
| 2026-05-16 | CC | ui-fix (4파일 영문 박멸 13건) | 12 | 회사 고유명사 음역 판단(Tan Phat→탄팟) | closure 전체 EN-잔존 0, tsc 통과 |
|  |  |  |  |  |  |

**작업 유형 카테고리** (단순화):
- `bootstrap` — 인프라·문서·도구
- `refactor` — 코드 구조 변경 (Module 추출 등)
- `content` — 컨텐츠 재구성 (SIT/TAK 작성, plan 적용)
- `ui-fix` — 영문 박멸·텍스트 교체 등 표면 작업
- `data` — 데이터 수집·정제·API
- `debug` — 빌드 에러·런타임 버그
- `analysis` — 측정·grill·plan 작성

### 결정 루브릭 (2026-05-23)

다음 4개 지표를 보고 정합니다:

| 지표 | "superpowers 설치" 신호 | "보류 계속" 신호 |
|---|---|---|
| **CC:AG 커밋 비율** | CC ≥ 60% | CC < 50% |
| **refactor 작업 수** | ≥ 2건 (대규모 리팩토링 실제 발생) | 0~1건 |
| **CC에서 큰 작업의 *마찰*** | "plan/worktree 부재로 헤맸다" 가 2회 이상 | 매끄럽게 진행됨 |
| **HANDOFF.md 갱신 누락** | 1주 내 ≤ 1회 (규율 작동 중) | 3회 이상 (인프라 미작동) |

**4개 중 3개 이상이 "설치" 신호** → 설치 진행.
그 외 → 보류 + 추가 1주 측정 또는 영구 보류.

### 측정 기간 중 절대 하지 말 것

- 측정을 의식해서 CC/AG 비율을 *조정*하기 (자연스러운 사용이 측정 목적).
- superpowers를 살짝 시험 설치하고 측정 (오염).
- 결정 루브릭을 도중에 바꾸기 (사후 합리화 방지).
