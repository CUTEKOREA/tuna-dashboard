'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import WidgetCard from '../WidgetCard';

const data = [
  { name: '냉동 사쿠', range: [11, 11] },
  { name: '생물 황다랑어', range: [13, 14] },
  { name: '참다랑어', range: [26, 42] }
];

export default function SasSashimiPriceLadder() {
  return (
    <WidgetCard
      title="사시미 가격 사다리 (USD/kg)"
      subtitle="품질 및 보관 형태별 가격 차이"
      takeaway="품질 및 보관 형태(생물 vs 초저온 냉동)에 따라 가격 사다리가 명확하게 형성."
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis unit="$" />
            <Tooltip />
            <Bar dataKey="range" fill="#3b82f6" isAnimationActive={false} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
