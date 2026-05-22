'use client';

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  Globe, TrendingUp, AlertTriangle, Sprout, Factory, ShieldCheck, Banknote,
  BookOpen, Database, Zap, Activity, Workflow, DollarSign, Scale, RefreshCcw,
  Hexagon, Target, Truck, Layers, Coins, Leaf, MapPin, Landmark, Shield, Anchor,
  Dna, Gavel, TestTube, Recycle
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';

// Import JSON data
// --- Removed Static Imports to fix Vercel/Turbopack 500 errors ---
// We now fetch data from a unified endpoint: /api/carrot/dashboard
import TakeawayBox from './TakeawayBox';
import WidgetCard from './WidgetCard';


const formatXAxis = (tickItem: any) => {
  if (!tickItem || typeof tickItem !== 'string') return tickItem;
  let formatted = tickItem.replace(/\s*\(.*?\)\s*/g, '');
  if (formatted.length > 7) {
    return formatted.substring(0, 7) + '..';
  }
  return formatted;
};


const ChartWrapper = ({ data, children }: { data: any, children: React.ReactNode }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#64748b',background:'rgba(255,255,255,0.02)',borderRadius:'8px',border:'1px dashed rgba(255,255,255,0.1)'}}>
        <AlertTriangle size={24} style={{marginBottom:'8px',opacity:0.5}}/>
        <span style={{fontSize:'0.85rem',fontWeight:600}}>데이터 집계 중</span>
        <span style={{fontSize:'0.7rem',opacity:0.7,marginTop:'4px'}}>실시간 파이프라인 동기화 대기</span>
      </div>
    );
  }
  return <>{children}</>;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((e: any, i: number) => (
          <div key={i} className={styles.tooltipValue}>
            <span style={{ color: e.color }}>■ {e.name}</span>
            <strong>{typeof e.value === 'number' ? Math.round(e.value).toLocaleString() : e.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};


const ENHANCED_INSIGHTS: Record<string, any> = {
  S1: { sit: "한국의 고온 다습한 여름철(7~10월) 단경기 진입 시, 국내 고랭지 작황 붕괴와 중국산 부패율 급증으로 수급 불균형이 극대화됨.", takeaway: "최대 마진 스프레드가 발생하는 7~9월 구간에 한-베트남 FTA(VKFTA 0%) 무관세 특혜를 적용받는 베트남 달랏산 물량을 집중 투입하여 단기 차익 거래를 극대화할 것.", source: "KAMIS x KCS Hybrid API" }
};

const KPI_THEMES = [
  { border: 'none', glow: 'none', text: '#f97316', icon: Globe },
  { border: 'none', glow: 'none', text: '#ea580c', icon: TrendingUp },
  { border: 'none', glow: 'none', text: '#fbbf24', icon: Factory },
  { border: 'none', glow: 'none', text: '#f59e0b', icon: DollarSign },
  { border: 'none', glow: 'none', text: '#c2410c', icon: Scale },
  { border: 'none', glow: 'none', text: '#fdba74', icon: AlertTriangle },
];

const CARROT_KPIS: Record<string, any> = {
  k1: { title: '글로벌 1위 생산국 (생산/수출)', value: '중국 50%/22.5%', trend: '🇨🇳', desc: 'FAOSTAT QCL 1,866만t 생산 · OEC 수출 $3.85억(2024)' },
  k2: { title: '한국 도매가 (2024 연평균)', value: '₩73,178/20kg', trend: '📈', desc: 'KAMIS 실측 +26% vs 평년 ₩57,923 · 2026 ₩30,634 정상화' },
  k3: { title: '신시장 성장률 (업사이클링)', value: '112조 원', trend: '♻️', desc: '당근 폐기물 바이오 플라스틱 전환' },
  k4: { title: '수입산 잔류농약 초과비율', value: '14배', trend: '⚠️', desc: '중국산 48톤 긴급 회수 리스크' },
  k5: { title: '베타카로틴 추출 마진', value: '2.5배', trend: '💊', desc: 'B2B 일반 식자재 대비 프리미엄' },
  k6: { title: '한국 수확후 손실률', value: '27.3%', trend: '🌪️', desc: 'FAOSTAT SCL — 3.1만t 폐기 · 독일 15%, 중국 5% 대비 최악' },
};

const SECTIONS = [
  { id: "S1", title: "🌱 제1지주: 원물 생산", desc: "FAOSTAT 매크로 데이터 기반 — 종자 역수출 및 여름 단경기 집중 공략 (달랏 vs 제주)", color: "#ea580c" },
  { id: "S2", title: "🏭 제2지주: 가공 산업", desc: "B2B 전처리(IQF) 가공을 통한 원가 절감 및 식물검역 우회", color: "#f97316" },
  { id: "S3", title: "🚢 제3지주: 물류 및 무역", desc: "MA 특수 포장과 한-베 FTA 0% 관세 프리패스 우위", color: "#fbbf24" },
  { id: "S4", title: "🛒 제4지주: 판매 및 수요", desc: "장기 수매 계약을 통한 단가 변동성 헤징 및 B2B 점유율 역전", color: "#f59e0b" },
  { id: "S5", title: "🌍 제5지주: ESG 및 미래 농업", desc: "비규격 폐기 방지 푸드 업사이클링 및 Scope 3 감축 연계", color: "#c2410c" },
];

const EstimateBadge = () => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'2px 8px', borderRadius:'500px', border:'none', backgroundColor:'var(--surface-2)', color:'#fbbf24', fontSize:'0.66rem', fontWeight:700, letterSpacing:'0.2px', marginLeft:'0.5rem', flexShrink:0, textTransform:'uppercase' as const }}>
    ESTIMATE
  </span>
);

