'use client';

import React from 'react';
import styles from './TelemetryBadge.module.css';

export interface TelemetryBadgeProps {
  status: 'LIVE' | 'SYNCED' | 'STATIC' | 'live' | 'synced' | 'static' | undefined;
  syncDate?: string;
  label?: string;
}

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({ status, syncDate, label }) => {
  if (!status) return null;

  // Normalize to uppercase for strict standard compliance
  const normalizedStatus = status.toUpperCase() as 'LIVE' | 'SYNCED' | 'STATIC';
  const isLive = normalizedStatus === 'LIVE';
  const isSynced = normalizedStatus === 'SYNCED';

  // 색은 전부 CSS 모듈로 — [data-v3='light'] 스코프가 라이트 대비값으로 재정의한다
  // (V2.5까지의 인라인 다크 pill이 라이트 배경에서 흐릿하던 문제, 2026-08-15 사용자 지적).
  return (
    <div
      data-telemetry-status={normalizedStatus}
      data-telemetry-tone={isLive ? 'accent' : 'neutral'}
      className={styles.badge}
    >
      {(isLive || isSynced) && (
        <div className={styles.dotWrap}>
          {isLive && <div className={styles.pulse} />}
          <div className={styles.dot} />
        </div>
      )}
      <span className={styles.label}>
        {label ?? normalizedStatus}
      </span>
      {!isLive && syncDate && (
        <span className={styles.date}>
          {syncDate}
        </span>
      )}
    </div>
  );
};

export default TelemetryBadge;
