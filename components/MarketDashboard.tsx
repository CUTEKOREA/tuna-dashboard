'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, Ship, Anchor, AlertTriangle, BarChart2,
  Newspaper, Globe, Activity, Search
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

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

                <Line yAxisId="left" type="monotone" dataKey="skj_bkk" name="SKJ 방콕" stroke="url(#mktGradSkj)" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#38bdf8', strokeWidth: 0, style: { filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.85))' } }} connectNulls={true} />
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
          Atuna 주간 다이제스트: 6월 2주차 시장을 뒤흔드는 핵심 시그널
        </h3>
        <div data-mobile-stack className="mkt-news-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {/* News 1 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', '--news-glow': 'rgba(239, 68, 68, 0.30)', '--news-glow-border': 'rgba(239, 68, 68, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(248, 113, 113, 0.08))', border: '1px solid rgba(239, 68, 68, 0.30)', color: '#ef4444', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                공급망 / 재난
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.09</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              &quot;필리핀 7.8 규모 강진…젠산(GenSan) 참치 가공 허브 전면 가동 중단&quot;
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
              6월 8일 필리핀 남부를 강타한 규모 7.8 지진으로 35명 사망, 200명 이상 부상하며 국가 주요 참치 가공 거점인 제너럴 산토스(GenSan) 시가 심각한 피해를 입었습니다. Century Pacific(General Tuna Corp.) 공장은 최소 1주간 가동 중단에 들어갔으며, Alliance Select Foods는 6월 16일 이후 재가동을 예고했습니다. 1분기 어획량이 3년 내 최저(99,828톤, -7% YoY)인 상황에서 가공 시설까지 마비되어 EU·미국향 참치캔 및 프리쿡 로인 공급에 심각한 차질이 예상됩니다.
            </p>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', '--news-glow': 'rgba(245, 158, 11, 0.30)', '--news-glow-border': 'rgba(245, 158, 11, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(251, 191, 36, 0.08))', border: '1px solid rgba(245, 158, 11, 0.30)', color: '#f59e0b', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                무역 / 관세
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.04</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              &quot;미국 USTR, 60개국 대상 강제노동 관련 추가 관세(Section 301) 제안…참치 공급국 직격탄&quot;
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
              미국 무역대표부(USTR)가 강제노동 제품 수입 규제 미비 60개국에 대해 Section 301(b) 추가 관세(10~12.5%)를 제안했습니다. 태국·베트남(10%), 인도네시아·멕시코·에콰도르·EU(12.5%) 등 주요 참치 수출국이 모두 포함되었으며, 7월 공청회 후 최종 결정됩니다. 기존 호혜관세(12.5%) 위에 추가되는 이중 부담으로 미국 참치 수입가가 급등할 전망이며, 2025년 미국 참치캔 수입 155,992톤·파우치 48,837톤의 공급망 구조가 크게 흔들릴 수 있습니다.
            </p>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', '--news-glow': 'rgba(56, 189, 248, 0.30)', '--news-glow-border': 'rgba(56, 189, 248, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(125, 211, 252, 0.08))', border: '1px solid rgba(56, 189, 248, 0.30)', color: '#38bdf8', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                시장 / 수입
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.08</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              &quot;영국 참치캔 수입 5년 최고치 108,655톤…6/21 관세 철폐로 태국·중국산 대유입 임박&quot;
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
              Seafish 보고서에 따르면 2025년 영국 참치캔 수입이 108,655톤(GBP 4.47억)으로 5년 내 최고치를 기록했습니다. 6월 21일부터 시행되는 관세 철폐(기존 24%)로 태국산(작년 23% 증가, 6,810톤)과 중국산(23% 증가, 5,361톤)의 대거 유입이 예상됩니다. 에콰도르(32,991톤, 19% 증가), 몰디브(P&L, 23% 증가) 등 기존 무관세 협정국과의 가격 경쟁이 극심해질 전망이며, 스페인·이탈리아 프리미엄 제품(톤당 GBP 7,388~GBP 8,126)은 가격 열위로 시장 축소가 불가피합니다.
            </p>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', '--news-glow': 'rgba(16, 185, 129, 0.30)', '--news-glow-border': 'rgba(16, 185, 129, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(52, 211, 153, 0.08))', border: '1px solid rgba(16, 185, 129, 0.30)', color: '#10b981', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                규제 / ESG
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.06.08</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              &quot;OPAGAC, EPO dFAD 회수 재단 출범…IATTC SAC 논의 본격화&quot;
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
              스페인 선망선단(OPAGAC) 주도로 EPO 최초의 민간 자금 dFAD 회수 재단 &apos;Ocean FAD Recovery Foundation&apos;이 출범했습니다. 스페인·에콰도르·파나마·미국 108척 선단이 참여하며 EPO 선망 선단의 약 1/5을 커버합니다. 한편 IATTC SAC 회의(6/8~12)에서 2025년 EPO 총 어획량 994,851톤(가다랑 471,708톤, 전년 대비 -27%)이 보고되었고, 눈다랑어 자원 상태는 양호하나 불확실성 잔존으로 분석되었습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ROW 4: CORE EXECUTIVE INSIGHTS */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Search size={20} color="#818cf8" />
          전략 인사이트: 필리핀 지진 충격 & 글로벌 관세 연쇄 파장
        </h3>
        <div data-mobile-stack className="mkt-insights" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          <WidgetCard
            title="필리핀 지진 공급망 마비 & 연료비 고공행진의 이중 악재"
            icon={Search}
            iconColor="#818cf8"
            pillar="S2"
            cardDesc="젠산 참치 가공 허브 전면 중단 + 번커유 고가 지속으로 글로벌 참치 원료 수급 비상"
            telemetry={{ status: 'STATIC', syncDate: '2026.06.09 (Atuna)' }}
            customBody={<></>}
            takeaway={{
              situation: "6월 8일 필리핀 남부 7.8 규모 강진으로 제너럴 산토스(GenSan) 소재 Century Pacific·Alliance Select 등 주요 참치 가공 공장이 최소 1~2주 가동 중단에 돌입했습니다. 이미 필리핀 1분기 어획량이 99,828톤으로 3년 최저(YoY -7%)를 기록한 가운데, 국가 조업 선대의 60%만 출어 중인 상황에서 가공 시설까지 마비되며 EU·미국향 참치캔 및 프리쿡 로인 공급이 4~6주간 크게 위축될 전망입니다. 한편 싱가포르 MGO 번커유는 $1,061/톤(1년 전 $605 대비 +75%)으로 고공행진하며 WCPO 선망 운영 마진을 극도로 압박하고 있습니다.",
              actionPlan: "**[Actionable Insight]** \n(1) **[대체 소싱 즉시 가동]**: 필리핀 공급 공백이 최소 4~6주 지속될 것이므로, 태국(방콕 허브)·인도네시아(비악섬 부활 움직임)·에콰도르(만타) 가공 공장과의 긴급 스팟 계약으로 프리쿡 로인 및 캔 물량을 확보해야 합니다. \n(2) **[연료비 헤지 전략 재검토]**: 중동 분쟁(호르무즈 해협 제한)에 따른 유가 고공행진이 장기화됨에 따라, 조업 연료비를 선물 계약(Fuel Forward Contract)으로 고정하고, SKJ1.8:BKK $1,850/톤 수준의 어가 대비 수지분석을 재실행해야 합니다. \n(3) **[필리핀 복구 모니터링]**: Alliance Select 6/16 재가동 예정, Century Pacific 피해 조사 1주간 진행 — 필리핀 건축안전당국(Building Official) 승인 일정을 추적하고 복구 후 조기 물량 확보 계약을 준비해야 합니다.",
              source: 'Atuna 2026.06.09 (GenSan Earthquake) & 2026.06.01 (Global Bunker Rates)',
            }}
          />

          <WidgetCard
            title="미국 301조 추가관세 & 영국 관세 철폐의 글로벌 무역 연쇄 파장"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S3"
            cardDesc="미국 강제노동 관세 60개국 타깃 + 영국 수입 구조 재편으로 글로벌 참치 무역 지도 대변동"
            telemetry={{ status: 'STATIC', syncDate: '2026.06.08 (Atuna)' }}
            customBody={<></>}
            takeaway={{
              situation: "미국 USTR이 60개국 대상 Section 301(b) 강제노동 추가관세(10~12.5%)를 제안하며 태국·베트남·인도네시아·에콰도르·EU 등 주요 참치 수출국이 모두 사정권에 들었습니다. 기존 12.5% 호혜관세 위에 중첩되면 미국 수입가가 22.5~25%까지 상승할 수 있습니다. 동시에 영국은 6월 21일부터 모든 참치 제품 관세를 2년간 면제하면서 태국(기존 24% 관세 부담)·중국산의 대량 유입을 촉발시킵니다. 2025년 영국 참치 수입 108,655톤 역대 최고치 속에 에콰도르·몰디브·가나 등 전통 무관세 협정국의 가격 경쟁력이 급락합니다.",
              actionPlan: "**[Actionable Insight]** \n(1) **[미국향 수출 비용 시나리오 분석]**: 301조 추가관세 확정 시 태국산 참치캔 미국 CIF가 22.5% 관세 부담 -> 수출단가 경쟁력 재계산 필요. 7월 공청회 결과 전까지 미국향 대량 선적을 앞당기는 '관세 회피 선적(Front-loading)' 전략을 검토해야 합니다. \n(2) **[영국 시장 포지셔닝 재정립]**: 영국 관세 장벽 해제 후 태국·중국 저가 물량이 쏟아지므로, 프리미엄 MSC 인증·폴앤라인(P&L) 차별화 소싱으로 Whole Foods·M&S·Waitrose 등 프리미엄 채널 공략을 강화하고, 범용 캔 시장에서는 태국 OEM 전환을 가속화해야 합니다. \n(3) **[무역 정책 리스크 모니터링 강화]**: 미국 301조 7/6 의견 마감, 7월 청문회 -> 연내 확정 트랙. EU-멕시코 FTA(참치캔 7년 후 무관세) 진행. 이 두 축의 정책 일정을 주간 단위로 추적해 소싱 전략에 선제 반영해야 합니다.",
              source: 'Atuna 2026.06.04 (US USTR Section 301 Proposal) & 2026.06.08 (UK Tuna Imports Seafish Report)',
            }}
          />
          <WidgetCard
            title="미국 보호구역(MPA) 조업 규제 제한 입법화 & EPO dFAD 무단 유실에 따른 ESG 리스크"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S5"
            cardDesc="대통령 독점적 상업 조업 금지 제한 법안 발의 및 동태평양 dFAD 월경·유실 환경 규제 압박"
            telemetry={{ status: 'STATIC', syncDate: '2026.06.05 (Atuna)' }}
            customBody={<></>}
            takeaway={{
              situation: "미국 의회에서 대통령의 독점적 Antiquities Act를 통한 MPA 조업 차단 권한을 제한하고 Magnuson-Stevens법 아래 수산 관리를 통일하자는 입법 청문회가 열렸습니다. 미국 선단 축소(34척에서 15척)를 타개하기 위함입니다. 한편, 동태평양(EPO)에서 투하된 dFAD의 84.2%가 회수되지 못하고 서태평양(WCPO)으로 유실·월경하고 있어, 수산기구(WCPFC/IATTC)의 공동 환경 규제 및 dFAD 추적·회수 책임 의무화가 임박했습니다.",
              actionPlan: "**[Actionable Insight]** \n(1) **[미국 선단과의 파트너십 구축]**: 미국 몬뉴먼트 보호구역(Jarvis/Wake 섬 등 50~200해리) 내 조업 복원 추진 흐름에 맞춰, 미국 국적 선단과의 장기 공급계약을 선제적으로 맺어 미 서부 해역 원어 소싱 우위를 노려야 합니다. \n(2) **[dFAD 환경 컴플라이언스 선제 정비]**: dFAD 무단 유실과 월경에 대한 국제적 감시망이 타이트해지므로, 생분해성 소재 FAD(Bio-FAD) 전환을 가속화하고 위성 추적장치의 실시간 관측 데이터를 IATTC 규정에 매칭하도록 ESG 리스크를 예방 점검해야 합니다.",
              source: 'Atuna 2026.06.05 (US Congress MPA Bill & IATTC FAD WG Report)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
