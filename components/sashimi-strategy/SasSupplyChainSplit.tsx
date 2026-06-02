'use client';

import React from 'react';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import WidgetCard from '../WidgetCard';

const SUPPLY_CHAIN_DATA = [
  {
    name: '대량 냉동 (Frozen Saku/Loin)',
    valueShare: 58,
    volumeShare: 67,
    importValue: 487, // $487M
    volume: 43.2,     // 43.2 kt
    unitPrice: 11.28, // $/kg
    source: '인니/베트남 등 동남아 (포케용)'
  },
  {
    name: '프리미엄 생물 (Fresh Ahi/BFT)',
    valueShare: 42,
    volumeShare: 33,
    importValue: 381, // $381M
    volume: 23.3,     // 23.3 kt
    unitPrice: 16.35, // Blended $/kg ($13~$26.7)
    source: '파나마/중남미, 지중해, 하와이 (사시미용)'
  }
];

export default function SasSupplyChainSplit() {
  return (
    <WidgetCard
      id="W-SAS03"
      title="미국 사시미 공급망 양극화 구조"
      description="2024년 비통조림 참치 수입액 기준 (형태별 분리)"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="US Census 2024 비통조림 참치 수입 — 냉동 사쿠($487M·67%)·생물 참치($381M·33%) 이원 공급망 분리"
      takeaway={{ 
        situation: "미국 시장은 전체 물량의 67%를 차지하는 저가 대량 냉동 포케용($487M)과, 항공운송되는 프리미엄 생물 사시미($381M)의 두 가지 독립적 공급망으로 완벽히 분리되어 있습니다.", 
        actionPlan: "시장 진입 시 명확한 타겟팅이 필요합니다. 물량 중심의 프랜차이즈 공급(냉동 Saku)과 하이엔드 레스토랑 직판(생물/ULT) 중 어느 차선에서 경쟁할지 결정해야 합니다.", 
        source: "US Census Bureau 2024 (HS 030487 vs 030232/34/35)" 
      }}
      customBody={
        <div style={{ height: '256px', width: '100%', marginTop: '8px' }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SUPPLY_CHAIN_DATA}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} stroke="#64748b" />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', background: '#1e293b', color: '#e2e8f0' }}
                formatter={(value: number, name: string, props: any) => {
                  if (name === '금액 비중 (%)') return [`${value}% ($${props.payload.importValue}M)`, name];
                  if (name === '물량 비중 (%)') return [`${value}% (${props.payload.volume}kt, 단가: $${props.payload.unitPrice}/kg)`, name];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey="valueShare" name="금액 비중 (%)" fill="#3b82f6" barSize={24} radius={[0, 4, 4, 0]} isAnimationActive={false} />
              <Bar dataKey="volumeShare" name="물량 비중 (%)" fill="#94a3b8" barSize={24} radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
