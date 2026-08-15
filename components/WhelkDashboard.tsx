'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  Globe, TrendingUp, AlertTriangle, Factory, DollarSign, Scale, RefreshCcw,
  Target, Leaf, Shield, Dna, ShieldAlert, Building2, Activity, Ship, Navigation, Snowflake, Anchor,
  Fish, Thermometer, ShoppingBag, Recycle, Package, FlaskConical, ChartPie
} from 'lucide-react';
import TermTooltip from './TermTooltip';
import WidgetCard from './WidgetCard';
import { TelemetryBadge } from './TelemetryBadge';
import { ChartPatternDefs } from './ChartPatterns';
import WhelkFTAQuarterly from './WhelkFTAQuarterly';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: 'var(--w-slate-50)', fontSize: '0.88rem' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{label}</p>
        {payload.map((e: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
            <span style={{ color: e.color }}>■ {e.name}</span>
            <strong style={{ fontWeight: 600 }}>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- COMPONENTS ---
// --- DATA ---
const IMPORT_COLORS = ['var(--color-info)', 'var(--color-success)', 'var(--color-danger)', 'var(--color-warning)', '#8b5cf6'];

// 5-Pillar 네비게이터 메타 (골뱅이 시그니처 그라디언트 — 영국 북해 + 흑해 amber/stone 조합)
const SECTIONS = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '❶ 원료 수급', desc: '글로벌 어획 헤게모니, 북해 어획량 변동, B. undatum 자원 동향', color: '#fbbf24' },
  { id: 'S2', num: '❷', label: '가공·생산', title: '❷ 가공 및 생산', desc: '살수율(20-25%), 한·영 가공 마진 구조, 가공 효율성', color: '#f59e0b' },
  { id: 'S3', num: '❸', label: '물류·통관', title: '❸ 물류 및 통관', desc: 'FTA 무관세 우위, 콜드체인, IUU/MCRS 규제 리스크', color: '#d97706' },
  { id: 'S4', num: '❹', label: '판매·수요', title: '❹ 판매 및 수요', desc: '한국 통조림 시장, 가격 갭, FX/이중 타격 헤지, 채널 다변화', color: '#b45309' },
  { id: 'S5', num: '❺', label: 'ESG·지속가능성', title: '❺ ESG 및 지속가능성', desc: '양식 불가 자원 + 영국 IFCA/MCRS 규제 + EU PPWR 포장 컴플라이언스', color: '#92400e' },
];

// 패턴 I: 본문 JSX WidgetCard 30개 + WhelkFTAQuarterly 1개 — JSX 위젯 추가/삭제 시 이 상수를 갱신할 것.
// (KFAS 학술 위젯은 데이터 기반 동적 렌더이므로 kfasWidgets.length로 합산)
const INLINE_WIDGET_COUNT = 31;

export default function WhelkDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');

  useEffect(() => {
    fetch('/api/whelk/live')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching whelk data:', err));
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '2rem', color: 'var(--w-slate-50)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <RefreshCcw className="animate-spin" size={24} color="var(--color-info)" />
        <span>골뱅이 인텔리전스 로딩 중...</span>
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
    climateRiskData = [],
    widgets = [],
    usCannedMarketData = [],
    nutritionBenchmarkData = [],
    mcrsScenarioData = [],
    sgValueUpData = [],
    euPackagingRiskData = [],
    pfasRiskData = [],
    postUkScorecardData = [],
    blackSeaSupplyData = [],
    fxAlertThresholds = [],
    halalCollagenData = [],
    koreaGlobalShareData = [],
    feedstockYoyData = [],
    originCifGapData = []
  } = data;

  // KFAS 연구 위젯 필터링
  const kfasWidgets = widgets.filter((w: any) => w.id?.startsWith('w5'));

  // 패턴 B(L-12): 라우트 _metadata의 정직 신호(isLive·status)를 직접 소비.
  // `data ? 'SYNCED' : 'STATIC'` 식 truthiness 격상 금지 — 라우트가 STATIC을 선언하면 STATIC.
  const metaStatus: 'LIVE' | 'SYNCED' | 'STATIC' =
    data?._metadata?.isLive === true ? 'LIVE'
    : data?._metadata?.status === 'SYNCED' ? 'SYNCED'
    : 'STATIC';
  const metaSyncDate = data?._metadata?.syncDate;

  return (
    <div style={{ padding:'0 1.5rem 3rem', color:'var(--w-slate-50)', minHeight:'100vh', fontFamily:"'Inter',sans-serif" }}>
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
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>골뱅이 전략 커맨드 센터 — {INLINE_WIDGET_COUNT + kfasWidgets.length}개 위젯 · 5-Pillar 프레임워크</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#11182f', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--w-slate-500)' }} />
            <span>5개 출처 <span style={{ color: 'var(--w-slate-400)' }}>STATIC</span></span>
            <span style={{ margin: '0 8px', color: '#4d4d4d' }}>|</span>
            <span style={{ color: 'var(--text-primary)' }}>KCS · IFCA · MMO · EFSA · aT FIS</span>
          </div>
        </div>
      </header>

      {/* 4 KPIs */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>영국산 수입 의존도</span>
            <TelemetryBadge status="synced" syncDate="KCS 2024 연간" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>52.1%</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-info)', fontWeight: 600 }}>
            <span style={{ background: '#3b82f620', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>HS160559</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>2024년 연간 수입액 $30.46M/$58.5M</span>
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>영국산 평균 입고단가</span>
            <TelemetryBadge status="synced" syncDate="2024.2H" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>$12.8/kg</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-success)', fontWeight: 600 }}>
            <span style={{ background: '#10b98120', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>부산항 도착</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>최신물류비 반영</span>
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>캐나다 어획 감소율</span>
            <TelemetryBadge status="synced" syncDate="2023.12" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>-74%</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-danger)', fontWeight: 600 }}>
            <span style={{ background: '#ef444420', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>▼ 10Y 추세</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>생태계 변화</span>
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>영국산 원물 수율</span>
            <TelemetryBadge status="static" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>20-25%</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-warning)', fontWeight: 600 }}>
            <span style={{ background: '#f59e0b20', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>수율 1위</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>튀르키예 대비 2배</span>
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(var(--w-violet-500-rgb), 0.2)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>KFAS 학술 검증</span>
            <TelemetryBadge status="static" syncDate="2024" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa' }}>{kfasWidgets.length}건</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--w-violet-500)', fontWeight: 600 }}>
            <span style={{ background: '#8b5cf620', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>학술 검증</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>국립수산과학원</span>
          </div>
        </div>
      </div>

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px',
          borderBottom: '1px solid rgba(140,170,255,0.10)',
          marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {SECTIONS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(140,170,255,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = `${s.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '12px 8px 14px',
                  background: isActive ? `${s.color}12` : 'transparent',
                  border: `1.5px solid ${isActive ? s.color : 'transparent'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                    borderRadius: '3px 3px 0 0' }} />
                )}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? s.color : 'rgba(140,170,255,0.12)',
                  color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)',
                  fontSize: '0.75rem', fontWeight: 800,
                  transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>{idx + 1}</div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}>{s.label}</span>
                {isActive && (
                  <span style={{
                    fontSize: '0.6rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)',
                    textAlign: 'center', lineHeight: 1.3, marginTop: '2px', padding: '0 4px',
                  }}>
                    {s.desc.slice(0, 24)}…
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT GRID */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', width: '100%' }}>
      {activePart === 'S1' && (<>
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Fish size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--w-slate-50)' }}>❶ 원료 수급</h2>
  </div>
  <>
            <WidgetCard title="글로벌 어획 생산량 상위 5개국" icon={Globe} iconColor="var(--color-info)" pillar="S1"
              cardDesc="전 세계 골뱅이 원물 주요 생산국 비중·생산량 — 글로벌 수급 헤게모니"
              telemetry={{ status: 'STATIC', syncDate: '2022년 기준' }} chartHeight={300}
              chart={
                <BarChart data={globalCaptureData} layout="vertical" margin={{ left: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--w-slate-50)', fontSize: 11 }} width={60} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(140,170,255,0.10)' }} />
                  <Bar dataKey="value" name="어획량(톤)" fill="var(--color-info)" radius={[0, 4, 4, 0]}>
                    {globalCaptureData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 1 ? 'var(--color-danger)' : index === 3 ? 'var(--color-success)' : 'var(--color-info)'} />
                    ))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[FAOSTAT] 전 세계 골뱅이 생산량이 북대서양(영국·아일랜드) 등 특정 해역에 편중되어 있어, 한 국가의 어획량이 줄어들면 전체 수급이 크게 흔들릴 수 있는 상황입니다.</span>,
                actionPlan: <span>상위 5개국 중 영국과 아일랜드가 글로벌 고품질 골뱅이 물량의 핵심 공급망을 장악하고 있습니다. 한국 프리미엄 B2C 통조림 시장은 육질이 뛰어난 <TermTooltip term="B. undatum" description="북해에서 조업되는 물레고둥(백골뱅이). 수율이 높고 육질이 부드러워 한국 B2C 통조림 1위 원물." /> 에 절대적으로 의존합니다. 이러한 단일 해역 의존 리스크(Single Point of Failure) 방어를 위해 조달 파트는 영국 내 핵심 벤더와 선제적 쿼터 매입 및 다년 선도 계약을 추진하여 원가 변동성으로부터 전사 이익을 수성해야 합니다.</span>,
                source: 'FAOSTAT (2022)',
              }} />

            <WidgetCard title="캐나다 vs 영국 어획량 장기 시계열" icon={TrendingUp} iconColor="var(--color-info)" pillar="S1"
              cardDesc="해수온 상승의 캐나다 어획 영향 + 영국산 수요 이동 예측"
              telemetry={{ status: 'STATIC', syncDate: '2024년 1H 기준' }} chartHeight={300}
              chart={
                <LineChart data={canadaCaptureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="canada" name="캐나다 어획(톤)" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="uk" name="영국 어획(톤)" stroke="var(--color-info)" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              }
              takeaway={{
                situation: <span>[DFO Canada] 바닷물 온도가 높아지면서 캐나다 해역의 골뱅이가 사라지고 있으며, 이로 인해 전 세계 바이어들이 유일한 대안인 영국으로 몰려 경쟁이 치열해지고 있습니다.</span>,
                actionPlan: <span>캐나다 해역 어획량이 수온 상승 등 해양 생태계 변화로 인해 과거 10년간 74%나 급감하며 사실상 산업 붕괴(Collapse) 수준에 도달했습니다. 이는 글로벌 수급 밸런스를 붕괴시키며, 유일한 고품질 대체재인 영국산 원물에 대한 전 세계 바이어들의 패닉 바잉(Panic Buying)과 가격 폭등을 촉발할 가능성이 농후합니다. 경영진은 이를 구조적 위기로 인식하고, 즉각적인 <TermTooltip term="장기 공급계약(LTC)" description="Long-Term Contract. 시장 가격 변동성에 대비하여 원물 공급자에게 고정 가격 혹은 최소 보장 물량을 담보받는 장기 선도 계약." /> 체결 및 선급금 지급을 통해서라도 영국 해역 내 확고한 물량 락인을 최우선으로 확보해야 합니다.</span>,
                source: 'DFO Canada / UK MMO (2024 1H)',
              }} />
            
            <WidgetCard title="한국 연안 골뱅이 어획 생산량" icon={Activity} iconColor="var(--color-info)" pillar="S1"
              cardDesc="국내 어획량 장기 추이 — 신선 활어 전량 일본 직수출, 국내 가공용은 100% 수입"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <AreaChart data={koreaCaptureData}>
                  <defs>
                    <linearGradient id="colorCapture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} domain={[6000, 11000]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="capture" name="한국 어획(톤)" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorCapture)" />
                </AreaChart>
              }
              takeaway={{
                situation: <span>[FAO FishStat] 한국 바다에서도 골뱅이가 많이 잡히지만, 값비싼 신선(활어) 상태로 전량 일본에 직수출되고 있어 정작 국내 가공용은 수입에 100% 의존하고 있습니다.</span>,
                actionPlan: <span>한국은 연안에서 연간 9,000톤 수준을 어획하는 글로벌 상위 생산국이나, 해당 원물은 프리미엄 단가를 쫓아 전량 <TermTooltip term="신선/냉장 활어" description="가공되지 않은 살아있는 상태로 주로 일본의 이자카야 및 고급 해산물 시장으로 직수출됨." /> 형태로 일본 시장에 직수출되고 있습니다. 반면, 국내 B2C 통조림 제조를 위한 대량의 가공 원물은 100% 수입산에 의존하는 기형적 '이중 가공무역' 구조에 갇혀 있습니다. 이러한 태생적 한계로 당사의 수익성은 글로벌 환율 및 해운 운임 변동성에 무방비로 노출되므로, 체질 개선을 위한 환헤지 및 통관 물류 효율화 투자가 필수불가결합니다.</span>,
                source: 'FAO FishStat Capture (한국 골뱅이 어획 실측, ~2022)',
              }} />

            <WidgetCard title="영국 MCRS 상향 시나리오별 공급쇼크 시뮬레이션" icon={AlertTriangle} iconColor="var(--color-danger)" pillar="S1"
              cardDesc="영국 IFCA 최소보존규격 50/55/60mm 시나리오별 어획량 영향"
              telemetry={{ status: 'STATIC', syncDate: '2026 시뮬레이션' }} chartHeight={300}
              chart={
                <AreaChart data={mcrsScenarioData}>
                  <defs>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <YAxis domain={[5000, 15000]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="baseline" name="현행 유지" stroke="var(--color-info)" fill="url(#colorBaseline)" />
                  <Line type="monotone" dataKey="mcrs50" name="MCRS 50mm" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="mcrs55" name="MCRS 55mm" stroke="var(--color-danger)" strokeWidth={2} />
                  <Line type="monotone" dataKey="mcrs60" name="MCRS 60mm" stroke="#dc2626" strokeWidth={2} strokeDasharray="8 4" />
                </AreaChart>
              }
              takeaway={{
                situation: <span>[IFCA 시뮬레이션] 영국이 골뱅이 최소 크기 기준을 현행 45mm에서 55mm로 올리면, 어획 가능 물량이 최대 30% 이상 급감하여 글로벌 수급에 충격파를 일으킬 수 있습니다.</span>,
                actionPlan: <span>MCRS 55mm 시나리오(가장 유력)에서 영국산 어획량이 2027년까지 현행 대비 26% 감소(14,091톤→9,800톤)할 것으로 예측됩니다. 이는 한국 수입 물량의 약 1,100톤 부족을 의미하며, 톤당 단가 15~20% 상승 압력이 불가피합니다. 조달 전략 파트는 MCRS 55mm 확정 시점(2026H2 예상) 이전에 현행 규격(45mm) 원물의 대량 선매입을 실행하고, 동시에 아이슬란드·아일랜드 대체 물량 확보를 병행해야 합니다.</span>,
                source: 'IFCA MCRS 시뮬레이션 (2026)',
              }} />

            <WidgetCard title="포스트 영국(Post-UK) 시대 대비 신규 어장 스코어카드" icon={Navigation} iconColor="var(--color-info)" pillar="S1"
              cardDesc="대체 어장 4축 평가 — 어획 추세·FTA 혜택·물류 효율"
              telemetry={{ status: 'STATIC', syncDate: '2026 분석' }} chartHeight={300}
              chart={
                <BarChart data={postUkScorecardData} layout="vertical" margin={{ left: 30 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <YAxis dataKey="country" type="category" tick={{ fill: 'var(--w-slate-50)', fontSize: 11 }} width={70} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="catchTrend" name="어획 추세" fill="var(--color-info)" stackId="a" />
                  <Bar dataKey="ftaStatus" name="FTA 혜택" fill="var(--color-success)" stackId="b" />
                  <Bar dataKey="logisticsCost" name="물류 효율" fill="var(--color-warning)" stackId="c" />
                </BarChart>
              }
              takeaway={{
                situation: <span>[FAOSTAT/ICES] 영국 다음으로 유력한 골뱅이 공급처는 아일랜드(종합 82점)와 아이슬란드(78점)이며, 캐나다(38점)는 사실상 탈락입니다.</span>,
                actionPlan: <span>포스트 영국(Post-UK) 전략의 핵심은 아일랜드(종합 82점)입니다. 동일 B. undatum 종이며 EU FTA 관세 0% 혜택, 영국과 인접한 물류 인프라를 보유합니다. 차선책인 아이슬란드(78점)는 저수온(7.2°C)으로 장기 자원 안정성이 최고이나, 현재 FTA 미체결로 관세 부담이 존재합니다. 조달팀은 아일랜드 벤더 2~3곳과의 시범 거래를 26Q3에 착수하고, 아이슬란드와의 HS030781 관세 협상 가능성을 외교 채널로 탐색해야 합니다.</span>,
                source: 'FAOSTAT + ICES (2026 분석)',
              }} />

            <WidgetCard title="한국 골뱅이 어획 글로벌 순위 (FAO 2022)" icon={Navigation} iconColor="var(--color-info)" pillar="S1"
              cardDesc="FAO FishStat Capture 2022 — 한국 세계 5위(종코드 7종 합산)"
              telemetry={{ status: 'STATIC', syncDate: 'FAO FishStat Capture 2022' }} chartHeight={300}
              chart={
                <BarChart data={koreaGlobalShareData} layout="vertical" margin={{ left: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--w-slate-50)', fontSize: 11 }} width={60} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(140,170,255,0.10)' }} />
                  <Bar dataKey="value" name="어획량(톤)" radius={[0, 4, 4, 0]}>
                    {koreaGlobalShareData.map((entry: any, index: number) => (<Cell key={`kg-${index}`} fill={entry.name === '한국' ? 'var(--color-danger)' : 'var(--color-info)'} />))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[FAO] 2022년 한국 골뱅이 어획은 9,062톤으로 세계 5위입니다(멕시코 17,782·영국 14,091·프랑스 10,117·러시아 9,229·한국 9,062 順).</span>,
                actionPlan: <span>한국이 세계 5위 생산국이면서도 어획 물량 대부분이 신선 활어로 일본에 직수출돼 국내 가공용 원물은 수입에 의존하는 모순 구조입니다. 전략기획실은 국내 어획 일부를 가공용으로 전환하는 산지 직계약과, 활어 수출가 대비 수입 가공가의 차익 모델을 재검토해야 합니다. 종코드는 단일 GAS가 아닌 7종(GAS/RPW/WHE/WHX/WJT/WKO/WKQ) 합산 기준입니다.</span>,
                source: 'FAO FishStat Capture 2022',
              }} />
          </>
      </>)}
      {activePart === 'S2' && (<>
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Factory size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--w-slate-50)' }}>❷ 가공 및 생산</h2>
  </div>
  <>
            <WidgetCard title="국내 수입산 골뱅이 국가별 점유율" icon={ChartPie} iconColor="var(--color-info)" pillar="S3"
              cardDesc="KCS HS160559 2024년 연간 수입금액($M) 기준 국가별 점유율(총 $58.5M, 기타 포함) — 영국·아일랜드 합산 65% 단일 해역 리스크"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 2026-05-15' }} chartHeight={300}
              chart={
                <PieChart>
                  <Pie data={importMarketShare} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {importMarketShare.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={IMPORT_COLORS[index % IMPORT_COLORS.length]} />))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              }
              takeaway={{
                situation: <span>[KCS] 2024년 연간 수입금액 기준 영국(52.1%)·아일랜드(12.9%) 두 나라에 65%를 의존하고 있어, 해당 지역에 문제가 생기면 공급망 전체가 마비될 위험이 큽니다.</span>,
                actionPlan: <span>영국산 원물 수입액이 $30.4M(2024년 연간 수입액 $58.5M의 52.1%)으로 1위를 수성 중이며, 지리적으로 연접한 아일랜드 물량($7.6M)까지 합산 시 북해 해역에 대한 <TermTooltip term="HS160559" description="조제하거나 보존처리한 연체동물(골뱅이 포함)의 무역 품목 분류 코드." /> 의존도가 65%에 육박하는 등 단일 해역 리스크가 한계치를 초과했습니다. 저단가인 튀르키예 및 중국산(R. venosa)은 B2B 시장의 원가 방어를 위한 블렌딩 용도로만 제한적으로 활용 가능합니다. 거시적 공급 충격에 대비하여 노르웨이, 아이슬란드 등 신규 북대서양 어장 개척 및 프리미엄 라인업 다변화 검증 테스트가 시급합니다.</span>,
                source: 'KCS 관세청 (2026-05-15)',
              }} />

            <WidgetCard title="영국산 원물 월별 수입 계절성" icon={Snowflake} iconColor="var(--color-info)" pillar="S3"
              cardDesc="월별 수입액·물량 추이 — 5~8월 성수기 집중, Reefer 운임 급등"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 2026-05-15' }} chartHeight={300}
              chart={
                <ComposedChart data={seasonalityData}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis yAxisId="left" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="importUSD" name="수입액($M)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="volume" name="물량(톤)" stroke="var(--color-danger)" strokeWidth={2} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS] 국내 골뱅이 소비는 여름철 비빔면과 야식 수요로 인해 5월~8월에 집중되며, 이때 수입 물량이 연간 물량의 절반을 넘습니다.</span>,
                actionPlan: <span>여름철 성수기 집중 현상으로 인해 단월 최고치($5.7M)를 기록하는 8월 전후로는 글로벌 <TermTooltip term="Reefer" description="냉장/냉동 컨테이너(Refrigerated Container). 여름철 해상운송 단가 급등을 유발하는 주요 물류 변수." /> 해상운임 급등과 국내 항만 적체 현상이 빈번히 발생합니다. 이러한 '성수기 할증(Peak Season Penalty)' 비용 구조를 우회하기 위해 조달팀은 비수기인 3~4월에 전략적 조기 발주를 단행하고, 선제적인 부산항 배후 냉동창고 슬롯을 대규모로 저가 확보하여 공급망 병목 및 물류비 인상을 억제해야 합니다.</span>,
                source: 'KCS 관세청 월별 통관 시계열',
              }} />
          </>

            <WidgetCard title="SG 2026 밸류업 × 골뱅이 HMR 신제품 로드맵" icon={Package} iconColor="var(--color-success)" pillar="S2"
              cardDesc="HMR 6종 개발 진행률 — 혼술 에디션·에어프라이어 키트 26Q3 출시"
              telemetry={{ status: 'STATIC', syncDate: 'SG 내부기획 2026 Q2' }} chartHeight={300}
              chart={
                <BarChart data={sgValueUpData} layout="vertical" margin={{ left: 50 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '개발 진행률(%)', position: 'bottom', fill: 'var(--w-slate-400)', offset: -5 }} />
                  <YAxis dataKey="sku" type="category" tick={{ fill: 'var(--w-slate-50)', fontSize: 10 }} width={130} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="status" name="진행률(%)" radius={[0, 4, 4, 0]}>
                    {sgValueUpData.map((entry: any, index: number) => (<Cell key={`sg-${index}`} fill={entry.status >= 70 ? 'var(--color-success)' : entry.status >= 50 ? 'var(--color-warning)' : 'var(--color-info)'} />))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[SG 밸류업] 2026 운영방안에 따라 골뱅이 HMR 라인 6종을 개발 중이며, 혼술 에디션과 에어프라이어 키트가 26Q3 출시 목표로 가장 빠르게 진행 중입니다.</span>,
                actionPlan: <span>SG 2026 밸류업 전략의 핵심은 '혼술 에디션 150g'(85% 완성)과 '에어프라이어 키트 200g'(70% 완성)의 26Q3 성수기 적시 출시입니다. 두 제품 합산 연간 매출 목표 37억 원이며, 이를 위해 편의점(CU/GS25) 입점 MOU를 6월까지 확정해야 합니다. 후속 제품인 '프리미엄 고형량65%+'는 경쟁사 대비 투명성 마케팅 차별화를 위해 포장 전면에 고형량 비율을 대형 표기하는 전략이 핵심입니다. 마케팅팀은 인플루언서 홈술 콘텐츠 마케팅을 Q3 출시 4주 전부터 선제 집행해야 합니다.</span>,
                source: 'SG 2026 밸류업 운영방안',
              }} />

            <WidgetCard title="골뱅이 가공원물 투입량 YoY (HS160559)" icon={Factory} iconColor="var(--color-info)" pillar="S2"
              cardDesc="KCS HS160559 통관 — 가공원물 물량·금액·시사단가 YoY"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 2024 연간' }} chartHeight={300}
              chart={
                <ComposedChart data={feedstockYoyData}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} height={50} />
                  <YAxis yAxisId="left" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '물량(톤)', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 12]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '$/kg', angle: 90, position: 'insideRight', fill: 'var(--w-slate-400)' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="volumeT" name="투입물량(톤)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="unitPrice" name="시사단가($/kg)" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS] 가공원물(HS160559) 투입량이 2024년 6,215톤/$58.50M으로 전년(8,251톤/$68.98M) 대비 물량 -24.7%·금액 -15.2% 감소했고, 시사단가는 $8.36→$9.41/kg로 +12.6% 올랐습니다.</span>,
                actionPlan: <span>원물 투입 감소가 공장 가동률 하락으로 직결되므로, 조달팀은 비수기 선매입으로 연간 6,000톤 이상 피드스톡을 락인하고 단가 상승분을 B2B 납품가에 분기 단위로 전가하는 가격 연동제를 도입해야 합니다.</span>,
                source: 'KCS 관세청 HS160559 통관 (2023·2024)',
              }} />

            <WidgetCard title="원산지별 CIF 단가 격차 — 대체재 탄력성" icon={Package} iconColor="var(--color-warning)" pillar="S4"
              cardDesc="KCS HS160559 원산지별 CIF($/kg) — 북해 vs 저단가 대체재"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 2024 연간' }} chartHeight={300}
              chart={
                <BarChart data={originCifGapData} layout="vertical" margin={{ left: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--w-slate-50)', fontSize: 11 }} width={60} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(140,170,255,0.10)' }} />
                  <Bar dataKey="value" name="CIF 단가($/kg)" radius={[0, 4, 4, 0]}>
                    {originCifGapData.map((entry: any, index: number) => (<Cell key={`cif-${index}`} fill={entry.value >= 12 ? 'var(--color-danger)' : entry.value <= 7 ? 'var(--color-success)' : 'var(--color-info)'} />))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[KCS] 2024년 원산지별 CIF 단가는 영국 $12.75/kg·아일랜드 $12.27 vs 중국 $6.37·세네갈 $4.73로 북해산이 저단가 대체재의 약 2배입니다.</span>,
                actionPlan: <span>조달팀은 B2B 원가 방어 라인에 한해 세네갈·중국산을 20~30% 블렌딩해 CIF를 낮추되, 수율을 반영한 총사용원가(TCU) 검증을 통과한 물량만 채택하는 'Yield-Adjusted 구매' 기준을 적용해야 합니다.</span>,
                source: 'KCS 관세청 HS160559 통관 (2024)',
              }} />
      </>)}
      {activePart === 'S3' && (<>
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Ship size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--w-slate-50)' }}>❸ 물류 및 통관</h2>
  </div>
  <>
            <WidgetCard title="국가별 원물 수율 기반 총사용원가 비교" icon={Scale} iconColor="var(--color-info)" pillar="S3"
              cardDesc="단가 vs 살수율 — 저수율 함정 회피 총사용원가(TCU) 분석"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <ComposedChart data={yieldArbitrageData} layout="vertical" margin={{ left: 40 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <YAxis dataKey="origin" type="category" tick={{ fill: 'var(--w-slate-50)', fontSize: 11 }} width={100} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="price" name="단가($/kg)" fill="var(--w-slate-500)" barSize={15} />
                  <Scatter dataKey="yieldMax" name="살수율(%)" fill="var(--color-success)" />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS+Seafish] 튀르키예나 중국산 원물이 표면상 영국산보다 싸 보이지만, 버려지는 내장이나 껍질 등을 빼고 순수 살코기 양만 보면 오히려 영국산이 더 저렴합니다.</span>,
                actionPlan: <span>단순 통관 단가 기준으로는 중국/튀르키예산(R. venosa)이 영국산(B. undatum)의 절반 수준으로 저렴해 보입니다. 그러나 가공 공정 데이터를 연동하여 <TermTooltip term="TCU" description="Total Cost of Usage. 껍질, 내장, 수분 감량 등을 제한 후 실제로 제품에 쓰이는 순 살코기(Meat Yield)를 얻기 위한 환산 단위 원가." />(총사용원가)를 산출하면, 튀르키예산은 극심한 부산물 감량 탓에 실질 원가가 $91.0/kg까지 치솟아 오히려 영국산($54.2/kg)보다 68%나 비싼 'Low-Yield Trap(저수율 함정)'에 빠지게 됩니다. 조달팀은 벤더와의 단가 협상 시 맹목적인 단가 인하 방어가 아닌 'Yield-Adjusted(수율 조정)' 재무 모델을 전면 도입해 구매 타당성을 평가해야 합니다.</span>,
                source: 'KCS + Seafish UK',
              }} />

            <WidgetCard title="영국산 수입 통관 원가 폭포수 구조" icon={DollarSign} iconColor="var(--color-info)" pillar="S3"
              cardDesc="FOB → CIF → 관세 → 내륙 통관 단계별 — 한-영 FTA 무관세 방어"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 2026-05-15' }} chartHeight={300}
              chart={
                <BarChart data={waterfallData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--w-slate-400)', fontSize: 10 }} interval={0} angle={0} textAnchor="middle" height={60} />
                  <YAxis domain={[11.5, 14]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="비용($/kg)" fill="var(--color-info)" label={{ position: 'top', fill: 'var(--w-slate-50)', fontSize: 10 }}>
                    {waterfallData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[KCS] 영국 수입산 원물은 관세가 0%로 면제되는 한-영 FTA 혜택 덕분에, 다른 부가 비용이 붙더라도 매우 뛰어난 가격 방어력을 보입니다.</span>,
                actionPlan: <span>영국산 원물의 평균 수입단가 $12.75/kg 이면에 있는 가장 강력한 방어기제는 <TermTooltip term="한-영 FTA" description="영국의 브렉시트(Brexit) 이후 한국과 영국 간 체결된 자유무역협정. 수산물(골뱅이) 무관세 혜택의 핵심." />(수입 관세 0%) 혜택입니다. 무관세 특권으로 해운 운임($0.42)과 내륙 통관/보관료($0.15)를 합산해도 총 입고단가를 $13.32/kg 선에서 억제하는 총수명주기비용(LCC) 효율이 발생합니다. 경쟁국(관세 부과 시) 대비 10~20%의 원가 우위 해자로 작용하므로, 무역 파트는 영국 현지 패커들의 원산지 증명 갱신 및 행정적 컴플라이언스 이탈을 상시 모니터링해야 합니다.</span>,
                source: 'KCS 관세청 수입 통관 통계',
              }} />

            <WhelkFTAQuarterly />
          </>
      </>)}
      {activePart === 'S4' && (<>
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <TrendingUp size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--w-slate-50)' }}>❹ 판매 및 수요</h2>
  </div>
  <>
            <WidgetCard title="B2C 통조림 브랜드 경쟁력 & 가성비 매핑" icon={Target} iconColor="var(--color-info)" pillar="S4"
              cardDesc="고형량 vs 100g당 단가 vs 점유율 — 브랜드 가성비 매트릭스"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="x" type="number" name="고형량" domain={[80, 160]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '고형량(g) →', position: 'bottom', fill: 'var(--w-slate-400)', offset: -5 }} />
                  <YAxis dataKey="y" type="number" name="가격" domain={[3000, 5500]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '100g당 가격(₩) →', angle: -90, position: 'left', fill: 'var(--w-slate-400)' }} />
                  <ZAxis dataKey="z" type="number" range={[200, 1500]} name="점유율(%)" />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter name="브랜드" data={brandPositioningData} fill="var(--color-info)">
                    {brandPositioningData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-danger)' : index === 3 ? 'var(--color-warning)' : 'var(--color-info)'} />))}
                  </Scatter>
                </ScatterChart>
              }
              takeaway={{
                situation: <span>[aT FIS] 유동 골뱅이가 1위를 지키고 있으나, 타 브랜드들이 고형량(살코기 비율)을 늘리거나 가격을 낮추는 방식으로 가성비 경쟁을 치열하게 전개 중입니다.</span>,
                actionPlan: <span>경쟁사 '동표골뱅이'는 <TermTooltip term="고형량" description="Solid weight. 통조림 내 액상액(조미액)을 제외한 순수 고기 무게." />(147g)과 저렴한 100g당 단가(₩3,600)를 무기로 매니아층 및 B2B 시장의 바닥을 무섭게 잠식하고 있습니다. 1위 브랜드인 유동(130g, ₩4,200)은 강력한 브랜드 헤리티지로 프리미엄 B2C 시장을 철통 수성 중이나, 합리적 소비 트렌드 확산에 따라 가성비 이탈 현상이 관측됩니다. 장기적 성장을 위해서는 프리미엄 라인의 고형량 투명성 강화 캠페인과 더불어, 중저가 원물 믹스를 통한 실속형 '세컨드 브랜드' 출시로 하방 압력을 분산해야 합니다.</span>,
                source: 'aT FIS 식품산업통계 (2024)',
              }} />

            <WidgetCard title="B2C 및 B2B 채널별 매출 분포" icon={Building2} iconColor="var(--color-info)" pillar="S4"
              cardDesc="대형마트·e커머스·편의점·B2B 식자재 채널별 점유율 변화"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <PieChart>
                  <Pie data={channelDemandData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="size" paddingAngle={2} labelLine={false} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {channelDemandData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              }
              takeaway={{
                situation: <span>[aT FIS] 대형마트 판매는 둔화되는 반면, 쿠팡 등 이커머스와 B2B 식자재 유통 채널의 성장이 폭발적입니다.</span>,
                actionPlan: <span>과거 시장을 지배하던 대형마트 및 SSM의 점유율(62.3%) 독과점 체제가 빠르게 허물어지며 유통 구조의 파편화가 진행 중입니다. 쿠팡을 위시한 e커머스(11.8%)의 묶음 배송과 1인 가구 홈술족을 겨냥한 편의점(6.4%) 매출이 폭발적으로 성장하고 있습니다. 무엇보다 외식 물가 상승으로 인한 호프/주점용 프랜차이즈 납품 시장, 즉 B2B 식자재(19.5%) 채널이 강력한 '현금창출원(Cash Cow)'로 부상했습니다. 기존 300~400g 캔 규격의 틀을 깨고 <TermTooltip term="SKU 다변화" description="Stock Keeping Unit. 150g 소포장(CVS용), 1kg 대용량 벌크 파우치(B2B용) 등 포장 규격의 세분화 전략." />(150g 파우치, 1kg 벌크 등)를 통한 전방위 채널 침투 전략을 수립해야 합니다.</span>,
                source: 'aT FIS 식품산업통계',
              }} />
          </>

            <WidgetCard title="미국 캔 르네상스 — 골뱅이 수출 신시장 기회" icon={ShoppingBag} iconColor="var(--color-success)" pillar="S4"
              cardDesc="Z세대 '틴 캔 르네상스' 트렌드 + K-Food 골뱅이 침투 잠재력"
              telemetry={{ status: 'STATIC', syncDate: 'KMI 2026.05' }} chartHeight={300}
              chart={
                <ComposedChart data={usCannedMarketData}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '$B', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '%', angle: 90, position: 'insideRight', fill: 'var(--w-slate-400)' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="marketSize" name="미국 캔 시장($B)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="growth" name="성장률(%)" stroke="var(--color-success)" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="whelkPotential" name="골뱅이 침투 예상($M)" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 5 }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KMI 카드뉴스] 미국에서 통조림이 다시 '힙'해지고 있습니다. Z세대의 '틴 캔 르네상스'가 SNS에서 바이럴되며, 고급 수산 통조림 시장이 연 10% 이상 성장 중입니다.</span>,
                actionPlan: <span>미국 프리미엄 캔 시장이 $15.5B(2026E)에 달하며, 특히 K-Food 한류 영향권 내 아시안 마켓과 H-Mart 채널이 연간 15%씩 성장 중입니다. 골뱅이 캔은 '한국식 해산물 안주'라는 포지셔닝이 가능하며, 미국 내 소주 열풍과 시너지가 큽니다. 해외사업부는 H-Mart, 쿠팡 글로벌 입점을 26Q4까지 완료하고, 영문 패키지 리디자인(프리미엄 크래프트 캔 콘셉트)을 즉시 착수해야 합니다. 초기 목표 매출 $1.2M(2026E).</span>,
                source: 'KMI 카드뉴스 (2026.05)',
              }} />

            <WidgetCard title="헬시플레저 시대 — 골뱅이 영양 경쟁력 벤치마크" icon={Activity} iconColor="var(--color-success)" pillar="S4"
              cardDesc="단백질·지방·철분 벤치마크 — 닭가슴살·참치캔·새우 대비"
              telemetry={{ status: 'STATIC', syncDate: 'KFDA 2024 기준' }} chartHeight={300}
              chart={
                <BarChart data={nutritionBenchmarkData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="item" tick={{ fill: 'var(--w-slate-50)', fontSize: 10 }} angle={0} textAnchor="middle" height={55} />
                  <YAxis tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="protein" name="단백질(g)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fat" name="지방(g)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="iron" name="철분(mg)" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[KMI 헬시플레저] 골뱅이는 100g당 82kcal, 단백질 18.2g, 지방 0.8g으로 닭가슴살보다 낮은 칼로리에 3배 이상의 철분을 보유한 '숨은 슈퍼푸드'입니다.</span>,
                actionPlan: <span>골뱅이(자숙)의 영양 프로필은 헬시플레저 트렌드의 핵심 지표에서 경쟁 식품을 압도합니다. 칼로리 82kcal(닭가슴살 109kcal 대비 -25%), 지방 0.8g(소등심 15.0g 대비 -95%), 철분 3.2mg(닭가슴살 0.7mg 대비 4.5배)을 보유합니다. 마케팅팀은 '다이어트 안주의 혁명'이라는 포지셔닝으로 피트니스 인플루언서 협업 캠페인을 전개하고, 제품 패키지에 '82kcal 슈퍼프로틴' 배지를 전면 부착해야 합니다. 특히 여성 1인 가구 타겟의 '단백질 간식' 카테고리 진입이 가장 높은 ROI를 보일 것입니다.</span>,
                source: 'KFDA 2024 식품성분표',
              }} />
      </>)}
      {activePart === 'S5' && (<>
        {/* Pillar 5: ESG & 지속가능성 */}
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Leaf size={20} color="var(--color-success)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--w-slate-50)' }}>❺ ESG 및 지속가능성</h2>
  </div>
  <>
            <WidgetCard title="흑해산 R. venosa 공급 안정성 트렌드" icon={Ship} iconColor="var(--color-info)" pillar="S3"
              cardDesc="튀르키예·불가리아·루마니아 흑해산 R. venosa 어획 추이"
              telemetry={{ status: 'STATIC', syncDate: 'FAO FishStat 2022' }} chartHeight={300}
              chart={
                <BarChart data={blackSeaSupplyData} margin={{ top: 10 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '톤', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="turkey" name="튀르키예" fill="var(--color-info)" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="bulgaria" name="불가리아" fill="var(--color-warning)" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="romania" name="루마니아" fill="var(--color-success)" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[FAOSTAT] 흑해산 R. venosa(뿔고둥)는 튀르키예가 연간 4,000~4,500톤을 안정적으로 생산하며, 영국산 B. undatum의 유일한 대규모 대체 공급원입니다.</span>,
                actionPlan: <span>흑해산 R. venosa는 총사용원가(TCU) 기준으로 영국산 대비 15~20% 저렴하며, 맛과 식감이 유사하여 통조림 가공 적합성이 높습니다. 다만 불가리아(-31%)와 루마니아(-32%)의 어획량이 꾸준히 감소 중이므로, 사실상 튀르키예 단일 의존 구조입니다. 조달팀은 튀르키예 이스탄불 소재 대형 벤더(3곳)와 장기 공급계약(2~3년)을 체결하여 물량을 선제 확보하고, 한-튀르키예 FTA 발효 시 관세 인하 효과를 극대화할 전략을 준비해야 합니다.</span>,
                source: 'FAO FishStat Capture 2022 (흑해 R. venosa 어획)',
              }} />

            <WidgetCard title="환율 1,500원 비상 경보 시스템" icon={AlertTriangle} iconColor="#dc2626" pillar="S3"
              cardDesc="USD/KRW 구간별 자동 경보 + 단계별 대응 매뉴얼"
              telemetry={{ status: 'STATIC', syncDate: '2026-05-30 (환율 임계값 정의)' }}
              customBody={
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {fxAlertThresholds.map((t: any, i: number) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.color}40`, borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: t.color }}>{t.level}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)' }}>₩{t.min}~{t.max}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--w-slate-300)', lineHeight: 1.5 }}>대응: <strong style={{ color: t.color }}>{t.action}</strong></div>
                      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((t.max - 1200) / 500) * 100}%`, background: t.color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              }
              takeaway={{
                situation: <span>[한국은행] USD/KRW 환율이 2026년 5월 기준 1,480원대에 진입하며 '위험 구간(1,450~1,550)' 임계점에 접근했습니다. 골뱅이 원물의 100% 달러 결제 구조상 수입 원가에 직격탄입니다.</span>,
                actionPlan: <span>골뱅이 수입은 전량 USD 결제이므로, 환율 100원 상승 시 톤당 원화 매입가가 약 130만 원(+10%) 증가합니다. 현재 1,480원대는 '위험 구간' 진입 직전이며, 1,500원 돌파 시 즉시 긴급 선물환 계약(3~6개월물)을 체결해야 합니다. 재무팀은 현재 헤지 비율을 50%까지 즉시 상향하고, 1,550원 돌파 시에는 신규 발주 일시 중단 및 기존 재고 활용 전략으로 전환하는 비상 프로토콜을 가동해야 합니다.</span>,
                source: '한국은행 실시간 환율',
              }} />
            <WidgetCard title="환율 및 수입 단가 복합 변동성" icon={DollarSign} iconColor="var(--color-info)" pillar="S3"
              cardDesc="분기별 USD 단가 vs USD/KRW 환율 — 이중 타격(Double Whammy) 분석"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS/한국은행 2026-05-15' }} chartHeight={300}
              chart={
                <ComposedChart data={fxCorrelationData}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="quarter" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis yAxisId="left" domain={[11, 13.5]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '$/kg', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[1200, 1450]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: 'USD/KRW', angle: 90, position: 'insideRight', fill: 'var(--w-slate-400)' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="avgUnitPrice" name="평균수입단가($/kg)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="usdkrw" name="USD/KRW 환율" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS+BOK] 수입 단가(달러) 자체는 안정적이어도 환율이 오르면 실제 기업이 지불해야 하는 원화 결제액이 크게 늘어나 수익성이 악화됩니다.</span>,
                actionPlan: <span>2023년 1분기부터 2024년 4분기 시계열 분석 결과, 거시 경제의 최악의 시나리오인 'Double Whammy(이중 타격)' 현상이 확인됩니다. 영국산 원물 USD 단가가 $11.82에서 $12.75(+7.9%)로 인상된 것에 더해, 동기간 USD/KRW 환율마저 1,264원에서 1,400원(+10.8%)으로 수직 상승했습니다. 이로 인해 국내 수입사가 체감하는 원화 환산 매입 원가는 무려 20% 가까이 폭등했습니다. 재무 라인은 즉각 비상 경영 체제로 돌입하여 능동적인 <TermTooltip term="FX Forward 헤지" description="환변동 위험을 방어하기 위해 미래 특정 시점의 환율을 현재 시점에 사전 고정시키는 선도 계약." /> 및 통화 분산 스왑을 가동, 판관비 및 이익률 훼손을 방어하는 최후의 보루 역할을 수행해야 합니다.</span>,
                source: 'KCS / 한국은행',
              }} />

            <WidgetCard title="영국 현지 어획 규제 리스크 진단" icon={Shield} iconColor="var(--color-info)" pillar="S3"
              cardDesc="MCRS·쿼터제·IFCA 규제 — 영국 자원 보호주의 정책 위협 측정"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <RadarChart data={ukRegulatoryRadar} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--w-slate-400)', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="리스크 수준" dataKey="value" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.25} strokeWidth={2} />
                  <RechartsTooltip content={<CustomTooltip />} />
                </RadarChart>
              }
              takeaway={{
                situation: <span>[IFCA/MMO] 영국 정부가 골뱅이 크기 규제(MCRS)를 강화하고 어획량을 통제하면서, 영국산 물량 조달에 차질이 빚어질 위험이 커지고 있습니다.</span>,
                actionPlan: <span>영국의 해양 규제 당국(<TermTooltip term="IFCA" description="영국 Inshore Fisheries and Conservation Authority. 해안 환경보존 및 어업 규제를 단속하는 핵심 부처." />)의 자국 수산자원 보호주의 정책이 골뱅이 공급망의 최대 뇌관으로 부상했습니다. 특히 <TermTooltip term="MCRS(최소보존규격)" description="Minimum Conservation Reference Size. 포획 허용 조개껍질 최소 크기. 상향 시 소형 어획 불가." />를 45mm에서 55mm로 기습 상향하려는 움직임은 단기 어획량을 20~30% 소멸시킬 수 있는 치명적 규제(리스크 점수, Risk Score 85)입니다. 또한 웨일스 지방을 기점으로 확산 조짐이 보이는 <TermTooltip term="ACL 쿼터제" description="Annual Catch Limit. 지역 단위 총 할당량 제한으로 수입사의 독과점 물량 확보를 막는 보호무역 장치." />는 해외 자본의 독점적 물량 싹쓸이를 원천 차단합니다. 해외 전략 파트는 현지 로비망 가동 및 현지 가공 공장 지분 투자를 통해 이러한 '규제 장벽'을 내부자 자격으로 우회하는 전략적 판단이 필요합니다.</span>,
                source: 'UK IFCA / MMO',
              }} />
          </>

        {/* Pillar 5 continued: 구조적 위협 & 기회 — 동일 Pillar 내 하위 블록 */}
  <>
            <WidgetCard title="패류 자원별 양식 가능성 및 공급 탄력성" icon={ShieldAlert} iconColor="var(--color-danger)" pillar="S1"
              cardDesc="골뱅이 vs 바지락·동죽·연어 — 해적생물 분류로 양식 영구 불가"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <BarChart data={aquacultureData} margin={{ top: 10 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="species" tick={{ fill: 'var(--w-slate-50)', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="aquaculture" name="양식 가능성" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="supplyElasticity" name="공급 탄력성" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="priceStability" name="가격 안정성" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[국립수산과학원] 충격적 사실: 골뱅이는 '해적생물(Pest)'로 분류되어 양식이 영구히 불가능한 유일한 국민 안주</span>,
                actionPlan: <span>골뱅이(큰구슬우렁이)는 바지락·동죽 등 패류를 잡아먹는 <TermTooltip term="해적생물" description="해양 양식장에서 양식 대상 생물을 포식하거나 피해를 주는 유해 생물. 골뱅이는 육식성 포식자로 분류됨." /> 로서, 양식 시도 자체가 기존 패류 산업을 파괴합니다. 연어·새우와 달리 수요 폭증 시에도 공급을 인위적으로 늘릴 방법이 전무한 '공급 탄력성 제로(Zero Elasticity)' 품목입니다. 이는 장기적으로 <TermTooltip term="희소성 프리미엄" description="Scarcity Premium. 공급이 구조적으로 제한된 자원에 붙는 가격 프리미엄. 양식 불가 품목에서 특히 강하게 작용." /> 을 보장하지만, 동시에 기후·규제 충격 시 가격 방어 메커니즘이 전무함을 의미합니다. 12~18개월 선물(Forward) 계약과 R. venosa 블렌딩 20~30% 유지로 원가 완충 장치를 내재화해야 합니다.</span>,
                source: '국립수산과학원',
              }} />

            <WidgetCard title="카드뮴 생체축적 및 식품안전 규제 진단" icon={FlaskConical} iconColor="var(--color-danger)" pillar="S3"
              cardDesc="부위별 카드뮴 농도 — 내장 제거율 불량 시 통관 반려 리스크"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <ComposedChart data={cadmiumData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="part" tick={{ fill: 'var(--w-slate-50)', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis domain={[0, 7]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: 'mg/kg', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="cd" name="카드뮴 농도(mg/kg)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: 'var(--w-slate-50)', fontSize: 11 }}>
                    {cadmiumData.map((entry: any, index: number) => (<Cell key={`cd-${index}`} fill={index === 1 ? 'var(--color-danger)' : index === 2 ? 'var(--color-warning)' : 'var(--color-success)'} />))}
                  </Bar>
                  <Line type="monotone" dataKey="limit" name="식약처 기준선(2.0)" stroke="var(--w-slate-50)" strokeWidth={2} strokeDasharray="8 4" dot={false} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[식약처/EFSA] 골뱅이 내장에는 카드뮴이 식약처 기준치를 초과하여 쌓이므로, 가공 시 내장을 완벽하게 제거하지 않으면 통관에 실패할 수 있습니다.</span>,
                actionPlan: <span>골뱅이의 간췌장(내장) 부위에는 카드뮴이 근육 대비 20~100배 농축(5.5mg/kg)되어 식약처 기준(2.0mg/kg)을 크게 초과합니다. 해외 가공 공장에서 <TermTooltip term="내장 제거 완전성" description="Evisceration Rate. 가공 과정에서 간췌장(내장)이 완전히 제거된 비율. 미달 시 중금속 기준 초과로 수입 통관 부적합 판정의 직접적 원인." /> 이 미달될 경우, 한 번의 식약처 부적합 판정으로 수억 원대 물량이 전량 폐기·반송됩니다. QC팀은 분기별 원산지 공장 방문 검수와 제3자 검사기관(SGS, Intertek) 인증을 의무화하고, 내장 제거율을 핵심 KPI로 관리해야 합니다.</span>,
                source: '식약처 / EFSA',
              }} />

            <WidgetCard title="1인 가구 혼술 트렌드 및 채널 수입량 변동" icon={ShoppingBag} iconColor="var(--color-success)" pillar="S4"
              cardDesc="냉동 자숙 골뱅이육 수입 +105% — 혼술 이코노미 구조적 전환"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 월별 통관 2026-05-15' }} chartHeight={300}
              chart={
                <ComposedChart data={importSurgeData}>
                  <ChartPatternDefs />
                  <defs>
                    <linearGradient id="colorSurge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis yAxisId="left" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '톤', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '$M', angle: 90, position: 'insideRight', fill: 'var(--w-slate-400)' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="volume" name="수입량(톤)" stroke="var(--color-success)" fill="url(#colorSurge)" />
                  <Line yAxisId="right" type="monotone" dataKey="value" name="수입액($M)" stroke="var(--color-warning)" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS/FishFocus] 1인 가구의 '혼술' 트렌드가 유행을 넘어 구조적 소비로 굳어지며, 냉동 조미 골뱅이의 수입량이 2배 넘게 급증했습니다.</span>,
                actionPlan: <span>2025년 2월 기준 냉동 자숙 골뱅이육 수입이 170톤(전년 동기 대비 +105%), 1~2월 누적 수입액 USD 4.95M(+84%)을 기록하며 역대 최고치를 경신했습니다. 이는 <TermTooltip term="혼술 이코노미" description="1인 가구와 홈술(집에서 마시는 술) 문화가 만든 소비 경제. 편의점 안주, 소포장 HMR 등 새로운 수요 창출의 원동력." /> 가 일시적 유행이 아닌 비가역적(Irreversible) 소비 구조 전환임을 입증합니다. 마케팅팀은 150g 소포장 '혼술 에디션'과 에어프라이어용 '마늘버터 골뱅이 키트' 등 채널 맞춤형 SKU를 Q3 성수기 전 선제 출시해야 합니다.</span>,
                source: 'KCS / FishFocus UK',
              }} />

            <WidgetCard title="원물 부산물(패각/내장) 업사이클링 순환 가치" icon={Recycle} iconColor="var(--color-success)" pillar="S5"
              cardDesc="가공 후 78% 폐기물 → 해양 콜라겐·바이오 세라믹 재자원화"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <BarChart data={byproductData} layout="vertical" margin={{ left: 30 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '중량 비율(%)', position: 'bottom', fill: 'var(--w-slate-400)', offset: -5 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--w-slate-50)', fontSize: 11 }} width={90} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="ratio" name="중량 비율(%)" radius={[0, 4, 4, 0]}>
                    {byproductData.map((entry: any, index: number) => (<Cell key={`bp-${index}`} fill={entry.color} />))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[MDPI] 원물을 가공할 때 버려지는 78%의 껍데기와 내장에서 고부가가치의 '해양 콜라겐'을 추출할 수 있어 새로운 수익 창출이 가능합니다.</span>,
                actionPlan: <span>골뱅이 원물의 78%는 껍질·내장·체액으로 폐기되지만, 이 부산물에서 <TermTooltip term="해양 콜라겐 펩타이드" description="Marine Collagen Peptide. 수산 부산물에서 효소 분해로 추출하는 저분자 단백질. 광우병 위험 없이 피부·관절 건강에 효과적이며, 할랄/코셔 인증이 용이." /> 를 추출할 수 있습니다. 아태 지역 해양 콜라겐 시장 규모는 $980M이며, 소·돼지 대비 종교적 제약이 없어 할랄/코셔 시장 진출이 용이합니다. 또한 껍질(CaCO₃)은 칼슘 보충제와 바이오 세라믹 원료로 활용 가능합니다. R&D 부서는 국내 바이오 스타트업과의 공동 연구 MOU를 통해 부산물 수익화 파이프라인을 구축해야 합니다.</span>,
                source: 'MDPI / ResearchGate',
              }} />

            <WidgetCard title="B2C 통조림 규격별 고형량(살코기) 투명성 비율" icon={Package} iconColor="var(--color-warning)" pillar="S4"
              cardDesc="300g 캔의 실제 살코기 40~50% — 투명성 마케팅 차별화"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <BarChart data={solidContentData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="brand" tick={{ fill: 'var(--w-slate-50)', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis domain={[0, 320]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: 'g', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="solid" name="고형량(살)" stackId="a" fill="var(--color-success)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="liquid" name="조미액" stackId="a" fill="var(--w-slate-500)" radius={[4, 4, 0, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[aT FIS] 일반적인 300g 캔 제품의 절반 이상이 국물(조미액)이며, 실제 골뱅이 살코기는 40~50% 수준에 불과합니다.</span>,
                actionPlan: <span>300g 골뱅이 통조림에서 실제 <TermTooltip term="고형량" description="Solid weight. 통조림 내 액상액(조미액)을 제외한 순수 고기 무게. 소비자가 실제 먹게 되는 골뱅이 살의 양." /> 은 120~150g(40~50%)에 불과하며, 나머지는 간장 기반 조미액입니다. '헬시 플레저' 트렌드와 고물가 시대의 합리적 소비 심리가 맞물리면, 고형량 비율이 낮은 브랜드는 소비자 신뢰를 급격히 잃을 수 있습니다. 선제적으로 '고형량 65%+' 프리미엄 라인을 출시하고, 패키지 전면에 고형량 비율을 대형 표기하는 '투명성 마케팅'이 차별화 전략의 핵심입니다.</span>,
                source: 'aT FIS 식품산업통계',
              }} />

            <WidgetCard title="해수온 상승에 따른 조업지 이탈 기후 리스크" icon={Thermometer} iconColor="var(--color-danger)" pillar="S1"
              cardDesc="북대서양 해수면 온도(SST) + 영국·캐나다 어획량 — 포스트 영국(Post-UK) 대비"
              telemetry={{ status: 'STATIC', syncDate: '2026 기후 시뮬레이션' }} chartHeight={300}
              chart={
                <ComposedChart data={climateRiskData}>
                  <ChartPatternDefs />
                  <defs>
                    <linearGradient id="colorUkCatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCaCatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis yAxisId="left" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '어획량(톤)', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[9, 15]} tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: 'SST(°C)', angle: 90, position: 'insideRight', fill: 'var(--w-slate-400)' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="ukCatch" name="영국 어획(톤)" stroke="var(--color-info)" fill="url(#colorUkCatch)" />
                  <Area yAxisId="left" type="monotone" dataKey="canadaCatch" name="캐나다 어획(톤)" stroke="var(--color-danger)" fill="url(#colorCaCatch)" />
                  <Line yAxisId="right" type="monotone" dataKey="sst" name="북대서양 수온(°C)" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 5, fill: 'var(--color-warning)' }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[IPCC/FAOSTAT] 바닷물 온도가 높아지면 찬물에 사는 골뱅이가 서식지를 떠나버립니다. 캐나다에서는 이미 수온 상승으로 어획량이 크게 줄어들었습니다.</span>,
                actionPlan: <span>골뱅이 공급망의 진짜 적은 경쟁사가 아니라 '기후변화'입니다. 냉수성 저서생물인 B. undatum은 <TermTooltip term="SST" description="Sea Surface Temperature. 해수면 온도. 북대서양 수온이 15°C를 넘으면 골뱅이의 서식지 이탈과 산란율 급감이 시작됨." /> 15°C를 넘으면 서식지를 이탈하며, 이미 캐나다에서 이 시나리오가 현실화되어 어획량이 -74% 붕괴했습니다. IPCC 예측에 따르면 현재 한국 수입의 52%를 차지하는 영국 북해도 수온이 2035년까지 1.5~2°C 상승할 전망이며, 이는 10년 내 영국산 물량이 연간 10~15%씩 자연 감소할 수 있음을 의미합니다. 전략기획실은 '포스트-영국(Post-UK)' 시대를 대비하여 아이슬란드·노르웨이 등 고위도 신규 어장 개척과 흑해(튀르키예) R. venosa의 총사용원가(TCU) 기반 경제성 재평가를 즉각 병행해야 합니다.</span>,
                source: 'IPCC / FAOSTAT',
              }} />
          </>

            {/* W23: EU 포장규제 리스크 */}
            <WidgetCard title="EU PPWR 포장규제 컴플라이언스 리스크" icon={Recycle} iconColor="var(--color-warning)" pillar="S5"
              cardDesc="EU 포장폐기물규정(PPWR)이 골뱅이 캔 패키징 비용·수출 경쟁력에 미치는 리스크 6축 평가"
              telemetry={{ status: 'STATIC', syncDate: 'KMI 2026.03' }}
              customBody={
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {euPackagingRiskData.map((d: any, i: number) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: d.value >= 70 ? 'var(--color-danger)' : d.value >= 50 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                        {d.value}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)', marginTop: '4px', lineHeight: 1.3 }}>{d.axis}</div>
                      <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '6px' }}>
                        <div style={{ height: '100%', width: `${d.value}%`, background: d.value >= 70 ? 'var(--color-danger)' : d.value >= 50 ? 'var(--color-warning)' : 'var(--color-success)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              }
              takeaway={{
                situation: <span>[KMI 카드뉴스] EU가 2025년부터 시행하는 PPWR(포장폐기물규정)은 재활용 비율 의무화(80점)와 EPR 비용 부담 증가(70점)가 골뱅이 캔 수출에 직접적 비용 상승 요인입니다.</span>,
                actionPlan: <span>EU PPWR의 핵심 리스크는 2030년까지 식품 포장재 재활용 비율 70% 의무화입니다. 현재 골뱅이 캔(주석도강판)의 재활용률은 이미 85%로 양호하나, 내부 코팅재(BPA 프리 전환)와 라벨 접착제의 재활용 적합성 인증이 추가로 필요합니다. 또한 EPR(생산자 책임 확대) 비용이 캔당 €0.02~0.05 증가 예상됩니다. 품질관리팀은 EU 수출용 포장재의 PPWR 적합성 사전 인증을 26Q4까지 완료하고, 의도하지 않은 비스페놀 A(BPA-NI) 코팅으로의 전환 계획을 수립해야 합니다.</span>,
                source: 'KMI / EU PPWR',
              }} />

            {/* W24: PFAS 식품안전 매트릭스 */}
            <WidgetCard title="PFAS(과불화화합물) 차세대 식품안전 리스크" icon={FlaskConical} iconColor="var(--color-warning)" pillar="S3"
              cardDesc="EU/미국 PFAS(영원한 화학물질) 규제가 수산물 수입에 미치는 영향 — 어종별 비교"
              telemetry={{ status: 'STATIC', syncDate: 'KFAS 2024' }} chartHeight={280}
              chart={
                <BarChart data={pfasRiskData} layout="vertical" margin={{ left: 40 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: 'ng/g', position: 'bottom', fill: 'var(--w-slate-400)', offset: -5 }} />
                  <YAxis dataKey="species" type="category" tick={{ fill: 'var(--w-slate-50)', fontSize: 10 }} width={100} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="pfos" name="PFOS(ng/g)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="pfoa" name="PFOA(ng/g)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[KFAS 군산연안 연구] 골뱅이(복족류)의 PFOS 수치(0.42 ng/g)는 EU 기준(1.0 ng/g) 이하로 '주의' 수준이나, 담치·굴 등 이매패류는 이미 기준을 초과하여 규제 강화 시 연쇄 영향이 우려됩니다.</span>,
                actionPlan: <span>PFAS는 '영원한 화학물질(Forever Chemicals)'로 불리며, EU가 2025년부터 수산물 PFOS/PFOA 모니터링을 의무화했습니다. 골뱅이는 현재 안전 범위이나, PFAS는 해양 환경에서 생물농축되므로 향후 규제 기준 강화(0.5 ng/g으로 하향) 시 '주의→초과'로 격상될 위험이 있습니다. 품질관리팀은 분기별 PFAS 모니터링 프로토콜을 신설하고, 원산지별(영국/튀르키예/아일랜드) PFAS 농도 프로파일을 확보하여 선제적 리스크 맵을 구축해야 합니다.</span>,
                source: 'KFAS 군산연안 연구',
              }} />

            {/* W28: 할랄 해양콜라겐 시장 */}
            <WidgetCard title="할랄 인증 해양콜라겐 — 글로벌 시장 기회" icon={Globe} iconColor="var(--color-success)" pillar="S4"
              cardDesc="골뱅이 부산물 해양 콜라겐의 할랄/코셔 인증 기반 수출 시장 규모·지역별 성장 잠재력"
              telemetry={{ status: 'STATIC', syncDate: 'KMI 2026.04' }} chartHeight={280}
              chart={
                <BarChart data={halalCollagenData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="region" tick={{ fill: 'var(--w-slate-50)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} label={{ value: '$M', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-400)' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="marketSize" name="시장 규모($M)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="halalShare" name="할랄 비중(%)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[KMI 할랄인증] 동남아시아의 할랄 인증 의무화(BPJPH)로 수산물 부산물 기반 해양 콜라겐의 수출 기회가 급부상하고 있습니다. 중동/북아프리카의 할랄 비중은 95%입니다.</span>,
                actionPlan: <span>골뱅이 부산물에서 추출하는 해양 콜라겐 펩타이드는 소·돼지 원료 대비 '할랄/코셔 프리미엄'을 갖습니다. 중동·북아프리카($420M, 할랄 95%), 동남아($310M, 할랄 72%) 시장은 연 10~12% 성장 중이며, 인도네시아의 BPJPH 할랄 의무화는 한국산 수산물 부산물 콜라겐의 진입 기회입니다. R&D 부서는 할랄 인증(JAKIM/BPJPH) 취득을 위한 가공 공정 분리를 검토하고, 코스메슈티컬(기능성 화장품) 및 건강기능식품 채널을 타겟으로 2027년 출시를 목표로 해야 합니다.</span>,
                source: 'KMI 할랄인증',
              }} />
      </>)}

        {/* KFAS 학술 연구 인텔리전스 위젯 (동적 렌더링, 모든 pillar 공통 표시) */}
        {kfasWidgets.length > 0 && (
          <>
            <div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Dna size={20} color="#8b5cf6" />
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--w-slate-50)' }}>KFAS 학술 연구 인텔리전스</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)', background: 'rgba(var(--w-violet-500-rgb), 0.15)', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>
                국립수산과학원 검증 · {kfasWidgets.length}개 위젯
              </span>
            </div>
            {kfasWidgets.map((widget: any) => (
              <WidgetCard key={widget.id}
                title={widget.title?.replace(/^🔬\s*/, '')}
                icon={Dna} iconColor="#8b5cf6"
                pillar={(widget.pillar || 'S5') as any}
                cardDesc={widget.subtitle || '국립수산과학원 검증 학술 연구'}
                telemetry={{ status: 'STATIC', syncDate: 'KFAS 2024' }}
                chartHeight={300}
                chart={
                  widget.data && widget.data.length > 0 ? (
                    <BarChart data={widget.data} margin={{ top: 10 }}>
                      <ChartPatternDefs />
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey={widget.xKey} tick={{ fill: 'var(--w-slate-50)', fontSize: 10 }} interval={0} angle={0} textAnchor="middle" height={55} />
                      <YAxis tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                      {widget.bars?.map((bar: any, bi: number) => (
                        <Bar key={bi} dataKey={bar.key} name={bar.name?.slice(0, 15)} fill={bar.color} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  ) : undefined
                }
                takeaway={{
                  situation: <span>{widget.sit?.slice(0, 300)}{widget.sit?.length > 300 ? '…' : ''}</span>,
                  actionPlan: <span>{widget.strat?.slice(0, 300)}{widget.strat?.length > 300 ? '…' : ''}</span>,
                  source: widget.source || 'KFAS 한국수산과학회지',
                }}
              />
            ))}
          </>
        )}

      </div>
    </div>
  );
}
