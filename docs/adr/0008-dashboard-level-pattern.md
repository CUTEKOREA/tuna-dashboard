# ADR 0008 — Dashboard-Level Pattern (ADR-0005 마이그레이션 부적합 dashboard 처리)

**Status**: ACCEPTED (2026-05-22, Claude Code 세션)
**Related**: [ADR 0005 — Widget Intake Module](0005-widget-intake-module.md), [ADR 0007 — Librarian Role](0007-librarian-role.md)

## Context

ADR-0005 WidgetCard 마이그레이션을 진행하면서 일부 dashboard가 **위젯 단위가 아닌 dashboard 단위로 설계된 구조**임이 밝혀짐. 이들에 위젯 마이그레이션 패턴을 강제 적용하려 시도하면 다음 문제 발생:

1. 구조 자체가 **인터랙티브 dashboard application** (탭/모달/마스터-디테일/캐스케이드 필터)
2. 위젯스러운 영역(차트+SIT/TAK)이 0~3개로 적고, 나머지는 framework UI (KPI Grid·Table·Tab Switcher·Vessel List)
3. WidgetCard로 강제 wrap하면 dashboard interaction이 깨지거나 layout이 어색해짐

이번 세션(2026-05-22) 실측으로 확인된 4개 dashboard:

| 파일 | 줄 수 | TakeawayBox | 구조 |
|---|---|---|---|
| `FleetStrategyMatrix.tsx` | 606 | 3 | Master-Detail (Matrix 9 카드 → 클릭 시 Detail View). Macro Overview + Dashboard Metrics + Matrix Table + CompanyVesselStatus + Insight 1/2/3 + 최종 TakeawayBox 2 |
| `SEAsiaOEMDashboard.tsx` | 265 | 0 | Vendor List + Modal Deep-Dive. 반복 list item 패턴 |
| `RetailPOS.tsx` | 315 | 0 | PB/NB Donut + Real-time Price Tracker + Smile Curve Negotiation Tool. 인터랙티브 시뮬레이터 |
| `StrategyIntel.tsx` | 176 | 0 | Big 4 Scatter Plot + Trade Route Sankey + 3D Flip Cards + Category Portfolio. 다중 sub-section |

이 4개를 **WidgetCard로 강제 마이그레이션하지 않는다**는 결정 필요.

## Decision

ADR-0005 WidgetCard 마이그레이션 대상은 **"위젯 단위 dashboard (Dashboard.tsx + 위젯 시리즈 import)"** 패턴으로 한정한다. 다음 두 패턴은 **ADR-0005 적용 제외**:

### 제외 패턴 A — Master-Detail Dashboard
**예시**: `FleetStrategyMatrix.tsx`
- 한 dashboard가 selected state에 따라 두 모드 (list / detail) 렌더링
- KPI Grid·Matrix Card·Vessel Table 등 dashboard-wide UI 구성
- TakeawayBox는 dashboard 단위(전체) 1-3개, 위젯 단위 0
- WidgetCard 사용 시 `customBody` 한 호출로 강제 wrap 가능하지만 의미 없음

### 제외 패턴 B — Interactive Tool Dashboard
**예시**: `RetailPOS.tsx`, `StrategyIntel.tsx`, `SEAsiaOEMDashboard.tsx`
- 인터랙티브 시뮬레이터, 3D 카드, 협상 도구, 검색·필터 vendor list
- 각 sub-component가 독립적인 도구이지 차트+SIT/TAK 위젯이 아님
- TakeawayBox 0건이 신호

## Consequences

### Positive
- 마이그레이션 시간 절약 — 4개 dashboard를 강제 변환하는 데 들 시간 (~4-6h) 회수
- Dashboard interaction이 보존됨 (Master-Detail · Modal · Filter)
- ADR-0005 마이그레이션 완료 정의가 명확해짐: "위젯 시리즈 dashboard" 만 대상
- HANDOFF.md의 "잔여 작업 목록"에서 4개 제외 가능

### Negative
- 4개 dashboard의 `styles.glassCard` / `styles.card` 잔존이 영구화됨
- check_s_grade.py 같은 자동 검증이 4개 파일에서 false-positive 발생 가능 → 화이트리스트 필요
- TelemetryBadge·cardDesc 등 W-04 표준이 4개 dashboard에는 미적용

### Neutral
- 4개 dashboard의 향후 디자인 개선은 별도 ADR로 진행 (예: ADR 0009 — Dashboard UX 표준)
- 이들을 위젯 단위로 재설계하려면 dashboard 전체 재작성 필요 (별개 큰 프로젝트)

## Implementation

### 1. check_s_grade.py 화이트리스트

```python
# scripts/check_s_grade.py 상단
DASHBOARD_LEVEL_PATTERN_FILES = {
    'components/FleetStrategyMatrix.tsx',
    'components/SEAsiaOEMDashboard.tsx',
    'components/RetailPOS.tsx',
    'components/StrategyIntel.tsx',
}
# ds-card/glassCard/cardDesc/TelemetryBadge 검증에서 제외
```

(다음 세션에서 적용. 우선은 ADR로 결정만 보존.)

### 2. HANDOFF.md 잔여 작업에서 4개 제외

ADR-0005 마이그레이션 완료 정의:
- "ADR-0005 대상 = 위젯 시리즈 dashboard만"
- 4개 dashboard는 별도 트랙

### 3. CONTEXT.md 어휘 추가 (선택)

- **Dashboard-level Pattern**: 위젯 단위가 아닌 dashboard 전체가 인터랙티브 도구인 패턴. ADR-0005 마이그레이션 제외.

### 4. 4개 dashboard의 부분 마이그레이션 가능성

엄밀히는 다음 부분은 WidgetCard로 변환 가능 (선택):
- **FleetStrategyMatrix** Insight 1/2/3 (3개) — 차트+narrative 짝이라 위젯 후보
- **RetailPOS** Smile Curve Negotiation Tool — chart+report 짝
- **StrategyIntel** Big 4 Scatter Plot — chart 단독

단 변환 시 dashboard layout flow가 깨질 수 있어 careful refactor 필요. 별도 PR 권장.

## Validation

- [ ] `check_s_grade.py`에 화이트리스트 추가 (다음 세션)
- [ ] HANDOFF.md "잔여 작업" 섹션에서 4개 dashboard 제거
- [ ] ADR 0005 README에 "제외 dashboard" 명시
- [ ] (선택) 4개 dashboard의 부분 위젯 추출은 별도 ADR로 다룬다 — 합의

## References

- [ADR 0005 — Widget Intake Module](0005-widget-intake-module.md)
- [ADR 0006 — OMO Stage 0 Trial](0006-omo-stage0-trial.md)
- [ADR 0007 — Librarian Role](0007-librarian-role.md)
- 이번 세션 commit `2161683` (3 single-widget 마이그레이션) + `b97c64e` (CashewStrategy + dynamic loop)
