# HANDOFF — 현재 작업 상태

> 어느 에이전트(Claude Code / Antigravity / 그 외)에서 세션을 시작하든 이 파일을 먼저 읽으세요. 직전 세션이 끝낸 지점과 다음 단계가 적혀 있습니다.
>
> **마지막 업데이트**: 2026-05-16 (Claude Code 세션)

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
1. **TunaInsightsDashboard.tsx 영문 잔존 28건 한글화** — 한·영 매핑 사전부터 만든 후 일괄 교체
2. **TunaLiveTicker.tsx 4건, TunaDashboard.tsx 6건, 나머지 위젯들** 한글화
3. 재측정 → 영문 잔존 0 확인

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

- `superpowers` 플러그인 설치 여부 — Claude Code 전용. 병용 시 가치 측정 필요.
- ADR-0003 (스크립트 일괄 리팩토링) — 후보 4 (Widget data intake)과 충돌. Phase 2 후 재검토.
- `tuna_extract_upgrade_plan.md` 승인 상태 — "승인 시 즉시 돌입"으로 끝남, 실제 승인 여부 불명확.
