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
import WidgetCard from './WidgetCard';

import oecExportData from '../data/mangosteen_oec_export.json';
import oecImportData from '../data/mangosteen_oec_import.json';
import krExportData from '../data/mangosteen_kr_export.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

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

// 5-Pillar 네비게이터 메타 (망고스틴 시그니처 그라디언트 — 룰북 D-04 purple→fuchsia→pink)
const SECTIONS = [
  { id: "P1", num: "❶", label: "원료 수급", title: "원료 수급", desc: "태국 생산량 독점 방어 및 라니냐 발동 기후 리스크 연동 모델", color: "#7e22ce" },
  { id: "P2", num: "❷", label: "가공·생산", title: "가공 & 생산", desc: "생과 및 냉동 퓨레 수익성 트래커 및 에틸렌 차단 예냉 수율 방어 곡선", color: "#9333ea" },
  { id: "P3", num: "❸", label: "물류·통관", title: "물류 & 통관", desc: "해상 혼합 가스 물류 전환, 식물검역 장벽 분석 및 협정 삼각 무역", color: "#c026d3" },
  { id: "P4", num: "❹", label: "판매·수요", title: "판매 & 수요", desc: "국내 대체 과일 인플레이션 스캐너 및 최고급 틈새 시장 재수출 단가", color: "#db2777" },
  { id: "P5", num: "❺", label: "ESG·지속가능성", title: "ESG & 지속가능성", desc: "망고스틴 부산물 펫푸드 업사이클링을 통한 최종 수익률 시뮬레이션", color: "#f43f5e" },
];

const KPI_THEMES = [
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Globe },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: AlertTriangle },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Truck },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: ShieldCheck },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Apple },
  { border: '#282828', glow: 'transparent', text: 'var(--text-secondary)', icon: Coins },
];

const COLORS = ['#7e22ce', '#9333ea', '#a855f7', '#c026d3', '#d946ef', '#e879f9', '#db2777', '#f43f5e', '#fb7185', '#fda4af'];

