'use client';

import React from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import { DollarSign } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/salmonInsightFeed.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SalmonInsightFeed() {
  return (
    <WidgetCard
      title="마진율 방어: 사료 내재화 & 기능성 대체 원료"
      icon={DollarSign}
      iconColor="var(--color-success)"
      pillar="S1"
      cardDesc="양식 원가의 60%를 차지하는 사료를 전략적으로 내재화하고 기능성 단백질 도입"
      telemetry={{ status: 'LIVE API' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}M`} />
          <Tooltip 
            contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
            formatter={(value: any, name: any) => {
              if (name === 'marine') return [`${value}%`, '전통 어분/어유 비중'];
              if (name === 'alt') return [`${value}%`, '대체 단백질 비중'];
              if (name === 'savings') return [`${value}M EUR`, '내재화 및 대체원료 원가 절감액'];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          
          <Area yAxisId="left" type="monotone" dataKey="marine" name="전통 어분/어유 비중" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
          <Area yAxisId="left" type="monotone" dataKey="alt" name="대체 단백질 비중" stackId="1" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.6} />
          
          <Line yAxisId="right" type="monotone" dataKey="savings" name="내재화 및 대체원료 원가 절감액" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: "기후 변화(엘니뇨 등)로 인한 어분(Fishmeal) 가격의 변동성이 EBITDA 마진을 훼손하고 있습니다. 매입원가의 60%를 차지하는 사료 통제권 없이는 구조적 수익성 방어가 불가능합니다.",
        actionPlan: "글로벌 1위 Mowi처럼 사료 밸류체인을 전면 내재화(In-house)하거나 독점 파트너십을 구축해야 합니다. 어분 의존도(Exposure)를 낮출 수 있는 곤충/미세조류 기반 대체 단백질 스타트업 M&A를 즉각 검토.",
        source: "Mowi ASA Annual Report 2024 · BioMar Sustainability 2024 [📡 LIVE API 연동: FAO FishPrice]"
      }}
    />
  );
}
