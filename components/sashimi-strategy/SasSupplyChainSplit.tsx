'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import WidgetCard from '../WidgetCard';

const data = [
  { name: 'Bulk Frozen (포케용)', value: 67, price: '$11.28/kg', source: 'SE Asia source' },
  { name: 'Premium Fresh (항공운송)', value: 33, price: '$13-26/kg', source: 'Air freight' },
];

const COLORS = ['#3b82f6', '#f59e0b'];

export default function SasSupplyChainSplit() {
  return (
    <WidgetCard
      id="W-SAS03"
      title="미국 시장 서플라이 체인 양극화"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
      takeaway={{ situation: "미국 시장은 저가 대량 포케용(Bulk)과 항공운송 프리미엄(Fresh)으로 양극화.", actionPlan: "모니터링 유지", source: "Sashimi Market Report 2025" }}
    >
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => {
              const { price, source } = props.payload;
              return [`${value}% (단가: ${price} | 출처: ${source})`, name];
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </WidgetCard>
  );
}
