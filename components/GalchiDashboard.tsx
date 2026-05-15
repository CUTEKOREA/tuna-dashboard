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
  w_wto_sps_radar: AlertCircle, w_oec_galchi_export: Globe
};

const SECTIONS = [
  { 
    title: "Part I — 원물 생산 (Raw Material)", 
    desc: "글로벌 어획량, 자원평가, 조업 효율, TAC 관리, 기후 리스크 및 KFAS 수산과학 연구", 
    ids: ["w14","w15","w16","w19","w03","w04","w29","w11","w12","w13"], 
    accent: "var(--color-success)",
    icon: "Fish"
  },
  { 
    title: "Part II — 가공 산업 (Processing)", 
    desc: "유통 단계별 마진 구조, 가공 전환 전략 및 B2B 급식 시장 개발", 
    ids: ["w02","w06"], 
    accent: "var(--color-warning)",
    icon: "Factory"
  },
  { 
    title: "Part III — 물류 및 무역 (Logistics & Trade)", 
    desc: "수출입 통관, 관세·FTA 분석, 착지원가, 교역 흐름, 대체 공급망 및 지정학 리스크", 
    ids: ["w05","w17","w20","w23","w24","w25","w08","w09","w28","w_galchi_hs_class","w_galchi_multi_cost","w_oec_galchi_export"], 
    accent: "#38bdf8",
    icon: "Ship"
  },
  { 
    title: "Part IV — 판매 및 수요 (Sales & Demand)", 
    desc: "가격 동향, 매입 타이밍, 도매가 스프레드, 소비 트렌드 및 내수 물가 분석", 
    ids: ["w01","w07","w18","w22","w_kosis_cpi_spread"], 
    accent: "#8b5cf6",
    icon: "TrendingUp"
  },
  { 
    title: "Part V — ESG 및 지속가능성 (Sustainability)", 
    desc: "공급망 노동 리스크, OFAC/EU 제재 검증, SPS 비관세 장벽, 식품 안전 및 정책 모니터링", 
    ids: ["w26","w27","w_wto_sps_radar","w_mfds_safety_radar","w10"], 
    accent: "var(--color-danger)",
    icon: "ShieldCheck"
  },
];

