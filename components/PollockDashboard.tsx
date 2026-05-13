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
  Database, Ship, Zap, BookOpen, ChevronDown, ChevronUp, MessageSquare
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import TakeawayBox from './TakeawayBox';

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

const PIE_COLORS = ["var(--color-danger)", "var(--color-info)", "var(--color-warning)", "var(--color-success)", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

/* ─── KPI Themes ─── */
const KPI_THEMES = [
  { border: 'rgba(6, 182, 212, 0.5)', glow: 'rgba(6, 182, 212, 0.25)', text: '#06b6d4', icon: Database },
  { border: 'rgba(239, 68, 68, 0.5)', glow: 'rgba(239, 68, 68, 0.25)', text: 'var(--color-danger)', icon: AlertTriangle },
  { border: 'rgba(245, 158, 11, 0.5)', glow: 'rgba(245, 158, 11, 0.25)', text: 'var(--color-warning)', icon: TrendingUp },
  { border: 'rgba(239, 68, 68, 0.5)', glow: 'rgba(239, 68, 68, 0.25)', text: 'var(--color-danger)', icon: ShieldCheck },
  { border: 'rgba(16, 185, 129, 0.5)', glow: 'rgba(16, 185, 129, 0.25)', text: 'var(--color-success)', icon: Factory },
  { border: 'rgba(236, 72, 153, 0.5)', glow: 'rgba(236, 72, 153, 0.25)', text: '#ec4899', icon: Scale },
];

/* ─── Widget Icons ─── */
const WIDGET_ICONS: Record<string, any> = {
  w1_global_catch: Globe, w2_hegemony: AlertTriangle, w3_diverging: Activity,
  w4_korea_crisis: TrendingDown, w5_china_blackhole: Factory, w6_inflation_unitprice: DollarSign,
  w7_usa_russia_unitprice: Scale, w8_korea_deficit: Ship, w9_surimi_megatrend: TrendingUp,
  w10_surimi_top3: BarChart2, w11_surimi_trade: Truck, w12_proc_vs_surimi: Zap,
  w13: MapPin, w14: DollarSign, w15: Factory, w16: Globe, w17: Fish, w18: Crosshair,
  w19_tariff_engineering: DollarSign, w20_whitefish_reshuffle: TrendingUp, w21_b_season_hedge: Activity,
  w22_precision_release: DollarSign, w23_upcycling_esg: Activity,
  w24_opex_spread: DollarSign, w25_processing_bottleneck: Factory, w26_inventory_freight: Truck,
  w27_substitute_spread: TrendingUp, w28_esg_premium: ShieldCheck,
  w29_eu_derisk_pivot: Globe, w30_traceability_risk: AlertCircle, w31_catch_gap: AlertTriangle,
  w32_sst_fleet_matrix: Ship, w33_arbitrage_tracker: Scale,
  n1_sanction_paradox: ShieldCheck, n5_rcep_detour: Globe, n6_waste_to_wealth: Factory,
  k1_3d_surimi: Zap, k2_epa_larva: Fish, k3_gamma_roe: ShieldCheck,
  k4_senior_food: Scale, k5_hatch_temp: Activity,
};

const WIDGET_UNITS: Record<string, string> = {
  w1_global_catch: '톤 (Tonnes)',
  w2_hegemony: '톤 (Tonnes)',
  w3_diverging: '톤 (Tonnes)',
  w4_korea_crisis: '톤 (Tonnes)',
  w5_china_blackhole: '톤 (Tonnes)',
  w6_inflation_unitprice: 'USD/t',
  w7_usa_russia_unitprice: 'USD/t',
  w8_korea_deficit: '천 달러 (USD 1,000)',
  w9_surimi_megatrend: '톤 (Tonnes)',
  w10_surimi_top3: '톤 (Tonnes)',
  w11_surimi_trade: '톤 (Tonnes)',
  w12_proc_vs_surimi: '톤 (Tonnes)',
  w13: '톤 (Tonnes)',
  w14: 'USD/t',
  w15: '물량: 톤(t) / 단가: USD/t',
  w16: '물량: 톤(t) / 단가: USD/t',
  w17: '톤 (Tonnes)',
  w18: '톤 (Tonnes)',
  w19_tariff_engineering: '비율 (%)',
  w20_whitefish_reshuffle: '증감률 (%)',
  w21_b_season_hedge: '체선(주) / 지수',
  w22_precision_release: '비율(%) / 마진율(%)',
  w23_upcycling_esg: '비율 (%)',
  w24_opex_spread: 'USD/t',
  w25_processing_bottleneck: '일(Days) / 비율(%)',
  w26_inventory_freight: '지수/비율',
  w27_substitute_spread: 'USD/t',
  w28_esg_premium: '지수/비율',
  w29_eu_derisk_pivot: '천톤 (1,000t) / 비율(%)',
  w30_traceability_risk: '천톤 (1,000t) / 지수',
  w31_catch_gap: '천톤 (1,000t)',
  w32_sst_fleet_matrix: '지수 / °C (SST)',
  w33_arbitrage_tracker: 'KRW/kg / 마진',
  n1_sanction_paradox: '비율 / 지수',
  n5_rcep_detour: '천톤 (1,000t)',
  n6_waste_to_wealth: '천톤 / 마진율(%)',
  k1_3d_surimi: 'gf / 관능점수',
  k2_epa_larva: '% / mg·g⁻¹',
  k3_gamma_roe: 'log CFU/g · 점수',
  k4_senior_food: 'N/m²',
  k5_hatch_temp: '% / RNA·DNA⁻¹',
};

const formatYAxis = (v: number) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return v;
};

