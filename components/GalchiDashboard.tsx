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
};

const SECTIONS = [
  { title: "가격 동향 & 시즌 전략", desc: "위판가·도매가·수입단가 크로스 모니터링", ids: ["w01","w07","w18"], accent: "var(--color-success)" },
  { title: "원가 시뮬레이터 & 무역 흐름 (Phase 1)", desc: "WITS 착지원가 예측 + UN Comtrade 물동량", ids: ["w24","w25"], accent: "#f43f5e" },
  { title: "글로벌 소싱 & 컴플라이언스 (Phase 2)", desc: "OSH 팩토리 매핑 + OFAC/EU 제재 검증", ids: ["w26","w27"], accent: "var(--color-danger)" },
  { title: "수입 구조 & 무역 인텔리전스", desc: "관세청 7년 추이 + 원산지 리스크 분석", ids: ["w05","w17","w20","w23"], accent: "#8b5cf6" },
  { title: "국내 생산 & 산지 분석", desc: "위판장·어업방식·TAC 기반 공급 예측", ids: ["w15","w16","w19"], accent: "#38bdf8" },
  { title: "글로벌 포지셔닝", desc: "FAO 50년 데이터 + 한국 소비 경쟁력", ids: ["w14","w22"], accent: "#06b6d4" },
  { title: "유통 혁신 & 지정학 리스크", desc: "마진 구조 해부 + 한중 수산 지정학", ids: ["w02","w08","w10"], accent: "#ec4899" },
  { title: "조업 효율 & 기후 리스크", desc: "CPUE 최적화 + 수온 상승 영향 분석", ids: ["w03","w04"], accent: "#f97316" },
  { title: "규제 대응 & B2B 시장", desc: "WTO·EU 규제 + 급식 시장 전환", ids: ["w06","w09"], accent: "var(--color-warning)" },
  { title: "KFAS 수산과학 포렌식", desc: "계군 분석·생식생물학·산란 시차 전략", ids: ["w11","w12","w13"], accent: "#10b981" },
];

export default function GalchiDashboard() {
  const [data, setData] = useState(null);
  const [liveIntel, setLiveIntel] = useState<any>(null);
  const [liveKcs, setLiveKcs] = useState<any>(null);
  const [liveKamis, setLiveKamis] = useState<any>(null);

  useEffect(() => {
    fetch('/data/galchi_data.json?t=' + Date.now())
      .then(res => res.json())
      .then(json => { setData(json); })
      .catch(err => console.error("Failed to load galchi data", err));

    // Live API calls
    fetch('/api/galchi/intel').then(r => r.json()).then(setLiveIntel).catch(() => {});
    fetch('/api/galchi/kcs').then(r => r.json()).then(setLiveKcs).catch(() => {});
    fetch('/api/galchi/kamis').then(r => r.json()).then(setLiveKamis).catch(() => {});
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading Intelligence...</p>
    </div>
  );

  let { kpis, widgets } = data;
  const kpiKeys = Object.keys(kpis);
  const widgetMap: Record<string, any> = {};
  widgets?.forEach((w: any) => { widgetMap[w.id] = w; });

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.title}</span>
                <IconComp size={16} style={{ color: theme.text }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {kpi.value.startsWith('$') && '$'}
                {kpi.value.startsWith('+') && '+'}
                <CountUp end={parseFloat(kpi.value.replace(/[^0-9.]/g, ''))} duration={2} separator="," decimals={kpi.value.includes('.') ? (kpi.value.split('.')[1]?.replace(/[^0-9]/g,'').length || 1) : 0} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '3px' }}>
                  {kpi.value.replace(/^[+$0-9.,%]+/, '').trim()}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: theme.text, fontWeight: 600 }}>
                <span style={{ background: `${theme.text}20`, padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{kpi.trend}</span>
                {kpi.desc}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))', gap: '1.5rem' }}>
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
    const isLiveWidget = LIVE_WIDGETS.includes(w.id);
    
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
