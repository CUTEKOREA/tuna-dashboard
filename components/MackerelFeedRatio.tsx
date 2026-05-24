'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Leaf } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const data = [
  { year: '2020', edible: 75, feed: 25 },
  { year: '2021', edible: 70, feed: 30 },
  { year: '2022', edible: 62, feed: 38 },
  { year: '2023', edible: 55, feed: 45 },
  { year: '2024', edible: 48, feed: 52 },
];

export default function MackerelFeedRatio() {
  return (
    <WidgetCard
      title="물가 착시 통계 (식용 vs 생사료 교차비)"
      icon={Leaf}
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="정부 무역/어획 통계에는 모두 고등어로 집계되지만, 실제 우럭이나 광어 등 양식장 사료(비식용)로 쓰이는 미성어 비중을 자체 추정한 교차지표입니다."
      chartHeight={350}
      chart={
        <BarChart data={data} stackOffset="expand" margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis tickFormatter={(val) => `${val * 100}%`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} formatter={(value: any) => `${value}%`} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="edible" name="국내 식용 소비" stackId="a" fill="url(#a11y-stripe-h)" color={A11Y_PALETTE[0]} />
          <Bar dataKey="feed" name="양식장 사료/어분용" stackId="a" fill="url(#a11y-diag)" color={A11Y_PALETTE[1]} />
        </BarChart>
      }
      takeaway={{
        situation: "국가 거시 통계상 총어획량은 유지되는 듯한 착시(Optical Illusion)를 보이나, 실질적인 B2C 식용(Food-grade) 체급 비중은 48%로 급감하며 심각한 수급 불균형(Supply Deficit) 한계치에 도달했습니다. 잔여 물량은 사료/어분용으로 강제 전용되는 품질 열화(Quality Degradation) 현상이 본질입니다.",
        actionPlan: "[B2C Margin Defense] 정책 통계의 '공급 과잉' 노이즈를 전면 무시하십시오. 양질의 식용 원물은 현재 극심한 숏티지(Shortage) 상태입니다. 국내 대형 유통 3사(할인점)와의 납품 단가 네고 시 일체의 볼륨 디스카운트를 거부하고, 철저한 '공급자 우위(Seller's Market)' 기반의 프리미엄 판가 방어 전략(Price Shielding)을 락인해야 합니다.",
        source: "자체 추정"
      }}
    />
  );
}
