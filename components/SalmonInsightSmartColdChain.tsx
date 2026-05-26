import React from 'react';
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import { Truck } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import rawData from '../data/salmonInsightSmartColdChain.json';

export default function SalmonInsightSmartColdChain() {
  return (
    <WidgetCard
      title="[물류] 콜드체인 고도화: 해운 전환 및 IoT 모니터링"
      icon={Truck}
      iconColor="#ec4899"
      pillar="S3"
      cardDesc="항공 운임 변동성을 회피하기 위한 해상 운송(Sea Freight) 전환 및 탄소 발자국 감축 효과"
      telemetry={{ status: 'LIVE' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Idx ${v}`} />
          <Tooltip 
            contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          
          <Bar yAxisId="left" dataKey="airCost" name="항공 운송 비용 (EUR/kg)" fill={A11Y_PALETTE[5]} radius={[4, 4, 0, 0]} barSize={20} />
          <Bar yAxisId="left" dataKey="seaCost" name="해상 운송 비용 (EUR/kg)" fill={A11Y_PALETTE[0]} radius={[4, 4, 0, 0]} barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="carbon" name="물류 탄소배출 지수" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"Smart Cold Chain"은 신선 연어 콜드체인의 기술 혁신. 항공 → 해운 전환의 핵심 enabler.</p>
<p>현 위기: <strong>신선 연어 아시아 수출 항공 화물 의존도 90% → 운임 변동성 + Scope 3 탄소 배출 kg당 12kg CO2</strong>. EU CBAM·환경 규제 강화로 기존 모델 지속 불가능.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 항공 → 해운 전환은 단순 cost 절감이 아닌 <strong>"향후 5년 vendor whitelist 등재 instrument"</strong>.</p>
<p><strong>3단계</strong>: ① -1°C Super-chilling + 진공 단열 상자 기술 capex 전면 도입 ② 항공 → 해운(Sea Freight) 전환 — 물류비 -3.5 EUR/kg ③ 친환경 라벨링으로 아시아 프리미엄 시장 장악 + EU CBAM 면제 자산화.</p>
</div>`,
        source: "EU Fish Market 2024 · Global Seafood Alliance [📡 LIVE API 연동: 물류 배출량 추적]"
      }}
    />
  );
}
