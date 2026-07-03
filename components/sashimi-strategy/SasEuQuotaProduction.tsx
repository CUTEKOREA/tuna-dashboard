'use client';

import React from 'react';
import * as chartFmt from '../../lib/chartFormatters';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const EU_QUOTA_DATA = [
  { country: '스페인 (Spain)', volume: 7465, color: '#3b82f6' },
  { country: '프랑스 (France)', volume: 6962, color: '#6366f1' },
  { country: '이탈리아 (Italy)', volume: 5617, color: '#8b5cf6' },
  { country: '기타 (Malta 등)', volume: 1459, color: '#94a3b8' },
];

export default function SasEuQuotaProduction() {
  return (
    <WidgetCard
      id="W-SAS07"
      title="EU 참다랑어 국가별 생산 쿼터"
      description="2024년 ICCAT 지중해/동대서양 쿼터 (총 21,503톤)"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="ICCAT 2024 쿼터 할당 보고서 — EU 참다랑어 21,503톤, 스페인·프랑스·이탈리아 3국이 93% 독점"
      takeaway={{ 
        situation: "2024년 기준 EU는 전체 ICCAT 쿼터(40,570t)의 약 53%인 21,503톤을 할당받았으며, 이 중 스페인, 프랑스, 이탈리아 3국이 EU 물량의 93%를 독점하고 있습니다.", 
        actionPlan: "쿼터가 집중된 스페인(7,465t)과 이탈리아(5,617t)의 주요 선단 및 가공업체와의 B2B 네트워킹을 최우선으로 추진하여 원물 수급 안정성을 확보해야 합니다.", 
        source: "ICCAT 2024 Quota Allocation Report" 
      }}
      customBody={
        <div style={{ height: 256, width: '100%', marginTop: 8 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={EU_QUOTA_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `${val}t`} 
                domain={[0, 8000]}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                dataKey="country" 
                type="category" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                width={100} 
                tick={{ fill: '#cbd5e1', fontWeight: 600 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: '#e2e8f0' }}
                labelStyle={{ color: '#e2e8f0' }}
                itemStyle={{ color: '#cbd5e1' }}
                formatter={(value: unknown) => [`${chartFmt.formatChartNumber(value)} 톤`, '할당 쿼터']}
              />
              <Bar 
                dataKey="volume" 
                name="할당 쿼터 (톤)" 
                radius={[0, 4, 4, 0]} 
                barSize={24} 
                isAnimationActive={false}
              >
                {EU_QUOTA_DATA.map((entry, index) => (
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
