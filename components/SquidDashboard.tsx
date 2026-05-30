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
import styles from './SquidDashboard.module.css';
import TakeawayBox from './TakeawayBox';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';
import { SquidVCFishing, SquidVCProcessing, SquidVCProduct, SquidVCLogistics, SquidVCMarket } from './SquidValueChainWidgets';

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
// 5-Pillar 네비게이터 메타 (Tuna 패턴 + 오징어 시그니처 그라디언트 purple → pink)
const SECTIONS = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '🌊 Part I — 원물 및 조달', desc: '포클랜드 자원평가 · 어획 헤게모니 · 기후 및 어획량 동향', color: '#8b5cf6' },
  { id: 'S2', num: '❷', label: '가공·생산', title: '🏭 Part II — 가공 및 밸류체인 (Processing)', desc: '스페인(Vigo) 가공 허브 스프레드 · 대체 원료 블렌딩 마진 분석', color: '#a855f7' },
  { id: 'S3', num: '❸', label: '물류·통관', title: '⚓ Part III — 물류 및 운영 원가 (Logistics)', desc: '라이선스/ITQ 입어료 비용 변동 · 채낚기 선단 유류비(MGO) 시뮬레이션', color: '#d946ef' },
  { id: 'S4', num: '❹', label: '판매·수요', title: '📊 Part IV — 판매 및 수요 (Sales & Demand)', desc: 'KOSIS 내수 CPI 괴리율 · 인플레이션 발 수요 파괴 및 수입 단가 트렌드', color: '#ec4899' },
  { id: 'S5', num: '❺', label: 'ESG·지속가능성', title: '🛡️ Part V — ESG 및 미래 어업 (Sustainability)', desc: '남서대서양 IUU 레이더 · M&A 실사(PEF Valuation) 및 Earn-out 시뮬레이션', color: '#f43f5e' }
];

