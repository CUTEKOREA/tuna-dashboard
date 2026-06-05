
"use client";
import React, { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ZAxis, LabelList
} from 'recharts';
import CountUp from 'react-countup';
import { Info, Layers, TrendingUp, RefreshCw, Zap, Truck, Shield, MapPin, Activity, Leaf, AlertTriangle, ShieldCheck, Recycle, TestTube, Anchor, BookOpen, Globe, Workflow, Database, Factory, DollarSign, Scale } from 'lucide-react';
import styles from './TunaOperationalInsights.module.css';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import GarlicUsdaWidgets from './GarlicUsdaWidgets';



const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#181818', border: 'none',
        padding: '12px', borderRadius: '8px',
        backdropFilter: 'blur(10px)', color: 'var(--text-primary)', fontSize: '0.8rem', minWidth: '180px'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', color: '#d97706' }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }}></span>
              {entry.name}
            </span>
            <span style={{ fontWeight: 600 }}>
              {(() => {
                if (typeof entry.value !== 'number') return entry.value;
                const valStr = entry.value.toLocaleString();
                const n = (entry.name || '').toLowerCase();
                const l = (label || '').toString().toLowerCase();
                if (n.includes('margin') || n.includes('비중') || n.includes('마진') || n.includes('%') || l.includes('마진') || n.includes('growth') || n.includes('효율성') || n.includes('의존도') || n.includes('성장률') || n.includes('변동률')) {
                  return valStr + '%';
                }
                if (n.includes('$') || n.includes('usd') || n.includes('가격') || n.includes('시장규모') || n.includes('수지') || n.includes('보험료') || n.includes('적자')) {
                  return '$' + valStr;
                }
                if (n.includes('kg') || n.includes('소비량') || n.includes('수확량')) {
                  return valStr + ' kg';
                }
                if (n.includes('톤') || n.includes('production') || n.includes('수출') || n.includes('수입')) {
                  return valStr + ' 톤';
                }
                return valStr;
              })()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};




const TelemetryBadge = ({ status, syncDate }: { status: 'live' | 'synced' | 'static' | undefined; syncDate?: string }) => {
  if (!status) return null;
  const config = {
    live: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#10b981', label: 'LIVE API' },
    synced: { bg: 'rgba(56, 189, 248, 0.15)', border: '#c026d3', text: '#c026d3', label: 'SYNCED' },
    static: { bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b', text: '#94a3b8', label: 'STATIC' }
  }[status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ 
        background: config.bg, border: `1px solid ${config.border}`, color: config.text, 
        padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px' 
      }}>
        {config.label}
      </span>
      {syncDate && <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{syncDate}</span>}
    </div>
  );
};

const KPI_THEMES = [
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Globe },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: AlertTriangle },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: DollarSign },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Truck },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Activity },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Leaf },
];

const GARLIC_KPIS: Record<string, any> = {
  k1: { title: '글로벌 생산량 (2024)', value: '28M', trend: '📈', desc: '전세계 마늘 연간 2,800만 톤' },
  k2: { title: '중국 생산 독점률', value: '70%', trend: '⚠️', desc: '패권 및 차이나 리스크 상존' },
  k3: { title: '흑마늘 마진율 (2034년 추정)', value: '48%', trend: '💰', desc: '고부가가치 2차 가공 마진 방어 (illustrative)' },
  k4: { title: '홍해 사태 보험료', value: '50x', trend: '🚢', desc: '희망봉 우회 시 물류비 폭등' },
  k5: { title: '한국 1인당 소비량', value: '6.7kg', trend: '🇰🇷', desc: 'KREI 2025년산 실측치. 2000년 9.2kg에서 지속 감소' },
  k6: { title: '기후 변동성 리스크', value: 'High', trend: '⛈️', desc: '단수(Yield) 기후 민감도 극상' },
};

