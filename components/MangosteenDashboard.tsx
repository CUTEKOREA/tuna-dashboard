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

const SECTIONS = [
  { id: "P1", title: "원료 수급", desc: "태국 생산량 독점 방어 및 라니냐 발동 기후 리스크 연동 모델", color: "#7e22ce" },
  { id: "P2", title: "가공 & 생산", desc: "생과 및 냉동 퓨레 수익성 트래커 및 에틸렌 차단 예냉 수율 방어 곡선", color: "#9333ea" },
  { id: "P3", title: "물류 & 통관", desc: "해상 혼합 가스 물류 전환, 식물검역 장벽 분석 및 협정 삼각 무역", color: "#c026d3" },
  { id: "P4", title: "판매 & 수요", desc: "국내 대체 과일 인플레이션 스캐너 및 최고급 틈새 시장 재수출 단가", color: "#db2777" },
  { id: "P5", title: "ESG & 지속가능성", desc: "망고스틴 부산물 펫푸드 업사이클링을 통한 최종 수익률 시뮬레이션", color: "#f43f5e" },
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

      {/* ═══ Pillar 1: 원료 수급 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[0].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[0].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[0].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
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
            situation: '인도네시아의 절대 생산량(32만 톤)이 1위이나 수출은 1% 미만이며, 태국은 생산량의 87%를 수출하며 글로벌 무역을 독점하고 있습니다.',
            actionPlan: '식물방역법 장벽이 생산 대국과 수입국을 단절시켰습니다. 태국의 가공 시설 선도거래를 선점하거나, 기업 간 거래용 가공품으로 전환해 인니/베트남 물량을 활용해야 합니다.',
            source: 'FAOSTAT 망고스틴 생산·교역 통계 (2024)',
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
            situation: '기후 지수가 악화되는 국면의 잦은 비는 과육 수액병을 유발해 증열처리 통과 생존율을 75%까지 급락시킵니다.',
            actionPlan: "기상청 실시간 연동을 통해 경보 발령 시, '수율 기반 변동 가격제'를 선제적으로 발동하여 매입 단가 리스크를 방어해야 합니다.",
            source: 'NOAA ENSO 지수 + 식약처 망고스틴 검역 통계',
          }}
        />
      </div>

      {/* ═══ Pillar 2: 가공 & 생산 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[1].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[1].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[1].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
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
            situation: '할당관세 종료 등 외부 요인에 의해 생과 마진은 변동성이 극심하나, 냉동 납품 마진은 22%대로 매우 안정적입니다.',
            actionPlan: '기업 간 거래용 냉동 물량 비중을 전체 포트폴리오의 40% 이상으로 확대하여 변동성을 차단하고 고정 현금흐름을 창출해야 합니다.',
            source: '내부 영업 관리 시스템 + 관세청 할당관세 캘린더',
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
            situation: '일반 해상 냉장 운송 시 25일 차에 수율이 5%로 급락하여 값비싼 항공 운송($5.5/kg)이 강제되고 있습니다.',
            actionPlan: '가스 처리 기술 도입 시 해상 운송(25일 차)에도 수율을 78% 이상 방어할 수 있어, 해상 운송비 절감($2.95/kg) 및 소매점 체류 시간 확장이 가능해야 합니다.',
            source: '내부 콜드체인 R&D + 해상/항공 운임 단가 비교 (2026-Q1)',
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
            situation: '동남아 현지 식품 라벨링 및 패키징 규제가 강화됨에 따라 생산 매입원가 내 패키징 비용 비중이 급증할 전망입니다.',
            actionPlan: '벌크 단위 수입 후 국내 자체 패키징 라인을 가동하거나, 규제가 덜한 베트남 등 제3국에서 1차 가공을 마치는 우회 생산로를 구축해야 합니다.',
            source: '태국·인니 식품의약품안전청 라벨링 규제 동향 (2026)',
          }}
        />
      </div>

      {/* ═══ Pillar 3: 물류 & 통관 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[2].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[2].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[2].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
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
            situation: '식물방역법으로 인해 생과 수입이 태국산에 독점되어 당사의 구매 협상력이 현저히 낮습니다.',
            actionPlan: '수입 금지 국가인 인도네시아 원물을 현지에서 냉동 가공하여 국내 시장으로 우회 반입하는 파이프라인 신설을 권고해야 합니다.',
            source: '농림축산검역본부 식물방역법 + 동남아 검역청 (2026)',
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
            situation: '과피 경화 방어를 위해 항공 운송을 쓰고 있으나, 높은 비용($5.5/kg)이 마진을 잠식하고 있습니다.',
            actionPlan: '해상 운송에 가스 치환 포장을 결합하여 수율을 92%로 유지하면서 물류비를 절반($2.95/kg)으로 줄이는 즉각적 전환이 요구됩니다.',
            source: '내부 물류 단가 분석 + 선사·항공 운임 비교',
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
            situation: '태국산 직수입 시 자유무역협정 한계로 인해 24%의 높은 할당 및 기본 관세가 부과됩니다.',
            actionPlan: '저단가 인니 원물을 베트남으로 수출해 1차 가공한 후, 무관세 조항을 활용해 한국에 반입하는 역내포괄적경제동반자협정(RCEP) 삼각 무역 라인을 개척.',
            source: 'RCEP 협정문 + 관세청 HS코드 양허표',
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
            situation: '동남아 주요 통화(특히 바트화)의 가치 상승이 매입 매입원가 상승 압력으로 작용하며 환리스크가 가중되고 있습니다.',
            actionPlan: '태국 직수입 물량의 결제 통화를 다변화하거나, 환율 변동성이 적은 동화(베트남) 결제 라인을 우회 구매 루트로 적극 활용하여 환차익을 극대화해야 합니다.',
            source: '한국은행 환율 통계 + 결제 통화별 거래 단가',
          }}
        />
      </div>

      {/* ═══ Pillar 4: 판매 & 수요 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[3].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[3].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[3].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <WidgetCard title="국내 과일 물가 연동 스캐너" icon={Apple} iconColor={SECTIONS[3].color} pillar="S4"
          cardDesc="국내 사과 단가 vs 망고스틴 수입량 상관관계 — 가격 폭등기 대체 수요 캡처"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }} chartHeight={375}
          chart={
            <ComposedChart data={arbitrageData}>
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
            situation: '국산 사과 및 배 가격 폭등기에 망고스틴이 일상적인 대체 과일로 부상하며 수요가 비정상적으로 급증했습니다.',
            actionPlan: '국내 핵심 과일 물가 지수와 연동된 자동 발주 스캐너를 운영하여, 임계 가격 돌파 시 망고스틴 물량을 공격적으로 증대시켜 차익을 실현해야 합니다.',
            source: 'KAMIS 과일 도매가 + 관세청 망고스틴 수입 통계',
          }} />

        <WidgetCard title="글로벌 무역 가치사슬 흐름" icon={Workflow} iconColor={SECTIONS[3].color} pillar="S4"
          cardDesc="국가간 양자 무역 흐름 — 한국 허브 재수출 가치 vs 직수입 비교"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-17' }} chartHeight={375}
          chart={
            <BarChart data={bilateralReExportData} layout="vertical" margin={{ left: 140 }}>
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
            situation: '태국에서 한국으로 향하는 경로가 물량을 차지하나, 단가 마진은 한국에서 몽골 및 괌으로 재수출하는 라인이 월등히 높습니다.',
            actionPlan: '한국을 최종 소비지가 아닌 동북아 예냉 및 재포장 물류 허브로 재정의하여, 검역 인프라가 취약한 제3국 프리미엄 시장을 직접 공략.',
            source: 'OEC + 관세청 양자 무역 매트릭스',
          }} />

        <WidgetCard title="최상급 품질 재수출 단가" icon={PackageCheck} iconColor={SECTIONS[3].color} pillar="S4"
          cardDesc="한국 허브 재수출 단가 추이 — 최상급 1% 물량의 프리미엄 가격대"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-17' }} chartHeight={375}
          chart={
            <ComposedChart data={krExportData}>
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
            situation: '한국 물류 허브를 거쳐 몽골, 괌 등으로 향하는 망고스틴 재수출 단가는 최고 12.4달러(kg당)를 기록하며 마진을 냅니다.',
            actionPlan: '과피 경화 결함을 원천 차단한 최상급 1%의 물량만을 선별하여, 구매력이 높은 고급 리조트 시장에 자체 브랜드로 재수출하는 파이프라인을 공격적으로 확장해야 합니다.',
            source: '관세청 망고스틴 수출 통계 (HS 0804)',
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
            situation: '최근 중국 당국의 라이브 커머스 품질/위생 규제 강화로 인해 주요 D2C(소비자 직접 판매) 채널의 매출 비중이 25% 이하로 위축되었습니다.',
            actionPlan: '불안정한 B2C/D2C 판매 비중을 축소하고, 검증된 도매 채널 및 오프라인 대형 유통망(B2B) 중심의 안정적 매출 포트폴리오로 신속히 재편해야 합니다.',
            source: '중국 SAMR 라이브 커머스 규제 동향 + 내부 채널 매출',
          }} />
      </div>

      {/* ═══ Pillar 5: ESG & 지속가능성 ═══ */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ width: '4px', height: '28px', background: SECTIONS[4].color, borderRadius: '2px' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{SECTIONS[4].title}</h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{SECTIONS[4].desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <WidgetCard title="망고스틴 껍질 업사이클링 시뮬레이션" icon={Leaf} iconColor={SECTIONS[4].color} pillar="S5"
          cardDesc="껍질 폐기 vs 펫푸드/항산화 추출 시나리오별 매출 + 순마진"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-17' }} chartHeight={375}
          chart={
            <ComposedChart data={upcyclingData} layout="vertical" margin={{ left: 0 }}>
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
            situation: '전체 중량의 60~70%에 달하는 껍질은 폐기 비용을 발생시키나, 동시에 고농축 항산화 물질을 함유하고 있습니다.',
            actionPlan: '버려지는 껍질을 당사 펫푸드 전략 사업부로 전량 이관하여 폐기 비용을 완전히 없애고 전체 순수익이 1.5배 상승하는 순환경제 포트폴리오를 완성해야 합니다.',
            source: '내부 R&D + 망고스틴 껍질 폴리페놀 추출 연구',
          }} />
      </div>

    </div>
  );
}
