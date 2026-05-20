'use client';

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import {
  Globe, TrendingUp, AlertTriangle, Fish, Factory, ShieldCheck, Banknote,
  BookOpen, Database, Zap, Activity, Workflow, DollarSign, Scale, RefreshCcw,
  Hexagon, Target, Truck, Layers, Coins, Leaf, MapPin, Landmark, Shield, Anchor,
  Dna, Gavel, TestTube, Recycle, Ship, BarChart2, Star, TrendingDown, AlertCircle,
  Eye, FileText, Thermometer
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaInsightsDashboard.module.css';
import TakeawayBox from './TakeawayBox';

// Tuna specific components
import TunaPrecisionFishing from './TunaPrecisionFishing';
import TunaPetCareMargin from './TunaPetCareMargin';
import TunaPriceDecoupling from './TunaPriceDecoupling';
import PacificEezStrategicWidget from './PacificEezStrategicWidget';
import { InsightNauruSwitch, InsightIOCollapse, InsightEU18C } from './TunaNewInsightsA';
import { InsightTunaExtract, InsightPillarTwo, InsightVietnamOEM } from './TunaNewInsightsB';
import { KfasByproductValueChain, KfasLonglineEvolution, KfasIndianOceanRisk, KfasElderlyFunctionalFood } from './TunaKfasResearch';

// Phase 4: 국정연 보고서 기반 신규 인텔리전스 (기획서 Phase 1~2 구현)
import { PolicyRiskScorecard, FtaTariffOptimizer } from './TunaPolicyRiskRadar';
import { SkipjackForecastWidget, EnsoCorrelationWidget, LandingCostSensitivity } from './TunaForecastWidgets';
import { EmergingMarketsHeatmap } from './TunaEmergingMarkets';

// Phase 5: 해수부 공공데이터 + 부산물 업사이클링 (기획서 Phase 2 구현)
import { MofFishMarketWidget, MofTradeBalanceWidget, MofShippingCostWidget } from './TunaMofFisheryWidget';
import { TunaUpcyclingOpportunity, TunaUpcyclingMarginMap } from './TunaUpcyclingWidgets';

// Phase 1: Live Intelligence Upgrade
import TunaLiveTicker from './TunaLiveTicker';
import { WitsTariffWidget, OecBenchmarkWidget, WitsTradeFlowWidget } from './TunaTradeIntelWidgets';

// Phase 2: Landing Cost & Supplier Hub
import TunaLandingCost from './TunaLandingCost';

// --- Absorbed Components for Hybrid Consolidation ---
import TunaCrossroads from './TunaCrossroads';
import TunaAquaHegemony from './TunaAquaHegemony';
import TunaImportBlackhole from './TunaImportBlackhole';
import TunaExportShare from './TunaExportShare';
import TunaKoreaPosition from './TunaKoreaPosition';
import TunaKoreaOrigins from './TunaKoreaOrigins';
import TunaRanchingEducation from './TunaRanchingEducation';
import TunaRanching from './TunaRanching';
import PetFoodDashboard from './PetFoodDashboard';
import TunaEsgRiskRadar from './TunaEsgRiskRadar';
import TunaPngHubStrategy from './TunaPngHubStrategy';
import TunaGlobalHalalStrategy from './TunaGlobalHalalStrategy';
import TunaBioUpcyclingGap from './TunaBioUpcyclingGap';
import TunaPeptideEfficacy from './TunaPeptideEfficacy';
import TunaTacMonitor from './TunaTacMonitor';
import TunaSdgCircular from './TunaSdgCircular';
// ---------------------------------------------------
import TunaSupplierHub from './TunaSupplierHub';

// Phase 3: Compliance & HS Classification
import TunaComplianceRadar from './TunaComplianceRadar';
import TunaHSClassifier from './TunaHSClassifier';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 12 ? noEng.substring(0, 12) + '...' : noEng;
};


/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 12 ? noEng.substring(0, 12) + '...' : noEng;
  };
