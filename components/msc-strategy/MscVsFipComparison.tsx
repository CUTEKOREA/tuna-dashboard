'use client';

import React from 'react';
import { GitCompareArrows } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

const catchData = [
  { name: 'MSC 인증', value: 33, fill: '#10b981' },
  { name: 'MSC 심사 중', value: 20, fill: '#38bdf8' },
  { name: 'FIP 참여', value: 25, fill: '#f59e0b' },
  { name: '미참여', value: 22, fill: '#64748b' },
];

const tooltipStyle = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

const comparisonRows = [
  { item: '수준', msc: '최종 인증', fip: '개선 프로젝트' },
  { item: '기간', msc: '5년 주기 재인증', fip: '5년 개선 계획' },
  { item: '라벨', msc: '블루 MSC 라벨 사용 가능', fip: '라벨 사용 불가' },
  { item: '비용', msc: '$50K~$500K+', fip: '$300K~$500K' },
  { item: '예시', msc: 'PNA WCPO 가다랑어', fip: '인도양 참치 연승 (16척)' },
];

/* Custom label component for the center of the donut */
function CenterLabel({ viewBox }: { viewBox?: { cx?: number; cy?: number } }) {
  const cx = viewBox?.cx ?? 0;
  const cy = viewBox?.cy ?? 0;
  return (
    <g>
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#e2e8f0" fontSize="1.4rem" fontWeight={800}>
        78%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="0.7rem" fontWeight={500}>
        참여
      </text>
    </g>
  );
}

export default function MscVsFipComparison() {
  const donutChart = (
    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', marginBottom: '20px' }}>
      <SafeResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={catchData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
            label={({ name, value }) => `${name} ${value}%`}
            labelLine={{ stroke: '#64748b', strokeWidth: 0.8 }}
          >
            {catchData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [`${value}%`, '비중']}
          />
          {/* Center text rendered via Pie label trick */}
          <Pie
            data={[{ value: 100 }]}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={0}
            dataKey="value"
            isAnimationActive={false}
            label={(props) => <CenterLabel viewBox={{ cx: props.cx, cy: props.cy }} />}
          >
            <Cell fill="transparent" />
          </Pie>
        </PieChart>
      </SafeResponsiveContainer>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '12px', justifyContent: 'center' }}>
        {catchData.map((d) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: d.fill, flexShrink: 0 }} />
            {d.name} ({d.value}%)
          </div>
        ))}
      </div>
    </div>
  );

  const comparisonTable = (
    <div style={{ overflowX: 'auto' as const }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.78rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' as const, padding: '10px 12px', color: '#64748b', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.72rem' }}>
              항목
            </th>
            <th style={{ textAlign: 'left' as const, padding: '10px 12px', color: '#10b981', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.72rem' }}>
              MSC 인증
            </th>
            <th style={{ textAlign: 'left' as const, padding: '10px 12px', color: '#f59e0b', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '0.72rem' }}>
              FIP
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row, i) => (
            <tr key={row.item} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
              <td style={{ padding: '9px 12px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {row.item}
              </td>
              <td style={{ padding: '9px 12px', color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {row.msc}
              </td>
              <td style={{ padding: '9px 12px', color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {row.fip}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <WidgetCard
      id="W-MSC17"
      title="MSC 인증 vs FIP 비교"
      icon={GitCompareArrows}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="글로벌 참치 어획량의 MSC/FIP 참여 분포 및 인증 경로 비교 분석"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      customBody={<div>{donutChart}{comparisonTable}</div>}
      takeaway={{
        situation: "전 세계 참치 어획량의 78%가 MSC 인증(33%) 또는 개선 프로그램(FIP 25% + 심사 중 20%)에 참여 중입니다. 지속가능성은 이미 글로벌 참치 산업의 표준이 되었으며, 미참여 어업(22%)은 점차 시장 접근이 제한됩니다.",
        actionPlan: "MSC 인증이 즉시 어려운 어업은 FIP를 통해 5년 내 인증 기반을 마련하는 '단계적 접근'이 현실적입니다. FIP 참여만으로도 유럽 리테일러의 조달 요건을 부분적으로 충족할 수 있습니다.",
        source: "MSC Annual Report 2024-2025, ISSF Technical Report 2025-08",
      }}
    />
  );
}
