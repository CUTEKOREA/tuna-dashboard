'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const US_IMPORT_DATA = [
  { year: '2015', value: 613 },
  { year: '2018', value: 750 },
  { year: '2019', value: 838 },
  { year: '2020', value: 613 },
  { year: '2022', value: 1077 },
  { year: '2024', value: 908 },
];

export default function SasMarketKPIs() {
  return (
    <WidgetCard
      id="W-SAS02"
      title="미국 비통조림 참치 수입액 트렌드"
      description="2015-2024 (US Census/Comtrade)"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
      takeaway={{ 
        situation: "미국의 비통조림 참치 수입액은 2015년 $613M에서 2024년 $908M으로 폭발적으로 증가하며 새로운 고점을 형성 중입니다.", 
        actionPlan: "지속 성장하는 미국 사시미/포케 시장을 핵심 타겟으로 삼고, 수입 데이터에 잡히는 주요 공급국(인니/베트남)과의 원가 경쟁력을 확보해야 합니다.", 
        source: "UN Comtrade / US Census 2024" 
      }}
      customBody={
        <div style={{ height: '256px', width: '100%', marginTop: '8px' }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={US_IMPORT_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
              <YAxis 
                domain={[500, 1200]} 
                tickFormatter={(val) => `$${val}M`}
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: '#1e293b', color: '#e2e8f0' }}
                formatter={(value) => [`$${value} Million`, '수입액']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                name="미국 수입액 (Million USD)" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                isAnimationActive={false} 
              />
            </AreaChart>
          </SafeResponsiveContainer>
        </div>
      }
    />
  );
}
