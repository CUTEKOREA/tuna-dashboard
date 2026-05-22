import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import { Factory } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/salmonInsightAutomationYield.json';

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
        situation: "북미 및 유럽 가공 허브의 극심한 노동력 부족과 임금 인상이 가공 마진을 압박하고 있음. 수작업에 의존하는 기존 방식은 연간 10~15%의 생산성 손실과 품질 불균일성을 야기함.",
        actionPlan: "BAADER 581 Pro와 같은 모듈형 자동화 시스템(필렛팅 및 트림 통합)을 전면 도입해야 함. 이는 수율을 3~4% 향상시키고 수작업 의존도(Exposure)를 40% 감소시켜 즉각적인 재무적 Bottom-line(순이익)을 창출하며, IoT 기반 예지보전으로 다운타임을 원천 차단함.",
        source: "The Global Salmon Industry Value Chain Outlook 2024-2026 / BAADER Data"
      }}
    />
  );
}
