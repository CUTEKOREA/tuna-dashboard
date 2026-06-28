'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ShieldCheck,
  Globe,
  Users,
  MapPin,
  AlertTriangle,
  BookOpen,
  BarChart3,
  Compass,
} from 'lucide-react';
import TelemetryBadge from './TelemetryBadge';
import ErrorBoundary from './ErrorBoundary';

/* ─── Existing MSC Widgets (migrated from TunaDashboard) ─── */
import {
  MscGlobalTunaGrowthTracker,
  MscEuropeCountryPenetration,
  MscBrandSourcingScorecard,
  MscTunaStockHealthGauge,
  MscConsumerInsightsRadar,
} from './MscIntelligenceWidgets';

/* ─── MSC Strategy Widgets — dynamic imports ─── */
const MscSpeciesCoverageHeatmap = dynamic(() => import('./msc-strategy/MscSpeciesCoverageHeatmap'), { ssr: false });
const MscGearTypeTrends = dynamic(() => import('./msc-strategy/MscGearTypeTrends'), { ssr: false });
const MscCertificationPipeline = dynamic(() => import('./msc-strategy/MscCertificationPipeline'), { ssr: false });
const MscEuropeRetailPrices = dynamic(() => import('./msc-strategy/MscEuropeRetailPrices'), { ssr: false });
const MscPbNbMatrix = dynamic(() => import('./msc-strategy/MscPbNbMatrix'), { ssr: false });
const MscConsumptionStructure = dynamic(() => import('./msc-strategy/MscConsumptionStructure'), { ssr: false });
const MscRetailChannelPenetration = dynamic(() => import('./msc-strategy/MscRetailChannelPenetration'), { ssr: false });
const MscUkShopperTrends = dynamic(() => import('./msc-strategy/MscUkShopperTrends'), { ssr: false });
const MscDemographicAcceptance = dynamic(() => import('./msc-strategy/MscDemographicAcceptance'), { ssr: false });
const MscEcolabelCompetition = dynamic(() => import('./msc-strategy/MscEcolabelCompetition'), { ssr: false });
const MscRetailerSkuMonitor = dynamic(() => import('./msc-strategy/MscRetailerSkuMonitor'), { ssr: false });
const MscSouthVsNorthEurope = dynamic(() => import('./msc-strategy/MscSouthVsNorthEurope'), { ssr: false });
const MscRfmoAlignment = dynamic(() => import('./msc-strategy/MscRfmoAlignment'), { ssr: false });
const MscSuspensionHistory = dynamic(() => import('./msc-strategy/MscSuspensionHistory'), { ssr: false });

/* ─── NEW: 10 additional MSC widgets ─── */
const MscProgramOverview = dynamic(() => import('./msc-strategy/MscProgramOverview'), { ssr: false });
const MscVsFipComparison = dynamic(() => import('./msc-strategy/MscVsFipComparison'), { ssr: false });
const MscGlobalEngagementKpi = dynamic(() => import('./msc-strategy/MscGlobalEngagementKpi'), { ssr: false });
const MscStockScorecard = dynamic(() => import('./msc-strategy/MscStockScorecard'), { ssr: false });
const MscOpenConditions = dynamic(() => import('./msc-strategy/MscOpenConditions'), { ssr: false });
const MscMarketCategorySize = dynamic(() => import('./msc-strategy/MscMarketCategorySize'), { ssr: false });
const MscConsumerAwareness = dynamic(() => import('./msc-strategy/MscConsumerAwareness'), { ssr: false });
const MscCanadaGrowthCase = dynamic(() => import('./msc-strategy/MscCanadaGrowthCase'), { ssr: false });
const MscHarvestStrategyTimeline = dynamic(() => import('./msc-strategy/MscHarvestStrategyTimeline'), { ssr: false });
const MscKoreaPositioning = dynamic(() => import('./msc-strategy/MscKoreaPositioning'), { ssr: false });

/* ─── NEW: agri_data 보충 데이터 기반 5개 위젯 (2024-25 MSC 연례보고서 부속 데이터·에코라벨 등록부) ─── */
const MscFaoAreaPenetration = dynamic(() => import('./msc-strategy/MscFaoAreaPenetration'), { ssr: false });
const MscImprovementsDelivered = dynamic(() => import('./msc-strategy/MscImprovementsDelivered'), { ssr: false });
const MscProductVolumeGrowth = dynamic(() => import('./msc-strategy/MscProductVolumeGrowth'), { ssr: false });
const MscProductCountByCountry = dynamic(() => import('./msc-strategy/MscProductCountByCountry'), { ssr: false });
const MscEcolabelRegistryScale = dynamic(() => import('./msc-strategy/MscEcolabelRegistryScale'), { ssr: false });

