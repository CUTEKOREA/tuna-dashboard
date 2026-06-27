'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, Ship, Anchor, BarChart2,
  Newspaper, Globe, Activity, Search
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import WidgetCard from './WidgetCard';
import SeafoodStockWidget from './SeafoodStockWidget';

// 페이월 데이터 보호: atuna_prices.json 정적 import 금지(클라이언트 번들 노출) —
// 인증 게이팅된 /api/atuna-prices 응답(history)만 사용
type AtunaRow = { date: string; [hub: string]: number | string | undefined };

// Latest + previous non-null observation for one hub key
function latestTwo(rows: AtunaRow[], hubKey: string): {
  latest: { price: number; date: string } | null;
  prev: { price: number; date: string } | null;
} {
  const hits = rows
    .filter((r) => typeof r[hubKey] === 'number' && typeof r.date === 'string')
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const toPoint = (r?: AtunaRow) => (r ? { price: r[hubKey] as number, date: r.date } : null);
  return { latest: toPoint(hits[0]), prev: toPoint(hits[1]) };
}

// A-3: Δ% between latest and previous non-null observation (null -> no arrow)
function calcDeltaPct(pair: { latest: { price: number } | null; prev: { price: number } | null }): number | null {
  if (!pair.latest || !pair.prev || pair.prev.price === 0) return null;
  return ((pair.latest.price - pair.prev.price) / pair.prev.price) * 100;
}

const fmtPct = (p: number) => `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`;

