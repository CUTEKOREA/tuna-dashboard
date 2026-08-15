import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Anchor } from 'lucide-react';
import TermTooltip from './TermTooltip';

const data = [
  { month: 'Q1', japanBase: 100, norwayPrem: 110, koreaPrem: 105 },
  { month: 'Q2', japanBase: 95, norwayPrem: 120, koreaPrem: 110 },
  { month: 'Q3', japanBase: 80, norwayPrem: 160, koreaPrem: 140 }, // Fukushima Issue Escalation
  { month: 'Q4', japanBase: 65, norwayPrem: 190, koreaPrem: 175 },
  { month: 'N1', japanBase: 70, norwayPrem: 185, koreaPrem: 160 }
];

export default function FishStatSafetyGap() {
  return (
    <div style={{ background: 'rgba(0, 20, 40, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '24px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>안전 마진 프리미엄 (Safety Margin Gap)</h3>
        <TermTooltip term="지정학적 안전 마진" description="후쿠시마 등 오염 리스크가 제기될 때 지리적으로 단절된 북대서양(노르웨이) 원물에 부과되는 초과 수익 마진" />
      </div>
      
      <div style={{ padding: '16px', background: 'rgba(14, 165, 233, 0.1)', borderLeft: '4px solid #0ea5e9', borderRadius: '4px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <Anchor size={20} color="#0ea5e9" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
          <strong style={{ color: '#0ea5e9' }}>Situation:</strong> 아시아산 저가 공세에도 불구하고 노르웨이 및 검증된 한국산 원물의 초과 마진(Gap) 고공행진.<br/>
          <strong style={{ color: '#0ea5e9' }}>Takeaway:</strong> 무조건적 가격 인하 대신 "100% 방사능 클린 인증" 마케팅 프레이밍 전개 유지.
        </div>
      </div>

      <div style={{ height: '240px', width: '100%' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis domain={[50, 200]} tickFormatter={(val) => `Index ${val}`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: 'none', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="japanBase" name="오염수 인접수역 Base" stroke="var(--w-slate-500)" fill="var(--w-slate-500)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="koreaPrem" name="한국산 (검증) 프리미엄" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.4} />
            <Area type="monotone" dataKey="norwayPrem" name="노르웨이 초과 프리미엄" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );
}
