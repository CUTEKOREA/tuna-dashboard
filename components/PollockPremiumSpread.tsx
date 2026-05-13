'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Diamond } from 'lucide-react';
import data from '../data/pollock_premium_spread.json';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';

export default function PollockPremiumSpread() {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
        <Diamond size={20} color="var(--color-info)" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          싱글 프로즌(미국산) VS 더블 프로즌(중/러) 프리미엄 
        </h3>
      </div>
      
      <div style={{ height: '260px', width: '100%', flexShrink: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} domain={['dataMin - 500', 'dataMax + 500']} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: any) => [`$${value.toLocaleString()}/ton`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            <Line type="monotone" dataKey="usa_price" name="미국산 수입 단가 (US Single Frozen)" stroke="var(--color-info)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-info)' }} />
            <Line type="monotone" dataKey="china_price" name="중국산 수입 단가 (CN Double Frozen)" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="russia_price" name="러시아산 수입 단가 (RU H&G/Double)" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="3 3" />
          </LineChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox
        situation="차트를 보면 러시아산 원물(H&G) 및 중국산 가공품(Double-Frozen) 가격이 하락 안정세를 보이는 반면, 극소수의 미국산 '싱글 프로즌' 제품은 고가의 프리미엄 가격대($2,500 이상)를 견고하게 방어하며 스프레드(단가 차이)가 벌어지고 있습니다."
        actionPlan="단순 H&G 원물 무역에서 벗어나, 선상 가공(Single-Frozen) 능력을 확보하거나 해당 물량을 장기 입도선매하여 최고급 백색육 시장(B2C 프리미엄 마켓)용 필렛 공급망을 확충할 경우 경쟁사 대비 압도적인 마진율(Premium Spread)을 취할 수 있습니다."
      />
    </div>
  );
}
