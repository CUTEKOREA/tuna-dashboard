import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Target } from 'lucide-react';
import TermTooltip from './TermTooltip';

const data = [
  { name: '고등어 (Mackerel)', cost: 1200, protein: 20, volume: 800, fill: '#0ea5e9' },
  { name: '계육 (Chicken)', cost: 2500, protein: 23, volume: 1500, fill: 'var(--color-warning)' },
  { name: '돈육 (Pork)', cost: 4500, protein: 21, volume: 1200, fill: 'var(--color-danger)' },
  { name: '우육 (Beef)', cost: 8500, protein: 26, volume: 700, fill: '#8b5cf6' },
  { name: '연어 (Salmon)', cost: 12000, protein: 20, volume: 400, fill: '#f43f5e' },
  { name: '전갱이 (Jack Mackerel)', cost: 900, protein: 18, volume: 950, fill: 'var(--color-success)' },
];

export default function FishStatProteinBubble() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>단백질 가성비 매트릭스 (Protein Cost-Efficiency)</h3>
        <TermTooltip term="가성비 우하단 포지셔닝" description="X축의 단가가 타 육류 대비 현저히 낮으면서 Y축의 단백질량은 대등하게 유지되는 최고 영업 방어도 구간" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <Target size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--color-success)' }}>Situation:</strong> 고물가 인플레이션 속에서 타 육류 대비 X축 최좌측(저단가) 우위 입증.<br/>
          <strong style={{ color: 'var(--color-success)' }}>Takeaway:</strong> 예산이 타이트한 B2B(학교, 공공급식) 입찰 시 닭고기 타겟팅 대체제로 적극 제안 편성.
        </div>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis type="number" dataKey="cost" name="톤당 단가($)" unit="$" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis type="number" dataKey="protein" name="단백질(g/100g)" unit="g" domain={[15, 28]} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <ZAxis type="number" dataKey="volume" range={[100, 1000]} name="거래 볼륨" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: 'none', borderRadius: '8px' }} formatter={(value: any, name: any) => name === '거래 볼륨' ? value : name === '톤당 단가($)' ? `$${value}` : `${value}g`} />
            <Scatter name="단백질 매트릭스" data={data}>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Scatter>
          </ScatterChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