return (
      <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
        <p style={{ color: '#cbd5e1', fontWeight: 'bold', marginBottom: '8px', fontSize: '13px', margin: 0 }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          {payload.map((e: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: e.color || e.stroke || e.fill, fontSize: '14px' }}>■</span>
              <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '13px' }}>{e.name}: </span>
              <strong style={{ color: '#fff', fontSize: '13px' }}>
                {typeof e.value === 'number' ? Math.round(e.value).toLocaleString() : e.value}
                {e.payload?.unit || ''}
              </strong>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ["#FCD535", "#0ECB81", "#2196F3", "#F6465D", "#9B72CB", "#F0B90B", "var(--color-success)", "var(--color-warning)"];

const KPI_THEMES = [
  { border: 'none', glow: 'none', text: '#FCD535', icon: Globe },
  { border: 'none', glow: 'none', text: '#0ECB81', icon: TrendingUp },
  { border: 'none', glow: 'none', text: '#2196F3', icon: Factory },
  { border: 'none', glow: 'none', text: '#F6465D', icon: DollarSign },
  { border: 'none', glow: 'none', text: '#9B72CB', icon: Scale },
  { border: 'none', glow: 'none', text: '#F0B90B', icon: AlertTriangle },
];

const SECTIONS = [
  { id: "S1", title: "⚓ Part I — 원물 생산", desc: "FAO FishStatJ · IOTC · IATTC · ICCAT 기반 글로벌 참치 어획량, 어종별 자원 동향, K-원양 선단 효율, 기후(ENSO) 영향 분석", color: "#FCD535" },
  { id: "S2", title: "🏭 Part II — 가공 산업", desc: "태국/스페인/한국 가공 패권 구조, 수율·인건비 벤치마크, 부산물 업사이클링, 펫케어 라인 전환 타당성", color: "#9B72CB" },
  { id: "S3", title: "🚢 Part III — 물류 및 무역", desc: "UN Comtrade · Eurostat · 관세청 기반 글로벌 무역 흐름, 착지원가 시뮬레이션, 관세 최적화, 해상운임 트래커", color: "#F0B90B" },
  { id: "S4", title: "🛒 Part IV — 판매 및 수요", desc: "소매가 전가(그리드플레이션), 소비자 다운트레이딩, 프리미엄 마진 구조, AI 가격 예측, 신흥시장 수요 폭발", color: "#0ECB81" },
  { id: "S5", title: "🌍 Part V — ESG 및 지속가능성", desc: "혼획 저감, MPA 실효성, EMS 모니터링, 강제노동·이력추적 규제, OECD Pillar Two, 탄소 관세(CBAM) 대응", color: "#2196F3" },
  { id: "S6", title: "🐾 Part VI — 파생 사업 (펫푸드)", desc: "참치 부산물 기반 프리미엄 펫푸드 시장 진입, 카라기난 리스크 방어, 대체 단백질 글로벌 성장 구조 분석", color: "#EC4899" },
];

const WIDGET_ICONS: Record<string, any> = {
  w13_korea_empire: Star, w14_species_polar: Scale, w15_canning_factory: Factory, 
  w16_import_blackhole: Globe, w17_korea_margin: TrendingUp, w18_zero_aqua: AlertTriangle,
  w19_ecuador_surge: Zap, w20_thailand_paradox: Ship, w21_korea_price_truth: AlertCircle,
  w22_japan_decline: TrendingDown, w23_korea_surplus: DollarSign, w24_bluefin_ranch: Anchor,
  w25_byproduct_cashcow: Activity, w26_data_hegemony: Database, w27_global_minimum_tax: ShieldCheck,
  w48_vds_quota: Ship, w49_yield_labor: Factory, w50_bunker_freight: Truck, w51_gridflation: TrendingUp, w52_msc_cbam: ShieldCheck,
  w53_enso_radar: Globe, w54_mega_cannery_opex: Activity, w55_emerging_route: Ship, w56_eu_oligopsony: BarChart2, w57_alt_protein: RefreshCcw,
  w62_fuel_impact: AlertTriangle,
  w80_starvation_mortality: AlertTriangle, w81_enso_gdp_cascade: Globe, w82_indian_ocean_tuna: Anchor,
  w83_dfad_revenue_shock: TrendingDown, w84_invasivorism: RefreshCcw, w85_spain_mpa_paper_park: ShieldCheck,
  w86_observer_ems_cost: Eye, w87_incentive_vs_cc: DollarSign, w88_eu_landing_obligation: FileText,
  w89_undetected_silky_shark: AlertTriangle, w90_cgp_species_gap: Activity, w91_bluefin_escapement: Anchor,
  w92_ems_blind_spot: Eye, w93_mesotherm_energy: Thermometer
};

const EstimateBadge = () => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'2px 8px', borderRadius:'500px', border:'none', backgroundColor:'rgba(255,164,43,0.1)', color:'var(--color-warning)', fontSize:'0.66rem', fontWeight:700, letterSpacing:'0.2px', marginLeft:'0.5rem', flexShrink:0, textTransform:'uppercase' as const }}>
    추정
  </span>
);

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

