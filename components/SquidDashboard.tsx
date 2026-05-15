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
  { id: 'S1', title: '🌊 Part I — 원물 및 조달 (Raw Material & Sourcing)', desc: '포클랜드 자원평가 트래커 · 글로벌 어획 헤게모니 · 기후 및 어획량 동향', color: '#10b981' },
  { id: 'S2', title: '🏭 Part II — 가공 및 밸류체인 (Processing & Value Chain)', desc: '스페인(Vigo) 가공 허브 스프레드 · 대체 원료 블렌딩 마진 분석', color: '#8b5cf6' },
  { id: 'S3', title: '⚓ Part III — 물류 및 운영 원가 (Logistics & Fleet OPEX)', desc: '라이선스/ITQ 입어료 비용 변동 · 채낚기 선단 유류비(MGO) 시뮬레이션', color: '#06b6d4' },
  { id: 'S4', title: '📊 Part IV — 판매 및 수요 (Sales & Demand)', desc: 'KOSIS 내수 CPI 괴리율 · 인플레이션 발 수요 파괴 및 수입 단가 트렌드', color: '#3b82f6' },
  { id: 'S5', title: '🛡️ Part V — ESG 및 규제 리스크 (ESG & Compliance)', desc: '남서대서양 IUU 조업 레이더 · 포클랜드 ITQ 규제 · 수입 통관 위생검역 모니터링', color: '#f59e0b' },
  { id: 'S6', title: '🎯 Part VI — M&A 실사 인텔리전스 (Due Diligence)', desc: '선민수산 인수 Bull/Bear 스코어카드 · Earn-out 시뮬레이터 · 100일 Value Creation Plan', color: '#ec4899' },
];

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

const PIE_COLORS = ["#8b5cf6", "#38bdf8", "var(--color-danger)", "var(--color-warning)", "var(--color-success)", "#ec4899", "#06b6d4", "#f97316"];

/* ─── KPI Themes ─── */
const KPI_THEMES = [
  { border: 'none', glow: 'none', text: 'var(--color-success)', icon: Database },
  { border: 'none', glow: 'none', text: 'var(--text-primary)', icon: TrendingUp },
  { border: 'none', glow: 'none', text: 'var(--color-success)', icon: Ship },
  { border: 'none', glow: 'none', text: 'var(--color-danger)', icon: ShieldCheck },
  { border: 'none', glow: 'none', text: 'var(--color-warning)', icon: Factory },
  { border: 'none', glow: 'none', text: 'var(--text-primary)', icon: Scale },
];

/* ─── Widget Icons ─── */
const WIDGET_ICONS: Record<string, any> = {
  w1_catch_powers: Globe, w2_korea_supply: TrendingDown, w3_jumbo_flying: Fish,
  w4_unit_price: DollarSign, w5_top_importers: Crosshair, w6_species_pie: Activity,
  w7_korea_category: BarChart2, w8_china_export: Zap, w9_trade_deficit: AlertTriangle,
  w10_processed_dominance: Factory, w11_no_aquaculture: ShieldCheck, w12_ax_fishing: Anchor,
  w13: Truck, w14: MapPin, w15: TrendingDown, w16: Globe, w17: Factory, w18: Scale,
  w25_squid_chitosan_biomaterial: Leaf, w26_squid_ai_jigging_fuel: Cpu, w27_squid_climate_geopolitics: Globe,
  w28_falkland_waterfall: AlertTriangle, w29_capex_shock: Activity, w30_business_model: TrendingUp,
  w31_eu_squid_supply_shock: TrendingDown, w32_eu_squid_price_tier: BarChart2,
  w31_eu_squid_supply_shock: TrendingDown, w32_eu_squid_price_tier: BarChart2,
  w33_eu_first_sale_spread: TrendingUp, w34_value_add_funnel: Layers,
  w35_spain_trade_hub: MapPin, w36_stagflation_paradox: TrendingUp,
  w37_spain_arbitrage_trap: Crosshair, w38_vigo_chokepoint_monopoly: AlertTriangle,
  w39_mediterranean_premium: DollarSign, w40_value_chain_exploitation: Layers,
  w41_temporal_arbitrage: Clock, w42_macro_demand_destruction: Activity,
  w43_risk_reward_inversion: Scale,
  w48_supply_inversion: TrendingDown, w49_processing_funnel: Layers,
  w50_fleet_opex: DollarSign, w51_policy_intervention: Scale,
  w52_iuu_geopolitics: Globe, w53_energy_stress_test: AlertTriangle,
  w54_sourcing_bottleneck: AlertCircle, w55_export_concentration: MapPin,
  w56_sunmin_pe_valuation: DollarSign, w57_china_supply_dominance: TrendingUp,
  w58_iuu_blackbox_risk: AlertTriangle, w59_kor_vie_chn_conflict: Crosshair,
  w60_twoway_price_simulator: Activity,
  w_squid_hs_tariff_sim: DollarSign,
  w_kosis_squid_cpi: TrendingUp,
  w_mfds_squid_safety: ShieldCheck,
  w_ofac_iuu_radar: AlertTriangle,
  w_wto_squid_sps: Globe,
  w_importyeti_eu_buyers: Anchor,
  w_squid_price_forecast: TrendingUp,
  w_squid_sourcing_sim: Layers
};

