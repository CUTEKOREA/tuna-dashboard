import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import useContainerWidth from '../hooks/useContainerWidth';
import { Factory } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

const data = [
  { year: '2020', yield: 68.0, manualCost: 100, capex: 20 },
  { year: '2021', yield: 68.5, manualCost: 98, capex: 30 },
  { year: '2022', yield: 69.2, manualCost: 90, capex: 50 },
  { year: '2023', yield: 70.8, manualCost: 75, capex: 75 },
  { year: '2024', yield: 72.5, manualCost: 60, capex: 100 },
];

export default function SalmonInsightAutomationYield() {
  const { containerRef, width } = useContainerWidth();

  return (
    <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "480px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1.5rem"}}  ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
  [가공] AI 기반 수율 극대화 & 스마트 팩토리 CAPEX <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>
</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>가공 장비(BAADER 등) 자동화에 따른 수율 향상 및 인건비 절감 효과 분석</p>
        </div>
        <Factory size={20} color="var(--color-warning)" />
      </div>

      <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
        {width > 0 && (
          <ComposedChart width={width - 48} height={250} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        )}
      </div>

      <TakeawayBox 
        situation="북미 및 유럽 가공 허브의 극심한 노동력 부족과 임금 인상이 가공 마진을 압박하고 있음. 수작업에 의존하는 기존 방식은 연간 10~15%의 생산성 손실과 품질 불균일성을 야기함."
        actionPlan="**[Actionable Insight]** BAADER 581 Pro와 같은 모듈형 자동화 시스템(필렛팅 및 트림 통합)을 전면 도입해야 함. 이는 수율을 3~4% 향상시키고 수작업 의존도(Exposure)를 40% 감소시켜 즉각적인 재무적 Bottom-line(순이익)을 창출하며, IoT 기반 예지보전으로 다운타임을 원천 차단함."
        source="The Global Salmon Industry Value Chain Outlook 2024-2026 / BAADER Data"
      />
    </div>
  );
}
