'use client';
import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_safety_premium.json';

export default function MackerelSafetyPremium() {
  const data = rawData as any[];

  const ChartObj = (
    <div style={{ height: '250px', width: '100%' }}>
      <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <YAxis type="category" dataKey="region" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }} />
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
        <Bar dataKey="before" name="안전 사태 이전 ($ Index)" fill="rgba(255,255,255,0.15)" radius={[0,4,4,0]} barSize={14} />
        <Bar dataKey="after" name="안전 사태 이후 ($ Index)" fill="#0ea5e9" radius={[0,4,4,0]} barSize={14}>
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.region.includes('한국') ? '#38bdf8' : entry.region === '일본산' ? 'var(--color-danger)' : '#64748b'} />
          ))}
        </Bar>
      </BarChart>
    </div>
  );

  return (
    <WidgetCard
      title="후쿠시마 지정학적 안전 프리미엄"
      icon={ShieldCheck}
      iconColor="#38bdf8"
      pillar="S4"
      cardDesc="후쿠시마 등 대외 안전 악재 이전(Before)/이후(After) 아프리카 훈제 시장 내 한국산 원물이 얻게 된 판가 프리미엄 수준을 비교합니다."
      telemetry={{ status: 'STATIC', syncDate: '2023-Q4' }}
      customBody={ChartObj}
      takeaway={{
        situation: "지정학적 식품 안전(Radioactivity) 이슈로 글로벌 바이어들의 일본산 펠라직(Pelagic) 기피 현상이 트리거(Trigger)되며, 한국산이 아프리카 권역에서 강한 펀더멘털 대체재(Substitute)로 급부상(+38% 볼륨 팽창)하는 구조적 반사이익(Windfall) 국면입니다.",
        actionPlan: "[Quality Moat Construction] 일회성 무역풍(Tailwind)에 안주하지 마십시오. 즉시 선적 물량 100%에 대해 제3자 국가공인 방사능 안전검사(QR 트래킹) 패키징을 강제 의무화하여, 단순 원물 수출을 진입 장벽이 완벽히 구축된 '청정 프리미엄 원료(Clean-Label)' 브랜드 비즈니스로 수직 상승시켜야 합니다.",
        source: "FAOSTAT 및 자체 가공 무역 데이터",
      }}
    />
  );
}
