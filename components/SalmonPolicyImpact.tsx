// @ts-nocheck
"use client";
import React, { useState } from 'react';
import { Building2, TrendingUp, TrendingDown, ArrowRight, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

// ============================================================================
// Module E: 정책 임팩트 시뮬레이터
// 근거: 「수입수산물 전략품목 관리 방안」(박혜진, 2023)
//       「수산물 물가 안정화 방안」(박혜진, 2025)
//       「수입수산물과 국산 간 대체관계 분석」(박혜진, 2022)
// ============================================================================

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: any;
  severity: 'low' | 'medium' | 'high';
  impacts: {
    landedCost: { pct: number; direction: 'up' | 'down' };
    importVolume: { pct: number; direction: 'up' | 'down' };
    retailPrice: { pct: number; direction: 'up' | 'down' };
    supplyStability: string;
  };
  analysis: string;
  researchBasis: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'chile_tariff',
    title: '칠레 FTA 관세 인상 (0% → 10%)',
    description: '한-칠레 FTA 재협상으로 냉동연어 양허세율이 원복될 경우',
    icon: AlertTriangle,
    severity: 'high',
    impacts: {
      landedCost: { pct: 8.5, direction: 'up' },
      importVolume: { pct: -15, direction: 'down' },
      retailPrice: { pct: 6.2, direction: 'up' },
      supplyStability: '⚠️ 불안정 — 노르웨이 대체 수입 급증 예상',
    },
    analysis: '칠레산 냉동연어는 한국 수입의 24%를 차지. 관세 원복 시 착지원가 ₩1,200/kg 상승 추정. 노르웨이 신선으로 대체되나 단가가 63% 높아 전체 수입 비용 증가 불가피.',
    researchBasis: '「수입수산물과 국산 간의 대체관계 분석」(박혜진, 2022) — 가격 탄력성 -0.85',
  },
  {
    id: 'norway_license',
    title: '노르웨이 양식면허 추가 발급 (+5%)',
    description: '노르웨이 정부가 양식면허를 5% 추가 발급하여 공급량 증가',
    icon: CheckCircle,
    severity: 'low',
    impacts: {
      landedCost: { pct: -4.2, direction: 'down' },
      importVolume: { pct: 8, direction: 'up' },
      retailPrice: { pct: -3.5, direction: 'down' },
      supplyStability: '🟢 안정 — 공급 증가로 가격 하방 압력',
    },
    analysis: '노르웨이 양식면허는 희소 자산(개당 ₩200억+). 추가 발급 시 글로벌 공급량 약 15만MT 증가 예상. NASDAQ Salmon Index 하락으로 한국 수입단가 개선.',
    researchBasis: '「수산물 공급 안정을 위한 수입수산물 전략품목 관리 방안」(박혜진, 2023)',
  },
  {
    id: 'simp_expansion',
    title: '미국 SIMP 대상 확대 (연어 포함)',
    description: 'NOAA가 대서양연어를 SIMP 의무 이력추적 대상에 추가',
    icon: Building2,
    severity: 'medium',
    impacts: {
      landedCost: { pct: 2.1, direction: 'up' },
      importVolume: { pct: -3, direction: 'down' },
      retailPrice: { pct: 1.5, direction: 'up' },
      supplyStability: '🟡 단기 혼란 — 인증 비용 전가 예상',
    },
    analysis: 'SIMP 인증 비용 kg당 $0.15~0.25 추가. 소규모 수출업체 퇴출로 공급처 집중화 심화 우려. 다만 한국 직접 영향은 미미 (대미 수출 비중 낮음).',
    researchBasis: '「미국 이력 추적 의무화에 따른 수산물 수출기업 대응실태 분석」(박혜진, 2025)',
  },
  {
    id: 'russia_sanction_lift',
    title: '러시아산 연어 제재 해제',
    description: '서방 제재 완화로 러시아산 태평양연어 직접 수입 재개',
    icon: TrendingDown,
    severity: 'medium',
    impacts: {
      landedCost: { pct: -12, direction: 'down' },
      importVolume: { pct: 20, direction: 'up' },
      retailPrice: { pct: -8, direction: 'down' },
      supplyStability: '🟢 개선 — 수입원 다변화 효과',
    },
    analysis: '러시아 태평양연어(Pink/Chum) FOB $3.5/kg로 칠레($5.8)·노르웨이($9.5) 대비 최저가. 다만 ESG 리스크(강제노동, IUU)와 품질 균일성 문제 잔존.',
    researchBasis: '「동북아 수산물 교역 여건 변화와 수산물 무역시장의 구조적 함의」(KMI, 2026)',
  },
];

export default function SalmonPolicyImpact() {
  const [selectedScenario, setSelectedScenario] = useState<string>('chile_tariff');
  const scenario = SCENARIOS.find(s => s.id === selectedScenario) || SCENARIOS[0];

  const severityConfig = {
    low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: '저영향' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '중영향' },
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: '고영향' },
  };

  const cfg = severityConfig[scenario.severity];

  return (
    <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "480px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1.5rem"}} >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        background: 'linear-gradient(90deg, rgba(245,158,11,0.1), rgba(239,68,68,0.05))',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} color="#f59e0b" />
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>정책 임팩트 시뮬레이터</span>
          <span style={{ fontSize: '0.65rem', color: '#64748b', background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>Module E</span>
        </div>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Scenario Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {SCENARIOS.map(s => {
            const sCfg = severityConfig[s.severity];
            const IconComp = s.icon;
            return (
              <button key={s.id} onClick={() => setSelectedScenario(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.9rem', borderRadius: '6px', textAlign: 'left',
                cursor: 'pointer', transition: 'all 0.2s',
                background: selectedScenario === s.id ? sCfg.bg : 'rgba(255,255,255,0.02)',
                border: selectedScenario === s.id ? `1px solid ${sCfg.color}40` : '1px solid rgba(255,255,255,0.06)',
                color: '#f8fafc',
              }}>
                <IconComp size={16} color={sCfg.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{s.description}</div>
                </div>
                <span style={{
                  fontSize: '0.6rem', padding: '2px 6px', borderRadius: '3px',
                  background: sCfg.bg, color: sCfg.color, fontWeight: 600,
                }}>{sCfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Impact Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            { label: '착지원가', ...scenario.impacts.landedCost },
            { label: '수입물량', ...scenario.impacts.importVolume },
            { label: '소매가격', ...scenario.impacts.retailPrice },
          ].map((m, i) => (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.8rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.4rem' }}>{m.label}</div>
              <div style={{
                fontSize: '1.4rem', fontWeight: 800,
                color: m.direction === 'up' ? '#ef4444' : '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}>
                {m.direction === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {m.pct > 0 ? '+' : ''}{m.pct}%
              </div>
            </div>
          ))}
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.8rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.4rem' }}>공급 안정성</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
              {scenario.impacts.supplyStability}
            </div>
          </div>
        </div>

        {/* Analysis */}
        <div style={{
          background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: '8px', padding: '1rem',
        }}>
          <h4 style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> AI 종합 분석
          </h4>
          <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 0.5rem 0' }}>{scenario.analysis}</p>
          <div style={{ fontSize: '0.6rem', color: '#475569', fontStyle: 'italic' }}>
            📚 {scenario.researchBasis}
          </div>
        </div>
      </div>
    </div>
  );
}
