/**
 * Design System — Unified Chart Configuration
 * 모든 Recharts 컴포넌트에서 사용하는 통일된 스타일 상수
 */

export const CHART_STYLES = {
  tick: { fontSize: 11, fill: 'var(--text-tertiary)' },
  tickBold: { fontSize: 11, fill: 'var(--text-tertiary)', fontWeight: 600 as const },
  legend: { fontSize: 12 },
  tooltipContent: {
    backgroundColor: 'var(--surface-3)',
    borderColor: 'rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
  },
  grid: { stroke: 'var(--chart-grid)', strokeDasharray: '3 3' },
  axis: { stroke: 'var(--chart-axis)' },
  axisHidden: { axisLine: false, tickLine: false },
} as const;

/** Semantic color palette for consistent chart theming */
export const CHART_COLORS = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger:  'var(--color-danger)',
  info:    'var(--color-info)',
  purple:  'var(--color-purple)',
  primary: '#3b82f6',
  secondary: '#f97316',
  cyan: '#22d3ee',
} as const;
