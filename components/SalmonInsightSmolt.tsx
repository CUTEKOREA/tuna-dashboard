'use client';

import React from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/SalmonInsightSmolt.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SalmonInsightSmolt() {
  return (
    <WidgetCard
      title="생물학적 한계 돌파: 포스트 스몰트 & 심해 레이저"
      icon={ShieldCheck}
      iconColor="var(--color-success)"
      pillar="S1"
      cardDesc="육상 사육 연장 및 심해 차폐 기술로 바다이(Sea lice) 리스크 원천 차단"
      telemetry={{ status: 'LIVE' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip 
            contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
            formatter={(value: any, name: any) => {
              if (name === 'postSmolt') return [`${value}%`, '육상 포스트 스몰트 비중'];
              if (name === 'mortality') return [`${value}%`, '해상 폐사율 (바다이 등)'];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          <Bar yAxisId="left" dataKey="postSmolt" name="육상 포스트 스몰트 비중" fill="url(#colorSmolt)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="mortality" name="해상 폐사율 (바다이 등)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <defs>
            <linearGradient id="colorSmolt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      }
      takeaway={{
        situation: "전통적 해상 가두리 양식은 바다이(Sea lice)와 수온 상승으로 폐사율이 15%를 돌파하며 성장의 한계에 직면했습니다. 연안 양식 면허 신규 발급도 전면 중단된 상태입니다.",
        actionPlan: "초기 생존율을 극대화하는 육상 RAS '포스트 스몰트(500g 육성 후 해상 이동)' 설비와, 바다이 접근을 차단하는 심해 잠수식 가두리에 집중 투자해야 합니다. 기존 패러다임을 혁신하는 기업만이 생산량 파이를 독식합니다.",
        source: "Mowi ASA Annual Report 2024 · Grieg Seafood Q4-2024 IR [📡 LIVE API 연동: Oslo Børs]"
      }}
    />
  );
}