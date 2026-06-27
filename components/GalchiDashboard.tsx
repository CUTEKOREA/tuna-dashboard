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
import { TelemetryBadge } from './TelemetryBadge';

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

// 갈치 API 연동 채널 — useEffect fetch 루프와 헤더 카운트가 이 목록을 단일 출처로 공유 (패턴 I: 하드코딩 카운트 금지)
const GALCHI_API_PATHS = [
  'intel', 'kcs', 'kamis', 'comtrade', 'osh', 'ofac', 'importyeti',
  'noaa', 'hsping', 'tariffs', 'kosis', 'mfds', 'wto', 'oec',
] as const;

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

    // Live API calls — GALCHI_API_PATHS 단일 목록 순회 (헤더 API 채널 카운트와 동기화)
    const setters: Record<string, (v: any) => void> = {
      intel: setLiveIntel, kcs: setLiveKcs, kamis: setLiveKamis,
      comtrade: setLiveComtrade, osh: setLiveOsh, ofac: setLiveOfac,
      importyeti: setLiveImportYeti, noaa: setLiveNoaa,
      hsping: setLiveHsPing, tariffs: setLiveTariffs, kosis: setLiveKosis,
      mfds: setLiveMfds, wto: setLiveWto, oec: setLiveOec,
    };
    GALCHI_API_PATHS.forEach(path => {
      fetch(`/api/galchi/${path}?t=` + Date.now())
        .then(r => r.json())
        .then(setters[path])
        .catch(() => {});
    });
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>인텔리전스 로딩 중...</p>
    </div>
  );

  let { kpis, widgets } = data;
  kpis = { ...kpis };

  // ✅ KCS(HSK 0303.89-2000 냉동 갈치, 검증 완료 2026-06-11) 파생 KPI 주입 복원.
  // 관세청 nitemtrade 품목명(statKor) "갈치" 확인 — 구 0303899060(아귀) 폐기.
  if (liveKcs?.summary?.cifPerKg) {
    const kcsYear = liveKcs.year || "2025";
    const prevYr = liveKcs.yearly?.find((y: any) => y.year === String(Number(kcsYear) - 1));
    const cifTrend = prevYr?.cifPerKg
      ? `${liveKcs.summary.cifPerKg >= prevYr.cifPerKg ? "+" : ""}${Math.round((liveKcs.summary.cifPerKg / prevYr.cifPerKg - 1) * 1000) / 10}%`
      : "—";
    kpis.kpi2 = {
      title: "수입 단가(CIF)",
      value: `$${liveKcs.summary.cifPerKg}`,
      trend: cifTrend,
      desc: `USD/kg · 관세청 HSK 0303.89-2000 (${kcsYear}) — HSK 검증 완료`,
      telemetry: liveKcs.isLive ? 'live' : 'static',
      syncDate: liveKcs.lastUpdated?.slice(0, 10),
    };
    const auctionTons2025 = 31400; // 해수부 위판통계 2025 위판중량(톤)
    const depPct = Math.round(liveKcs.summary.totalWgt / (liveKcs.summary.totalWgt + auctionTons2025) * 1000) / 10;
    kpis.kpi4 = {
      title: "수입 의존도",
      value: `${depPct}%`,
      trend: `중국 ${liveKcs.summary.cnPct}%`,
      desc: `${kcsYear}년 수입 ${Math.round(liveKcs.summary.totalWgt).toLocaleString()}톤÷(위판 31,400톤+수입) · HSK 검증 완료`,
      telemetry: liveKcs.isLive ? 'live' : 'static',
      syncDate: liveKcs.lastUpdated?.slice(0, 10),
    };
  }

  if (liveKamis?.current) {
    kpis.kpi1 = {
      title: "도매 평균단가(KAMIS)",
      value: `${liveKamis.current.avgPrice.toLocaleString()}`,
      trend: liveKamis.current.weekChange,
      desc: "aT KAMIS 도매 시세 (원/kg) — 위판(산지 경매) 단가와 구분",
      telemetry: liveKamis.isLive ? 'live' : 'static',
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
  applyLive('w28', liveImportYeti);
  applyLive('w29', liveNoaa);

  // _liveState: fetch-driven 위젯의 telemetry 동적 결정용 (L-09)
  // fetch 성공 시 SYNCED/LIVE, 실패(null) 시 STATIC 표기
  ['w25','w28','w29'].forEach(id => {
    if (widgetMap[id]) {
      const liveMap: Record<string,any> = { w25: liveComtrade, w28: liveImportYeti, w29: liveNoaa };
      widgetMap[id]._liveState = liveMap[id];
    }
  });

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
      source: "SG 2026 밸류업 내부 문건 (2025E·2026E는 시나리오 추정치, illustrative)",
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
      title: "통관 HS 코드 정밀 분류 — 가공 형태별 검증",
      subtitle: "자체 분류 기준(HS Ping 로컬 DB) — 가공 형태별 분류 정확도 검증. 냉동 갈치 원물의 10자리 HSK는 0303.89-2000으로 확정(관세청 품목명 '갈치' 검증, 2026-06-11).",
      chartType: "Bar",
      xKey: "form",
      bars: [{ key: "conf", name: "분류 정확도(%)", color: "#38bdf8" }],
      sit: "수입 가공 형태(통·토막·순살·건염장)에 따라 10자리 HS 코드가 상이하며, 토막과 순살 간 오분류 통관 사고가 지속 발생합니다. 냉동 갈치 원물은 HSK 0303.89-2000으로 확정 — 유사 코드 0303.89-9060(아귀)·0303.89-6000(학꽁치)과의 혼동이 실제 오귀속 사고 사례입니다.",
      strat: "①수입 신고 전 자동검증 프로세스 도입, ②오분류 이력 DB화로 반복 실수 차단. 냉동 원물은 0303.89-2000, 신선·냉장은 0302.89-2000을 표준 코드로 고정하고 신규 신고 건은 관세사 이중 검증을 거치십시오.",
      source: "HS Ping 로컬 DB (가공 형태별 HS 코드 내부 매핑표)",
      isLive: liveHsPing?.isLive ?? false,
      data: liveHsPing?.data || [],
      _liveState: liveHsPing,
    },
    {
      id: "w_galchi_multi_cost",
      title: "착지원가 실시간 스태킹 — 원산지별 MFN 10% 착지원가 시뮬레이션",
      subtitle: "관세청 HSK 0303.89-2000 실측 월별 CIF(2025) × 환율 1,380원 가정 + MFN 10% + 통관비 50원/kg 누적 착지원가. 냉동 갈치는 KORUS 등 어떤 FTA TRQ에도 미포함이라 전 공급국에 동일하게 일반 수입관세(MFN) 10%가 적용됩니다.",
      chartType: "Composed",
      xKey: "month",
      bars: [{ key: "세네갈산 착지원가", color: "#8b5cf6" }],
      lines: [{ key: "중국산 착지원가", color: "#f43f5e" }],
      sit: "갈치는 FTA 특혜관세가 없어 세네갈·중국 모두 동일한 MFN 10%가 적용됩니다. 2025년 실측 CIF 기준 중국산 착지원가는 월 평균 8,000원/kg대, 세네갈산은 5,900원/kg대로 중국산이 일관되게 높습니다 — 과거 '중국산 저가' 가정은 아귀 코드 오귀속의 산물로 폐기.",
      strat: "①세네갈산 CIF 저점 월(5~6월, 10월)에 선적량을 전진 배분, ②중국산은 소량 프리미엄 규격 전용으로 별도 단가 협상, ③환율 변동(USD/KRW) 연동 시뮬레이션으로 최적 계약 시점 포착.",
      source: "관세청 HSK 0303.89-2000 월별 실측 CIF (2025, 검증 완료 2026-06-11) + MFN 10% + 통관비 50원/kg (환율 1,380원 가정)",
      isLive: liveTariffs?.isLive ?? false,
      data: liveTariffs?.data || [],
      _liveState: liveTariffs,
    },
    {
      id: "w_kosis_cpi_spread",
      title: "소비자 물가(CPI) vs 도매가 괴리율 분석",
      subtitle: "통계청 CPI(KOSIS)와 KAMIS 도매가 스프레드 분석. CPI 상승기에 도매가 전가가 지연되는 '가격 저항' 구간을 식별합니다. (KOSIS API 연결 확인 중 — 현재 로컬 표본 표시)",
      chartType: "Composed",
      xKey: "month",
      bars: [{ key: "CPI(물가)", color: "#f97316" }],
      lines: [{ key: "도매가(KAMIS)", color: "var(--color-success)" }],
      sit: "소비자 물가(CPI) 상승기에 최종 소비 저항으로 도매가 전가가 2~3개월 지연됩니다. 이 괴리 구간이 유통 마진 압축의 핵심 리스크입니다.",
      strat: "①CPI-도매가 Spread가 15% 이상 확대 시 사전 비축 물량 방출로 이익률 극대화, ②Spread 축소 시 매입 확대하여 저가 재고 확보.",
      source: "통계청 소비자물가지수(KOSIS) + KAMIS 도매가 (KOSIS API 연결 확인 중, 현재 표본 데이터)",
      isLive: liveKosis?.isLive ?? false,
      data: liveKosis?.data || [],
      _liveState: liveKosis,
    },
    {
      id: "w_mfds_safety_radar",
      title: "원산지별 수입 검역·비관세 비용",
      subtitle: "USDA GAIN 2024 착지원가 — 갈치 수입 시 원산지별 검역·비관세 비용($/MT) 비교.",
      chartType: "Bar",
      xKey: "country",
      bars: [{ key: "검역·비관세비용($/MT)", color: "var(--color-danger)" }],
      sit: "서아프리카(세네갈) 대체 소싱처는 콜드체인·검역 비용이 톤당 $250로 중국산($150)의 1.7배입니다. 소싱 다변화 시 위생·검역 비용이 동반 상승하는 트레이드오프가 존재합니다.",
      strat: "①서아프리카 원물은 선적 전 검사(PSI)로 반송 리스크 차단, ②검역비 상승분을 상쇄할 FOB 단가 우위($2,400 vs $2,750)가 확보될 때만 투입.",
      source: "USDA GAIN Korea Seafood 2024 Table 6 (검역·비관세 비용)",
      isLive: liveMfds?.isLive ?? false,
      data: liveMfds?.data || [],
      _liveState: liveMfds,
    },
    {
      id: "w_wto_sps_radar",
      title: "갈치 수입 관세 구조 — 전 원산지 MFN 10%",
      subtitle: "갈치(HS 0303)는 한-중·한-아세안 FTA 양허 제외 품목 — 전 공급국 기본관세 10% 동일 적용.",
      chartType: "Bar",
      xKey: "country",
      bars: [
        { key: "기본관세율(%)", color: "#ec4899" }
      ],
      sit: "갈치는 FTA TRQ 미적용으로 중국·세네갈·오만 등 전 공급국에 기본관세 10%가 동일 적용됩니다. 원산지 전환만으로는 관세를 줄일 수 없는 구조입니다.",
      strat: "①관세로는 원가 차별화가 불가하므로 FOB 단가·운임·검역비 등 비관세 원가에서 우위 확보, ②세네갈산은 운임 부담으로 착지원가가 중국산보다 높은 점을 매입 단가 협상에 반영.",
      source: "USDA GAIN Korea Seafood 2024 Table 6 + WITS (갈치 HS 0303 MFN 10%, FTA 양허제외)",
      isLive: liveWto?.isLive ?? false,
      data: liveWto?.data || [],
      _liveState: liveWto,
    },
    {
      id: "w_oec_galchi_export",
      title: "글로벌 갈치 수출 경쟁 구도",
      subtitle: "UN Comtrade 글로벌 갈치(HS 030389) 국가별 수출액($M) — 한국의 수출 경쟁 포지션.",
      chartType: "Bar",
      xKey: "target",
      bars: [{ key: "수출액($M)", color: "#10b981" }],
      sit: "글로벌 갈치 수출은 중국이 $185M로 압도하며, 한국은 $20M의 소규모 수출국입니다. 세네갈($55M)·대만($35M)이 신흥 수출 경쟁국으로 부상 중입니다.",
      strat: "①물량 경쟁이 아닌 프리미엄(선동결·구이용 가공) 차별화로 일본·홍콩 고가 시장 공략, ②베트남 HMR 가공 기지 활용 후 일본 재수출 삼각무역 구조 검토.",
      source: "UN Comtrade 글로벌 갈치(HS 030389) 수출 (galchi_data w25 교차)",
      isLive: liveOec?.isLive ?? false,
      data: liveOec?.data || [],
      _liveState: liveOec,
    },
    // ─── KMI FTA 분기별 수입동향 인사이트 (2021 Q1 ~ 2026 Q1, 21개 분기 교차분석) ───
    {
      id: "w_fta_supply_pivot",
      title: "수입국 5년 대전환 — 세네갈→모로코→오만",
      subtitle: "KMI 「FTA체결국 수산물 수입동향」 2021~2025 연차 데이터. 한국 갈치 수입 1순위 공급국이 5년간 두 차례 교체된 공급망 단극화 궤적을 추적합니다.",
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
        { year: "2021", "전체 수입(천 톤)": 15.5, "세네갈": 5.2, "모로코": 2.1, "오만": 1.2, "남아공": 0.7, "에콰도르": 1.3 },
        { year: "2022", "전체 수입(천 톤)": 13.1, "세네갈": 4.3, "모로코": 2.1, "오만": 1.3, "남아공": 0.9, "에콰도르": 1.6 },
        { year: "2023", "전체 수입(천 톤)": 14.8, "세네갈": 3.0, "모로코": 3.4, "오만": 2.3, "남아공": 1.0, "에콰도르": 1.3 },
        { year: "2024", "전체 수입(천 톤)": 13.5, "세네갈": 2.3, "모로코": 2.3, "오만": 3.0, "남아공": 1.9, "에콰도르": 0.8 },
        { year: "2025", "전체 수입(천 톤)": 13.4, "세네갈": 2.8, "모로코": 1.2, "오만": 4.2, "남아공": 2.5, "에콰도르": 0.0 }
      ],
      sit: "갈치 수입 1순위 공급국이 5년 사이 세네갈(2021년 5.2천 톤, 수입액 비중 35.8%) → 모로코(2023년 3.4천 톤) → 오만(2025년 4.2천 톤, 수입액 비중 32.8%)으로 재편됨. 동일 기간 전체 수입은 15.5→13.4천 톤(-13.5%)으로 축소된 가운데 1위국 물량 점유율은 2023년 23%에서 2025년 31%로 상승해 단일 산지 충격에 더 취약해진 구조.",
      strat: "오만 의존도가 30%를 돌파한 시점이므로 ①남아공·세네갈을 묶어 2순위 공급권(Backup Tier)으로 등급화하고 연간 3,000톤 이상 의무 계약량 확보, ②예멘·홍해 안보 리스크 모니터링 KPI 신설하여 오만 출항 지연 3주 이상 시 즉시 남아공 콜로 전환 발동, ③수입원 다각화 비율을 50:30:20 헷지 한도로 IR에 표준 지표로 공시.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2021Q4~2025Q4 연차 차트·부록 국가별 표 + 관세청 HSK 0303.89-2000 실측 교차검증 (2026-06-11)",
      isLive: false,
      syncDate: "2026-06"
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
      strat: "①오만 분기 점유율이 40% 이상 유지될 경우 단일 공급원 충격 시 30% 이상 가격 spike에 노출되므로 분기마다 남아공 톤수를 의무적으로 25% 이상 확보하는 헷지룰 도입, ②일본산 +196.8% 신호를 활용해 회전초밥·횟감 채널 ODM 진입(소매가 +40% 프리미엄 포지셔닝), ③오만 단가가 관세청 실측 밴드($3.6~4.0/kg) 상단을 깨고 $4.5/kg를 돌파하는 시점에 자동으로 남아공·세네갈로 비중을 전환하는 동적 소싱 알고리즘 가동(기존 $7 트리거는 KMI 차트 타 계열 오독 잔재로 폐기).",
      source: "KMI 「FTA체결국 수산물 수입동향 2026 Q1」 — 갈치 국가별 수입량 표 (2026-04 발간)",
      isLive: false,
      syncDate: "2026-04"
    },
    {
      id: "w_fta_ecuador_arb",
      title: "에콰도르 경유무역 — 한국→중국 재수출 갈치",
      subtitle: "KMI 2023 Q2~Q4 보고서 본문 인용: \"에콰도르산 갈치는 대부분 우리나라에서 소비되지 않고 중국으로 재수출\". 2021~2025년 에콰도르산 수입량 추이로 환적 물량 규모를 추적합니다.",
      chartType: "Bar",
      xKey: "year",
      bars: [{ key: "에콰도르 수입(천 톤)", color: "#06b6d4" }],
      data: [
        { year: "2021", "에콰도르 수입(천 톤)": 1.3 },
        { year: "2022", "에콰도르 수입(천 톤)": 1.6 },
        { year: "2023", "에콰도르 수입(천 톤)": 1.3 },
        { year: "2024", "에콰도르 수입(천 톤)": 0.8 },
        { year: "2025", "에콰도르 수입(천 톤)": 0.0 }
      ],
      sit: "에콰도르산 갈치는 2021년 1.3천 톤 → 2022년 1.6천 톤 정점 → 2023년 1.3천 톤 → 2024년 0.8천 톤 → 2025년 0톤으로 통관 실적이 소멸함(관세청 실측). KMI 2023Q2~Q4 보고서가 \"대부분 우리나라에서 소비되지 않고 중국으로 재수출되는 물량\"이라 명시한 환적 수요였으며, 단가도 $1.8~2.4/kg로 주요 산지 대비 최저여서 내수 수요 신호로 오독하면 안 되는 물량.",
      strat: "①에콰도르산 관세청 통관량은 실제 한국 내수 수요가 아니므로 자체 시장 추정 모델에서 즉시 차감 처리(2023년 물량 비중 약 9%p 노이즈), ②중국 재수출 마진($0.3~0.5/kg 추정)을 직접 포착하기 위한 한국→중국 콜드체인 환적 게이트웨이 사업성 분석, ③환적 매출은 영업이익률이 단순 환산 수입의 3배 이상이므로 釜山港 보세창고 활용한 transit trade 신규 라인 검토.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2023Q2~Q4 본문 + 2024Q4·2025Q4 부록 국가별 표 + 관세청 HSK 0303.89-2000 실측 (2026-06-11)",
      isLive: false,
      syncDate: "2026-06"
    },
    {
      id: "w_fta_dress_substitute",
      title: "드레스 갈치 대체축 — 세네갈→남아공 시프트",
      subtitle: "KMI 2024 Q3·Q4 보고서 본문 인용: \"남아공산은 세네갈산 드레스 갈치를 대체하며 수입 증가\" (2025 Q2는 모로코산 대체로 기술). 드레스(원물 1차처리) 카테고리의 산지 다변화 궤적입니다.",
      chartType: "Composed",
      xKey: "year",
      lines: [
        { key: "세네갈(드레스 원산지)", color: "#f59e0b" },
        { key: "남아공(대체재)", color: "#8b5cf6" }
      ],
      data: [
        { year: "2022", "세네갈(드레스 원산지)": 4.3, "남아공(대체재)": 0.9 },
        { year: "2023", "세네갈(드레스 원산지)": 3.0, "남아공(대체재)": 1.0 },
        { year: "2024", "세네갈(드레스 원산지)": 2.3, "남아공(대체재)": 1.9 },
        { year: "2025", "세네갈(드레스 원산지)": 2.8, "남아공(대체재)": 2.5 }
      ],
      sit: "세네갈 갈치는 2022년 4.3천 톤에서 생산 부진으로 2024년 2.3천 톤(-47%)까지 축소된 후 2025년 2.8천 톤으로 회복(KMI 2025Q4: 전년도 부진했던 세네갈산 생산 회복). 그 공백을 남아공산이 0.9→2.5천 톤(2022→2025, 약 2.8배)으로 메움. 단, 두 산지는 동가가 아님 — 2024년 4분기 단가는 세네갈 $4.2/kg vs 남아공 $2.1/kg(KMI 명문)로 남아공이 약 50% 할인된 저가 대체축.",
      strat: "①남아공 공급사를 Trusted Vendor 1순위로 등급화하고 사이즈별(500g 이상) 카테고리를 우선 계약 조건에 명시, ②세네갈은 보조 공급선으로 유지하되 어획 부진 재발에 대비한 의무 비축량(3개월 분) 설정, ③드레스 가공 사양을 한국 표준화하여 신규 산지(나미비아·앙골라) 진입 시 교체 비용 최소화.",
      source: "KMI 「FTA체결국 수산물 수입동향」 2024Q3·2024Q4·2025Q4 갈치 본문 + 부록 국가별 표 + 관세청 HSK 0303.89-2000 실측 교차 (2026-06-11)",
      isLive: false,
      syncDate: "2026-06"
    },
    {
      id: "w_fta_unit_price",
      title: "냉동 갈치 산지별 단가 ($/kg)",
      subtitle: "관세청 HSK 0303.89-2000 분기별 국가 CIF 실측 ($/kg). KMI 「FTA체결국 수산물 수입동향」 냉동 갈치 수입단가 차트와 교차검증 완료 (2026-06-11). 산지별 단가 밴드로 매수 타이밍을 도출합니다.",
      chartType: "Composed",
      xKey: "quarter",
      lines: [
        { key: "오만", color: "#10b981" },
        { key: "세네갈", color: "#f59e0b" },
        { key: "모로코", color: "#ec4899" },
        { key: "남아공", color: "#8b5cf6" }
      ],
      data: [
        { quarter: "24-Q1", "오만": 3.92, "세네갈": 3.56, "모로코": 2.62, "남아공": 2.23 },
        { quarter: "24-Q2", "오만": 3.68, "세네갈": 3.10, "모로코": 2.62, "남아공": 2.04 },
        { quarter: "24-Q3", "오만": 3.63, "세네갈": 3.98, "모로코": 2.43, "남아공": 2.05 },
        { quarter: "24-Q4", "오만": 3.72, "세네갈": 4.17, "모로코": 2.88, "남아공": 2.05 },
        { quarter: "25-Q1", "오만": 3.66, "세네갈": 4.15, "모로코": 2.91, "남아공": 2.22 },
        { quarter: "25-Q2", "오만": 3.81, "세네갈": 3.67, "모로코": 3.22, "남아공": 2.37 },
        { quarter: "25-Q3", "오만": 3.73, "세네갈": 3.86, "모로코": 3.24, "남아공": 2.59 },
        { quarter: "25-Q4", "오만": 3.98, "세네갈": 3.55, "모로코": 3.17, "남아공": 2.60 },
        { quarter: "26-Q1", "오만": 4.03, "세네갈": 3.57, "모로코": 3.24, "남아공": 2.62 }
      ],
      sit: "2024~2026년 9개 분기 동안 4개국 단가는 $2.0~4.2/kg 밴드에서 안정 — 오만이 최고가 산지($3.6~4.0)로 일관되고, 남아공은 $2.0~2.6으로 오만 대비 약 35% 할인 구조가 유지됩니다. 2026년 1분기 오만은 단가 $4.03에 물량 1.5천 톤(전년 동기 +154%)으로 \"가격 안정 속 물량 확대\" 국면 — KMI 원문도 단가 급등이 아닌 \"오만산 조업 원활로 수입 대폭 증가\"로 기술합니다. 과거 표기된 오만 $7.2(25-Q4)·$9.1(26-Q1)은 KMI 원문 차트의 일본·중국 계열을 오만으로 오독한 수치로 확인되어 폐기합니다(KCS 실측 오만 25-Q4 $3.98·26-Q1 $4.03).",
      strat: "①남아공($2.62)과 오만($4.03)의 $1.4/kg 격차를 활용해 드레스·B2B 급식 라인은 남아공 비중을 우선 확대, ②오만 단가가 실측 밴드 상단($4.2/kg)을 돌파할 때만 세네갈·남아공 전환 룰을 발동하도록 기존 \"$7 트리거\"를 재캘리브레이션, ③분기별 관세청 실측 CIF를 소싱 KPI로 자동 집계해 외부 보고서 인용 수치와의 괴리를 상시 감시.",
      source: "관세청 nitemtrade HSK 0303.89-2000 분기 집계 (2026-06-11 실수집) — KMI 「FTA체결국 수산물 수입동향」 2024Q4·2025Q4·2026Q1 냉동 갈치 수입단가 차트와 정합 확인",
      isLive: false,
      syncDate: "2026-06"
    }
  ];

  newWidgets.forEach(w => { widgetMap[w.id] = w; });

  // 패턴 I: 헤더 카운트 동적 산출 — 실제 5-Pillar에 배치되어 렌더되는 위젯 수
  const totalWidgetCount = SECTIONS.reduce((n, s) => n + s.ids.filter(id => widgetMap[id]).length, 0);

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
              <Area key={i} type="monotone" dataKey={a.key} name={a.name || a.key} stroke={a.color} fill={`url(#mArea${widget.id}_${i})`} strokeWidth={2.5} stackId={widget.stacked ? 'stack1' : undefined} />
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
              return <Bar key={i} dataKey={b.key} name={b.name || b.key} fill={p.fill} color={b.color || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
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
              return <Bar key={i} yAxisId={b.yAxisId || "left"} dataKey={b.key} name={b.name || b.key} fill={p.fill} color={b.color || p.color} radius={[6,6,0,0]} fillOpacity={0.85} />;
            })}
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} name={l.name || l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
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
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>최고경영진 브리핑 — {totalWidgetCount}개 위젯 · {kpiKeys.length}개 KPI · {GALCHI_API_PATHS.length}개 API 채널</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #1ed760', animation: 'pulse 2s infinite' }} />
            <span><span style={{ color: 'var(--color-success)' }}>Forensic v2</span> · 해수부·FAO 교차검증 · 관세청 HSK 검증 완료(0303.89-2000)</span>
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
            {/* Landing Cost — 입력 CIF는 HSK 0303.89-2000 실측 통관 단가 (검증 완료 2026-06-11) */}
            {liveIntel?.landingCost && (
              <div className="ds-card" style={{ background: '#181818', borderRadius: '8px', padding: '1rem', boxShadow: 'rgba(0,0,0,0.3) 0px 4px 8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#7c7c7c', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Package size={12} /> 착지원가 시뮬레이션
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f97316' }}>₩{liveIntel.landingCost.landedKrw?.toLocaleString()}<span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/kg</span></div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>CIF ${liveIntel.landingCost.cifUsd}/kg + 관세 10% · 위판가 대비 {liveIntel.landingCost.spreadPct}%</div>
              </div>
            )}
            {/* KCS Import — HSK 0303.89-2000 냉동 갈치 통관 실측 (검증 완료 2026-06-11) */}
            {liveKcs?.summary && (
              <div className="ds-card" style={{ background: '#181818', borderRadius: '8px', padding: '1rem', boxShadow: 'rgba(0,0,0,0.3) 0px 4px 8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#7c7c7c', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Ship size={12} /> 수입 통관 현황
                  {liveKcs.isLive && <span style={{ color: 'var(--color-success)', fontSize: '0.6rem' }}>●</span>}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#8b5cf6' }}>{Math.round(liveKcs.summary.totalWgt).toLocaleString()}<span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>톤</span></div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{liveKcs.year || '2025'}년 HSK 0303.89-2000 · 중국 {liveKcs.summary.cnPct}% · CIF ${liveKcs.summary.cifPerKg}/kg</div>
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
                  {liveIntel.macroRisk.riskLevel === 'HIGH' ? '높음' : liveIntel.macroRisk.riskLevel === 'MEDIUM' ? '중간' : '낮음'}
                </div>
                {/* 원가 영향액은 HSK 0303.89-2000 실측 CIF $3.61/kg(2025) 기반 (검증 완료 2026-06-11) */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>원가 영향 {liveIntel.macroRisk.costImpactPerKg} · 연간 {liveIntel.macroRisk.annualImpactMillion}</div>
              </div>
            )}
          </div>
        </div>
      )}



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
    // 정직 telemetry (L-09 / 패턴 B):
    // _liveState가 있는 위젯 = fetch-driven → 라우트 메타 isLive === true일 때만 LIVE.
    // 라우트가 fallback(isLive: false)을 반환하면 정적 데이터이므로 STATIC (응답 truthiness로 격상 금지).
    // _liveState가 없는 위젯 = 순수 정적 → STATIC 고정
    const status: 'LIVE' | 'SYNCED' | 'STATIC' =
      ('_liveState' in w)
        ? (w._liveState?.isLive === true ? 'LIVE' : 'STATIC')
        : 'STATIC';

    return (
      <WidgetCard key={w.id}
        title={w.title}
        icon={IconComp}
        iconColor={accentColor}
        pillar={pillar}
        cardDesc={w.subtitle || ''}
        telemetry={{ status, syncDate: w.syncDate }}
        chartHeight={375}
        chart={renderChart(w)}
        takeaway={{
          situation: w.sit || '',
          actionPlan: w.strat || '',
          source: w.source || '',
        }} />
    );
  }
}
