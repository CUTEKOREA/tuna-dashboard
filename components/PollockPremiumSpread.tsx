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
      telemetry={{ status: 'STATIC', syncDate: 'UN Comtrade 2023' }}
      chartHeight={260}
      chart={
        <LineChart data={data as any[]} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}`} domain={['dataMin - 500', 'dataMax + 500']} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} formatter={(value: any) => [`$${value.toLocaleString()}/ton`, '']} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
          <Line type="monotone" dataKey="usa_price" name="미국산 수입 단가 (싱글 프로즌)" stroke="var(--color-info)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-info)' }} />
          <Line type="monotone" dataKey="china_price" name="중국산 수입 단가 (더블 프로즌)" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="russia_price" name="러시아산 수입 단가 (반가공·더블)" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="3 3" />
        </LineChart>
      }
      takeaway={{
        situation: '러시아산 원물(반가공·H&G) 및 중국산 가공품(더블 프로즌) 가격이 2022년 이후 하락·안정세를 보이는 반면, 미국산 싱글 프로즌은 2022-2023년 기준 $2,500~$2,550/톤 수준을 유지하며 상대적 프리미엄 지위를 지속 중.',
        actionPlan: '단순 반가공 원물 무역에서 벗어나 선상 가공(싱글 프로즌) 물량 장기 입도선매로 최고급 백색육 필렛 공급망을 확충할 경우 러시아·중국산 대비 프리미엄 마진 확보 가능성이 높아진다.',
        source: 'UN Comtrade · NMFS 명태 단가 (2019-2023)',
      }}
    />
  );
}
