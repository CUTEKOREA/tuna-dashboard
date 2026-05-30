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
import TelemetryBadge from './TelemetryBadge';
import { truncateKoreanLabel } from '../lib/chart-standards';

// Tuna specific components
import TunaPrecisionFishing from './TunaPrecisionFishing';
import TunaPetCareMargin from './TunaPetCareMargin';
import TunaPriceDecoupling from './TunaPriceDecoupling';
import PacificEezStrategicWidget from './PacificEezStrategicWidget';
import { InsightNauruSwitch, InsightIOCollapse, InsightEU18C } from './TunaNewInsightsA';
import { InsightTunaExtract, InsightPillarTwo, InsightVietnamOEM } from './TunaNewInsightsB';
import {
  InsightJapanDemandCliff,
  InsightPerCapitaGamma,
  InsightSegmentDecline,
  InsightSupplyStructure2022,
  InsightPriceTier,
  InsightCohortDoubleShock,
} from './TunaJapan2050Insights';
import {
  InsightKmiBluefinYearly,
  InsightKmiBluefinSupplyShift,
  InsightKmiBluefin2026Signal,
} from './TunaKmiFtaBluefinInsights';
import { KfasByproductValueChain, KfasLonglineEvolution, KfasIndianOceanRisk, KfasElderlyFunctionalFood } from './TunaKfasResearch';

// Phase 4: 국정연 보고서 기반 신규 인텔리전스 (기획서 Phase 1~2 구현)
import { PolicyRiskScorecard, FtaTariffOptimizer } from './TunaPolicyRiskRadar';
import { SkipjackForecastWidget, EnsoCorrelationWidget, LandingCostSensitivity } from './TunaForecastWidgets';
import { EmergingMarketsHeatmap } from './TunaEmergingMarkets';

// Phase 5: 해수부 공공데이터 + 부산물 업사이클링 (기획서 Phase 2 구현)
import { MofFishMarketWidget, MofTradeBalanceWidget, MofShippingCostWidget } from './TunaMofFisheryWidget';
import { TunaUpcyclingOpportunity, TunaUpcyclingMarginMap } from './TunaUpcyclingWidgets';

// Phase 1: Live Intelligence Upgrade
import {
  OperationalS1Widgets,
  OperationalS2Widgets,
  OperationalS3Widgets,
  OperationalS4Widgets,
  OperationalS5Widgets
} from './TunaOperationalIntelWidgets';

// Phase B4 신규 위젯 4종 (audit 기반)
import {
  ThaiImportShift1Q26,
  FrimeAcquisitionWidget,
  PerfectStormWidget,
  RasSystemWidget
} from './TunaIntelInsightsB4';
import TunaLiveTicker from './TunaLiveTicker';
import { WitsTariffWidget, OecBenchmarkWidget, WitsTradeFlowWidget } from './TunaTradeIntelWidgets';
import UsTunaImportWidget from './UsTunaImportWidget';
import UsTunaMarketShareWidget from './UsTunaMarketShareWidget';
import UsPolicyImpactWidget from './UsPolicyImpactWidget';
import {
  AtunaIoPerfectStormWidget,
  AtunaBangkokPriceWidget,
  AtunaEpoCatchDropWidget,
  AtunaEuCatchSystemWidget
} from './TunaAtunaMayNews';

// Phase: KMI FTA Insights (새로운 5대 밸류체인 위젯)
import {
  tunaColdChainData,
  tunaQuotaData,
  tunaOriginData,
  tunaMacroData,
  tunaYenData
} from './TunaFtaInsightsWidgets';

// Phase 2: Landing Cost & Supplier Hub
import TunaLandingCost from './TunaLandingCost';

// --- Absorbed Components for Hybrid Consolidation ---
import TunaCrossroads from './TunaCrossroads';
import TunaAquaHegemony from './TunaAquaHegemony';
import TunaImportBlackhole from './TunaImportBlackhole';
import TunaExportShare from './TunaExportShare';
import TunaKoreaPosition from './TunaKoreaPosition';
import TunaKoreaOrigins from './TunaKoreaOrigins';

