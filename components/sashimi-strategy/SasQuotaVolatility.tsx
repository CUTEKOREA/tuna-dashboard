'use client';

import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

const QUOTA_DATA = [
  { 
    name: '미국 대서양 (Western BFT)', 
    quota: 1341, 
    status: 'Tight (자원 압박)',
    color: '#ef4444'
  },
  { 
    name: 'EU 지중해 (Eastern BFT)', 
    quota: 21503, 
    status: 'Recovered (쿼터 증대)',
    color: '#3b82f6'
  }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: 'rgba(30,41,59,0.95)', padding: 12, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(140,170,255,0.12)' }}>
        <p style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{data.name}</p>
        <p style={{ fontSize: 14, color: 'var(--w-slate-300)' }}>2024년 쿼터: {data.quota.toLocaleString()} 톤</p>
        <p style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: data.color }}>{data.status}</p>
      </div>
    );
  }
  return null;
};

export default function SasQuotaVolatility() {
  return (
    <WidgetCard
      id="W-SAS11"
      title="지역별 쿼터(Quota) 양극화 및 자원 압박"
      description="ICCAT 기준 미국(서부) vs EU(동부/지중해) 참다랑어 할당량"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="ICCAT 2024 쿼터 리포트 — 서대서양 BFT 1,341톤(압박) vs EU 지중해 21,503톤(회복) 16배 양극화"
      takeaway={{ 
        situation: "미국 연안의 서대서양 참다랑어는 자원 고갈 우려로 쿼터가 1,341톤에 묶여 조업 압박이 거센 반면, EU 지중해산은 자원 회복 판정을 받아 21,503톤으로 쿼터가 대폭 증대되었습니다.", 
        actionPlan: "미국 내수산 블루핀의 공급 불안정성을 보완하기 위해, EU산 쿼터 증대 물량(Farmed)을 적극적으로 수입하여 라인업을 이원화(국내산 자연산 + EU산 축양) 해야 합니다.", 
        source: "ICCAT 2024 Quota Report" 
      }}
      customBody={
        <div style={{ height: 256, width: '100%', marginTop: 8 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={QUOTA_DATA}
              margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--w-slate-400)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
              <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--w-slate-300)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="quota" barSize={36} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {QUOTA_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