export default function MarketDashboard() {
  const [priceData, setPriceData] = useState<any[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  // Measure container width with ResizeObserver (works even after display:none -> block toggle)
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setChartWidth(w);
    };
    
    // Initial measure
    measure();
    
    // Re-measure on resize or when KeepAlivePanel toggles visibility
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    
    return () => ro.disconnect();
  }, []);

  // A-2: no hardcoded price/date — skeleton until fetch resolves
  const [mgoData, setMgoData] = useState<{
    price: number | null; change: number | null; date: string | null; loading: boolean; isEstimate: boolean;
  }>({ price: null, change: null, date: null, loading: true, isEstimate: false });
  const [fxData, setFxData] = useState<{
    usd_krw: number | null; change: number | null; date: string | null; loading: boolean;
  }>({ usd_krw: null, change: null, date: null, loading: true });
  const [atunaLatest, setAtunaLatest] = useState<{
    skjBkk: { price: number; date: string } | null;
    skjDeltaPct: number | null;
    yfSey: { price: number; date: string } | null;
    yfDeltaPct: number | null;
    latestDate: string | null;
  }>({ skjBkk: null, skjDeltaPct: null, yfSey: null, yfDeltaPct: null, latestDate: null });

  // 'today' resolved client-side only (avoids SSR/client hydration mismatch)
  const [todayStr, setTodayStr] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date();
    setTodayStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }, []);

  useEffect(() => {
    // Atuna 참치 도매가 — KPI 1·2 + ROW2 차트 공용 단일 소스 (/api/atuna-prices)
    fetch('/api/atuna-prices')
      .then(res => res.json())
      .then(data => {
        const hist: AtunaRow[] = Array.isArray(data?.history) ? data.history : [];
        if (hist.length === 0) return; // 응답 비정상 시 스켈레톤 유지 (가짜값 금지)
        setPriceData(hist.filter((d) => typeof d.date === 'string' && d.date >= '2022-01-01'));
        const skj = latestTwo(hist, 'skj_bkk');
        const yf = latestTwo(hist, 'yf_sey');
        const maxDate = hist.reduce<string | null>(
          (max, r) => (typeof r.date === 'string' && (!max || r.date > max) ? r.date : max),
          null
        );
        setAtunaLatest({
          skjBkk: skj.latest,
          skjDeltaPct: calcDeltaPct(skj),
          yfSey: yf.latest,
          yfDeltaPct: calcDeltaPct(yf),
          latestDate: data?.latestDate || maxDate,
        });
      })
      .catch(() => { /* 스켈레톤 유지 */ });

    // Fetch MGO live data — isLive:false(fallback 캐시)는 미표시 (정직 표기)
    fetch('/api/mgo')
      .then(res => res.json())
      .then(data => {
        if (typeof data?.price === 'number' && data?.isLive !== false) {
          setMgoData({
            price: data.price,
            change: typeof data.change === 'number' ? data.change : null,
            date: data.dataAsOf || data.date || null,
            loading: false,
            isEstimate: data?.isEstimate === true,
          });
        } else {
          setMgoData(prev => ({ ...prev, loading: false }));
        }
      })
      .catch(() => setMgoData(prev => ({ ...prev, loading: false })));

    // Fetch FX live data — isLive:false(fallback)는 미표시 (정직 표기)
    fetch('/api/exchange')
      .then(res => res.json())
      .then(data => {
        if (typeof data?.usd_krw === 'number' && data?.isLive !== false && data?.source !== 'fallback') {
          setFxData({
            usd_krw: data.usd_krw,
            change: typeof data.change === 'number' ? data.change : null,
            date: data.dataAsOf || data.date || null,
            loading: false,
          });
        } else {
          setFxData(prev => ({ ...prev, loading: false }));
        }
      })
      .catch(() => setFxData(prev => ({ ...prev, loading: false })));
  }, []);

  const formatHubDate = (d?: string | null) => (d ? d.replace(/-/g, '.') : '');

  // 데이터 기준일이 오늘로부터 며칠 전인지 (클라이언트 마운트 후에만 계산)
  const staleDaysOf = (date?: string | null): number | null => {
    if (!date || !todayStr) return null;
    const t = Date.parse(date.replace(/\./g, '-'));
    const n = Date.parse(todayStr);
    if (Number.isNaN(t) || Number.isNaN(n)) return null;
    return Math.floor((n - t) / 86400000);
  };

  // A-3: stale 뱃지 — 기준일이 7일 초과 과거면 호박색 'N일 전'
  const renderStaleBadge = (date?: string | null) => {
    const days = staleDaysOf(date);
    if (days === null || days <= 7) return null;
    return (
      <span style={{ padding: '1px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', whiteSpace: 'nowrap' }}>
        {days}일 전
      </span>
    );
  };

  // A-2: '오늘자'는 응답 날짜가 실제 오늘일 때만 — 아니면 'YYYY.MM.DD 기준'
  const apiSyncLabel = (date?: string | null): string => {
    if (!date) return '데이터 미수신';
    const iso = date.replace(/\./g, '-');
    const dots = iso.replace(/-/g, '.');
    return todayStr && iso === todayStr ? `오늘자 API 연동 (${dots})` : `API 연동 (${dots} 기준)`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Seafood Stock Widget at the top of the market page */}
      <SeafoodStockWidget />

      {/* Visual-only scoped styles (no data/logic) — KPI signature top bars, hover glow */}
      <style>{`
        .mkt-kpi { position: relative; overflow: hidden; }
        .mkt-kpi::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: var(--kpi-grad); z-index: 1;
        }
        .mkt-kpi::after {
          content: ''; position: absolute; top: -30px; left: -10%; right: -10%; height: 70px;
          background: var(--kpi-grad); opacity: 0.10; filter: blur(26px); pointer-events: none;
        }
        .mkt-kpi.ds-card:hover {
          border-color: var(--kpi-border, var(--card-hover-border));
          box-shadow: 0 14px 40px -14px var(--kpi-glow), 0 4px 18px rgba(0, 0, 0, 0.35);
        }
        .mkt-news-grid > .ds-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .mkt-news-grid > .ds-card:hover {
          transform: translateY(-3px);
          border-color: var(--news-glow-border, rgba(56, 189, 248, 0.35));
          box-shadow: 0 16px 44px -16px var(--news-glow, rgba(56, 189, 248, 0.30)), 0 4px 18px rgba(0, 0, 0, 0.35);
        }
        .mkt-insights > div {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .mkt-insights > div:hover {
          transform: translateY(-3px);
          border-color: rgba(129, 140, 248, 0.35);
          box-shadow: 0 16px 44px -16px rgba(129, 140, 248, 0.38), 0 4px 18px rgba(0, 0, 0, 0.35);
        }
        [data-theme='light'] .mkt-kpi::after { opacity: 0.07; }
        [data-theme='light'] .mkt-kpi.ds-card:hover,
        [data-theme='light'] .mkt-news-grid > .ds-card:hover,
        [data-theme='light'] .mkt-insights > div:hover {
          box-shadow: 0 12px 32px -12px rgba(15, 23, 42, 0.18);
        }
      `}</style>

      {/* ROW 1: CORE MACRO KPIs */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1 */}
        <div className="ds-card mkt-kpi" style={{ '--kpi-grad': 'linear-gradient(90deg, #22d3ee, #3b82f6)', '--kpi-glow': 'rgba(56, 189, 248, 0.35)', '--kpi-border': 'rgba(56, 189, 248, 0.35)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>SKJ 가다랑어 (방콕)</span>
              {renderStaleBadge(atunaLatest.skjBkk?.date)}
            </span>
            <Ship size={16} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {atunaLatest.skjBkk ? `$${atunaLatest.skjBkk.price.toLocaleString()}` : '—'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          {atunaLatest.skjDeltaPct !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: atunaLatest.skjDeltaPct >= 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
              {atunaLatest.skjDeltaPct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>직전 고시 대비 {fmtPct(atunaLatest.skjDeltaPct)}</span>
            </div>
          )}
          {atunaLatest.skjBkk && (
            <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Atuna 수동동기화 ({formatHubDate(atunaLatest.skjBkk.date)} 기준)
            </div>
          )}
        </div>

        {/* KPI 2 */}
        <div className="ds-card mkt-kpi" style={{ '--kpi-grad': 'linear-gradient(90deg, #6366f1, #8b5cf6)', '--kpi-glow': 'rgba(139, 92, 246, 0.35)', '--kpi-border': 'rgba(139, 92, 246, 0.35)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>YF 황다랑어 (세이셸)</span>
              {renderStaleBadge(atunaLatest.yfSey?.date)}
            </span>
            <Anchor size={16} color="#818cf8" style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {atunaLatest.yfSey ? `$${atunaLatest.yfSey.price.toLocaleString()}` : '—'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          {atunaLatest.yfDeltaPct !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: atunaLatest.yfDeltaPct >= 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
              {atunaLatest.yfDeltaPct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>직전 고시 대비 {fmtPct(atunaLatest.yfDeltaPct)}</span>
            </div>
          )}
          {atunaLatest.yfSey && (
            <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Atuna 수동동기화 ({formatHubDate(atunaLatest.yfSey.date)} 기준)
            </div>
          )}
        </div>

        {/* KPI 3 */}
        <div className="ds-card mkt-kpi" style={{ '--kpi-grad': 'linear-gradient(90deg, #ef4444, #f59e0b)', '--kpi-glow': 'rgba(239, 68, 68, 0.32)', '--kpi-border': 'rgba(239, 68, 68, 0.35)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>싱가포르 MGO 유가{mgoData.isEstimate ? ' (Brent 환산추정)' : ''}</span>
              {renderStaleBadge(mgoData.date)}
            </span>
            <Activity size={16} color="#ef4444" style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {mgoData.price !== null ? `$${mgoData.price.toLocaleString()}` : '—'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          {mgoData.change !== null && mgoData.price !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: mgoData.change >= 0 ? '#ef4444' : 'var(--accent-success)' }}>
              {mgoData.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>전일 대비 {mgoData.change >= 0 ? '+' : '-'}${Math.abs(mgoData.change).toLocaleString()}</span>
            </div>
          )}
          <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {mgoData.loading ? '데이터 수신 대기 중' : apiSyncLabel(mgoData.date)}
          </div>
        </div>

        {/* KPI 4 */}
        <div className="ds-card mkt-kpi" style={{ '--kpi-grad': 'linear-gradient(90deg, #10b981, #14b8a6)', '--kpi-glow': 'rgba(16, 185, 129, 0.32)', '--kpi-border': 'rgba(16, 185, 129, 0.35)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>달러·원 환율</span>
              {renderStaleBadge(fxData.date)}
            </span>
            <Globe size={16} color="#10b981" style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {fxData.usd_krw !== null ? `₩${fxData.usd_krw.toLocaleString()}` : '—'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/$</span>
          </div>
          {fxData.change !== null && fxData.usd_krw !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: fxData.change >= 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
              {fxData.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>전일 대비 {fxData.change >= 0 ? '+' : '-'}₩{Math.abs(fxData.change).toLocaleString()}</span>
            </div>
          )}
          <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {fxData.loading ? '데이터 수신 대기 중' : apiSyncLabel(fxData.date)}
          </div>
        </div>
      </section>

      {/* ROW 2: TUNA PRICE TRENDS BY REGION */}
      <section className="ds-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <BarChart2 size={20} color="#38bdf8" />
          글로벌 참치 어가 추이 (SKJ·YF 지역 스프레드)
          {atunaLatest.latestDate && (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Atuna 수동동기화 ({formatHubDate(atunaLatest.latestDate)} 기준)
            </span>
          )}
        </h3>
        <div ref={chartContainerRef} style={{ width: '100%', minHeight: '350px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          
          {/* LEFT: SKIPJACK (SKJ) */}
          {chartWidth > 0 && priceData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                가다랑어 (SKJ)
              </h4>
              <LineChart width={chartWidth > 900 ? (chartWidth - 24) / 2 : chartWidth} height={350} data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mktGradSkj" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)' }}
                  itemStyle={{ color: '#fff', fontSize: '13px' }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '12px' }}
                />
                <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: '12px', paddingTop: '10px', letterSpacing: '0.01em' }} />

                <Line yAxisId="left" type="monotone" dataKey="skj_bkk" name="SKJ 방콕" stroke="#38bdf8" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#38bdf8', strokeWidth: 0, style: { filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.85))' } }} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_mnt" name="SKJ 만타" stroke="#2dd4bf" strokeWidth={2} dot={false} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_abj" name="SKJ 아비장" stroke="#f472b6" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_sey" name="SKJ 세이셸" stroke="#facc15" strokeWidth={2} dot={false} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_vig" name="SKJ 비고" stroke="#fb923c" strokeWidth={2} dot={false} strokeDasharray="3 3" connectNulls={true} />
              </LineChart>
            </div>
          )}

          {/* RIGHT: YELLOWFIN (YF) */}
          {chartWidth > 0 && priceData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                황다랑어 (YF)
              </h4>
              <LineChart width={chartWidth > 900 ? (chartWidth - 24) / 2 : chartWidth} height={350} data={priceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mktGradYf" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)' }}
                  itemStyle={{ color: '#fff', fontSize: '13px' }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '12px' }}
                />
                <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: '12px', paddingTop: '10px', letterSpacing: '0.01em' }} />

                <Line yAxisId="left" type="monotone" dataKey="yf_abj" name="YF 아비장" stroke="url(#mktGradYf)" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#818cf8', strokeWidth: 0, style: { filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.85))' } }} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="yf_sey" name="YF 세이셸" stroke="#c084fc" strokeWidth={2} dot={false} strokeDasharray="3 3" connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="yf_vig" name="YF 비고" stroke="#a78bfa" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={true} />
              </LineChart>
            </div>
          )}

        </div>
      </section>

      {/* ROW 3: ATUNA NEWS WEEKLY TOP 4 */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Newspaper size={20} color="#f59e0b" />
          Atuna 주간 다이제스트: 6월 3주차 시장을 뒤흔드는 핵심 시그널
        </h3>
        <div data-mobile-stack className="mkt-news-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {/* News 1 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(239, 68, 68, 0.30)', '--news-glow-border': 'rgba(239, 68, 68, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(248, 113, 113, 0.08))', border: '1px solid rgba(239, 68, 68, 0.30)', color: '#ef4444', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                공급망 / 재난
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.09</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              &quot;필리핀 남부 7.8 강진 강타, 참치 가공·교역 허브 GenSan 가공 및 물류망 일시 마비&quot;
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>6/8 <strong style={{ color: 'var(--text-main)' }}>규모 7.8 지진</strong>으로 35명 사망, 200여 명 부상 — 최대 참치 가공 허브 <strong style={{ color: 'var(--text-main)' }}>제너럴산토스(GenSan)</strong> 직격</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span><strong style={{ color: 'var(--text-main)' }}>Alliance Select</strong> 등 대형 공장 가동 중단, <strong style={{ color: 'var(--text-main)' }}>6/16 이후</strong> 재가동 예정. Well Delight·Citra Mina·Mommy Gina 등 밀집 가공단지 피해</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>이미 어획량 <strong style={{ color: 'var(--text-main)' }}>-7% YoY</strong>(3년 최저), 선단 <strong style={{ color: 'var(--text-main)' }}>60%만 출어</strong> 중 → 가공망 마비 겹쳐 EU·미국향 통조림·로인 공급 차질 불가피</span>
              </div>
            </div>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(245, 158, 11, 0.30)', '--news-glow-border': 'rgba(245, 158, 11, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(251, 191, 36, 0.08))', border: '1px solid rgba(245, 158, 11, 0.30)', color: '#f59e0b', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                규제 / 조업
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.12</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              &quot;트럼프, 태평양 해양보호구역(MPA) 미국 상업 참치 조업 전격 재개 허용 서명&quot;
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>6/11 <strong style={{ color: 'var(--text-main)' }}>Rose Atoll</strong> 등 태평양 MPA <strong style={{ color: 'var(--text-main)' }}>수십만 평방마일</strong>을 미국 상업 참치 선단에 재개방하는 행정명령 서명</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span><strong style={{ color: 'var(--text-main)' }}>WPRFMC</strong>가 <strong style={{ color: 'var(--text-main)' }}>2009년</strong> 이후 지속 요구해온 조업 구역 확보 실현 — 아메리칸사모아 기반 연승선·선망선 어획 역량 대폭 강화</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span><strong style={{ color: 'var(--text-main)' }}>WCPO</strong> 동일 해역 한국 선사에 직접적 도전 — 인접 어장 선박 밀집도 변화 및 어군 거동 패턴 영향 예상</span>
              </div>
            </div>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(56, 189, 248, 0.30)', '--news-glow-border': 'rgba(56, 189, 248, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(125, 211, 252, 0.08))', border: '1px solid rgba(56, 189, 248, 0.30)', color: '#38bdf8', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                무역 / 관세
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.12</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              &quot;영국, 전 참치 제품 관세 전면 유예(0%)…6/21 발효, 태국 가공업계 수출 급증 전망&quot;
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span><strong style={{ color: 'var(--text-main)' }}>6/21</strong>부터 <strong style={{ color: 'var(--text-main)' }}>2028년 말</strong>까지 모든 참치 제품(통조림·로인·필렛) 기존 최대 <strong style={{ color: 'var(--text-main)' }}>24% → 0%</strong> 관세 전면 유예</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>세계 최대 가공국 태국의 대영국 수출 폭증 전망 → 방콕 SKJ 원어 <strong style={{ color: 'var(--text-main)' }}>$1,825/톤</strong> 정체기에서 수요 유입·어가 상승 기폭제</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>몰디브 등 기존 무관세 협정국 가격 경쟁력 급락, 중국산(<strong style={{ color: 'var(--text-main)' }}>전년 23%↑</strong>) 대거 진입 예상</span>
              </div>
            </div>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(16, 185, 129, 0.30)', '--news-glow-border': 'rgba(16, 185, 129, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(52, 211, 153, 0.08))', border: '1px solid rgba(16, 185, 129, 0.30)', color: '#10b981', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                규제 / 위생
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.10</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              &quot;피지·키리바시·솔로몬, EU &apos;영하 18℃ 냉동 참치 규제&apos; 준수 합동 기술 교육 개시&quot;
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>피지 수바(Suva)에서 EU <strong style={{ color: 'var(--text-main)' }}>-18°C Brine Freezing</strong> 규제 대응 <strong style={{ color: 'var(--text-main)' }}>2주간</strong> 합동 기술 교육 개시</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>유럽향 냉동 참치 원어 선박에 실시간 brine 온도 기록·전송 의무화 — EU 등재 태평양 선망선 <strong style={{ color: 'var(--text-main)' }}>97%</strong>에 직접 영향</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>교육 범위: 선박 엔지니어링, 냉동 시스템, <strong style={{ color: 'var(--text-main)' }}>HACCP</strong> 및 EU 감사 요건 등 실무 검역 전반</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 4: CORE EXECUTIVE INSIGHTS */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Search size={20} color="#818cf8" />
          전략 인사이트: 영국 관세 철폐·미국 MPA 개방·EU 위생 규제의 연쇄 파장
        </h3>
        <div data-mobile-stack className="mkt-insights" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          <WidgetCard
            title="영국 관세 전면 철폐와 방콕 가다랑어 어가 지지 및 판매망 재편"
            icon={Search}
            iconColor="#818cf8"
            pillar="S2"
            cardDesc="영국 24% 관세 유예 → 태국 가공업계 대영국 수출 급증 → 방콕 SKJ 원어 수요 및 어가 상승 압력"
            telemetry={{ status: 'STATIC', syncDate: '2026.06.12 (Atuna via NotebookLM)' }}
            customBody={<></>}
            takeaway={{
              situation: "영국 정부가 중동 분쟁 인플레이션 대처를 위해 2026년 6월 21일부터 2028년 말까지 가다랑어·황다랑어 통조림, 로인, 필렛 등 모든 참치 제품의 기존 최대 24% 관세를 전면 유예(0%)했습니다. 세계 최대 가공국 태국 방콕 허브의 대영국 수출 물량 폭증이 예상되며, 현재 정체기($1,825/톤)인 방콕 SKJ 원어 가격에 강력한 수요 유입과 상승 압력의 기폭제가 됩니다. 동시에 미·이란 평화 협상 타결 기대감에 싱가포르 MGO가 $1,150/톤 선으로 안정세를 보이며 조업 비용 환경도 개선되고 있습니다.",
              actionPlan: "**[Actionable Insight]** \n(1) **[태국 가공업체 선도 계약 체결]**: 6/21 관세 유예 발효에 맞춰 타이유니온·MMP 등 대영국 수출 주문 급증이 예상되는 태국 대형 가공업체들과 SKJ 1.8kg Up 방콕 양륙 비중을 우선 배정한 유리한 선도 판매 계약을 조기 체결해야 합니다. \n(2) **[영국향 OEM 파트너십 강화]**: 몰디브 등 채낚기 원어 시장이 태국 저가 대량 선망 원어로 대체될 수 있으므로, 태국 내 영국향 OEM 전문 가공 바이어들과의 독점 공급 및 연대를 공고히 구축해야 합니다. \n(3) **[유가 하락 기조 활용 조업 극대화]**: MGO $1,150/톤 안정세를 활용해 조업 비용을 최소화하고, 방콕 어가 상승기와 맞물린 집중 조업으로 마진을 극대화해야 합니다.",
              source: 'Atuna 2026.06.05, 2026.06.08, 2026.06.12 (NotebookLM 종합 분석)',
            }}
          />

          <WidgetCard
            title="미국·EU 중심 어장 및 위생·노동 규제 강화에 따른 전략적 대응"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S3"
            cardDesc="미국 MPA 상업 조업 재개방 + EU -18°C brine 규제 + ILO 선원 노동 실사 → WCPO 다중 규제 대응 임계점"
            telemetry={{ status: 'STATIC', syncDate: '2026.06.12 (Atuna via NotebookLM)' }}
            customBody={<></>}
            takeaway={{
              situation: "미국 백악관이 태평양 MPA(Rose Atoll 등) 수십만 평방마일을 미국 상업 참치 선단에 전격 개방하는 행정명령에 서명하며 WCPO 어장 경쟁이 심화됩니다. EU는 유럽향 냉동 참치에 -18°C brine 동결·실시간 온도 기록 전송을 의무화하는 강력한 비관세 장벽을 가동, EU 등재 태평양 선망선 97%에 직접 영향을 미칩니다. 동시에 ILO 주도로 WCPO 선단 선원 인권 보장·공정 채용 기준(WiFi 설치·송출 프로세스) 요구가 폭증하고 있어 ESG 실사 압박도 거세지고 있습니다.",
              actionPlan: "**[Actionable Insight]** \n(1) **[초저온 Brine 동결 시스템 선제 투자]**: EU 수출용 고부가가치 원어 loins 시장 유지를 위해, 선단 내 염수 동결기를 -18°C 이하 상시 모니터링 가능한 저온 시스템 센서·HACCP 기록 장치로 개조 설계하여 규제 적격 선박 리스트를 신속히 확보해야 합니다. \n(2) **[미국 MPA 개방에 따른 WCPO 조업 밀집도 분산 전략]**: 미국 선망선 Rose Atoll 등 신규 어장 유입으로 인접 EEZ 경쟁 밀도가 변화하므로, 신라 선단의 조업 구역과 VDS 사용 시기를 데이터 기반 유연 재분배로 효율을 높여야 합니다. \n(3) **[국제 선원 노동 기준 조기 도입]**: 위성 Wi-Fi 인프라 구축·채용 투명성 제고로 글로벌 바이어 공급망 실사 기준을 선제 충족, ESG 프리미엄을 확보해야 합니다.",
              source: 'Atuna 2026.06.10, 2026.06.11, 2026.06.12 (NotebookLM 종합 분석)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
