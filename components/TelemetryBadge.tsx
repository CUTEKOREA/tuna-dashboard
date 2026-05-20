'use client';

import React from 'react';

export interface TelemetryBadgeProps {
  status: 'LIVE' | 'SYNCED' | 'STATIC' | 'live' | 'synced' | 'static' | undefined;
  syncDate?: string;
}

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({ status, syncDate }) => {
  if (!status) return null;
  
  // Normalize to uppercase for strict standard compliance
  const normalizedStatus = status.toUpperCase() as 'LIVE' | 'SYNCED' | 'STATIC';
  const isLive = normalizedStatus === 'LIVE';
  const isSynced = normalizedStatus === 'SYNCED';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ position: 'relative', width: '6px', height: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isLive && (
          <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#10b981', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
        )}
        <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: isLive ? '#10b981' : isSynced ? '#3b82f6' : '#64748B' }} />
      </div>
      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isLive ? '#10b981' : isSynced ? '#3b82f6' : '#64748B', letterSpacing: '0.5px' }}>
        {normalizedStatus}
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
