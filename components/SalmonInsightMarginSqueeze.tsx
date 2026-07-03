'use client';

import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Factory } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import { getSalmonData } from '@/lib/data/salmon';

const rawData = getSalmonData('marginSqueeze');

export default function SalmonInsightMarginSqueeze() {
  return (
    <WidgetCard
      title="[가공] EU 훈제 연어 마진 압박과 가격 결정력 (Pricing Power)"
      icon={Factory}
      iconColor="var(--color-success)"
      pillar="S2"
      cardDesc="EU 훈제 연어 생산량(천 톤) vs 단가(EUR/kg) 및 폴란드 점유율 추이 — 자체 추정 시나리오(illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
          <Tooltip 
            contentStyle={{ background: '#11182f', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          
          <Bar yAxisId="left" dataKey="volume" name="EU 훈제 연어 생산량 (천 톤)" fill={A11Y_PALETTE[0]} radius={[4, 4, 0, 0]} barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="polShare" name="폴란드 점유율 (%)" stroke={A11Y_PALETTE[3]} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="unitValue" name="훈제 연어 단가 (EUR/kg)" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"마진 스퀴즈(Margin Squeeze)"란 판가 인상보다 cost 인상이 더 빨라 실질 마진이 축소되는 현상.</p>
<p>EU 훈제 연어: <strong>2019 15 EUR/kg → 2023 19 EUR/kg 판가 상승에도 사료·에너지·물류 동반 상승으로 실질 마진 압박</strong>. <strong>폴란드 점유율이 약 48%(시나리오 추정)</strong>로 가공 물량이 한 곳에 집중되는 밸류체인 병목 구조.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 고정가 계약의 한계가 커지는 국면. <strong>"매입원가 연동(Index-linked) 가격 + 거점 분산"</strong>이 핵심.</p>
<p><strong>3단계</strong>: ① 장기 고정가 계약 대폭 축소 ② 매입원가 연동형 유연 계약(Index-linked) 즉각 도입 — 비용 상승분 바이어 전가 ③ 폴란드 집중 리스크 분산 — 동유럽(체코·헝가리) 가공 허브 다변화.</p>
</div>`,
        source: "자체 추정 시나리오(illustrative) · EUMOFA/Eurostat PRODCOM 공개 통계 기반 가공"
      }}
    />
  );
}
