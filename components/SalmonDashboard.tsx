"use client";

import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Scatter
} from 'recharts';
import { 
  TrendingUp, Fish, Anchor, Globe, DollarSign, 
  Activity, AlertTriangle, ShieldCheck, AlertCircle,
  RefreshCcw, Crosshair, MapPin, Factory, Truck, Scale,
  Database, Zap
} from 'lucide-react';
import WidgetCard from './WidgetCard';
import { TelemetryBadge } from './TelemetryBadge';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';
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
import SalmonNTBRadar from './SalmonNTBRadar';
import SalmonForecastSimulator from './SalmonForecastSimulator';
import SalmonESGTracker from './SalmonESGTracker';
import SalmonPolicyImpact from './SalmonPolicyImpact';
import styles from './MackerelStrategy.module.css';

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
  w_fta_salmon_supply_pivot: Globe, w_fta_salmon_russia_collapse: AlertTriangle,
  w_fta_salmon_form_shift: Factory, w_fta_salmon_chile_rebound: TrendingUp,
  w_fta_salmon_value_volume: DollarSign,
};

const formatYAxis = (v: number, unit?: string) => {
  let formatted: string | number = v;
  if (v >= 1000000) formatted = (v / 1000000).toFixed(1) + 'M';
  else if (v >= 1000) formatted = (v / 1000).toFixed(0) + 'k';
  return formatted + (unit ? ` ${unit}` : '');
};

// 5-Pillar 네비게이터 메타 (연어 시그니처 그라디언트 — salmon pink → coral 살색 컨셉)
const SALMON_SECTIONS = [
  { id: 'S1', num: '❶', label: '원료 수급', pillarKey: 'raw', color: '#fb7185' },
  { id: 'S2', num: '❷', label: '가공·생산', pillarKey: 'proc', color: '#f43f5e' },
  { id: 'S3', num: '❸', label: '물류·통관', pillarKey: 'logis', color: '#ec4899' },
  { id: 'S4', num: '❹', label: '판매·수요', pillarKey: 'sales', color: '#e11d48' },
  { id: 'S5', num: '❺', label: 'ESG·지속가능성', pillarKey: 'esg', color: '#be123c' },
];

// 패턴 I: 헤더 위젯 카운트는 하드코딩 금지 — JSON widgets.length + 인사이트 모듈 수로 동적 산출.
// 인사이트 모듈 16종: S1(Smolt·Feed·FeedBio·ForecastSimulator) + S2(Processing·AutomationYield·MarginSqueeze)
// + S3(SmartColdChain·LogisticsResilience·NTBRadar) + S4(GlobalSupplyPrice·TradeDown)
// + S5(Climate·DoubleMateriality·ESGTracker·PolicyImpact). 모듈 추가/삭제 시 이 상수를 갱신할 것.
const INSIGHT_MODULE_COUNT = 16;

