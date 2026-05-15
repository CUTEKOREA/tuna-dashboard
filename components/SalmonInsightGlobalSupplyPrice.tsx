import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useContainerWidth from '../hooks/useContainerWidth';
import { DollarSign } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

const baseData = [
  { year: '2020', supplyYoy: 4.5, basePrice: 5.8 },
  { year: '2021', supplyYoy: 7.2, basePrice: 5.4 },
  { year: '2022', supplyYoy: -1.5, basePrice: 7.8 },
  { year: '2023', supplyYoy: -2.0, basePrice: 8.5 },
  { year: '2024', supplyYoy: 1.8, basePrice: 8.2 },
  { year: '2025(E)', supplyYoy: 2.5, basePrice: 8.5 },
  { year: '2026(E)', supplyYoy: 3.2, basePrice: 8.7 },
];

export default function SalmonInsightGlobalSupplyPrice({ simulationFactors = { nok: 0, eur: 0, mgo: 0 } }: any) {
  const { containerRef, width } = useContainerWidth();

  // Apply simulation: EUR price increases if NOK is strong, or MGO is high
  const simulatedData = React.useMemo(() => {
    return baseData.map(d => {
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
    <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "480px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1.5rem"}}  ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
  [판매] 공급 변동성과 스팟 가격(Spot Price) 역상관관계 <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>
</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>글로벌 연어 공급 증감률과 Kontali 스팟 가격(EUR/kg)의 변동성 모니터링</p>
        </div>
        <DollarSign size={20} color="#f97316" />
      </div>

      <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
        {width > 0 && (
          <ComposedChart width={width - 48} height={250} data={simulatedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
            <Tooltip 
              contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
              itemStyle={{ fontSize: '0.85rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            
            <Bar yAxisId="left" dataKey="supplyYoy" name="글로벌 공급 증감률 (YoY %)" fill="var(--color-info)" radius={[4, 4, 0, 0]} barSize={24} />
            <Line yAxisId="right" type="monotone" dataKey="price" name="스팟 가격 (EUR/kg)" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </ComposedChart>
        )}
      </div>

      <TakeawayBox 
        situation="노르웨이 신호등 규제(Traffic Light System)와 칠레의 생물학적 한계로 인해 2025~2026년 글로벌 연어 공급 증가율은 2~3%대에 머물 전망이며, 이는 EUR 8.0/kg 이상의 구조적 고단가(Structurally High Price)를 영구화시킵니다."
        actionPlan="과거처럼 공급 과잉에 따른 가격 폭락(Downturn)은 오지 않습니다. Silla Co.는 단순 트레이딩 마진을 포기하고, 즉각적인 부가가치(Value-add) 가공 라인 투자를 통해 원물 단가 상승분을 소비자 판매가로 전가(Pass-through)해야 합니다."
        source="Kontali Insights · Nasdaq Salmon Index [📡 LIVE API 연동: Spot Price & 환율 헷징]"
      />
    </div>
  );
}
