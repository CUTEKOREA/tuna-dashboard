# ADR-0004: Automated Data Freshness Pipeline (정기 회귀 점검 인프라)

> **상태**: PROPOSED (승인 대기)
> **작성**: 2026-05-20 (Claude Code)
> **배경**: Phase A~G audit 7라운드를 거치며 33개 위젯 + 7개 tuna API endpoint를 수동 정정. 다음 분기에 동일 audit을 다시 돌리지 않으려면 자동화 필요.

---

## Context (왜 필요한가)

Phase E에서 확인한 실패 모드:
- 위젯 *텍스트*는 정정해도 **API endpoint mock 데이터**가 잔존하면 KPI 카드에 옛 값이 노출됨
- 외부 출처(Atuna, EUMOFA, ISSF)는 분기 단위로 신규판이 나옴 — 수동 갱신은 망각하기 쉬움
- audit 자체가 *5~7라운드 7시간* 소요 — 분기마다 반복은 비현실적

목표: **분기 1회 자동 회귀 점검** 인프라 구축. 사람 작업은 *fail된 항목 검토*에만 집중.

---

## Decision (제안 아키텍처)

```
┌─────────────────────────────────────────────────┐
│ GitHub Actions (분기 1회 / 매주 월요일 09:00 KST) │
└──────────────┬──────────────────────────────────┘
               │
               ├─→ [Job 1] Atuna 시세 fetch
               │    - scripts/fetch_atuna.py
               │    - skjbkk·yfabj 등 8종 CSV 갱신
               │    - agri_data/tuna/Atuna price/*.csv 자동 commit
               │
               ├─→ [Job 2] ISSF·EUMOFA·IMARC 신규판 체크
               │    - scripts/check_external_reports.py
               │    - 새 PDF 발견 시 Slack/Issue 알림 (다운로드는 수동)
               │
               ├─→ [Job 3] S-Grade Audit 회귀
               │    - python scripts/check_s_grade.py components/Tuna*.tsx
               │    - 영문 잔존·TelemetryBadge 누락·cardDesc 누락·Conviction Buy 잔존 등
               │    - 1건 이상 위반 시 GitHub Issue 자동 생성
               │
               ├─→ [Job 4] API mock drift 점검
               │    - scripts/check_api_mock_drift.py (신규)
               │    - app/api/*/route.ts 의 hardcoded 가격·forecast 시점 분기 점검
               │    - 시점이 *현재로부터 6개월+ 과거*면 STALE 라벨 자동 PR 생성
               │
               └─→ [Job 5] 위젯-API 수치 정합성 검증
                    - scripts/check_widget_api_consistency.py (신규)
                    - 위젯 텍스트의 핵심 수치 vs API 응답 값 비교
                    - 차이 10%+이면 Issue 생성
```

### 단계별 구축 (점진 도입)

**Phase 1 (필수, 2~3시간 작업):**
1. `.github/workflows/data-freshness.yml` — 주 1회 cron
2. `scripts/check_s_grade.py` 확장 — 이미 존재. 영문 잔존 외에 *Conviction Buy*, *Actionable Insight*, *압도적/완벽한* 패턴도 추가
3. GitHub Issue 자동 생성 (gh CLI 또는 actions/github-script)

**Phase 2 (선택, 1일 작업):**
4. `scripts/fetch_atuna.py` — Atuna 웹스크래핑 또는 API 연동 (Atuna는 유료 구독제이므로 *법적 허용 범위 확인 필요*)
5. `scripts/check_external_reports.py` — ISSF·EUMOFA·IMARC 사이트 새 PDF URL 폴링

**Phase 3 (고도화, 2~3일 작업):**
6. `scripts/check_api_mock_drift.py` — AST 파싱으로 API endpoint의 `historical: [{ period: '2024-Q1', ...]` 같은 시점 추출 후 현재 대비 6개월+ 과거이면 PR 자동 생성
7. `scripts/check_widget_api_consistency.py` — 위젯 텍스트의 정규식으로 추출한 수치를 API 응답과 ±10% 이내인지 검증

---

## Consequences

### 긍정
- 분기 audit 시간 7시간 → 1시간 이하 (자동 점검 → 사람은 fail만 검토)
- API mock drift / 외부 출처 신규판 미반영 *조기 알람*
- L-03 빌드 게이트와 자연스럽게 결합 (CI 통합)

### 부정
- 초기 구축 비용 (Phase 1만 해도 3시간)
- Atuna 스크래핑은 *서비스 약관 검토 필요* — 라이센스 위반 가능성
- false positive 알림 가능성 (예: API 의도적 변경을 drift로 오인) — 화이트리스트 관리 필요

### 트레이드오프
- Phase 1만 도입해도 60% 가치 회수. **Phase 1만 우선 권장**.
- Phase 2~3은 *audit 빈도*와 *유지보수 비용*을 측정한 뒤 결정.

---

## Alternatives Considered

1. **수동 분기 audit 계속** — 작업 7시간/분기 누적. Reject (지속 불가능).
2. **외부 SaaS (Greenhouse, Foundry 등) 위탁** — 비용 + 데이터 보안 우려. Reject.
3. **Antigravity·Claude Code에 분기마다 audit 의뢰** — 일관성 보장 어려움. Phase 1 도입 후 *보조 역할*로만.

---

## Open Questions

1. Atuna 스크래핑 라이센스 — Silla Co. 법무팀 확인 필요
2. GitHub Action 실행 빈도 — 분기 1회(현실적) vs 주 1회(빠른 알람)
3. fail 알림 채널 — GitHub Issue / Slack / 이메일?

---

## Next Action

이 ADR 승인 후 **Phase 1만** 우선 구축. 약 2~3시간 작업:
1. `.github/workflows/data-freshness.yml` 작성
2. `scripts/check_s_grade.py` 확장 (Conviction Buy 등 추가)
3. Issue 자동 생성 wiring
4. 첫 회귀 실행으로 기능 검증