export default function GalchiDashboard() {
  const [data, setData] = useState(null);
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
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading Intelligence...</p>
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
      id: "w_galchi_hs_class",
      title: "실시간 통관 HS 코드 정밀 분류 — 형태별 관세 매핑",
      subtitle: "HS Ping API 연동. 갈치 원물/토막/필렛 가공 형태별 HS 코드(0303.89, 0304.89 등)를 자동 분류하여 통관 보류 리스크를 사전 방지합니다.",
      chartType: "Bar",
      xKey: "form",
      bars: [{ key: "conf", color: "#38bdf8" }],
      sit: "수입 가공 형태에 따라 HS 코드가 상이하며, 코드 오류 시 통관 보류 및 과태료 리스크가 존재합니다. 특히 토막(cut) vs 필렛(fillet) 경계에서 분류 오류가 빈발합니다.",
      strat: "HS Ping 실시간 매핑으로 통관 사고 Zero화 달성. ①수입 신고 전 HS Ping 자동검증 프로세스 도입, ②오분류 이력 DB화로 반복 실수 차단.",
      source: "HS Ping API (실시간 HS 코드 분류 엔진)",
      isLive: true,
      data: liveHsPing?.data || []
    },
    {
      id: "w_galchi_multi_cost",
      title: "착지원가 실시간 스태킹 — MFN vs FTA 복합 시뮬레이션",
      subtitle: "Tariffs API 연동. MFN 기본관세(10%)와 세네갈 FTA 특혜관세를 동시 적용한 착지원가를 월별로 비교하여, 관세 차익이 최대화되는 수입 타이밍을 식별합니다.",
      chartType: "Composed",
      xKey: "month",
      bars: [{ key: "세네갈 FTA 원가", color: "#8b5cf6" }],
      lines: [{ key: "MFN 관세원가", color: "#f43f5e" }],
      sit: "WITS 데이터 래그(Lag)를 보완하여 실시간 협정 관세를 누적 계산합니다. 세네갈산은 FTA 특혜관세 적용 시 MFN 대비 착지원가가 8~12% 절감됩니다.",
      strat: "①MFN-FTA 스프레드가 10% 이상인 월에 세네갈산 집중 선적, ②환율 변동(CNY/KRW) 연동 시뮬레이션으로 최적 계약 시점 포착.",
      source: "Tariffs API",
      isLive: true,
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
      isLive: true,
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
      isLive: true,
      data: liveMfds?.data || []
    },
    {
      id: "w_wto_sps_radar",
      title: "WTO SPS 비관세 장벽 발동 트렌드",
      subtitle: "WTO Data Portal 연동. 중국·아세안의 수산물 위생검역(SPS) 조치 발동 건수를 분기별로 추적합니다. 수출 시 비관세 장벽 충격을 사전 대비합니다.",
      chartType: "Area",
      xKey: "period",
      areas: [
        { key: "중국 SPS", color: "#ec4899" },
        { key: "아세안 SPS", color: "#06b6d4" }
      ],
      sit: "중국 및 아세안의 수산물 비관세 장벽(SPS)이 분기별로 심화 추세입니다. 특히 중국은 정치적 이슈 발생 시 SPS 조치를 '비공식 제재' 수단으로 활용하는 패턴이 관측됩니다.",
      strat: "①대중국 수출 전 사전 위생 증명서(Health Certificate) 요건 모니터링 체계 가동, ②SPS 발동 급증 분기에 대체 수출 루트(일본·홍콩) 사전 확보.",
      source: "WTO Data Portal",
      isLive: true,
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
      source: "OEC API (Observatory of Economic Complexity)",
      isLive: true,
      data: liveOec?.data || []
    }
  ];

  newWidgets.forEach(w => { widgetMap[w.id] = w; });

  /* ─── Chart Renderer ─── */
  const renderChart = (widget: any) => {
    const d = widget.data;
    if (!d || d.length === 0) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;

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
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.areas?.map((a: any, i: number) => (
              <Area key={i} type="monotone" dataKey={a.key} stroke={a.color} fill={`url(#mArea${widget.id}_${i})`} strokeWidth={2.5} stackId={widget.stacked ? 'stack1' : undefined} />
            ))}
          </AreaChart>
        );
      case "Bar":
        return (
          <BarChart data={d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
            <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
          </BarChart>
        );
      case "Composed":
        return (
          <ComposedChart data={d}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={widget.xKey} stroke="#64748b" tick={{fontSize:10}} />
            <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            {widget.dualAxis && (
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:10}} tickFormatter={formatVal} domain={[0, 'auto']} />
            )}
            <RechartsTooltip content={<CustomTooltip unit={widget.unit} />} />
            <Legend wrapperStyle={{fontSize:'11px'}} />
            {widget.bars?.map((b: any, i: number) => (
              <Bar key={i} yAxisId={b.yAxisId || "left"} dataKey={b.key} fill={b.color} radius={[6,6,0,0]} fillOpacity={0.85} />
            ))}
            {widget.lines?.map((l: any, i: number) => (
              <Line key={i} yAxisId={l.yAxisId || "left"} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:5}} />
            ))}
          </ComposedChart>
        );
      default:
        return <div style={{color:'#64748b',textAlign:'center',marginTop:'40px'}}>Unsupported Chart</div>;
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
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>C-Level Executive Briefing — {widgets?.length || 0} Widgets · {kpiKeys.length} KPIs · 17 Data Sources</p>
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live Intelligence Feed</span>
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
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                구글 드라이브(Data 폴더)에서 스캔된 최신 수산경제전망 및 유통 현황이 학습된 맞춤형 AI입니다. 전략적 통찰을 즉시 질문하세요.
              </p>
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

      {/* ═══ Categorized Widget Sections ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {SECTIONS.map((section) => {
          const sectionWidgets = section.ids.map(id => widgetMap[id]).filter(Boolean);
          if (sectionWidgets.length === 0) return null;
          return (
            <section key={section.title}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <div style={{ width: '4px', height: '28px', borderRadius: '2px', background: section.accent }} />
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{section.title}</h2>
                  <span style={{ fontSize: '0.7rem', color: section.accent, background: `${section.accent}15`, padding: '3px 10px', borderRadius: '500px', fontWeight: 600 }}>
                    {sectionWidgets.length}
                  </span>
                </div>
                {section.desc && <p style={{ margin: '0 0 0 16px', fontSize: '0.82rem', color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>{section.desc}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                {sectionWidgets.map((w: any) => renderWidgetCard(w, section.accent))}
              </div>
            </section>
          );
        })}
      </div>

    </div>
  );

  function renderWidgetCard(w: any, accentColor: string) {
    const IconComp = WIDGET_ICONS[w.id] || Anchor;
    const LIVE_WIDGETS = ['w01','w05','w17','w18'];
    const isLiveWidget = LIVE_WIDGETS.includes(w.id) || w.isLive;
    
    let situation = w.sit || '';
    let takeaway = w.strat || '';
    
    return (
      <div key={w.id} className="ds-card" style={{display: 'flex', flexDirection: 'column', minHeight: '480px',
        background: '#181818', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none',
        padding: '1.5rem'}}>
        
        {/* Card Header */}
        <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1 }}>
              <IconComp size={20} color={accentColor} />
              {w.title}
            </h3>
            {isLiveWidget && (
              <span style={{ fontSize: '0.6rem', color: 'var(--color-success)', background: 'rgba(30,215,96,0.1)', padding: '3px 8px', borderRadius: '500px', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                ● API
              </span>
            )}
          </div>
          {(w.subtitle) && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {w.subtitle}
            </p>
          )}
        </div>

        {/* Chart Area */}
        <div style={{ height: '325px', width: '100%', marginBottom: '1.5rem', position: 'relative', zIndex: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            {renderChart(w)}
          </SafeResponsiveContainer>
        </div>

        {/* Takeaway Box */}
        {(situation || takeaway) && (
          <div style={{ marginTop: 'auto' }}>
            <div style={{ background: 'var(--surface-2)', borderRadius: '6px', padding: '16px' }}>
              {situation && (
                <div style={{ paddingBottom: takeaway ? '12px' : '0', marginBottom: takeaway ? '12px' : '0' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>현황 분석</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{situation}</p>
                </div>
              )}
              {takeaway && (
                <div>
                  <h4 style={{ color: accentColor, fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>실행 전략</h4>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{takeaway}</p>
                </div>
              )}
              {(w.source) && (
                <div style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid #272727' }}>
                  <span style={{ fontSize: '0.75rem', color: '#7c7c7c', display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    🔗 출처: {w.source}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
