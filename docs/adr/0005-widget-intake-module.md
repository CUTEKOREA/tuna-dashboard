# ADR-0005: Widget Intake Module (위젯 합성 보일러플레이트 통합)

> **상태**: **ACCEPTED** (2026-05-21, 사용자 의사결정)
> **작성**: 2026-05-20 (Claude Code) / 최종 승인: 2026-05-21
> **배경**: improve-codebase-architecture skill 분석에서 "deepening 후보 #1, 가장 큰 leverage"로 식별. 100+ 위젯의 5단 합성 보일러플레이트(`CardHeader` + `Chart` + `KPI Panel` + `TakeawayBox` + `TelemetryBadge`) 통합.
> **ADR-0003 (스크립트 일괄 리팩토링)과 충돌** — 본 ADR 통과 시 0003 일부 폐기 또는 재정의 필요.

## 의사결정 (2026-05-21)

| 질문 | 결정 |
|---|---|
| 도입 여부 | ✅ **점진형 마이그레이션 도입** (프로토타입 없이 전면 도입) |
| 우선순위 | **Tuna 33개 먼저** — 도메인 이해 깊고 audit 잘 마무리됨 |
| 컴파일 타임 룰 | **P-03 전체 강제** — Conviction Buy / Actionable Insight / 과장 수식어 / cardDesc·TelemetryBadge·source 의무 모두 lint error |
| Antigravity 조율 | **1~2주 동일 파일 작업 일시 중단** — HANDOFF 명시 후 마이그레이션 기간 확보 |

---

## Context

현재 구조 (전수 조사 2026-05-20):
- `components/` 하위 200+ `.tsx` 파일 중 약 130개가 *위젯 패턴*
- 각 위젯이 5개 영역을 자체 JSX로 구성:
  1. `<div className={styles.cardHeader}><h3>…<icon/>제목<TermTooltip/><TelemetryBadge/></h3><p>cardDesc</p></div>`
  2. `<div className={styles.cardBody}><SafeResponsiveContainer><Chart>…</Chart></SafeResponsiveContainer></div>`
  3. `<div className={styles.kpiPanel}>…</div>` (선택)
  4. `<TakeawayBox situation actionPlan source />`
  5. (가끔) `<TermTooltip />` 또는 `<FootnoteBlock />`

문제:
- **반복 보일러플레이트**: 같은 구조가 130개 파일에 복붙. 평균 50~100줄 추가.
- **표준 위반 발견 어려움**: cardDesc 누락, TelemetryBadge 누락, source 누락이 산발적 (Phase B audit 표 참조).
- **Phase D L-07 일괄 변환의 근본 원인**: 같은 패턴을 130개 파일에서 매번 정규식으로 찾아야 함. Module화하면 변경 1회로 끝.
- **신규 위젯 신설 시간**: 현재 40~60분 (Phase B4 신규 4종 평균). Module 도입 시 10~15분으로 단축 추정.

---

## Decision (제안 모듈 구조)

```tsx
// lib/widget-intake.tsx 또는 components/WidgetCard.tsx (신규)

interface WidgetCardProps {
  // === 헤더 ===
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  termTooltip?: { term: string; description: string };
  telemetry: { status: 'LIVE' | 'SYNCED' | 'STATIC'; syncDate?: string };
  cardDesc?: string;          // 산출 방법론·출처 1줄 (W-04 의무)

  // === 본문 ===
  pillar: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';  // 5-Pillar 매핑 (W-04 의무)
  unit?: string;              // (단위: $/MT) 표기
  chart: React.ReactNode;     // Recharts JSX
  chartHeight?: number;       // default 280
  kpiPanel?: KpiPanelItem[];  // 우측 KPI 카드들 (선택)

  // === Takeaway ===
  takeaway: {
    situation: string;
    actionPlan: string;       // GS 톤 강제 (Conviction Buy 등 keyword 검출 시 build fail)
    source: string;           // 출처 의무 (audit Phase A 교훈)
  };
}

export function WidgetCard(props: WidgetCardProps) {
  // L-03 / W-04 / A-02 / L-04 / D-05 등 모든 규칙을 *컴파일 타임*에 강제
  // - telemetry 미지정 → 타입 에러
  // - source 빈 문자열 → 빌드 시 lint 에러
  // - actionPlan에 "(Conviction Buy)" 포함 → 빌드 fail
  // - cardDesc > 120자 → 경고

  return (
    <div className={styles.insightCard}>
      <WidgetHeader {...} />
      <WidgetBody>{props.chart}{props.kpiPanel && <KpiPanel items={props.kpiPanel} />}</WidgetBody>
      <TakeawayBox {...props.takeaway} />
    </div>
  );
}
```

