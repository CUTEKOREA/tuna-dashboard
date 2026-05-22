// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  TrendingUp, TrendingDown, Globe, DollarSign,
  Activity, AlertTriangle, RefreshCcw, Factory, Truck, Scale, BarChart2,
  BookOpen, Workflow, Database, Zap, Hexagon, Leaf, Target, MapPin, Landmark, Coins, Layers, Sprout
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './CashewStrategy.module.css';
import TakeawayBox from './TakeawayBox';
import WidgetCard from './WidgetCard';

// CashewStrategy section/dynamic widgets용 공통 wrapper — WidgetCard 호출 일원화
const renderCashewWidget = (opts: {
  icon: any; title: string; subtitle: string; iconColor: string;
  pillar: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
  telemetryStatus: 'LIVE' | 'SYNCED' | 'STATIC';
  syncDate?: string; unit?: string;
  chart: any; situation: string; actionPlan: string; source: string;
}) => (
  <WidgetCard
    title={opts.title}
    icon={opts.icon}
    iconColor={opts.iconColor}
    pillar={opts.pillar}
    cardDesc={opts.subtitle}
    unit={opts.unit}
    telemetry={{ status: opts.telemetryStatus, syncDate: opts.syncDate || '2026-05' }}
    chartHeight={250}
    chart={opts.chart}
    takeaway={{ situation: opts.situation, actionPlan: opts.actionPlan, source: opts.source }}
  />
);

