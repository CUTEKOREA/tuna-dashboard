// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, ReferenceArea, ReferenceLine
} from 'recharts';
import {
  Globe, TrendingUp, AlertTriangle, Sprout, Factory, ShieldCheck, Banknote,
  BookOpen, Database, Zap, Activity, Workflow, DollarSign, Scale, RefreshCcw,
  Hexagon, Target, Truck, Layers, Coins, Leaf, MapPin, Landmark, Shield, Anchor,
  Dna, Gavel, TestTube, Recycle, ShieldAlert, EyeOff, Pill
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import TakeawayBox from './TakeawayBox';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
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

const KPI_THEMES = [
  { border: 'rgba(16,185,129,0.5)', glow: 'rgba(16,185,129,0.25)', text: 'var(--color-success)', icon: Globe },
  { border: 'rgba(56,189,248,0.5)', glow: 'rgba(56,189,248,0.25)', text: '#38bdf8', icon: TrendingUp },
  { border: 'rgba(239,68,68,0.5)', glow: 'rgba(239,68,68,0.25)', text: 'var(--color-danger)', icon: Factory },
  { border: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.25)', text: 'var(--color-warning)', icon: DollarSign },
  { border: 'rgba(139,92,246,0.5)', glow: 'rgba(139,92,246,0.25)', text: '#8b5cf6', icon: Scale },
  { border: 'rgba(236,72,153,0.5)', glow: 'rgba(236,72,153,0.25)', text: '#ec4899', icon: AlertTriangle },
];

const CASSAVA_KPIS: Record<string, any> = {
  k1: { title: '글로벌 가공 시장 (2026)', value: '$107.3B', trend: '📈', desc: '34년 $1,657억 초성장 전망' },
  k2: { title: '한중 메콩 2국 의존도', value: '99.9%', trend: '⚠️', desc: '공급망 다변화(가나) 시급' },
  k3: { title: '바이오플라스틱 프리미엄', value: '25x', trend: '🚀', desc: '칩($250) vs 완제품($6,400)' },
  k4: { title: '제약용 붕해제 영업이익률', value: '90%+', trend: '💊', desc: '의학/부형제 B2B 마진의 극한' },
  k5: { title: '가나 밀 수입 대체 시장', value: '$400M', trend: '📉', desc: 'HQCF 혼합 의무화 수혜 기대' },
  k6: { title: '생분해 비닐 도매가 ($/kg)', value: '6.4', trend: '⚓', desc: '일반 PE 대비 4-5배 프리미엄' },
};

const WIDGET_ICONS: Record<string, any> = {
  w01: Dna, w02: TestTube, w03: Recycle, w04: Workflow, w05: DollarSign,
  w06: AlertTriangle, w07: Target, w08: Landmark, w09: Factory, w10: TrendingUp,
  w_early_warning: ShieldAlert, w_arbitrage: Scale, w_esg: Leaf
};

const ACCENT_COLORS = ['var(--color-success)','#8b5cf6','var(--color-danger)','var(--color-info)','var(--color-warning)','#ec4899','#38bdf8','var(--color-warning)','var(--color-success)'];

const SECTIONS = [
  { id: "S1", title: "🧬 Part I — 4F 패러다임 전환 & 부가가치 확장", desc: "생분해성 수지, 변성전분 등 극한 마진 추구 지점 도출", color: "#8b5cf6", widgets: ["w10", "w01", "w02", "w03", "w_esg"] },
  { id: "S2", title: "🚢 Part II — 글로벌 공급망 병목 & 태국/베트남 독점 리스크", desc: "메콩 편중 현상 데이터 검증 및 가격/생물학적 리스크 전이율 분석", color: "var(--color-danger)", widgets: ["w_early_warning", "w04", "w05", "w06"] },
  { id: "S3", title: "🌍 Part III — 신라교역 5개국 시너지 넥서스 (Silla Co. 5-Hub Strategy)", desc: "어디서 조달하고 어디로 팔 것인가? 최적 권역별 미션 설정", color: "var(--color-info)", widgets: ["w07"] },
  { id: "S4", title: "🏭 Part IV — 아프리카(가나) 시장의 역발상 기회", desc: "식량안보 이슈(밀 수입 대체) 해결 및 조기 투자 CAPEX 타당성", color: "var(--color-warning)", widgets: ["w_arbitrage", "w08", "w09"] },
];

export default function CassavaDashboard() {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [showEdu, setShowEdu] = useState(true);
  
  useEffect(() => {
    Promise.all([
      fetch('/api/cassava').then(r => r.json()),
      fetch('/api/cassava/early-warning').then(r => r.json()),
      fetch('/api/cassava/arbitrage').then(r => r.json()),
      fetch('/api/cassava/esg').then(r => r.json())
    ])
    .then(([base, ew, arb, esg]) => {
      setWidgets([...(base.widgets || []), ew, arb, esg]);
    })
    .catch(e => console.error(e));
  }, []);

  if (widgets.length === 0) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:'1rem' }}>
      <RefreshCcw size={32} style={{ color:'var(--color-success)', animation:'spin 1s linear infinite' }} />
      <p style={{ color:'#94a3b8' }}>Loading High-Fidelity Cassava Intelligence...</p>
    </div>
  );

  const getWidget = (id: string) => widgets.find(w => w.id === id);

  const renderChart = (w: any) => {
    if (!w) return null;
    let d = w.data;
    if (!d?.length && w.id !== 'w04') return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />;
    const xAxis = <XAxis dataKey={w.xKey} stroke="#64748b" tick={{fontSize:9}} angle={d?.length > 6 ? -20 : 0} textAnchor={d?.length > 6 ? "end" : "middle"} height={d?.length > 6 ? 40 : 30} />;
    const yFmt = (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toLocaleString();

    if (w.id === 'w04') {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative', minHeight:'200px' }}>
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 400 250">
            <defs>
              <linearGradient id="gradientRed" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-success)" />
                <stop offset="100%" stopColor="var(--color-danger)" />
              </linearGradient>
            </defs>
            <path d="M 90 100 Q 170 60 250 60" fill="none" stroke="url(#gradientRed)" strokeWidth="46" opacity="0.6" className="animate-pulse" />
            <path d="M 90 120 Q 170 160 250 160" fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth="12" />
            <path d="M 90 130 Q 170 215 250 215" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="4" />
            
            <rect x="10" y="60" width="80" height="110" fill="rgba(16,185,129,0.15)" stroke="var(--color-success)" rx="8" />
            <text x="50" y="110" fill="var(--color-success)" fontSize="12" textAnchor="middle" fontWeight="bold">태국/베트남</text>
            <text x="50" y="130" fill="#cbd5e1" fontSize="10" textAnchor="middle">생산 점유 선도</text>
            
            <rect x="250" y="20" width="120" height="90" fill="rgba(239,68,68,0.15)" stroke="var(--color-danger)" rx="8" />
            <text x="310" y="60" fill="var(--color-danger)" fontSize="12" textAnchor="middle" fontWeight="bold">중국 (블랙홀)</text>
            <text x="310" y="80" fill="#cbd5e1" fontSize="10" textAnchor="middle">수출량 {w._liveMetadata?.chinaAbsorptionRate || '60~95%'} 흡수</text>

            <rect x="250" y="140" width="120" height="40" fill="rgba(59,130,246,0.15)" stroke="var(--color-info)" rx="6" />
            <text x="310" y="165" fill="var(--color-info)" fontSize="11" textAnchor="middle">기타 아시아</text>
            
            <rect x="250" y="200" width="120" height="30" fill="rgba(245,158,11,0.15)" stroke="var(--color-warning)" rx="6" />
            <text x="310" y="220" fill="var(--color-warning)" fontSize="11" textAnchor="middle">한국 ({w._liveMetadata?.thailandVietnamDependency || '99.9%'} 의존도)</text>
          </svg>
        </div>
      );
    }

    switch(w.chartType) {
      case "Area":
        return (
          <AreaChart data={d}>
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
              <Area key={i} type="monotone" dataKey={a.key} stroke={a.color} fill={`url(#aG${w.id}_${i})`} strokeWidth={2} connectNulls name={a.name} />
            ))}
          </AreaChart>
        );
      case "Bar":
        return (
          <BarChart data={d}>
            {grid}{xAxis}
            <YAxis stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{fill:'rgba(255,255,255,0.04)'}} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.bars?.map((b:any,i:number) => (
              <Bar key={i} dataKey={b.key} fill={b.color} radius={[4,4,0,0]} fillOpacity={0.85} name={b.name} />
            ))}
          </BarChart>
        );
      case "Line":
        return (
          <LineChart data={d}>
            {grid}{xAxis}
            <YAxis stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.lines?.map((l:any,i:number) => (
              <Line key={i} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={true} activeDot={{r:5}} name={l.name} />
            ))}
          </LineChart>
        );
      case "Composed":
        return (
          <ComposedChart data={d}>
            {grid}{xAxis}
            <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.bars?.map((b:any,i:number) => (
              <Bar yAxisId="left" key={`b${i}`} dataKey={b.key} fill={b.color} radius={[4,4,0,0]} fillOpacity={0.8} name={b.name} />
            ))}
            {w.lines?.map((l:any,i:number) => (
              <Line yAxisId="right" key={`l${i}`} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2.5} dot={true} activeDot={{r:5}} name={l.name} />
            ))}
          </ComposedChart>
        );
      case "Radar":
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={d}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey={w.xKey} tick={{fill:'#94a3b8', fontSize:10}} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fill:'#64748b', fontSize:8}} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.radars?.map((r:any, i:number) => (
              <Radar key={i} name={r.name} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.3} />
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
            <div style={{ width:'44px', height:'44px', borderRadius:'8px', background: 'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Sprout size={24} color="var(--color-success)" />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.5px', color: '#f8fafc' }}>
                카사바(Cassava) & 타피오카(Tapioca) 통합 인텔리전스
              </h1>
              <p style={{ margin:0, fontSize:'0.8rem', color:'#94a3b8' }}>원물(Cassava)에서 핵심 산업소재(Tapioca)로의 4F 밸류체인 진화 및 고부가가치화 전략</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ fontSize:'0.8rem', padding:'0.5rem 1rem', background: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius:'8px', color:'#94a3b8' }}>
              <span style={{ color:'var(--color-success)' }}>데이터 최종 동기화:</span> 2026-05-07 (Live API Connected)
            </div>
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {Object.keys(CASSAVA_KPIS).map((key, idx) => {
          const kpi = CASSAVA_KPIS[key]; const t = KPI_THEMES[idx % KPI_THEMES.length]; const I = t.icon;
          return (
            <div key={key} style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.03)', borderRadius:'12px', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'6px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-15px', right:'-15px', width:'60px', height:'60px', borderRadius:'50%', background:`radial-gradient(circle,${t.glow},transparent)`, pointerEvents:'none' }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.72rem', color:'#94a3b8', fontWeight:600 }}>{kpi.title}</span>
                <I size={14} style={{ color:t.text }} />
              </div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#f8fafc' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize:'0.68rem', color:t.text, fontWeight:600 }}>
                <span style={{ background:`${t.text}20`, padding:'2px 5px', borderRadius:'4px', marginRight:'4px' }}>{kpi.trend}</span>{kpi.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Educational Panel ═══ */}
      <div style={{ marginBottom:'2.5rem' }}>
        <button onClick={() => setShowEdu(!showEdu)} style={{
          width:'100%', background:'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius:'10px', padding:'1.2rem 1.5rem', display:'flex', alignItems:'center',
          justifyContent:'space-between', cursor:'pointer', transition:'all 0.2s', marginBottom: showEdu?'1rem':'0'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <BookOpen size={20} color="var(--color-success)" />
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--color-success)', marginBottom:'4px' }}>2026 Executive Summary: 카사바와 타피오카의 통합 밸류체인</div>
              <div style={{ fontSize:'0.8rem', color:'#94a3b8' }}>단순 구황작물(카사바)에서 글로벌 4F 산업(식량, 사료, 연료, 소재)의 최상위 마진 산업재(타피오카)로 진화</div>
            </div>
          </div>
          <div style={{ transform: showEdu?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.3s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </button>
        {showEdu && (
          <div style={{ background: '#181818', borderRadius:'10px', border: '1px solid rgba(255,255,255,0.05)', padding:'1.5rem', animation:'fadeIn 0.3s' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'1.5rem' }}>
              <div>
                <h3 style={{ color:'#8b5cf6', fontSize:'0.9rem', marginBottom:'0.6rem', display:'flex', alignItems:'center', gap:'6px' }}><Dna size={15}/> 4F 플랫폼 & 패러다임 전환 (Value Pivot)</h3>
                <p style={{ color:'#cbd5e1', fontSize:'0.82rem', lineHeight:1.6, margin:0 }}>
                  카사바(원료)를 타피오카(소재)로 정제하여 <strong>4F(Food, Feed, Fuel, Factory)</strong>로 확장합니다. 동물 사료용 칩 수출에 의존하던 저수익 구조에서 탈피해, 톤당 $6,400를 호가하는 <strong>생분해성 수지(PLA/PBAT)</strong> 및 영업이익률 90% 이상의 <strong>제약용 붕해제</strong> 등 고마진 바이오 소재로 중심축을 이동 중입니다.
                </p>
              </div>
              <div>
                <h3 style={{ color:'var(--color-success)', fontSize:'0.9rem', marginBottom:'0.6rem', display:'flex', alignItems:'center', gap:'6px' }}><Recycle size={15}/> 제로 웨이스트 & 순환경제 (Circular Economy)</h3>
                <p style={{ color:'#cbd5e1', fontSize:'0.82rem', lineHeight:1.6, margin:0 }}>
                  타피오카 추출 후 버려지던 찌꺼기(펄프)와 껍질을 발효해 고단백 사료/버섯 배지로 재자원화합니다. 또한 가공 공정의 폐수로 메탄가스(바이오가스)를 포집해 자체 전력 및 열원으로 전환, 숨겨진 비용(Hidden Cost)을 제로화하는 ESG 인프라 투자가 필수적입니다.
                </p>
              </div>
              <div>
                <h3 style={{ color:'var(--color-danger)', fontSize:'0.9rem', marginBottom:'0.6rem', display:'flex', alignItems:'center', gap:'6px' }}><AlertTriangle size={15}/> 가나(Ghana) 중심의 식량안보 & 헷징 전략</h3>
                <p style={{ color:'#cbd5e1', fontSize:'0.82rem', lineHeight:1.6, margin:0 }}>
                  한국의 수입 99.9%가 태국/베트남에 편중되어 있습니다. 이를 탈피하기 위해 가나를 서아프리카 HQCF(고품질 카사바 가루) 전초기지로 육성하여, $400M 규모의 현지 밀가루 수입 대체를 주도하고 글로벌 공급망 붕괴(안보 리스크)를 방어하는 <strong>수직 계열화 롤업 모델</strong>이 최우선 과제입니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Sections ═══ */}
      {SECTIONS.map((sec) => (
        <div key={sec.id} style={{ marginBottom: '4rem' }}>
          <div style={{ marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <div style={{ width:'4px', height:'28px', background:`linear-gradient(180deg,${sec.color},${sec.color}99)`, borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.2rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.3px' }}>{sec.title}</h2>
              <p style={{ margin:'4px 0 0 0', fontSize:'0.8rem', color:'#94a3b8' }}>{sec.desc}</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%,500px), 1fr))', gap:'1.5rem' }}>
            {sec.widgets.map((wId: string, idx: number) => {
              const w = getWidget(wId);
              if (!w) return null;
              const Icon = WIDGET_ICONS[w.id] || Hexagon;
              const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length] || sec.color;
              return (
                <div key={w.id} className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'500px' }}>
                  <div style={{ marginBottom:'1rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.8rem' }}>
                    <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:700, color:accent, margin:'0 0 0.4rem' }}>
                      <Icon size={18} />{w.title}
                    </h3>
                    {w.subtitle && <p style={{ margin:0, fontSize:'0.8rem', color:'#94a3b8', lineHeight:1.5 }}>{w.subtitle}</p>}
                  </div>
                  <div style={{ height:'260px', width:'100%', marginBottom:'1rem' }}>
                    <SafeResponsiveContainer width="100%" height="100%">{renderChart(w)}</SafeResponsiveContainer>
                  </div>
                  <div style={{ marginTop:'auto' }}>
                    <TakeawayBox
                      situation={w.sit}
                      actionPlan={w.strat}
                      source={w.source}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
}
