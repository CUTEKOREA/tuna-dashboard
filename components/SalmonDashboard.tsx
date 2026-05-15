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
  Database, Ship, Zap, BookOpen, ChevronUp, ChevronDown
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import SalmonInsightSmolt from './SalmonInsightSmolt';
import SalmonInsightFeed from './SalmonInsightFeed';
import SalmonInsightProcessing from './SalmonInsightProcessing';
import SalmonInsightClimate from './SalmonInsightClimate';
import SalmonInsightFeedBio from './SalmonInsightFeedBio';
import SalmonInsightAutomationYield from './SalmonInsightAutomationYield';
import SalmonInsightSmartColdChain from './SalmonInsightSmartColdChain';
import SalmonInsightGlobalSupplyPrice from './SalmonInsightGlobalSupplyPrice';
import SalmonInsightDoubleMateriality from './SalmonInsightDoubleMateriality';
import SalmonInsightTradeDown from './SalmonInsightTradeDown';
import SalmonInsightMarginSqueeze from './SalmonInsightMarginSqueeze';
import SalmonInsightLogisticsResilience from './SalmonInsightLogisticsResilience';
import ExchangeSimulator from './ExchangeSimulator';
import SalmonLiveTicker from './SalmonLiveTicker';
import SalmonNTBRadar from './SalmonNTBRadar';
import SalmonForecastSimulator from './SalmonForecastSimulator';
import SalmonESGTracker from './SalmonESGTracker';
import SalmonPolicyImpact from './SalmonPolicyImpact';
import styles from './MackerelStrategy.module.css';
import TakeawayBox from './TakeawayBox';

/* ─── V4.0 S-Grade: Salmon Monochromatic Theme (Rose/Coral) ─── */
const SALMON_THEME = {
  primary: '#ec4899',
  secondary: '#f43f5e',
  tertiary: '#fb7185',
  quaternary: '#fda4af',
  neutral: '#fecdd3',
  gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
  gradientText: 'linear-gradient(135deg, #fda4af, #ec4899)',
};

/* ─── V4.0 D-05: X-Axis Label Forensic Truncation ─── */
const xFmt = (label: string): string => {
  if (!label || typeof label !== 'string') return '';
  const cleaned = label.replace(/\s*\([^)]*\)$/g, '').trim();
  return cleaned.length > 6 ? cleaned.slice(0, 6) : cleaned;
};

