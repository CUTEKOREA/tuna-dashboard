'use client';

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, Sankey, ReferenceLine
} from 'recharts';
import {
  Globe, TrendingUp, AlertTriangle, Sprout, Factory, ShieldCheck, Banknote,
  BookOpen, Database, Zap, Activity, Workflow, DollarSign, Scale, RefreshCcw,
  Hexagon, Target, Truck, Layers, Coins, Leaf, MapPin, Landmark, Shield, Anchor,
  Dna, Gavel, TestTube, Recycle, CloudRain
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';

import TakeawayBox from './TakeawayBox';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import CocoaUsdaWidgets from './CocoaUsdaWidgets';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((e: any, i: number) => (
          <div key={i} className={styles.tooltipValue}>
            <span style={{ color: e.color }}>■ {e.name || e.dataKey}</span>
            <strong>{typeof e.value === 'number' ? Math.round(e.value).toLocaleString() : e.value}</strong>
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
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Factory },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Truck },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Coins },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Leaf },
];

const COCOA_KPIS: Record<string, any> = {
  k1: { title: '글로벌 가격 폭등률', value: '+300%', trend: '📈', desc: '역대 최고치($10K+) 돌파', source: 'ICE API' },
  k2: { title: '국내 제과 원가 상승률', value: '+42.5%', trend: '🔥', desc: '코코아/설탕가 동반 상승 타격', source: 'KAMIS/KCS API' },
  k3: { title: '가공품 마진 프리미엄', value: '2.6배', trend: '🧈', desc: '코코아 버터 품귀 현상 심화', source: 'ICCO API' },
  k4: { title: 'DART 실시간 타격 지수', value: '매출원가 +14%', trend: '📉', desc: '경쟁사(L/O사) 3분기 원가율 악화', source: 'DART API' },
  k5: { title: '식약처 통관 거절률', value: '8.2%', trend: '🚨', desc: '남미산 카드뮴 허용치 초과 폐기', source: 'MFDS API' },
  k6: { title: 'EUDR 규제 리스크', value: '벌금 4%', trend: '⚖️', desc: '산림벌채 방지법(2025) 도입 임박', source: 'JRC / EFI API' },
};

// 5-Pillar 네비게이터 메타 (코코아 시그니처 그라디언트 — 갈색 brown)
const SECTIONS = [
  { id: "S1", num: "❶", label: "원료 수급", title: "1. 원물 생산", desc: "서아프리카 기후 리스크와 원두 숏티지 사태 전조", color: "#92400e" },
  { id: "S2", num: "❷", label: "가공·생산", title: "2. 가공 산업", desc: "글로벌 분산 가공 허브와 파생품 마진 스프레드", color: "#b45309" },
  { id: "S3", num: "❸", label: "물류·통관", title: "3. 물류 및 무역", desc: "한국의 이중 수입 넥서스와 공급망 다변화", color: "#d97706" },
  { id: "S4", num: "❹", label: "판매·수요", title: "4. 판매 및 수요", desc: "대체유 방어선과 슈링크플레이션 전략", color: "#a16207" },
  { id: "S5", num: "❺", label: "ESG·지속가능성", title: "5. 지속가능성 및 미래 전략", desc: "산림벌채 규제 리스크와 부산물 업사이클링", color: "#78350f" },
];

