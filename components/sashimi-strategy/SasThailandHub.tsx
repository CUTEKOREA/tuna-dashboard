'use client';

import React from 'react';
import { Factory } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const thaiMetrics = [
  { label: '글로벌 캔 참치 수출', value: '28.2%', sub: '세계 1위 (2023)', color: '#f59e0b' },
  { label: '생산량', value: '630,500t', sub: '2023년', color: '#10b981' },
  { label: '생산 성장률', value: '2.7-3.7%', sub: '/년 (2025-27 전망)', color: '#38bdf8' },
  { label: '가다랑어 수입가', value: '$1,523/mt', sub: '2024 (YoY -14%)', color: '#ef4444' },
];

const thaiUnion = {
  name: 'Thai Union Group',
  founded: '1977년',
  revenue2024: 'USD 3.9B',
  target2030: 'USD 7.0B',
  ebitda: '$400M → $700-800M',
  q4sales: 'THB 35.04B ($1.09B)',
  strategy: [
    { item: '펫케어 확대', desc: '고마진 반려동물 참치 사업', icon: '🐱' },
    { item: 'Value-Added 식품', desc: '프리미엄 가공·간편식', icon: '🍽️' },
    { item: '글로벌 M&A', desc: 'King Oscar·Chicken of the Sea', icon: '🌍' },
  ],
};

const koreaLink = [
  { flow: '한국 선망 → 태국 캔 공장', value: '$191M/yr', desc: '가다랑어 벌크 수출, 안정적 거래선', color: '#38bdf8' },
  { flow: '태국 가공 → 글로벌 소매', value: '$5.3B+', desc: '캔·파우치 완제품 수출', color: '#10b981' },
  { flow: '한국 위치', value: '원료 공급국', desc: 'WCPO 가다랑어 249K톤 → 태국 수출', color: '#f59e0b' },
];

export default function SasThailandHub() {
  return (
    <WidgetCard
      id="W-SAS25"
      title="🇹🇭 태국 - 세계 최대 참치 가공 허브"
      icon={Factory}
      iconColor="#f59e0b"
      pillar="S1"
      cardDesc="글로벌 캔 참치 수출 28.2% 점유, Thai Union Strategy 2030, 한국 원료 공급 관계"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: "태국은 세계 캔/가공 참치 수출의 28.2%를 차지하는 글로벌 1위 가공 허브로, 2023년 630,500t을 생산했습니다. Thai Union은 $3.9B(2024) → $7.0B(2030) 매출 목표를 설정했으나, 미국 관세 리스크에 직면해 있습니다. 가다랑어 수입가는 $1,523/mt(-14%)로 하락했습니다.",
        actionPlan: "한국 선망 어획 가다랑어의 주요 수출처($191M/yr)이므로, 태국 가공 산업의 건전성은 한국 원양 선단의 수익성에 직결됩니다. 가다랑어 가격 하락은 한국 선망 수익성 압박 요인이며, 이는 연승(사시미) 비중 확대의 구조적 유인을 강화합니다.",
        source: "Strategic Analysis of Asian Tuna Industry, Thai Union FY2025, thai_tuna_trade_summary.json",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {thaiMetrics.map((k) => (
              <div key={k.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px',
                border: '1px solid rgba(140,170,255,0.12)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--w-slate-400)', marginTop: '2px' }}>{k.label}</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--w-slate-500)', marginTop: '1px' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Thai Union Strategy 2030 */}
          <div style={{
            background: 'rgba(var(--w-amber-500-rgb), 0.05)', borderRadius: '10px', padding: '12px',
            border: '1px solid rgba(var(--w-amber-500-rgb), 0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--w-amber-500)' }}>Thai Union Strategy 2030</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)' }}>설립 {thaiUnion.founded} · 세계 최대 참치 생산기업</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-400)' }}>매출 목표</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--w-emerald-500)' }}>{thaiUnion.revenue2024} → {thaiUnion.target2030}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {thaiUnion.strategy.map((s) => (
                <div key={s.item} style={{
                  padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(140,170,255,0.12)', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--w-slate-200)', marginTop: '2px' }}>{s.item}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--w-slate-500)', marginTop: '1px' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Korea-Thailand link */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--w-slate-500)', marginBottom: '2px' }}>🇰🇷↔🇹🇭 한국-태국 원료 공급 관계</div>
            {koreaLink.map((l) => (
              <div key={l.flow} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)',
                borderLeft: `3px solid ${l.color}`,
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--w-slate-200)' }}>{l.flow}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--w-slate-500)' }}>{l.desc}</div>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: l.color }}>{l.value}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
