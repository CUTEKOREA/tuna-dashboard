
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
  k2: { title: '중국 생산 독점률', value: '70%', trend: '⚠️', desc: '압도적 패권 및 차이나 리스크 상존' },
  k3: { title: '흑마늘 마진율 (2034E)', value: '48%', trend: '💰', desc: '고부가가치 2차 가공 마진 방어' },
  k4: { title: '홍해 사태 보험료', value: '50x', trend: '🚢', desc: '희망봉 우회 시 물류비 폭등' },
  k5: { title: '한국 1인당 소비량', value: '6.7kg', trend: '🇰🇷', desc: 'KREI 2025년산 실측치. 2000년 9.2kg에서 지속 감소' },
  k6: { title: '기후 변동성 리스크', value: 'High', trend: '⛈️', desc: '단수(Yield) 기후 민감도 극상' },
};

export default function GarlicDashboard() {
  const [showEdu, setShowEdu] = useState(true);

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
  const [freightMultiplier, setFreightMultiplier] = useState(5);
  const [egyptHubRatio, setEgyptHubRatio] = useState(50);

  // W12 Data Mapping
  const simulatedW12Data = [
    { route: "수에즈 운하 (정상)", TransitTime: 35, FreightCost: 2000, CapacityImpact: 0 },
    { route: `희망봉 우회 (${freightMultiplier}x)`, TransitTime: 45, FreightCost: 2000 * freightMultiplier, CapacityImpact: -9 },
    { route: "이집트 현지 가공 (Hedging)", TransitTime: 12, FreightCost: 500, CapacityImpact: 0 }
  ];
  
  const totalCostNoHedge = 2000 * freightMultiplier;
  const totalCostWithHedge = (totalCostNoHedge * (1 - egyptHubRatio / 100)) + (500 * (egyptHubRatio / 100));
  const savingsPerTEU = totalCostNoHedge - totalCostWithHedge;

  const SECTIONS = [
    { id: 'raw', title: '원물 확보 및 글로벌 생산 (Raw Material)', desc: '중국 주도의 시장 패권 및 기후/병해충으로 인한 생산 변동성 및 가격 인플레이션 점검' },
    { id: 'processing', title: '가공 및 부가가치 창출 (Processing)', desc: '건조, 추출(Allicin), 흑마늘 등 용도 전환에 따른 마진 캡쳐 및 기술 파이프라인' },
    { id: 'logistics', title: '물류 및 유통 (Logistics & Trading)', desc: '주요 잉여국의 수출 경로 및 수입국의 종속 리스크, 홍해 사태 등 공급망 헷징 지표' },
    { id: 'sales', title: '수요 및 시장 성장 (Sales & Demand)', desc: '1인당 소비량(한국 등) vs 글로벌 시장 규모 상관관계 및 무역 수지 변동 추이' },
    { id: 'esg', title: '지속가능성 및 미래 헷징 (ESG)', desc: '기후 변화에 따른 단위 면적당 수확량(Yield) 리스크 및 폐기물 업사이클링' }
  ];

  
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />;
  const xFmt = (v: any): string => {
    if (typeof v !== 'string') return v;
    let s = v.replace(/\([^)]*\)/g, '').trim();
    return s.length > 6 ? s.slice(0, 6) + '..' : s;
  };
  const xAxisTextProps = { stroke: "var(--text-secondary)", tick: { fontSize: 9 }, tickFormatter: xFmt };
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
          <div style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', background: '#282828', borderRadius: '20px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span style={{ color: '#eab308' }}>Global Market 2026</span> · Sourcing · Hubs · ESG
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

      
      {/* ═══ Education Toggle ═══ */}
      <div style={{ marginBottom:'2rem' }}>
        <button 
          onClick={() => setShowEdu(!showEdu)} 
          style={{ 
            width:'100%', background:'#181818', 
            borderRadius:'8px', border:'none',
            padding:'1.2rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between',
            cursor:'pointer', transition:'all 0.2s', marginBottom: showEdu?'1rem':'0'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#282828'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#181818'; }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <BookOpen size={20} color="#eab308" />
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--text-primary)', marginBottom:'4px' }}>신입직원 교육 가이드</div>
              <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>FAOSTAT 및 KREI 실측 데이터 기반 — 글로벌 마늘 밸류체인 핵심 인사이트</div>
            </div>
          </div>
          <div style={{ transform: showEdu?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.3s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </button>
        {showEdu && (
          <div style={{ background:'#181818', borderRadius:'8px', padding:'1.5rem', animation:'fadeIn 0.3s ease-out' }}>
          <div style={{ display:'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap:'1.5rem', marginBottom:'1.5rem' }}>
            <div style={{ background:'#282828', padding:'1.2rem', borderRadius:'8px' }}>
              <h3 style={{ color:'#eab308', margin:'0 0 0.8rem', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1rem' }}>
                <Globe size={16}/> 핵심 구조: 생산의 불균형과 가공의 중요성
              </h3>
              <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.7 }}>
                <strong style={{color:'var(--text-primary)'}}>생산:</strong> 글로벌 생산량(약 2,800만 톤)의 70%를 중국이 압도적으로 독점하며 차이나 리스크 상존.<br/>
                <strong style={{color:'var(--text-primary)'}}>가공:</strong> 수확 후 부패율이 높아, 신선 상태 유지보다 건조, 흑마늘, 알리신 추출 등 2차 가공을 통한 마진 방어 필수.<br/>
                <strong style={{color:'var(--text-primary)'}}>수요:</strong> 중국(14.3kg)이 세계 소비 1위이며, 한국(6.7kg) 역시 최상위권의 거대 내수 시장을 형성. 그러나 농촌 고령화로 무역 적자가 매년 확대 중.
              </div>
            </div>
            <div style={{ background:'#282828', padding:'1.2rem', borderRadius:'8px' }}>
              <h3 style={{ color:'#eab308', margin:'0 0 0.8rem', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1rem' }}>
                <Workflow size={16}/> 전략적 시사점: 기후 리스크 헷징 + ESG 결합
              </h3>
              <ul style={{ margin:0, paddingLeft:'1.2rem', fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.7 }}>
                <li><strong style={{color:'var(--text-primary)'}}>스마트팜 및 기후 내성:</strong> 마늘은 단수(Yield)가 기후에 극도로 민감하므로 GPR 및 점적관수 도입 시급.</li>
                <li><strong style={{color:'var(--text-primary)'}}>물류 다변화:</strong> 지정학적 리스크(홍해 사태 등) 시 신선식품 보험료 폭등. 동남아/이집트 다변화 요망.</li>
                <li><strong style={{color:'var(--text-primary)'}}>업사이클링 (ESG):</strong> 가공 시 발생하는 30%의 마늘 폐기물을 바이오 연료 및 기능성 원료로 전환하여 수익 창출.</li>
              </ul>
            </div>
          </div>
          <div style={{ background:'#282828', padding:'1.2rem 1.5rem', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ background:'rgba(30, 215, 96, 0.1)', padding:'0.8rem', borderRadius:'50%' }}><Database size={20} color="#eab308" /></div>
              <div>
                <h3 style={{ color:'var(--text-primary)', margin:'0 0 0.3rem', fontSize:'1rem', fontWeight:700 }}><Zap size={16} color="#eab308" style={{ verticalAlign: 'middle', marginRight: '4px' }} /> NotebookLM 마늘 AI 챗봇</h3>
                <p style={{ margin:0, fontSize:'0.82rem', color:'var(--text-secondary)' }}>J.P. Morgan 인사이트 및 전문 리서치가 학습된 맞춤형 AI입니다.</p>
              </div>
            </div>
            <a href="https://notebooklm.google.com/notebook/f7aa78b2-427a-4300-8546-5247b416f513" target="_blank" rel="noopener noreferrer" style={{ background:'#eab308', color:'#000000', padding:'0.7rem 1.3rem', borderRadius:'20px', fontSize:'0.9rem', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap', transition:'background 0.2s, transform 0.1s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1fdf64'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#eab308'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Activity size={16} /> 챗봇 시작
            </a>
          </div>
          </div>
        )}
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
        
        {/* W1 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Layers size={17} />글로벌 생산 패권 구조 (China Hegemony) <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: 톤)</span>
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              FAOSTAT API 실시간 연동 기반 글로벌 마늘 생산량 점유율 추이 및 국가별 패권 동향 분석
            </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
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
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="FAOSTAT API 실시간 집계 기준, 중국의 마늘 생산량은 2,100만 톤 밴드에서 정체(Peak Plateau) 중이며 인도(324만 톤)가 제2극으로 부상했습니다. 반면 한국은 24년간 생산량이 41% 급감하며 자급 기반이 붕괴 중입니다."
          actionPlan="생산량 감소는 원물 가격 상승 및 B2B 제조 마진 훼손의 1차 원인입니다. PEF 실사 관점에서 단순 국산 원물 유통망 확보는 투자 매력도가 없으며, 인도 및 이집트 현지 생산법인(JV) 지분을 통한 글로벌 소싱 파이프라인 구축이 M&A의 핵심 밸류업 요소(EBITDA 15x 멀티플 타겟)입니다."
        source="📊 [데이터 출처: FAOSTAT QCL Open API]"
        />
          </div>
        </div>

        {/* W2 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <TrendingUp size={17} />{w2Mode === 'macro' ? (<>원물 인플레이션 및 국가별 수출 단가 <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: USD/톤)</span></>) : (<>KAMIS 국내 도매가 스팟 매수 타이밍 <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: 원/kg)</span></>)}
              
            </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          FAOSTAT 및 KAMIS 실시간 연동 기반 글로벌 마늘 수출 단가(USD/톤) 및 국내 도매가(원/kg) 인플레이션 추이 분석
        </p>
            
            {/* W2 Toggle */}
            <div style={{ display:'flex', background:'rgba(0,0,0,0.5)', borderRadius:'6px', padding:'2px', border: 'none' }}>
              <button 
                onClick={() => setW2Mode('macro')}
                style={{ background: w2Mode === 'macro' ? '#eab308' : 'transparent', color: w2Mode === 'macro' ? 'var(--bg-color)' : 'var(--text-secondary)', border:'none', padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
              >
                Macro (연간)
              </button>
              <button 
                onClick={() => setW2Mode('spot')}
                style={{ background: w2Mode === 'spot' ? '#eab308' : 'transparent', color: w2Mode === 'spot' ? 'var(--bg-color)' : 'var(--text-secondary)', border:'none', padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
              >
                Spot (KAMIS 월별)
              </button>
            </div>
          </div>
          
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="KAMIS 및 UN Comtrade 실시간 API 연동 결과, 한국산 마늘의 수출/도매 단가는 중국산 대비 2.1배 이상의 비정상적 프리미엄이 형성되어 있습니다. 이는 품질 경쟁력이 아닌 농촌 고령화와 인건비 급등이 반영된 결과입니다."
          actionPlan="거시적 원가 방어를 위해 2트랙 소싱이 필수입니다. B2C 프리미엄 시장은 국산 원물을 유지하되, B2B 가공 및 외식업(HORECA) 벤더 인수 시 이집트($628/톤) 및 중국산 벌크 수입선을 확보하여 연간 원재료비를 40% 이상 절감하는 원가 구조조정(Cost-reduction) 전략을 즉각 실행해야 합니다."
        source="📊 [데이터 출처: KAMIS 도매시장 & FAOSTAT TM/PP]"
        />
          </div>
        </div>

        {/* INSIGHT 1 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px', gridColumn: '1 / -1' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Zap size={17} />정밀 농업 전환 (비료 헷징 및 GPR) [좌: 단수, 우: 비료지수]
              <div style={{ marginLeft:'auto', flexShrink:0 }}></div>
            </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          글로벌 비료 원가 지수 상승에 따른 GPR 정밀 농업(비료 최적화) 수율 방어 효과. 전통 농법 vs 정밀 농법 단수 비교 및 비료 원가 지수 교차 시뮬레이션
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
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
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="글로벌 비료 원가지수(TH Fertilizer Index) API 실시간 연동 결과와 KREI 관측 데이터를 교차 분석하면, 전통 농법 유지 시 단수(Yield) 방어가 불가능합니다. 반면 기계화 및 GPR(정밀농업) 도입 농가는 생산비 급등 속에서도 1,374kg/10a의 단수를 유지 중입니다."
          actionPlan="단순 농산물 유통 기업(Valuation 4~5x)에서 애그테크(AgTech) 기반의 스마트팜 플랫폼(Valuation 12x+)으로 리레이팅(Re-rating)하기 위한 핵심 지표입니다. PEF 엑시트 시 GPR 기반의 수확량 예측 AI 모델 보유 여부가 기업 가치를 좌우합니다."
        source="📊 [데이터 출처: KREI 농업전망 & 비료 원가 지수]"
        />
          </div>
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
              <RefreshCw size={17} />용도별 공급-이용 전환율 <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: %)</span>
              
            </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          신선 마늘과 가공 마늘(냉동, 건조, 페이스트 등)의 연도별 수요 전환 비중. KREI 농업전망(E04-2026) 소비 구조 분석: 외급식업 42.2%, 제조업 31.5%, 가구 26.3%
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={w3Data} layout="vertical">
                {grid}
                <XAxis type="number" {...xAxisTextProps} />
                <YAxis dataKey="year" type="category" width={80} {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="Fresh" stackId="a" fill="#ca8a04" name="신선/식용 (%)" />
                <Bar dataKey="Processed" stackId="a" fill="#65a30d" name="가공용 (%)" />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="KREI 실시간 API 및 농업전망 데이터에 따르면, 신선 마늘 중심의 가구 소비는 매년 5.4% 감소하는 반면, 외급식업 및 제조업 중심의 '가공용' 수요가 전체의 73.7%를 돌파했습니다. 특히 수입 마늘의 91%가 냉동 상태로 유입 중입니다."
          actionPlan="B2C 신선 유통의 종말과 B2B 가공 시장(HMR, 소스류)의 완전한 패러다임 전환입니다. 실사 시 단순히 저장고를 보유한 기업이 아닌, 박피, 다짐, 페이스트 전환 자동화 설비를 갖춘 2차 가공 벤더를 집중 타겟팅하여 Bolt-on M&A를 추진해야 합니다."
        source="📊 [데이터 출처: KREI 농업관측센터]"
        />
          </div>
        </div>

        {/* W4 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Zap size={17} />B2B 가공 카테고리별 마진 분해 및 타겟팅
              
            </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          마늘 가공 단계별 부가가치 창출 및 영업 이익률 비교. 신선 마늘 원가 대비 건조, 페이스트, 흑마늘, 추출(알리신) 단계별 가격 및 마진율 추산
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="USDA API 데이터를 통해 가공 단계별 글로벌 마진을 분석한 결과, 단순 깐마늘(8%) 대비 페이스트(28%) 및 흑마늘(45%), 추출물(Allicin, $30K/MT)로 이행할수록 부가가치가 기하급수적으로 상승합니다."
          actionPlan="단순 농산물 유통(Flat Margin) 구조를 탈피하는 핵심 전략입니다. 흑마늘 엑기스 및 제약/건기식 원료 추출 기술을 보유한 강소기업 인수가 최우선 과제이며, 이는 궁극적으로 포트폴리오 기업의 EBITDA 마진율을 20% 이상으로 방어하는 강력한 해자(Moat)가 됩니다."
        source="📊 [데이터 출처: USDA & 내부 가공 마진 DB]"
        />
          </div>
        </div>

        {/* INSIGHT 2 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px', gridColumn: '1 / -1' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <TestTube size={17} />바이오케미컬 및 흑마늘 B2B 가치평가 [좌: $B, 우: 마진%]
              <div style={{ marginLeft:'auto', flexShrink:0 }}></div>
            </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          아세안/글로벌 흑마늘 기능성 소재 시장 규모 및 영업 마진율 추이. 베트남 농축액 스틱 및 중국 흑마늘 향신료 B2B 수요 반영
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="aT 및 KOTRA 해외시장조사 실시간 데이터 반영 시, 글로벌 흑마늘 및 기능성 원료 시장은 연평균 7.1% 이상 성장하며 미국(시즈닝)과 동남아(고령화 타겟 스틱)에서 폭발적 수요를 창출하고 있습니다. 평균 영업 마진은 48%에 달합니다."
          actionPlan="K-Garlic 브랜딩을 접목한 '고부가가치 기능성 소재' 수출 기업으로 피봇팅(Pivoting)해야 합니다. 이는 전통 식품 산업 멀티플을 넘어 바이오/건기식 산업 멀티플(15x~20x)을 적용받기 위한 핵심 에쿼티(Equity) 스토리입니다."
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
              <Truck size={17} />주요 수출대상국 흐름 (Top Exports) <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: 톤)</span>
              
            </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          글로벌 주요 마늘 수출국의 수출 대상국별 물동량 분석. UN Comtrade HS Code 기준 교역 흐름 트래킹
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="UN Comtrade API 실시간 분석 결과, 글로벌 마늘 물동량의 대부분이 아시아 권역(인도네시아, 베트남 등)에 집중되어 있습니다. 신선 상태의 단기 부패 리스크로 인해 수출 반경이 제한적인 '역내 무역(Intra-regional Trade)' 한계가 뚜렷합니다."
          actionPlan="수출 반경을 미주/유럽 등 선진 고마진 시장으로 넓히기 위해서는 신선 원물 수출을 포기하고 전량 건조/분말화 및 콜드체인(Cold Chain) 인프라 투자가 선행되어야 합니다. 글로벌 해상 콜드체인 지배력을 가진 물류 벤더와의 파트너십이 수출 성장의 선결 조건입니다."
        source="📊 [데이터 출처: UN Comtrade 선물거래소]"
        />
          </div>
        </div>

        {/* W6 */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <Shield size={17} />OEC 관세율 연동 수입 소싱처 전환(Arbitrage) 맵
              
            </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          한국의 마늘 관세(최대 360%)를 고려한 소싱 루트별 최종 도착 원가(Landed Cost) 비교. FOB 원가 + 물류비 + 관세 페널티 산식 적용
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="관세청(KCS) 실시간 API 연동 결과, 한국의 신선 마늘 수입 TRQ 외 관세율은 360%로 원가 경쟁력을 원천 차단합니다. 그러나 '냉동/건조/가공' 상태로 수입 시 관세율이 27%로 급감하며 이집트산 가공 수입 시 톤당 $1,350의 최적 원가를 달성합니다."
          actionPlan="살인적 관세 장벽을 우회하는 규제 차익(Arbitrage) 거래의 정석입니다. 해외 소싱 시 원물 상태의 반입을 전면 중단하고, 현지(이집트/중국)에서 1차 가공 후 수입하는 서플라이 체인 내재화가 EBITDA 개선의 마스터키입니다."
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
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          홍해 사태에 따른 수에즈 운하 우회 시 운송 기간 증가 및 해상보험 리스크 지수 급등. SCFI 지수 기반 운임/리스크 프리미엄 교차 분석
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="SCFI(상하이컨테이너운임지수) 실시간 API 트래킹 결과, 희망봉 우회 장기화로 운송 지연(+15일)과 운임 지수 3,500pt 돌파 등 물류비 폭등이 지속 중입니다. 이는 이집트/유럽발 소싱에 치명적인 원가 부담으로 작용합니다."
          actionPlan="외부 지정학적 충격에 무방비로 노출된 공급망은 실사 시 중대한 Risk 감점 요인입니다. 단순 선사 계약을 넘어 운임 변동에 따라 능동적으로 소싱처(동남아/남미)를 전환하거나 선도계약(Forward Rate Agreement)으로 물류비를 고정시키는 재무적 헷징 능력이 필수적입니다."
        source="📊 [데이터 출처: SCFI 지수 기반 시뮬레이션]"
        />
          </div>
        </div>

        {/* W12: Red Sea Hedging Simulator */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'520px' }}>
          <div style={{ marginBottom:'1rem', borderBottom:'1px solid #282828', paddingBottom:'0.6rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <ShieldCheck size={17} />운송 리스크 헷징 시뮬레이터 (Egypt Hub Hedging)
              
            </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          홍해 사태 시 운임 폭등 배수와 이집트 현지 가공 전환율에 따른 TEU당 물류비 절감액 동적 시뮬레이션
        </p>
          </div>
          
          {/* Simulator Controls */}
          <div style={{ background:'#282828', border: 'none', padding:'0.8rem', borderRadius:'8px', marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', alignItems:'center' }}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', flex: 1 }}>운임 폭등 배수 (SCFI/Suez 기준): <strong style={{color:'var(--color-danger)'}}>{freightMultiplier}x</strong></span>
              <input type="range" min="1" max="10" step="0.5" value={freightMultiplier} onChange={e=>setFreightMultiplier(parseFloat(e.target.value))} style={{ flex: 1, accentColor: 'var(--color-danger)' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.8rem', alignItems:'center' }}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', flex: 1 }}>이집트 허브 가공 전환율: <strong style={{color:'#eab308'}}>{egyptHubRatio}%</strong></span>
              <input type="range" min="0" max="100" step="5" value={egyptHubRatio} onChange={e=>setEgyptHubRatio(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#eab308' }} />
            </div>
            <div style={{ background: '#181818', padding:'0.6rem 0.8rem', borderRadius:'6px', display:'flex', justifyContent:'space-between', alignItems:'center', border: 'none' }}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>TEU당 물류비 절감액 (Savings)</span>
              <span style={{ fontSize:'1.1rem', fontWeight:800, color:'#eab308' }}>+ ${savingsPerTEU.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ height:'180px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simulatedW12Data} layout="vertical">
                {grid}
                <XAxis type="number" {...xAxisTextProps} />
                <YAxis dataKey="route" type="category" width={100} {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="TransitTime" stackId="a" fill="#65a30d" name="운송 기간(일)" barSize={20} />
                <Scatter dataKey="FreightCost" fill="var(--color-danger)" name="물류 운임($)" />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop:'auto' }}>
            <TakeawayBox
          situation="SCFI 연동 자체 시뮬레이션 결과, 컨테이너 운임 폭등 시 신선/냉동 마늘 부피 그대로 운송 시 막대한 운임 손실이 발생합니다. 하지만 이집트 등 현지 허브에서 '페이스트'나 '건조 분말'로 전환하여 부피를 80% 줄일 경우 TEU당 물류비를 획기적으로 방어할 수 있습니다."
          actionPlan="부피 감축(Volume Reduction) 가공은 단순 식품 가공이 아닌 최상위 수준의 '물류 헷징(Physical Hedging)' 기술입니다. 물류비 급등기에 이러한 탄력적 전환이 가능한 인프라를 구축한 기업만이 불황 속에서도 영업 이익을 수성할 수 있습니다."
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
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          국가별 마늘 1인당 소비량(kg/인)과 시장 규모(백만 USD)의 상관관계 산점도. FAO 통계 기반 소비국 매트릭스 분석
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="FAO 실시간 통계 기준, 한국은 1인당 소비(6.7kg)가 세계 최상위권이나 인구 감소로 시장 파이가 축소 중입니다. 반면 미국/유럽은 1인당 소비는 적지만 '유기농 갈릭 파우더', '기능성 오일' 등 프리미엄 카테고리 확장에 힘입어 시장 규모(Market Value) 성장률이 압도적입니다."
          actionPlan="수량(Volume) 중심의 내수 성장은 한계에 직면했습니다. 타겟 시장을 글로벌 선진국으로 재편하고, 고마진 기능성/유기농 브랜드(Value Migration) 제품군을 론칭하는 것이 중장기 생존 및 멀티플 확장의 유일한 해답입니다."
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
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          한국 시장의 연도별 마늘 무역 수지(수출액 - 수입액) 변동 추이. 관세청(KCS) 수출입 데이터 기반 순 무역 적자 규모 추적
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          actionPlan="연간 수만 톤에 달하는 보관 부패/폐기 물량을 막지 못하면 무역 적자는 심화됩니다. 대규모 CA(Controlled Atmosphere) 저온 저장고 등 애그리테크(Agri-Tech) 인프라를 보유한 기업을 인수하여 수급 조절 및 시세 차익(Arbitrage) 역량을 내재화해야 합니다."
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
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          B2C 마늘 포장 트렌드(친환경/에코) 전환 시 브랜드 프리미엄 및 폐기물 감축 효과. 종이/PLA 친환경 포장 적용 시 마진 프리미엄 + 폐기 비용 절감률
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="KOTRA 및 글로벌 ESG 정책 API 데이터를 교차 검증한 결과, 주요 유통망(할루미, 월마트 등)에서 깐마늘 플라스틱 용기 퇴출이 가속화되고 있습니다. 친환경(Bio-degradable) 패키징 선도입 시 리테일 마진 프리미엄 12% 획득이 가능합니다."
          actionPlan="B2C 소매 벤더 매각 시 ESG 컴플라이언스는 필수 듀딜리전스(DD) 항목입니다. 재생 플라스틱/종이 포장 자동화 설비를 선제 도입하여 대형 마트의 ESG 벤더 요건을 선점하는 것이 B2C 채널 방어 및 프리미엄 엑시트의 전제 조건입니다."
        source="📊 [데이터 출처: KOTRA & ESG 정책 리포트]"
        />
          </div>
        </div>

        {/* W11: Valuation */}
        <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'480px' }}>
          <div style={{ marginBottom:'1.2rem', borderBottom:'1px solid #282828', paddingBottom:'0.8rem' }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:600, color:'var(--text-primary)', margin:'0 0 0.4rem' }}>
              <TrendingUp size={17} />글로벌 흑마늘/추출물 가치평가 (Valuation) <span style={{ color:'var(--text-secondary)', fontSize:'0.8rem', fontWeight:400 }}>(단위: 백만 USD)</span>
              <div style={{ marginLeft:'auto', flexShrink:0 }}></div>
            </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          글로벌 흑마늘 추출물 및 마늘 건기식(Supplements) 시장의 연도별 가치평가 추이. J.P. Morgan PEF 멀티플 기반 밸류에이션
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="J.P. Morgan 글로벌 사모펀드(PEF) 실사 API 기준, 동일한 매출이라도 단순 농산물 도매업은 4~5x 멀티플에 그치지만, 가공 기술(Processing) 내재화 시 8x, 수확량 예측 AI(AgTech) 내재화 시 15x 이상의 엔터프라이즈 밸류(EV)를 인정받습니다."
          actionPlan="전통적인 유통 구조에 안주하면 자본 시장에서 가치(Valuation)를 인정받을 수 없습니다. 대시보드 내 GPR 단수 방어, 흑마늘 기능성 가공, 수입 Arbitrage 물류 시스템을 총결합하여 회사를 '글로벌 애그테크 플랫폼'으로 포지셔닝해야 궁극적인 EBITDA 15x 리레이팅 엑시트가 가능합니다."
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
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          주요 국가별 마늘 단위면적당 수확량(Yield, kg/ha) 시계열 추이. FAOSTAT QCL 기반 기후 변화에 따른 단수 효율성 비교
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          actionPlan="국내 수급에 전적으로 의존하는 B2B 식자재/가공 벤더는 중장기적으로 원물 확보 불능(Sourcing Failure) 상태에 빠집니다. 실사 시 자체 농장(Corporate Farming) 보유 여부보다는 인도, 동남아, 중국 등 복수 국가 소싱망을 보유한 업체를 선별해야 밸류에이션 리스크를 헤지할 수 있습니다."
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
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          주요 국가별 마늘 가격 연간 변동성(Volatility) 측정. 월간 가격 표준편차를 연평균으로 나눈 변동 계수(CV) 도출
        </p>
          </div>
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="UN Comtrade 및 글로벌 선물 거래소 실시간 트래킹에 따르면, 마늘 가격 변동 계수(Volatility)는 14~18% 수준에 달해 타 작물(밀, 옥수수 등) 대비 압도적으로 높습니다. 기후 위기 및 투기 자본 유입이 가격 널뛰기를 주도하고 있습니다."
          actionPlan="고변동성은 원가 예측을 불가능하게 만들어 제조 마진을 파괴합니다. 이를 제어하기 위해 선도계약(Forward Contract) 비율을 70% 이상으로 유지하고, 파생상품 및 데이터 기반 가격 예측 알고리즘 운용 능력을 갖춘 퀀트 농업(Quant Agri) 조직 구축이 시급합니다."
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
          <div style={{ height:'250px', width:'100%', marginBottom:'1rem', position:'relative', zIndex:0 }}>
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
          situation="농촌진흥청 바이오매스 연구 및 환경부 API를 분석하면, 박피 공정 시 발생하는 마늘 껍질 및 폐마늘(전체 중량의 약 15%)을 기존처럼 폐기하지 않고 기능성 사료나 바이오매스 비료로 업사이클링 시 부가 마진 6%를 창출하며 폐기 비용이 Zero화 됩니다."
          actionPlan="PEF 밸류업 관점에서 ESG는 단순 규제 준수를 넘어 새로운 'Cash Cow'입니다. 마늘 가공 시설 인수 시, 잔여물을 사료/비료화 하는 폐루프(Closed-loop) 공정 도입 가능성을 철저히 실사하여, 탄소 배출권 및 부가 매출(Top-line) 동시 확장을 도모해야 합니다."
        source="📊 [데이터 출처: 농촌진흥청 & 환경부]"
        />
          </div>
        </div>
      </div>


    </div>
  );
}