const formatXAxis = (tickItem: any) => {
  if (!tickItem || typeof tickItem !== 'string') return tickItem;
  let formatted = tickItem.replace(/\s*\([A-Za-z\s']+\)\s*/g, '');
  if (formatted.length > 7) {
    return formatted.substring(0, 7) + '..';
  }
  return formatted;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    const cleanLabel = typeof label === 'string' ? label.replace(/\s*\([A-Za-z\s']+\)\s*/g, '') : label;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{cleanLabel}</p>
        {payload.map((e: any, i: number) => (
          <div key={i} className={styles.tooltipValue}>
            <span style={{ color: e.color }}>■ {e.name}</span>
            <strong>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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

const PIE_COLORS = ["var(--color-success)", "var(--color-warning)", "#38bdf8", "var(--color-danger)", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const KPI_THEMES = [
  { border: 'rgba(16,185,129,0.5)', glow: 'rgba(16,185,129,0.25)', text: 'var(--color-success)', icon: Globe },
  { border: 'rgba(56,189,248,0.5)', glow: 'rgba(56,189,248,0.25)', text: '#38bdf8', icon: TrendingUp },
  { border: 'rgba(239,68,68,0.5)', glow: 'rgba(239,68,68,0.25)', text: 'var(--color-danger)', icon: Factory },
  { border: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.25)', text: 'var(--color-warning)', icon: DollarSign },
  { border: 'rgba(139,92,246,0.5)', glow: 'rgba(139,92,246,0.25)', text: '#8b5cf6', icon: Scale },
  { border: 'rgba(236,72,153,0.5)', glow: 'rgba(236,72,153,0.25)', text: '#ec4899', icon: AlertTriangle },
];

const WIDGET_ICONS: Record<string, any> = {
  w01: TrendingUp, w02: Globe, w03: BarChart2, w04: Truck, w05: Target,
  w06: DollarSign, w07: Scale, w08: Layers, w09: Coins, w10: Sprout,
  w11: Target, w12: Landmark, w13: Activity, w14: Factory, w15: Scale,
  w16: Leaf, w17: Hexagon, w18: Zap, w19: Truck, w20: TrendingUp,
  w21: Coins, w22: Leaf, w23: AlertTriangle, w24: Activity, w25: DollarSign, w26: Layers,
  w27: AlertTriangle, w28: Zap, w29: Coins, w30: Hexagon, w31: Globe,
  w32: Globe, w33: TrendingUp, w34: Zap, w35: AlertTriangle, w36: Sprout, w51: Leaf
};

const ACCENT_COLORS = ['var(--color-success)','var(--color-warning)','#38bdf8','var(--color-danger)','#8b5cf6','#ec4899','#06b6d4','var(--color-success)','var(--color-warning)','#38bdf8'];

const WIDGET_UNITS: Record<string, string> = {
  w01: "만 톤", w02: "만 톤", w03: "%", w04: "kg/ha", w05: "%",
  w06: "USD/톤", w07: "USD/톤", w08: "%", w09: "백만 USD", w10: "월",
  w11: "만 톤", w12: "USD/kg", w13: "백만 USD", w14: "%", w15: "%",
  w16: "USD/톤", w17: "천 USD", w18: "톤", w19: "USD (우축: 일)", w20: "십억 USD ($B)",
  w21: "%", w22: "kg CO₂e", w23: "백만 USD", w24: "톤", w25: "USD/Liter", w26: "USD/톤 (우축: 배수)",
  w27: "천 톤", w28: "수율 (%)", w29: "마진율 (%)", w30: "USD/톤", w31: "천 톤",
  w32: "USD/ha", w33: "백만 USD", w34: "지수", w35: "%", w36: "g/capita/day", w51: "지수",
  w37: "%", w38: "%"
};

const SECTIONS = [
  { id: "S1", title: "📍 제1전략기둥: 원물", desc: "글로벌 생산 추이, 수매가 마진 방어선 및 공급망 전환", color: "var(--color-success)", start: 0, end: 7 },
  { id: "S2", title: "⚙️ 제2전략기둥: 가공", desc: "SEZ 투자 매력도, 스마트 팩토리 ROI, 커널 등급 프리미엄 및 운전자본 리스크", color: "var(--color-info)", start: 7, end: 16 },
  { id: "S3", title: "🚚 제3전략기둥: 물류", desc: "원산지 포트폴리오, 물류 히트맵 및 기형적 우회 수출 트렌드", color: "var(--color-warning)", start: 16, end: 24 },
  { id: "S4", title: "🛒 제4전략기둥: 영업", desc: "가치사슬 마진 구조, 수요 시프트 트렌드 및 비건 대체유 프리미엄", color: "var(--color-danger)", start: 24, end: 31 },
  { id: "S5", title: "🌍 제5전략기둥: ESG", desc: "ESG 인증 프리미엄, 탄소 발자국 비교 및 CNSL(껍질 액) 부가가치", color: "#8b5cf6", start: 31, end: 39 },
];

export default function CashewStrategy() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/cashew')
      .then(r => r.json()).then(setData)
      .catch(e => console.error(e));
  }, []);

  if (!data) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:'1rem' }}>
      <RefreshCcw size={32} style={{ color:'var(--color-success)', animation:'spin 1s linear infinite' }} />
      <p style={{ color:'#94a3b8' }}>캐슈넛 전략 인텔리전스 데이터 동기화 중...</p>
    </div>
  );

  const { kpis, widgets, d_vietnam_paradox, d_africa_processing, d_macro_sensitivity, d_cnsl_esg } = data;

  const renderChart = (w: any) => {
    const d = w.data || w.pies;
    if (!d?.length) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>데이터 없음</div>;
    const isTextAxis = d.length > 0 && typeof d[0][w.xKey] === 'string' && isNaN(Number(d[0][w.xKey]));
    const tickProps = isTextAxis ? {fontSize:10, angle:0, textAnchor:'middle' as const, dy: 5} : {fontSize:10};
    const chartMargin = isTextAxis ? { top: 5, right: 10, left: -10, bottom: 10 } : undefined;
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />;
    const xAxis = <XAxis dataKey={w.xKey} stroke="#64748b" tick={tickProps} interval={0} tickFormatter={formatXAxis} />;
    const yFmt = (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toLocaleString();

    switch(w.chartType) {
      case "Pie":
        return (
          <PieChart>
            <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={40}
              label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={9}>
              {d.map((_:any,i:number) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
          </PieChart>
        );
      case "Area":
        return (
          <AreaChart data={d} margin={chartMargin}>
            <defs>
              {w.areas?.map((a:any,i:number) => (
                <linearGradient key={i} id={`aG${w.id}_${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={a.color} stopOpacity={0.5}/><stop offset="95%" stopColor={a.color} stopOpacity={0.03}/>
                </linearGradient>
              ))}
            </defs>
            {grid}{xAxis}
            <YAxis stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.areas?.map((a:any,i:number) => (
              <Area key={i} type="monotone" dataKey={a.key} stroke={a.color} fill={`url(#aG${w.id}_${i})`} strokeWidth={2} connectNulls />
            ))}
          </AreaChart>
        );
      case "Bar":
        return (
          <BarChart data={d} layout={d.length >= 10 ? "vertical" : "horizontal"} margin={chartMargin}>
            {grid}
            {d.length >= 10 ? (
              <>
                <YAxis type="category" dataKey={w.xKey} interval={0} stroke="#64748b" tick={{fontSize:9}} width={90} tickFormatter={formatXAxis} />
                <XAxis type="number" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />
              </>
            ) : (
              <>{xAxis}<YAxis stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} /></>
            )}
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill:'rgba(255,255,255,0.04)'}} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.bars?.map((b:any,i:number) => (
              <Bar key={i} dataKey={b.key} fill={b.color} radius={[4,4,0,0]} fillOpacity={0.85} />
            ))}
          </BarChart>
        );
      case "Line":
        return (
          <LineChart data={d} margin={chartMargin}>
            {grid}{xAxis}
            <YAxis stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.lines?.map((l:any,i:number) => (
              <Line key={i} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} dot={false} activeDot={{r:4}} connectNulls />
            ))}
          </LineChart>
        );
      case "Composed":
        return (
          <ComposedChart data={d} margin={chartMargin}>
            {grid}{xAxis}
            <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />
            {w.lines?.some((l:any) => l.yAxisId === 'right' || !l.yAxisId) && (
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />
            )}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.bars?.map((b:any,i:number) => (
              <Bar yAxisId={b.yAxisId || "left"} key={`b${i}`} dataKey={b.key} fill={b.color} radius={[4,4,0,0]} fillOpacity={0.8} />
            ))}
            {w.lines?.map((l:any,i:number) => (
              <Line yAxisId={l.yAxisId || "right"} key={`l${i}`} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={false} activeDot={{r:4}} connectNulls />
            ))}
          </ComposedChart>
        );
      case "Radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={d}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey={w.xKey} tick={{fill:'#94a3b8', fontSize:10}} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{fill:'#64748b', fontSize:8}} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.radars?.map((r:any, i:number) => (
              <Radar key={i} name={r.name} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.5} />
            ))}
          </RadarChart>
        );
      default: return null;
    }
  };

  return (
    <div style={{ padding:'0 1.5rem 3rem', color:'#f8fafc', minHeight:'100vh', fontFamily:"'Inter',sans-serif" }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'8px', background: 'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Hexagon size={24} color="var(--text-primary)" />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.5px', color:'#f8fafc' }}>
                캐슈넛 산업 전략 지휘소 (Cashew Command Center)
              </h1>
              <p style={{ margin:0, fontSize:'0.8rem', color:'#64748b' }}>FAOSTAT Real Data · 10 Charts · 127 Data Points</p>
            </div>
          </div>
          <div style={{ fontSize:'0.8rem', padding:'0.5rem 1rem', background: '#181818', border: 'none', borderRadius:'8px', color:'#94a3b8' }}>
            <span style={{ color:'var(--color-success)' }}>FAOSTAT 2024</span> · QCL·TCL·TM·PP·SCL·QV
          </div>
        </div>
      </header>

      {/* ═══ 9-Network Live Status Monitor & SCSI ═══ */}
      <div style={{
        background: '#181818',
        border: 'none',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-success)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', width: '24px', height: '24px', backgroundColor: 'var(--color-success)', borderRadius: '50%', opacity: 0.3, animation: 'pulse 2s infinite' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.3px' }}>
                DATA SOURCE COMMAND CENTER <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', marginLeft: '6px' }}>INDEXED</span>
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { name: 'FAOSTAT', desc: 'UN 농축산', status: 'indexed' },
                { name: 'KCS API', desc: '관세청 수입', status: 'indexed' },
                { name: 'KAMIS API', desc: '도매물가', status: 'standby' },
                { name: 'DART API', desc: '기업공시', status: 'standby' },
                { name: 'MFDS API', desc: '수입식품검역', status: 'indexed' },
                { name: 'VINACAS', desc: '베트남현물가', status: 'standby' },
                { name: 'USDA FAS', desc: '산지작황', status: 'standby' },
                { name: 'World Bank', desc: '거시경제', status: 'standby' },
                { name: 'JRC / EFI', desc: '산림규제', status: 'standby' }
              ].map((net, i) => (
                <div key={i} style={{ 
                  background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '6px', 
                  padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '6px' 
                }}>
                  <Database size={12} color={net.status === 'indexed' ? 'var(--color-success)' : 'var(--color-warning)'} />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e2e8f0' }}>{net.name}</div>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{net.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ 
            minWidth: '220px', 
            background: 'rgba(0,0,0,0.4)', 
            border: 'none', 
            borderRadius: '8px', 
            padding: '1rem',
            textAlign: 'center',

          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Activity size={16} color="var(--color-danger)" />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-danger)', letterSpacing: '1px' }}>SCSI INDEX</div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1, marginBottom: '4px' }}>
              <CountUp end={(() => { const k = kpis; const vals = Object.values(k).map((v: any) => parseFloat(String(v.value).replace(/[^0-9.-]/g,''))); const avg = vals.filter(v => !isNaN(v)).reduce((a,b) => a+b, 0) / Math.max(vals.filter(v => !isNaN(v)).length, 1); return Math.min(100, Math.max(0, Math.round(avg * 1.2 + 40))); })()} duration={2} />
              <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}> / 100</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 600 }}>Silla Cashew Stress Index (KPI-Derived)</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '6px' }}>Last Update: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {Object.keys(kpis).map((key, idx) => {
          const kpi = kpis[key]; const t = KPI_THEMES[idx % KPI_THEMES.length]; const I = t.icon;
          return (
            <div key={key} style={{ background: '#181818', border: 'none', borderRadius:'8px', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'6px', transition:'all 0.3s', cursor:'default', position:'relative', overflow:'hidden' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='rgba(255, 255, 255, 0.1)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='rgba(255, 255, 255, 0.05)'}}>
              <div style={{ position:'absolute', top:'-15px', right:'-15px', width:'60px', height:'60px', borderRadius:'50%', background:`radial-gradient(circle,${t.glow},transparent)`, pointerEvents:'none' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.72rem', color:'#94a3b8', fontWeight:600 }}>{kpi.title}</span>
                <I size={14} style={{ color:t.text }} />
              </div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.5px' }}>
                {kpi.value.startsWith('$')&&'$'}{kpi.value.startsWith('+')&&'+'}
                <CountUp end={parseFloat(kpi.value.replace(/[^0-9.]/g,''))} duration={2} separator="," decimals={kpi.value.includes('.')?1:0} />
                <span style={{ fontSize:'0.7rem', color:'#94a3b8', fontWeight:400, marginLeft:'3px' }}>
                  {kpi.value.includes('M')&&'M'}{kpi.value.includes('%')&&'%'}{kpi.value.includes('x')&&'x'}{kpi.value.includes('t')&&'t'}
                </span>
              </div>
              <div style={{ fontSize:'0.68rem', color:t.text, fontWeight:600 }}>
                <span style={{ background:`${t.text}20`, padding:'1px 5px', borderRadius:'3px', marginRight:'4px' }}>{kpi.trend}</span>{kpi.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Sections: 5 Stages of Value Chain ═══ */}
      {SECTIONS.map((sec) => (
        <div key={sec.id}>
          <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: sec.id === 'S1' ? '0' : '3rem' }}>
            <div style={{ width:'4px', height:'28px', background:`linear-gradient(180deg,${sec.color},${sec.color}99)`, borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>{sec.title}</h2>
              <p style={{ margin:0, fontSize:'0.75rem', color:'#64748b' }}>{sec.desc}</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>

            {sec.id === 'S1' && d_vietnam_paradox && renderCashewWidget({
              icon: Globe, title: "베트남 캐슈 원물 수입 의존도 리스크 (역설)",
              subtitle: "베트남 수출량 대비 원물(RCN) 수입량 격차",
              iconColor: "var(--color-success)", pillar: "S1", telemetryStatus: "LIVE",
              chart: (
                <AreaChart data={d_vietnam_paradox} margin={{top:5, right:10, left:-10, bottom:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748b" tick={{fontSize:10}} />
                  <YAxis stroke="#64748b" tick={{fontSize:9}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize:'10px'}} />
                  <Area type="monotone" dataKey="importVolume" name="원물(RCN) 수입량" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth={2} />
                  <Area type="monotone" dataKey="exportVolume" name="커널 수출량" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth={2} />
                </AreaChart>
              ),
              situation: "베트남의 캐슈넛 수출량은 우상향 중이나, 자체 원물 조달의 한계로 RCN(원물) 수입 의존도(Exposure) 역시 역대 최고치로 폭증하며 마진 스프레드(Margin Spread) 스프레드가 축소되고 있습니다.",
              actionPlan: "베트남 가공 공장 의존도(Exposure)를 낮추고, 서아프리카 산지 직소싱 및 현지 1차 가공 거점 확보를 통해 원물 테일 리스크(Tail Risk)를 헤징하십시오.",
              source: "베트남 해관총서(VINACAS) 및 무역 데이터"
            })}
            {sec.id === 'S2' && d_africa_processing && renderCashewWidget({
              icon: Factory, title: "서아프리카 현지 가공 비율 및 B2B 직공급 전환율",
              subtitle: "가공률(Processing Rate) 상승과 직공급 전환 궤적",
              iconColor: "var(--color-info)", pillar: "S2", telemetryStatus: "LIVE",
              chart: (
                <ComposedChart data={d_africa_processing} margin={{top:5, right:10, left:-10, bottom:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="quarter" stroke="#64748b" tick={{fontSize:10}} />
                  <YAxis stroke="#64748b" tick={{fontSize:9}} unit="%" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize:'10px'}} />
                  <Bar dataKey="processingRate" name="현지 가공 비율(%)" fill="#3b82f6" radius={[4,4,0,0]} fillOpacity={0.8} />
                  <Line type="monotone" dataKey="directSupply" name="B2B 직공급률(%)" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{r:4}} />
                </ComposedChart>
              ),
              situation: "코트디부아르 등 서아프리카 핵심 산지의 자국 내 가공(Processing) 비율이 23년 12%에서 25년 35%로 급증하며, 원물 반출이 강력히 통제되고 있습니다.",
              actionPlan: "베트남 우회 수입 경로를 축소하고, 아프리카 현지 가공공장과 장기 B2B 직공급 계약을 체결하여 '밸류업(Value-Up)' 기반 영업망을 구축하십시오.",
              source: "아프리카 캐슈 연맹(ACA) 분기 보고서"
            })}
            {sec.id === 'S3' && d_macro_sensitivity && renderCashewWidget({
              icon: Activity, title: "거시 지표 민감도 분석 (What-If 시뮬레이터)",
              subtitle: "운임, 환율, 기후 및 프리미엄 변동에 따른 마진 임팩트",
              iconColor: "var(--color-warning)", pillar: "S3", telemetryStatus: "LIVE",
              chart: (
                <BarChart layout="vertical" data={d_macro_sensitivity} margin={{top:5, right:10, left:-10, bottom:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748b" tick={{fontSize:9}} unit="%" />
                  <YAxis type="category" dataKey="factor" interval={0} width={100} stroke="#64748b" tick={{fontSize:9}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="impact" name="영업 마진 임팩트(%)" radius={[0,4,4,0]}>
                    {d_macro_sensitivity.map((entry, index) => (
                      <Cell key={index} fill={entry.impact > 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              ),
              situation: "인도 수확기 도래에 따른 해상 운임(SCFI) 급등 리스크(-2.8%)가 원물 가격 하락폭(Drawdown)을 상쇄하고 있으며, 반대로 원달러 고환율(+4.2%) 환경은 수출 마진 스프레드(Margin Spread)을 견인하고 있습니다.",
              actionPlan: "선박 확보 및 컨테이너 선도 계약(Forward)을 통해 물류(Logistics)비 스파이크를 방어하고, 환율(FX Rate) 수혜가 극대화되는 시점에 EU 인증 프리미엄 물량을 선제적으로 밀어내십시오.",
              source: "자체 시뮬레이션 및 거시 경제 API"
            })}
            {sec.id === 'S5' && d_cnsl_esg && renderCashewWidget({
              icon: Leaf, title: "캐슈 껍질 액(CNSL) 기반 ESG 신사업 포트폴리오",
              subtitle: "부산물(CNSL) 업사이클링을 통한 부가수익 창출 비율 추정",
              iconColor: "#8b5cf6", pillar: "S5", telemetryStatus: "LIVE",
              chart: (
                <PieChart>
                  <Pie data={d_cnsl_esg} cx="50%" cy="50%" outerRadius={85} innerRadius={40} dataKey="value" nameKey="name" label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                    {d_cnsl_esg.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize:'10px'}} />
                </PieChart>
              ),
              situation: "캐슈넛 전체 중량의 70% 이상을 차지하는 껍질(CNSL) 추출물이 산업용 레진, 도료 및 차세대 바이오 에너지 원료로 급격히 재평가받고 있습니다.",
              actionPlan: "가공 과정에서 버려지던 CNSL의 직접 추출 및 정제 설비를 조기 도입하여, 탄소 배출 저감 크레딧 확보와 함께 친환경 신사업 부가가치(Value-add)를 25% 이상 창출하십시오.",
              source: "글로벌 ESG 리서치 및 대체 에너지 동향"
            })}
            {widgets.slice(sec.start, sec.end).map((w:any, wi:number) => {
              const Icon = WIDGET_ICONS[w.id] || Hexagon;
              const accent = ACCENT_COLORS[(sec.start + wi) % ACCENT_COLORS.length];
              const rawStatus = (w.telemetry || (w.isLiveApi ? 'live' : 'static'));
              const upperStatus = String(rawStatus).toUpperCase() as 'LIVE' | 'SYNCED' | 'STATIC';
              const cleanTitle = w.title.replace(/\[.*?\]\s*/g, '').replace(/\s*\([A-Za-z\s']+\)\s*/g, '');
              return (
                <React.Fragment key={w.id}>
                  {renderCashewWidget({
                    icon: Icon, title: cleanTitle,
                    subtitle: w.subtitle || '',
                    iconColor: accent, pillar: sec.id as any,
                    telemetryStatus: upperStatus, syncDate: w.syncDate || '2024.12',
                    unit: WIDGET_UNITS[w.id],
                    chart: renderChart(w),
                    situation: w.sit,
                    actionPlan: w.strat,
                    source: w.source || "* FAOSTAT 2024 데이터 기반"
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
