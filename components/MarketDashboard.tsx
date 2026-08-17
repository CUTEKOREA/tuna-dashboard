'use client';

import React, { useState, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import {
  TrendingUp, TrendingDown, BarChart2,
  Globe, Activity
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, Brush
} from 'recharts';
import SeafoodStockWidget from './SeafoodStockWidget';
import HeroMarketCommand from './HeroMarketCommand';
import TunaDailyBriefingWidget from './TunaDailyBriefingWidget';
import HeroZone from './v2/HeroZone';
import FilterBar from './v2/FilterBar';
import { VolumeBarChart, type VolumeBarPoint } from './charts/VolumeBar';
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

/* P2 클릭 문법 — 범례 클릭으로 숨길 수 있는 허브 시리즈 축 (차트별 dataKey) */
const HUB_SERIES_KEYS = [
  'skj_bkk', 'skj_mnt', 'skj_abj', 'skj_sey', 'skj_vig',
  'yf_abj', 'yf_sey', 'yf_vig',
] as const;
type HubSeriesKey = (typeof HUB_SERIES_KEYS)[number];
const isHubSeriesKey = (v: unknown): v is HubSeriesKey =>
  typeof v === 'string' && (HUB_SERIES_KEYS as readonly string[]).includes(v);

/** 항구 색은 가다랑어·황다랑어가 같다. 노란 세선은 흰 지면에서 안 읽힌다. */
const MARKET_HUB = {
  bkk: '#509ee3',
  mnt: '#3f6212',
  sey: '#b45309',
  abj: '#5b4b8a',
  vig: '#9a3412',
} as const;

/* 필터 상태 URL 동기화 (?period=&grain=&hide=) — 공유 링크가 같은 화면을 연다 (스펙 §4-1, P2) */
interface MarketChartFilter {
  period: AtunaPeriodKey;
  grain: AtunaGrainKey;
  hidden: HubSeriesKey[];
}

function readFilterFromUrl(): MarketChartFilter {
  if (typeof window === 'undefined') return { period: 'all', grain: 'week', hidden: [] };
  const params = new URLSearchParams(window.location.search);
  const period = params.get('period') as AtunaPeriodKey | null;
  const grain = params.get('grain') as AtunaGrainKey | null;
  const hidden = (params.get('hide') ?? '').split(',').filter(isHubSeriesKey);
  return {
    period: period && PERIOD_KEYS.includes(period) ? period : 'all',
    grain: grain && GRAIN_KEYS.includes(grain) ? grain : 'week',
    hidden,
  };
}

function writeFilterToUrl({ period, grain, hidden }: MarketChartFilter) {
  const params = new URLSearchParams(window.location.search);
  if (period === 'all') params.delete('period'); else params.set('period', period);
  if (grain === 'week') params.delete('grain'); else params.set('grain', grain);
  if (hidden.length === 0) params.delete('hide'); else params.set('hide', hidden.join(','));
  const query = params.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
}

/* 커스텀 차트 툴팁 — 전역 recharts 기본 툴팁 CSS(!important)와 분리해 대비 확보 (Metabase 다크 툴팁 관례) */
function MarketChartTip({ active, payload, label }: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#303c46',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(16, 24, 40, 0.35)',
      padding: '10px 12px',
      fontSize: '12.5px',
      lineHeight: 1.6,
    }}>
      <div style={{ color: '#c6c9d2', marginBottom: '4px', fontWeight: 700 }}>{label}</div>
      {payload.map((entry) => (
        <div key={String(entry.name)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color ?? '#ffffff', flex: '0 0 auto' }} />
          <span style={{ color: '#ffffff' }}>
            {entry.name} : {typeof entry.value === 'number' ? entry.value.toLocaleString('ko-KR') : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

const fmtPct = (p: number) => `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`;
const subscribeClientSnapshot = () => () => {};
const getTodayIsoSnapshot = (): string | null => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const getServerTodaySnapshot = (): string | null => null;

/* 디자인 랩 4라운드 채택(r4-B ★4): KPI 나열은 지휘형 카드(HeroMarketCommand)가 대체 —
   히어로는 페이지 타이틀·기준일만 남긴다 */
export function MarketHero({ rows }: { rows: AtunaPriceRow[] }) {
  const bangkok = latestTwoForAtunaHub(rows, SKJ_ATUNA_HUBS[0]);
  const bangkokDeltaPct = calcAtunaDeltaPct(bangkok);

  return (
    <HeroZone
      variant="kpi"
      minHeight={170}
      title="시장 동향"
      subtitle={bangkok.latest
        ? `방콕 현물가 기준일 ${bangkok.latest.date.replace(/-/g, '.')}${bangkokDeltaPct === null ? '' : ` · 직전 고시 대비 ${fmtPct(bangkokDeltaPct)}`}`
        : '참치 가격 데이터 수신 대기'}
    />
  );
}

export default function MarketDashboard({ heroOnly = false }: { heroOnly?: boolean }) {
  const [priceData, setPriceData] = useState<any[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  // V3 파일럿 필터 — 초기값은 URL에서 (SSR에서는 기본값, 마운트 후 동기화)
  const [chartFilter, setChartFilter] = useState<MarketChartFilter>(
    { period: 'all', grain: 'week', hidden: [] },
  );
  useEffect(() => {
    // URL은 마운트 후 1회만 읽는다 — SSR 기본값과의 hydration 불일치 방지가 목적이라 동기 setState가 맞다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChartFilter(readFilterFromUrl());
  }, []);
  const applyFilter = (next: MarketChartFilter) => {
    setChartFilter(next);
    writeFilterToUrl(next);
  };
  // P2: 범례 클릭 → 허브 시리즈 숨김/복원 (recharts Legend onClick payload에서 dataKey 추출)
  const toggleHubSeries = (entry: { dataKey?: unknown; payload?: { dataKey?: unknown } }) => {
    const key = entry?.dataKey ?? entry?.payload?.dataKey;
    if (!isHubSeriesKey(key)) return;
    applyFilter({
      ...chartFilter,
      hidden: chartFilter.hidden.includes(key)
        ? chartFilter.hidden.filter((k) => k !== key)
        : [...chartFilter.hidden, key],
    });
  };
  const legendFormatter = (value: React.ReactNode, entry: { dataKey?: unknown }) => {
    const off = isHubSeriesKey(entry?.dataKey) && chartFilter.hidden.includes(entry.dataKey);
    return (
      <span style={{ cursor: 'pointer', opacity: off ? 0.42 : 1, textDecoration: off ? 'line-through' : 'none' }}>
        {value}
      </span>
    );
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
  // useMemo 필수: recharts Brush가 data 배열 identity에 묶여 있어, 매 렌더 새 배열이면
  // 범례 토글·리사이즈마다 Brush 선택 구간이 풀 레인지로 리셋된다 (반증 리뷰 P1-1)
  const chartData = useMemo(
    () => filterAtunaHistory(priceData, chartFilter.period, chartFilter.grain),
    [priceData, chartFilter.period, chartFilter.grain],
  );
  const bangkokVolume: VolumeBarPoint[] = chartData
    .filter((row): row is AtunaPriceRow & { skj_bkk: number } => typeof row.skj_bkk === 'number')
    .slice(-8)
    .map((row) => ({
      label: row.date.slice(5).replace('-', '.'),
      value: row.skj_bkk,
    }));

  if (heroOnly) {
    return (
      <div className={styles.dashboard}>
        {marketHero}
      </div>
    );
  }

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

      {/* 디자인 랩 4라운드 채택본 — 허브 지휘형 시세 카드 (r4-B) */}
      <HeroMarketCommand rows={priceData} />

      {/* Seafood Stock Widget at the top of the market page */}
      <SeafoodStockWidget />

      {/* ROW 1: CORE MACRO KPIs */}
      <section className={styles.kpiGrid}>
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
        <p style={{ margin: '-8px 0 12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          범례 클릭 = 허브 숨김·복원 · 차트 하단 띠 드래그 = 기간 확대
        </p>
        <div ref={chartContainerRef} style={{ width: '100%', minHeight: '350px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(450px, 100%), 1fr))', gap: '24px' }}>
          
          {/* LEFT: SKIPJACK (SKJ) */}
          {chartWidth > 0 && chartData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                가다랑어 (SKJ)
              </h4>
              <LineChart width={chartWidth > 900 ? (chartWidth - 24) / 2 : chartWidth} height={382} data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e4e9" vertical={false} />
                <XAxis dataKey="date" stroke="#8d93a5" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="#8d93a5" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip content={<MarketChartTip />} />
                <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: '12px', paddingTop: '10px', letterSpacing: '0.01em' }} onClick={toggleHubSeries} formatter={legendFormatter} />
                <Brush dataKey="date" height={22} travellerWidth={8} stroke="var(--chart-s1, #509ee3)" fill="rgba(80, 158, 227, 0.06)" tickFormatter={() => ''} />

                <Line yAxisId="left" type="monotone" dataKey="skj_bkk" name="방콕" hide={chartFilter.hidden.includes('skj_bkk')} stroke={MARKET_HUB.bkk} strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: MARKET_HUB.bkk, strokeWidth: 0 }} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_mnt" name="만타" hide={chartFilter.hidden.includes('skj_mnt')} stroke={MARKET_HUB.mnt} strokeWidth={2} dot={false} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_abj" name="아비장" hide={chartFilter.hidden.includes('skj_abj')} stroke={MARKET_HUB.abj} strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_sey" name="세이셸" hide={chartFilter.hidden.includes('skj_sey')} stroke={MARKET_HUB.sey} strokeWidth={2} dot={false} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="skj_vig" name="비고" hide={chartFilter.hidden.includes('skj_vig')} stroke={MARKET_HUB.vig} strokeWidth={2} dot={false} strokeDasharray="3 3" connectNulls={true} />
              </LineChart>
            </div>
          )}

          {/* RIGHT: YELLOWFIN (YF) */}
          {chartWidth > 0 && chartData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                황다랑어 (YF)
              </h4>
              <LineChart width={chartWidth > 900 ? (chartWidth - 24) / 2 : chartWidth} height={382} data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e4e9" vertical={false} />
                <XAxis dataKey="date" stroke="#8d93a5" fontSize={12} tickMargin={10} minTickGap={30} />
                <YAxis yAxisId="left" stroke="#8d93a5" fontSize={12} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                <RechartsTooltip content={<MarketChartTip />} />
                <Legend iconType="plainline" iconSize={16} wrapperStyle={{ fontSize: '12px', paddingTop: '10px', letterSpacing: '0.01em' }} onClick={toggleHubSeries} formatter={legendFormatter} />
                <Brush dataKey="date" height={22} travellerWidth={8} stroke="var(--chart-s1, #509ee3)" fill="rgba(80, 158, 227, 0.06)" tickFormatter={() => ''} />

                <Line yAxisId="left" type="monotone" dataKey="yf_abj" name="아비장" hide={chartFilter.hidden.includes('yf_abj')} stroke={MARKET_HUB.abj} strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: MARKET_HUB.abj, strokeWidth: 0 }} connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="yf_sey" name="세이셸" hide={chartFilter.hidden.includes('yf_sey')} stroke={MARKET_HUB.sey} strokeWidth={2} dot={false} strokeDasharray="3 3" connectNulls={true} />
                <Line yAxisId="left" type="monotone" dataKey="yf_vig" name="비고" hide={chartFilter.hidden.includes('yf_vig')} stroke={MARKET_HUB.vig} strokeWidth={2} dot={false} strokeDasharray="5 5" connectNulls={true} />
              </LineChart>
            </div>
          )}

        </div>
        {chartWidth > 0 && bangkokVolume.length >= 2 && (
          <div style={{ marginTop: 20, flex: '0 0 auto' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 8px' }}>
              방콕 SKJ 최근 고시 (입체 비교)
            </h4>
            <VolumeBarChart
              data={bangkokVolume}
              name="방콕 SKJ"
              unit="($/MT)"
              width={chartWidth}
              height={160}
              fill="var(--chart-s1, #509ee3)"
            />
          </div>
        )}
      </section>


      {/* ROW 4: DAILY TUNA BRIEFING */}
      <section>
        <TunaDailyBriefingWidget />
      </section>

    </div>
  );
}
