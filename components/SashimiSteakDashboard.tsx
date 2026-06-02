'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ShieldCheck,
  Globe,
  TrendingUp,
  Anchor,
  DollarSign,
  AlertTriangle,
  Flag,
  Target,
  Factory,
  Compass,
} from 'lucide-react';
import TelemetryBadge from './TelemetryBadge';
import ErrorBoundary from './ErrorBoundary';

/* ─── Existing Sashimi Widgets ─── */
const SasTriadDynamics = dynamic(() => import('./sashimi-strategy/SasTriadDynamics'), { ssr: false });
const SasMarketKPIs = dynamic(() => import('./sashimi-strategy/SasMarketKPIs'), { ssr: false });
const SasSupplyChainSplit = dynamic(() => import('./sashimi-strategy/SasSupplyChainSplit'), { ssr: false });
const SasCoTreatmentImpact = dynamic(() => import('./sashimi-strategy/SasCoTreatmentImpact'), { ssr: false });
const SasHawaiiDomesticNiche = dynamic(() => import('./sashimi-strategy/SasHawaiiDomesticNiche'), { ssr: false });
const SasBluefinRanchingEconomics = dynamic(() => import('./sashimi-strategy/SasBluefinRanchingEconomics'), { ssr: false });
const SasEuQuotaProduction = dynamic(() => import('./sashimi-strategy/SasEuQuotaProduction'), { ssr: false });
const SasDomesticRetailTrend = dynamic(() => import('./sashimi-strategy/SasDomesticRetailTrend'), { ssr: false });
const SasSashimiPriceLadder = dynamic(() => import('./sashimi-strategy/SasSashimiPriceLadder'), { ssr: false });
const SasHedonicPriceFactors = dynamic(() => import('./sashimi-strategy/SasHedonicPriceFactors'), { ssr: false });
const SasQuotaVolatility = dynamic(() => import('./sashimi-strategy/SasQuotaVolatility'), { ssr: false });
const SasTraceabilityRatings = dynamic(() => import('./sashimi-strategy/SasTraceabilityRatings'), { ssr: false });

/* ─── NEW Sashimi Widgets ─── */
const SasKoreaProductionStructure = dynamic(() => import('./sashimi-strategy/SasKoreaProductionStructure'), { ssr: false });
const SasKoreaJapanDependency = dynamic(() => import('./sashimi-strategy/SasKoreaJapanDependency'), { ssr: false });
const SasKoreaMajorCompanies = dynamic(() => import('./sashimi-strategy/SasKoreaMajorCompanies'), { ssr: false });
const SasKoreaFoodserviceD2C = dynamic(() => import('./sashimi-strategy/SasKoreaFoodserviceD2C'), { ssr: false });
const SasKoreaMedBftImports = dynamic(() => import('./sashimi-strategy/SasKoreaMedBftImports'), { ssr: false });
const SasFourCountryComparison = dynamic(() => import('./sashimi-strategy/SasFourCountryComparison'), { ssr: false });
const SasJapanDemandDecline = dynamic(() => import('./sashimi-strategy/SasJapanDemandDecline'), { ssr: false });
const SasKoreaTradeDecade = dynamic(() => import('./sashimi-strategy/SasKoreaTradeDecade'), { ssr: false });
const SasGlobalHotspots = dynamic(() => import('./sashimi-strategy/SasGlobalHotspots'), { ssr: false });
const SasSpeciesPriceTier = dynamic(() => import('./sashimi-strategy/SasSpeciesPriceTier'), { ssr: false });
const SasExportPartnerStrategy = dynamic(() => import('./sashimi-strategy/SasExportPartnerStrategy'), { ssr: false });
const SasExportChecklist = dynamic(() => import('./sashimi-strategy/SasExportChecklist'), { ssr: false });

/* ─── Round 3: Thailand, UK, Toyosu, Outlook ─── */
const SasThailandHub = dynamic(() => import('./sashimi-strategy/SasThailandHub'), { ssr: false });
const SasUkMarket = dynamic(() => import('./sashimi-strategy/SasUkMarket'), { ssr: false });
const SasToyosuAuction = dynamic(() => import('./sashimi-strategy/SasToyosuAuction'), { ssr: false });
const SasGlobalOutlook2030 = dynamic(() => import('./sashimi-strategy/SasGlobalOutlook2030'), { ssr: false });

