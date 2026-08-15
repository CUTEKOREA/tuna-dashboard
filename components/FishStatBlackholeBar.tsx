import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { AlertTriangle } from 'lucide-react';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs } from './ChartPatterns';

const data = [
  { year: '2020', feed: 45, consumption: 55 },
  { year: '2021', feed: 52, consumption: 48 },
  { year: '2022', feed: 58, consumption: 42 },
  { year: '2023', feed: 65, consumption: 35 },
  { year: '2024', feed: 72, consumption: 28 }
];

export default function FishStatBlackholeBar() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>생사료 블랙홀 (Fishmeal Blackhole)</h3>
        <TermTooltip term="명목 어획량 착시" description="데이터상 총 생산량은 유지되어도, 양식장 사료/어분(Fishmeal)으로 유출되는 비중이 커져 인간 프랩 유통은 고갈 증세" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--w-amber-500)', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <AlertTriangle size={20} color="var(--color-warning)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--color-warning)' }}>Situation:</strong> 양식용(참치, 넙치) 생사료 투입 비중이 70%를 돌파하며 B2C 상품 품귀 가속화.<br/>
          <strong style={{ color: 'var(--color-warning)' }}>Takeaway:</strong> 벤더 단가 인상 저항 시 "비식용 고갈 통계 지표"를 즉각 활용하여 방어 논리 구사.
        </div>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
            <XAxis type="number" tickFormatter={(val) => `${val}%`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <YAxis dataKey="year" type="category" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: 'none', borderRadius: '8px' }} formatter={(value: any) => `${value}%`} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="feed" stackId="a" name="비식용 (양식 사료/어분)" fill="var(--color-danger)" radius={[0, 0, 0, 4]} />
            <Bar dataKey="consumption" stackId="a" name="인간 식용 (Consumption)" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
