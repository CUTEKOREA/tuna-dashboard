'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CONSUMPTION_DATA = [
  { year: '2020', exportToJapan: 94, domesticEU: 6 },
  { year: '2021', exportToJapan: 93, domesticEU: 7 },
  { year: '2022', exportToJapan: 92, domesticEU: 8 },
  { year: '2023', exportToJapan: 91, domesticEU: 9 },
  { year: '2024', exportToJapan: 90, domesticEU: 10 },
];

export default function SasDomesticRetailTrend() {
  return (
    <WidgetCard
      id="W-SAS08"
      title="EU 참다랑어 소비 및 수출 트렌드"
      description="내수 소비 한계와 일본 시장 의존도"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="사시미/스테이크 시장 동향"
    >
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">프랑스 참치 소매 침투율</p>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">9.0%</div>
          <p className="text-xs text-slate-400 mt-1">생물 황다랑어 스테이크 중심</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">일본 수출 비중</p>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">&gt; 90%</div>
          <p className="text-xs text-slate-400 mt-1">참다랑어 프리미엄 조업분</p>
        </div>
      </div>

      <div className="h-48 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={CONSUMPTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
            <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Line 
              type="monotone" 
              dataKey="exportToJapan" 
              name="일본 수출 (%)" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              isAnimationActive={false} 
            />
            <Line 
              type="monotone" 
              dataKey="domesticEU" 
              name="EU 내수 (%)" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              dot={{ r: 4 }} 
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <strong>인사이트:</strong> 유럽 생산량의 90% 이상이 일본으로 수출되며, 내수 소비는 극히 제한적(생물 황다랑어 스테이크 중심)입니다.
        </p>
      </div>
    </WidgetCard>
  );
}
