'use client';

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { 
  TrendingUp, TrendingDown, Ship, Anchor, BarChart2,
  Globe, Activity
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import SeafoodStockWidget from './SeafoodStockWidget';
import TunaDailyBriefingWidget from './TunaDailyBriefingWidget';
import HeroZone, { type HeroKpi } from './v2/HeroZone';
import FilterBar from './v2/FilterBar';
import {
  ATUNA_GRAIN_LABELS,
  ATUNA_PERIOD_LABELS,
  type AtunaGrainKey,
  type AtunaPeriodKey,
  SKJ_ATUNA_HUBS,
  type AtunaPriceRow,
  type AtunaSpreadSummary,
  buildAtunaMarketSummaries,
  calcAtunaDeltaPct,
  filterAtunaHistory,
  latestTwoForAtunaHub,
} from '../lib/data/atuna-price-summary';
import styles from './MarketDashboard.module.css';

const PERIOD_KEYS: AtunaPeriodKey[] = ['3m', '6m', '1y', 'all'];
const GRAIN_KEYS: AtunaGrainKey[] = ['week', 'month'];

/* 필터 상태 URL 동기화 (?period=&grain=) — 공유 링크가 같은 화면을 연다 (스펙 §4-1) */
function readFilterFromUrl(): { period: AtunaPeriodKey; grain: AtunaGrainKey } {
  if (typeof window === 'undefined') return { period: 'all', grain: 'week' };
  const params = new URLSearchParams(window.location.search);
  const period = params.get('period') as AtunaPeriodKey | null;
  const grain = params.get('grain') as AtunaGrainKey | null;
  return {
    period: period && PERIOD_KEYS.includes(period) ? period : 'all',
    grain: grain && GRAIN_KEYS.includes(grain) ? grain : 'week',
  };
}

function writeFilterToUrl(period: AtunaPeriodKey, grain: AtunaGrainKey) {
  const params = new URLSearchParams(window.location.search);
  if (period === 'all') params.delete('period'); else params.set('period', period);
  if (grain === 'week') params.delete('grain'); else params.set('grain', grain);
  const query = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
}

const fmtPct = (p: number) => `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`;
const subscribeClientSnapshot = () => () => {};
const getTodayIsoSnapshot = (): string | null => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const getServerTodaySnapshot = (): string | null => null;

export function MarketHero({ rows }: { rows: AtunaPriceRow[] }) {
  const bangkok = latestTwoForAtunaHub(rows, SKJ_ATUNA_HUBS[0]);
  const manta = latestTwoForAtunaHub(rows, SKJ_ATUNA_HUBS[1]);
  const yellowfin = buildAtunaMarketSummaries(rows).yf;
  const bangkokDeltaPct = calcAtunaDeltaPct(bangkok);
  const bangkokDelta = bangkok.latest && bangkok.prev
    ? bangkok.latest.price - bangkok.prev.price
    : null;
  const secondaryKpis: HeroKpi[] = [];

  if (manta.latest) {
    secondaryKpis.push({
      label: '만타 SKJ 현물가',
      value: manta.latest.price,
      unit: '($/MT)',
    });
  }
  if (bangkokDelta !== null) {
    secondaryKpis.push({
      label: '방콕 주간 변동',
      value: bangkokDelta,
      unit: '($/MT)',
    });
  }
  if (yellowfin.latest) {
    secondaryKpis.push({
      label: '황다랑어 현물가',
      value: yellowfin.latest.price,
      unit: '($/MT)',
    });
  }

  return (
    <HeroZone
      variant="kpi"
      title="시장 동향"
      subtitle={bangkok.latest
        ? `방콕 현물가 기준일 ${bangkok.latest.date.replace(/-/g, '.')}${bangkokDeltaPct === null ? '' : ` · 직전 고시 대비 ${fmtPct(bangkokDeltaPct)}`}`
        : '참치 가격 데이터 수신 대기'}
      primaryKpi={bangkok.latest ? {
        label: '방콕 SKJ 현물가',
        value: bangkok.latest.price,
        unit: '($/MT)',
      } : undefined}
      secondaryKpis={secondaryKpis}
    />
  );
}

export default function MarketDashboard({ heroOnly = false }: { heroOnly?: boolean }) {
  const [priceData, setPriceData] = useState<any[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  // V3 파일럿 필터 — 초기값은 URL에서 (SSR에서는 기본값, 마운트 후 동기화)
  const [chartFilter, setChartFilter] = useState<{ period: AtunaPeriodKey; grain: AtunaGrainKey }>(
    { period: 'all', grain: 'week' },
  );
  useEffect(() => {
    // URL은 마운트 후 1회만 읽는다 — SSR 기본값과의 hydration 불일치 방지가 목적이라 동기 setState가 맞다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChartFilter(readFilterFromUrl());
  }, []);
  const applyFilter = (next: { period: AtunaPeriodKey; grain: AtunaGrainKey }) => {
    setChartFilter(next);
    writeFilterToUrl(next.period, next.grain);
  };

  // Measure container width with ResizeObserver (works even after display:none -> block toggle)
  useEffect(() => {
    if (heroOnly) return;

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
  }, [heroOnly]);

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

    if (heroOnly) return;

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
  }, [heroOnly]);

  const marketHero = <MarketHero rows={priceData} />;
  // 필터는 어가 추이 차트에만 적용 — KPI·히어로는 전체 기간 기준 (결정 ②)
  const chartData = filterAtunaHistory(priceData, chartFilter.period, chartFilter.grain);

  if (heroOnly) {
    return (
      <div className={styles.dashboard}>
        {marketHero}
      </div>
    );
  }

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
      <span className={styles.staleBadge}>
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
    <div className={styles.dashboard}>
      {marketHero}

      {/* Seafood Stock Widget at the top of the market page */}
      <SeafoodStockWidget />

      {/* ROW 1: CORE MACRO KPIs */}
      <section className={styles.kpiGrid}>
        {/* KPI 1 */}
        <div className={`dsc-card dsc-card--accent ${styles.kpiCard}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>SKJ 가다랑어 지역 스프레드</span>
              {renderStaleBadge(atunaLatest.skj?.latest?.date)}
            </span>
            <Ship size={16} color="var(--accent-primary)" />
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
        <div className={`dsc-card dsc-card--accent ${styles.kpiCard}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>YF 황다랑어 지역 스프레드</span>
              {renderStaleBadge(atunaLatest.yf?.latest?.date)}
            </span>
            <Anchor size={16} color="var(--accent-primary)" />
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
        <div className={`dsc-card dsc-card--accent ${styles.kpiCard}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>싱가포르 MGO 유가{mgoData.isEstimate ? ' (Brent 환산추정)' : ''}</span>
              {renderStaleBadge(mgoData.date)}
            </span>
            <Activity size={16} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {mgoData.price !== null ? `$${mgoData.price.toLocaleString()}` : '—'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ton</span>
          </div>
          {mgoData.change !== null && mgoData.price !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: mgoData.change >= 0 ? 'var(--color-danger)' : 'var(--accent-success)' }}>
              {mgoData.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>전일 대비 {mgoData.change >= 0 ? '+' : '-'}${Math.abs(mgoData.change).toLocaleString()}</span>
            </div>
          )}
          <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {mgoData.loading ? '데이터 수신 대기 중' : apiSyncLabel(mgoData.date)}
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`dsc-card dsc-card--accent ${styles.kpiCard}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 600 }}>달러·원 환율</span>
              {renderStaleBadge(fxData.date)}
            </span>
            <Globe size={16} color="var(--accent-primary)" />
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

      {/* V3 필터 바 — 적용 범위를 캡션으로 정직 표기 (스펙 §4-1, 결정 ②) */}
      <FilterBar
        periodOptions={PERIOD_KEYS.map((key) => ({ key, label: ATUNA_PERIOD_LABELS[key] }))}
        period={chartFilter.period}
        onPeriodChange={(period) => applyFilter({ ...chartFilter, period })}
        grainOptions={GRAIN_KEYS.map((key) => ({ key, label: ATUNA_GRAIN_LABELS[key] }))}
        grain={chartFilter.grain}
        onGrainChange={(grain) => applyFilter({ ...chartFilter, grain })}
        scopeNote="어가 추이 차트에 적용 · KPI·기사 카드는 전체 기간 기준"
      />

      {/* ROW 2: TUNA PRICE TRENDS BY REGION */}
      <section className={`dsc-card ${styles.chartPanel}`}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
          <BarChart2 size={20} color="var(--accent-primary)" />
          글로벌 참치 어가 추이 (SKJ·YF 지역 스프레드)
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
            {ATUNA_PERIOD_LABELS[chartFilter.period]} · {ATUNA_GRAIN_LABELS[chartFilter.grain]}
          </span>
          {atunaLatest.latestDate && (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Atuna 수동동기화 ({formatHubDate(atunaLatest.latestDate)} 기준)
            </span>
          )}
        </h3>
        <div ref={chartContainerRef} style={{ width: '100%', minHeight: '350px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          
          {/* LEFT: SKIPJACK (SKJ) */}
          {chartWidth > 0 && chartData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                가다랑어 (SKJ)
              </h4>
              <LineChart width={chartWidth > 900 ? (chartWidth - 24) / 2 : chartWidth} height={350} data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e4e9" vertical={false} />
                <XAxis dataKey="date" stroke="#8d93a5" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="#8d93a5" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#303c46', border: '1px solid rgba(255, 255, 255, 0.10)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(16, 24, 40, 0.35)' }}
                  itemStyle={{ color: '#ffffff', fontSize: '13px' }}
                  labelStyle={{ color: '#c6c9d2', marginBottom: '4px', fontSize: '12px' }}
                />
                <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: '12px', paddingTop: '10px', letterSpacing: '0.01em' }} />

                <Line yAxisId="left" type="monotone" dataKey="skj_bkk" name="SKJ 방콕" stroke="#509ee3" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#509ee3', strokeWidth: 0 }} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_mnt" name="SKJ 만타" stroke="#88bf4d" strokeWidth={2} dot={false} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_abj" name="SKJ 아비장" stroke="#ef8c8c" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_sey" name="SKJ 세이셸" stroke="#e8b921" strokeWidth={2} dot={false} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_vig" name="SKJ 비고" stroke="#f2a86f" strokeWidth={2} dot={false} strokeDasharray="3 3" connectNulls={true} />
              </LineChart>
            </div>
          )}

          {/* RIGHT: YELLOWFIN (YF) */}
          {chartWidth > 0 && chartData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                황다랑어 (YF)
              </h4>
              <LineChart width={chartWidth > 900 ? (chartWidth - 24) / 2 : chartWidth} height={350} data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e4e9" vertical={false} />
                <XAxis dataKey="date" stroke="#8d93a5" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="#8d93a5" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#303c46', border: '1px solid rgba(255, 255, 255, 0.10)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(16, 24, 40, 0.35)' }}
                  itemStyle={{ color: '#ffffff', fontSize: '13px' }}
                  labelStyle={{ color: '#c6c9d2', marginBottom: '4px', fontSize: '12px' }}
                />
                <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: '12px', paddingTop: '10px', letterSpacing: '0.01em' }} />

                <Line yAxisId="left" type="monotone" dataKey="yf_abj" name="YF 아비장" stroke="#7172ad" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#7172ad', strokeWidth: 0 }} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="yf_sey" name="YF 세이셸" stroke="#f2a86f" strokeWidth={2} dot={false} strokeDasharray="3 3" connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="yf_vig" name="YF 비고" stroke="#a989c5" strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={true} />
              </LineChart>
            </div>
          )}

        </div>
      </section>


      {/* ROW 4: DAILY TUNA BRIEFING */}
      <section>
        <TunaDailyBriefingWidget />
      </section>

    </div>
  );
}
