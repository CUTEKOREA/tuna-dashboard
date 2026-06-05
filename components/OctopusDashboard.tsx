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
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import OctopusFTAQuarterly from './OctopusFTAQuarterly';
import OctopusDomesticCliff from './OctopusDomesticCliff';
import {
  OctopusChannelMarginMatrix, OctopusColdChainYield, OctopusPriceTransmission, OctopusCephalopodElasticity,
  OctopusAquacultureRace, OctopusTacCountdown, OctopusFtaTariffMatrix, OctopusSstCorrelation,
} from './OctopusPhase2Widgets';

const EXTRA_BY_PILLAR: Record<string, React.FC[]> = {
  S1: [OctopusDomesticCliff, OctopusSstCorrelation],
  S2: [OctopusChannelMarginMatrix, OctopusColdChainYield],
  S3: [OctopusFTAQuarterly, OctopusFtaTariffMatrix],
  S4: [OctopusPriceTransmission, OctopusCephalopodElasticity],
  S5: [OctopusAquacultureRace, OctopusTacCountdown],
};

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
// 5-Pillar 네비게이터 메타 (낙지 시그니처 — 두족류 공용 purple→pink 대신 indigo→violet 차별화 톤)
const SECTIONS = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '🐙 Part I — 원료 수급', desc: '글로벌 낙지 어획량 추이 및 주요 산지 공급 현황', color: '#4f46e5' },
  { id: 'S2', num: '❷', label: '가공·생산', title: '🐙 Part II — 가공 및 생산', desc: '국내 낙지 자원 절벽 및 연안 자원량 회복 지표', color: '#6366f1' },
  { id: 'S3', num: '❸', label: '물류·통관', title: '🐙 Part III — 물류 및 통관', desc: 'FTA 수입 동향 및 분기별 통관 단가 변화', color: '#8b5cf6' },
  { id: 'S4', num: '❹', label: '판매·수요', title: '🐙 Part IV — 판매 및 수요', desc: '산낙지 외식 수요 및 유통 채널별 단가 탄력성', color: '#a78bfa' },
  { id: 'S5', num: '❺', label: 'ESG·지속가능성', title: '🐙 Part V — ESG 및 지속가능성', desc: '자원관리 TAC 규제 및 지속가능 어업 인증 지표', color: '#c4b5fd' }
];

const PILLAR_WIDGET_IDS: Record<string, string[]> = {
  S1: [],
  S2: [],
  S3: [],
  S4: [],
  S5: [],
};

/* ─── Custom Tooltip ─── */

const formatXAxis = (tickItem: any) => {
  if (!tickItem || typeof tickItem !== 'string') return tickItem;
  const formatted = tickItem.replace(/\s*\(.*?\)\s*/g, '');
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

const PIE_COLORS = ['#4f46e5', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'];

/* ─── KPI Themes ─── */
const KPI_THEMES = [
  { border: 'none', glow: 'none', text: '#4f46e5', icon: Database },
  { border: 'none', glow: 'none', text: '#6366f1', icon: TrendingUp },
  { border: 'none', glow: 'none', text: '#8b5cf6', icon: Ship },
  { border: 'none', glow: 'none', text: '#a78bfa', icon: ShieldCheck },
  { border: 'none', glow: 'none', text: '#c4b5fd', icon: Factory },
  { border: 'none', glow: 'none', text: '#ddd6fe', icon: Scale },
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

export default function OctopusDashboard() {
  const [data, setData] = useState<any>({ widgets: [] });
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');

  useEffect(() => {
    fetch('/api/octopus-intelligence')
      .then(r => r.ok ? r.json() : { widgets: [] })
      .then(setData)
      .catch(() => setData({ widgets: [] }));
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: '#FCD535', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#848E9C', fontSize: '1rem' }}>낙지 인텔리전스 로딩 중...</p>
    </div>
  );

  const { kpis = {}, widgets = [] } = data;
  const kpiKeys = Object.keys(kpis);

  /* ─── Unified Chart Renderer ─── */
  const renderChart = (widget: any) => {

    const PALETTE = ['#4f46e5', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
    const getMonolithicColor = (i: number) => PALETTE[i % PALETTE.length];

    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>데이터 없음</div>;

    const chartType = (widget.chartType || '').toLowerCase();

    // NEW FORMAT — uses xKey, bars, lines, areas, series
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
              <ChartPatternDefs />
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
              <ChartPatternDefs />
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
          return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>지원하지 않는 형식</div>;
      }
    }
    return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>지원하지 않는 형식</div>;
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
                낙지 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>낙지 커맨드 센터 — 총 {widgets?.length || 0}개 위젯 · {kpiKeys?.length || 0}개 핵심지표</p>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ 6 KPIs ═══ */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
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

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.5), rgba(15,23,42,0.2))',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {SECTIONS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = `${s.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '12px 8px 14px',
                  background: isActive ? `${s.color}12` : 'transparent',
                  border: `1.5px solid ${isActive ? s.color : 'transparent'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                    borderRadius: '3px 3px 0 0',
                  }} />
                )}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? s.color : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#0f172a' : 'rgba(148,163,184,0.6)',
                  fontSize: '0.75rem', fontWeight: 800,
                  transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>
                  {idx + 1}
                </div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
                {isActive && (
                  <span style={{
                    fontSize: '0.6rem',
                    color: 'rgba(148,163,184,0.7)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    marginTop: '2px',
                    padding: '0 4px',
                  }}>
                    {s.desc.slice(0, 24)}…
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 활성 Pillar 위젯 그리드 (activePart 필터링) ═══ */}
      {(() => {
        const sec = SECTIONS.find(s => s.id === activePart)!;
        const pillarWidgets = widgets?.filter((w: any) => PILLAR_WIDGET_IDS[activePart].includes(w.id)) || [];
        return (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: sec.color, borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sec.title}</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sec.desc}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: sec.color, background: `${sec.color}15`, padding: '3px 10px', borderRadius: '500px', fontWeight: 600 }}>
                {pillarWidgets.length} 위젯
              </span>
            </div>
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {pillarWidgets.length === 0 && (EXTRA_BY_PILLAR[activePart] || []).length === 0
                ? <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>이 단계에 위젯이 없습니다</div>
                : <>
                    {pillarWidgets.map((w: any) => renderWidgetCard(w))}
                    {(EXTRA_BY_PILLAR[activePart] || []).map((Comp, i) => <Comp key={`extra-${activePart}-${i}`} />)}
                  </>}
            </div>
          </section>
        );
      })()}

    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const situation = w.sit || w.situation || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    const status = w.reliability && w.reliability < 70 ? 'STATIC' : 'SYNCED'; // isLiveApi LIVE 분기 제거 — /api/octopus-intelligence 라우트 미존재, L-09

    return (
      <WidgetCard
        key={w.id}
        title={w.title}
        icon={IconComp}
        iconColor="var(--color-success)"
        pillar={(w.pillar || 'S1') as any}
        cardDesc={w.subtitle || w.unit ? (w.subtitle || `단위: ${w.unit}`) : '낙지 인텔리전스 위젯'}
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
