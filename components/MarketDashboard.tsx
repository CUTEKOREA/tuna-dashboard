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
          box-shadow: 0 12px 32px -12px rgba(20, 28, 52, 0.18);
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1a2442', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)' }}
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1a2442', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)' }}
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
          Atuna 주간 다이제스트: 6월 4주차 시장을 뒤흔드는 핵심 시그널
        </h3>
        <div data-mobile-stack className="mkt-news-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {/* News 1 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(56, 189, 248, 0.30)', '--news-glow-border': 'rgba(56, 189, 248, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(125, 211, 252, 0.08))', border: '1px solid rgba(56, 189, 248, 0.30)', color: '#38bdf8', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                가격 / 시장
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.24</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              방콕 가다랑어 원어가 하락세 전환
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>지정학적 긴장 완화와 유가 급락으로 방콕 가다랑어(SKJ 1.8kg Up) 가격이 <strong style={{ color: 'var(--text-main)' }}>톤당 1,775달러</strong>로 하락 조정되며 가공업계의 원가 압박 완화.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>싱가포르 MGO 가격 톤당 926달러로 폭락 및 호르무즈 해협 선박 통행 부분 재개 반영.</span>
              </div>
            </div>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(239, 68, 68, 0.30)', '--news-glow-border': 'rgba(239, 68, 68, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(248, 113, 113, 0.08))', border: '1px solid rgba(239, 68, 68, 0.30)', color: '#ef4444', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                환경 / 조업
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.30</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              '2026 슈퍼 엘니뇨' 공식화와 조업 지형 교란
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>미국 NOAA와 세계기상기구(WMO)가 역대급 <strong style={{ color: 'var(--text-main)' }}>'슈퍼 엘니뇨' 도래</strong>를 선언.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>어군이 중태평양으로 대거 이동함에 따라, 동태평양(EPO)과 서중태평양(WCPO) 연안 선단의 심각한 수급 불균형 우려 고조.</span>
              </div>
            </div>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(245, 158, 11, 0.30)', '--news-glow-border': 'rgba(245, 158, 11, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(251, 191, 36, 0.08))', border: '1px solid rgba(245, 158, 11, 0.30)', color: '#f59e0b', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                무역 / 관세
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.30</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              영국 무관세 여파로 에콰도르 수출 타격 우려
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>영국의 전 Origins 대상 참치 관세 유예 조치로 독점적 무관세 혜택을 잃은 <strong style={{ color: 'var(--text-main)' }}>에콰도르의 하반기 참치 수출액이 5% 이상 감소</strong>할 것으로 예측.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>저가 강점을 지닌 태국·중국과의 치열한 영국 시장 점유율 경쟁 예고.</span>
              </div>
            </div>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(16, 185, 129, 0.30)', '--news-glow-border': 'rgba(16, 185, 129, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(52, 211, 153, 0.08))', border: '1px solid rgba(16, 185, 129, 0.30)', color: '#10b981', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                규제 / 유통
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.24</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              EU 규제 장벽 강화에 따른 아시아 선단의 시장 이탈
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>EU CATCH(디지털 이력 추적) 및 -18°C 초저온 브라인 냉동 규제 준수 부담 가중.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>인도네시아와 베트남 등 동남아 중소 선사들이 규제가 덜한 <strong style={{ color: 'var(--text-main)' }}>중동과 아시아 시장으로 공급망을 대거 우회</strong>하기 시작.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 4: CORE EXECUTIVE INSIGHTS */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Search size={20} color="#818cf8" />
          전략 인사이트: 슈퍼 엘니뇨·무역 장벽 개편·EU 환경 규제의 연쇄 파장
        </h3>
        <div data-mobile-stack className="mkt-insights" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          <WidgetCard
            title="슈퍼 엘니뇨 공식화와 유가 급락이 만든 어가 하락 조정·조업 전략 분기점"
            icon={Search}
            iconColor="#818cf8"
            pillar="S2"
            cardDesc="유가 $926/톤 급락 + SKJ Bangkok $1,775 조정 + 2026 슈퍼 엘니뇨 → 조업 비용 절감 vs 어군 이동 리스크 공존"
            telemetry={{ status: 'STATIC', syncDate: '2026.06.30 (Atuna via NotebookLM)' }}
            customBody={<></>}
            takeaway={{
              situation: "싱가포르 MGO 유가가 926달러/톤으로 폭락하며 방콕 SKJ 가격이 1,775달러로 하락 조정 중입니다. 반면, 미국 NOAA가 2026 슈퍼 엘니뇨를 공식 선언함에 따라 가다랑어 어군이 중태평양으로 이동할 전망이며, 동태평양 및 서중태평양 연안 조업선들의 수급 불균형과 조업 비용 증가 리스크가 공존하고 있습니다.",
              actionPlan: "**[Actionable Insight]** \n(1) **[MGO 급락 시점 집중 조업]**: 유가 하락 시기를 활용해 방콕 양륙 비중을 높이고 원가 절감을 극대화합니다. \n(2) **[엘니뇨 대비 어장 이동]**: 중태평양(키리바시 등) 조업 비중을 선제적으로 늘리고, 하반기 VDS(입어일수)를 효율적으로 배분합니다.",
              source: 'Atuna 2026.06.24, 2026.06.30 (NotebookLM 종합 분석)',
            }}
          />

          <WidgetCard
            title="글로벌 무역 장벽 재편과 EU 규제 강화에 따른 공급망 다변화 전략"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S3"
            cardDesc="영국 무관세 여파(에콰도르 타격) + EU CATCH·-18°C 브라인 동결 규제 장벽 → 글로벌 참치 공급망 지형 변동"
            telemetry={{ status: 'STATIC', syncDate: '2026.06.30 (Atuna via NotebookLM)' }}
            customBody={<></>}
            takeaway={{
              situation: "영국이 모든 수입국 대상 참치 관세를 유예함에 따라 기존 무관세 혜택을 누리던 에콰도르의 수출 타격이 가시화되었으며, 태국 및 중국과의 영국 시장 점유율 경쟁이 치열해질 전망입니다. 유럽에서는 EU CATCH 통관제와 -18°C 브라인 동결 규제 등 진입 장벽이 높아져, 인도네시아 등 동남아 선단이 중동 및 아시아로 시장을 우회하고 있습니다.",
              actionPlan: "**[Actionable Insight]** \n(1) **[영국 시장 점유율 확보 기회]**: 에콰도르의 점유율 하락을 틈타, 자사 선단의 가격 경쟁력을 앞세운 영국 대형 리테일러향 납품 물량 확대를 추진합니다. \n(2) **[EU 프리미엄 시장 선점]**: 아시아 중소 선단들의 이탈로 발생한 EU 공급 공백을 공략하기 위해, 선단 내 -18°C 콜드체인 모니터링 시스템을 조기 도입하여 엄격한 EU 규제를 선제 충족합니다.",
              source: 'Atuna 2026.06.24, 2026.06.30 (NotebookLM 종합 분석)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