const formatYAxis = (v: number): string => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return v.toString();
};

/* ─── 1. 전역으로 완전히 분리된 차트 렌더러 ─── */
const CHART_MARGIN = { top: 20, right: 30, left: 0, bottom: 5 };

const renderChart = (w: any) => {
  const d = w.data;
  if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>데이터 없음</div>;
  const chartType = (w.chartType || '').toLowerCase();

  // Custom infographic progress bar rendering for multi-unit byproduct research metrics
  if (chartType === 'custom_progress') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.75rem 0', justifyContent: 'center', height: '100%' }}>
        {d.map((item: any, idx: number) => {
          const maxVal = 250;
          const percentage = Math.min((item.value / maxVal) * 100, 100);
          const barColor = idx === 0 ? '#10b981' : idx === 1 ? '#8b5cf6' : '#3b82f6';
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{item.name}</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: barColor }}>{item.value}{item.unit}</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: barColor, borderRadius: '4px', boxShadow: `0 0 8px ${barColor}50` }} />
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>{item.desc}</span>
            </div>
          );
        })}
      </div>
    );
  }

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />;
  const isShortData = d.length <= 10;
  const xAxisTextProps: any = { stroke: "rgba(255,255,255,0.1)", tick: { fill: "#cbd5e1", fontSize: 12, fontWeight: 500 }, ...(isShortData ? { interval: 0 } : {}) };
  const yAxisProps = { stroke: "rgba(255,255,255,0.1)", tick: { fill: "#cbd5e1", fontSize: 12, fontWeight: 500 }, tickFormatter: formatYAxis };

  // Universal Format handling
  if (w.xKey || w.bars || w.lines || w.areas || chartType === 'pie') {
    const xKeyVal = w.xKey || w.xAxis || 'Year';
    switch(chartType) {
      case "pie":
        return (
          <PieChart>
            <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
              label={({name, value, percent, payload}: any) => percent > 0.03 ? `${name} ${typeof value === 'number' ? Math.round(value).toLocaleString() : value}${payload?.unit || ''}` : ''} labelLine={false} fontSize={10} isAnimationActive={false}>
              {d.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
          </PieChart>
        );
      case "area":
        return (
          <AreaChart data={d} margin={CHART_MARGIN}>
            <defs>
              {(w.areas || w.lines)?.map((a: any, i: number) => (
                <linearGradient key={i} id={`sArea${w.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={a.color || a.stroke || a.fill} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={a.color || a.stroke || a.fill} stopOpacity={0.05}/>
                </linearGradient>
              ))}
            </defs>
            {grid}
            <XAxis dataKey={xKeyVal} {...xAxisTextProps}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
            <YAxis {...yAxisProps} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {(w.areas || w.lines)?.map((a: any, i: number) => (
              <Area key={i} type="monotone" dataKey={a.key || a.dataKey} name={a.name} stroke={a.color || a.stroke || a.fill} fill={`url(#sArea${w.id}_${i})`} strokeWidth={2.5} strokeDasharray={a.strokeDasharray} isAnimationActive={false} />
            ))}
          </AreaChart>
        );
      case "line":
        const hasRightLine = w.lines?.some((l: any) => l.yAxisId === 'right');
        return (
          <LineChart data={d} margin={CHART_MARGIN}>
            {grid}
            <XAxis dataKey={xKeyVal} {...xAxisTextProps}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
            <YAxis yAxisId="left" {...yAxisProps} />
            {hasRightLine && <YAxis yAxisId="right" orientation="right" {...yAxisProps} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {w.lines?.map((l: any, i: number) => (
              <Line key={`l${i}`} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key || l.dataKey} name={l.name} stroke={l.color || l.stroke || l.fill} strokeWidth={l.strokeWidth || 2.5} dot={false} activeDot={{r:5}} strokeDasharray={l.strokeDasharray} isAnimationActive={false} />
            ))}
          </LineChart>
        );
      case "bar":
        return (
          <BarChart data={d} margin={{ ...CHART_MARGIN, top: 30 }}>
            {grid}
            <XAxis dataKey={xKeyVal} {...xAxisTextProps}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
            <YAxis {...yAxisProps} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {w.bars?.map((b: any, i: number) => (
              <Bar key={`b${i}`} stackId={b.stackId} dataKey={b.key || b.dataKey} name={b.name || b.key || b.dataKey} fill={b.color || b.fill} radius={[6,6,0,0]} fillOpacity={0.85} isAnimationActive={false}>
                {w.id === 'w50_bunker_freight' && (
                  <LabelList dataKey="displayLabel" position="top" fill="#f8fafc" fontSize={10} fontWeight={600} />
                )}
              </Bar>
            ))}
          </BarChart>
        );
      case "bar":
      case "composed":
        const hasRightComposed = w.lines?.some((l: any) => l.yAxisId === 'right') || w.bars?.some((b: any) => b.yAxisId === 'right');
        return (
          <ComposedChart data={d} margin={CHART_MARGIN}>
            {grid}
            <XAxis dataKey={xKeyVal} {...xAxisTextProps}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
            <YAxis yAxisId="left" {...yAxisProps} />
            {hasRightComposed && <YAxis yAxisId="right" orientation="right" {...yAxisProps} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {w.bars?.map((b: any, i: number) => (
              <Bar key={`b${i}`} yAxisId={b.yAxisId || "left"} stackId={b.stackId} dataKey={b.key || b.dataKey} name={b.name || b.key || b.dataKey} fill={b.color || b.fill} radius={[6,6,0,0]} fillOpacity={0.85} isAnimationActive={false} />
            ))}
            {w.lines?.map((l: any, i: number) => (
              <Line key={`l${i}`} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key || l.dataKey} name={l.name || l.key || l.dataKey} stroke={l.color || l.stroke || l.fill} strokeWidth={l.strokeWidth || 2.5} dot={false} activeDot={{r:5}} strokeDasharray={l.strokeDasharray} isAnimationActive={false} />
            ))}
          </ComposedChart>
        );
      case "radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={d}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey={w.radarKey || "subject"} tick={{fill:'#cbd5e1', fontSize:12, fontWeight: 500}} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{fill:'#cbd5e1', fontSize:10, fontWeight: 500}} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.radars?.map((r: any, i: number) => (
              <Radar key={i} name={r.name} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.3} isAnimationActive={false} />
            ))}
          </RadarChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>미지원</div>;
    }
  }

  // OLD FORMAT (Legacy Fallback)
  const xAxis = w.xAxis || 'Year';
  const series = w.series || [];
  const hasRightAxis = series.some((s: any) => s.yAxisId === 'right');

  switch(chartType) {
    case "pie":
      return (
        <PieChart>
          <Pie data={d} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value" nameKey="name"
            label={({name, value, percent, payload}: any) => percent > 0.03 ? `${name} ${typeof value === 'number' ? Math.round(value).toLocaleString() : value}${payload?.unit || ''}` : ''} labelLine={false} fontSize={10} isAnimationActive={false}>
            {d.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
          </Pie>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
        </PieChart>
      );
    case "line":
      return (
        <LineChart data={d} margin={CHART_MARGIN}>
          {grid}
          <XAxis dataKey={xAxis} {...xAxisTextProps} minTickGap={20}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis yAxisId="left" {...yAxisProps} />
          {hasRightAxis && <YAxis yAxisId="right" orientation="right" {...yAxisProps} />}
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
          {series.map((s: any, i: number) => (
            <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
          ))}
        </LineChart>
      );
    case "area":
      return (
        <AreaChart data={d} margin={CHART_MARGIN}>
          {grid}
          <XAxis dataKey={xAxis} {...xAxisTextProps} minTickGap={20}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis yAxisId="left" {...yAxisProps} />
          {hasRightAxis && <YAxis yAxisId="right" orientation="right" {...yAxisProps} />}
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
          {w.areas?.map((s: any, i: number) => (
            <Area key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.key || s.dataKey} stroke={s.color} fill={s.color} fillOpacity={0.3} strokeWidth={2} isAnimationActive={false} />
          ))}
        </AreaChart>
      );
    case "composed":
      return (
        <ComposedChart data={d} margin={CHART_MARGIN}>
          {grid}
          <XAxis dataKey={xAxis} {...xAxisTextProps} minTickGap={20}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis yAxisId="left" {...yAxisProps} />
          {hasRightAxis && <YAxis yAxisId="right" orientation="right" {...yAxisProps} />}
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
          {series.map((s: any, i: number) => {
            if (s.type === 'bar') {
              return <Bar key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} name={s.name} fill={s.color} radius={[4,4,0,0]} isAnimationActive={false} />;
            } else if (s.type === 'area') {
              return <Area key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} fill={s.color} fillOpacity={0.3} strokeWidth={2} isAnimationActive={false} />;
            } else {
              return <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />;
            }
          })}
        </ComposedChart>
      );
    default:
      return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>미지원</div>;
  }
};


