import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { AlertTriangle } from 'lucide-react';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const data = [
  { year: '2020', tac: 120, real: 105 },
  { year: '2021', tac: 130, real: 90 },
  { year: '2022', tac: 115, real: 85 },
  { year: '2023', tac: 115, real: 70 },
  { year: '2024', tac: 120, real: 60 }
];

export default function FishStatTACIllusion() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>TAC 허구율 게이지 (TAC Illusion Gap)</h3>
        <TermTooltip term="어획 달성 허구율" description="정부가 안심용으로 발표하는 목표 TAC(총허용어획량) 대비 실제 연말 조업분이 턱없이 미달나는 현실의 Gap" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <AlertTriangle size={20} color="var(--color-danger)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--color-danger)' }}>Situation:</strong> 언론의 "수산물 물량 넉넉" 기사와 달리, 실제 연말 조업 달성률은 50%대를 전전탁.<br/>
          <strong style={{ color: 'var(--color-danger)' }}>Takeaway:</strong> 연초 TAC 증량 뉴스로 가격이 빠졌을 때 선제적 매집(Long Position), 연말 공급난에 초과 수익 전략.
        </div>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <YAxis dataKey="year" type="category" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: 'none', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            {/* Background bar simulating Bullet Chart target (TAC) */}
            <Bar dataKey="tac" name="정부 TAC 할당 목표량" fill="url(#a11y-stripe-h)" color="rgba(255,255,255,0.1)" barSize={40} />
            {/* Inner bar simulating Bullet Chart measure (Real) */}
            <Bar dataKey="real" name="실제 조업 달성량 (Real)" fill="url(#a11y-diag)" color="var(--color-warning)" barSize={16} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
