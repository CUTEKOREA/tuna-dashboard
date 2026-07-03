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
  RefreshCcw, Crosshair, MapPin, Factory, Scale, BarChart2,
  Database, Ship, Zap, Leaf, Layers
} from 'lucide-react';
import TermTooltip from './TermTooltip';
import WidgetCard from './WidgetCard';
import { TelemetryBadge } from './TelemetryBadge';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';
import ShrimpFTAQuarterly from './ShrimpFTAQuarterly';
import { truncateXAxis } from '../lib/chart-standards';

const EXTRA_BY_PILLAR: Record<string, React.FC[]> = {
  S1: [],
  S2: [],
  S3: [ShrimpFTAQuarterly],
  S4: [],
  S5: [],
};

// 패턴 I: 페이지가 실제 호출하는 새우 API 라우트 목록 — 헤더 카운트의 단일 출처 (하드코딩 숫자 금지)
const SHRIMP_API_SOURCES: Array<{ key: string; url: string }> = [
  { key: 'customs', url: '/api/shrimp/customs' },
  { key: 'kamis', url: '/api/shrimp/kamis' },
  { key: 'macro', url: '/api/shrimp/macro' },
  { key: 'krungsri', url: '/api/shrimp/krungsri' },
  { key: 'forecast', url: '/api/shrimp/forecast' },
  { key: 'sourcing', url: '/api/shrimp/sourcing-sim' },
  { key: 'compliance', url: '/api/shrimp/compliance' },
  { key: 'esg', url: '/api/shrimp/esg-radar' },
  { key: 'emerging', url: '/api/shrimp/emerging-markets' },
];

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: '#f8fafc', fontSize: '0.88rem' }}>
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

const formatYAxis = (v: number, unit?: string) => {
  let formatted: string | number = v;
  if (v >= 1000000) formatted = (v / 1000000).toFixed(1) + 'M';
  else if (v >= 1000) formatted = (v / 1000).toFixed(0) + 'k';
  return formatted + (unit ? ` ${unit}` : '');
};

