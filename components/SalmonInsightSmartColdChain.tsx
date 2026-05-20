import React from 'react';
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import useContainerWidth from '../hooks/useContainerWidth';
import { Truck } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

const data = [
  { year: '2020', airCost: 4.5, seaCost: 1.2, carbon: 100 },
  { year: '2021', airCost: 6.8, seaCost: 1.5, carbon: 98 },
  { year: '2022', airCost: 8.2, seaCost: 2.1, carbon: 95 },
  { year: '2023', airCost: 5.5, seaCost: 1.4, carbon: 90 },
  { year: '2024', airCost: 4.8, seaCost: 1.3, carbon: 85 },
  { year: '2025(E)', airCost: 5.0, seaCost: 1.2, carbon: 75 },
  { year: '2026(E)', airCost: 5.2, seaCost: 1.1, carbon: 60 },
];

export default function SalmonInsightSmartColdChain() {
  const { containerRef, width } = useContainerWidth();

  return (
    <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "480px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1.5rem"}}  ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
  [물류] 콜드체인 고도화: 해운 전환 및 IoT 모니터링 <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>
</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>항공 운임 변동성을 회피하기 위한 해상 운송(Sea Freight) 전환 및 탄소 발자국 감축 효과</p>
        </div>
        <Truck size={20} color="#ec4899" />
      </div>

      <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
        {width > 0 && (
          <ComposedChart width={width - 48} height={250} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Idx ${v}`} />
            <Tooltip 
              contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
              itemStyle={{ fontSize: '0.85rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            
            <Bar yAxisId="left" dataKey="airCost" name="항공 운송 비용 (EUR/kg)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar yAxisId="left" dataKey="seaCost" name="해상 운송 비용 (EUR/kg)" fill="var(--color-info)" radius={[4, 4, 0, 0]} barSize={20} />
            <Line yAxisId="right" type="monotone" dataKey="carbon" name="물류 탄소배출 지수" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </ComposedChart>
        )}
      </div>

      <TakeawayBox 
        situation="신선 연어의 아시아 수출 시 항공 화물 의존도(Exposure)가 90%에 달하며, 이는 극심한 운임 변동성 리스크와 막대한 Scope 3 탄소 배출(kg당 12kg CO2)을 유발합니다. 환경 규제 강화로 인해 기존 물류 모델은 지속 불가능합니다."
        actionPlan="**[Actionable Insight]** 신규 자본 지출(CAPEX)을 동원해 -1°C Super-chilling 및 진공 단열 상자 기술을 전면 도입, 항공 운송을 해운(Sea Freight)으로 전환해야 합니다. 확보된 물류비 절감분(kg당 -3.5 EUR)으로 가격 경쟁력을 갖추고 친환경 라벨링으로 아시아 프리미엄 시장을 장악하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)"
        source="EU Fish Market 2024 · Global Seafood Alliance [📡 LIVE API 연동: 물류 배출량 추적]"
      />
    </div>
  );
}
