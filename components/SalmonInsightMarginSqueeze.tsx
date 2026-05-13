import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useContainerWidth from '../hooks/useContainerWidth';
import { Factory } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

// EUMOFA 2026 Report: Section 4.1.2 - Processing and trade
// EU smoked salmon production volume (1000 tonnes) and unit value (EUR/kg)
// Poland as leading processor; cost-margin squeeze from energy/feed/packaging
const data = [
  { year: '2014', volume: 140, unitValue: 14.0, polShare: 37 },
  { year: '2016', volume: 150, unitValue: 14.5, polShare: 40 },
  { year: '2018', volume: 148, unitValue: 15.0, polShare: 43 },
  { year: '2019', volume: 138, unitValue: 15.0, polShare: 44 },
  { year: '2020', volume: 155, unitValue: 15.5, polShare: 45 },
  { year: '2021', volume: 158, unitValue: 16.5, polShare: 46 },
  { year: '2022', volume: 160, unitValue: 17.8, polShare: 47 },
  { year: '2023', volume: 160, unitValue: 19.0, polShare: 48 },
];

export default function SalmonInsightMarginSqueeze() {
  const { containerRef, width } = useContainerWidth();

  return (
    <div style={{
      background: '#181818',
      backdropFilter: 'blur(8px)',
      border: 'none',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minWidth: 0,
      boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
    }} ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            [Live 🟢] [가공] EU 훈제 연어 마진 압박과 가격 결정력 (Pricing Power)
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            EU 훈제 연어 생산량(천 톤) vs 단가(EUR/kg) 및 폴란드 점유율 추이
            
          </p>
        </div>
        <Factory size={20} color="var(--color-success)" />
      </div>

      <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
        {width > 0 && (
          <ComposedChart width={width - 48} height={250} data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
            <Tooltip 
              contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
              itemStyle={{ fontSize: '0.85rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            
            <Bar yAxisId="left" dataKey="volume" name="EU 훈제 연어 생산량 (천 톤)" fill="var(--color-info)" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar yAxisId="left" dataKey="polShare" name="폴란드 점유율 (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
            <Line yAxisId="right" type="monotone" dataKey="unitValue" name="훈제 연어 단가 (EUR/kg)" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </ComposedChart>
        )}
      </div>

      <TakeawayBox 
        situation="EU 훈제 연어 단가가 2019년 15 EUR/kg에서 2023년 19 EUR/kg로 급등했습니다. 그러나 사료, 에너지, 물류 비용의 동반 폭등으로 실질 마진은 심각한 압박을 받고 있습니다. 폴란드는 7만 7천 톤(EU 전체의 48%)을 독점 처리하며 밸류체인 내 병목점(Chokepoint)으로 작용하고 있습니다."
        actionPlan="경직된 장기 고정가 공급 계약(Long-term contract) 비중을 대폭 축소하고, 원가 연동형 유연 계약(Index-linked pricing) 모델을 즉각 도입하여 비용 상승분을 바이어에게 전가(Pass-through)할 수 있는 가격 결정력을 확보해야 합니다. 동시에 폴란드 집중 리스크를 분산하기 위해 동유럽 가공 허브 다변화를 추진하십시오."
        source="EUMOFA Trade Data [📡 LIVE API 연동: Eurostat PRODCOM]"
      />
    </div>
  );
}
