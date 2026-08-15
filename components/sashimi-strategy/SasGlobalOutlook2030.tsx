'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const forecasts = [
  { segment: '글로벌 참치 시장', value2024: '$44.2B', forecast: '$59.6B', cagr: '3.46%', year: '2034', color: '#38bdf8' },
  { segment: '사시미급 수산물', value2024: '$10.1B', forecast: '$16.2B', cagr: '5.00%', year: '2034', color: '#10b981' },
  { segment: '글로벌 캔 참치', value2024: '$12.5B', forecast: '$19.4B', cagr: '4.50%', year: '2035', color: '#f59e0b' },
  { segment: '냉동 참치 로인', value2024: '$2.03B', forecast: '$3.0B', cagr: '3.60%', year: '2035', color: '#a78bfa' },
];

const wcpoCatch = [
  { species: '가다랑어', volume: '2,108K', pct: 70, color: '#38bdf8', trend: '최고 기록' },
  { species: '황다랑어', volume: '678K', pct: 22, color: '#10b981', trend: '안정' },
  { species: '눈다랑어', volume: '119K', pct: 4, color: '#a78bfa', trend: '수십년 최저' },
];

const emergingMarkets = [
  {
    flag: '🌍', name: '중동', cagr: '7.6%', period: '~2031', color: '#ef4444',
    drivers: 'UAE·터키 오프쇼어 양식 확대, 두바이 허브 역할',
  },
  {
    flag: '🇨🇳', name: '중국', cagr: '확대 중', period: '~2035', color: '#f59e0b',
    drivers: 'Thai Union 상하이 진출, 허마(Hema) 매장 스시, HMR 참치 급성장',
  },
  {
    flag: '🌏', name: '아태 캔 참치', cagr: '6.07%', period: '~2030', color: '#38bdf8',
    drivers: '인도네시아·인도 소비 확대, 편의점 간편식 수요',
  },
];

const climateRisks = [
  { risk: '참치 서→동 이동', impact: '서태평양 EEZ 자원량 -13% (25년)', color: '#ef4444' },
  { risk: '사료어 가격 폭등', impact: '엘니뇨 → 사료어 +22% (2024)', color: '#f59e0b' },
  { risk: '양식 FIFO', impact: '참치 1kg당 사료어 15-20kg 필요', color: '#a78bfa' },
];

export default function SasGlobalOutlook2030() {
  return (
    <WidgetCard
      id="W-SAS28"
      title="🔮 글로벌 사시미 시장 전망 2030+"
      icon={Compass}
      iconColor="#10b981"
      pillar="S1"
      cardDesc="$44B→$60B 성장, 중동 CAGR 7.6%, WCPO 3.06M mt 기록, 기후 리스크"
      telemetry={{ status: 'STATIC', syncDate: '2025' }}
      takeaway={{
        situation: "글로벌 참치 시장은 $44.2B(2025) → $59.6B(2034)로 CAGR 3.46% 성장 전망입니다. 사시미급 수산물은 CAGR 5.0%로 더 빠르게 성장합니다. WCPO는 2024년 사상 최대 3.06M mt을 어획했으나 가치는 -6% 하락하여 '물량↑ 가치↓' 역설이 심화되었습니다. 중동은 CAGR 7.6%로 글로벌 최고 성장 지역입니다.",
        actionPlan: "한국에 유리한 3대 기회: ① 사시미급 시장 CAGR 5.0% (냉동 로인 $3B), ② 중동·중국 신흥 시장 다변화 (일본 의존 탈피), ③ WCPO 기록적 어획에도 가다랑어 가격 하락은 연승(사시미) 전환의 구조적 유인. 리스크: 기후변화로 서태평양 자원 -13% 감소 전망 → 조업구역 동편 이동 대비 필요.",
        source: "WCPO Yearbook 2025, Strategic Analysis of Asian Tuna 2021-2035, IMARC, Green Climate Fund",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {/* Forecast table */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--w-slate-400)', marginBottom: '6px' }}>📊 시장 규모 전망</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {forecasts.map((f) => (
                <div key={f.segment} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.8fr',
                  padding: '8px 10px', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${f.color}`,
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--w-slate-200)' }}>{f.segment}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)' }}>{f.value2024}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: f.color }}>{f.forecast}</span>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 600, color: '#0a0f1f',
                    background: f.color, borderRadius: '10px', padding: '2px 6px', textAlign: 'center',
                  }}>{f.cagr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WCPO Record + Emerging Markets side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* WCPO */}
            <div style={{
              padding: '10px', borderRadius: '8px',
              background: 'rgba(var(--w-sky-400-rgb), 0.05)', border: '1px solid rgba(var(--w-sky-400-rgb), 0.15)',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--w-sky-400)', marginBottom: '6px' }}>
                🌊 WCPO 2024 기록
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--w-slate-200)', marginBottom: '2px' }}>3.059M mt</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--w-slate-500)', marginBottom: '8px' }}>사상 최대 어획 but 가치 -6% ($5.6B)</div>
              {wcpoCatch.map((s) => (
                <div key={s.species} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.62rem', color: 'var(--w-slate-400)', flex: 1 }}>{s.species}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--w-slate-200)' }}>{s.volume}t</span>
                  <span style={{ fontSize: '0.55rem', color: s.trend.includes('최저') ? 'var(--w-red-500)' : s.trend.includes('최고') ? 'var(--w-emerald-500)' : 'var(--w-slate-500)' }}>
                    {s.trend}
                  </span>
                </div>
              ))}
            </div>

            {/* Emerging */}
            <div style={{
              padding: '10px', borderRadius: '8px',
              background: 'rgba(var(--w-amber-500-rgb), 0.05)', border: '1px solid rgba(var(--w-amber-500-rgb), 0.15)',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--w-amber-500)', marginBottom: '6px' }}>
                🚀 신흥 시장 성장률
              </div>
              {emergingMarkets.map((m) => (
                <div key={m.name} style={{
                  marginBottom: '8px', padding: '6px', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--w-slate-200)' }}>{m.flag} {m.name}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, color: '#0a0f1f',
                      background: m.color, borderRadius: '10px', padding: '1px 6px',
                    }}>CAGR {m.cagr}</span>
                  </div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--w-slate-500)', marginTop: '2px' }}>{m.drivers}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Climate risks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {climateRisks.map((r) => (
              <div key={r.risk} style={{
                padding: '8px', borderRadius: '8px', textAlign: 'center',
                background: `${r.color}08`, border: `1px solid ${r.color}15`,
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 600, color: r.color }}>⚠️ {r.risk}</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--w-slate-400)', marginTop: '2px' }}>{r.impact}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
