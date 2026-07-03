"use client";

import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Scatter
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Fish, Anchor, Globe, DollarSign, 
  Activity, AlertTriangle, ShieldCheck, AlertCircle,
  RefreshCcw, Crosshair, MapPin, Factory, Truck, Scale, BarChart2,
  Database, Ship, Zap,
  Shield
} from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import WidgetCard from './WidgetCard';
import { TelemetryBadge } from './TelemetryBadge';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';

// ═══ V2.0 Intelligence Modules ═══
import { PollockSanctionParadox, PollockFtaTariffMatrix, PollockRiskScorecard } from './PollockPolicyRiskRadar';
import { PollockPriceForecastChart, PollockScenarioSimulator } from './PollockPriceForecast';
import { PollockLandedCostWaterfall, PollockRouteComparison } from './PollockLandedCost';
import { PollockConcentrationIndex, PollockAlternativeSourcing, PollockSubstituteElasticity } from './PollockSupplyResilience';
import UsPollockDetourWidget from './UsPollockDetourWidget';

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

/* ─── KPI Themes (Pollock: Cyan & Slate Monolithic) ─── */
const KPI_THEMES = [
  { border: 'rgba(6, 182, 212, 0.5)', glow: 'rgba(6, 182, 212, 0.25)', text: '#06b6d4', icon: Database },
  { border: 'rgba(14, 165, 233, 0.5)', glow: 'rgba(14, 165, 233, 0.25)', text: '#0ea5e9', icon: ShieldCheck },
  { border: 'rgba(56, 189, 248, 0.5)', glow: 'rgba(56, 189, 248, 0.25)', text: '#38bdf8', icon: TrendingUp },
  { border: 'rgba(59, 130, 246, 0.5)', glow: 'rgba(59, 130, 246, 0.25)', text: '#3b82f6', icon: Scale },
  { border: 'rgba(96, 165, 250, 0.5)', glow: 'rgba(96, 165, 250, 0.25)', text: '#60a5fa', icon: Factory },
  { border: 'rgba(148, 163, 184, 0.5)', glow: 'rgba(148, 163, 184, 0.25)', text: '#94a3b8', icon: AlertTriangle },
];

/* ─── 5-Pillar Framework (한류 명태 cyan→indigo) ─── */
const PILLARS = [
  {
    id: "P1", num: "❶", label: "원료 수급",
    title: "⚓ Pillar I — 원료 수급 (Raw Material & Sourcing)", desc: "베링해/오호츠크해 쿼터 및 미·러 독점 지정학 리스크 관리", color: "#0891b2", icon: Anchor,
    widgets: ["w_fta_pollock_ru_dependency", "w_fta_pollock_2023_shock", "w1_global_catch", "w2_hegemony", "w3_diverging", "w24_opex_spread", "w31_catch_gap", "w32_sst_fleet_matrix", "w34_china_export_flow", "k5_hatch_temp", "k2_epa_larva", "w_pollock_tac_matrix_2026"],
    customInject: ["PollockConcentrationIndex", "PollockAlternativeSourcing"]
  },
  {
    id: "P2", num: "❷", label: "가공·생산",
    title: "🏭 Pillar II — 가공 & 생산 (Processing & Value-chain)", desc: "수리미(Surimi) 전환 및 중국 우회 가공 클러스터 회피", color: "#0284c7", icon: Factory,
    widgets: ["w_fta_pollock_form_mix", "w5_china_blackhole", "w9_surimi_megatrend", "w10_surimi_top3", "w12_proc_vs_surimi", "w17", "w20_whitefish_reshuffle", "w22_precision_release", "w25_processing_bottleneck", "k1_3d_surimi", "k3_gamma_roe", "k4_senior_food", "w_pollock_processing_form_surimi_roe"],
    customInject: []
  },
  {
    id: "P3", num: "❸", label: "물류·통관",
    title: "🚢 Pillar III — 물류 & 통관 (Logistics & Trade Nexus)", desc: "러시아 극동 수산 클러스터 물동량 및 차익거래 트래커", color: "#2563eb", icon: Truck,
    widgets: ["w_fta_pollock_us_rebound", "w8_korea_deficit", "w11_surimi_trade", "w13", "w15", "w16", "w18", "w19_tariff_engineering", "w21_b_season_hedge", "w26_inventory_freight", "w29_eu_derisk_pivot", "w35_eu_gateway", "w36_china_sanitary_pact", "w37_ntb_timeline", "n1_sanction_paradox", "n5_rcep_detour", "w_pollock_eu_tariff_atq_hsk"],
    customInject: ["PollockFtaTariffMatrix", "PollockRouteComparison", "PollockLandedCostWaterfall", "UsPollockDetourWidget"]
  },
  {
    id: "P4", num: "❹", label: "판매·수요",
    title: "📈 Pillar IV — 판매 & 수요 (Sales & B2B Market)", desc: "단가 인플레이션 방어 및 정부 조달(B2G) 바잉 파워 롤업", color: "#3b82f6", icon: DollarSign,
    widgets: ["w_fta_pollock_qprice", "w6_inflation_unitprice", "w7_usa_russia_unitprice", "w27_substitute_spread", "w33_arbitrage_tracker", "w38_us_canned_boom", "w39_saithe_competition", "w_pollock_frozen_import_price_monthly"],
    customInject: ["PollockPriceForecastChart", "PollockScenarioSimulator", "PollockSubstituteElasticity"]
  },
  {
    id: "P5", num: "❺", label: "ESG·지속가능성",
    title: "🌱 Pillar V — ESG & 지속가능성 (ESG & Compliance)", desc: "대러 제재(Sanctions) 리스크 및 수산 안보 방어", color: "#0ea5e9", icon: ShieldCheck,
    widgets: ["w4_korea_crisis", "w14", "w23_upcycling_esg", "w28_esg_premium", "w30_traceability_risk", "w40_traceability_surge", "n6_waste_to_wealth", "w_pollock_sst_climate_collapse"],
    customInject: ["PollockRiskScorecard", "PollockSanctionParadox"]
  }
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
  w34_china_export_flow: TrendingUp, w35_eu_gateway: Globe, w36_china_sanitary_pact: ShieldCheck,
  w37_ntb_timeline: AlertTriangle, w38_us_canned_boom: TrendingUp, w39_saithe_competition: Scale,
  w40_traceability_surge: Shield,
  n1_sanction_paradox: ShieldCheck, n5_rcep_detour: Globe, n6_waste_to_wealth: Factory,
  k1_3d_surimi: Zap, k2_epa_larva: Fish, k3_gamma_roe: ShieldCheck,
  k4_senior_food: Scale, k5_hatch_temp: Activity,
  w_fta_pollock_ru_dependency: AlertTriangle, w_fta_pollock_form_mix: Factory,
  w_fta_pollock_2023_shock: Activity, w_fta_pollock_us_rebound: TrendingUp,
  w_fta_pollock_qprice: DollarSign,
};

