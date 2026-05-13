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
import styles from './MackerelStrategy.module.css';

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

const PIE_COLORS = ["#ec4899", "var(--color-warning)", "var(--color-info)", "var(--color-success)", "#8b5cf6", "var(--color-danger)", "#06b6d4", "#f97316"];

/* ─── KPI Themes ─── */
const KPI_THEMES = [
  { border: 'rgba(236, 72, 153, 0.5)', glow: 'rgba(236, 72, 153, 0.25)', text: 'var(--color-success)', icon: Database },
  { border: 'rgba(239, 68, 68, 0.5)', glow: 'rgba(239, 68, 68, 0.25)', text: 'var(--color-danger)', icon: AlertTriangle },
  { border: 'rgba(16, 185, 129, 0.5)', glow: 'rgba(16, 185, 129, 0.25)', text: 'var(--color-success)', icon: TrendingUp },
  { border: 'rgba(59, 130, 246, 0.5)', glow: 'rgba(59, 130, 246, 0.25)', text: 'var(--color-info)', icon: ShieldCheck },
  { border: 'rgba(245, 158, 11, 0.5)', glow: 'rgba(245, 158, 11, 0.25)', text: 'var(--color-warning)', icon: Factory },
  { border: 'rgba(139, 92, 246, 0.5)', glow: 'rgba(139, 92, 246, 0.25)', text: '#8b5cf6', icon: Scale },
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

const formatYAxis = (v: number) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
  return v;
};

