'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import WidgetCard from '../WidgetCard';

const data = [
  {
    name: 'CO-Treated',
    fullName: '일산화탄소 처리',
    price: 2.50,
    source: 'Vietnam',
  },
  {
    name: 'Untreated',
    fullName: '미처리 (자연산/프리미엄)',
    price: 4.50,
    source: 'Various',
  }
];

export default function SasCoTreatmentImpact() {
  return (
    <WidgetCard
      id="W-SAS04"
      title="일산화탄소(CO) 처리 유무에 따른 단가 비교"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
      takeaway={{ situation: "일산화탄소(CO) 처리 허용 국가(미국)에서의 저가 공세가 프리미엄 시장을 교란.", actionPlan: "모니터링 유지", source: "Sashimi Market Report 2025" }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" unit="$" domain={[0, 5]} />
          <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12, fontWeight: 'bold' }} />
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [`$${value.toFixed(2)}/lb (${props.payload.source})`, '단가 ($/lb)']}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
          />
          <Legend />
          <Bar dataKey="price" name="단가 ($/lb)" isAnimationActive={false} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