const WIDGET_UNITS: Record<string, string> = {
  w1_global_catch: '(천 톤)',
  w2_hegemony: '(%)',
  w3_diverging: '(천 톤)',
  w4_korea_crisis: '(%)',
  w5_china_blackhole: '(천 톤)',
  w6_inflation_unitprice: '(USD/t)',
  w7_usa_russia_unitprice: '(USD/t)',
  w8_korea_deficit: '(천 USD)',
  w9_surimi_megatrend: '(천 톤)',
  w10_surimi_top3: '(%)',
  w11_surimi_trade: '(천 톤)',
  w12_proc_vs_surimi: '(%)',
  w13: '(%)',
  w14: '(USD/t)',
  w15: '(USD/t)',
  w16: '(천 톤)',
  w17: '(천 톤)',
  w18: '(천 톤)',
  w19_tariff_engineering: '(%)',
  w20_whitefish_reshuffle: '(%)',
  w21_b_season_hedge: '(주)',
  w22_precision_release: '(%)',
  w23_upcycling_esg: '(%)',
  w24_opex_spread: '(USD/t)',
  w25_processing_bottleneck: '(일)',
  w26_inventory_freight: '(지수)',
  w27_substitute_spread: '(RUB/kg)',
  w28_esg_premium: '(지수)',
  w29_eu_derisk_pivot: '(%)',
  w30_traceability_risk: '(지수)',
  w31_catch_gap: '(천 톤)',
  w32_sst_fleet_matrix: '(°C)',
  w33_arbitrage_tracker: '(원/kg)',
  w34_china_export_flow: '(백만 USD)',
  w35_eu_gateway: '(천 USD)',
  w36_china_sanitary_pact: '(톤)',
  w37_ntb_timeline: '(건)',
  w38_us_canned_boom: '(백만 USD)',
  w39_saithe_competition: '(EUR/kg)',
  w40_traceability_surge: '(연도)',
  n1_sanction_paradox: '(지수)',
  n5_rcep_detour: '(천 톤)',
  n6_waste_to_wealth: '(%)',
  k1_3d_surimi: '(gf)',
  k2_epa_larva: '(%)',
  k3_gamma_roe: '(점수)',
  k4_senior_food: '(N/m²)',
  k5_hatch_temp: '(%)',
  w_fta_pollock_ru_dependency: '(천 톤 · %)',
  w_fta_pollock_form_mix: '(%)',
  w_fta_pollock_2023_shock: '(천 톤 · %)',
  w_fta_pollock_us_rebound: '(천 톤)',
  w_fta_pollock_qprice: '($/kg · ×)',
};

