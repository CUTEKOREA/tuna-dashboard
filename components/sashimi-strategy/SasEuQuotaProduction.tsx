'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const EU_PRODUCTION_DATA = [
  { country: '스페인', volume: 6500, color: '#3b82f6' },
  { country: '몰타', volume: 4200, color: '#6366f1' },
  { country: '크로아티아', volume: 3100, color: '#8b5cf6' },
  { country: '기타 EU', volume: 3500, color: '#94a3b8' },
];

export default function SasEuQuotaProduction() {
  return (
    <WidgetCard
      id="W-SAS07"
      title="EU 참다랑어 국가별 쿼터 생산량"
      description="ICCAT(대서양참치보존위원회) 할당량 52% 점유"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }
      cardDesc="사시미/스테이크 시장 동향"}
    >
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={EU_PRODUCTION_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `${val}t`} 
            />
            <YAxis 
              dataKey="country" 
              type="category" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              width={70} 
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar 
              dataKey="volume" 
              name="생산량 (톤)" 
              radius={[0, 4, 4, 0]} 
              barSize={24} 
              isAnimationActive={false}
            >
              {EU_PRODUCTION_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <strong>인사이트:</strong> 스페인, 몰타가 지중해 참다랑어 생산의 절반 이상을 통제. EU 내 압도적인 조업 및 축양 경쟁력을 보여줍니다.
        </p>
      </div>
    </WidgetCard>
  );
}
