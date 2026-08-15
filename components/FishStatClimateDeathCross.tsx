import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Target } from 'lucide-react';
import TermTooltip from './TermTooltip';

const data = [
  { year: '2015', krjp: 800, russia: 150 },
  { year: '2017', krjp: 750, russia: 190 },
  { year: '2019', krjp: 550, russia: 260 },
  { year: '2021', krjp: 380, russia: 420 },
  { year: '2023', krjp: 250, russia: 580 },
  { year: '2025', krjp: 180, russia: 750 }
];

export default function FishStatClimateDeathCross() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>어장 한계선 북상 (Climate Death Cross)</h3>
        <TermTooltip term="Death Cross" description="국내 및 일본 수역 생산량이 하락하고 러시아 해역 어획량이 상승하여 서로 교차하는 변곡점 현상" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(var(--w-emerald-500-rgb), 0.1)', borderLeft: '4px solid var(--w-emerald-500)', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <Target size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--color-success)' }}>Situation:</strong> 10년간 한국/일본 연안 수온 급등으로 고등어가 러시아 수역으로 피난.<br/>
          <strong style={{ color: 'var(--color-success)' }}>Takeaway:</strong> 국산 대형 고등어는 프리미엄 브랜딩으로 선회, 대규모 수급은 북태평양/노르웨이에 전면 의존 조율.
        </div>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorKrjp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorRussia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis tickFormatter={(val) => `${val}k`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip formatter={(value: any) => `${value}k Tons`} contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: 'none', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="krjp" name="한·일 합산 어획고" stroke="var(--color-warning)" fill="url(#colorKrjp)" />
            <Area type="monotone" dataKey="russia" name="러시아 극동 어획고" stroke="var(--color-info)" fill="url(#colorRussia)" />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