import TunaRanching from './TunaRanching';
import PetFoodDashboard from './PetFoodDashboard';
import TunaEsgRiskRadar from './TunaEsgRiskRadar';
import TunaPngHubStrategy from './TunaPngHubStrategy';
import TunaGlobalHalalStrategy from './TunaGlobalHalalStrategy';
import TunaBioUpcyclingGap from './TunaBioUpcyclingGap';
import TunaPeptideEfficacy from './TunaPeptideEfficacy';
import TunaTacMonitor from './TunaTacMonitor';
import TunaSdgCircular from './TunaSdgCircular';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
// ---------------------------------------------------
import TunaSupplierHub from './TunaSupplierHub';

// Phase 3: Compliance & HS Classification
import TunaComplianceRadar from './TunaComplianceRadar';
import TunaHSClassifier from './TunaHSClassifier';
import TunaRFMOLibrarian from './TunaRFMOLibrarian';
import TunaAtuna8YPrice from './TunaAtuna8YPrice';
import TunaUsdaKoreaSeafood from './TunaUsdaKoreaSeafood';

export const truncateXAxis = (tick: any) => truncateKoreanLabel(tick, 7);


/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    
  // truncateXAxis is defined globally
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

const PIE_COLORS = ["#38bdf8", "#3b82f6", "#0ea5e9", "#60a5fa", "#2563eb", "#1d4ed8", "#0369a1", "#0284c7"];

const KPI_THEMES = [
  { border: 'none', glow: 'none', text: '#38bdf8', icon: Globe },
  { border: 'none', glow: 'none', text: '#60a5fa', icon: TrendingUp },
  { border: 'none', glow: 'none', text: '#0ea5e9', icon: Factory },
  { border: 'none', glow: 'none', text: '#3b82f6', icon: DollarSign },
  { border: 'none', glow: 'none', text: '#6366f1', icon: Scale },
  { border: 'none', glow: 'none', text: '#2563eb', icon: AlertTriangle },
];

