import React from 'react';
import { Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import { Factory } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSalmonData } from '@/lib/data/salmon';
import { ChartPatternDefs } from './ChartPatterns';

const rawData = getSalmonData('automationYield');

export default function SalmonInsightAutomationYield() {
  return (
    <WidgetCard
      title="[가공] AI 기반 수율 극대화 & 스마트 팩토리 CAPEX"
      icon={Factory}
      iconColor="var(--color-warning)"
      pillar="S2"
      cardDesc="자동화 수율·인건비·CAPEX 지수는 업계 통념 기반 자체 추정 시나리오(illustrative) — 특정 1차 출처 미연동"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Index ${v}`} />
          <Tooltip 
            contentStyle={{ background: '#11182f', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          
          <Area yAxisId="left" type="monotone" dataKey="yield" name="제품 수율(Yield %)" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.2} />
          <Line yAxisId="right" type="monotone" dataKey="manualCost" name="인건비 지수" stroke="var(--color-danger)" strokeWidth={3} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="capex" name="자동화 설비 CAPEX 지수" stroke="var(--w-violet-500)" strokeWidth={2} strokeDasharray="5 5" />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"자동화 수율(Automation Yield)"은 수작업 vs 자동화 가공의 수율·인건비 비교 KPI.</p>
<p>현 위기: <strong>북미·유럽 가공 허브의 노동력 부족 + 임금 인상으로 수작업 의존 vendor의 생산성·품질 균일성 압박</strong> (정량 손실폭은 자체 추정 시나리오).</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 자동화는 단순 cost 절감이 아닌 <strong>"향후 5년 vendor 생존 instrument"</strong>.</p>
<p><strong>3단계</strong>: ① 모듈형 가공 자동화(필렛팅·트림 통합) 단계적 도입 ② 수율 개선 및 수작업 의존도 축소 목표 설정(개선폭은 자체 추정) ③ IoT 예지보전으로 다운타임 저감.</p>
</div>`,
        source: "자체 추정 시나리오 (illustrative) — 가공 자동화 수율·CAPEX 통념 기반, 검증된 1차 출처 미연동"
      }}
    />
  );
}
