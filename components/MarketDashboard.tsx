'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
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
import {
  type AtunaPriceRow,
  type AtunaSpreadSummary,
  buildAtunaMarketSummaries,
} from '../lib/data/atuna-price-summary';

const fmtPct = (p: number) => `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`;
const subscribeClientSnapshot = () => () => {};
const getTodayIsoSnapshot = (): string | null => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const getServerTodaySnapshot = (): string | null => null;

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
    skj: AtunaSpreadSummary | null;
    yf: AtunaSpreadSummary | null;
    latestDate: string | null;
  }>({ skj: null, yf: null, latestDate: null });

  // 'today' resolved client-side only (avoids SSR/client hydration mismatch)
  const todayStr = useSyncExternalStore(subscribeClientSnapshot, getTodayIsoSnapshot, getServerTodaySnapshot);

  useEffect(() => {
    // Atuna 참치 도매가 — KPI 1·2 + ROW2 차트 공용 단일 소스 (/api/atuna-prices)
    fetch('/api/atuna-prices')
      .then(res => res.json())
      .then(data => {
        const hist: AtunaPriceRow[] = Array.isArray(data?.history) ? data.history : [];
        if (hist.length === 0) return; // 응답 비정상 시 스켈레톤 유지 (가짜값 금지)
        setPriceData(hist.filter((d) => typeof d.date === 'string' && d.date >= '2022-01-01'));
        const summaries = buildAtunaMarketSummaries(hist);
        const maxDate = hist.reduce<string | null>(
          (max, r) => (typeof r.date === 'string' && (!max || r.date > max) ? r.date : max),
          null
        );
        setAtunaLatest({
          skj: summaries.skj,
          yf: summaries.yf,
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
  const formatSpreadRange = (summary?: AtunaSpreadSummary | null) => {
    if (!summary?.spread) return null;
    const { minPrice, maxPrice, minLabel, maxLabel, count } = summary.spread;
    return `${count}개 허브 최신 ${minLabel} $${minPrice.toLocaleString()}~${maxLabel} $${maxPrice.toLocaleString()}`;
  };

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
              <span style={{ fontWeight: 600 }}>SKJ 가다랑어 지역 스프레드</span>
              {renderStaleBadge(atunaLatest.skj?.latest?.date)}
            </span>
            <Ship size={16} color="#38bdf8" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {atunaLatest.skj?.latest ? `$${atunaLatest.skj.latest.price.toLocaleString()}` : '—'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          {atunaLatest.skj?.deltaPct !== null && atunaLatest.skj?.deltaPct !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: atunaLatest.skj.deltaPct >= 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
              {atunaLatest.skj.deltaPct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{atunaLatest.skj.latest?.label} 직전 고시 대비 {fmtPct(atunaLatest.skj.deltaPct)}</span>
            </div>
          )}
          {atunaLatest.skj?.latest && (
            <div style={{ marginTop: '4px', fontSize: '0.75rem', lineHeight: 1.45, color: 'var(--text-muted)' }}>
              Atuna 지역 스프레드 ({formatHubDate(atunaLatest.skj.latest.date)} 기준 · {formatSpreadRange(atunaLatest.skj)})
            </div>
          )}
        </div>

        {/* KPI 2 */}
        <div className="ds-card mkt-kpi" style={{ '--kpi-grad': 'linear-gradient(90deg, #6366f1, #8b5cf6)', '--kpi-glow': 'rgba(139, 92, 246, 0.35)', '--kpi-border': 'rgba(139, 92, 246, 0.35)' } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>YF 황다랑어 지역 스프레드</span>
              {renderStaleBadge(atunaLatest.yf?.latest?.date)}
            </span>
            <Anchor size={16} color="#818cf8" style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {atunaLatest.yf?.latest ? `$${atunaLatest.yf.latest.price.toLocaleString()}` : '—'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          {atunaLatest.yf?.deltaPct !== null && atunaLatest.yf?.deltaPct !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: atunaLatest.yf.deltaPct >= 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
              {atunaLatest.yf.deltaPct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{atunaLatest.yf.latest?.label} 직전 고시 대비 {fmtPct(atunaLatest.yf.deltaPct)}</span>
            </div>
          )}
          {atunaLatest.yf?.latest && (
            <div style={{ marginTop: '4px', fontSize: '0.75rem', lineHeight: 1.45, color: 'var(--text-muted)' }}>
              Atuna 지역 스프레드 ({formatHubDate(atunaLatest.yf.latest.date)} 기준 · {formatSpreadRange(atunaLatest.yf)})
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
          Atuna 주간 다이제스트: 7월 3주차 (7/13~17) 핵심 시그널
        </h3>
        <div data-mobile-stack className="mkt-news-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {/* News 1 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(16, 185, 129, 0.30)', '--news-glow-border': 'rgba(16, 185, 129, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(52, 211, 153, 0.08))', border: '1px solid rgba(16, 185, 129, 0.30)', color: '#10b981', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                원료 / 가격
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.09~16</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              양극화되는 원어가: 방콕 반등 및 만타 초고가 지속
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>하락세를 보이던 <strong style={{ color: 'var(--text-main)' }}>방콕 가다랑어 원어가 $1,790/톤으로 반등</strong>. WCPO 어획 부진과 싱가포르 MGO $1,160/톤 등 연료비 폭등 압박.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>에콰도르 만타 시장은 극심한 수급난 속에 <strong style={{ color: 'var(--text-main)' }}>가다랑어 $2,150/톤 초고가</strong> 기록, 마진 압박 한계치 도달.</span>
              </div>
            </div>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(245, 158, 11, 0.30)', '--news-glow-border': 'rgba(245, 158, 11, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(251, 191, 36, 0.08))', border: '1px solid rgba(245, 158, 11, 0.30)', color: '#f59e0b', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                환경 / 조업
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.15</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              '슈퍼 엘니뇨' 2027년까지 지속 전망... 조업 지형의 구조적 교란
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>기상 당국 <strong style={{ color: 'var(--text-main)' }}>'슈퍼 엘니뇨' 발생 확률 증가 및 2027년 초까지 지속</strong> 경고. 기후 위기가 상시 리스크로 전환.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>동태평양(EPO) 가다랑어 어획량 급감 전망. <strong style={{ color: 'var(--text-main)' }}>8월 에콰도르 64일 금어기(Veda)와 맞물려 원어 수급 치명적 위협</strong>.</span>
              </div>
            </div>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(239, 68, 68, 0.30)', '--news-glow-border': 'rgba(239, 68, 68, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(248, 113, 113, 0.08))', border: '1px solid rgba(239, 68, 68, 0.30)', color: '#ef4444', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                규제 / 유통
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.14~16</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              EU CATCH 시스템발(發) 유럽 수입 병목 심화 및 유예 조치
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>디지털 이력 추적제 <strong style={{ color: 'var(--text-main)' }}>'EU CATCH' 행정 병목 현실화</strong>. 아프리카 등 중소 공급국 대응 지연으로 1분기 프랑스 캔참치 수입 -24% 급감.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>규제 적용에 난항을 겪는 미국 수산물 대상 <strong style={{ color: 'var(--text-main)' }}>EU 의회가 CATCH 시스템 적용 유예를 11월 30일까지 5개월 연장</strong>.</span>
              </div>
            </div>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(56, 189, 248, 0.30)', '--news-glow-border': 'rgba(56, 189, 248, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(125, 211, 252, 0.08))', border: '1px solid rgba(56, 189, 248, 0.30)', color: '#38bdf8', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                무역 / 관세
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.17</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              관세 장벽의 틈새: 미국의 브라질산 참치 예외와 중국-소말리아 밀착
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>USTR, 브라질산 수입품에 무역법 301조 25% 징벌적 관세 부과했으나 <strong style={{ color: 'var(--text-main)' }}>신선/냉장 황다랑어 및 눈다랑어는 면제</strong>.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>중국은 <strong style={{ color: 'var(--text-main)' }}>소말리아와 수산물 무관세 수출 협정 전격 체결</strong>. 아프리카 인도양 연안 수산 자원 선점 및 인프라 투자 본격화.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 4: CORE EXECUTIVE INSIGHTS */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Search size={20} color="#818cf8" />
          전략 인사이트: 기후·에너지 이중고 및 규제 장벽 틈새 기회
        </h3>
        <div data-mobile-stack className="mkt-insights" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          <WidgetCard
            title="'기후·에너지 이중고'에 따른 공급망의 구조적 붕괴 대응"
            icon={Search}
            iconColor="#818cf8"
            pillar="S2"
            cardDesc="슈퍼 엘니뇨로 인한 조업지 이동 + 중동 리스크발 연료비(MGO $1,160) 폭등 장기화 대비"
            customBody={<></>}
            takeaway={{
              situation: "슈퍼 엘니뇨로 인한 조업지 이동과 중동 리스크에 따른 연료비 폭등은 일시적 현상이 아닙니다. 에콰도르 가다랑어 극단적 품귀 현상($2,150)과 방콕 가격 반등($1,790)은 기존 공급망 공식이 깨졌음을 의미합니다.",
              actionPlan: "(1) [방콕 시장 선도 계약 선점]: WCPFC FAD 조업 금지(7/1~8/15)로 8월 초 방콕 양륙 물량 급감 예상. $1,800 돌파 전 선매입 계약 필수. \n(2) [탈(脫) 동태평양 소싱 포트폴리오]: 슈퍼 엘니뇨와 금어기로 남미 발 공급망 병목 심화. 대서양이나 아시아 역내 어장으로 소싱 비중 전환. \n(3) [연료비 변동성 방어 벙커링 계약]: MGO $1,160 폭등 등 조업 유류비 리스크 방어를 위해 장기 벙커링 헷징 계약 검토.",
              source: 'Atuna 2026.07.13~17 (NotebookLM 종합 분석)',
            }}
          />

          <WidgetCard
            title="보호무역 및 '규제 장벽'의 틈새를 파고드는 프리미엄·우회 수출 전략"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S3"
            cardDesc="미국 301조 관세 위협 및 EU CATCH 규제로 중소 공급국 퇴출 가속 → 디지털 인프라 기반 선진 시장 장악 기회"
            customBody={<></>}
            takeaway={{
              situation: "미국의 무역법 301조 관세 위협과 유럽의 EU CATCH 시스템은 역량 없는 중소 공급국들을 강제 퇴출시키고 있습니다. 완벽한 이력 추적 인프라와 관세 예외 지대를 파악한 기업에게는 선진국 시장 매대를 장악할 절호의 기회입니다.",
              actionPlan: "(1) [EU CATCH 규제 준수율 기반 점유율 확장]: 프랑스 1분기 수입 24% 급감 등 유럽 대형 유통사들의 재고 부족 상황을 디지털 이력 추적(Traceability) 인프라로 공략. \n(2) [미국 관세 예외국 경유 전략]: 미국이 브라질산 고급 참치를 25% 보복 관세에서 예외로 둔 점을 활용, 주요 타겟국을 우회하는 북미향 하이엔드 수출 라인 개척. \n(3) [아프리카 냉동 콜드체인 선행 투자]: 중국-소말리아 밀착 대응. 단순 원어 매입을 넘어 초저온 냉동 인프라 투자 대가로 장기 독점 조업권 및 원어 수매권 확보 빅딜 추진.",
              source: 'Atuna 2026.07.13~17 (NotebookLM 종합 분석)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