const formatYAxis = (v: number) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
  return v;
};

export default function SquidDashboard() {
  const [data, setData] = useState<any>(null);
  const [apiWidgets, setApiWidgets] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showEdu, setShowEdu] = useState(true);
  const [mgoPrice, setMgoPrice] = useState(107);
  const [fxRate, setFxRate] = useState(1350);
  const [apiStatus, setApiStatus] = useState("Connected");
  const [apiCount, setApiCount] = useState(0);

  useEffect(() => {
    fetch('/data/squid_real_data_v4.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load squid data", err));

    // Fetch Live APIs for Squid
    const apiEndpoints = ['hsping', 'kosis', 'mfds', 'ofac', 'wto', 'importyeti', 'squid-forecast', 'squid-sourcing'];
    
    Promise.allSettled(apiEndpoints.map(ep => fetch(`/api/squid/${ep}`).then(r => r.json())))
      .then(results => {
        const liveWidgets = results
          .filter(r => r.status === 'fulfilled')
          .map(r => (r as PromiseFulfilledResult<any>).value);
        setApiWidgets(liveWidgets);
        setApiCount(liveWidgets.length);
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
      <RefreshCcw size={32} style={{ color: '#FCD535', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#848E9C', fontSize: '1rem' }}>Loading Strategic Intelligence...</p>
    </div>
  );

  const { kpis, widgets: jsonWidgets } = data;
  const kpiKeys = Object.keys(kpis);
  
  // Merge live API widgets with JSON widgets
  const widgets = [...jsonWidgets, ...apiWidgets];

  /* ─── Unified Chart Renderer (supports both old series and new bars/lines/areas format) ─── */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;

    // Determine chart type (normalize to lowercase)
    const chartType = (widget.chartType || '').toLowerCase();

    // NEW FORMAT (Claude widgets) — uses xKey, bars, lines, areas
    if (widget.xKey || widget.bars || widget.lines || widget.areas) {
      // Smart label rotation for non-numeric X-axis (Korean labels)
      const isNewTextAxis = widget.xKey && d.length > 0 && typeof d[0][widget.xKey] === 'string' && isNaN(Number(d[0][widget.xKey]));
      const newTickProps = isNewTextAxis ? { fontSize: 10, angle: -30, textAnchor: 'end' as const } : { fontSize: 10 };
      const newChartMargin = isNewTextAxis ? { top: 5, right: 10, left: -10, bottom: 40 } : undefined;
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
            <AreaChart data={d} margin={newChartMargin}>
              <defs>
                {widget.areas?.map((a: any, i: number) => (
                  <linearGradient key={i} id={`sArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={a.color || a.fill} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={a.color || a.fill} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={newTickProps} interval={0} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {widget.areas?.map((a: any, i: number) => (
                <Area key={i} type="monotone" dataKey={a.key || a.dataKey} stroke={a.color || a.stroke || a.fill} fill={`url(#sArea${widget.id}_${i})`} strokeWidth={2.5} />
              ))}
            </AreaChart>
          );
        case "bar":
          return (
            <BarChart data={d} margin={newChartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={newTickProps} interval={0} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {widget.bars?.map((b: any, i: number) => (
                <Bar key={i} dataKey={b.key || b.dataKey} fill={b.color || b.fill} radius={[6,6,0,0]} fillOpacity={0.85} />
              ))}
            </BarChart>
          );
        case "line":
          return (
            <LineChart data={d} margin={newChartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={newTickProps} interval={0} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {widget.lines?.map((l: any, i: number) => (
                <Line key={i} type="monotone" dataKey={l.key || l.dataKey} stroke={l.color || l.stroke || l.fill} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </LineChart>
          );
        case "bar":
        case "composed":
          return (
            <ComposedChart data={d} margin={newChartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={newTickProps} interval={0} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              {(widget.lines?.some((l:any) => l.yAxisId === 'right') || widget.bars?.some((b:any) => b.yAxisId === 'right') || widget.areas?.some((a:any) => a.yAxisId === 'right')) && (
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              )}
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} />
              {widget.areas?.map((a: any, i: number) => (
                <Area key={`a${i}`} yAxisId={a.yAxisId || 'left'} type="monotone" dataKey={a.key || a.dataKey} fill={a.color || a.fill} stroke={a.color || a.stroke || a.fill} fillOpacity={0.5} strokeWidth={2} />
              ))}
              {widget.bars?.map((b: any, i: number) => (
                <Bar key={`b${i}`} yAxisId={b.yAxisId || 'left'} dataKey={b.key || b.dataKey} fill={b.color || b.fill} radius={[6,6,0,0]} fillOpacity={0.85} />
              ))}
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} yAxisId={l.yAxisId || 'left'} type="monotone" dataKey={l.key || l.dataKey} stroke={l.color || l.stroke || l.fill} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </ComposedChart>
          );
        default:
          return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
      }
    }

    // OLD FORMAT (Gemini widgets) — uses xAxis, series[]
    const xAxis = widget.xAxis || 'Year';
    const series = widget.series || [];
    const hasRightAxis = series.some((s: any) => s.yAxisId === 'right');
    // Smart label rotation for non-numeric X-axis (Korean labels)
    const isTextAxis = xAxis !== 'Year' && d.length > 0 && typeof d[0][xAxis] === 'string' && isNaN(Number(d[0][xAxis]));
    const xTickProps = isTextAxis ? { fill: '#94a3b8', fontSize: 10, angle: -30, textAnchor: 'end' as const } : { fill: '#94a3b8', fontSize: 11 };
    const chartMargin = isTextAxis ? { top: 20, right: 10, left: -10, bottom: 40 } : { top: 20, right: 10, left: -10, bottom: 0 };

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
          <LineChart data={d} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} interval={0} />
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
          <AreaChart data={d} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} interval={0} />
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
          <BarChart data={d} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} interval={0} />
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
          <ComposedChart data={d} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} interval={0} />
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
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
      
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
                오징어 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Squid Strategic Command Center — {widgets?.length || 18} Widgets · {kpiKeys?.length || 6} KPIs</p>
            </div>
          </div>
                    <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #1ed760', animation: 'pulse 2s infinite' }} />
            <span>{apiCount || 8} APIs <span style={{ color: 'var(--color-success)' }}>{apiStatus}</span></span>
            <span style={{ margin: '0 8px', color: '#4d4d4d' }}>|</span>
            <span style={{ color: 'var(--text-primary)' }}>HS Ping · KOSIS · MFDS · WTO · OFAC · ImportYeti</span>
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

      {/* ═══ Education Module ═══ */}
      <div style={{ marginBottom: '2rem', background: '#181818', border: 'none', borderRadius: '8px', overflow: 'hidden', boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px' }}>
        <button onClick={() => setShowEdu(!showEdu)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem', background: '#181818', border: 'none', borderBottom: showEdu ? '1px solid #272727' : 'none', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#181818'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BookOpen size={24} color="var(--color-success)" />
            <div>
              <span style={{ fontSize: '1.13rem', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>신입직원 교육 가이드</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 400 }}>NotebookLM 분석 기반: 조업 방식 비교 및 포클랜드 시장 리스크 점검</span>
            </div>
          </div>
          {showEdu ? <ChevronUp size={24} color="var(--text-secondary)" /> : <ChevronDown size={24} color="var(--text-secondary)" />}
        </button>
        
        {showEdu && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              
              {/* Module 1 */}
              <div className="ds-card" style={{background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                  <Anchor size={20} color="var(--color-success)"/> 조업 방식 비교: 채낚기 vs 트롤
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '6px' }}>
                    <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>🎣 채낚기 (Jigging)</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <strong style={{color:'var(--text-primary)'}}>원리:</strong> 야간 집어등으로 수면 유인 후 자동 조획기로 낚획<br/>
                      <strong style={{color:'var(--text-primary)'}}>장점:</strong> 극강의 선도, 외관 깨끗 (프리미엄 판매용), 혼획 거의 없음 (친환경)<br/>
                      <strong style={{color:'var(--text-primary)'}}>단점:</strong> 막대한 유류비 (전체 비용의 60~70%), 국제 유가 변동 리스크에 취약
                    </p>
                  </div>
                  <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: '6px' }}>
                    <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>🕸️ 트롤 (Trawling)</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <strong style={{color:'var(--text-primary)'}}>원리:</strong> 소나 탐지 후 거대한 그물을 끌며 대량 포획<br/>
                      <strong style={{color:'var(--text-primary)'}}>장점:</strong> 1회 양망 시 대량 어획, 주간/악천후 조업 가능 (조업 일수 확보 유리)<br/>
                      <strong style={{color:'var(--text-primary)'}}>단점:</strong> 그물 압착으로 선도 저하 (가공 원료용), 높은 혼획률, 해저 생태계 훼손 리스크
                    </p>
                  </div>
                </div>
              </div>

              {/* Module 2 & 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="ds-card" style={{background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                    <Globe size={20} color="var(--color-success)"/> 포클랜드 어장 핵심 요약
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <li><strong style={{color:'var(--text-primary)'}}>타겟 어종:</strong> 일렉스 오징어 (Illex argentinus). 국내 살오징어 어획량 급감으로 대체재 가치 폭등 중.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>경쟁 환경:</strong> 한국은 연평균 약 30척 입어 (4위). 대만(71척)과 스페인이 핵심 경쟁국이며 공해상은 중국 선단 주도.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>비즈니스 방향:</strong> 단순 조업을 넘어 진미채, 냉동 튜브 등 다운스트림 유통망 수직 계열화를 통한 수익성 방어 필수.</li>
                  </ul>
                </div>
                <div className="ds-card" style={{background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', flex: 1}}>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                    <ShieldCheck size={20} color="var(--color-danger)"/> 육상부서 필수 체크: 진입 리스크
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <li><strong style={{color:'var(--text-primary)'}}>쿼터(ITQ B) 장벽:</strong> 25년 장기 어업권 제도로 독자 신규 진입 극히 어려움. 기존 선사와의 JV(합작) 또는 M&A 우회 타진 필요.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>선박 안전 규제:</strong> 영국 MSN 1873 규정 준용. 기존 30년 이상 노후 어선 투입 불가, 고효율 LED 집어등을 갖춘 신조 투자가 장기적 대안.</li>
                    <li><strong style={{color:'var(--text-primary)'}}>IUU (불법어업) 통관:</strong> 수입 통관 시 '어획증명서(Catch Certificate)' 제출 의무. 무결점 원산지 증명 체계 구축 필요.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Module 4: AI Chatbot (NotebookLM Link) */}
            <div className="ds-card" style={{background: '#181818', 
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
                    <Zap size={18} color="var(--color-success)" /> 오징어 지식 AI 챗봇 (NotebookLM)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    70여 개의 최신 논문, 기사, 정부 보고서가 학습된 맞춤형 AI입니다. 실무 중 궁금한 오징어 시장 동향, 조업 기술, 규제 등을 즉시 질문하세요.
                  </p>
                </div>
              </div>
              <a href="https://notebooklm.google.com/notebook/16a01f36-4e15-42c5-88e1-c2f9f6b16992" target="_blank" rel="noreferrer" style={{ 
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


      {/* ═══ API COMMAND CENTER ═══ */}
      <section style={{ marginBottom: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Scenario Simulator */}
        <div className="ds-card" style={{background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', color: 'var(--color-success)' }}>
            <Activity size={20} />
            <h3 style={{ margin: 0, fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)' }}>실시간 시나리오 시뮬레이터</h3>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Rotterdam MGO (선박유)</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--color-danger)', fontWeight: 700 }}>${mgoPrice}/bbl</span>
            </div>
            <input 
              type="range" min="60" max="150" value={mgoPrice} 
              onChange={(e) => setMgoPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-danger)' }} 
            />
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>USD/KRW 환율 (관세 타격)</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--color-info)', fontWeight: 700 }}>₩{fxRate}</span>
            </div>
            <input 
              type="range" min="1200" max="1500" value={fxRate} 
              onChange={(e) => setFxRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-info)' }} 
            />
          </div>
        </div>

        {/* Intelligence Feed / Alert Drawer */}
        <div className="ds-card" style={{background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem', color: 'var(--color-success)' }}>
            <Globe size={20} />
            <h3 style={{ margin: 0, fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)' }}>API Intelligence 피드</h3>
            <span style={{ marginLeft: 'auto', fontSize: '0.66rem', background: 'var(--color-success)', color: 'var(--bg-color)', padding: '2px 8px', borderRadius: '500px', fontWeight: 700, textTransform: 'uppercase' }}>LIVE</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '10px', padding: '0.8rem', background: 'var(--surface-2)', borderRadius: '6px', borderLeft: '3px solid #f3727f' }}>
              <AlertTriangle size={16} color="var(--color-danger)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>[기상청 API] ENSO 임계치 돌파</p>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>태평양 SST 이상 기온 지속. 공해상 조업 확대 지시가 필요합니다.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', padding: '0.8rem', background: 'var(--surface-2)', borderRadius: '6px', borderLeft: '3px solid #539df5' }}>
              <TrendingUp size={16} color="var(--color-info)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>[EUMOFA API] Vigo항 단가 급등</p>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Illex 도소매 스프레드 42% 도달. B2B 직수출 최적 타이밍입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUE CHAIN FRAMEWORK ═══ */}



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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w1_catch_powers', 'w2_korea_supply', 'w3_jumbo_flying', 'w_squid_price_forecast', 'w61_kfas_regime_shift', 'w62_kfas_msy_assessment', 'w48_supply_inversion', 'w57_china_supply_dominance', 'w18', 'w27_squid_climate_geopolitics', 'w12_ax_fishing', 'w68_import_dependency', 'w74_illex_boom_bust', 'w76_area41_illex_share', 'w80_loligo_vs_illex_portfolio'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w10_processed_dominance', 'w31_eu_squid_supply_shock', 'w35_spain_trade_hub', 'w37_spain_arbitrage_trap', 'w40_value_chain_exploitation', 'w49_processing_funnel', 'w_squid_sourcing_sim', 'w34_value_add_funnel', 'w17', 'w47_spain_processing_empire', 'w30_business_model'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w50_fleet_opex', 'w53_energy_stress_test', 'w26_squid_ai_jigging_fuel', 'w_squid_hs_tariff_sim', 'w54_sourcing_bottleneck', 'w28_falkland_waterfall', 'w29_capex_shock', 'w43_risk_reward_inversion', 'w66_capex_roadmap', 'w71_fig_licence_system', 'w73_illex_2024_season', 'w79_fleet_competition_map'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w_kosis_squid_cpi', 'w4_unit_price', 'w6_species_pie', 'w7_korea_category', 'w8_china_export', 'w9_trade_deficit', 'w32_eu_squid_price_tier', 'w33_eu_first_sale_spread', 'w36_stagflation_paradox', 'w55_export_concentration', 'w60_twoway_price_simulator', 'w_importyeti_eu_buyers', 'w42_macro_demand_destruction', 'w38_vigo_chokepoint_monopoly', 'w39_mediterranean_premium', 'w41_temporal_arbitrage', 'w44_trade_route_arbitrage', 'w45_christmas_demand_spike', 'w46_france_premium_paradox', 'w5_top_importers', 'w69_eu_supply_gap'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w_ofac_iuu_radar', 'w_wto_squid_sps', 'w_mfds_squid_safety', 'w58_iuu_blackbox_risk', 'w52_iuu_geopolitics', 'w11_no_aquaculture', 'w25_squid_chitosan_biomaterial', 'w51_policy_intervention', 'w77_mile201_dwf_crisis'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
          </div>
        </section>

        {/* ═══════ Part VI: M&A 실사 인텔리전스 ═══════ */}
        <section>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: SECTIONS[5]?.color || '#ec4899', borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[5]?.title || '🎯 Part VI — M&A 실사 인텔리전스'}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[5]?.desc || ''}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
            {widgets?.filter((w: any) => ['w65_ma_scorecard', 'w67_earnout_sim', 'w70_value_creation', 'w56_sunmin_pe_valuation', 'w72_fig_revenue_trend', 'w75_loligo_scientific_mgmt', 'w78_itq_transition_timeline'].includes(w.id)).map((w: any) => renderWidgetCard(w))}
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
      <div key={w.id} className={styles.glassCard} className="ds-card" style={{display: 'flex', flexDirection: 'column', minHeight: '480px',
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

        {/* Takeaway Box (참치 TakeawayBox 컴포넌트 동기화) */}
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