/* ================================================================ */
const SECTIONS = [
  { id: 'intro', label: 'MSC 개요', icon: BookOpen, color: '#22d3ee', desc: 'MSC 정의 · 3대 원칙 · FIP 비교 · 글로벌 참여 현황' },
  { id: 'global', label: '글로벌 현황', icon: Globe, color: '#38bdf8', desc: 'MSC 인증 성장 궤적 · 어종별 커버리지 · FAO 해역별 침투율 · 자원 스코어카드' },
  { id: 'market', label: '유럽 마켓', icon: MapPin, color: '#10b981', desc: '국가별 소매 가격 · PB vs NB · 소비 구조 · 유통 채널' },
  { id: 'consumer', label: '소비자', icon: Users, color: '#a78bfa', desc: '쇼퍼 행동 변화 · 세대별 수용도 · 에코라벨 경쟁 · 레지스트리 규모' },
  { id: 'marketsize', label: '시장 규모', icon: BarChart3, color: '#f59e0b', desc: '카테고리별 규모 · 제품 볼륨/SKU 성장 · 소비자 WTP · 캐나다 사례' },
  { id: 'risk', label: '리스크', icon: AlertTriangle, color: '#ef4444', desc: 'RFMO 정합성 · 인증 정지 · 남/북유럽 비교 · 개선 실적' },
  { id: 'outlook', label: '전망/한국', icon: Compass, color: '#f472b6', desc: '수확전략 로드맵 · MSC v3.0 · 한국 포지셔닝' },
];

const GRID_2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', alignItems: 'stretch', marginBottom: '24px',
};

function SectionHeader({ color, emoji, title, desc }: { color: string; emoji: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <div style={{ width: '4px', height: '28px', background: color, borderRadius: '2px', flexShrink: 0 }} />
      <div>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {emoji} {title}
        </h2>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{desc}</p>
      </div>
    </div>
  );
}

