'use client';

import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Factory } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import rawData from '../data/salmonInsightMarginSqueeze.json';

export default function SalmonInsightMarginSqueeze() {
  return (
    <WidgetCard
      title="[가공] EU 훈제 연어 마진 압박과 가격 결정력 (Pricing Power)"
      icon={Factory}
      iconColor="var(--color-success)"
      pillar="S2"
      cardDesc="EU 훈제 연어 생산량(천 톤) vs 단가(EUR/kg) 및 폴란드 점유율 추이"
      telemetry={{ status: 'LIVE API' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}k`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
          <Tooltip 
            contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          
          <Bar yAxisId="left" dataKey="volume" name="EU 훈제 연어 생산량 (천 톤)" fill="url(#a11y-stripe-h)" color={A11Y_PALETTE[0]} radius={[4, 4, 0, 0]} barSize={20} />
          <Bar yAxisId="left" dataKey="polShare" name="폴란드 점유율 (%)" fill="url(#a11y-diag)" color={A11Y_PALETTE[3]} radius={[4, 4, 0, 0]} barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="unitValue" name="훈제 연어 단가 (EUR/kg)" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: "EU 훈제 연어 단가가 2019년 15 EUR/kg에서 2023년 19 EUR/kg로 급등했습니다. 그러나 사료, 에너지, 물류 비용의 동반 폭등으로 실질 마진은 심각한 압박을 받고 있습니다. 폴란드는 7만 7천 톤(EU 전체의 48%)을 독점 처리하며 밸류체인 내 병목점(Chokepoint)으로 작용하고 있습니다.",
        actionPlan: "경직된 장기 고정가 공급 계약(Long-term contract) 비중을 대폭 축소하고, 매입원가 연동형 유연 계약(Index-linked pricing) 모델을 즉각 도입하여 비용 상승분을 바이어에게 전가(Pass-through)할 수 있는 가격 결정력을 확보해야 합니다. 동시에 폴란드 집중 리스크를 분산하기 위해 동유럽 가공 허브 다변화를 추진.",
        source: "EUMOFA Trade Data [📡 LIVE API 연동: Eurostat PRODCOM]"
      }}
    />
  );
}