const formatYAxis = (v: number) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(v);
};

const formatXAxis = (tickItem: any) => {
  if (typeof tickItem !== 'string') return tickItem;
  let label = tickItem.replace(/\(.*?\)/g, '').trim();
  if (label.length > 6) {
    label = label.substring(0, 6) + '..';
  }
  return label;
};

export default function PollockDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'P5'>('P1');
  const [kcsLive, setKcsLive] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/pollock_real_data_v4.json').then(res => res.json()),
      fetch('/api/pollock-kcs?year=2024').then(res => res.json()).catch(() => null)
    ])
      .then(([baseData, kcs]) => {
        setData(baseData);
        if (kcs) setKcsLive(kcs);
      })
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

  const widgets = data.widgets;
  const kpis = { ...data.kpis };

  // Live Overrides
  if (kcsLive && kcsLive.summary) {
    kpis.kpi4 = {
      ...kpis.kpi4,
      value: `${kcsLive.summary.ruPct}%`,
      desc: `냉동 원물(HS 030367) ${kcsLive.summary.totalWgt.toLocaleString()}톤 중 ${kcsLive.summary.ruWgt.toLocaleString()}톤이 러시아산`,
      telemetry: kcsLive.isLive ? 'live' : 'synced',
      syncDate: kcsLive.source,
    };
  }

  const kpiKeys = Object.keys(kpis);

  // 헤더 카운트 동적 산출 (하드코딩 금지 — 실렌더 기준)
  const totalWidgetCount = PILLARS.reduce(
    (acc, p) => acc + (widgets?.filter((w: any) => p.widgets.includes(w.id)).length || 0) + (p.customInject?.length || 0),
    0
  );

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
                  <linearGradient key={i} id={`pArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.color} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={a.color} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatXAxis} minTickGap={20} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" height={36} />
              {widget.areas?.map((a: any, i: number) => (
                <Area key={i} type="monotone" dataKey={a.key || a.dataKey} stroke={a.color} fill={`url(#pArea${widget.id}_${i})`} strokeWidth={2.5} />
              ))}
            </AreaChart>
          );
        case "bar":
        case "composed":
          const hasRightAxisNew = widget.hasRightAxis || widget.lines?.some((l: any) => l.yAxisId === 'right') || widget.bars?.some((b: any) => b.yAxisId === 'right');
          return (
            <ComposedChart data={d}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatXAxis} minTickGap={20} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              {hasRightAxisNew && <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />}
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" height={36} />
              {widget.bars?.map((b: any, i: number) => {
                const p = getA11yBarProps(i);
                return <Bar key={`b${i}`} yAxisId={b.yAxisId || "left"} dataKey={b.key || b.dataKey} fill={p.fill} color={b.color || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
              })}
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key || l.dataKey} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
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
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
          </PieChart>
        );
      case "line":
        return (
          <LineChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatXAxis} minTickGap={20} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />}
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatXAxis} minTickGap={20} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
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
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatXAxis} minTickGap={20} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(140,170,255,0.10)'}} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
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
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatXAxis} minTickGap={20} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
            {series.map((s: any, i: number) => {
              if (s.type === 'line') return <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2.5} dot={{r: 3}} />;
              if (s.type === 'scatter') return <Scatter key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} fill={s.color} />;
              const p = getA11yBarProps(i);
              return <Bar key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} fill={p.fill} color={s.color || p.color} radius={[6, 6, 0, 0]} />;
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
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>명태 전략 커맨드센터 — 위젯 {totalWidgetCount}개 · KPI {kpiKeys.length}개 · API 파이프라인 6개</p>
            </div>
          </div>
          <div style={{ 
            fontSize: '0.8rem', padding: '0.5rem 1rem', 
            background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(6, 182, 212, 0.2)', 
            borderRadius: '8px', color: '#94a3b8', fontWeight: 500
          }}>
            <span style={{ color: '#06b6d4' }}>FishStatJ 1950-2024 + KFAS + 국정연 12건</span> · API-First · Claude Verified
          </div>
        </div>
      </header>

      {/* ═══ 6 KPIs ═══ */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', minHeight: '32px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, lineHeight: 1.3, wordBreak: 'break-word' }}>{kpi.title}</span>
                <div style={{ flexShrink: 0 }}>
                  {kpi.telemetry ? (
                    <TelemetryBadge status={kpi.telemetry as any} syncDate={kpi.syncDate} />
                  ) : (
                    <IconComp size={14} style={{ color: theme.text }} />
                  )}
                </div>
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

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px',
          borderBottom: '1px solid rgba(140,170,255,0.10)',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {PILLARS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(140,170,255,0.12)';
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
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
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
                  background: isActive ? s.color : 'rgba(140,170,255,0.12)',
                  color: isActive ? '#0a0f1f' : 'rgba(148,163,184,0.6)',
                  fontSize: '0.75rem', fontWeight: 800,
                  transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>{idx + 1}</div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}>{s.label}</span>
                {isActive && (
                  <span style={{
                    fontSize: '0.6rem', color: 'rgba(148,163,184,0.7)',
                    textAlign: 'center', lineHeight: 1.3, marginTop: '2px', padding: '0 4px',
                  }}>
                    {s.desc.slice(0, 24)}…
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 활성 Pillar 위젯 그리드 ═══ */}
      {(() => {
        const pillar = PILLARS.find(p => p.id === activePart)!;
        const pillarWidgets = widgets?.filter((w: any) => pillar.widgets.includes(w.id)) || [];
        return (
          <section style={{ marginBottom: '4rem' }}>
            <div style={{
              padding: "1.25rem 1.5rem",
              background: `linear-gradient(90deg, ${pillar.color}20 0%, transparent 100%)`,
              borderLeft: `4px solid ${pillar.color}`,
              marginBottom: "1.5rem",
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#f8fafc" }}>{pillar.title}</h2>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>{pillar.desc}</p>
              </div>
              <span style={{ fontSize: '0.7rem', color: pillar.color, background: `${pillar.color}20`, padding: '4px 12px', borderRadius: '500px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {pillarWidgets.length + (pillar.customInject?.length || 0)} 위젯
              </span>
            </div>
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {pillarWidgets.map((w: any) => renderWidgetCard(w, pillar.id.replace('P', 'S') as 'S1'|'S2'|'S3'|'S4'|'S5'))}
              {pillar.customInject?.includes("PollockConcentrationIndex") && <PollockConcentrationIndex />}
              {pillar.customInject?.includes("PollockAlternativeSourcing") && <PollockAlternativeSourcing />}
              {pillar.customInject?.includes("PollockFtaTariffMatrix") && <PollockFtaTariffMatrix />}
              {pillar.customInject?.includes("PollockRouteComparison") && <PollockRouteComparison />}
              {pillar.customInject?.includes("PollockLandedCostWaterfall") && <PollockLandedCostWaterfall />}
              {pillar.customInject?.includes("PollockPriceForecastChart") && <PollockPriceForecastChart />}
              {pillar.customInject?.includes("PollockScenarioSimulator") && <PollockScenarioSimulator />}
              {pillar.customInject?.includes("PollockSubstituteElasticity") && <PollockSubstituteElasticity />}
              {pillar.customInject?.includes("PollockRiskScorecard") && <PollockRiskScorecard />}
              {pillar.customInject?.includes("PollockSanctionParadox") && <PollockSanctionParadox />}
              {pillar.customInject?.includes("UsPollockDetourWidget") && <UsPollockDetourWidget />}
            </div>
          </section>
        );
      })()}

    </div>
  );

  function renderWidgetCard(w: any, pillar: 'S1'|'S2'|'S3'|'S4'|'S5' = 'S3') {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const accentColor = '#06b6d4';

    const ENHANCED_INSIGHTS: Record<string, {sit?: string, strat?: string}> = {};
    const situation = ENHANCED_INSIGHTS[w.id]?.sit || w.sit || w.situation || '';
    const takeaway = ENHANCED_INSIGHTS[w.id]?.strat || w.strat || w.tak || w.takeaway || '';
    const unit = WIDGET_UNITS[w.id] ? `단위: ${WIDGET_UNITS[w.id]}` : '';
    const subtitle = w.subtitle || '';
    const cardDesc = [unit, subtitle].filter(Boolean).join(' — ');
    // 위젯 표시 데이터는 정적 JSON(/data/pollock_real_data_v4.json)에서 옴 → 항상 STATIC (L-09)
    const liveStatus: 'LIVE'|'SYNCED'|'STATIC' = 'STATIC';

    return (
      <WidgetCard key={w.id}
        title={w.title}
        icon={IconComp}
        iconColor={accentColor}
        pillar={pillar}
        cardDesc={cardDesc}
        telemetry={{ status: liveStatus, syncDate: w.syncDate }}
        chartHeight={375}
        chart={renderChart(w)}
        takeaway={{
          situation,
          actionPlan: takeaway,
          source: w.methodology || w.source || 'Silla Co. Intelligence Network',
        }}
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
