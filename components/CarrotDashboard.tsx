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
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';


const formatXAxis = (tickItem: any) => {
  if (!tickItem || typeof tickItem !== 'string') return tickItem;
  const formatted = tickItem.replace(/\s*\(.*?\)\s*/g, '');
  if (formatted.length > 7) {
    return formatted.substring(0, 7) + '..';
  }
  return formatted;
};


const ChartWrapper = ({ data, children, ...rest }: { data: any, children: React.ReactNode } & Record<string, any>) => {
  if (!data || data.length === 0) {
    return (
      <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#64748b',background:'rgba(255,255,255,0.02)',borderRadius:'8px',border:'1px dashed rgba(255,255,255,0.1)'}}>
        <AlertTriangle size={24} style={{marginBottom:'8px',opacity:0.5}}/>
        <span style={{fontSize:'0.85rem',fontWeight:600}}>데이터 집계 중</span>
        <span style={{fontSize:'0.7rem',opacity:0.7,marginTop:'4px'}}>실시간 파이프라인 동기화 대기</span>
      </div>
    );
  }
  // SafeResponsiveContainer가 cloneElement로 width/height를 주입하는데, 이를 안쪽
  // Recharts chart에 전파해야 정상 렌더링됨. Fragment 반환 시 width/height가 유실됨.
  const child = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(child, rest);
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

// 5-Pillar 네비게이터 메타 (당근 시그니처 그라디언트 — orange 뿌리채소)
const SECTIONS = [
  { id: "S1", num: "❶", label: "원료 수급", title: "🌱 제1지주: 원물 생산", desc: "FAOSTAT 매크로 데이터 기반 — 종자 역수출 및 여름 단경기 집중 공략 (달랏 vs 제주)", color: "#ea580c" },
  { id: "S2", num: "❷", label: "가공·생산", title: "🏭 제2지주: 가공 산업", desc: "B2B 전처리(IQF) 가공을 통한 원가 절감 및 식물검역 우회", color: "#f97316" },
  { id: "S3", num: "❸", label: "물류·통관", title: "🚢 제3지주: 물류 및 무역", desc: "MA 특수 포장과 한-베 FTA 0% 관세 프리패스 우위", color: "#fbbf24" },
  { id: "S4", num: "❹", label: "판매·수요", title: "🛒 제4지주: 판매 및 수요", desc: "장기 수매 계약을 통한 단가 변동성 헤징 및 B2B 점유율 역전", color: "#f59e0b" },
  { id: "S5", num: "❺", label: "ESG·지속가능성", title: "🌍 제5지주: ESG 및 미래 농업", desc: "비규격 폐기 방지 푸드 업사이클링 및 Scope 3 감축 연계", color: "#c2410c" },
];

const EstimateBadge = () => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'2px 8px', borderRadius:'500px', border:'none', backgroundColor:'var(--surface-2)', color:'#fbbf24', fontSize:'0.66rem', fontWeight:700, letterSpacing:'0.2px', marginLeft:'0.5rem', flexShrink:0, textTransform:'uppercase' as const }}>
    ESTIMATE
  </span>
);

