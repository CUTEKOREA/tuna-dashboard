"use client";
import React, { useState } from 'react';
import { Building2, TrendingUp, TrendingDown, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/salmon_policy_impact.json';

const ICONS: Record<string, any> = { AlertTriangle, CheckCircle, Building2, TrendingDown };
const SCENARIOS: any[] = rawData.scenarios;

export default function SalmonPolicyImpact() {
  const [selectedScenario, setSelectedScenario] = useState<string>('chile_tariff');
  const scenario = SCENARIOS.find((s: any) => s.id === selectedScenario) || SCENARIOS[0];

  const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
    low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: '저영향' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '중영향' },
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: '고영향' },
  };

  const body = (
    <div style={{ padding: '0 0 0.5rem 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {SCENARIOS.map((s: any) => {
          const sCfg = severityConfig[s.severity];
          const IconComp = ICONS[s.iconName] || AlertTriangle;
          return (
            <button key={s.id} onClick={() => setSelectedScenario(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 0.9rem', borderRadius: '6px', textAlign: 'left',
              cursor: 'pointer', transition: 'all 0.2s',
              background: selectedScenario === s.id ? sCfg.bg : 'rgba(255,255,255,0.02)',
              border: selectedScenario === s.id ? `1px solid ${sCfg.color}40` : '1px solid rgba(140,170,255,0.12)',
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

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: '착지원가', ...scenario.impacts.landedCost },
          { label: '수입물량', ...scenario.impacts.importVolume },
          { label: '소매가격', ...scenario.impacts.retailPrice },
        ].map((m: any, i: number) => (
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

      <div style={{
        background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
        borderRadius: '8px', padding: '1rem',
      }}>
        <h4 style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={14} /> 종합 분석
        </h4>
        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 0.5rem 0' }}>{scenario.analysis}</p>
        <div style={{ fontSize: '0.6rem', color: '#475569', fontStyle: 'italic' }}>
          📚 {scenario.researchBasis}
        </div>
        <div style={{ fontSize: '0.58rem', color: '#475569', marginTop: '0.35rem' }}>
          ※ 임팩트 수치(착지원가·물량·소매가 %, 탄력성·단가 등)는 자체 추정 시나리오 가정치(illustrative)이며 노출된 계량 모델 산출값이 아님.
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="정책 임팩트 시뮬레이터"
      icon={Building2}
      iconColor="#f59e0b"
      pillar="S3"
      cardDesc="FTA·SIMP·제재 정책 변화 4종 시나리오별 착지원가·물량·소매가 임팩트 (자체 추정 what-if 시나리오, illustrative — 노출된 산출 모델 없음)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      customBody={body}
      takeaway={{
        situation: `<div>
<p>"정책 충격 시나리오 시뮬레이션" — 글로벌 정책 이벤트가 한국 연어 시장에 미칠 방향성을 가늠하는 <strong>자체 추정 what-if 시나리오(illustrative)</strong>입니다. 아래 임팩트 수치는 노출된 계량 모델 산출값이 아닌 시나리오 가정치이므로 의사결정 보조 참고용입니다.</p>
<p>선택 시나리오 <strong>"${scenario.title}"</strong> 기준:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li>착지원가 <strong>${scenario.impacts.landedCost.pct > 0 ? '+' : ''}${scenario.impacts.landedCost.pct}%</strong></li>
<li>수입물량 <strong>${scenario.impacts.importVolume.pct > 0 ? '+' : ''}${scenario.impacts.importVolume.pct}%</strong></li>
<li>소매가 <strong>${scenario.impacts.retailPrice.pct > 0 ? '+' : ''}${scenario.impacts.retailPrice.pct}%</strong></li>
</ul>
<p>${scenario.analysis}</p>
</div>`,
        actionPlan: `<div><p><strong>재정의</strong>: 정책 시나리오는 단순 macro 정보가 아닌 <strong>"본업 P&amp;L의 systematic stress test"</strong>.</p><p>${scenario.tak}</p></div>`,
        source: '배경 참고문헌(정성): 박혜진(2022) 수입수산물 대체관계 · 박혜진(2023) 전략품목 관리 · 박혜진(2025) SIMP 대응실태 · KMI(2026) 동북아 교역구조 / 임팩트 수치는 자체 추정 시나리오 가정치(illustrative)이며 해당 문헌의 1차 산출값이 아님',
      }}
    />
  );
}
