/**
 * 색맹 대비 차트 패턴 (A8 Accessibility 보강)
 *
 * Recharts Bar/Area에서 색상만으로 구분하면 적록색맹 사용자가 식별 불가.
 * SVG <pattern>으로 stripe·dots·cross 패턴 오버레이 → 색약·흑백 인쇄 가독성 모두 확보.
 *
 * 사용법:
 *   import { ChartPatternDefs, getPatternFill, A11Y_PALETTE } from './ChartPatterns';
 *
 *   <BarChart data={data}>
 *     <ChartPatternDefs />
 *     <Bar dataKey="A" fill={getPatternFill('stripe-h', '#0ea5e9')} />
 *     <Bar dataKey="B" fill={getPatternFill('dots', '#10b981')} />
 *     <Bar dataKey="C" fill={getPatternFill('cross', '#f59e0b')} />
 *     <Bar dataKey="D" fill={A11Y_PALETTE[3]} />  // solid (마지막 dataKey)
 *   </BarChart>
 *
 * WCAG 2.1 SC 1.4.1 Use of Color 준수 (색상 단독 의존 금지).
 */

import React from 'react';

/* ─── 색맹 친화 팔레트 (ColorBrewer Categorical + Okabe-Ito 8-color 색맹 친화) ─── */
export const A11Y_PALETTE = [
  '#0072B2', // 강한 청록 (모든 색맹 OK)
  '#E69F00', // 주황 (적록·청황 색맹 모두 OK)
  '#009E73', // 청록 (적록색맹에서도 명확)
  '#CC79A7', // 분홍 (적록색맹에서도 청록과 대비)
  '#56B4E9', // 하늘 (블루 계열 강조)
  '#D55E00', // 짙은 주황 (적색맹 OK)
  '#F0E442', // 노랑 (밝은 강조)
  '#000000', // 검정 (최대 대비, 인쇄도 OK)
] as const;

/* ─── SVG Pattern 정의 (4종 + 빈 패턴) ─── */
export function ChartPatternDefs() {
  return (
    <defs>
      {/* 가로 줄무늬 */}
      <pattern id="a11y-stripe-h" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="currentColor" fillOpacity="0.85" />
        <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      </pattern>

      {/* 세로 줄무늬 */}
      <pattern id="a11y-stripe-v" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="currentColor" fillOpacity="0.85" />
        <line x1="3" y1="0" x2="3" y2="6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      </pattern>

      {/* 대각선 */}
      <pattern id="a11y-diag" patternUnits="userSpaceOnUse" width="8" height="8">
        <rect width="8" height="8" fill="currentColor" fillOpacity="0.85" />
        <line x1="0" y1="8" x2="8" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      </pattern>

      {/* 점 */}
      <pattern id="a11y-dots" patternUnits="userSpaceOnUse" width="6" height="6">
        <rect width="6" height="6" fill="currentColor" fillOpacity="0.85" />
        <circle cx="3" cy="3" r="1.2" fill="rgba(255,255,255,0.5)" />
      </pattern>

      {/* 격자 */}
      <pattern id="a11y-cross" patternUnits="userSpaceOnUse" width="8" height="8">
        <rect width="8" height="8" fill="currentColor" fillOpacity="0.85" />
        <line x1="0" y1="4" x2="8" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="4" y1="0" x2="4" y2="8" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      </pattern>
    </defs>
  );
}

/**
 * Recharts Bar/Area의 fill prop에 패턴 URL 반환.
 * currentColor가 SVG 내부에서 부모 color로 치환되므로, color prop으로 색상 전달.
 *
 * 주의: Recharts는 `fill="url(#id)"` 직접 지원. color는 wrapper로 컨트롤.
 */
export type PatternKind = 'stripe-h' | 'stripe-v' | 'diag' | 'dots' | 'cross' | 'solid';

export function getPatternFill(kind: PatternKind, color?: string): string {
  if (kind === 'solid') return color || A11Y_PALETTE[0];
  return `url(#a11y-${kind})`;
}

/**
 * dataKey 인덱스에 따라 자동으로 패턴 + 색상 할당 (Recharts 차트에서 Bar 다중 사용 시).
 *
 * 사용:
 *   {dataKeys.map((key, idx) => <Bar key={key} dataKey={key} {...getA11yBarProps(idx)} />)}
 */
export function getA11yBarProps(index: number): { fill: string; stroke: string; color?: string } {
  const patterns: PatternKind[] = ['solid', 'stripe-h', 'diag', 'dots', 'stripe-v', 'cross', 'solid', 'diag'];
  const kind = patterns[index % patterns.length];
  const color = A11Y_PALETTE[index % A11Y_PALETTE.length];
  return {
    fill: kind === 'solid' ? color : `url(#a11y-${kind})`,
    stroke: color,
    color, // currentColor 부모로 전달 (CSS color)
  };
}