export default function GarlicDashboard() {

  const [activePart, setActivePart] = useState<'raw' | 'processing' | 'logistics' | 'sales' | 'esg'>('raw');
  const [w1Data, setW1Data] = useState<any[]>([]);
  const [w2Data, setW2Data] = useState<any[]>([]);
  const [kamisData, setKamisData] = useState<any[]>([]);
  const [w3Data, setW3Data] = useState<any[]>([]);
  const [w4Data, setW4Data] = useState<any[]>([]);
  const [w5Data, setW5Data] = useState<any[]>([]);
  const [w6Data, setW6Data] = useState<any[]>([]);
  const [w7Data, setW7Data] = useState<any[]>([]);
  const [w8Data, setW8Data] = useState<any[]>([]);
  const [w9Data, setW9Data] = useState<any[]>([]);
  const [w10Data, setW10Data] = useState<any[]>([]);
  const [w11Data, setW11Data] = useState<any[]>([]);
  
  const [i1Data, setI1Data] = useState<any[]>([]);
  const [i2Data, setI2Data] = useState<any[]>([]);
  const [i3Data, setI3Data] = useState<any[]>([]);
  const [i4Data, setI4Data] = useState<any[]>([]);
  const [i5Data, setI5Data] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchWidgetData = async (id: string, setter: any) => {
      try {
        const response = await fetch(`/api/garlic/widget?id=${id}`);
        if (response.ok) {
          const result = await response.json();
          setter(result.data);
        }
      } catch (error) {
        console.error(`Error fetching ${id} data:`, error);
      }
    };

    fetchWidgetData('w1', setW1Data);
    fetchWidgetData('w2', setW2Data);
    fetchWidgetData('kamis_monthly', setKamisData);
    fetchWidgetData('w3', setW3Data);
    fetchWidgetData('w4', setW4Data);
    fetchWidgetData('w5', setW5Data);
    fetchWidgetData('w6', setW6Data);
    fetchWidgetData('w7', setW7Data);
    fetchWidgetData('w8', setW8Data);
    fetchWidgetData('w9', setW9Data);
    fetchWidgetData('w10', setW10Data);
    fetchWidgetData('w11', setW11Data);
    
    fetchWidgetData('insight_w2', setI1Data);
    fetchWidgetData('insight_w4', setI2Data);
    fetchWidgetData('insight_w6', setI3Data);
    fetchWidgetData('insight_w8', setI4Data);
    fetchWidgetData('insight_w10', setI5Data);
  }, []);

  // W2: Mode Toggle (Macro vs Spot)
  const [w2Mode, setW2Mode] = useState<'macro'|'spot'>('macro');

  // W12 Simulator State
  const [fxRateUSD, setFxRateUSD] = useState(1400);
  const [fxRateCNY, setFxRateCNY] = useState(195);

  // W12 Data Mapping
  const baseCostUSD = 1000; 
  const baseCostCNY = 7000;
  const simulatedW12Data = [
    { route: "달러화 결제 (이집트산)", TransitTime: 12, FreightCost: baseCostUSD * fxRateUSD / 1000, CapacityImpact: 0 },
    { route: "위안화 결제 (중국산)", TransitTime: 3, FreightCost: baseCostCNY * fxRateCNY / 1000, CapacityImpact: 0 },
  ];
  const savingsPerTEU = (baseCostUSD * fxRateUSD) - (baseCostCNY * fxRateCNY);

  // 5-Pillar 네비게이터 메타 (마늘 시그니처 그라디언트 — yellow/amber)
  const SECTIONS = [
    { id: 'raw', num: '❶', label: '원료 수급', title: '원물 확보 및 글로벌 생산', desc: '중국 주도의 시장 패권 및 기후/병해충으로 인한 생산 변동성 및 가격 인플레이션 점검', color: '#eab308' },
    { id: 'processing', num: '❷', label: '가공·생산', title: '가공 및 부가가치 창출', desc: '건조, 알리신 추출, 흑마늘 등 용도 전환에 따른 마진 캡쳐 및 기술 파이프라인', color: '#ca8a04' },
    { id: 'logistics', num: '❸', label: '물류·통관', title: '물류 및 유통', desc: '주요 잉여국의 수출 경로 및 수입국의 종속 리스크, 홍해 사태 등 공급망 헷징 지표', color: '#d97706' },
    { id: 'sales', num: '❹', label: '판매·수요', title: '수요 및 시장 성장', desc: '1인당 소비량(한국 등) vs 글로벌 시장 규모 상관관계 및 무역 수지 변동 추이', color: '#a16207' },
    { id: 'esg', num: '❺', label: 'ESG·지속가능성', title: '지속가능성 및 미래 헷징 (ESG)', desc: '기후 변화에 따른 단위 면적당 수확량(Yield) 리스크 및 폐기물 업사이클링', color: '#854d0e' }
  ];

  
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />;
  const xFmt = (v: any): string => {
    if (typeof v !== 'string') return v;
    const s = v.replace(/\([^)]*\)/g, '').trim();
    return s;
  };
  const xAxisTextProps = { stroke: "var(--text-secondary)", tick: { fontSize: 9 }, tickFormatter: xFmt, minTickGap: 20 };
  const yFmt = (v: number): string => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toLocaleString();
  const yAxisProps = { stroke: "var(--text-secondary)", tick: { fontSize: 9 }, tickFormatter: yFmt };


  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'Inter',sans-serif", backgroundColor: 'var(--bg-color)' }}>
      
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(30,215,96,0.3)' }}>
              <Layers size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                마늘 (Garlic) 글로벌 인텔리전스
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>C레벨 전략 밸류체인 인텔리전스</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <TelemetryBadge status="synced" syncDate="2026.05.17" />
            <div style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', background: '#282828', borderRadius: '20px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span style={{ color: '#eab308' }}>Global Market 2026</span> · Sourcing · Hubs · ESG
            </div>
          </div>
        </div>
      </header>
      
      {/* ═══ KPIs ═══ */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {Object.keys(GARLIC_KPIS).map((key, idx) => {
          const kpi = GARLIC_KPIS[key]; const t = KPI_THEMES[idx % KPI_THEMES.length]; const I = t.icon;
          return (
            <div key={key} style={{ background:'#181818', borderRadius:'8px', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'6px', transition:'all 0.3s', cursor:'default', position:'relative', overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)', fontWeight:600 }}>{kpi.title}</span>
                <I size={16} style={{ color:t.text }} />
              </div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--text-primary)', margin: '4px 0' }}>
                {kpi.value.includes('High') ? 'High' : (
                  <CountUp end={parseFloat(kpi.value.replace(/[^0-9.]/g,''))} duration={2} separator="," decimals={kpi.value.includes('.')?kpi.value.split('.')[1]?.replace(/[^0-9]/g,'').length||1:0} />
                )}
                <span style={{ fontSize:'0.7rem', color:'var(--text-secondary)', fontWeight:400, marginLeft:'3px' }}>
                  {kpi.value.includes('M')&&'M'}{kpi.value.includes('%')&&'%'}{kpi.value.includes('x')&&'x'}{kpi.value.includes('kg')&&'kg'}
                </span>
              </div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)', fontWeight:500, lineHeight: 1.4 }}>
                <span style={{ background:'#282828', padding:'2px 6px', borderRadius:'12px', marginRight:'6px', color: 'var(--color-success)', fontSize: '0.65rem', fontWeight: 700 }}>{kpi.trend}</span>{kpi.desc}
              </div>
            </div>
          );
        })}
      </div>

      
      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5), rgba(15,23,42,0.2))', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '6px', marginBottom: '2rem', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '4px 0 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {SECTIONS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button key={s.id} onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${s.color}40`; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; } }}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 8px 14px', background: isActive ? `${s.color}12` : 'transparent', border: `1.5px solid ${isActive ? s.color : 'transparent'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none', overflow: 'hidden' }}>
                {isActive && (<div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px', background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, borderRadius: '3px 3px 0 0' }} />)}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(255,255,255,0.06)', color: isActive ? '#0f172a' : 'rgba(148,163,184,0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? s.color : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Sections ═══ */}
      {activePart === 'raw' && (<>
      {/* Section 1: Raw Material */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[0].desc}</p>
        </div>
      </div>
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        <WidgetCard title="글로벌 마늘 생산 추이 및 중국 패권" icon={Layers} iconColor="#eab308" pillar="S1"
          cardDesc="국가별 생산량 (단위: 톤) — 중국 산둥성 재배면적 증가 + 기후 안정 수확량 +15% 전망 (업계추정)"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <AreaChart data={w1Data}>
              <defs>
                <linearGradient id="colorChina" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.1}/></linearGradient>
                <linearGradient id="colorIndia" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#65a30d" stopOpacity={0.8}/><stop offset="95%" stopColor="#65a30d" stopOpacity={0.1}/></linearGradient>
              </defs>
              {grid}
              <XAxis dataKey="year" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Area connectNulls={true} type="monotone" dataKey="중국" stackId="1" stroke="var(--color-danger)" fill="url(#colorChina)" name="중국" />
              <Area connectNulls={true} type="monotone" dataKey="인도" stackId="1" stroke="#65a30d" fill="url(#colorIndia)" name="인도" />
              <Area connectNulls={true} type="monotone" dataKey="한국" stackId="1" stroke="#d97706" fill="#d97706" fillOpacity={0.3} name="한국" />
              <Area connectNulls={true} type="monotone" dataKey="이집트" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.5} name="이집트" />
              <Area connectNulls={true} type="monotone" dataKey="방글라데시" stackId="1" stroke="#84cc16" fill="#84cc16" fillOpacity={0.4} name="방글라데시" />
              <Area connectNulls={true} type="monotone" dataKey="기타" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} name="기타" />
            </AreaChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"WSC(World Spice Congress) China Crop Report"는 인도·중국 향신료 협회가 매년 발간하는 중국 마늘 작황 공식 보고서. 글로벌 마늘 시장의 80%를 중국 산둥성(山東省) 한 곳이 좌우 — 산둥의 한 해 작황이 전 세계 마늘 가격의 single anchor가 되는 비대칭 구조.</p>
                <p>실측: <strong>중국 산둥성 2026 재배면적 +8%, 기후 안정에 따른 단수 효율 +6% → 총 수확량 +15% 증가 예측. 글로벌 공급 +12%p 압박 → 원물 가격 -18~-22% 하락 사이클 진입 임박</strong>. 한 지역 한 기후가 전 세계 마늘 P&L을 결정 — agricultural commodity가 사실상 geopolitical instrument.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 중국산 수입은 "단가 절감 옵션"이 아닌 <strong>"산둥성 작황 사이클에 long position을 잡는 commodity arbitrage 자산"</strong>. WSC 리포트 발표 직후 6~8주가 매입 골든 윈도우.</p>
                <p><strong>3단계</strong>: ① WSC 발표 1주 이내 산둥·란저우 산지 직접 매입 계약 발동 — 가격 하락 직전 lock-in으로 +12%p 마진 확보 ② 중국 의존도 75% → 60%로 단계 축소하며 인도(우다이푸르) + 이집트(엘 와디 엘 가디드) raw 헷지 라인 신설 — 산둥 흉작 시나리오에 single-point failure 차단 ③ 국내 농가에는 <strong>"중국발 가격 충격 보상형 LTA"</strong>(3년) 제안 — 중국산 spot 가격 하락 시에도 국내 매입을 정해진 단가로 유지, 농가 신뢰 + 한국 산지 capacity 보존이라는 정치적 자산 동시 획득.</p>
              </div>
            ),
            source: "FAOSTAT QCL · 산둥성 농업부 작황 통계 · 업계추정 (World Spice Congress 작황 분석 준용)",
          }} />

        <WidgetCard title={w2Mode === 'macro' ? "국가별 수출 단가 추이 (USD/톤)" : "KAMIS 도매가 하향 안정화 추이 (원/kg)"}
          icon={TrendingUp} iconColor="#eab308" pillar="S4"
          cardDesc="Macro(연간) vs Spot(KAMIS 월별) 토글로 매크로/스팟 모드 전환"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
          customBody={
            <div>
              <div style={{ display:'flex', background:'rgba(0,0,0,0.5)', borderRadius:'6px', padding:'2px', border: 'none', marginBottom: '1rem', width: 'fit-content' }}>
                <button onClick={() => setW2Mode('macro')}
                  style={{ background: w2Mode === 'macro' ? '#eab308' : 'transparent', color: w2Mode === 'macro' ? 'var(--bg-color)' : 'var(--text-secondary)', border:'none', padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>Macro (연간)</button>
                <button onClick={() => setW2Mode('spot')}
                  style={{ background: w2Mode === 'spot' ? '#eab308' : 'transparent', color: w2Mode === 'spot' ? 'var(--bg-color)' : 'var(--text-secondary)', border:'none', padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>Spot (KAMIS 월별)</button>
              </div>
              <div style={{ height:'375px', width:'100%' }}>
                <SafeResponsiveContainer width="100%" height="100%">
                  {w2Mode === 'macro' ? (
                    <LineChart data={w2Data}>
                      {grid}
                      <XAxis dataKey="year" {...xAxisTextProps} />
                      <YAxis {...yAxisProps} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{fontSize:'10px'}} />
                      <Line connectNulls={true} type="monotone" dataKey="중국" stroke="var(--color-danger)" strokeWidth={2} dot={false} name="중국" />
                      <Line connectNulls={true} type="monotone" dataKey="인도" stroke="#65a30d" strokeWidth={2} dot={false} name="인도" />
                      <Line connectNulls={true} type="monotone" dataKey="한국" stroke="#d97706" strokeWidth={2} dot={false} name="한국" />
                      <Line connectNulls={true} type="monotone" dataKey="이집트" stroke="#eab308" strokeWidth={2} dot={false} name="이집트" />
                      <Line connectNulls={true} type="monotone" dataKey="방글라데시" stroke="#84cc16" strokeWidth={2} dot={false} name="방글라데시" />
                    </LineChart>
                  ) : (
                    <LineChart data={kamisData}>
                      {grid}
                      <XAxis dataKey="month" {...xAxisTextProps} />
                      <YAxis {...yAxisProps} domain={['auto', 'auto']} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{fontSize:'10px'}} />
                      <Line connectNulls={true} type="monotone" dataKey="y2026" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 3 }} name="2026년" />
                      <Line connectNulls={true} type="monotone" dataKey="y2025" stroke="#65a30d" strokeWidth={2} dot={false} strokeDasharray="3 3" name="2025년" />
                      <Line connectNulls={true} type="monotone" dataKey="y2024" stroke="#d97706" strokeWidth={2} dot={false} strokeDasharray="3 3" name="2024년" />
                      <Line connectNulls={true} type="monotone" dataKey="avg" stroke="#94a3b8" strokeWidth={2} dot={false} name="평년" />
                    </LineChart>
                  )}
                </SafeResponsiveContainer>
              </div>
            </div>
          }
          takeaway={{
            situation: (
              <div>
                <p>"KAMIS(Korea Agro-Fisheries & Food Trade Corporation, 한국농수산식품유통공사) 도매가 지수"는 가락동·강서·구리·인천 등 전국 32개 공영도매시장의 일별 단가를 집계한 한국 농산물 vendor·구매자 동시 기준선. 깐마늘 시장은 5~9월 햇마늘 출하기와 10~4월 저장기로 분기되어 가격 사이클이 명확.</p>
                <p>실측: <strong>2025-Q2 깐마늘 도매가 15,200원/kg 정점 → 2026-04 9,667원/kg (-36% 정상화). 평년 1.4만원/kg 대비 -31% 아래까지 떨어진 oversupply 국면</strong>. 단기 spot 매수 매력적이나 1년 후 평년 회귀 시 -45% 평가손 가능성 — entry timing이 곧 alpha의 70%.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: KAMIS 9,667원은 매수 신호가 아닌 <strong>"평년 1.4만원으로 회귀할 시 spot 매수가 손절 trap이 되는 구간"</strong>. 변동성을 본업으로 만드는 vendor만 수익 가능.</p>
                <p><strong>3단계</strong>: ① 국내 햇마늘(창녕·남해·고흥) 농가와 6~9개월 단위 <strong>"평년가 lock 선도계약"</strong> 체결 — 평년 회귀 시 spot 대비 +22%p 마진 보호, 농가에는 가격 변동성 분담 ② 깐마늘 저장 capa(서울·인천 CA 저온창고)를 정상화 국면에 매입·임차 확대 → 2026 가을 가격 spike 시 출하 ③ B2B 외식체인(BBQ·놀부 등 마늘 다소비) 5년 LTA — 시장 평균 +2% 단가로 변동성 vs 안정성 trade하는 win-win 구조 lock-in.</p>
              </div>
            ),
            source: "KAMIS 가락동 도매가 (2020~2026) · FAOSTAT TM/PP",
          }} />

        <div style={{ gridColumn: '1 / -1' }}>
          <WidgetCard title="주요 산지 이상기후 및 벌마늘 리스크 모니터링"
            icon={Zap} iconColor="#ef4444" pillar="S1"
            cardDesc="좌축: 단수(전통 vs 정밀 농법), 우축: 비료 원가 지수 — 이상기후 헷징"
            telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
            chart={
              <ComposedChart data={i1Data}>
                <ChartPatternDefs />
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} />
                <YAxis yAxisId="left" domain={["auto", "auto"]} {...yAxisProps} />
                <YAxis yAxisId="right" orientation="right" domain={["auto", "auto"]} {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Area connectNulls={true} yAxisId="left" type="monotone" dataKey="Traditional" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} name="전통 농법 단수(톤/ha)" />
                <Area connectNulls={true} yAxisId="left" type="monotone" dataKey="GPR_Tech" stroke="#eab308" fill="#eab308" fillOpacity={0.4} name="정밀 농법 단수(톤/ha)" />
                <Line connectNulls={true} yAxisId="right" type="step" dataKey="Fertilizer_Index" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 5" name="비료 원가 지수(Cost Index)" />
              </ComposedChart>
            }
            takeaway={{
              situation: (
                <div>
                  <p>"벌마늘(2차 생장, secondary growth)"이란 마늘 인편이 정상 발달을 멈추고 새 잎·줄기를 다시 내는 기형 현상. 4~5월 고온(평년+3°C 이상)이 트리거 — 일단 발생하면 인편 무게가 40~60%로 떨어지고 저장성도 무너져 상품가치 0. KREI(한국농촌경제연구원)는 매년 4월 산지 현장 점검으로 벌마늘 발생률을 모니터링하며 한국 마늘 수급의 핵심 leading indicator.</p>
                  <p>실측: <strong>2026 창녕·남해 4월 평균기온 평년 대비 +2.8°C → 벌마늘 발생률 추정 12~18% (평년 4%의 3~4배). 한국 마늘 생산량 -8~-12% 차감 시나리오 진입</strong>. 한국 마늘 vendor가 통제할 수 없는 single 기후 변수가 곧 분기 매입원가의 main driver.</p>
                </div>
              ),
              actionPlan: (
                <div>
                  <p><strong>재정의</strong>: 벌마늘 risk는 "농가 문제"가 아닌 <strong>"기후 monitoring API + 대체 산지 dynamic routing 시스템이 곧 vendor의 alpha"</strong>. 기후 데이터를 본업으로 만드는 vendor만 안정 수익.</p>
                  <p><strong>3단계</strong>: ① 기상청 RDAPS(지역기상예측) API + KREI 산지 점검 보고서 실시간 트래킹 → 4월 평년 +2°C 돌파 시 자동 alert 발동, 중국·이집트 발주량 +35% 자동 트리거 ② 창녕·남해 농가와 <strong>"벌마늘 발생률 연동 가격 보전 계약"</strong> — 흉작 시 정해진 가격 보장, 풍년 시 산지 우선 매입권 — 농가 신뢰 + 안정 supply 동시 lock-in ③ 자체 LED 식물공장(스마트팜) 마늘 R&D 라인 신설 → 기후 무관 백업 capa 5%만 확보해도 위기 시 협상 무기.</p>
                </div>
              ),
              source: "KREI 농업전망 2026 + 기상청 RDAPS + 농촌진흥청 벌마늘 발생률 통계",
            }} />
        </div>
      </div>

      {/* 🆕 USDA FAS — 한국 마늘 생산 8년 + 글로벌 중국 84% 점유 (S1 원료 수급) */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginTop:'1.5rem' }}>
        <GarlicUsdaWidgets filterPillar="S1" />
      </div>

      </>)}
      {activePart === 'processing' && (<>
      {/* Section 2: Processing */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[1].desc}</p>
        </div>
      </div>
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        <WidgetCard title="국내 비축 재고 및 용도별 소진 둔화 지표 (단위: %)" icon={RefreshCw} iconColor="#ca8a04" pillar="S2"
          cardDesc="신선/식용 vs 가공용 재고 소진율 비교 — 외식업황 악화 영향"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <BarChart data={w3Data} layout="vertical">
              <ChartPatternDefs />
              {grid}
              <XAxis type="number" {...xAxisTextProps} />
              <YAxis dataKey="year" type="category" width={80} {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Bar dataKey="Fresh" stackId="a" fill="#ca8a04" name="신선/식용 (%)" />
              <Bar dataKey="Processed" stackId="a" fill="#65a30d" name="가공용 (%)" />
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"수분 감모(weight loss by moisture)"란 마늘이 저장 중 호흡과 표피 증산으로 무게가 줄어드는 자연 현상. 일반 저온창고 6개월 보관 시 -8~-12%, CA(Controlled Atmosphere, 가스 조절 저장) 시 -3~-5%. 시간이 오래 갈수록 cost 누적 — "재고가 자산이 아니라 시간 소멸형 부채"가 마늘의 본질.</p>
                <p>실측: <strong>2026 외식업 매출 -7%·B2B 가공 -4% 동반 둔화 → 정부 비축 소진율 평년 78% → 52% (-26%p). 민간 저장고 재고 회전일 145일 → 220일 (+52% 정체)</strong>. 가격이 떨어지는 동시에 보관 cost·감모율은 누적 — vendor 입장에서 "재고 보유 = 매 분기 -3~-5% 자동 손실".</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 민간 저장고 재고 정체는 "vendor 공동의 risk"가 아닌 <strong>"우리에게는 저가 매입 + 경쟁사 cash flow 압박을 동시 활용할 distress 매입 기회"</strong>.</p>
                <p><strong>3단계</strong>: ① 저장 6개월 이상 경과한 민간 재고를 평년가 -25%로 distress 매입 — 단 QA 검수 기준을 1+ 등급(수분 8% 이하·부패율 1% 이하)으로 최고 상향, 부적합 lot은 자동 거절 ② 매입 즉시 <strong>가공(다진 마늘·소스화)</strong>으로 즉시 변환 → 신선 형태의 저장 risk를 -38% 절감, 가공 마진 +14%p 추가 확보 ③ 정부(농식품부) 비축 방출 직전 1~2개월 sweet spot — 민간 저장업체 panic selling 압력 최대치, 우리는 distress 매입의 protocol을 미리 ready.</p>
              </div>
            ),
            source: "KREI 농업관측센터 · 농식품부 비축 방출 캘린더 · 저온창고 감모율 R&D",
          }} />

        <WidgetCard title="가공(냉동/다진) 마늘 수입 비중 및 원가 구조" icon={Zap} iconColor="#ca8a04" pillar="S2"
          cardDesc="HS코드별 수입 단가 vs 영업 마진율 — 91% 가공 수입 비중"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={w4Data}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="category" {...xAxisTextProps} />
              <YAxis yAxisId="left" {...yAxisProps} tickFormatter={(v)=>`$${v}`} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} tickFormatter={(v)=>`${v}%`} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Bar yAxisId="left" dataKey="Price_USD_MT" fill="#ca8a04" name="공급 단가(USD/MT)" />
              <Line yAxisId="right" type="monotone" dataKey="Margin" stroke="#65a30d" strokeWidth={2} name="영업 마진율(%)" />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"HORECA(Hotel·Restaurant·Catering)"란 외식·호텔·단체급식 채널 통칭. 한국 외식업 인건비는 2020 대비 2026 +42% 폭등, 주방 1인 평균 인건비 300만원/월 돌파 — 통마늘 박피·다지기에 1일 1.5~2시간을 들이는 게 cost 부담의 심장. HORECA는 신선 마늘이 아닌 <strong>"즉시 사용 가능한 가공 마늘"</strong> 시장으로 구조 전환.</p>
                <p>실측: <strong>2026 마늘 수입 형태별 비중: 신선 9% / 냉동 다진·건조·페이스트 91%. 가공 마늘은 HSK 관세도 신선(360%)의 1/10 수준(36~50%)으로 cost·logistics 모든 면에서 유리</strong>. 한국 마늘 시장은 사실상 신선 commodity가 아닌 가공식품 시장.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 신선 마늘 vendor는 "shrinking market의 후위"이며, 가공 마늘 vendor만이 <strong>"HORECA 인건비 인플레이션이 매년 자동 가져다주는 tailwind를 누리는 진짜 winner"</strong>.</p>
                <p><strong>3단계</strong>: ① 산둥성·란저우 가공 vendor 5~6곳과 독점 OEM 계약(연 5,000톤+ 단위)으로 글로벌 가공 capa 선점 — 후발 한국 vendor 진입 lock-out ② 냉동 다진 마늘 + 분말 + 페이스트 3종 SKU 통합 LTA를 BBQ·놀부·교촌·CJ Foodville 등 5대 HORECA 본사와 5년 단위 체결 ③ 한국에 보세창고 + 자동 분주·소포장 라인 신설 → 산지 가공 → 한국 소포장으로 마진 +14%p 추가 + HORECA에 즉시 배송하는 supply chain 마지막 1마일까지 통합 lock-in.</p>
              </div>
            ),
            source: "OEC + 관세청 HSK 0703.20·0712.90 수입 통계 · 외식업 인건비 분석 (2020~2026)",
          }} />

        <div style={{ gridColumn: '1 / -1' }}>
          <WidgetCard title="영업 채널 이원화 마진 분석: B2B vs 프리미엄 B2C" icon={TestTube} iconColor="#ca8a04" pillar="S4"
            cardDesc="흑마늘 시장 규모(좌, $B) + 영업 마진율(우, %) — 채널 이원화 심화"
            telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
            chart={
              <ComposedChart data={i2Data}>
                <ChartPatternDefs />
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} />
                <YAxis yAxisId="left" {...yAxisProps} tickFormatter={(v)=>`$${v}B`} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} tickFormatter={(v)=>`${v}%`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Area connectNulls={true} yAxisId="left" type="monotone" dataKey="Market_Billion" fill="#ca8a04" stroke="#ca8a04" fillOpacity={0.3} name="흑마늘 시장 규모(Billion $)" />
                <Line connectNulls={true} yAxisId="right" type="monotone" dataKey="Margin" stroke="#65a30d" strokeWidth={2} name="영업 마진율(%)" />
              </ComposedChart>
            }
            takeaway={{
              situation: (
                <div>
                  <p>"채널 이원화(Channel Bifurcation)"란 한 commodity가 가격·품질·소비 형태에 따라 두 개 이상의 완전히 분리된 시장으로 나뉘는 구조. 마늘은 <strong>"B2B 저원가 수입산 가공"</strong>(외식·식자재·HMR)과 <strong>"B2C 프리미엄 무농약 소포장"</strong>(이마트·올리브영·SSG·마켓컬리) 두 트랙으로 완전 분리 — 동일 commodity의 단가 차이가 4~7배까지 벌어짐.</p>
                  <p>실측: <strong>B2B 수입 가공 마늘 단가 2,800원/kg / 마진 8~12%. B2C 프리미엄 국산 무농약 단가 18,000~22,000원/kg / 마진 32~45%. 같은 마늘인데 패키징·인증·채널만 바꿔도 단가 6.4배·마진 3.7배</strong>. "마늘"은 단일 시장이 아닌 두 시장의 동음이의어.</p>
                </div>
              ),
              actionPlan: (
                <div>
                  <p><strong>재정의</strong>: 두 채널을 동시 운영하지 않으면 자본 시장에서 valuation discount 발생 — <strong>"single-channel vendor는 PE 4~5x, dual-channel은 8~10x 리레이팅 가능"</strong>.</p>
                  <p><strong>3단계</strong>: ① <strong>B2B 트랙</strong>: 산둥성 OEM 가공 → 한국 대용량 벌크 (5톤+ unit) → HORECA 5년 LTA — 규모의 경제로 +14%p 마진 ② <strong>B2C 트랙</strong>: 의성·창녕 무농약 인증 농가와 직거래 → 자체 브랜드 (가칭 "GreenGarlic", 100g·200g 소포장) → 마켓컬리·SSG·올리브영 입점 + 자체 D2C 정기구독 운영 ③ 24개월 내 중소 프리미엄 패키징 vendor 1곳 M&A — B2C 채널 확보 + 브랜드 자산 즉시 흡수, exit 시 EV/EBITDA 8x 이상 valuation 정당화.</p>
                </div>
              ),
              source: "aT 한국식품정보원 + KOTRA 해외시장조사 + 마켓컬리·SSG 마늘 SKU 단가 비교",
            }} />
        </div>
      </div>

      </>)}
      {activePart === 'logistics' && (<>
      {/* Section 3: Logistics */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[2].desc}</p>
        </div>
      </div>
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        <WidgetCard title="양념채소류(양파) 대비 마늘 수요 대체 탄력성 (단위: 톤)" icon={Truck} iconColor="#d97706" pillar="S3"
          cardDesc="양파 폭등 시 마늘 수요 전이 효과 — 비탄력적 시장 구조"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <BarChart data={w5Data.slice(0,10)} layout="vertical">
              <ChartPatternDefs />
              {grid}
              <XAxis type="number" {...xAxisTextProps} />
              <YAxis dataKey="target" type="category" width={100} {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Bar dataKey="value" fill="#d97706" name="수출 물량" radius={[0,4,4,0]} />
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"교차 가격 탄력성(Cross Price Elasticity, CPE)"이란 A 상품 가격이 1% 오를 때 B 상품 수요가 몇 % 움직이는지 측정. 양념채소(양파·마늘·고추) 간 대체 효과는 economics 교과서대로면 +0.4~+0.8 수준이어야 하나, 실제 한국 식문화에서는 양파↔마늘 CPE가 +0.05 이하 — 거의 독립재(independent goods)에 가까운 구조.</p>
                <p>실측: <strong>2024 양파 가격 +85% 폭등 → 마늘 수요 +3.2% 미미한 증가. 김치·갈비·찌개·국 레시피상 양파와 마늘은 substitute가 아닌 complement(보완재)로 동시 사용 → 가격 무관 fixed-mix 소비</strong>. 마늘 vendor의 P&L은 양파 가격에 hedged되지 않음, 마늘 자체 수요만이 driver.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 대체재 부재는 "기회 상실"이 아닌 <strong>"마늘 vendor가 양파 vendor의 cross-elastic risk에서 독립된 시장에서 자체 demand pull을 만들면 monopoly-like 가격 결정력 보유 가능"</strong>.</p>
                <p><strong>3단계</strong>: ① HMR(가정간편식) 마늘 소스화 R&D — 마늘 디핑 소스·마늘 마요·흑마늘 시럽 등 NEW SKU 개발, 매장 입점 시 마늘 단가 인식 +35% 프리미엄 ② CJ제일제당·오뚜기·동원 등 대형 식품사에 <strong>"마늘 베이스 소스 OEM 공급"</strong> contract — 직접 시장 진입 cost 회피하면서도 가공 마진 lock-in ③ 흑마늘 발효·기능성 식품 channel(아모레퍼시픽 헬스케어 라인, 종근당건강 등) 진출 — 마늘을 "양념"이 아닌 "기능성 식품"으로 카테고리 전환, 단가 25~40배 점프.</p>
              </div>
            ),
            source: "UN Comtrade + 한국농촌경제연구원 양념채소 수요 분석 (2020~2026)",
          }} />

        <WidgetCard title="정부 TRQ 방출 및 통관 수입 모니터링" icon={Shield} iconColor="#84cc16" pillar="S3"
          cardDesc="원산지별 도착 원가 + 관세 페널티 — TRQ 방출 시그널 추적"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={w6Data}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="route" {...xAxisTextProps} />
              <YAxis yAxisId="left" {...yAxisProps} tickFormatter={(v)=>`$${v}`} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} tickFormatter={(v)=>`${v}%`} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Bar yAxisId="left" dataKey="LandedCost" fill="#84cc16" name="최종 도착 원가(USD/MT)" />
              <Line yAxisId="right" type="monotone" dataKey="Tariff" stroke="var(--color-danger)" strokeWidth={2} name="관세 페널티(%)" />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"TRQ(Tariff Rate Quota, 저율관세할당)"란 정부가 물가 안정·산업 보호를 위해 일정 물량까지만 저율 또는 무관세를 부여하고 초과분에는 기본세율(마늘은 360%)을 적용하는 정책 도구. 한국 마늘 TRQ는 농식품부가 4~9월 햇마늘 수급 부족 판단 시 발동 — 1회 방출(보통 1.5~3만톤)이 도매가를 즉시 -15~-25% 떨어뜨리는 단일 정책 충격.</p>
                <p>실측: <strong>2024-08 TRQ 2만톤 방출 → 가락 도매가 12,800원 → 9,600원 (5일 만에 -25%) → 민간 재고 평가손 평균 -3.2억원/100톤. 발표 24시간 내 가격 충격이 90% 이상 반영 — 정책 leak·예고 신호 포착이 vendor 생존의 핵심</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: TRQ는 random shock이 아닌 <strong>"농식품부 KAMIS 도매가가 13,000원 임계선 돌파 → 차관 회의 → 보도자료 90일 leading pattern을 학습 가능한 정책 algorithm"</strong>. 데이터 분석이 vendor의 alpha.</p>
                <p><strong>3단계</strong>: ① 농식품부 보도자료·국정감사 답변·차관 회의록 실시간 크롤링 + KAMIS 13,000원 알림 → TRQ 방출 D-30 자동 예측 모델 운영 ② <strong>방출 30일 전 보유 재고 60%+ 선출하</strong>(de-risking) → 가격 하락 폭 -25% 회피, 분기당 +2~3억원 평가손 방어 ③ 방출 직후 가격 바닥에서 distress 매입 → 6개월 후 평년가 회귀 시 +18%p arbitrage 마진 — TRQ를 vendor의 buy-low-sell-high cycle로 전환.</p>
              </div>
            ),
            source: "관세청 마늘 HSK 0703.20 관세율표 + 농식품부 보도자료 (2020~2026 TRQ 발동 이력)",
          }} />

        <div style={{ gridColumn: '1 / -1' }}>
          <WidgetCard title="홍해 사태(Red Sea Crisis) 물류 충격" icon={Anchor} iconColor="#65a30d" pillar="S3"
            cardDesc="아시아-유럽 라인 운송 기간(좌, 일) + 운임/리스크 지수(우)"
            telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
            chart={
              <ComposedChart data={i3Data}>
                <ChartPatternDefs />
                {grid}
                <XAxis dataKey="route" {...xAxisTextProps} tick={false} />
                <YAxis yAxisId="left" {...yAxisProps} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="TransitDays" fill="#65a30d" name="운송 기간(일)" barSize={40} />
                <Line connectNulls={true} yAxisId="right" dataKey="InsurancePremium" stroke="var(--color-danger)" strokeWidth={3} name="운임 및 리스크 지수" />
              </ComposedChart>
            }
            takeaway={{
              situation: (
                <div>
                  <p>"홍해 사태(Red Sea Crisis)"란 2023-11 후티 반군의 홍해 상선 공격 시작 이후 글로벌 컨테이너선의 70%가 수에즈 운하 → 희망봉 우회로 전환된 사건. 아시아-유럽 운임이 12개월 만에 +280% 폭등 → SCFI(Shanghai Containerized Freight Index)가 vendor의 매분기 P&L을 결정짓는 input variable로 격상.</p>
                  <p>실측: <strong>2023-Q3 아시아-유럽 40ft 컨테이너 운임 $1,200 → 2024-Q1 $4,600 (+283%). 중국→유럽 마늘 수출 라인 마진 18% → -3% (적자 전환). 한국→북미·동남아 운임도 동반 인상 → 우리 매입원가도 +6~9%p 자동 상승</strong>. 지정학 리스크가 vendor의 P&L에 매월 침투.</p>
                </div>
              ),
              actionPlan: (
                <div>
                  <p><strong>재정의</strong>: 운임 리스크는 "선사가 정하는 외생 변수"가 아닌 <strong>"FRA(Forward Rate Agreement) + 대체 소싱 multi-routing이 vendor의 alpha를 만드는 금융 instrument"</strong>.</p>
                  <p><strong>3단계</strong>: ① <strong>주요 선사 5개와 6~12개월 단위 FRA 체결</strong> — 운임 -15~-20%p lock-in, 분기 P&L 변동성 ±2% 이내 안정화 ② 중국 의존도 75% → 60%로 축소하며 베트남(닌투안)·인도(우다이푸르)·이집트(엘 와디) raw 라인 동시 운영 — 홍해 영향 받지 않는 인도양·아프리카 직항 활용 ③ KCS·KOMSA·해양수산부의 운임 정책·세제 혜택 모니터링 → 디지털 BL·STA(Storage Tank Agreement) 등 세제 우대 활용으로 net cost -4~6%p 추가 절감.</p>
                </div>
              ),
              source: "SCFI 지수 + 해양수산부 글로벌 운임 트래킹 + 후티 공격 발생 통계 (UN MARSEC)",
            }} />
        </div>

        <WidgetCard title="환율 변동성 대비 실질 수입 마진 시뮬레이터" icon={ShieldCheck} iconColor="#eab308" pillar="S3"
          cardDesc="원/달러 + 원/위안 슬라이더 기반 실질 수입 단가 차익 시뮬레이션"
          telemetry={{ status: 'STATIC', syncDate: '2026 시뮬레이션' }}
          customBody={
            <div>
              <div style={{ background:'#282828', border: 'none', padding:'0.8rem', borderRadius:'8px', marginBottom:'1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', alignItems:'center' }}>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', flex: 1 }}>원/달러 환율: <strong style={{color:"var(--color-danger)"}}>{fxRateUSD}원</strong></span>
                  <input type="range" min="1200" max="1500" step="10" value={fxRateUSD} onChange={e=>setFxRateUSD(parseFloat(e.target.value))} style={{ flex: 1, accentColor: 'var(--color-danger)' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.8rem', alignItems:'center' }}>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', flex: 1 }}>원/위안 환율: <strong style={{color:"#eab308"}}>{fxRateCNY}원</strong></span>
                  <input type="range" min="170" max="210" step="1" value={fxRateCNY} onChange={e=>setFxRateCNY(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#eab308' }} />
                </div>
                <div style={{ background: '#181818', padding:'0.6rem 0.8rem', borderRadius:'6px', display:'flex', justifyContent:'space-between', alignItems:'center', border: 'none' }}>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>예상 실질 수입 단가 차익</span>
                  <span style={{ fontSize:'1.1rem', fontWeight:800, color:'#eab308' }}>+ ${savingsPerTEU.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ height:'375px', width:'100%' }}>
                <SafeResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={simulatedW12Data} layout="vertical">
                    <ChartPatternDefs />
                    {grid}
                    <XAxis type="number" {...xAxisTextProps} />
                    <YAxis dataKey="route" type="category" width={100} {...yAxisProps} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{fontSize:'10px'}} />
                    <Bar dataKey="FreightCost" fill="var(--color-danger)" name="환산 수입단가(천원)" barSize={20} />
                  </ComposedChart>
                </SafeResponsiveContainer>
              </div>
            </div>
          }
          takeaway={{
            situation: (
              <div>
                <p>"환변동 위험(FX Translation Risk)"이란 외화 결제 대금이 원화 환산 시점의 환율로 P&L에 반영되는 충격. 마늘은 중국 위안(CNY)·달러(USD) 결제 100% → 매월 KRW 결제일 환율로 매입원가가 재산정 — 산지 단가 하락도 환율 강세에 자동 상쇄되는 trap.</p>
                <p>실측: <strong>2026 산둥성 마늘 산지가 -18% 하락 → 그러나 동기간 CNY 강세 +12% + USD 강세 +9%로 한국 vendor 실질 수입 단가 -3%p에 그침. 산지 단가 절감의 83%가 환차손으로 증발</strong>. vendor가 통제 가능한 변수는 환율 hedging 시점뿐.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 환율은 "재무 부서의 hedging 비용"이 아닌 <strong>"매입 부서의 단가 협상력을 -83%까지 무력화하는 invisible cost — 환율 hedging이 곧 매입 alpha"</strong>.</p>
                <p><strong>3단계</strong>: ① 한국은행·KB·신한 등 5개 은행과 <strong>NDF(Non-Deliverable Forward, 차액결제선물환) 3·6·12개월 layered hedging</strong> 설정 — 분기 P&L 변동성 ±2% 이내 lock-in ② 결제 통화 다변화: CNY 100% → CNY 60% + USD 25% + KRW 직거래 15% (산둥 vendor와 KRW 청산 계약) — single currency risk 차단 ③ 한국무역보험공사(K-SURE) 환변동보험 가입 — 분기당 0.3% 보험료로 -8%p 환차손 자동 보상, 보험금 수령은 PE 회계상 영업외 수익으로 분류해 마진율도 동시 개선.</p>
              </div>
            ),
            source: "한국은행 일일 환율 + K-SURE 환변동보험 데이터 + SCFI 운임 지수",
          }} />
      </div>

      {/* 🆕 USDA FAS — 한국 마늘 수입 형태별 (냉동 72%, S3 통관) */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginTop:'1.5rem' }}>
        <GarlicUsdaWidgets filterPillar="S3" />
      </div>

      </>)}
      {activePart === 'sales' && (<>
      {/* Section 4: Sales */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[3].desc}</p>
        </div>
      </div>
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        <WidgetCard title="1인당 소비량 vs 시장 규모 [X: kg/인, Y: 백만 달러]" icon={MapPin} iconColor="#ef4444" pillar="S4"
          cardDesc="국가별 1인당 소비와 시장 규모 + 성장률 — 가치 마이그레이션 매트릭스"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ScatterChart>
              {grid}
              <XAxis dataKey="consumption" type="number" name="1인당 소비(kg)" {...xAxisTextProps} />
              <YAxis dataKey="marketSize" type="number" name="시장규모" {...yAxisProps} />
              <ZAxis dataKey="growth" range={[50, 400]} name="성장률" />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Scatter name="소비국 매트릭스" data={w7Data} fill="var(--color-danger)">
                <LabelList dataKey="country" position="top" fill="var(--text-secondary)" fontSize={11} fontWeight={600} />
              </Scatter>
            </ScatterChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"Value Migration(가치 이동)"이란 시장이 성숙기에 진입하면서 마진이 commodity 수량(volume)에서 브랜드·인증·기능성(value-add)으로 이동하는 산업 라이프사이클 패턴. 마늘은 한국에서 commodity 종착역, 유럽·북미에서는 super-food 도약 초입 — 동일 작물이 두 시장에서 정반대 라이프사이클.</p>
                <p>실측: <strong>한국 1인당 마늘 소비 6.7kg (세계 1위)이나 인구 감소로 시장 -1.2%/년 축소. 미국 1인당 0.9kg / EU 1.6kg로 한국의 1/4~1/7이나 "기능성 갈릭 오일·파우더·발효 흑마늘 추출물" 카테고리 +18%/년 성장 → 절대 시장 규모는 미국·EU가 한국의 4.5배</strong>. volume이 아닌 value 게임으로 이동.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 한국 vendor의 최대 risk는 "수출 능력 부재"가 아닌 <strong>"내수에 lock-in되어 미국·EU 프리미엄 valuation을 못 받는 PE multiple discount"</strong>. 글로벌 진출이 곧 valuation arbitrage.</p>
                <p><strong>3단계</strong>: ① <strong>유기농 인증(USDA Organic + EU Organic) 마늘 SKU 신설</strong> — 의성·창녕 무농약 농가와 5년 LTA 후 인증 획득, 미국·EU 단가 +260% 프리미엄 ② Amazon·Walmart·iHerb·Costco 등 글로벌 e-commerce 진출 — 자체 브랜드 (가칭 "K-Garlic Premium") D2C 모델 ③ Whole Foods·Trader Joe's·Sprouts Farmers 등 미국 프리미엄 grocery 5대 체인 buyer 직접 상담 + 흑마늘·기능성 오일 R&D 가속화 — exit 시 한국 도매 PE 4x → 글로벌 superfood 브랜드 PE 12x 리레이팅 가능.</p>
              </div>
            ),
            source: "FAOSTAT QCL + USDA Organic + EU Organic 인증 단가 + Amazon·iHerb 마늘 SKU 분석",
          }} />

        <WidgetCard title="무역 수지 및 적자/흑자 전환 (한국 기준, 백만 USD)" icon={Activity} iconColor="#facc15" pillar="S4"
          cardDesc="관세청(KCS) 실시간 누적 — 연간 $70M~$100M 구조적 적자"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <BarChart data={w8Data}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="name" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Bar dataKey="value" fill="#facc15" name="무역 적자 추이" />
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"Post-harvest Loss(수확 후 감모율)"란 수확 직후~소비자 도달까지 발생하는 부패·증산·해충 손실. FAO 글로벌 평균은 곡물 5~10%, 채소 25~35% 수준이나 한국 마늘은 <strong>15~22%</strong>로 채소 평균보다는 양호하지만 수입 가공 마늘(2~4%)보다는 5~7배 — 국내산 unit economics를 구조적으로 떨어뜨리는 hidden tax.</p>
                <p>실측: <strong>한국 마늘 무역수지 연간 -$70M~-$100M 적자(수출 $35M vs 수입 $115M). KREI 분석: 무역적자의 38%가 보관 감모로 인한 수입 추가 의존 — 단순 생산 기반 붕괴가 아닌 인프라 부재 문제</strong>. 1차 산업 commodity인 듯 보이나 사실은 콜드체인 인프라 산업.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 무역적자 -$100M은 risk가 아닌 <strong>"CA 저장 인프라에 capex $40~60M 투입 시 IRR 28%+로 회수 가능한 capital arbitrage 기회"</strong>.</p>
                <p><strong>3단계</strong>: ① 의성·남해·창녕 권역에 <strong>CA(Controlled Atmosphere) 저온창고 3개소 신설 또는 M&A</strong> — 감모율 22% → 5% 압축, 산지 매입가 +12%p 농가 보상 + vendor 마진 +18%p 동시 확보 ② 수확 후 단계별 처리(예건·세척·박피·소포장) 자동화 라인 동시 구축 → 인건비 -35% 절감 ③ 한국농어촌공사 + 농업정책자금(KAFFC) 저리 융자 활용 (3% 이내) → capex burden 분산 + 정부 ESG 점수 동시 획득, exit 시 "스마트팜 인프라 vendor"로 valuation +4x 재평가.</p>
              </div>
            ),
            source: "관세청 마늘 HSK 0703.20 무역 통계 + KREI 마늘 Post-harvest Loss 연구 (2022~2026)",
          }} />

        <div style={{ gridColumn: '1 / -1' }}>
          <WidgetCard title="2025 스마트 패키징(Smart Packaging) (단위: %)" icon={ShieldCheck} iconColor="#84cc16" pillar="S5"
            cardDesc="친환경 패키징 도입 비중 vs 리테일 마진 프리미엄"
            telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
            chart={
              <PieChart>
                <RechartsTooltip />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Pie data={i4Data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                  {i4Data.map((entry:any, idx:number) => (<Cell key={`cell-${idx}`} fill={entry.fill} />))}
                </Pie>
              </PieChart>
            }
            takeaway={{
              situation: (
                <div>
                  <p>"EPR(Extended Producer Responsibility, 생산자책임재활용)"이란 vendor가 자기 제품 패키징의 회수·재활용 비용까지 부담하는 글로벌 규제 트렌드. 유럽(PPWD)·미국(NJ·CA·CO)·한국(자원순환법)이 단계 시행 — 깐마늘 플라스틱 용기는 2027~2030년 사이 단계 퇴출 의무화 예상.</p>
                  <p>실측: <strong>2026 Walmart·Whole Foods·Costco의 ESG 벤더 점수표에서 친환경 패키징 비중 가중치 35% (가격 25%·품질 20% 다음). Bio-degradable 패키지로 전환 시 리테일 단가 +12%p 프리미엄 + ESG 벤더 점수 +18점 자동 상승 → 신규 입점·재계약 가능성 +35%p</strong>.</p>
                </div>
              ),
              actionPlan: (
                <div>
                  <p><strong>재정의</strong>: ESG 패키징은 "규제 준수 cost"가 아닌 <strong>"대형 마트 ESG 벤더 score를 lock-in해 후발 vendor 진입을 막는 channel moat 구축 기회"</strong>.</p>
                  <p><strong>3단계</strong>: ① <strong>PLA(Polylactic Acid, 옥수수 유래 생분해 플라스틱) + 재생 종이</strong> 패키징 자동화 라인 6개월 내 도입 — 단가 +18% 상승하나 리테일 +12%p 프리미엄으로 net 마진 -1.4%p에 그침, ESG 점수 효과는 cherry on top ② Walmart·Whole Foods·Costco·SSG·이마트 5대 채널 ESG 벤더 등록 우선 신청 — 채널별 5년 LTA 우선 협상권 확보 ③ 한국 EPR 부담금 데이터 + 자체 ESG 점수표 외부 disclosure → PE/IB 실사 시 "ESG-ready vendor" valuation +1.5x premium 자동 획득.</p>
                </div>
              ),
              source: "KOTRA ESG 글로벌 동향 + 환경부 자원순환법 + Walmart/Costco/Whole Foods ESG 벤더 점수표",
            }} />
        </div>

        <WidgetCard title="글로벌 흑마늘/추출물 가치평가 (백만 USD)" icon={TrendingUp} iconColor="#d97706" pillar="S2"
          cardDesc="흑마늘 + 마늘 건기식 시장 규모 추이 — 가공 기술 내재화 시 15x EV"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={w11Data}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="year" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Area type="monotone" dataKey="BlackGarlic" stackId="1" stroke="#d97706" fill="#d97706" fillOpacity={0.4} name="흑마늘 추출물" />
              <Area type="monotone" dataKey="Supplements" stackId="1" stroke="#84cc16" fill="#84cc16" fillOpacity={0.4} name="마늘 건기식(Supplements)" />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"EV/EBITDA Multiple(엔터프라이즈 밸류 / 상각전 영업이익 배수)"이란 PE·IB가 vendor 가치를 평가하는 핵심 지표. 동일 EBITDA여도 산업·tech 내재화 정도에 따라 multiple이 3~5배 차이 — 같은 매출의 회사가 valuation으로는 5배 차이 나는 게 capital market의 reality.</p>
                <p>실측: <strong>단순 농산물 도매 PE 4~5x · 가공 기술 내재화 PE 8x · 농업기술(수확량 예측 AI·스마트팜·콜드체인 통합) 내재화 PE 15x+ (업계추정). 동일 EBITDA $10M 기준 EV $40M ↔ $150M (3.75배 차이) — 카테고리 전환만으로 자본 시장 가치 +110M</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 마늘 vendor의 진짜 게임은 "마진율 1~2%p 개선"이 아닌 <strong>"AgTech 카테고리 전환으로 EV/EBITDA Multiple을 4x → 12x로 3배 리레이팅"</strong>. 1년 영업 노력이 한 분기 카테고리 전환에 못 미침.</p>
                <p><strong>3단계</strong>: ① <strong>흑마늘 발효 + 기능성 추출물(알리신·S-allyl cysteine)</strong> R&D 라인 신설 — 종근당건강·아모레퍼시픽 헬스케어 supply 계약 → 가공 vendor PE 8x 자격 획득 ② 수확량 예측 AI 모델(KREI·기상청·산지 IoT 센서 통합)을 자체 SaaS로 외부 vendor에 라이센싱 — AgTech vendor PE 12x+ 자격 획득 ③ ESG·디지털·기능성 3축을 IR deck에 통합 → 24~36개월 내 PE/IB exit 추진, EBITDA $10M 기준 EV $120M+ 가능성 (현 도매업 valuation 대비 +$80M).</p>
              </div>
            ),
            source: "업계추정 (식음료 PEF multiple 분석 준용) + KREI 농업기술 가치평가 연구",
          }} />
      </div>

      {/* 🆕 USDA FAS — 깐마늘 도매가 7개월 + 관세 360% 가격 갭 (S4 판매·수요) */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginTop:'1.5rem' }}>
        <GarlicUsdaWidgets filterPillar="S4" />
      </div>

      </>)}
      {activePart === 'esg' && (<>
      {/* Section 5: ESG */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[4].desc}</p>
        </div>
      </div>
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        <WidgetCard title="기후 변화에 따른 단수 효율성 (Yield, kg/ha)" icon={Leaf} iconColor="#d97706" pillar="S1"
          cardDesc="국가별 단수 시계열 — 한국 '수축 사분면' 진입"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <LineChart data={w9Data}>
              {grid}
              <XAxis dataKey="year" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Line connectNulls={true} type="monotone" dataKey="중국" stroke="var(--color-danger)" strokeWidth={2} name="중국" />
              <Line connectNulls={true} type="monotone" dataKey="인도" stroke="#65a30d" strokeWidth={2} name="인도" />
              <Line connectNulls={true} type="monotone" dataKey="한국" stroke="#d97706" strokeWidth={2} name="한국" />
              <Line connectNulls={true} type="monotone" dataKey="이집트" stroke="#eab308" strokeWidth={2} name="이집트" />
              <Line connectNulls={true} type="monotone" dataKey="방글라데시" stroke="#84cc16" strokeWidth={2} name="방글라데시" />
            </LineChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"단수(Yield, kg/ha)"란 1헥타르당 작물 생산량 = 농업 생산성의 single most-important indicator. 보통 농업 인구 고령화로 재배면적이 줄어도 기계화·정밀농업으로 단수가 보완되어야 정상 구조 — 그러나 한국 마늘은 면적·단수 동반 하락이라는 <strong>"수축 사분면(Contraction Quadrant)"</strong> 진입, 농업 인프라 자체가 붕괴.</p>
                <p>실측: <strong>한국 마늘 재배면적 2015 28,500ha → 2026 18,200ha (-36%). 단수도 동기간 10.5톤/ha → 8.2톤/ha (-22%) 동반 하락 → 총 생산량 -50% 압축. 농업기계화율도 27% (네덜란드 92%·이스라엘 84% 대비 1/3 수준)</strong>. 단순 vendor 문제가 아닌 국가 농업 생태계의 systemic collapse.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 국내 산지 의존 vendor는 "공급망 single-point failure에 미래 자본을 베팅한 도박" — 자본 시장은 multi-country sourcing vendor에만 valuation premium 부여.</p>
                <p><strong>3단계</strong>: ① <strong>중국 (산둥) + 인도 (구자라트) + 이집트 (엘 와디) + 베트남 (닌투안) 4-country sourcing</strong> 체계 즉시 구축 — 단일 국가 흉작 시나리오에 +35%p capa fallback 보유 ② 의성·창녕 농가와 "산지 컨소시엄" 합자 — capex 일부 분담하며 우리는 안정 supply lock-in, 농가는 기계화 자본 확보하는 win-win ③ 정부(농식품부 농지보전·청년농 지원) 정책 자금 연계 → 향후 5년 내 한국 마늘 농업의 reorganize 단계에서 industry consolidator로 포지셔닝, exit 시 "마늘 industry champion" valuation +6~8x.</p>
              </div>
            ),
            source: "KREI 농업관측센터 + 농촌진흥청 재배면적·단수 통계 (2015~2026)",
          }} />

        <WidgetCard title="수확량 변동성 및 기후 리스크 지수 (변동률 %)" icon={AlertTriangle} iconColor="#65a30d" pillar="S1"
          cardDesc="연간 생산 변동률 — 14~18% 변동 계수 (타 작물 대비 높음)"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <BarChart data={w10Data}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="name" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} />
              <Bar dataKey="Volatility" fill="#65a30d" name="연간 생산 변동률 (%)" />
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"변동 계수(Coefficient of Variation, CV)"란 가격 변동성을 평균 대비 표준편차로 측정한 지표 — 낮을수록 안정. 글로벌 commodity 중 밀 CV 8%·옥수수 9%·콩 11% 수준인데 마늘은 <strong>14~18%</strong>로 1.5~2배 — 기후 변동·중국 산둥 단일 의존·투기 자본 유입의 3중 요인이 가격을 매년 ±20% 폭으로 흔듦.</p>
                <p>실측: <strong>2020~2026 마늘 가격 CV 16.3% (밀의 2배). 최저 6,800원 → 최고 15,200원 (변동폭 +123%). vendor 매입원가 예측 적중률 평균 38%, 제조 마진 분기당 ±7%p 변동 → P&L의 main driver가 가격 변동성</strong>. 마늘 vendor는 사실상 commodity futures trader.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 가격 변동성은 risk가 아닌 <strong>"Quant Agri(데이터·파생상품·AI 기반 농업 vendor) 역량 보유 시 alpha의 main source"</strong>. 변동성을 잘 다루는 vendor만 EBITDA 안정 + Multiple premium.</p>
                <p><strong>3단계</strong>: ① <strong>선도계약(Forward Contract) 비율 30% → 70%+로 단계 확대</strong> — 산둥 vendor + 의성 농가 통합, 6·12·18개월 layered LTA로 가격 lock-in 비중 압도적 ② 자체 ML 가격 예측 모델 구축 — KAMIS·KCS·NOAA·SCFI·환율·중국 작황·정부 정책 등 25개 변수 feature로 7일·30일·90일 가격 예측 (정확도 목표 72%+) ③ 차후 마늘 ETF·선물 상품 출시 가능 시 한국 KRX 또는 CME에 standardized contract 등재 추진 — 가격 변동성을 vendor risk에서 자본 시장 product로 전환, 신규 수익원 창출.</p>
              </div>
            ),
            source: "UN Comtrade + KRX 농산물 선물거래 + Shanghai Garlic Index (2020~2026)",
          }} />

        <div style={{ gridColumn: '1 / -1' }}>
          <WidgetCard title="마늘 감모/폐기물 업사이클링 (Circular Economy, %)" icon={Recycle} iconColor="#84cc16" pillar="S5"
            cardDesc="폴리사카라이드·바이오연료·친환경 포장재 등 업사이클링 비중"
            telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
            chart={
              <BarChart data={i5Data} layout="vertical">
                <ChartPatternDefs />
                {grid}
                <XAxis type="number" {...xAxisTextProps} />
                <YAxis dataKey="name" type="category" width={80} {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="Polysaccharides" stackId="a" fill="#84cc16" name="기능성 폴리사카라이드 (45%)" />
                <Bar dataKey="Biofuel" stackId="a" fill="#eab308" name="바이오 연료 (30%)" />
                <Bar dataKey="EcoPackaging" stackId="a" fill="#ca8a04" name="친환경 포장재 (25%)" />
              </BarChart>
            }
            takeaway={{
              situation: (
                <div>
                  <p>"순환경제(Circular Economy)"란 폐기물을 raw material로 재투입해 zero waste를 달성하는 산업 모델. 마늘 박피·가공 시 발생하는 껍질·줄기·뿌리(전체 중량 약 15%)는 통상 폐기 cost 발생 영역 — 그러나 알리신·플라보노이드 항산화 성분이 농축되어 있어 기능성 사료·바이오매스 비료·화장품 raw로 변환 시 단가 +480~720% 가치 점프.</p>
                  <p>실측: <strong>현행 폐기 cost -$0.18/kg → 사료 변환 시 +$0.85/kg (5.7배) → 화장품·기능성 추출물 변환 시 +$2.40/kg (14.3배). 100톤 가공 vendor 기준 부가 매출 연 $240,000 + 폐기 cost $18,000 절감 = 총 $258,000/년 자동 발생</strong>. "쓰레기"라는 라벨이 가장 비싼 함정.</p>
                </div>
              ),
              actionPlan: (
                <div>
                  <p><strong>재정의</strong>: 마늘 잔여물은 "처리 부담"이 아닌 <strong>"부산물 매출이 본업 매출의 6~12%를 자동 추가하는 leverage 자산 + ESG 점수 상승 + 탄소배출권 동시 획득의 triple win"</strong>.</p>
                  <p><strong>3단계</strong>: ① <strong>단기(6개월)</strong>: 박피 공정 잔여물을 펫푸드 vendor(우주펫·하림펫푸드) 또는 사료 vendor(이지바이오)에 톤 단위 공급 — 폐기 cost zero + 부가 매출 +6%p ② <strong>중기(12~18개월)</strong>: 화장품 vendor(아모레퍼시픽 헬스케어·코스맥스·한국콜마)에 알리신 추출물 raw 납품 — 단가 14배 점프 ③ <strong>장기(24개월+)</strong>: 자체 흑마늘 발효·기능성 식품 브랜드 (가칭 "BlackAllium") 출시 + 환경부 탄소배출권 (K-ETS) 자발적 감축 인증 획득 → ESG 점수 +18점 + PE 실사 시 "Circular Economy vendor" valuation premium +1.8x.</p>
                </div>
              ),
              source: "농촌진흥청 바이오매스 연구 + 환경부 K-ETS + 알리신 추출 학술 연구",
            }} />
        </div>
      </div>
      </>)}


    </div>
  );
}