/* ─── 2. 메모이제이션이 완벽하게 작동하는 위젯 카드 ─── */
const WidgetCard = React.memo(({ widget }: { widget: any }) => {
  const IconComp = WIDGET_ICONS[widget.id] || Anchor;
  const accentColor = '#FCD535';
  
  const methodologyText = widget.logic || widget.methodology || '';
  let situation = widget.sit || widget.situation || widget.desc || '';
  let takeaway = widget.strat || widget.tak || widget.takeaway || '';

  return (
    <div className={styles.insightCard}>
      
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <IconComp size={18} style={{ color: accentColor }} />
          {widget.title}
          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center' }}>
            <TelemetryBadge 
              status={((widget.reliability && widget.reliability > 70) || (widget.badges && widget.badges?.includes('Live API')) || widget.apiSource || (widget.source && widget.source.includes('LIVE'))) ? 'live' : 'static'} 
              syncDate={((widget.reliability && widget.reliability > 70) || (widget.badges && widget.badges?.includes('Live API')) || widget.apiSource || (widget.source && widget.source.includes('LIVE'))) ? 'Real-time' : '2024년 기준'} 
            />
          </div>
          
          <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {widget.unit && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: {widget.unit})</span>}
          </div>
        </h3>
        {methodologyText && (
          <p className={styles.cardDesc}>
            {methodologyText}
          </p>
        )}
      </div>

      <div className={styles.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
        {/* Chart Area */}
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            {renderChart(widget)}
          </SafeResponsiveContainer>
        </div>

        {/* Takeaway Box */}
        <div style={{ marginTop: 'auto' }}>
          <TakeawayBox
            situation={situation}
            actionPlan={takeaway}
            source={widget.source}
          />
        </div>
      </div>
    </div>
  );
});

