'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Globe,
  Users,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import styles from './TunaInsightsDashboard.module.css';
import TelemetryBadge from './TelemetryBadge';

/* ─── Existing MSC Widgets (migrated from TunaDashboard) ─── */
import {
  MscGlobalTunaGrowthTracker,
  MscEuropeCountryPenetration,
  MscBrandSourcingScorecard,
  MscTunaStockHealthGauge,
  MscConsumerInsightsRadar,
} from './MscIntelligenceWidgets';

/* ─── New MSC Strategy Widgets (Section 1) ─── */
import MscSpeciesCoverageHeatmap from './msc-strategy/MscSpeciesCoverageHeatmap';
import MscGearTypeTrends from './msc-strategy/MscGearTypeTrends';
import MscCertificationPipeline from './msc-strategy/MscCertificationPipeline';

/* ─── New MSC Strategy Widgets (Section 2: European Market) ─── */
import MscEuropeRetailPrices from './msc-strategy/MscEuropeRetailPrices';
import MscPbNbMatrix from './msc-strategy/MscPbNbMatrix';
import MscConsumptionStructure from './msc-strategy/MscConsumptionStructure';
import MscRetailChannelPenetration from './msc-strategy/MscRetailChannelPenetration';

/* ─── New MSC Strategy Widgets (Section 3: Consumer) ─── */
import MscUkShopperTrends from './msc-strategy/MscUkShopperTrends';
import MscDemographicAcceptance from './msc-strategy/MscDemographicAcceptance';
import MscEcolabelCompetition from './msc-strategy/MscEcolabelCompetition';
import MscRetailerSkuMonitor from './msc-strategy/MscRetailerSkuMonitor';

/* ─── New MSC Strategy Widgets (Section 4: South vs North) ─── */
import MscSouthVsNorthEurope from './msc-strategy/MscSouthVsNorthEurope';

/* ─── New MSC Strategy Widgets (Section 5: Risk) ─── */
import MscRfmoAlignment from './msc-strategy/MscRfmoAlignment';
import MscSuspensionHistory from './msc-strategy/MscSuspensionHistory';

/* ================================================================
   Section Configuration
================================================================ */
const SECTIONS = [
  { id: 'global', label: '글로벌 현황', icon: Globe, color: '#38bdf8', desc: 'MSC 인증 성장 궤적 · 어종별 커버리지 · 인증 파이프라인' },
  { id: 'market', label: '유럽 마켓', icon: MapPin, color: '#10b981', desc: '국가별 소매 가격 · PB vs NB · 소비 구조 · 유통 채널' },
  { id: 'consumer', label: '소비자', icon: Users, color: '#a78bfa', desc: '쇼퍼 행동 변화 · 세대별 수용도 · 에코라벨 경쟁 · 리테일러 SKU' },
  { id: 'regional', label: '남 vs 북', icon: MapPin, color: '#f59e0b', desc: '남유럽 vs 북유럽 구조 비교 · 성장 잠재력 매트릭스' },
  { id: 'risk', label: '리스크', icon: AlertTriangle, color: '#ef4444', desc: '자원 건전성 · RFMO 정합성 · 인증 정지 히스토리' },
];