export default function CocoaDashboard() {
  const [cocoaData, setCocoaData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/cocoa/dashboard');
        const json = await res.json();
        setCocoaData(json.data);
      } catch (e) {
        console.error("Failed to load live cocoa data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    
    // Auto refresh every 5 seconds to show Liveness
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />;
  const xAxisTextProps = { stroke: "var(--text-secondary)", tick: { fontSize: 9 }, minTickGap: 20 };
  const yAxisProps = { stroke: "var(--text-secondary)", tick: { fontSize: 9 } };
  const COLORS = ['#78350f', 'var(--color-danger)', '#b45309', '#d97706', 'var(--color-warning)', '#f59e0b'];

  const processedPriceData = cocoaData?.w2_price_shock ? cocoaData.w2_price_shock.map((d: any, i: number, arr: any[]) => {
    const isForecast = d.month.includes('(F)');
    const nextIsForecast = i < arr.length - 1 && arr[i+1].month.includes('(F)');
    let priceForecast = isForecast ? d.Price : null;
    const priceHist = !isForecast ? d.Price : null;
    if (!isForecast && nextIsForecast) {
      priceForecast = d.Price;
    }
    return { ...d, PriceHist: priceHist, PriceForecast: priceForecast };
  }) : [];

  const renderSankeyNode = ({ x, y, width, height, index, payload }: any) => (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#78350f" rx={2} />
      <text x={x < 150 ? x + width + 5 : x - 5} y={y + height / 2} dy={3} textAnchor={x < 150 ? 'start' : 'end'} fill="#cbd5e1" fontSize={10} fontWeight={600}>
        {payload.name}
      </text>
    </g>
  );

  const waterfallData = cocoaData?.w8_shrinkflation ? cocoaData.w8_shrinkflation.map((d: any) => {
    let base = 0; let val = d.value;
    if (d.name === '기존 원가') { base = 0; val = 100; }
    else if (d.name === '원물가 폭등') { base = 100; val = 150; }
    else if (d.name === '함량 축소') { base = 210; val = 40; }
    else if (d.name === 'CBE(대체유) 사용') { base = 160; val = 50; }
    else if (d.name === '최종 B2B 단가') { base = 0; val = 160; }
    return { ...d, base, val };
  }) : [];

  if (loading || !cocoaData) {
    return (
      <div style={{ padding:'0 1.5rem 3rem', color:'var(--text-primary)', minHeight:'100vh', fontFamily:"'Inter',sans-serif", backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(180,83,9,0.3)', borderTop: '3px solid #d97706', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#b45309', fontWeight: 600 }}>실시간 데이터 동기화 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:'0 1.5rem 3rem', color:'var(--text-primary)', minHeight:'100vh', fontFamily:"'Inter',sans-serif", backgroundColor: 'var(--bg-color)' }}>

      

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom:'2rem', paddingTop: '2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'#b45309', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 4px 12px rgba(180,83,9,0.3)' }}>
              <Hexagon size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'2rem', fontWeight:800, letterSpacing:'-0.5px', color:'var(--text-primary)' }}>
                코코아 글로벌 인텔리전스
              </h1>
              <p style={{ margin:'4px 0 0 0', fontSize:'0.9rem', color:'var(--text-secondary)' }}>글로벌 밸류체인 전략 인사이트 커맨드 센터</p>
            </div>
          </div>
          <div style={{ fontSize:'0.85rem', padding:'0.5rem 1.2rem', background:'#282828', borderRadius:'20px', color:'var(--text-secondary)', fontWeight: 600 }}>
            <span style={{ color:'#b45309' }}>2026 글로벌 시장</span> · 소싱 · 가공 허브 · 무역 넥서스 · 지속가능성
          </div>
        </div>
      </header>

      {/* ═══ 9-Network Live Status Monitor & SCSI ═══ */}
      <div style={{
        background: '#181818',
        border: '1px solid #282828',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
          
          {/* Left: 9 Networks Status */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#b45309', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', width: '16px', height: '16px', backgroundColor: '#b45309', borderRadius: '50%', opacity: 0.4, animation: 'pulse 2s infinite' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                실시간 커맨드 센터 <span style={{ color: '#b45309', fontWeight: 600, fontSize: '0.85rem', marginLeft: '6px' }}>동기화 중</span>
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { name: 'KCS API', desc: '관세청 수입', status: 'live' },
                { name: 'KAMIS API', desc: '도매물가', status: 'live' },
                { name: 'DART API', desc: '기업공시', status: 'live' },
                { name: 'MFDS API', desc: '수입식품검역', status: 'live' },
                { name: 'ICCO / ICE', desc: '선물가', status: 'live' },
                { name: 'USDA FAS', desc: '산지작황', status: 'live' },
                { name: 'FAOSTAT', desc: 'UN 농축산', status: 'live' },
                { name: 'World Bank', desc: '거시경제', status: 'live' },
                { name: 'JRC / EFI', desc: '산림규제', status: 'live' }
              ].map((net, i) => (
                <div key={i} style={{ 
                  background: '#282828', borderRadius: '16px', 
                  padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' 
                }}>
                  <Database size={12} color="#b45309" />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>{net.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{net.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: SCSI Index */}
          <div style={{ 
            minWidth: '220px', 
            background: '#282828', 
            borderRadius: '8px', 
            padding: '1rem',
            textAlign: 'center',
            boxShadow: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Activity size={16} color="var(--color-danger)" />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-danger)', letterSpacing: '1px' }}>코코아 스트레스 지수</div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '4px' }}>
              <CountUp end={83} duration={2} />
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}> / 100</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 600 }}>신라 코코아 공급망 리스크</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '6px' }}>마지막 갱신: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'1rem', marginBottom:'2rem' }}>
        {Object.keys(COCOA_KPIS).map((key, idx) => {
          const kpi = COCOA_KPIS[key]; const t = KPI_THEMES[idx % KPI_THEMES.length]; const I = t.icon;
          return (
            <div key={key} style={{ background:'#181818', borderRadius:'8px', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'6px', transition:'all 0.3s', cursor:'default', position:'relative', overflow:'hidden' }}>
              
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)', fontWeight:600 }}>{kpi.title}</span>
                <I size={16} style={{ color:t.text }} />
              </div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--text-primary)', margin: '4px 0' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)', fontWeight:500, lineHeight: 1.4 }}>
                <span style={{ background:'#282828', padding:'2px 6px', borderRadius:'12px', marginRight:'6px', color: '#b45309', fontSize: '0.65rem', fontWeight: 700 }}>{kpi.trend}</span>{kpi.desc}
              </div>
              {kpi.source && (
                <div style={{ marginTop:'8px', display:'flex', alignItems:'center', gap:'4px' }}>
                  <span style={{ fontSize:'0.65rem', color:'#b45309', background:'rgba(180, 83, 9, 0.1)', padding:'2px 6px', borderRadius:'12px', fontWeight: 600 }}>
                    {kpi.source}
                  </span>
                </div>
              )}
            </div>
          );
        })}
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
      {/* Part 1: Raw Material */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
        <div style={{ width:'4px', height:'28px', background: SECTIONS[0].color, borderRadius: '4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[0].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        <WidgetCard title="기후 위기와 서아프리카 원두 생산 충격 (단위: 톤)" icon={CloudRain} iconColor="#b45309" pillar="S1"
          cardDesc="가나·코트디부아르 생산량 vs CSSVD 감염률 — 구조적 회복 5~10년"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w1_production_climate}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="year" {...xAxisTextProps} />
              <YAxis yAxisId="left" {...yAxisProps} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="IvoryCoast" stackId="a" fill="#78350f" name="코트디부아르 생산량" />
              <Bar yAxisId="left" dataKey="Ghana" stackId="a" fill="#92400e" name="가나 생산량" />
              <Line yAxisId="right" type="monotone" dataKey="CSSVD_Infection_Rate" stroke="var(--color-danger)" strokeWidth={3} dot={{r:4}} name="CSSVD 감염률(%, RHS)" />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"CSSVD(Cocoa Swollen Shoot Virus Disease, 코코아 부풀음 바이러스병)"란 가루이(mealybug)가 매개하는 바이러스성 식물 전염병. 감염된 카카오 나무는 2~3년 내 수확량이 90% 이상 급락하고 영구 고사 — 치료법 없음, 유일한 대책이 감염 나무 전체 벌목·재식. 카카오 나무는 식재 후 4~6년이 지나야 첫 수확이라 회복 리드타임이 본질적으로 5~10년.</p>
                <p>실측: <strong>가나 2023/24 생산량 58~60만 톤으로 15년 만의 최저 (정점 대비 -38%). 웨스턴 노스주(서부 신생산지) 재배면적의 81%가 CSSVD 감염 → 가나 전체 생산 base의 1/3이 향후 5년 내 영구 손실</strong>. 단순 흉작이 아닌 supply base 자체의 구조적 붕괴.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 서아프리카(코트디부아르·가나) 의존은 "역사적 관행"이 아닌 <strong>"향후 10년 capa의 30%가 영구 사라지는 것이 확정된 sinking ship에 long position"</strong>. 자본 시장은 이미 알고 valuation에 반영 중.</p>
                <p><strong>3단계</strong>: ① 포트폴리오 F&B vendor의 서아프리카 원물 비중 75% → 50%로 18개월 내 강제 하향 ② 에콰도르(60만톤·CCN-51 품종 병해 저항성)·페루·브라질·인도네시아 sourcing 라인 동시 신설 — "Origin Diversification" 자체를 vendor DD score 항목으로 표준화 ③ 기후 스마트 농업(CSA) 기술 vendor(IBM Watson Agronomy, Climate Corp 등)에 그로스 캐피탈 투자 — 향후 가나·코트디부아르 재식 사이클이 본격화될 때 R&D 라이센서 포지션 선점, valuation +12~15x 잠재력.</p>
              </div>
            ),
            source: "FAOSTAT QCL 2018-2024 (CI/GH) · EFI 코코아 인사이트 2025-03 · ICCO CSSVD 보고서",
          }} />

        <WidgetCard title="코코아 원두 선물 가격 패닉 바잉 (USD/MT)" icon={TrendingUp} iconColor="#b45309" pillar="S4"
          cardDesc="ICE 선물 실거래가·전망가·추세선 — $12K → $3.7K 극단적 변동성"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <AreaChart data={processedPriceData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.1}/></linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#78350f" stopOpacity={0.8}/><stop offset="95%" stopColor="#78350f" stopOpacity={0.1}/></linearGradient>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/><stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/></linearGradient>
              </defs>
              {grid}
              <XAxis dataKey="month" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="PriceHist" stroke="var(--color-danger)" fill="url(#colorPrice)" strokeWidth={2} name="실거래가($/MT)" />
              <Area type="monotone" dataKey="PriceForecast" stroke="#78350f" fill="url(#colorForecast)" strokeWidth={2} strokeDasharray="5 5" name="전망가(Forecast)" />
              <Area type="monotone" dataKey="Trend" stroke="#f97316" fill="url(#colorTrend)" strokeWidth={2} name="추세 전망선" strokeDasharray="3 3" />
            </AreaChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"숏 스퀴즈(Short Squeeze)"란 가격 하락에 베팅한 short 포지션 투자자들이 가격 급등 시 강제 청산되며 그 자체가 추가 매수 압력으로 작용하는 자기실현적 폭등 현상. ICE 코코아 선물은 2024-04에 14년만의 supply 부족이 명백해지면서 헤지펀드 short 포지션 일제 청산 → $4,000 → $12,000 (+200%) 5개월 폭등 → 이후 마진콜 대량 발생 → 2026 초 $3,765 폭락 (-69%).</p>
                <p>실측: <strong>2024-04 ICE 정점 $12,000/MT (역사적 최고) → 2026-01 $3,765 (-69%) 폭락. 같은 24개월에 +200% / -69% 양방향 폭격 → 글로벌 grinder·trader 중 30%가 working capital 위기, 5% 도산</strong>. vendor는 commodity 사업이 아닌 사실상 선물 trader.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 가격 변동성은 일반 vendor에게는 risk이나 <strong>"distressed M&A 자본을 들고 있는 PE에게는 일생일대의 acquisition window"</strong>. 시장 패닉 = 우리의 매입 기회.</p>
                <p><strong>3단계</strong>: ① 한국·아시아 코코아 가공·무역 vendor 5~8곳의 working capital·DSO·재고회전일수 실시간 트래킹 → 디스트레스드 시그널 포착 시 즉시 LOI 제안 ② 피투자사 의무화: <strong>"Rolling Hedge"</strong>(6·12·18개월 layered futures hedge) + JIC(Just-in-Case 재고 75일+) — 다음 사이클에서는 우리만 안정 마진 ③ ICE 옵션·스왑·CMA(Commodity Master Agreement) 활용 derivatives desk 자체 운영 — vendor 매입 hedge가 새로운 수익원, "PEF + commodity desk"라는 hybrid valuation premium +2.5x.</p>
              </div>
            ),
            source: "ICE Cocoa Futures · ICCO Daily Price · World Bank Commodity Index (2022~2026)",
          }} />

        <WidgetCard title="글로벌 시장가 대비 현지 농가 수매가 디커플링 (USD/MT)" icon={Scale} iconColor="#b45309" pillar="S4"
          cardDesc="글로벌 선물가 vs 가나 농가 수매가 + Cedi/USD 환율 — 밀수 트리거"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w11_farmer_decoupling}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="quarter" {...xAxisTextProps} />
              <YAxis yAxisId="left" {...yAxisProps} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Line yAxisId="left" type="monotone" dataKey="globalPrice" stroke="var(--color-danger)" strokeWidth={3} dot={{r: 4}} name="글로벌 선물 가격($)" />
              <Bar yAxisId="right" dataKey="farmerPrice" fill="var(--color-info)" name="가나 농가 수매가(환산$)" barSize={35} />
              <Line yAxisId="right" type="monotone" dataKey="FX_Cedi_USD" stroke="#b45309" strokeWidth={2} name="환율(Cedi/USD, RHS)" strokeDasharray="3 3" />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"COCOBOD(Ghana Cocoa Board)"란 가나 국가가 운영하는 국영 카카오 단일 구매·수출 기관. 농가 수매가는 정부 산식(FOB 가격의 70%)에 묶여 있어 글로벌 시장가가 폭등해도 국내 농가는 그 혜택을 못 받는 구조. 이 디커플링이 임계점을 넘으면 농가는 가격이 더 높은 인접국(코트디부아르·토고·부르키나)으로 <strong>cross-border smuggling</strong>을 강행 — supply chain 자체가 grey market으로 이동.</p>
                <p>실측: <strong>2025-10 가나 농가 수매가 58,000세디/MT (FOB의 70% = 약 $3,600/MT) vs 동기 ICE 시장가 한때 $10,000+ → 농가 입장에서는 글로벌가의 36%만 받는 셈. 2023/24 시즌 가나 국경 외 유출 추정량 16만 톤(가나 총 생산의 27%). COCOBOD 유동성 위기로 농가 대금 지급 평균 90일 지연</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: COCOBOD 디커플링은 risk가 아닌 <strong>"국가 통제 시스템의 cracks를 PE 자본으로 메우면서 농가·LBC와 직접 자본 관계를 lock-in할 sovereign arbitrage 기회"</strong>. 가나가 못 주는 자본을 우리가 빌려주면 우선 수매권이 따라옴.</p>
                <p><strong>3단계</strong>: ① 가나 LBC(Licensed Buying Company) 상위 5곳에 <strong>trade finance + working capital line</strong> 직접 제공 (총 $30~50M, 금리 15%·우선 수매권 조건) — 농가 대금 지급 즉시화·우리는 정상가 +18%p 매입 차익 ② 농가와 직접 <strong>"평년가 lock LTA + ESG·트레이서빌리티 인증 패키지"</strong> 체결 — 농가에는 안정 수입 + 인증 컨설팅, 우리에는 grey-market-free 인증 원두 lock-in ③ COCOBOD 자체와는 PPP(Public-Private Partnership) 협상으로 농가 직거래를 정식 합법화 — sovereign risk 우회를 정부 공식 협력 모델로 전환.</p>
              </div>
            ),
            source: "가나 COCOBOD 공시 + ICE 선물거래소 + EFI 코코아 인사이트 2025 + IMF 가나 sovereign 분석",
          }} />

      </div>

      {/* 🆕 USDA FAS — 코트디부아르·가나 코코아 생산 (S1 원료 수급) */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginTop:'1.5rem' }}>
        <CocoaUsdaWidgets filterPillar="S1" />
      </div>

      </>)}
      {activePart === 'S2' && (<>
      {/* Part 2: Processing */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background: SECTIONS[1].color, borderRadius: '4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[1].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        <WidgetCard title="글로벌 가공 허브 포트폴리오 (점유율 %)" icon={Factory} iconColor="#b45309" pillar="S2"
          cardDesc="유럽 35.8% · 아프리카 22.9% · 아시아 22.2% — 가공 허브 동향 추적"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <PieChart>
              <Pie data={cocoaData.w3_processing_hubs} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {cocoaData.w3_processing_hubs.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
            </PieChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"Origin Grinding(원산지 가공)"이란 카카오 원두를 생산국 또는 인접 지역에서 1차 가공(리쿼·버터·파우더)해 부가가치를 현지에 정착시키는 산업 정책. 코트디부아르·가나·인도네시아가 정부 차원에서 강력 추진 — 향후 10년 글로벌 가공 capa의 무게 중심이 유럽 → 아시아·아프리카로 이동하는 정해진 미래.</p>
                <p>실측: <strong>2023/24 글로벌 가공 점유율: 유럽 35.8% (171만톤) → 아프리카 22.9% / 아시아 22.2%로 추격. 인도네시아 단독 가공 파생품 수출 38.6만 톤 (원두 수출국에서 가공국으로 전환). 향후 5년 유럽 점유율 → 28% 예상, 아시아 28%+ 예상</strong>. supply chain의 geographic axis가 영구 이동 중.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 유럽 가공 vendor 투자는 "안전한 historical winner" 추종이 아닌 <strong>"피크 시장에 늦은 entry"</strong>. 아시아·서아프리카 가공 인프라가 향후 10년 alpha의 원천.</p>
                <p><strong>3단계</strong>: ① 인도네시아(자카르타·수라바야)·말레이시아(말라카)·코트디부아르(아비장) 가공 vendor 5~10곳 매핑 → 우량 자산 2~3곳 PE 공동 투자 또는 majority acquisition ② 아시아 역내 가공 vendor roll-up 전략 — 인도네시아·말레이·베트남·인도 가공사 5~7곳 통합 후 "아시아 통합 vendor"로 자본 시장 IPO 또는 strategic exit ③ 유럽 의존 F&B 포트폴리오는 점진적 hedge — 아시아 가공품 비중을 18%까지 단계 확대, 매년 +6%p씩 rotate.</p>
              </div>
            ),
            source: "ICCO Quarterly Bulletin + UN Comtrade HS 1801-1806 (2020~2026)",
          }} />

        <WidgetCard title="파생품 마진 스프레드 (거래량 지수, 프리미엄 %)" icon={Scale} iconColor="#d97706" pillar="S2"
          cardDesc="버터·파우더 등 파생품별 거래량 + 부가가치 마진율 비교"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w4_derivative_spread}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="type" {...xAxisTextProps} />
              <YAxis yAxisId="left" {...yAxisProps} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} tickFormatter={(v) => `${v}%`} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="volume" fill="#d97706" name="수입 거래량 비중" barSize={40} />
              <Line yAxisId="right" type="monotone" dataKey="margin" stroke="var(--color-warning)" strokeWidth={3} dot={{r:5}} name="원물 대비 부가가치 마진율(Premium)" />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"버터·파우더 비율(Butter/Powder Ratio)"이란 카카오 원두 1톤을 가공할 때 나오는 버터(코코아 버터, 55%)와 파우더(45%)의 시장가 비율 — grinder vendor의 마진을 결정짓는 핵심 KPI. 두 파생품은 시장이 분리되어 있어 동시 상승/하락이 아닌 비대칭 변동. 한쪽이 폭등할 때 다른 한쪽이 정체하면 grinder의 마진 구조 자체가 뒤틀림.</p>
                <p>실측: <strong>2024 코코아 버터 $15,000~$16,000/MT 사상 최고 (전년 대비 +180%) vs 파우더 $4,500/MT (+45%). 통상 Butter/Powder Ratio 2.5~3.0 → 2024 3.4~3.6으로 비정상 wide spread → 버터 의존 vendor(고급 초콜릿) 마진 +28%p / 파우더 의존 vendor(베이커리·음료) 마진 -12%p</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 파생품 스프레드는 "고정된 산업 구조"가 아닌 <strong>"butter/powder ratio arbitrage가 grinder vendor의 진짜 alpha — derivatives desk를 운영하는 vendor만 winner"</strong>.</p>
                <p><strong>3단계</strong>: ① 포트폴리오 grinder 대상 평가 기준 변경: <strong>"butter/powder ratio 변동에 대응한 가공 mix 조정 역량"</strong>을 vendor DD score 1순위로 ② 베이커리·음료 B2B captive 채널 보유 grinder를 우선 매수 — 파우더 수요 강한 시기에 캡티브로 매출 lock-in, 변동성 hedge ③ ICE Butter·Powder 선물 동시 운영 derivatives desk 자체 구축 — ratio 3.4 이상에서는 buttera short / powder long pair trade, 분기당 +8~12%p 알파.</p>
              </div>
            ),
            source: "Bloomberg Commodity + ICE Cocoa Futures + ICCO Quarterly Bulletin",
          }} />

        <WidgetCard title="실사 기반 가공 공장 인수합병 타겟" icon={Landmark} iconColor="#b45309" pillar="S2"
          cardDesc="X: 자본적 지출(CAPEX) 매력도, Y: 수율, Z: 가공 생산능력(Capa) — 디스트레스드 인수합병(M&A) 매트릭스"
          telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              {grid}
              <XAxis type="number" dataKey="capex" name="CAPEX 매력도" {...xAxisTextProps} />
              <YAxis type="number" dataKey="yield" name="가공 인프라 점수" {...yAxisProps} />
              <ZAxis type="number" dataKey="capacity" range={[200, 1500]} name="가공 생산능력(천톤)" />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              {cocoaData.w14_mna_radar.map((entry: any, index: number) => (
                <Scatter key={`scatter-${index}`} name={entry.target} data={[entry]} fill={entry.fill} />
              ))}
            </ScatterChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"Opportunistic M&A(기회주의적 인수)"란 시장 디스트레스 국면에 우량 자산을 평년가 -40~-60% 할인 가격에 매수하는 PE 전략. 2024~2026 서아프리카 카카오 산업은 ICE 변동성 + COCOBOD 체불 + EUDR compliance cost 3중 압박으로 영세 가공 vendor 줄도산 — 그러나 가공 license·HACCP·설비는 그대로 시장에 남아 distressed asset로 떠오름.</p>
                <p>실측: <strong>가나 영세 grinder·LBC 도산률 2023 5% → 2025 18% (3.6배). 동시에 글로벌 자본 등에 업은 Niche Cocoa(연 6만톤)·CPC(연 6.4만톤) 등은 M&A·JV 타겟으로 가치 +35% 상승 — 시장 양극화 심화. 평년가 $25M의 가공 라인을 distress 매물로 $9~12M 매수 가능</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 서아프리카 디스트레스는 risk가 아닌 <strong>"PEF 자본을 들고 진입할 때 valuation arbitrage가 영구 lock-in되는 once-in-a-decade window"</strong>. 다음 사이클에서는 이 가격에 절대 못 삼.</p>
                <p><strong>3단계</strong>: ① 가나·코트디부아르 가공 vendor 20곳 financial health 실시간 트래킹 → 부채비율 200%+·DSO 90일+ vendor를 LOI 리스트 ② <strong>국영 CPC 유휴 라인을 M&A + 민간 Niche Cocoa와 JV 동시</strong> 진행 — 국영 자산은 capex 투자로 가동률 35% → 85% 끌어올림, 민간 JV는 즉시 capa 활용 ③ 인수 후 한국 제과 3사 (롯데·오리온·해태) 스펙 맞춤 origin liquor 직생산 — 매입원가 -22%p 절감 + valuation 8x→12x 리레이팅 가능.</p>
              </div>
            ),
            source: "Silla Co. 내부 실사 DB + COCOBOD 연례 보고서 + Niche Cocoa IR + KOTRA 가나 시장조사",
          }} />

        <WidgetCard title="코코아 선물 커브 구조 및 백워데이션 전환 지표 (USD/MT)" icon={TrendingUp} iconColor="#b45309" pillar="S4"
          cardDesc="2024·2025·2026년 선물 가격 커브 — 백워데이션 → 콘탱고 전환 시그널"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <LineChart data={cocoaData.w21_futures_curve_structure}>
              {grid}
              <XAxis dataKey="contract" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="Price2024" stroke="var(--color-danger)" strokeWidth={3} name="2024년 가격" />
              <Line type="monotone" dataKey="Price2025" stroke="#f97316" strokeWidth={2} strokeDasharray="3 3" name="2025년 가격" />
              <Line type="monotone" dataKey="Price2026" stroke="#3b82f6" strokeWidth={2} name="2026년 가격 (LIVE)" />
            </LineChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"백워데이션(Backwardation)"이란 근월물(가까운 만기) 가격이 원월물(먼 만기)보다 비싼 비정상 선물 커브 — 시장이 "지금 당장" 공급 부족을 느낀다는 신호. 반대 <strong>"콘탱고(Contango)"</strong>는 원월물이 더 비싼 정상 커브 — supply 안정·storage cost 반영. 커브 형상은 vendor의 hedging 전략을 완전히 뒤집는 변수.</p>
                <p>실측: <strong>2023-Q4~2024-Q3 ICE 코코아 강력 백워데이션 (근월물 $11,200 vs 6개월 원월물 $8,400, -25% wide spread). 2025-Q4부터 콘탱고 전환 조짐 (근월물 $4,200 vs 6개월 원월물 $4,650, +11%). 시장 정상화 진입 = 6~12개월 선물 lock-in 골든 윈도우 진입</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 선물 커브 전환은 단순 가격 변동이 아닌 <strong>"vendor가 hedging mode를 정반대로 뒤집어야 하는 paradigm shift signal"</strong>. 뒤늦게 알면 한 사이클 분 마진이 sub-optimal.</p>
                <p><strong>3단계</strong>: ① ICE 선물 커브 매일 자동 트래킹 + 임계 spread (±5%) 알림 시스템 ② <strong>백워데이션 국면</strong>: 현물 비축 -30% 축소 + rolling hedge 6개월 단위로 단기 hedge 운영, working capital 효율 우선 ③ <strong>콘탱고 전환 후</strong>: 12~24개월 장기 선물 계약 즉시 lock-in — 가격 +18%p 매입원가 절감 + 분기 P&L 변동성 ±2% 이내 안정화, exit 시점 EBITDA 가시성 확보로 valuation +1.5x premium.</p>
              </div>
            ),
            source: "ICE Cocoa Futures Curve (실시간 모니터링) + CFTC COT 보고서 + Bloomberg Commodity",
          }} />

      </div>

      {/* 🆕 USDA FAS — 코트디부아르 국내 가공률 정책 (S2 가공·생산) */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginTop:'1.5rem' }}>
        <CocoaUsdaWidgets filterPillar="S2" />
      </div>

      </>)}
      {activePart === 'S3' && (<>
      {/* Part 3: Logistics */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background: SECTIONS[2].color, borderRadius: '4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[2].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        
        <WidgetCard title="가나 현지 가공 인프라 디스트레스 차익거래 (천톤, %)" icon={TrendingUp} iconColor="#78350f" pillar="S3"
          cardDesc="CPC vs Niche Cocoa 등 가나 가공 인프라 가동률 + 무가공 원물 수출비율"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w15_ghana_distressed}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
              <XAxis dataKey="year" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="left" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="Capacity" name="가공 생산능력" fill="rgba(139,92,246,0.2)" stroke="#78350f" />
              <Bar yAxisId="left" dataKey="Utilization" name="실제 가동량" fill="var(--color-danger)" />
              <Line yAxisId="right" type="monotone" dataKey="ExportRatio" name="무가공 원물 수출비율(%)" stroke="#d97706" strokeWidth={2} />
              <ReferenceLine x="2024" stroke="var(--color-warning)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'COCOBOD 구조조정', fill: 'var(--color-warning)', fontSize: 10 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"가공 인프라 양극화(Processing Infrastructure Polarization)"란 한 국가 안에서 국영 vs 민간/외국계 가공 vendor가 자본·기술 격차로 완전히 분리되는 현상. 가나 가공 capa는 사실상 두 시장 — 국영 CPC(6.4만톤 capa, 가동률 35%)는 노후·자금난으로 sinking, 민간 Niche Cocoa(6만톤)·Touton(2.5만톤)은 HACCP·UTZ·Rainforest Alliance 인증으로 글로벌 buyer에 직접 납품.</p>
                <p>실측: <strong>CPC capa 6.4만톤 / 실가동 2.2만톤 (가동률 35%) → 유휴 capa 4.2만톤이 distress 매물. Niche Cocoa는 capa 100% + 5년 LTA 보유 → 가치 +185% 상승. 한 도시 내 vendor 가치 격차 12배</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 가나 가공 인프라는 "국가 산업"이 아닌 <strong>"PE 자본 + 한국 제과 3사 captive demand를 결합하면 distress 매수 → 즉시 turnaround → exit 12x valuation으로 회전 가능한 자산"</strong>.</p>
                <p><strong>3단계</strong>: ① CPC 유휴 라인을 정부 협력 PPP 형태로 인수 또는 30년 운영권 확보 (가나 정부에는 가공 GDP·고용 회복, 우리에는 distress 가격) ② capex $40~60M 투입 — 노후 설비 교체 + HACCP·EUDR·USDA Organic 3중 인증 획득, 가동률 35% → 85% ③ 롯데·오리온·해태와 5년 captive supply LTA — 매입원가 -18%p + EUDR compliance 외주 cost 흡수, 5년 후 exit 시 한국 제과 3사 IR 자료에 등재되는 strategic asset valuation +12x.</p>
              </div>
            ),
            source: "COCOBOD 연례 보고서 + Ghana Cocoa Processing Company (CPC) + Niche Cocoa IR",
          }} />

        <WidgetCard title="한국의 이중 수입 넥서스 흐름도" icon={Anchor} iconColor="#b45309" pillar="S3"
          cardDesc="가나 원두 80% 편중 + 네덜란드/말레이시아 우회 가공품 — Sankey 다이어그램"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <Sankey data={cocoaData.w5_sankey_nexus} node={renderSankeyNode}
              link={{ stroke: '#b45309', strokeOpacity: 0.3 }} margin={{ left: 20, right: 80, top: 20, bottom: 20 }}>
              <RechartsTooltip content={<CustomTooltip />} />
            </Sankey>
          }
          takeaway={{
            situation: (
              <div>
                <p>"이중 수입 구조(Dual Import Nexus)"란 한 국가가 동일 commodity를 두 경로로 수입하는 비효율적 무역 구조. 한국 코코아는 원두는 가나 직수입(저관세), 가공품(버터·매스·파우더)은 네덜란드·말레이시아 가공 허브를 우회해 수입(고관세 + 중간 마진 추가). 1차 가공 단계 vendor가 한국 내 없어 중간 마진을 외국 vendor에 자동 헌납하는 구조.</p>
                <p>실측: <strong>2025 한국 코코아 원두 수입 $5,870만 중 가나산 80% ($47M). 동시에 가공품(버터·매스) 수입 $1.2억은 네덜란드(34%)·말레이시아(28%) 등 제3국 가공 허브 경유. 우리가 가나 원두를 사서 → 네덜란드로 보내고 → 가공된 버터를 다시 수입하는 detour</strong>. 중간 마진 18~25%를 통째로 외국 vendor에 헌납.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 이중 수입 구조는 "산업 관행"이 아닌 <strong>"한국 가공 capa를 만들면 즉시 $25M+ 중간 마진을 내재화할 수 있는 vertical integration 기회"</strong>.</p>
                <p><strong>3단계</strong>: ① 가나 1차 가공 vendor 1~2곳을 bolt-on M&A → 원두 → 리쿼·버터 변환 단계 한국 vendor가 직접 통제 ② 한국 평택·인천 보세창고에 2차 가공·소포장 라인 신설 — 네덜란드 우회 → 한국 직배송으로 cycle time 28일 → 12일 단축 ③ 롯데웰푸드·오리온·해태제과 + B2B 베이커리·카페 5대 채널과 <strong>"가나 원산지 직접 가공 + 한국 vendor 인증"</strong> 패키지로 5년 LTA — 중간 마진 +22%p 매출 추가 + 한국 industry champion 포지셔닝.</p>
              </div>
            ),
            source: "관세청 OpenAPI HS 1801-1806 + UN Comtrade + 롯데웰푸드·오리온 IR",
          }} />

        <WidgetCard title="공급 충격 시나리오: 재고 소진율 트래커" icon={Shield} iconColor="#d97706" pillar="S2"
          cardDesc="재고회전일수(DIO) + 공장 가동 중단 임계선 + 경쟁사 영업이익률(OPM) 동향"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w6_inventory_burn_rate}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="timeline" {...xAxisTextProps} />
              <YAxis yAxisId="left" {...yAxisProps} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
              <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="재고회전일수(DIO)" fill="#d97706" name="현재 보유 재고일수(DIO)" barSize={40}>
                {cocoaData.w6_inventory_burn_rate && cocoaData.w6_inventory_burn_rate.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry["재고회전일수(DIO)"] < 30 ? "var(--color-danger)" : "#d97706"} />
                ))}
              </Bar>
              <Line yAxisId="left" type="step" dataKey="CriticalLine" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="3 3" name="공장 가동 중단(Red Alert) 기준선" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="CompetitorMargin" stroke="var(--color-warning)" strokeWidth={3} name="경쟁사 영업이익률(OPM) 하락(DART API)" dot={{ r: 5 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"Stocks-to-Grindings(재고/분쇄 비율)"이란 글로벌 코코아 재고가 연간 가공 수요의 몇 %를 커버하는지 보여주는 supply tightness 지표. 정상 40~45%·40% 이하부터 공급 불안·30% 이하는 결정적 부족 신호. 동시에 vendor는 <strong>JIT(Just-in-Time, 적시생산) → JIC(Just-in-Case, 안전재고) 전환</strong> 필요 — working capital 부담이 두 배.</p>
                <p>실측: <strong>2023/24 글로벌 Stocks-to-Grindings 26.4% (46년 만의 최저). ICE 인증 재고 11.8만 톤 (19년 최저). 글로벌 grinder DIO 평균 65일 → 110일 (+69%) → NWC $80M+ 추가 lock-in</strong>. 재고 보유 자체가 vendor 생존 cost.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 재고 부족은 vendor의 단순 risk가 아닌 <strong>"crediting 자산을 들고 있는 PE 자본이 grinder vendor의 재고 금융을 제공하면 단순 매수자 → strategic creditor로 포지션 격상"</strong>.</p>
                <p><strong>3단계</strong>: ① 한국·아시아 grinder·trader 대상 <strong>Inventory Financing 솔루션</strong> 제공 (재고 가치의 60% LTV, 금리 SOFR+450bp) — 우리는 senior secured 담보권 + 우선 매수권 ② 잉여 재고 확보한 한국 상사(삼양사·CJ제일제당 등)에 단기 프리미엄 매각 컨설팅 → special dividend 재원 → 우리는 fee income ③ ICE 인증 재고 데이터 실시간 트래킹 → 임계 (10만톤 이하) 돌파 시 자체 보세창고에 안전재고 추가 비축 5,000톤+ — 다음 사이클 price spike 시 +28%p arbitrage 마진.</p>
              </div>
            ),
            source: "ICCO Quarterly Bulletin + ICE 인증 재고 데이터 + DART 한국 식품 vendor 공시",
          }} />

        <WidgetCard title="허브 경유에 따른 EUDR 그린 프리미엄 원가 전가" icon={Anchor} iconColor="#b45309" pillar="S3"
          cardDesc="EUDR 컴플라이언스 텍스 + 해상 물류비 + 원물 가격 — 그린 프리미엄 누적"
          telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <BarChart data={cocoaData.w12_green_premium}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="route" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar dataKey="BaseCost" stackId="a" fill="#64748b" name="순수 원물 가격" barSize={40} />
              <Bar dataKey="Logistics" stackId="a" fill="var(--color-info)" name="해상 물류비" />
              <Bar dataKey="EudrTax" stackId="a" fill="#b45309" name="유럽연합 산림벌채 규정(EUDR) 준수 비용" />
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"EUDR(EU Deforestation Regulation, EU 산림훼손 방지 규정)"이란 2024년 시행된 EU 규제로 코코아·팜유·콩·소·고무·목재·커피 7개 commodity를 EU에 수출/유통하려면 vendor가 산림 훼손 무관(deforestation-free) 입증 + 지오로케이션(GPS) 단위 traceability + due diligence statement 제출 의무. EUDR 미준수 = EU 매출의 4% 벌금 + 시장 퇴출.</p>
                <p>실측: <strong>EUDR 준수 인증 원두 그린 프리미엄 $250~400/MT (5~12% 상승). 롯데웰푸드 2025-Q1 영업이익 -35.6% YoY 급락 (코코아 매입원가 폭등 + EUDR compliance cost 합산). 한국 제과 3사 매입원가 전가율 평균 32%에 그쳐 marginal 마진 -8~12%p 압박</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: EUDR 그린 프리미엄은 cost가 아닌 <strong>"브랜드 파워가 약한 vendor를 자연 도태시키고 강한 vendor에게 가격 결정력을 몰아주는 시장 cleanup catalyst"</strong>. 견딜 수 있는 vendor만 살아남음.</p>
                <p><strong>3단계</strong>: ① 포트폴리오 vendor DD 기준 변경: <strong>"그린 프리미엄 cost 전가 가능 능력"</strong>(브랜드 파워·시장 지배력·SKU mix)을 valuation 1순위 ② 매스 마켓 브랜드는 점진 hedge하고 <strong>다크 초콜릿·프리미엄 라인업</strong>(가격 저항 낮은 segment) vendor 비중 60%+로 reframe ③ 자체 EUDR Due Diligence Platform 구축 (Trase.earth + GPS 트래킹 + AI 위성 영상 분석) → 한국 vendor에 SaaS 형태 라이센싱 → 신규 수익 라인 + ESG 점수 동시 lift, exit 시 "EUDR-ready vendor" valuation premium +1.8x.</p>
              </div>
            ),
            source: "EU 집행위(EC) EUDR 규정 + 롯데웰푸드 IR 2025-Q1 + Trase.earth EUDR DD 데이터",
          }} />

      </div>

      </>)}
      {activePart === 'S4' && (<>
      {/* Part 4: Sales & Demand */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background: SECTIONS[3].color, borderRadius: '4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[3].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        
        <WidgetCard title="기업간(B2B) 코코아 대체유(CBE) 벤더 롤업 가치 평가" icon={Scale} iconColor="#d97706" pillar="S2"
          cardDesc="대체유 벤더의 시장대응력 vs EBITDA(세전·이자·감가상각비 차감 전 이익) vs 원가부담 — 롤업 매수 매트릭스"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
              <XAxis type="number" dataKey="Agility" name="시장대응력(Agility)" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <YAxis type="number" dataKey="EBITDA(세전·이자·감가상각비 차감 전 이익)" name="EBITDA(세전·이자·감가상각비 차감 전 이익)(%)" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <ZAxis type="number" dataKey="CostBurden" range={[60, 400]} name="원가부담" />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              {cocoaData.w16_cbe_rollup.map((entry: any, index: number) => (
                <Scatter key={`scatter-${index}`} name={entry.category} data={[entry]} fill={index === 2 ? '#d97706' : '#78350f'} />
              ))}
            </ScatterChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"CBE(Cocoa Butter Equivalent, 코코아 버터 동등재)·CBS(Cocoa Butter Substitute, 대체재)"란 팔유·시어버터·일립버터 등 식물성 유지를 분획·정제해 코코아 버터와 유사한 융점·결정 특성을 구현한 raw material. EU 표준은 CBE 함량 최대 5%까지 "초콜릿" 표기 가능. 코코아 버터가 $15,000+ 영역에 들어가면 CBE 사용은 선택이 아닌 생존 필수.</p>
                <p>실측: <strong>2024 글로벌 CBE 사용 비율 평균 3.2% → 2026E 4.5% (+40% 성장). 한국 제과사 평균 CBE 사용량 1.8% → 4.2% (2년 만에 2.3배). 코코아 버터 대비 CBE 단가는 1/3 수준 ($4,500/MT vs $15,000) → 매입원가 -38%p 절감 가능</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: CBE 시장은 "임시 대체재"가 아닌 <strong>"카카오 cycle volatility hedging의 영구 instrument로 자리잡을 $4B 시장"</strong>. 지금 vendor roll-up하면 5년 후 시장의 절대 강자.</p>
                <p><strong>3단계</strong>: ① 동남아(말레이·인도네시아) 팔유 정제 vendor + 서아프리카 시어버터 vendor 5~8곳 매핑 → 3~4곳 majority M&A로 글로벌 CBE roll-up (총 $80~120M deal value 추정) ② B2B 식품소재 포트폴리오에 CBE R&D 라인 신설 — 한국 제과 3사 captive supply 5년 LTA ③ valuation 전략: 단순 raw material vendor PE 5x → CBE 통합 R&D + 글로벌 supply chain vendor PE 12x로 카테고리 전환 - exit 시 EV +135% premium 가능.</p>
              </div>
            ),
            source: "Krungsri Research 팔유 산업 전망 + 식약처 식품원료 통계 + Silla Co. 내부 CBE 모델",
          }} />

        <WidgetCard title="대체 공급처 발굴 수익성 분석 (물류비·원물가·공급량)" icon={Target} iconColor="#b45309" pillar="S1"
          cardDesc="에콰도르·브라질 등 남미 산지 대안 — 다변화 펀드 매트릭스"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              {grid}
              <XAxis type="number" dataKey="cost" name="물류비($)" {...xAxisTextProps} />
              <YAxis type="number" dataKey="price" name="원물가($)" {...yAxisProps} />
              <ZAxis type="number" dataKey="volume" range={[60, 400]} name="조달 가능량" />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              {cocoaData.w7_sourcing_scatter.map((entry: any, index: number) => (
                <Scatter key={`scatter-${index}`} name={entry.country} data={[entry]} fill={entry.fill} />
              ))}
            </ScatterChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"Fine or Flavor Cocoa(고급 풍미 코코아)"란 ICCO가 분류하는 향·아로마가 뛰어난 프리미엄 카카오 품종. 글로벌 생산의 8%만 차지하나 단가는 commodity의 2~5배. 에콰도르 Arriba Nacional 품종이 대표 — CSSVD 무영향 + 헥타르당 800kg 고수율 + Bean-to-Bar(원두 → 초콜릿 직접 생산) craft chocolate 시장의 핵심 원료.</p>
                <p>실측: <strong>에콰도르 2024 생산 60만 톤 (글로벌 3위, 가나·아이보리코스트 다음). 단수 800kg/ha (서아프리카 평균 400kg의 2배). 한국 에콰도르 수입 2023 $4M → 2025 $12M (+200%)으로 급증 — 한국 시장도 origin diversification 본격 진행 중</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 에콰도르는 "임시 대체 sourcing"이 아닌 <strong>"향후 10년 craft chocolate·premium cocoa 시장의 main supply hub로 자리잡을 strategic origin"</strong>. 지금 hub 인프라 선점하면 10년 dominant.</p>
                <p><strong>3단계</strong>: ① 에콰도르 과야킬·만타 항구 인접 cocoa 집하·발효·건조·수출 인프라 자산 3~5곳에 전략적 지분 투자 (총 $15~25M 예상) ② Fine or Flavor 코코아 origin 보호 + ESG·트레이서빌리티 인증 통합 패키지로 craft chocolate 글로벌 브랜드(Pacari·Valrhona·Amedei) 5년 직납 계약 ③ 자체 K-craft chocolate 브랜드 (가칭 "EcuadorOne") 출시 — 미국·일본·유럽 D2C 진출, 한국 vendor를 craft chocolate global player로 reframe.</p>
              </div>
            ),
            source: "Silla Co. 소싱 인텔리전스 DB + 관세청 OpenAPI + ICCO Fine or Flavor 분류",
          }} />

        <WidgetCard title="슈링크플레이션 기반 B2B 단가 워터폴" icon={RefreshCcw} iconColor="#b45309" pillar="S4"
          cardDesc="원가 변동 요소별 워터폴 — 슈링크플레이션 + CBE 전환 마진 방어"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <BarChart data={waterfallData} layout="vertical">
              <ChartPatternDefs />
              {grid}
              <XAxis type="number" {...xAxisTextProps} />
              <YAxis dataKey="name" type="category" width={110} {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar dataKey="base" stackId="a" fill="transparent" />
              <Bar dataKey="val" stackId="a" name="원가 변동 요소">
                {waterfallData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
              </Bar>
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"슈링크플레이션(Shrinkflation, shrink + inflation)"이란 가격은 그대로 유지하면서 제품 중량/용량을 줄여 사실상 단가를 인상하는 가격 정책. 코코아 매입원가 +180% 폭등 시기에 제과사들은 ①중량 축소 ②카카오 함량 하향 ③CBE/팔유 대체 3가지 워터폴 동시 발동 — 소비자 가격 sticker는 그대로지만 unit economics는 정상화.</p>
                <p>실측: <strong>국내 주요 초콜릿 브랜드 평균 중량 -8~-15% (2023~2025). 카카오 함량 32% → 24% (다크 라인 제외). CBE/팔유 비중 1.8% → 4.2%. 결과: 매입원가 +180% 충격을 소비자 가격 +18% + 워터폴 -45% 흡수로 net -42% impact</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 슈링크플레이션은 단가 방어 수단이 아닌 <strong>"vendor segmentation 전략 — '가성비' 라인은 워터폴로 cost 방어, '프리미엄' 라인은 코코아 100% 유지로 가격 결정력 확보"</strong>의 분기점.</p>
                <p><strong>3단계</strong>: ① 대중 시장 (편의점·마트·할인점) SKU는 <strong>"가성비 워터폴"</strong> 전략 — 팔유/CBE 4~5% + 카카오 22~25% + 슈링크 12% — net 마진 +14%p ② 프리미엄 시장 (백화점·premium grocery·D2C) SKU는 <strong>"코코아 100% Origin 인증 + Single Origin 표기"</strong> 라인 신설 → 단가 +85% 프리미엄 가능, 가격 저항 낮음 ③ 두 라인 분리 운영의 P&L 가시성 향상 + 글로벌 트렌드(barbell strategy)와 일치 → 자본 시장 valuation premium +1.4x.</p>
              </div>
            ),
            source: "KAMIS 도매물가 + 관세청 KCS API + 닐슨 한국 식품 SKU 분석",
          }} />

        <WidgetCard title="국내 제과 3사 원가율 및 마진 방어력 벤치마크 (%)" icon={Scale} iconColor="#b45309" pillar="S4"
          cardDesc="롯데웰푸드·해태·오리온 등 원가 부담률 + CBE 전환율 + 영업이익률"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w20_local_confectionery_margin} layout="vertical">
              <ChartPatternDefs />
              {grid}
              <XAxis type="number" {...xAxisTextProps} />
              <YAxis dataKey="company" type="category" width={110} {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar dataKey="costBurden" fill="var(--color-danger)" name="원가 부담률" barSize={30} />
              <Bar dataKey="cbeRatio" fill="#f59e0b" name="CBE(대체유) 전환율" barSize={30} />
              <Line dataKey="opMargin" type="monotone" stroke="#3b82f6" strokeWidth={3} name="영업이익률" dot={{r: 5}} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"원가율(Cost of Goods Sold Ratio)"이란 매출 대비 매입원가 비중 = 제조사의 마진 방어력의 first KPI. 한국 제과 3사(롯데웰푸드·오리온·해태제과)는 코코아·팜유·설탕·우유 합산 raw material 의존도가 매출의 65~72%. 코코아 +180% 폭등 + 원료 종합 cost +35% 결과 원가율 70% → 82~85%로 12%p 점프 → 영업이익률 -25~-40% 충격.</p>
                <p>실측: <strong>롯데웰푸드 2025-Q1 영업이익 -35.6% YoY · 오리온 -22% · 해태 -28%. 해외 매출 비중 높은 오리온은 CBE 전환 + 슈링크플레이션 + 가격 인상 3축으로 hedge → 한국·중국·동남아 멀티 시장으로 risk 분산. 내수 위주 해태는 가격 전가력 부족으로 가장 큰 충격</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 한국 제과 3사 valuation 격차는 "브랜드 차이"가 아닌 <strong>"글로벌 밸류체인 hedging 역량 + CBE R&D 내재화 + 가격 결정력 3축의 종합 지표"</strong>.</p>
                <p><strong>3단계</strong>: ① 포트폴리오 long-short pair trade: <strong>오리온 Long (해외 hedging) + 해태 Short (내수 단일)</strong> — 18개월 동안 분기당 +6~10%p alpha 기대 ② 롯데웰푸드는 CBE R&D 가속도 모니터링 → 자체 CBE 라이센스 확보 시 valuation +1.5x premium ③ 한국 mid-cap 제과 vendor (네스레·CJ푸드·삼립) 중 1~2곳을 distressed 가격으로 매수 → 우리 글로벌 sourcing + EUDR DD + CBE 통합 패키지로 turnaround → 3년 후 strategic exit 또는 IPO.</p>
              </div>
            ),
            source: "DART 전자공시 + 한국 제과 3사 IR + Silla Co. 내부 재무 모델링",
          }} />

      </div>

      {/* 🆕 USDA FAS — 국제·국내 가격 8년 + 가나 대미 수출 +318% (S4 판매·수요) */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginTop:'1.5rem' }}>
        <CocoaUsdaWidgets filterPillar="S4" />
      </div>

      </>)}
      {activePart === 'S5' && (<>
      {/* Part 5: ESG */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background: SECTIONS[4].color, borderRadius: '4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[4].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        <WidgetCard title="부산물 업사이클링 수익 포트폴리오 (매출 기여도 %)" icon={Recycle} iconColor="#d97706" pillar="S5"
          cardDesc="Husks·Pods 부산물의 테오브로민·카테킨·사료 가치 — Cash Cow 전환"
          telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <BarChart data={cocoaData.w9_upcycling}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="category" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar dataKey="Theobromine_mg_g" stackId="a" fill="#d97706" name="테오브로민(mg/g)" />
              <Bar dataKey="Catechin_mg_g" stackId="a" fill="#b45309" name="카테킨(mg/g)" />
              <Bar dataKey="Feed_Utility" stackId="a" fill="var(--color-warning)" name="사료 가치(Index)" />
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"부산물 업사이클링(By-product Upcycling)"이란 가공 과정에서 발생한 폐기물을 raw material로 재변환해 새로운 수익원으로 만드는 순환경제 패턴. 카카오 1톤 가공 시 껍질(Husks 12%)·꼬투리(Pods 70%) 등 총 82%가 잠재 폐기물 — 그러나 껍질은 폴리페놀·식이섬유 농축, 꼬투리는 셀룰로오스·리그닌 함유로 사료·비료·기능성 식품·바이오플라스틱 raw로 전환 시 단가 +480~860% 가치 점프.</p>
                <p>실측: <strong>현행 부산물 폐기 cost -$0.18/kg → 사료 변환 +$1.45/kg (8.1배) → 카카오 셸 차 (cocoa shell tea, 신생 superfood) +$8.20/kg (45배). 가공 vendor 100톤 처리 시 부산물 매출 연 $185,000~$420,000 자동 발생</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 카카오 부산물은 "처리 cost"가 아닌 <strong>"본업 매출의 8~14%를 자동 추가하는 leverage 자산 + ESG 점수 lift + 탄소배출권 동시 획득의 triple win"</strong>.</p>
                <p><strong>3단계</strong>: ① 단기(6개월): 가공 vendor 부산물을 사료·비료 vendor (이지바이오·CJ제일제당)에 톤 단위 공급 — 폐기 cost zero + 부가 매출 +8%p ② 중기(12~18개월): 카카오 셸 차 brand (가칭 "CacaoShell Tea") 출시 — Whole Foods·iHerb·Amazon D2C 진출 ③ 장기(24개월+): 폴리페놀·테오브로민 추출 R&D → 화장품·기능성 식품 vendor (아모레퍼시픽·종근당건강) raw 납품 + 환경부 K-ETS 탄소배출권 획득 → ESG 점수 +22점, exit 시 "Circular Economy vendor" valuation +2.0x.</p>
              </div>
            ),
            source: "AgFunder 애그리테크 리포트 + 바이오매스 저널 + 카카오 셸 폴리페놀 학술 연구",
          }} />

        <WidgetCard title="EUDR 이력 추적 준수도 및 페널티 리스크 (준수율%, 위험도)" icon={Gavel} iconColor="#78350f" pillar="S5"
          cardDesc="CMS 농가 등록률·폴리곤 매핑 vs 수출 차단 리스크 — EU 매출 4% 벌금 압박"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w10_eudr_compliance}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="origin" {...xAxisTextProps} />
              <YAxis yAxisId="left" {...yAxisProps} tickFormatter={(v) => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="CMS_Registration" fill="#78350f" name="CMS 농가 등록률(%)" barSize={35} />
              <Bar yAxisId="left" dataKey="Polygon_Mapped" fill="var(--color-info)" name="폴리곤 매핑(%)" barSize={35} />
              <Line yAxisId="right" type="monotone" dataKey="Export_Block_Risk" stroke="var(--color-danger)" strokeWidth={3} dot={{r: 5}} name="수출 차단 리스크(RHS)" />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"이력 추적 시스템(Traceability Management System, TMS/CMS)"이란 카카오 원두를 농가 GPS 좌표 단위부터 가공·운송·소비자 도달까지 디지털로 추적해 산림 훼손 무관(deforestation-free)을 입증하는 SaaS 인프라. EUDR 위반 시 EU 역내 매출의 4% 벌금 + 시장 퇴출 → vendor의 단순 ESG 이슈가 아닌 실존적 재무 risk.</p>
                <p>실측: <strong>EU 매출 $500M vendor 기준 EUDR 미준수 벌금 $20M/년 (분기당 $5M 직접 손실). EUDR DD SaaS 시장 규모 2024 $180M → 2027E $1.2B (CAGR 88%). 글로벌 카카오 vendor 중 TMS 인프라 보유율 32% — 미보유 vendor는 향후 12개월 내 도산·M&A·시장 퇴출 셋 중 하나</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: EUDR Traceability는 "규제 준수 cost"가 아닌 <strong>"vendor를 자연 도태시키는 시장 cleanup catalyst를 자본 자산으로 변환할 SaaS infrastructure play"</strong>.</p>
                <p><strong>3단계</strong>: ① 자체 EUDR DD Platform 구축 — Trase.earth + Sentinel-2 위성 영상 + AI 산림 훼손 탐지 + GPS 농가 데이터 통합 (capex $6~8M, 12개월) ② 한국·아시아 카카오·팜유·콩·커피·소·고무 vendor에 SaaS 라이센싱 (vendor당 연 $50~150K, 3년 lock-in) → 200 vendor × $80K = $16M ARR ③ EUDR-compliant 인증 받은 vendor를 우리 PE 포트폴리오로 흡수 → 인증 자체가 valuation premium +1.8x → exit 시 PE 4x → SaaS+PE hybrid 12x로 카테고리 점프.</p>
              </div>
            ),
            source: "Trase.earth + 가나 TCDP API + Sentinel-2 위성 영상 + EU 집행위 EUDR 규정",
          }} />

        <WidgetCard title="FTA 삼각 무역 및 역수출 흐름도" icon={MapPin} iconColor="#b45309" pillar="S3"
          cardDesc="FTA 활용 무관세 우회 — 한국 동북아 가공·유통 허브 진화"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <Sankey data={cocoaData.w17_fta_triangle} node={renderSankeyNode} nodePadding={30} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} link={{ stroke: 'rgba(255,255,255,0.1)' }}>
              <RechartsTooltip content={<CustomTooltip />} />
            </Sankey>
          }
          takeaway={{
            situation: (
              <div>
                <p>"FTA 삼각 무역(FTA Triangular Trade)"이란 한 국가가 raw 원물을 비FTA국에서 수입 → 자국에서 가공 → FTA 회원국으로 재수출하면서 원산지 누적(cumulative origin) 조항으로 관세 0~5%까지 떨어뜨리는 trade engineering 전략. 한국은 코코아 원물 무관세(0%) + 한-일·한-중·한-아세안·RCEP 다중 FTA 보유 → 동북아 코코아 hub 자격 보유.</p>
                <p>실측: <strong>한국 코코아 원두 수입 관세 0% (vs 일본 5.6%·중국 8~10%). 가공품(버터·매스)도 한-일 FTA 0%·한-중 FTA 6% (vs 미국 직수입 시 16%). 일본 프리미엄 시장 (단가 +35%) + 중국 매스 마켓 (volume 4배)으로 분리 재수출 시 가공 vendor 마진 +24~32%p 추가</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 한국은 "수입 소비국"이 아닌 <strong>"동북아 코코아 가공·재수출 핵심 hub로 진화할 수 있는 FTA leverage를 보유한 strategic geography"</strong>.</p>
                <p><strong>3단계</strong>: ① 평택·인천 보세창고에 코코아 가공 hub 설치 — 가나·에콰도르 원두 직수입 → 한국에서 1차 가공(리쿼·버터·매스) → 한-일·한-중·RCEP FTA 활용 재수출 ② 일본 프리미엄 시장(메이지·로토·라쿠텐) 직납 5년 LTA + 중국 매스 마켓(허마·세븐일레븐 차이나) bulk 공급 동시 운영 ③ "동북아 코코아 hub" 포지셔닝 IR 자료 → 자본 시장에 K-cocoa champion으로 valuation +1.8x premium, exit 시 strategic acquirer (CJ·Olam·Cargill) 타겟화.</p>
              </div>
            ),
            source: "UN Comtrade 역수출 실데이터 + 관세청 KCS API + 한-일·한-중·RCEP FTA 양허표",
          }} />

        <WidgetCard title="아시아 내 프리미엄 차익거래" icon={Landmark} iconColor="#b45309" pillar="S4"
          cardDesc="국가별 프리미엄 비중 + CBE 비중 + 현물/선물 스프레드"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w18_asia_premium}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
              <XAxis dataKey="country" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="left" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="PremiumShare" name="프리미엄 비중" stackId="a" fill="var(--color-danger)" />
              <Bar yAxisId="left" dataKey="CBERatio" name="CBE 비중" stackId="a" fill="#d97706" />
              <Line yAxisId="right" type="monotone" dataKey="Spread" stroke="#b45309" strokeWidth={3} name="현물/선물 스프레드(KCS-ICCO)" dot={{ r: 5 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"지불 용의(Willingness to Pay, WTP)"란 동일 상품에 대해 다른 시장이 다른 가격을 받아들이는 정도. 코코아 시장은 아시아 내에서도 한국·일본(WTP 고)과 동남아·인도(WTP 저)가 4~6배 격차 → 같은 카카오 원두라도 시장 segmentation 만으로 단가 +280% 가능한 arbitrage 구조.</p>
                <p>실측: <strong>일본 다크 초콜릿 평균 단가 $48/kg vs 인도네시아 매스 초콜릿 $7/kg (6.9배). 한국 프리미엄 초콜릿 $32/kg vs 중국 매스 $11/kg (2.9배). 동일 카카오 원두 1톤 가공 시 시장 split sale로 매출 +180~250% 차이</strong>. 시장 선택이 곧 마진 결정.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 단일 시장 vendor는 "WTP arbitrage opportunity를 자발적으로 포기하는 vendor" — 글로벌 split sale 역량이 alpha의 main source.</p>
                <p><strong>3단계</strong>: ① 같은 카카오 원두를 2개 SKU로 분기: <strong>프리미엄 SKU (Origin·Single-Origin·다크 70%+·craft chocolate 라벨)</strong>는 한·일·미·EU 직납 / <strong>가성비 SKU (CBE 4%·매스·milk chocolate)</strong>는 중국·동남아·인도 bulk 공급 ② 일본 백화점 (이세탄·다카시마야·미츠코시) 식품관 직납 5년 LTA + 인도네시아 알파마트·인도마렛 bulk LTA 동시 lock-in ③ 매분기 P&L에 "시장별 WTP arbitrage 마진" 별도 disclosure → 자본 시장에 K-cocoa multi-market vendor 포지셔닝, valuation +1.4x.</p>
              </div>
            ),
            source: "관세청 KCS 실측 + ICCO API + 닐슨 아시아 7개국 초콜릿 단가 분석",
          }} />

        <WidgetCard title="K-뷰티/바이오 소재 전환 ROI (마진율 %)" icon={TestTube} iconColor="#f59e0b" pillar="S2"
          cardDesc="채널별 EBITDA(세전·이자·감가상각비 차감 전 이익)·성장률 + 폴리페놀·항산화 측정치 — 코스메슈티컬 ROI"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w19_kbeauty_bio}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
              <XAxis dataKey="channel" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="left" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="Margin" stackId="a" fill="#f59e0b" name="EBITDA(세전·이자·감가상각비 차감 전 이익) 마진율(%)" barSize={35} />
              <Bar yAxisId="left" dataKey="Growth" stackId="a" fill="#78350f" name="시장 성장률(%)" barSize={35} />
              <Line yAxisId="right" type="monotone" dataKey="Polyphenol_mgGAE_g" stroke="#d97706" strokeWidth={3} name="폴리페놀(mg GAE/g, RHS)" />
              <Line yAxisId="right" type="monotone" dataKey="Antioxidant_DPPH" stroke="var(--color-warning)" strokeWidth={3} strokeDasharray="3 3" name="항산화(DPPH, RHS)" />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"코스메슈티컬(Cosmeceutical, cosmetic + pharmaceutical)"이란 화장품과 의약품의 중간 영역. 과학적 효능을 입증한 기능성 성분 (예: 코코아 폴리페놀·테오브로민·플라반-3-올)이 핵심. 동일 raw material이 식품 vendor에게는 commodity (kg당 $5~15)지만 코스메슈티컬 vendor에게는 active ingredient (kg당 $180~480)로 단가 +1200~3200% 점프.</p>
                <p>실측: <strong>K-뷰티 시장 2024 $11B → 2027E $18B (CAGR 18%). 코코아 폴리페놀 raw 원료 단가 식품용 $8/kg → 화장품용 $245/kg (30배). 글로벌 코스메슈티컬 시장 $77B (식품 보조제 $156B의 50% 규모, +CAGR 9%) — vendor 카테고리 전환만으로 EV +540% 가능</strong>.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 코코아 vendor의 진짜 게임은 "식품 마진 1~2%p 개선"이 아닌 <strong>"코스메슈티컬 카테고리 진입으로 PE multiple 4x → 14x 리레이팅"</strong>. 카테고리 점프가 영업 효율보다 자본 시장에서 100배 강력.</p>
                <p><strong>3단계</strong>: ① 가나·에콰도르 카카오 부산물 (껍질·꼬투리)에서 폴리페놀·테오브로민 추출 R&D 라인 신설 — 식약처 MFDS 기능성 원료 등록 (24개월 fast track) ② 아모레퍼시픽·LG생활건강·코스맥스·한국콜마 코스메슈티컬 R&D 부문 raw 납품 5년 LTA — 단가 +30배 가치 점프 ③ 자체 K-cocoa skincare 브랜드 (가칭 "CacaoLab") 출시 → 미국·일본·유럽 D2C 진출 → 식품 vendor PE 4x → 코스메슈티컬 brand PE 14x 자본 시장 카테고리 점프, exit 시 EV +1,200% premium 가능.</p>
              </div>
            ),
            source: "식약처 MFDS 기능성 원료 DB + Mintel K-뷰티 시장 리서치 + B2B 코스메슈티컬 단가",
          }} />

        <WidgetCard title="이중 규제의 덫 리스크 매트릭스" icon={Gavel} iconColor="#b45309" pillar="S5"
          cardDesc="X: EUDR 추적위험도, Y: 카드뮴 수치, Z: 식약처 통관 거절률"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              {grid}
              <XAxis type="number" dataKey="eudrRisk" name="EUDR 추적위험도(%)" {...xAxisTextProps} />
              <YAxis type="number" dataKey="cadmiumLevel" name="카드뮴 수치(mg/kg)" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <ZAxis type="number" dataKey="rejectionRate" range={[100, 800]} name="식약처 통관 거절률(%)" />
              <ReferenceLine y={0.8} stroke="var(--color-danger)" strokeDasharray="3 3" label={{ position: 'top', value: '식약처 통관 제한선(0.8mg/kg)', fill: 'var(--color-danger)', fontSize: 10 }} />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              {cocoaData.w13_dual_trap.map((entry: any, index: number) => (
                <Scatter key={`scatter-${index}`} name={entry.country} data={[entry]} fill={entry.fill} />
              ))}
            </ScatterChart>
          }
          takeaway={{
            situation: "가나산을 피해 중남미산으로 다변화할 경우 식약처 중금속(카드뮴) 규제에 가로막히고, 동남아산 팜유로 대체하려 해도 팜유 역시 EUDR 산림벌채 규제 대상이라 이중 규제의 덫에 직면하게 됩니다.",
            actionPlan: "단순한 산지 다변화나 대체 원료 투입만으로는 규제 압박을 피할 수 없으므로, 카드뮴 등 식품 안전 기준과 EUDR의 환경 실사 요건을 동시에 충족하도록 설계하는 '안전성 기반 공급망 설계(Safety-by-Design)'를 도입해야 합니다.",
            source: "MFDS 식약처 수입식품검역 API",
          }} />

      </div>
      </>)}

    </div>
  );
}