export default function SalmonDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [simulationFactors] = useState({ nok: 0, eur: 0, mgo: 0 });
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
      <p style={{ color: 'var(--w-slate-400)', fontSize: '1rem' }}>Loading Intelligence...</p>
    </div>
  );

  const { kpis, widgets } = data;
  const kpiKeys = Object.keys(kpis);

  // L-09/L-12: 라우트가 isLive === true 로 응답하고 실데이터가 있을 때만 LIVE.
  // 폴백 응답도 truthy 객체이므로 객체 존재 여부만으로 LIVE 격상 금지 (가짜 LIVE 방지).
  const kamisSalmon = apiData.kamis?.isLive === true && Array.isArray(apiData.kamis?.commodities)
    ? apiData.kamis.commodities.find((c: any) => String(c.name || '').includes('연어')) || null
    : null;
  const kcsLive = apiData.kcs?.isLive === true && Array.isArray(apiData.kcs?.data) && apiData.kcs.data.length > 0;

  /* ─── Unified Chart Renderer ─── */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--w-slate-500)'}}>데이터 없음</div>;
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
              <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={xKeyVal} stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={(v) => xFmt(String(v))} minTickGap={20} />
              <YAxis stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" />
              {(widget.areas || widget.lines)?.map((a: any, i: number) => (
                <Area key={i} type="monotone" dataKey={a.key || a.dataKey} stroke={a.color || a.stroke || a.fill} fill={`url(#sArea${widget.id}_${i})`} strokeWidth={2.5} />
              ))}
            </AreaChart>
          );
        case "line":
          return (
            <LineChart data={d}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={xKeyVal} stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={(v) => xFmt(String(v))} minTickGap={20} />
              <YAxis stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" />
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} type="monotone" dataKey={l.key || l.dataKey} stroke={l.color || l.stroke || l.fill} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </LineChart>
          );
        case "bar":
          return (
            <BarChart data={d}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={xKeyVal} stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={(v) => xFmt(String(v))} minTickGap={20} />
              <YAxis stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(140,170,255,0.10)'}} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" />
              {widget.bars?.map((b: any, i: number) => {
                const p = getA11yBarProps(i);
                return <Bar key={`b${i}`} dataKey={b.key || b.dataKey} fill={p.fill} color={(b.color || b.fill) || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
              })}
            </BarChart>
          );
        case "composed":
          return (
            <ComposedChart data={d}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={xKeyVal} stroke="var(--w-slate-500)" tick={{fontSize:10}} minTickGap={20} />
              <YAxis yAxisId="left" stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" />
              {widget.bars?.map((b: any, i: number) => {
                const p = getA11yBarProps(i);
                return <Bar key={`b${i}`} yAxisId="left" dataKey={b.key || b.dataKey} fill={p.fill} color={(b.color || b.fill) || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
              })}
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} yAxisId="left" type="monotone" dataKey={l.key || l.dataKey} stroke={l.color || l.stroke || l.fill} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </ComposedChart>
          );
        default:
          return <div style={{color:'var(--w-slate-500)',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => xFmt(String(v))} minTickGap={20} />
            <YAxis yAxisId="left" stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" />
            {series.map((s: any, i: number) => (
              <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => xFmt(String(v))} minTickGap={20} />
            <YAxis stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" />
            {series.map((s: any, i: number) => (
              <Area key={i} type="monotone" dataKey={s.dataKey} stroke={s.color} fill={s.color} fillOpacity={0.5} strokeWidth={2} />
            ))}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => xFmt(String(v))} minTickGap={20} />
            <YAxis stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(140,170,255,0.10)'}} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" />
            {series.map((s: any, i: number) => {
              const p = getA11yBarProps(i);
              return <Bar key={i} dataKey={s.dataKey} fill={p.fill} color={s.color || p.color} radius={[6, 6, 0, 0]} />;
            })}
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => xFmt(String(v))} minTickGap={20} />
            <YAxis yAxisId="left" stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="var(--w-slate-400)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" />
            {series.map((s: any, i: number) => {
              if (s.type === 'line') return <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2.5} dot={{r: 3}} />;
              if (s.type === 'scatter') return <Scatter key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} fill={s.color} />;
              const p = getA11yBarProps(i);
              return <Bar key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} fill={p.fill} color={s.color || p.color} radius={[6, 6, 0, 0]} />;
            })}
          </ComposedChart>
        );
      default:
        return <div style={{color:'var(--w-slate-500)',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
    }
  };

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--w-slate-50)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
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
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--w-slate-500)' }}>V4.2 커맨드 센터 - {widgets.length + INSIGHT_MODULE_COUNT} 위젯 · {SALMON_SECTIONS.length} 필라 · {kpiKeys.length} KPI · API 연동 3종(KCS·KAMIS·Comtrade)</p>
            </div>
          </div>
          <div style={{ 
            fontSize: '0.8rem', padding: '0.5rem 1rem', 
            background: '#11182f', border: '1px solid rgba(var(--w-pink-500-rgb), 0.2)',
            borderRadius: '8px', color: 'var(--w-slate-400)', fontWeight: 500
          }}>
            <span style={{ color: SALMON_THEME.primary }}>FishStatJ 1950-2024 + KFAS</span> · 정적 데이터셋
          </div>
        </div>
      </header>

      {/* ═══ 6 KPIs ═══ */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {kpiKeys.map((key, idx) => {
          const kpi = kpis[key];
          const theme = KPI_THEMES[idx % KPI_THEMES.length];
          const IconComp = theme.icon;
          const parsed = parseAnimatedValue(kpi.value);
          return (
            <div key={key} className="ds-card" style={{background: 'rgba(24,24,24,0.85)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(140,170,255,0.12)', borderRadius: '8px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'all 0.3s ease', cursor: 'default',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
              position: 'relative', overflow: 'hidden'}}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(30,30,30,0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(24,24,24,0.85)'; }}
            >
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '80%' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    {kpi.title}
                  </span>
                  {(() => {
                    // L-09: kpi3(KAMIS 시세)·kpi6(KCS 무역수지)은 라우트가 isLive:true로 응답하고
                    // 실데이터가 있을 때만 LIVE 표기. 그 외에는 JSON telemetry(STATIC)+기준일 정직 노출.
                    const liveResolved = (key === 'kpi3' && !!kamisSalmon) || (key === 'kpi6' && kcsLive);
                    const badgeStatus = liveResolved ? 'live' : String(kpi.telemetry || 'static').toLowerCase();
                    const badgeSync = liveResolved ? '실시간 연동중' : kpi.syncDate;
                    if (!kpi.telemetry && !liveResolved) return null;
                    return <TelemetryBadge status={badgeStatus as any} syncDate={badgeSync} />;
                  })()}
                </div>
                <IconComp size={16} style={{ color: theme.text, flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--w-slate-50)' }}>
                {key === 'kpi3' && kamisSalmon ? `₩${Math.round(kamisSalmon.currentPrice).toLocaleString()} / ${kamisSalmon.unit || 'kg'}`
                 : key === 'kpi6' && kcsLive ? `$${Math.abs(Math.floor(apiData.kcs.data.reduce((acc: number, item: any) => acc + (item.balPayments || 0), 0) / 1000)).toLocaleString()}K`
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




      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem', marginTop: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px', borderBottom: '1px solid rgba(140,170,255,0.10)', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            밸류체인 네비게이터 - 아래 단계를 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {SALMON_SECTIONS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button key={s.id}
                onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(140,170,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${s.color}40`; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; } }}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '12px 8px 14px',
                  background: isActive ? `${s.color}12` : 'transparent',
                  border: `1.5px solid ${isActive ? s.color : 'transparent'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                  overflow: 'hidden',
                }}>
                {isActive && (<div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
                  background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, borderRadius: '3px 3px 0 0' }} />)}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? s.color : 'rgba(140,170,255,0.12)',
                  color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)',
                  fontSize: '0.75rem', fontWeight: 800,
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Dashboard Sections ═══ */}
      {(() => {
        const catRaw = ['w_fta_salmon_supply_pivot', 'w_fta_salmon_russia_collapse', 'n1_hfs_paradox', 'w01_paradigm', 'w18_extinction', 'w03_aqua_pie', 'w13_monopoly', 'w19_iceland', 'w22_license_gold', 'w36_supply_outlook', 'w37_smolt_efficiency', 'w39_hab_risk', 'w41_feed_cost', 'k1_ras_photoperiod', 'k2_smolt_offseason', 'k3_temp_cataract', 'k7_chum_coastal', 'k8_chinook', 'w48_eu_import_price', 'w49_duopoly_crack'];
        const catProc = ['w_fta_salmon_form_shift', 'w04_proc', 'w16_processing', 'w24_poland_hub', 'w38_smoked_eu', 'w45_automation_roi', 'k5_nutrition', 'k6_jerky', 'w46_proc_form_shift', 'w50_smoked_value_chain', 'w51_yield_ladder'];
        const catLog = ['w_fta_salmon_chile_rebound', 'n2_tariff_hoarding', 'w06_trade_vol', 'w07_export', 'w08_import', 'w21_russia_blackhole', 'w23_chile_chokepoint', 'k4_listeria', 'w54_asia_price_bench'];
        const catSales = ['w_fta_salmon_value_volume', 'w05_cash', 'w09_kr_import', 'w10_kr_deficit', 'w15_korea_deficit', 'w11_kr_price', 'w12_margin', 'w20_margin_paradox', 'w17_tier', 'w40_market_growth', 'w43_diversification'];
        const catEsg = ['n3_melanosis_upcycle', 'w02_aqua_value', 'w14_value', 'w42_mortality_kpi', 'w44_scope3_carbon', 'w47_feed_fifo'];

        const renderSection = (title: string, icon: any, keys: string[], pillarKey: string, desc?: string, customInsights?: React.ReactNode) => {
          const sectionWidgets = widgets.filter((w: any) => keys.includes(w.id));
          if (sectionWidgets.length === 0 && !customInsights) return null;
          const pc = PILLAR_COLORS[pillarKey] || PILLAR_COLORS.raw;
          
          return (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ padding:'1rem 1.5rem', background:`linear-gradient(90deg, ${pc.bg} 0%, transparent 100%)`, borderLeft:`4px solid ${pc.accent}`, marginBottom:'1.5rem', marginTop:'1rem', borderRadius: '0 8px 8px 0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  {React.createElement(icon, { size: 22, color: pc.accent })}
                  <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--w-slate-50)' }}>{title}</h2>
                </div>
                {desc && <p style={{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'var(--w-slate-400)' }}>{desc}</p>}
              </div>
              <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {customInsights}
                {sectionWidgets.map((w: any) => {
                  const pillarMap: Record<string, 'S1' | 'S2' | 'S3' | 'S4' | 'S5'> = { raw: 'S1', proc: 'S2', logis: 'S3', sales: 'S4', esg: 'S5' };
                  return renderWidgetCard(w, pillarMap[pillarKey] || 'S1');
                })}
              </div>
            </div>
          );
        };

        // activePart에 따라 단일 section 렌더 + extra module(forecast→S1, policy→S5) 자연 통합
        return (
          <>
            {activePart === 'S1' && renderSection('🌾 원물 수급', Fish, catRaw, 'raw', '노르웨이·칠레 복점 체제, 양식 면허 가치, 기후 리스크 등 원물 조달의 근본적 제약과 기회', (
              <>
                <SalmonInsightSmolt />
                <SalmonInsightFeed />
                <SalmonInsightFeedBio />
              </>
            ))}
            {activePart === 'S1' && (
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ padding:'1rem 1.5rem', background:`linear-gradient(90deg, ${PILLAR_COLORS.forecast.bg} 0%, transparent 100%)`, borderLeft:`4px solid ${PILLAR_COLORS.forecast.accent}`, marginBottom:'1.5rem', marginTop:'1rem', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <Crosshair size={22} color={PILLAR_COLORS.forecast.accent} />
                    <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--w-slate-50)' }}>착지원가 및 AI 전망</h2>
                  </div>
                  <p style={{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'var(--w-slate-400)' }}>환율·유가·사료 시나리오 기반 착지원가 시뮬레이션 및 수급 전망</p>
                </div>
                <SalmonForecastSimulator />
              </div>
            )}
            {activePart === 'S2' && renderSection('🏭 가공 산업', Factory, catProc, 'proc', '폴란드 재수출 모델, 2차 가공 부가가치, 자동화 수율 혁신 및 마진 방어 전략', (
              <>
                <SalmonInsightProcessing />
                <SalmonInsightAutomationYield />
                <SalmonInsightMarginSqueeze />
              </>
            ))}
            {activePart === 'S3' && renderSection('🚢 물류 및 통관', Truck, catLog, 'logis', '콜드체인 리질리언스, 비관세장벽(NTB) 레이더, 관세 헷징 전략', (
              <>
                <SalmonInsightSmartColdChain />
                <SalmonInsightLogisticsResilience />
                <SalmonNTBRadar />
              </>
            ))}
            {activePart === 'S4' && renderSection('🛒 판매 및 수요', DollarSign, catSales, 'sales', '글로벌 수급 가격, 소매가 전가(그리드플레이션), 대체재 교차탄력성 분석', (
              <>
                <SalmonInsightGlobalSupplyPrice simulationFactors={simulationFactors} />
                <SalmonInsightTradeDown />
              </>
            ))}
            {activePart === 'S5' && renderSection('🌍 ESG 및 지속가능성', ShieldCheck, catEsg, 'esg', '기후 리스크, 이중 중대성 평가, 탄소 발자국 추적 및 자산 가치 평가', (
              <>
                <SalmonInsightClimate />
                <SalmonInsightDoubleMateriality />
                <SalmonESGTracker />
              </>
            ))}
            {activePart === 'S5' && (
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ padding:'1rem 1.5rem', background:`linear-gradient(90deg, ${PILLAR_COLORS.policy.bg} 0%, transparent 100%)`, borderLeft:`4px solid ${PILLAR_COLORS.policy.accent}`, marginBottom:'1.5rem', marginTop:'1rem', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <Globe size={22} color={PILLAR_COLORS.policy.accent} />
                    <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--w-slate-50)' }}>정책 임팩트 시뮬레이션</h2>
                  </div>
                  <p style={{ margin:'5px 0 0 0', fontSize:'0.85rem', color:'var(--w-slate-400)' }}>관세·IUU 규제·탄소세 등 정책 변동 시나리오의 수익성 영향 분석</p>
                </div>
                <SalmonPolicyImpact />
              </div>
            )}
          </>
        );
      })()}

    </div>
  );

  function renderWidgetCard(w: any, pillar: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' = 'S1') {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const situation = w.sit || w.situation || w.desc || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    const isLive = w.isLiveApi;
    const isEstimate = w.reliability && w.reliability < 70;

    const badgeSuffix = [
      isLive ? '🟢 LIVE API' : '',
      isEstimate ? '📐 추정' : '',
    ].filter(Boolean).join(' · ');

    const cardDescParts = [w.subtitle, badgeSuffix].filter(Boolean);
    const cardDesc = cardDescParts.join(' - ') || '연어 인텔리전스 위젯';

    // L-09: 이 위젯들은 정적 JSON(/data/salmon_real_data_v4.json, FAO FishStatJ 1950-2024)을
    // import할 뿐 실시간 fetch 분기가 없다. isLiveApi가 참인 위젯이 실재하지 않으므로
    // 기본값을 SYNCED(허위 신선도)가 아닌 STATIC으로 둔다. SYNCED는 실 API 연동 시에만.
    const telemetryStatus: 'LIVE' | 'SYNCED' | 'STATIC' =
      isLive ? 'LIVE' : 'STATIC';
    // 패턴 E: 일괄 '2026-05' 빌드월 스탬프는 JSON에서 제거 완료 — 남은 syncDate는 실제
    // 데이터 빈티지이므로 그대로 노출하고, 미기재 시 기본 데이터셋 빈티지 라벨로 폴백(L-09).
    const syncDate = isLive
      ? new Date().toISOString().split('T')[0]
      : (w.syncDate || 'FishStatJ 1950-2024');

    return (
      <WidgetCard
        key={w.id}
        title={w.title}
        icon={IconComp}
        iconColor={SALMON_THEME.primary}
        pillar={pillar}
        cardDesc={cardDesc}
        unit={w.unit}
        telemetry={{ status: telemetryStatus, syncDate }}
        chartHeight={250}
        chart={renderChart(w)}
        takeaway={{ situation, actionPlan: takeaway, source: w.source || 'FAO FishStatJ 1950-2024 (정적 데이터셋) · 일부 지표 자체 추정' }}
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
