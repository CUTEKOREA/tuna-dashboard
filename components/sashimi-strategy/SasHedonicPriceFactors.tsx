'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

const HEDONIC_DATA = [
  { name: '어종 (Bigeye vs Yellowfin)', value: 0.79, type: 'Premium', color: '#10b981' },
  { name: '어법 (Deep-set vs Shallow)', value: 0.62, type: 'Premium', color: '#10b981' },
  { name: '선도 하락 (추가 조업일수 1일당)', value: -0.14, type: 'Penalty', color: '#ef4444' }
];

export default function SasHedonicPriceFactors() {
  return (
    <WidgetCard
      id="W-SAS10"
      title="프리미엄 생물 참치의 쾌락적(Hedonic) 가격 결정 요인"
      description="하와이 경매 단가 기준, 속성별 가격 프리미엄/할인 ($/lb)"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="호놀룰루 경매 쾌락적(Hedonic) 가격모델 — 눈다랑어 +$0.79·딥셋 +$0.62·조업일 1일당 -$0.14/lb"
      takeaway={{ 
        situation: "하와이 경매 데이터를 분석한 쾌락적 모델에 따르면, 빅아이(Bigeye)는 황다랑어 대비 0.79$/lb의 프리미엄을, 심해조업(Deep-set)은 0.62$/lb의 프리미엄을 받습니다. 반면 조업일수가 1일 늘어날 때마다 선도 저하로 0.14$/lb의 페널티가 발생합니다.", 
        actionPlan: "선상 빙장(Iced) 기간을 최소화하는 쾌속 조업(Short-trip) 선단과의 계약이 단가 방어에 절대적이며, Shallow-set 보다는 Deep-set 어법 원물 확보에 주력해야 합니다.", 
        source: "Honolulu Auction Hedonic Price Model" 
      }}
      customBody={
        <div style={{ height: 256, width: '100%', marginTop: 8 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={HEDONIC_DATA}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={2} />
              <XAxis type="number" unit="$" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[-0.3, 1]} />
              <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 11, fontWeight: 600, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: '#e2e8f0' }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#cbd5e1' }}
                formatter={(value: number, name: string, props: any) => [
                  `${value > 0 ? '+' : ''}$${value}/lb`, 
                  props.payload.type === 'Premium' ? '가치 상승 (Premium)' : '가치 하락 (Penalty)'
                ]}
              />
              <Bar dataKey="value" barSize={32} radius={4} isAnimationActive={false}>
                {HEDONIC_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