/* ─── 5-Pillar Section Colors ─── */
const PILLAR_COLORS: Record<string, { accent: string; bg: string }> = {
  raw:     { accent: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  proc:    { accent: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  logis:   { accent: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  sales:   { accent: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  esg:     { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  forecast:{ accent: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  policy:  { accent: '#f97316', bg: 'rgba(249,115,22,0.15)' },
};

/* ─── Custom Tooltip ─── */
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

const PIE_COLORS = [SALMON_THEME.primary, SALMON_THEME.secondary, SALMON_THEME.tertiary, SALMON_THEME.quaternary, SALMON_THEME.neutral, '#be185d', '#db2777', '#f472b6'];

/* ─── KPI Themes ─── */
const KPI_THEMES = [
  { border: 'rgba(236, 72, 153, 0.5)', glow: 'rgba(236, 72, 153, 0.25)', text: SALMON_THEME.primary, icon: Database },
  { border: 'rgba(244, 63, 94, 0.5)', glow: 'rgba(244, 63, 94, 0.25)', text: SALMON_THEME.secondary, icon: AlertTriangle },
  { border: 'rgba(251, 113, 133, 0.5)', glow: 'rgba(251, 113, 133, 0.25)', text: SALMON_THEME.tertiary, icon: TrendingUp },
  { border: 'rgba(253, 164, 175, 0.5)', glow: 'rgba(253, 164, 175, 0.25)', text: SALMON_THEME.quaternary, icon: ShieldCheck },
  { border: 'rgba(254, 205, 211, 0.5)', glow: 'rgba(254, 205, 211, 0.25)', text: SALMON_THEME.neutral, icon: Factory },
  { border: 'rgba(190, 24, 93, 0.5)', glow: 'rgba(190, 24, 93, 0.25)', text: '#be185d', icon: Scale },
];

/* ─── Widget Icons ─── */
const WIDGET_ICONS: Record<string, any> = {
  w13_monopoly: Anchor, w14_value: TrendingUp, w15_korea_deficit: AlertTriangle, 
  w16_processing: Factory, w17_tier: DollarSign, w18_extinction: Globe,
  w19_iceland: Zap, w20_margin_paradox: Scale, w21_russia_blackhole: AlertCircle,
  w22_license_gold: Database, w23_chile_chokepoint: Crosshair, w24_poland_hub: Truck,
  w12_margin: TrendingUp, w08_import: Globe, n1_hfs_paradox: Factory, 
  n2_tariff_hoarding: ShieldCheck, n3_melanosis_upcycle: Activity,
  k1_ras_photoperiod: Zap, k2_smolt_offseason: Activity, k3_temp_cataract: AlertTriangle,
  k4_listeria: ShieldCheck, k5_nutrition: Scale, k6_jerky: Factory,
  k7_chum_coastal: MapPin, k8_chinook: Fish,
};

const formatYAxis = (v: number, unit?: string) => {
  let formatted: string | number = v;
  if (v >= 1000000) formatted = (v / 1000000).toFixed(1) + 'M';
  else if (v >= 1000) formatted = (v / 1000).toFixed(0) + 'k';
  return formatted + (unit ? ` ${unit}` : '');
};

const TelemetryBadge = ({ status, syncDate }: { status: 'live' | 'synced' | 'static' | undefined; syncDate?: string }) => {
  if (!status) return null;
  const isLive = status === 'live';
  const isSynced = status === 'synced';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
      <div style={{ position: 'relative', width: '6px', height: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isLive && <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#10b981', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />}
        <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: isLive ? '#10b981' : isSynced ? '#3b82f6' : '#64748B' }} />
      </div>
      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isLive ? '#10b981' : isSynced ? '#3b82f6' : '#64748B', letterSpacing: '0.5px' }}>
        {isLive ? 'LIVE' : isSynced ? 'SYNCED' : 'STATIC'}
      </span>
      {!isLive && syncDate && (
        <span style={{ fontSize: '0.56rem', fontWeight: 500, color: '#64748B', marginLeft: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px', display: 'inline-block', verticalAlign: 'bottom' }}>
          {syncDate}
        </span>
      )}
    </div>
  );
};


export default function SalmonDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showEdu, setShowEdu] = useState(true);
  const [simulationFactors, setSimulationFactors] = useState({ nok: 0, eur: 0, mgo: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const [apiData, setApiData] = useState<any>({});

  useEffect(() => {
    fetch('/data/salmon_real_data_v4.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load salmon data", err));

    Promise.all([
      fetch('/api/salmon/kcs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'live', hsCode: 'fresh' }) }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/salmon/kamis').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/salmon/comtrade').then(r => r.ok ? r.json() : null).catch(() => null)
    ]).then(([kcs, kamis, comtrade]) => {
      setApiData({ kcs, kamis, comtrade });
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setActiveModal(null);
      }
    };
    if (activeModal) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeModal]);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: SALMON_THEME.primary, animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading Intelligence...</p>
    </div>
  );

  const { kpis, widgets } = data;
  const kpiKeys = Object.keys(kpis);

  /* ─── Unified Chart Renderer ─── */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;
    const chartType = (widget.chartType || '').toLowerCase();

    // NEW FORMAT (Claude widgets)
    if (widget.xKey || widget.bars || widget.lines || widget.areas) {
      const xKeyVal = widget.xKey || widget.xAxis || 'Year';
      switch(chartType) {
        case "pie":
          return (
            <PieChart>
              <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={35}
                label={({name, value, percent}: any) => percent > 0.03 ? `${name} ${typeof value === 'number' ? value.toLocaleString() : value}` : ''} labelLine={false} fontSize={10}>
                {d.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            </PieChart>
          );
        case "area":
          return (
            <AreaChart data={d}>
              <defs>
                {(widget.areas || widget.lines)?.map((a: any, i: number) => (
                  <linearGradient key={i} id={`sArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.color || a.stroke || a.fill} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={a.color || a.stroke || a.fill} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={xKeyVal} stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => xFmt(String(v))} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {(widget.areas || widget.lines)?.map((a: any, i: number) => (
                <Area key={i} type="monotone" dataKey={a.key || a.dataKey} stroke={a.color || a.stroke || a.fill} fill={`url(#sArea${widget.id}_${i})`} strokeWidth={2.5} />
              ))}
            </AreaChart>
          );
        case "line":
          return (
            <LineChart data={d}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={xKeyVal} stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => xFmt(String(v))} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} type="monotone" dataKey={l.key || l.dataKey} stroke={l.color || l.stroke || l.fill} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </LineChart>
          );
        case "bar":
          return (
            <BarChart data={d}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={xKeyVal} stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => xFmt(String(v))} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {widget.bars?.map((b: any, i: number) => (
                <Bar key={`b${i}`} dataKey={b.key || b.dataKey} fill={b.color || b.fill} radius={[6,6,0,0]} fillOpacity={0.85} />
              ))}
            </BarChart>
          );
        case "composed":
          return (
            <ComposedChart data={d}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={xKeyVal} stroke="#64748b" tick={{fontSize:10}} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {widget.bars?.map((b: any, i: number) => (
                <Bar key={`b${i}`} yAxisId="left" dataKey={b.key || b.dataKey} fill={b.color || b.fill} radius={[6,6,0,0]} fillOpacity={0.85} />
              ))}
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} yAxisId="left" type="monotone" dataKey={l.key || l.dataKey} stroke={l.color || l.stroke || l.fill} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </ComposedChart>
          );
        default:
          return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
      }
    }

    // OLD FORMAT (Legacy widgets)
    const xAxis = widget.xAxis || 'Year';
    const series = widget.series || [];
    const hasRightAxis = series.some((s: any) => s.yAxisId === 'right');

    switch(chartType) {
      case "pie":
        return (
          <PieChart>
            <Pie data={d} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name"
              label={({name, value, percent}: any) => percent > 0.03 ? `${name} ${typeof value === 'number' ? value.toLocaleString() : value}` : ''} labelLine={false} fontSize={10}>
              {d.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
          </PieChart>
        );
      case "line":
        return (
          <LineChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => xFmt(String(v))} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
            {series.map((s: any, i: number) => (
              <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => xFmt(String(v))} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
            {series.map((s: any, i: number) => (
              <Area key={i} type="monotone" dataKey={s.dataKey} stroke={s.color} fill={s.color} fillOpacity={0.5} strokeWidth={2} />
            ))}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => xFmt(String(v))} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
            {series.map((s: any, i: number) => (
              <Bar key={i} dataKey={s.dataKey} fill={s.color} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => xFmt(String(v))} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
            {series.map((s: any, i: number) => {
              if (s.type === 'line') return <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2.5} dot={{r: 3}} />;
              if (s.type === 'scatter') return <Scatter key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} fill={s.color} />;
              return <Bar key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} fill={s.color} radius={[6, 6, 0, 0]} />;
            })}
          </ComposedChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
    }
  };

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '8px', 
              background: SALMON_THEME.gradient, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Fish size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px',
                background: SALMON_THEME.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                대서양 연어 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Atlantic Salmon Strategic Command Center v4.0 — 35 Widgets · 5 Pillars · 6 KPIs · 3 Live APIs</p>
            </div>
          </div>
          <div style={{ 
            fontSize: '0.8rem', padding: '0.5rem 1rem', 
            background: '#181818', border: '1px solid rgba(236, 72, 153, 0.2)', 
            borderRadius: '8px', color: '#94a3b8', fontWeight: 500
          }}>
            <span style={{ color: SALMON_THEME.primary }}>FishStatJ 1950-2024 + KFAS</span> · Claude Verified
          </div>
        </div>
      </header>

      {/* ═══ 6 KPIs ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {kpiKeys.map((key, idx) => {
          const kpi = kpis[key];
          const theme = KPI_THEMES[idx % KPI_THEMES.length];
          const IconComp = theme.icon;
          const parsed = parseAnimatedValue(kpi.value);
          return (
            <div key={key} className="ds-card" style={{background: '#181818',
              border: 'none', borderRadius: '8px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'all 0.3s ease', cursor: 'default',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
              position: 'relative', overflow: 'hidden'}}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--surface-3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#181818'; }}
            >
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '80%' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    {kpi.title}
                  </span>
                  {(kpi.telemetry || (key === 'kpi3' && apiData.kamis) || (key === 'kpi6' && apiData.kcs)) && (
                    <TelemetryBadge 
                      status={((key === 'kpi3' && apiData.kamis) || (key === 'kpi6' && apiData.kcs)) ? 'live' : kpi.telemetry as any} 
                      syncDate={((key === 'kpi3' && apiData.kamis) || (key === 'kpi6' && apiData.kcs)) ? '실시간 연동중' : kpi.syncDate} 
                    />
                  )}
                </div>
                <IconComp size={16} style={{ color: theme.text, flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                {key === 'kpi3' && apiData.kamis && Array.isArray(apiData.kamis.data) && apiData.kamis.data.length > 0 ? `₩${parseInt(apiData.kamis.data[0].price).toLocaleString()} / 100g` 
                 : key === 'kpi6' && apiData.kcs && Array.isArray(apiData.kcs.data) ? `$${Math.floor(apiData.kcs.data.reduce((acc: number, item: any) => acc + (item.balPayments || 0), 0) / 1000).toLocaleString()}K`
                 : parsed ? (
                  <CountUp end={parsed.numberVal} duration={2} separator="," decimals={parsed.decimals} prefix={parsed.prefix} suffix={parsed.suffix} />
                ) : kpi.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: theme.text, fontWeight: 600 }}>
                <span style={{ background: `${theme.text}20`, padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>{kpi.trend}</span>
                {kpi.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Module A: 실시간 연어 무역 인텔리전스 티커 ═══ */}
      <SalmonLiveTicker />

      {/* ═══ Macro Simulator ═══ */}
      <ExchangeSimulator onSimulationChange={setSimulationFactors} />

      {/* ═══ Education Module ═══ */}
      <div className="ds-card" style={{marginBottom: '2.5rem', background: '#181818', border: 'none', borderRadius: '8px', overflow: 'hidden', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
        <button onClick={() => setShowEdu(!showEdu)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem', background: '#181818', border: 'none', borderBottom: 'none', color: '#f8fafc', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(90deg, rgba(236, 72, 153, 0.25), rgba(244, 63, 94, 0.1))'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(90deg, rgba(236, 72, 153, 0.15), rgba(244, 63, 94, 0.05))'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={22} color="#ec4899" />
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'block' }}>신입직원 교육 가이드</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>NotebookLM 분석 기반: 연어 산업 밸류체인 및 글로벌 시장 리스크 점검</span>
            </div>
          </div>
          {showEdu ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
        </button>
        
        {showEdu && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {/* Module 1 */}
              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '10px', border: 'none' }}>
                <h3 style={{ color: SALMON_THEME.primary, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Fish size={16}/> 패러다임 전환 (원물)
                </h3>
                <div style={{ padding: '1rem', background: '#181818', borderLeft: `3px solid ${SALMON_THEME.primary}`, borderRadius: '4px' }}>
                  <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>자연산 어획 종식 및 양식 주도</h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                    상업용 연어 어획은 0.06%에 불과하며, 양식이 압도적 비중(99.94%)을 차지합니다. 특히 노르웨이와 칠레의 양강 복점(Duopoly) 체제가 생산을 장악하고 있으며, 제한된 노르웨이 양식 면허는 가치가 급등하는 핵심 자산입니다.
                  </p>
                </div>
              </div>

              {/* Module 2 */}
              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '10px', border: 'none' }}>
                <h3 style={{ color: SALMON_THEME.primary, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Factory size={16}/> 가공 및 부가가치 창출
                </h3>
                <div style={{ padding: '1rem', background: '#181818', borderLeft: `3px solid ${SALMON_THEME.primary}`, borderRadius: '4px' }}>
                  <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>폴란드의 재수출 허브 모델</h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                    연어 양식장이 전혀 없는 폴란드가 유럽 최대 연어 가공국으로 부상했습니다. 노르웨이산 원물을 수입하여 훈제 등 2차 가공 후 재수출함으로써 안정적이고 거대한 순이익을 창출하는 구조입니다.
                  </p>
                </div>
              </div>
              
              {/* Module 3 */}
              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '10px', border: 'none' }}>
                <h3 style={{ color: SALMON_THEME.primary, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <AlertTriangle size={16}/> 한국 시장의 한계 (물류/판매)
                </h3>
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444', borderRadius: '4px' }}>
                  <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>높은 의존도 및 무역 적자 누적</h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                    신선 연어 소비가 늘고 있음에도, 여전히 냉동 원물 비중이 큽니다. 특히 단일국가(칠레) 편중이 심각해 가격 변동 리스크에 직접 노출되어 있습니다. 수입 다변화와 자체 가공 인프라 확보가 시급합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Chatbot Action Banner */}
            <div style={{ 
              marginTop: '1rem',
              background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.05))',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              borderRadius: '10px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '50%', flexShrink: 0 }}>
                  <Database size={24} color="#ec4899" />
                </div>
                <div>
                  <h3 style={{ color: SALMON_THEME.primary, margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} /> 연어 지식 AI 챗봇 (NotebookLM)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    100여 개의 사내 연어 분석 보고서와 글로벌 수급 데이터를 학습한 맞춤형 AI입니다. 연어 시장 동향, 양식 밸류체인 등을 자유롭게 질문하세요.
                  </p>
                </div>
              </div>
              <a href="https://notebooklm.google.com/notebook/daced2ab-bb2a-4626-8211-5d102c11ce07" target="_blank" rel="noreferrer" style={{ 
                background: SALMON_THEME.gradient, 
                color: 'var(--text-primary)', 
                padding: '0.8rem 1.5rem', 
                borderRadius: '8px', 
                fontSize: '0.95rem', 
                fontWeight: 700, 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(236, 72, 153, 0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Activity size={18} /> 챗봇 시작하기
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Dashboard Sections ═══ */}
      {(() => {
        const catRaw = ['n1_hfs_paradox', 'w01_paradigm', 'w18_extinction', 'w03_aqua_pie', 'w13_monopoly', 'w19_iceland', 'w22_license_gold', 'k1_ras_photoperiod', 'k2_smolt_offseason', 'k3_temp_cataract', 'k7_chum_coastal', 'k8_chinook'];
        const catProc = ['w04_proc', 'w16_processing', 'w24_poland_hub', 'k5_nutrition', 'k6_jerky'];
        const catLog = ['n2_tariff_hoarding', 'w06_trade_vol', 'w07_export', 'w08_import', 'w21_russia_blackhole', 'w23_chile_chokepoint', 'k4_listeria'];
        const catSales = ['w05_cash', 'w09_kr_import', 'w10_kr_deficit', 'w15_korea_deficit', 'w11_kr_price', 'w12_margin', 'w20_margin_paradox', 'w17_tier'];
        const catEsg = ['n3_melanosis_upcycle', 'w02_aqua_value', 'w14_value'];

        const renderSection = (title: string, icon: any, keys: string[], pillarKey: string, desc?: string, customInsights?: React.ReactNode) => {
          const sectionWidgets = widgets.filter((w: any) => keys.includes(w.id));
          if (sectionWidgets.length === 0 && !customInsights) return null;
          const pc = PILLAR_COLORS[pillarKey] || PILLAR_COLORS.raw;
          
          return (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ padding:'1rem 1.5rem', background:`linear-gradient(90deg, ${pc.bg} 0%, transparent 100%)`, borderLeft:`4px solid ${pc.accent}`, marginBottom:'1.5rem', marginTop:'1rem', borderRadius: '0 8px 8px 0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  {React.createElement(icon, { size: 22, color: pc.accent })}
                  <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>{title}</h2>
                </div>
                {desc && <p style={{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'#94a3b8' }}>{desc}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {customInsights}
                {sectionWidgets.map((w: any) => renderWidgetCard(w))}
              </div>
            </div>
          );
        };

        return (
          <>
            {renderSection('🌾 원물 수급', Fish, catRaw, 'raw', '노르웨이·칠레 복점 체제, 양식 면허 가치, 기후 리스크 등 원물 조달의 근본적 제약과 기회', (
              <>
                <SalmonInsightSmolt />
                <SalmonInsightFeed />
                <SalmonInsightFeedBio />
              </>
            ))}
            {renderSection('🏭 가공 산업', Factory, catProc, 'proc', '폴란드 재수출 모델, 2차 가공 부가가치, 자동화 수율 혁신 및 마진 방어 전략', (
              <>
                <SalmonInsightProcessing />
                <SalmonInsightAutomationYield />
                <SalmonInsightMarginSqueeze />
              </>
            ))}

            {/* ═══ Module C: AI 수급 전망 & 착지원가 시뮬레이터 ═══ */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ padding:'1rem 1.5rem', background:`linear-gradient(90deg, ${PILLAR_COLORS.forecast.bg} 0%, transparent 100%)`, borderLeft:`4px solid ${PILLAR_COLORS.forecast.accent}`, marginBottom:'1.5rem', marginTop:'1rem', borderRadius: '0 8px 8px 0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <Crosshair size={22} color={PILLAR_COLORS.forecast.accent} />
                  <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>착지원가 및 AI 전망</h2>
                </div>
                <p style={{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'#94a3b8' }}>환율·유가·사료 시나리오 기반 착지원가 시뮬레이션 및 수급 전망</p>
              </div>
              <SalmonForecastSimulator />
            </div>

            {renderSection('🚢 물류 및 통관', Truck, catLog, 'logis', '콜드체인 리질리언스, 비관세장벽(NTB) 레이더, 관세 헷징 전략', (
              <>
                <SalmonInsightSmartColdChain />
                <SalmonInsightLogisticsResilience />
                <SalmonNTBRadar />
              </>
            ))}
            {renderSection('🛒 판매 및 수요', DollarSign, catSales, 'sales', '글로벌 수급 가격, 소매가 전가(그리드플레이션), 대체재 교차탄력성 분석', (
              <>
                <SalmonInsightGlobalSupplyPrice simulationFactors={simulationFactors} />
                <SalmonInsightTradeDown />
              </>
            ))}
            {renderSection('🌍 ESG 및 지속가능성', ShieldCheck, catEsg, 'esg', '기후 리스크, 이중 중대성 평가, 탄소 발자국 추적 및 자산 가치 평가', (
              <>
                <SalmonInsightClimate />
                <SalmonInsightDoubleMateriality />
                <SalmonESGTracker />
              </>
            ))}

            {/* ═══ Module E: 정책 임팩트 시뮬레이터 ═══ */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ padding:'1rem 1.5rem', background:`linear-gradient(90deg, ${PILLAR_COLORS.policy.bg} 0%, transparent 100%)`, borderLeft:`4px solid ${PILLAR_COLORS.policy.accent}`, marginBottom:'1.5rem', marginTop:'1rem', borderRadius: '0 8px 8px 0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <Globe size={22} color={PILLAR_COLORS.policy.accent} />
                  <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>정책 임팩트 시뮬레이션</h2>
                </div>
                <p style={{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'#94a3b8' }}>관세·IUU 규제·탄소세 등 정책 변동 시나리오의 수익성 영향 분석</p>
              </div>
              <SalmonPolicyImpact />
            </div>
          </>
        );
      })()}

    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const accentColor = SALMON_THEME.primary;
    
    // Get methodology text (supports both old "methodology" and new "logic" field)
    const methodologyText = w.logic || w.methodology || '';
    // Get situation and takeaway (supports both old and new field names)
    const situation = w.sit || w.situation || w.desc || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    
    return (
      <div key={w.id} className="ds-card" style={{display: 'flex', flexDirection: 'column', minHeight: '480px',
        background: '#181818', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none',
        padding: '1.5rem'}}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            <IconComp size={20} color={accentColor} />
            {w.title} 
            {w.isLiveApi ? (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(236,72,153,0.1)', border:'1px solid #ec4899', color: SALMON_THEME.primary, fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>
            ) : w.reliability && w.reliability < 70 ? (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(253,164,175,0.1)', border:'1px solid #fda4af', color: SALMON_THEME.quaternary, fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>ESTIMATE</span>
            ) : null}
            
            <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {w.unit && <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>(단위: {w.unit})</span>}
            </div>
          </h3>
          {(w.subtitle || methodologyText) && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {[w.subtitle, methodologyText].filter(Boolean).join(' | ')}
            </p>
          )}
        </div>

        {/* Chart Area */}
        <div style={{ height: '250px', width: '100%', marginBottom: '1.5rem', position: 'relative', zIndex: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            {renderChart(w)}
          </SafeResponsiveContainer>
        </div>

        {/* Takeaway Box */}
        {(situation || takeaway) && (
          <div style={{ marginTop: 'auto' }}>
            <TakeawayBox
              situation={situation}
              actionPlan={takeaway}
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