/* ─── NEW: agri_data dossier(US/EU KPI) 교차분석 기반 4개 위젯 ─── */
const SasUsSupplierOrigin = dynamic(() => import('./sashimi-strategy/SasUsSupplierOrigin'), { ssr: false });
const SasUsSushiPokeMarket = dynamic(() => import('./sashimi-strategy/SasUsSushiPokeMarket'), { ssr: false });
const SasEuFreshVsCanned = dynamic(() => import('./sashimi-strategy/SasEuFreshVsCanned'), { ssr: false });
const SasEuImportSegmentation = dynamic(() => import('./sashimi-strategy/SasEuImportSegmentation'), { ssr: false });

/* ─── NEW: 미국 카테고리 보강 5개 (규제·관세·마진·경쟁·수요) ─── */
const SasUsImportBarriers = dynamic(() => import('./sashimi-strategy/SasUsImportBarriers'), { ssr: false });
const SasUsTariffLadder = dynamic(() => import('./sashimi-strategy/SasUsTariffLadder'), { ssr: false });
const SasUsMarginWaterfall = dynamic(() => import('./sashimi-strategy/SasUsMarginWaterfall'), { ssr: false });
const SasUsCompetitorMap = dynamic(() => import('./sashimi-strategy/SasUsCompetitorMap'), { ssr: false });
const SasUsDemandSeasonality = dynamic(() => import('./sashimi-strategy/SasUsDemandSeasonality'), { ssr: false });

/* ─── NEW: 영국/태국 카테고리 보강 5개 (공급국·채널·원료·ESG·한국연결) ─── */
const SasUkSupplierTariff = dynamic(() => import('./sashimi-strategy/SasUkSupplierTariff'), { ssr: false });
const SasUkChannelSplit = dynamic(() => import('./sashimi-strategy/SasUkChannelSplit'), { ssr: false });
const SasThaiSourcing = dynamic(() => import('./sashimi-strategy/SasThaiSourcing'), { ssr: false });
const SasThaiEsgRisk = dynamic(() => import('./sashimi-strategy/SasThaiEsgRisk'), { ssr: false });
const SasKrDualRoute = dynamic(() => import('./sashimi-strategy/SasKrDualRoute'), { ssr: false });

/* ─── NEW: 유럽 카테고리 보강 8개 (규제·관세·브랜드·가공·MSC·원양선단·완전양식·인플레) ─── */
const SasEuCatchGate = dynamic(() => import('./sashimi-strategy/SasEuCatchGate'), { ssr: false });
const SasEuTariffRegime = dynamic(() => import('./sashimi-strategy/SasEuTariffRegime'), { ssr: false });
const SasEuBrandMap = dynamic(() => import('./sashimi-strategy/SasEuBrandMap'), { ssr: false });
const SasEuProcessingHub = dynamic(() => import('./sashimi-strategy/SasEuProcessingHub'), { ssr: false });
const SasEuMscGate = dynamic(() => import('./sashimi-strategy/SasEuMscGate'), { ssr: false });
const SasEuDistantFleet = dynamic(() => import('./sashimi-strategy/SasEuDistantFleet'), { ssr: false });
const SasEuClosedCycle = dynamic(() => import('./sashimi-strategy/SasEuClosedCycle'), { ssr: false });
const SasEuRetailInflation = dynamic(() => import('./sashimi-strategy/SasEuRetailInflation'), { ssr: false });