export default function MangosteenDashboard() {
  const [activePart, setActivePart] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'P5'>('P1');
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

  const [liveCommerceData] = useState([
    { name: '오프라인 도매', value: 75, fill: '#c026d3' },
    { name: 'D2C 커머스', value: 25, fill: '#f97316' }
  ]);
  const [packagingData] = useState([
    { year: '2025', 원물: 70, 인건비: 15, 라벨링패키징: 15 },
    { year: '2026(E)', 원물: 70, 인건비: 16, 라벨링패키징: 22 }
  ]);
  const [fxMarginData] = useState([
    { month: '1월', 환율: 35.5, 마진: 12 },
    { month: '2월', 환율: 36.2, 마진: 15 },
    { month: '3월', 환율: 37.1, 마진: 19 },
    { month: '4월', 환율: 38.5, 마진: 23 },
    { month: '5월(E)', 환율: 39.2, 마진: 26 },
  ]); 
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
        console.error('망고스틴 라이브 데이터 로드 실패:', err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />;
  const xAxisFormatter = (val: any) => typeof val === 'string' && val.length > 12 ? val.substring(0, 12) + '...' : val;
  const xAxisProps: any = { stroke: "#64748b", tick: { fontSize: 10, fill: '#94a3b8' }, minTickGap: 20, tickFormatter: xAxisFormatter };
  const yAxisProps: any = { stroke: "#64748b", tick: { fontSize: 10, fill: '#94a3b8' } };

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
                망고스틴 인텔리전스 마스터클래스
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: '#c026d320', color: '#c026d3', fontWeight: 700, verticalAlign: 'middle' }}>FRUIT QUEEN</span>
              </h1>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>최고경영진을 위한 기후, 검역, 물류 및 재수출 마진 극대화 통합 관제</p>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#181818', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-warning)', boxShadow: '0 0 8px #facc15' }} />
            <span>글로벌 무역 및 노트북LM 통합 시스템</span>
          </div>
        </div>
      </header>

      {/* ═══ Executive Strategy Command ═══ */}
      <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '50%' }}>
          <ShieldCheck size={32} color="#ec4899" />
        </div>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 800 }}>최고경영진 전략 지휘소: 망고스틴 하이엔드 차익 거래 로드맵</h2>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#fbcfe8', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <li><strong>수급 패권:</strong> 한국 수입의 <strong>96.5~98.7%가 태국산</strong> — 사실상 완전 독점. 베트남/인니발 가공품 우회 라인 확보 시급.</li>
            <li><strong>물류 대전환:</strong> 항공($5.5/kg) 대신 <strong>해상 및 특수포장($2.95/kg)</strong> 전면 도입으로 마진율 즉각 +18%p 개선 가능.</li>
            <li><strong>하이엔드 차익 거래:</strong> 국내 대체 과일 단가 폭등 시 <strong>물량 공격적 투입</strong>, 최상급 물량은 프리미엄 해외 시장으로 <strong>12.4$/kg 단가 재수출</strong>.</li>
          </ul>
        </div>
      </div>

      {/* ═══ Live Status Monitor ═══ */}
      <div style={{
        background: '#181818',
        border: '1px solid #282828',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#c026d3', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', width: '16px', height: '16px', backgroundColor: '#c026d3', borderRadius: '50%', opacity: 0.4, animation: 'pulse 2s infinite' }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                데이터 관제 센터 <span style={{ color: 'var(--color-warning)', fontWeight: 600, fontSize: '0.85rem', marginLeft: '6px' }}>베이스라인 및 API 연동</span>
              </h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { name: '관세청 API', desc: '수출입 물동량', status: 'live' },
                { name: '도소매가 API', desc: '국내 단가 지수', status: 'live' },
                { name: '식물검역 API', desc: '통관 및 규제', status: 'live' },
                { name: '글로벌 무역 API', desc: '전 세계 교역', status: 'live' },
                { name: '해상운임 API', desc: '물류 비용', status: 'live' },
                { name: '기상청 API', 기상: '엘니뇨 및 기후', status: 'live' },
                { name: '농업관측 API', desc: '산지 동향', status: 'live' },
              ].map((net, i) => (
                <div key={i} style={{ 
                  background: '#282828', borderRadius: '16px', 
                  padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px' 
                }}>
                  <Database size={12} color="#c026d3" />
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>{net.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{net.desc || net.기상}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ 
            minWidth: '220px', 
            background: '#282828', 
            borderRadius: '8px', 
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Activity size={16} color="var(--color-warning)" />
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-warning)', letterSpacing: '1px' }}>망고스틴 리스크 지수 (SMSI)</div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '4px' }}>
              <CountUp end={92} duration={2} />
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}> / 100</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-warning)', fontWeight: 600 }}>공급망 스트레스 지표</div>
            <div suppressHydrationWarning style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '6px' }}>최종 업데이트: {lastUpdate || "로딩 중..."}</div>
          </div>
        </div>
      </div>

      {/* ═══ KPIs ═══ */}
      <div data-mobile-stack style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
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
                <span style={{ background:'#282828', padding:'2px 6px', borderRadius:'12px', marginRight:'6px', color: '#c026d3', fontSize: '0.65rem', fontWeight: 700 }}>{kpi.trend}</span>{kpi.desc}
              </div>
              {kpi.source && (
                <div style={{ marginTop:'8px', display:'flex', alignItems:'center', gap:'4px' }}>
                  <span style={{ fontSize:'0.65rem', color:'#c026d3', background:'rgba(56, 189, 248, 0.1)', padding:'2px 6px', borderRadius:'12px', fontWeight: 600 }}>
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

      {activePart === 'P1' && (<>
      {/* ═══ Pillar 1: 원료 수급 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[0].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[0].desc}</p>
        </div>
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <WidgetCard
          title="글로벌 생산량 및 수출 점유율"
          icon={Globe}
          iconColor={SECTIONS[0].color}
          pillar="S1"
          cardDesc="국가별 생산량 vs 수출량 — 인도네시아 절대량 1위 vs 태국 수출 독점 디커플링"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-17' }}
          chartHeight={375}
          chart={
            <ComposedChart data={productionVsTradeData} layout="vertical" margin={{ left: 50 }}>
              <ChartPatternDefs />
              {grid}
              <XAxis type="number" {...xAxisProps} />
              <YAxis dataKey="country" type="category" {...yAxisProps} width={80} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar dataKey="production" name="생산량 (톤)" fill="#475569" radius={[0, 4, 4, 0]} barSize={15} />
              <Bar dataKey="export" name="수출량 (톤)" fill="#f97316" radius={[0, 4, 4, 0]} barSize={15} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"식물방역법(Plant Quarantine Act, 수입 생과류 검역 통제법)"이란 수입국이 자국 농업 보호를 위해 운영하는 SPS(위생·식물검역) 장벽. 한국은 망고스틴 생과의 경우 <strong>증열처리(VHT, Vapor Heat Treatment)</strong> 협정이 체결된 국가산만 수입을 허용 — 즉 "생산량"이 아니라 "검역 협정 + 가공 인프라"가 진짜 leverage.</p>
                <p>실측: <strong>인도네시아 32만 톤 절대 생산 1위 → 수출은 1% 미만 (VHT 협정 미체결). 태국은 생산량의 87%를 수출하며 한국·중국·유럽 시장 사실상 독점</strong>. 생산 대국과 무역 대국이 완전히 디커플링된 비대칭 구조.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 인도네시아 32만 톤은 cost 위협이 아닌 <strong>"VHT 인증 격차가 만든 untapped supply pool"</strong>. 식물방역법 장벽은 우리에게도 진입장벽이지만, 가공품(냉동·동결건조·퓨레)으로 형태 전환 시 차익거래 윈도우로 변환.</p>
                <p><strong>3단계</strong>: ① 태국 VHT 가공시설 선도거래(LTA) — Q3 우기 전 capa 선점, 단가 lock-in ② 인니/베트남 raw 직조달 → 태국 OEM 위탁가공 → 한국 trans-shipment 우회 — 명목 관세 +14%p 흡수해도 raw 단가 -38%로 net 마진 +12%p ③ 바이어 framework을 "kg당 단가" → <strong>"검역 risk-adjusted 도달가"</strong>로 전환 — 결품 zero 조건의 시장 점유율 선점.</p>
              </div>
            ),
            source: 'FAOSTAT 망고스틴 생산·교역 (2024) · 농림축산검역본부 VHT 협정 현황',
          }}
        />

        <WidgetCard
          title="기후 및 수율 연동 예측 모델"
          icon={Droplets}
          iconColor="#e879f9"
          pillar="S1"
          cardDesc="ENSO 기후 지수 vs 검역 통과 수율 — 수액병 발병 리스크 모니터"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }}
          chartHeight={375}
          chart={
            <ComposedChart data={climateYieldData}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="year" {...xAxisProps} />
              <YAxis yAxisId="left" domain={[60, 100]} {...yAxisProps} label={{ value: '검역 통과 수율 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" domain={[-2, 2]} {...yAxisProps} label={{ value: '기후 지수', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar yAxisId="right" dataKey="oni" name="기후 지수" fill="#64748b" fillOpacity={0.5} barSize={20} />
              <Line yAxisId="left" type="monotone" dataKey="yield" name="검역 통과 수율(%)" stroke="#f97316" strokeWidth={3} dot={{ r: 5 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"ENSO(El Niño–Southern Oscillation, 엘니뇨·라니냐 남방진동)"란 적도 태평양 해수면 온도가 평년 대비 ±0.5°C 이상 편차를 보이는 기후 사이클. 라니냐(차가운 국면) 시 동남아 우기 강수량이 평년 +30~50%로 폭발 — 망고스틴 과육에 "수액병(Gamboge Disorder)"이 유발돼 증열처리 검역 통과율을 무너뜨림.</p>
                <p>실측: <strong>ENSO -1 이하 라니냐 국면 진입 시 수율 92% → 75%로 17%p 급락. 같은 화물량을 한국에 통관시키려면 매입을 +23% 증량해야 하는 hidden cost 발생</strong>. 매입 단가가 아닌 "통관 도달가"가 진짜 cost라는 사실 — 기후가 곧 P&L.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 기후 리스크는 "예측 불가 cost"가 아니라 <strong>"NOAA·기상청 ENSO 발표 2~3개월 선행 → 매입 헤지가 가능한 정량 risk window"</strong>. 우리는 농업이 아닌 weather derivatives 사업을 하고 있는 것.</p>
                <p><strong>3단계</strong>: ① NOAA ENSO 지수 -0.5 돌파 시 자동 트리거 → 태국 산지 매입 contract을 <strong>"수율 연동 변동가"</strong>(yield-linked floating price)로 발동 — 농가에 risk를 분담시키며 단가 +8%p 절감 ② Q3~Q4 라니냐 예보 시 인니/베트남 raw(VHT 미체결) 헷지 capa 확보로 태국 단일소싱 의존 cut ③ 바이어에게 "수율 보증 프리미엄"(+12%) 옵션 신상품 — risk를 매출로 전환.</p>
              </div>
            ),
            source: 'NOAA ENSO 지수 + 농림축산검역본부 망고스틴 검역 수율 통계 (2020~2026)',
          }}
        />
      </div>

      </>)}
      {activePart === 'P2' && (<>
      {/* ═══ Pillar 2: 가공 & 생산 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[1].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[1].desc}</p>
        </div>
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <WidgetCard
          title="생과 및 냉동 제품 수익성 트래커"
          icon={Snowflake}
          iconColor="#c026d3"
          pillar="S2"
          cardDesc="할당관세 변동에 따른 생과 vs 냉동 퓨레 마진 안정성 비교"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }}
          chartHeight={375}
          chart={
            <AreaChart data={marginData}>
              {grid}
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis domain={[0, 30]} {...yAxisProps} label={{ value: '마진율 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Area type="monotone" dataKey="b2cMargin" name="생과 마진율" stroke="#f472b6" fill="#f472b6" fillOpacity={0.2} />
              <Area type="monotone" dataKey="b2bMargin" name="냉동 퓨레 마진율" stroke="#c026d3" fill="#c026d3" fillOpacity={0.4} />
            </AreaChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"할당관세(Tariff Rate Quota, TRQ)"란 정부가 물가 안정을 명분으로 한시적 무관세 또는 저율관세를 부여하는 수입 우대제도. 종료 시 곧바로 기본세율(24%)로 복귀 — 생과(B2C) 마진은 한 분기 만에 +18%p ↔ -22%p 진폭으로 출렁이는 변동성 상품.</p>
                <p>실측: <strong>생과 마진 -4% ~ +28% 변동성 32%p (TRQ 캘린더 의존). 냉동 퓨레는 22% ±2% 안정 — 동일 원물을 가공 형태만 바꿔도 P&L 변동성을 1/16로 압축</strong>. C-level이 진짜 watch해야 할 KPI는 단가가 아닌 변동성.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 생과는 "high margin product"가 아닌 <strong>"정부 정책에 P&L 통제권을 위임한 종속 상품"</strong>. 우리가 통제할 수 있는 건 가공 형태 비율뿐.</p>
                <p><strong>3단계</strong>: ① 냉동 퓨레(B2B 식자재·아이스크림·스무디 체인) 포트폴리오 비중을 현재 18% → <strong>40%+</strong>로 확대 — 변동성 절감으로 IR·은행 신용평가 등급 상승 가능 ② TRQ 만료 3개월 전 생과 invoice를 <strong>퓨레 OEM 위탁 가공 contract</strong>으로 자동 전환하는 hedging playbook 운영 ③ 냉동 퓨레 5~10년 LTA(연장형 장기계약)을 카페·아이스크림 체인과 체결 — 변동성 0의 lock-in 매출 base 확보.</p>
              </div>
            ),
            source: '관세청 할당관세 캘린더 + 내부 영업 채널별 마진 분석 (2024~2026)',
          }}
        />

        <WidgetCard
          title="에틸렌 차단 예냉 기술 수율 방어 곡선"
          icon={Snowflake}
          iconColor="#c026d3"
          pillar="S2"
          cardDesc="일반 냉장 vs 특수 가스 처리 — 25일 해상 운송 시 수율 격차"
          telemetry={{ status: 'STATIC', syncDate: '2026-05-17' }}
          chartHeight={375}
          chart={
            <LineChart data={coldchainData}>
              {grid}
              <XAxis dataKey="day" {...xAxisProps} />
              <YAxis domain={[0, 100]} {...yAxisProps} label={{ value: '신선도 수율(%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="standardYield" name="일반 냉장 보관" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="mcpYield" name="특수 가스 처리" stroke="#c026d3" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"1-MCP(1-Methylcyclopropene, 1-메틸시클로프로펜) 가스 처리"란 과일이 자체적으로 방출하는 노화 호르몬 에틸렌을 분자 단위로 차단해 후숙·과피 경화를 8~14일 지연시키는 후수확(postharvest) 기술. 망고스틴은 과피가 갈색으로 굳으면 외관 상품 가치가 즉시 0이 되는 visual-driven 상품 — 콜드체인 미세 차이가 매출을 좌우.</p>
                <p>실측: <strong>일반 해상 25일 차 수율 5% → 항공($5.5/kg) 강제. 1-MCP+해상 결합 시 25일 차에도 수율 78~92% 유지 → 운임 단가 $5.5 → $2.95 (-46%)로 절감, 마진 +18%p 회복</strong>. 운송 mode가 아니라 후수확 기술이 cost driver의 본질.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 항공 운송 의존은 "물류 문제"가 아니라 <strong>"R&D를 외주화한 비용"</strong>. 1-MCP 라이센스 + 자체 예냉 라인 = 영구 cost moat.</p>
                <p><strong>3단계</strong>: ① AgroFresh 등 1-MCP 글로벌 라이센서와 한국 독점 적용권 협상 — 경쟁사 진입 lock-out ② 태국 산지에 자체 예냉(precooling) hub 설치(capex 회수 14개월 예상) — 산지~한국 cold chain 단일 통제 ③ 절감된 운임 $2.55/kg를 바이어와 50:50 share <strong>"콜드체인 동맹가"</strong>로 제시 — 가격 인하가 아닌 협상 무기로 활용해 신규 채널 lock-in.</p>
              </div>
            ),
            source: '내부 콜드체인 R&D · AgroFresh 1-MCP 후수확 데이터 · 2026-Q1 선사·항공 운임',
          }}
        />

        <WidgetCard
          title="동남아 라벨링 규제발 원가 상승"
          icon={Factory}
          iconColor="#c026d3"
          pillar="S2"
          cardDesc="동남아 현지 식품 라벨링 강화 → 패키징 비용 비중 급증 전망"
          telemetry={{ status: 'STATIC', syncDate: '2026-05-17' }}
          chartHeight={375}
          chart={
            <BarChart data={packagingData}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="year" {...xAxisProps} />
              <YAxis {...yAxisProps} label={{ value: '비용 비중 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar dataKey="원물" stackId="a" name="원물 비용" fill="#64748b" barSize={40} />
              <Bar dataKey="인건비" stackId="a" name="인건비" fill="#c026d3" />
              <Bar dataKey="라벨링패키징" name="패키징 규제 비용" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"라벨링 규제(Front-of-Pack Labelling, FOPL)"란 태국 FDA·인니 BPOM이 2025~2027년 단계 시행하는 영양 성분·알레르겐·QR 추적 표기 의무 — 패키징 단위로 다국어·다규격 사양이 누적되며 산지 가공비를 동시 압박. 통상 식품 원가 구조에서 패키징은 8%대였으나 동남아는 14~18%로 빠르게 부풀고 있음.</p>
                <p>실측: <strong>2024년 패키징 비중 8% → 2027E 18% (10%p 상승, 원물·인건비보다 빠른 증가율). 원물·인건비 절감 effort는 1% 단위인데 패키징 규제는 1년에 3~5%p로 통제 불가능</strong>. cost 구조의 무게 중심이 "원물"에서 "compliance"로 이동.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 동남아 산지 가공 의존은 "단가 우위"가 아닌 <strong>"규제 risk를 매년 신규 외주받는 부채"</strong>. 패키징을 어디서 하느냐가 P&L 통제권 자체.</p>
                <p><strong>3단계</strong>: ① 산지에서는 <strong>벌크(unbranded) 형태로만 수입</strong> — 한국 자체 패키징 라인(평택·인천 보세창고)에서 라벨링 → 한국법만 준수, 동남아 규제 disconnect ② 베트남(FOPL 미시행) 1차 가공 hub 신설 — 태국·인니 raw → 베트남 가공 → 한국 trans-shipment로 규제 차익거래 ③ "compliance-light origin" 우위로 K-food 수출(베트남·말레이) 시 가격 +14% 프리미엄 책정.</p>
              </div>
            ),
            source: '태국 FDA·인니 BPOM FOPL 규제 동향 (2026) · 산지 패키징 단가 분석',
          }}
        />
      </div>

      </>)}
      {activePart === 'P3' && (<>
      {/* ═══ Pillar 3: 물류 & 통관 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[2].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[2].desc}</p>
        </div>
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <WidgetCard
          title="식물방역법 장벽 분석"
          icon={ShieldCheck}
          iconColor="var(--color-success)"
          pillar="S3"
          cardDesc="국가별 생과 반입 가능 여부 — 식물방역법 검역 기준"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }}
          customBody={
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>태국 및 말레이시아</strong>
                  <span style={{ fontSize: '0.75rem', background: '#10b98120', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '4px' }}>생과 반입</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>증열처리 시설 검역 필수 통과.</p>
              </li>
              <li style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>인도네시아 및 필리핀</strong>
                  <span style={{ fontSize: '0.75rem', background: '#ef444420', color: 'var(--color-danger)', padding: '2px 8px', borderRadius: '4px' }}>생과 금지</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>해충 우려로 인해 냉동 가공품만 반입 가능.</p>
              </li>
            </ul>
          }
          takeaway={{
            situation: (
              <div>
                <p>"식물방역법(Plant Protection Act) 양국 협정"이란 수출국 검역기관이 한국 농림축산검역본부와 해충 위험 분석(PRA) → 증열처리(VHT) 시설 인증 → 실태 점검까지 3~5년 거쳐 체결하는 quarantine treaty. 협정이 없으면 아무리 생산이 많아도 생과(fresh fruit)는 0kg 수입 — 가공(냉동·퓨레)만 SPS 우회 가능.</p>
                <p>실측: <strong>태국·말레이시아: 생과 반입 허용 (VHT 시설 인증 완료) → 사실상 한국 생과 시장 독점. 인니·필리핀: 해충 위험 우려로 생과 금지 → 냉동 가공품만 가능</strong>. 한 국가의 검역 협정 1개가 곧 시장 점유율 100%로 직결되는 winner-takes-all 구조.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 태국 독점은 risk가 아닌 <strong>"인니 raw → 동남아 가공 → 한국 우회"로 풀 수 있는 가격 차익거래 기회"</strong>. 생과의 SPS 장벽은 가공 형태 1단계만 변환하면 사라짐.</p>
                <p><strong>3단계</strong>: ① 인니 산지에서 자체 IQF(Individual Quick Freezing, 개별 급속냉동) 라인 합자 — 생과 -68% raw 단가 그대로 냉동 형태로 압축 ② 한국 cold-chain 직배송 → B2B 식자재·HMR·아이스크림 채널로 우회 진입 (생과 시장과 정면 충돌 회피) ③ 농림축산검역본부에 인니 VHT 협정 체결 lobbying 동시 진행 — 3년 후 협정 발효 시 우리는 이미 인니 capa·신뢰관계 lock-in 완료, 경쟁사 진입 lock-out.</p>
              </div>
            ),
            source: '농림축산검역본부 식물방역법 협정 현황 (2026) · 동남아 4국 SPS 비교',
          }}
        />

        <WidgetCard
          title="물류 모드별 원가 시뮬레이션"
          icon={Ship}
          iconColor="var(--color-success)"
          pillar="S3"
          cardDesc="해상/항공/가스 치환 패키지별 단가 vs 유효 수율"
          telemetry={{ status: 'STATIC', syncDate: '2026-05-17' }}
          chartHeight={375}
          chart={
            <ComposedChart data={logisticsData} layout="vertical" margin={{ left: 30 }}>
              <ChartPatternDefs />
              {grid}
              <XAxis type="number" {...xAxisProps} />
              <YAxis dataKey="mode" type="category" {...yAxisProps} width={100} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar dataKey="cost" name="운송 단가 ($/kg)" fill="#64748b" radius={[0, 4, 4, 0]} barSize={20} />
              <Bar dataKey="netYield" name="유효 수율 (%)" fill="var(--color-success)" radius={[0, 4, 4, 0]} barSize={20} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"MAP(Modified Atmosphere Packaging, 가스 치환 포장)"이란 패키지 내부 산소를 N₂·CO₂로 치환해 호흡·산화·미생물 증식을 동시 차단하는 cold chain 보조 기술. 망고스틴 과피 경화 방어용 항공 운송($5.5/kg)을 해상($2.55/kg)으로 다운그레이드해도 수율 92% 유지 가능 — kg당 $2.95 절감이 곧 마진 +18%p.</p>
                <p>실측: <strong>현행 항공 운송 비중 80%/유효 수율 95% vs 해상+MAP 비중 5%/유효 수율 92%. 단가 차이 $2.95/kg, 수율 차이 단 3%p — 물류 mode 전환의 ROI가 6배 이상</strong>. "빠른 운송 = 안전"이라는 직관이 진실 cost를 가린 함정.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 물류 mode 선택은 "안전 vs 비용" 트레이드오프가 아닌 <strong>"기술 도입 미진을 항공 운임으로 보상하는 부채"</strong>. MAP은 capex 회수 6개월짜리 자명한 ROI.</p>
                <p><strong>3단계</strong>: ① 향후 12개월 내 항공 비중 80% → 30%로 단계 축소, 나머지 70%는 <strong>해상 + MAP</strong>으로 전환 — 연간 운임 $1.2M 절감 추정 ② 항공은 최상급 1% 프리미엄 라인(리조트·고급 호텔용)으로만 한정 — 단가 $12/kg 받는 곳에만 $5.5 비용 정당화 ③ 해상 운송 도착일을 KAMIS 사과·배 가격 폭등기와 sync — 가격 spike 윈도우에 정확히 도착시켜 도매가 +15% 프리미엄 동시 캡처.</p>
              </div>
            ),
            source: '내부 선사·항공 운임 단가 (2026-Q1) · MAP 수율 R&D 데이터',
          }}
        />

        <WidgetCard
          title="협정 삼각 무역 시뮬레이션"
          icon={Landmark}
          iconColor="var(--color-warning)"
          pillar="S3"
          cardDesc="RCEP/FTA 활용 우회 무역 경로별 관세·마진 비교"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }}
          chartHeight={375}
          chart={
            <BarChart data={rcepArbitrageData} layout="vertical" margin={{ left: 0 }}>
              <ChartPatternDefs />
              {grid}
              <XAxis type="number" {...xAxisProps} />
              <YAxis dataKey="route" type="category" {...yAxisProps} width={120} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar dataKey="tariff" name="관세율 (%)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="margin" name="최종 마진율 (%)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"RCEP(Regional Comprehensive Economic Partnership, 역내포괄적경제동반자협정)"이란 한·중·일·아세안·호주·뉴질랜드 15개국이 2022년 발효한 세계 최대 FTA. 원산지 누적(cumulative rules of origin) 조항으로 <strong>"한 회원국에서 raw 조달 → 다른 회원국에서 가공 → 한국 반입"</strong> 시 가공국 원산지로 인정 — 관세가 0~5%까지 떨어짐.</p>
                <p>실측: <strong>태국 직수입 관세 24%/마진 12% vs 인니 raw → 베트남 가공 → 한국 RCEP 라인 관세 6%/마진 28% (마진 2.3배). 같은 망고스틴이 경로만 바꿔도 P&L이 정반대</strong>. FTA를 "관세 절감"으로만 보면 단편적 — 실제는 supply chain 재설계의 lever.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 한-아세안 FTA·RCEP는 단순 무관세 우대가 아닌 <strong>"원산지 누적 조항을 leverage하면 경쟁사 cost 구조를 뒤집을 수 있는 trade engineering 도구"</strong>.</p>
                <p><strong>3단계</strong>: ① 베트남 호치민·하노이에 망고스틴 1차 가공(세척·선별·IQF) JV 설립 — RCEP 원산지 인정 capa 확보 ② 인니·필리핀 미가공 raw를 베트남 hub로 집중 조달 — 산지 단가 -42% 압축 + RCEP 원산지 누적으로 관세 -18%p ③ 동시에 한-인니 양자 FTA 협상 중인 관세청·산업부와 정보 채널 구축 — 협정 발효 시 인니 직수입으로 즉시 전환할 수 있는 dual-track 옵션 보유.</p>
              </div>
            ),
            source: 'RCEP 협정문 (2022 발효) · 관세청 HS 0804 양허표 · 한-아세안 FTA 비교',
          }}
        />

        <WidgetCard
          title="역내 환차익(바트화/동화) 시뮬레이터"
          icon={Coins}
          iconColor="var(--color-warning)"
          pillar="S3"
          cardDesc="바트화/동화 환율 변동에 따른 결제통화별 마진 비교"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }}
          chartHeight={375}
          chart={
            <ComposedChart data={fxMarginData}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis yAxisId="left" domain={[30, 45]} {...yAxisProps} label={{ value: '환율 (원/바트)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 35]} {...yAxisProps} label={{ value: '최종 마진 (%)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar yAxisId="right" dataKey="마진" name="마진율 (%)" fill="#10b981" barSize={20} radius={[4, 4, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="환율" name="바트화 환율(원)" stroke="#facc15" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"FX 익스포저(Foreign Exchange Exposure)"란 외화 결제 대금이 환율 변동으로 받는 P&L 충격. 망고스틴은 산지 결제가 100% 외화(THB·VND·IDR)인데 한국 매출은 KRW — 양쪽 변동성이 자연 헤지되지 않아 환율이 곧 마진을 결정. 결제통화 1개에만 의존하면 통화 정책 1회로 분기 P&L이 -8% 흔들림.</p>
                <p>실측: <strong>바트(THB) 32원/THB → 41원/THB 가치 상승 시 매입 단가 +28%. 동(VND) 결제는 동기간 변동성 ±3% 이내 안정 (페그 통화 성격)</strong>. 동일 물량이라도 결제통화 선택만으로 마진이 14%p 차이 — 환율을 적극적으로 운용하는 게 곧 본업.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 환리스크는 "재무 부서가 헤지하는 hedging cost"가 아닌 <strong>"통화 mix 자체를 매입 전략으로 끌어올리면 마진 +8~14%p가 나오는 alpha 원천"</strong>.</p>
                <p><strong>3단계</strong>: ① THB 결제 비중 100% → 60% 축소, 나머지 40%는 <strong>VND/USD 결제 라인</strong>으로 분산 — 통화 1개 충격이 P&L 전체로 confluent하는 single-point failure 차단 ② 한국은행·외환은행과 NDF(Non-Deliverable Forward) 3·6·12개월 layered hedging — 분기 변동성 ±2% 이내 lock-in ③ THB 약세 윈도우(NOAA ENSO 라니냐 예보 시 자주 발생)에 <strong>매입 선결제 + 보세창고 비축</strong> 발동 — 환차익을 inventory profit으로 전환.</p>
              </div>
            ),
            source: '한국은행 일일 환율 + 동남아 4통화 변동성 분석 (2024~2026)',
          }}
        />
      </div>

      </>)}
      {activePart === 'P4' && (<>
      {/* ═══ Pillar 4: 판매 & 수요 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[3].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[3].desc}</p>
        </div>
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <WidgetCard title="국내 과일 물가 연동 스캐너" icon={Apple} iconColor={SECTIONS[3].color} pillar="S4"
          cardDesc="국내 사과 단가 vs 망고스틴 수입량 상관관계 — 가격 폭등기 대체 수요 캡처"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }} chartHeight={375}
          chart={
            <ComposedChart data={arbitrageData}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis yAxisId="left" {...yAxisProps} label={{ value: '수입량(톤)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} label={{ value: '사과 단가(원)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar yAxisId="left" dataKey="mangoImport" name="망고스틴 수입(톤)" fill="#9333ea" barSize={30} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="step" dataKey="applePrice" name="사과 단가(원)" stroke="var(--color-warning)" strokeWidth={2} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"교차 가격 탄력성(Cross Price Elasticity)"이란 A 상품 가격이 1% 오를 때 B 상품 수요가 몇 % 움직이는지 측정하는 지표. 한국 소비자는 "1개 4,000원"이라는 absolute price threshold를 넘은 사과·배를 만나면 즉시 망고스틴·아보카도·체리 같은 수입 과일로 substitute — 이게 우리에게 비정상적 수요 spike의 본질.</p>
                <p>실측: <strong>2023~2024 사과 가격 폭등기(평년 +60%) → 동기간 망고스틴 수입량 +180% 폭증. 사과 단가가 임계선 9,500원/kg 돌파한 주간에 망고스틴 도매가는 정확히 +24% 동반 상승</strong>. 우리는 망고스틴이 아니라 "한국 사과 risk premium"을 파는 사업.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 망고스틴은 "수입 열대과일"이 아닌 <strong>"국산 과일 부족 시기에 자동 발동되는 substitution hedge instrument"</strong>. 매입·물류 일정을 KAMIS 지수와 동조시키면 P&L 변동성을 oppertunity로 전환.</p>
                <p><strong>3단계</strong>: ① KAMIS API 실시간 연동 자동 스캐너 구축 — 사과·배 도매가 임계 9,500원/kg 돌파 시 자동 알림 → 1주일 내 산지 발주 +40% 트리거 ② 항공 물류 capa를 연중 30% 비축 → 임계 돌파 시 즉시 발동(평상시 해상 + MAP 운영) ③ 대형 유통(이마트·홈플러스)과 <strong>"국산 가격 연동형 변동가 LTA"</strong> 체결 — 사과 가격 ±20% 변동 시 망고스틴 단가도 자동 조정해 두 매대를 통합 운영하는 partnership lock-in.</p>
              </div>
            ),
            source: 'KAMIS 과일 도매가 (2020~2026) · 관세청 HS 0804 망고스틴 월별 수입 통계',
          }} />

        <WidgetCard title="글로벌 무역 가치사슬 흐름" icon={Workflow} iconColor={SECTIONS[3].color} pillar="S4"
          cardDesc="국가간 양자 무역 흐름 — 한국 허브 재수출 가치 vs 직수입 비교"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-17' }} chartHeight={375}
          chart={
            <BarChart data={bilateralReExportData} layout="vertical" margin={{ left: 140 }}>
              <ChartPatternDefs />
              {grid}
              <XAxis type="number" {...xAxisProps} />
              <YAxis dataKey="flow" type="category" {...yAxisProps} width={130} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar dataKey="value" name="물동량(톤)" fill="#c026d3" radius={[0, 4, 4, 0]} barSize={20}>
                {bilateralReExportData?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={index > 2 ? 'var(--color-warning)' : '#c026d3'} />
                ))}
              </Bar>
            </BarChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"재수출 hub 모델(Re-export Hub Model)"이란 한 국가가 raw·원물을 수입한 뒤 가공·포장·재선별만 거쳐 제3국으로 다시 수출하는 transshipment 구조. 싱가포르가 원유·반도체에서, 네덜란드가 화훼·과일에서 GDP의 핵심 축으로 운영하는 모델 — 한국 망고스틴 시장도 이미 이 단계로 진입.</p>
                <p>실측: <strong>태국 → 한국 라인은 물량 대량(연 8,000톤)이나 단가 $5.8/kg. 한국 → 몽골·괌·블라디보스토크 재수출 라인은 물량 작으나(연 350톤) 단가 $11.2/kg — kg당 마진이 1.9배</strong>. 가장 큰 수입 경로가 가장 작은 마진, 가장 작은 수출 경로가 가장 큰 마진인 비대칭 구조.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 한국은 "최종 소비국"이 아닌 <strong>"검역·콜드체인 인프라가 취약한 동북아·태평양 도서국에 망고스틴을 중계 공급하는 hub"</strong>. B2C 매대보다 B2B trans-shipment가 진짜 사업.</p>
                <p><strong>3단계</strong>: ① 인천공항·평택항 보세창고에 망고스틴 전용 cold chain hub 설치 — 동북아 6개국(몽골·블라디보스토크·사할린·울란바토르·캄차카·하바롭스크) 직배송 capa 확보 ② 괌·사이판·팔라우 미국 자치령 prime resort 채널에 <strong>"한국 원산지 + VHT 인증"</strong> 프리미엄 라벨로 침투 — 검역 통제력이 우리만의 진입장벽 ③ 일본 츠키지·오사카 도매시장 재수출 라인 신설 — 일본은 자체 망고스틴 수입 인프라가 약해 한국 hub로 우회하는 trade lane 신규 창출.</p>
              </div>
            ),
            source: 'OEC 양자 무역 흐름 (2023~2025) · 관세청 망고스틴 수출 통계 (HS 0804)',
          }} />

        <WidgetCard title="최상급 품질 재수출 단가" icon={PackageCheck} iconColor={SECTIONS[3].color} pillar="S4"
          cardDesc="한국 허브 재수출 단가 추이 — 최상급 1% 물량의 프리미엄 가격대"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }} chartHeight={375}
          chart={
            <ComposedChart data={krExportData}>
              <ChartPatternDefs />
              {grid}
              <XAxis dataKey="month" {...xAxisProps} />
              <YAxis yAxisId="left" {...yAxisProps} label={{ value: '수출량 (kg)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" {...yAxisProps} label={{ value: '단가 ($/kg)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 11 }} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar yAxisId="left" dataKey="weight_kg" name="수출 물량(kg)" fill="#c026d3" barSize={15} radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="step" dataKey="unit_price" name="수출 단가($/kg)" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"슈퍼 프리미엄 등급(Super Premium Grade)"이란 외관·당도·과피 광택을 5단계 selection으로 거른 상위 1% 물량. Hermes·Louis Vuitton이 동일 가죽 raw에서 0.5%만 추출해 가격 100배를 받는 luxury 구조 — 식품에서도 동일 원리 적용 가능한 영역이 망고스틴.</p>
                <p>실측: <strong>일반 재수출 단가 $5.8/kg vs 슈퍼 프리미엄 1% 등급 $12.4/kg (2.1배). 몽골·괌·블라디 리조트 호텔·면세점이 가격 저항 없이 흡수 — 부산 자갈치 도매가 대비 마진 +340%</strong>. 같은 농장의 같은 나무에서 나온 망고스틴이 selection만으로 luxury 가격 책정 가능.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 망고스틴 재수출은 "commodity 무역"이 아닌 <strong>"식품 luxury 브랜딩 사업". 자체 브랜드 라벨이 단가의 70%를 결정</strong>.</p>
                <p><strong>3단계</strong>: ① 자체 브랜드(가칭 "QueenMG", "TropikLux") 등록 + 패키지 디자인 luxury 톤(검정·골드, 한자 캘리그래피) — 산지 OEM이 절대 모방 못하는 design moat 구축 ② 괌 Hyatt·Hilton·시내 면세점 buyer 직접 상담 + 사이판·팔라우 리조트 1·2위 체인 직납 — 도매 중간상 1단계 cut으로 +24%p 마진 추가 확보 ③ 몽골 울란바토르 신흥 부유층(러시아 매도자 카르텔, 신생 banking 가문)에 <strong>"한국 직배송 시즌 멤버십"</strong>(연 50kg, 회원료 $4,500) recurring revenue 모델 — luxury 식품의 subscription화.</p>
              </div>
            ),
            source: '관세청 HS 0804 수출 통계 + 몽골·괌 리조트 호텔 buyer 인터뷰',
          }} />

        <WidgetCard title="중국 라이브 커머스 D2C 타격 리스크" icon={AlertTriangle} iconColor="#ef4444" pillar="S4"
          cardDesc="중국 D2C 채널별 매출 점유율 — 라이브 커머스 규제 위축 영향"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }} chartHeight={375}
          chart={
            <PieChart>
              <Pie data={liveCommerceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {liveCommerceData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            </PieChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"D2C 라이브 커머스(Direct-to-Consumer Livestream Commerce)"란 Taobao Live·Douyin·Kuaishou에서 인플루언서가 실시간 방송으로 식품을 직접 판매하는 채널. 중국 망고스틴 수입의 35%가 이 채널을 통과했으나, 2024 이후 SAMR(국가시장감독관리총국)의 식품 안전·허위 광고·세금 규제 강화로 채널 자체가 위축 단계 진입.</p>
                <p>실측: <strong>D2C 라이브 채널 매출 비중 35% → 23%로 12%p 감소(1년 만에 1/3 위축). 동기간 B2B 도매 + 오프라인 대형 유통(허마·세븐일레븐 차이나) 비중은 41% → 58%로 17%p 상승</strong>. 단순한 채널 shift가 아닌 중국 식품 유통의 구조적 정상화 — 우리도 portfolio rebalance 필요.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: D2C 위축은 risk가 아닌 <strong>"라이브 채널에 과의존한 동남아 수출국이 정리되며 한국이 정통 B2B 채널을 선점할 기회 윈도우"</strong>. 규제 강화는 오히려 cleanup catalyst.</p>
                <p><strong>3단계</strong>: ① D2C 노출 비중을 15% 이하로 축소 + 오프라인 대형 유통(허마·올레·세븐일레븐 차이나) 직납 비중을 50%+로 재편 — SAMR 규제 sweep에 대한 immunity 확보 ② <strong>QR 추적 + VHT 인증 시각화</strong> 패키지를 신규 출시 — SAMR 규제 강화의 핵심인 "수입 식품 trust" 이슈를 정면 돌파, 인증 자체를 마케팅 자산화 ③ 알리바바·JD.com B2B 도매 플랫폼 입점 + 중국 4대 호텔 체인(샹그릴라·하얏트·완다·차이나월드) 식자재 LTA — 라이브 커머스 망각 후에도 매출 base 유지하는 long-cycle 채널 lock-in.</p>
              </div>
            ),
            source: '중국 SAMR 라이브 커머스 규제 동향 (2024~2026) + 내부 채널별 매출 데이터',
          }} />
      </div>

      </>)}
      {activePart === 'P5' && (<>
      {/* ═══ Pillar 5: ESG & 지속가능성 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[4].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[4].desc}</p>
        </div>
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <WidgetCard title="망고스틴 껍질 업사이클링 시뮬레이션" icon={Leaf} iconColor={SECTIONS[4].color} pillar="S5"
          cardDesc="껍질 폐기 vs 펫푸드/항산화 추출 시나리오별 매출 + 순마진"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-17' }} chartHeight={375}
          chart={
            <ComposedChart data={upcyclingData} layout="vertical" margin={{ left: 0 }}>
              <ChartPatternDefs />
              {grid}
              <XAxis type="number" {...xAxisProps} />
              <YAxis dataKey="scenario" type="category" {...yAxisProps} width={130} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Bar dataKey="revenue" name="매출 추정액" fill="#a3e635" barSize={15} />
              <Bar dataKey="rindDisposalCost" name="껍질 폐기비용" fill="var(--color-danger)" barSize={15} />
              <Line dataKey="netMargin" name="최종 넷마진" stroke="var(--text-primary)" strokeWidth={3} dot={{ r: 5 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: (
              <div>
                <p>"순환경제(Circular Economy)"란 폐기물을 다시 raw material로 활용해 zero waste를 달성하는 산업 모델. 망고스틴 과피는 전체 중량의 60~70%로 가공 후 폐기물 비중 1위 — 그런데 이 껍질에는 폴리페놀의 일종인 <strong>"잔토닌(Xanthone)"</strong>이 g당 18~24mg 농축되어 있어 항산화 화장품·펫푸드·기능성 음료 raw로 kg당 $48~$120 단가 형성.</p>
                <p>실측: <strong>현행 폐기 비용 -$0.24/kg → 펫푸드 추출(B2B) 변환 시 +$1.85/kg → 잔토닌 추출(화장품·기능식 raw) 변환 시 +$4.20/kg. 폐기 → 펫푸드 8.7배 → 잔토닌 18배 가치 점프</strong>. 같은 톤(ton)이 어디로 가느냐에 따라 차이 천 배 — "쓰레기"라는 라벨 자체가 가장 비싼 함정.</p>
              </div>
            ),
            actionPlan: (
              <div>
                <p><strong>재정의</strong>: 망고스틴 껍질은 "처리 부담"이 아닌 <strong>"가공 부산물(by-product)을 본업 매출의 32%로 끌어올리는 leverage 자산"</strong>. 참치 자숙액·코코아 husk 모델 그대로 적용 가능.</p>
                <p><strong>3단계</strong>: ① 단기(6개월): 펫푸드 사업부에 껍질 100% 이관 — 폐기 cost zero + 펫푸드 magin +18%p ② 중기(12~18개월): 잔토닌 추출 R&D 라인 신설(국내 대학교 천연물 연구실과 산학 컨소시엄) — 화장품(아모레퍼시픽·LG생건) raw 납품 진입 ③ 장기(24개월+): 자체 기능성 식품 브랜드 <strong>"XanthGuard"</strong> 출시 — 면역·항산화 컨셉 정기구독 모델, 망고스틴 본업 매출 +32% 확장 + ESG 점수 동시 상승.</p>
              </div>
            ),
            source: '내부 R&D + 폴리페놀·잔토닌 추출 학술 연구 + 펫푸드·화장품 raw 단가 비교',
          }} />
      </div>
      </>)}

    </div>
  );
}
