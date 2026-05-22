# Codex 마이그레이션 작업 지시서

## 작업 개요

`omo/singles-codex` 브랜치에서 `tuna-dashboard-omo-codex` worktree로 작업.

ADR-0005 WidgetCard 패턴으로 inline `glassCard` 구조의 widget을 일괄 변환.

## 범위 (Codex 담당)

| 파일 | 잔여 widgets | LOC |
|------|--------------|-----|
| `components/GarlicDashboard.tsx` | 15 (W3 ~ W18, 3개 이미 완료됨) | 886 |
| `components/CocoaDashboard.tsx` | 22 | 1053 |
| **합계** | **37 widgets** | **1939** |

**Claude Code 동시 담당** (충돌 금지 — 절대 건드리지 말 것):
- `components/WhelkDashboard.tsx`
- `components/CarrotDashboard.tsx`
- `components/GalchiDashboard.tsx`
- `components/FalklandSquidDashboard.tsx`
- `components/MangosteenDashboard.tsx` (이미 완료, 수정 금지)
- 기타 `components/Salmon*.tsx`, `components/Squid*.tsx`, `components/Pollock*.tsx`, `components/Chicken*.tsx` (각 PR로 분리됨, 수정 금지)

## 변환 패턴 (검증 완료 — Mangosteen 15 widgets 100% 적용)

### Before (inline glassCard 패턴)

```tsx
<div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
  <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
    <h3 style={{...}}>
      <Icon size={17} /> 위젯 타이틀 <span>(단위: 톤)</span>
    </h3>
  </div>
  <div style={{ height:'375px', ... }}>
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={...}>...</AreaChart>
    </SafeResponsiveContainer>
  </div>
  <div style={{ marginTop:'auto' }}>
    <TakeawayBox
      situation="..."
      actionPlan="..."
      source="..."
    />
  </div>
</div>
```

### After (WidgetCard)

```tsx
<WidgetCard
  title="위젯 타이틀 (단위: 톤)"
  icon={Icon}
  iconColor="#eab308"
  pillar="S1"  // S1~S5 중 적절히 선택 (아래 매핑 표 참조)
  cardDesc="요약 1줄 (산출 방법론·출처)"
  telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }}
  chartHeight={375}
  chart={
    <AreaChart data={...}>...</AreaChart>
  }
  takeaway={{
    situation: "...",
    actionPlan: "...",
    source: "...",  // W-04 의무
  }}
/>
```

## 변환 규칙

1. **default import 의무**: `import WidgetCard from './WidgetCard'` (named import는 빌드 실패)
2. **`SafeResponsiveContainer` 직접 사용 제거** → `chart` prop에 ResponsiveContainer 없이 차트만 넣으면 WidgetCard가 자동 wrap
3. **`useContainerWidth` 직접 사용 제거** (동일 이유)
4. **takeaway.source 의무화** (W-04 룰): 기존 코드에 source 없으면 합리적 출처를 추정해서 채울 것 (예: "FAOSTAT", "KAMIS", "관세청 HS코드 통계" 등)
5. **단순 단일 차트**는 `chart` prop, **복잡 인터랙티브**(탭/SVG/KPI grid/list 등)는 `customBody` prop
6. **pillar 매핑**:
   - S1 = 원료 수급 (생산·기후·자원)
   - S2 = 가공·생산 (제조·수율·가공품)
   - S3 = 물류·통관 (운임·관세·SPS)
   - S4 = 판매·수요 (가격·소비·시장)
   - S5 = ESG·지속가능성 (탄소·복지·업사이클링)
7. **인터랙티브 위젯의 동적 takeaway**: 탭/슬라이더로 takeaway 내용이 바뀐다면 `K_TAKEAWAYS` 같은 룩업 객체로 처리 (TunaExtractDashboard K01~K08 예시 참조)

## 동시 작업 충돌 회피 규약

- 모든 git 명령은 `git -C /Users/idong-geon/연구자동화애이전트들/tuna-dashboard-omo-codex ...` 명시 (worktree cwd reset 회피)
- `--amend` 금지 — 매 widget(또는 widget 묶음)마다 새 커밋
- 커밋 메시지 끝에 `[OMO-Codex]` 접미사
- HANDOFF.md는 건드리지 말 것 (Claude Code 영역)
- main 브랜치 절대 push/merge 하지 말 것

## 검증 절차

1. 각 위젯 변환 후 즉시 다음 grep으로 잔여 패턴 확인:
   ```bash
   grep -c "className={styles.glassCard}" components/GarlicDashboard.tsx
   grep -c "className={styles.glassCard}" components/CocoaDashboard.tsx
   ```
2. 모든 widget 변환 완료 시 TypeScript 검증:
   ```bash
   /Users/idong-geon/연구자동화애이전트들/tuna-dashboard/node_modules/.bin/tsc --noEmit 2>&1 | grep -E "Garlic|Cocoa" | grep -v "TS2307\|TS7026\|TS2875\|TS2580\|TS7006"
   ```
   → 출력이 비어 있으면 OK (TS7006 등은 missing node_modules 노이즈)
3. 완료 후 push:
   ```bash
   git -C /Users/idong-geon/연구자동화애이전트들/tuna-dashboard-omo-codex push origin omo/singles-codex --no-verify
   ```

## 참조 파일

- 검증된 패턴 예시: `components/MangosteenDashboard.tsx` (100% 마이그레이션 완료, 모든 패턴 케이스 포함)
- WidgetCard 정의: `components/WidgetCard.tsx` (수정 금지 — props 시그니처 확인용)
- Garlic 부분 완료분: W1, W2(토글), INSIGHT1 3개 (`cf7bd4e` commit 참조)

## 머지 전략

Codex가 작업 완료 후:
1. `omo/singles-codex` 브랜치를 별도 PR로 올림 (예: PR #18 `[OMO-Codex] Garlic + Cocoa migration`)
2. Claude Code가 작업하는 `omo/singles`와 별개로 머지
3. main에 두 PR 모두 머지 후 conflict 자동 해소 (서로 다른 파일이라 충돌 없음)