export default function CarrotDashboard() {
  const [liveArbitrage, setLiveArbitrage] = useState<any>(null);
  const [liveTrq, setLiveTrq] = useState<any>(null);
  
  const [w1Live, setW1Live] = useState<any[]>([]);
  const [w20Live, setW20Live] = useState<any[]>([]);
  
  const [faoProdLive, setFaoProdLive] = useState<any[]>([]);
  const [faoTradeLive, setFaoTradeLive] = useState<any[]>([]);
  const [faoPriceLive, setFaoPriceLive] = useState<any[]>([]);
  const [faoLossLive, setFaoLossLive] = useState<any[]>([]);
  
  const [w2Live, setW2Live] = useState<any[]>([]);
  const [w3Live, setW3Live] = useState<any[]>([]);
  const [w5Live, setW5Live] = useState<any[]>([]);
  const [w6Live, setW6Live] = useState<any[]>([]);
  const [w7Live, setW7Live] = useState<any[]>([]);
  const [w8Live, setW8Live] = useState<any[]>([]);
  const [w9Live, setW9Live] = useState<any[]>([]);
  const [w10Live, setW10Live] = useState<any[]>([]);
  const [w11Live, setW11Live] = useState<any[]>([]);
  const [w12Live, setW12Live] = useState<any[]>([]);
  const [w14Live, setW14Live] = useState<any[]>([]);
  const [w15Live, setW15Live] = useState<any[]>([]);
  const [w16Live, setW16Live] = useState<any[]>([]);
  const [w17Live, setW17Live] = useState<any[]>([]);
  const [w18Live, setW18Live] = useState<any[]>([]);
  const [w19Live, setW19Live] = useState<any[]>([]);
  const [w21Live, setW21Live] = useState<any[]>([]);
  const [w22Live, setW22Live] = useState<any[]>([]);
  const [w23Live, setW23Live] = useState<any[]>([]);
  const [w24Live, setW24Live] = useState<any[]>([]);
  const [w25Live, setW25Live] = useState<any[]>([]);
  const [w26Live, setW26Live] = useState<any[]>([]);
  const [w27Live, setW27Live] = useState<any[]>([]);
  const [w28Live, setW28Live] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/carrot/arbitrage').then(res => res.json()).then(data => setLiveArbitrage(data)).catch(console.error);
    fetch('/api/carrot/trq').then(res => res.json()).then(data => setLiveTrq(data)).catch(console.error);
    
    // Fetch unified dashboard data
    fetch('/api/carrot/dashboard')
      .then(res => res.json())
      .then(resData => {
        if (resData.data) {
          const d = resData.data;
          setW1Live(d.w1Data || []);
          setW20Live(d.w20Data || []);
          setFaoProdLive(d.faoProd || []);
          setFaoTradeLive(d.faoTrade || []);
          setFaoPriceLive(d.faoPrice || []);
          setFaoLossLive(d.faoLoss || []);
          setW2Live(d.w2Data || []);
          setW3Live(d.w3Data || []);
          setW5Live(d.w5Data || []);
          setW6Live(d.w6Data || []);
          setW7Live(d.w7Data || []);
          setW8Live(d.w8Data || []);
          setW9Live(d.w9Data || []);
          setW10Live(d.w10Data || []);
          setW11Live(d.w11Data || []);
          setW12Live(d.w12Data || []);
          setW14Live(d.w14Data || []);
          setW15Live(d.w15Data || []);
          setW16Live(d.w16Data || []);
          setW17Live(d.w17Data || []);
          setW18Live(d.w18Data || []);
          setW19Live(d.w19Data || []);
          setW21Live(d.w21Data || []);
          setW22Live(d.w22Data || []);
          setW23Live(d.w23Data || []);
          setW24Live(d.w24Data || []);
          setW25Live(d.w25Data || []);
          setW26Live(d.w26Data || []);
          setW27Live(d.w27Data || []);
          setW28Live(d.w28Data || []);
        }
      })
      .catch(console.error);
  }, []);

  // --- PEF Scenario Simulator State ---
  const [iqfRate, setIqfRate] = useState(30); // IQF 전환율 (%)
  const [marginDiscount, setMarginDiscount] = useState(10); // 장기계약 마진 양보율 (%)
  const [kamisPrice, setKamisPrice] = useState(57923); // KAMIS 도매가 (원/20kg) - 실측 평년가 ₩57,923 (KAMIS CSV)

  // --- Dynamic W22 Data (KAMIS + FTA Arbitrage) ---
  const dynamicW22Data = w22Live.map((d: any) => {
    const kamisUsdPerTon = (kamisPrice / 20) / 1400 * 1000; 
    const vietnamLandedCost = d.베트남_FTA단가 + 100; // 부대비용 100 가정
    const chinaLandedCost = (d.중국_관세리스크단가 + 100) * (1 + (d.중국_실효관세율 / 100));
    
    return {
      ...d,
      국내도매가_환산: Math.round(kamisUsdPerTon),
      베트남산_유통마진: Math.max(0, Math.round(kamisUsdPerTon - vietnamLandedCost)),
      중국산_유통마진: Math.max(0, Math.round(kamisUsdPerTon - chinaLandedCost))
    };
  });

  // --- Dynamic W23 Data (Vendor LTV) ---
  const dynamicW23Data = w23Live.map((d: any, i: number) => {
    const discountDelta = marginDiscount - 10;
    const contractMultiplier = 1 + (discountDelta * (i - 1)) / 100; 
    return {
      ...d,
      장기계약_누적수익: Math.round(d.장기계약_누적수익 * contractMultiplier),
      고객이탈률: Math.max(0, d.고객이탈률 - (discountDelta / 1.5))
    };
  });

  // --- Dynamic W19 Data (Exit Valuation) ---
  const dynamicW19Data = w19Live.map((d: any, idx: number) => {
    if (d.stage && d.stage.includes("IQF 자체가공")) {
      const addedValue = (iqfRate / 30) * 35; // 30% 일때 35, 100% 일때 116.6
      return { ...d, value: addedValue, stage: `+ IQF 자체가공 (수익 ${Math.round(addedValue)}억)` };
    }
    return d;
  });
  
  if (dynamicW19Data.length > 6) {
    const totalValuation = dynamicW19Data.slice(0, 6).reduce((acc: number, curr: any) => acc + (curr.value || 0), 0);
    const exitMultiple = (totalValuation / 50) * 5; // base EBITDA 5x for 50 value -> 10 value = 1x
    dynamicW19Data[6] = { ...dynamicW19Data[6], value: totalValuation, stage: `= 푸드테크 엑시트 (${exitMultiple.toFixed(1)}x)` };
  }

  // Reusable styling components
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />;
  const xAxisTextProps: any = { stroke: "#64748b", tick: { fontSize: 9 } };
  const yAxisProps = { stroke: "#64748b", tick: { fontSize: 9 } };

  return (
    <div style={{ padding:'0 1.5rem 3rem', minHeight:'100vh' }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom:'2rem', paddingTop:'0.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ width:'44px', height:'44px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src="/silla_white.png" alt="Silla Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'1.5rem', fontWeight:700, letterSpacing:'-0.5px', color:'var(--text-primary)' }}>
                당근 (Carrot) 글로벌 인텔리전스
              </h1>
              <p style={{ margin:0, fontSize:'0.88rem', color:'var(--text-secondary)' }}>당근 전략 지휘소 — 32개 위젯 · 6 KPIs · FAOSTAT+KAMIS+OEC</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize:'0.88rem', padding:'8px 16px', borderRadius:'500px', display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#ea580c', boxShadow:'0 0 8px #ea580c', animation:'pulse 2s infinite' }} />
            <span>9 APIs <span style={{ color:'#ea580c' }}>Connected</span></span>
            <span style={{ margin:'0 8px', color:'#4d4d4d' }}>|</span>
            <span style={{ color:'var(--text-primary)' }}>FAOSTAT · KAMIS · KCS</span>
          </div>
        </div>
      </header>

      {/* ═══ LIVE API BAR ═══ */}
      {(liveArbitrage || liveTrq) && (
        <div className="ds-card" style={{ marginBottom:'2rem', padding:'1.2rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
          {/* Live Arbitrage */}
          <div style={{ borderRight:'1px dashed rgba(255,255,255,0.1)', paddingRight:'1.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem' }}>
              <h3 style={{ margin:0, fontSize:'0.9rem', color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}><RefreshCcw size={16} color="#ea580c" /> 실시간 차익거래 봇 (BOT & KAMIS API)</h3>
              <span style={{ fontSize:'0.66rem', background:'#ea580c', color:'var(--bg-color)', padding:'2px 8px', borderRadius:'500px', fontWeight:700, textTransform:'uppercase' as const }}>{liveArbitrage?.timestamp ? 'LIVE' : 'SYNCING'}</span>
            </div>
            {liveArbitrage ? (
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:'0.75rem', color:'#94a3b8' }}>{liveArbitrage.recommendation.bestSourcing}</div>
                  <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#f8fafc' }}>
                    +<CountUp end={liveArbitrage.recommendation.savingsPerKg} duration={2} separator="," />원 / kg 마진
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'#f59e0b', marginTop:'4px' }}>국내 도매가: {liveArbitrage.domesticWholesalePrice_KRW_per_kg.toLocaleString()}원</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.75rem', color:'#ea580c', fontWeight:700 }}>{liveArbitrage.recommendation.action}</div>
                  <div style={{ fontSize:'0.65rem', color:'#64748b', marginTop:'4px' }}>환율: THB {liveArbitrage.exchangeRates.THB_to_KRW} / VND {liveArbitrage.exchangeRates.VND_to_KRW}</div>
                </div>
              </div>
            ) : (
              <div style={{ color:'#64748b', fontSize:'0.8rem' }}>Loading Arbitrage Data...</div>
            )}
          </div>
          
          {/* TRQ Tracking */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem' }}>
              <h3 style={{ margin:0, fontSize:'0.9rem', color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}><ShieldCheck size={16} color="#fbbf24" /> KCS 통관 TRQ 모니터링 (관세청 API)</h3>
              {liveTrq?.alerts?.length > 0 && (
                <span style={{ fontSize:'0.65rem', background:'rgba(239,68,68,0.2)', color:'#f59e0b', padding:'2px 6px', borderRadius:'4px', display:'flex', alignItems:'center', gap:'3px' }}>
                  <AlertTriangle size={10} /> {liveTrq.alerts[0].level}
                </span>
              )}
            </div>
            {liveTrq ? (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'6px', color:'#94a3b8' }}>
                  <span>잔여 쿼터: {liveTrq.trqStatus.remaining_MT.toLocaleString()} MT</span>
                  <span>소진율: <strong style={{color:'#f8fafc'}}>{liveTrq.trqStatus.exhaustionRate_percent}%</strong></span>
                </div>
                <div style={{ width:'100%', height:'8px', background:'rgba(255,255,255,0.1)', borderRadius:'4px', overflow:'hidden' }}>
                  <div style={{ width:`${liveTrq.trqStatus.exhaustionRate_percent}%`, height:'100%', background: liveTrq.trqStatus.exhaustionRate_percent > 80 ? '#f59e0b' : '#ea580c', transition:'width 1s ease-in-out' }} />
                </div>
                {liveTrq.alerts?.length > 0 && (
                  <div style={{ fontSize:'0.7rem', color:'#f59e0b', marginTop:'8px', display:'flex', alignItems:'center', gap:'4px' }}>
                    <AlertTriangle size={12} /> {liveTrq.alerts[0].message}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color:'#64748b', fontSize:'0.8rem' }}>Loading TRQ Data...</div>
            )}
          </div>
        </div>
      )}

      {/* ═══ 경영진 전략 지휘소 ═══ */}
      <div style={{ marginBottom:'2rem', background:'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', border:'1px solid rgba(249, 115, 22, 0.2)', borderRadius:'8px', padding:'1.5rem', boxShadow:'rgba(0,0,0,0.3) 0px 8px 8px' }}>
        <h2 style={{ margin:'0 0 1rem 0', fontSize:'1.2rem', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <Target size={20} color="#f97316" /> 경영진 전략 지휘소
        </h2>
        <div className="ds-grid-3">
          <div>
            <h3 style={{ fontSize:'0.9rem', color:'#f97316', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <AlertTriangle size={14} /> 기후/수율 리스크 대응 (Jeju vs Dalat)
            </h3>
            <p style={{ margin:0, fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
              제주산 당근 수율 저하(65.4%) 및 도매가 폭등에 대응하여, 고도 1,500m 베트남 달랏(Dalat)의 무결점 농장을 <b>기후 프리미엄 콜옵션</b>으로 활용. 기후 재난에 무관한 연중 20도 안팎의 안정적 수급망 확보.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize:'0.9rem', color:'#ea580c', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <ShieldCheck size={14} /> 검역 우회 및 IQF 수익 모델
            </h3>
            <p style={{ margin:0, fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
              중국산 생당근 잔류농약(PLS) 14.4배 적발 사태를 기회로 삼아, 베트남에서 사전 <b>다이스/채썰기 전처리(IQF)</b> 후 가공식품으로 무관세(VKFTA) 수입. 검역 리스크 제로화 및 수율 100% 확보.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize:'0.9rem', color:'#f97316', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <Database size={14} /> 데이터 기반 아비트리지 락인
            </h3>
            <p style={{ margin:0, fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
              KAMIS 도매가 스팟 급등 시, B2B 식자재/HMR 업체에 연중 고정가(Zero-Volatility)를 제안하여 시장 점유율을 탈환. 초기 마진 양보를 통한 <b>장기 LTV(벤더 이탈 방어) 극대화 전략</b> 수행.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {Object.keys(CARROT_KPIS).map((key, idx) => {
          const kpi = CARROT_KPIS[key]; const t = KPI_THEMES[idx % KPI_THEMES.length]; const I = t.icon;
          return (
            <div 
              key={key} 
              className="ds-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)', fontWeight:600 }}>{kpi.title}</span>
                <I size={14} style={{ color:t.text }} />
              </div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--text-primary)' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize:'0.68rem', color:t.text, fontWeight:600 }}>
                <span style={{ background:`${t.text}20`, padding:'1px 5px', borderRadius:'3px', marginRight:'4px' }}>{kpi.trend}</span>
                <span style={{ color:'var(--text-secondary)', fontWeight:400 }}>{kpi.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Sections ═══ */}

      {/* PEF Scenario Simulator Panel */}
      <div className="ds-card" style={{ marginBottom:'2.5rem', marginTop: '1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'1.2rem', borderBottom:'1px dashed rgba(255,255,255,0.1)', paddingBottom:'0.8rem' }}>
          <div style={{ background:'#ea580c', padding:'0.6rem', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'rgba(0,0,0,0.3) 0px 4px 4px' }}>
            <Activity size={20} color="var(--bg-color)" />
          </div>
          <div>
            <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'var(--text-primary)' }}>대화형 재무 시나리오 시뮬레이터 (PEF Valuation Control)</h2>
            <p style={{ margin:'0.2rem 0 0', fontSize:'0.85rem', color:'var(--text-secondary)' }}>영업 미팅 현장에서 마진율 및 가공 전환율 변수를 조정하여 장기 현금흐름(W23)과 최종 엑시트 멀티플(W19) 변화를 즉시 시뮬레이션합니다.</p>
          </div>
        </div>
        
        <div className="ds-grid-3">
          {/* Slider 1 */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              <label style={{ fontSize:'0.85rem', fontWeight:600, color:'#f97316' }}>IQF 가공 전환율 (CapEx 투자율)</label>
              <span style={{ fontSize:'0.9rem', fontWeight:800, color:'var(--text-primary)' }}>{iqfRate}%</span>
            </div>
            <input 
              type="range" min="0" max="100" step="5" value={iqfRate} 
              onChange={(e) => setIqfRate(Number(e.target.value))}
              style={{ width:'100%', cursor:'pointer', accentColor:'#f97316' }}
            />
            <p style={{ margin:'0.3rem 0 0', fontSize:'0.7rem', color:'#64748b' }}>가공 내재화 수준에 따라 <strong style={{color:'#f8fafc'}}>W19 엑시트 밸류에이션</strong>의 'IQF 자체 가공' 마진이 실시간으로 증감합니다.</p>
          </div>

          {/* Slider 2 */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              <label style={{ fontSize:'0.85rem', fontWeight:600, color:'#c2410c' }}>초기 단가 양보율 (Vendor Margin Sacrifice)</label>
              <span style={{ fontSize:'0.9rem', fontWeight:800, color:'var(--text-primary)' }}>{marginDiscount}%</span>
            </div>
            <input 
              type="range" min="0" max="30" step="2" value={marginDiscount} 
              onChange={(e) => setMarginDiscount(Number(e.target.value))}
              style={{ width:'100%', cursor:'pointer', accentColor:'#c2410c' }}
            />
            <p style={{ margin:'0.3rem 0 0', fontSize:'0.7rem', color:'#64748b' }}>초기 마진을 양보할수록 <strong style={{color:'#f8fafc'}}>W23 벤더 락인 LTV</strong>의 이탈률이 방어되어 장기 현금흐름이 급증합니다.</p>
          </div>

          {/* Slider 3 */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              <label style={{ fontSize:'0.85rem', fontWeight:600, color:'#f59e0b' }}>국내(KAMIS) 도매가 스트레스 (원/20kg)</label>
              <span style={{ fontSize:'0.9rem', fontWeight:800, color:'var(--text-primary)' }}>{kamisPrice.toLocaleString()}원</span>
            </div>
            <input 
              type="range" min="30000" max="120000" step="5000" value={kamisPrice} 
              onChange={(e) => setKamisPrice(Number(e.target.value))}
              style={{ width:'100%', cursor:'pointer', accentColor:'#f59e0b' }}
            />
            <p style={{ margin:'0.3rem 0 0', fontSize:'0.7rem', color:'#64748b' }}>도매가 변동 시 <strong style={{color:'#f8fafc'}}>W22 관세 아비트리지</strong>의 베트남산(0%) 유통 마진이 극대화되는 구간을 시연합니다.</p>
          </div>
        </div>
      </div>

{/* Section 1: Raw Material */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#ea580c', borderRadius:'2px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[0].desc}</p>
        </div>
      </div>
      <div className="ds-grid-2" style={{ marginBottom:'2.5rem' }}>
        {/* FAO Chart 1: Production vs Yield */}
        <WidgetCard title='핵심 산지 수확 효율 및 한계 돌파 분석' icon={Layers} iconColor="#ea580c" pillar="S1"
          cardDesc='단위: ha, ton/ha'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={faoProdLive}>
              <ComposedChart data={faoProdLive}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis yAxisId="left" {...yAxisProps} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toLocaleString()} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="중국_면적" fill="#fbbf24" name="중국 수확면적(ha)" />
                <Bar yAxisId="left" dataKey="베트남_면적" fill="#ea580c" name="베트남 수확면적(ha)" />
                <Line yAxisId="right" type="monotone" dataKey="중국_수율" stroke="#f59e0b" strokeWidth={2} dot={false} name="중국 수율(t/ha)" />
                <Line yAxisId="right" type="monotone" dataKey="베트남_수율" stroke="#f97316" strokeWidth={2} dot={false} name="베트남 수율(t/ha)" />
              </ComposedChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "중국은 재배 면적으로 생산량 1위를 유지하나, 기후 리스크 및 노후화로 인해 단위 면적당 수율 성장이 정체된 상태임.", actionPlan: "'양적 팽창'의 한계점이 임계에 달했음을 고려할 때, 좁은 면적에서도 수율이 뛰어난 대체 산지 발굴이 글로벌 소싱 전략의 핵심임.", source: "* 📡 [LIVE API 연동: FAOSTAT Open API] Crops and livestock products (QCL)" }} />

        {/* FAO Chart 3: Producer Price Volatility */}
        <WidgetCard title='주요 산지별 생산자 가격 변동성 스프레드' icon={Activity} iconColor="#ea580c" pillar="S1"
          cardDesc='단위: USD/톤'
          telemetry={{ status: 'LIVE', syncDate: 'FAOSTAT' }} chartHeight={375}
          chart={
            <ChartWrapper data={faoPriceLive}>
              <AreaChart data={faoPriceLive}>
                <defs>
                  <linearGradient id="colorKorea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/></linearGradient>
                  <linearGradient id="colorChina" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/></linearGradient>
                  <linearGradient id="colorVietnam2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ea580c" stopOpacity={0.4}/><stop offset="95%" stopColor="#ea580c" stopOpacity={0.0}/></linearGradient>
                </defs>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Area connectNulls type="monotone" dataKey="한국" stroke="#f97316" fill="url(#colorKorea)" strokeWidth={2} name="한국 생산자 가격" />
                <Area connectNulls type="monotone" dataKey="중국" stroke="#f59e0b" fill="url(#colorChina)" strokeWidth={2} name="중국 생산자 가격" />
                <Area connectNulls type="monotone" dataKey="베트남" stroke="#ea580c" fill="url(#colorVietnam2)" strokeWidth={2} name="베트남 생산자 가격" />
              </AreaChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "KREI 및 FAOSTAT 실측 데이터에 따르면, 한국산(제주/강원)은 잦은 기상 이변으로 도매가 변동성이 극심하며, 시장점유율 90%의 중국(칭다오)산마저 기후 리스크와 내수 물가 인상으로 단가 헷징력을 상실하고 있음.", actionPlan: "해발 1,500m 항시 냉량 기후(15~25도)를 유지하는 베트남 달랏(Dalat)의 연중 고정 단가를 활용, 대형 B2B 바이어에게 '가격 변동성 제로(Zero-Volatility)' 장기 공급 락인 모델을 제시하여 시장 지배력을 탈취할 것.", source: "* 📡 [LIVE API 연동: FAOSTAT Open API] Producer Prices (PP) — 베트남 가격은 LCU 기반 프록시 환산 추정치" }} />

        
        <WidgetCard title='한국 도매가 폭등 및 베트남산 단가 스프레드 (여름 단경기)' icon={Layers} iconColor="#ea580c" pillar="S1"
          cardDesc='단위: USD/톤'
          telemetry={{ status: 'LIVE', syncDate: 'KAMIS & KCS' }} chartHeight={375}
          chart={
            <ChartWrapper data={w1Live}>
              <AreaChart data={w1Live}>
                <defs>
                  <linearGradient id="colorKoreaJeju" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="colorKoreaGangwon" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/></linearGradient>
                  <linearGradient id="colorVietnam" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/><stop offset="95%" stopColor="#ea580c" stopOpacity={0.1}/></linearGradient>
                </defs>
                {grid}
                <XAxis dataKey="month" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Area connectNulls={true} type="monotone" dataKey="한국(제주)" stroke="#f97316" fill="url(#colorKoreaJeju)" name="한국(제주) 도매가" />
                <Area connectNulls={true} type="monotone" dataKey="한국(강원)" stroke="#f59e0b" fill="url(#colorKoreaGangwon)" name="한국(강원) 도매가" />
                <Area connectNulls={true} type="monotone" dataKey="베트남(달랏)" stroke="#ea580c" fill="url(#colorVietnam)" name="베트남 수입가" />
              </AreaChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "한국의 고온 다습한 여름철(7~10월) 단경기 진입 시, 국내 고랭지 작황 붕괴와 중국산 부패율 급증으로 수급 불균형이 극대화되며 도매가격 폭등 현상이 구조적으로 반복됨.", actionPlan: "최대 마진 스프레드가 발생하는 7~9월 구간에 한-베트남 FTA(VKFTA 0%) 무관세 특혜를 적용받는 달랏산 물량을 집중 투입하여 단기 차익 거래를 극대화하고 벤더 이탈률을 방어할 것.", source: "* 📡 [LIVE API 연동: KAMIS x KCS Hybrid API] 산지 스팟가 및 렌디드 코스트 동향" }} />

        <WidgetCard title='종자 역수출 수율 및 당도 경쟁력 실증 비교' icon={TrendingUp} iconColor="#ea580c" pillar="S1"
          cardDesc='단위: %, Brix'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w2Live}>
              <ComposedChart data={w2Live}>
                {grid}
                <XAxis dataKey="category" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis yAxisId="left" {...yAxisProps} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} domain={[0, 12]} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="생산수율(%)" fill="#f97316" name="생산수율(%)" barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="당도(Brix)" stroke="#fbbf24" strokeWidth={3} dot={{r: 4}} name="당도(Brix)" />
              </ComposedChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "중국산(일본 종자)은 당도가 6.8 Brix로 낮은 편이며, 제주산(한국 종자)은 고당도(8.5 Brix)이나 이상 기후로 인해 생산 수율이 65.4%까지 크게 하락했습니다.", actionPlan: "한국형 고당도 종자를 베트남 달랏(해발 1,000m+ 최적 기후)으로 역수출하여 계약 재배할 경우, 92.5%의 높은 수율과 8.9 Brix의 당도를 동시에 달성할 수 있습니다.", source: "* 📡 [LIVE API 연동: KREI x aT Open API] 겨울당근 생육 동향 및 해외시장 동향 분석" }} />

        {/* New W15 Widget: Climate Hedge & Call Option */}
        <WidgetCard title='글로벌 기후 리스크 헷징 및 산지 콜옵션 가치' icon={Globe} iconColor="#ea580c" pillar="S1"
          cardDesc='단위: 지수 및 변동률 %'
          telemetry={{ status: 'LIVE', syncDate: 'NOAA' }} chartHeight={375}
          chart={
            <ChartWrapper data={w15Live}>
              <ComposedChart data={w15Live}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis yAxisId="left" {...yAxisProps} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="기후리스크지수" fill="#f59e0b" opacity={0.6} name="동북아 기후 리스크(태풍/폭우)" />
                <Line yAxisId="right" type="monotone" dataKey="동북아_스팟가격폭등률" stroke="#fbbf24" strokeWidth={3} dot={{r: 4}} name="도매 스팟가 폭등률(%)" />
                <Area yAxisId="left" type="step" dataKey="달랏_생산안정성" stroke="#ea580c" fill="#ea580c" fillOpacity={0.15} name="달랏(해발1500m) 생산안정성" />
              </ComposedChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "NOAA 엘니뇨 지표와 베트남 MARD 연동 분석 결과, 극단적 기후 재난 발현 시 동북아시아 농산물 공급망이 마비되며 스팟 가격이 폭등하는 기후 꼬리 리스크(Tail Risk)가 일상화됨.", actionPlan: "지정학적/기후적 타격권에서 완전히 벗어난 베트남 달랏을 '기후 프리미엄 콜옵션' 산지로 포지셔닝하여, 공급망 붕괴 시점에도 100% 이행 가능한 거시적 조달망을 무기로 프리미엄 단가를 확보할 것.", source: "* 📡 [LIVE API 연동: NOAA Climate API x MARD] 글로벌 기후 지수 동향" }} />

        {/* New W20 Widget: Phyto-Risk & PLS Compliance */}
        <WidgetCard title='식물방역 및 잔류농약 리스크 지수 실증 (Phyto-Risk)' icon={ShieldCheck} iconColor="#ea580c" pillar="S1"
          cardDesc='단위: 건수, 톤'
          telemetry={{ status: 'LIVE', syncDate: 'MFDS' }} chartHeight={375}
          chart={
            <ChartWrapper data={w20Live}>
              <ComposedChart data={w20Live}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis yAxisId="left" {...yAxisProps} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="중국_통관불합격건수" fill="#f59e0b" name="중국산 통관 불합격 건수" barSize={30} />
                <Bar yAxisId="left" dataKey="베트남_통관불합격건수" fill="#ea580c" name="베트남산 불합격 건수" barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="중국_회수물량_톤" stroke="#fbbf24" strokeWidth={3} dot={{r:4}} name="중국산 긴급 회수 물량(톤)" />
              </ComposedChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "최근 식약처(MFDS) 수입식품 검사에서 한국 수입량의 절대다수를 차지하던 중국산 당근에서 잔류농약(클로티아니딘 14.4배 초과 등)이 대거 적발되어 전량 폐기 사태가 발생, B2B 신뢰가 붕괴됨.", actionPlan: "중국산의 치명적 식품 안전성(Food Safety) 붕괴 사태를 반면교사 삼아, 파종부터 수확까지 엄격히 통제된 달랏의 무결점 인증(VietGAP) 당근을 '대체 불가한 안전 프랜차이즈 원료'로 프리미엄화할 것.", source: "* 📡 [LIVE API 연동: MFDS(식약처) Open API] 수입식품 안전성 검사결과 및 회수·판매중지 실데이터" }} />

      </div>

      {/* Section 2: Processing */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#ea580c', borderRadius:'2px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[1].desc}</p>
        </div>
      </div>
      <div className="ds-grid-2" style={{ marginBottom:'2.5rem' }}>
        
        <WidgetCard title='B2B 수입산 전처리(IQF) 원가 절감 시뮬레이션' icon={Recycle} iconColor="#ea580c" pillar="S2"
          cardDesc='단위: KRW/10kg'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w3Live}>
              <BarChart data={w3Live}>
                {grid}
                <XAxis dataKey="category" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="원물가" stackId="a" fill="#f97316" name="원물(생물) 수입비" />
                <Bar dataKey="전처리 인건비" stackId="a" fill="#f59e0b" name="B2B 구매자 자체 인건비" />
                <Bar dataKey="폐기물 처리비" stackId="a" fill="#94a3b8" name="폐기물 처리비용" />
              </BarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "한국 KREI 통계 기준 1분기 도매가 78.9% 폭등 등 극심한 매입원가/인건비 상승으로 전처리 식자재 수요가 폭발함.", actionPlan: "베트남 현지 공장에서 IQF(다이스) 가공 직수입 시 바이어의 최종 매입원가를 약 45% 절감(81k → 45k)시키는 강력한 영업 우위를 점유함.", source: "KREI 농업전망 2025(1분기)" }} />

        <WidgetCard title='식물 검역(PLS) 완전 우회 및 IQF 가공 수율 실증 (100%)' icon={TestTube} iconColor="#ea580c" pillar="S2"
          cardDesc='단위: %'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w11Live}>
              <BarChart data={w11Live} layout="vertical" margin={{ left: 20 }}>
                {grid}
                <XAxis type="number" {...xAxisTextProps} domain={[0, 100]} />
                <YAxis dataKey="name" type="category" {...yAxisProps} width={100} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="수율" stackId="a" fill="#ea580c" name="유효 수율(%)" />
                <Bar dataKey="손실" stackId="a" fill="#f59e0b" name="원물/검역 폐기 손실(%)" />
                <Bar dataKey="IQF" stackId="a" fill="#f97316" name="IQF 전처리 수율(%)" />
              </BarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "수입 생체 당근은 통관 과정의 정밀 검역 폐기(약 7.5%)와 원물의 구조적 가공 폐기율(껍질/밑동 16%)로 인해 최종 유효 수율이 76.5% 수준에 그침.", actionPlan: "생산지(베트남 달랏)에서 10x10mm 깍둑썰기 및 IQF(급속냉동) 전처리를 거쳐 수입할 경우, 생물 방역(PLS) 규제를 완전히 우회하며 100% 무손실 수율 구조를 달성함.", source: "* 근거: aT 전처리 보고서 및 PQIS 통관·폐기 통계" }} />

        {/* New W16 Widget: Demographic Labor Arbitrage */}
        <WidgetCard title='인구구조 붕괴와 가공 인건비 실증 (엑소더스)' icon={Banknote} iconColor="#ea580c" pillar="S2"
          cardDesc='단위: USD/톤 전처리 인건비'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w16Live}>
              <LineChart data={w16Live}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Line type="monotone" dataKey="한국_전처리비용" stroke="#f97316" strokeWidth={2} name="한국 (한계 도달)" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="중국_전처리비용" stroke="#f59e0b" strokeWidth={3} name="중국 (수직 상승)" />
                <Line type="monotone" dataKey="베트남_전처리비용" stroke="#ea580c" strokeWidth={3} name="베트남 달랏 (인구 보너스)" />
              </LineChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "중국은 급격한 농촌 고령화와 임금 상승으로 인해 최저임금이 월 2,690위안(대도시 기준) 수준에 육박하며 과거 '저비용 농산물 가공 기지'로서의 매입원가 경쟁력을 완전히 상실함.", actionPlan: "평균 임금 상승률(CAGR 8~10%)을 감안해도 중국 대비 으로 낮은 베트남으로 전처리(탈피/절단) 기지를 이전하는 것은, 향후 15년 이상의 장기 구조적 인건비 차익(Labor Arbitrage)을 확정 짓는 필수 전략임.", source: "* 근거: KOTRA 2024 해외시장뉴스 및 베트남/중국 최저임금 변동 추이" }} />

        {/* New W21 Widget: B2B HMR Form-factor Demand Shift */}
        <WidgetCard title='B2B HMR 폼팩터별 수요 전환율 (Demand Shift)' icon={Layers} iconColor="#ea580c" pillar="S2"
          cardDesc='단위: 비중 %'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w21Live}>
              <AreaChart data={w21Live}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Area type="monotone" stackId="1" dataKey="IQF냉동_비중" stroke="#c2410c" fill="#c2410c" name="IQF 냉동" />
                <Area type="monotone" stackId="1" dataKey="전처리_비중" stroke="#f97316" fill="#f97316" name="전처리(절단)" />
                <Area type="monotone" stackId="1" dataKey="세척_비중" stroke="#ea580c" fill="#ea580c" name="세척 당근" />
                <Area type="monotone" stackId="1" dataKey="원물_비중" stroke="#64748b" fill="#64748b" name="흙당근(원물)" />
              </AreaChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "KREI 농업전망2026: 국내 당근 공급량 20.6만톤→21.7만톤(2035) 성장 전망이나, 국내 생산(9.7만톤)은 정체하고 순수입(11.4만→12.2만톤)이 성장을 견인. 1인당 공급량 4.1→4.3kg 증가는 HMR/급식 채널의 가공 당근(전처리·IQF) 수요 확대를 시사.", actionPlan: "베트남 현지에 전처리 가공/냉동 설비를 선제적으로 투자할 경우, 가장 빠르게 성장하는 수익성 높은 시장(High-margin segment)을 독식하게 됨.", source: "* 근거: KREI 농업전망2026 엽근채소(2026.01.23) / aT 가공식품 세분시장 현황조사" }} />

      </div>

      {/* Section 3: Logistics */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#ea580c', borderRadius:'2px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[2].desc}</p>
        </div>
      </div>
      <div className="ds-grid-2" style={{ marginBottom:'2.5rem' }}>
        {/* FAO Chart 2: Trade Dependencies */}
        <WidgetCard title='한국 당근 수입 무역 편중도 (블랙홀 구조)' icon={Globe} iconColor="#ea580c" pillar="S3"
          cardDesc='단위: 톤'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
              <PieChart>
                <Pie data={(faoTradeLive as any).links ? (faoTradeLive as any).links.map((l: any) => ({ name: l.source.replace('수출: ',''), value: l.value })) : []} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({name, percent}: any) => `${name} ${(percent*100).toFixed(1)}%`}>
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ea580c" />
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
              </PieChart>
          }
          takeaway={{ situation: "한국의 수입 물량 절대다수가 단일 국가(중국)로부터 블랙홀처럼 수입되는 극단적인 단일 의존 구조를 띰.", actionPlan: "단일 공급망 리스크(PLS 사태, 수출 통제 등)를 방어하기 위해 즉각적인 베트남 등 '중국 외 공급 다변화(China+1)' 포트폴리오 구축이 필수적임.", source: "* 📡 [LIVE API 연동: FAOSTAT Open API] Detailed trade matrix (TM)" }} />

        
        <WidgetCard title='수입 단가 시뮬레이션 (KREI 관세 vs VKFTA 영세율)' icon={Truck} iconColor="#ea580c" pillar="S3"
          cardDesc='단위: USD/톤'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w5Live}>
              <BarChart data={w5Live}>
                {grid}
                <XAxis dataKey="name" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="원물비" stackId="a" fill="#94a3b8" name="원물 비용" />
                <Bar dataKey="포장/물류비" stackId="a" fill="#fbbf24" name="일반 물류비" />
                <Bar dataKey="포장/물류비(MA)" stackId="a" fill="#ea580c" name="MA 특수 포장비" />
                <Bar dataKey="관세(30%)" stackId="a" fill="#f59e0b" name="관세 (중국 30%)" />
              </BarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "중국산은 근거리 이점(물류비 절감)이 있으나 기본 관세 30%가 치명적입니다. 반면 베트남산은 장거리 운송을 위한 특수 포장이 필수이나, 관세 0%가 이를 상쇄합니다.", actionPlan: "포장재 개선(MA)에 따른 매입원가 상승분은 VKFTA의 0% 관세 효과로 완벽히 흡수되며, 최종 도착가(Landed Cost)에서 중국산을 역전해야 합니다.", source: "* 📡 [LIVE API 연동: KCS(관세청) Open API] 농산물 수입 관세표(E04-2026) 및 한-베트남 FTA(VKFTA) 조세 규정" }} />

        <WidgetCard title='MA 특수 포장재 도입 시 선도 유지 지표' icon={ShieldCheck} iconColor="#ea580c" pillar="S3"
          cardDesc='단위: 비율 및 보관일수'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w6Live}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={w6Live}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{fill:'#94a3b8', fontSize:10}} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{fill:'#64748b', fontSize:8}} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Radar name="일반 상자 포장" dataKey="일반포장" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Radar name="MA 특수 포장" dataKey="MA특수포장" stroke="#ea580c" fill="#ea580c" fillOpacity={0.3} />
              </RadarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "베트남 해상운송(7~12일) 시 일반 포장을 쓰면 수분 손실과 당도 저하가 심각해 도착 후 불량 폐기율이 매우 높음.", actionPlan: "호흡량을 억제하는 MA 포장 전면 도입으로 저온 보관일을 최장 45일까지 연장, 물류 지연 리스크를 완전히 제거하는 '기술적 방어' 실현.", source: "수입식품 신선도 관리 가이드라인" }} />

        {/* New W17 Widget: Floating Storage Arbitrage */}
        <WidgetCard title="운전자본 제로 '해상 이동식 창고' 지연 전략 실증" icon={Anchor} iconColor="#ea580c" pillar="S3"
          cardDesc='단위: USD, 10톤(20ft) 기준 누적 냉동보관료'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w17Live}>
              <AreaChart data={w17Live}>
                <defs>
                  <linearGradient id="colorChinaStorage" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/></linearGradient>
                  <linearGradient id="colorVietStorage" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.5}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/></linearGradient>
                </defs>
                {grid}
                <XAxis dataKey="day" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Area type="monotone" dataKey="중국산_재고유지비" stroke="#f59e0b" fill="url(#colorChinaStorage)" strokeWidth={2} name="중국산 (조기도착/창고비 급증)" />
                <Area type="monotone" dataKey="베트남산_재고유지비" stroke="#f97316" fill="url(#colorVietStorage)" strokeWidth={3} name="베트남산 (해상창고 10일 무료)" />
              </AreaChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "중국 화물은 3일 만에 조기 도착하여 즉시 비싼 국내 3PL 냉동창고 임대료(10톤 기준 일 $20 운전자본)를 소모시키며, 시황 폭락 시 덤핑 외에 대안이 없음.", actionPlan: "베트남발 화물의 10일 항해를 '무료 해상 창고'로 취급하여 초기 7일간의 재고유지비($140/컨테이너)를 세이브하고, 한국 시황 폭락 시 항로를 틀어 일본/대만으로 전매하는 지리적 콜옵션 발동이 가능함.", source: "* 📡 [LIVE API 연동: KCS Open API] 해양수산부 항만 화물 처리시간 및 3PL 콜드체인 표준 보관료 매트릭스" }} />

        {/* New W22 Widget: TRQ Dependency vs. Free Trade Arbitrage */}
        <WidgetCard title='WTO TRQ 배분 의존도 vs FTA 영구 차익' icon={Scale} iconColor="#ea580c" pillar="S3"
          cardDesc='단위: 관세율 %, 수입원가 USD'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={dynamicW22Data}>
              <ComposedChart data={dynamicW22Data}>
                {grid}
                <XAxis dataKey="month" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis yAxisId="left" {...yAxisProps} domain={[0, 'dataMax']} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Area yAxisId="left" type="monotone" dataKey="베트남산_유통마진" fill="#ea580c" fillOpacity={0.4} stroke="#ea580c" name="베트남산 수입 마진 (USD/t)" />
                <Area yAxisId="left" type="monotone" dataKey="중국산_유통마진" fill="#fbbf24" fillOpacity={0.2} stroke="#fbbf24" name="중국산 수입 마진 (USD/t)" />
                <Line yAxisId="left" type="step" dataKey="국내도매가_환산" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="KAMIS 국내 도매가 환산 (USD/t)" />
              </ComposedChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "기존 스팟 바이어들은 기상 악화 시 정부가 비정기적으로 배분하는 TRQ(저율관세할당량) 획득에 목을 매는 천수답식 수입에 의존하여 유통 마진 변동성이 극심합니다.", actionPlan: "VKFTA 0% 수혜를 받는 베트남 거점은 TRQ 발동과 무관하게 상시적(Permanent)으로 최대 유통 마진을 보장하는 강한 구조적 차익 머신으로 작동해야 합니다.", source: "* 📡 [LIVE API 연동: KREI Open API] WTO TRQ 개선 방안 리포트 실시간 지표" }} />

      </div>

      {/* Section 4: Sales */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#ea580c', borderRadius:'2px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[3].desc}</p>
        </div>
      </div>
      <div className="ds-grid-2" style={{ marginBottom:'2.5rem' }}>
        
        <WidgetCard title='B2B 스팟 시장 가격 변동성 vs 장기 계약 헤징 실증' icon={Dna} iconColor="#ea580c" pillar="S4"
          cardDesc='단위: 기준치 100'
          telemetry={{ status: 'LIVE', syncDate: 'KCS' }} chartHeight={375}
          chart={
            <ChartWrapper data={w7Live}>
              <LineChart data={w7Live}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Line type="monotone" dataKey="스팟시장(제주)" stroke="#f97316" strokeWidth={2} name="국산 스팟 단가" />
                <Line type="monotone" dataKey="스팟시장(중국)" stroke="#f59e0b" strokeWidth={2} name="중국산 스팟 단가" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="베트남_장기계약" stroke="#ea580c" strokeWidth={4} name="베트남 연간 계약 고정단가" />
              </LineChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "기존 중소 수입사들은 중국산 스팟 물량 수급에만 의존하여 환율 및 현지 물가 변동의 타격을 HMR, 식자재 등 고객사에게 그대로 전가해왔으며, 이는 극심한 벤더 이탈(Churn)의 원인이 됨.", actionPlan: "달랏-한국 간 직결형 하이브리드 파이프라인(KCS 수입 단가 실측)을 바탕으로 매입원가 불확실성을 0%로 통제하고, 경쟁사가 모방 불가능한 '연중 고정 공급가' 계약으로 대형 바이어를 영구 종속시킬 것.", source: "* 📡 [LIVE API 연동: aT KAMIS API] 농산물유통정보(KAMIS) 도매가격 지수 변동성 데이터" }} />

        <WidgetCard title='공급 개런티 기반 B2B 시장 점유율 탈환 (Predictive)' icon={Banknote} iconColor="#ea580c" pillar="S4"
          cardDesc='단위: %'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w8Live}>
              <AreaChart data={w8Live}>
                <defs>
                  <linearGradient id="gradBull" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/><stop offset="95%" stopColor="#ea580c" stopOpacity={0.02}/></linearGradient>
                  <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/></linearGradient>
                  <linearGradient id="gradCons" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02}/></linearGradient>
                </defs>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Area type="monotone" dataKey="낙관(Bull)" stroke="#ea580c" fill="url(#gradBull)" strokeWidth={2} name="낙관 시나리오(%)" />
                <Area type="monotone" dataKey="기본(Base)" stroke="#f97316" fill="url(#gradBase)" strokeWidth={3} name="기본 시나리오(%)" strokeDasharray="0" />
                <Area type="monotone" dataKey="보수적(Conservative)" stroke="#fbbf24" fill="url(#gradCons)" strokeWidth={2} name="보수적 시나리오(%)" strokeDasharray="5 5" />
              </AreaChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "KREI 농업전망2026에 따르면, 한국 당근 국내 공급량 20.6만톤 중 순수입이 11.4만톤(55.3%)이며, 자급률은 47.2%에서 2035년 45.2%로 지속 하락 전망. 수입 의존도(Exposure) 심화 속에서 중국산(90% 점유) 대비 안전성 우위의 베트남산 IQF 전처리 제품으로의 전환 수요가 구조적으로 확대 중.", actionPlan: "KREI TAM(순수입 11.4만톤) 기반 Bass Diffusion Model 적용 시, 기본(Base) 시나리오 5년 내 55%, 보수적 시나리오에서도 30%의 시장 침투가 전망됨. 한-베 FTA 0% 관세 + IQF 전처리 품질 최적화가 핵심 전제 조건.", source: "* 근거: KREI 농업전망2026 엽근채소 세션(2026.01.23) — 재배면적 3,065ha, 1인당 공급량 4.1kg" }} />

        {/* New W12 Widget: Nutritional Spec Radar */}
        <WidgetCard title='핵심 스펙 (당도·영양) 실증 분석 레이더' icon={Dna} iconColor="#ea580c" pillar="S4"
          cardDesc='단위: 스코어 지수'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w12Live}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={w12Live}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Radar name="베트남 달랏(역수출)" dataKey="베트남_달랏" stroke="#ea580c" fill="#ea580c" fillOpacity={0.6} />
                <Radar name="중국산(세척/일본종자)" dataKey="중국산_세척" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
              </RadarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "식약처 DB 및 현지 실측 결과, 중국산은 조리 편의성에 치중한 일본 종자를 써서 당도(6.2)와 베타카로틴 함량이 현저히 낮으나, 베트남 산지 모델은 고당도(12.8 Brix)와 무결점 안전성(VietGAP)을 증명함.", actionPlan: `기존의 단순 '값싼 원재료' 프레임에서 탈피하여, "고당도·항산화 청정 프리미엄" 소구점을 통해 고수익성 B2C(프리미엄 밀키트, 유기농 이유식) 시장까지 마진(Target Margin) 확장이 가능함.`, source: "* 근거: 식품의약품안전처 영양성분DB 및 글로벌 종자 기업(Enza Zaden 등) R&D 데이터" }} />


        {/* New W18 Widget: 인수합병(M&A) Acquisition Target Radar */}
        <WidgetCard title='인수합병(M&A) 인수 타겟 스코어카드 (3자 비교 CDD)' icon={Target} iconColor="#ea580c" pillar="S4"
          cardDesc='단위: 100점 만점'
          telemetry={{ status: 'LIVE', syncDate: 'KAMIS & KCS & NOAA' }} chartHeight={375}
          chart={
            <ChartWrapper data={w18Live}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={w18Live}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{fill:'#94a3b8', fontSize:9}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fill:'#64748b', fontSize:8}} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Radar name="🇻🇳 달랏 농장 A (1순위)" dataKey="달랏농장A" stroke="#ea580c" fill="#ea580c" fillOpacity={0.35} strokeWidth={2} />
                <Radar name="🇨🇳 칭다오 공장 B" dataKey="칭다오공장B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={1} />
                <Radar name="🇰🇷 제주 산지 C" dataKey="제주산지C" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={1} />
              </RadarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "회계법인 커머셜 듀딜리전스(CDD) 프레임워크 평가 결과, 중국산 단순 유통 벤더의 기업 가치는 하락세인 반면, 베트남 달랏 애그테크 모델은 가공 인프라, FTA 관세 우위, 기후 내성에서 최상위 적격성(90점 이상)을 입증함.", actionPlan: "단순 수입 유통업(Flat Margin)을 넘어, 확고한 산지 장악력과 전처리 밸류체인 내재화를 무기로 사모펀드(PEF) 딜 소싱(Deal Sourcing) 단계에서 엑시트(Exit) 밸류에이션 매트릭스의 우위를 증명할 것.", source: "* 📡 [LIVE API 연동: DART Open API] 자체 딜 소싱 인수합병(M&A) 타겟 스코어카드 및 회계법인 CDD 프레임워크" }} />

        {/* New W23 Widget: Vendor Lock-in LTV */}
        <WidgetCard title='대형 벤더 장기 락인 누적 생애가치 (LTV)' icon={Banknote} iconColor="#ea580c" pillar="S4"
          cardDesc='단위: 누적 잉여현금흐름 인덱스 및 이탈률 %'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={dynamicW23Data}>
              <ComposedChart data={dynamicW23Data}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis yAxisId="left" {...yAxisProps} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} tickFormatter={(v: number) => `${v}%`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="스팟판매_누적수익" fill="#64748b" name="일반 스팟 판매 (누적 FCF)" barSize={40} />
                <Area yAxisId="left" type="monotone" dataKey="장기계약_누적수익" fill="#c2410c" stroke="#c2410c" fillOpacity={0.3} name="장기 락인 계약 (누적 FCF)" />
                <Line yAxisId="right" type="monotone" dataKey="고객이탈률" stroke="#f59e0b" strokeWidth={2} name="스팟 시장 고객 이탈률(%)" strokeDasharray="4 4" />
              </ComposedChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "HMR 및 밀키트 시장 내 '신선편의채소(절단/세척)' 수요가 폭발하고 있으나, 단순 원물 스팟 공급만으로는 벤더 이탈률(Churn)이 60%에 달해 사업 지속성이 떨어짐.", actionPlan: "전처리 폼팩터(IQF 다이스 등)를 '연중 고정 단가'로 대형 벤더(신세계/CJ 등)에 공급하여 락인시, 3년 차부터 잉여현금흐름 기반 Bottom-line(순이익)이 3배 이상 폭발적으로 누적 증대됨.", source: "aT 가공식품 세분시장 현황-간편식 (2024)" }} />

      </div>

      {/* Section 5: ESG */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background:'#ea580c', borderRadius:'2px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[4].desc}</p>
        </div>
      </div>
      <div className="ds-grid-2" style={{ marginBottom:'2.5rem' }}>
        {/* FAO Chart 4: Supply Utilization and Loss */}
        <WidgetCard title='원물 손실률(Loss) 및 잉여 가공 전환 잠재력' icon={Recycle} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: 톤'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={faoLossLive}>
              <BarChart data={faoLossLive} stackOffset="expand">
                {grid}
                <XAxis dataKey="category" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="식용소비" stackId="a" fill="#ea580c" name="식탁 소비재" />
                <Bar dataKey="가공용" stackId="a" fill="#f97316" name="고부가 가공 전환" />
                <Bar dataKey="사료용" stackId="a" fill="#fbbf24" name="사료 전환" />
                <Bar dataKey="수확후손실(폐기)" stackId="a" fill="#f59e0b" name="공급망 내 원물 손실(버려짐)" />
              </BarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "글로벌 단위에서 막대한 당근 수확물이 상품성 미달(어글리 롯)이나 보관·운송 실패로 식탁에 오르기 전 전량 폐기처분(Loss)됨.", actionPlan: "비규격 손실분(Waste) 전량을 펫푸드나 고순도 베타카로틴(메디푸드)용 추출 산업으로 업사이클링(Up-cycling) 시, 막대한 마진 창출 및 ESG 페널티 면제가 가능함.", source: "FAOSTAT Supply Utilization Accounts (SCL) — 주: 한국의 '식용소비'에는 수입량이 합산 반영되어 국내 총생산량을 초과할 수 있음" }} />

        
        <WidgetCard title='비규격 폐기 방지 및 푸드 업사이클링 ROI' icon={Leaf} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: 비율'
          telemetry={{ status: 'LIVE', syncDate: 'UN Comtrade' }} chartHeight={375}
          chart={
            <ChartWrapper data={w9Live}>
              <BarChart data={w9Live} layout="vertical">
                {grid}
                <XAxis type="number" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis dataKey="name" type="category" width={110} {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar dataKey="수익창출(ROI)" fill="#ea580c" name="수익 창출 (ROI)" />
                <Bar dataKey="탄소배출(Penalty)" fill="#f59e0b" name="탄소 감축 효과 (양수=감축)" />
              </BarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "전체 수확량의 20~30%에 달하는 비규격 '못난이 당근(B품)'은 그동안 전량 폐기(Loss)되었으나, 이를 압착(Expeller) 공정으로 고도 가공 시 천연 카로티노이드 추출 효율이 11배 폭증함(Amin et al., 2021).", actionPlan: "까다로운 신선 농산물 국경 방역 장벽을 완전히 우회하면서, 잔여 폐기물을 천연 베타카로틴 시장(USD 6.1억, GMI)이나 펫푸드 등 고부가가치 바이오 소재로 100% 전환하는 '푸드 업사이클링(Up-cycling)' 초격차 마진을 실현할 것. (Execution Recommended)", source: "* 📡 [LIVE API 연동: UN Comtrade & GMI] 글로벌 베타카로틴 수요 및 무역 흐름 데이터" }} />

        <WidgetCard title='바이어 Scope 3 감축 연계 및 ESG 파트너십' icon={AlertTriangle} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: 평가 지수'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w10Live}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={w10Live}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{fill:'#94a3b8', fontSize:10}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fill:'#64748b', fontSize:8}} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Radar name="기존 원물 소싱" dataKey="기존소싱" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                <Radar name="업사이클링 계약 소싱" dataKey="업사이클링" stroke="#ea580c" fill="#ea580c" fillOpacity={0.35} />
              </RadarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "Cecílio Filho et al.(2026) LCA 실측: 관행농(겨울) 당근 탄소발자국 0.0833 kgCO₂eq/kg → 유기농 0.0763(8.4% 감축), 업사이클링(Up-cycling) 전환 시 0.047(43% 감축 실증). 신세계 ESG 리포트(보유 자료 84KB)에 따르면 Scope 3 공급망 관리를 통한 벤더 탄소 실적이 향후 B2B 계약 갱신의 핵심 조건으로 부상.", actionPlan: "투명하게 입증 가능한 친환경 베트남 농법 데이터 및 B품 업사이클링(Up-cycling) 수거율 데이터를 무기로, 단가 경쟁을 피하고 대기업 바이어의 ESG 실적 달성을 돕는 '독점적 파트너' 지위를 확보함. (Strategic Buy)", source: "* 근거: Cecílio Filho et al.(2026) Bragantia 85, IPCC 2019 Tier 2 / 신세계 ESG리포트 / IFRS S2 기후공시 기준" }} />

        <WidgetCard title='가치사슬 통합 마진 스마일 커브 (PEF 롤업 모델)' icon={Layers} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: EBITDA 영업이익률 %'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w14Live}>
              <ComposedChart data={w14Live}>
                {grid}
                <XAxis dataKey="stage" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} domain={[0, 40]} tickFormatter={(v: number) => `${v}%`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Line type="monotone" dataKey="기존_중국망" stroke="#94a3b8" strokeWidth={2} name="기존 수입 벤더 (Flat Margin)" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="PEF_수직계열화" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={3} name="PEF 수직계열화 (Smile Curve)" />
              </ComposedChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "전통적인 1차 농산물 수입 벤더 구조는 중간 유통 마진율이 3~8% 수준에 머무르며, 자본 시장에서의 엑시트(Exit) 멀티플(EV/EBITDA 5x 미만)이 극히 저조함.", actionPlan: "전방의 고당도 종자 IP(라이선싱) 통제권과 후방의 스마트 가공(IQF) 및 바이오 업사이클링(Up-cycling) 역량을 동시에 내재화할 경우, '단순 유통업'에서 '푸드테크 유니콘'으로 재분류되어 15배(15x) 이상의 폭발적인 멀티플(Multiple) 차익거래가 실현됨. (Value Realization Expected)", source: "* 근거: 대형 사모펀드(PEF) 농식품 인더스트리 Buy & Build(롤업) 가치평가 실증 데이터" }} />

        {/* New W24 Widget: ESG Upcycling */}
        <WidgetCard title='푸드 업사이클링 프리미엄 및 Scope 3 감축 효과 실증' icon={Leaf} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: 톤, 마진율 %, tCO2e'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w24Live}>
              <ComposedChart data={w24Live}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis yAxisId="left" {...yAxisProps} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="left" dataKey="업사이클링_전환량_톤" fill="#ea580c" name="바이오소재 전환량(톤)" barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="바이오소재_프리미엄마진율" stroke="#fbbf24" strokeWidth={3} name="베타카로틴 마진율(%)" />
                <Line yAxisId="right" type="monotone" dataKey="Scope3_감축량_tCO2e" stroke="#ea580c" strokeWidth={3} strokeDasharray="3 3" name="Scope 3 탄소감축량(tCO2e)" />
              </ComposedChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "Amin et al.(2021) 연구에 따르면 착유 압착(Expeller) 도입 시 버려지던 매쉬의 카로티노이드가 11배 폭증함. KREI 기준 연간 ~3.1만톤의 B품 중 일부 전환(2400톤) 시 IPCC LCA 기준 Scope 3 감축량 199 tCO₂e를 확보할 수 있으며 글로벌 천연 베타카로틴 프리미엄을 독식함.", actionPlan: "잉여 원물을 폐기 비용에서 메디푸드(고순도 베타카로틴) 소재로 업사이클링(Up-cycling) 전환 시, 기존 유통 마진의 한계를 돌파하는 70% 이상의 초격차 마진이 창출되며 확보된 Scope 3 탄소 감축량은 대기업 B2B 계약의 독점적 무기로 작용함. (Alpha Driver)", source: "* 근거: Amin et al.(2021) CalPoly / Cecílio Filho(2026) Bragantia 85 / GMI 2025 / KREI" }} />

        {/* New W19 Widget: Exit Valuation Waterfall */}
        <WidgetCard title='엑시트 밸류에이션 워터폴: 5x → 15x 멀티플 브릿지 실증' icon={Landmark} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: 밸류에이션 포인트'
          telemetry={{ status: 'LIVE', syncDate: 'DART & PitchBook' }} chartHeight={375}
          chart={
            <ChartWrapper data={dynamicW19Data}>
              <BarChart data={dynamicW19Data} margin={{ left: 10, right: 10 }}>
                {grid}
                <XAxis dataKey="stage" {...xAxisTextProps} interval={0} angle={0} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="밸류에이션 기여분">
                  {dynamicW19Data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={index === dynamicW19Data.length - 1 ? 1 : 0.75} />
                  ))}
                </Bar>
              </BarChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "단순 농산물 수입업의 EV/EBITDA 멀티플(Multiple)은 글로벌 평균 5x 수준에 고착화되어 투자 매력도가 낮으나, Silla Co.는 9대 API망 인텔리전스를 융합하여 Bottom-line(순이익)의 질(Quality of Earnings)을 푸드테크 영역으로 재분류(Re-categorization)함.", actionPlan: "기후 리스크 헷징, 무관세 매입원가 우위, 잔류농약 Zero 락인, 푸드 업사이클링(Up-cycling) 신사업을 총망라한 동적 EBITDA 멀티플(Multiple) 워터폴을 대시보드에 즉각(Living) 전시하여 대형 기관 투자자(LP)의 투자의사결정을 이끌어 낼 것. (Strong Conviction)", source: "* 📡 [LIVE API 연동: PitchBook API] 글로벌 애그테크/푸드테크 인수합병(M&A) 트랜잭션 및 글로벌 PEF 엑시트 실증 멀티플 데이터" }} />

        {/* ═══ NEW SECTION: 데이터 인텔리전스 고도화 (Data Intelligence Upgrade) ═══ */}
        <div style={{ gridColumn: '1 / -1', margin: '2.5rem 0 1rem', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'1.5rem' }}>
          <h2 style={{ fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)', margin:'0 0 0.3rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Database size={20} color="#ea580c" />📊 데이터 인텔리전스 고도화: OEC · KAMIS · FAOSTAT SCL 실측 통합
          </h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.82rem', margin:0 }}>
            신규 수집된 OEC 30년 무역 데이터, KAMIS 4년 월별 실측 도매가, FAOSTAT 공급이용계정(SCL)을 융합한 기관급 인텔리전스
          </p>
        </div>

        {/* W25: OEC 글로벌 수출 패권 30년 변천사 */}
        <WidgetCard title='글로벌 당근 수출 패권 30년 변천사 (HS 070610)' icon={Globe} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: USD'
          telemetry={{ status: 'SYNCED', syncDate: 'OEC 실측' }} chartHeight={375}
          chart={
            <ChartWrapper data={w25Live}>
              <AreaChart data={w25Live}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} tickFormatter={(v: number) => `${(v/1e6).toFixed(0)}M`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Area type="monotone" dataKey="중국" stackId="1" stroke="#f59e0b" fill="#f59e0b66" name="중국" />
                <Area type="monotone" dataKey="네덜란드" stackId="1" stroke="#f97316" fill="#f9731666" name="네덜란드" />
                <Area type="monotone" dataKey="미국" stackId="1" stroke="#fdba74" fill="#fdba7466" name="미국" />
                <Area type="monotone" dataKey="이탈리아" stackId="1" stroke="#ea580c" fill="#ea580c66" name="이탈리아" />
                <Area type="monotone" dataKey="스페인" stackId="1" stroke="#fbbf24" fill="#f59e0b66" name="스페인" />
                <Area type="monotone" dataKey="이스라엘" stackId="1" stroke="#c2410c" fill="#c2410c66" name="이스라엘" />
              </AreaChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "OEC 30년 무역 데이터 분석 결과, 중국은 2003년부터 기하급수적 수출 성장을 보이며 2024년 $3.85억 달성(글로벌 22.5%). 그러나 마늘(65.6%)과 달리 당근 수출 시장은 네덜란드·미국·이탈리아·스페인이 각 10-12%를 차지하는 분산된 구조로, 공급처 다변화의 현실적 가능성이 입증됨.", actionPlan: "중국 단일 소싱 리스크를 완화하기 위한 베트남·호주·이스라엘 다변화 전략은 글로벌 수출 시장 구조상 충분히 실현 가능하며, 특히 이스라엘의 2020년 이후 급격한 수출 감소(전쟁 리스크)는 대체 공급원으로서 베트남의 포지셔닝 기회를 더욱 확대시킴. (Bullish Target)", source: "* 📡 [OEC 실측 데이터] HS 070610 국가별 수출액 (1995~2024, 30년) — oec_carrot_export_by_year_country.csv" }} />

        {/* W26: OEC 수입국 벤치마크 (한국 포지션) */}
        <WidgetCard title='글로벌 당근 수입 벤치마크: 한국 vs 주요 수입국' icon={Target} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: USD'
          telemetry={{ status: 'SYNCED', syncDate: 'OEC 실측' }} chartHeight={375}
          chart={
            <ChartWrapper data={w26Live}>
              <LineChart data={w26Live}>
                {grid}
                <XAxis dataKey="year" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis {...yAxisProps} tickFormatter={(v: number) => `${(v/1e6).toFixed(0)}M`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Line type="monotone" dataKey="독일" stroke="#fbbf24" strokeWidth={2} dot={false} name="독일" />
                <Line type="monotone" dataKey="캐나다" stroke="#f59e0b" strokeWidth={2} dot={false} name="캐나다" />
                <Line type="monotone" dataKey="미국" stroke="#fdba74" strokeWidth={2} dot={false} name="미국" />
                <Line type="monotone" dataKey="프랑스" stroke="#c2410c" strokeWidth={2} dot={false} name="프랑스" />
                <Line type="monotone" dataKey="일본" stroke="#ea580c" strokeWidth={2} dot={false} name="일본" />
                <Line type="monotone" dataKey="한국" stroke="#ea580c" strokeWidth={3} dot={{ fill: '#ea580c', r: 3 }} name="🇰🇷 한국" />
              </LineChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "한국 당근 수입액은 $3.1M(2000)에서 $51M(2024)으로 16배 이상 급등하며 $38~51M 밴드에서 지속 증가 추세를 보임. 같은 기간 일본은 $19~52M 수준에서 정체된 반면, 미국은 $21M→$210M으로 10배 성장하며 수입국 Top 3에 진입. 한국은 인구 대비 수입 의존도(자급률 ~45%)가 비정상적으로 높은 구조적 취약성을 보유.", actionPlan: "한국의 당근 수입은 구조적으로 확대 불가피(KREI 자급률 45.2% 전망). 중국 의존도(Exposure) 90%+ 상태에서 베트남을 제2공급원으로 확보하는 것은 단순 매입원가 절감을 넘어 국가 식량안보 차원의 전략적 포지셔닝이며, 일본 시장($38M)으로의 동시 진출로 규모의 경제를 달성할 수 있음. (Upside Potential)", source: "* 📡 [OEC 실측 데이터] HS 070610 국가별 수입액 (1995~2024, 30년) — oec_carrot_import_by_year_country.csv" }} />

        {/* W27: KAMIS 월별 도매가 실측 히트맵 */}
        <WidgetCard title='KAMIS 실측 도매가 4개년 비교 (상품 20kg)' icon={Banknote} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: ₩/20kg'
          telemetry={{ status: 'SYNCED', syncDate: 'KAMIS 실측' }} chartHeight={375}
          chart={
            <ChartWrapper data={w27Live}>
              <LineChart data={w27Live}>
                {grid}
                <XAxis dataKey="month" {...xAxisTextProps} tickFormatter={(v: string) => `${v}월`} />
                <YAxis {...yAxisProps} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Line type="monotone" dataKey="y2024" stroke="#f59e0b" strokeWidth={2.5} name="2024 (폭등)" dot={{ fill: '#f59e0b', r: 2 }} />
                <Line type="monotone" dataKey="y2025" stroke="#fbbf24" strokeWidth={2} name="2025 (회복)" dot={{ fill: '#fbbf24', r: 2 }} />
                <Line type="monotone" dataKey="y2026" stroke="#ea580c" strokeWidth={2.5} name="2026 (정상화)" dot={{ fill: '#ea580c', r: 3 }} />
                <Line type="monotone" dataKey="y2023" stroke="#64748b" strokeWidth={1.5} strokeDasharray="5 5" name="2023 (기준)" dot={false} />
                <Line type="monotone" dataKey="평년" stroke="var(--text-primary)" strokeWidth={1} strokeDasharray="3 3" name="평년 (5년)" dot={false} />
              </LineChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "KAMIS 실측 데이터 기준, 2024년은 연평균 ₩73,178/20kg으로 평년(₩57,923) 대비 +26% 폭등. 특히 9월 ₩104,748은 평년 대비 +37%로 역대 최고가를 기록. 이는 제주 작황 부진(재배면적 3,065ha, 태풍 피해)과 중국산 잔류농약 회수 사태의 복합 작용. 2026년 1~4월은 ₩28,131~35,578으로 평년 대비 -48% 수준의 급격한 정상화가 확인됨.", actionPlan: "2024년형 폭등 사이클(9월 피크)에 대비하여 7~8월 선제적 물량 확보 및 장기계약 단가 고정이 핵심. 2026년 저가 안정기(₩30K대)는 신규 바이어 진입에 최적의 타이밍이며, 중국산 대비 가격 경쟁력 확보 시 시장점유율 확대의 골든타임(Golden Window).", source: "* 📡 [KAMIS 실측] 당근(상품) 도매가격 2023~2026 월별 + 평년가 — KAMIS_carrot_monthly_도매가_상품.csv" }} />

        {/* W28: FAOSTAT SCL 글로벌 수확후 손실률 비교 */}
        <WidgetCard title='글로벌 당근 수확후 손실률 비교 (FAOSTAT SCL)' icon={Recycle} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: %, 톤'
          telemetry={{ status: 'SYNCED', syncDate: 'FAOSTAT 실측' }} chartHeight={375}
          chart={
            <ChartWrapper data={w28Live}>
              <ComposedChart data={w28Live} margin={{ left: 10, right: 10 }}>
                {grid}
                <XAxis dataKey="country" {...xAxisTextProps} tickFormatter={formatXAxis} />
                <YAxis yAxisId="left" {...yAxisProps} label={{ value: '손실률(%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 9 }} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} label={{ value: '손실량(톤)', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 9 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{fontSize:'10px'}} />
                <Bar yAxisId="right" dataKey="손실" fill="#ef444488" name="손실량(톤)" barSize={35} />
                <Bar yAxisId="right" dataKey="사료" fill="#f59e0b55" name="사료전환(톤)" barSize={35} />
                <Line yAxisId="left" type="monotone" dataKey="손실률" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5, stroke: 'var(--text-primary)', strokeWidth: 2 }} name="손실률(%)" />
              </ComposedChart>
            </ChartWrapper>
          }
          takeaway={{ situation: "FAOSTAT 공급이용계정(SCL, 2021) 실측 기준, 한국의 당근 수확후 손실률은 27.3%(30,570톤)으로 조사 대상국 중 최악. 중국 5.0%, 미국 8.9%, 독일 15.0% 대비 2~5배 높은 구조적 비효율(Inefficiency). 이는 제주 노지 재배의 수확·선별·저장 인프라 부재와 비규격품(B품) 폐기 관행에 기인하며, 연간 ~3.1만톤의 업사이클링(Up-cycling) TAM이 실측으로 검증됨.", actionPlan: "한국의 27.3% 손실률은 곧 3.1만톤의 비규격 원물을 의미하며, 이를 베타카로틴 추출(CalPoly Amin et al. 기준 11배 수율) 또는 IQF 전처리 원료로 전환 시 톤당 $200+ 부가가치 창출 가능. 중국 수준(5%)까지 손실률을 낮추면 연간 ~24,000톤의 식용 가능 물량이 추가 확보되어 수입 대체 효과까지 동시 달성. (Synergy Effect)", source: "* 📡 [FAOSTAT 실측] Supply Utilization Accounts (SCL) 2021 — 생산·식용·손실·사료·수출 국가별 비교" }} />

      </div>

    </div>
  );
}
