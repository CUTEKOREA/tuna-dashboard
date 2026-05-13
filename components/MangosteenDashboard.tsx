'use client';

import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ComposedChart, Line, LineChart, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
  Globe, TrendingUp, AlertTriangle, ShieldCheck, Activity, Zap, Droplets, Ship, Apple, Snowflake, PackageCheck,
  Database, BookOpen, Hexagon, Workflow, Coins, Leaf, Truck, Factory, Landmark, Anchor
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';

import oecExportData from '../data/mangosteen_oec_export.json';
import oecImportData from '../data/mangosteen_oec_import.json';
import krExportData from '../data/mangosteen_kr_export.json';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(18, 18, 18, 0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{label}</p>
        {payload.map((e: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '0.8rem', marginBottom: '4px' }}>
            <span style={{ color: e.color || 'var(--text-secondary)' }}>■ {e.name}</span>
            <strong style={{ color: 'var(--text-primary)' }}>
              {typeof e.value === 'number' && e.value > 1000 ? e.value.toLocaleString() : e.value}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SECTIONS = [
  { id: "S1", title: "🌍 Part I — 글로벌 공급망 패권 및 기후 리스크 (Macro Supply & Climate Risk)", desc: "OEC 무역 데이터 및 기후-수율 인덱스를 통한 태국 의존도 분석", color: "#f97316" },
  { id: "S2", title: "🚢 Part II — 물류 원가와 검역 장벽의 딜레마 (Logistics & Phyto-Sanitary)", desc: "VHT(증열처리)와 항공/해상(MAP) 물류 모드에 따른 비용 최적화", color: "var(--color-success)" },
  { id: "S3", title: "🍏 Part III — 대체 과일 차익 거래 및 포트폴리오 (Arbitrage & Portfolio)", desc: "K-과일(사과/배) 인플레이션 헷징 및 B2B 냉동 가공품 캐시카우 전략", color: "#8b5cf6" },
  { id: "S4", title: "🚀 Part IV — 품질 통제 및 초프리미엄 틈새 재수출 (Quality Control & Niche Re-export)", desc: "과피 경화(Hard Shell) 방어 및 KCS 기반 VIP 재수출 수익 모델", color: "#38bdf8" },
  { id: "S5", title: "🌱 Part V — 제로 웨이스트 ESG & RCEP 공급망 혁신 (Zero-Waste & Innovation)", desc: "크산톤 펫푸드 업사이클링, 1-MCP 한계 돌파 및 제3국 우회 아비트리지", color: "#a3e635" },
];

const KPI_THEMES = [
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Globe },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: AlertTriangle },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Truck },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: ShieldCheck },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Apple },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Coins },
];

// Data will be fetched from the API

const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#f472b6', '#fb7185', '#f87171', '#fb923c', 'var(--color-warning)', '#a3e635'];