export default function SalmonDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showEdu, setShowEdu] = useState(true);
  const [simulationFactors, setSimulationFactors] = useState({ nok: 0, eur: 0, mgo: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/salmon_real_data_v4.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load salmon data", err));
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
      <RefreshCcw size={32} style={{ color: 'var(--color-success)', animation: 'spin 1s linear infinite' }} />
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
              <XAxis dataKey={xKeyVal} stroke="#64748b" tick={{fontSize:10}} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
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
              <XAxis dataKey={xKeyVal} stroke="#64748b" tick={{fontSize:10}} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
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
              <XAxis dataKey={xKeyVal} stroke="#64748b" tick={{fontSize:10}} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
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
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
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

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '8px', 
              background: 'var(--color-success)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Fish size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px',
                background: 'var(--color-success)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                대서양 연어 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Atlantic Salmon Strategic Command Center — 35 Widgets · 6 KPIs</p>
            </div>
          </div>
          <div style={{ 
            fontSize: '0.8rem', padding: '0.5rem 1rem', 
            background: '#181818', border: '1px solid rgba(236, 72, 153, 0.2)', 
            borderRadius: '8px', color: '#94a3b8', fontWeight: 500
          }}>
            <span style={{ color: 'var(--color-success)' }}>FishStatJ 1950-2024 + KFAS</span> · Claude Verified
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Module 1 */}
              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '10px', border: 'none' }}>
                <h3 style={{ color: 'var(--color-success)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Fish size={16}/> 패러다임 전환 (원물)
                </h3>
                <div style={{ padding: '1rem', background: '#181818', borderLeft: '3px solid #1ed760', borderRadius: '4px' }}>
                  <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>자연산 어획 종식 및 양식 주도</h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                    상업용 연어 어획은 0.06%에 불과하며, 양식이 압도적 비중(99.94%)을 차지합니다. 특히 노르웨이와 칠레의 양강 복점(Duopoly) 체제가 생산을 장악하고 있으며, 제한된 노르웨이 양식 면허는 가치가 급등하는 핵심 자산입니다.
                  </p>
                </div>
              </div>

              {/* Module 2 */}
              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '10px', border: 'none' }}>
                <h3 style={{ color: 'var(--color-success)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Factory size={16}/> 가공 및 부가가치 창출
                </h3>
                <div style={{ padding: '1rem', background: '#181818', borderLeft: '3px solid #1ed760', borderRadius: '4px' }}>
                  <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>폴란드의 재수출 허브 모델</h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                    연어 양식장이 전혀 없는 폴란드가 유럽 최대 연어 가공국으로 부상했습니다. 노르웨이산 원물을 수입하여 훈제 등 2차 가공 후 재수출함으로써 안정적이고 거대한 순이익을 창출하는 구조입니다.
                  </p>
                </div>
              </div>
              
              {/* Module 3 */}
              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '10px', border: 'none' }}>
                <h3 style={{ color: 'var(--color-success)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
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
                  <h3 style={{ color: 'var(--color-success)', margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} /> 연어 지식 AI 챗봇 (NotebookLM)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    100여 개의 사내 연어 분석 보고서와 글로벌 수급 데이터를 학습한 맞춤형 AI입니다. 연어 시장 동향, 양식 밸류체인 등을 자유롭게 질문하세요.
                  </p>
                </div>
              </div>
              <a href="https://notebooklm.google.com/notebook/daced2ab-bb2a-4626-8211-5d102c11ce07" target="_blank" rel="noreferrer" style={{ 
                background: 'var(--color-success)', 
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

        const renderSection = (title: string, icon: any, keys: string[], customInsights?: React.ReactNode) => {
          const sectionWidgets = widgets.filter((w: any) => keys.includes(w.id));
          if (sectionWidgets.length === 0 && !customInsights) return null;
          
          return (
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {React.createElement(icon, { size: 24, color: 'var(--color-success)' })}
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{title}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
                {customInsights}
                {sectionWidgets.map((w: any) => renderWidgetCard(w))}
              </div>
            </div>
          );
        };

        return (
          <>
            {renderSection("원물 (Raw Material)", Fish, catRaw, (
              <>
                <SalmonInsightSmolt />
                <SalmonInsightFeed />
                <SalmonInsightFeedBio />
              </>
            ))}
            {renderSection("가공 (Processing)", Factory, catProc, (
              <>
                <SalmonInsightProcessing />
                <SalmonInsightAutomationYield />
                <SalmonInsightMarginSqueeze />
              </>
            ))}
            {renderSection("물류 (Logistics)", Truck, catLog, (
              <>
                <SalmonInsightSmartColdChain />
                <SalmonInsightLogisticsResilience />
              </>
            ))}
            {renderSection("판매 (Sales)", DollarSign, catSales, (
              <>
                <SalmonInsightGlobalSupplyPrice simulationFactors={simulationFactors} />
                <SalmonInsightTradeDown />
              </>
            ))}
            {renderSection("ESG & 자산가치 (ESG & Valuation)", ShieldCheck, catEsg, (
              <>
                <SalmonInsightClimate />
                <SalmonInsightDoubleMateriality />
              </>
            ))}
          </>
        );
      })()}

    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const accentColor = 'var(--color-success)';
    const accentGlow = 'rgba(236, 72, 153, 0.1)';
    
    // Existing data may use specific fields
    const methodologyText = w.logic || w.methodology || '';
    const situation = w.sit || w.situation || w.desc || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    
    return (
      <div key={w.id} className={styles.glassCard} style={{ 
        display: 'flex', flexDirection: 'column', minHeight: '480px'
      }}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: accentColor, margin: '0 0 0.4rem 0' }}>
            <IconComp size={18} />
            {w.title} {w.reliability && w.reliability <= 70 && (<span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'#292524', border:'1px solid #f59e0b', color:'var(--color-warning)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>📐 Estimate</span>)}
            
            {/* ❕ Info Icon */}
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
                <div style={{ paddingBottom: takeaway ? '10px' : '0', borderBottom: takeaway ? '1px dashed rgba(255,255,255,0.08)' : 'none', marginBottom: takeaway ? '10px' : '0' }}>
                  <h4 style={{ color: accentColor, fontSize: '0.85rem', fontWeight: 700, margin: '0 0 4px 0' }}>📊 현황 분석 (SITUATION)</h4>
                  <p style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>{situation}</p>
                  <p style={{ color: '#475569', fontSize: '0.7rem', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                    🔗 출처: {w.source || 'FAO FishStatJ + data/대서양 연어/ CSV 원본 교차 검증 완료'}
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
