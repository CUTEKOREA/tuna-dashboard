'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

const PENETRATION_DATA = [
  { country: '프랑스 (FR)', rate: 9.0, color: '#3b82f6' },
  { country: '이탈리아 (IT)', rate: 7.1, color: '#6366f1' },
  { country: '스페인 (ES)', rate: 6.3, color: '#8b5cf6' },
  { country: '영국 (UK)', rate: 2.5, color: '#cbd5e1' },
  { country: '독일 (DE)', rate: 1.2, color: '#cbd5e1' },
];

export default function SasDomesticRetailTrend() {
  return (
    <WidgetCard
      id="W-SAS08"
      title="EU 주요국 사시미/스테이크 소매 침투율"
      description="남부 유럽 중심의 극도로 제한적인 내수 소비"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="EUMOFA 2024 소매 분석 - 생물 참치 가구 침투율 프랑스 9.0%·독일 1.2%, 참다랑어 90%+ 일본 직수출"
      takeaway={{ 
        situation: "EU 생산 참다랑어의 90% 이상이 일본으로 직수출되며, 내수 시장은 캔 참치 대비 생물(주로 황다랑어 스테이크) 침투율이 9% 미만에 불과한 초기/니치 시장입니다.", 
        actionPlan: "EU 현지 B2C 시장 진출 시, 참다랑어가 아닌 가성비가 좋은 황다랑어(Yellowfin) 스테이크 제품으로 프랑스/이탈리아를 우선 공략하는 것이 현실적입니다.", 
        source: "EUMOFA 2024 Retail Analysis" 
      }}
      customBody={
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
            <div style={{ background: 'rgba(30,41,59,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(140,170,255,0.12)' }}>
              <p style={{ fontSize: 12, color: 'var(--w-slate-400)', marginBottom: 4 }}>일본 수출 비중 (블루핀)</p>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#60a5fa', fontVariantNumeric: 'tabular-nums' }}>&gt; 90%</div>
              <p style={{ fontSize: 10, color: 'var(--w-slate-500)', marginTop: 4 }}>대부분 초저온 냉동 후 수출</p>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.5)', padding: 16, borderRadius: 8, border: '1px solid rgba(140,170,255,0.12)' }}>
              <p style={{ fontSize: 12, color: 'var(--w-slate-400)', marginBottom: 4 }}>최대 내수 시장 (프랑스)</p>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#818cf8', fontVariantNumeric: 'tabular-nums' }}>9.0%</div>
              <p style={{ fontSize: 10, color: 'var(--w-slate-500)', marginTop: 4 }}>생물 참치 가구당 구매 경험률</p>
            </div>
          </div>

          <div style={{ height: 192, width: '100%', marginTop: 16 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={PENETRATION_DATA} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                <XAxis dataKey="country" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'var(--w-slate-400)' }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 12]} tick={{ fill: 'var(--w-slate-400)' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: 'var(--w-slate-200)' }}
                  labelStyle={{ color: 'var(--w-slate-200)' }}
                  itemStyle={{ color: 'var(--w-slate-300)' }}
                  formatter={(value: unknown) => [`${value}%`, '가구 침투율']}
                />
                <Bar 
                  dataKey="rate" 
                  name="침투율 (%)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32} 
                  isAnimationActive={false}
                >
                  {PENETRATION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="rate" position="top" formatter={(val: unknown) => `${val}%`} fontSize={10} fill="var(--w-slate-300)" fontWeight={600} />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
        </>
      }
    />
  );
}