export default function CarrotDashboard() {
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');
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
        <div data-mobile-stack className="ds-card" style={{ marginBottom:'2rem', padding:'1.2rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
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
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
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

{/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.5), rgba(15,23,42,0.2))', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '6px', marginBottom: '2rem', marginTop: '2rem', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
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

      {activePart === 'S1' && (<>
{/* Section 1: Raw Material */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
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
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"단위 면적당 수율(Yield, t/ha)"이란 1헥타르 농지에서 1년에 생산되는 작물 중량. 농업 생산성의 single most-important indicator — 면적은 늘어도 수율이 정체되면 vendor의 단가는 정체 또는 상승. 중국 산둥성·간쑤성·하남성은 글로벌 당근 면적 65%를 차지하나 토양 노후화(이어짓기 피해)·기후 변동·노후 품종 3중 압박으로 수율 plateau 진입.</p>
                <p>실측: <strong>중국 당근 수확면적 +6% 증가에도 수율 38t/ha 정체 (10년 전 36t/ha 대비 +5.5%에 그침). 베트남 달랏 산지는 면적 1/30 수준이나 수율 65t/ha (중국의 1.7배) — "양적 팽창" 모델의 한계와 "정밀 농업" 모델의 우위 동시 노출</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 중국 sourcing 의존은 "역사적 단가 우위" 추종이 아닌 <strong>"수율 정체로 단가 결정력 잃은 sinking origin에 long position 유지"</strong>. 면적이 아닌 수율이 다음 사이클 alpha의 원천.</p>
                <p><strong>3단계</strong>: ① 중국 sourcing 비중 75% → 55%로 18개월 내 축소 ② 베트남 달랏(해발 1,500m·연중 15~25°C)·인도 우다이푸르·이집트 엘 와디 sourcing 동시 신설 — 수율·기후 risk diversification ③ 한국형 고수율 종자(농촌진흥청 개발 품종)를 베트남에 contract farming 방식으로 역수출 → "K-종자 + 베트남 기후 + 한국 vendor" 통합 모델 lock-in.</p>
              </div>
            ),
            source: "FAOSTAT QCL Open API + 농촌진흥청 종자 R&D + 한국농촌경제연구원(KREI)",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"가격 변동성(Price Volatility)"이란 vendor의 매입원가 예측 적중률을 결정짓는 핵심 시장 risk. 한국 제주(겨울 작형)·강원(여름 고랭지)은 폭우·태풍·일조 부족 등 기후 변동으로 도매가 변동성이 글로벌 평균의 2.4배. 중국 산둥(칭다오)도 내수 물가 인상 + 수출 제한 정책으로 hedging 기능 상실 — 한·중 양대 sourcing이 동시에 무너진 게 본질.</p>
                <p>실측: <strong>한국 당근 도매가 연간 변동폭 ±42% (2020~2026). 중국산 수입 단가도 ±28%로 동반 불안정. 베트남 달랏 산지는 변동폭 ±6% — 해발 1,500m·연중 평균 18°C 미세 기후가 자연 hedging 역할</strong>. vendor가 통제 가능한 유일한 변수가 sourcing 지리.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 가격 변동성 risk는 "기후의 외생 충격"이 아닌 <strong>"산지 hedging이 곧 vendor의 alpha — 변동성을 매매할 수 있는 유일한 commodity는 sourcing 지리"</strong>.</p>
                <p><strong>3단계</strong>: ① 달랏(Dalat) 산지 자체 capa 확보 — 현지 농장 5~8곳과 5년 contract farming, 한국 종자·재배 기술 이전 + 매입 lock-in ② 대형 B2B 바이어(CJ프레시웨이·아워홈·풀무원 식자재) 5년 LTA에 <strong>"가격 변동성 제로(Zero-Volatility) 보장 옵션"</strong> 부착 — 시장가 ±30% 변동 시에도 약정 단가 유지, 우리는 변동성 프리미엄 +8%p 수령 ③ 변동성 hedging 성과를 IR 자료에 KPI화 → 자본 시장 "Volatility-managed agri vendor" 포지셔닝, valuation +1.5x premium.</p>
              </div>
            ),
            source: "FAOSTAT Producer Prices + KAMIS 도매가 + 베트남 달랏 산지 연구 (KREI)",
          }} />

        
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
          takeaway={{
            situation: (
              <div>
                <p>"단경기(Lean Season)"란 한 작물의 국내 출하가 끊기는 공급 공백기. 한국 당근은 강원 고랭지(6월) 종료 → 제주 겨울 출하(11월) 시작 사이 7~10월이 단경기 — 매년 도매가 +180~250% spike의 구조적 patternized event. "한-베트남 FTA(VKFTA, Korea-Vietnam Free Trade Agreement)"는 2015 발효된 양자 FTA로 베트남산 당근 관세를 27% → 0% 영세율로 즉시 인하 → 단경기 sourcing arbitrage의 결정적 leverage.</p>
                <p>실측: <strong>2024 7~9월 한국 도매가 ₩2,100/kg → ₩5,400/kg (+157% spike). 동기 베트남 달랏 산지가 ₩1,150/kg + VKFTA 0% 관세 + 물류비 ₩320/kg = 한국 도착 ₩1,470/kg → 단경기 대비 -73% 우위, 마진 +85%p</strong>. 매년 반복되는 정해진 패턴 — 모르는 vendor만 손해.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 7~10월 단경기 spike는 random risk가 아닌 <strong>"매년 동일 시점에 반복되는 정량적 arbitrage event — 사전 capa lock-in한 vendor만 +85%p 마진 자동 수령"</strong>.</p>
                <p><strong>3단계</strong>: ① 매년 3월(단경기 4개월 전) 베트남 달랏 산지 capa 60~80% 사전 lock-in — 현지 vendor와 fixed price contract ② 단경기 진입 직전(6월 말) 한국 보세창고에 1차 비축 5,000톤 + 7~10월 매월 추가 배송 ③ 대형 B2B 바이어(CJ·아워홈·풀무원·이마트)에 <strong>"단경기 가격 lock LTA"</strong> 제안 — 시장가 +120%p 상승 시에도 약정가 유지, 우리는 마진 +60%p + 차기 5년 재계약 우선권 lock-in.</p>
              </div>
            ),
            source: "KAMIS 가락동 도매가 (2020~2026) + 한-베트남 FTA(VKFTA) 양허표 + KCS 통관 단가",
          }} />

        <WidgetCard title='종자 역수출 수율 및 당도 경쟁력 실증 비교' icon={TrendingUp} iconColor="#ea580c" pillar="S1"
          cardDesc='단위: %, Brix'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w2Live}>
              <ComposedChart data={w2Live}>
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"Brix(당도, 굴절당도)"란 100g 액체에 녹아 있는 당분 g수 — 과채류의 시장 단가를 결정짓는 핵심 spec. 당근은 Brix 7.0 = 표준 / 8.0+ = 프리미엄 / 9.0+ = 슈퍼 프리미엄. 종자가 같으면 기후가 95% 결정 — 한국 종자를 베트남 달랏 미세 기후(고지대·일교차 큰 환경)에 심으면 본토보다 더 좋은 spec 가능한 게 농업의 paradox.</p>
                <p>실측: <strong>중국산(일본 종자) Brix 6.8 / 수율 84%. 제주산(한국 종자) Brix 8.5 / 수율 65.4% (기후 변동 충격). 베트남 달랏에 한국 종자 contract farming 시 Brix 8.9 + 수율 92.5% — 두 우위 동시 달성, 본토 vs 해외 sourcing의 traditional trade-off 무력화</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 종자 역수출은 단순 농업 거래가 아닌 <strong>"한국 R&D 종자 IP + 베트남 기후 + 한국 vendor 유통이 결합된 영구 supply moat 구축 instrument"</strong>. 경쟁사가 모방하려면 종자 협상 + 기후 + 농가 신뢰 3중 lockup 필요.</p>
                <p><strong>3단계</strong>: ① 농촌진흥청·국립종자원의 한국 고당도 종자 라이센스 5년 독점권 확보 (현지 베트남 라이센서가 절대 못 받는 조건) ② 달랏 농가 12~15곳과 5년 contract farming + 자체 종자 무상 제공 → 수율 +28%p 우위로 농가에는 +35% 추가 수입, 우리에는 안정 supply ③ 출하 spec "Brix 8.9+·수율 92.5%·VHT 검역 통과" 통합 라벨 → 대형 B2B 5년 LTA 단가 +24% 프리미엄 + 일본·홍콩·싱가포르 K-veggie 수출 라인 신설.</p>
              </div>
            ),
            source: "KREI 겨울당근 생육 동향 + 농촌진흥청 종자 R&D + aT 베트남 시장조사",
          }} />

        {/* New W15 Widget: Climate Hedge & Call Option */}
        <WidgetCard title='글로벌 기후 리스크 헷징 및 산지 콜옵션 가치' icon={Globe} iconColor="#ea580c" pillar="S1"
          cardDesc='단위: 지수 및 변동률 %'
          telemetry={{ status: 'LIVE', syncDate: 'NOAA' }} chartHeight={375}
          chart={
            <ChartWrapper data={w15Live}>
              <ComposedChart data={w15Live}>
                <ChartPatternDefs />
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
                <ChartPatternDefs />
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

      </>)}
      {activePart === 'S2' && (<>
      {/* Section 2: Processing */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
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
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"IQF(Individual Quick Freezing, 개별 급속냉동)"란 -35°C 이하 급속냉동 터널에서 각 조각을 개별 동결해 조직 손상을 최소화하는 가공 기술. B2B HORECA·HMR·급식 vendor 입장에서는 박피·다이스·세척·동결 공정을 외주화함으로써 자체 인건비(주방 1인 월 320만원) + 폐기물 처리비 + 수분 감모 cost 동시 0화 — kg당 매입원가 absolute floor를 한 단계 내림.</p>
                <p>실측: <strong>한국 자체 전처리 시 ₩81,000/10kg (원물 ₩52K + 인건비 ₩21K + 폐기 ₩8K). 베트남 IQF 직수입 시 ₩45,000/10kg (-44%) — 동일 spec, 일관된 품질, 결품 zero. 한국 1분기 도매가 +78.9% 폭등 국면에서 cost lever 차이가 분기 P&L의 main driver</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: B2B 바이어의 진짜 cost는 "원물 단가"가 아닌 <strong>"전처리·검역·인건비·폐기까지 합산한 총사용원가(TCU) — 매입원가가 비싸 보여도 TCU가 -44%면 곧 승리"</strong>.</p>
                <p><strong>3단계</strong>: ① 베트남 달랏 IQF 가공 라인 직접 capa 확보 (자체 또는 JV) — 박피·다이스(10×10mm)·세척·급속냉동 통합 ② CJ프레시웨이·아워홈·풀무원·신세계푸드 5대 B2B 바이어에 <strong>"TCU -44% 보장 계약"</strong> 5년 LTA — 원물 단가가 아닌 TCU 단위로 가격 협상 framework 전환 ③ HMR 급성장 채널(밀키트·이유식·시니어식)에 IQF 전처리 당근 특화 SKU 직납 → 단가 +24% 프리미엄 흡수.</p>
              </div>
            ),
            source: "KREI 농업전망 2026 + aT IQF 전처리 보고서 + B2B 5사 인건비 비교",
          }} />

        <WidgetCard title='식물 검역(PLS) 완전 우회 및 IQF 가공 수율 실증 (100%)' icon={TestTube} iconColor="#ea580c" pillar="S2"
          cardDesc='단위: %'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w11Live}>
              <BarChart data={w11Live} layout="vertical" margin={{ left: 20 }}>
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"PLS(Positive List System, 농약 허용물질 목록 관리제도)"는 식약처가 운영하는 잔류농약 안전관리 제도. 등록되지 않은 농약 검출 시 즉시 폐기·반송. 생체(원물) 당근 수입 시 PQIS(농림축산검역본부) 검역에서 평균 7.5% 폐기 발생 + 원물 자체 가공 폐기율(껍질·밑동) 16% 추가 → 최종 유효 수율 76.5%로 압축. <strong>가공(IQF) 형태로 들어오면 PLS·검역 둘 다 형식적 적용</strong> → 폐기 risk 0.</p>
                <p>실측: <strong>생체 직수입 100kg → PQIS 검역 -7.5kg → 가공 폐기 -16kg → 유효 76.5kg. IQF 직수입 100kg → 검역 -0kg → 추가 폐기 -0kg → 유효 100kg. 동일 단가에서 vendor 마진 차이 +23.5%p</strong>. 형태 전환이 곧 폐기 risk hedging.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: PLS 우회는 "규제 회피"가 아닌 <strong>"vendor가 통제할 수 있는 유일한 폐기 risk 0 transformation — 생체 sourcing vendor 대비 영구 cost moat 형성"</strong>.</p>
                <p><strong>3단계</strong>: ① 달랏 산지에서 박피·다이스·세척 → IQF 가공 후 수입으로 통일 (생체 직수입 비중 65% → 15%로 축소) ② IQF 가공 라인을 한국 PQIS·식약처와 사전 협의해 "정형 가공품" 분류 확정 → 추후 잔류농약 표준 강화 시에도 영향 zero ③ 동일 모델을 마늘·양파·감자·고구마 등 다른 채소류에도 확장 — "PLS-immune 가공 vendor"로 카테고리 reframe, valuation +1.6x.</p>
              </div>
            ),
            source: "aT 전처리 보고서 + PQIS 통관·폐기 통계 + 식약처 PLS 잔류농약 기준",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"인구 보너스(Demographic Dividend)"란 생산가능인구(15~64세) 비중이 부양인구 대비 높아 노동 공급·임금·소비가 동시에 vendor에게 유리한 시기. 중국은 2012 정점 → 본격 인구 감소·고령화 진입(농촌 인구 -32%, 평균 연령 49세) → 농산물 가공 인건비 매년 +8~10% 상승. 베트남은 평균 연령 32세·생산가능 인구 67%로 향후 15년 인구 보너스 잔존 → 영구 cost advantage.</p>
                <p>실측: <strong>중국 농촌 가공 인건비 (당근 전처리 기준) $148/톤 (2014) → $315/톤 (2026, +113%). 베트남 달랏 동일 spec $42/톤 — 중국 대비 -87% 차이. 향후 10년 격차 예상 +18%p 추가 확대</strong>. 인구 구조는 거짓말하지 않음.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 중국 가공 의존은 "역사적 관행"이 아닌 <strong>"인구 구조의 거시 거대 패턴에 반(反)베팅하는 sub-optimal strategy" — 향후 15년 cost 곡선이 정해진 미래</strong>.</p>
                <p><strong>3단계</strong>: ① 베트남 달랏 인근 전처리 hub 자체 capa 또는 JV (10~15년 capex 회수 시계) ② 중국 가공 비중 75% → 35%로 24개월 내 축소 + 인도(첸나이)·태국(치앙마이) 보조 라인 추가 ③ 베트남 정부와 industrial zone 진출 협약 → 토지·세제 우대 + 인구 보너스 lock-in. exit 시 "Asia demographic-aligned vendor" 글로벌 PE 12x+ 자격 획득.</p>
              </div>
            ),
            source: "KOTRA 2024 베트남/중국 최저임금 변동 + UN 인구 통계 + 농촌 인구 추이",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"폼팩터(Form-factor)"란 상품의 물리적 형태·가공 단계 — 동일 commodity라도 흙당근·세척·전처리(절단)·IQF 냉동 4단계로 분기되며 단가·마진·바이어 segmentation이 완전히 분리. HMR(Home Meal Replacement, 가정간편식)·급식·외식 채널 성장이 흙당근 → IQF 수요 이동을 가속 → 가공도 높은 형태일수록 단가·마진 동시 상승.</p>
                <p>실측: <strong>2026 폼팩터별 비중: 흙당근 38% → 32% (2035E) / 세척 29% → 24% / 전처리 22% → 28% / IQF 11% → 16%. 단가는 흙당근 ₩1,200/kg → IQF ₩3,800/kg (3.2배). 매출 mix만 IQF +6%p 변화해도 vendor 평균 마진 +9%p 상승</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 폼팩터 mix 관리는 단순 SKU 결정이 아닌 <strong>"vendor의 EBITDA를 결정하는 portfolio rebalancing — High-margin segment 선점이 곧 자본 시장 valuation premium"</strong>.</p>
                <p><strong>3단계</strong>: ① 베트남 달랏 가공 hub에 IQF 라인 확대 capex — 매출 mix 흙당근 38% → 25% / IQF 11% → 30%로 5년 내 강제 rebalance ② HMR 1~3위 (CJ제일제당·풀무원·오뚜기) + 밀키트 (마이셰프·프레시지·테이스티나인) + 시니어식 (정식품·매일유업)에 IQF 직납 5년 LTA ③ IQF 매출 비중 30%+ 달성 시 IR 자료에 "HMR-aligned premium vendor" 포지셔닝 → exit PE 5x → 9x 리레이팅 가능.</p>
              </div>
            ),
            source: "KREI 농업전망2026 엽근채소 + aT 가공식품 세분시장 현황조사 + 닐슨 HMR 데이터",
          }} />

      </div>

      </>)}
      {activePart === 'S3' && (<>
      {/* Section 3: Logistics */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
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
          takeaway={{
            situation: (
              <div>
                <p>"China+1 전략(China Plus One)"이란 글로벌 vendor가 중국 단일 의존 risk를 회피하고자 2~3개 대체 sourcing 국가를 동시에 운영하는 supply chain 다변화 패러다임. 2020 COVID 봉쇄 + 2021 요소수 수출 통제 + 2024 PLS 사태로 중국 100% 의존은 가장 큰 vendor risk로 부상 — 그러나 한국 당근 수입은 여전히 중국 90% 이상으로 글로벌 트렌드에 역행.</p>
                <p>실측: <strong>한국 당근 수입 국가별: 중국 90.4% / 베트남 6.2% / 기타 3.4%. 일본(50% 미만)·EU(35%)·미국(48%) 등 선진국 vendor는 모두 China+1 30~50% 비중 보유 → 한국이 글로벌 트렌드에서 가장 뒤처짐. 단일 사고 시 -90% 공급 충격 시나리오 확정</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 중국 90% 의존은 "역사적 단가 우위"가 아닌 <strong>"분기 P&L의 90%를 외국 정부 정책에 위임한 single-point failure — 자본 시장 valuation discount 1.5x"</strong>.</p>
                <p><strong>3단계</strong>: ① 18개월 내 중국 비중 90% → 60%로 축소 + 베트남 25% / 인도·이집트 15% 동시 구축 ② sourcing 국가 다변화 자체를 vendor DD score 항목으로 표준화 — IR·은행·PE 실사 시 score +12점 자동 ③ "China+1 carrot champion" 포지셔닝 → 일본·홍콩·싱가포르 K-veggie 수출 시 trust premium 단가 +18% 가능, exit valuation +2.0x.</p>
              </div>
            ),
            source: "FAOSTAT TM + 관세청 수입국별 통계 + KOTRA China+1 글로벌 동향",
          }} />

        
        <WidgetCard title='수입 단가 시뮬레이션 (KREI 관세 vs VKFTA 영세율)' icon={Truck} iconColor="#ea580c" pillar="S3"
          cardDesc='단위: USD/톤'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w5Live}>
              <BarChart data={w5Live}>
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"Landed Cost(도착가)"란 매입 단가 + 물류비 + 관세 + 보험 + 통관 fee 모두 합산한 최종 매입원가 — vendor 협상에서 단가 비교의 진짜 기준선. 중국 당근 기본관세 30% vs 베트남 VKFTA 0% — 같은 단가라도 한국 도착 시 Landed Cost 격차 +24%p 이상 자동 발생.</p>
                <p>실측: <strong>중국 칭다오 매입 $480/MT + 해상 $35 + 관세 30% ($154) = Landed $669/MT. 베트남 달랏 매입 $440/MT + 해상 $65 + MA 포장 $42 + 관세 0% = Landed $547/MT. 베트남이 단가는 비싸 보이나 Landed Cost -18% 우위 — "단가"가 아니라 "도착가"로 비교해야 진실 보임</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 중국산 우위 인식은 "단가 환상" — <strong>"VKFTA 0% 관세가 모든 부가 cost를 흡수하고도 -18%p 우위, 매분기 +6%p 마진 자동 발생하는 영구 cost moat"</strong>.</p>
                <p><strong>3단계</strong>: ① 모든 B2B 견적·내부 매입 의사결정을 단가 → <strong>Landed Cost</strong> 표준으로 강제 전환 ② MA 특수 포장은 capex 회수가 6개월 — 자체 패키징 라인 신설로 단가 -$15/MT 추가 절감 ③ "VKFTA Landed Cost Champion" 포지셔닝을 IR 자료에 KPI화 → exit 시 PE 실사에서 단가 협상력 정량 증명 → +1.4x valuation premium.</p>
              </div>
            ),
            source: "관세청 KCS Open API 농산물 관세표(E04-2026) + 한-베트남 FTA(VKFTA) 양허표",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"MA 포장(Modified Atmosphere Packaging, 가스 치환 포장)"이란 패키지 내부 산소를 N₂·CO₂로 치환해 호흡·산화·미생물 증식을 동시 차단하는 후수확 기술. 당근은 수확 직후 호흡량이 높아 일반 박스 포장 시 7일 만에 당도·수분 +20% 손실. MA 적용 시 최장 45일까지 spec 유지 — 베트남 해상 운송(7~12일) 시간 risk를 형식적으로 무력화.</p>
                <p>실측: <strong>일반 포장 + 베트남 해상 12일 → 도착 후 불량 폐기율 18%, 잔여 수율 82%. MA 포장 동일 조건 → 폐기율 2%, 수율 98% + 보관일 +33일 (총 45일) 연장. 동일 단가에서 수율 차이 +16%p, 보관 buffer +33일</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: MA 포장은 "물류 cost"가 아닌 <strong>"수율 +16%p + 보관 buffer +33일을 자동 매수하는 영구 leverage 자산 — capex 회수 6개월짜리 자명한 ROI"</strong>.</p>
                <p><strong>3단계</strong>: ① 베트남 달랏 산지 옆 MA 포장 라인 자체 capex (회수 6개월) — 단가 +$42/MT 비용 대비 폐기 -16%p 절감으로 net +$98/MT 마진 ② 보관 buffer +33일을 leverage해 한국 도착 일정을 KAMIS 사과·배 가격 spike와 sync — 단경기 폭등 윈도우에 정확히 도착시켜 도매가 +18% 프리미엄 동시 캡처 ③ B2B 바이어에 "MA-supported zero waste 보장 LTA" — 결품 risk 0 조건의 5년 lock-in 협상 무기.</p>
              </div>
            ),
            source: "수입식품 신선도 관리 가이드라인 + MA 포장 호흡 억제 R&D + 베트남 해상 운송 사례",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"해상 이동식 창고(Floating Storage)"란 화물 도착 시간 자체를 inventory buffer로 활용하는 trade engineering 전략. 중국 칭다오 → 부산은 3일이라 도착 즉시 비싼 3PL 냉동창고(일 $20/10톤) 임대료 발동 — 만약 시황 폭락 국면이면 빠져나갈 곳이 없어 덤핑 강제. 베트남 호치민 → 부산 10일은 그 7일 차이가 "무료 floating warehouse" + "지리적 콜옵션"으로 변신.</p>
                <p>실측: <strong>중국산 컨테이너 도착 후 14일 보관 cost $280 vs 베트남산은 항해 10일 free storage + 도착 후 4일 cost $80 (-71% 절감). 시황 폭락 시 베트남 화물은 항로 우회로 일본·대만 전매 가능 — 지리적 콜옵션 시장가치 약 $180~250/컨테이너</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 베트남 sourcing은 "운임만 비싸 보이는 selection"이 아닌 <strong>"항해 시간 자체가 free warehouse + geographical call option을 동시 제공하는 hidden alpha — 단가 비교에 보이지 않는 trade engineering 자산"</strong>.</p>
                <p><strong>3단계</strong>: ① 베트남발 매주 정기 배차 — 한국 도착일을 KAMIS 도매가 spike 예보와 sync 발주 ② 시황 모니터링 모델 운영: 도착 D-7 시점에 한국·일본·대만 도매가 비교 → 가장 높은 시장으로 항로 우회 (선사·통관과 사전 약정) ③ 지리적 콜옵션 가치를 IR 자료에 KPI화 → "Trade engineering vendor" valuation +1.6x premium 정당화.</p>
              </div>
            ),
            source: "관세청 KCS Open API + 해양수산부 항만 화물 처리시간 + 3PL 콜드체인 보관료",
          }} />

        {/* New W22 Widget: TRQ Dependency vs. Free Trade Arbitrage */}
        <WidgetCard title='WTO TRQ 배분 의존도 vs FTA 영구 차익' icon={Scale} iconColor="#ea580c" pillar="S3"
          cardDesc='단위: 관세율 %, 수입원가 USD'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={dynamicW22Data}>
              <ComposedChart data={dynamicW22Data}>
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"WTO TRQ(Tariff Rate Quota, 저율관세할당)" vs "FTA 영세율(Permanent 0% Tariff)"은 한국 vendor에게 본질적으로 다른 제도. TRQ는 정부가 매년 비정기적으로 배분하는 한정 수량 + 정치적 변수 + 신청·심사 cycle 6~9개월. FTA(VKFTA)는 협정문에 명시된 상시 0% — 발동 조건도 신청도 불필요. 두 제도 의존도가 vendor 안정성을 결정.</p>
                <p>실측: <strong>TRQ 의존 vendor 마진 변동성 ±35% (배분 받느냐 못 받느냐) vs VKFTA 영세율 vendor 마진 변동성 ±4%. TRQ 신청·심사 비용 + 정치 risk + 발동 지연 → 시간당 cost로 환산 시 추가 -$48/MT. FTA 활용 vendor가 모든 면에서 우위</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: TRQ 사냥은 "정부 정책 기회 활용"이 아닌 <strong>"vendor의 핵심 cost 구조를 정부 정치 사이클에 위임하는 self-imposed risk" — FTA만이 영구 cost arbitrage"</strong>.</p>
                <p><strong>3단계</strong>: ① 매입 portfolio에서 TRQ 의존 비중 35% → 5% 이하로 감축 + VKFTA 영세율 비중을 75%+로 lift ② TRQ 신청·관리 부서를 FTA 원산지 누적 활용 trade engineering 팀으로 reframe (인력 redeploy) ③ B2B 5년 LTA 협상에서 <strong>"VKFTA 영세율 영구 보장가"</strong> 약정 발동 — 시장 변동 무관 단가 lock-in, 우리는 매분기 +6%p 마진 자동 발생.</p>
              </div>
            ),
            source: "KREI WTO TRQ 개선 방안 리포트 + 관세청 한-베트남 FTA 양허표 + WTO TRQ 발동 이력",
          }} />

      </div>

      </>)}
      {activePart === 'S4' && (<>
      {/* Section 4: Sales */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
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
          takeaway={{
            situation: (
              <div>
                <p>"벤더 이탈률(Vendor Churn Rate)"이란 B2B 고객사가 supply 단가·품질·결품 불안정 등 이유로 vendor를 교체하는 비율 — vendor의 매출 base 안정성을 결정짓는 핵심 KPI. 중소 수입사들은 중국 스팟 단가 변동성을 바이어에게 그대로 전가 → 연 Churn 25~38% 발생 → 영업 비용 매년 추가.</p>
                <p>실측: <strong>스팟 의존 vendor 평균 churn 32%/년 vs 장기 LTA 운영 vendor churn 6%/년. churn 1%당 매출 손실 평균 $48만/연 + 신규 영업 cost +$22만. 동일 vendor 5년 운영 시 LTA 운영자가 누적 $1,170만 추가 매출 + cost 절감</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: B2B 영업의 진짜 자산은 "신규 수주 능력"이 아닌 <strong>"churn rate를 6% 이하로 lock-in하는 LTA 협상 역량 + 단가 변동성 흡수 능력" — 자본 시장은 churn 낮은 vendor에만 valuation premium</strong>.</p>
                <p><strong>3단계</strong>: ① 달랏-한국 직결 파이프라인의 KCS 수입 단가 실측 데이터를 기반으로 <strong>"연중 고정 공급가 5년 LTA"</strong> 표준 계약서 제작 — 시장가 ±25% 변동 시에도 약정 단가 유지 ② CJ프레시웨이·아워홈·풀무원·신세계푸드·BBQ 5대 B2B에 동시 제안 + 우선 협상 ③ LTA 체결률 80%+ 달성 시 IR 자료에 "Churn-locked B2B vendor" 포지셔닝 → exit valuation +1.8x premium.</p>
              </div>
            ),
            source: "aT KAMIS 도매가격 지수 변동성 + KCS 수입 단가 실측 + B2B 5사 vendor churn 분석",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"Bass Diffusion Model(바스 확산 모형)"이란 신제품·신기술·신상품군이 시장에 침투하는 곡선을 수학적으로 예측하는 marketing model. innovator·early adopter·majority·laggard 4단계 비중을 입력으로 받아 5~10년 점유율 시뮬레이션. 한국 당근 시장에서 "베트남 IQF 전처리"는 신생 segment 단계 — 침투 곡선의 가장 가파른 구간에 진입.</p>
                <p>실측: <strong>한국 당근 국내 공급 20.6만톤 중 순수입 11.4만톤(55.3%). 자급률 47.2% → 2035 45.2% 지속 하락 → 수입 의존도 자동 강화. Bass Model 기본 시나리오 5년 내 베트남 IQF 점유율 55%, 보수 시나리오에서도 30% — 시장이 우리에게 미리 굴러옴</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 베트남 IQF segment 확장은 "신규 시장 침투"가 아닌 <strong>"이미 자급률 하락이 정해진 미래에 가장 빨리 진입한 vendor가 winner-takes-all 차지하는 race against time"</strong>.</p>
                <p><strong>3단계</strong>: ① 향후 5년 capex roadmap: 베트남 달랏 IQF capa를 매년 +25%씩 확장 (5년 누계 +200%) → Bass Model 기본 시나리오 capa 충당 ② B2B HMR·급식·외식 핵심 5사 + 대형마트 PB 5사에 동시 우선 입점 — Bass curve early adopter 단계에서 lock-in 완료 ③ "K-Carrot IQF" 자체 브랜드 + KFI(한국식품안전관리인증) + Halal·Kosher 인증 패키지 → 일본·중동·동남아 K-veggie 수출 확장, valuation +2.0x.</p>
              </div>
            ),
            source: "KREI 농업전망2026 + Bass Diffusion Model 마케팅 R&D + 한국 B2B HMR 시장 분석",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"베타카로틴(β-Carotene)"이란 당근의 주황색을 만드는 카로티노이드 색소로, 체내에서 비타민A로 전환되는 항산화 활성 영양소. 100g당 함량이 식약처 영양성분 표시 의무 spec 중 하나 — 5,000μg+ 프리미엄 / 3,000~5,000μg 일반 / 3,000μg 미만 저급. "VietGAP(Vietnam Good Agricultural Practices)"는 베트남 농업부 인증으로 잔류농약·환경관리 기준 — GlobalGAP 호환.</p>
                <p>실측: <strong>중국산 일본 종자: Brix 6.2 / 베타카로틴 2,800μg / VietGAP 인증 없음. 베트남 달랏 한국 종자: Brix 12.8 (2.1배) / 베타카로틴 8,400μg (3.0배) / VietGAP·GlobalGAP 인증. 동일 commodity인데 spec 만 보면 완전 다른 상품</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 베트남 달랏 당근은 "값싼 원재료"가 아닌 <strong>"식약처 영양 spec + VietGAP 인증으로 프리미엄 B2C(밀키트·유기농 이유식·시니어식) 진입 자격을 가진 differentiated product"</strong>. 인증 자체가 가격 결정력.</p>
                <p><strong>3단계</strong>: ① B2C 채널(마켓컬리·올리브영·SSG·이마트 PB·삼다·정관장) 입점 — "고당도 12.8 Brix + 베타카로틴 8,400μg" 라벨로 단가 +85% 프리미엄 ② 프리미엄 밀키트(마이셰프·프레시지·테이스티나인) + 유기농 이유식(베베쿡·아이배냇) + 시니어식(매일유업·정식품) 5년 LTA — segment별 customization SKU ③ 자체 K-Carrot Premium 브랜드 출시 → 일본 백화점·홍콩·싱가포르 K-veggie 채널 직진출, valuation +2.2x.</p>
              </div>
            ),
            source: "식약처 영양성분DB + VietGAP·GlobalGAP 인증 + Enza Zaden 종자 R&D",
          }} />


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
          takeaway={{
            situation: (
              <div>
                <p>"CDD(Commercial Due Diligence, 커머셜 실사)"란 회계법인·PE·IB가 M&A 타겟의 시장·매출·고객·경쟁 환경을 정량 평가하는 표준 프레임워크. 통상 7~9개 축(시장 매력도·M/S·고객 충성도·운영 효율·자본 효율·ESG·인증·기후 내성)으로 100점 만점 score. 80점+ "통과", 90점+ "Tier 1 strategic asset". score가 곧 valuation multiple 결정.</p>
                <p>실측: <strong>3사 비교: 베트남 달랏 농장 A (1순위) 92점 (FTA·기후·인증·인프라 모두 상위) / 중국 칭다오 공장 B 64점 (관세 risk·고령화 인건비·인증 부재) / 한국 제주 산지 C 71점 (기후 변동·매입원가 +). score 차이가 곧 valuation multiple 2.3배 차이</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 단순 수입 유통업은 "Flat Margin commodity vendor PE 4x" 함정 — <strong>"산지 장악력 + 전처리 밸류체인 내재화로 CDD 90점+ 달성 시 strategic asset PE 12x로 자본 시장 카테고리 점프"</strong>.</p>
                <p><strong>3단계</strong>: ① 1순위 달랏 농장 A 매수 또는 majority JV (capex $8~15M 추정) — 산지 capa lock-in + CDD score +18점 자동 ② 평택·인천에 IQF 전처리 라인 신설 (capex $4~6M) → 가공 vendor 카테고리 진입, CDD score +10점 ③ CDD 90점+ 달성 후 24~36개월 내 strategic exit 추진 — 한국 식품 대기업(CJ제일제당·풀무원·하림) 또는 글로벌 PE에 매각, EV/EBITDA 4x → 12x 리레이팅 +200% premium.</p>
              </div>
            ),
            source: "DART 자체 딜 소싱 M&A 스코어카드 + 회계법인 (PwC·Deloitte·KPMG) CDD 프레임워크",
          }} />

        {/* New W23 Widget: Vendor Lock-in LTV */}
        <WidgetCard title='대형 벤더 장기 락인 누적 생애가치 (LTV)' icon={Banknote} iconColor="#ea580c" pillar="S4"
          cardDesc='단위: 누적 잉여현금흐름 인덱스 및 이탈률 %'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={dynamicW23Data}>
              <ComposedChart data={dynamicW23Data}>
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"LTV(Lifetime Value, 고객 생애가치)"란 한 vendor가 단일 고객으로부터 평생 창출하는 누적 수익. B2B에서는 ACV(연간 계약금) × 평균 lock-in 기간 × 마진율. 스팟 공급은 평균 lock-in 1.8년 (churn 60%), 장기 LTA는 5~7년 (churn 8%) — 동일 고객이 vendor에게 만드는 LTV 격차 4~5배.</p>
                <p>실측: <strong>스팟 모델: ACV $1.2M × 1.8년 × 마진 12% = LTV $259K. 장기 LTA 모델: ACV $1.5M × 6년 × 마진 22% = LTV $1,980K (7.6배). 3년차부터 LTA 모델 누적 FCF가 스팟 대비 +280%, 5년차 +540%로 곡선 발산</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: B2B vendor의 진짜 가치는 "신규 수주 매출"이 아닌 <strong>"LTA lock-in으로 누적 LTV를 7.6배로 증폭시키는 customer asset 가치 — 자본 시장은 churn 낮은 vendor에만 SaaS급 multiple 부여"</strong>.</p>
                <p><strong>3단계</strong>: ① IQF 다이스 등 전처리 폼팩터를 "연중 고정 단가 5~7년 LTA" 표준화 → 신세계푸드·CJ프레시웨이·아워홈·풀무원·BBQ 5대 vendor 동시 협상 ② LTA 체결 후 매년 spec 업그레이드 (당도·인증·신규 폼팩터) → vendor switching cost 영구 누적, churn -52%p ③ LTV 트래킹 KPI를 IR 자료에 분기 disclosure → "SaaS-like B2B agri vendor" 카테고리로 reframe, exit 시 PE 4x → 9x 리레이팅 가능.</p>
              </div>
            ),
            source: "aT 가공식품 세분시장 현황-간편식 (2024) + B2B 5사 LTV 분석 + 글로벌 SaaS LTV 벤치마크",
          }} />

      </div>

      </>)}
      {activePart === 'S5' && (<>
      {/* Section 5: ESG */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
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
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"어글리 롯(Ugly Lot, 비규격품)"이란 크기·형태가 기준 외라 상품성 미달로 분류되는 농산물. 당근은 수확량의 15~30%가 어글리 롯으로 폐기 — 영양가는 동일하나 외관상 retail 진열대에 못 오름. "수확 후 손실(Post-harvest Loss)"은 별도로 보관·운송·검역 단계 폐기율 — 한국은 두 항목 합산 27.3%로 글로벌 최악.</p>
                <p>실측: <strong>한국 연간 당근 생산 약 9.7만톤 중 손실 ~3.1만톤 (32%, FAOSTAT SCL). 동기 미국 8.9% / 중국 5.0% / 독일 15% 대비 2~5배 높음. 손실량 ~3.1만톤이 그대로 베타카로틴·펫푸드·메디푸드 원료 전환 시 부가가치 +$24M/년 추정</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 어글리 롯·수확 후 손실은 "비효율"이 아닌 <strong>"매년 $24M+ 부가가치를 자동 발생시키는 untapped revenue pool — vendor가 처음 진입하면 monopolize 가능한 blue ocean"</strong>.</p>
                <p><strong>3단계</strong>: ① 제주·강원 농가와 어글리 롯 전량 수거 contract (kg당 -₩180 폐기 cost를 +₩220 매입가로 전환, win-win) ② 평택·인천 베타카로틴 추출 라인 신설 — Amin et al.(2021) Expeller 공정 적용 시 수율 11배 폭증 ③ 펫푸드(우주펫·하림펫푸드) + 메디푸드(정관장·종근당건강) raw 납품 5년 LTA → 단가 +$280/MT 추가 매출 + Scope 3 탄소 -199 tCO₂e ESG 점수 +12점.</p>
              </div>
            ),
            source: "FAOSTAT Supply Utilization Accounts (SCL 2021) + Amin et al.(2021) CalPoly + KREI",
          }} />

        
        <WidgetCard title='비규격 폐기 방지 및 푸드 업사이클링 ROI' icon={Leaf} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: 비율'
          telemetry={{ status: 'LIVE', syncDate: 'UN Comtrade' }} chartHeight={375}
          chart={
            <ChartWrapper data={w9Live}>
              <BarChart data={w9Live} layout="vertical">
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"Expeller(압착) 공정"이란 원물을 고압·고온으로 압착해 함유 활성 성분을 추출하는 후수확 가공 기술. 당근 어글리 롯에 Expeller 적용 시 베타카로틴 추출 효율이 일반 공정 대비 +1,100% 폭증 (Amin et al., CalPoly 2021). "천연 베타카로틴 시장"은 GMI 기준 글로벌 $6.1억(2024) → $11.2억(2030) +CAGR 11% 성장 — 한국 vendor가 아직 진입하지 않은 blue ocean.</p>
                <p>실측: <strong>한국 어글리 롯 3.1만톤 × Expeller 변환 시 베타카로틴 약 280톤 생산 가능 (Amin 11배 수율 기준). 글로벌 천연 베타카로틴 단가 $48~85/kg → 잠재 매출 $13~24M/년. ROI: capex $4~6M, 회수 18~24개월</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 어글리 롯의 푸드 업사이클링은 단순 폐기물 처리가 아닌 <strong>"신선 농산물 국경 방역(PLS·검역) 장벽을 형식적으로 우회하면서 글로벌 $6.1억 베타카로틴 시장에 진입하는 entry pass"</strong>.</p>
                <p><strong>3단계</strong>: ① 평택·인천 보세창고에 Expeller 베타카로틴 추출 라인 신설 (capex $4~6M) — 회수 18~24개월 ② 천연 색소 buyer(LG생활건강·아모레퍼시픽 헬스케어·코스맥스·한국콜마) raw 납품 + 미국 Whole Foods·iHerb·Amazon 천연 영양제 SKU 납품 ③ "K-Carrot β-Carotene" 자체 브랜드 + Halal·Kosher·USDA Organic·EU Organic 4중 인증 → 글로벌 superfood 카테고리 진입, valuation 4x → 12x.</p>
              </div>
            ),
            source: "Amin et al.(2021) CalPoly Expeller R&D + GMI 천연 베타카로틴 시장 + UN Comtrade",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"Scope 3(공급망 간접 탄소)"란 vendor 자체 배출(Scope 1·2) 외 supply chain·고객 사용·폐기까지 합산한 총 탄소 발자국. 글로벌 ESG 공시 표준(ISSB IFRS S2·EU CSRD·SEC)에서 의무화되며 한국 대기업도 신세계·롯데·CJ 등이 vendor Scope 3 데이터 의무 수집 단계 진입 — vendor의 탄소 성적이 B2B 계약 갱신의 새 게이트.</p>
                <p>실측: <strong>관행농 당근 탄소발자국 0.0833 kgCO₂e/kg → 유기농 0.0763 (-8%) → 업사이클링 전환 시 0.047 (-43%, Cecílio Filho et al. 2026). 신세계·롯데·CJ 등 대기업 Scope 3 vendor score 가중치 25~35%. 탄소 -43% 달성 vendor는 vendor score +18점 자동, 단가 +12% premium 받아도 acceptance</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: ESG는 "규제 cost"가 아닌 <strong>"바이어 Scope 3 KPI 달성을 도와주는 vendor만이 5년+ LTA 우선 협상권 + 단가 +12%p premium 자동 획득하는 strategic moat"</strong>.</p>
                <p><strong>3단계</strong>: ① 베트남 달랏 친환경 농법(GAP·VietGAP·Organic) 데이터 + B품 업사이클링 수거율 데이터를 매월 LCA(Life Cycle Assessment) 형식으로 IR 자료화 ② 신세계·롯데·CJ 5대 대기업 Scope 3 vendor 등록 우선 신청 → 5년 LTA 단독 협상권 확보 ③ "K-Carrot Carbon-43% vendor" 자체 브랜딩 → 글로벌 LP·ESG 펀드 매수 유입, exit 시 ESG-aligned vendor valuation +1.8x premium.</p>
              </div>
            ),
            source: "Cecílio Filho et al.(2026) Bragantia 85 LCA + IPCC 2019 Tier 2 + 신세계·롯데·CJ ESG 리포트",
          }} />

        <WidgetCard title='가치사슬 통합 마진 스마일 커브 (PEF 롤업 모델)' icon={Layers} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: EBITDA 영업이익률 %'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w14Live}>
              <ComposedChart data={w14Live}>
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"마진 스마일 커브(Smile Curve)"란 가치사슬 양 끝(R&D·브랜드)이 높고 중간(생산·유통)이 낮은 U자 마진 분포 패턴 — Acer 창업자 스탠 시(Stan Shih)가 1992 제시한 IT 산업 모델이 농식품에도 그대로 적용. 단순 1차 농산물 유통은 마진 3~8% 함정. 그러나 양 끝(종자 IP + 가공·바이오 업사이클링) 동시 통제 시 EBITDA 22~35% 영역으로 점프.</p>
                <p>실측: <strong>전통 수입 유통 vendor: 마진 3~8% / EV/EBITDA 4~5x. 종자 IP + IQF 가공 + 업사이클링 통합 vendor: 마진 22~35% / EV/EBITDA 12~15x (PEF Buy & Build 실증). 매출 동일해도 EV 차이 +280%, 자본 시장 가치 -75% discount vs +180% premium 차이</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 농식품 vendor의 진짜 alpha는 "유통 마진 1~2%p 개선"이 아닌 <strong>"스마일 커브 양 끝 동시 장악으로 '단순 유통업' → '푸드테크 유니콘' 카테고리 점프 → EV/EBITDA 4x → 15x 리레이팅"</strong>. 카테고리 점프가 영업보다 100배 강력.</p>
                <p><strong>3단계</strong>: ① 전방 통제: 한국 고당도 종자 IP 5년 독점 라이센스 + 베트남 contract farming → 종자 IP vendor 자격 ② 후방 통제: IQF·MA·Expeller 가공 + 베타카로틴 업사이클링 통합 라인 — 가공 vendor + biotech vendor 동시 자격 ③ 24~36개월 내 strategic exit 추진 — CJ제일제당·풀무원·하림·SPC 또는 글로벌 PE(KKR·블랙스톤 Asia) 타겟 → "K-foodtech roll-up champion" valuation EV $250~400M.</p>
              </div>
            ),
            source: "대형 PEF 농식품 Buy & Build 가치평가 실증 + Stan Shih Smile Curve 1992 + 한국 푸드테크 IPO 사례",
          }} />

        {/* New W24 Widget: ESG Upcycling */}
        <WidgetCard title='푸드 업사이클링 프리미엄 및 Scope 3 감축 효과 실증' icon={Leaf} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: 톤, 마진율 %, tCO2e'
          telemetry={{ status: 'SYNCED', syncDate: 'KREI 2026' }} chartHeight={375}
          chart={
            <ChartWrapper data={w24Live}>
              <ComposedChart data={w24Live}>
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"메디푸드(Medical Food / Medi-food)"란 질병 예방·관리에 효능 입증된 활성 성분을 표준화한 기능성 식품 카테고리 — 식품과 의약품의 중간 영역. 고순도 베타카로틴(95%+ 추출물)은 항산화·시력 보호·면역 강화 효능으로 글로벌 메디푸드 시장의 핵심 raw — 단가 통상 commodity 당근의 60~120배.</p>
                <p>실측: <strong>KREI 연 ~3.1만톤 B품 중 2,400톤만 전환해도 Scope 3 -199 tCO₂e 감축 + 베타카로틴 ~21톤 추출 가능. 메디푸드용 단가 $85~120/kg → 매출 약 $1.8~2.5M/년. 일반 유통 vendor 마진 5%대 vs 메디푸드 변환 시 마진 70%+ (Amin et al. 2021)</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: B품 업사이클링의 진짜 가치는 "탄소 감축"이 아닌 <strong>"-199 tCO₂e Scope 3 감축량을 대기업 B2B 계약의 독점 무기로 변환 + 메디푸드 마진 70%+ 동시 캡처하는 dual leverage"</strong>.</p>
                <p><strong>3단계</strong>: ① B품 베타카로틴 추출 라인 + 인증 (식약처 건강기능식품 raw 등록·USDA Organic·EU Organic) ② 종근당건강·정관장·아모레퍼시픽 헬스케어·내츄럴엔도텍 등 메디푸드 5사에 raw 5년 LTA 단독 공급 ③ 신세계·롯데·CJ ESG vendor 등록 시 Scope 3 -199 tCO₂e 자료 첨부 → vendor score +18점 + LTA 우선 협상권 확보, exit valuation +2.1x premium.</p>
              </div>
            ),
            source: "Amin et al.(2021) CalPoly + Cecílio Filho(2026) Bragantia 85 + GMI 메디푸드 시장 + KREI",
          }} />

        {/* New W19 Widget: Exit Valuation Waterfall */}
        <WidgetCard title='엑시트 밸류에이션 워터폴: 5x → 15x 멀티플 브릿지 실증' icon={Landmark} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: 밸류에이션 포인트'
          telemetry={{ status: 'LIVE', syncDate: 'DART & PitchBook' }} chartHeight={375}
          chart={
            <ChartWrapper data={dynamicW19Data}>
              <BarChart data={dynamicW19Data} margin={{ left: 10, right: 10 }}>
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"QoE(Quality of Earnings, 이익의 질)"란 vendor EBITDA가 얼마나 sustainable·predictable·diversified한지 측정하는 PE·IB 실사 핵심 지표. 동일 EBITDA여도 QoE가 높으면 multiple +50~120% premium. "Valuation Waterfall(밸류에이션 워터폴)"은 base multiple(5x)에 각 가치 동인을 단계별로 더해 최종 multiple(15x)에 도달하는 시각화 모델.</p>
                <p>실측: <strong>단순 농산물 수입 vendor EV/EBITDA 5x base → +기후 hedging 1x → +VKFTA 영세율 1.5x → +PLS·잔류농약 zero lock-in 1.5x → +IQF 가공 2x → +Smile Curve 종자 IP 2x → +업사이클링·메디푸드 2x = <strong>최종 15x</strong> (총 +200% premium). 동일 EBITDA $10M 기준 EV $50M → $150M</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: vendor의 진짜 게임은 "EBITDA 1~2%p 개선"이 아닌 <strong>"각 가치 동인을 IR 자료에 정량 disclosure해 multiple을 5x → 15x로 단계별 빌드업 — 카테고리 reframing이 영업보다 100배 강력"</strong>.</p>
                <p><strong>3단계</strong>: ① 9대 API망(KAMIS·KCS·FAOSTAT·NOAA·KREI·OEC·KOTRA·EUDR·PitchBook) 통합 dashboard를 IR 자료의 living KPI section으로 전시 ② 분기마다 EBITDA multiple waterfall 자료를 LP·은행·PE에 disclosure → 매분기 multiple 가시화 ③ 18~30개월 내 strategic exit 또는 IPO 추진 — CJ·하림·블랙스톤·KKR Asia 등 buyer pool 동시 sound, EV $150~250M target.</p>
              </div>
            ),
            source: "PitchBook 글로벌 애그테크 M&A 트랜잭션 + DART 한국 PE 실증 multiple + PE Buy & Build 가치평가",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"OEC(Observatory of Economic Complexity)"는 MIT 미디어랩에서 시작된 글로벌 무역 데이터 시각화·분석 플랫폼. 30년 시계열 양자 무역 데이터를 HS 6자리·10자리 단위로 제공 → vendor의 시장 구조 변화 long-term trend 분석에 필수. "글로벌 무역 집중도(HHI)"가 낮을수록 sourcing 다변화가 쉽고, 높을수록 monopoly 시장.</p>
                <p>실측: <strong>당근 수출 글로벌 분포 (2024): 중국 22.5% / 네덜란드 12% / 미국 11% / 이탈리아 10% / 스페인 10% / 이스라엘 5%. 마늘(중국 65.6%) 대비 훨씬 분산된 구조 → HHI 낮음 → 다변화 현실적. 이스라엘은 2020 이후 -68% 급감 (전쟁 risk) → 베트남이 점유율 흡수 기회</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 당근 수출 시장의 분산 구조는 "단순 글로벌 통계"가 아닌 <strong>"vendor가 China+1·China+3 전략을 실현 가능하게 만드는 충분한 supply alternatives — 마늘과 달리 당근은 진짜 다변화 가능"</strong>.</p>
                <p><strong>3단계</strong>: ① 중국 의존 90% → 50%로 18~24개월 내 축소 + 베트남 30%·호주·이스라엘·이탈리아 합산 20% multi-sourcing ② 이스라엘 supply 공백(전쟁 risk로 -68% 급감)을 베트남이 흡수하는 글로벌 트렌드에 맞춰 한국 vendor가 동시 호치민·달랏·하노이 hub 강화 → 글로벌 capa 흡수 ③ "OEC 30년 데이터 기반 sourcing intelligence vendor"로 IR 포지셔닝 → exit valuation +1.5x.</p>
              </div>
            ),
            source: "OEC 실측 HS 070610 국가별 수출액 (1995~2024) + UN Comtrade + 이스라엘 농업부",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"자급률(Self-sufficiency Rate)"이란 국내 소비 중 국내 생산이 차지하는 비중. 한국 당근은 47.2%(2024) → 45.2%(2035E, KREI) 지속 하락 — 인구 감소에도 1인당 소비는 +4.3kg(2035)로 증가하며 절대 수입량 자동 확대. 식량안보·외환 부담 risk 동시 증가.</p>
                <p>실측: <strong>한국 당근 수입액 $3.1M(2000) → $51M(2024) (16배). 미국 $21M → $210M (10배, 글로벌 1위 수입국). 일본 $19~52M 정체 (인구 감소). 한국 자급률 45%는 OECD 평균 78% 대비 -33%p, 일본 80%·중국 95% 대비도 압도적 부족 → 글로벌 hub 진입 동력</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 한국 자급률 하락은 risk가 아닌 <strong>"향후 10년 수입 증가가 정해진 미래 — 가장 빨리 multi-sourcing vendor가 된 곳이 시장 점유율 50%+ 흡수하는 race against time"</strong>.</p>
                <p><strong>3단계</strong>: ① 중국 90% → 50% 축소 + 베트남 30%·호주 10%·이탈리아 10% multi-sourcing 확립 ② 일본 시장($38M, 정체 중) 동시 진출 — 한국·일본 통합 sourcing 규모의 경제로 단가 -12%p 절감 ③ "K-Carrot food security partner" 포지셔닝 → 식약처·농식품부·전략비축 입찰 우선 vendor 지위 확보 → 정부 LTA 매출 base 안정 + valuation +1.5x premium.</p>
              </div>
            ),
            source: "OEC 실측 HS 070610 국가별 수입액 + KREI 자급률 전망 + 농식품부 식량안보 통계",
          }} />

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
          takeaway={{
            situation: (
              <div>
                <p>"KAMIS 도매가 사이클(Wholesale Price Cycle)"이란 한국 당근 시장의 정해진 가격 패턴 — 7~9월 단경기 spike → 10~12월 출하 polit → 1~4월 저가 안정. 이 패턴이 매년 반복되나 단경기 충격 강도(평년 vs spike 연도)는 기후·중국산 회수 사태·정책에 따라 ±60%p 변동. vendor 매입 timing 전략의 base data.</p>
                <p>실측: <strong>KAMIS 4년 시계열: 2023 ₩57,923/20kg (평년 base) / 2024 ₩73,178 (+26% spike, 9월 피크 ₩104,748 역대 최고) / 2025 ₩52,400 (-9% 회복) / 2026-1~4월 ₩28,131~35,578 (-48% 정상화). 단경기 7~9월이 모든 진폭의 90% 차지</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: KAMIS 도매가 사이클은 random shock이 아닌 <strong>"매년 9월 피크가 정해진 patternized event — D-180 사전 매입한 vendor만 +60%p arbitrage 마진 자동 수령"</strong>.</p>
                <p><strong>3단계</strong>: ① 2024형 폭등 사이클 대비: 매년 3월(단경기 6개월 전) 베트남 달랏 capa 60%+ 사전 lock-in, MA 포장으로 보관 buffer 45일 확보 ② 2026 저가 안정기(₩30K대) = <strong>신규 바이어 입점 골든 윈도우</strong> — B2B 5사 + B2C 채널 동시 진입, 5년 LTA 단가 ₩42K 고정으로 폭등기 마진 +60%p ③ 변동성 자체를 product화 → "Volatility-managed K-Carrot LTA" 자체 브랜드로 글로벌 LP·자본 시장에 정량 disclosure → valuation +1.4x.</p>
              </div>
            ),
            source: "KAMIS 실측 당근(상품) 월별 도매가 (2023~2026) + 평년가 5년 비교 + 단경기 통계",
          }} />

        {/* W28: FAOSTAT SCL 글로벌 수확후 손실률 비교 */}
        <WidgetCard title='글로벌 당근 수확후 손실률 비교 (FAOSTAT SCL)' icon={Recycle} iconColor="#ea580c" pillar="S5"
          cardDesc='단위: %, 톤'
          telemetry={{ status: 'SYNCED', syncDate: 'FAOSTAT 실측' }} chartHeight={375}
          chart={
            <ChartWrapper data={w28Live}>
              <ComposedChart data={w28Live} margin={{ left: 10, right: 10 }}>
                <ChartPatternDefs />
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
          takeaway={{
            situation: (
              <div>
                <p>"FAOSTAT SCL(Supply Utilization Accounts, 공급이용계정)"이란 한 국가의 작물 공급량을 식용·사료·가공·수출·손실 등 용도별로 정량 추적하는 글로벌 통일 통계. 수확 후 손실률(post-harvest loss rate)은 vendor의 가공·저장 인프라 효율의 macro indicator — 손실률이 낮을수록 1차 산업 효율 + 부가 가공 capa 동시 확보.</p>
                <p>실측: <strong>FAOSTAT SCL 2021: 한국 27.3% (30,570톤, 조사 대상국 최악) vs 중국 5.0% / 미국 8.9% / 독일 15.0%. 격차는 노지 재배·산지 저장 인프라 부재·B품 폐기 관행. 한국이 중국 수준(5%)까지 낮추면 연간 +24,000톤 식용 가능 물량 추가 — 수입 대체 효과 +$11M/년</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 27.3% 손실률은 "한국 농업의 비효율"이 아닌 <strong>"매년 3.1만톤 untapped TAM이 vendor의 baseline ROI 보장하는 capital deployment opportunity — capex 회수 18~24개월짜리 자명한 ROI"</strong>.</p>
                <p><strong>3단계</strong>: ① 제주·강원 권역에 CA 저온저장고 + 박피·선별 자동화 라인 신설 (capex $8~12M) — 수확 후 손실률 27% → 12%로 감축, 연 +14,000톤 식용 회수 ② B품 3.1만톤 중 2,400톤은 베타카로틴 추출 (Amin 11배 수율) + 잔여는 IQF·펫푸드·메디푸드 raw 전환 ③ 정부 농식품부 + 농어촌공사 + KAFFC 저리 융자(3% 이내) 활용 → capex 부담 분산 + ESG·식량안보 정부 점수 동시 lift → exit 시 "Infra-bridge agri vendor" valuation +2.0x premium.</p>
              </div>
            ),
            source: "FAOSTAT SCL 2021 + Amin et al.(2021) CalPoly + KREI 한국 농업 인프라 분석",
          }} />

      </div>
      </>)}

    </div>
  );
}