/* ================================================================
   Main Component
================================================================ */
export default function MscStrategyDashboard() {
  const [activeSection, setActiveSection] = useState('global');

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <ShieldCheck size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                MSC 전략 인텔리전스 센터
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                24개 글로벌 보고서 기반 — MSC 인증 B2C 전략 종합 분석 · 19개 위젯
              </p>
            </div>
          </div>
          <div className="ds-card" style={{
            fontSize: '0.88rem', padding: '8px 16px',
            background: '#181818', border: 'none',
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
          }}>
            <TelemetryBadge status="STATIC" syncDate="2025-26" />
            <span style={{ margin: '0 4px', color: '#4d4d4d' }}>|</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.78rem' }}>Yearbook · Annual Report · Country Market Analysis</span>
          </div>
        </div>
      </header>

      {/* ═══ Section Navigator ═══ */}
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            MSC 전략 네비게이터 — 아래 섹션을 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {SECTIONS.map((s, idx) => {
            const isActive = activeSection === s.id;
            const SectionIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
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
                  <div style={{
                    position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                    borderRadius: '3px 3px 0 0',
                  }} />
                )}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? s.color : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#0f172a' : 'rgba(148,163,184,0.6)',
                  fontSize: '0.75rem', fontWeight: 800,
                  transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>
                  <SectionIcon size={14} />
                </div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
                {isActive && (
                  <span style={{
                    fontSize: '0.6rem',
                    color: 'rgba(148,163,184,0.7)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as any,
                  }}>
                    {s.desc.split('·')[0].trim()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Section Content ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

        {/* ═══════ Section 1: 글로벌 MSC 현황 & 인증 파이프라인 ═══════ */}
        {activeSection === 'global' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#38bdf8', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🌍 글로벌 MSC 현황 & 인증 파이프라인
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  MSC 인증 참치 프로그램의 거시적 성장 궤적, 어종·어법별 인증 현황, 차세대 인증 파이프라인
                </p>
              </div>
            </div>

            {/* Migrated: Global Growth Tracker (Full Width) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <MscGlobalTunaGrowthTracker />
            </div>

            {/* Migrated: Country Penetration + New: Species Heatmap */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <MscEuropeCountryPenetration />
              <MscSpeciesCoverageHeatmap />
            </div>

            {/* New: Gear Type Trends + Certification Pipeline */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <MscGearTypeTrends />
              <MscCertificationPipeline />
            </div>
          </section>
        )}

        {/* ═══════ Section 2: 유럽 국가별 마켓 딥다이브 ═══════ */}
        {activeSection === 'market' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#10b981', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🇪🇺 유럽 마켓 딥다이브 (B2C 핵심)
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  국가별 소매 가격 비교, PB vs NB 침투 매트릭스, 소비 구조, 유통 채널별 MSC 침투율
                </p>
              </div>
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <MscEuropeRetailPrices />
              <MscPbNbMatrix />
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <MscConsumptionStructure />
              <MscRetailChannelPenetration />
            </div>

            {/* Migrated: Brand Scorecard */}
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <MscBrandSourcingScorecard />
            </div>
          </section>
        )}

        {/* ═══════ Section 3: 소비자 행동 & 세그먼트 분석 ═══════ */}
        {activeSection === 'consumer' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#a78bfa', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  👤 소비자 행동 & 세그먼트 분석
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  UK 쇼퍼 행동 변화(2023→2026), 세대×소득별 수용도, 에코라벨 경쟁, 리테일러별 MSC 전환
                </p>
              </div>
            </div>

            {/* Migrated: Consumer Insights Radar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <MscConsumerInsightsRadar />
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <MscUkShopperTrends />
              <MscDemographicAcceptance />
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <MscEcolabelCompetition />
              <MscRetailerSkuMonitor />
            </div>
          </section>
        )}

        {/* ═══════ Section 4: 남유럽 vs 북유럽 비교 분석 ═══════ */}
        {activeSection === 'regional' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#f59e0b', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🗺️ 남유럽 vs 북유럽 비교 분석
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  같은 유럽이지만 완전히 다른 두 개의 MSC 시장 — 구조적 차이와 진출 기회 분석
                </p>
              </div>
            </div>

            <MscSouthVsNorthEurope />
          </section>
        )}

        {/* ═══════ Section 5: 리스크 & 규제 시나리오 ═══════ */}
        {activeSection === 'risk' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#ef4444', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ⚠️ 리스크 & 규제 시나리오
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  자원 건전성 게이지, RFMO별 MSC 정합성 모니터, 인증 정지·유예 사례 분석
                </p>
              </div>
            </div>

            {/* Migrated: Stock Health Gauge */}
            <div style={{ marginBottom: '1.5rem' }}>
              <MscTunaStockHealthGauge />
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <MscRfmoAlignment />
              <MscSuspensionHistory />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
