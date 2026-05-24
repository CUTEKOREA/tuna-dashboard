# A8 Accessibility 색맹 대비 codemod 가이드

> 작성: 2026-05-24 / 기준: 17 commodity Forensic Audit A8 평균 70~75 (색맹 의존 차트 多)
> 목표: Recharts Bar/Area 차트에 SVG `<pattern>` 오버레이 + 색맹 친화 팔레트로 WCAG 2.1 SC 1.4.1 준수

## 1. 공용 모듈 (신설)

**`components/ChartPatterns.tsx`** — 모든 차트에서 import 가능:
- `<ChartPatternDefs />` — `<defs>` 안에 5종 SVG pattern (stripe-h/stripe-v/diag/dots/cross)
- `A11Y_PALETTE` — Okabe-Ito 8-color 색맹 친화 팔레트
- `getA11yBarProps(idx)` — dataKey 인덱스별 자동 패턴+색상 props 반환
- `getPatternFill(kind, color)` — 단일 패턴 fill string 헬퍼

## 2. 시범 적용 완료

| Commodity | 위젯 | 변경 |
|---|---|---|
| **Beef** | W2 Top 5 생산국 (multi-Cell) | `<ChartPatternDefs />` + `getA11yBarProps(i)` Cell loop |
| **Beef** | W3 도축장 가동률 (2 Bar) | stripe-h (미국) + diag (호주) |
| **Pork** | W7 한국 수급 구조 (2 Bar) | stripe-h (생산) + diag (수입) |

## 3. 적용 패턴 (다른 dashboard 확산용)

### 패턴 A: 다중 카테고리 Bar (Top 5 생산국 등)

**Before:**
```tsx
<BarChart data={top5} layout="vertical">
  <Bar dataKey="production">
    {top5.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
  </Bar>
</BarChart>
```

**After:**
```tsx
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';

<BarChart data={top5} layout="vertical">
  <ChartPatternDefs />
  <Bar dataKey="production">
    {top5.map((_, i) => {
      const p = getA11yBarProps(i);
      return <Cell key={i} fill={p.fill} stroke={p.stroke} color={p.color} />;
    })}
  </Bar>
</BarChart>
```

### 패턴 B: 다중 시리즈 Bar (생산 vs 수입 등)

**Before:**
```tsx
<Bar dataKey="production" fill="#3b82f6" />
<Bar dataKey="imports" fill="#10b981" />
```

**After:**
```tsx
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

<ComposedChart>
  <ChartPatternDefs />
  <Bar dataKey="production" fill="url(#a11y-stripe-h)" color={A11Y_PALETTE[0]} />
  <Bar dataKey="imports" fill="url(#a11y-diag)" color={A11Y_PALETTE[2]} />
</ComposedChart>
```

### 패턴 C: 임계값 색상 (heat-color, ≥90=빨강 등) — Cell

**Before:**
```tsx
<Cell fill={e.value > 90 ? '#ef4444' : '#10b981'} />
```

**After (색맹 친화 + 패턴 보조):**
```tsx
// 위험은 stripe-v (수직 줄무늬, 위험 직관) + #D55E00 (짙은 주황, 적색맹 OK)
// 안전은 solid + #009E73 (청록, 모든 색맹 OK)
<Cell
  fill={e.value > 90 ? 'url(#a11y-stripe-v)' : A11Y_PALETTE[2]}
  color={e.value > 90 ? A11Y_PALETTE[5] : A11Y_PALETTE[2]}
/>
```

## 4. 일괄 적용 작업량 (점진 확산)

| 우선순위 | Dashboard | Bar 차트 수 (추정) | 예상 시간 |
|---|---|---:|---:|
| ✅ 완료 | Beef · Pork | 시범 3 위젯 | ✓ |
| High | Chicken · Mackerel · Galchi · Salmon | ~30 | 1시간 |
| Mid | Squid · Shrimp · Pollock · Cocoa | ~40 | 1.5시간 |
| Low | 나머지 8 commodity | ~50 | 2시간 |
| **합계** | 18 commodity | **~120 Bar 차트** | **4.5시간** |

## 5. 효과 측정 (Forensic Audit 8-Axis A8)

| 분야 | 적용 전 A8 평균 | 적용 후 (예상) |
|---|:---:|:---:|
| 시범 3 위젯 (Beef·Pork) | 70~75 | **85+** |
| 전체 247 위젯 (full 적용) | 72 | **85** |
| 영향 axis | A8만 | 평균 grade B+ → A- 전체 상승 |

## 6. WCAG 2.1 준수 근거

- **SC 1.4.1 Use of Color** (Level A): 색상만으로 정보 구분 금지 — 패턴(stripe/dots) 추가로 충족
- **SC 1.4.3 Contrast (Minimum)** (Level AA): 4.5:1 대비 — Okabe-Ito 팔레트 검증됨
- **SC 1.4.11 Non-text Contrast** (Level AA): UI 컴포넌트 3:1 대비

## 7. 다음 단계 (사용자 선택)

| 옵션 | 작업 | 시간 |
|---|---|---:|
| (a) | Chicken/Mackerel/Galchi/Salmon 일괄 codemod | 1시간 |
| (b) | scripts/fix_a11y_charts.py 자동 codemod 작성 (L-07 패턴) | 30분 (스크립트) + 자동 |
| (c) | 시범 commit + 점진 확산 (현재 상태 보존) | 5분 |