const PILLAR_WIDGET_IDS: Record<string, string[]> = {
  S1: ['w_fta_squid_peru_megaboom', 'w_fta_squid_domestic_comp', 'w_squid_enso_biomass', 'w_squid_loligo_season', 'w1_catch_powers', 'w2_korea_supply', 'w3_jumbo_flying', 'w_squid_price_forecast', 'w61_kfas_regime_shift', 'w62_kfas_msy_assessment', 'w48_supply_inversion', 'w57_china_supply_dominance', 'w18', 'w27_squid_climate_geopolitics', 'w12_ax_fishing', 'w68_import_dependency', 'w74_illex_boom_bust', 'w76_area41_illex_share', 'w80_loligo_vs_illex_portfolio', 'w81_mile201_fleet_intensity', 'w82_sprfmo_quota_dashboard', 'w87_dosidicus_collapse_alert', 'w_squid_falkland_loligo_biomass'],
  S2: ['w_fta_squid_processed_share', 'w_squid_sg_valueup', 'w10_processed_dominance', 'w31_eu_squid_supply_shock', 'w35_spain_trade_hub', 'w37_spain_arbitrage_trap', 'w40_value_chain_exploitation', 'w49_processing_funnel', 'w_squid_sourcing_sim', 'w34_value_add_funnel', 'w17', 'w47_spain_processing_empire', 'w30_business_model', 'w83_fesba_processing_capacity', 'w_squid_global_processing_yield'],
  S3: ['w50_fleet_opex', 'w53_energy_stress_test', 'w26_squid_ai_jigging_fuel', 'w_squid_hs_tariff_sim', 'w54_sourcing_bottleneck', 'w28_falkland_waterfall', 'w29_capex_shock', 'w43_risk_reward_inversion', 'w66_capex_roadmap', 'w71_fig_licence_system', 'w73_illex_2024_season', 'w79_fleet_competition_map', 'w_squid_origin_diversification_2025', 'w_squid_route_leadtime_compliance'],
  S4: ['w_fta_squid_decouple', 'w_fta_squid_qprice', 'w_squid_eu_ceph_demand', 'w_kosis_squid_cpi', 'w4_unit_price', 'w6_species_pie', 'w7_korea_category', 'w8_china_export', 'w9_trade_deficit', 'w32_eu_squid_price_tier', 'w33_eu_first_sale_spread', 'w36_stagflation_paradox', 'w55_export_concentration', 'w60_twoway_price_simulator', 'w_importyeti_eu_buyers', 'w42_macro_demand_destruction', 'w38_vigo_chokepoint_monopoly', 'w39_mediterranean_premium', 'w41_temporal_arbitrage', 'w44_trade_route_arbitrage', 'w45_christmas_demand_spike', 'w46_korea_holiday_effect', 'w46_france_premium_paradox', 'w5_top_importers', 'w69_eu_supply_gap', 'w85_eu_illex_price_cycle', 'w_squid_import_unit_price_mt'],
  S5: ['w_squid_cmm18_quota', 'w_ofac_iuu_radar', 'w_wto_squid_sps', 'w_mfds_squid_safety', 'w58_iuu_blackbox_risk', 'w52_iuu_geopolitics', 'w11_no_aquaculture', 'w25_squid_chitosan_biomaterial', 'w51_policy_intervention', 'w77_mile201_dwf_crisis', 'w65_ma_scorecard', 'w67_earnout_sim', 'w70_value_creation', 'w56_sunmin_pe_valuation', 'w72_fig_revenue_trend', 'w75_loligo_scientific_mgmt', 'w78_itq_transition_timeline', 'w_squid_forced_labor_dwf_carbon'],
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

const PIE_COLORS = ["#8b5cf6", "#a855f7", "#d946ef", "#e879f9", "#ec4899", "#f43f5e", "#fb7185", "#fda4af"];

/* ─── KPI Themes ─── */
const KPI_THEMES = [
  { border: 'none', glow: 'none', text: '#8b5cf6', icon: Database },
  { border: 'none', glow: 'none', text: '#a855f7', icon: TrendingUp },
  { border: 'none', glow: 'none', text: '#d946ef', icon: Ship },
  { border: 'none', glow: 'none', text: '#ec4899', icon: ShieldCheck },
  { border: 'none', glow: 'none', text: '#f43f5e', icon: Factory },
  { border: 'none', glow: 'none', text: '#fb7185', icon: Scale },
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
  w_squid_sourcing_sim: Layers,
  w_squid_enso_biomass: Globe,
  w_squid_loligo_season: Fish,
  w_squid_cmm18_quota: Scale,
  w_squid_eu_ceph_demand: TrendingUp,
  w_squid_sg_valueup: Factory,
  w_fta_squid_peru_megaboom: TrendingUp,
  w_fta_squid_decouple: Activity,
  w_fta_squid_qprice: DollarSign,
  w_fta_squid_domestic_comp: Scale,
  w_fta_squid_processed_share: Factory
};

const formatYAxis = (v: number) => {
  if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
  if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
  return v;
};

export default function SquidDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');
  const [apiWidgets, setApiWidgets] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [mgoPrice, setMgoPrice] = useState(107);
  const [fxRate, setFxRate] = useState(1350);
  const [apiStatus, setApiStatus] = useState("연결됨");
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
      <p style={{ color: '#848E9C', fontSize: '1rem' }}>전략 인텔리전스 로딩 중...</p>
    </div>
  );

  const { kpis, widgets: jsonWidgets } = data;
  const kpiKeys = Object.keys(kpis);
  
  // Inject New Research-Driven Widgets (Drive Cross-Analysis)
  const newResearchWidgets: any[] = [
    {
      id: "w_squid_enso_biomass",
      title: "ENSO 주기 vs Dosidicus 개체군 변동",
      subtitle: "SPRFMO SC13 2025 상태공간 모델 연동. 엘니뇨/라니냐 전환이 미주대왕오징어 어획량에 미치는 영향을 추적합니다.",
      chartType: "Composed",
      xKey: "year",
      bars: [{ key: "어획량(천톤)", color: "#8b5cf6" }],
      lines: [{ key: "ENSO 지수", color: "#f43f5e", yAxisId: "right" }],
      dualAxis: true,
      sit: "SPRFMO SC13 2025 자원평가에 따르면 Dosidicus gigas 개체군은 ENSO 주기와 강한 상관관계를 보이며, 엘니뇨 시 어획량이 30~50% 급감합니다. 현재 ENSO neutral에서 라니냐 전환 가능성이 높아 2026 시즌 공급 불확실성이 큽니다.",
      strat: "ENSO 전환 시그널 감지 즉시 페루산 Illex 선도거래 물량을 확보하고, 라니냐 시즌 어획량 증가 시 가공 물량을 적극 매입하여 재고를 확대하십시오.",
      source: "SPRFMO SC13-SQ07 (2025)",
      isLive: true,
      data: [
        { year: "2019", "어획량(천톤)": 780, "ENSO 지수": 0.5 },
        { year: "2020", "어획량(천톤)": 620, "ENSO 지수": -1.1 },
        { year: "2021", "어획량(천톤)": 710, "ENSO 지수": -0.8 },
        { year: "2022", "어획량(천톤)": 850, "ENSO 지수": -1.0 },
        { year: "2023", "어획량(천톤)": 540, "ENSO 지수": 1.5 },
        { year: "2024", "어획량(천톤)": 490, "ENSO 지수": 1.2 },
        { year: "2025(E)", "어획량(천톤)": 730, "ENSO 지수": -0.3 }
      ]
    },
    {
      id: "w_squid_loligo_season",
      title: "포클랜드 Loligo 2025 시즌 바이오매스 추이",
      subtitle: "FIG 자원평가 보고서(Loligo_StockAssess_2025) 연동. S1/S2 시즌별 바이오매스 지수를 모니터링합니다.",
      chartType: "Area",
      xKey: "season",
      areas: [{ key: "바이오매스 지수", color: "#a855f7" }],
      sit: "Loligo gahi 2025 자원평가에서 바이오매스 회복세가 확인되었으나(S1: +12%), ENSO neutral 전환 시 S2 시즌의 불확실성이 잔존합니다. 반면 Illex는 2024 시즌 총어획량이 전년대비 -18% 감소했습니다.",
      strat: "Loligo 회복 구간에서 채낚기 라이선스를 추가 확보(입어료 +3.2% 반영)하여 프리미엄 원물 확보 채널을 강화하고, Illex 부족분은 페루·아르헨티나 트롤선 원물로 대체 조달하십시오.",
      source: "FIG Loligo Stock Assessment 2025 S1/S2",
      isLive: true,
      data: [
        { season: "2022 S1", "바이오매스 지수": 62 },
        { season: "2022 S2", "바이오매스 지수": 58 },
        { season: "2023 S1", "바이오매스 지수": 55 },
        { season: "2023 S2", "바이오매스 지수": 71 },
        { season: "2024 S1", "바이오매스 지수": 68 },
        { season: "2024 S2", "바이오매스 지수": 74 },
        { season: "2025 S1", "바이오매스 지수": 83 },
        { season: "2025 S2(E)", "바이오매스 지수": 76 }
      ]
    },
    {
      id: "w_squid_cmm18_quota",
      title: "SPRFMO CMM 18-2026 국가별 선박/Capacity 상한 현황 (Effort-based)",
      subtitle: "SPRFMO CMM 18-2026 (2026-02~03 Panama 14차 위원회 채택, CMM 18-2025 대체). TAC 도입 제안은 부결됨. Effort-based 관리 유지: 15% 선박/Capacity 축소 — 중국 570척/548,097GT, 한국 43척, Chinese Taipei 38척 (총 651척/625,678GT). 차기 검토 2027.",
      chartType: "Bar",
      xKey: "country",
      bars: [{ key: "선박 상한(척)", color: "#d946ef" }],
      sit: "SPRFMO CMM 18-2026은 Dosidicus gigas 관리에 TAC를 도입하지 않고 effort-based 통제만 유지합니다. 15% 선박/Capacity 축소가 적용되어 중국 DWF는 570척으로 상한이 설정됐습니다. SeafoodWatch는 중국 DWF의 강제노동 리스크를 고위험(High Risk)으로 평가했습니다.",
      strat: "중국산 원물의 ESG 리스크가 급등하고 있으므로 EU CSDDD 및 미국 UFLPA 규제를 고려해 페루·포클랜드·아르헨티나 산지 다변화를 추진하고, MSC 인증(현재 두족류 2% 미만) 선점을 추진하십시오.",
      source: "SPRFMO CMM 18-2026 (Panama City 14차 위원회 2026-02~03) & SeafoodWatch 2024",
      isLive: false,
      data: [
        { country: "중국", "선박 상한(척)": 570 },
        { country: "페루", "선박 상한(척)": 185 },
        { country: "칠레", "선박 상한(척)": 95 },
        { country: "한국", "선박 상한(척)": 43 },
        { country: "대만", "선박 상한(척)": 38 },
        { country: "에콰도르", "선박 상한(척)": 42 }
      ]
    },
    {
      id: "w_squid_eu_ceph_demand",
      title: "EU 두족류 첫경매 현황 (2025년 6월)",
      subtitle: "EUMOFA 월간보고서(MH) 6월호 연동. EU 두족류 첫경매 실측: 2025년 6월 78.5M EUR·10,617톤 — 오징어 +7%, 문어 +22%, 갑오징어 -17%. 프랑스 오징어 단가 9.70→9.58 EUR/kg.",
      cardDesc: "출처: EUMOFA EU Fish Market Monthly (MH) June 2025 — First Sales 두족류 실측 (EUR·톤)",
      chartType: "Line",
      xKey: "year",
      lines: [{ key: "EU 두족류 첫경매(천톤)", color: "#ec4899" }],
      sit: "EUMOFA MH 2025년 6월호 첫경매 실측에 따르면 EU 두족류 합산 10,617톤(78.5M EUR) — 오징어 +7%, 문어 +22% 호조. 프랑스 오징어 단가는 9.70→9.58 EUR/kg으로 소폭 정상화. Vigo 가공 허브는 여전히 수입 의존도 60% 이상 유지하며 EU 해양 전략(EU Blue Economy) 기반 공급망 다원화 압력 가중중.",
      strat: "①프랑스산 오징어 9.58 EUR/kg 가격대는 EU 내 프리미엄·횟감 채널 최저점 — 직거래 LTL(Less Than Truckload) 최적화로 Vigo 마진 우회, ②문어 +22% 수요 증가는 EU 남부(이탈리아·스페인) 고급 레스토랑 채널 전개 신호 — 생물·냉동 원물 사전 예약 물량 확보, ③포르투갈·모로코 경쟁 심화로 프리미엄 gap 축소 중 — 한국 세미프로세싱(진미채·튜브) 가공 한정판 차별화 전략으로 Vigo 가공 의존도 저감.",
      source: "EUMOFA EU Fish Market Monthly (MH) June 2025 — First Sales Data",
      isLive: false,
      syncDate: "2025-06",
      data: [
        { year: "2020", "EU 두족류 첫경매(천톤)": 8.2 },
        { year: "2021", "EU 두족류 첫경매(천톤)": 8.9 },
        { year: "2022", "EU 두족류 첫경매(천톤)": 9.1 },
        { year: "2023", "EU 두족류 첫경매(천톤)": 9.4 },
        { year: "2024", "EU 두족류 첫경매(천톤)": 10.0 },
        { year: "2025-06(MH)", "EU 두족류 첫경매(천톤)": 10.6 }
      ]
    },
    // ─── KMI 「FTA체결국 수산물 수입동향」 2021 Q1 ~ 2026 Q1 (21개 분기) 교차분석 위젯 ───
    {
      id: "w_fta_squid_peru_megaboom",
      title: "페루 +1,458% — 2026 1Q 대왕오징어 메가 회복",
      subtitle: "KMI 「FTA체결국 수산물 수입동향 2026 Q1」 본문. 페루 어획 호조 + 단가 폭락이 동시 발생한 single-quarter shock의 국가별 분해입니다.",
      chartType: "Composed",
      xKey: "country",
      bars: [
        { key: "25년 1Q(천 톤)", color: "#64748b" },
        { key: "26년 1Q(천 톤)", color: "#a855f7" }
      ],
      data: [
        { country: "전체", "25년 1Q(천 톤)": 26.3, "26년 1Q(천 톤)": 35.3 },
        { country: "중국", "25년 1Q(천 톤)": 15.3, "26년 1Q(천 톤)": 14.3 },
        { country: "페루", "25년 1Q(천 톤)": 0.8, "26년 1Q(천 톤)": 12.3 },
        { country: "에콰도르", "25년 1Q(천 톤)": 0.13, "26년 1Q(천 톤)": 4.5 },
        { country: "칠레", "25년 1Q(천 톤)": 4.5, "26년 1Q(천 톤)": 1.5 }
      ],
      sit: "2026 1분기 오징어 수입은 전년 동기 대비 +34.0%(26.3→35.3천 톤). 그러나 회복분 9.0천 톤의 99% 이상이 페루(+1,458.8%, 0.8→12.3천 톤)와 신규 진입자 에콰도르(+3,235.5%, 0.13→4.5천 톤)에서 발생. 동시에 칠레는 -66.7%로 페루산에 시장 점유율을 통째로 내줌. 對페루 냉동 단가는 $3.6→$2.2/kg(-35.8%)로 폭락 — 어획 호조와 단가 디플레이션이 동시 발생하는 전형적 \"엘니뇨 종료 사이클\" 패턴.",
      strat: "①페루산 $2.2/kg 단가는 2018년 이후 최저 — 6개월 선도(forward) 매입을 즉시 단행하여 평균 단가 락-인, ②에콰도르산은 \"상대적 저품질\"(KMI 명시) 이지만 $1.9/kg 가격 메리트가 압도적이므로 B2B 진미채·자숙 원료로 분리 매입 라인 신설, ③페루-에콰도르 합산 신규 점유율이 47%로 급증한 시점 — 단일 산지(중국 40.5%) 의존 시대를 끝내고 3극 균형(중국·페루·에콰도르) 헷지 룰로 KPI 재편.",
      source: "KMI 「FTA체결국 수산물 수입동향 2026 Q1」 — 오징어 국가별 수입량 표 + 단가 추이 (2026-04 발간)",
      isLive: false,
      syncDate: "2026-04"
    },
    {
      id: "w_fta_squid_domestic_comp",
      title: "국내 -36.4% × 수입 +34.0% — 자급률 붕괴 보상 메커니즘",
      subtitle: "KMI 2026 Q1 본문 인용: 국내 생산 20,292→12,908톤(-36.4%) ⇄ 수입 26.3→35.3천 톤(+34.0%). 한국 수요는 정상이지만 산지가 100% outsource되는 단계.",
      chartType: "Composed",
      xKey: "period",
      bars: [
        { key: "국내 생산(천 톤)", color: "#10b981" },
        { key: "수입(천 톤)", color: "#a855f7" }
      ],
      lines: [
        { key: "자급률(%)", color: "#f59e0b", yAxisId: "right" }
      ],
      dualAxis: true,
      data: [
        { period: "21년 1Q", "국내 생산(천 톤)": 28.5, "수입(천 톤)": 35.0, "자급률(%)": 44.9 },
        { period: "22년 1Q", "국내 생산(천 톤)": 24.3, "수입(천 톤)": 32.8, "자급률(%)": 42.5 },
        { period: "23년 1Q", "국내 생산(천 톤)": 21.5, "수입(천 톤)": 35.5, "자급률(%)": 37.7 },
        { period: "24년 1Q", "국내 생산(천 톤)": 22.4, "수입(천 톤)": 30.6, "자급률(%)": 42.3 },
        { period: "25년 1Q", "국내 생산(천 톤)": 20.3, "수입(천 톤)": 26.3, "자급률(%)": 43.6 },
        { period: "26년 1Q", "국내 생산(천 톤)": 12.9, "수입(천 톤)": 35.3, "자급률(%)": 26.8 }
      ],
      sit: "2026 1분기 한국 오징어 자급률은 단숨에 26.8%로 폭락(전년 동기 43.6%, -16.8%p). 국내 생산이 -36.4% 감소했지만 시장 수요는 정상이며 그 공백을 수입이 +34.0%로 정확히 메움 — \"수요 파괴는 없고 산지만 outsource되는\" 구조적 전환. 5년 평균으로 보면 자급률은 45%→27%로 18%p 가속 하락 중.",
      strat: "①자급률 30% 하방 이탈은 \"국가 식량안보 마지노선\" 임계 — 수입 콜드체인 capacity가 곧 시장지배력으로 직결되므로 부산항 보세창고 확보를 IR 핵심 자산으로 표준 공시, ②국내 어획 의존 가공라인(연근해 살오징어 기반)은 점진 폐쇄하고 페루·아르헨티나 원물 기반 라인으로 CAPEX 재할당, ③자급률 25% 이탈 시 정부 비축미 패턴의 \"전략비축 오징어\" 정책 도입 가능성 — 정책 채널 모니터링 KPI 신설.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2021Q1~2026Q1 — 오징어 수입량 + 국내 생산량 누적 데이터 교차집계",
      isLive: false,
      syncDate: "2026-04"
    },
    {
      id: "w_fta_squid_decouple",
      title: "단가-물량 디커플링 — 2025 액 +36% vs 물량 +17%",
      subtitle: "KMI 분기보고서 「오징어 수입량/수입액」 누적 데이터. 물량보다 두 배 빠른 액 증가는 단가 폭등 사이클의 명확한 시그널입니다.",
      chartType: "Composed",
      xKey: "year",
      bars: [
        { key: "수입량(천 톤)", color: "#a855f7" }
      ],
      lines: [
        { key: "수입액(백만$)", color: "#ec4899", yAxisId: "right" },
        { key: "평균 단가($/kg)", color: "#f59e0b", yAxisId: "right" }
      ],
      dualAxis: true,
      data: [
        { year: "2021", "수입량(천 톤)": 135.0, "수입액(백만$)": 415, "평균 단가($/kg)": 3.07 },
        { year: "2022", "수입량(천 톤)": 138.4, "수입액(백만$)": 455, "평균 단가($/kg)": 3.29 },
        { year: "2023", "수입량(천 톤)": 155.8, "수입액(백만$)": 510, "평균 단가($/kg)": 3.27 },
        { year: "2024", "수입량(천 톤)": 141.3, "수입액(백만$)": 515, "평균 단가($/kg)": 3.65 },
        { year: "2025", "수입량(천 톤)": 165.7, "수입액(백만$)": 700.6, "평균 단가($/kg)": 4.23 },
        { year: "2026(1Q×4 추정)", "수입량(천 톤)": 141.2, "수입액(백만$)": 476.8, "평균 단가($/kg)": 3.38 }
      ],
      sit: "2025년 수입액은 전년 대비 +36.0%(515→700.6백만$) 폭등한 반면 물량은 +17.3%(141.3→165.7천 톤)에 머묾 — 액 증가율이 물량의 2.08배. 평균 단가가 $3.65→$4.23/kg(+15.9%)로 sharpe 상승하며 5년 사이클 고점 진입. 그러나 2026 1Q는 페루 어획 호조로 단가가 $2.86→$2.18/kg로 -23.8% 정상화 신호. 액-물량 디커플링이 6분기 만에 종료되는 변곡점.",
      strat: "①$4 이상 단가 구간(2025)에서는 가격 전가가 가능한 B2B 채널(급식·외식 프랜차이즈) 우선 배정으로 마진율 방어, ②2026 1Q $2.2/kg 페루산 폭락 구간을 활용해 분기 매입 비중을 30% → 50% 이상으로 전진 배치, ③단가 사이클 모니터링을 위해 KAMIS 도매가 + KMI 분기단가 + KCS CIF 3중 트래커 통합 대시보드를 IR 표준 지표로 운영.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2021~2026 분기 누적 수입액·물량 (2026-04)",
      isLive: false,
      syncDate: "2026-04"
    },
    {
      id: "w_fta_squid_qprice",
      title: "국가별 냉동 오징어 분기 수입단가 ($/kg)",
      subtitle: "KMI 분기보고서 「냉동 오징어 수입단가 추이」 누적 차트. 칠레-페루 단가 역전 + 페루 폭락 + 에콰도르 최저가 진입을 추적합니다.",
      chartType: "Composed",
      xKey: "quarter",
      lines: [
        { key: "중국", color: "#a855f7" },
        { key: "페루", color: "#d946ef" },
        { key: "칠레", color: "#ec4899" },
        { key: "에콰도르", color: "#f43f5e" }
      ],
      data: [
        { quarter: "24-Q1", "중국": 3.2, "페루": 3.6, "칠레": 3.8, "에콰도르": 0 },
        { quarter: "24-Q2", "중국": 3.3, "페루": 3.7, "칠레": 4.0, "에콰도르": 0 },
        { quarter: "24-Q3", "중국": 3.5, "페루": 4.2, "칠레": 4.5, "에콰도르": 1.6 },
        { quarter: "24-Q4", "중국": 3.6, "페루": 4.5, "칠레": 4.6, "에콰도르": 1.7 },
        { quarter: "25-Q1", "중국": 3.7, "페루": 3.6, "칠레": 4.7, "에콰도르": 1.6 },
        { quarter: "25-Q2", "중국": 3.9, "페루": 3.2, "칠레": 4.8, "에콰도르": 1.7 },
        { quarter: "25-Q3", "중국": 4.0, "페루": 2.8, "칠레": 4.5, "에콰도르": 1.8 },
        { quarter: "25-Q4", "중국": 4.1, "페루": 2.5, "칠레": 4.3, "에콰도르": 1.9 },
        { quarter: "26-Q1", "중국": 4.0, "페루": 2.2, "칠레": 4.5, "에콰도르": 1.9 }
      ],
      sit: "2025-26년 \"칠레산이 페루산보다 항상 높은 단가\"(KMI 2025Q4 본문 명시)가 6분기 연속 유지 — 어획물 사이즈 큰 칠레산이 프리미엄 시장을 락-인. 페루산은 $3.6→$2.2/kg(-39%)로 폭락하여 5년래 최저점 도달. 에콰도르 신규 진입자는 $1.9/kg로 페루보다 -14% 추가 디스카운트 — 사실상 \"제2의 페루\" 포지션 확보. 중국산은 가공품 비중이 높아 $4.0대 안정 유지.",
      strat: "①칠레산 $4.5/kg는 프리미엄 횟감·통오징어 채널, 페루산 $2.2/kg는 B2B 자숙·진미채 원료, 에콰도르산 $1.9/kg는 저가 PB 및 사료/펫푸드 채널로 \"단가 3-Tier 채널 매핑\" 즉시 실행, ②분기 단가 spread $2/kg 이상 확대 구간에서 칠레/페루 매입 비중 동적 조정 룰을 운영, ③에콰도르 단가가 $2 돌파 시점에 즉시 다음 산지(아르헨티나·대만) 대비 동기화 — 단가 floor 추격 전략.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2024~2026 분기 — 냉동 오징어 수입단가 추이 차트 (HSK 0307.43.20.00)",
      isLive: false,
      syncDate: "2026-04"
    },
    {
      id: "w_fta_squid_processed_share",
      title: "조미·자숙 비중 26→22% — 1차 가공 한국 회귀 시그널",
      subtitle: "KMI 분기보고서 「오징어 품목별 비중」 누적 데이터. 중국·동남아 조미·자숙 가공 의존도가 줄어드는 \"가공 리쇼어링\" 5년 추세 분석.",
      chartType: "Composed",
      xKey: "year",
      bars: [
        { key: "냉동(%)", color: "#a855f7" },
        { key: "조미·자숙(%)", color: "#f59e0b" }
      ],
      data: [
        { year: "2021", "냉동(%)": 73.3, "조미·자숙(%)": 26.1 },
        { year: "2022", "냉동(%)": 73.0, "조미·자숙(%)": 25.9 },
        { year: "2023", "냉동(%)": 73.5, "조미·자숙(%)": 25.5 },
        { year: "2024", "냉동(%)": 73.3, "조미·자숙(%)": 25.7 },
        { year: "2025", "냉동(%)": 76.8, "조미·자숙(%)": 22.5 },
        { year: "2026(1Q)", "냉동(%)": 73.6, "조미·자숙(%)": 25.5 }
      ],
      sit: "조미·자숙 가공품 비중이 2021년 26.1%에서 2025년 22.5%로 4년간 -3.6%p 하락(상대적 -14%). 동시에 냉동 원물 비중은 73.3% → 76.8%로 상승 — \"원물로 들여와 한국에서 가공한다\"는 리쇼어링(reshoring) 패턴이 시작됨. 단, 2026 1Q는 페루 어획 폭증으로 일시적 회귀(25.5%). 국내 가공 capacity 증설 또는 중국 가공 단가 매력 약화가 trigger.",
      strat: "①\"조미·자숙 원물 회귀\"는 신라에스지 가공 컨트롤타워 확대 명분 — 페루산 냉동을 한국 가공 후 B2B로 직납하는 진미채·튜브 라인을 2026년 CAPEX 1순위 항목으로 IR 표준화, ②중국 조미 가공 마진(약 $0.8~1.2/kg)을 한국 P&L에 직접 편입할 경우 전사 영업이익률 +3~5%p 점프 가능 — 시뮬레이션 시급, ③EU CSDDD·미국 UFLPA 강제노동 규제로 중국 조미·자숙 ESG 리스크 동시 상승 — 리쇼어링은 ESG 정합성 + 마진 양수겸장.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2021Q4·2022Q4·2023Q4·2024Q4·2025Q4·2026Q1 — 오징어 품목별 비중 본문",
      isLive: false,
      syncDate: "2026-04"
    },
    {
      id: "w_squid_sg_valueup",
      title: "SG 2026 밸류업: 진미채·냉동 튜브 가공 내재화",
      subtitle: "공통 전략 문건(SG '26년 운영방안) 연동. 포클랜드 Illex 원물을 신라에스지가 직접 가공·납품할 때의 마진율 개선 예측입니다.",
      chartType: "Composed",
      xKey: "year",
      bars: [{ key: "단순 원물 마진(%)", color: "#64748b" }],
      lines: [{ key: "SG 가공 내재화 마진(%)", color: "#ec4899" }],
      sit: "SG 2026 밸류업 문건에 따르면 현재 오징어 유통은 원물 도매에 머물러 이익률이 낮습니다. 진미채·냉동 튜브 등 다운스트림 가공 역량이 부재하며, 신라에스지의 가공 컨트롤타워 역할 확대가 시급합니다.",
      strat: "포클랜드 Illex 원물을 신라에스지가 진미채·냉동 튜브·오징어 볼 등 B2B 급식용 HMR로 전환하여 단순 원물 대비 영업이익률을 20%p 이상 개선하십시오. ODM 방식으로 대형 급식업체에 직접 납품하는 것이 최적입니다.",
      source: "SG 2026 밸류업 내부 문건",
      isLive: true,
      data: [
        { year: "2023", "단순 원물 마진(%)": 4.8, "SG 가공 내재화 마진(%)": 4.8 },
        { year: "2024", "단순 원물 마진(%)": 4.2, "SG 가공 내재화 마진(%)": 12.5 },
        { year: "2025(E)", "단순 원물 마진(%)": 3.8, "SG 가공 내재화 마진(%)": 19.0 },
        { year: "2026(E)", "단순 원물 마진(%)": 3.5, "SG 가공 내재화 마진(%)": 25.2 }
      ]
    }
  ];

  // Merge live API widgets + new research widgets with JSON widgets
  const widgets = [...jsonWidgets, ...apiWidgets, ...newResearchWidgets];

  /* ─── Unified Chart Renderer (supports both old series and new bars/lines/areas format) ─── */
  const renderChart = (widget: any) => {

    const PALETTE = ["#8b5cf6", "#d946ef", "#ec4899", "#f43f5e", "#a855f7", "#fb7185"];
    const getMonolithicColor = (i: number) => PALETTE[i % PALETTE.length];

    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>데이터 없음</div>;

    // Determine chart type (normalize to lowercase)
    const chartType = (widget.chartType || '').toLowerCase();

    // NEW FORMAT (Claude widgets) — uses xKey, bars, lines, areas
    if (widget.xKey || widget.bars || widget.lines || widget.areas) {
      // Smart label rotation for non-numeric X-axis (Korean labels) - Forced Flat
      const isNewTextAxis = widget.xKey && d.length > 0 && typeof d[0][widget.xKey] === 'string' && isNaN(Number(d[0][widget.xKey]));
      const newTickProps = { fontSize: 10, angle: 0, textAnchor: 'middle' as const, dy: 5 };
      const newChartMargin = { top: 5, right: 30, left: -10, bottom: 10 };
      switch(chartType) {
        case "pie":
          return (
            <PieChart>
              <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={35}
                label={({name, value, percent}: any) => percent > 0.03 ? `${name} ${typeof value === 'number' ? value.toLocaleString() : value}` : ''} labelLine={false} fontSize={10}>
                {d.map((_: any, idx: number) => <Cell key={idx} fill={d[idx].fill || d[idx].color || PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
            </PieChart>
          );
        case "area":
          return (
            <AreaChart data={d} margin={newChartMargin}>
              <defs>
                {widget.areas?.map((a: any, i: number) => (
                  <linearGradient key={i} id={`sArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMonolithicColor(i)} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={getMonolithicColor(i)} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={newTickProps} minTickGap={20} tickFormatter={formatXAxis} angle={0} textAnchor="middle" />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
              {widget.areas?.map((a: any, i: number) => (
                <Area key={i} type="monotone" dataKey={a.key || a.dataKey} name={a.name || a.key || a.dataKey} stroke={a.color || a.fill || getMonolithicColor(i)} fill={`url(#sArea${widget.id}_${i})`} strokeWidth={2.5} />
              ))}
            </AreaChart>
          );
        case "bar":
          return (
            <BarChart data={d} margin={newChartMargin}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={newTickProps} minTickGap={20} tickFormatter={formatXAxis} angle={0} textAnchor="middle" />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
              {widget.bars?.map((b: any, i: number) => {
                const p = getA11yBarProps(i);
                return <Bar key={i} dataKey={b.key || b.dataKey} name={b.name || b.key || b.dataKey} fill={p.fill} color={(b.color || b.fill || getMonolithicColor(i)) || p.color} radius={[6,6,0,0]} fillOpacity={0.85} maxBarSize={40} />;
              })}
            </BarChart>
          );
        case "line":
          return (
            <LineChart data={d} margin={newChartMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={newTickProps} minTickGap={20} tickFormatter={formatXAxis} angle={0} textAnchor="middle" />
              <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
              {widget.lines?.map((l: any, i: number) => (
                <Line key={i} type="monotone" dataKey={l.key || l.dataKey} name={l.name || l.key || l.dataKey} stroke={l.color || l.fill || getMonolithicColor(i)} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </LineChart>
          );
        case "composed":
          return (
            <ComposedChart data={d} margin={newChartMargin}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={widget.xKey} stroke="#64748b" tick={newTickProps} minTickGap={20} tickFormatter={formatXAxis} scale={(widget.bars && widget.bars.length > 0) ? "band" : "auto"} angle={0} textAnchor="middle" />
              <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              {(widget.lines?.some((l:any) => l.yAxisId === 'right') || widget.bars?.some((b:any) => b.yAxisId === 'right') || widget.areas?.some((a:any) => a.yAxisId === 'right')) && (
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatYAxis} />
              )}
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize:'11px'}} />
              {widget.areas?.map((a: any, i: number) => (
                <Area key={`a${i}`} yAxisId={a.yAxisId || 'left'} type="monotone" dataKey={a.key || a.dataKey} name={a.name || a.key || a.dataKey} fill={a.color || a.fill || getMonolithicColor(i)} stroke={a.color || a.fill || getMonolithicColor(i)} fillOpacity={0.5} strokeWidth={2} />
              ))}
              {widget.bars?.map((b: any, i: number) => {
                const p = getA11yBarProps(i);
                return <Bar key={`b${i}`} yAxisId={b.yAxisId || 'left'} dataKey={b.key || b.dataKey} name={b.name || b.key || b.dataKey} fill={p.fill} color={(b.color || b.fill || getMonolithicColor(i + (widget.areas?.length || 0))) || p.color} radius={[6,6,0,0]} fillOpacity={0.85} maxBarSize={40} />;
              })}
              {widget.lines?.map((l: any, i: number) => (
                <Line key={`l${i}`} yAxisId={l.yAxisId || 'left'} type="monotone" dataKey={l.key || l.dataKey} name={l.name || l.key || l.dataKey} stroke={l.color || l.fill || getMonolithicColor(i + (widget.areas?.length || 0) + (widget.bars?.length || 0))} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
              ))}
            </ComposedChart>
          );
        default:
          return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>미지원 차트</div>;
      }
    }

    // OLD FORMAT (Gemini widgets) — uses xAxis, series[]
    const xAxis = widget.xAxis || 'Year';
    const series = widget.series || [];
    const hasRightAxis = series.some((s: any) => s.yAxisId === 'right');
    // Smart label rotation for non-numeric X-axis (Korean labels) - Forced Flat
    const isTextAxis = xAxis !== 'Year' && d.length > 0 && typeof d[0][xAxis] === 'string' && isNaN(Number(d[0][xAxis]));
    const xTickProps = { fill: '#94a3b8', fontSize: 10, angle: 0, textAnchor: 'middle' as const, dy: 5 };
    const chartMargin = { top: 20, right: 30, left: -10, bottom: 10 };

    switch(chartType) {
      case "pie":
        return (
          <PieChart>
            <Pie data={d} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"
              label={({name, value, percent}: any) => percent > 0.03 ? `${name} ${typeof value === 'number' ? value.toLocaleString() : value}` : ''} labelLine={false} fontSize={10}>
              {d.map((_: any, idx: number) => <Cell key={idx} fill={d[idx].fill || d[idx].color || PIE_COLORS[idx % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
          </PieChart>
        );
      case "line":
        return (
          <LineChart data={d} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} minTickGap={20} tickFormatter={formatXAxis} angle={0} textAnchor="middle" />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
            {series.map((s: any, i: number) => (
              <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} name={s.name || s.key || s.dataKey} stroke={s.color || s.fill || getMonolithicColor(i)} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={d} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} minTickGap={20} tickFormatter={formatXAxis} angle={0} textAnchor="middle" />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
            {series.map((s: any, i: number) => (
              <Area key={i} type="monotone" dataKey={s.dataKey} name={s.name || s.key || s.dataKey} stroke={s.color || s.fill || getMonolithicColor(i)} fill={s.color || s.fill || getMonolithicColor(i)} fillOpacity={0.5} strokeWidth={2} />
            ))}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={d} margin={chartMargin}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} minTickGap={20} tickFormatter={formatXAxis} angle={0} textAnchor="middle" />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
            {series.map((s: any, i: number) => {
              const p = getA11yBarProps(i);
              return <Bar key={i} dataKey={s.dataKey} name={s.name || s.key || s.dataKey} fill={p.fill} color={(s.color || s.fill || getMonolithicColor(i)) || p.color} radius={[6, 6, 0, 0]} />;
            })}
          </BarChart>
        );
      case "composed":
        return (
          <ComposedChart data={d} margin={chartMargin}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey={xAxis} stroke="#94a3b8" tick={xTickProps} minTickGap={20} tickFormatter={formatXAxis} scale={series.some((s:any) => s.type !== 'line' && s.type !== 'scatter') ? "band" : "auto"} angle={0} textAnchor="middle" />
            <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />
            {hasRightAxis && <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={formatYAxis} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
            {series.map((s: any, i: number) => {
              if (s.type === 'line') return <Line key={i} yAxisId={s.yAxisId || "left"} type="monotone" dataKey={s.dataKey} name={s.name || s.key || s.dataKey} stroke={s.color || s.fill || getMonolithicColor(i)} strokeWidth={2.5} dot={{r: 3}} />;
              if (s.type === 'scatter') return <Scatter key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} name={s.name || s.key || s.dataKey} fill={s.color || s.fill || getMonolithicColor(i)} />;
              const p = getA11yBarProps(i);
              return <Bar key={i} yAxisId={s.yAxisId || "left"} dataKey={s.dataKey} name={s.name || s.key || s.dataKey} fill={p.fill} color={(s.color || s.fill || getMonolithicColor(i)) || p.color} radius={[6, 6, 0, 0]} />;
            })}
          </ComposedChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>미지원 차트</div>;
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
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>오징어 전략 커맨드 센터 — {widgets?.length || 18} 위젯 · {kpiKeys?.length || 6} KPIs</p>
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

      {/* ═══ API COMMAND CENTER ═══ */}
      <section data-mobile-stack style={{ marginBottom: '3rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
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
              <AlertTriangle size={16} color="#8b5cf6" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>[기상청 API] ENSO 임계치 돌파</p>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>태평양 SST 이상 기온 지속. 공해상 조업 확대 지시가 필요합니다.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', padding: '0.8rem', background: 'var(--surface-2)', borderRadius: '6px', borderLeft: '3px solid #539df5' }}>
              <TrendingUp size={16} color="#a855f7" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>[EUMOFA API] Vigo항 단가 급등</p>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Illex 도소매 스프레드 42% 도달. B2B 직수출 최적 타이밍입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUE CHAIN FRAMEWORK ═══ */}



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
              {activePart === 'S1' && <SquidVCFishing />}
              {activePart === 'S2' && <SquidVCProcessing />}
              {activePart === 'S3' && <SquidVCLogistics />}
              {activePart === 'S4' && <SquidVCProduct />}
              {activePart === 'S5' && <SquidVCMarket />}
              {pillarWidgets.length === 0
                ? <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>이 단계에 추가 위젯이 없습니다</div>
                : pillarWidgets.map((w: any) => renderWidgetCard(w))}
            </div>
          </section>
        );
      })()}



    </div>
  );

  function renderWidgetCard(w: any) {
    const IconComp = WIDGET_ICONS[w.id] || Fish;
    const accentColor = '#ec4899'; // 오징어 테마 (Pink/Purple)
    
    // Get methodology text (supports both old "methodology" and new "logic" field)
    const methodologyText = w.logic || w.methodology || '';
    // Get situation and takeaway (supports both old and new field names)
    const situation = w.sit || w.situation || '';
    const takeaway = w.strat || w.tak || w.takeaway || '';
    
    // cardDesc 표준화
    const cardDesc = w.cardDesc || w.subtitle || methodologyText;
    // Telemetry 상태 결정
    const telemetryStatus = w.isLive || w.isLiveApi ? 'live' : (w.reliability && w.reliability < 70 ? 'static' : 'synced');
    
    return (
      <div key={w.id} className={`${styles.glassCard} ds-card`} style={{display: 'flex', flexDirection: 'column', minHeight: '600px'}}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            <IconComp size={20} color={accentColor} />
            {w.title} 
            
            <div style={{ marginLeft: '6px' }}>
              <TelemetryBadge status={telemetryStatus} syncDate={w.syncDate || '2026-05'} />
            </div>
            
            <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {w.unit && <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>(단위: {w.unit})</span>}
            </div>
          </h3>
          {cardDesc && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {cardDesc}
            </p>
          )}
        </div>

        {/* Chart Area */}
        <div style={{ height: '375px', width: '100%', marginBottom: '1.5rem', position: 'relative', zIndex: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            {renderChart(w)}
          </SafeResponsiveContainer>
        </div>

        {/* Takeaway Box (참치 TakeawayBox 컴포넌트 동기화) */}
        {(situation || takeaway) && (
          <div style={{ marginTop: 'auto' }}>
            <TakeawayBox
              situation={situation}
              takeaway={takeaway}
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
