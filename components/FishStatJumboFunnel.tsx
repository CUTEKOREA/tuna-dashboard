import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Target } from 'lucide-react';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs } from './ChartPatterns';

const data = [
  { size: '< 200g (미어)', value: 4500, color: 'var(--color-danger)' },
  { size: '200~300g (중소)', value: 3200, color: 'var(--color-warning)' },
  { size: '300~400g (중대)', value: 1800, color: 'var(--color-info)' },
  { size: '400~500g (대)', value: 400, color: '#8b5cf6' },
  { size: '500g+ (특대-금등어)', value: 30, color: '#d946ef' }
];

export default function FishStatJumboFunnel() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>특대형 병목 깔때기 (Jumbo Squeeze)</h3>
        <TermTooltip term="Squeeze Bottleneck" description="남획으로 인해 500g이 넘는 특대형 사이즈의 어획고가 전체 퍼널의 1% 미만으로 걸러지는 현상" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(217, 70, 239, 0.1)', borderLeft: '4px solid #d946ef', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <Target size={20} color="#d946ef" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: '#d946ef' }}>Situation:</strong> 상위 1% 특대형은 더 이상 대중 시장(할인마트)에 납품할 수 없는 극멸종 구간 진입.<br/>
          <strong style={{ color: '#d946ef' }}>Takeaway:</strong> 오마카세, 하이엔드 다이닝 등 프리미엄 유통망 한정 "블랙 라벨 고등어" 프라이싱 전개.
        </div>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <YAxis dataKey="size" type="category" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={110} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: 'none', borderRadius: '8px' }} formatter={(value: any) => `${value} Tons`} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
