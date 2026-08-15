import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Workflow } from 'lucide-react';
import TermTooltip from './TermTooltip';

const data = [
  { year: '2019', whole: 75, fillet: 25 },
  { year: '2020', whole: 65, fillet: 35 },
  { year: '2021', whole: 58, fillet: 42 },
  { year: '2022', whole: 45, fillet: 55 }, // Golden Cross
  { year: '2023', whole: 30, fillet: 70 },
  { year: '2024', whole: 15, fillet: 85 }
];

export default function FishStatFilletCurve() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>파괴적 순살 교차 (Fillet Disruption Curve)</h3>
        <TermTooltip term="Fillet Golden Cross" description="에어프라이어 및 1인가구 발달로 통마리(Whole)형태의 수입이 소멸하고 순살 필렛의 유통 비중이 완벽히 역전한 골든 크로스" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--w-blue-500)', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <Workflow size={20} color="var(--color-info)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--color-info)' }}>Situation:</strong> 22년을 기점으로 Round(통마리)와 Fillet(순살)의 B2C 시장 점유율이 완전히 교차 파괴.<br/>
          <strong style={{ color: 'var(--color-info)' }}>Takeaway:</strong> 노르웨이 수입 Contract 체결 시 무조건 현지 내장/뼈 제거 프랩 비율을 85% 이상으로 오더 리밸런싱.
        </div>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis tickFormatter={(val) => `${val}%`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: 'none', borderRadius: '8px' }} formatter={(value: any) => `${value}%`} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Line type="monotone" dataKey="fillet" name="순살 필렛 (Fillet)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-danger)' }} />
            <Line type="monotone" dataKey="whole" name="통마리 (Raw/Whole)" stroke="var(--w-slate-500)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
