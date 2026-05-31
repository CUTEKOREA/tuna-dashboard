'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import WidgetCard from '../WidgetCard';

const data = [
  {
    subject: '어구(Gear) 친환경성',
    현재: 2,
    권장: 5,
    fullMark: 5,
  },
  {
    subject: '참다랑어 지속성',
    현재: 1,
    권장: 3,
    fullMark: 5,
  },
  {
    subject: '미국 SIMP 준수',
    현재: 3,
    권장: 5,
    fullMark: 5,
  },
  {
    subject: 'EU CATCH (2026)',
    현재: 2,
    권장: 5,
    fullMark: 5,
  },
  {
    subject: '추적성 시스템',
    현재: 2,
    권장: 4,
    fullMark: 5,
  },
];

export default function SasTraceabilityRatings() {
  return (
    <WidgetCard
      title="추적성 및 지속가능성 평가"
      subtitle="규제 준수(SIMP/CATCH) 및 Seafood Watch 등급"
      takeaway={{ situation: "모든 참다랑어는 Seafood Watch 'Red' 등급이며, EU CATCH 의무화로 2026년 추적성 리스크 심화.", actionPlan: "모니터링 유지", source: "Sashimi Market Report 2025" }}
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} />
            <Radar
              name="현재 (고위험군)"
              dataKey="현재"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.4}
              isAnimationActive={false}
            />
            <Radar
              name="권장 (지속가능)"
              dataKey="권장"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.4}
              isAnimationActive={false}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
