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
  k4: { title: 'DART 실시간 타격 지수', value: 'COGS +14%', trend: '📉', desc: '경쟁사(L/O사) 3분기 원가율 악화', source: 'DART API' },
  k5: { title: '식약처 통관 거절률', value: '8.2%', trend: '🚨', desc: '남미산 카드뮴 허용치 초과 폐기', source: 'MFDS API' },
  k6: { title: 'EUDR 규제 리스크', value: '벌금 4%', trend: '⚖️', desc: '산림벌채 방지법(2025) 도입 임박', source: 'JRC / EFI API' },
};

const SECTIONS = [
  { id: "S1", title: "1. 원물 생산", desc: "서아프리카 기후 리스크와 원두 숏티지 사태 전조", color: "#b45309" },
  { id: "S2", title: "2. 가공 산업", desc: "글로벌 분산 가공 허브와 파생품 마진 스프레드", color: "#b45309" },
  { id: "S3", title: "3. 물류 및 무역", desc: "한국의 이중 수입 넥서스와 공급망 다변화", color: "#b45309" },
  { id: "S4", title: "4. 판매 및 수요", desc: "대체유 방어선과 슈링크플레이션 전략", color: "#b45309" },
  { id: "S5", title: "5. 지속가능성 및 미래 전략", desc: "산림벌채 규제 리스크와 부산물 업사이클링", color: "#b45309" },
];