### 마이그레이션 전략 (점진적)

1. **신규 위젯부터 적용** (즉시): Phase B4 신규 4종 + 향후 모든 신규 위젯은 `WidgetCard` 의무
2. **기존 130개 점진 이관** (분기당 20~30개): 비ESG critical 위젯부터 시작 → S1 → S2 순
3. **마이그레이션 자동화**: `scripts/migrate_widget_to_intake.py` (AST 변환) — 한 파일당 30초

### 컴파일 타임 강제 규칙

```typescript
// lib/widget-intake.lint.ts (eslint 커스텀 룰)
- W-04 cardDesc 의무 → cardDesc 미지정 시 lint error
- A-02 TelemetryBadge → telemetry prop 의무 (타입 강제)
- P-03 컨빅션 태그 금지 → /(Conviction Buy)|\[Actionable Insight\]/ 검출 시 lint error
- D-05 한글 7자 → title.length > 7 시 lint warning (영문 약어 제외)
- L-04 HSK → source에 HS 코드 있으면 10자리 검증
```

---

## Consequences

### 긍정
- **신규 위젯 시간 -70%**: 40-60분 → 10-15분
- **표준 위반 0건 보장**: 컴파일 타임에 강제 → audit 비용 0
- **L-07 일괄 변환 스크립트 폐기 가능**: Module 1곳 수정으로 끝
- **GS 톤 강제**: Conviction Buy 등 키워드를 lint 룰로 영구 차단

### 부정
- **마이그레이션 비용**: 130개 위젯 × 평균 15분 = 약 32시간 (분기 1개월씩 나누면 4분기)
- **유연성 손실**: 일부 위젯이 표준 5단 구조를 못 따르는 경우 escape hatch 필요
- **ADR-0003 충돌**: "스크립트 일괄 리팩토링" 원칙이 일부 폐기됨 (Module로 대체)
- **Antigravity·Claude Code 양쪽이 같은 표준 따라야** — 도입 시점에 정렬 작업

### 트레이드오프
- 32시간 마이그레이션 vs 분기당 audit 7시간 절감 → **3분기 만에 회수**
- 단, 마이그레이션은 *디자인이 거의 안정된* 위젯부터 (자주 바뀌는 위젯은 후순위)

---

## Alternatives Considered

1. **현 상태 유지 + L-07 스크립트로 분기마다 일괄 변환** — Phase D에서 검증된 패턴. 단 마이그레이션 비용 없음. ADR-0003. **현재 default.**
2. **Storybook + Design Token만 도입** — Module 추출 안 하고 *스타일*만 통합. 컴파일 타임 룰 강제는 불가. Reject (P-03 위반 재발 막을 수 없음).
3. **본 ADR 통과 → 점진 마이그레이션** — 추천. Phase 1~3 단계별.

---

## Open Questions (승인 전 확정)

1. **마이그레이션 우선순위**: TunaDashboard 33개부터? 또는 비-tuna 130개 중 가장 자주 바뀌는 것부터?
2. **escape hatch 허용 범위**: 5단 구조를 못 따르는 위젯은 어떻게? (예: MarketDashboard 같은 hub 컴포넌트)
3. **Antigravity 정렬**: HANDOFF에 명시한 뒤 *동시 작업 금지* 기간(1~2주) 확보
4. **첫 마이그레이션 대상**: 가장 단순한 위젯 1개로 *프로토타입* 검증 (1~2시간) — 어느 위젯?

---

## 권장 Next Action

본 ADR을 **사용자가 grill-me 또는 의사결정 세션으로 한 번 더 검토** 권장. 큰 결정이고 마이그레이션 비용이 큼.

가장 안전한 시작:
1. 본 ADR 승인
2. 프로토타입 1개: 가장 단순한 위젯(예: [components/TunaCrossroads.tsx](../components/TunaCrossroads.tsx))을 `WidgetCard`로 마이그레이션 (2시간)
3. 결과 평가 → 전체 마이그레이션 정책 결정
