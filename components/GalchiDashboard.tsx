// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Fish, Anchor, Globe, DollarSign, 
  Activity, AlertTriangle, ShieldCheck, AlertCircle, X, Info,
  RefreshCcw, Crosshair, MapPin, Factory, Truck, Scale, BarChart2,
  BookOpen, Workflow, Database, Zap, Ship, Target, Thermometer,
  GraduationCap, Calendar, Link, Shield, Landmark, FlaskConical,
  TrendingDown as TrendDown, Package, ShoppingCart
} from 'lucide-react';

import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css'; // Reuse the glassmorphism styles
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, getA11yBarProps } from './ChartPatterns';

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

/* ─── Custom Tooltip ─── */
const smartFormat = (v: any, dataKey?: string): string | any => {
  if (Array.isArray(v)) {
    return v.map(val => smartFormat(val, dataKey)).join(' ~ ');
  }
  if (typeof v !== 'number') return v;
  const str = v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  if (!dataKey) return str;
  const k = dataKey.toLowerCase();
  if (k.includes('마진') || k.includes('의존도') || k.includes('비율') || k.includes('방어율') || k.includes('실행율') || k.includes('도입비율') || k.includes('pct') || k.includes('ratio') || k.includes('utilrate')) return `${str}%`;
  if (k.includes('단가') || k.includes('가치') || k.includes('수익') || k.includes('절감') || k.includes('unitprice')) return `$${str}`;
  return str;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: any) => (
          <div key={index} className={styles.tooltipValue}>
            <span style={{ color: entry.color }}>■ {entry.name}</span>
            <strong>{smartFormat(entry.value, entry.dataKey)}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ["#38bdf8", "var(--color-success)", "var(--color-warning)", "var(--color-danger)", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

/* ─── KPI Color Themes ─── */
const KPI_THEMES = [
  { text: 'var(--color-success)', icon: Fish },
  { text: 'var(--color-warning)', icon: DollarSign },
  { text: 'var(--color-danger)', icon: TrendDown },
  { text: '#38bdf8', icon: Globe },
  { text: '#8b5cf6', icon: ShieldCheck },
  { text: '#06b6d4', icon: Target },
];

/* ─── Widget Icon Mapping ─── */
const WIDGET_ICONS: Record<string, any> = {
  w01: Globe, w02: Truck, w03: Ship, w04: Thermometer, w05: Globe,
  w06: GraduationCap, w07: Calendar, w08: Link, w09: Shield, w10: Landmark,
  w11: FlaskConical, w12: FlaskConical, w13: FlaskConical,
  w14: BarChart2, w15: MapPin, w16: Anchor, w17: Package,
  w18: ShoppingCart, w19: Target, w20: Globe, w22: Fish, w23: Shield,
  w24: DollarSign, w25: Globe, w26: MapPin, w27: AlertTriangle,
  w28: Target, w29: Thermometer,
  w_galchi_hs_class: Crosshair, w_galchi_multi_cost: DollarSign,
  w_kosis_cpi_spread: TrendingUp, w_mfds_safety_radar: ShieldCheck,
  w_wto_sps_radar: AlertCircle, w_oec_galchi_export: Globe,
  w_galchi_prod_risk: Globe, w_galchi_consumption: Factory,
  w_galchi_sg_valueup: TrendingUp,
  w_fta_supply_pivot: Workflow, w_fta_oman_dominance: AlertTriangle,
  w_fta_ecuador_arb: RefreshCcw, w_fta_dress_substitute: Fish,
  w_fta_unit_price: DollarSign
};

// 5-Pillar 네비게이터 메타 (Mackerel/Tuna 패턴 + 갈치 시그니처 그라디언트 emerald → teal)
const SECTIONS = [
  {
    id: "S1", num: "❶", label: "원료 수급",
    title: "🐟 Part I — 원물 생산 (Raw Material)",
    desc: "글로벌 어획량, 자원평가, 조업 효율, 총허용어획량(TAC) 관리, 기후 리스크 및 KFAS 수산과학 연구",
    ids: ["w_galchi_prod_risk","w_fta_dress_substitute","w14","w15","w16","w19","w03","w04","w29","w11","w12","w13"],
    accent: "#10b981", color: "#10b981",
    iconComp: Fish,
    pillar: "S1" as const
  },
  {
    id: "S2", num: "❷", label: "가공·생산",
    title: "🏭 Part II — 가공 산업 (Processing)",
    desc: "유통 단계별 마진 구조, 가공 전환 전략 및 B2B 급식 시장 개발",
    ids: ["w_galchi_consumption","w_galchi_sg_valueup","w02","w06","w_galchi_fbs_pelagic"],
    accent: "#14b8a6", color: "#14b8a6",
    iconComp: Factory,
    pillar: "S2" as const
  },
  {
    id: "S3", num: "❸", label: "물류·통관",
    title: "🚢 Part III — 물류 및 무역 (Logistics & Trade)",
    desc: "수출입 통관, 관세·FTA 분석, 착지원가, 교역 흐름, 대체 공급망 및 지정학 리스크",
    ids: ["w_fta_supply_pivot","w_fta_oman_dominance","w_fta_ecuador_arb","w05","w17","w20","w23","w24","w25","w08","w09","w28","w_galchi_hs_class","w_galchi_multi_cost","w_oec_galchi_export","w_galchi_kr_import_rank"],
    accent: "#0d9488", color: "#0d9488",
    iconComp: Ship,
    pillar: "S3" as const
  },
  {
    id: "S4", num: "❹", label: "판매·수요",
    title: "📈 Part IV — 판매 및 수요 (Sales & Demand)",
    desc: "가격 동향, 매입 타이밍, 도매가 스프레드, 소비 트렌드 및 내수 물가 분석",
    ids: ["w01","w07","w18","w22","w_kosis_cpi_spread","w_fta_unit_price","w_galchi_self_sufficiency","w_galchi_protein_cross"],
    accent: "#5eead4", color: "#5eead4",
    iconComp: TrendingUp,
    pillar: "S4" as const
  },
  {
    id: "S5", num: "❺", label: "ESG·지속가능성",
    title: "🌱 Part V — ESG 및 지속가능성 (Sustainability)",
    desc: "공급망 노동 리스크, OFAC/EU 제재 검증, 위생·식물위생 조치(SPS) 비관세 장벽, 식품 안전 및 정책 모니터링",
    ids: ["w26","w27","w_wto_sps_radar","w_mfds_safety_radar","w10","w_galchi_no_aqua"],
    accent: "#99f6e4", color: "#99f6e4",
    iconComp: ShieldCheck,
    pillar: "S5" as const
  },
];

export default function GalchiDashboard() {
  const [data, setData] = useState(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');
  const [liveIntel, setLiveIntel] = useState<any>(null);
  const [liveKcs, setLiveKcs] = useState<any>(null);
  const [liveKamis, setLiveKamis] = useState<any>(null);
  
  // Phase 1-3 New APIs
  const [liveComtrade, setLiveComtrade] = useState<any>(null);
  const [liveOsh, setLiveOsh] = useState<any>(null);
  const [liveOfac, setLiveOfac] = useState<any>(null);
  const [liveImportYeti, setLiveImportYeti] = useState<any>(null);
  const [liveNoaa, setLiveNoaa] = useState<any>(null);

  // Phase 1-3 New APIs (HS Ping, Tariffs, KOSIS, MFDS, WTO, OEC)
  const [liveHsPing, setLiveHsPing] = useState<any>(null);
  const [liveTariffs, setLiveTariffs] = useState<any>(null);
  const [liveKosis, setLiveKosis] = useState<any>(null);
  const [liveMfds, setLiveMfds] = useState<any>(null);
  const [liveWto, setLiveWto] = useState<any>(null);
  const [liveOec, setLiveOec] = useState<any>(null);

  useEffect(() => {
    fetch('/data/galchi_data.json?t=' + Date.now())
      .then(res => res.json())
      .then(json => { setData(json); })
      .catch(err => console.error("Failed to load galchi data", err));

    // Live API calls
    fetch('/api/galchi/intel?t=' + Date.now()).then(r => r.json()).then(setLiveIntel).catch(() => {});
    fetch('/api/galchi/kcs?t=' + Date.now()).then(r => r.json()).then(setLiveKcs).catch(() => {});
    fetch('/api/galchi/kamis?t=' + Date.now()).then(r => r.json()).then(setLiveKamis).catch(() => {});
    
    fetch('/api/galchi/comtrade?t=' + Date.now()).then(r => r.json()).then(setLiveComtrade).catch(() => {});
    fetch('/api/galchi/osh?t=' + Date.now()).then(r => r.json()).then(setLiveOsh).catch(() => {});
    fetch('/api/galchi/ofac?t=' + Date.now()).then(r => r.json()).then(setLiveOfac).catch(() => {});
    fetch('/api/galchi/importyeti?t=' + Date.now()).then(r => r.json()).then(setLiveImportYeti).catch(() => {});
    fetch('/api/galchi/noaa?t=' + Date.now()).then(r => r.json()).then(setLiveNoaa).catch(() => {});
    
    // New APIs
    fetch('/api/galchi/hsping?t=' + Date.now()).then(r => r.json()).then(setLiveHsPing).catch(() => {});
    fetch('/api/galchi/tariffs?t=' + Date.now()).then(r => r.json()).then(setLiveTariffs).catch(() => {});
    fetch('/api/galchi/kosis?t=' + Date.now()).then(r => r.json()).then(setLiveKosis).catch(() => {});
    fetch('/api/galchi/mfds?t=' + Date.now()).then(r => r.json()).then(setLiveMfds).catch(() => {});
    fetch('/api/galchi/wto?t=' + Date.now()).then(r => r.json()).then(setLiveWto).catch(() => {});
    fetch('/api/galchi/oec?t=' + Date.now()).then(r => r.json()).then(setLiveOec).catch(() => {});
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>인텔리전스 로딩 중...</p>
    </div>
  );

  let { kpis, widgets } = data;
  kpis = { ...kpis };

  if (liveKcs?.summary) {
    kpis.kpi2 = {
      title: "중국산 CIF",
      value: `$${liveKcs.summary.cifPerKg}`,
      trend: liveKcs.summary.yoy || "LIVE",
      desc: "관세청 실측 통관 단가",
      telemetry: liveKcs.isLive ? 'live' : 'synced',
      syncDate: liveKcs.lastUpdated?.slice(0, 10),
    };
    kpis.kpi4 = {
      title: "수입 의존도 (중국산 비중)",
      value: `${liveKcs.summary.cnPct}%`,
      trend: "LIVE",
      desc: `총 수입량 중 중국산 비중`,
      telemetry: liveKcs.isLive ? 'live' : 'synced',
      syncDate: liveKcs.lastUpdated?.slice(0, 10),
    };
  }

  if (liveKamis?.current) {
    kpis.kpi1 = {
      title: "위판 평균단가",
      value: `${liveKamis.current.avgPrice.toLocaleString()}`,
      trend: liveKamis.current.weekChange,
      desc: "aT KAMIS 도매 시세 · 어획 감소로 역대급 단가 형성 중",
      telemetry: liveKamis.isLive ? 'live' : 'synced',
      syncDate: liveKamis.lastUpdated?.slice(0, 10),
    };
  }

  const kpiKeys = Object.keys(kpis);
  const widgetMap: Record<string, any> = {};
  widgets?.forEach((w: any) => { widgetMap[w.id] = { ...w }; });

  // Override static data with live API data
  const applyLive = (id: string, liveApi: any) => {
    if (liveApi?.data && widgetMap[id]) {
      widgetMap[id].data = liveApi.data;
      widgetMap[id].source = liveApi.source || widgetMap[id].source;
      widgetMap[id].isLive = liveApi.isLive;
    }
  };
  
  applyLive('w25', liveComtrade);
  applyLive('w26', liveOsh);
  applyLive('w27', liveOfac);
  applyLive('w28', liveImportYeti);
  applyLive('w29', liveNoaa);

  // Inject New Live Widgets
  const newWidgets = [
    {
      id: "w_galchi_prod_risk",
      title: "글로벌 어획량 vs 한국 TAC 트렌드",
      subtitle: "FAO & USDA 연동. 자연산 의존도가 100%인 갈치의 글로벌 생산량과 한국의 총허용어획량(TAC) 트렌드를 모니터링합니다.",
      chartType: "Composed",
      xKey: "year",
      bars: [{ key: "글로벌 생산량(톤)", color: "var(--color-success)" }],
      lines: [{ key: "한국 TAC(톤)", color: "#f43f5e" }],
      sit: "글로벌 갈치 생산은 양식이 불가하여 기후 리스크에 극도로 취약합니다. 반면 한국의 갈치 TAC는 자원 회복 기조로 최근 4년간 74% 증가했습니다.",
      strat: "양식 불가능 리스크를 대비해 기후 변동에 따른 어획량 급감 전 선도거래 물량을 확보하고, 국내 증가분은 B2B 시장에 투입하여 수익성을 높이십시오.",
      source: "FAO 통계 연감 + USDA 글로벌 농업 정보 네트워크(GAIN)",
      isLive: false,
      data: [
        { year: "2020", "글로벌 생산량(톤)": 1050000, "한국 TAC(톤)": 30126 },
        { year: "2021", "글로벌 생산량(톤)": 1060000, "한국 TAC(톤)": 48908 },
        { year: "2022", "글로벌 생산량(톤)": 1068858, "한국 TAC(톤)": 48296 },
        { year: "2023", "글로벌 생산량(톤)": 1070000, "한국 TAC(톤)": 52379 }
      ]
    },
    {
      id: "w_galchi_consumption",
      title: "갈치 가공 형태별 소비 비중",
      subtitle: "KMI 동향 연동. 자급률(63.6%)이 불안정한 갈치의 국내 핵심 소비 형태인 염장 가공 구조를 분석합니다.",
      chartType: "Bar",
      xKey: "type",
      bars: [{ key: "비중(%)", color: "var(--color-warning)" }],
      sit: "국내 갈치 시장은 수입 의존도가 높으며, 전체 유통 물량의 80% 이상이 염장 혹은 염수장 형태로 1차 가공되어 판매됩니다.",
      strat: "원물 직수입 후 국내 가공 방식에서 벗어나 세네갈 등 산지에서 1차 염장 후 수입(B2B 반제품)하여 마진율을 15% 이상 추가 개선하십시오.",
      source: "KMI 동향 리포트",
      isLive: false,
      data: [
        { type: "염장 가공", "비중(%)": 80 },
        { type: "생물/냉동", "비중(%)": 20 }
      ]
    },
    {
      id: "w_galchi_sg_valueup",
      title: "SG 2026 밸류업: B2B 내재화 마진 시뮬레이션",
      subtitle: "공통 전략 문건(SG '26년 운영방안) 연동. 신라교역(어획)-신라에스지(가공) 수직계열화를 통한 순살 갈치 B2B 가공 마진율을 예측합니다.",
      chartType: "Composed",
      xKey: "year",
      bars: [{ key: "단순 원물 마진(%)", color: "#64748b" }],
      lines: [{ key: "SG 내재화 마진(%)", color: "var(--color-warning)" }],
      sit: "현재 갈치 유통은 원물 중심 단순 도매에 머물러 있어 이익률이 낮습니다. SG 2026 밸류업 전략에 따르면 신라에스지의 가공 컨트롤타워 역할 확대가 시급합니다.",
      strat: "신라교역의 갈치 원물을 신라에스지가 B2B 급식용 HMR(순살 갈치 등)로 직접 가공·납품하는 ODM 방식으로 전환하여, 전사 영업이익률을 15%p 이상 개선하십시오.",
      source: "SG 2026 밸류업 내부 문건",
      isLive: false,
      data: [
        { year: "2023", "단순 원물 마진(%)": 5.2, "SG 내재화 마진(%)": 5.2 },
        { year: "2024", "단순 원물 마진(%)": 4.8, "SG 내재화 마진(%)": 10.5 },
        { year: "2025(E)", "단순 원물 마진(%)": 4.5, "SG 내재화 마진(%)": 16.8 },
        { year: "2026(E)", "단순 원물 마진(%)": 4.0, "SG 내재화 마진(%)": 22.5 }
      ]
    },
    {
      id: "w_galchi_hs_class",
      title: "실시간 통관 HS 코드 정밀 분류 (0303.89.60.00)",
      subtitle: "HS Ping API 연동. 냉동 갈치 핵심 타겟인 0303.89.60.00 코드를 기준으로 가공 형태별 코드 검증을 수행합니다.",
      chartType: "Bar",
      xKey: "form",
      bars: [{ key: "분류 정확도(%)", color: "#38bdf8" }],
      sit: "수입 가공 형태에 따라 10자리 HS 코드가 상이하며(냉동 갈치: 0303.89.60.00), 특히 토막(cut)과 필렛 간의 오분류 통관 사고가 지속 발생합니다.",
      strat: "HS Ping 실시간 매핑으로 통관 사고 Zero화 달성. ①수입 신고 전 자동검증 프로세스 도입, ②오분류 이력 DB화로 반복 실수 차단.",
      source: "HS Ping API (실시간 HS 코드 분류 엔진)",
      isLive: liveHsPing?.isLive ?? false,
      data: liveHsPing?.data || []
    },
    {
      id: "w_galchi_multi_cost",
      title: "착지원가 실시간 스태킹 — 원산지별 MFN 10% 착지원가 시뮬레이션",
      subtitle: "Tariffs API 연동. 냉동 갈치(HS 0303.89)는 KORUS 등 어떤 FTA TRQ에도 미포함이라 전 공급국에 동일하게 일반 수입관세(MFN) 10%가 적용됩니다. 원산지별 FOB·운임·관세·통관비 누적 착지원가를 월별로 비교하여 매수 타이밍을 식별합니다. (시나리오 추정치)",
      chartType: "Composed",
      xKey: "month",
      bars: [{ key: "세네갈산 착지원가", color: "#8b5cf6" }],
      lines: [{ key: "중국산 착지원가", color: "#f43f5e" }],
      sit: "갈치는 FTA 특혜관세가 없어 세네갈·중국 모두 동일한 MFN 10%가 적용되며, 원가 차이는 관세가 아닌 FOB 단가와 해상운임에서 발생합니다(시나리오 추정). 데이터 래그를 보완해 원산지별 착지원가를 월별로 누적 비교합니다.",
      strat: "①관세 차익이 아닌 물류비(해상운임)·FOB 스프레드가 유리한 월에 산지별 선적량을 배분, ②환율 변동(CNY/KRW) 연동 시뮬레이션으로 최적 계약 시점 포착.",
      source: "Tariffs API",
      isLive: liveTariffs?.isLive ?? false,
      data: liveTariffs?.data || []
    },
    {
      id: "w_kosis_cpi_spread",
      title: "소비자 물가(CPI) vs 도매가 괴리율 분석",
      subtitle: "KOSIS API 연동. 통계청 소비자물가지수(CPI)와 KAMIS 도매가의 스프레드를 추적합니다. CPI 상승기에 도매가 전가가 지연되는 '가격 저항' 구간을 식별합니다.",
      chartType: "Composed",
      xKey: "month",
      bars: [{ key: "CPI(물가)", color: "#f97316" }],
      lines: [{ key: "도매가(KAMIS)", color: "var(--color-success)" }],
      sit: "소비자 물가(CPI) 상승기에 최종 소비 저항으로 도매가 전가가 2~3개월 지연됩니다. 이 괴리 구간이 유통 마진 압축의 핵심 리스크입니다.",
      strat: "①CPI-도매가 Spread가 15% 이상 확대 시 사전 비축 물량 방출로 이익률 극대화, ②Spread 축소 시 매입 확대하여 저가 재고 확보.",
      source: "KOSIS API (통계청 소비자물가지수) + KAMIS 도매가",
      isLive: liveKosis?.isLive ?? false,
      data: liveKosis?.data || []
    },
    {
      id: "w_mfds_safety_radar",
      title: "MFDS 수입 수산물 위생 통관 레이더",
      subtitle: "식약처(MFDS) API 연동. 수입국별 갈치 제품의 중금속·이물질·미생물 적발 건수와 통관 보류 이력을 실시간 추적합니다.",
      chartType: "Bar",
      xKey: "country",
      bars: [{ key: "적발 건수", color: "var(--color-danger)" }],
      sit: "세네갈, 남아공 등 대체 소싱처에서 중금속(Cd, Pb)/이물질 적발 빈도가 증가 중입니다. 소싱 다변화 시 위생 리스크가 동반 상승하는 트레이드오프가 존재합니다.",
      strat: "①적발 건수 3건 이상 누적 국가 대상 사전 선적 검사(PSI) 의무화, ②적발 Zero 국가에 대해 '신뢰 공급자(Trusted Vendor)' 인증 부여.",
      source: "MFDS API (식품의약품안전처 수입식품 검사 통계)",
      isLive: liveMfds?.isLive ?? false,
      data: liveMfds?.data || []
    },
    {
      id: "w_wto_sps_radar",
      title: "WTO 위생·식물위생(SPS) 비관세 장벽 발동 트렌드",
      subtitle: "WTO 데이터 포털(Data Portal) 연동. 중국·아세안의 수산물 위생검역(SPS) 조치 발동 건수를 분기별로 추적합니다. 수출 시 비관세 장벽 충격을 사전 대비합니다.",
      chartType: "Area",
      xKey: "period",
      areas: [
        { key: "중국 SPS", color: "#ec4899" },
        { key: "아세안 SPS", color: "#06b6d4" }
      ],
      sit: "중국 및 아세안의 수산물 비관세 장벽(SPS)이 분기별로 심화 추세입니다. 특히 중국은 정치적 이슈 발생 시 SPS 조치를 '비공식 제재' 수단으로 활용하는 패턴이 관측됩니다.",
      strat: "①대중국 수출 전 사전 위생 증명서(Health Certificate) 요건 모니터링 체계 가동, ②SPS 발동 급증 분기에 대체 수출 루트(일본·홍콩) 사전 확보.",
      source: "WTO 데이터 포털(Data Portal)",
      isLive: liveWto?.isLive ?? false,
      data: liveWto?.data || []
    },
    {
      id: "w_oec_galchi_export",
      title: "OEC 수출 대체시장 잠재력 분석",
      subtitle: "OEC API 연동. 경제복잡성지수(ECI) 기반 갈치 수출 대체시장(홍콩, 싱가포르, 베트남 등)의 진출 잠재력을 점수화합니다.",
      chartType: "Bar",
      xKey: "target",
      bars: [{ key: "수출 잠재력", color: "#10b981" }],
      sit: "대중국 수출 의존도가 높아 지정학적 리스크 노출이 큽니다. 일본(현재 986톤)을 제외하면 수출 다변화가 거의 진행되지 않은 상태입니다.",
      strat: "①경제 복잡성 대비 잠재력이 높은 싱가포르·홍콩 프리미엄 시장 타겟팅, ②베트남 HMR 가공 기지 활용 후 일본 재수출 삼각무역 구조 검토.",
      source: "경제 복잡성 관측소(Observatory of Economic Complexity, OEC) API",
      isLive: liveOec?.isLive ?? false,
      data: liveOec?.data || []
    },
    // ─── KMI FTA 분기별 수입동향 인사이트 (2021 Q1 ~ 2026 Q1, 21개 분기 교차분석) ───
    {
      id: "w_fta_supply_pivot",
      title: "수입국 5년 대전환 — 베네수엘라→세네갈→오만",
      subtitle: "KMI 「FTA체결국 수산물 수입동향」 2021~2025 연차 데이터. 한국 갈치 수입 1순위 공급국이 5년간 3번 교체된 공급망 단극화 궤적을 추적합니다.",
      chartType: "Composed",
      xKey: "year",
      bars: [{ key: "전체 수입(천 톤)", color: "#64748b" }],
      lines: [
        { key: "세네갈", color: "#f59e0b" },
        { key: "모로코", color: "#ec4899" },
        { key: "오만", color: "#10b981" },
        { key: "남아공", color: "#8b5cf6" },
        { key: "에콰도르", color: "#06b6d4" }
      ],
      data: [
        { year: "2021", "전체 수입(천 톤)": 16.0, "세네갈": 5.7, "모로코": 1.7, "오만": 0.0, "남아공": 0.0, "에콰도르": 0.0 },
        { year: "2022", "전체 수입(천 톤)": 13.1, "세네갈": 4.3, "모로코": 2.1, "오만": 0.0, "남아공": 0.0, "에콰도르": 1.6 },
        { year: "2023", "전체 수입(천 톤)": 14.8, "세네갈": 2.7, "모로코": 2.9, "오만": 0.4, "남아공": 0.3, "에콰도르": 2.8 },
        { year: "2024", "전체 수입(천 톤)": 13.5, "세네갈": 2.8, "모로코": 1.9, "오만": 3.0, "남아공": 1.2, "에콰도르": 0.4 },
        { year: "2025", "전체 수입(천 톤)": 13.4, "세네갈": 2.8, "모로코": 1.2, "오만": 4.2, "남아공": 2.5, "에콰도르": 0.3 }
      ],
      sit: "갈치 수입 1순위 공급국이 5년 사이 베네수엘라(2021 13.3%) → 세네갈(2022 33.2%) → 모로코·세네갈·에콰도르 3분할(2023) → 오만 단극화(2025 32.8%)로 재편됨. 동일 기간 전체 수입은 16.0→13.4천 톤(-16.3%)으로 축소되었지만 공급국 집중도(HHI)는 오히려 상승하여 단일 산지 충격에 더 취약해진 구조.",
      strat: "오만 의존도가 30%를 돌파한 시점이므로 ①남아공·세네갈을 묶어 2순위 공급권(Backup Tier)으로 등급화하고 연간 3,000톤 이상 의무 계약량 확보, ②예멘·홍해 안보 리스크 모니터링 KPI 신설하여 오만 출항 지연 3주 이상 시 즉시 남아공 콜로 전환 발동, ③수입원 다각화 비율을 50:30:20 헷지 한도로 IR에 표준 지표로 공시.",
      source: "KMI 자유무역협정 이행에 따른 어업인등 지원센터 「FTA체결국 수산물 수입동향」 2021Q4·2022Q4·2023Q4·2024Q4·2025Q4 분기보고서 교차집계",
      isLive: false,
      syncDate: "2026-02"
    },
    {
      id: "w_fta_oman_dominance",
      title: "오만 +154% — 2026 1분기 단극화 가속",
      subtitle: "KMI 「FTA체결국 수산물 수입동향 2026 Q1」. 2025 1분기 대비 2026 1분기 국가별 수입량을 직접 비교하여 단극화 속도를 정량화합니다.",
      chartType: "Bar",
      xKey: "country",
      bars: [
        { key: "25년 1Q", color: "#64748b" },
        { key: "26년 1Q", color: "#10b981" }
      ],
      data: [
        { country: "전체", "25년 1Q": 2.0, "26년 1Q": 3.1 },
        { country: "오만", "25년 1Q": 0.6, "26년 1Q": 1.5 },
        { country: "남아공", "25년 1Q": 0.4, "26년 1Q": 0.7 },
        { country: "일본", "25년 1Q": 0.1, "26년 1Q": 0.2 },
        { country: "중국", "25년 1Q": 0.2, "26년 1Q": 0.2 }
      ],
      sit: "2026 1분기 갈치 수입은 전년 동기 대비 +52.1%(2.0→3.1천 톤) 회복. 그러나 회복분의 80% 이상이 오만 단일 산지(+154.4%, 0.6→1.5천 톤)에서 나오면서 분기 단위 점유율이 48%까지 직행. 동시에 일본산 +196.8%(0.1→0.2천 톤) — 절대량은 작지만 신선·냉장 채널 침투 신호로 해석.",
      strat: "①오만 분기 점유율이 40% 이상 유지될 경우 단일 공급원 충격 시 30% 이상 가격 spike에 노출되므로 분기마다 남아공 톤수를 의무적으로 25% 이상 확보하는 헷지룰 도입, ②일본산 +196.8% 신호를 활용해 회전초밥·횟감 채널 ODM 진입(소매가 +40% 프리미엄 포지셔닝), ③오만 단가 $7 돌파 시점에 자동으로 남아공·세네갈로 비중을 전환하는 동적 소싱 알고리즘 가동.",
      source: "KMI 「FTA체결국 수산물 수입동향 2026 Q1」 — 갈치 국가별 수입량 표 (2026-04 발간)",
      isLive: false,
      syncDate: "2026-04"
    },
    {
      id: "w_fta_ecuador_arb",
      title: "에콰도르 경유무역 — 한국→중국 재수출 갈치",
      subtitle: "KMI 2023 Q4 보고서 본문 인용: \"에콰도르산 갈치는 대부분 우리나라에서 소비되지 않고 중국으로 재수출\". 2022~2025년 에콰도르산 수입량 추이로 페이크 트레이드 규모를 추정합니다.",
      chartType: "Bar",
      xKey: "year",
      bars: [{ key: "에콰도르 수입(천 톤)", color: "#06b6d4" }],
      data: [
        { year: "2021", "에콰도르 수입(천 톤)": 0.0 },
        { year: "2022", "에콰도르 수입(천 톤)": 1.6 },
        { year: "2023", "에콰도르 수입(천 톤)": 2.8 },
        { year: "2024", "에콰도르 수입(천 톤)": 0.4 },
        { year: "2025", "에콰도르 수입(천 톤)": 0.3 }
      ],
      sit: "에콰도르산 갈치는 2022년 처음 1.6천 톤 진입 → 2023년 2.8천 톤(19.2% 점유 3위)으로 정점 → 2024-25년 0.3~0.4천 톤으로 급감. KMI 2023Q4·2024Q3 보고서가 \"한국에서 소비되지 않고 중국으로 재수출되는 물량\"이라 명시했으며 2024년 중국의 직수입 확대로 환적 수요가 자연 소멸함.",
      strat: "①에콰도르산 KCS 통관량은 실제 한국 내수 수요가 아니므로 자체 시장 추정 모델에서 즉시 deflate 처리(2023년 기준 -19%p 노이즈), ②중국 재수출 마진($0.3~0.5/kg 추정)을 직접 포착하기 위한 한국→중국 콜드체인 환적 게이트웨이 사업성 분석, ③환적 매출은 영업이익률이 단순 환산 수입의 3배 이상이므로 釜山港 보세창고 활용한 transit trade 신규 라인 검토.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2023Q4 본문 + 2022Q4·2024Q3 갈치 국가별 표",
      isLive: false,
      syncDate: "2026-02"
    },
    {
      id: "w_fta_dress_substitute",
      title: "드레스 갈치 대체축 — 세네갈→남아공 시프트",
      subtitle: "KMI 2024 Q3·2025 Q2 보고서 본문 인용: \"남아공산은 세네갈산 드레스 갈치를 대체하며 수입 증가\". 드레스(원물 1차처리) 카테고리의 산지 다변화 궤적입니다.",
      chartType: "Composed",
      xKey: "year",
      lines: [
        { key: "세네갈(드레스 원산지)", color: "#f59e0b" },
        { key: "남아공(대체재)", color: "#8b5cf6" }
      ],
      data: [
        { year: "2022", "세네갈(드레스 원산지)": 4.3, "남아공(대체재)": 0.0 },
        { year: "2023", "세네갈(드레스 원산지)": 2.7, "남아공(대체재)": 0.3 },
        { year: "2024", "세네갈(드레스 원산지)": 2.8, "남아공(대체재)": 1.2 },
        { year: "2025", "세네갈(드레스 원산지)": 2.8, "남아공(대체재)": 2.5 }
      ],
      sit: "세네갈 드레스 갈치는 2022년 4.3천 톤에서 2023년 2.7천 톤(-37%)으로 어획 부진에 따라 급감 후 2024-25년 2.8천 톤에서 정체. 그 공백을 남아공산이 2년 만에 0→2.5천 톤(+8배)으로 메움. 두 국가 단가가 모두 $4~4.5/kg 수준에서 거의 동일하게 형성되어 \"드레스 카테고리는 산지가 바뀌어도 가격은 일정\"한 동질재로 정착.",
      strat: "①남아공 공급사를 Trusted Vendor 1순위로 등급화하고 사이즈별(500g 이상) 카테고리를 우선 계약 조건에 명시, ②세네갈은 보조 공급선으로 유지하되 어획 부진 사이클(2년 주기)에 대비한 의무 비축량(3개월 분) 설정, ③드레스 가공 사양을 한국 표준화하여 신규 산지(나미비아·앙골라) 진입 시 교체 비용 최소화.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2024Q3·2024Q4·2025Q2·2025Q4 갈치 본문 + 국가별 표",
      isLive: false,
      syncDate: "2026-02"
    },
    {
      id: "w_fta_unit_price",
      title: "냉동 갈치 산지별 단가 ($/kg)",
      subtitle: "KMI 분기보고서 「냉동 갈치 수입단가 추이」 차트 (HSK 0303.89.20.00). 산지별 분기 단가 수렴·이탈 구간을 식별하여 매수 타이밍을 도출합니다.",
      chartType: "Composed",
      xKey: "quarter",
      lines: [
        { key: "오만", color: "#10b981" },
        { key: "세네갈", color: "#f59e0b" },
        { key: "모로코", color: "#ec4899" },
        { key: "남아공", color: "#8b5cf6" }
      ],
      data: [
        { quarter: "24-Q1", "오만": 4.0, "세네갈": 4.4, "모로코": 4.5, "남아공": 4.0 },
        { quarter: "24-Q2", "오만": 4.0, "세네갈": 4.3, "모로코": 4.4, "남아공": 4.0 },
        { quarter: "24-Q3", "오만": 4.2, "세네갈": 4.2, "모로코": 4.3, "남아공": 4.2 },
        { quarter: "24-Q4", "오만": 4.1, "세네갈": 4.4, "모로코": 4.2, "남아공": 4.0 },
        { quarter: "25-Q1", "오만": 5.4, "세네갈": 4.0, "모로코": 4.5, "남아공": 4.2 },
        { quarter: "25-Q2", "오만": 6.2, "세네갈": 4.0, "모로코": 5.3, "남아공": 4.5 },
        { quarter: "25-Q3", "오만": 6.9, "세네갈": 5.7, "모로코": 5.6, "남아공": 5.8 },
        { quarter: "25-Q4", "오만": 7.2, "세네갈": 5.8, "모로코": 5.6, "남아공": 5.4 },
        { quarter: "26-Q1", "오만": 9.1, "세네갈": 6.1, "모로코": 6.0, "남아공": 5.8 }
      ],
      sit: "2024년 4국 단가는 $4.0~4.5/kg 좁은 밴드에서 거의 수렴 — 사실상 동질재 시장. 그러나 2025년부터 오만이 단독 상승하여 2026 1분기 $9.1/kg 도달, 세네갈·남아공($5.8~6.1) 대비 +50% 프리미엄 형성. 한국 수요 집중 + 오만 어획 부진 + 환율 영향의 복합 결과로, \"단극화는 단가 spike로 직결\"되는 인과 검증.",
      strat: "①오만 단가가 $7 돌파 시 자동으로 세네갈·남아공 비중을 25% → 50% 이상으로 전환하는 동적 소싱 룰 KPI화, ②단가 $4.5/kg 이하 구간(주로 1-2분기)에서 분기 매수 비중 30% 이상 전진 배치하여 평균 단가 락-인, ③5월 성수기 진입 전 6개월 선도(forward) 계약으로 spike 헷지 — 2026년 기준 약 4.5억 원 마진 방어 가능.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2024Q4·2025Q4·2026Q1 — 냉동 갈치 수입단가 추이 차트 (관세청 HSK 0303.89.20.00 기반)",
      isLive: false,
      syncDate: "2026-04"
    }
  ];

  newWidgets.forEach(w => { widgetMap[w.id] = w; });

  /* ─── Chart Renderer ─── */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>데이터 없음</div>;

    const formatVal = (v: any) => {
      if (typeof v !== 'number') return v;
      return v % 1 === 0 ? v.toLocaleString() : v.toLocaleString(undefined, { maximumFractionDigits: 3 });
    };

    switch(widget.chartType) {
      case "Area":
        return (
          <AreaChart data={d}>
            <defs>
              {widget.areas?.map((a: any, i: number) => (
                <linearGradient key={i} id={`mArea${widget.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={a.color} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={a.color} stopOpacity={0.05}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} minTickGap={20} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" height={36} />
            {widget.areas?.map((a: any, i: number) => (
              <Area key={i} type="monotone" dataKey={a.key} stroke={a.color} fill={`url(#mArea${widget.id}_${i})`} strokeWidth={2.5} stackId={widget.stacked ? 'stack1' : undefined} />
            ))}
          </AreaChart>
        );
      case "Bar":
        return (
          <BarChart data={d}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} minTickGap={20} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" height={36} />
            {widget.bars?.map((b: any, i: number) => {
              const p = getA11yBarProps(i);
              return <Bar key={i} dataKey={b.key} fill={p.fill} color={b.color || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
            })}
          </BarChart>
        );
      case "Composed":
        return (
          <ComposedChart data={d}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} minTickGap={20} />
            <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            {widget.dualAxis && (
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            )}
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{fontSize:'11px'}} verticalAlign="top" height={36} />
            {widget.bars?.map((b: any, i: number) => {
              const p = getA11yBarProps(i);
              return <Bar key={i} yAxisId={b.yAxisId || "left"} dataKey={b.key} fill={p.fill} color={b.color || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
            })}
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
            ))}
          </ComposedChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>지원 안 되는 차트</div>;
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
              background: 'var(--color-success)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Fish size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                갈치 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>최고경영진 브리핑 — {widgets?.length || 0}개 위젯 · {kpiKeys.length}개 KPI · 17개 데이터 소스</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #1ed760', animation: 'pulse 2s infinite' }} />
            <span><span style={{ color: 'var(--color-success)' }}>Forensic v2</span> · 관세청·해수부·FAO 교차검증</span>
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {kpiKeys.map((key, idx) => {
          const kpi = kpis[key];
          const theme = KPI_THEMES[idx % KPI_THEMES.length];
          const IconComp = theme.icon;
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', maxWidth: '75%', lineHeight: '1.2' }}>{kpi.title}</span>
                {kpi.telemetry ? <TelemetryBadge status={kpi.telemetry} syncDate={kpi.syncDate} /> : <IconComp size={14} style={{ color: theme.text }} />}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {(() => {
                  const parsed = parseAnimatedValue(kpi.value);
                  return parsed ? (
                    <CountUp end={parsed.numberVal} duration={2} separator="," decimals={parsed.decimals} prefix={parsed.prefix} suffix={parsed.suffix} />
                  ) : kpi.value;
                })()}
              </div>
              <div style={{ fontSize: '0.68rem', color: theme.text, fontWeight: 600 }}>
                <span style={{ background: `${theme.text}20`, padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>{kpi.trend}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{kpi.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Live Intelligence Ticker ═══ */}
      {(liveIntel || liveKcs || liveKamis) && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Zap size={14} color="var(--color-success)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>실시간 인텔리전스 피드</span>
            {(liveIntel?.exchange?.isLive || liveKcs?.isLive || liveKamis?.isLive) && (
              <span style={{ fontSize: '0.65rem', color: 'var(--color-success)', background: 'rgba(30,215,96,0.1)', padding: '2px 8px', borderRadius: '500px', fontWeight: 700 }}>● LIVE</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {/* Exchange Rate */}
            {liveIntel?.exchange && (
              <div className="ds-card" style={{ background: '#181818', borderRadius: '8px', padding: '1rem', boxShadow: 'rgba(0,0,0,0.3) 0px 4px 8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#7c7c7c', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={12} /> USD/KRW
                  {liveIntel.exchange.isLive && <span style={{ color: 'var(--color-success)', fontSize: '0.6rem' }}>●</span>}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>₩{liveIntel.exchange.usdKrw?.toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>CNY/KRW ₩{liveIntel.exchange.cnyKrw}</div>
              </div>
            )}
            {/* Landing Cost */}
            {liveIntel?.landingCost && (
              <div className="ds-card" style={{ background: '#181818', borderRadius: '8px', padding: '1rem', boxShadow: 'rgba(0,0,0,0.3) 0px 4px 8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#7c7c7c', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Package size={12} /> 중국산 착지원가
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f97316' }}>₩{liveIntel.landingCost.landedKrw?.toLocaleString()}<span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/kg</span></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '2px' }}>위판가 대비 +{liveIntel.landingCost.spreadPct}% 스프레드</div>
              </div>
            )}
            {/* KCS Import */}
            {liveKcs?.summary && (
              <div className="ds-card" style={{ background: '#181818', borderRadius: '8px', padding: '1rem', boxShadow: 'rgba(0,0,0,0.3) 0px 4px 8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#7c7c7c', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Ship size={12} /> 수입 현황
                  {liveKcs.isLive && <span style={{ color: 'var(--color-success)', fontSize: '0.6rem' }}>●</span>}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#8b5cf6' }}>{(liveKcs.summary.totalWgt / 1000).toFixed(1)}K<span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>톤</span></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>중국 {liveKcs.summary.cnPct}% · CIF ${liveKcs.summary.cifPerKg}/kg</div>
              </div>
            )}
            {/* KAMIS Wholesale */}
            {liveKamis?.current && (
              <div className="ds-card" style={{ background: '#181818', borderRadius: '8px', padding: '1rem', boxShadow: 'rgba(0,0,0,0.3) 0px 4px 8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#7c7c7c', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShoppingCart size={12} /> 도매가
                  {liveKamis.isLive && <span style={{ color: 'var(--color-success)', fontSize: '0.6rem' }}>●</span>}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-success)' }}>₩{liveKamis.current.avgPrice?.toLocaleString()}<span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/kg</span></div>
                <div style={{ fontSize: '0.75rem', color: liveKamis.current.weekChange?.startsWith('+') ? 'var(--color-success)' : 'var(--color-danger)', marginTop: '2px' }}>주간 {liveKamis.current.weekChange}</div>
              </div>
            )}
            {/* Macro Risk */}
            {liveIntel?.macroRisk && (
              <div className="ds-card" style={{ background: '#181818', borderRadius: '8px', padding: '1rem', boxShadow: 'rgba(0,0,0,0.3) 0px 4px 8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#7c7c7c', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Activity size={12} /> 환율 리스크
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: liveIntel.macroRisk.riskLevel === 'HIGH' ? 'var(--color-danger)' : liveIntel.macroRisk.riskLevel === 'MEDIUM' ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  {liveIntel.macroRisk.riskLevel}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{liveIntel.macroRisk.costImpactPerKg} 원가 변동</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ AI Chatbot (NotebookLM Link) ═══ */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="ds-card" style={{background: '#181818', 
          padding: '1.5rem', borderRadius: '8px', 
          boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem', flexWrap: 'wrap'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '50%', flexShrink: 0 }}>
              <Database size={24} color="var(--color-success)" />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.4rem 0', fontSize: '1.13rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="var(--color-success)" /> 갈치 지식 AI 챗봇 (NotebookLM)
              </h3>
            </div>
          </div>
          <a href="https://notebooklm.google.com/notebook/73bd95c4-e9f8-49f3-aa90-1e907a3e1b00" target="_blank" rel="noreferrer" style={{ 
            background: 'var(--text-primary)', color: 'var(--bg-color)', 
            padding: '12px 32px', borderRadius: '500px', fontSize: '0.88rem', fontWeight: 700, 
            textTransform: 'uppercase', letterSpacing: '1.4px', textDecoration: 'none', 
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.1s', whiteSpace: 'nowrap'
          }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Activity size={18} /> 챗봇 시작하기
          </a>
        </div>
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
        const SecIcon = sec.iconComp;
        const sectionWidgets = sec.ids.map(id => widgetMap[id]).filter(Boolean);
        return (
          <section>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <div style={{ width: '4px', height: '28px', borderRadius: '2px', background: sec.accent }} />
                <SecIcon size={22} color={sec.accent} />
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sec.title}</h2>
                <span style={{ fontSize: '0.7rem', color: sec.accent, background: `${sec.accent}15`, padding: '3px 10px', borderRadius: '500px', fontWeight: 600 }}>
                  {sectionWidgets.length}
                </span>
              </div>
              <p style={{ margin: '0 0 0 16px', fontSize: '0.82rem', color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>{sec.desc}</p>
            </div>
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {sectionWidgets.length === 0
                ? <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>이 단계에 위젯이 없습니다</div>
                : sectionWidgets.map((w: any) => renderWidgetCard(w, sec.accent, sec.pillar))}
            </div>
          </section>
        );
      })()}

    </div>
  );

  function renderWidgetCard(w: any, accentColor: string, pillar: 'S1'|'S2'|'S3'|'S4'|'S5') {
    const IconComp = WIDGET_ICONS[w.id] || Anchor;
    // 정직 telemetry (L-09): 진짜 라이브는 라우트 fetch 성공(w.isLive===true)일 때만 LIVE.
    // 정적 위젯은 JSON telemetry 필드(STATIC) 존중, 그 외엔 SYNCED.
    const status: 'LIVE' | 'SYNCED' | 'STATIC' =
      w.isLive === true ? 'LIVE'
      : (typeof w.telemetry === 'string' && w.telemetry.toUpperCase() === 'STATIC') ? 'STATIC'
      : 'SYNCED';

    return (
      <WidgetCard key={w.id}
        title={w.title}
        icon={IconComp}
        iconColor={accentColor}
        pillar={pillar}
        cardDesc={w.subtitle || ''}
        telemetry={{ status, syncDate: w.syncDate || 'KFAS 2024' }}
        chartHeight={375}
        chart={renderChart(w)}
        takeaway={{
          situation: w.sit || '',
          actionPlan: w.strat || '',
          source: w.source || 'KFAS / KMI / FAOSTAT',
        }} />
    );
  }
}
