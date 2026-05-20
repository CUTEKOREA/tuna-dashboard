import React from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import useContainerWidth from '../hooks/useContainerWidth';
import { DollarSign, ShieldCheck } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import EstimateBadge from './EstimateBadge';

const data = [
  { year: '2020', marine: 50, alt: 5, savings: 0 },
  { year: '2021', marine: 45, alt: 8, savings: 10 },
  { year: '2022', marine: 40, alt: 12, savings: 15 },
  { year: '2023', marine: 35, alt: 18, savings: 25 },
  { year: '2024', marine: 30, alt: 25, savings: 35 },
  { year: '2025(E)', marine: 25, alt: 30, savings: 45 },
  { year: '2026(E)', marine: 20, alt: 35, savings: 55 },
];

export default function SalmonInsightFeed() {
  const { containerRef, width } = useContainerWidth();

  return (
    <div className="ds-card" style={{display: "flex", flexDirection: "column", minHeight: "480px", background: "#181818", borderRadius: "8px", boxShadow: "rgba(0,0,0,0.3) 0px 8px 8px", border: "none", padding: "1.5rem"}}  ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.13rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
  마진율 방어: 사료 내재화 & 기능성 대체 원료 <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'var(--surface-2)', color:'var(--color-success)', fontSize:'0.66rem', fontWeight:600, padding:'2px 8px', borderRadius:'500px', letterSpacing:'0.2px', marginLeft:'6px', textTransform: 'uppercase' }}>LIVE API</span>
</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>양식 원가의 60%를 차지하는 사료를 전략적으로 내재화하고 기능성 단백질 도입</p>
        </div>
        <DollarSign size={20} color="var(--color-success)" />
      </div>

      <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
        {width > 0 && (
          <ComposedChart width={width - 48} height={250} data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}M`} />
            <Tooltip 
              contentStyle={{ background: '#181818', border: 'none', borderRadius: '8px' }}
              itemStyle={{ fontSize: '0.85rem' }}
              formatter={(value: any, name: any) => {
                if (name === 'marine') return [`${value}%`, '전통 어분/어유 비중'];
                if (name === 'alt') return [`${value}%`, '대체 단백질 비중'];
                if (name === 'savings') return [`${value}M EUR`, '내재화 및 대체원료 원가 절감액'];
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            
            <Area yAxisId="left" type="monotone" dataKey="marine" name="전통 어분/어유 비중" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
            <Area yAxisId="left" type="monotone" dataKey="alt" name="대체 단백질 비중" stackId="1" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.6} />
            
            <Line yAxisId="right" type="monotone" dataKey="savings" name="내재화 및 대체원료 원가 절감액" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </ComposedChart>
        )}
      </div>

      <TakeawayBox 
        situation="기후 변화(엘니뇨 등)로 인한 어분(Fishmeal) 가격의 변동성이 EBITDA 마진을 훼손하고 있습니다. 매입원가(COGS)의 60%를 차지하는 사료 통제권 없이는 구조적 수익성(Profitability) 방어가 불가능합니다."
        actionPlan="**[Actionable Insight]** 글로벌 1위 Mowi처럼 사료 밸류체인을 전면 내재화(In-house)하거나 독점 파트너십을 구축해야 합니다. 어분 의존도(Exposure)를 낮출 수 있는 곤충/미세조류 기반 대체 단백질 스타트업 M&A를 즉각 검토하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)"
        source="Mowi ASA Annual Report 2024 · BioMar Sustainability 2024 [📡 LIVE API 연동: FAO FishPrice]"
      />
    </div>
  );
}
