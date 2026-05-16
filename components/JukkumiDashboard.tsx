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
  Database, Ship, Zap, BookOpen, ChevronDown, ChevronUp, Leaf, Cpu, Layers, Clock
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import TakeawayBox from './TakeawayBox';

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
  { id: 'S1', title: '🌊 Part I — 원물 및 조달 (Raw Material)', desc: '글로벌 어획량 현황 · 중국 공급망 종속성', color: '#8b5cf6' },
  { id: 'S2', title: '🏭 Part II — 가공 및 밸류체인 (Processing)', desc: '주요 수입국 원물 조달 및 가공 현황', color: '#a855f7' },
  { id: 'S3', title: '⚓ Part III — 물류 및 운영 원가 (Logistics)', desc: '수입-어획 수급 구조 · 재고 및 물류 리스크', color: '#d946ef' },
  { id: 'S4', title: '📊 Part IV — 판매 및 수요 (Sales & Demand)', desc: '수산물 소비 트렌드 및 주꾸미 비중', color: '#ec4899' },
  { id: 'S5', title: '🛡️ Part V — ESG 및 규제 리스크 (Sustainability)', desc: '서아프리카 신흥 소싱처 환경 리스크 및 단가 상승 요인', color: '#f43f5e' }
];

/* ─── Custom Tooltip ─── */

const formatXAxis = (tickItem: any) => {
  if (!tickItem || typeof tickItem !== 'string') return tickItem;
  let formatted = tickItem.replace(/\s*\(.*?\)\s*/g, '');
  if (formatted.length > 12) {
    return formatted.substring(0, 12) + '..';
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
  w3_supply_demand: Scale,
  w4_fbs_seafood: TrendingUp,
  w5_mauritania_risk: AlertTriangle
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
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;

    const chartType = (widget.chartType || '').toLowerCase();

    // NEW FORMAT — uses xKey, bars, lines, areas, series
    // First, check if we're using series
    if (widget.series) {
      const xAxis = widget.xAxis || 'Year';
      const series = widget.series || [];
      const hasRightAxis = series.some((s: any) => s.yAxisId === 'right');
      const isTextAxis = xAxis !== 'Year' && d.length > 0 && d[0][xAxis] !== undefined && typeof d[0][xAxis] === 'string' && isNaN(Number(d[0][xAxis]));
      const xTickProps = isTextAxis ? { fill: '#94a3b8', fontSize: 10, angle: -45, textAnchor: 'end' as const, dy: 5 } : { fill: '#94a3b8', fontSize: 11 };
      const chartMargin = isTextAxis ? { top: 20, right: 30, left: -10, bottom: 65 } : { top: 20, right: 30, left: -10, bottom: 0 };

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
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Webfoot Octopus Command Center — {widgets?.length || 5} Widgets · {kpiKeys?.length || 6} KPIs</p>
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

        {/* ═══════ Part I: 원물 및 조달 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[0].color, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[0].desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w1_global_catch'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* ═══════ Part II: 가공 및 밸류체인 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[1].color, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[1].desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w2_korea_imports'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* ═══════ Part III: 물류 및 운영 원가 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[2].color, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[2].desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w3_supply_demand'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
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
            {widgets?.filter((w: any) => ['w4_fbs_seafood'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* ═══════ Part V: ESG 및 규제 리스크 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[4].color, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[4].desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w5_mauritania_risk'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

      </div>

    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const accentColor = 'var(--color-success)';
    
    // Get methodology text (supports both old "methodology" and new "logic" field)
    const methodologyText = w.logic || w.methodology || '';
    // Get situation and takeaway (supports both old and new field names)
    const situation = w.sit || w.situation || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    
    return (
      <div key={w.id} className={`${styles.glassCard} ds-card`} style={{display: 'flex', flexDirection: 'column', minHeight: '600px',
        background: '#181818', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none',
        padding: '1.5rem'}}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            <IconComp size={20} color={accentColor} />
            {w.title} 
            {w.isLiveApi ? (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>
            ) : w.reliability && w.reliability < 70 ? (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-warning)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>ESTIMATE</span>
            ) : null}
            
            <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {w.unit && <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>(단위: {w.unit})</span>}
            </div>
          </h3>
          {(w.source || methodologyText) && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {[w.source, methodologyText].filter(Boolean).join(' | ')}
            </p>
          )}
        </div>

        {/* Chart Area */}
        <div style={{ height: '375px', width: '100%', marginBottom: '1.5rem', position: 'relative', zIndex: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            {renderChart(w)}
          </SafeResponsiveContainer>
        </div>

        {/* Takeaway Box (참치 TakeawayBox 컴포넌트 동기화) */}
        {(situation || takeaway) && (
          <div style={{ marginTop: 'auto' }}>
            <TakeawayBox
              situation={situation}
              takeaway={takeaway}
              source={w.source}
            />
          </div>
        )}
      </div>
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
