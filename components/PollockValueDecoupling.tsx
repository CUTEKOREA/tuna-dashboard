'use client';

import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { TrendingUp } from 'lucide-react';
import data from '../data/pollock_value_decoupling.json';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';

export default function PollockValueDecoupling() {
  const chartData = data.map((d: any) => ({
    ...d,
    vol_k: d.global_vol_t / 1000,
    val_m: d.global_val_usd_k / 1000
  }));

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
        <TrendingUp size={20} color="#14b8a6" />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          명태 원물(수량) VS 수리미 등 가공품(금액) 부가가치 디커플링
        </h3>
      </div>
      
      <div style={{ height: '260px', width: '100%', flexShrink: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
            
            <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}k`} domain={['auto', 'auto']} />
            <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" fontSize={12} tickLine={false} tickFormatter={(v) => `$${v}m`} domain={['auto', 'auto']} />
            
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ fontWeight: 600 }}
              formatter={(value: any, name: any) => {
                if (String(name).includes('수량')) return [`${value.toFixed(1)}k tons`, name];
                return [`$${value.toFixed(1)} million`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
            <Bar yAxisId="left" dataKey="vol_k" name="글로벌 수입 수량 (Volume)" fill="#64748b" radius={[4, 4, 0, 0]} barSize={20} opacity={0.6} />
            <Line yAxisId="right" type="monotone" dataKey="val_m" name="글로벌 수입 금액 (Value USD)" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6' }} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox
        situation="차트에서 뚜렷이 나타나듯, 전체 무역 '수량(회색 막대)'은 최근 하락 또는 횡보하고 있지만 무역 '금액(민트색 선)'은 가파르게 치솟으면서 크로스(디커플링)가 발생했습니다."
        actionPlan="이는 명태를 활용한 수리미(Surimi, 연육) 시장의 수요 증가와 조업 원가 상승이 결합된 강력한 원자재 인플레이션 시그널입니다. 최종재(어묵, 식자재 등)의 소비자가판가 인상이 불가피하며, 원물을 대량 사입해 재고를 우선 확보하는 롱 포지션 전략이 재고 손실 가치를 방어할 유일한 수단입니다."
      />
    </div>
  );
}
