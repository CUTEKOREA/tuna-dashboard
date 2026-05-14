// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCcw, DollarSign, Ship, Activity, BarChart2 } from 'lucide-react';

// ============================================================================
// Module A: 실시간 연어 무역 인텔리전스 티커
// 데이터 소스: ECOS(환율) + FRED(금리) + KCS(수입실적) + KAMIS(소매가)
// 근거: 「수산물 무역 단기 전망모형」(한기욱, 2024)
// ============================================================================

interface TickerItem {
  label: string;
  value: string;
  change?: string;
  changeDirection?: 'up' | 'down' | 'flat';
  icon: any;
  source: string;
  color: string;
}

export default function SalmonLiveTicker() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 300000); // 5분 갱신
    return () => clearInterval(interval);
  }, []);

  async function fetchAllData() {
    setLoading(true);
    const items: TickerItem[] = [];
    const srcSet = new Set<string>();

    // 1) ECOS 환율 (NOK — 노르웨이 크로네)
    try {
      const res = await fetch('/api/macro-environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: '노르웨이' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.exchangeRate?.currentRate) {
          const trend = data.exchangeRate.trend || [];
          const prev = trend.length > 1 ? trend[trend.length - 2]?.rate : null;
          const pctChange = prev ? ((data.exchangeRate.currentRate - prev) / prev * 100).toFixed(2) : null;
          items.push({
            label: 'NOK/KRW',
            value: `₩${data.exchangeRate.currentRate.toFixed(1)}`,
            change: pctChange ? `${parseFloat(pctChange) >= 0 ? '+' : ''}${pctChange}%` : undefined,
            changeDirection: pctChange ? (parseFloat(pctChange) >= 0 ? 'up' : 'down') : 'flat',
            icon: DollarSign,
            source: 'ECOS',
            color: '#3b82f6',
          });
          srcSet.add('ECOS');
        }
        // Fed Rate
        if (data.fedRate?.latest?.value) {
          items.push({
            label: 'Fed Rate',
            value: `${data.fedRate.latest.value.toFixed(2)}%`,
            change: undefined,
            changeDirection: 'flat',
            icon: Activity,
            source: 'FRED',
            color: '#8b5cf6',
          });
          srcSet.add('FRED');
        }
      }
    } catch (e) { console.warn('[Ticker] ECOS error:', e); }

    // 2) KCS 수입 실적
    try {
      const res = await fetch('/api/salmon/kcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'timeseries' }),
      });
      if (res.ok) {
        const data = await res.json();
        const ts = data.data;
        if (Array.isArray(ts) && ts.length > 0) {
          const latest = ts[ts.length - 1];
          const prev = ts.length > 1 ? ts[ts.length - 2] : null;
          const qtyChange = prev ? ((latest.qty_tonnes - prev.qty_tonnes) / prev.qty_tonnes * 100).toFixed(1) : null;
          items.push({
            label: `KCS 수입 (${latest.year})`,
            value: `${(latest.qty_tonnes / 1000).toFixed(0)}K MT`,
            change: qtyChange ? `${parseFloat(qtyChange) >= 0 ? '+' : ''}${qtyChange}%` : undefined,
            changeDirection: qtyChange ? (parseFloat(qtyChange) >= 0 ? 'up' : 'down') : 'flat',
            icon: Ship,
            source: data.status === 'live' ? 'KCS_LIVE' : 'KCS_CACHE',
            color: '#10b981',
          });
          items.push({
            label: `단가 (${latest.year})`,
            value: `$${(latest.unit_price / 1000).toFixed(2)}/kg`,
            change: undefined,
            changeDirection: 'flat',
            icon: BarChart2,
            source: 'KCS',
            color: '#f59e0b',
          });
          srcSet.add(data.status === 'live' ? 'KCS_LIVE' : 'KCS_CACHE');
        }
      }
    } catch (e) { console.warn('[Ticker] KCS error:', e); }

    // 3) KAMIS 소매가격
    try {
      const res = await fetch('/api/salmon/kamis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemCode: '연어' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.price) {
          items.push({
            label: 'KAMIS 소매가',
            value: `₩${parseInt(data.data.price).toLocaleString()}/kg`,
            change: data.data.changeRate ? `${data.data.changeRate}` : undefined,
            changeDirection: data.data.changeRate?.includes('-') ? 'down' : 'up',
            icon: TrendingUp,
            source: data.status === 'live' ? 'KAMIS_LIVE' : 'KAMIS_CACHE',
            color: '#ec4899',
          });
          srcSet.add('KAMIS');
        }
      }
    } catch (e) { console.warn('[Ticker] KAMIS error:', e); }

    // Fallback if no data loaded
    if (items.length === 0) {
      items.push(
        { label: 'NOK/KRW', value: '₩154.2', change: '+0.3%', changeDirection: 'up', icon: DollarSign, source: 'OFFLINE', color: '#3b82f6' },
        { label: 'Fed Rate', value: '5.33%', icon: Activity, source: 'OFFLINE', color: '#8b5cf6', changeDirection: 'flat' },
        { label: 'KCS 수입 (2023)', value: '74K MT', change: '-2.6%', changeDirection: 'down', icon: Ship, source: 'OFFLINE', color: '#10b981' },
        { label: '단가 (2023)', value: '$6.89/kg', icon: BarChart2, source: 'OFFLINE', color: '#f59e0b', changeDirection: 'flat' },
      );
    }

    setTickers(items);
    setSources(Array.from(srcSet));
    setLastUpdate(new Date().toLocaleTimeString('ko-KR'));
    setLoading(false);
  }

  return (
    <div style={{
      marginBottom: '2rem',
      background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,15,50,0.9))',
      border: '1px solid rgba(236, 72, 153, 0.2)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(236, 72, 153, 0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} color="#ec4899" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ec4899' }}>실시간 연어 무역 인텔리전스</span>
          <span style={{ fontSize: '0.65rem', color: '#64748b', background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>
            Module A
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {sources.map(s => (
            <span key={s} style={{
              fontSize: '0.6rem', padding: '1px 5px', borderRadius: '3px',
              background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600,
            }}>🟢 {s}</span>
          ))}
          <button onClick={fetchAllData} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: loading ? '#ec4899' : '#64748b',
          }}>
            <RefreshCcw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <span style={{ fontSize: '0.65rem', color: '#475569' }}>{lastUpdate}</span>
        </div>
      </div>

      {/* Ticker Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${tickers.length || 4}, 1fr)`,
        gap: '0',
      }}>
        {tickers.map((t, i) => {
          const IconComp = t.icon;
          return (
            <div key={i} style={{
              padding: '1rem 1.25rem',
              borderRight: i < tickers.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              transition: 'background 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <IconComp size={13} color={t.color} />
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{t.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>{t.value}</span>
                {t.change && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    color: t.changeDirection === 'up' ? '#ef4444' : '#10b981',
                    display: 'flex', alignItems: 'center', gap: '2px',
                  }}>
                    {t.changeDirection === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {t.change}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '4px' }}>
                {t.source}
              </div>
            </div>
          );
        })}
      </div>

      {/* Research Citation */}
      <div style={{
        padding: '0.5rem 1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        fontSize: '0.6rem', color: '#475569', fontStyle: 'italic',
      }}>
        📚 근거: 「수산물 무역(수출입) 단기 전망모형 구축 연구」(한기욱, KMI 2024) — 환율·금리 변수가 수산물 수입단가에 미치는 탄력성 모형
      </div>
    </div>
  );
}
