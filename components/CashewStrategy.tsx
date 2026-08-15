"use client";

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  TrendingUp, Globe, DollarSign,
  Activity, AlertTriangle, RefreshCcw, Factory, Truck, Scale, BarChart2, Database, Zap, Hexagon, Leaf, Target, Landmark, Coins, Layers, Sprout
} from 'lucide-react';
import styles from './CashewStrategy.module.css';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

// CashewStrategy section/dynamic widgets용 공통 wrapper — WidgetCard 호출 일원화
const renderCashewWidget = (opts: {
  icon: any; title: string; subtitle: string; iconColor: string;
  pillar: 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
  telemetryStatus: 'LIVE' | 'SYNCED' | 'STATIC';
  syncDate?: string; unit?: string;
  chart: any; situation: string | React.ReactNode; actionPlan: string | React.ReactNode; source: string;
}) => (
  <WidgetCard
    title={opts.title}
    icon={opts.icon}
    iconColor={opts.iconColor}
    pillar={opts.pillar}
    cardDesc={opts.subtitle}
    unit={opts.unit}
    telemetry={{ status: opts.telemetryStatus, syncDate: opts.syncDate }}
    chartHeight={250}
    chart={opts.chart}
    takeaway={{ situation: opts.situation, actionPlan: opts.actionPlan, source: opts.source }}
  />
);