export default function MscStrategyDashboard() {
  const [activeSection, setActiveSection] = useState('intro');

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'transparent' }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #38bdf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', flexShrink: 0,
            }}>
              <ShieldCheck size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                MSC 전략 인텔리전스 센터
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                24개 글로벌 보고서 + 연례보고서 부속 데이터 기반 — MSC 정의 · 현황 · 시장 · 전망 종합 분석 · 34개 위젯
              </p>
            </div>
          </div>
          <div className="ds-card" style={{
            fontSize: '0.88rem', padding: '8px 16px',
            background: '#11182f', border: 'none',
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
          }}>
            <TelemetryBadge status="STATIC" syncDate="2025-26" />
            <span style={{ margin: '0 4px', color: '#4d4d4d' }}>|</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.78rem' }}>MSC 연감 · 연례보고서 · ISSF · GlobeScan</span>
          </div>
        </div>
      </header>

      {/* ═══ Section Navigator ═══ */}
      <div style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '6px', marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px', borderBottom: '1px solid rgba(140,170,255,0.10)', marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            MSC 전략 네비게이터 — 7개 섹션을 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {SECTIONS.map((s) => {
            const isActive = activeSection === s.id;
            const SectionIcon = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveSection(s.id)}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '4px', padding: '12px 4px 14px',
                  background: isActive ? `${s.color}12` : 'transparent',
                  border: `1.5px solid ${isActive ? s.color : 'transparent'}`,
                  borderRadius: '12px', cursor: 'pointer',
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
                  background: isActive ? s.color : 'rgba(140,170,255,0.12)',
                  color: isActive ? '#0a0f1f' : 'rgba(148,163,184,0.6)',
                  fontSize: '0.75rem', fontWeight: 800, transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>
                  <SectionIcon size={14} />
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s', whiteSpace: 'nowrap',
                  textTransform: 'none', letterSpacing: 'normal',
                }}>
                  {s.label}
                </span>
                {isActive && (
                  <span style={{
                    fontSize: '0.55rem', color: 'rgba(148,163,184,0.7)', textAlign: 'center',
                    lineHeight: 1.3, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
                    textTransform: 'none', letterSpacing: 'normal',
                  }}>
                    {s.desc.split('·')[0].trim()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Section Content ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

        {/* ═══════ NEW: MSC 개요 ═══════ */}
        {activeSection === 'intro' && (
          <section>
            <SectionHeader color="#22d3ee" emoji="📘" title="MSC 인증 프로그램 개요" desc="MSC란 무엇인가 — 정의, 3대 원칙, FIP 비교, 글로벌 참여 현황 KPI" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscProgramOverview"><MscProgramOverview /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscVsFipComparison"><MscVsFipComparison /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscGlobalEngagementKpi"><MscGlobalEngagementKpi /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ 글로벌 MSC 현황 ═══════ */}
        {activeSection === 'global' && (
          <section>
            <SectionHeader color="#38bdf8" emoji="🌍" title="글로벌 MSC 현황 & 인증 파이프라인" desc="MSC 인증 참치 프로그램의 거시적 성장 궤적, 어종·어법별 인증 현황, 자원 스코어카드" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MSC Global Growth Tracker"><MscGlobalTunaGrowthTracker /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscEuropeCountryPenetration"><MscEuropeCountryPenetration /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscSpeciesCoverageHeatmap"><MscSpeciesCoverageHeatmap /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscGearTypeTrends"><MscGearTypeTrends /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscCertificationPipeline"><MscCertificationPipeline /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscStockScorecard"><MscStockScorecard /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscOpenConditions"><MscOpenConditions /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscFaoAreaPenetration"><MscFaoAreaPenetration /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ 유럽 마켓 ═══════ */}
        {activeSection === 'market' && (
          <section>
            <SectionHeader color="#10b981" emoji="🇪🇺" title="유럽 마켓 딥다이브 (B2C 핵심)" desc="국가별 소매 가격 비교, PB vs NB 침투 매트릭스, 소비 구조, 유통 채널별 MSC 침투율" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscEuropeRetailPrices"><MscEuropeRetailPrices /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscPbNbMatrix"><MscPbNbMatrix /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscConsumptionStructure"><MscConsumptionStructure /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscRetailChannelPenetration"><MscRetailChannelPenetration /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscBrandSourcingScorecard"><MscBrandSourcingScorecard /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ 소비자 ═══════ */}
        {activeSection === 'consumer' && (
          <section>
            <SectionHeader color="#a78bfa" emoji="👤" title="소비자 행동 & 세그먼트 분석" desc="UK 쇼퍼 행동 변화, 세대×소득별 수용도, 에코라벨 경쟁, 리테일러별 MSC 전환" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscConsumerInsightsRadar"><MscConsumerInsightsRadar /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscUkShopperTrends"><MscUkShopperTrends /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscDemographicAcceptance"><MscDemographicAcceptance /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscEcolabelCompetition"><MscEcolabelCompetition /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscRetailerSkuMonitor"><MscRetailerSkuMonitor /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscEcolabelRegistryScale"><MscEcolabelRegistryScale /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ NEW: 시장 규모 ═══════ */}
        {activeSection === 'marketsize' && (
          <section>
            <SectionHeader color="#f59e0b" emoji="📊" title="글로벌 시장 규모 & 성장 사례" desc="카테고리별 MSC 참치 시장, 소비자 WTP 분석, 캐나다 582% 성장 사례" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscMarketCategorySize"><MscMarketCategorySize /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscConsumerAwareness"><MscConsumerAwareness /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscProductVolumeGrowth"><MscProductVolumeGrowth /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscProductCountByCountry"><MscProductCountByCountry /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscCanadaGrowthCase"><MscCanadaGrowthCase /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ 리스크 ═══════ */}
        {activeSection === 'risk' && (
          <section>
            <SectionHeader color="#ef4444" emoji="⚠️" title="리스크 & 규제 시나리오" desc="자원 건전성 게이지, RFMO별 정합성, 인증 정지 사례, 남/북유럽 비교" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscTunaStockHealthGauge"><MscTunaStockHealthGauge /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscRfmoAlignment"><MscRfmoAlignment /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscSuspensionHistory"><MscSuspensionHistory /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscSouthVsNorthEurope"><MscSouthVsNorthEurope /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscImprovementsDelivered"><MscImprovementsDelivered /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ NEW: 전망 & 한국 ═══════ */}
        {activeSection === 'outlook' && (
          <section>
            <SectionHeader color="#f472b6" emoji="🔮" title="전망 & 한국 포지셔닝" desc="수확전략 로드맵 · MSC 표준 v3.0 개정 · 한국 원양참치 MSC 갭 분석" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="MscHarvestStrategyTimeline"><MscHarvestStrategyTimeline /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="MscKoreaPositioning"><MscKoreaPositioning /></ErrorBoundary>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
