'use client';

import React from 'react';
import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { Rocket } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const canadaData = [
  { year: '2019/20', volume: 8500, products: 30 },
  { year: '2020/21', volume: 12000, products: 35 },
  { year: '2021/22', volume: 15000, products: 47 },
  { year: '2022/23', volume: 52000, products: 62 },
  { year: '2023/24', volume: 102300, products: 81 },
];

const kpis = [
  { label: '성장률 (2년)', value: '+582%', color: '#10b981' },
  { label: '연간 캔 판매', value: '9,350만', color: '#38bdf8' },
  { label: 'MSC 제품 수', value: '81개', color: '#a78bfa' },
  { label: 'MSC 비중', value: '60%', sub: '캐나다 전체 MSC 수산물 중', color: '#f59e0b' },
];

export default function MscCanadaGrowthCase() {
  return (
    <WidgetCard
      id="W-MSC23"
      title="캐나다 MSC 참치 폭발 성장 사례"
      icon={Rocket}
      iconColor="#10b981"
      pillar="S2"
      cardDesc="2년 만에 582% 성장한 캐나다의 MSC 참치 시장 — 리테일러 주도 전환의 교과서"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: "캐나다는 2년 만에 MSC 참치 판매량이 582% 폭발 성장하여 연간 9,350만 캔을 달성했습니다. MSC 라벨 참치가 캐나다 전체 MSC 수산물의 60%를 차지하며, 주요 브랜드(Clover Leaf, Ocean's, Walmart PB)가 경쟁적으로 전환했습니다.",
        actionPlan: "캐나다 사례는 '리테일러 주도의 MSC 전환'이 어떻게 폭발적 수요를 창출하는지 보여줍니다. 한국 수산 기업이 캐나다 시장에 OEM 납품할 때 MSC 인증이 진입 필수 요건이 되고 있으며, 2025년에 30개 이상의 신규 MSC 제품 출시가 예상됩니다.",
        source: "MSC Canada Tuna Report 2025",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {kpis.map((k) => (
              <div key={k.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px',
                border: '1px solid rgba(140,170,255,0.12)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>{k.label}</div>
                {k.sub && <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '2px' }}>{k.sub}</div>}
              </div>
            ))}
          </div>

          {/* Growth Chart */}
          <div style={{ height: 220, width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={canadaData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="canadaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: '#e2e8f0' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number, name: string) => {
                    if (name === '판매량') return [`${value.toLocaleString()} 톤`, name];
                    return [`${value}개`, name];
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="volume" name="판매량" stroke="#10b981" strokeWidth={3} fill="url(#canadaGrad)" isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="products" name="제품 수" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} isAnimationActive={false} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>

          {/* Brand Callout */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { name: 'Clover Leaf', count: 31, color: '#10b981' },
              { name: "Ocean's", count: 26, color: '#38bdf8' },
              { name: 'Walmart PB', count: 7, color: '#f59e0b' },
              { name: '기타', count: 17, color: '#64748b' },
            ].map((b) => (
              <div key={b.name} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '4px 10px', borderRadius: '20px',
                background: `${b.color}15`, border: `1px solid ${b.color}30`,
                fontSize: '0.7rem', color: b.color, fontWeight: 600,
              }}>
                {b.name} ({b.count})
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
