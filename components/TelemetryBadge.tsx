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

  // Visual identity per status (status semantics/text/syncDate logic unchanged):
  // LIVE = cyan pulse dot / SYNCED = amber static dot / STATIC = slate, no dot
  const accent = isLive ? '#22d3ee' : isSynced ? '#f59e0b' : '#94a3b8';
  const borderTint = isLive
    ? 'rgba(34, 211, 238, 0.25)'
    : isSynced
      ? 'rgba(245, 158, 11, 0.22)'
      : 'rgba(148, 163, 184, 0.16)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(20, 28, 52, 0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '2px 7px', borderRadius: '5px', border: `1px solid ${borderTint}` }}>
      {(isLive || isSynced) && (
        <div style={{ position: 'relative', width: '6px', height: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLive && <div className={styles.pulse} />}
          <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: accent, boxShadow: isLive ? '0 0 6px rgba(34, 211, 238, 0.6)' : 'none' }} />
        </div>
      )}
      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: accent, letterSpacing: '0.5px' }}>
        {label ?? normalizedStatus}
      </span>
      {!isLive && syncDate && (
        <span style={{ fontSize: '0.56rem', fontWeight: 500, color: '#64748B', marginLeft: '2px', whiteSpace: 'nowrap' }}>
          {syncDate}
        </span>
      )}
    </div>
  );
};

export default TelemetryBadge;
