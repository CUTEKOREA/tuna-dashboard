'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import WidgetCard from '../WidgetCard';

const data = [
  { name: '눈다랑어(Bigeye)', value: 0.79 },
  { name: '심해조업(Deep-set)', value: 0.62 },
  { name: '선도 하락(1일당)', value: -0.14 }
];

export default function SasHedonicPriceFactors() {
  return (
    <WidgetCard
      title="쾌락적(Hedonic) 가격 결정 요인"
      subtitle="경매 단가 프리미엄 및 할인 ($/lb)"
      takeaway={{ situation: "쾌락적(Hedonic) 가격 모델 분석 결과, 어종 및 선도(조업일수)가 경매 단가에 절대적 영향.", actionPlan: "모니터링 유지", source: "Sashimi Market Report 2025" }}
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }
      cardDesc="사시미/스테이크 시장 동향"}
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" unit="$" />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" isAnimationActive={false}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
