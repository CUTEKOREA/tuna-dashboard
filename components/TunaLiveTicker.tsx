'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, Wifi, WifiOff } from 'lucide-react';

interface TickerItem {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendColor: string;
  source: string;
  isLive: boolean;
}

interface TickerMeta {
  lastUpdated: string;
  liveApis: number;
  totalApis: number;
  status: string;
}

const TunaLiveTicker = React.memo(function TunaLiveTicker() {
  const [ticker, setTicker] = useState<TickerItem[]>([]);
  const [meta, setMeta] = useState<TickerMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(300);

  const fetchTicker = useCallback(async () => {
    try {
      const res = await fetch('/api/tuna/ticker');
      if (!res.ok) throw new Error('Ticker fetch failed');
      const json = await res.json();
      setTicker(json.ticker || []);
      setMeta(json.meta || null);
      setCountdown(300);
    } catch (err) {
      console.error('Ticker error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTicker();
    const interval = setInterval(fetchTicker, 300_000); // 5분 자동 갱신
    return () => clearInterval(interval);
  }, [fetchTicker]);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const liveCount = ticker.filter(t => t.isLive).length;
  const isFullyLive = liveCount >= 4;

  return (
    <div style={{
      marginBottom: '2rem',
      background: '#11182f',
      border: 'none',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
    }}>
      {/* Ticker Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.8rem 1.2rem',
        borderBottom: '1px solid rgba(140,170,255,0.10)',
        background: isFullyLive 
          ? 'linear-gradient(90deg, rgba(252,213,53,0.08) 0%, rgba(14,203,129,0.08) 100%)'
          : 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: isFullyLive ? '#0ECB81' : ticker.length > 0 ? '#F0B90B' : '#64748b',
            boxShadow: isFullyLive ? '0 0 8px #0ECB81' : ticker.length > 0 ? '0 0 8px #F0B90B' : 'none',
            animation: ticker.length > 0 ? 'pulse 2s infinite' : 'none',
          }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
            실시간 인텔리전스 티커
          </span>
          <span style={{
            fontSize: '0.65rem', fontWeight: 600,
            background: isFullyLive ? 'rgba(14,203,129,0.15)' : ticker.length > 0 ? 'rgba(240,185,11,0.15)' : 'rgba(100,116,139,0.15)',
            color: isFullyLive ? '#0ECB81' : ticker.length > 0 ? '#F0B90B' : '#64748b',
            padding: '2px 8px', borderRadius: '500px',
            border: `1px solid ${isFullyLive ? '#0ECB81' : ticker.length > 0 ? '#F0B90B' : '#64748b'}`,
          }}>
            {ticker.length === 0
              ? 'STATIC'
              : liveCount > 0
                ? `${liveCount}/${ticker.length} LIVE`
                : `${ticker.length} SYNCED`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Next refresh: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
          </span>
          <button
            onClick={() => { setLoading(true); fetchTicker(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#FCD535'; e.currentTarget.style.background = 'rgba(252,213,53,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
          >
            <RefreshCcw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            새로고침
          </button>
        </div>
      </div>

      {/* Ticker Items */}
      <div data-mobile-stack style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0',
      }}>
        {ticker.map((item, idx) => (
          <div
            key={item.id}
            style={{
              padding: '0.9rem 1rem',
              borderRight: idx < ticker.length - 1 ? '1px solid rgba(140,170,255,0.10)' : 'none',
              transition: 'all 0.2s',
              cursor: 'default',
              position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {/* Live indicator dot */}
            {item.isLive && (
              <div style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#0ECB81',
                boxShadow: '0 0 4px #0ECB81',
              }} />
            )}
            
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '3px' }}>
              {item.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 600,
                color: item.trendColor,
                background: `${item.trendColor}15`,
                padding: '1px 5px', borderRadius: '3px',
              }}>
                {item.trend}
              </span>
              <span style={{ fontSize: '0.58rem', color: '#4a5568' }}>
                {item.isLive ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <Wifi size={8} color="#0ECB81" /> 실시간
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <WifiOff size={8} color="#64748b" /> 캐시됨
                  </span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Source Attribution Bar */}
      {meta && (
        <div style={{
          padding: '0.4rem 1.2rem',
          borderTop: '1px solid rgba(140,170,255,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.6rem', color: '#4a5568',
        }}>
          <span>Sources: KCS (Import/Export) · ECOS · FRED · Yahoo Finance</span>
          <span>Updated: {new Date(meta.lastUpdated).toLocaleTimeString('ko-KR')}</span>
        </div>
      )}
    </div>
  );
});

export default TunaLiveTicker;