// 5-Pillar 네비게이터 메타 (새우 시그니처 그라디언트 emerald → teal — 룰북 D-04 갈치/새우 공통)
const SECTIONS = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '🦐 제1기둥 — 원물 생산', desc: '글로벌 양식·어획 동향, 산지 가격, 질병/사료 리스크', color: '#10b981', icon: Anchor,
    widgets: ['w01_paradigm_shift', 'w04_top10_aqua', 'w05_top10_catch', 'w15', 'w44_ems_margin', 'w46_ecuador_dominance', 'w_raw1_production_trend', 'w_raw2_unit_price', 'w_shrimp_price_forecast', 'w_shrimp_macro_dashboard', 'w48_vaccine_priming', 'w20_fcr_80', 'w22_microalgae', 'w50_kfas_bft_pathogen', 'w51_kfas_silymarin_feed', 'w52_kfas_duplex_pcr', 'w54_commodity_trap_index', 'w55_india_species_shift', 'w59_feed_substitute_economics', 'w60_disease_dx_evolution', 'w63_coldwater_shrimp_stock', 'w65_india_seafood_export_trajectory', 'w69_andhra_pradesh_risk'] },
  { id: 'S2', num: '❷', label: '가공·생산', title: '🏭 제2기둥 — 가공 산업', desc: '가공 유형별 생산, 한국 수입 가공품 구조, 신소재 및 대체 단백질', color: '#14b8a6', icon: Factory,
    widgets: ['w03_processing', 'w18', 'w19_hyperspectral', 'w_proc1_type_production', 'w_proc2_kr_import_type', 'w49_black_tiger_revival', 'w42_format_shift', 'w_shrimp_chitosan_opportunity', 'w_shrimp_rte_format', 'w53_kfas_3d_printed_shrimp', 'w62_alt_seafood_disruption'] },
  { id: 'S3', num: '❸', label: '물류·통관', title: '🚢 제3기둥 — 물류 및 무역', desc: '글로벌 무역 흐름, 한국 수입 다변화, 관세·CVD·FTA 시뮬레이션', color: '#0d9488', icon: Ship,
    widgets: ['w07_trade_scaleup', 'w08_top_exporter', 'w09_top_importer', 'w10_kr_import', 'w11_kr_deficit', 'w17', 'w_log1_spot_price', 'w_log2_kr_sourcing', 'w_log3_kr_import_value', 'w_shrimp_sourcing_sim', 'w_shrimp_concentration_risk', 'w45_export_vuln', 'w47_tariff_paradox', 'w56_trade_diversion_flow', 'w61_hhi_timeseries', 'w64_us_cvd_tariff_matrix', 'w66_vn_shrimp_export_peak', 'w67_indo_eu_fta_impact', 'w70_tariff_chaos_timeline', 'w_kr_shrimp_import_quarterly'] },
  { id: 'S4', num: '❹', label: '판매·수요', title: '📈 제4기둥 — 판매 및 수요', desc: '단가 트렌드, 수출국 매출, 대체재 탄력성, 할랄·인플레이션 노출', color: '#5eead4', icon: DollarSign,
    widgets: ['w02_aqua_value', 'w06_top10_revenue', 'w12_unit_price', 'w13', 'w14', 'w16', 'w_sales1_commodity_unit_price', 'w_sales2_exporter_trend', 'w_shrimp_substitute_elasticity', 'w_shrimp_halal_export', 'w43_feed_inflation', 'w_kr_shrimp_origin_price'] },
  { id: 'S5', num: '❺', label: 'ESG·지속가능성', title: '🌱 제5기둥 — ESG 및 지속가능성', desc: '비관세 장벽(NTB), 항생제·강제노동·맹그로브·인증 컴플라이언스', color: '#99f6e4', icon: ShieldCheck,
    widgets: ['w21_peeling_esg', 'w_esg1_compliance', 'w_esg2_supply_risk', 'w_shrimp_ntb_radar', 'w_shrimp_antibiotic_tracker', 'w_shrimp_sps_alert', 'w_shrimp_forced_labor_map', 'w_shrimp_mangrove_index', 'w_shrimp_cert_tracker', 'w57_csddd_readiness', 'w58_vn_labor_audit', 'w68_indonesia_shrimp_associations', 'w_india_shaphari', 'w_vn_traceability_risk'] },
];

