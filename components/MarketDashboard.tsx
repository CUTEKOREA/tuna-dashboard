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
          Atuna 주간 다이제스트: 7월 2주차 시장을 뒤흔드는 핵심 시그널
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
                규제 / 정책
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.07</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              가봉, EU와 20년 참치 어업 협정 종료 — 자국 수산업 육성 선언
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>가봉 정부가 2007년부터 이어온 <strong style={{ color: 'var(--text-main)' }}>EU-가봉 지속가능어업협정(SFPA)을 6/29 종료</strong>. EU 선단의 연간 32,000톤 어획권 소멸.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>가봉은 참치 자원의 경제적 이익이 유럽에 편중(협정금 EUR 260만 vs 자원가치 EUR 7,000~9,000만)되었다고 판단. <strong style={{ color: 'var(--text-main)' }}>국내 가공·고용 창출 중심으로 수산업 재편</strong> 추진.</span>
              </div>
            </div>
          </div>

          {/* News 2 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(245, 158, 11, 0.30)', '--news-glow-border': 'rgba(245, 158, 11, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(251, 191, 36, 0.08))', border: '1px solid rgba(245, 158, 11, 0.30)', color: '#f59e0b', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                원료 / 가격
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.09</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              에콰도르 SKJ 원료가 $2,150/톤 돌파 — 어획 부진·유가 압박 복합 악재
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>만타 허브 SKJ 원료가 <strong style={{ color: 'var(--text-main)' }}>$2,100~$2,200/톤</strong>으로 수년래 최고. 1~5월 에콰도르 선단 SKJ 어획 85,323톤(전년 145,889톤 대비 <strong style={{ color: 'var(--text-main)' }}>-41%</strong>).</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>방콕 SKJ $1,775/톤으로 <strong style={{ color: 'var(--text-main)' }}>태국 가공업체가 EU 시장에서 24% 관세 불구 가격 경쟁력 확보</strong>. 에콰도르 디젤 $4.29/갤런 고유가 지속으로 조업 비용 상승.</span>
              </div>
            </div>
          </div>

          {/* News 3 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(239, 68, 68, 0.30)', '--news-glow-border': 'rgba(239, 68, 68, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(248, 113, 113, 0.08))', border: '1px solid rgba(239, 68, 68, 0.30)', color: '#ef4444', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                무역 / 관세
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.09</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              EU-멕시코 MGA 유럽의회 최종 승인 — 474 대 131 압도적 통과
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>유럽의회 본회의에서 <strong style={{ color: 'var(--text-main)' }}>iTA(잠정 무역 협정) 474 대 131로 가결</strong>. 각 회원국 비준 전 관세 조항 선적용 가능, 멕시코산 캔 참치 7년 후 무관세 확정.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>멕시코는 EPO 2위 참치 어업·가공국. <strong style={{ color: 'var(--text-main)' }}>Q1 2026 EU 대 멕시코 냉동 로인 수입 101톤</strong>으로 아직 소규모이나, 무관세 시행 시 물량 급증 예상.</span>
              </div>
            </div>
          </div>

          {/* News 4 */}
          <div className="ds-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', '--news-glow': 'rgba(56, 189, 248, 0.30)', '--news-glow-border': 'rgba(56, 189, 248, 0.35)' } as React.CSSProperties}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'inline-block', padding: '4px 10px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(125, 211, 252, 0.08))', border: '1px solid rgba(56, 189, 248, 0.30)', color: '#38bdf8', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.02em', width: 'fit-content' }}>
                시장 규모
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Atuna 2026.07.09</span>
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
              UN FAO: 글로벌 참치 수출 $177억 — 캔 참치 56% 점유, 태국·스페인·에콰도르 3강
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.75, flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>2024년 참치·가다랑어·새치류 수출 <strong style={{ color: 'var(--text-main)' }}>$177억(+4% vs 2022)</strong>. 전체 수산물 무역의 10% 차지. 캔 참치가 수출액의 56%, 냉동 36%, 신선 6%.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }}>▸</span>
                <span>수출 점유율 태국 15%, 스페인 10%, 에콰도르 9%. <strong style={{ color: 'var(--text-main)' }}>수입 1위 미국(12%), 2위 일본(9%), 3위 태국(9%)</strong>. 태국은 수출·수입 모두 상위권으로 글로벌 가공 허브 지위 확인.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROW 4: CORE EXECUTIVE INSIGHTS */}
      <section>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <Search size={20} color="#818cf8" />
          전략 인사이트: EPO SKJ 공급 위기 · EU 무역 지형 격변 · 글로벌 $177억 시장
        </h3>
        <div data-mobile-stack className="mkt-insights" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

          <WidgetCard
            title="에콰도르 SKJ 공급 위기와 태국의 EU 시장 역전 — 원료 가격 구조 재편"
            icon={Search}
            iconColor="#818cf8"
            pillar="S2"
            cardDesc="만타 SKJ $2,150/톤(수년래 최고) + 에콰도르 어획 -41% + 방콕 SKJ $1,775/톤 → 태국 가공업체 EU 시장 가격 경쟁력 역전"

            customBody={<></>}
            takeaway={{
              situation: "에콰도르 참치 산업이 복합 악재에 직면하고 있습니다. (1) 1~5월 SKJ 어획이 85,323톤으로 전년(145,889톤) 대비 41% 급감하며 만타 허브 원료가가 $2,100~$2,200/톤(수년래 최고)으로 치솟았습니다. (2) 디젤 $4.29/갤런의 고유가가 지속되어 조업 비용이 상승 중입니다. (3) 반면 방콕 SKJ는 $1,775/톤으로 하락하며, 태국 가공업체가 24% 관세 부담에도 EU 시장에서 가격 경쟁력을 확보하는 역전 현상이 발생했습니다. EU-멕시코 무관세 협정까지 확정되면서 에콰도르의 EU 시장 입지가 양면 압박을 받고 있습니다.",
              actionPlan: "(1) [원료 조달 전략 다변화]: 에콰도르 SKJ 고가 상황을 감안해, 방콕(SKJ $1,775) 및 WCPO 원어 소싱을 병행하여 원가 경쟁력을 확보합니다. \n(2) [EU 시장 가격 전략 재검토]: 태국 가공업체의 EU 시장 진출 확대에 대응하여, 한국산 프리미엄 포지셔닝(EUR 12,504/톤 최고가)을 유지하되 중가 세그먼트 대응 방안을 마련합니다.",
              source: 'Atuna 2026.07.06~09 (NotebookLM 종합 분석)',
            }}
          />

          <WidgetCard
            title="EU 참치 무역 구조 근본적 재편 — 가봉 SFPA 종료 + EU-멕시코 확정 + 글로벌 $177억 시장 지형"
            icon={Activity}
            iconColor="#818cf8"
            pillar="S3"
            cardDesc="가봉 SFPA 종료(32,000톤 소멸) + EU-멕시코 474:131 최종 승인 + 글로벌 수출 $177억 중 캔 56% → EU 가공·무역 구조 전면 재편"

            customBody={<></>}
            takeaway={{
              situation: "EU 참치 무역에 구조적 변화가 확정 단계에 진입했습니다. (1) 가봉 SFPA 종료로 연간 32,000톤 어획 접근권이 소멸되어 EU 역내 원어 공급 부족이 현실화됩니다. (2) EU-멕시코 MGA가 유럽의회를 474 대 131로 최종 통과하며, 7년 후 멕시코산 캔 참치 무관세 진입이 확정되었습니다. (3) UN FAO 보고서에 따르면 글로벌 참치 수출이 $177억에 도달하며 캔 참치(56%)가 시장을 주도하고 있습니다. 태국(수출 15%)·스페인(10%)·에콰도르(9%)가 3강 체제를 형성 중이며, 수입국으로는 미국(12%)·일본(9%)·태국(9%)이 상위권입니다.",
              actionPlan: "(1) [EU 가공 산업 재편 모니터링]: 멕시코 무관세 + 태국 FTA 협상 + 가봉 SFPA 종료의 누적 효과로 EU 역내 가공업(특히 스페인 갈리시아)의 경쟁력 변화를 추적합니다. \n(2) [글로벌 시장 포지셔닝]: $177억 시장에서 캔 참치(56%) 중심 성장을 감안해, 자사 가공·유통 전략을 캔·파우치 고부가 제품 중심으로 재편합니다.",
              source: 'Atuna 2026.07.06~09 (NotebookLM 종합 분석)',
            }}
          />

        </div>
      </section>

    </div>
  );
}