const SECTIONS = [
  { id: "S1", num: "❶", label: "원료 수급", title: "🐟 Part I — 원료 수급 (Raw Material)", desc: "기후(ENSO) 상관 분석, IOTC/WCPFC 어획량, 수역별 할당량 및 조업 효율 분석", color: "#38bdf8" },
  { id: "S2", num: "❷", label: "가공·생산", title: "🏭 Part II — 가공·생산 (Processing & Production)", desc: "참치 부산물(자숙액) 업사이클링 마진, 수율 및 인건비, 펫케어 가공 라인 분석", color: "#3b82f6" },
  { id: "S3", num: "❸", label: "물류·통관", title: "🚢 Part III — 물류·통관 (Logistics & Customs)", desc: "글로벌 무역 흐름, 착지원가 시뮬레이션, 관세 최적화 및 해상운임 분석", color: "#38bdf8" },
  { id: "S4", num: "❹", label: "판매·수요", title: "📈 Part IV — 판매·수요 (Sales & Demand)", desc: "브랜드별 점유율 역전 마진 분석, 간장 대체 카니발리제이션 속도, 소비 동향 분석", color: "#3b82f6" },
  { id: "S5", num: "❺", label: "ESG·지속가능성", title: "🌱 Part V — ESG·지속가능성 (ESG & Sustainability)", desc: "규제 장벽 대응, MSC 인증 프리미엄, 글로벌 최저한세 리스크, 육상양식 도입 분석", color: "#38bdf8" },
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

// TelemetryBadge is now imported from components/TelemetryBadge.tsx

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
            <ChartPatternDefs />
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
            <ChartPatternDefs />
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
          <ChartPatternDefs />
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
  const accentColor = '#38bdf8';
  
  const methodologyText = widget.logic || widget.methodology || '';
  const situation = widget.sit || widget.situation || widget.desc || '';
  const takeaway = widget.strat || widget.tak || widget.takeaway || '';

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
  const [activePart, setActivePart] = useState('S1');
  const [liveArbitrage, setLiveArbitrage] = useState<any>(null);
  const [liveTrq, setLiveTrq] = useState<any>(null);

  useEffect(() => {
    fetch('/api/tuna')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Failed to load tuna data", err));
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-color)' }}>
      <RefreshCcw size={32} style={{ color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
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
              background: '#38bdf8', 
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
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
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

      {/* ═══ 6-Part Step Navigation (Glassmorphism + Numbered Steps) ═══ */}
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        {/* 상단 안내 라벨 */}
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
                onClick={() => setActivePart(s.id)}
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
                {/* 활성 탭 하단 글로우 바 */}
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                    borderRadius: '3px 3px 0 0',
                  }} />
                )}
                {/* 넘버 서클 */}
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
                {/* 라벨 */}
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
                {/* 짧은 설명 (활성 시에만) */}
                {isActive && (
                  <span style={{
                    fontSize: '0.6rem',
                    color: 'rgba(148,163,184,0.7)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as any,
                  }}>
                    {s.desc.split('·')[0].trim()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* ═══════ Part I: 원물 생산 ═══════ */}
        {activePart === 'S1' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: SECTIONS[0].color, borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{SECTIONS[0].desc}</p>
              </div>
            </div>
            {/* 1. 기후/환경 예측 */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <EnsoCorrelationWidget />
              <SkipjackForecastWidget />
              <PacificEezStrategicWidget />
            </div>

            {/* 2. 수역 및 할당량 확보 전략 */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <InsightNauruSwitch />
              <KfasIndianOceanRisk />
              <InsightIOCollapse />
              <MofFishMarketWidget />
            </div>

            {/* 3. 실전 조업 기술 및 역량 */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <TunaPrecisionFishing />
              <KfasLonglineEvolution />
            </div>

            {/* 4. 기타 원물 생산 관련 지표 */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {widgets?.filter((w: any) => ['w01_paradigm', 'w02_bluefin', 'w03_pie', 'w105_skj_spot', 'w104_rfmo_radar', 'w13_korea_empire', 'w14_species_polar', 'w19_ecuador_surge', 'w22_japan_decline', 'w45_skipjack_collapse', 'w46_seasonal_arbitrage', 'w48_vds_quota', 'w60_bluefin_ranching_defense', 'w71_bluefin_ranching_growth', 'w67_longline_cost', 'w68_vessel_productivity', 'w80_starvation_mortality', 'w81_enso_gdp_cascade', 'w82_indian_ocean_tuna', 'w93_mesotherm_energy', 'w53_enso_radar', 'w83_dfad_revenue_shock', 'w94_wcpo_record_catch', 'w95_eez_highseas_polarization', 'w96_iotc_msy_overshoot', 'w97_korea_fleet_switching'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
            </div>

            {/* 5. 프리미엄 원물 밸류에이션 (참다랑어 축양) */}
            <div style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>

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
            <OperationalS1Widgets />
            {/* Phase B4 신규: 태국 가공 허브 + 퍼펙트 스톰 */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <ThaiImportShift1Q26 />
              <PerfectStormWidget />
            </div>
            {/* Atuna May News (S1) */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <AtunaIoPerfectStormWidget />
              <AtunaEpoCatchDropWidget />
            </div>
            
            {/* KMI FTA Insights (S1) */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <WidgetCard widget={tunaQuotaData} />
              <WidgetCard widget={tunaYenData} />
            </div>

            {/* Kawamoto 2026 — 일본 공급 구조 (S1) */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <InsightSupplyStructure2022 />
            </div>

            {/* 🆕 RFMO Librarian — WCPFC/IATTC/IOTC 1차 자료 인텔리전스 (S1: 어획·조업) */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <TunaRFMOLibrarian filterPillar="S1" />
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
            {/* 1. 글로벌 소싱 및 OEM 아웃소싱 / 2. 통조림 원가 및 마진 방어 */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <TunaSupplierHub />
              <InsightVietnamOEM />
              
              {/* 2. 통조림 원가 및 마진 방어 */}
              <TunaPetCareMargin />
              {widgets?.filter((w: any) => ['w04_proc', 'w15_canning_factory', 'w20_thailand_paradox', 'w25_byproduct_cashcow', 'w30_spain_arbitrage', 'w32_species_margin', 'w33_spain_vs_france', 'w36_spain_vulnerability', 'w40_french_cannery_decline', 'w42_first_sale_cascade', 'w47_korea_thailand_pipeline', 'w49_yield_labor', 'w54_mega_cannery_opex', 'w70_eu_tuna_cost_shock', 'w66_petfood_capacity_defense', 'w84_invasivorism', 'w57_alt_protein', 'w98_byproduct_rd_pipeline', 'w102_spain_loin_outsourcing'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
            </div>

            {/* 3. 부산물 고부가가치화 (업사이클링 및 참치액젓 R&D) */}
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Leaf size={18} /> 부산물 업사이클링 & R&D 
                </h3>
              </div>
              <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <KfasByproductValueChain />
                <TunaUpcyclingOpportunity />
                <TunaUpcyclingMarginMap />
                <TunaBioUpcyclingGap />
                <TunaPeptideEfficacy />
                <InsightTunaExtract />
                <KfasElderlyFunctionalFood />
                {/* Phase B4 신규: Frime 인수 (스페인 최대 황다랑어 가공사) */}
                <FrimeAcquisitionWidget />
              </div>
            </div>
            <OperationalS2Widgets />
            
            {/* 🐾 파생 사업 (펫푸드) 통합 */}
            <div style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '4px', height: '28px', background: '#3b82f6', borderRadius: '2px' }} />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>🐾 파생 사업 — 프리미엄 펫케어 시장</h2>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>참치 부산물 기반 고부가가치 펫푸드 시장 진입 전략 및 유통망 구조 분석</p>
                </div>
              </div>
              <div style={{ margin: '0 -2rem' }}>
                <PetFoodDashboard />
              </div>
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
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* 1. 해상 운임 및 랜딩 코스트 (원가 산출) */}
              <MofShippingCostWidget />
              <TunaLandingCost />
              <LandingCostSensitivity />

              {/* 2. 글로벌 무역 흐름 및 수급 파악 */}
              <WitsTradeFlowWidget />
              <TunaHSClassifier />
              <MofTradeBalanceWidget />
              {/* 미국 인구조사국 무역 통계 — 참치캔 공급국 (명태 우회는 PollockDashboard로 분리) */}
              <UsTunaMarketShareWidget />

              {/* 3. 전략적 물류 거점 (PNG 등) */}
              <TunaPngHubStrategy />

              {/* 4. 관세 최적화 및 신흥 시장 개척 */}
              <WitsTariffWidget />
              <FtaTariffOptimizer />
              <OecBenchmarkWidget />
              <EmergingMarketsHeatmap />

              {/* 5. 기타 물류 및 무역 지표 */}
              {widgets?.filter((w: any) => ['w05_cash', 'w06_trade_vol', 'w07_export', 'w08_import', 'w10_kr_deficit', 'w23_korea_surplus', 'w35_species_channels', 'w39_nl_tollgate', 'w50_bunker_freight', 'w55_emerging_route', 'w62_fuel_impact', 'w58_atq_loin_export', 'w41_geopolitical_shift', 'w63_us_tariff_frontloading', 'w64_mena_halal_demand', 'w99_reciprocal_tariff_shock'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
              <AtunaEuCatchSystemWidget />
              <WidgetCard widget={tunaColdChainData} />
              <WidgetCard widget={tunaOriginData} />
            </div>
            <OperationalS3Widgets />

            {/* 🆕 USDA FAS — 인도네시아 할랄 가공 수산물 의무화 (S3 통관·규제) */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <TunaUsdaKoreaSeafood filterPillar="S3" />
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
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* 1. 거시 경제 및 인플레이션 타격 */}
              <TunaPriceDecoupling />
              {/* 미국 시장 — 참치캔 수입 트렌드 + 평균 단가 */}
              <UsTunaImportWidget />

              {/* 2. 주요 소비 시장 동향 (EU 및 글로벌 리테일) */}
              <InsightEU18C />
              {widgets?.filter((w: any) => ['w09_kr_import', 'w11_kr_price', 'w12_margin', 'w16_import_blackhole', 'w17_korea_margin', 'w21_korea_price_truth', 'w31_italy_multiplier', 'w34_germany_blackhole', 'w37_china_dumping', 'w38_italy_stagflation', 'w43_retail_price_map', 'w44_italy_retail_explosion', 'w51_gridflation', 'w56_eu_oligopsony', 'w59_inflation_downtrading', 'w65_export_price_benchmark', 'w69_china_consumption', 'w100_china_fukushima_switch'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
              
              {/* 3. 신규 수요 창출 (할랄 및 틈새 시장) */}
              <TunaGlobalHalalStrategy />
              <AtunaBangkokPriceWidget />
              
              {/* 4. KMI FTA Insights (Macro Demand) */}
              <WidgetCard widget={tunaMacroData} />

              {/* 5. Kawamoto 2026 — 일본 사시미 장기 수요 절벽 */}
              <InsightJapanDemandCliff />
              <InsightPerCapitaGamma />
              <InsightSegmentDecline />
              <InsightPriceTier />

              {/* 6. KMI FTA 참다랑어 수입 인텔리전스 (2021~2026 Q1) */}
              <InsightKmiBluefinYearly />
              <InsightKmiBluefinSupplyShift />
              <InsightKmiBluefin2026Signal />
            </div>
            <OperationalS4Widgets />

            {/* 🆕 Atuna 8년 가격 timeline — 어종 평균 + 5 항만별 토글 */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              <TunaAtuna8YPrice />
            </div>

            {/* 🆕 USDA FAS Korea Seafood — 한국 수입·미국산 점유·Top 품목·스페인 비교 (S4) */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <TunaUsdaKoreaSeafood filterPillar="S4" />
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
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* 1. 글로벌 규제 레이더 및 컴플라이언스 리스크 */}
              <TunaComplianceRadar />
              <PolicyRiskScorecard />
              <TunaEsgRiskRadar />
              {/* 미국 UFLPA 발효 후 가공국 재편 (Census 무역 통계 근거) */}
              <UsPolicyImpactWidget />

              {/* 2. 환경세 및 자원 보존 (TAC) 규제 */}
              <InsightPillarTwo />
              <TunaTacMonitor />
              <TunaSdgCircular />

              {/* 3. 기타 ESG 지표 */}
              {widgets?.filter((w: any) => ['w18_zero_aqua', 'w24_bluefin_ranch', 'w26_data_hegemony', 'w27_global_minimum_tax', 'w52_msc_cbam', 'w85_spain_mpa_paper_park', 'w86_observer_ems_cost', 'w87_incentive_vs_cc', 'w88_eu_landing_obligation', 'w89_undetected_silky_shark', 'w90_cgp_species_gap', 'w91_bluefin_escapement', 'w92_ems_blind_spot', 'w101_greentech_drone_capex', 'w103_taiwan_esg_risk'].includes(w.id)).map((w: any) => (
                <WidgetCard key={w.id} widget={w} />
              ))}
              {/* Phase B4 신규: 동원·사조 RAS 시험 운영 */}
              <RasSystemWidget />

              {/* Kawamoto 2026 — 인구·세대 구조 리스크 (장기 ESG) */}
              <InsightCohortDoubleShock />
            </div>

            {/* 🆕 RFMO Librarian — IATTC 자원평가 + WCPFC 빌피쉬 혼획 (S5: ESG·지속가능성) */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
              <TunaRFMOLibrarian filterPillar="S5" />
            </div>

            <OperationalS5Widgets />
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


