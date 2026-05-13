// @ts-nocheck
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
  Globe, TrendingUp, AlertTriangle, Factory, DollarSign, Scale, RefreshCcw,
  Target, Layers, Leaf, Landmark, Shield, Dna, Workflow, ShieldAlert, Building2,
  BookOpen, Database, Zap, Activity, Ship, Navigation, Snowflake, Anchor, Link as LinkIcon,
  Fish, TrendingDown, Beaker, Thermometer, ShoppingBag, Recycle, Package, FlaskConical
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css'; // Reusing established styles
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';

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

// --- DATA ---
const IMPORT_COLORS = ['var(--color-info)', 'var(--color-success)', 'var(--color-danger)', 'var(--color-warning)', '#8b5cf6'];

export default function WhelkDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/whelk_real_data_v1.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching whelk data:', err));
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '2rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <RefreshCcw className="animate-spin" size={24} color="var(--color-info)" />
        <span>Loading Whelk Intelligence...</span>
      </div>
    );
  }

  const {
    globalCaptureData = [],
    canadaCaptureData = [],
    koreaCaptureData = [],
    importMarketShare = [],
    seasonalityData = [],
    yieldArbitrageData = [],
    waterfallData = [],
    brandPositioningData = [],
    channelDemandData = [],
    fxCorrelationData = [],
    ukRegulatoryRadar = [],
    aquacultureData = [],
    cadmiumData = [],
    importSurgeData = [],
    byproductData = [],
    solidContentData = [],
    climateRiskData = []
  } = data;
  
  return (
    <div style={{ padding:'0 1.5rem 3rem', color:'#f8fafc', minHeight:'100vh', fontFamily:"'Inter',sans-serif" }}>
      {/* HEADER */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: 'var(--color-info)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Anchor size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                골뱅이 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Whelk Strategic Command Center — 17 Widgets · 4 KPIs</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-info)', boxShadow: '0 0 8px #3b82f6', animation: 'pulse 2s infinite' }} />
            <span><span style={{ color: 'var(--color-info)' }}>KCS Trade Data</span> · Claude Verified</span>
          </div>
        </div>
      </header>

      {/* 4 KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="ds-card" style={{background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>UK Import Dependence</span>
            <Globe size={16} style={{ color: 'var(--color-info)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>52.1%</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-info)', fontWeight: 600 }}>
            <span style={{ background: '#3b82f620', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>HS160559</span> 2024년 기준
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>UK Landed Cost (Avg)</span>
            <DollarSign size={16} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>$12.8/kg</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-success)', fontWeight: 600 }}>
            <span style={{ background: '#10b98120', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>부산항</span> 도착가
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Canada Catch Decline</span>
            <TrendingDown size={16} style={{ color: 'var(--color-danger)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>-74%</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-danger)', fontWeight: 600 }}>
            <span style={{ background: '#ef444420', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>▼ 하락</span> 10년 장기 추세
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>UK Meat Yield</span>
            <Scale size={16} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>20-25%</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-warning)', fontWeight: 600 }}>
            <span style={{ background: '#f59e0b20', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>수율</span> 타 원산지 대비 2배
          </div>
        </div>
      </div>

      {/* Education Module & Chatbot */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          style={{ 
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderBottom: 'none', color: 'var(--text-primary)', cursor: 'default', textAlign: 'left', borderRadius: '8px 8px 0 0', boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px', marginBottom: '0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BookOpen size={24} color="var(--color-info)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>신입직원 교육 가이드</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>NotebookLM 분석 기반: 골뱅이 밸류체인 및 수급 동향 파악</div>
            </div>
          </div>
        </button>

        <div style={{ 
          background: 'var(--bg-color)', 
          padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
          borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', 
          boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px', marginBottom: '2rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            
            {/* Module 1: 품종별 특징 */}
            <div className="ds-card" style={{background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
              <h3 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                <Anchor size={20} color="var(--color-info)"/> 조업 방식 및 주요 어종 (Species)
              </h3>
              
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', marginBottom: '1rem' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Fish size={16}/> B. undatum (물레고둥/백골뱅이)
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{color:'var(--text-primary)'}}>원산지:</strong> 영국, 아일랜드 등 북대서양<br/>
                  <strong style={{color:'var(--text-primary)'}}>특징:</strong> 한국 통조림 시장을 지배하는 프리미엄 원물. 수율이 20~25%로 높고 맛이 우수하여 B2C 수요가 높음.
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={16}/> R. venosa (피뿔고둥/참골뱅이)
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong style={{color:'var(--text-primary)'}}>원산지:</strong> 흑해(튀르키예, 불가리아), 중국 등<br/>
                  <strong style={{color:'var(--text-primary)'}}>특징:</strong> 가격이 저렴하나 수율이 13~15%로 낮음. 주로 B2B(업소용) 썰은 골뱅이 통조림으로 활용됨.
                </div>
              </div>
            </div>

            {/* Module 2 & 3 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="ds-card" style={{background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                  <Workflow size={20} color="var(--color-info)"/> 골뱅이 밸류체인 핵심 구조
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <li><strong style={{color:'var(--text-primary)'}}>어획(조업):</strong> 통발을 사용하며, <TermTooltip term="TAC" description="Total Allowable Catch (총허용어획량). 어획량을 할당 및 통제하는 핵심 규제 장치." />(총허용어획량) 및 해양 기후변화에 매우 민감.</li>
                  <li><strong style={{color:'var(--text-primary)'}}>가공(해외):</strong> 원산지에서 자숙(Boiling), 탈각(Shucking), 내장 제거를 거쳐 냉동 상태로 한국 수출.</li>
                  <li><strong style={{color:'var(--text-primary)'}}>제조(국내):</strong> 냉동 원물을 해동 후 통조림으로 제조(유동, 동원, F&B 등). 간장/조미액 배합이 핵심 기술.</li>
                </ul>
              </div>
              
              <div className="ds-card" style={{background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', flex: 1}}>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.13rem', fontWeight: 700 }}>
                  <AlertTriangle size={20} color="var(--color-danger)"/> 육상부서 필수 체크: 주요 리스크
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <li><strong style={{color:'var(--text-primary)'}}>어획량 감소:</strong> 수온 상승으로 캐나다 등 전통적 어장 붕괴, 북해(영국) 의존도 심화.</li>
                  <li><strong style={{color:'var(--text-primary)'}}>환율/물류비:</strong> 원물의 100%를 수입에 의존하므로, 환율 상승과 해상 운임(Reefer) 상승이 마진 직격탄.</li>
                  <li><strong style={{color:'var(--text-primary)'}}>대체 조달처 발굴:</strong> 영국산 가격 폭등 시 아일랜드, 또는 튀르키예산과의 블렌딩 전략 필요.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Module 4: AI Chatbot (NotebookLM Link) */}
          <div className="ds-card" style={{background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: 'var(--surface-2)', padding: '1rem', borderRadius: '50%', flexShrink: 0 }}>
                <Database size={24} color="var(--color-info)" />
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.4rem 0', fontSize: '1.13rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="var(--color-info)" /> 골뱅이 지식 AI 챗봇 (NotebookLM)
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  방대한 골뱅이 산업 보고서, 밸류체인 무역 데이터가 학습된 맞춤형 AI입니다. 글로벌 시장 동향을 즉시 질문하세요.
                </p>
              </div>
            </div>
            <a href="https://notebooklm.google.com/notebook/e001ff32-0545-42f7-9fe5-29b7a01359bb" target="_blank" rel="noreferrer" style={{ 
              background: 'var(--text-primary)', 
              color: 'var(--bg-color)', 
              padding: '12px 32px', 
              borderRadius: '500px', 
              fontSize: '0.88rem', 
              fontWeight: 700, 
              textTransform: 'uppercase',
              letterSpacing: '1.4px',
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              transition: 'transform 0.1s',
              whiteSpace: 'nowrap'
            }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Activity size={18} /> 챗봇 시작하기
            </a>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', width: '100%' }}>
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Globe size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>1. 글로벌 수급 (Supply)</h2>
  </div>
  <>
            {/* Widget 1: Global Capture Top 10 */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 글로벌 어획 Top 5
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: FAOSTAT (2022)</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <BarChart data={globalCaptureData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#f8fafc', fontSize: 11 }} width={60} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="value" name="어획량(톤)" fill="var(--color-info)" radius={[0, 4, 4, 0]}>
                      {globalCaptureData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 1 ? 'var(--color-danger)' : index === 3 ? 'var(--color-success)' : 'var(--color-info)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[FAOSTAT] 북대서양(영국·아일랜드) 중심의 글로벌 수급 헤게모니 고착화 및 원물 종속 심화</span>}
                actionPlan={<span>글로벌 상위 5개국 중 영국과 아일랜드가 합산 18,894톤을 어획하며 전 세계 고품질 골뱅이 물량의 핵심 공급망을 장악하고 있습니다. 특히 한국의 프리미엄 B2C 통조림 시장(유동, 동원 등)은 수율과 육질이 압도적인 <TermTooltip term="B. undatum" description="북해에서 조업되는 물레고둥(백골뱅이). 수율이 높고 육질이 부드러워 한국 B2C 통조림 1위 원물." /> 의존도가 절대적입니다. 이러한 특정 해역 및 단일 어장 의존 리스크(Single Point of Failure)를 방어하기 위해 조달팀은 영국 내 핵심 벤더와의 선제적 쿼터(Quota) 매입 및 다년 계약을 추진하여 원물 변동성으로부터 기업 마진을 수성하는 것이 당면 최우선 과제입니다.</span>}
              />
            </div>

            {/* Widget 2: Canada vs UK */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 캐나다 원물 붕괴 시그널
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: DFO Canada (2023)</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <LineChart data={canadaCaptureData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="canada" name="캐나다 어획(톤)" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="uk" name="영국 어획(톤)" stroke="var(--color-info)" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[DFO Canada] 기후 변화발(發) 캐나다 어장 붕괴 및 영국산 대체 수요 패닉 바잉 우려</span>}
                actionPlan={<span>캐나다 해역의 골뱅이 어획량이 수온 상승 등 해양 생태계 변화로 인해 과거 10년간 74%나 급감하며 사실상 산업 붕괴(Collapse) 수준에 도달했습니다. 이는 글로벌 수급 밸런스를 붕괴시키며, 유일한 고품질 대체재인 영국산 원물에 대한 글로벌 바이어들의 패닉 바잉(Panic Buying)과 가격 폭등을 촉발할 가능성이 농후합니다. 경영진은 이를 구조적 위기로 인식하고, 즉각적인 <TermTooltip term="장기 공급계약(LTC)" description="Long-Term Contract. 시장 가격 변동성에 대비하여 원물 공급자에게 고정 가격 혹은 최소 보장 물량을 담보받는 장기 선도 계약." /> 체결 및 선급금 지급을 통해서라도 영국 해역 내 확고한 물량 락인(Lock-in)을 확보해야 합니다.</span>}
              />
            </div>
            
            {/* Widget 3: Korea Capture */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 한국 내해 어획 시계열
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: KOSIS / 통계청 (2022)</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <AreaChart data={koreaCaptureData}>
                    <defs>
                      <linearGradient id="colorCapture" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[6000, 11000]} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="capture" name="한국 어획(톤)" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorCapture)" />
                  </AreaChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[KOSIS] K-수산업계의 한계: '이중 가공무역' 구조 고착화 및 수입 원물 종속성</span>}
                actionPlan={<span>한국은 연안에서 연간 9,000톤 수준의 우수한 물량을 어획하는 글로벌 5위 생산국이나, 해당 원물은 프리미엄 단가를 쫓아 전량 <TermTooltip term="신선/냉장 활어" description="가공되지 않은 살아있는 상태로 주로 일본의 이자카야 및 고급 해산물 시장으로 직수출됨." /> 형태로 일본 시장에 직수출되고 있습니다. 정작 국내 내수용 B2C 통조림 제조를 위한 대량의 가공 원물은 100% 수입산에 의존하는 기형적 '이중 가공무역' 구조에 갇혀 있습니다. 이러한 태생적 한계로 인해 당사의 수익성은 글로벌 환율 및 원자재 변동성에 무방비로 노출되어 있으며, 근본적 체질 개선을 위한 환헤지 및 물류 효율화가 필수불가결합니다.</span>}
              />
            </div>
          </>

        <div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Navigation size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>2. 무역 구조 (Trade)</h2>
  </div>
  <>
            {/* Widget 4: Import Market Share */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PieChart style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 국가별 수입 점유율
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: KCS 관세청 (2024)</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <PieChart>
                    <Pie data={importMarketShare} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                      {importMarketShare.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={IMPORT_COLORS[index % IMPORT_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[KCS] 영연방 쏠림 심화 및 단일 국가 리스크(Single-Country Risk) 임계점 돌파</span>}
                actionPlan={<span>영국산 원물 수입액이 $30.4M(30.46%)으로 1위를 수성 중이며, 지리적으로 연접한 아일랜드 물량까지 합산 시 북해 해역에 대한 <TermTooltip term="HS160559" description="조제하거나 보존처리한 연체동물(골뱅이 포함)의 무역 품목 분류 코드." /> 의존도가 65%에 육박하는 등 단일 해역 리스크가 한계치를 초과했습니다. 저단가인 튀르키예 및 중국산(R. venosa)은 B2B 시장의 원가 방어를 위한 블렌딩(Blending) 용도로만 제한적으로 활용 가능합니다. 거시적 공급 충격에 대비하여 노르웨이, 아이슬란드 등 신규 북대서양 어장 개척 및 프리미엄 라인업 다변화 테스트가 시급합니다.</span>}
              />
            </div>

            {/* Widget 5: Seasonality */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Snowflake style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 영국산 수입 계절성
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: KCS 관세청 (2024)</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <ComposedChart data={seasonalityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar yAxisId="left" dataKey="importUSD" name="수입액($M)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="left" type="monotone" dataKey="volume" name="물량(톤)" stroke="var(--color-danger)" strokeWidth={2} />
                  </ComposedChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[KCS] 하절기(여름철) 내수 성수기 집중 현상 및 공급망 병목 리스크</span>}
                actionPlan={<span>골뱅이 소비는 여름철 비빔면 및 안주류 수요 폭발로 인해 5월부터 8월까지 수입액이 연간 총량의 절반(50%) 이상을 차지하는 극단적 계절성을 띕니다. 특히 단월 최고치($5.7M)를 기록하는 8월 전후로는 글로벌 <TermTooltip term="Reefer" description="냉장/냉동 컨테이너(Refrigerated Container). 여름철 해상운송 단가 급등을 유발하는 주요 물류 변수." /> 해상운임 급등과 국내 항만 적체 현상이 빈번히 발생합니다. 이러한 'Peak Season Penalty'를 우회하기 위해 조달팀은 비수기인 3~4월에 전략적 조기 발주를 단행하고, 선제적인 부산항 배후 냉동창고 슬롯을 대규모로 확보하여 물류비 인상을 억제해야 합니다.</span>}
              />
            </div>
          </>

        <div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Factory size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>3. 밸류체인 & 전략 (Strategy)</h2>
  </div>
  <>
            {/* Widget 7: Yield Arbitrage */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Scale style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 수율 차익거래 분석
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: Seafish UK / KCS</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <ComposedChart data={yieldArbitrageData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis dataKey="origin" type="category" tick={{ fill: '#f8fafc', fontSize: 11 }} width={100} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="price" name="단가($/kg)" fill="#64748b" barSize={15} />
                    <Scatter dataKey="yieldMax" name="살수율(%)" fill="var(--color-success)" />
                  </ComposedChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[KCS+Seafish] 착시 효과 타파: 실수율(Meat Yield) 기반 총사용원가(TCU) 재검토</span>}
                actionPlan={<span>단순 통관 단가 기준으로는 중국/튀르키예산(R. venosa)이 영국산(B. undatum)의 절반 수준으로 저렴해 보입니다. 그러나 영국 Seafish 연구소의 문헌과 자체 가공 공정 데이터를 연동하여 <TermTooltip term="TCU" description="Total Cost of Usage. 껍질, 내장, 수분 감량 등을 제한 후 실제로 제품에 쓰이는 순 살코기(Meat Yield)를 얻기 위한 환산 단위 원가." />(총사용원가)를 산출하면 충격적인 결과가 도출됩니다. 튀르키예산은 극심한 부산물 감량으로 인해 실질 원가가 $91.0/kg까지 치솟아, 오히려 영국산($54.2/kg)보다 68%나 비싼 'Low-Yield Trap(저수율 함정)'에 빠지게 됩니다. 조달팀은 벤더와의 단가 협상 시 반드시 표면 단가가 아닌 'Yield-Adjusted(수율 조정)' 단가 모델을 전면 도입해야 합니다.</span>}
              />
            </div>

            {/* Widget 8: Waterfall */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 수입 원가 워터폴
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: KCS 관세청 (2024)</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <BarChart data={waterfallData} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis domain={[11.5, 14]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="비용($/kg)" fill="var(--color-info)" label={{ position: 'top', fill: '#f8fafc', fontSize: 10 }}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[KCS] 워터폴 분석: 한-영 FTA 무관세 지렛대를 통한 구조적 물류비 방어</span>}
                actionPlan={<span>영국산 원물의 KCS 기준 평균 수입단가 $12.75/kg에 숨어있는 가장 강력한 방어기제는 바로 <TermTooltip term="한-영 FTA" description="영국의 브렉시트(Brexit) 이후 한국과 영국 간 체결된 자유무역협정. 수산물(골뱅이) 무관세 혜택의 핵심." />(수입 관세 0%) 혜택입니다. 이 무관세 특권 덕분에 해운 운임($0.42)과 내륙 통관/보관료($0.15) 등 부대비용을 얹고도 총 부산 입고단가를 $13.32/kg 선에서 틀어막는 압도적 LCC(Life Cycle Cost) 효율이 발생합니다. 이는 경쟁국(관세 적용 시) 대비 10~20%의 원가 우위 해자로 작용하므로, 무역팀은 영국 현지 패커들의 원산지 증명 갱신 및 컴플라이언스 리스크 모니터링에 전사적 리소스를 투입해야 합니다.</span>}
              />
            </div>
          </>

        <div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Activity size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>4. 시장 & 브랜드 (Market)</h2>
  </div>
  <>
            {/* Widget 9: Brand Positioning — Quantitative Axes */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 브랜드 가성비 맵
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: aT FIS 식품산업통계</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="x" type="number" name="고형량" domain={[80, 160]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '고형량(g) →', position: 'bottom', fill: '#94a3b8', offset: -5 }} />
                    <YAxis dataKey="y" type="number" name="가격" domain={[3000, 5500]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '100g당 가격(₩) →', angle: -90, position: 'left', fill: '#94a3b8' }} />
                    <ZAxis dataKey="z" type="number" range={[200, 1500]} name="점유율(%)" />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Scatter name="브랜드" data={brandPositioningData} fill="var(--color-info)">
                      {brandPositioningData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-danger)' : index === 3 ? 'var(--color-warning)' : 'var(--color-info)'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[aT FIS] B2C 시장의 딜레마: 고형량 투명성 대비 '가성비 역전' 시그널</span>}
                actionPlan={<span>경쟁사 '동표골뱅이'는 압도적인 <TermTooltip term="고형량" description="Solid weight. 통조림 내 액상액(조미액)을 제외한 순수 고기 무게." />(147g)과 저렴한 100g당 단가(₩3,600)를 무기로 매니아층 및 B2B 시장의 바닥을 무섭게 잠식하고 있습니다. 1위 브랜드인 유동(130g, ₩4,200)은 강력한 브랜드 헤리티지로 프리미엄 B2C 시장을 철통 수성 중이나, 합리적 소비 트렌드 확산에 따라 가성비 이탈 현상이 관측됩니다. 장기적 성장을 위해서는 프리미엄 라인의 고형량 투명성 강화 캠페인과 더불어, 중저가 원물 믹스(Blending)를 통한 실속형 '세컨드 브랜드' 출시로 하방 압력을 분산해야 합니다.</span>}
              />
            </div>

            {/* Widget 10: Channel Demand */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 유통 채널별 매출 비중
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: aT FIS 식품산업통계</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                 <SafeResponsiveContainer height="100%">
                  <PieChart>
                    <Pie data={channelDemandData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="size" paddingAngle={2} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {channelDemandData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[aT FIS] 유통 대변혁: 마트 독과점 붕괴와 B2B/온라인/CVS 채널의 급성장</span>}
                actionPlan={<span>과거 시장을 지배하던 대형마트 및 SSM의 점유율(62.3%) 독과점 체제가 빠르게 허물어지며 유통 구조의 파편화가 진행 중입니다. 쿠팡을 위시한 e커머스(11.8%)의 묶음 배송과 1인 가구 홈술족을 겨냥한 편의점(6.4%) 매출이 폭발적으로 성장하고 있습니다. 무엇보다 외식 물가 상승으로 인한 호프/주점용 프랜차이즈 납품 시장, 즉 B2B 식자재(19.5%) 채널이 강력한 'Cash Cow'로 부상했습니다. 기존 300~400g 캔 규격의 틀을 깨고 <TermTooltip term="SKU 다변화" description="Stock Keeping Unit. 150g 소포장(CVS용), 1kg 대용량 벌크 파우치(B2B용) 등 포장 규격의 세분화 전략." />(150g 파우치, 1kg 벌크 등)를 통한 전방위 채널 침투 전략을 수립해야 합니다.</span>}
              />
            </div>
          </>

        {/* Section 5: Risk & Macro */}
        <div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <ShieldAlert size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>5. 리스크 & 매크로 (Risk)</h2>
  </div>
  <>
            {/* Widget 11: FX-Import Price Correlation */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> 환율-수입단가 상관분석
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: KCS / 한국은행</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <ComposedChart data={fxCorrelationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="quarter" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="left" domain={[11, 13.5]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '$/kg', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[1200, 1450]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'USD/KRW', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="avgUnitPrice" name="평균수입단가($/kg)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="usdkrw" name="USD/KRW 환율" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[KCS+BOK] 치명적 거시 리스크: 고환율과 단가 인상의 '이중고(Double Whammy)'</span>}
                actionPlan={<span>2023년 1분기부터 2024년 4분기 시계열 분석 결과, 거시 경제의 최악의 시나리오인 'Double Whammy(이중 타격)' 현상이 확인됩니다. 영국산 원물 USD 단가가 $11.82에서 $12.75(+7.9%)로 인상된 것에 더해, 동기간 USD/KRW 환율마저 1,264원에서 1,400원(+10.8%)으로 수직 상승했습니다. 이로 인해 국내 수입사가 체감하는 원화 환산 매입 원가는 무려 20% 가까이 폭등했습니다. 재무 라인은 즉각 비상 경영 체제로 돌입하여 능동적인 <TermTooltip term="FX Forward 헤지" description="환변동 위험을 방어하기 위해 미래 특정 시점의 환율을 현재 시점에 사전 고정시키는 선도 계약." /> 및 통화 분산 스왑을 가동, 판관비 및 이익률 훼손을 방어하는 최후의 보루 역할을 수행해야 합니다.</span>}
              />
            </div>

            {/* Widget 12: UK Regulatory Risk Radar */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield style={{ color: 'var(--color-info)', width: '20px', height: '20px' }} /> UK 공급 규제 리스크 레이더
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '-0.2px' }}>출처: UK IFCA / MMO</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <RadarChart data={ukRegulatoryRadar} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,0.15)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="리스크 수준" dataKey="value" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.25} strokeWidth={2} />
                    <RechartsTooltip content={<CustomTooltip />} />
                  </RadarChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[IFCA/MMO] 보이지 않는 위협: 영국 어장보호주의 회귀 및 규제 리스크 격화</span>}
                actionPlan={<span>영국의 해양 규제 당국(<TermTooltip term="IFCA" description="영국 Inshore Fisheries and Conservation Authority. 해안 환경보존 및 어업 규제를 단속하는 핵심 부처." />)의 자국 수산자원 보호주의 정책이 골뱅이 공급망의 최대 뇌관으로 부상했습니다. 특히 <TermTooltip term="MCRS(최소보존규격)" description="Minimum Conservation Reference Size. 포획 허용 조개껍질 최소 크기. 상향 시 소형 어획 불가." />를 45mm에서 55mm로 기습 상향하려는 움직임은 단기 어획량을 20~30% 소멸시킬 수 있는 치명적 규제(Risk Score 85)입니다. 또한 웨일스 지방을 기점으로 확산 조짐이 보이는 <TermTooltip term="ACL 쿼터제" description="Annual Catch Limit. 지역 단위 총 할당량 제한으로 수입사의 독과점 물량 확보를 막는 보호무역 장치." />는 해외 자본의 독점적 물량 싹쓸이를 원천 차단합니다. 해외 전략 파트는 현지 로비망 가동 및 현지 가공 공장 지분 투자를 통해 이러한 '규제 장벽'을 내부자 자격으로 우회하는 전략적 판단이 필요합니다.</span>}
              />
            </div>
          </>

        {/* Section 6: 구조적 위협 & 기회 */}
        <div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Thermometer size={20} color="var(--color-danger)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>6. 구조적 위협 & 기회 (Structural)</h2>
  </div>
  <>
            {/* Widget 13: 양식 불가 자원 비교 */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert style={{ color: 'var(--color-danger)', width: '20px', height: '20px' }} /> 양식 불가 자원: 공급 탄력성 제로
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>출처: 국립수산과학원</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <BarChart data={aquacultureData} margin={{ top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="species" tick={{ fill: '#f8fafc', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="aquaculture" name="양식 가능성" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="supplyElasticity" name="공급 탄력성" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="priceStability" name="가격 안정성" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[국립수산과학원] 충격적 사실: 골뱅이는 '해적생물(Pest)'로 분류되어 양식이 영구히 불가능한 유일한 국민 안주</span>}
                actionPlan={<span>골뱅이(큰구슬우렁이)는 바지락·동죽 등 패류를 잡아먹는 <TermTooltip term="해적생물" description="해양 양식장에서 양식 대상 생물을 포식하거나 피해를 주는 유해 생물. 골뱅이는 육식성 포식자로 분류됨." /> 로서, 양식 시도 자체가 기존 패류 산업을 파괴합니다. 연어·새우와 달리 수요 폭증 시에도 공급을 인위적으로 늘릴 방법이 전무한 '공급 탄력성 제로(Zero Elasticity)' 품목입니다. 이는 장기적으로 <TermTooltip term="희소성 프리미엄" description="Scarcity Premium. 공급이 구조적으로 제한된 자원에 붙는 가격 프리미엄. 양식 불가 품목에서 특히 강하게 작용." /> 을 보장하지만, 동시에 기후·규제 충격 시 가격 방어 메커니즘이 전무함을 의미합니다. 12~18개월 선물(Forward) 계약과 R. venosa 블렌딩 20~30% 유지로 원가 완충 장치를 내재화해야 합니다.</span>}
              />
            </div>

            {/* Widget 14: 카드뮴 식품안전 리스크 */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FlaskConical style={{ color: 'var(--color-danger)', width: '20px', height: '20px' }} /> 식품안전: 카드뮴 생체축적 히트맵
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>출처: 식약처 / EFSA</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <ComposedChart data={cadmiumData} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="part" tick={{ fill: '#f8fafc', fontSize: 11 }} />
                    <YAxis domain={[0, 7]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'mg/kg', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="cd" name="카드뮴 농도(mg/kg)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#f8fafc', fontSize: 11 }}>
                      {cadmiumData.map((entry, index) => (
                        <Cell key={`cd-${index}`} fill={index === 1 ? 'var(--color-danger)' : index === 2 ? 'var(--color-warning)' : 'var(--color-success)'} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="limit" name="식약처 기준선(2.0)" stroke="#f8fafc" strokeWidth={2} strokeDasharray="8 4" dot={false} />
                  </ComposedChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[식약처/EFSA] 숨겨진 시한폭탄: 골뱅이 내장(간췌장)의 카드뮴 생체축적 리스크</span>}
                actionPlan={<span>골뱅이의 간췌장(내장) 부위에는 카드뮴이 근육 대비 20~100배 농축(5.5mg/kg)되어 식약처 기준(2.0mg/kg)을 크게 초과합니다. 해외 가공 공장에서 <TermTooltip term="내장 제거 완전성" description="Evisceration Rate. 가공 과정에서 간췌장(내장)이 완전히 제거된 비율. 미달 시 중금속 기준 초과로 수입 통관 부적합 판정의 직접적 원인." /> 이 미달될 경우, 한 번의 식약처 부적합 판정으로 수억 원대 물량이 전량 폐기·반송됩니다. QC팀은 분기별 원산지 공장 방문 검수와 제3자 검사기관(SGS, Intertek) 인증을 의무화하고, 내장 제거율을 핵심 KPI로 관리해야 합니다.</span>}
              />
            </div>

            {/* Widget 15: 혼술 이코노미 수입 폭증 */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingBag style={{ color: 'var(--color-success)', width: '20px', height: '20px' }} /> 혼술 이코노미: 수입량 폭증 타임라인
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>출처: KCS / FishFocus UK</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <ComposedChart data={importSurgeData}>
                    <defs>
                      <linearGradient id="colorSurge" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '톤', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '$M', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="volume" name="수입량(톤)" stroke="var(--color-success)" fill="url(#colorSurge)" />
                    <Line yAxisId="right" type="monotone" dataKey="value" name="수입액($M)" stroke="var(--color-warning)" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[KCS/FishFocus] 구조적 수혜: 2025년 초 수입량 전년 대비 +105% 폭증 — 1인 가구 홈술 트렌드의 비가역적 전환</span>}
                actionPlan={<span>2025년 2월 기준 냉동 자숙 골뱅이육 수입이 170톤(전년 동기 대비 +105%), 1~2월 누적 수입액 USD 4.95M(+84%)을 기록하며 역대 최고치를 경신했습니다. 이는 <TermTooltip term="혼술 이코노미" description="1인 가구와 홈술(집에서 마시는 술) 문화가 만든 소비 경제. 편의점 안주, 소포장 HMR 등 새로운 수요 창출의 원동력." /> 가 일시적 유행이 아닌 비가역적(Irreversible) 소비 구조 전환임을 입증합니다. 마케팅팀은 150g 소포장 '혼술 에디션'과 에어프라이어용 '마늘버터 골뱅이 키트' 등 채널 맞춤형 SKU를 Q3 성수기 전 선제 출시해야 합니다.</span>}
              />
            </div>

            {/* Widget 16: 부산물 업사이클링 */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Recycle style={{ color: 'var(--color-success)', width: '20px', height: '20px' }} /> 부산물 업사이클링: 순환경제 가치
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>출처: MDPI / ResearchGate</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <BarChart data={byproductData} layout="vertical" margin={{ left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '중량 비율(%)', position: 'bottom', fill: '#94a3b8', offset: -5 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#f8fafc', fontSize: 11 }} width={90} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="ratio" name="중량 비율(%)" radius={[0, 4, 4, 0]}>
                      {byproductData.map((entry, index) => (
                        <Cell key={`bp-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[MDPI/ResearchGate] 숨겨진 금광: 가공 후 버려지는 78%의 부산물에서 해양 콜라겐 추출 가능</span>}
                actionPlan={<span>골뱅이 원물의 78%는 껍질·내장·체액으로 폐기되지만, 이 부산물에서 <TermTooltip term="해양 콜라겐 펩타이드" description="Marine Collagen Peptide. 수산 부산물에서 효소 분해로 추출하는 저분자 단백질. 광우병 위험 없이 피부·관절 건강에 효과적이며, 할랄/코셔 인증이 용이." /> 를 추출할 수 있습니다. 아태 지역 해양 콜라겐 시장 규모는 $980M이며, 소·돼지 대비 종교적 제약이 없어 할랄/코셔 시장 진출이 용이합니다. 또한 껍질(CaCO₃)은 칼슘 보충제와 바이오 세라믹 원료로 활용 가능합니다. R&D 부서는 국내 바이오 스타트업과의 공동 연구 MOU를 통해 부산물 수익화 파이프라인을 구축해야 합니다.</span>}
              />
            </div>

            {/* Widget 17: 고형량 투명성 */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package style={{ color: 'var(--color-warning)', width: '20px', height: '20px' }} /> 300g 캔의 진실: 고형량 투명성
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>출처: aT FIS 식품산업통계</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <BarChart data={solidContentData} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="brand" tick={{ fill: '#f8fafc', fontSize: 11 }} />
                    <YAxis domain={[0, 320]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'g', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="solid" name="고형량(살)" stackId="a" fill="var(--color-success)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="liquid" name="조미액" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[aT FIS] 소비자가 모르는 진실: 300g 캔의 실제 골뱅이 살은 40~50%에 불과</span>}
                actionPlan={<span>300g 골뱅이 통조림에서 실제 <TermTooltip term="고형량" description="Solid weight. 통조림 내 액상액(조미액)을 제외한 순수 고기 무게. 소비자가 실제 먹게 되는 골뱅이 살의 양." /> 은 120~150g(40~50%)에 불과하며, 나머지는 간장 기반 조미액입니다. '헬시 플레저' 트렌드와 고물가 시대의 합리적 소비 심리가 맞물리면, 고형량 비율이 낮은 브랜드는 소비자 신뢰를 급격히 잃을 수 있습니다. 선제적으로 '고형량 65%+' 프리미엄 라인을 출시하고, 패키지 전면에 고형량 비율을 대형 표기하는 '투명성 마케팅'이 차별화 전략의 핵심입니다.</span>}
              />
            </div>

            {/* Widget 18: 기후 리스크 시뮬레이션 */}
            <div className="ds-card" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Thermometer style={{ color: 'var(--color-danger)', width: '20px', height: '20px' }} /> 기후 리스크: 수온-어획량 붕괴 시뮬레이션
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>출처: IPCC / FAOSTAT</span>
              </h3>
              <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                <SafeResponsiveContainer height="100%">
                  <ComposedChart data={climateRiskData}>
                    <defs>
                      <linearGradient id="colorUkCatch" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCaCatch" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '어획량(톤)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[9, 15]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'SST(°C)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="ukCatch" name="영국 어획(톤)" stroke="var(--color-info)" fill="url(#colorUkCatch)" />
                    <Area yAxisId="left" type="monotone" dataKey="canadaCatch" name="캐나다 어획(톤)" stroke="var(--color-danger)" fill="url(#colorCaCatch)" />
                    <Line yAxisId="right" type="monotone" dataKey="sst" name="북대서양 수온(°C)" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 5, fill: 'var(--color-warning)' }} />
                  </ComposedChart>
                </SafeResponsiveContainer>
              </div>
              <TakeawayBox
                situation={<span>[IPCC/FAOSTAT] 최대 위협: 기후변화에 의한 어획량 붕괴 시뮬레이션 — 캐나다 시나리오의 영국 재현 전망</span>}
                actionPlan={<span>골뱅이 공급망의 진짜 적은 경쟁사가 아니라 '기후변화'입니다. 냉수성 저서생물인 B. undatum은 <TermTooltip term="SST" description="Sea Surface Temperature. 해수면 온도. 북대서양 수온이 15°C를 넘으면 골뱅이의 서식지 이탈과 산란율 급감이 시작됨." /> 15°C를 넘으면 서식지를 이탈하며, 이미 캐나다에서 이 시나리오가 현실화되어 어획량이 -74% 붕괴했습니다. IPCC 예측에 따르면 현재 한국 수입의 52%를 차지하는 영국 북해도 2035년까지 수온이 1.5~2°C 상승할 전망이며, 이는 10년 내 영국산 물량이 연간 10~15%씩 자연 감소할 수 있음을 의미합니다. 전략기획실은 '포스트-영국(Post-UK)' 시대를 대비하여 아이슬란드·노르웨이 등 고위도 신규 어장 개척과 흑해(튀르키예) R. venosa의 TCU 기반 경제성 재평가를 즉각 병행해야 합니다.</span>}
              />
            </div>
          </>

      </div>
    </div>
  );
}