/* ─── 3. 메인 대시보드 컴포넌트 ─── */
const TunaDashboard = React.memo(function TunaDashboard() {
  const [data, setData] = useState<any>(null);
  const [showEdu, setShowEdu] = useState(true);
  const [activePart, setActivePart] = useState('S1');
  const [liveArbitrage, setLiveArbitrage] = useState<any>(null);
  const [liveTrq, setLiveTrq] = useState<any>(null);

  useEffect(() => {
    fetch('/api/tuna')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load tuna data", err));
      
    // Future integration points for Tuna Live API
    // fetch('/api/tuna/arbitrage').then(res => res.json()).then(data => setLiveArbitrage(data)).catch(console.error);
    // fetch('/api/tuna/trq').then(res => res.json()).then(data => setLiveTrq(data)).catch(console.error);
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-color)' }}>
      <RefreshCcw size={32} style={{ color: '#FCD535', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#848E9C', fontSize: '1rem' }}>전략 인텔리전스 불러오는 중...</p>
    </div>
  );

  const { kpis, widgets } = data;
  const kpiKeys = Object.keys(kpis || {});

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>
      
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: '#FCD535', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Anchor size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                참치 (Tuna) 글로벌 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>참치 전략 커맨드 센터 — {widgets?.length || 0}개 위젯 · {kpiKeys.length || 0}개 KPI</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ECB81', boxShadow: '0 0 8px #0ECB81', animation: 'pulse 2s infinite' }} />
            <span>16 APIs <span style={{ color: '#0ECB81' }}>연결됨</span></span>
            <span style={{ margin: '0 8px', color: '#4d4d4d' }}>|</span>
            <span style={{ color: 'var(--text-primary)' }}>KCS · ECOS · KAMIS · WITS · OEC · FRED · OSH · HS Ping</span>
          </div>
        </div>
      </header>

      {/* ═══ LIVE INTELLIGENCE TICKER (Phase 1 Upgrade — replaces hardcoded Arbitrage Radar) ═══ */}
      <TunaLiveTicker />

      {/* ═══ KPIs ═══ */}
      {kpiKeys.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {kpiKeys.map((key, idx) => {
            const kpi = kpis[key];
            const t = KPI_THEMES[idx % KPI_THEMES.length];
            const I = t.icon;
            const parsed = parseAnimatedValue(kpi.value);
            return (
              <div 
                key={key} 
                className="ds-card" style={{background: '#181818', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '1.2rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px', 
                  transition: 'all 0.2s ease', 
                  cursor: 'default', 
                  boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', 
                  position: 'relative', 
                  overflow: 'hidden'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#181818';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, maxWidth: '75%', lineHeight: '1.2' }}>{kpi.title}</span>
                  {kpi.telemetry ? <TelemetryBadge status={kpi.telemetry} syncDate={kpi.syncDate} /> : <I size={14} style={{ color: t.text }} />}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {parsed ? (
                    <CountUp end={parsed.numberVal} duration={2} separator="," decimals={parsed.decimals} prefix={parsed.prefix} suffix={parsed.suffix} />
                  ) : kpi.value}
                </div>
                <div style={{ fontSize: '0.68rem', color: t.text, fontWeight: 600 }}>
                  <span style={{ background: `${t.text}20`, padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>{kpi.trend}</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{kpi.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Education Toggle ═══ */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => setShowEdu(!showEdu)} 
          className="ds-card" style={{width: '100%', background: '#181818', border: 'none',
            borderRadius: '8px', padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', marginBottom: showEdu ? '1rem' : '0',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#181818'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <BookOpen size={20} color="#FCD535" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>신입직원 교육 가이드</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>NotebookLM 분석 기반: 조업 방식 비교 및 밸류체인 리스크 점검</div>
            </div>
          </div>
          <div style={{ transform: showEdu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </button>
        {showEdu && (
          <div className="ds-card" style={{background: '#181818', borderRadius: '8px', border: 'none', padding: '1.5rem', animation: 'fadeIn 0.3s', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '8px', border: 'none' }}>
                <h3 style={{ color: '#FCD535', margin: '0 0 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Anchor size={16}/> 조업 방식 핵심 차이
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  <strong style={{color:'var(--text-primary)'}}>선망(Purse Seine):</strong> 거대한 그물로 포위 어획. 주로 가다랑어(Skipjack) 타겟. 대량 어획에 특화되어 통조림 원가 경쟁력의 핵심.<br/>
                  <strong style={{color:'var(--text-primary)'}}>연승(Longline):</strong> 긴 낚싯줄에 수천 개의 바늘. 고품질 눈다랑어/황다랑어 타겟. 초저온 동결 기술이 필수적이며 프리미엄 횟감 시장 리드.
                </div>
              </div>
              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '8px', border: 'none' }}>
                <h3 style={{ color: 'var(--color-success)', margin: '0 0 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Workflow size={16}/> 전략적 시사점: 수직계열화의 필연성
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  <li><strong style={{color:'var(--text-primary)'}}>업스트림:</strong> MGO 유가 및 기후 지표(ENSO)와 조업 효율성의 상관관계 실시간 모니터링</li>
                  <li><strong style={{color:'var(--text-primary)'}}>미드스트림:</strong> 단순 캔 제조를 넘어 펫푸드(High-margin) 및 부산물 바이오 소재화로 전환</li>
                  <li><strong style={{color:'var(--text-primary)'}}>다운스트림:</strong> 글로벌 리테일 가격 전가력(Pricing Power) 확보 및 유통망 직접 장악</li>
                </ul>
              </div>
            </div>
            <div style={{
              background: 'var(--surface-3)',
              padding: '1.2rem 1.5rem', borderRadius: '8px', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#181818', padding: '0.8rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Database size={20} color="#FCD535" /></div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700 }}><Zap size={16} color="#FCD535" style={{marginRight:'6px'}} />NotebookLM 참치 AI 챗봇</h3>
                </div>
              </div>
              <a href="https://notebooklm.google.com/notebook/1ce41abd-bdd2-4fce-8de7-e6a9f27ef6da" target="_blank" rel="noreferrer"
                style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', padding: '12px 24px', borderRadius: '500px', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Activity size={16} /> 챗봇 시작
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ═══ 6-Part Consolidated Sections with Sub-Tabs ═══ */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActivePart(s.id)}
            style={{
              padding: '10px 16px',
              background: activePart === s.id ? `${s.color}20` : 'transparent',
              border: `1px solid ${activePart === s.id ? s.color : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '8px',
              color: activePart === s.id ? s.color : 'var(--text-secondary)',
              fontWeight: activePart === s.id ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              boxShadow: activePart === s.id ? `0 0 12px ${s.color}30` : 'none'
            }}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* ═══════ Part I: 원물 생산 (Raw Material) ═══════ */}
        {activePart === 'S1' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: SECTIONS[0].color, borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[0].desc}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <PacificEezStrategicWidget />
              </div>
              <TunaPrecisionFishing />
              <KfasLonglineEvolution />
              <KfasIndianOceanRisk />
              <InsightNauruSwitch />
              <InsightIOCollapse />
              <MofFishMarketWidget />
              {widgets?.filter((w: any) => ['w01_paradigm', 'w02_bluefin', 'w03_pie', 'w13_korea_empire', 'w14_species_polar', 'w19_ecuador_surge', 'w22_japan_decline', 'w45_skipjack_collapse', 'w46_seasonal_arbitrage', 'w48_vds_quota', 'w60_bluefin_ranching_defense', 'w71_bluefin_ranching_growth', 'w67_longline_cost', 'w68_vessel_productivity', 'w80_starvation_mortality', 'w81_enso_gdp_cascade', 'w82_indian_ocean_tuna', 'w93_mesotherm_energy', 'w53_enso_radar', 'w83_dfad_revenue_shock', 'w94_wcpo_record_catch', 'w95_eez_highseas_polarization', 'w96_iotc_msy_overshoot', 'w97_korea_fleet_switching'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
              <EnsoCorrelationWidget />
              <SkipjackForecastWidget />
            </div>

            {/* --- Absorbed Ranching --- */}
            <div style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <TunaRanchingEducation />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '24px', margin: '24px 0' }}>
                <TunaCrossroads />
                <TunaAquaHegemony />
                <TunaImportBlackhole />
                <TunaExportShare />
                <TunaKoreaPosition />
                <TunaKoreaOrigins />
              </div>
              <TunaRanching />
            </div>
          </section>
        )}

        {/* ═══════ Part II: 가공 산업 (Processing) ═══════ */}
        {activePart === 'S2' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: SECTIONS[1].color, borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[1].desc}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <TunaPetCareMargin />
              <TunaSupplierHub />
              <InsightTunaExtract />
              <InsightVietnamOEM />
              <KfasByproductValueChain />
              <KfasElderlyFunctionalFood />
              <TunaUpcyclingOpportunity />
              <TunaUpcyclingMarginMap />
              {/* --- Absorbed Extract R&D --- */}
              <TunaBioUpcyclingGap />
              <TunaPeptideEfficacy />
              {widgets?.filter((w: any) => ['w04_proc', 'w15_canning_factory', 'w20_thailand_paradox', 'w25_byproduct_cashcow', 'w30_spain_arbitrage', 'w32_species_margin', 'w33_spain_vs_france', 'w36_spain_vulnerability', 'w40_french_cannery_decline', 'w42_first_sale_cascade', 'w47_korea_thailand_pipeline', 'w49_yield_labor', 'w54_mega_cannery_opex', 'w70_eu_tuna_cost_shock', 'w66_petfood_capacity_defense', 'w84_invasivorism', 'w57_alt_protein', 'w98_byproduct_rd_pipeline', 'w102_spain_loin_outsourcing'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════ Part III: 물류 및 무역 (Logistics) ═══════ */}
        {activePart === 'S3' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: SECTIONS[2].color, borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[2].desc}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <WitsTariffWidget />
              <OecBenchmarkWidget />
              <WitsTradeFlowWidget />
              <TunaLandingCost />
              <TunaHSClassifier />
              <MofTradeBalanceWidget />
              <MofShippingCostWidget />
              <FtaTariffOptimizer />
              <LandingCostSensitivity />
              <EmergingMarketsHeatmap />
              {/* --- Absorbed Extract Logistics --- */}
              <TunaPngHubStrategy />
              {widgets?.filter((w: any) => ['w05_cash', 'w06_trade_vol', 'w07_export', 'w08_import', 'w10_kr_deficit', 'w23_korea_surplus', 'w35_species_channels', 'w39_nl_tollgate', 'w50_bunker_freight', 'w55_emerging_route', 'w62_fuel_impact', 'w58_atq_loin_export', 'w41_geopolitical_shift', 'w63_us_tariff_frontloading', 'w64_mena_halal_demand', 'w99_reciprocal_tariff_shock'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════ Part IV: 판매 및 수요 (Sales & Demand) ═══════ */}
        {activePart === 'S4' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: SECTIONS[3].color, borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[3].desc}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <TunaPriceDecoupling />
              <InsightEU18C />
              {/* --- Absorbed Extract Sales --- */}
              <TunaGlobalHalalStrategy />
              {widgets?.filter((w: any) => ['w09_kr_import', 'w11_kr_price', 'w12_margin', 'w16_import_blackhole', 'w17_korea_margin', 'w21_korea_price_truth', 'w31_italy_multiplier', 'w34_germany_blackhole', 'w37_china_dumping', 'w38_italy_stagflation', 'w43_retail_price_map', 'w44_italy_retail_explosion', 'w51_gridflation', 'w56_eu_oligopsony', 'w59_inflation_downtrading', 'w65_export_price_benchmark', 'w69_china_consumption', 'w100_china_fukushima_switch'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════ Part V: ESG 및 지속가능성 (Sustainability) ═══════ */}
        {activePart === 'S5' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: SECTIONS[4].color, borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[4].desc}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <TunaComplianceRadar />
              <PolicyRiskScorecard />
              <InsightPillarTwo />
              {/* --- Absorbed Extract ESG --- */}
              <TunaEsgRiskRadar />
              <TunaTacMonitor />
              <TunaSdgCircular />
              {widgets?.filter((w: any) => ['w18_zero_aqua', 'w24_bluefin_ranch', 'w26_data_hegemony', 'w27_global_minimum_tax', 'w52_msc_cbam', 'w85_spain_mpa_paper_park', 'w86_observer_ems_cost', 'w87_incentive_vs_cc', 'w88_eu_landing_obligation', 'w89_undetected_silky_shark', 'w90_cgp_species_gap', 'w91_bluefin_escapement', 'w92_ems_blind_spot', 'w101_greentech_drone_capex', 'w103_taiwan_esg_risk'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
            </div>
          </section>
        )}

        {/* ═══════ Part VI: 파생 사업 (Petfood) ═══════ */}
        {activePart === 'S6' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: SECTIONS[5].color, borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[5].title}</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[5].desc}</p>
              </div>
            </div>
            {/* Render full PetFoodDashboard inside S6 */}
            <div style={{ margin: '0 -2rem' }}>
              <PetFoodDashboard />
            </div>
          </section>
        )}

      </div>
    </div>
  );
});

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

export default TunaDashboard;


