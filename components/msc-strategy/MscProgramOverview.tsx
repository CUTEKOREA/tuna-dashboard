'use client';

import React from 'react';
import { Award, Calendar, Fish, Globe, Layers, Building, Tag } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const iconMap: Record<string, React.ReactNode> = {
  calendar: <Calendar size={22} />,
  fish: <Fish size={22} />,
  globe: <Globe size={22} />,
  layers: <Layers size={22} />,
  building: <Building size={22} />,
  tag: <Tag size={22} />,
};

const stats = [
  { label: '설립', value: '1997', sub: 'WWF + Unilever 공동', icon: 'calendar', color: '#38bdf8' },
  { label: '인증 어업', value: '592개', sub: '2025.3 기준', icon: 'fish', color: '#10b981' },
  { label: '참여 국가', value: '63개국', sub: '전 세계', icon: 'globe', color: '#a78bfa' },
  { label: '인증 어종', value: '204종', sub: '', icon: 'layers', color: '#f59e0b' },
  { label: 'CoC 인증 사업장', value: '51,260개', sub: '공급망 전체', icon: 'building', color: '#22d3ee' },
  { label: 'MSC 라벨 제품', value: '21,859개', sub: '2014년 9,359개 → 133% 성장', icon: 'tag', color: '#f472b6' },
];

const principles = [
  { id: 'P1', title: '지속가능한 자원', sub: '자원 건전성', color: '#10b981', desc: '어획 대상 자원이 건전한 수준으로 유지되고 있는가' },
  { id: 'P2', title: '환경 영향 최소화', sub: '생태계', color: '#38bdf8', desc: '어업 활동이 생태계에 미치는 영향을 최소화하는가' },
  { id: 'P3', title: '효과적 관리', sub: '거버넌스', color: '#a78bfa', desc: '법·제도·관리 체계가 지속가능성을 보장하는가' },
];

export default function MscProgramOverview() {
  const kpiGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: `${s.color}10`,
            border: `1px solid ${s.color}30`,
            borderRadius: 12,
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: '6px',
            textAlign: 'center' as const,
          }}
        >
          <div style={{ color: s.color, opacity: 0.85 }}>{iconMap[s.icon]}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>{s.label}</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
            {s.value}
          </div>
          {s.sub && (
            <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-500)', lineHeight: 1.3, marginTop: '2px' }}>{s.sub}</div>
          )}
        </div>
      ))}
    </div>
  );

  const principlesSection = (
    <div style={{ marginTop: '4px' }}>
      <div style={{
        fontSize: '0.78rem',
        fontWeight: 700,
        color: 'var(--w-slate-200)',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <Award size={14} color="#f59e0b" />
        MSC 인증 3대 원칙
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
        {principles.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 14px',
              background: 'rgba(30,41,59,0.5)',
              border: '1px solid rgba(140,170,255,0.12)',
              borderLeft: `3px solid ${p.color}`,
              borderRadius: '0 8px 8px 0',
            }}
          >
            <div style={{
              minWidth: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `${p.color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: p.color,
              flexShrink: 0,
            }}>
              {p.id}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--w-slate-200)', fontSize: '0.85rem' }}>
                {p.title}
                <span style={{ fontSize: '0.7rem', color: 'var(--w-slate-500)', fontWeight: 500, marginLeft: '6px' }}>
                  ({p.sub})
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)', marginTop: '3px', lineHeight: 1.4 }}>
                {p.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC16"
      title="MSC 프로그램 개요"
      icon={Award}
      iconColor="#38bdf8"
      pillar="S5"
      cardDesc="MSC 인증 프로그램의 규모·구조·3대 원칙을 한눈에 조망하는 인포그래픽"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      customBody={<div>{kpiGrid}{principlesSection}</div>}
      takeaway={{
        situation: "MSC는 1997년 설립 이래 전 세계 592개 어업, 63개국, 204개 어종을 인증했으며, MSC 라벨 제품의 연간 소매 판매 가치는 US$14B(2024/25 회계연도)에 달합니다. CoC(관리연속성) 인증만 51,260개 사업장이 확보하여, 어획부터 소매까지 추적 가능한 공급망을 구축했습니다.",
        actionPlan: "MSC 인증은 3대 원칙(자원·생태계·관리)을 모두 충족해야 하며, 5년 주기로 재인증을 받아야 합니다. 한국 원양 선단의 인증 전략 수립 시 P1(수확전략)이 가장 큰 허들이므로, RFMO별 HCR 채택 현황을 먼저 파악해야 합니다.",
        source: "MSC Annual Report 2024-25 (어업·국가·어종·CoC·소매가치 전 지표 2025-03-31 기준)",
      }}
    />
  );
}