export default function ShrimpDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');
  const [activeModal, setActiveModal] = useState<string | null>(null);
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

    // Fetch API Data — SHRIMP_API_SOURCES가 단일 출처 (패턴 I)
    Promise.all(
      SHRIMP_API_SOURCES.map(s => fetch(s.url).then(r => r.ok ? r.json() : null).catch(() => null))
    ).then(results => {
      const next: Record<string, any> = {};
      SHRIMP_API_SOURCES.forEach((s, i) => { next[s.key] = results[i]; });
      setApiData(next);
      if (next.macro?.metrics?.rate) setSimExchangeRate(next.macro.metrics.rate);
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

  // 패턴 I: 카운트는 실측으로만 산출 (하드코딩 금지)
  const connectedApiCount = SHRIMP_API_SOURCES.filter(s => apiData[s.key] && !apiData[s.key].error).length;
  // L-09/L-12: 라우트가 isLive === true를 명시한 경우에만 LIVE로 취급
  const liveApiActive = SHRIMP_API_SOURCES.some(s => apiData[s.key]?.isLive === true);

  const displayWidgets = widgets?.map((w: any) => {
    const newW = { ...w };
    if (newW.title) {
       newW.title = newW.title.replace(/\s*\([A-Za-z\s]+\)/g, '');
    }
    if (newW.id === 'w_log3_kr_import_value') {
      if (apiData.customs?.liveImportData?.length > 0) {
        const historicalData = newW.data.filter((d: any) => parseInt(d.year) < 2024);
        newW.data = [...historicalData, ...apiData.customs.liveImportData];
        newW.telemetry = apiData.customs.isLive ? 'live' : 'synced';
        // 패턴 E: 일괄 fallback 문자열 금지 — 라이브가 아니면 JSON의 syncDate(데이터 빈티지)를 그대로 둠
        if (apiData.customs.isLive) newW.syncDate = '실시간 연동중 (관세청)';
      } else if (apiData.customs !== undefined) {
        // customs fetch 완료됐지만 liveImportData 없음 → 정적 JSON 데이터
        newW.telemetry = 'synced';
      }
      // customs가 null(fetch 실패)이면 JSON 원본 telemetry 유지
    }
    // sourcing-sim: UN Comtrade 실측 CIF를 차트에 바인딩. isLive(Comtrade 성공) 시에만 LIVE 표기(정직).
    if (newW.id === 'w_shrimp_sourcing_sim' && apiData.sourcing?.sourcingMatrix?.length > 0) {
      newW.data = apiData.sourcing.sourcingMatrix.map((s: any) => ({
        country: `${s.flag || ''} ${s.country}`.trim(),
        cif: s.cifPrice_USD_MT,
        tariff: Math.round((s.cifPrice_USD_MT * (s.tariffRate_Percent || 0)) / 100),
        shipping: s.shippingCost_USD_MT,
      }));
      if (apiData.sourcing.isLive) {
        newW.telemetry = 'live';
        newW.badges = ['Live API'];
        newW.syncDate = '실시간 연동중 (UN Comtrade)';
      }
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" height={36} />
              {widget.areas?.map((a: any, i: number) => (
                <Area key={i} type="monotone" dataKey={a.key} name={a.name || a.key} stroke={a.color} fill={`url(#sArea${widget.id}_${i})`} strokeWidth={2.5} />
              ))}
            </AreaChart>
          );
        case "bar":
        case "composed": {
          const hasDualAxis = widget.bars?.length > 0 && widget.lines?.length > 0;
          return (
            <ComposedChart data={d}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
              {hasDualAxis && <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" height={36} />
              {widget.bars?.map((b: any, i: number) => {
                const p = getA11yBarProps(i);
                return <Bar key={`b${i}`} yAxisId="left" dataKey={b.key} name={b.name || b.key} fill={p.fill} color={b.color || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
              })}
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} yAxisId={hasDualAxis ? "right" : "left"} type="monotone" dataKey={l.key} name={l.name || l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
            {series.map((s: any, i: number) => (
              <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} name={s.name || s.dataKey} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
            {series.map((s: any, i: number) => (
              <Area key={i} type="monotone" dataKey={s.dataKey} name={s.name || s.dataKey} stroke={s.color} fill={s.color} fillOpacity={0.5} strokeWidth={2} />
            ))}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(140,170,255,0.10)'}} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
            {series.map((s: any, i: number) => {
              const p = getA11yBarProps(i);
              return <Bar key={i} dataKey={s.dataKey} name={s.name || s.dataKey} fill={p.fill} color={s.color || p.color} radius={[6, 6, 0, 0]} />;
            })}
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart data={d} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={truncateXAxis} angle={0} textAnchor="middle" height={60} minTickGap={20} />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => formatYAxis(v, widget.yUnit)} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" verticalAlign="top" height={36} />
            {series.map((s: any, i: number) => {
              if (s.type === 'line') return <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} name={s.name || s.dataKey} stroke={s.color} strokeWidth={2.5} dot={{r: 3}} />;
              if (s.type === 'scatter') return <Scatter key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} name={s.name || s.dataKey} fill={s.color} />;
              const p = getA11yBarProps(i);
              return <Bar key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} name={s.name || s.dataKey} fill={p.fill} color={s.color || p.color} radius={[6, 6, 0, 0]} />;
            })}
          </ComposedChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported</div>;
    }
  };

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'transparent' }}>
      
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
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>새우 전략 종합 커맨드 센터 — {displayWidgets?.length ?? 0}개 위젯 · {kpiKeys.length}개 핵심지표 · {SHRIMP_API_SOURCES.length}개 API 연동</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#11182f', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connectedApiCount > 0 ? 'var(--color-success)' : 'var(--color-warning)', boxShadow: connectedApiCount > 0 ? '0 0 8px #1ed760' : 'none', animation: 'pulse 2s infinite' }} />
            <span>{connectedApiCount}/{SHRIMP_API_SOURCES.length}개 API <span style={{ color: connectedApiCount > 0 ? 'var(--color-success)' : 'var(--color-warning)' }}>응답</span></span>
            <span style={{ margin: '0 8px', color: '#4d4d4d' }}>|</span>
            <span style={{ color: 'var(--text-primary)' }}>FishStatJ 1950-2024</span>
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
            <div key={key} className="ds-card" style={{
              background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(140, 170, 255, 0.10)', borderRadius: '8px', padding: '1.2rem',
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
                  {/* P0 정정: kpi3·kpi6은 라우트 응답이 mock/합성 산식이므로 LIVE 위장 금지 —
                      JSON의 정직한 telemetry(static)+기준연도만 표기 (L-09) */}
                  {kpi.telemetry && (
                    <TelemetryBadge status={kpi.telemetry as any} syncDate={kpi.syncDate} />
                  )}
                </div>
                <IconComp size={16} style={{ color: theme.text, flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {/* P0 정정: kpi3 라우트 값은 양쪽 분기 모두 하드코딩 mock($8,113)이고,
                    kpi6의 693×(환율/1385)은 USD 적자를 KRW 환율로 스케일링한 무의미 산식 — 둘 다 제거.
                    JSON 원값(기준연도 명시)만 정직 표기. */}
                {parsed ? (
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

      {/* ═══ API Live & What-If Simulator ═══ */}
      <div className="ds-card" style={{marginBottom: '2rem', padding: '1.5rem', background: 'rgba(24, 24, 24, 0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(140, 170, 255, 0.10)', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-success)' }} />
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.13rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity color="var(--color-success)" size={20} /> 관세/환율 충격 시뮬레이터
          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color: liveApiActive ? 'var(--color-success)' : 'var(--color-warning)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>{liveApiActive ? 'LIVE API 연동' : 'API 폴백·정적 기준'}</span>
        </h2>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          
          <div style={{ background: 'var(--surface-2)', padding: '1.2rem', borderRadius: '6px' }}>
            <h3 style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem 0' }}>API 데이터 연동 현황</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              {/* L-09: isLive !== true면 폴백/정적 값임을 명시 (mock을 라이브처럼 보이게 금지)
                  관세청 avgUnitPrice_USD는 라우트 양쪽 분기 모두 고정 상수이므로 isLive와 무관하게 항상 고정 기준값으로 표기 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}><span>관세청 (한국 수입가):</span> <strong style={{ color: 'var(--color-warning)' }}>{apiData.customs ? `$${apiData.customs.metrics.avgUnitPrice_USD.toLocaleString()}/톤 (고정 기준값)` : '로딩중...'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}><span>KAMIS (국내 도매가):</span> <strong style={{ color: apiData.kamis?.isLive ? 'var(--color-success)' : 'var(--color-warning)' }}>{apiData.kamis ? `₩${apiData.kamis.metrics.wholesalePrice_KRW_per_KG.toLocaleString()}/kg${apiData.kamis.isLive ? '' : ' (정적)'}` : '로딩중...'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}><span>환율 (USD/KRW):</span> <strong style={{ color: apiData.macro?.isLive ? 'var(--color-success)' : 'var(--color-warning)' }}>{apiData.macro ? `₩${apiData.macro.metrics.rate.toLocaleString()}${apiData.macro.isLive ? '' : ' (폴백)'}` : '로딩중...'}</strong></div>
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

          <div style={{ background: '#11182f', padding: '1.2rem', borderRadius: '6px', border: '1px solid #1f1f1f', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '0.88rem', color: 'var(--color-success)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} /> What-If 추정 이익률</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {(simBaseMargin - ((simExchangeRate - 1385)/100) - simTariff).toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>* 기준 마진(15%)에서 환율 변동 및 관세 차감</div>
          </div>

        </div>
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
          {SECTIONS.map((s, idx) => {
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
                  <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                    borderRadius: '3px 3px 0 0' }} />
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
        const sec = SECTIONS.find(s => s.id === activePart)!;
        const SecIcon = sec.icon;
        const pillarWidgets = displayWidgets?.filter((w: any) => sec.widgets.includes(w.id)) || [];

        // S4 활성 시 uncategorized fallback 같이 표시 (5-Pillar에 미매핑된 위젯 안 잃도록)
        const allZoneIds = SECTIONS.flatMap(s => s.widgets);
        const uncategorized = activePart === 'S4'
          ? displayWidgets?.filter((w: any) => !allZoneIds.includes(w.id)) || []
          : [];

        return (
          <>
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <SecIcon size={24} color={sec.color} />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sec.title}</h2>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: sec.color, background: `${sec.color}15`, padding: '3px 10px', borderRadius: '500px', fontWeight: 600 }}>
                  {pillarWidgets.length} 위젯
                </span>
              </div>
              <p style={{ margin: '0 0 1.5rem 34px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{sec.desc}</p>
              <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {pillarWidgets.length === 0 && (EXTRA_BY_PILLAR[sec.id] || []).length === 0
                  ? <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>이 단계에 위젯이 없습니다</div>
                  : <>
                      {pillarWidgets.map((w: any) => renderWidgetCard(w, sec.id as any))}
                      {(EXTRA_BY_PILLAR[sec.id] || []).map((Comp, i) => <Comp key={`extra-${sec.id}-${i}`} />)}
                    </>}
              </div>
            </section>
            {uncategorized.length > 0 && (
              <section style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                  <Database size={20} color="var(--text-secondary)" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>기타 분석 ({uncategorized.length})</h3>
                </div>
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  {uncategorized.map((w: any) => renderWidgetCard(w, 'S4'))}
                </div>
              </section>
            )}
          </>
        );
      })()}
    </div>
  );

  function renderWidgetCard(w: any, pillar: 'S1'|'S2'|'S3'|'S4'|'S5' = 'S4') {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const accentColor = 'var(--color-success)';

    const situation = w.sit || w.situation || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    // L-09 정직 telemetry: reliability를 LIVE 판정에서 제거. 진짜 라이브(badges 'Live API'·동적 isLive 분기)만 LIVE.
    // w.apiSource·w.isLiveApi는 JSON 하드코딩 가능성 있으므로 단독 LIVE 근거로 사용 금지.
    const isGenuineLive = (w.badges && w.badges?.includes('Live API')) || (typeof w.telemetry === 'string' && w.telemetry.toLowerCase() === 'live');
    const isExplicitStatic = typeof w.telemetry === 'string' && w.telemetry.toLowerCase() === 'static';
    const honestStatus = isGenuineLive ? 'LIVE' : isExplicitStatic ? 'STATIC' : (w.telemetry || w.syncDate) ? 'SYNCED' : 'STATIC';
    // 패턴 E: 일괄 fallback 문자열('2024년 기준'·'실시간 연동중') 제거 — syncDate 부재 시 배지가 날짜를 생략(정직)
    const honestSyncDate = w.syncDate;
    const cardDesc = [w.unit ? `단위: ${w.unit}` : '', w.subtitle || ''].filter(Boolean).join(' — ');

    return (
      <WidgetCard key={w.id}
        title={w.title}
        icon={IconComp}
        iconColor={accentColor}
        pillar={pillar}
        cardDesc={cardDesc}
        telemetry={{ status: honestStatus, syncDate: honestSyncDate }}
        chartHeight={375}
        chart={renderChart(w)}
        takeaway={{
          situation: parseTextWithTooltips(typeof situation === 'string' ? situation.replace(/^현황:\s*/, '') : situation),
          actionPlan: parseTextWithTooltips(typeof takeaway === 'string' ? takeaway.replace(/^전략:\s*/, '') : takeaway),
          source: w.source || (w.apiSource ? `${w.apiSource}` : '') || 'FAO FishStatJ + data/새우/ CSV 원본 교차 검증 완료',
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
