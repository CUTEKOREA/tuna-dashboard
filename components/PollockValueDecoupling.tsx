'use client';

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import data from '../data/pollock_value_decoupling.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function PollockValueDecoupling() {
  const chartData = (data as any[]).map((d: any) => ({
    ...d,
    vol_k: d.global_vol_t / 1000,
    val_m: d.global_val_usd_k / 1000,
  }));

  return (
    <WidgetCard
      title="명태 원물(수량) VS 수리미 등 가공품(금액) 부가가치 디커플링"
      icon={TrendingUp}
      iconColor="#14b8a6"
      pillar="S4"
      cardDesc="글로벌 명태 수입 수량(Volume) vs 수입 금액(Value USD)의 디커플링 추적 — 수리미 등 가공품 부가가치 인플레이션 시그널"
      telemetry={{ status: 'STATIC', syncDate: 'UN Comtrade 2024' }}
      chartHeight={260}
      chart={
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}k`} domain={['auto', 'auto']} />
          <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}m`} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
            formatter={(value: any, name: any) => {
              if (String(name).includes('수량')) return [`${value.toFixed(1)}k tons`, name];
              return [`$${value.toFixed(1)} million`, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
          <Bar yAxisId="left" dataKey="vol_k" name="글로벌 수입 수량 (Volume)" fill="url(#a11y-stripe-h)" color="#64748b" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} />
          <Line yAxisId="right" type="monotone" dataKey="val_m" name="글로벌 수입 금액 (Value USD)" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6' }} />
        </ComposedChart>
      }
      takeaway={{
        situation: '전체 무역 수량은 하락 또는 횡보하는 반면, 무역 금액은 가파르게 상승하며 크로스(디커플링) 발생.',
        actionPlan: '명태 활용 수리미(Surimi, 연육) 시장의 수요 증가와 조업 매입원가 상승이 결합된 원자재 인플레이션 시그널. 최종재(어묵, 식자재) 소비자가 인상 불가피, 원물 사입을 통한 재고 락인 롱 포지션 전략 권장.',
        source: 'UN Comtrade HS 030367 (2018-2024)',
      }}
    />
  );
}
