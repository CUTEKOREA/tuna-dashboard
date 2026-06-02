"use client";

import React, { useState, useEffect } from 'react';
import { 
  Factory, Truck, Anchor, Activity, Globe, RefreshCcw, 
  AlertTriangle, TrendingUp, TrendingDown, Database, Ship, Navigation
} from 'lucide-react';
import CanneryStatusCharts from './CanneryStatusCharts';
import GensanCanneryStatusCharts from './GensanCanneryStatusCharts';
import ReeferMovement from './ReeferMovement';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import CountUp from 'react-countup';
import TraderStatus from './TraderStatus';
import CarrierUnloadingStatus from './CarrierUnloadingStatus';
import WidgetCard from './WidgetCard';

export default function LogisticsDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for the dashboard skeleton
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: 'var(--color-success)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading Logistics Intelligence...</p>
    </div>
  );

  // ── 밸류체인 플로우 스파인 노드 (어획→운반선→항만→가공→트레이더→수출) ──
  const NODES: { icon: any; label: string; sub: string; target: string | null }[] = [
    { icon: Globe, label: '어획', sub: 'WCPO 원어', target: null },
    { icon: Ship, label: '운반선', sub: '해상 운송', target: 'sec-logistics' },
    { icon: Anchor, label: '항만 하역', sub: '방콕·송클라', target: 'sec-logistics' },
    { icon: Factory, label: '가공', sub: '캐너리 가동', target: 'sec-processing' },
    { icon: Activity, label: '트레이더', sub: '반입 물량', target: 'sec-trader' },
    { icon: Navigation, label: '수출', sub: '부산·글로벌', target: null },
  ];
  const HERO: { n: number; suffix: string; label: string; icon: any; live?: boolean }[] = [
    { n: 6, suffix: '단계', label: '밸류체인', icon: Activity },
    { n: 3, suffix: '곳', label: '가공 허브(방콕·송클라·젠산)', icon: Factory },
    { n: 2, suffix: '곳', label: '핵심 양륙항', icon: Anchor },
    { n: 0, suffix: '', label: '운반선·체선 실시간 추적', icon: Ship, live: true },
  ];
  // ── 물류 경로 미니 지도 핀 (동남아 가공허브 → 부산) ──
  const PINS: { x: number; y: number; name: string; status: string; c: string; anchor: 'start' | 'end' | 'middle' }[] = [
    { x: 92, y: 116, name: '방콕', status: '체선 6일', c: '#f59e0b', anchor: 'start' },
    { x: 104, y: 156, name: '송클라', status: '대체항', c: '#38bdf8', anchor: 'start' },
    { x: 184, y: 150, name: '젠산', status: '가동 ↓', c: '#94a3b8', anchor: 'start' },
    { x: 322, y: 56, name: '부산', status: '수출 도착', c: '#10b981', anchor: 'end' },
  ];
  const scrollTo = (id: string | null) => { if (id && typeof document !== 'undefined') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <div style={{ position: 'relative', padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif" }}>
      {/* 인포그래픽 흐름 애니메이션 keyframes */}
      <style>{`@keyframes flowMove{from{background-position:0 0}to{background-position:16px 0}}@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Factory size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #e2e8f0, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                물류·가공 인텔리전스 (Logistics & Processing)
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Global Value Chain Operation Command Center</p>
            </div>
          </div>
          <div className="ds-card" style={{
            fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #1ed760', animation: 'pulse 2s infinite' }} />
            <span>LIVE <span style={{ color: 'var(--color-success)' }}>Connected</span></span>
          </div>
        </div>
      </header>

      {/* ═══ HERO SCENE: KPI 밴드 + 밸류체인 플로우 스파인 (한 장면 인포그래픽) ═══ */}
      <div className="ds-card" style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(5,150,105,0.02))',
        border: '1px solid rgba(16,185,129,0.18)', borderRadius: '20px', padding: '1.5rem 1.5rem 1.75rem',
        marginBottom: '3rem', overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      }}>
        {/* 배경 글로우 */}
        <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)', pointerEvents: 'none' }} />

        {/* 히어로 KPI 밴드 */}
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.75rem', position: 'relative' }}>
          {HERO.map((k) => {
            const KIcon = k.icon;
            return (
              <div key={k.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KIcon size={14} color="#34d399" />
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{k.label}</span>
                </div>
                {k.live ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />LIVE
                  </span>
                ) : (
                  <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                    <CountUp end={k.n} duration={1.6} /><span style={{ fontSize: '0.9rem', color: '#34d399', marginLeft: '3px' }}>{k.suffix}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* 플로우 스파인 라벨 */}
        <div style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.8)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.9rem', textAlign: 'center' }}>
          공급망 여정 — 노드를 클릭하면 상세로 이동합니다
        </div>

        {/* 밸류체인 플로우 스파인 */}
        <div data-mobile-stack style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', position: 'relative' }}>
          {NODES.map((node, i) => {
            const NIcon = node.icon;
            return (
              <React.Fragment key={node.label}>
                <div
                  onClick={() => scrollTo(node.target)}
                  role={node.target ? 'button' : undefined}
                  tabIndex={node.target ? 0 : undefined}
                  onKeyDown={(e) => e.key === 'Enter' && scrollTo(node.target)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: node.target ? 'pointer' : 'default', minWidth: '66px' }}
                >
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    animation: `floatY 3s ease-in-out ${i * 0.25}s infinite`,
                  }}>
                    <NIcon size={21} color="#0a0a0a" />
                  </div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap' }}>{node.label}</span>
                  <span style={{ fontSize: '0.58rem', color: '#34d399', whiteSpace: 'nowrap' }}>{node.sub}</span>
                </div>
                {i < NODES.length - 1 && (
                  <div data-flow-connector style={{
                    flex: 1, height: '3px', alignSelf: 'flex-start', marginTop: '21px', minWidth: '14px',
                    background: 'repeating-linear-gradient(90deg, #10b981 0 7px, transparent 7px 16px)',
                    backgroundSize: '16px 3px', animation: 'flowMove 0.7s linear infinite', opacity: 0.55,
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ═══ 물류 경로 미니 지도 (동남아 가공허브 → 부산) ═══ */}
      <div className="ds-card" style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(5,150,105,0.02))',
        border: '1px solid rgba(16,185,129,0.15)', borderRadius: '18px', padding: '1.1rem 1.25rem 1.25rem',
        marginBottom: '3rem', boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
          <Globe size={16} color="#34d399" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>물류 경로 — 동남아 가공허브 → 부산</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#34d399' }}>냉동 운반선 항로</span>
        </div>
        <svg viewBox="0 0 400 190" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }} role="img" aria-label="동남아 가공허브에서 부산까지 냉동 운반선 항로 지도">
          <defs>
            <linearGradient id="lgOcean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b1220" /><stop offset="100%" stopColor="#0a0f1a" />
            </linearGradient>
            <linearGradient id="lgRoute" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="400" height="190" fill="url(#lgOcean)" />
          {[40, 80, 120, 160].map((y) => (<line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />))}
          {/* 육괴(장식) — 동남아 / 한반도 */}
          <path d="M40 108 Q72 92 122 104 Q162 110 178 142 Q150 178 88 172 Q44 160 40 108 Z" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.22)" strokeWidth="1" />
          <path d="M298 28 Q336 24 346 56 Q350 82 324 92 Q303 82 298 56 Z" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.22)" strokeWidth="1" />
          {/* 항로 + 흐름 애니메이션 */}
          <path id="lgRoutePath" d="M120 138 Q240 116 322 58" fill="none" stroke="url(#lgRoute)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="7 7">
            <animate attributeName="stroke-dashoffset" values="28;0" dur="0.9s" repeatCount="indefinite" />
          </path>
          {/* 운반선 마커 */}
          <circle r="4.5" fill="#34d399" stroke="#0a0f1a" strokeWidth="1.5">
            <animateMotion dur="6s" repeatCount="indefinite" rotate="auto"><mpath href="#lgRoutePath" /></animateMotion>
          </circle>
          {/* 핀 */}
          {PINS.map((p) => (
            <g key={p.name}>
              <circle cx={p.x} cy={p.y} r="5" fill="none" stroke={p.c} strokeWidth="1.5">
                <animate attributeName="r" values="5;10;5" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={p.x} cy={p.y} r="3.5" fill={p.c} />
              <text x={p.anchor === 'end' ? p.x - 9 : p.x + 9} y={p.y - 2} fill="#e2e8f0" fontSize="10" fontWeight="700" textAnchor={p.anchor}>{p.name}</text>
              <text x={p.anchor === 'end' ? p.x - 9 : p.x + 9} y={p.y + 9} fill={p.c} fontSize="8" textAnchor={p.anchor}>{p.status}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* ═══ Section 1: TRADER Status ═══ */}
      <section id="sec-trader" style={{ marginBottom: '4rem', scrollMarginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <TrendingUp size={24} color="var(--color-info)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>트레이더별 반입 물량 현황 (Trader Status)</h2>
        </div>
        <WidgetCard
          title="트레이더별 반입 물량"
          icon={TrendingUp}
          iconColor="var(--color-info)"
          pillar="S4"
          cardDesc="트레이더 단위 반입 물량·점유율 — 실시간 갱신"
          telemetry={{ status: 'LIVE', syncDate: 'Realtime' }}
          customBody={<TraderStatus />}
          takeaway={{
            situation: '트레이더별 누적 반입 물량으로 핵심 거래 파트너의 거래 비중을 식별.',
            actionPlan: '점유율 상위 트레이더와의 거래 안정성 강화 + 신규 트레이더 발굴을 통한 거래 다변화.',
            source: 'Silla Co. Intelligence Network',
          }}
        />
      </section>

      {/* ═══ Section 2: 가공 (Processing) ═══ */}
      <section id="sec-processing" style={{ marginBottom: '4rem', scrollMarginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Factory size={24} color="var(--color-success)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>가공 공장(Cannery) 가동 현황</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <WidgetCard
            title="가공 공장 가동 현황 (방콕·송클라)"
            icon={Factory}
            iconColor="var(--color-success)"
            pillar="S2"
            cardDesc="태국 방콕·송클라 통조림 공장 가동률·재고"
            telemetry={{ status: 'SYNCED', syncDate: '2026.05' }}
            customBody={<CanneryStatusCharts />}
            takeaway={{
              situation: '방콕 및 송클라 지역의 주요 통조림 공장들은 현재 총 보관 용량 대비 원어 재고가 타이트하게 유지되고 있으며, 전체 CAPA 대비 가동률은 안정적인 수준입니다. 최근 운반선 입항 지연으로 인해 향후 2~3주 내 일시적인 원료 부족 현상이 일부 중소 공장에서 발생할 수 있습니다.',
              actionPlan: '현재 원료 수급이 안정적인 대형 공장(Thai Union, Sea Value 등) 중심으로 직거래 물량을 사전 확보하고, 재고가 부족한 공장을 타겟으로 현물 프리미엄 판매 전략을 구사하여 이익을 극대화해야 합니다.',
              source: '태국 캐너리 인텔리전스',
            }}
          />

          <WidgetCard
            title="가공 공장 가동 현황 (필리핀 젠산)"
            icon={Factory}
            iconColor="var(--color-success)"
            pillar="S2"
            cardDesc="필리핀 제너럴 산토스 통조림 공장 가동률"
            telemetry={{ status: 'SYNCED', syncDate: '2026.05' }}
            customBody={<GensanCanneryStatusCharts />}
            takeaway={{
              situation: '제너럴 산토스 지역은 지역 연안 어획량 감소로 인해 수입 원어에 대한 의존도가 심화되고 있습니다. 창고 보관량은 여유가 있으나, 실질적인 공장 가동률은 방콕 대비 낮게 형성되어 있습니다.',
              actionPlan: '필리핀 지역으로의 운반선 직항 노선을 확보하여, 방콕항 체선 시 대체 양륙항으로 활용하는 전략적 유연성이 요구됩니다. 이를 통해 방콕향 운임 상승 리스크를 헷지할 수 있습니다.',
              source: '필리핀 젠산 캐너리 인텔리전스',
            }}
          />
        </div>
      </section>

      {/* ═══ Section 3: 물류 (Logistics) ═══ */}
      <section id="sec-logistics" style={{ marginBottom: '4rem', scrollMarginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Truck size={24} color="var(--color-info)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>해상 운송 및 항만 인텔리전스</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <WidgetCard
            title="운반선 하역 현황 (Carrier Unloading)"
            icon={Ship}
            iconColor="var(--color-info)"
            pillar="S3"
            cardDesc="운반선·하역 항만·소요일 모니터링"
            telemetry={{ status: 'LIVE', syncDate: 'Realtime' }}
            customBody={<CarrierUnloadingStatus />}
            takeaway={{
              situation: '운반선 하역 진행 상황을 실시간으로 모니터링.',
              actionPlan: '체선이 심화된 항만에서 다른 항만으로 하역 일정 조정 검토.',
              source: '실시간 항만 인텔리전스',
            }}
          />

          <WidgetCard
            title="냉동 운반선 이동 (Reefer Movement)"
            icon={Navigation}
            iconColor="var(--color-info)"
            pillar="S3"
            cardDesc="방콕항 체선율·운반선 이동 경로"
            telemetry={{ status: 'LIVE', syncDate: 'Realtime' }}
            customBody={<ReeferMovement />}
            takeaway={{
              situation: '현재 방콕항 묘박지 대기 선박 및 체선율 지수가 실시간으로 모니터링되고 있습니다. 체선이 심화될 경우 하역 지연에 따른 운반선 데머리지(Demurrage, 체선료) 패널티 리스크가 급증하며 원물 선도 저하 문제가 발생합니다.',
              actionPlan: '체선일이 10일을 초과하는 선박에 대해서는 선하증권(B/L) 분할 양륙 및 인근 송클라 또는 젠산 항구로의 목적지 변경(Diversion)을 적극 검토해야 합니다.',
              source: '방콕항 체선율 모니터링',
            }}
          />
        </div>
      </section>
    </div>
  );
}
