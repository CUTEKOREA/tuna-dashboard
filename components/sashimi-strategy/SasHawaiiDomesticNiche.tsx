'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const HAWAII_DATA = [
  { year: '2020', price: 12.5, volume: 3200 },
  { year: '2021', price: 13.0, volume: 3300 },
  { year: '2022', price: 14.1, volume: 3150 },
  { year: '2023', price: 13.8, volume: 3400 },
  { year: '2024', price: 14.2, volume: 3500 },
];

export default function SasHawaiiDomesticNiche() {
  return (
    <WidgetCard
      id="W-SAS05"
      title="하와이 호놀룰루 프리미엄 참치 경매 동향"
      description="미국 내 최고급 생물 참치의 기준점(Benchmark)"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
      takeaway={{ situation: "하와이 경매장은 미국 내 최고급 프리미엄 생물 참치의 기준점(Benchmark) 역할. Ahi(황다랑어)와 Bigeye(눈다랑어)의 현지 경매가는 $12~$14/lb 수준에서 안정적으로 유지되며, 고급 레스토랑 중심의 니치 마켓을 형성합니다.", actionPlan: "시장 변화에 따른 전략적 대응", source: "Sashimi Market Report 2025" }}
    >
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={HAWAII_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              yAxisId="left" 
              domain={[10, 16]} 
              tickFormatter={(val) => `$${val}`}
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[2000, 4000]}
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="price" 
              name="경매 단가 ($/lb)" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3} 
              isAnimationActive={false} 
            />
            <Area 
              yAxisId="right" 
              type="monotone" 
              dataKey="volume" 
              name="거래량 (톤)" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.1} 
              isAnimationActive={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <strong>인사이트:</strong> 하와이 경매장은 미국 내 최고급 프리미엄 생물 참치의 기준점(Benchmark) 역할. Ahi(황다랑어)와 Bigeye(눈다랑어)의 현지 경매가는 $12~$14/lb 수준에서 안정적으로 유지되며, 고급 레스토랑 중심의 니치 마켓을 형성합니다.
        </p>
      </div>
    </WidgetCard>
  );
}
