'use client';

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { getPollockData } from '@/lib/data/pollock';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const data = getPollockData('valueDecoupling');

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
      cardDesc="글로벌 명태 수입 수량(천톤) vs 수입 금액(백만 USD)의 디커플링 추적 — 수리미 등 가공품 부가가치 인플레이션 시그널"
      telemetry={{ status: 'STATIC', syncDate: 'UN Comtrade 2024' }}
      chartHeight={260}
      chart={
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={12} tickLine={false} />
          <YAxis yAxisId="left" stroke="var(--w-slate-300)" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}천톤`} domain={['auto', 'auto']} />
          <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}백만`} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--w-navy-900)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--w-slate-50)' }}
            formatter={(value: any, name: any) => {
              if (String(name).includes('수량')) return [`${value.toFixed(1)}천톤`, name];
              return [`$${value.toFixed(1)}백만`, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--w-slate-300)' }} />
          <Bar yAxisId="left" dataKey="vol_k" name="글로벌 수입 수량 (천톤)" fill="var(--w-slate-500)" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} />
          <Line yAxisId="right" type="monotone" dataKey="val_m" name="글로벌 수입 금액 (백만 USD)" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6' }} />
        </ComposedChart>
      }
      takeaway={{
        situation: '전체 무역 수량은 하락 또는 횡보하는 반면, 무역 금액은 가파르게 상승하며 크로스(디커플링) 발생.',
        actionPlan: '수리미(Surimi, 연육) 수요 증가와 조업 원가 상승이 결합된 원자재 인플레이션 시그널. 최종재(어묵·식자재) 가격 전가 압력이 높아지는 국면으로, 원물 사입 시점 최적화 및 재고 운용 계획 재검토를 권고.',
        source: 'UN Comtrade HS 030367 (2018-2024)',
      }}
    />
  );
}
