'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Diamond } from 'lucide-react';
import data from '../data/pollock_premium_spread.json';
import WidgetCard from './WidgetCard';

export default function PollockPremiumSpread() {
  return (
    <WidgetCard
      title="싱글 프로즌(미국산) VS 더블 프로즌(중/러) 프리미엄"
      icon={Diamond}
      iconColor="#3b82f6"
      pillar="S4"
      cardDesc="명태 단가 — 미국 싱글 프로즌 vs 중국·러시아 더블 프로즌의 연도별 스프레드 비교"
      telemetry={{ status: 'STATIC', syncDate: 'UN Comtrade 2024' }}
      chartHeight={260}
      chart={
        <LineChart data={data as any[]} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} domain={['dataMin - 500', 'dataMax + 500']} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} formatter={(value: any) => [`$${value.toLocaleString()}/ton`, '']} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
          <Line type="monotone" dataKey="usa_price" name="미국산 수입 단가 (US Single Frozen)" stroke="var(--color-info)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-info)' }} />
          <Line type="monotone" dataKey="china_price" name="중국산 수입 단가 (CN Double Frozen)" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="russia_price" name="러시아산 수입 단가 (RU H&G/Double)" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="3 3" />
        </LineChart>
      }
      takeaway={{
        situation: '러시아산 원물(H&G) 및 중국산 가공품(Double-Frozen) 가격이 하락 안정세를 보이는 반면, 미국산 싱글 프로즌은 고가 프리미엄($2,500 이상)을 방어하며 스프레드 확대.',
        actionPlan: '단순 H&G 원물 무역에서 벗어나 선상 가공(Single-Frozen) 능력 확보 또는 해당 물량 장기 입도선매로 최고급 백색육 시장(B2C 프리미엄) 필렛 공급망 확충 시 프리미엄 스프레드 마진 확보 가능.',
        source: 'UN Comtrade · NMFS 명태 단가 (2018-2024)',
      }}
    />
  );
}
