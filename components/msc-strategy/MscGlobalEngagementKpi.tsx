'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const kpis = [
  { value: '59%', label: '글로벌 참치 MSC 참여율', sub: '연례보고서 23-24판 53% → 24-25판 59%', color: '#10b981', growth: '+6pp' },
  { value: '3,052,340t', label: 'MSC 참여 참치 어획량', sub: '연례보고서 2024-25 부속 (2025-03 기준)', color: '#38bdf8', growth: undefined },
  { value: '182개', label: '참여 참치 어업 수', sub: '인증+심사+개선 (연감 2024~2025-26 동일)', color: '#a78bfa', growth: undefined },
  { value: '300,000t+', label: 'MSC 라벨 판매량 (2024/25)', sub: '최신 연감 2025-26판은 40만 톤+ (+39%)', color: '#f59e0b', growth: '+30%' },
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
      border: '1px solid rgba(140,170,255,0.12)',
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
          MSC 인증 참치 어획량 성장 궤적 (연감 2024 기준)
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
      cardDesc="MSC 연례보고서 2024-25판(2025-03-31 기준) 참여율·어획량·판매량 핵심 KPI — 참여=인증+심사+개선+정지"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      customBody={<div>{kpiGrid}{growthTrajectory}</div>}
      takeaway={{
        situation: "MSC 연례보고서 2024-25판(2025-03-31 기준)에 따르면 전 세계 상업 참치 어획의 59%(3,052,340t)가 MSC 프로그램에 참여 중이며, 전년판(53%) 대비 6%p 증가했습니다. MSC 라벨 참치 판매량은 2024/25년 30만 톤+(전년比 +30%)이고, 최신 연감 2025-26판에서는 40만 톤+(+39%)으로 갱신됐습니다. 참치는 MSC 전체 참여 수산물 물량의 약 1/5을 차지하는 핵심 어종입니다.",
        actionPlan: "인증 어획 기준 2012년 10만→2023년 160만 MT의 16배 성장(연감 2024), 2025년 말 310만 MT(연감 2025-26)까지 이어진 궤적이 입증하듯, MSC 참치는 구조적 메가 트렌드입니다. 한국 원양 선단이 이 성장 궤적에 탑승하지 않으면, 글로벌 공급망에서 점차 소외될 리스크가 있습니다.",
        source: "MSC Annual Report 2024-25 본문·부속 데이터(msccatch 시트), 성장 궤적: MSC Sustainable Tuna Yearbook 2024 / 최신 판매량: Yearbook 2025-26",
      }}
    />
  );
}
