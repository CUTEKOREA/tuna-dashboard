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
          
          <Bar yAxisId="left" dataKey="airCost" name="항공 운송 비용 (EUR/kg)" fill="url(#a11y-stripe-v)" color={A11Y_PALETTE[5]} radius={[4, 4, 0, 0]} barSize={20} />
          <Bar yAxisId="left" dataKey="seaCost" name="해상 운송 비용 (EUR/kg)" fill="url(#a11y-stripe-h)" color={A11Y_PALETTE[0]} radius={[4, 4, 0, 0]} barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="carbon" name="물류 탄소배출 지수" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: "신선 연어의 아시아 수출 시 항공 화물 의존도(Exposure)가 90%에 달하며, 이는 극심한 운임 변동성 리스크와 막대한 Scope 3 탄소 배출(kg당 12kg CO2)을 유발합니다. 환경 규제 강화로 인해 기존 물류 모델은 지속 불가능합니다.",
        actionPlan: "신규 자본 지출을 동원해 -1°C Super-chilling 및 진공 단열 상자 기술을 전면 도입, 항공 운송을 해운(Sea Freight)으로 전환해야 합니다. 확보된 물류비 절감분(kg당 -3.5 EUR)으로 가격 경쟁력을 갖추고 친환경 라벨링으로 아시아 프리미엄 시장을 장악.",
        source: "EU Fish Market 2024 · Global Seafood Alliance [📡 LIVE API 연동: 물류 배출량 추적]"
      }}
    />
  );
}
