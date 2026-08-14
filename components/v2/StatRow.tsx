/**
 * StatRow — V2.5 Institutional Grade 4-up 보조 KPI 행.
 *
 * HeroZone과 같은 HeroKpi 계약을 재사용하며, 숫자만 모노 토큰으로 렌더한다.
 */
import React from 'react';
import type { HeroKpi } from './HeroZone';
import styles from './StatRow.module.css';

export interface StatRowProps {
  kpis: readonly HeroKpi[];
  ariaLabel?: string;
  className?: string;
}

function formatValue(kpi: HeroKpi) {
  const decimals = kpi.decimals ?? 0;
  return kpi.value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function StatRow({
  kpis,
  ariaLabel = '보조 핵심 지표',
  className,
}: StatRowProps) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(' ')}
      role="list"
      aria-label={ariaLabel}
      style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          role="listitem"
          style={{
            minWidth: 0,
            padding: '14px 16px',
            border: '1px solid var(--dsc-surface-border)',
            borderRadius: 12,
            background: 'var(--dsc-surface)',
            boxShadow: 'var(--dsc-card-shadow)',
          }}
        >
          <span className={styles.label}>{kpi.label}</span>
          <span
            data-live-kpi={kpi.live ? 'true' : undefined}
            aria-live={kpi.live ? 'polite' : undefined}
            aria-atomic={kpi.live ? 'true' : undefined}
            style={{
              display: 'block',
              marginTop: 6,
              color: 'var(--dsc-ink)',
              fontSize: '1.25rem',
              fontWeight: 700,
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              data-kpi-number="true"
              style={{
                fontFamily: 'var(--dsc-font-mono)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatValue(kpi)}
            </span>
            <span data-kpi-unit="true" className={styles.unit}>{kpi.unit}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