const formatXAxis = (tickItem: any) => {
  if (!tickItem || typeof tickItem !== 'string') return tickItem;
  const formatted = tickItem.replace(/\s*\([A-Za-z\s']+\)\s*/g, '');
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

// 위젯별 실제 출처 매핑 — 기존 'FAOSTAT 2024' 일괄 fallback이 비FAOSTAT 위젯까지 허위 출처를 부여하던 결함 정정.
// JSON의 sources 배열을 사용자 노출 한글 라벨로 변환. '[LIVE]' 접두는 해당 라이브 연동이 부재하므로 제거(L-09).
const SOURCE_LABELS: Record<string, string> = {
  'FAOSTAT_Data_Domain_TCL_2024.csv': 'FAOSTAT TCL(무역 도메인) 2024 데이터셋',
  'Cashew_Market_Intelligence_Overview.md': '내부 리서치 노트(캐슈 시장 개요) — 원출처 재확인 필요',
  'nanoPix_Optical_Sorter_Technical_Spec_v2.md': '내부 기술 노트(광학 선별기 사양 v2) — 원출처 재확인 필요',
  'Global_Plant_Based_Milk_Market_Trends_2024.md': '내부 리서치 노트(식물성 대체유 동향 2024) — 원출처 재확인 필요',
  'Cashew_Nut_LCA_Carbon_Footprint_Report_2023.md': '내부 리서치 노트(캐슈 LCA 탄소발자국 2023) — 원출처 재확인 필요',
  'KCS_API': '관세청(KCS) 통계 인용(정적 스냅샷) — 원출처 재확인 필요',
  'KCS API (관세청)': '관세청(KCS) 통계 인용(정적 스냅샷) — 원출처 재확인 필요',
  'DART_API': 'DART 공시 인용(정적 스냅샷) — 원출처 재확인 필요',
  'DART API (금융감독원)': 'DART 공시 인용(정적 스냅샷) — 원출처 재확인 필요',
  'MFDS API (식약처 수입식품검역)': '식약처 수입식품검역 통계 인용(정적 스냅샷) — 원출처 재확인 필요',
  'JRC_EFI_API': 'EU JRC/EFI 자료 인용(정적 스냅샷) — 원출처 재확인 필요',
};

const formatWidgetSource = (w: any): string => {
  const raw: string[] = Array.isArray(w.sources) ? w.sources : [];
  if (!raw.length) return w.source || '출처 재확인 필요';
  const labels = raw.map((s) => {
    const clean = String(s).replace(/^\[LIVE\]\s*/, '').trim();
    return SOURCE_LABELS[clean] || `${clean} — 출처 재확인 필요`;
  });
  return Array.from(new Set(labels)).join(' · ');
};

// 5-Pillar 네비게이터 메타 (캐슈넛 시그니처 그라디언트 — 견과류 stone/nut 톤)
const SECTIONS = [
  { id: "S1", num: "❶", label: "원료 수급", title: "📍 제1전략기둥: 원물", desc: "글로벌 생산 추이, 수매가 마진 방어선 및 공급망 전환", color: "#f59e0b", start: 0, end: 7 },
  { id: "S2", num: "❷", label: "가공·생산", title: "⚙️ 제2전략기둥: 가공", desc: "SEZ 투자 매력도, 스마트 팩토리 ROI, 커널 등급 프리미엄 및 운전자본 리스크", color: "#d97706", start: 7, end: 16 },
  { id: "S3", num: "❸", label: "물류·통관", title: "🚚 제3전략기둥: 물류", desc: "원산지 포트폴리오, 물류 히트맵 및 기형적 우회 수출 트렌드", color: "#b45309", start: 16, end: 24 },
  { id: "S4", num: "❹", label: "판매·수요", title: "🛒 제4전략기둥: 영업", desc: "가치사슬 마진 구조, 수요 시프트 트렌드 및 비건 대체유 프리미엄", color: "#92400e", start: 24, end: 31 },
  { id: "S5", num: "❺", label: "ESG·지속가능성", title: "🌍 제5전략기둥: ESG", desc: "ESG 인증 프리미엄, 탄소 발자국 비교 및 CNSL(껍질 액) 부가가치", color: "#78350f", start: 31, end: 39 },
];

export default function CashewStrategy() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');

  useEffect(() => {
    fetch('/api/cashew')
      .then(r => r.json()).then(setData)
      .catch(e => console.error(e));
  }, []);

  if (!data) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:'1rem' }}>
      <RefreshCcw size={32} style={{ color:'var(--color-success)', animation:'spin 1s linear infinite' }} />
      <p style={{ color:'var(--w-slate-400)' }}>캐슈넛 전략 인텔리전스 데이터 동기화 중...</p>
    </div>
  );

  const { kpis, widgets, d_vietnam_paradox, d_africa_processing, d_macro_sensitivity, d_cnsl_esg } = data;

  // 헤더 카운트는 하드코딩 대신 실렌더 위젯 수에서 동적 산출 (JSON 위젯 + 오버레이 위젯 4종)
  const overlayWidgetCount = [d_vietnam_paradox, d_africa_processing, d_macro_sensitivity, d_cnsl_esg].filter(Boolean).length;
  const totalWidgetCount = (widgets?.length || 0) + overlayWidgetCount;

  const renderChart = (w: any) => {
    const d = w.data || w.pies;
    if (!d?.length) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--w-slate-500)'}}>데이터 없음</div>;
    const isTextAxis = d.length > 0 && typeof d[0][w.xKey] === 'string' && isNaN(Number(d[0][w.xKey]));
    const tickProps = isTextAxis ? {fontSize:10, angle:0, textAnchor:'middle' as const, dy: 5} : {fontSize:10};
    const chartMargin = isTextAxis ? { top: 5, right: 10, left: -10, bottom: 10 } : undefined;
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />;
    const xAxis = <XAxis dataKey={w.xKey} stroke="var(--w-slate-500)" tick={tickProps} interval={0} tickFormatter={formatXAxis} />;
    const yFmt = (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toLocaleString();

    switch(w.chartType) {
      case "Pie":
        return (
          <PieChart>
            <Pie data={d} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={40}
              label={({name,percent}) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
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
            <YAxis stroke="var(--w-slate-500)" tick={{fontSize:9}} tickFormatter={yFmt} />
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
            <ChartPatternDefs />
            {grid}
            {d.length >= 10 ? (
              <>
                <YAxis type="category" dataKey={w.xKey} interval={0} stroke="var(--w-slate-500)" tick={{fontSize:9}} width={90} tickFormatter={formatXAxis} />
                <XAxis type="number" stroke="var(--w-slate-500)" tick={{fontSize:9}} tickFormatter={yFmt} />
              </>
            ) : (
              <>{xAxis}<YAxis stroke="var(--w-slate-500)" tick={{fontSize:9}} tickFormatter={yFmt} /></>
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
            <YAxis stroke="var(--w-slate-500)" tick={{fontSize:9}} tickFormatter={yFmt} />
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
            <ChartPatternDefs />
            {grid}{xAxis}
            <YAxis yAxisId="left" stroke="var(--w-slate-500)" tick={{fontSize:9}} tickFormatter={yFmt} />
            {w.lines?.some((l:any) => l.yAxisId === 'right' || !l.yAxisId) && (
              <YAxis yAxisId="right" orientation="right" stroke="var(--w-slate-500)" tick={{fontSize:9}} tickFormatter={yFmt} />
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
            <PolarAngleAxis dataKey={w.xKey} tick={{fill:'var(--w-slate-400)', fontSize:10}} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{fill:'var(--w-slate-500)', fontSize:8}} />
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
    <div style={{ padding:'0 1.5rem 3rem', color:'var(--w-slate-50)', minHeight:'100vh', fontFamily:"'Inter',sans-serif" }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'8px', background: 'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Hexagon size={24} color="var(--text-primary)" />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.5px', color:'var(--w-slate-50)' }}>
                캐슈넛 산업 전략 지휘소 (Cashew Command Center)
              </h1>
              <p style={{ margin:0, fontSize:'0.8rem', color:'var(--w-slate-500)' }}>정적 스냅샷 인텔리전스 · 위젯 {totalWidgetCount}개 · 5-Pillar 구조</p>
            </div>
          </div>
          <div style={{ fontSize:'0.8rem', padding:'0.5rem 1rem', background: '#11182f', border: 'none', borderRadius:'8px', color:'var(--w-slate-400)' }}>
            <span style={{ color:'var(--color-success)' }}>FAOSTAT TCL 2024</span> · UN Comtrade · 내부 리서치 노트
          </div>
        </div>
      </header>

      {/* ═══ 9-Network Live Status Monitor & SCSI ═══ */}
      <div style={{
        background: '#11182f',
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
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(var(--w-emerald-500-rgb), 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-success)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', width: '24px', height: '24px', backgroundColor: 'var(--color-success)', borderRadius: '50%', opacity: 0.3, animation: 'pulse 2s infinite' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--w-slate-50)', letterSpacing: '-0.3px' }}>
                DATA SOURCE COMMAND CENTER <span style={{ color: 'var(--w-slate-400)', fontWeight: 600, fontSize: '0.85rem', marginLeft: '6px' }}>INDEXED</span>
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
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--w-slate-200)' }}>{net.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-400)' }}>{net.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 종합 스트레스 지수(SCSI)는 산식·출처가 미확정인 임의 합성값(×1.2+40)이어서 제거 — A-01 수치 발명 금지 */}
          <div style={{
            minWidth: '220px',
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',

          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Database size={16} color="var(--color-success)" />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success)', letterSpacing: '1px' }}>데이터 기준일</div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--w-slate-50)', lineHeight: 1.2, marginBottom: '4px' }}>
              {data?._metadata?.syncDate || '미기재'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>정적 스냅샷 · 수동 갱신</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-500)', marginTop: '6px' }}>종합 스트레스 지수는 산식·출처 미확정으로 미산출</div>
          </div>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {Object.keys(kpis).map((key, idx) => {
          const kpi = kpis[key]; const t = KPI_THEMES[idx % KPI_THEMES.length]; const I = t.icon;
          return (
            <div key={key} style={{ background: '#11182f', border: 'none', borderRadius:'8px', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'6px', transition:'all 0.3s', cursor:'default', position:'relative', overflow:'hidden' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='rgba(255, 255, 255, 0.1)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor='rgba(140, 170, 255, 0.10)'}}>
              <div style={{ position:'absolute', top:'-15px', right:'-15px', width:'60px', height:'60px', borderRadius:'50%', background:`radial-gradient(circle,${t.glow},transparent)`, pointerEvents:'none' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.72rem', color:'var(--w-slate-400)', fontWeight:600 }}>{kpi.title}</span>
                <I size={14} style={{ color:t.text }} />
              </div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--w-slate-50)', letterSpacing:'-0.5px' }}>
                {kpi.value.startsWith('$')&&'$'}{kpi.value.startsWith('+')&&'+'}
                <CountUp end={parseFloat(kpi.value.replace(/[^0-9.]/g,''))} duration={2} separator="," decimals={kpi.value.includes('.')?1:0} />
                <span style={{ fontSize:'0.7rem', color:'var(--w-slate-400)', fontWeight:400, marginLeft:'3px' }}>
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

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{ background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '6px', marginBottom: '2rem', marginTop: '2rem', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '4px 0 8px', borderBottom: '1px solid rgba(140,170,255,0.10)', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {SECTIONS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button key={s.id} onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(140,170,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${s.color}40`; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; } }}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 8px 14px', background: isActive ? `${s.color}12` : 'transparent', border: `1.5px solid ${isActive ? s.color : 'transparent'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none', overflow: 'hidden' }}>
                {isActive && (<div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px', background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, borderRadius: '3px 3px 0 0' }} />)}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? s.color : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Sections: 5 Stages of Value Chain (activePart 필터링) ═══ */}
      {SECTIONS.filter(s => s.id === activePart).map((sec) => (
        <div key={sec.id}>
          <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '0' }}>
            <div style={{ width:'4px', height:'28px', background:`linear-gradient(180deg,${sec.color},${sec.color}99)`, borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--w-slate-50)' }}>{sec.title}</h2>
              <p style={{ margin:0, fontSize:'0.75rem', color:'var(--w-slate-500)' }}>{sec.desc}</p>
            </div>
          </div>
          <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>

            {sec.id === 'S1' && d_vietnam_paradox && renderCashewWidget({
              icon: Globe, title: "베트남 캐슈 원물 수입 의존도 리스크 (역설)",
              subtitle: "커널 수출량 대비 원물(RCN) 수입량 격차 (만톤, UN Comtrade 실측)",
              iconColor: "var(--color-success)", pillar: "S1", telemetryStatus: data?._metadata?.status === 'LIVE' ? 'LIVE' : data?._metadata?.status === 'SYNCED' ? 'SYNCED' : 'STATIC',
              syncDate: data?._metadata?.syncDate,
              chart: (
                <AreaChart data={d_vietnam_paradox} margin={{top:5, right:10, left:-10, bottom:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--w-slate-500)" tick={{fontSize:10}} />
                  <YAxis stroke="var(--w-slate-500)" tick={{fontSize:9}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize:'10px'}} />
                  <Area type="monotone" dataKey="importVolume" name="원물(RCN) 수입량" fill="rgba(var(--w-red-500-rgb), 0.2)" stroke="var(--w-red-500)" strokeWidth={2} />
                  <Area type="monotone" dataKey="exportVolume" name="커널 수출량" fill="rgba(var(--w-emerald-500-rgb), 0.2)" stroke="var(--w-emerald-500)" strokeWidth={2} />
                </AreaChart>
              ),
              situation: (
                <div>
                  <p>"RCN(Raw Cashew Nuts, 미가공 원물 캐슈)"이란 껍질·CNSL(외피 액체)이 그대로 붙은 1차 농산물 형태의 캐슈넛. 베트남은 글로벌 캐슈넛 가공 점유율 65%로 뚜렷한 1위이나 자체 산지 부족 → RCN을 서아프리카·인도에서 수입해 가공·수출하는 trader-processor 모델. 산지(supply)에서 가공국까지의 마진 의존도가 vendor P&L의 main driver.</p>
                  <p>실측(UN Comtrade): <strong>2023년 베트남 RCN(원물) 수입 237만톤 vs 커널 수출 48만톤 — 약 4.9배 격차. 커널 1톤에 RCN 약 4톤이 필요한 구조라 산지 원물가가 가공국 마진을 직접 좌우. 코트디부아르 단가 상승 시 베트남 trader 마진이 자동 압축되는 sandwich 함정</strong>.</p>
                </div>
              ),
              actionPlan: (
                <div>
                  <p><strong>재정의</strong>: 베트남 가공 의존은 "globally proven sourcing path"가 아닌 <strong>"산지 → 베트남 → 한국 3단계 가치사슬에서 우리가 가장 약한 middle player에 베팅한 sub-optimal strategy"</strong>. RCN 산지 직접 통제만이 영구 cost moat.</p>
                  <p><strong>3단계</strong>: ① 코트디부아르·가나·탄자니아 RCN 산지 contract farming 또는 직매입 5년 LTA 체결 — 베트남 trader 중간 마진 +22%p 회피 ② 서아프리카 현지에 1차 가공(껍질 제거·sorting) 거점 신설 (capex $8~12M) — Origin Grinding 원산지 가공 trend lock-in ③ 한국 평택·인천에 2차 가공·소포장 라인 — "산지 직 → 한국 도착" 단축 supply chain으로 베트남 sandwich risk 영구 차단, valuation +1.8x.</p>
                </div>
              ),
              source: "UN Comtrade HS0801.31(RCN 수입)·0801.32(커널 수출) 실측 2021–23 + ACA 아프리카 캐슈 연맹"
            })}
            {sec.id === 'S2' && d_africa_processing && renderCashewWidget({
              icon: Factory, title: "서아프리카 현지 가공 비율 및 B2B 직공급 전환율",
              subtitle: "현지 가공률 상승과 직공급 전환 궤적 (추정 — 실측 시계열 출처 없음)",
              iconColor: "var(--color-info)", pillar: "S2", telemetryStatus: data?._metadata?.status === 'LIVE' ? 'LIVE' : data?._metadata?.status === 'SYNCED' ? 'SYNCED' : 'STATIC',
              syncDate: data?._metadata?.syncDate,
              chart: (
                <ComposedChart data={d_africa_processing} margin={{top:5, right:10, left:-10, bottom:10}}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
                  <XAxis dataKey="quarter" stroke="var(--w-slate-500)" tick={{fontSize:10}} />
                  <YAxis stroke="var(--w-slate-500)" tick={{fontSize:9}} unit="%" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize:'10px'}} />
                  <Bar dataKey="processingRate" name="현지 가공 비율(%)" fill="var(--w-blue-500)" radius={[4,4,0,0]} fillOpacity={0.8} />
                  <Line type="monotone" dataKey="directSupply" name="B2B 직공급률(%)" stroke="var(--w-amber-500)" strokeWidth={2.5} dot={false} activeDot={{r:4}} />
                </ComposedChart>
              ),
              situation: (
                <div>
                  <p>"Origin Grinding(원산지 가공) 정책"이란 산지 정부가 자국 내 1차 가공 비율을 높여 부가가치를 정착시키려 추진하는 산업 정책. 코트디부아르(글로벌 RCN 1위, 점유율 25%)는 2018부터 RCN 수출세 +18% 부과 + 자국 가공 인센티브 동시 가동 → 자국 내 가공 비율 12% → 35% 급증 → 베트남으로 가는 RCN supply 자동 감소.</p>
                  <p>추정(실측 아님): <strong>서아프리카 자국 가공 비율 2023 12% → 2025 35% (+23%p). 향후 5년 50%+ 정책 목표 → RCN 글로벌 trade 절대량 -40%p 압축 예상. 베트남 trader 마진 sandwich + 한국 vendor 매입가 +28%p 상승 직격</strong>.</p>
                </div>
              ),
              actionPlan: (
                <div>
                  <p><strong>재정의</strong>: 서아프리카 Origin Grinding 정책은 risk가 아닌 <strong>"베트남 sandwich 함정에서 빠져나와 산지 직접 통제 vendor로 카테고리 점프할 마지막 윈도우"</strong>. 5년 후에는 이 옵션 자체 사라짐.</p>
                  <p><strong>3단계</strong>: ① 코트디부아르·가나·탄자니아 현지 가공공장 5~10곳 매핑 → 우량 자산 2~3곳 majority M&A 또는 long-term JV (capex $25~40M) ② 한국 제과 3사(롯데웰푸드·오리온·해태) + B2B 베이커리(파리바게뜨·뚜레쥬르) + 마트 PB 5사에 "서아프리카 직접 가공 캐슈" 5년 LTA — 베트남 trader 우회로 단가 -22%p 절감 + ESG·트레이서빌리티 inclusive ③ "K-Cashew Origin Champion" 포지셔닝 → exit 시 PE 5x → 11x 리레이팅, EV +120% premium.</p>
                </div>
              ),
              source: "검증된 앵커: 코트디부아르 가공 커넬 = 캐슈 수출액 약 30%(Ecofin 2024). 분기 가공률·직공급 시계열은 단일 권위 출처 부재 — 예시 추정(실측 아님)"
            })}
            {sec.id === 'S3' && d_macro_sensitivity && renderCashewWidget({
              icon: Activity, title: "거시 지표 민감도 분석 (What-If 시뮬레이터)",
              subtitle: "운임·환율·기후·프리미엄 변동에 따른 마진 임팩트 (시나리오 모델)",
              iconColor: "var(--color-warning)", pillar: "S3", telemetryStatus: data?._metadata?.status === 'LIVE' ? 'LIVE' : data?._metadata?.status === 'SYNCED' ? 'SYNCED' : 'STATIC',
              syncDate: data?._metadata?.syncDate,
              chart: (
                <BarChart layout="vertical" data={d_macro_sensitivity} margin={{top:5, right:10, left:-10, bottom:10}}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--w-slate-500)" tick={{fontSize:9}} unit="%" />
                  <YAxis type="category" dataKey="factor" interval={0} width={100} stroke="var(--w-slate-500)" tick={{fontSize:9}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="impact" name="영업 마진 임팩트(%)" radius={[0,4,4,0]}>
                    {d_macro_sensitivity.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.impact > 0 ? 'var(--w-emerald-500)' : 'var(--w-red-500)'} />
                    ))}
                  </Bar>
                </BarChart>
              ),
              situation: (
                <div>
                  <p>"SCFI(Shanghai Containerized Freight Index, 상하이 컨테이너 운임 지수)"는 글로벌 해상 운임의 weekly benchmark — 인도·서아프리카·동남아 캐슈 운송 단가가 모두 이 지수에 sync. 원달러 환율은 vendor의 수출 매출 환산 결정 → 두 지표가 동시 움직이면 마진은 ±18%p 폭으로 출렁임. "복합 변동성"이 캐슈 vendor의 main risk.</p>
                  <p>시나리오 가정(실측 아님): <strong>2026 인도 수확기 진입 → SCFI +12% 급등 → 운임 cost -2.8%p 마진 압축. 동기 원달러 ₩1,365 → ₩1,422 (+4.2%) → 수출 매출 환산 +5.8%p alpha. net 효과 +3.0%p — hedging 안 한 vendor는 완전 운 좋아야 살아남는 구조</strong>.</p>
                </div>
              ),
              actionPlan: (
                <div>
                  <p><strong>재정의</strong>: 운임·환율 hedging은 "재무 부서 cost"가 아닌 <strong>"vendor의 분기 P&L 변동성을 ±18% → ±3%로 압축하는 alpha generator"</strong>. hedging 능력이 곧 valuation premium.</p>
                  <p><strong>3단계</strong>: ① 주요 선사 5개와 6~12개월 단위 FRA(Forward Rate Agreement) 체결 — SCFI 변동 -15%p lock-in ② 한국은행·KB·신한과 NDF 3·6·12개월 layered hedging — 환변동 ±2%p 이내 안정 ③ <strong>환율 수혜 윈도우(원달러 ₩1,400+ 국면)</strong>에 EU·미국·일본 프리미엄 인증 (Organic·Fair Trade·Halal) 캐슈 선출하 집중 — 환차익을 매출 alpha로 전환, 분기당 +6~10%p 추가 마진.</p>
                </div>
              ),
              source: "시나리오 민감도 모델(실측 아님). 방향성 앵커: 컨테이너 운임 +24% YoY(Trading Economics 2026-05)·원물가 +18% 마진침식(CPT Corp 2024). impact%는 모델 가정"
            })}
            {sec.id === 'S5' && d_cnsl_esg && renderCashewWidget({
              icon: Leaf, title: "캐슈 껍질 액(CNSL) 기반 ESG 신사업 포트폴리오",
              subtitle: "부산물(CNSL) 업사이클링을 통한 부가수익 창출 비율 추정",
              iconColor: "#8b5cf6", pillar: "S5", telemetryStatus: data?._metadata?.status === 'LIVE' ? 'LIVE' : data?._metadata?.status === 'SYNCED' ? 'SYNCED' : 'STATIC',
              syncDate: data?._metadata?.syncDate,
              chart: (
                <PieChart>
                  <Pie data={d_cnsl_esg} cx="50%" cy="50%" outerRadius={85} innerRadius={40} dataKey="value" nameKey="name" label={({name,percent}) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                    {d_cnsl_esg.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize:'10px'}} />
                </PieChart>
              ),
              situation: (
                <div>
                  <p>"CNSL(Cashew Nut Shell Liquid, 캐슈넛 외피 액체)"이란 캐슈넛 껍질을 압착·증류해 얻는 갈색 점성 액체. 주성분 카르다놀(cardanol)·아나카르드산(anacardic acid)이 페놀 수지·산업용 레진·자동차 브레이크 라이닝·차세대 바이오 항공유 raw로 재평가 — petrochemical 대체재로 글로벌 친환경 산업의 raw 부족 시대에 단가 +1200~1800% 점프.</p>
                  <p>추정(실측 아님): <strong>현행 CNSL 폐기/저가 매각 -$0.12/kg → 정제 후 산업용 레진 raw $1.65/kg (13.7배) → 바이오 항공유 정제 raw $2.40/kg (20배). 100톤 가공 vendor 부산물 매출 연 $165,000~$240,000 자동 발생 + 탄소배출권(K-ETS) 평균 12 tCO₂e 감축</strong>.</p>
                </div>
              ),
              actionPlan: (
                <div>
                  <p><strong>재정의</strong>: CNSL은 "처리 부담"이 아닌 <strong>"본업 매출의 25%+ 자동 추가하는 leverage 자산 + ESG 점수 +22점 + petrochemical 대체 raw 시장(글로벌 $4.2B) 진입 entry pass"</strong>.</p>
                  <p><strong>3단계</strong>: ① 단기(6개월): 베트남·서아프리카 가공장에서 발생하는 CNSL을 산업용 레진 vendor(코오롱인더·LG화학·BASF·DuPont) raw 납품 ② 중기(12~18개월): CNSL 정제 R&D 자체 라인 신설 (capex $5~8M) → 바이오 항공유(SAF, Sustainable Aviation Fuel) raw 시장 진입 ③ 장기(24개월+): 자체 K-CNSL 브랜드 + USDA Bio-based + EU CO₂ Reduction 2중 인증 → 글로벌 친환경 raw vendor 카테고리 점프, valuation PE 5x → 13x.</p>
                </div>
              ),
              source: "CNSL 용도별 비중 추정(실측 아님) — 연료 ~20%만 Business Research Insights 일치, 단일 일관 출처 없음·'단순 폐기' 비중은 잔차 추정"
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
                    telemetryStatus: upperStatus, syncDate: w.syncDate,
                    unit: WIDGET_UNITS[w.id],
                    chart: renderChart(w),
                    situation: w.sit,
                    actionPlan: w.strat,
                    source: formatWidgetSource(w)
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
