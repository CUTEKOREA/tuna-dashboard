# Pollock Phase 2A.2 Pilot — PollockPolicyFinanceWidgets.tsx 마이그레이션 spec

> **목적**: ADR-0005 (Widget Intake Module) 마이그레이션을 OMO 4-Agent 루프로 검증. **단일 파일·3 위젯·behavior preservation**.
> **종류**: 마이그레이션 (refactor) — 기존 코드 *개조*, 신규 생성 아님.
> **scope lock**: 이 spec은 **PollockPolicyFinanceWidgets.tsx 단 1개 파일에만 적용**. spec_stage1.md처럼 여러 위젯이 정의되어 있지 않음. 다른 Pollock*.tsx 파일은 *건드리지 말 것*.

---

## 마이그레이션 대상

**파일**: `components/PollockPolicyFinanceWidgets.tsx` (140 LOC, 3 위젯)

**현재 패턴** (Phase 2A 이전, 인라인 보일러플레이트):
```tsx
import TakeawayBox from './TakeawayBox';
import styles from './TunaOperationalInsights.module.css';

const CardHeader = ({ title, icon: Icon, term, desc }: any) => (
  <div className={styles.cardHeader}>
    <h3 className={styles.cardTitle}>
      <Icon size={18} color="#cbd5e1" /> {title}
    </h3>
    {term && <TermTooltip term={term} description={desc} />}
  </div>
);

export function WidgetHSKBottleneck() {
  return (
    <div className={styles.card}>
      <CardHeader title="..." icon={...} term="..." desc="..." />
      <div className={styles.cardBody}>
        <div style={{ height: '260px', width: '100%' }}>
          <SafeResponsiveContainer><RadarChart>...</RadarChart></SafeResponsiveContainer>
        </div>
        <TakeawayBox source="..." situation="..." actionPlan="..." />
      </div>
    </div>
  );
}
```

**목표 패턴** (ADR-0005 WidgetCard 사용):
```tsx
import WidgetCard from './WidgetCard';

export function WidgetHSKBottleneck() {
  return (
    <WidgetCard
      title="..."                          // 기존 CardHeader title 이전
      icon={ShieldAlert}                   // 기존 icon 이전
      iconColor="#cbd5e1"                  // 기존 color 이전
      pillar="S3"                          // ⚠️ 신규 추가 (의무) — 정책·통관·물류 = S3
      cardDesc="..."                       // 기존 TermTooltip desc 이전 (산출 방법론 1줄)
      termTooltip={{ term: "...", description: "..." }}  // 기존 TermTooltip 이전 (있을 시)
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}  // ⚠️ 신규 추가 (의무)
      chartHeight={260}                    // 기존 height 이전
      chart={<RadarChart>...</RadarChart>} // ⚠️ SafeResponsiveContainer 래핑 제거 (WidgetCard가 처리)
      takeaway={{
        situation: "...",                  // 기존 SIT 이전 (1글자도 변경 금지)
        actionPlan: "...",                 // 기존 TAK 이전 (1글자도 변경 금지)
        source: "..."                      // 기존 source 이전 (1글자도 변경 금지)
      }}
    />
  );
}
```

## 3개 위젯 매핑 (Pillar 사전 결정)

| 위젯 | Pillar | 사유 |
|---|---|---|
| `WidgetHSKBottleneck` | **S3** 물류·통관 | HSK·세관·MFDS 검사 = 통관 마찰 |
| `WidgetWarehouseSniping` | **S3** 물류·통관 | 보세창고·VDS = 물류 인프라 |
| `WidgetVDSIntegrity` | **S3** 물류·통관 | VDS(Vessel Data System) 무결성 = 통관 정밀도 |

→ 3개 모두 S3. (Pollock은 명태이므로 S3는 정책·통관이 핵심 — 정확한 매핑.)

## Behavior Preservation 규칙 (필수)

다음은 **단 한 글자도 변경 금지**:
1. **SIT 텍스트** (`situation` 인자) — 원문 그대로
2. **TAK 텍스트** (`actionPlan` 인자) — 원문 그대로
3. **source 텍스트** — 원문 그대로
4. **차트 데이터** (`data` 배열) — 숫자·키·라벨 그대로
5. **차트 컴포넌트 구조** (Radar/Bar/Line dataKey, color, fillOpacity 등)
6. **icon import** (ShieldAlert·Crosshair·FileCheck) — 기존 사용 유지

다음만 **변경**:
1. JSX 구조 (CardHeader+cardBody+TakeawayBox 인라인 → WidgetCard 1개 컴포넌트)
2. import 정리 (사용 안 하는 styles·CardHeader·TakeawayBox·SafeResponsiveContainer 제거)
3. ⚠️ **신규 props 추가**: `pillar="S3"` + `telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}`

## cardDesc 작성 (W-04 의무 신규 필드)

기존 `TermTooltip` description이 산출 방법론을 담고 있는 경우 → 첫 1줄을 cardDesc로 추출하고, TermTooltip은 그대로 유지.

기존 description이 길거나 부적합한 경우 → 위젯 title + chart 의도를 1줄로 요약 (15-30자, 출처 약어 포함).

## §X 마이그레이션 체크리스트

| # | 항목 |
|---|---|
| 1 | 3 위젯 모두 `WidgetCard` 컴포넌트 사용 (인라인 CardHeader/cardBody 제거) |
| 2 | 3 위젯 모두 `pillar="S3"` |
| 3 | 3 위젯 모두 `telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}` |
| 4 | 3 위젯 모두 `cardDesc` 1줄 (산출 방법론·출처) |
| 5 | SIT·TAK·source·차트 데이터 1글자 변경 X (behavior preservation) |
| 6 | 미사용 import 제거 (styles, CardHeader 내부 함수) |
| 7 | `npm run build` 본 파일 에러 0건 |
| 8 | `git diff --stat` 단일 파일만 변경 (다른 Pollock*.tsx 0 변경) |

## Ralph Loop 진입 prompt

```
ultrawork: artifacts/spec_pollock_2a2_pilot.md 의 지침대로
components/PollockPolicyFinanceWidgets.tsx 파일 1개만 마이그레이션한다.
ADR-0005 WidgetCard 사용. SIT/TAK/source/차트 데이터는 1글자도 변경 금지.
spec §X 체크리스트 8/8 통과까지 자기참조 반복.
완료 시 git commit (메시지 끝에 [OMO] 접미사).
다른 Pollock*.tsx 파일은 절대 건드리지 말 것. spec에 1개 파일만 정의되어 있음.
```
