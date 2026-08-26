"use client";

import React, { useState } from 'react';
import { Fish } from 'lucide-react';
import OctopusFTAQuarterly from './OctopusFTAQuarterly';
import OctopusDomesticCliff from './OctopusDomesticCliff';
import {
  OctopusChannelMarginMatrix, OctopusColdChainYield, OctopusPriceTransmission, OctopusCephalopodElasticity,
  OctopusAquacultureRace, OctopusTacCountdown, OctopusFtaTariffMatrix, OctopusSstCorrelation,
} from './OctopusPhase2Widgets';

// 이 페이지의 위젯은 전부 정적 데이터를 내장한 전용 컴포넌트(아래 EXTRA_BY_PILLAR)로 구성된다.
// 과거 존재하지 않는 /api/octopus-intelligence를 fetch해 '총 0개 위젯' 거짓 카운트를
// 노출하던 죽은 fetch·KPI·renderChart 경로는 전면 제거 (2026-06-11 전수 검토 P0 #21).
const EXTRA_BY_PILLAR: Record<string, React.FC[]> = {
  S1: [OctopusDomesticCliff, OctopusSstCorrelation],
  S2: [OctopusChannelMarginMatrix, OctopusColdChainYield],
  S3: [OctopusFTAQuarterly, OctopusFtaTariffMatrix],
  S4: [OctopusPriceTransmission, OctopusCephalopodElasticity],
  S5: [OctopusAquacultureRace, OctopusTacCountdown],
};

// 패턴 I: 헤더·필러 카운트는 실제 렌더 대상에서 동적 산출 (하드코딩 금지)
const TOTAL_WIDGET_COUNT = Object.values(EXTRA_BY_PILLAR).reduce((n, arr) => n + arr.length, 0);

/* ─── 5-Part Section Definitions ─── */
// 5-Pillar 네비게이터 메타 (낙지 시그니처 — 두족류 공용 purple→pink 대신 indigo→violet 차별화 톤)
const SECTIONS = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '🐙 Part I - 원료 수급', desc: '글로벌 낙지 어획량 추이 및 주요 산지 공급 현황', color: '#4f46e5' },
  { id: 'S2', num: '❷', label: '가공·생산', title: '🐙 Part II - 가공 및 생산', desc: '국내 낙지 자원 절벽 및 연안 자원량 회복 지표', color: '#6366f1' },
  { id: 'S3', num: '❸', label: '물류·통관', title: '🐙 Part III - 물류 및 통관', desc: 'FTA 수입 동향 및 분기별 통관 단가 변화', color: '#8b5cf6' },
  { id: 'S4', num: '❹', label: '판매·수요', title: '🐙 Part IV - 판매 및 수요', desc: '산낙지 외식 수요 및 유통 채널별 단가 탄력성', color: '#a78bfa' },
  { id: 'S5', num: '❺', label: 'ESG·지속가능성', title: '🐙 Part V - ESG 및 지속가능성', desc: '자원관리 TAC 규제 및 지속가능 어업 인증 지표', color: '#c4b5fd' }
];

export default function OctopusDashboard() {
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif", backgroundColor: 'transparent' }}>
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'var(--color-success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Fish size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                낙지 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>낙지 커맨드 센터 - 총 {TOTAL_WIDGET_COUNT}개 위젯 · 5단계 밸류체인</p>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px',
          borderBottom: '1px solid rgba(140,170,255,0.10)',
          marginBottom: '6px',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            밸류체인 네비게이터 - 아래 단계를 클릭하여 탐색하세요
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
                  background: isActive ? s.color : 'rgba(140,170,255,0.12)',
                  color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)',
                  fontSize: '0.75rem', fontWeight: 800,
                  transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>
                  {idx + 1}
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
                    color: 'rgba(var(--w-slate-400-rgb), 0.7)',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    marginTop: '2px',
                    padding: '0 4px',
                  }}>
                    {s.desc.slice(0, 24)}…
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 활성 Pillar 위젯 그리드 (activePart 필터링) ═══ */}
      {(() => {
        const sec = SECTIONS.find(s => s.id === activePart)!;
        const pillarComponents = EXTRA_BY_PILLAR[activePart] || [];
        return (
          <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '4px', height: '28px', background: sec.color, borderRadius: '2px' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sec.title}</h2>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sec.desc}</p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: sec.color, background: `${sec.color}15`, padding: '3px 10px', borderRadius: '500px', fontWeight: 600 }}>
                {pillarComponents.length} 위젯
              </span>
            </div>
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {pillarComponents.length === 0
                ? <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>이 단계에 위젯이 없습니다</div>
                : pillarComponents.map((Comp, i) => <Comp key={`extra-${activePart}-${i}`} />)}
            </div>
          </section>
        );
      })()}

    </div>
  );
}
