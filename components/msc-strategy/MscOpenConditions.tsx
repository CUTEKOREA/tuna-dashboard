'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

const conditionData = [
  { name: 'PI 1.2.1 — 수확전략 (Harvest Strategy)', count: 42, color: '#ef4444' },
  { name: 'PI 1.2.2 — 수확통제규칙 (HCR)', count: 38, color: '#ef4444' },
  { name: 'PI 2.3 — ETP종 혼획 관리', count: 31, color: '#f59e0b' },
  { name: 'PI 2.1 — 주요 어종 영향', count: 22, color: '#f59e0b' },
  { name: 'PI 3.2.3 — 모니터링·통제·감시', count: 18, color: '#38bdf8' },
  { name: 'PI 2.5 — 생태계 영향', count: 14, color: '#38bdf8' },
];

const tooltipStyle = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

export default function MscOpenConditions() {
  const chartElement = (
    <BarChart
      data={conditionData}
      layout="vertical"
      margin={{ top: 8, right: 40, left: 12, bottom: 8 }}
      barCategoryGap="28%"
    >
      <XAxis
        type="number"
        domain={[0, 50]}
        tick={{ fill: '#64748b', fontSize: 11 }}
        axisLine={{ stroke: 'rgba(148,163,184,0.12)' }}
        tickLine={false}
        tickFormatter={(v: number) => `${v}건`}
      />
      <YAxis
        type="category"
        dataKey="name"
        width={220}
        tick={{ fill: '#94a3b8', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip
        contentStyle={tooltipStyle}
        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        formatter={(value: number) => [`${value}건`, '개선 조건 수']}
      />
      <Bar
        dataKey="count"
        radius={[0, 6, 6, 0]}
        isAnimationActive={false}
        barSize={22}
      >
        {conditionData.map((entry, idx) => (
          <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
        ))}
      </Bar>
    </BarChart>
  );

  const body = (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', height: 300 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          {chartElement}
        </SafeResponsiveContainer>
      </div>

      {/* Summary badges */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          marginTop: 12,
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f87171' }}>
            P1 수확전략·HCR — 총 80건
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24' }}>
            P2 생태·혼획 — 총 53건
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.2)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#38bdf8', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7dd3fc' }}>
            P3 거버넌스 — 총 32건
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC20"
      title="MSC 개선 조건(Condition) 빈도 분석"
      description="인증 참치 어업의 가장 빈번한 미충족 조건 Top 6"
      icon={AlertCircle}
      iconColor="#ef4444"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="ISSF 기술보고서 기반 MSC 인증 참치 어업의 개선 조건 유형별 빈도 수평 차트"
      customBody={body}
      takeaway={{
        situation: "MSC 인증 참치 어업에서 가장 빈번한 개선 조건(Condition)은 수확전략(PI 1.2.1, 42건)과 수확통제규칙(PI 1.2.2, 38건)입니다. 이는 인증을 받아도 '조건부'가 대부분이며, 조건 미충족 시 인증 정지로 직결됨을 의미합니다.",
        actionPlan: "인증 준비 시 수확전략과 HCR 관련 문서를 최우선으로 정비해야 합니다. ETP종(멸종위기종) 혼획 관리(PI 2.3)도 31건으로 높아, 혼획 저감장치 도입이 인증 유지의 핵심 요건입니다.",
        source: "ISSF Technical Report 2025-11",
      }}
    />
  );
}
