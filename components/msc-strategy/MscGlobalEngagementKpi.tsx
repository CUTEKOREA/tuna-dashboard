'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const kpis = [
  { value: '59%', label: '글로벌 참치 MSC 참여율', sub: '전년 53% → 59%', color: '#10b981', growth: '+6pp' },
  { value: '3,052,340t', label: 'MSC 참여 참치 어획량', sub: '전 세계 상업 참치', color: '#38bdf8', growth: undefined },
  { value: '182개', label: '참여 참치 어업 수', sub: '인증+심사+개선', color: '#a78bfa', growth: undefined },
  { value: '300,000t+', label: 'MSC 라벨 판매량', sub: '전년 대비 30% 성장', color: '#f59e0b', growth: '+30%' },
];

export default function MscGlobalEngagementKpi() {
  const kpiGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px' }}>
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          style={{
            background: `${kpi.color}08`,
            border: `1px solid ${kpi.color}25`,
            borderRadius: 14,
            padding: '20px 18px',
            position: 'relative' as const,
            overflow: 'hidden' as const,
          }}
        >
          {/* Decorative accent bar */}
          <div style={{
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${kpi.color}, transparent)`,
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: kpi.color,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
            }}>
              {kpi.value}
            </div>
            {kpi.growth && (
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#10b981',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 6,
                padding: '2px 7px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}>
                <TrendingUp size={11} />
                {kpi.growth}
              </div>
            )}
          </div>

          <div style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#e2e8f0',
            marginTop: '8px',
            lineHeight: 1.3,
          }}>
            {kpi.label}
          </div>
          <div style={{
            fontSize: '0.68rem',
            color: '#64748b',
            marginTop: '4px',
          }}>
            {kpi.sub}
          </div>
        </div>
      ))}
    </div>
  );

  const growthTrajectory = (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(30,41,59,0.5)',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{
        minWidth: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'rgba(56,189,248,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <TrendingUp size={16} color="#38bdf8" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
          MSC 참치 참여량 성장 궤적
        </div>
        <div style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 600 }}>
          <span style={{ color: '#64748b' }}>2012:</span>{' '}
          <span style={{ color: '#94a3b8' }}>100,000</span>
          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>MT</span>
          <span style={{ margin: '0 8px', color: '#38bdf8' }}>→</span>
          <span style={{ color: '#64748b' }}>2023:</span>{' '}
          <span style={{ color: '#38bdf8', fontWeight: 800 }}>1,600,000</span>
          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>MT</span>
          <span style={{
            marginLeft: '10px',
            fontSize: '0.72rem',
            color: '#10b981',
            fontWeight: 700,
            background: 'rgba(16,185,129,0.12)',
            padding: '2px 8px',
            borderRadius: 4,
          }}>
            16배 증가
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC18"
      title="글로벌 MSC 참치 참여 현황"
      icon={TrendingUp}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="전 세계 상업 참치의 MSC 프로그램 참여율·어획량·판매량 핵심 KPI"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      customBody={<div>{kpiGrid}{growthTrajectory}</div>}
      takeaway={{
        situation: "전 세계 상업 참치의 59%가 MSC 프로그램에 참여하고 있으며, 이는 전년(53%) 대비 6%p 증가한 수치입니다. MSC 라벨 참치 판매량은 30만 톤을 초과하며 전년 대비 30% 성장했습니다. 참치는 MSC 전체 인증 수산물의 1/5을 차지하는 핵심 어종입니다.",
        actionPlan: "10년간 16배 성장(10만→160만 MT)이 입증하듯, MSC 참치는 구조적 메가 트렌드입니다. 한국 원양 선단이 이 성장 궤적에 탑승하지 않으면, 글로벌 공급망에서 점차 소외될 리스크가 있습니다.",
        source: "MSC Annual Report 2024-2025, MSC Sustainable Tuna Yearbook 2024",
      }}
    />
  );
}
