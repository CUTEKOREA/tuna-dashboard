'use client';

import React from 'react';
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { Euro } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const priceData = [
  { country: '🇬🇧 영국', msc: 14.5, nonMsc: 10.2, premium: 42.1 }, // Converted from £12.44 vs £8.77
  { country: '🇩🇪 독일', msc: 12.8, nonMsc: 9.5, premium: 34.7 },
  { country: '🇫🇷 프랑스', msc: 16.5, nonMsc: 13.2, premium: 25.0 },
  { country: '🇮🇹 이탈리아', msc: 22.4, nonMsc: 18.6, premium: 20.4 },
  { country: '🇪🇸 스페인', msc: 18.9, nonMsc: 16.2, premium: 16.7 },
  { country: '🇵🇹 포르투갈', msc: 15.6, nonMsc: 13.1, premium: 19.1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(20, 28, 52, 0.95)',
        border: '1px solid rgba(148,163,184,0.15)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
        color: '#e2e8f0',
        fontSize: '0.82rem',
      }}>
        <p style={{ fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '16px', fontWeight: 600, margin: '2px 0' }}>
            <span>{entry.name}:</span>
            <span>{entry.value}{entry.name.includes('프리미엄') ? '%' : ' €/kg'}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MscEuropeRetailPrices() {
  return (
    <WidgetCard
      id="W-MSC01"
      title="유럽 MSC vs 비MSC 소매가 비교"
      description="유럽 6개국 소매가(€/kg) 프리미엄 분석"
      icon={Euro}
      iconColor="#10b981"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="B2C 리테일 가격 구조"
      takeaway={{
        situation: "영국은 MSC 인증 제품이 평균 €14.50/kg(비MSC €10.20/kg)로 42%의 가장 높은 프리미엄을 형성하며, 독일(34.7%)도 높습니다. 이탈리아는 소매가 자체는 최고가(€22.4)지만 프리미엄율(20.4%)은 상대적으로 낮습니다.",
        actionPlan: "북유럽(UK/DE)은 높은 프리미엄을 바탕으로 인증 획득 비용을 상쇄하는 프리미엄 브랜드(NB) 전략이 유효하며, 남유럽(IT/ES)은 가성비가 높은 PB 위주 공략이 필수적입니다.",
        source: "NielsenIQ Retail Data / UK Dossier 2024",
      }}
      customBody={
        <div style={{ height: 340, width: '100%', marginTop: '8px' }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={priceData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis dataKey="country" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fill: '#f59e0b', fontSize: 11 }} domain={[0, 50]} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(140,170,255,0.10)' }} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="msc" name="MSC 인증" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} isAnimationActive={false} />
              <Bar yAxisId="left" dataKey="nonMsc" name="비MSC" fill="#64748b" radius={[4, 4, 0, 0]} barSize={24} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="premium" name="프리미엄 지수 (%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5, fill: '#f59e0b' }} isAnimationActive={false} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