/* ─── NEW: 6개 섹션 보강 15개 (한국3·글로벌3·일본3·가격2·수출2·전망2) ─── */
const SasKrFleetEconomics = dynamic(() => import('./sashimi-strategy/SasKrFleetEconomics'), { ssr: false });
const SasKrAccessQuota = dynamic(() => import('./sashimi-strategy/SasKrAccessQuota'), { ssr: false });
const SasKrByproduct = dynamic(() => import('./sashimi-strategy/SasKrByproduct'), { ssr: false });
const SasGlWcpoSupply = dynamic(() => import('./sashimi-strategy/SasGlWcpoSupply'), { ssr: false });
const SasGlChinaDemand = dynamic(() => import('./sashimi-strategy/SasGlChinaDemand'), { ssr: false });
const SasGlTradeFlows = dynamic(() => import('./sashimi-strategy/SasGlTradeFlows'), { ssr: false });
const SasJpAquaculture = dynamic(() => import('./sashimi-strategy/SasJpAquaculture'), { ssr: false });
const SasJpImportYen = dynamic(() => import('./sashimi-strategy/SasJpImportYen'), { ssr: false });
const SasJpDistribution = dynamic(() => import('./sashimi-strategy/SasJpDistribution'), { ssr: false });
const SasPrGradeSystem = dynamic(() => import('./sashimi-strategy/SasPrGradeSystem'), { ssr: false });
const SasPrAuctionDirect = dynamic(() => import('./sashimi-strategy/SasPrAuctionDirect'), { ssr: false });
const SasExColdLogistics = dynamic(() => import('./sashimi-strategy/SasExColdLogistics'), { ssr: false });
const SasExEmergingMena = dynamic(() => import('./sashimi-strategy/SasExEmergingMena'), { ssr: false });
const SasOlClimateMigration = dynamic(() => import('./sashimi-strategy/SasOlClimateMigration'), { ssr: false });
const SasOlCellBased = dynamic(() => import('./sashimi-strategy/SasOlCellBased'), { ssr: false });

/* ─── NEW: 동원산업 슈퍼튜나 + 어종별 등급 결정요인 ─── */
const SasKrSuperTuna = dynamic(() => import('./sashimi-strategy/SasKrSuperTuna'), { ssr: false });
const SasPrGradeBySpecies = dynamic(() => import('./sashimi-strategy/SasPrGradeBySpecies'), { ssr: false });
const SasGlConsumptionMatrix = dynamic(() => import('./sashimi-strategy/SasGlConsumptionMatrix'), { ssr: false });

