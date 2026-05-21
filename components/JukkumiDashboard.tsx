// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, Scatter
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Fish, Anchor, Globe, DollarSign, 
  Activity, AlertTriangle, ShieldCheck, AlertCircle, X, Info,
  RefreshCcw, Crosshair, MapPin, Factory, Truck, Scale, BarChart2,
  Database, Ship, Zap, BookOpen, ChevronDown, ChevronUp, Leaf, Cpu, Layers, Clock,
  Map, Microscope, Beaker, FlaskConical, Dna, Award, Tag, Heart, FileSearch
} from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import WidgetCard from './WidgetCard';

/* ─── Telemetry Badge (참치 패턴 동기화) ─── */
const TelemetryBadge = ({ status, syncDate }: { status: 'live' | 'synced' | 'static' | undefined; syncDate?: string }) => {
  if (!status) return null;
  const isLive = status === 'live';
  const isSynced = status === 'synced';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ position: 'relative', width: '6px', height: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isLive && <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#10b981', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />}
        <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: isLive ? '#10b981' : isSynced ? '#3b82f6' : '#64748B' }} />
      </div>
      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isLive ? '#10b981' : isSynced ? '#3b82f6' : '#64748B', letterSpacing: '0.5px' }}>
        {isLive ? 'LIVE' : isSynced ? 'SYNCED' : 'STATIC'}
      </span>
      {!isLive && syncDate && (
        <span style={{ fontSize: '0.56rem', fontWeight: 500, color: '#64748B', marginLeft: '2px', whiteSpace: 'nowrap' }}>
          {syncDate}
        </span>
      )}
    </div>
  );
};

/* ─── 5-Part Section Definitions ─── */
const SECTIONS = [
  { id: 'S1', title: '🌊 Part I — 원료 수급', desc: '글로벌 주꾸미 원물 소싱 현황 및 연안 자원량 지수', color: '#8b5cf6' },
  { id: 'S2', title: '🏭 Part II — 가공 및 생산', desc: 'HMR(가정간편식) 가공 수율 및 제조 원가율 추이', color: '#a855f7' },
  { id: 'S3', title: '⚓ Part III — 물류 및 통관', desc: 'FTA 체결국발 물류 원가 및 통관 리스크 지수', color: '#d946ef' },
  { id: 'S4', title: '📊 Part IV — 판매 및 수요', desc: '유통 채널별 주꾸미 판매 단가 및 탄력성 지수', color: '#ec4899' },
  { id: 'S5', title: '🛡️ Part V — ESG 및 지속가능성', desc: '콜드체인 병원성 리스크 및 보건 안전 지수', color: '#f43f5e' }
];

/* ─── Custom Tooltip ─── */

