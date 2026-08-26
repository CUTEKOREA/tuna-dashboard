'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
      title="하와이 호놀룰루 참치 경매 동향"
      description="미국 프리미엄 생물 참치 - 사시미 최상급(#1) 단가 벤치마크"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="NOAA 호놀룰루 경매 - 최상급(#1) 생물 참치(황다랑어·눈다랑어) $12~14/lb·거래량 ~3,500톤"
      takeaway={{ 
        situation: "하와이 호놀룰루 경매장은 미국 내 최고급 프리미엄 생물 참치(Ahi, Bigeye)의 기준점입니다. 경매 전체 평균은 ~$4/lb(NOAA) 수준이나, 사시미 최상급(#1 grade) 등급은 $12~$14/lb의 프리미엄 단가를 형성합니다.",
        actionPlan: "대규모 유통망 진입보다는 하이엔드 오마카세 및 고급 씨푸드 레스토랑을 타겟으로 한 소량 다품종 프리미엄 브랜드 전략이 유효합니다.", 
        source: "US NOAA / Honolulu Fish Auction Data" 
      }}
      customBody={
        <div style={{ height: '256px', width: '100%', marginTop: '8px' }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={HAWAII_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
              <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" />
              <YAxis 
                yAxisId="left" 
                domain={[10, 16]} 
                tickFormatter={(val) => `$${val}`}
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                stroke="var(--w-slate-500)"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[2000, 4000]}
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val}t`}
                stroke="var(--w-slate-500)"
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'var(--w-navy-900)', color: 'var(--w-slate-200)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area 
                yAxisId="left" 
                type="monotone" 
                dataKey="price" 
                name="최상급(#1) 단가 ($/lb)"
                stroke="var(--w-amber-500)"
                fill="var(--w-amber-500)"
                fillOpacity={0.2} 
                strokeWidth={3}
                isAnimationActive={false} 
              />
              <Area 
                yAxisId="right" 
                type="monotone" 
                dataKey="volume" 
                name="거래량 (톤)" 
                stroke="var(--w-slate-400)"
                fill="var(--w-slate-400)"
                fillOpacity={0.1} 
                strokeWidth={2}
                isAnimationActive={false} 
              />
            </AreaChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
