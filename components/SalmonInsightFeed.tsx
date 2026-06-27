'use client';

import React from 'react';
import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import { DollarSign } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/salmonInsightFeed.json';
import { ChartPatternDefs } from './ChartPatterns';

export default function SalmonInsightFeed() {
  return (
    <WidgetCard
      title="마진율 방어: 사료 내재화 & 기능성 대체 원료"
      icon={DollarSign}
      iconColor="var(--color-success)"
      pillar="S1"
      cardDesc="사료 비중 축소·대체 단백질 전환 시나리오 (자체 추정·illustrative, 1차 출처 미확정)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
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
        situation: `<div>
<p>"사료 통제권(Feed Control)"이란 매입원가 60%를 차지하는 사료 supply에 대한 수직 통합 권한.</p>
<p>현 위기: <strong>기후 변화(엘니뇨)로 어분 가격 변동성 → EBITDA 마진 훼손</strong>. 사료 통제권 없이는 구조적 수익성 방어 불가.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 사료 통제권은 단순 원료 확보가 아닌 <strong>"본업 P&amp;L의 가장 큰 control point"</strong>.</p>
<p><strong>3단계</strong>: ① Mowi 모델 차용 — 사료 밸류체인 전면 in-house화 ② 독점 파트너십(Cargill·Skretting·BioMar) 구축 ③ 곤충·미세조류 기반 대체 단백질 스타트업 M&amp;A 즉각 검토.</p>
</div>`,
        source: "자체 추정·시나리오 (illustrative) — 정량치 1차 출처 미확정. 정성 맥락 참고: Mowi ASA Annual Report 2024, BioMar Sustainability 2024 · STATIC 2026-05-29"
      }}
    />
  );
}
