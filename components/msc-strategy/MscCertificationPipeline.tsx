'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import WidgetCard from '../WidgetCard';

interface FunnelStage {
  label: string;
  labelKo: string;
  count: number;
  color: string;
  widthPct: number;
}

const stages: FunnelStage[] = [
  { label: 'Certified',            labelKo: '인증 완료',   count: 71, color: '#10b981', widthPct: 100 },
  { label: 'Pre-assessment',       labelKo: '사전심사',     count: 45, color: '#64748b', widthPct: 63 },
  { label: 'Full Assessment',      labelKo: '정식심사',     count: 23, color: '#f59e0b', widthPct: 32 },
  { label: 'Suspended/Withdrawn',  labelKo: '정지·철회',   count: 12, color: '#ef4444', widthPct: 17 },
];

export default function MscCertificationPipeline() {
  const kpiCards = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
      <div style={{ background: 'rgba(var(--w-sky-400-rgb), 0.1)', border: '1px solid rgba(var(--w-sky-400-rgb), 0.2)', borderRadius: 12, padding: '12px', textAlign: 'center' as const }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--w-sky-400)', marginBottom: '4px', fontWeight: 600 }}>FIP → MSC 전환율</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--w-sky-400)', fontVariantNumeric: 'tabular-nums' }}>18%</div>
      </div>
      <div style={{ background: 'rgba(var(--w-amber-500-rgb), 0.1)', border: '1px solid rgba(var(--w-amber-500-rgb), 0.2)', borderRadius: 12, padding: '12px', textAlign: 'center' as const }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--w-amber-500)', marginBottom: '4px', fontWeight: 600 }}>평균 소요기간</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--w-amber-500)', fontVariantNumeric: 'tabular-nums' }}>2.8<span style={{ fontSize: '0.78rem', fontWeight: 600, marginLeft: '4px' }}>년</span></div>
      </div>
      <div style={{ background: 'rgba(var(--w-emerald-500-rgb), 0.1)', border: '1px solid rgba(var(--w-emerald-500-rgb), 0.2)', borderRadius: 12, padding: '12px', textAlign: 'center' as const }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--w-emerald-500)', marginBottom: '4px', fontWeight: 600 }}>파이프라인 내 어업</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--w-emerald-500)', fontVariantNumeric: 'tabular-nums' }}>151<span style={{ fontSize: '0.78rem', fontWeight: 600, marginLeft: '4px' }}>건</span></div>
      </div>
    </div>
  );

  const funnelBars = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {stages.map((stage) => (
        <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '110px', flexShrink: 0, textAlign: 'right' as const }}>
            <div style={{ fontWeight: 700, color: 'var(--w-slate-200)', fontSize: '0.85rem' }}>{stage.labelKo}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-500)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{stage.label}</div>
          </div>
          <div style={{ flex: 1, position: 'relative' as const }}>
            <div style={{
              width: `${stage.widthPct}%`,
              height: '40px',
              borderRadius: '0 6px 6px 0',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              background: `linear-gradient(90deg, ${stage.color}15, ${stage.color}30)`,
              borderTop: `1px solid ${stage.color}40`,
              borderRight: `1px solid ${stage.color}40`,
              borderBottom: `1px solid ${stage.color}40`,
              borderLeft: `4px solid ${stage.color}`,
              transition: 'width 0.5s ease-out',
            }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: stage.color, fontVariantNumeric: 'tabular-nums' }}>
                {stage.count}
                <span style={{ fontSize: '0.72rem', fontWeight: 600, marginLeft: '4px', opacity: 0.7 }}>건</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const flowAnnotation = (
    <div style={{
      marginTop: '24px',
      padding: '12px',
      background: 'rgba(30,41,59,0.5)',
      borderRadius: 8,
      border: '1px solid rgba(140,170,255,0.12)',
      fontSize: '0.75rem',
      color: 'var(--w-slate-400)',
      textAlign: 'center' as const,
      fontWeight: 500,
    }}>
      사전심사 <span style={{ color: 'var(--w-slate-300)', fontWeight: 700 }}>45건</span> → 정식심사 <span style={{ color: 'var(--w-slate-300)', fontWeight: 700 }}>23건</span> → 누적 인증완료 <span style={{ color: 'var(--w-slate-300)', fontWeight: 700 }}>71건</span> <span style={{ margin: '0 8px' }}>|</span> 정지·철회 <span style={{ color: 'var(--w-red-500)', fontWeight: 700 }}>12건</span>
    </div>
  );

  return (
    <WidgetCard
      title="MSC 인증 파이프라인 (Funnel)"
      icon={Filter}
      iconColor="#f59e0b"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="전 세계 참치 어업의 MSC 심사 단계별 현황 · 글로벌 인증 로드맵"
      customBody={<div>{kpiCards}{funnelBars}{flowAnnotation}</div>}
      takeaway={{
        situation: "현재 45개 어업이 사전심사 단계에 있으며, 이 중 23개가 정식심사 중입니다. 평균 소요기간은 2.8년으로 깁니다. 특히 FIP(어업개선프로젝트)에서 MSC로 전환하는 비율은 18%에 불과하며 탈락 리스크도 상존합니다.",
        actionPlan: "향후 2~3년 내 신규 인증 어업이 20개 이상 늘어나면 MSC 참치 공급량이 15% 이상 확대될 것입니다. 한국 선단은 초기 심사를 신속히 통과해 '선도자 프리미엄(First Mover Premium)'을 취해야 합니다.",
        source: "MSC Annual Report 2024",
      }}
    />
  );
}
