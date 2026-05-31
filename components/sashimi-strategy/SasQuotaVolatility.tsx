'use client';

import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import WidgetCard from '../WidgetCard';

const data = [
  { name: '미국 대서양(24년)', 사용량: 109, 쿼터기준: 100 },
  { name: 'EU(현재)', 사용량: 95, 쿼터기준: 100 },
  { name: 'EU(26-28년)', 사용량: 95, 쿼터기준: 119.3 }
];

export default function SasQuotaVolatility() {
  return (
    <WidgetCard
      title="지역별 쿼터 변동성 및 소진율"
      subtitle="미국 쿼터 초과 및 EU 쿼터 증대"
      takeaway={{ situation: "미국은 20년 만에 쿼터 초과 달성 등 자원 압박이 거세나, EU는 ICCAT 쿼터 증대로 여유 확보.", actionPlan: "모니터링 유지", source: "Sashimi Market Report 2025" }}
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }
      cardDesc="사시미/스테이크 시장 동향"}
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis unit="%" />
            <Tooltip />
            <Legend />
            <Bar dataKey="사용량" fill="#3b82f6" isAnimationActive={false} />
            <Line type="step" dataKey="쿼터기준" stroke="#ef4444" strokeWidth={2} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
