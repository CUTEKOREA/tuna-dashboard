'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const hotspots = [
  {
    flag: '🇺🇸', name: '미국', color: '#10b981',
    metrics: [
      { label: '스시 레스토랑', value: '$33.2B', sub: '17,301개 (+1.6% YoY)' },
      { label: '포케 전문점', value: '$2.0B', sub: '3,108개 (CAGR 22.3%)' },
      { label: '사시미급 수입', value: '$829M', sub: '80-85% 수입 의존' },
    ],
  },
  {
    flag: '🇪🇺', name: 'EU', color: '#a78bfa',
    metrics: [
      { label: 'KellyDeli/Sushi Daily', value: '€453.7M', sub: '~1,150개 슈퍼마켓 스시' },
      { label: 'BFT TAC 2026-28', value: '48,403t/yr', sub: '+19.3% 증가 (EU 52%)' },
      { label: '신선 참치 수입', value: '-32.4%', sub: 'Jan-May 2024 (사시미↓)' },
    ],
  },
  {
    flag: '🇨🇳', name: '중국', color: '#ef4444',
    metrics: [
      { label: '신흥 사시미 시장', value: '급성장', sub: '몰타 BFT 수출 대상 부상' },
      { label: 'Balfegó 매출 중국', value: '15%', sub: '일본 탈피 다변화' },
      { label: '아시아 참치 시장', value: '$2.1B+', sub: '2035 전망 CAGR 4.5%' },
    ],
  },
  {
    flag: '🇯🇵', name: '일본', color: '#f59e0b',
    metrics: [
      { label: '도요스 신년 경매', value: '¥510.3M', sub: '243kg 오마 BFT (기네스)' },
      { label: '일상 거래가', value: '¥8-10K/kg', sub: '연말 >¥20K 스파이크' },
      { label: '참치 수입 2024', value: '$1.59B', sub: 'YoY -14.2%' },
    ],
  },
];

export default function SasGlobalHotspots() {
  return (
    <WidgetCard
      id="W-SAS21"
      title="글로벌 사시미 시장 핫스팟"
      icon={MapPin}
      iconColor="#10b981"
      pillar="S1"
      cardDesc="미국 포케·EU 슈퍼마켓 스시·중국 신흥·일본 경매 - 4대 시장 성장 동력"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: "미국은 스시 레스토랑($33.2B)과 포케 전문점($2B, CAGR 22.3%)이 사시미급 참치 소비를 견인합니다. EU는 슈퍼마켓 스시(KellyDeli €453.7M)가 성장 채널이나 신선 수입은 -32.4% 감소했습니다. 중국은 몰타 BFT의 신규 수출 대상으로 부상 중이며, Balfegó는 매출의 15%를 중국에서 확보했습니다.",
        actionPlan: "포케 시장(CAGR 22.3%)은 황다랑어/눈다랑어 소비의 최대 성장 동력입니다. EU 슈퍼마켓 스시 채널과 중국 신흥 시장은 일본 수요 감소를 대체할 수출 다변화 타깃입니다. ICCAT BFT TAC +19.3% 증가로 EU 생산량 확대도 예상됩니다.",
        source: "US/EU_KPI_metrics.csv, GLOBEFISH, Balfegó Annual Report",
      }}
      customBody={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
          {hotspots.map((h) => (
            <div key={h.name} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px',
              border: `1px solid ${h.color}20`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>{h.flag}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: h.color }}>{h.name}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {h.metrics.map((m) => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--w-slate-400)', flex: 1 }}>{m.label}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9' }}>{m.value}</div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--w-slate-500)' }}>{m.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      }
    />
  );
}
