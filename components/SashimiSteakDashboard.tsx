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
} from 'lucide-react';
import TelemetryBadge from './TelemetryBadge';
import ErrorBoundary from './ErrorBoundary';

/* ─── New Sashimi/Steak Widgets — dynamic imports ─── */
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

/* ================================================================
   Section Configuration
================================================================ */
const SECTIONS = [
  { id: 'global', label: '글로벌 마켓', icon: Globe, color: '#38bdf8', desc: '세계 3대 시장 역학 · 성장 동력 · 축양 생산기지' },
  { id: 'us', label: '미국 시장', icon: TrendingUp, color: '#10b981', desc: '초고속 성장 · 공급망 분리 · 일산화탄소 처리 이슈' },
  { id: 'eu', label: '유럽 시장', icon: Anchor, color: '#a78bfa', desc: '생산 허브 · 라이브 매입/축양 수익성 · 지중해 쿼터' },
  { id: 'price', label: '가격 모델링', icon: DollarSign, color: '#f59e0b', desc: '품질별 사다리 · 쾌락적(Hedonic) 프리미엄 모델' },
  { id: 'risk', label: '리스크/규제', icon: AlertTriangle, color: '#ef4444', desc: '미국/EU 쿼터 압박 · 추적성(Traceability) 리스크' },
];

/* ================================================================
   Main Component
================================================================ */
export default function SashimiSteakDashboard() {
  const [activeSection, setActiveSection] = useState('global');

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'var(--bg-color)' }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <ShieldCheck size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                사시미/스테이크 시장 분석
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                미국 성장 동력, EU 축양 수익성, 그리고 일본의 쇠퇴 — 차세대 프리미엄 참치 전략
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
            <span style={{ color: 'var(--text-primary)', fontSize: '0.78rem' }}>UN Comtrade · Eurostat · ICCAT · NOAA</span>
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
            사시미/스테이크 전략 네비게이터 — 아래 섹션을 클릭하여 탐색하세요
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

        {/* ═══════ Section 1: 글로벌 마켓 트라이어드 ═══════ */}
        {activeSection === 'global' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#38bdf8', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🌍 글로벌 마켓 트라이어드
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  세계 3대 사시미 시장의 구조적 역학 관계
                </p>
              </div>
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <ErrorBoundary fallbackTitle="SasTriadDynamics">
                <SasTriadDynamics />
              </ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasMarketKPIs">
                <SasMarketKPIs />
              </ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ Section 2: 미국 시장 딥다이브 ═══════ */}
        {activeSection === 'us' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#10b981', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🇺🇸 미국 시장 딥다이브
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  세계 1위 소비 시장의 양극화 구조 및 포케 열풍
                </p>
              </div>
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <ErrorBoundary fallbackTitle="SasSupplyChainSplit">
                <SasSupplyChainSplit />
              </ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasCoTreatmentImpact">
                <SasCoTreatmentImpact />
              </ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasHawaiiDomesticNiche">
                <SasHawaiiDomesticNiche />
              </ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ Section 3: 유럽 시장 허브 ═══════ */}
        {activeSection === 'eu' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#a78bfa', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🇪🇺 유럽 시장 - 참다랑어 생산 허브
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  일본 수출 중심의 지중해 블루핀 축양 산업
                </p>
              </div>
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <ErrorBoundary fallbackTitle="SasBluefinRanchingEconomics">
                <SasBluefinRanchingEconomics />
              </ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasEuQuotaProduction">
                <SasEuQuotaProduction />
              </ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasDomesticRetailTrend">
                <SasDomesticRetailTrend />
              </ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ Section 4: 가격 및 품질 모델링 ═══════ */}
        {activeSection === 'price' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#f59e0b', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  💰 가격 및 품질 모델링
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  어종, 신선도, 처리 방식에 따른 프리미엄 결정 요인
                </p>
              </div>
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <ErrorBoundary fallbackTitle="SasSashimiPriceLadder">
                <SasSashimiPriceLadder />
              </ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasHedonicPriceFactors">
                <SasHedonicPriceFactors />
              </ErrorBoundary>
            </div>
          </section>
        )}

        {/* ═══════ Section 5: 리스크 및 규제 ═══════ */}
        {activeSection === 'risk' && (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: '#ef4444', borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ⚠️ 지속가능성 및 규제
                </h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  쿼터 압박과 어법별 리스크, 추적성 의무화
                </p>
              </div>
            </div>

            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              <ErrorBoundary fallbackTitle="SasQuotaVolatility">
                <SasQuotaVolatility />
              </ErrorBoundary>
              <ErrorBoundary fallbackTitle="SasTraceabilityRatings">
                <SasTraceabilityRatings />
              </ErrorBoundary>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
