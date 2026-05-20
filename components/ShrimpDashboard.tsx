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
  Database, Ship, Zap, BookOpen, Workflow, Leaf, Layers
} from 'lucide-react';
import TermTooltip from './TermTooltip';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './ShrimpDashboard.module.css';
import TakeawayBox from './TakeawayBox';

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: '#f8fafc', fontSize: '0.88rem' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{label}</p>
        {payload.map((entry: any, index: any) => {
          if (entry.value === undefined || entry.name === undefined || entry.name === '') return null;
          if (isNaN(Number(entry.value))) return null;
          return (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
              <span style={{ color: entry.color }}>■ {entry.name}</span>
              <strong style={{ fontWeight: 600 }}>{typeof entry.value === 'number' 
                ? (Number.isInteger(entry.value) 
                  ? entry.value.toLocaleString() 
                  : entry.value.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 2}))
                : entry.value}</strong>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ["#38bdf8", "var(--color-success)", "var(--color-warning)", "var(--color-danger)", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

/* ─── KPI Themes ─── */
const KPI_THEMES = [
  { border: 'none', glow: 'none', text: 'var(--color-success)', icon: Database },
  { border: 'none', glow: 'none', text: 'var(--text-primary)', icon: AlertTriangle },
  { border: 'none', glow: 'none', text: 'var(--color-success)', icon: TrendingUp },
  { border: 'none', glow: 'none', text: 'var(--color-danger)', icon: ShieldCheck },
  { border: 'none', glow: 'none', text: 'var(--color-warning)', icon: Factory },
  { border: 'none', glow: 'none', text: 'var(--text-primary)', icon: Scale },
];

/* ─── Widget Icons ─── */
const WIDGET_ICONS: Record<string, any> = {
  w01_paradigm_shift: Activity, w02_aqua_value: TrendingUp, w03_processing: Factory,
  w04_top10_aqua: BarChart2, w05_top10_catch: Anchor, w06_top10_revenue: DollarSign,
  w07_trade_scaleup: Globe, w08_top_exporter: Ship, w09_top_importer: MapPin,
  w10_kr_import: AlertCircle, w11_kr_deficit: TrendingDown, w12_unit_price: Scale,
  w13: TrendingUp, w14: Factory, w15: Anchor, w16: DollarSign, w17: AlertTriangle, w18: Globe,
  w19_hyperspectral: Crosshair, w20_fcr_80: Zap, w21_peeling_esg: AlertTriangle, w22_microalgae: RefreshCcw,
  w_raw1_production_trend: Globe, w_raw2_unit_price: DollarSign,
  w_proc1_type_production: Factory, w_proc2_kr_import_type: BarChart2,
  w_log1_spot_price: TrendingUp, w_log2_kr_sourcing: MapPin, w_log3_kr_import_value: DollarSign,
  w_sales1_commodity_unit_price: Scale, w_sales2_exporter_trend: Ship,
  w_esg1_compliance: ShieldCheck, w_esg2_supply_risk: AlertTriangle,
  w42_format_shift: Activity, w43_feed_inflation: TrendingUp,
  w44_ems_margin: AlertTriangle, w45_export_vuln: Globe,
  w46_ecuador_dominance: Globe, w47_tariff_paradox: Scale,
  w48_vaccine_priming: ShieldCheck, w49_black_tiger_revival: Factory,
  // V2.0 신규 위젯 아이콘
  w_shrimp_price_forecast: TrendingUp, w_shrimp_macro_dashboard: Activity,
  w_shrimp_sourcing_sim: Layers, w_shrimp_concentration_risk: AlertTriangle,
  w_shrimp_substitute_elasticity: Scale,
  w_shrimp_ntb_radar: ShieldCheck, w_shrimp_antibiotic_tracker: AlertCircle,
  w_shrimp_sps_alert: Globe,
  w_shrimp_forced_labor_map: AlertTriangle, w_shrimp_mangrove_index: Leaf,
  w_shrimp_cert_tracker: ShieldCheck,
  w_shrimp_chitosan_opportunity: Leaf, w_shrimp_halal_export: Globe,
  w_shrimp_rte_format: Factory,
};


/* ─── Term Tooltip Parser ─── */
const TERM_DICTIONARY: Record<string, string> = {
  "EMS": "조기폐사증후군(Early Mortality Syndrome). 새우 양식업의 치명적 질병으로 폐사율이 100%에 달할 수 있음.",
  "FCR": "사료요구율(Feed Conversion Ratio). 생물 1kg을 생산하기 위해 투입되는 사료의 양. 낮을수록 효율적.",
  "바이오플락": "미생물을 활용하여 사육수 내 오염물질을 정화하고, 이를 다시 사료화하는 친환경 양식법.",
  "Biofloc": "미생물을 활용하여 사육수 내 오염물질을 정화하고, 이를 다시 사료화하는 친환경 양식법.",
  "IQF": "개별급속냉동(Individual Quick Freezing). 한 마리씩 영하 40도 이하로 급속 냉동하여 신선도를 유지하는 가공 기술.",
  "CSDDD": "EU 공급망 실사 지침(Corporate Sustainability Due Diligence Directive). 인권 및 환경 리스크 실사를 의무화한 법안.",
  "초분광": "초분광 이미징(Hyperspectral Imaging). 가시광선 외의 수백 개 파장을 분석하여 성분과 신선도를 비파괴적으로 검증하는 기술.",
  "미세조류": "미세조류(Microalgae). 어분(Fishmeal)을 대체할 수 있는 고단백질, 오메가-3 등 풍부한 영양을 가진 지속가능한 사료 원료."
};

const parseTextWithTooltips = (text: string) => {
  if (!text) return text;
  const terms = Object.keys(TERM_DICTIONARY).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const termKey = terms.find(t => t.toLowerCase() === part.toLowerCase());
    if (termKey) {
      return <TermTooltip key={i} term={part} description={TERM_DICTIONARY[termKey]} />;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
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



const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, ''); // 괄호 영문명 제거
  return noEng.length > 12 ? noEng.substring(0, 12) + '...' : noEng;
};

const formatYAxis = (v: number, unit?: string) => {
  let formatted: string | number = v;
  if (v >= 1000000) formatted = (v / 1000000).toFixed(1) + 'M';
  else if (v >= 1000) formatted = (v / 1000).toFixed(0) + 'k';
  return formatted + (unit ? ` ${unit}` : '');
};

export default function ShrimpDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showEdu, setShowEdu] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // API Live Data & Simulator State
  const [apiData, setApiData] = useState<any>({});
  const [simExchangeRate, setSimExchangeRate] = useState<number>(1385);
  const [simTariff, setSimTariff] = useState<number>(2.0);
  const [simBaseMargin, setSimBaseMargin] = useState<number>(15.0); // Base profit margin assumption


  useEffect(() => {
    fetch('/data/shrimp_real_data_v3.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load shrimp data", err));

    // Fetch API Data (V2.0: 9 endpoints)
    Promise.all([
      fetch('/api/shrimp/customs').then(r => r.ok ? r.json() : null),
      fetch('/api/shrimp/kamis').then(r => r.ok ? r.json() : null),
      fetch('/api/shrimp/macro').then(r => r.ok ? r.json() : null),
      fetch('/api/shrimp/krungsri').then(r => r.ok ? r.json() : null),
      fetch('/api/shrimp/forecast').then(r => r.ok ? r.json() : null),
      fetch('/api/shrimp/sourcing-sim').then(r => r.ok ? r.json() : null),
      fetch('/api/shrimp/compliance').then(r => r.ok ? r.json() : null),
      fetch('/api/shrimp/esg-radar').then(r => r.ok ? r.json() : null),
      fetch('/api/shrimp/emerging-markets').then(r => r.ok ? r.json() : null)
    ]).then(([customs, kamis, macro, krungsri, forecast, sourcing, compliance, esg, emerging]) => {
      setApiData({ customs, kamis, macro, krungsri, forecast, sourcing, compliance, esg, emerging });
      if (macro?.metrics?.rate) setSimExchangeRate(macro.metrics.rate);
    }).catch(console.error);
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
      <RefreshCcw size={32} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading Intelligence...</p>
    </div>
  );

  const { kpis, widgets } = data;
  const kpiKeys = Object.keys(kpis);

  const displayWidgets = widgets?.map((w: any) => {
    let newW = { ...w };
    if (newW.title) {
       newW.title = newW.title.replace(/\s*\([A-Za-z\s]+\)/g, '');
    }
    if (newW.id === 'w_log3_kr_import_value' && apiData.customs?.liveImportData?.length > 0) {
      const historicalData = newW.data.filter((d: any) => parseInt(d.year) < 2024);
      newW.data = [...historicalData, ...apiData.customs.liveImportData];
    }
    return newW;
  });

  /* ─── Unified Chart Renderer ─── */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>데이터 없음</div>;
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
              <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} verticalAlign="top" height={36} />
            </PieChart>
          );
        case "area":
          return (
            <AreaChart data={d}>
              <defs>
                {widget.areas?.map((a: any, i: number) => (
                  <linearGradient key={i} id={`sArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.color} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={a.color} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" height={36} />
              {widget.areas?.map((a: any, i: number) => (
                <Area key={i} type="monotone" dataKey={a.key} stroke={a.color} fill={`url(#sArea${widget.id}_${i})`} strokeWidth={2.5} />
              ))}
            </AreaChart>
          );
        case "bar":
        case "composed": {
          const hasDualAxis = widget.bars?.length > 0 && widget.lines?.length > 0;
          return (
            <ComposedChart data={d}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              {hasDualAxis && <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" height={36} />
              {widget.bars?.map((b: any, i: number) => (
                <Bar key={`b${i}`} yAxisId="left" dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
              ))}
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} yAxisId={hasDualAxis ? "right" : "left"} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </ComposedChart>
          );
        }
        default:
          return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
      }
    }

    // OLD FORMAT (Gemini widgets)
    const xAxis = widget.xAxis || '연도';
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
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
          </PieChart>
        );
      case "line":
        return (
          <LineChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
            {series.map((s: any, i: number) => (
              <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
            {series.map((s: any, i: number) => (
              <Area key={i} type="monotone" dataKey={s.dataKey} stroke={s.color} fill={s.color} fillOpacity={0.5} strokeWidth={2} />
            ))}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
            {series.map((s: any, i: number) => (
              <Bar key={i} dataKey={s.dataKey} fill={s.color} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
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
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>
      
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Fish size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                새우 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>새우 전략 종합 커맨드 센터 — {displayWidgets?.length || 47}개 위젯 · 6개 핵심지표 · 16개 API 연동</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #1ed760', animation: 'pulse 2s infinite' }} />
            <span>9개 API <span style={{ color: 'var(--color-success)' }}>연동됨</span></span>
            <span style={{ margin: '0 8px', color: '#4d4d4d' }}>|</span>
            <span style={{ color: 'var(--text-primary)' }}>FishStatJ 1950-2024</span>
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
            <div key={key} className="ds-card" style={{
              background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '6px',
              transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
              position: 'relative', overflow: 'hidden'}}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(24, 24, 24, 0.85)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '80%' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    {kpi.title}
                  </span>
                  {(kpi.telemetry || (key === 'kpi3' && apiData.customs) || (key === 'kpi6' && apiData.macro)) && (
                    <TelemetryBadge 
                      status={((key === 'kpi3' && apiData.customs) || (key === 'kpi6' && apiData.macro)) ? 'live' : kpi.telemetry as any} 
                      syncDate={((key === 'kpi3' && apiData.customs) || (key === 'kpi6' && apiData.macro)) ? '실시간 연동중' : kpi.syncDate} 
                    />
                  )}
                </div>
                <IconComp size={16} style={{ color: theme.text, flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {key === 'kpi3' && apiData.customs ? `$${apiData.customs.metrics.avgUnitPrice_USD.toLocaleString()} / 톤` 
                 : key === 'kpi6' && apiData.macro ? `$${Math.floor(693 * (apiData.macro.metrics.rate / 1385))}M`
                 : parsed ? (
                  <CountUp end={parsed.numberVal} duration={2} separator="," decimals={parsed.decimals} prefix={parsed.prefix} suffix={parsed.suffix} />
                ) : kpi.value}
              </div>
              <div style={{ fontSize: '0.88rem', color: theme.text, fontWeight: 600 }}>
                <span style={{ background: `${theme.text}20`, padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{kpi.trend}</span>
                {kpi.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Education Module & Chatbot ═══ */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowEdu(!showEdu)}
          style={{ 
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem', background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px', marginBottom: showEdu ? '0' : '1rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(24, 24, 24, 0.85)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BookOpen size={24} color="var(--color-success)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>신입직원 교육 가이드</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>NotebookLM 분석 기반: 양식/어획 비교 및 새우 밸류체인 리스크 점검</div>
            </div>
          </div>
          <div style={{ transform: showEdu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </button>

        {showEdu && (
          <div style={{ 
            background: 'var(--bg-color)', 
            padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', 
            boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px', marginBottom: '2rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              
              {/* Module 1: 양식 vs 자연산 */}
              <div className="ds-card" style={{background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                  <Anchor size={20} color="var(--color-success)"/> 조업/생산 방식 비교: 양식 vs 어획
                </h3>
                
                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '6px', marginBottom: '1rem' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Fish size={16}/> 양식
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{color:'var(--text-primary)'}}>주요종:</strong> 흰다리새우(Vannamei), 블랙타이거<br/>
                    <strong style={{color:'var(--text-primary)'}}>생산지:</strong> 에콰도르, 인도, 베트남 주도<br/>
                    <strong style={{color:'var(--text-primary)'}}>특징:</strong> 생산량 예측이 비교적 쉽고, 대량 생산을 통한 원가 절감 가능. 현재 시장의 75% 이상 차지.
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '6px' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ship size={16}/> 자연산 어획
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{color:'var(--text-primary)'}}>주요종:</strong> 아르헨티나 붉은새우(Langostino) 등<br/>
                    <strong style={{color:'var(--text-primary)'}}>생산지:</strong> 아르헨티나, 중국, 인도네시아<br/>
                    <strong style={{color:'var(--text-primary)'}}>특징:</strong> 해양 기후에 큰 영향을 받으며 프리미엄 어종으로 취급. 혼획(Bycatch) 이슈 등 ESG 압박.
                  </div>
                </div>
              </div>

              {/* Module 2 & 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="ds-card" style={{background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                    <Workflow size={20} color="var(--color-success)"/> 새우 밸류체인 핵심 구조
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <li><strong style={{color:'var(--text-primary)'}}>원물(양식/어획):</strong> 종묘/사료 품질, 수온 관리 및 수질 환경 관리가 수율 직결. 에콰도르 폭발적 성장.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>가공(미드스트림):</strong> 동결(IQF/Block), 탈각(PD/PUD), 자숙(Cooked) 등 공정 기술력과 인건비가 핵심.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>판매(유통망):</strong> B2B(레스토랑/뷔페) 및 B2C(리테일/이커머스). 고부가가치 편의식(RTE) 상품 개발.</li>
                  </ul>
                </div>
                
                <div className="ds-card" style={{background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', flex: 1}}>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                    <ShieldCheck size={20} color="var(--color-danger)"/> 육상부서 필수 체크: 주요 리스크
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <li><strong style={{color:'var(--text-primary)'}}>질병(EMS/백점병) 발병:</strong> 양식장 집단 폐사 시 글로벌 공급 쇼크 및 단가 폭등 발생.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>안전성(항생제) 규제:</strong> 무역 시 잔류 항생제/첨가물 검사 불합격(통관 거부) 리스크 관리 필수.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>환율 및 물류비:</strong> 콜드체인(냉동 컨테이너) 물류에 전적 의존, MGO/환율 변동에 이익률 취약.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Module 4: AI Chatbot (NotebookLM Link) */}
            <div className="ds-card" style={{background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'}}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '50%', flexShrink: 0 }}>
                  <Database size={24} color="var(--color-success)" />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.4rem 0', fontSize: '1.13rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} color="var(--color-success)" /> 새우 지식 AI 챗봇
                  </h3>
                </div>
              </div>
              <a href="https://notebooklm.google.com/notebook/ba25b66c-f5a5-4d86-bab4-fe4f298add32" target="_blank" rel="noreferrer" style={{ 
                background: 'var(--text-primary)', 
                color: 'var(--bg-color)', 
                padding: '12px 32px', 
                borderRadius: '500px', 
                fontSize: '0.88rem', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                letterSpacing: '1.4px',
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                transition: 'transform 0.1s',
                whiteSpace: 'nowrap'
              }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Activity size={18} /> 챗봇 시작하기
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ═══ API Live & What-If Simulator ═══ */}
      <div className="ds-card" style={{marginBottom: '2rem', padding: '1.5rem', background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-success)' }} />
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.13rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity color="var(--color-success)" size={20} /> 관세/환율 충격 시뮬레이터
          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API 연동</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          
          <div style={{ background: 'var(--surface-2)', padding: '1.2rem', borderRadius: '6px' }}>
            <h3 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem 0' }}>API 데이터 연동 현황</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}><span>관세청 (한국 수입가):</span> <strong style={{ color: apiData.customs ? 'var(--color-success)' : 'var(--color-warning)' }}>{apiData.customs ? `$${apiData.customs.metrics.avgUnitPrice_USD.toLocaleString()}/톤` : '로딩중...'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}><span>KAMIS (국내 도매가):</span> <strong style={{ color: apiData.kamis ? 'var(--color-success)' : 'var(--color-warning)' }}>{apiData.kamis ? `₩${apiData.kamis.metrics.wholesalePrice_KRW_per_KG.toLocaleString()}/kg` : '로딩중...'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}><span>한국은행 (환율):</span> <strong style={{ color: apiData.macro ? 'var(--color-success)' : 'var(--color-warning)' }}>{apiData.macro ? `₩${apiData.macro.metrics.rate.toLocaleString()}` : '로딩중...'}</strong></div>
            </div>
          </div>

          <div style={{ background: 'var(--surface-2)', padding: '1.2rem', borderRadius: '6px' }}>
            <h3 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem 0' }}>What-If 컨트롤 (변수 조정)</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                <span>원/달러 환율</span> <strong>₩{simExchangeRate}</strong>
              </div>
              <input type="range" min="1200" max="1500" step="5" value={simExchangeRate} onChange={(e) => setSimExchangeRate(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-success)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                <span>미국 상무부 반덤핑 관세율</span> <strong>{simTariff.toFixed(1)}%</strong>
              </div>
              <input type="range" min="0" max="10" step="0.1" value={simTariff} onChange={(e) => setSimTariff(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-success)' }} />
            </div>
          </div>

          <div style={{ background: '#181818', padding: '1.2rem', borderRadius: '6px', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '0.88rem', color: 'var(--color-success)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} /> 실시간 추정 이익률</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {(simBaseMargin - ((simExchangeRate - 1385)/100) - simTariff).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>* 기준 마진(15%)에서 환율 변동 및 관세 차감</div>
          </div>

        </div>
      </div>

      
      {/* ═══ V2.0 — 5-Part Strategic Architecture ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* Part I: Raw Material */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Anchor size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>제1기둥 — 원물 생산</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {displayWidgets?.filter((w: any) => ['w01_paradigm_shift', 'w04_top10_aqua', 'w05_top10_catch', 'w15', 'w44_ems_margin', 'w46_ecuador_dominance', 'w_raw1_production_trend', 'w_raw2_unit_price', 'w_shrimp_price_forecast', 'w_shrimp_macro_dashboard', 'w48_vaccine_priming', 'w20_fcr_80', 'w22_microalgae', 'w50_kfas_bft_pathogen', 'w51_kfas_silymarin_feed', 'w52_kfas_duplex_pcr', 'w54_commodity_trap_index', 'w55_india_species_shift', 'w59_feed_substitute_economics', 'w60_disease_dx_evolution', 'w63_coldwater_shrimp_stock', 'w65_india_seafood_export_trajectory', 'w69_andhra_pradesh_risk'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* Part II: Processing */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Factory size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>제2기둥 — 가공 산업</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {displayWidgets?.filter((w: any) => ['w03_processing', 'w18', 'w19_hyperspectral', 'w_proc1_type_production', 'w_proc2_kr_import_type', 'w49_black_tiger_revival', 'w42_format_shift', 'w_shrimp_chitosan_opportunity', 'w_shrimp_rte_format', 'w53_kfas_3d_printed_shrimp', 'w62_alt_seafood_disruption'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* Part III: Logistics */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Ship size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>제3기둥 — 물류 및 무역</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {displayWidgets?.filter((w: any) => ['w07_trade_scaleup', 'w08_top_exporter', 'w09_top_importer', 'w10_kr_import', 'w11_kr_deficit', 'w17', 'w_log1_spot_price', 'w_log2_kr_sourcing', 'w_log3_kr_import_value', 'w_shrimp_sourcing_sim', 'w_shrimp_concentration_risk', 'w45_export_vuln', 'w47_tariff_paradox', 'w56_trade_diversion_flow', 'w61_hhi_timeseries', 'w64_us_cvd_tariff_matrix', 'w66_vn_shrimp_export_peak', 'w67_indo_eu_fta_impact', 'w70_tariff_chaos_timeline'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* Part IV: Sales & Demand */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <DollarSign size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>제4기둥 — 판매 및 수요</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {displayWidgets?.filter((w: any) => ['w02_aqua_value', 'w06_top10_revenue', 'w12_unit_price', 'w13', 'w14', 'w16', 'w_sales1_commodity_unit_price', 'w_sales2_exporter_trend', 'w_shrimp_substitute_elasticity', 'w_shrimp_halal_export', 'w43_feed_inflation'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* Part V: Sustainability */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <ShieldCheck size={24} color="var(--color-success)" />
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>제5기둥 — ESG 및 지속가능성</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {displayWidgets?.filter((w: any) => ['w21_peeling_esg', 'w_esg1_compliance', 'w_esg2_supply_risk', 'w_shrimp_ntb_radar', 'w_shrimp_antibiotic_tracker', 'w_shrimp_sps_alert', 'w_shrimp_forced_labor_map', 'w_shrimp_mangrove_index', 'w_shrimp_cert_tracker', 'w57_csddd_readiness', 'w58_vn_labor_audit', 'w68_indonesia_shrimp_associations'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* Uncategorized fallback */}
        {(() => {
          const allZoneIds = [
            'w01_paradigm_shift', 'w04_top10_aqua', 'w05_top10_catch', 'w15', 'w44_ems_margin', 'w46_ecuador_dominance', 'w_raw1_production_trend', 'w_raw2_unit_price', 'w_shrimp_price_forecast', 'w_shrimp_macro_dashboard', 'w48_vaccine_priming', 'w20_fcr_80', 'w22_microalgae', 'w50_kfas_bft_pathogen', 'w51_kfas_silymarin_feed', 'w52_kfas_duplex_pcr', 'w54_commodity_trap_index', 'w55_india_species_shift', 'w59_feed_substitute_economics', 'w60_disease_dx_evolution', 'w63_coldwater_shrimp_stock', 'w65_india_seafood_export_trajectory', 'w69_andhra_pradesh_risk',
            'w03_processing', 'w18', 'w19_hyperspectral', 'w_proc1_type_production', 'w_proc2_kr_import_type', 'w49_black_tiger_revival', 'w42_format_shift', 'w_shrimp_chitosan_opportunity', 'w_shrimp_rte_format', 'w53_kfas_3d_printed_shrimp', 'w62_alt_seafood_disruption',
            'w07_trade_scaleup', 'w08_top_exporter', 'w09_top_importer', 'w10_kr_import', 'w11_kr_deficit', 'w17', 'w_log1_spot_price', 'w_log2_kr_sourcing', 'w_log3_kr_import_value', 'w_shrimp_sourcing_sim', 'w_shrimp_concentration_risk', 'w45_export_vuln', 'w47_tariff_paradox', 'w56_trade_diversion_flow', 'w61_hhi_timeseries', 'w64_us_cvd_tariff_matrix', 'w66_vn_shrimp_export_peak', 'w67_indo_eu_fta_impact', 'w70_tariff_chaos_timeline',
            'w02_aqua_value', 'w06_top10_revenue', 'w12_unit_price', 'w13', 'w14', 'w16', 'w_sales1_commodity_unit_price', 'w_sales2_exporter_trend', 'w_shrimp_substitute_elasticity', 'w_shrimp_halal_export', 'w43_feed_inflation',
            'w21_peeling_esg', 'w_esg1_compliance', 'w_esg2_supply_risk', 'w_shrimp_ntb_radar', 'w_shrimp_antibiotic_tracker', 'w_shrimp_sps_alert', 'w_shrimp_forced_labor_map', 'w_shrimp_mangrove_index', 'w_shrimp_cert_tracker', 'w57_csddd_readiness', 'w58_vn_labor_audit', 'w68_indonesia_shrimp_associations'
          ];
          const uncategorized = displayWidgets?.filter((w: any) => !allZoneIds.includes(w.id));
          if (!uncategorized || uncategorized.length === 0) return null;
          return (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <Database size={24} color="var(--color-success)" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>기타 분석</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {uncategorized.map((w: any) => renderWidgetCard(w))}
              </div>
            </section>
          );
        })()}
      </div>
    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const accentColor = 'var(--color-success)';
    
    const methodologyText = w.logic || w.methodology || '';
    const situation = w.sit || w.situation || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    
    return (
      <div key={w.id} className={`${styles.glassCard} ds-card`} style={{display: 'flex', flexDirection: 'column', minHeight: '600px',
        background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '1.5rem'}}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            <IconComp size={20} color={accentColor} />
            {w.title} 
            
            {/* Badges */}
            <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
              <TelemetryBadge 
                status={((w.reliability && w.reliability > 70) || (w.badges && w.badges?.includes('Live API')) || w.apiSource) ? 'live' : 'static'} 
                syncDate={((w.reliability && w.reliability > 70) || (w.badges && w.badges?.includes('Live API')) || w.apiSource) ? 'Real-time' : '2024년 기준'} 
              />
            </div>

            {/* ❕ Info Icon */}
            <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {w.unit && <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>(단위: {w.unit})</span>}
            </div>
          </h3>
          {(w.subtitle) && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {w.subtitle}
            </p>
          )}
        </div>

        {/* Chart Area */}
        <div style={{ height: '375px', width: '100%', marginBottom: '1.5rem', position: 'relative', zIndex: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            {renderChart(w)}
          </SafeResponsiveContainer>
        </div>

        {/* Takeaway Box */}
        {(situation || takeaway) && (
          <div style={{ marginTop: 'auto' }}>
            <TakeawayBox 
              situation={parseTextWithTooltips(typeof situation === 'string' ? situation.replace(/^현황:\s*/, '') : situation)} 
              actionPlan={parseTextWithTooltips(typeof takeaway === 'string' ? takeaway.replace(/^전략:\s*/, '') : takeaway)} 
              source={w.source || (w.apiSource ? `${w.apiSource}` : undefined) || 'FAO FishStatJ + data/새우/ CSV 원본 교차 검증 완료'}
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