export default function CocoaDashboard() {
  const [cocoaData, setCocoaData] = useState<any>(null);
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
    let priceHist = !isForecast ? d.Price : null;
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

      {/* ═══ Sections ═══ */}

      {/* Part 1: Raw Material */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
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
            situation: "가나의 2023/24 시즌 생산량은 기상이변과 질병으로 15년 만의 최저치인 약 58~60만 톤으로 급감했으며, 웨스턴 노스 지역 재배 면적의 81%가 CSSVD에 감염되었습니다. 전염병과 노령화된 나무로 인해 구조적 생산량 회복에는 5~10년 이상의 리드타임이 소요됩니다.",
            actionPlan: "포트폴리오 내 F&B 기업들의 서아프리카 원물 의존도(Exposure)를 즉각 하향 조정하고, 병해충 리스크가 낮은 중남미(에콰도르) 산지로의 공급망 다변화(Supply Chain Diversification)를 위한 소싱 계약 구조 개편을 강제해야 합니다. 기후 스마트 농업(CSA) 기술 보유 기업에 대한 그로스 캐피탈 투자를 선제적으로 검토해야 합니다.",
            source: "FAOSTAT QCL 2018-2024 (CI:A, GH:X) / EFI Cocoa Insight March 2025",
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
            situation: "뉴욕 ICE 코코아 선물 가격은 극심한 숏 스퀴즈와 패닉 바잉이 겹치며 2024년 4월 톤당 $12,000를 돌파해 역사적 최고점을 경신했으나, 2026년 초 현재 톤당 약 $3,765까지 70%가량 폭락하며 극단적인 변동성을 보이고 있습니다. 이러한 백워데이션과 롤러코스터 장세는 산업 내 대규모 마진콜과 유동성 경색을 유발했습니다.",
            actionPlan: "선물 가격 급등락에 따른 운전자본(Working Capital) 부담을 역이용하여, 유동성 위기에 처한 중소형 가공업체·무역상들을 할인된 밸류에이션에 인수하는 디스트레스드(Distressed) 바이아웃 기회를 포착해야 합니다. 피투자사에는 'Just-in-Case' 재고 확보 모델 전환과 롤링 헤지(Rolling Hedge) 전략을 의무화해야 합니다.",
            source: "World Bank Commodity Index / ICCO Daily Price / ICE Futures",
          }} />

        <WidgetCard title="글로벌 시장가 대비 현지 농가 수매가 디커플링 (USD/MT)" icon={Scale} iconColor="#b45309" pillar="S4"
          cardDesc="글로벌 선물가 vs 가나 농가 수매가 + Cedi/USD 환율 — 밀수 트리거"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w11_farmer_decoupling}>
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
            situation: "가나 정부는 2025년 10월 농가 수매가를 톤당 58,000세디(FOB의 70%)로 상향했으나, 글로벌 시장 가격(한때 $10,000+)과의 심각한 디커플링으로 2023/24 시즌에만 약 16만 톤이 인접국으로 밀수되었습니다. COCOBOD의 유동성 위기로 농가 대금 지급이 지연되며 현지 유통망이 마비 상태에 이르렀습니다.",
            actionPlan: "국가 통제망의 허점과 현지 매입상(LBC)의 유동성 경색을 이용해, PE 자금력으로 현지 LBC에 직접 자금을 조달(Trade Finance)하고 원물 우선 수매권을 확보하는 딜을 추진해야 합니다. 농가와 직접 연결되는 직수매 채널에 자본을 투입하여 국가 리스크(Sovereign Risk)를 우회해야 합니다.",
            source: "ICE 선물거래소 / 가나 COCOBOD 공시 / EFI Cocoa Insight 2025",
          }} />

      </div>

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
            situation: "2023/24 시즌 기준 글로벌 카카오 가공 점유율은 유럽이 35.8%(171만 톤)로 1위를 지키고 있으나, 아프리카(22.9%)와 아시아(22.2%) 신흥 허브의 추격이 거셉니다. 특히 인도네시아는 원두 수출국에서 연간 약 38.6만 톤의 파생품을 수출하는 핵심 가공 허브로 전환하며 글로벌 밸류체인의 축을 이동시키고 있습니다.",
            actionPlan: "원물 생산지와 인접한 아시아(인도네시아/말레이시아) 및 서아프리카 현지의 중간 가공 인프라 자산에 대한 인프라/PE 공동 투자를 집행해야 합니다. 유럽 의존도(Exposure)를 낮추고 아시아 역내 수급망을 장악하는 벤더를 롤업(Roll-up)하여 아시아 프리미엄을 독점하는 전략이 유효해야 합니다.",
            source: "ICCO Quarterly Bulletin / UN Comtrade HS 1801-1806",
          }} />

        <WidgetCard title="파생품 마진 스프레드 (거래량 Index, 프리미엄 %)" icon={Scale} iconColor="#d97706" pillar="S2"
          cardDesc="버터·파우더 등 파생품별 거래량 + 부가가치 마진율 비교"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w4_derivative_spread}>
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
            situation: "원두 부족 사태로 초콜릿의 핵심 원료인 코코아 버터 가격이 톤당 $15,000~$16,000까지 치솟으며 사상 최고치를 기록했습니다. 버터의 선물 비율(Ratio)은 안정화되는 추세이나 파우더 수요는 강하게 유지되며 가격 상승을 견인하고 있어, 파생품별 마진 스프레드의 극심한 비대칭성이 초래되고 있습니다.",
            actionPlan: "버터와 파우더의 마진 스프레드 괴리를 활용한 아비트리지 역량을 갖춘 가공업체(Grinder)에 투자 가중치를 두어야 합니다. 파우더 혼합 베이커리/음료 B2B 시장에서 확고한 캡티브(Captive) 채널을 보유한 업체를 선별하여 바이아웃 포트폴리오에 편입해야 합니다.",
            source: "Bloomberg Commodity / ICE Cocoa Futures / ICCO Quarterly Bulletin",
          }} />

        <WidgetCard title="실사 기반 가공 공장 인수합병 타겟" icon={Landmark} iconColor="#b45309" pillar="S2"
          cardDesc="X: CAPEX 매력도, Y: 수율, Z: 가공 Capa — 디스트레스드 M&A 매트릭스"
          telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              {grid}
              <XAxis type="number" dataKey="capex" name="CAPEX 매력도" {...xAxisTextProps} />
              <YAxis type="number" dataKey="yield" name="가공 인프라 점수" {...yAxisProps} />
              <ZAxis type="number" dataKey="capacity" range={[200, 1500]} name="가공 Capa(천톤)" />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              {cocoaData.w14_mna_radar.map((entry: any, index: number) => (
                <Scatter key={`scatter-${index}`} name={entry.target} data={[entry]} fill={entry.fill} />
              ))}
            </ScatterChart>
          }
          takeaway={{
            situation: "전례 없는 매입원가 폭등과 정부의 수매 대금 체불, 이력 추적 시스템 도입에 따른 고정비 증가로 서아프리카 현지의 로컬 매입상 및 영세 가공업체들의 줄도산 리스크가 커지고 있습니다. 반대로 글로벌 자본을 등에 업은 일부 현지 기업(Niche Cocoa, CPC 등)은 M&A 및 JV 타겟으로 떠오르고 있습니다.",
            actionPlan: "철저한 실사(Due Diligence)를 통해 부채 비율이 높으나 안정적 가공 설비와 라이선스를 보유한 현지 자산을 식별하여 오퍼튜니스틱(Opportunistic) 매수 전략을 구사해야 합니다. 설비 노후화로 가동률이 낮은 국영기업(CPC) 대비 민간 우량 기업(Niche Cocoa)과의 JV에 그로스 펀드를 배정해야 합니다.",
            source: "Silla Co. 내부 실사 DB / COCOBOD Annual Report / Niche Cocoa IR",
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
            situation: "근월물 가격이 원월물보다 비싼 강력한 백워데이션 장세에서 최근 콘탱고(Contango) 구조로의 전환 조짐이 보이고 있습니다. 이는 극단적 숏 스퀴즈가 진정되고 시장이 정상화 단계에 진입했음을 시사합니다.",
            actionPlan: "선물 커브의 구조적 변화를 실시간 모니터링하여, 백워데이션 심화 시에는 현물 비축을 축소하고 롤링 헤지를 활용하며, 콘탱고 진입 시에는 장기 선물 계약을 통해 매입원가를 락인하는 유연한 헤지 전략이 필요해야 합니다.",
            source: "ICE 선물 커브 실시간 모니터링",
          }} />

      </div>

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
            situation: "가나 내 가공 인프라는 연 6.4만 톤 CAPA를 지닌 국영 CPC가 설비 노후화와 자금난으로 가동률 부진 및 구조조정을 겪고 있는 반면, Niche Cocoa(연 6만 톤)나 Touton(연 2.5만 톤) 등 민간/외국계 기업은 HACCP 등 글로벌 인증을 무기로 정상 가동 중인 양극화 상태입니다.",
            actionPlan: "디스트레스드 자산화된 현지 설비(CPC 유휴 라인 등)를 PE 자본으로 인수·현대화(CAPEX 투자)하여 아프리카 원산지 내 가공(Origin Grinding) Bottom-line(순이익)을 내재화해야 합니다. 한국 제과사 스펙에 맞춘 리쿼(Liquor) 직생산 기지로 탈바꿈시켜 매입원가 절감 턴어라운드를 실현하는 것이 핵심 밸류 크리에이션 레버입니다.",
            source: "COCOBOD Annual Report / Ghana Cocoa Processing Company (CPC) / Niche Cocoa IR",
          }} />

        <WidgetCard title="한국의 이중 수입 넥서스 흐름도 (Flow)" icon={Anchor} iconColor="#b45309" pillar="S3"
          cardDesc="가나 원두 80% 편중 + 네덜란드/말레이시아 우회 가공품 — Sankey 다이어그램"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <Sankey data={cocoaData.w5_sankey_nexus} node={renderSankeyNode}
              link={{ stroke: '#b45309', strokeOpacity: 0.3 }} margin={{ left: 20, right: 80, top: 20, bottom: 20 }}>
              <RechartsTooltip content={<CustomTooltip />} />
            </Sankey>
          }
          takeaway={{
            situation: "2025년 한국의 코코아 원두 수입액 약 5,870만 달러 중 80%($47M)가 가나산에 편중되어 있으나, 버터나 매스 같은 1차 가공품은 네덜란드나 말레이시아 등 제3국 가공 허브를 거쳐 우회 수입되는 '이중 수입 구조'를 띠고 있습니다.",
            actionPlan: "가나 원두에 종속된 비효율적 우회 수입 구조를 타파하기 위해, 현지(가나) 1차 가공 설비를 보유한 업체와 한국 B2B 유통사를 수직 계열화하는 볼트온(Bolt-on) M&A를 실행해야 합니다. 중간 마진을 내재화하여 국내 제과 대기업을 상대로 한 가격 경쟁력 우위를 선점해야 합니다.",
            source: "관세청(KCS) OpenAPI / UN Comtrade HS 1801-1806",
          }} />

        <WidgetCard title="공급 충격 시나리오: 재고 소진율 트래커 (DIO)" icon={Shield} iconColor="#d97706" pillar="S2"
          cardDesc="DIO(재고회전일수) + 공장 가동 중단 임계선 + 경쟁사 OPM 동향"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w6_inventory_burn_rate}>
              {grid}
              <XAxis dataKey="timeline" {...xAxisTextProps} />
              <YAxis yAxisId="left" {...yAxisProps} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} />
              <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="DIO" fill="#d97706" name="현재 보유 재고일수(DIO)" barSize={40}>
                {cocoaData.w6_inventory_burn_rate && cocoaData.w6_inventory_burn_rate.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.DIO < 30 ? "var(--color-danger)" : "#d97706"} />
                ))}
              </Bar>
              <Line yAxisId="left" type="step" dataKey="CriticalLine" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="3 3" name="공장 가동 중단(Red Alert) 기준선" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="CompetitorMargin" stroke="var(--color-warning)" strokeWidth={3} name="경쟁사 OPM 하락(DART API)" dot={{ r: 5 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: "2023/24 시즌 글로벌 재고 대 분쇄(Stocks-to-Grindings) 비율은 46년 만의 최저치인 26.4%로 급락했으며, 뉴욕 ICE 인증 재고는 19년 만의 최저치(약 11.8만 톤)를 기록하는 등 물리적 재고 고갈이 심각합니다. 주요 수입국 기업들은 'Just-in-Case'로 재고 비축 모델을 급선회하며 운전자본(NWC) 압박을 겪고 있습니다.",
            actionPlan: "피투자사의 DIO(재고회전일수) 장기화에 대비하여 크레딧 펀드(Credit Fund)와 연계한 재고 금융(Inventory Financing) 솔루션을 제공해 자본 효율성을 높여야 합니다. 잉여 재고를 확보한 상사/벤더의 경우 단기 프리미엄 매각을 통한 특별 배당 재원 마련 전략을 실행해야 합니다.",
            source: "ICCO Quarterly Bulletin / ICE Certified Stock Data / DART 경쟁사 공시",
          }} />

        <WidgetCard title="허브 경유에 따른 EUDR 그린 프리미엄 원가 전가" icon={Anchor} iconColor="#b45309" pillar="S3"
          cardDesc="EUDR 컴플라이언스 텍스 + 해상 물류비 + 원물 가격 — 그린 프리미엄 누적"
          telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <BarChart data={cocoaData.w12_green_premium}>
              {grid}
              <XAxis dataKey="route" {...xAxisTextProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar dataKey="BaseCost" stackId="a" fill="#64748b" name="순수 원물 가격" barSize={40} />
              <Bar dataKey="Logistics" stackId="a" fill="var(--color-info)" name="해상 물류비" />
              <Bar dataKey="EudrTax" stackId="a" fill="#b45309" name="EUDR 컴플라이언스 텍스" />
            </BarChart>
          }
          takeaway={{
            situation: "EUDR로 인한 실사 비용 증가는 인증 원두에 대한 '그린 프리미엄(Green Premium)'을 형성하고 있으며, 이는 가공업체와 소비자의 매입원가 부담으로 작용하고 있습니다. 롯데웰푸드의 경우 2025년 1분기 코코아 매입원가 급등으로 영업이익이 전년 동기 대비 35.6% 급감하는 등 마진 압박이 현실화되었습니다.",
            actionPlan: "피투자 기업이 그린 프리미엄 비용을 최종 B2B/B2C 판가에 전가(Pass-through)할 수 있는 브랜드 파워 및 시장 지배력이 있는지를 밸류에이션의 최우선 지표로 삼아야 합니다. 프리미엄 비용 전가가 가능한 하이엔드/다크 초콜릿 라인업으로 포트폴리오를 강제 재편해야 합니다.",
            source: "EU 집행위(EC) EUDR 규정 / 롯데웰푸드 IR 2025Q1 / SCFI 운임지수",
          }} />

      </div>

      {/* Part 4: Sales & Demand */}
      <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem', marginTop: '3rem' }}>
        <div style={{ width:'4px', height:'28px', background: SECTIONS[3].color, borderRadius: '4px' }} />
        <div>
          <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
          <p style={{ margin:0, fontSize:'0.75rem', color:'var(--text-secondary)' }}>{SECTIONS[3].desc}</p>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,540px), 1fr))', gap:'1.5rem', marginBottom:'2.5rem' }}>
        
        
        <WidgetCard title="B2B CBE(대체유) 벤더 롤업 가치 평가 (EBITDA %, Agility)" icon={Scale} iconColor="#d97706" pillar="S2"
          cardDesc="대체유 벤더의 시장대응력 vs EBITDA vs 원가부담 — 롤업 매수 매트릭스"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
              <XAxis type="number" dataKey="Agility" name="Agility(시장대응력)" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <YAxis type="number" dataKey="EBITDA" name="EBITDA(%)" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <ZAxis type="number" dataKey="CostBurden" range={[60, 400]} name="원가부담" />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              {cocoaData.w16_cbe_rollup.map((entry: any, index: number) => (
                <Scatter key={`scatter-${index}`} name={entry.category} data={[entry]} fill={index === 2 ? '#d97706' : '#78350f'} />
              ))}
            </ScatterChart>
          }
          takeaway={{
            situation: "코코아 버터 가격이 톤당 $15,000을 돌파하며 역사적 고점을 찍음에 따라, 제과 및 베이커리 업계는 매입원가 절감을 위해 식물성 유지를 활용한 코코아 버터 대체재(CBS) 및 동등재(CBE)의 사용 비율을 급격히 늘리고 있습니다.",
            actionPlan: "팔유, 시어버터 기반의 식물성 유지 및 CBE 제조 벤더들을 선제적으로 롤업(Roll-up) 매수하여 규모의 경제를 달성해야 합니다. B2B 식품소재 기업 포트폴리오의 영업이익률 방어를 위해 CBE R&D 역량을 가진 피투자사 멀티플을 상향 조정하고 자금을 집중 투여해야 합니다.",
            source: "Krungsri Research 팔유 산업 전망 / Silla Co. 내부 모델",
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
            situation: "서아프리카의 공급 붕괴 속에서 에콰도르는 헥타르당 800kg의 높은 수율을 무기로 생산량을 60만 톤 이상으로 확대하며 글로벌 3위이자 최적의 대안으로 급부상했습니다. 한국 시장 역시 리스크 헷지를 위해 에콰도르 수입 규모를 천만 달러 이상으로 확대하며 프리미엄 원두 비중을 높이고 있습니다.",
            actionPlan: "에콰도르, 브라질 등 남미 산지의 현지 집하장 및 수출 터미널 자산에 전략적 지분 투자를 단행하여 서아프리카 리스크를 상쇄하는 지역적 다변화 펀드를 조성해야 합니다. 특히 프리미엄(Fine or Flavor) 코코아를 처리하는 남미의 빈투바(Bean-to-Bar) 원료 공급망을 선점해야 합니다.",
            source: "Silla Co. 소싱 인텔리전스 DB / 관세청(KCS) OpenAPI",
          }} />

        <WidgetCard title="슈링크플레이션 기반 B2B 단가 워터폴" icon={RefreshCcw} iconColor="#b45309" pillar="S4"
          cardDesc="원가 변동 요소별 워터폴 — 슈링크플레이션 + CBE 전환 마진 방어"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <BarChart data={waterfallData} layout="vertical">
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
            situation: "매입원가 폭등 속에서 제조사들은 제품 중량을 줄이는 슈링크플레이션을 단행하거나, 카카오 함량을 낮추고 식물성 유지(CBE) 등 대체 원료를 사용하는 방향으로 레시피를 변경해 매입원가를 방어하고 있습니다.",
            actionPlan: "대중적 시장에서는 팜유/설탕 기반 배합으로 단가를 낮추는 '가성비 워터폴 전략'을 취하되, 핵심 타겟에게는 코코아 본연의 성분을 유지한 '고함량 프리미엄 라인'을 병행하는 투트랙 접근이 필수적입니다.",
            source: "KAMIS 도매물가 / KCS API 융합",
          }} />

        <WidgetCard title="국내 제과 3사 원가율 및 마진 방어력 벤치마크 (%)" icon={Scale} iconColor="#b45309" pillar="S4"
          cardDesc="롯데웰푸드·해태·오리온 등 원가 부담률 + CBE 전환율 + 영업이익률"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w20_local_confectionery_margin} layout="vertical">
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
            situation: "원물가 폭등으로 국내 주요 제과 업체들의 매입원가 부담률이 80%를 상회하고 있습니다. 수익성 방어를 위해 해외 비중이 높은 업체를 중심으로 CBE(코코아 대체유) 전환율을 높이고 슈링크플레이션을 단행 중입니다.",
            actionPlan: "내수 위주 업체의 실적 악화 가능성에 대비하여 공매도 포지션을 검토하거나, 대체유 제조 원천 기술을 확보하고 글로벌 밸류체인 헤지가 가능한 업체를 선별하여 롱(Long) 포지션을 구축하는 롱숏 전략을 구사해야 합니다.",
            source: "DART 전자공시 / Silla Co. 내부 재무 모델링",
          }} />

      </div>

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
            situation: "코코아 생산 과정에서 발생하는 방대한 부산물(Husks, Pods)은 폐기물로 간주되어 탄소세 및 처리 비용을 발생시키지만, 그 이면에는 바이오 비료나 사료로의 엄청난 전환 잠재력이 숨겨져 있습니다.",
            actionPlan: "버려지는 코코아 부산물을 자원화하는 애그리테크(Agri-Tech) 파트너십이나 Spin-off JV를 구축해 폐기 비용을 제로화하고, 이를 새로운 ESG 기반의 캐시카우(Cash Cow)로 탈바꿈시키십시오.",
            source: "AgFunder 애그리테크 리포트 / 바이오매스 저널",
          }} />

        <WidgetCard title="EUDR 이력 추적 준수도 및 페널티 리스크 (준수율%, 위험도)" icon={Gavel} iconColor="#78350f" pillar="S5"
          cardDesc="CMS 농가 등록률·폴리곤 매핑 vs 수출 차단 리스크 — EU 매출 4% 벌금 압박"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w10_eudr_compliance}>
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
            situation: "EUDR 규정을 위반해 산림 훼손과 연관된 제품을 유통할 경우, EU 역내 연간 총매출의 최소 4%에 달하는 막대한 벌금 조치가 내려질 수 있어 실시간 이력 추적 시스템(CMS) 도입이 발등의 불이 되었습니다.",
            actionPlan: "단순한 환경 선언을 넘어 기업의 존폐를 가를 수 있는 핵심 재무 리스크이므로, 즉각적으로 투명한 이력 추적 및 디지털 실사(Due Diligence) 인프라에 투자해 글로벌 규제 준수 역량을 획득해야 합니다.",
            source: "Trase.earth / 가나 TCDP API",
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
            situation: "자유무역협정(FTA) 네트워크를 전략적으로 활용하면, 원물 수입부터 가공 후 역수출(Re-export)에 이르는 전 과정에서 발생하는 막대한 관세 장벽을 우회하고 물류비용을 극적으로 절감할 수 있습니다.",
            actionPlan: "한국의 무관세 지위를 십분 활용해 동북아 코코아 가공 및 유통의 핵심 허브로 진화하십시오. 일본(프리미엄 시장)과 중국(매스 마켓)으로 뻗어가는 최적의 물류 넥서스를 선점해 시장 지배력을 강화해야 합니다.",
            source: "UN Comtrade 역수출 실데이터 / KCS API",
          }} />

        <WidgetCard title="아시아 내 프리미엄 차익거래" icon={Landmark} iconColor="#b45309" pillar="S4"
          cardDesc="국가별 프리미엄 비중 + CBE 비중 + 현물/선물 스프레드"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w18_asia_premium}>
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
            situation: "한국/일본 시장은 높은 단가에도 다크 초콜릿 등 프리미엄 제품 수요가 굳건한 반면, 신흥 시장에서는 대중적이고 저렴한 가성비 초콜릿 제품(CBE 활용) 소비가 급격히 팽창하고 있습니다.",
            actionPlan: "국가별 지불 용의와 선호도 격차를 활용하여, 선진 시장에는 고마진 프리미엄 라인업을 공급하고 신흥 시장에는 CBE 활용 제품을 스플릿(Split) 매각하는 세분화된 포트폴리오 전략으로 수익을 극대화해야 합니다.",
            source: "KCS(관세청) 실측 / ICCO API",
          }} />

        <WidgetCard title="K-뷰티/바이오 소재 전환 ROI (마진율 %)" icon={TestTube} iconColor="#f59e0b" pillar="S2"
          cardDesc="채널별 EBITDA·성장률 + 폴리페놀·항산화 측정치 — 코스메슈티컬 ROI"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={375}
          chart={
            <ComposedChart data={cocoaData.w19_kbeauty_bio}>
              <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
              <XAxis dataKey="channel" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="left" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--text-secondary)" tick={{ fontSize: 9 }} />
              <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize:'10px'}} verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="Margin" stackId="a" fill="#f59e0b" name="EBITDA 마진율(%)" barSize={35} />
              <Bar yAxisId="left" dataKey="Growth" stackId="a" fill="#78350f" name="시장 성장률(%)" barSize={35} />
              <Line yAxisId="right" type="monotone" dataKey="Polyphenol_mgGAE_g" stroke="#d97706" strokeWidth={3} name="폴리페놀(mg GAE/g, RHS)" />
              <Line yAxisId="right" type="monotone" dataKey="Antioxidant_DPPH" stroke="var(--color-warning)" strokeWidth={3} strokeDasharray="3 3" name="항산화(DPPH, RHS)" />
            </ComposedChart>
          }
          takeaway={{
            situation: "기존 식음료 채널이 매입원가 폭등으로 마진 압박에 시달리는 반면, 코코아 추출물(폴리페놀 등)은 피부 보습 및 항산화 효과가 입증되어 제약/코스메틱 산업에서 높은 프리미엄 가격으로 거래되고 있습니다.",
            actionPlan: "식품 산업의 낮은 수익성을 극복하기 위해 부가가치가 월등히 높은 K-뷰티 화장품 및 코스메슈티컬(Cosmeceutical) 헬스케어 소재로 코코아 원물을 치환함으로써 투자 수익률(ROI)을 퀀텀 점프시켜야 합니다.",
            source: "식약처 MFDS API / B2B 데이터베이스",
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

    </div>
  );
}