export default function MangosteenDashboard() {
  const [showEdu, setShowEdu] = useState(true);
  const [climateYieldData, setClimateYieldData] = useState<any[]>([]);
  const [logisticsData, setLogisticsData] = useState<any[]>([]);
  const [arbitrageData, setArbitrageData] = useState<any[]>([]);
  const [marginData, setMarginData] = useState<any[]>([]);
  const [productionVsTradeData, setProductionVsTradeData] = useState<any[]>([]);
  const [bilateralReExportData, setBilateralReExportData] = useState<any[]>([]);
  const [upcyclingData, setUpcyclingData] = useState<any[]>([]);
  const [coldchainData, setColdchainData] = useState<any[]>([]);
  const [rcepArbitrageData, setRcepArbitrageData] = useState<any[]>([]);
  const [mangosteenKpis, setMangosteenKpis] = useState<Record<string, any>>({});
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mangosteen/dashboard');
        const json = await res.json();
        if (json.data) {
          setClimateYieldData(json.data.climateYieldData);
          setLogisticsData(json.data.logisticsData);
          setArbitrageData(json.data.arbitrageData);
          setMarginData(json.data.marginData);
          setProductionVsTradeData(json.data.productionVsTradeData || []);
          setBilateralReExportData(json.data.bilateralReExportData || []);
          setUpcyclingData(json.data.upcyclingData || []);
          setColdchainData(json.data.coldchainData || []);
          setRcepArbitrageData(json.data.rcepArbitrageData || []);
          setMangosteenKpis(json.data.kpis);
          setLastUpdate(new Date(json.timestamp).toLocaleTimeString());
        }
      } catch (err) {
        console.error('Failed to fetch Mangosteen live data:', err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5-second polling
    return () => clearInterval(interval);
  }, []);

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />;
  const xAxisProps: any = { stroke: "#64748b", tick: { fontSize: 10, fill: '#94a3b8' }, minTickGap: 30 };
  const yAxisProps: any = { stroke: "#64748b", tick: { fontSize: 10, fill: '#94a3b8' } };

  // Transform OEC Data to millions for better display
  const oecExportChartData = oecExportData.map((d: any) => ({
    ...d,
    "수출액 (M$)": Math.round(d["Trade Value"] / 1000000)
  }));

  const oecImportChartData = oecImportData.map((d: any) => ({
    ...d,
    "수입액 (M$)": Math.round(d["Trade Value"] / 1000000)
  }));

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>
      
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2.5rem', paddingTop: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>👑</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                망고스틴 (Mangosteen) 인텔리전스 마스터클래스
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#38bdf820', color: '#38bdf8', fontWeight: 700, verticalAlign: 'middle' }}>FRUIT QUEEN</span>
              </h1>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>Silla Co. 최고경영진을 위한 기후, 검역, 물류 및 재수출 마진 극대화 통합 관제</p>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#181818', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-warning)', boxShadow: '0 0 8px #facc15' }} />
            <span>OEC JSON / KCS Baseline / NotebookLM 279소스</span>
          </div>
        </div>
      </header>

      {/* ═══ Executive Strategy Command ═══ */}
      <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '50%' }}>
          <ShieldCheck size={32} color="#ec4899" />
        </div>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800 }}>Executive Strategy Command: 망고스틴 하이엔드 차익 거래 로드맵</h2>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#fbcfe8', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <li><strong>수급 패권:</strong> 한국 수입의 <strong>96.5~98.7%가 태국산</strong> — 사실상 완전 독점. 베트남/인니발 B2B 우회 라인 확보 시급.</li>
            <li><strong>물류 대전환:</strong> 항공($5.5/kg) 대신 <strong>해상+MAP 포장($2.95/kg)</strong> 전면 도입으로 마진율 즉각 +18%p 개선 가능.</li>
            <li><strong>하이엔드 아비트리지:</strong> 사과 도매가 8.5만 원 돌파 시 <strong>물량 공격적 투입</strong>, 최상급 1% 물량은 몽골/괌 리조트로 <strong>$12.4/kg 단가 재수출</strong>.</li>
          </ul>
        </div>
      </div>

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
          
          {/* Left: 9 Networks Status */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#38bdf8', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', width: '16px', height: '16px', backgroundColor: '#38bdf8', borderRadius: '50%', opacity: 0.4, animation: 'pulse 2s infinite' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                DATA COMMAND CENTER <span style={{ color: 'var(--color-warning)', fontWeight: 600, fontSize: '0.85rem', marginLeft: '6px' }}>BASELINE + API FALLBACK</span>
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { name: 'KCS API', desc: '관세청 수출입', status: 'live' },
                { name: 'KAMIS API', desc: '국내 도소매가', status: 'live' },
                { name: 'MFDS API', desc: '식물검역/통관', status: 'live' },
                { name: 'OEC API', desc: '글로벌 무역', status: 'live' },
                { name: 'SCFI API', desc: '해상 운임', status: 'live' },
                { name: 'NOAA API', desc: '엘니뇨 기후', status: 'live' },
                { name: 'KREI API', desc: '농업관측지수', status: 'live' },
              ].map((net, i) => (
                <div key={i} style={{ 
                  background: '#282828', borderRadius: '16px', 
                  padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' 
                }}>
                  <Database size={12} color="#38bdf8" />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>{net.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{net.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: SMSI Index */}
          <div style={{ 
            minWidth: '220px', 
            background: '#282828', 
            borderRadius: '8px', 
            padding: '1rem',
            textAlign: 'center',
            boxShadow: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Activity size={16} color="var(--color-warning)" />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-warning)', letterSpacing: '1px' }}>SMSI INDEX</div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '4px' }}>
              <CountUp end={92} duration={2} />
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}> / 100</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-warning)', fontWeight: 600 }}>Silla Mangosteen Stress Index</div>
            <div suppressHydrationWarning style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Last Update: {lastUpdate || "Loading..."}</div>
          </div>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {Object.keys(mangosteenKpis).length > 0 ? Object.keys(mangosteenKpis).map((key, idx) => {
          const kpi = mangosteenKpis[key]; const t = KPI_THEMES[idx % KPI_THEMES.length]; const I = t.icon;
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
                <span style={{ background:'#282828', padding:'2px 6px', borderRadius:'12px', marginRight:'6px', color: '#38bdf8', fontSize: '0.65rem', fontWeight: 700 }}>{kpi.trend}</span>{kpi.desc}
              </div>
              {kpi.source && (
                <div style={{ marginTop:'8px', display:'flex', alignItems:'center', gap:'4px' }}>
                  <span style={{ fontSize:'0.65rem', color:'#38bdf8', background:'rgba(56, 189, 248, 0.1)', padding:'2px 6px', borderRadius:'12px', fontWeight: 600 }}>
                    {kpi.source}
                  </span>
                </div>
              )}
            </div>
          );
        }) : (
          <div style={{ gridColumn: 'span 6', textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            라이브 데이터를 동기화 중입니다...
          </div>
        )}
      </div>

      {/* ═══ S-Grade AI Assistant ═══ */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowEdu(!showEdu)}
          style={{ 
            width: '100%', background: '#181818', 
            borderRadius: '8px', border: 'none',
            padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: showEdu ? '1rem' : '0'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#282828'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#181818'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Zap size={20} color="#ec4899" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>FRUIT QUEEN: S-Grade 전략 AI 어시스턴트</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>태국 독점 공급망 리스크(VHT/라니냐) 분석, B2B 가공품 우회 전략 및 MAP 물류 시뮬레이터 연동</div>
            </div>
          </div>
          <div style={{ transform: showEdu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </button>

        {showEdu && (
          <div style={{ 
            background: '#181818', 
            borderRadius: '8px', 
            padding: '1.5rem',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              
              <div style={{ background: '#282828', padding: '1.2rem', borderRadius: '8px' }}>
                <h3 style={{ color: '#38bdf8', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Globe size={16}/> 핵심 구조: 태국 의존도와 VHT/PLS 검역 장벽
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <strong style={{color:'var(--text-primary)'}}>공급(Hegemony):</strong> 전세계 수출의 대부분을 차지하는 태국에 공급망이 편중. 기상이변(라니냐) 시 생과 수율(VHT 생존율)이 급락.<br/>
                  <strong style={{color:'var(--text-primary)'}}>물류(Logistics):</strong> 기존 항공 운송(약 $5.5/kg)은 마진을 잠식. MAP 포장 기반 해상 물류($2.95/kg)로 전환 시 마진 스프레드 급등.<br/>
                  <strong style={{color:'var(--text-primary)'}}>검역(Phyto-sanitary):</strong> 인니/필리핀산은 VHT 설비 부재로 생과 수입이 불가하여 가공품(냉동)으로 선회 필수.
                </div>
              </div>

              <div style={{ background: '#282828', padding: '1.2rem', borderRadius: '8px' }}>
                <h3 style={{ color: '#38bdf8', margin: '0 0 0.8rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Workflow size={16}/> 전략적 시사점: K-과일 아비트리지 & VIP 재수출
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  <li><strong style={{color:'var(--text-primary)'}}>국내 과일 차익거래:</strong> 국내 사과/배 가격 폭등 시 대체 과일인 망고스틴 수요가 급증. 이 시기 공격적 선도 거래 매입 필요.</li>
                  <li><strong style={{color:'var(--text-primary)'}}>B2B 가공품 헷징:</strong> 생과의 부패 리스크 및 0% 할당관세 종료에 대비해 유통기한과 마진이 안정적인 냉동 퓨레 라인업 확대.</li>
                  <li><strong style={{color:'var(--text-primary)'}}>프리미엄 재수출:</strong> 몽골, 괌 등 고급 리조트/호텔을 대상으로 상위 1% 품질(예냉 처리)을 KCS(한국산 검수) 브랜딩으로 재수출.</li>
                </ul>
              </div>
            </div>

            <div style={{ 
              background: '#282828', 
              padding: '1.2rem 1.5rem', 
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.8rem', borderRadius: '50%' }}>
                  <Database size={20} color="#38bdf8" />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700 }}><Zap size={16} color="#38bdf8" style={{ verticalAlign: 'middle', marginRight: '4px' }} /> NotebookLM 망고스틴 AI 챗봇</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>태국 OEC 수출입, KCS 국내 단가, VHT 기후 리스크 데이터가 모두 학습된 맞춤형 AI입니다.</p>
                </div>
              </div>
              <a 
                href="https://notebooklm.google.com/notebook/3cd01c74-92fe-4857-bbca-2327a254435e" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  background: '#38bdf8', 
                  color: '#000000', 
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
                onMouseEnter={(e) => { e.currentTarget.style.background = '#7dd3fc'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#38bdf8'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Activity size={16} /> 챗봇 시작
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Section I: Global Hegemony & Climate Risk ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[0].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[0].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Widget 1-1: Global Hegemony (Production vs Trade) */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Globe size={18} color={SECTIONS[0].color} /> 글로벌 생산량 vs 수출 점유율 (독점 딜레마)
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>단위: 톤(t) / FAOSTAT 실증 데이터</p>
          </div>
          <div style={{ height: '240px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productionVsTradeData} layout="vertical" margin={{ left: 50 }}>
                {grid}
                <XAxis type="number" {...xAxisProps} />
                <YAxis dataKey="country" type="category" {...yAxisProps} width={80} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="production" name="생산량 (톤)" fill="#475569" radius={[0, 4, 4, 0]} barSize={15} />
                <Bar dataKey="export" name="수출량 (톤)" fill="#f97316" radius={[0, 4, 4, 0]} barSize={15} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="인도네시아의 절대 생산량(32만 톤)이 1위이나 수출은 1% 미만이며, 태국은 생산량의 87%를 수출하며 글로벌 무역을 독점하고 있습니다." 
            actionPlan="식물방역법(PLS)의 장벽이 생산 대국과 수입국을 단절시켰습니다. VHT 설비가 있는 태국 패킹하우스 선도거래를 선점하거나, B2B 가공품으로 전환해 인니/베트남을 활용해야 합니다."
          />
        </div>

        {/* Widget 1-2: Climate-Yield Predictor */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Droplets size={18} color="#e879f9" /> 기후-수율 연동 예측 (Climate-Yield Predictor)
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>엘니뇨/라니냐(ONI) 지수 대비 VHT 생존율 (%)</p>
          </div>
          <div style={{ height: '240px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={climateYieldData}>
                {grid}
                <XAxis dataKey="year" {...xAxisProps} />
                <YAxis yAxisId="left" domain={[60, 100]} {...yAxisProps} label={{ value: 'VHT 생존 수율 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" domain={[-2, 2]} {...yAxisProps} label={{ value: 'ONI (기후 지수)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar yAxisId="right" dataKey="oni" name="ONI 지수(라니냐/엘니뇨)" fill="#64748b" fillOpacity={0.5} barSize={20} />
                <Line yAxisId="left" type="monotone" dataKey="yield" name="VHT 통과 수율(%)" stroke="#f97316" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="라니냐 국면(ONI 음수)의 잦은 비는 과육 수액병(Gamboge)을 유발해 VHT(증열처리) 통과 생존율을 75%까지 급락시킵니다." 
            actionPlan="기상청 API 연동을 통해 라니냐 경보 발령 시, '수율 기반 변동 가격제(Yield-Index Pricing)'를 선제적으로 발동하여 매입 단가 리스크를 헷징해야 합니다."
          />
        </div>
      </div>

      {/* ═══ Section II: Logistics & Phyto-Sanitary Barrier ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[1].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[1].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Widget 2-1: Phyto-Sanitary Country List */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--color-success)', margin: '0 0 1rem' }}>
            <ShieldCheck size={20} /> 식물검역(PLS) 통과 가능 국가
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <li style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>태국 / 말레이시아</strong>
                <span style={{ fontSize: '0.75rem', background: '#10b98120', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '4px' }}>생과 수입 허용</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>VHT(증열처리) 시설 검역 필수.</p>
            </li>
            <li style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>인도네시아 / 필리핀</strong>
                <span style={{ fontSize: '0.75rem', background: '#ef444420', color: 'var(--color-danger)', padding: '2px 8px', borderRadius: '4px' }}>수입 금지</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>과실파리 우려. <strong>냉동/가공품만 반입 가능</strong>.</p>
            </li>
          </ul>
          <TakeawayBox 
            situation="엄격한 식물방역법으로 인해 한국 시장은 사실상 태국산에 독점되어 단가 협상력이 현저히 낮습니다." 
            actionPlan="금지 국가인 인도네시아 원물을 현지에서 IQF 냉동 가공하여 국내 B2B 시장으로 '우회 수입'하는 전략 파이프라인 신설을 권고합니다."
          />
        </div>

        {/* Widget 2-2: Logistics Simulator */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Ship size={18} color="var(--color-success)" /> 물류 모드별 원가-품질 방어 모델
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>운송비 ($/kg) vs 최종 유효 수율 (%)</p>
          </div>
          <div style={{ height: '240px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={logisticsData} layout="vertical" margin={{ left: 30 }}>
                {grid}
                <XAxis type="number" {...xAxisProps} />
                <YAxis dataKey="mode" type="category" {...yAxisProps} width={100} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" name="운송 단가 ($/kg)" fill="#64748b" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="netYield" name="유효 수율 (%)" fill="var(--color-success)" radius={[0, 4, 4, 0]} barSize={20} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="하드쉘 방어를 위해 kg당 $5.5의 값비싼 항공 운송을 쓰고 있으나, 마진을 갉아먹는 주원인입니다." 
            actionPlan="해상 운송에 산소 농도를 제어하는 MAP(가스 치환 포장)를 결합하여 수율을 92%로 유지하면서 물류비를 반토막($2.95/kg) 내는 Modal Shift가 즉각 요구됩니다."
          />
        </div>
      </div>

      {/* ═══ Section III: Arbitrage & Portfolio ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[2].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[2].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Widget 3-1: Domestic Arbitrage */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Apple size={18} color={SECTIONS[2].color} /> K-대체 과일 지수 스캐너
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>국내 사과 도매가(원/10kg) vs 망고스틴 월별 수입량(톤)</p>
          </div>
          <div style={{ height: '240px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={arbitrageData}>
                {grid}
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis yAxisId="left" {...yAxisProps} label={{ value: '수입량(톤)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} label={{ value: '사과 도매가(원)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="mangoImport" name="망고스틴 수입(톤)" fill="#8b5cf6" barSize={30} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="step" dataKey="applePrice" name="사과 가격(원)" stroke="var(--color-warning)" strokeWidth={2} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="국산 사과/배 가격 폭등기(금사과 현상)에 망고스틴이 일상적인 대체 과일로 부상하며 수요가 비정상적으로 폭발했습니다." 
            actionPlan="국내 대표 과일 물가 지수와 연동된 '차익 거래 스캐너'를 운영하여, 임계 가격 돌파 시 망고스틴 선적량을 공격적으로 증대시키는 전략을 취해야 합니다."
          />
        </div>

        {/* Widget 3-2: B2B vs B2C Margin Tracker */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Snowflake size={18} color="#38bdf8" /> 투트랙(B2C vs B2B) 수익성 트래커
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>생과(Fresh B2C) vs 냉동 퓨레(IQF B2B) 마진율 추이</p>
          </div>
          <div style={{ height: '240px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={marginData}>
                {grid}
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis domain={[0, 30]} {...yAxisProps} label={{ value: '마진율 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="b2cMargin" name="생과 마진(B2C)" stroke="#f472b6" fill="#f472b6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="b2bMargin" name="냉동 가공품 마진(B2B)" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="할당관세 종료 등 외부 요인에 의해 생과 마진(B2C)은 변동성이 극심하나, 냉동 납품(B2B) 마진은 22%대로 매우 안정적입니다." 
            actionPlan="VHT 규제를 우회하고 외부 변수를 차단하는 프랜차이즈향 B2B 냉동 물량 비중을 전체 포트폴리오의 40% 이상으로 확대하여 고정 Cash Flow를 창출해야 합니다."
          />
        </div>
      </div>

      {/* ═══ Section IV: Niche Re-export ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[3].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[3].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Widget 4-1: Bilateral Re-export Flow */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Workflow size={18} color={SECTIONS[3].color} /> 글로벌 무역 가치사슬 흐름 (Arbitrage Flow)
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>국가 간 릴레이 무역 경로 (단위: 톤)</p>
          </div>
          <div style={{ height: '350px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={bilateralReExportData} layout="vertical" margin={{ left: 140 }}>
                {grid}
                <XAxis type="number" {...xAxisProps} />
                <YAxis dataKey="flow" type="category" {...yAxisProps} width={130} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="물동량(톤)" fill="#38bdf8" radius={[0, 4, 4, 0]} barSize={20}>
                  {bilateralReExportData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index > 2 ? 'var(--color-warning)' : '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="원물은 태국 -> 한국 경로가 압도적이나, 부가가치 측면에서 한국 -> 몽골/괌 재수출(노란색)이 단위당 최고 마진을 기록합니다." 
            actionPlan="한국을 최종 소비지가 아닌 '동북아 VHT-Plus 예냉/재포장 허브'로 재정의하고, 검역 인프라가 취약한 제3국 프리미엄 시장(호텔/리조트)을 직접 타격하십시오."
          />
        </div>

        {/* Widget 4-2: Premium Re-export */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <PackageCheck size={18} color={SECTIONS[3].color} /> 프리미엄 재수출 단가 및 물량 (KCS 관세청)
              <span style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', background: '#facc1520', color: 'var(--color-warning)', fontWeight: 700, marginLeft: '4px' }}>BASELINE + SYNTHETIC</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>초프리미엄 니치(Niche) 마켓: 몽골, 괌(VIP 리조트향) 실측 데이터</p>
          </div>
          <div style={{ height: '350px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={krExportData}>
                {grid}
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis yAxisId="left" {...yAxisProps} label={{ value: '수출량 (kg)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" {...yAxisProps} label={{ value: '단가 ($/kg)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar yAxisId="left" dataKey="weight_kg" name="수출 물량(kg)" fill="#38bdf8" barSize={20} radius={[2,2,0,0]} />
                <Line yAxisId="right" type="step" dataKey="unit_price" name="수출 단가($/kg)" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="한국 물류 허브를 거쳐 몽골, 괌 등으로 향하는 망고스틴 재수출(Re-export) 단가는 2026년 기준 최고 12.4$/kg을 기록하며 압도적 수익률을 보입니다." 
            actionPlan="예냉 공정(VHT-Plus)으로 하드쉘 클레임을 원천 차단한 최상급 1%의 물량만을 선별하여, 육로 단절 국가나 고급 리조트 VIP 시장에 재수출하는 하이엔드 트레이딩 파이프라인을 공격적으로 확장하십시오."
          />
        </div>
      </div>

      {/* ═══ Section V: Zero-Waste ESG & Supply Chain Innovation ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[4].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[4].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Widget 5-1: Upcycling (Rind -> Pet Food ESG) */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Leaf size={18} color={SECTIONS[4].color} /> 껍질(Rind) 크산톤 업사이클링 (ESG 모델)
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>과육 단일 판매 vs 껍질 펫푸드 원료 매각 시 수익 시뮬레이션</p>
          </div>
          <div style={{ height: '240px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={upcyclingData} layout="vertical" margin={{ left: 0 }}>
                {grid}
                <XAxis type="number" {...xAxisProps} />
                <YAxis dataKey="scenario" type="category" {...yAxisProps} width={130} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="revenue" name="매출(Revenue)" fill="#a3e635" barSize={15} />
                <Bar dataKey="rindDisposalCost" name="껍질 폐기비용" fill="var(--color-danger)" barSize={15} />
                <Line dataKey="netMargin" name="최종 넷마진" stroke="var(--text-primary)" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="전체 중량의 60~70%에 달하는 껍질은 폐기 비용(-5)을 발생시키나, 고농축 크산톤(Xanthone)을 함유하고 있습니다." 
            actionPlan="기존 과육 중심의 B2C 사업을 넘어, 버려지는 껍질을 당사 '펫푸드 전략 사업부(기능성 토퍼)'로 이관 시 폐기 비용 제로화 및 전체 Net Margin이 1.5배 상승하는 ESG 순환경제가 완성됩니다."
          />
        </div>

        {/* Widget 5-2: 1-MCP Coldchain Extension */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Snowflake size={18} color="#38bdf8" /> 1-MCP 콜드체인 & 해상 운송 한계 돌파
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>일반 냉장(Reefer) vs 1-MCP 에틸렌 억제 처리 수율 방어율</p>
          </div>
          <div style={{ height: '240px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <LineChart data={coldchainData}>
                {grid}
                <XAxis dataKey="day" {...xAxisProps} />
                <YAxis domain={[0, 100]} {...yAxisProps} label={{ value: '신선도 수율(%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="standardYield" name="일반 냉장 보관" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="mcpYield" name="1-MCP (에틸렌 차단)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="일반 해상 냉장 운송 시 25일 차에 수율이 5%로 급락하여 항공 운송($5.5/kg)이 강제되고 있습니다." 
            actionPlan="1-MCP 가스 처리 기술 도입 시 해상 운송(25일 차)에도 수율을 78% 이상 방어할 수 있어, 해상 운송비 절감($2.95/kg) 및 소매 매대(Shelf-life) 체류 시간 확장이 가능합니다."
          />
          <div style={{ marginTop: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.8rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: '#fca5a5', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--color-danger)' }}>⚠️ NotebookLM 검증 경고:</strong> 1-MCP를 VHT 증열처리 <strong>직후</strong> 적용하면 과피 표면에 <strong>검은 반점(lenticel blackening)</strong>이 발생합니다. 반드시 열처리 <strong>이전</strong>에 적용하거나, MAP(가스치환포장)과 결합하여 공정을 설계해야 합니다.
            </div>
          </div>
        </div>

        {/* Widget 5-3: RCEP Arbitrage Sankey/Bar */}
        <div style={{ background: '#181818', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
              <Landmark size={18} color="var(--color-warning)" /> RCEP 삼각 무역 (관세/마진 아비트리지)
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>국가별/경로별 수입 관세(%) 및 최종 마진율 비교</p>
          </div>
          <div style={{ height: '240px', width: '100%', marginBottom: '1rem' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={rcepArbitrageData} layout="vertical" margin={{ left: 0 }}>
                {grid}
                <XAxis type="number" {...xAxisProps} />
                <YAxis dataKey="route" type="category" {...yAxisProps} width={120} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="tariff" name="관세율 (%)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="margin" name="최종 마진율 (%)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <TakeawayBox 
            situation="태국산 직수입 시 한-아세안 FTA 한계로 여전히 24%의 높은 할당/기본 관세가 마진을 압박합니다." 
            actionPlan="저단가 인도네시아 원물을 베트남(가공 인프라)으로 수출해 IQF 퓨레로 1차 가공한 후, RCEP 무관세(0%) 조항을 태워 한국에 반입하는 '삼각 무역 라인'을 개척해야 합니다."
          />
        </div>

      </div>

    </div>
  );
}