const formatXAxis = (tickItem: any) => {
  if (!tickItem || typeof tickItem !== 'string') return tickItem;
  let formatted = tickItem.replace(/\s*\(.*?\)\s*/g, '');
  if (formatted.length > 7) {
    return formatted.substring(0, 7) + '..';
  }
  return formatted;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: any) => {
          if (entry.value === undefined || entry.name === undefined || entry.name === '') return null;
          if (isNaN(Number(entry.value))) return null;
          return (
            <div key={index} className={styles.tooltipValue}>
              <span style={{ color: entry.color }}>■ {entry.name}</span>
              <strong>{typeof entry.value === 'number' ? Math.round(entry.value).toLocaleString() : entry.value}</strong>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ["#8b5cf6", "#a855f7", "#d946ef", "#e879f9", "#ec4899", "#f43f5e", "#fb7185", "#fda4af"];

/* ─── KPI Themes ─── */
const KPI_THEMES = [
  { border: 'none', glow: 'none', text: '#8b5cf6', icon: Database },
  { border: 'none', glow: 'none', text: '#a855f7', icon: TrendingUp },
  { border: 'none', glow: 'none', text: '#d946ef', icon: Ship },
  { border: 'none', glow: 'none', text: '#ec4899', icon: ShieldCheck },
  { border: 'none', glow: 'none', text: '#f43f5e', icon: Factory },
  { border: 'none', glow: 'none', text: '#fb7185', icon: Scale },
];

/* ─── Widget Icons ─── */
const WIDGET_ICONS: Record<string, any> = {
  w1_global_catch: Globe,
  w2_korea_imports: Anchor,
  w3_supply_demand: Truck,
  w4_fbs_seafood: DollarSign,
  w5_mauritania_risk: AlertTriangle,
  w6_bio_processing: Activity,
  w7_cannibalism_risk: ShieldCheck,
  w8_recreational_tac: Scale,
  w9_korea_fta_imports: Ship,
  w10_species_map: Globe,
  w11_spawn_cycle: Clock,
  w12_generation_risk: Zap,
  w13_processing_auto: Factory,
  w14_nutrition: Heart,
  w15_hsk_tariff: Database,
  w16_korus_schedule: BookOpen,
  w17_price_spread: TrendingUp,
  w18_substitutes: BarChart2,
  w19_vibrio_amr: Microscope,
  w20_fip_esg: Leaf,
  w21_leisure_fishing_impact: Scale,
  w22_vietnam_trawl_fip: ShieldCheck,
  w23_hmr_yield_optimization: Factory,
  w24_china_aquaculture_rd: Activity,
  w25_tariff_schedule_impact: Database,
  w26_coldchain_utilization: Truck,
  w27_japan_kfood_export: TrendingUp,
  w28_domestic_senior_hmr: Heart,
  w29_africa_human_rights_risk: AlertTriangle,
  w30_tac_regulation_map: Map
};

const formatYAxis = (v: number) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
  return v;
};

export default function JukkumiDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/jukkumi-intelligence')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load jukkumi data", err));
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: '#FCD535', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#848E9C', fontSize: '1rem' }}>Loading Strategic Intelligence...</p>
    </div>
  );

  const { kpis, widgets } = data;
  const kpiKeys = Object.keys(kpis);
  
  /* ─── Unified Chart Renderer ─── */
  const renderChart = (widget: any) => {

    const PALETTE = ["#8b5cf6", "#d946ef", "#ec4899", "#f43f5e", "#a855f7", "#fb7185"];
    const getMonolithicColor = (i: number) => PALETTE[i % PALETTE.length];

    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>데이터 없음</div>;

    const chartType = (widget.chartType || '').toLowerCase();

    // NEW FORMAT — uses xKey, bars, lines, areas, series
    // First, check if we're using series
    if (widget.series) {
      const xAxis = widget.xAxis || 'Year';
      const series = widget.series || [];
      const hasRightAxis = series.some((s: any) => s.yAxisId === 'right');
      const isTextAxis = xAxis !== 'Year' && d.length > 0 && d[0][xAxis] !== undefined && typeof d[0][xAxis] === 'string' && isNaN(Number(d[0][xAxis]));
      const xTickProps = { fill: '#94a3b8', fontSize: 10, angle: 0, textAnchor: 'middle' as const, dy: 5 };
      const chartMargin = { top: 20, right: 30, left: -10, bottom: 10 };

      switch(chartType) {
        case "pie":
          return (
            <PieChart>
              <Pie data={d} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"
                label={({name, value, percent}: any) => percent > 0.03 ? `${name} ${typeof value === 'number' ? value.toLocaleString() : value}` : ''} labelLine={false} fontSize={10}>
                {d.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
            </PieChart>
          );
        case "bar":
          return (
            <BarChart data={d} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} minTickGap={20} tickFormatter={formatXAxis} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
              {series.map((s: any, i: number) => (
                <Bar key={i} dataKey={s.dataKey} fill={s.color || getMonolithicColor(i)} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          );
        case "composed":
          return (
            <ComposedChart data={d} margin={chartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} minTickGap={20} tickFormatter={formatXAxis} scale={series.some((s:any) => s.type !== 'line' && s.type !== 'scatter') ? "band" : "auto"} />
              <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
              {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />}
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
              {series.map((s: any, i: number) => {
                if (s.type === 'line') return <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} stroke={s.color || getMonolithicColor(i)} strokeWidth={2.5} dot={{r: 3}} />;
                if (s.type === 'area') return <Area key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} stroke={s.color || getMonolithicColor(i)} fill={s.color || getMonolithicColor(i)} fillOpacity={0.4} strokeWidth={2} />;
                if (s.type === 'scatter') return <Scatter key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} fill={s.color || getMonolithicColor(i)} />;
                return <Bar key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} fill={s.color || getMonolithicColor(i)} radius={[6, 6, 0, 0]} />;
              })}
            </ComposedChart>
          );
        default:
          return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
      }
    }
    return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported Format</div>;
  };

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: 'var(--color-success)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Fish size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                주꾸미 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>주꾸미 커맨드 센터 — 총 {widgets?.length || 5}개 위젯 · {kpiKeys?.length || 6}개 핵심지표</p>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ 6 KPIs ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {kpiKeys.map((key, idx) => {
          const kpi = kpis[key];
          const theme = KPI_THEMES[idx % KPI_THEMES.length];
          const IconComp = theme.icon;
          const parsed = parseAnimatedValue(kpi.value);
          return (
            <div key={key} className="ds-card" style={{background: '#181818',
              border: 'none', borderRadius: '8px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
              position: 'relative', overflow: 'hidden'}}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#181818'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: '1.3', wordBreak: 'keep-all' }}>{kpi.title}</span>
                {kpi.telemetry ? <TelemetryBadge status={kpi.telemetry} syncDate={kpi.syncDate} /> : <IconComp size={14} style={{ color: theme.text }} />}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {parsed ? (
                  <CountUp end={parsed.numberVal} duration={2} separator="," decimals={parsed.decimals} prefix={parsed.prefix} suffix={parsed.suffix} />
                ) : kpi.value}
              </div>
              <div style={{ fontSize: '0.68rem', color: theme.text, fontWeight: 600 }}>
                <span style={{ background: `${theme.text}20`, padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>{kpi.trend}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{kpi.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ 5-Part Consolidated Sections ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

        {/* ═══════ Part I: 원료 수급 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[0].color, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[0].desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w1_global_catch', 'w7_cannibalism_risk', 'w10_species_map', 'w11_spawn_cycle', 'w12_generation_risk', 'w21_leisure_fishing_impact', 'w22_vietnam_trawl_fip'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* ═══════ Part II: 가공 및 생산 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[1].color, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[1].desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w2_korea_imports', 'w6_bio_processing', 'w13_processing_auto', 'w14_nutrition', 'w23_hmr_yield_optimization', 'w24_china_aquaculture_rd'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* ═══════ Part III: 물류 및 통관 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[2].color, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[2].desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w3_supply_demand', 'w9_korea_fta_imports', 'w15_hsk_tariff', 'w16_korus_schedule', 'w25_tariff_schedule_impact', 'w26_coldchain_utilization'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* ═══════ Part IV: 판매 및 수요 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[3].color, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[3].desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w4_fbs_seafood', 'w17_price_spread', 'w18_substitutes', 'w27_japan_kfood_export', 'w28_domestic_senior_hmr'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* ═══════ Part V: ESG 및 지속가능성 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[4].color, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[4].desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w5_mauritania_risk', 'w8_recreational_tac', 'w19_vibrio_amr', 'w20_fip_esg', 'w29_africa_human_rights_risk', 'w30_tac_regulation_map'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

      </div>

    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const situation = w.sit || w.situation || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    const status = w.isLiveApi ? 'LIVE' : (w.reliability && w.reliability < 70 ? 'STATIC' : 'SYNCED');

    return (
      <WidgetCard
        key={w.id}
        title={w.title}
        icon={IconComp}
        iconColor="var(--color-success)"
        pillar={(w.pillar || 'S1') as any}
        cardDesc={w.subtitle || w.unit ? (w.subtitle || `단위: ${w.unit}`) : '주꾸미 인텔리전스 위젯'}
        unit={w.unit ? `(단위: ${w.unit})` : undefined}
        telemetry={{ status, syncDate: '2026-05-15' }}
        chart={renderChart(w)}
        chartHeight={375}
        takeaway={{ situation, actionPlan: takeaway, source: w.source || '' }}
      />
    );
  }
}

/* ─── Helper ─── */
function parseAnimatedValue(valStr: string) {
  if (!valStr || typeof valStr !== 'string') return null;
  const match = valStr.match(/^([^\d]*)((?:\d|,|\.)+)(.*)$/);
  if (match) {
    const rawNumberStr = match[2];
    const prefix = match[1];
    const suffix = match[3];
    const hasDecimal = rawNumberStr.includes('.');
    const numberVal = parseFloat(rawNumberStr.replace(/,/g, ''));
    if (!isNaN(numberVal)) {
      return { numberVal, prefix, suffix, decimals: hasDecimal ? rawNumberStr.split('.')[1].length : 0 };
    }
  }
  return null;
}
