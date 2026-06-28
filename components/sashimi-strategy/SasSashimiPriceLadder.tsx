'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

const LADDER_DATA = [
  { name: '냉동 Saku (동남아)', min: 10, max: 12, avg: 11.28, color: '#94a3b8' },
  { name: '생물 Yellowfin (중남미)', min: 12, max: 16, avg: 13.00, color: '#3b82f6' },
  { name: '생물 Bluefin (지중해/하와이)', min: 25, max: 45, avg: 26.71, color: '#10b981' }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: 'rgba(30,41,59,0.95)', padding: 12, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(140,170,255,0.12)' }}>
        <p style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{data.name}</p>
        <p style={{ fontSize: 14, color: '#cbd5e1' }}>가격대: ${data.min} ~ ${data.max}/kg</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa' }}>평균 수입단가: ${data.avg}/kg</p>
      </div>
    );
  }
  return null;
};

export default function SasSashimiPriceLadder() {
  return (
    <WidgetCard
      id="W-SAS09"
      title="어종/형태별 사시미 가격 사다리 (Price Ladder)"
      description="미국 도매 수입 단가 기준 3단계 계층 구조"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="US Census 2024 도매 수입단가 — 냉동 사쿠 $11·생물 황다랑어 $13·참다랑어 $26+/kg 3단 계층"
      takeaway={{ 
        situation: "냉동 Saku(포케용)가 1단($11/kg), 생물 Yellowfin이 2단($13/kg), 프리미엄 생물 Bluefin이 3단($26/kg+)을 형성하는 완벽한 계단식 가격 구조를 보입니다.", 
        actionPlan: "Yellowfin(황다랑어)의 경우 품질 관리를 통해 냉동 Saku 가격대를 벗어나 생물 등급의 2단 사다리로 진입하는 것이 수익성 개선의 핵심입니다.", 
        source: "US Census 2024 / Wholesale Data" 
      }}
      customBody={
        <div style={{ height: 256, width: '100%', marginTop: 8 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart
              data={LADDER_DATA}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <XAxis type="number" unit="$" domain={[0, 50]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fontWeight: 600, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              {/* Using an array [min, max] for range bar */}
              <Bar 
                dataKey={(d) => [d.min, d.max]} 
                name="가격대 ($/kg)" 
                radius={4} 
                barSize={24} 
                isAnimationActive={false}
              >
                {LADDER_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