export default function PollockDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isEduOpen, setIsEduOpen] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/pollock_real_data_v4.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load pollock data", err));
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
      <RefreshCcw size={32} style={{ color: '#06b6d4', animation: 'spin 1s linear infinite' }} />
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
                {widget.areas?.map((a: any, i: number) => (
                  <linearGradient key={i} id={`pArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.color} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={a.color} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {widget.areas?.map((a: any, i: number) => (
                <Area key={i} type="monotone" dataKey={a.key} stroke={a.color} fill={`url(#pArea${widget.id}_${i})`} strokeWidth={2.5} />
              ))}
            </AreaChart>
          );
        case "composed":
          const hasRightAxisNew = widget.hasRightAxis || widget.lines?.some((l: any) => l.yAxisId === 'right') || widget.bars?.some((b: any) => b.yAxisId === 'right');
          return (
            <ComposedChart data={d}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              {hasRightAxisNew && <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />}
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {widget.bars?.map((b: any, i: number) => (
                <Bar key={`b${i}`} yAxisId={b.yAxisId || "left"} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
              ))}
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </ComposedChart>
          );
        default:
          return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
      }
    }

    // OLD FORMAT (Gemini widgets)
    const xAxis = widget.xAxis || 'Year';
    const series = widget.series || [];
    const hasRightAxis = series.some((s: any) => s.yAxisId === 'right');

    switch(chartType) {
      case "pie":
        return (
          <PieChart>
            <Pie data={d} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"
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
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />}
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
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
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
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
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
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />}
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

  const renderStrategicInsight = (title: string, background: string, takeaway: string, accentColor: string) => (
    <div style={{
      marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(0, 0, 0, 0.2)', 
      border: `1px solid ${accentColor}50`, borderRadius: '8px', 
      boxShadow: `0 4px 20px ${accentColor}15`
    }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: accentColor, fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
        <Zap size={20} />
        C-Level Strategic Insight: {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <TakeawayBox situation={background} actionPlan={takeaway} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      


      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '8px', 
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
            }}>
              <Fish size={24} color="var(--text-primary)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                명태 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Pollock Strategic Command Center — 41 Widgets · 6 KPIs</p>
            </div>
          </div>
          <div style={{ 
            fontSize: '0.8rem', padding: '0.5rem 1rem', 
            background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(6, 182, 212, 0.2)', 
            borderRadius: '8px', color: '#94a3b8', fontWeight: 500
          }}>
            <span style={{ color: '#06b6d4' }}>FishStatJ 1950-2024 + KFAS</span> · Claude Verified
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
            <div key={key} style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'all 0.3s ease', cursor: 'default',
              boxShadow: `0 0 16px ${theme.glow}`,
              position: 'relative', overflow: 'hidden'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 0 30px ${theme.glow}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 0 16px ${theme.glow}`; }}
            >
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: `radial-gradient(circle, ${theme.glow}, transparent)`, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{kpi.title}</span>
                <IconComp size={14} style={{ color: theme.text }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                {parsed ? (
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

      {/* ═══ Education & Chatbot Module (Foldable) ═══ */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '8px',
        marginBottom: '2rem',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        {/* Toggle Header */}
        <div 
          onClick={() => setIsEduOpen(!isEduOpen)}
          style={{
            padding: '1.2rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: isEduOpen ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
            transition: 'background 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: 'rgba(6, 182, 212, 0.2)', padding: '0.5rem', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={20} color="#06b6d4" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                신입직원 교육 가이드
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                명태 시장의 구조적 이해 및 글로벌 밸류체인 분석
              </p>
            </div>
          </div>
          <div>
            {isEduOpen ? <ChevronUp size={24} color="#94a3b8" /> : <ChevronDown size={24} color="#94a3b8" />}
          </div>
        </div>

        {/* Foldable Content */}
        {isEduOpen && (
          <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              
              {/* Left: Quick Guide */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1.2rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#06b6d4', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Fish size={16} /> 명태 밸류체인 핵심 구조
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  <li><strong>주요 어장:</strong> 베링해(Bering Sea) 및 오호츠크해(Okhotsk Sea) 중심 조업.</li>
                  <li><strong>가공 형태:</strong> H&G(원물), HGT(선동), Fillet(필렛), Surimi(연육) 등으로 분류되며 부가가치 창출 구조 상이.</li>
                  <li><strong>수리미(Surimi) 동향:</strong> 맛살/어묵의 주원료. 아시아 시장 확대와 더불어 글로벌 HMR 수요 증가로 지속적 성장세.</li>
                  <li><strong>지정학적 리스크:</strong> 러시아-우크라이나 이슈에 따른 경제 제재, 중국 의존도 심화 및 서방 국가의 무역 장벽(관세 등)이 가격 변동의 핵심 요인.</li>
                </ul>
              </div>

              {/* Right: NotebookLM Chatbot */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
                  <MessageSquare size={24} color="var(--text-primary)" />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                  명태 지식 AI 챗봇
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '80%' }}>
                  사내 명태 분석 보고서와 글로벌 수급 데이터를 학습한 AI 챗봇입니다. 시장 동향, 리스크, 전략 등을 자유롭게 질문해 보세요.
                </p>
                <a 
                  href="https://notebooklm.google.com/notebook/767b7190-c2b6-447b-aa72-d86e06734031"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'var(--text-primary)',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(16, 185, 129, 0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.3)'; }}
                >
                  <MessageSquare size={16} />
                  AI 챗봇과 대화하기
                </a>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ═══ VALUE CHAIN FRAMEWORK ═══ */}
      
      {/* 1. Raw Material (원물) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(6, 182, 212, 0.3)', paddingBottom: '0.5rem' }}>
          <Anchor size={24} color="#06b6d4" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>1. Raw Material (원물/조업)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>생산 한계 및 초강대국 독점</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w1_global_catch', 'w2_hegemony', 'w3_diverging', 'w18', 'w19_tariff_engineering', 'w22_precision_release', 'w31_catch_gap', 'w32_sst_fleet_matrix', 'n1_sanction_paradox', 'k5_hatch_temp', 'k2_epa_larva'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
        </div>
      </section>

      {/* 2. Processing (가공) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(56, 189, 248, 0.3)', paddingBottom: '0.5rem' }}>
          <Factory size={24} color="#38bdf8" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>2. Processing (가공/수리미)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>수리미 메가트렌드 및 가공 허브</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w5_china_blackhole', 'w9_surimi_megatrend', 'w10_surimi_top3', 'w12_proc_vs_surimi', 'w15', 'w17', 'w20_whitefish_reshuffle', 'w25_processing_bottleneck', 'k1_3d_surimi', 'k3_gamma_roe', 'k4_senior_food'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
        </div>
      </section>

      {/* 3. Logistics (물류) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '0.5rem' }}>
          <Truck size={24} color="var(--color-warning)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>3. Logistics (물류/무역)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>물동량 쇼크 및 단일국 종속</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w8_korea_deficit', 'w11_surimi_trade', 'w13', 'w16', 'w21_b_season_hedge', 'w26_inventory_freight', 'w29_eu_derisk_pivot', 'n5_rcep_detour'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
        </div>
      </section>

      {/* 4. Sales (판매) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(239, 68, 68, 0.3)', paddingBottom: '0.5rem' }}>
          <DollarSign size={24} color="var(--color-danger)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>4. Sales (판매/수요)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>인플레이션 및 수출 단가</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w6_inflation_unitprice', 'w7_usa_russia_unitprice', 'w27_substitute_spread', 'w33_arbitrage_tracker'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
        </div>
      </section>

      {/* 5. ESG (지속가능성) */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', paddingBottom: '0.5rem' }}>
          <ShieldCheck size={24} color="var(--color-success)" />
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>5. ESG & Tech (수산 안보 및 인증)</h2>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>영해 소멸 위기 및 MSC 프리미엄</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
          {widgets?.filter((w: any) => ['w4_korea_crisis', 'w14', 'w23_upcycling_esg', 'w28_esg_premium', 'w30_traceability_risk', 'n6_waste_to_wealth'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
        </div>
      </section>

      {widgets?.filter((w: any) => !['w1_global_catch', 'w2_hegemony', 'w3_diverging', 'w18', 'w19_tariff_engineering', 'w22_precision_release', 'w24_opex_spread', 'w5_china_blackhole', 'w9_surimi_megatrend', 'w10_surimi_top3', 'w12_proc_vs_surimi', 'w15', 'w17', 'w20_whitefish_reshuffle', 'w25_processing_bottleneck', 'w8_korea_deficit', 'w11_surimi_trade', 'w13', 'w16', 'w21_b_season_hedge', 'w26_inventory_freight', 'w29_eu_derisk_pivot', 'w6_inflation_unitprice', 'w7_usa_russia_unitprice', 'w27_substitute_spread', 'w4_korea_crisis', 'w14', 'w23_upcycling_esg', 'w28_esg_premium', 'w30_traceability_risk', 'w31_catch_gap', 'w32_sst_fleet_matrix', 'w33_arbitrage_tracker', 'n1_sanction_paradox', 'n5_rcep_detour', 'n6_waste_to_wealth'].includes(w.id)).length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(148, 163, 184, 0.3)', paddingBottom: '0.5rem' }}>
            <Activity size={24} color="#94a3b8" />
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#94a3b8' }}>기타 분석 (Others)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => !['w1_global_catch', 'w2_hegemony', 'w3_diverging', 'w18', 'w19_tariff_engineering', 'w22_precision_release', 'w24_opex_spread', 'w5_china_blackhole', 'w9_surimi_megatrend', 'w10_surimi_top3', 'w12_proc_vs_surimi', 'w15', 'w17', 'w20_whitefish_reshuffle', 'w25_processing_bottleneck', 'w8_korea_deficit', 'w11_surimi_trade', 'w13', 'w16', 'w21_b_season_hedge', 'w26_inventory_freight', 'w29_eu_derisk_pivot', 'w6_inflation_unitprice', 'w7_usa_russia_unitprice', 'w27_substitute_spread', 'w4_korea_crisis', 'w14', 'w23_upcycling_esg', 'w28_esg_premium', 'w30_traceability_risk', 'w31_catch_gap', 'w32_sst_fleet_matrix', 'w33_arbitrage_tracker', 'n1_sanction_paradox', 'n5_rcep_detour', 'n6_waste_to_wealth'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>
      )}

    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const accentColor = '#06b6d4';
    const accentGlow = 'rgba(6, 182, 212, 0.1)';
    
    const methodologyText = w.logic || w.methodology || '';
    const situation = w.sit || w.situation || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    
    return (
      <div key={w.id} className={styles.glassCard} style={{ 
        display: 'flex', flexDirection: 'column', minHeight: '480px'
      }}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: accentColor, margin: '0 0 0.4rem 0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <IconComp size={18} />
              {w.title} {w.reliability && w.reliability <= 70 && (<span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'#292524', border:'1px solid #f59e0b', color:'var(--color-warning)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>📐 Estimate</span>)}
            </span>
            
            {WIDGET_UNITS[w.id] && (
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#cbd5e1', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                단위: {WIDGET_UNITS[w.id]}
              </span>
            )}
            
            {/* ❕ Info Icon with Tooltip on Hover */}
            <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
              
            </div>
          </h3>
          {(w.subtitle || methodologyText) && (
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {[w.subtitle, methodologyText].filter(Boolean).join(' | ')}
            </p>
          )}
        </div>

        {/* Chart Area */}
        <div style={{ height: '250px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            {renderChart(w)}
          </SafeResponsiveContainer>
        </div>

        {/* Takeaway Box */}
        {(situation || takeaway) && (
          <div style={{ marginTop: 'auto' }}>
            <div style={{ 
              background: 'rgba(2, 14, 28, 0.45)', 
              borderTop: `2px solid ${accentColor}`, 
              borderRadius: '8px', padding: '14px' 
            }}>
              {situation && (
                <div style={{ paddingBottom: '10px', borderBottom: '1px dashed rgba(255,255,255,0.08)', marginBottom: '10px' }}>
                  <h4 style={{ color: accentColor, fontSize: '0.85rem', fontWeight: 700, margin: '0 0 4px 0' }}>📊 현황 분석 (SITUATION)</h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>{situation}</p>
                  <p style={{ color: '#475569', fontSize: '0.7rem', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                    * 출처: {w.methodology || 'Silla Co. Intelligence Network'}
                  </p>
                </div>
              )}
              {takeaway && (
                <div>
                  <h4 style={{ color: 'var(--color-warning)', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 4px 0' }}>⚡ 실행 전략 (EXECUTIVE TAKEAWAY)</h4>
                  <p style={{ color: '#fde68a', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>{takeaway}</p>
                </div>
              )}
            </div>
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
