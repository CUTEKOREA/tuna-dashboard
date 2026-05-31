'use client';

import React from 'react';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ReferenceLine } from 'recharts';
import WidgetCard from '../WidgetCard';

const CO_DATA = [
  {
    name: '베트남산 CO 처리 (Tasteless Smoke)',
    price: 2.50,
    waterWeight: '15~20% 주입 (중량 뻥튀기)',
    status: 'Legal-if-labeled (미국)',
  },
  {
    name: '정상 미처리 옐로핀 (Natural)',
    price: 4.50,
    waterWeight: '0% (순수)',
    status: 'Premium / Banned in EU/JP',
  }
];

export default function SasCoTreatmentImpact() {
  return (
    <WidgetCard
      id="W-SAS04"
      title="일산화탄소(CO) 처리 참치: 단가 교란과 규제 리스크"
      description="미국 내 CO 참치 가격 덤핑 및 FDA Import Alert 45-02"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
      takeaway={{ 
        situation: "일본/EU/중국 등 6개국에서 금지된 CO 처리(발색) 참치가 미국에 합법적으로 유통되며, 베트남산이 약 $2.50/lb의 덤핑 단가로 정품 옐로핀($4.50/lb) 시장을 교란하고 있습니다.", 
        actionPlan: "FDA 수입 경보(Import Alert 45-02) 발동으로 저가 불법 발색 참치에 대한 단속이 강화되고 있습니다. 우리는 'No-CO / Natural' 속성을 핵심 마케팅 차별화 지점으로 활용해야 합니다.", 
        source: "FDA Import Alert 45-02 (Sep 2024) / US Wholesale Pricing" 
      }}
      customBody={
        <div style={{ height: '256px', width: '100%', marginTop: '8px' }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart
              data={CO_DATA}
              margin={{ top: 30, right: 30, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <XAxis type="number" unit="$" domain={[0, 5]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} stroke="#64748b" />
              <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', background: '#1e293b', color: '#e2e8f0' }}
                formatter={(value: number, name: string, props: any) => [`$${value.toFixed(2)}/lb`, '도매 단가']}
              />
              <ReferenceLine x={4.5} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: '정상 프리미엄 기준선 ($4.5)', fill: '#10b981', fontSize: 10 }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey="price" name="도매 단가 ($/lb)" isAnimationActive={false} barSize={32} radius={[0, 4, 4, 0]}>
                {CO_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
