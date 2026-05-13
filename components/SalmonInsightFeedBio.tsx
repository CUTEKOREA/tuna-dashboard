import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import useContainerWidth from '../hooks/useContainerWidth';
import { Fish } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import EstimateBadge from './EstimateBadge';

const data = [
  { year: '2020', fifo: 1.05, marine: 35, alt: 10 },
  { year: '2021', fifo: 0.95, marine: 32, alt: 15 },
  { year: '2022', fifo: 0.85, marine: 28, alt: 22 },
  { year: '2023', fifo: 0.76, marine: 25, alt: 28 },
  { year: '2024', fifo: 0.77, marine: 22, alt: 35 },
];

export default function SalmonInsightFeedBio() {
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
            [원물] 사료 원가 리스크 헷징: 대체 단백질 & FIFO (Fish In-Fish Out)
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            해양 원료(어분/어유) 의존도 감소 및 미세조류/가금류 등 대체 사료 도입을 통한 원가율 통제
            
          </p>
        </div>
        <Fish size={20} color="var(--color-info)" />
      </div>

      <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
        {width > 0 && (
          <ComposedChart width={width - 48} height={250} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-warning)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
              itemStyle={{ fontSize: '0.85rem' }}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            
            <Bar yAxisId="left" dataKey="marine" name="해양 원료 비중(%)" stackId="a" fill="var(--color-info)" radius={[0, 0, 4, 4]} />
            <Bar yAxisId="left" dataKey="alt" name="대체 사료 비중(%)" stackId="a" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            
            <Bar yAxisId="right" dataKey="fifo" name="FIFO (의존도 비율)" fill="var(--color-warning)" barSize={3} />
          </ComposedChart>
        )}
      </div>

      <TakeawayBox 
        situation="사료는 양식 원가의 50~55%를 차지하며, 해수온 상승 및 엘니뇨로 인한 남미 어획량 감소가 어분(Fishmeal) 가격의 극심한 변동성을 야기합니다. 글로벌 연어 양식업계는 이러한 원가 리스크를 피면하기 위해 대체 단백질 도입을 가속화하고 있습니다."
        actionPlan="MOWI 등 선도 기업들은 가금류 부산물, 곤충 단백질, 미세조류를 적극 도입해 FIFO(자연산 어획 의존도)를 0.77까지, 가공 부산물을 재활용한 rFIFO는 0.60까지 통제하는 데 성공했습니다. 우리 역시 대체 사료 파이프라인 및 원료 공급망 지분 투자를 통해 사료 원가 변동성을 구조적으로 헤징(Hedging)해야 합니다."
        source="MOWI Integrated Annual Report 2024 (Empirical Data)"
      />
    </div>
  );
}
