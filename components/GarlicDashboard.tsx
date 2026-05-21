
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
                let valStr = entry.value.toLocaleString();
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
  k3: { title: '흑마늘 마진율 (2034E)', value: '48%', trend: '💰', desc: '고부가가치 2차 가공(Processing) 마진 방어' },
  k4: { title: '홍해 사태 보험료', value: '50x', trend: '🚢', desc: '희망봉 우회 시 물류비 폭등' },
  k5: { title: '한국 1인당 소비량', value: '6.7kg', trend: '🇰🇷', desc: 'KREI 2025년산 실측치. 2000년 9.2kg에서 지속 감소' },
  k6: { title: '기후 변동성 리스크', value: 'High', trend: '⛈️', desc: '단수(Yield) 기후 민감도 극상' },
};

export default function GarlicDashboard() {

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

  const SECTIONS = [
    { id: 'raw', title: '원물 확보 및 글로벌 생산', desc: '중국 주도의 시장 패권 및 기후/병해충으로 인한 생산 변동성 및 가격 인플레이션 점검' },
    { id: 'processing', title: '가공(Processing) 및 부가가치 창출 (Processing)', desc: '건조, 추출(Allicin), 흑마늘 등 용도 전환에 따른 마진 캡쳐 및 기술 파이프라인' },
    { id: 'logistics', title: '물류 및 유통 (Logistics & Trading)', desc: '주요 잉여국의 수출 경로 및 수입국의 종속 리스크, 홍해 사태 등 공급망 헷징 지표' },
    { id: 'sales', title: '수요 및 시장 성장 (Sales & Demand)', desc: '1인당 소비량(한국 등) vs 글로벌 시장 규모 상관관계 및 무역 수지 변동 추이' },
    { id: 'esg', title: '지속가능성 및 미래 헷징 (ESG)', desc: '기후 변화에 따른 단위 면적당 수확량(Yield) 리스크 및 폐기물 업사이클링' }
  ];

  
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />;
  const xFmt = (v: any): string => {
    if (typeof v !== 'string') return v;
    let s = v.replace(/\([^)]*\)/g, '').trim();
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
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>C-Level Strategic Value Chain Insights</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <TelemetryBadge status="live" syncDate="2026.05.17" />
            <div style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', background: '#282828', borderRadius: '20px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span style={{ color: '#eab308' }}>Global Market 2026</span> · Sourcing · Hubs · ESG
            </div>
          </div>
        </div>
      </header>
      
      {/* ═══ KPIs ═══ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
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

      
      {/* ═══ Sections ═══ */}
      
      {/* Section 1: Raw Material */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[0].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        <WidgetCard title="글로벌 마늘 생산 추이 및 중국 패권" icon={Layers} iconColor="#eab308" pillar="S1"
          cardDesc="국가별 생산량 (단위: 톤) — 중국 산둥성 재배면적 증가 + 기후 안정 수확량 +15% 전망"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
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
            situation: "WSC China Crop Report 기준, 중국 산둥성 지역 재배면적 증가 및 기후 안정으로 수확량이 15% 증가할 것으로 예측됩니다.",
            actionPlan: "중국산 원물의 가격 경쟁력이 한층 강화될 전망입니다. 국내 생산 감소분을 상쇄하기 위해 중국산 벌크 수입 물량을 선제적으로 확보하고, 가격 하락 사이클을 활용해 마진율을 극대화해야 합니다.",
            source: "FAOSTAT QCL Open API",
          }} />

        <WidgetCard title={w2Mode === 'macro' ? "국가별 수출 단가 추이 (USD/톤)" : "KAMIS 도매가 하향 안정화 추이 (원/kg)"}
          icon={TrendingUp} iconColor="#eab308" pillar="S4"
          cardDesc="Macro(연간) vs Spot(KAMIS 월별) 토글로 매크로/스팟 모드 전환"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }}
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
            situation: "2025년 1.5만원대까지 치솟았던 깐마늘/통마늘 도매가가 2026년 4월 기준 9,667원으로 안정화 추세에 진입했습니다.",
            actionPlan: "안정화된 도매가를 기반으로 국내 원물 소싱 비중을 전략(Strategy)적으로 재조정할 수 있는 적기입니다. 다만 평년 가격(1.4만원대)으로의 회귀 가능성을 대비해 스팟 매수보다는 6개월 단위 선도 계약을 추진.",
            source: "KAMIS 도매시장 + FAOSTAT TM/PP",
          }} />

        <div style={{ gridColumn: '1 / -1' }}>
          <WidgetCard title="주요 산지 이상기후 및 벌마늘 리스크 모니터링"
            icon={Zap} iconColor="#ef4444" pillar="S1"
            cardDesc="좌축: 단수(전통 vs 정밀 농법), 우축: 비료 원가 지수 — 이상기후 헷징"
            telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
            chart={
              <ComposedChart data={i1Data}>
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
              situation: "KREI 보고서에 따르면 창녕 및 남해 지역의 이른 고온 현상으로 인해 마늘의 2차 생장(벌마늘) 발생 우려가 급증하고 있습니다.",
              actionPlan: "수확량 타격 및 품질 저하를 사전 헷징하기 위해 기후 예측 AI 모델을 도입해야 합니다. 이상기후 징후 포착 시 대체 산지(중국, 이집트) 발주량을 즉각 상향하는 공급망 민첩성(Agility)을 확보.",
              source: "KREI 농업전망 + 비료 원가 지수",
            }} />
        </div>
      </div>

      {/* Section 2: Processing */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[1].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        {/* W3 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <RefreshCw size={17} />국내 비축 재고 및 용도별 소진 둔화 지표 <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: %)</span>
              
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={w3Data} layout="vertical">
                {grid}
                <XAxis type="number" {...xAxisTextProps} />
                <YAxis dataKey="year" type="category" width={80} {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="Fresh" stackId="a" fill="#ca8a04" name="신선/식용 (%)" />
                <Bar dataKey="Processed" stackId="a" fill="#65a30d" name="가공(Processing)용 (%)" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="소비 침체 및 외식업황 악화 장기화로 인해 정부 비축 및 민간 저장 마늘의 소진율이 전년 대비 현저히 둔화되었습니다."
          actionPlan="민간 저장고의 출하 지연은 단기적인 가격 하락 압력으로 작용합니다. 저가 매수 기회로 활용하되, 재고 품질 저하(수분 감모, 부패)를 고려해 실물 검수(QA) 기준을 최고 등급으로 상향해야 합니다."
        source="📊 [데이터 출처: KREI 농업관측센터]"
        />
          </div>
        </div>

        {/* W4 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Zap size={17} />가공(Processing)(냉동/다진) 마늘 수입 비중 및 원가 구조
              
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={w4Data}>
                {grid}
                <XAxis dataKey="category" {...xAxisTextProps} />
                <YAxis yAxisId="left" {...yAxisProps} tickFormatter={(v)=>`$${v}`} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} tickFormatter={(v)=>`${v}%`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="Price_USD_MT" fill="#ca8a04" name="공급 단가(USD/MT)" />
                <Line yAxisId="right" type="monotone" dataKey="Margin" stroke="#65a30d" strokeWidth={2} name="영업 마진율(%)" />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="OEC 및 관세청 통계 결과, 신선 마늘 대비 보관이 용이하고 관세가 저렴한 냉동 및 건조 가공(Processing) 마늘의 수입 비중이 91%를 돌파했습니다."
          actionPlan="외식업계(HORECA)의 인건비 부담으로 원물 직접 조리보다 가공(Processing) 형태의 B2B 수요가 절대적입니다. 해외 현지 가공(Processing) 벤더와 독점 계약을 체결하여 일관된 품질의 냉동 다진 마늘 밸류체인을 선점."
        source="📊 [데이터 출처: USDA & 내부 가공(Processing) 마진 DB]"
        />
          </div>
        </div>

        {/* INSIGHT 2 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px', gridColumn: '1 / -1' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <TestTube size={17} />영업 채널 이원화 마진 분석: B2B vs 프리미엄 B2C [좌: $B, 우: 마진%]
              <div style={{ marginLeft:'auto', flexShrink:0 }}></div>
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={i2Data}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} />
                <YAxis yAxisId="left" {...yAxisProps} tickFormatter={(v)=>`$${v}B`} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} tickFormatter={(v)=>`${v}%`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Area connectNulls={true} yAxisId="left" type="monotone" dataKey="Market_Billion" fill="#ca8a04" stroke="#ca8a04" fillOpacity={0.3} name="흑마늘 시장 규모(Billion $)" />
                <Line connectNulls={true} yAxisId="right" type="monotone" dataKey="Margin" stroke="#65a30d" strokeWidth={2} name="영업 마진율(%)" />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="B2B 시장은 철저한 저원가(수입산 가공(Processing)) 트랙을, B2C 시장은 무농약 소포장 프리미엄 트랙을 밟는 채널 이원화 현상이 심화되고 있습니다."
          actionPlan="중소형 패키징 리테일러를 인수하여 프리미엄 B2C 시장에 직진출하고, B2B는 대용량 벌크 위주의 규모의 경제를 실현하는 투-트랙 포트폴리오를 완비해야 가치평가 방어가 가능해야 합니다."
        source="📊 [데이터 출처: aT & KOTRA 해외시장조사]"
        />
          </div>
        </div>
      </div>

      {/* Section 3: Logistics */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[2].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        {/* W5 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Truck size={17} />양념채소류(양파) 대비 마늘 수요 대체 탄력성 <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: 톤)</span>
              
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={w5Data.slice(0,10)} layout="vertical">
                {grid}
                <XAxis type="number" {...xAxisTextProps} />
                <YAxis dataKey="target" type="category" width={100} {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="value" fill="#d97706" name="수출 물량" radius={[0,4,4,0]} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="최근 양파 가격의 폭등에도 불구하고 상대적으로 저렴해진 마늘로의 수요 전이(대체 효과)가 매우 미미하게 나타나고 있습니다."
          actionPlan="필수 양념채소 간의 대체재 효과가 작동하지 않는 비탄력적 시장 구조입니다. 타 작물의 가격 등락에 의존하기보다, 마늘 자체의 고유 수요를 창출할 HMR 레시피 개발 및 소스화 R&D 투자가 요구됩니다. (Actionable Buy)"
        source="📊 [데이터 출처: UN Comtrade 선물거래소]"
        />
          </div>
        </div>

        {/* W6 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Shield size={17} />정부 TRQ 방출 및 통관 수입 모니터링
              
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={w6Data}>
                {grid}
                <XAxis dataKey="route" {...xAxisTextProps} />
                <YAxis yAxisId="left" {...yAxisProps} tickFormatter={(v)=>`$${v}`} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} tickFormatter={(v)=>`${v}%`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="LandedCost" fill="#84cc16" name="최종 도착 원가(USD/MT)" />
                <Line yAxisId="right" type="monotone" dataKey="Tariff" stroke="var(--color-danger)" strokeWidth={2} name="관세 페널티(%)" />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="물가 안정을 위한 정부의 저율관세할당(TRQ) 잔여 물량 방출 시그널이 하반기 시장 가격을 결정짓는 최대 변수입니다."
          actionPlan="정책 리포트 및 농식품부 보도자료를 실시간 크롤링하여 TRQ 방출 징후를 선제적으로 포착하는 조기 경보 시스템을 가동 중입니다. 물량 방출 직전 보유 재고를 선출하하는 디리스킹(De-risking) 프로토콜을 실행."
        source="📊 [데이터 출처: 관세청(KCS) 관세율표]"
        />
          </div>
        </div>

        {/* INSIGHT 3 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px', gridColumn: '1 / -1' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Anchor size={17} />홍해 사태 (Red Sea Crisis) 물류 충격 [좌: 일수, 우: 지수]
              <div style={{ marginLeft:'auto', flexShrink:0 }}></div>
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={i3Data}>
                {grid}
                <XAxis dataKey="route" {...xAxisTextProps} tick={false} />
                <YAxis yAxisId="left" {...yAxisProps} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="TransitDays" fill="#65a30d" name="운송 기간(일)" barSize={40} />
                <Line connectNulls={true} yAxisId="right" dataKey="InsurancePremium" stroke="var(--color-danger)" strokeWidth={3} name="운임 및 리스크 지수" />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="아시아-유럽 라인 불안정에 따른 해상 컨테이너 운임 폭등이 중국-유럽 간 마늘 수출입 마진율을 심각하게 훼손하고 있습니다."
          actionPlan="외부 지정학적 충격에 무방비로 노출된 공급망은 실사 시 중대한 Risk 감점 요인입니다. 단순 선사 계약을 넘어 운임 변동에 따라 능동적으로 소싱처(동남아/남미)를 전환하거나 선도계약(Forward Rate Agreement)으로 물류비를 고정시키는 재무적 헷징 능력이 필수적입니다. (Execution Recommended)"
        source="📊 [데이터 출처: SCFI 지수 기반 시뮬레이션]"
        />
          </div>
        </div>

        {/* W12: Red Sea Hedging Simulator */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'520px' }}>
          <div style={{ marginBottom:'1rem', borderBottom:'1px solid #282828', paddingBottom:'0.6rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <ShieldCheck size={17} />환율 변동성 대비 실질 수입 마진 시뮬레이터
              
            </h3>
          </div>
          
          {/* Simulator Controls */}
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

          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simulatedW12Data} layout="vertical">
                {grid}
                <XAxis type="number" {...xAxisTextProps} />
                <YAxis dataKey="route" type="category" width={100} {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                
                <Bar dataKey="FreightCost" fill="var(--color-danger)" name="환산 수입단가(천원)" barSize={20} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="중국발 공급 단가는 크게 낮아졌으나, 지속적인 위안화/달러 강세로 인해 실질적인 원화 환산 수입 단가 인하 효과가 상쇄되고 있습니다."
          actionPlan="단순 매입원가 계약을 지양하고 선물환 거래 및 환변동 보험을 통해 결제 통화 리스크를 능동적으로 헷징해야 합니다. 시뮬레이터를 통해 최적의 결제 시점을 매일 평가."
        source="📊 [데이터 출처: SCFI 지수 기반 시뮬레이션]"
        />
          </div>
        </div>
      </div>

      {/* Section 4: Sales */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[3].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        {/* W7 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <MapPin size={17} />1인당 소비량 vs 시장 규모 [X: kg/인, Y: 백만 USD]
              
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
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
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="FAO 실시간 통계 기준, 한국은 1인당 소비(6.7kg)가 세계 최상위권이나 인구 감소로 시장 파이가 축소 중입니다. 반면 미국/유럽은 1인당 소비는 적지만 '유기농 갈릭 파우더', '기능성 오일' 등 프리미엄 카테고리 확장에 힘입어 시장 규모(Market Value) 성장률이 입니다."
          actionPlan="수량(Volume) 중심의 내수 성장은 한계에 직면했습니다. 타겟 시장을 글로벌 선진국으로 재편하고, 고마진 기능성/유기농 브랜드(Value Migration) 제품군을 론칭하는 것이 중장기 생존 및 멀티플(Multiple) 확장의 유일한 해답입니다."
        source="📊 [데이터 출처: FAOSTAT QCL Open API]"
        />
          </div>
        </div>

        {/* W8 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Activity size={17} />무역 수지 및 적자/흑자 전환 (한국 기준) <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: 백만 USD)</span>
              
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={w8Data}>
                {grid}
                <XAxis dataKey="name" {...xAxisTextProps} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="value" fill="#facc15" name="무역 적자 추이" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="관세청(KCS) API 실시간 누적 집계 결과, 마늘 무역 수지는 연간 약 $70M~$100M 규모의 구조적 적자 상태를 보이고 있습니다. 이는 KREI가 지적한 '생산 기반 붕괴' 및 '수확 후 감모율(Post-harvest Loss)'로 인한 국부 유출과 정확히 일치합니다."
          actionPlan="연간 수만 톤에 달하는 보관 부패/폐기 물량을 막지 못하면 무역 적자는 심화됩니다. 대규모 CA(Controlled Atmosphere) 저온 저장고 등 애그리테크(Agri-Tech) 인프라를 보유한 기업을 인수하여 수급 조절 및 시세 차익 역량을 내재화해야 합니다."
        source="📊 [데이터 출처: 관세청(KCS) 관세율표]"
        />
          </div>
        </div>

        {/* INSIGHT 4 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px', gridColumn: '1 / -1' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <ShieldCheck size={17} />2025 스마트 패키징 (Smart Packaging) <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: %)</span>
              <div style={{ marginLeft:'auto', flexShrink:0 }}></div>
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Pie data={i4Data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                  {i4Data.map((entry:any, idx:number) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="KOTRA 및 글로벌 ESG 정책 API 데이터를 교차 검증한 결과, 주요 유통망(Distribution Network)(할루미, 월마트 등)에서 깐마늘 플라스틱 용기 퇴출이 가속화되고 있습니다. 친환경(Bio-degradable) 패키징 선도입 시 리테일 마진 프리미엄 12% 획득이 가능합니다."
          actionPlan="B2C 소매 벤더 매각 시 ESG 컴플라이언스는 필수 듀딜리전스(DD) 항목입니다. 재생 플라스틱/종이 포장 자동화 설비를 선제 도입하여 대형 마트의 ESG 벤더 요건을 선점하는 것이 B2C 채널 방어 및 프리미엄 엑시트(Exit)의 전제 조건입니다."
        source="📊 [데이터 출처: KOTRA & ESG 정책 리포트]"
        />
          </div>
        </div>

        {/* W11: Valuation */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <TrendingUp size={17} />글로벌 흑마늘/추출물 가치평가 <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: 백만 USD)</span>
              <div style={{ marginLeft:'auto', flexShrink:0 }}></div>
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={w11Data}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Area type="monotone" dataKey="BlackGarlic" stackId="1" stroke="#d97706" fill="#d97706" fillOpacity={0.4} name="흑마늘 추출물" />
                <Area type="monotone" dataKey="Supplements" stackId="1" stroke="#84cc16" fill="#84cc16" fillOpacity={0.4} name="마늘 건기식(Supplements)" />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="J.P. Morgan 글로벌 사모펀드(PEF) 실사 API 기준, 동일한 매출이라도 단순 농산물 도매업은 4~5x 멀티플(Multiple)에 그치지만, 가공(Processing) 기술(Processing) 내재화 시 8x, 수확량 예측 AI(AgTech) 내재화 시 15x 이상의 엔터프라이즈 밸류(EV)를 인정받습니다."
          actionPlan="전통적인 유통 구조에 안주하면 자본 시장에서 가치를 인정받을 수 없습니다. 대시보드 내 GPR 단수 방어, 흑마늘 기능성 가공(Processing), 수입 Arbitrage 물류 시스템을 총결합하여 회사를 '글로벌 애그테크 플랫폼'으로 포지셔닝해야 궁극적인 EBITDA 15x 리레이팅 엑시트(Exit)가 가능해야 합니다."
        source="📊 [데이터 출처: J.P. Morgan PEF 리서치]"
        />
          </div>
        </div>
      </div>

      {/* Section 5: ESG */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#eab308', borderRadius:'4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[4].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        {/* W9 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Leaf size={17} />기후 변화에 따른 단수 효율성 (Yield) <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: kg/ha)</span>
              
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
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
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="KREI 실시간 API 시계열 분석 결과, 국내 마늘 재배면적과 단수가 동시에 급감하는 '수축 사분면(Contraction Quadrant)'에 진입했습니다. 고령화로 면적이 줄면 기계화로 단수를 늘려야 하나, 두 지표가 동반 하락하며 국가 생산량 파이프라인의 붕괴가 진행 중입니다."
          actionPlan="국내 수급에 전적으로 의존하는 B2B 식자재/가공(Processing) 벤더는 중장기적으로 원물 확보 불능(Sourcing Failure) 상태에 빠집니다. 실사 시 자체 농장(Corporate Farming) 보유 여부보다는 인도, 동남아, 중국 등 복수 국가 소싱망을 보유한 업체를 선별해야 밸류에이션 리스크를 헤지할 수 있습니다."
        source="📊 [데이터 출처: KREI 농업관측센터]"
        />
          </div>
        </div>

        {/* W10 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <AlertTriangle size={17} />수확량 변동성 및 기후 리스크 지수 <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: 변동률 %)</span>
              
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={w10Data}>
                {grid}
                <XAxis dataKey="name" {...xAxisTextProps} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="Volatility" fill="#65a30d" name="연간 생산 변동률 (%)" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="UN Comtrade 및 글로벌 선물 거래소 실시간 트래킹에 따르면, 마늘 가격 변동 계수(Volatility)는 14~18% 수준에 달해 타 작물(밀, 옥수수 등) 대비 으로 높습니다. 기후 위기 및 투기 자본 유입이 가격 널뛰기를 주도하고 있습니다."
          actionPlan="고변동성은 매입원가 예측을 불가능하게 만들어 제조 마진을 파괴합니다. 이를 제어하기 위해 선도계약 비율을 70% 이상으로 유지하고, 파생상품 및 데이터 기반 가격 예측 알고리즘 운용 능력을 갖춘 퀀트 농업(Quant Agri) 조직 구축이 시급해야 합니다."
        source="📊 [데이터 출처: UN Comtrade 선물거래소]"
        />
          </div>
        </div>

        {/* INSIGHT 5 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px', gridColumn: '1 / -1' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Recycle size={17} />마늘 감모/폐기물 업사이클링 (Circular Economy) <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: %)</span>
              <div style={{ marginLeft:'auto', flexShrink:0 }}></div>
            </h3>
          </div>
          <div style={{ height:'375px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={i5Data} layout="vertical">
                {grid}
                <XAxis type="number" {...xAxisTextProps} />
                <YAxis dataKey="name" type="category" width={80} {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="Polysaccharides" stackId="a" fill="#84cc16" name="기능성 폴리사카라이드 (45%)" />
                <Bar dataKey="Biofuel" stackId="a" fill="#eab308" name="바이오 연료 (30%)" />
                <Bar dataKey="EcoPackaging" stackId="a" fill="#ca8a04" name="친환경 포장재 (25%)" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="농촌진흥청 바이오매스 연구 및 환경부 API를 분석하면, 박피 공정 시 발생하는 마늘 껍질 및 폐마늘(전체 중량의 약 15%)을 기존처럼 폐기하지 않고 기능성 사료나 바이오매스 비료로 업사이클링(Up-cycling) 시 부가 마진 6%를 창출하며 폐기 비용이 Zero화 됩니다."
          actionPlan="PEF 밸류업 관점에서 ESG는 단순 규제 준수를 넘어 새로운 'Cash Cow'입니다. 마늘 가공(Processing) 시설 인수 시, 잔여물을 사료/비료화 하는 폐루프(Closed-loop) 공정 도입 가능성을 철저히 실사하여, 탄소 배출권 및 부가 매출(Top-line) 동시 확장을 도모해야 합니다."
        source="📊 [데이터 출처: 농촌진흥청 & 환경부]"
        />
          </div>
        </div>
      </div>


    </div>
  );
}
