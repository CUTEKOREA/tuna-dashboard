import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import { Factory } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/salmonInsightAutomationYield.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SalmonInsightAutomationYield() {
  return (
    <WidgetCard
      title="[가공] AI 기반 수율 극대화 & 스마트 팩토리 CAPEX"
      icon={Factory}
      iconColor="var(--color-warning)"
      pillar="S2"
      cardDesc="가공 장비(BAADER 등) 자동화에 따른 수율 향상 및 인건비 절감 효과 분석"
      telemetry={{ status: 'LIVE' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Index ${v}`} />
          <Tooltip 
            contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          
          <Area yAxisId="left" type="monotone" dataKey="yield" name="제품 수율(Yield %)" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.2} />
          <Line yAxisId="right" type="monotone" dataKey="manualCost" name="인건비 지수" stroke="var(--color-danger)" strokeWidth={3} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="capex" name="자동화 설비 CAPEX 지수" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"자동화 수율(Automation Yield)"은 수작업 vs 자동화 가공의 수율·인건비 비교 KPI.</p>
<p>현 위기: <strong>북미·유럽 가공 허브 극심한 노동력 부족 + 임금 인상 → 수작업 의존 vendor 연간 -10~15% 생산성 손실 + 품질 불균일성</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 자동화는 단순 cost 절감이 아닌 <strong>"향후 5년 vendor 생존 instrument"</strong>.</p>
<p><strong>3단계</strong>: ① BAADER 581 Pro 모듈형 자동화(필렛팅·트림 통합) 전면 도입 ② 수율 +3~4% + 수작업 의존도 -40% ③ IoT 예지보전 — 다운타임 원천 차단.</p>
</div>`,
        source: "The Global Salmon Industry Value Chain Outlook 2024-2026 / BAADER Data"
      }}
    />
  );
}
