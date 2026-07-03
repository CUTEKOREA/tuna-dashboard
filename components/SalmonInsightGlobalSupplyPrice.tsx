import React, { useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DollarSign } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSalmonData } from '@/lib/data/salmon';
import { ChartPatternDefs } from './ChartPatterns';

const rawData = getSalmonData('globalSupplyPrice');

export default function SalmonInsightGlobalSupplyPrice({ simulationFactors = { nok: 0, eur: 0, mgo: 0 } }: any) {
  // Apply simulation: EUR price increases if NOK is strong, or MGO is high
  const simulatedData = useMemo(() => {
    return rawData.map((d: any) => {
      // rough heuristic: 10% MGO increase = 2% price increase
      // 10% NOK increase = 5% price increase in EUR
      const priceImpact = 1 + (simulationFactors.nok * 0.5 + simulationFactors.mgo * 0.2) / 100;
      return {
        ...d,
        price: Number((d.basePrice * priceImpact).toFixed(2))
      };
    });
  }, [simulationFactors]);

  return (
    <WidgetCard
      title="[판매] 공급 변동성과 스팟 가격(Spot Price) 역상관관계"
      cardDesc="글로벌 연어 공급 증감률과 스팟 가격(EUR/kg) 변동성 — 자체 추정 시나리오(illustrative), 시뮬레이션 가중 적용"
      icon={DollarSign}
      iconColor="#f97316"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={250}
      chart={
        <ComposedChart data={simulatedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
          <Tooltip 
            contentStyle={{ background: '#11182f', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          
          <Bar yAxisId="left" dataKey="supplyYoy" name="글로벌 공급 증감률 (YoY %)" fill="var(--color-info)" radius={[4, 4, 0, 0]} barSize={24} />
          <Line yAxisId="right" type="monotone" dataKey="price" name="스팟 가격 (EUR/kg)" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"구조적 고단가(Structurally High Price)"는 공급 제약이 누적될 때 가격 하단(floor)이 높아지는 경향을 가리킵니다.</p>
<p>가정 요인: <strong>노르웨이 신호등 규제(Traffic Light System) + 칠레 생물학적 한계로 2025~2026(E) 글로벌 공급 증가율이 2~3%대에 머물 경우, 스팟 가격이 EUR 8/kg 부근에서 높게 유지될 수 있다는 시나리오</strong> (자체 추정).</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 공급 과잉 가격 폭락 시대 종료. <strong>"단순 트레이딩 → Value-add 가공"</strong>이 본질.</p>
<p><strong>3단계</strong>: ① 단순 트레이딩 마진 포기 ② 부가가치 가공 라인 capex ③ 원물 단가 상승분 소비자 판매가 전가 — Index-linked pricing 도입.</p>
</div>`,
        source: "자체 추정 시나리오(illustrative) — 정적 데이터(STATIC), 실시간 API 미연동. 스팟 가격은 시뮬레이션 가중으로 변형되어 Nasdaq 살몬 지수 원지수와 직접 대조 불가."
      }}
    />
  );
}
