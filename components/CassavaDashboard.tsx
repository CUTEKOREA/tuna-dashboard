// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, ReferenceArea, ReferenceLine, Sankey
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

const CASSAVA_THEME = {
  primary: '#b45309',
  secondary: '#d97706',
  tertiary: '#f59e0b',
  quaternary: '#fbbf24',
  neutral: '#fcd34d'
};

const ACCENT_COLORS = [CASSAVA_THEME.primary, CASSAVA_THEME.secondary, CASSAVA_THEME.tertiary, CASSAVA_THEME.quaternary, CASSAVA_THEME.neutral];

const KPI_THEMES = [
  { border: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.25)', text: CASSAVA_THEME.tertiary, icon: Globe },
  { border: 'rgba(217,119,6,0.5)', glow: 'rgba(217,119,6,0.25)', text: CASSAVA_THEME.secondary, icon: TrendingUp },
  { border: 'rgba(180,83,9,0.5)', glow: 'rgba(180,83,9,0.25)', text: CASSAVA_THEME.primary, icon: Factory },
  { border: 'rgba(251,191,36,0.5)', glow: 'rgba(251,191,36,0.25)', text: CASSAVA_THEME.quaternary, icon: DollarSign },
  { border: 'rgba(252,211,77,0.5)', glow: 'rgba(252,211,77,0.25)', text: CASSAVA_THEME.neutral, icon: Scale },
  { border: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.25)', text: CASSAVA_THEME.tertiary, icon: AlertTriangle },
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

const SECTIONS = [
  { id: "S1", title: "원물 수급 및 글로벌 생산", desc: "기후 리스크 및 태국/베트남 등 핵심 산지 공급망 의존도 분석", color: CASSAVA_THEME.tertiary, widgets: ["w_early_warning", "w04"] },
  { id: "S2", title: "가공 및 부가가치 창출", desc: "4F 패러다임 전환 및 붕해제/바이오수지 마진 분석", color: CASSAVA_THEME.primary, widgets: ["w10", "w01", "w02"] },
  { id: "S3", title: "물류 및 유통", desc: "수입국 종속 리스크 및 글로벌 물류 허브 간 차익 거래", color: CASSAVA_THEME.secondary, widgets: ["w07", "w_arbitrage", "w05"] },
  { id: "S4", title: "판매 및 시장 수요", desc: "아프리카 시장의 역발상 기회 및 대체재 수입 대체 효과", color: CASSAVA_THEME.neutral, widgets: ["w08", "w09", "w06"] },
  { id: "S5", title: "ESG 및 지속가능성", desc: "펄프/껍질 재자원화, 바이오가스 포집을 통한 공정 내 전력 순환", color: CASSAVA_THEME.quaternary, widgets: ["w03", "w_esg"] }
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
      <RefreshCcw size={32} style={{ color:CASSAVA_THEME.tertiary, animation:'spin 1s linear infinite' }} />
      <p style={{ color:'#94a3b8' }}>Loading High-Fidelity Cassava Intelligence...</p>
    </div>
  );

  const getWidget = (id: string) => widgets.find(w => w.id === id);

  const renderChart = (w: any) => {
    if (!w) return null;
    let d = w.data;
    if (!d?.length && w.id !== 'w04') return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />;
    const xFmt = (v: any) => { if (typeof v !== 'string') return v; let s = v.replace(/\([^)]*\)/g, '').trim(); return s.length > 6 ? s.slice(0,6)+'..' : s; };
    const xAxis = <XAxis dataKey={w.xKey} stroke="#64748b" tick={{fontSize:9}} angle={d?.length > 6 ? -20 : 0} textAnchor={d?.length > 6 ? "end" : "middle"} height={d?.length > 6 ? 40 : 30} tickFormatter={xFmt} />;
    const yFmt = (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toLocaleString();

    if (w.id === 'w04') {
      const sankeyData = {
        nodes: [
          { name: '태국/베트남' },
          { name: '가나 (신규 Hub)' },
          { name: '중국 (블랙홀)' },
          { name: '기타 아시아' },
          { name: '한국' }
        ],
        links: [
          { source: 0, target: 2, value: 75 },
          { source: 0, target: 3, value: 15 },
          { source: 0, target: 4, value: 5 },
          { source: 1, target: 4, value: 5 }
        ]
      };
      
      const renderCustomNode = ({ x, y, width, height, index, payload }: any) => {
        const isTarget = index >= 2;
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill={isTarget ? CASSAVA_THEME.primary : CASSAVA_THEME.tertiary} rx="2" />
            <text x={x + width / 2} y={y - 8} fill="#f8fafc" fontSize="11" textAnchor="middle" fontWeight="bold">
              {payload.name}
            </text>
          </g>
        );
      };

      const renderCustomLink = ({ sourceX, sourceY, targetX, targetY, sourceControlX, targetControlX, linkWidth }: any) => {
        return (
          <path
            d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
            fill="none"
            stroke={CASSAVA_THEME.secondary}
            strokeWidth={linkWidth}
            strokeOpacity={0.2}
          />
        );
      };

      return (
        <Sankey
          data={sankeyData}
          margin={{ top: 30, left: 20, right: 20, bottom: 20 }}
          node={renderCustomNode}
          link={renderCustomLink}
        >
          <RechartsTooltip />
        </Sankey>
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
              <Sprout size={24} color={CASSAVA_THEME.tertiary} />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.5px', color: '#f8fafc' }}>
                카사바 & 타피오카 통합 인텔리전스
              </h1>
              <p style={{ margin:0, fontSize:'0.8rem', color:'#94a3b8' }}>원물에서 핵심 산업소재로의 4F 밸류체인 진화 및 고부가가치화 전략</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ fontSize:'0.8rem', padding:'0.5rem 1rem', background: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius:'8px', color:'#94a3b8' }}>
              <span style={{ color:CASSAVA_THEME.tertiary }}>데이터 최종 동기화:</span> 2026-05-07 (Live API Connected)
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
          width:'100%', background:'rgba(245,158,11,0.05)', border: `1px solid ${CASSAVA_THEME.tertiary}33`,
          borderRadius:'10px', padding:'1.2rem 1.5rem', display:'flex', alignItems:'center',
          justifyContent:'space-between', cursor:'pointer', transition:'all 0.2s', marginBottom: showEdu?'1rem':'0'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <BookOpen size={20} color={CASSAVA_THEME.tertiary} />
            <div style={{ textAlign:'left' }}>
              <div style={{ fontSize:'1.05rem', fontWeight:700, color:CASSAVA_THEME.tertiary, marginBottom:'4px' }}>2026 전략 요약: 카사바와 타피오카의 통합 밸류체인</div>
              <div style={{ fontSize:'0.8rem', color:'#94a3b8' }}>단순 구황작물에서 글로벌 4F 산업의 최상위 마진 산업재로 진화</div>
            </div>
          </div>
          <div style={{ transform: showEdu?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.3s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CASSAVA_THEME.tertiary} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </button>
        {showEdu && (
          <div style={{ background: '#181818', borderRadius:'10px', border: '1px solid rgba(255,255,255,0.05)', padding:'1.5rem', animation:'fadeIn 0.3s' }}>
            <div style={{ display:'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap:'1.5rem' }}>
              <div>
                <h3 style={{ color:CASSAVA_THEME.primary, fontSize:'0.9rem', marginBottom:'0.6rem', display:'flex', alignItems:'center', gap:'6px' }}><Dna size={15}/> 4F 플랫폼 & 패러다임 전환 (Value Pivot)</h3>
                <p style={{ color:'#cbd5e1', fontSize:'0.82rem', lineHeight:1.6, margin:0 }}>
                  카사바(원료)를 타피오카(소재)로 정제하여 <strong>4F(Food, Feed, Fuel, Factory)</strong>로 확장합니다. 동물 사료용 칩 수출에 의존하던 저수익 구조에서 탈피해, 톤당 $6,400를 호가하는 <strong>생분해성 수지(PLA/PBAT)</strong> 및 영업이익률 90% 이상의 <strong>제약용 붕해제</strong> 등 고마진 바이오 소재로 중심축을 이동 중입니다.
                </p>
              </div>
              <div>
                <h3 style={{ color:CASSAVA_THEME.secondary, fontSize:'0.9rem', marginBottom:'0.6rem', display:'flex', alignItems:'center', gap:'6px' }}><Recycle size={15}/> 제로 웨이스트 & 순환경제 (Circular Economy)</h3>
              </div>
              <div>
                <h3 style={{ color:CASSAVA_THEME.tertiary, fontSize:'0.9rem', marginBottom:'0.6rem', display:'flex', alignItems:'center', gap:'6px' }}><AlertTriangle size={15}/> 가나(Ghana) 중심의 식량안보 & 헷징 전략</h3>
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem' }}>
            {sec.widgets.map((wId: string, idx: number) => {
              const w = getWidget(wId);
              if (!w) return null;
              const Icon = WIDGET_ICONS[w.id] || Hexagon;
              const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length] || sec.color;
              const isLastOdd = (sec.widgets.length % 2 !== 0) && (idx === sec.widgets.length - 1);
              return (
                <div key={w.id} className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'500px', gridColumn: isLastOdd ? '1 / -1' : 'auto' }}>
                  <div style={{ marginBottom:'1rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:700, color:accent, margin:'0 0 0.4rem' }}>
                        <Icon size={18} />{w.title}
                      </h3>
                      {w.subtitle && <p style={{ margin:0, fontSize:'0.8rem', color:'#94a3b8', lineHeight:1.5 }}>{w.subtitle}</p>}
                    </div>
                    <TelemetryBadge status={w.id.startsWith('w_') || w.source?.includes('Live') ? 'live' : 'synced'} syncDate="2026.05.15" />
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