/* ================================================================ */
const SECTIONS = [
  { id: 'korea', label: '🇰🇷 한국', icon: Flag, color: '#f59e0b', desc: '원양 생산·일본 의존·7대 기업·외식D2C·지중해 BFT' },
  { id: 'global', label: '글로벌', icon: Globe, color: '#38bdf8', desc: '3대 시장 역학 · 4개국 비교 · 핫스팟' },
  { id: 'us', label: '🇺🇸 미국', icon: TrendingUp, color: '#10b981', desc: '공급망 분리 · 공급국 출처 · 스시/포케 시장 · CO처리' },
  { id: 'ukth', label: '🇬🇧🇹🇭 영국/태국', icon: Factory, color: '#22d3ee', desc: 'FTA 18%→0% · 태국 28.2% 가공허브' },
  { id: 'eu', label: '🇪🇺 유럽', icon: Anchor, color: '#a78bfa', desc: '축양 수익성 · 지중해 쿼터 · 신선vs통조림 · 수입 세분' },
  { id: 'japan', label: '🇯🇵 일본', icon: DollarSign, color: '#ef4444', desc: '도요스 경매 · 수요 감소 · $1.94B' },
  { id: 'price', label: '가격/어종', icon: DollarSign, color: '#f59e0b', desc: '어종별 위계 · Hedonic 모델' },
  { id: 'export', label: '수출 전략', icon: Target, color: '#f472b6', desc: '57개사 파트너 · 체크리스트' },
  { id: 'outlook', label: '전망 2030', icon: Compass, color: '#10b981', desc: '$60B · 중동 7.6% · 기후 리스크' },
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

export default function SashimiSteakDashboard() {
  const [activeSection, setActiveSection] = useState('korea');

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', flexShrink: 0,
            }}>
              <ShieldCheck size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                사시미/스테이크 시장 분석
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                한국·미국·EU·영국·태국·일본·중동·중국 — 9개 섹션 · 68개 위젯
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
            <span style={{ color: 'var(--text-primary)', fontSize: '0.78rem' }}>Comtrade · DART · GLOBEFISH · NOAA · ICCAT</span>
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
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            사시미/스테이크 전략 네비게이터 — 9개 섹션을 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '4px' }}>
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
                  background: isActive ? s.color : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#0f172a' : 'rgba(148,163,184,0.6)',
                  fontSize: '0.75rem', fontWeight: 800, transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>
                  <SectionIcon size={14} />
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s', whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
                {isActive && (
                  <span style={{
                    fontSize: '0.55rem', color: 'rgba(148,163,184,0.7)', textAlign: 'center',
                    lineHeight: 1.3, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any,
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

        {/* ═══ 🇰🇷 한국 시장 ═══ */}
        {activeSection === 'korea' && (
          <section>
            <SectionHeader color="#f59e0b" emoji="🇰🇷" title="한국 시장 — 원양 강국의 사시미 생태계" desc="세계 6위 생산국, 일본 의존 80%, 7대 기업, 외식 양극화, 지중해 BFT 수입" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasKoreaProductionStructure"><SasKoreaProductionStructure /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasKoreaJapanDependency"><SasKoreaJapanDependency /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasKoreaMajorCompanies"><SasKoreaMajorCompanies /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasKoreaFoodserviceD2C"><SasKoreaFoodserviceD2C /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasKoreaMedBftImports"><SasKoreaMedBftImports /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasKoreaTradeDecade"><SasKoreaTradeDecade /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasKrFleetEconomics"><SasKrFleetEconomics /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasKrAccessQuota"><SasKrAccessQuota /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasKrByproduct"><SasKrByproduct /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasKrSuperTuna"><SasKrSuperTuna /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══ 글로벌 마켓 ═══ */}
        {activeSection === 'global' && (
          <section>
            <SectionHeader color="#38bdf8" emoji="🌍" title="글로벌 마켓 & 4개국 비교" desc="세계 3대 사시미 시장의 구조적 역학 + US/EU/KR/JP 비교" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasTriadDynamics"><SasTriadDynamics /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasFourCountryComparison"><SasFourCountryComparison /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasMarketKPIs"><SasMarketKPIs /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasGlobalHotspots"><SasGlobalHotspots /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasGlWcpoSupply"><SasGlWcpoSupply /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasGlChinaDemand"><SasGlChinaDemand /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasGlTradeFlows"><SasGlTradeFlows /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasGlConsumptionMatrix"><SasGlConsumptionMatrix /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══ 미국 시장 ═══ */}
        {activeSection === 'us' && (
          <section>
            <SectionHeader color="#10b981" emoji="🇺🇸" title="미국 시장 딥다이브" desc="세계 1위 소비 시장 — 양극화·포케 + 규제 3중관문·2025 관세·유통 마진·경쟁 지도·수요 드라이버" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasSupplyChainSplit"><SasSupplyChainSplit /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasCoTreatmentImpact"><SasCoTreatmentImpact /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasUsSupplierOrigin"><SasUsSupplierOrigin /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasUsSushiPokeMarket"><SasUsSushiPokeMarket /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasHawaiiDomesticNiche"><SasHawaiiDomesticNiche /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasUsImportBarriers"><SasUsImportBarriers /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasUsTariffLadder"><SasUsTariffLadder /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasUsMarginWaterfall"><SasUsMarginWaterfall /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasUsCompetitorMap"><SasUsCompetitorMap /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasUsDemandSeasonality"><SasUsDemandSeasonality /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══ 🇬🇧🇹🇭 영국/태국 ═══ */}
        {activeSection === 'ukth' && (
          <section>
            <SectionHeader color="#22d3ee" emoji="🇬🇧🇹🇭" title="영국 & 태국 — FTA 우위 + 세계 최대 가공 허브" desc="영국 수입 공급국·채널 + 태국 원료조달·ESG + 한국 두 경로(원물 vs 직수출)" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasUkMarket"><SasUkMarket /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasThailandHub"><SasThailandHub /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasUkSupplierTariff"><SasUkSupplierTariff /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasUkChannelSplit"><SasUkChannelSplit /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasThaiSourcing"><SasThaiSourcing /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasThaiEsgRisk"><SasThaiEsgRisk /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasKrDualRoute"><SasKrDualRoute /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══ 유럽 시장 ═══ */}
        {activeSection === 'eu' && (
          <section>
            <SectionHeader color="#a78bfa" emoji="🇪🇺" title="유럽 시장 — 참다랑어 생산 허브 + 규제·관세·가공·자원" desc="지중해 블루핀 축양 + CATCH 규제·관세 우회로·스페인 가공·MSC·IOTC 원양선단·완전양식" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasBluefinRanchingEconomics"><SasBluefinRanchingEconomics /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasEuQuotaProduction"><SasEuQuotaProduction /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasDomesticRetailTrend"><SasDomesticRetailTrend /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasEuFreshVsCanned"><SasEuFreshVsCanned /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasEuImportSegmentation"><SasEuImportSegmentation /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasEuCatchGate"><SasEuCatchGate /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasEuTariffRegime"><SasEuTariffRegime /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasEuProcessingHub"><SasEuProcessingHub /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasEuBrandMap"><SasEuBrandMap /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasEuMscGate"><SasEuMscGate /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasEuDistantFleet"><SasEuDistantFleet /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasEuClosedCycle"><SasEuClosedCycle /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasEuRetailInflation"><SasEuRetailInflation /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══ 🇯🇵 일본 시장 ═══ */}
        {activeSection === 'japan' && (
          <section>
            <SectionHeader color="#ef4444" emoji="🇯🇵" title="일본 시장 — 도요스 경매 & 구조적 수요 감소" desc="세계 최대 사시미 시장의 경매 구조, 장기 수요 감소, 쿼터 압박" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasToyosuAuction"><SasToyosuAuction /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasJapanDemandDecline"><SasJapanDemandDecline /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasQuotaVolatility"><SasQuotaVolatility /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasTraceabilityRatings"><SasTraceabilityRatings /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasJpAquaculture"><SasJpAquaculture /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasJpImportYen"><SasJpImportYen /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasJpDistribution"><SasJpDistribution /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══ 가격/어종 ═══ */}
        {activeSection === 'price' && (
          <section>
            <SectionHeader color="#f59e0b" emoji="💰" title="가격 모델링 & 어종별 위계" desc="5대 참치 어종 가격 사다리, Hedonic 프리미엄, 품질 등급" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasSpeciesPriceTier"><SasSpeciesPriceTier /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasSashimiPriceLadder"><SasSashimiPriceLadder /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasHedonicPriceFactors"><SasHedonicPriceFactors /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasPrGradeSystem"><SasPrGradeSystem /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasPrAuctionDirect"><SasPrAuctionDirect /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasPrGradeBySpecies"><SasPrGradeBySpecies /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══ 수출 전략 ═══ */}
        {activeSection === 'export' && (
          <section>
            <SectionHeader color="#f472b6" emoji="🎯" title="수출 파트너 전략 & 진입요건" desc="미국·영국·일본 — 실명 파트너 57개사 + 시장별 진입 체크리스트" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasExportPartnerStrategy"><SasExportPartnerStrategy /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasExportChecklist"><SasExportChecklist /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasExColdLogistics"><SasExColdLogistics /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasExEmergingMena"><SasExEmergingMena /></ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══ 🔮 전망 2030 ═══ */}
        {activeSection === 'outlook' && (
          <section>
            <SectionHeader color="#10b981" emoji="🔮" title="글로벌 사시미 시장 전망 2030+" desc="$44B→$60B 성장, 중동 CAGR 7.6%, WCPO 기록, 기후변화 리스크" />
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasGlobalOutlook2030"><SasGlobalOutlook2030 /></ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasOlClimateMigration"><SasOlClimateMigration /></ErrorBoundary>
            </div>
            <div data-mobile-stack style={GRID_2}>
              <ErrorBoundary fallbackTitle="SasOlCellBased"><SasOlCellBased /></ErrorBoundary>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
