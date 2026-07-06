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
          Atuna 주간 다이제스트: 7월 1주차 시장을 뒤흔드는 핵심 시그널
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
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.01</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              방콕 SKJ 하락 지속 · EPO 황다랑어 풍어로 가격 패리티 근접
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>중동 위기 완화로 방콕 SKJ(1.8kg Up) 가격이 <strong style={{ color: 'var(--text-main)' }}>톤당 $1,775</strong>로 하락 지속, 업계는 추가 하락 전망.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>EPO 황다랑어(YF) 이례적 풍어로 만타 가공 허브에서 <strong style={{ color: 'var(--text-main)' }}>SKJ와 가격 패리티</strong> 근접. 파나마 YF 어획 2배·베네수엘라 55% 증가.</span>
              </div>
            </div>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(239, 68, 68, 0.30)', '--news-glow-border': 'rgba(239, 68, 68, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(248, 113, 113, 0.08))', border: '1px solid rgba(239, 68, 68, 0.30)', color: '#ef4444', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                산업 / 구조조정
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.03</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              Sapmer 참치 조업 철수 — P&P 그룹에 선단 매각 협상 개시
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>프랑스 Sapmer가 <strong style={{ color: 'var(--text-main)' }}>잔여 선망선 3척(약 5,900톤 적재)</strong>을 네덜란드 P&P 산하 CFTO에 매각하는 독점 협상에 돌입.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>IO 어획 부진·SKJ/YF 가격 하락으로 2025년 참치 매출 8.5% 감소, 선박 감가 €1,900만 손실 반영. IO 선단 과잉 설비 정리 가속화 신호.</span>
              </div>
            </div>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(245, 158, 11, 0.30)', '--news-glow-border': 'rgba(245, 158, 11, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(251, 191, 36, 0.08))', border: '1px solid rgba(245, 158, 11, 0.30)', color: '#f59e0b', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                무역 / 관세
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.03</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              스페인, 비EU산 캔 참치 수입 대폭 감소 — EU 역내 공급 전환 가속
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>Q1 2026 EU 캔 참치 수입 <strong style={{ color: 'var(--text-main)' }}>전년 대비 18% 감소</strong>(약 129,000톤). 에콰도르·인도네시아·중국 등 비EU 공급국 타격.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>반면 <strong style={{ color: 'var(--text-main)' }}>EU 역내 공급 51% 급증</strong>(포르투갈 +57%, 독일 +18%). EU CATCH 디지털 통관 전환 부담이 비EU산 감소 원인으로 지목.</span>
              </div>
            </div>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(16, 185, 129, 0.30)', '--news-glow-border': 'rgba(16, 185, 129, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(52, 211, 153, 0.08))', border: '1px solid rgba(16, 185, 129, 0.30)', color: '#10b981', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                규제 / 정책
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.01 · 07.03</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              태평양 어업 장관회의 East New Britain 채택 · 하와이 Ahi 원산지 표시법 시행
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>FFC 장관회의에서 <strong style={{ color: 'var(--text-main)' }}>East New Britain Initiative 이행 전략</strong> 채택 — 태평양 연안국 수익 배분 강화 및 원양 선단 입어료 회피 차단 방안 의결.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>하와이 Act 238 발효(7/1): 소매점 판매 <strong style={{ color: 'var(--text-main)' }}>ahi(황다랑·눈다랑) 제품에 원산지 국가 라벨링 의무화</strong>. 미국 수입 참치 유통 투명성 강화 신호.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 4: CORE EXECUTIVE INSIGHTS */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Search size={20} color="#818cf8" />
          전략 인사이트: IO 선단 구조조정 · EPO 황다랑어 풍어 · EU 무역 지형 변동
        </h3>
        <div data-mobile-stack className="mkt-insights" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          <WidgetCard
            title="IO 선단 구조조정 가속화 — Sapmer 철수가 시사하는 인도양 참치 산업의 전환점"
            icon={Search}
            iconColor="#818cf8"
            pillar="S2"
            cardDesc="Sapmer 선단 매각 + IO 어획 부진 + SKJ/YF 가격 하락 + EPO 황다랑어 풍어 → IO 과잉 설비 정리 및 태평양 중심 공급 재편"

            customBody={<></>}
            takeaway={{
              situation: "프랑스 Sapmer가 인도양 선망선 3척을 P&P 그룹에 매각하며 참치 조업에서 사실상 철수합니다. IO에서는 어획 부진과 유가 부담이 지속되어 항차 적자가 반복되고, SKJ 가격(세이셸 기준)은 EUR 1,500/톤에 머물고 있습니다. 반면, 동태평양(EPO)에서는 이례적인 황다랑어(YF) 풍어가 이어지며 만타 허브에서 SKJ와 가격 패리티에 근접하는 이례적 상황이 전개되고 있습니다.",
              actionPlan: "(1) [IO 구조조정 매물 모니터링]: Sapmer 이후 추가 IO 선단 매각 가능성을 주시하고, 양질의 -40°C 초저온 선박 인수 기회를 검토합니다. \n(2) [EPO YF 풍어 대응]: 만타 허브 YF 원어 가격이 SKJ 수준까지 하락한 점을 활용해, 황다랑어 중심의 부가가치 가공(사시미·로인) 물량 확보를 추진합니다.",
              source: 'Atuna 2026.07.01, 2026.07.03 (NotebookLM 종합 분석)',
            }}
          />

          <WidgetCard
            title="EU 수입 지형 변동과 태평양 규제 강화가 만드는 글로벌 참치 공급망 재편"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S3"
            cardDesc="EU 비역내산 캔 참치 -18% + EU 역내 공급 +51% + East New Britain Initiative 채택 → 수출 채널 다변화 및 규제 선제 대응 필요"

            customBody={<></>}
            takeaway={{
              situation: "Q1 2026 EU 캔 참치 수입이 18% 급감하며, 에콰도르(-2,771톤)·인도네시아(-39%)·중국(-66%) 등 비EU 공급국이 대폭 축소된 반면, EU 역내(포르투갈·독일) 공급이 51% 급증했습니다. EU CATCH 디지털 통관 전환이 비EU산 진입 장벽을 높이고 있습니다. 태평양에서는 FFC 장관회의가 East New Britain Initiative를 채택하여, 연안국 수익 배분 강화 및 원양 선단 입어 관리가 한층 엄격해질 전망입니다.",
              actionPlan: "(1) [EU CATCH 선제 대응]: 자사 선단의 디지털 어획 증명서 발급 체계를 조기 구축하여, 비EU 경쟁사 대비 EU 시장 접근 우위를 확보합니다. \n(2) [태평양 VDS 비용 최적화]: East New Britain Initiative로 입어료 상승이 예상되는 만큼, 키리바시·나우루·마셜 등 PNA 국가와의 선제적 장기 입어 계약을 추진합니다.",
              source: 'Atuna 2026.07.01, 2026.07.03 (NotebookLM 종합 분석)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
