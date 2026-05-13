// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceArea
} from 'recharts';
import {
  Globe, TrendingUp, AlertTriangle, Factory, DollarSign, Scale, RefreshCcw,
  Target, Layers, Leaf, Landmark, Shield, Dna, Workflow, ShieldAlert, Building2,
  BookOpen, Database, Zap, Activity
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
  { border: 'rgba(236,72,153,0.5)', glow: 'rgba(236,72,153,0.25)', text: '#ec4899', icon: ShieldAlert },
];

const CHICKEN_KPIS: Record<string, any> = {
  k1: { title: '태국산 수입 점유율 (현재/목표)', value: '13%→25%', trend: '📈', desc: 'HPAI 전환 시나리오 기반' },
  k2: { title: '한국 총 수입량 (2023 역대최대)', value: '23.5만톤', trend: '💰', desc: 'TRQ 0% 관세 효과' },
  k3: { title: '프라두 항덤 폭염 생존율', value: '95%+', trend: '🛡️', desc: '일반 육계 대비 35%p 우위' },
  k4: { title: '가공육(Processed) 수입 비중', value: '64.5%', trend: '🍗', desc: '태국 가공육 세계 1위' },
  k5: { title: 'CBOT 옥수수 (YoY)', value: '$4.15↓', trend: '📉', desc: '사료비 3년 연속 하락세' },
  k6: { title: 'HPAI 청정 점수', value: 'S-Grade', trend: '✨', desc: '2009년 이후 청정 유지' },
};

const WIDGET_ICONS: Record<string, any> = {
  w_chicken_global_production: Globe,
  w_chicken_global_export: Target,
  w_chicken_trade_shift: Globe,
  w_chicken_arbitrage: Scale,
  w_chicken_risk_radar: ShieldAlert,
  w_chicken_processing: Factory,
  w_chicken_corporates: Building2,
  w_chicken_feed_cost: Leaf,
  w_chicken_eudr_esg: Shield
};

const ACCENT_COLORS = ['var(--color-info)', 'var(--color-success)', 'var(--color-danger)', 'var(--color-warning)', '#8b5cf6', '#ec4899'];

const SECTIONS = [
  { id: "S0", title: "🌍 Part I — 글로벌 생산 및 수출 패권 (Macro View)", desc: "거대 내수 시장(미국/중국) vs 글로벌 수출 기지(브라질/태국)의 주도권 분석", color: "#8b5cf6", widgets: ["w_chicken_global_production", "w_chicken_global_export"] }
];

import ChickenEmpiricalInsights from './ChickenEmpiricalInsights';
import ChickenCorporateWidget from './ChickenCorporateWidget';
import ChickenPartsWidget from './ChickenPartsWidget';
import { InsightTimeGapArbitrage, InsightChannelMatrix, InsightVMILockin } from './ChickenThaiInsightsA';
import { InsightKoreaSpecialLine, InsightRiskNexus, InsightPartnerMatch } from './ChickenThaiInsightsB';

export default function ChickenDashboard() {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [showEdu, setShowEdu] = useState(true);
  
  useEffect(() => {
    Promise.all([
      fetch('/api/chicken/global-production').then(r => r.json()),
      fetch('/api/chicken/global-export').then(r => r.json()),
      fetch('/api/chicken/trade-shift').then(r => r.json()),
      fetch('/api/chicken/arbitrage').then(r => r.json()),
      fetch('/api/chicken/risk-radar').then(r => r.json()),
      fetch('/api/chicken/processing').then(r => r.json()),
      fetch('/api/chicken/corporates').then(r => r.json()),
      fetch('/api/chicken/feed-cost').then(r => r.json()),
      fetch('/api/chicken/eudr-esg').then(r => r.json())
    ])
    .then(([gProd, gExp, trade, arb, risk, proc, corp, feed, eudr]) => {
      setWidgets([gProd, gExp, trade, arb, risk, proc, corp, feed, eudr]);
    })
    .catch(e => console.error(e));
  }, []);

  if (widgets.length === 0) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column', gap:'1rem' }}>
      <RefreshCcw size={32} style={{ color:'var(--color-success)', animation:'spin 1s linear infinite' }} />
      <p style={{ color:'#94a3b8' }}>Loading S-Grade Chicken Intelligence...</p>
    </div>
  );

  const getWidget = (id: string) => widgets.find(w => w.id === id);

  const renderChart = (w: any) => {
    if (!w) return null;
    let d = w.data;
    
    if (!d?.length) return <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>No Data</div>;
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />;
    
    // Handle forecast visualization
    const forecastStartIndex = d.findIndex((item: any) => item.isForecast);
    const hasForecast = forecastStartIndex !== -1;
    const forecastStartKey = hasForecast ? d[forecastStartIndex][w.xKey] : null;
    const forecastEndKey = hasForecast ? d[d.length - 1][w.xKey] : null;

    const CustomXAxisTick = (props: any) => {
      const { x, y, payload } = props;
      const item = d.find((i: any) => i[w.xKey] === payload.value);
      const isForecast = item?.isForecast;
      return (
        <g transform={`translate(${x},${y})`}>
          <text 
            x={0} y={0} dy={16} 
            textAnchor={d?.length > 6 ? "end" : "middle"} 
            fill={isForecast ? 'var(--color-warning)' : '#64748b'} 
            fontSize={9} 
            fontStyle={isForecast ? 'italic' : 'normal'}
            fontWeight={isForecast ? 'bold' : 'normal'}
            transform={d?.length > 6 ? "rotate(-20)" : ""}
          >
            {payload.value}
          </text>
        </g>
      );
    };

    const xAxis = <XAxis dataKey={w.xKey} stroke="#64748b" tick={<CustomXAxisTick />} height={d?.length > 6 ? 40 : 30} />;
    const yFmt = (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v.toLocaleString();

    switch(w.chartType) {
      case "Bar":
        return (
          <BarChart data={d}>
            {grid}{xAxis}
            {w.bars && <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {hasForecast && <ReferenceArea x1={forecastStartKey} x2={forecastEndKey} fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.2)" strokeDasharray="3 3" />}
            {w.bars?.map((b:any,i:number) => (
              <Bar yAxisId="left" key={`b${i}`} dataKey={b.key} fill={b.color} radius={[4,4,0,0]} fillOpacity={0.8} name={b.name} />
            ))}
          </BarChart>
        );
      case "Composed":
        return (
          <ComposedChart data={d}>
            {grid}{xAxis}
            {w.areas && <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />}
            {w.bars && <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />}
            {w.lines && <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize:9}} tickFormatter={yFmt} />}
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {hasForecast && <ReferenceArea x1={forecastStartKey} x2={forecastEndKey} fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.2)" strokeDasharray="3 3" />}
            {w.areas?.map((a:any,i:number) => (
              <Area yAxisId="left" key={`a${i}`} type="monotone" dataKey={a.key} fill={a.color} stroke={a.color} fillOpacity={0.4} strokeWidth={2} name={a.name} />
            ))}
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
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fontSize:9, fill:'#64748b'}} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize:'10px'}} />
            {w.radars?.map((r:any,i:number) => (
              <Radar key={i} name={r.name} dataKey={r.key} stroke={r.color} fill={r.color} fillOpacity={0.3} />
            ))}
          </RadarChart>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding:'0 1.5rem 3rem', color:'#f8fafc', minHeight:'100vh', fontFamily:"'Inter',sans-serif" }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'8px', background: 'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Factory size={24} color="var(--color-warning)" />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.5px', color: '#f8fafc' }}>
                🐔 양계(Poultry) 글로벌 밸류체인 장악 대시보드
              </h1>
              <p style={{ margin:0, fontSize:'0.8rem', color:'#94a3b8' }}>
                실시간 OIE, KAMIS, KCS API 통합 텔레메트리 기반 브라질/태국 수출입 패권 변동 및 차익거래 스프레드 분석
              </p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ fontSize:'0.8rem', padding:'0.5rem 1rem', background: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius:'8px', color:'#94a3b8' }}>
              <span style={{ color:'var(--color-warning)' }}>S-Grade Command Center:</span> Live API Connected
            </div>
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {Object.keys(CHICKEN_KPIS).map((key, idx) => {
          const kpi = CHICKEN_KPIS[key]; const t = KPI_THEMES[idx % KPI_THEMES.length]; const I = t.icon;
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
                <span style={{ background:`${t.text}20`, padding:'2px 5px', borderRadius:'4px', marginRight:'4px' }}>{kpi.trend}</span>{kpi.desc || kpi.인건비}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Education Toggle ═══ */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowEdu(!showEdu)}
          style={{ 
            width: '100%', background: '#181818', 
            borderRadius: '8px', border: 'none',
            padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: showEdu ? '1rem' : '0'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#181818'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <BookOpen size={20} color="var(--color-info)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>신입직원 교육 가이드</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>OIE 및 KAMIS 실제 데이터 기반 — HPAI 패닉 바잉과 태국산 가공육 전환 로직</div>
            </div>
          </div>
          <div style={{ transform: showEdu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </button>

        {showEdu && (
          <div style={{ 
            background: '#181818', 
            borderRadius: '8px', 
            padding: '1.5rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              
              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '8px' }}>
                <h3 style={{ color: 'var(--color-info)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Globe size={16}/> 핵심 구조: 글로벌 쇼티지와 HPAI 넥서스
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7 }}>
                  <strong style={{color:'#f8fafc'}}>생산(Shortage):</strong> 브라질의 HPAI(고병원성 조류인플루엔자) 발병 시 수입 금지로 인해 국내 수급이 즉각적으로 붕괴됨.<br/>
                  <strong style={{color:'#f8fafc'}}>가공(Hubs):</strong> 단순 냉동육은 브라질에 의존하지만, 부가가치가 높은 가공육(순살, 꼬치 등)은 태국이 독점하고 있음.<br/>
                  <strong style={{color:'#f8fafc'}}>무역(Nexus):</strong> 한국 프랜차이즈 B2B 시장은 점차 태국산 가공육 스펙인(Spec-in)으로 이동하고 있어 "시간 차익거래"가 가능함.
                </div>
              </div>

              <div style={{ background: 'var(--surface-3)', padding: '1.2rem', borderRadius: '8px' }}>
                <h3 style={{ color: 'var(--color-info)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Workflow size={16}/> 전략적 시사점: 원가 방어와 EUDR
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.7 }}>
                  <li><strong style={{color:'#f8fafc'}}>공급망 다변화:</strong> 브라질 HPAI 수입금지에 대비해 태국 우량 기업(GFPT, Betagro)과 선도 계약(LTA) 체결 필수.</li>
                  <li><strong style={{color:'#f8fafc'}}>마진 스프레드:</strong> 곡물가 하락 시기에 매집하여 여름철(복날) 쇼티지 방출 시 20~30% 이상의 마진 확보 가능.</li>
                  <li><strong style={{color:'#f8fafc'}}>ESG(EUDR):</strong> 태국 대기업들은 EUDR 규제(2025)에 완벽히 대응하고 있어, 오히려 중소형 브라질 업체를 밀어내는 '녹색 진입장벽'으로 작용함.</li>
                </ul>
              </div>
            </div>

            <div style={{ 
              background: 'var(--surface-3)', 
              padding: '1.2rem 1.5rem', 
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.8rem', borderRadius: '50%' }}>
                  <Database size={20} color="var(--color-info)" />
                </div>
                <div>
                  <h3 style={{ color: '#f8fafc', margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700 }}><Zap size={16} color="var(--color-info)" style={{ verticalAlign: 'middle', marginRight: '4px' }} /> NotebookLM 양계 AI 챗봇</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>OIE 수급, KAMIS 물가, KCS 수입 통계가 학습된 맞춤형 AI입니다.</p>
                </div>
              </div>
              <a 
                href="https://notebooklm.google.com/notebook/cd852c31-5b2d-4433-99aa-1fcae8cb0129" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  background: 'var(--color-info)', 
                  color: 'var(--text-primary)', 
                  padding: '0.7rem 1.3rem', 
                  borderRadius: '20px', 
                  fontSize: '0.9rem', 
                  fontWeight: 700, 
                  textDecoration: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s, transform 0.1s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-info)'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Activity size={16} /> 챗봇 시작
              </a>
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
              const Icon = WIDGET_ICONS[w.id] || Target;
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

      {/* ═══ Custom Premium Widgets ═══ */}
      <div style={{ marginBottom: '4rem' }}>
        <ChickenEmpiricalInsights />
      </div>
      
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
          <div style={{ width:'4px', height:'28px', background:`linear-gradient(180deg,#3b82f6,#3b82f699)`, borderRadius:'2px' }} />
          <div>
            <h2 style={{ margin:0, fontSize:'1.2rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.3px' }}>🚢 Part II — 글로벌 수입 패권 이동 (Brazil to Thailand)</h2>
            <p style={{ margin:'4px 0 0 0', fontSize:'0.8rem', color:'#94a3b8' }}>HPAI와 운임 폭등이 촉발한 브라질 몰락과 태국 가공육의 부상 및 기업 구조</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {/* Render Trade Shift manually next to Corporate */}
          {(() => {
          const w = getWidget("w_chicken_trade_shift");
          if (!w) return null;
          const Icon = WIDGET_ICONS[w.id] || Target;
          return (
            <div className={styles.glassCard} style={{ display:'flex', flexDirection:'column', minHeight:'500px' }}>
              <div style={{ marginBottom:'1rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.8rem' }}>
                <h3 style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.95rem', fontWeight:700, color:"var(--color-info)", margin:'0 0 0.4rem' }}>
                  <Icon size={18} />{w.title}
                </h3>
                {w.subtitle && <p style={{ margin:0, fontSize:'0.8rem', color:'#94a3b8', lineHeight:1.5 }}>{w.subtitle}</p>}
              </div>
              <div style={{ height:'260px', width:'100%', marginBottom:'1rem' }}>
                <SafeResponsiveContainer width="100%" height="100%">{renderChart(w)}</SafeResponsiveContainer>
              </div>
              <div style={{ marginTop:'auto' }}>
                <TakeawayBox situation={w.sit} actionPlan={w.strat} source={w.source} />
              </div>
            </div>
          );
        })()}
        
        <ChickenCorporateWidget />
        </div>
      </div>

      {/* ═══ Part III — 부위별(Parts) 전략 및 차익거래 ═══ */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
          <div style={{ width:'4px', height:'28px', background:`linear-gradient(180deg,#eab308,#eab30899)`, borderRadius:'2px' }} />
          <div>
            <h2 style={{ margin:0, fontSize:'1.2rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.3px' }}>🔪 Part III — 부위별(Parts) 차익거래 및 마진 분석</h2>
            <p style={{ margin:'4px 0 0 0', fontSize:'0.8rem', color:'#94a3b8' }}>브라질 원물 한계 vs 태국 프리미엄 수작업 발골 수율 기반 차익거래 전략</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <ChickenPartsWidget />
        </div>
      </div>

      {/* ═══ Part IV — 사료비 & ESG/EUDR 리스크 ═══ */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
          <div style={{ width:'4px', height:'28px', background:`linear-gradient(180deg,#10b981,#10b98199)`, borderRadius:'2px' }} />
          <div>
            <h2 style={{ margin:0, fontSize:'1.2rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.3px' }}>🌱 Part IV — 사료비 동향 & ESG/EUDR 규제 리스크</h2>
            <p style={{ margin:'4px 0 0 0', fontSize:'0.8rem', color:'#94a3b8' }}>곡물가 하락에 따른 마진 윈도우 및 EU 삼림벌채방지법(EUDR) 규제 대응 현황</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {['w_chicken_feed_cost', 'w_chicken_eudr_esg'].map((wId, idx) => {
            const w = getWidget(wId);
            if (!w) return null;
            const Icon = WIDGET_ICONS[w.id] || Target;
            const accent = idx === 0 ? 'var(--color-success)' : 'var(--color-warning)';
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

      {/* ═══ Part V — 태국산 한국 수입 전략 인텔리전스 ═══ */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
          <div style={{ width:'4px', height:'28px', background:`linear-gradient(180deg,#ef4444,#ef444499)`, borderRadius:'2px' }} />
          <div>
            <h2 style={{ margin:0, fontSize:'1.2rem', fontWeight:800, color:'#f8fafc', letterSpacing:'-0.3px' }}>🔥 Part V — 태국산 한국 수입 전략 인텔리전스 (Thai Import Strategy)</h2>
            <p style={{ margin:'4px 0 0 0', fontSize:'0.8rem', color:'#94a3b8' }}>NotebookLM 479소스 × 로컬 API 교차 분석 — PE C-Level 블라인드 스팟 6선</p>
          </div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '10px 14px', borderRadius: '8px', color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="#ef4444" />
          태국산 닭고기 → 한국 수입 판매 사업 기회 교차 분석. KAMIS·KCS·OIE·Thai DLD·CP Foods·GFPT·Betagro IR 데이터 기반.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <InsightTimeGapArbitrage />
          <InsightChannelMatrix />
          <InsightVMILockin />
          <InsightKoreaSpecialLine />
          <InsightRiskNexus />
          <InsightPartnerMatch />
        </div>
      </div>

    </div>
  );
}
