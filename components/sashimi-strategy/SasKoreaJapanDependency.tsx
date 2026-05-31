'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const tradeData = [
  { year: '2015', filletExport: 198, filletImport: 76, japanShare: 38 },
  { year: '2016', filletExport: 210, filletImport: 82, japanShare: 37 },
  { year: '2017', filletExport: 235, filletImport: 95, japanShare: 36 },
  { year: '2018', filletExport: 248, filletImport: 132, japanShare: 35 },
  { year: '2019', filletExport: 240, filletImport: 115, japanShare: 34 },
  { year: '2020', filletExport: 220, filletImport: 90, japanShare: 33 },
  { year: '2021', filletExport: 273, filletImport: 110, japanShare: 35 },
  { year: '2022', filletExport: 260, filletImport: 180, japanShare: 36 },
  { year: '2023', filletExport: 258, filletImport: 250, japanShare: 37 },
  { year: '2024', filletExport: 255, filletImport: 109, japanShare: 28 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
      padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', marginBottom: '2px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#94a3b8' }}>{p.name}:</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
            {p.dataKey === 'japanShare' ? `${p.value}%` : `$${p.value}M`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SasKoreaJapanDependency() {
  return (
    <WidgetCard
      id="W-SAS14"
      title="한국-일본 수출 의존도 추이"
      description="필릿 수출입 ($M) + 일본 비중 (%)"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="한국 참치 필릿 수출입 추이와 일본 수출 비중을 복합 차트로 시각화, 일본 사시미 소비 감소 리스크 주석"
      takeaway={{
        situation: '일본은 한국 참치 수출의 28%(2024, $165.5M)를 차지하며, 일본행 수출의 61%가 사시미 냉동 필릿입니다. 그러나 일본 사시미 소비는 726,000t(2000)에서 359,000t(2022)으로 51% 감소했으며, 2050년에는 112,000t으로 축소 전망입니다.',
        actionPlan: '일본 의존도 80%는 장기적 구조적 리스크입니다. 미국 포케 시장($2B, CAGR 22.3%), 중국 신흥 사시미, EU 스시 리테일 등으로 수출 다변화가 시급합니다.',
        source: 'kr_tuna_trade_byspecies_2015-2024.csv, GLOBEFISH, Kawamoto 2026',
      }}
      customBody={
        <div style={{ padding: '8px 0' }}>
          {/* ── Risk Annotation Banner ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
            background: '#ef444412', border: '1px solid #ef444425', borderRadius: '6px',
            marginBottom: '12px',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 14H1L8 1Z" stroke="#ef4444" strokeWidth="1.2" fill="none" />
              <path d="M8 6v4M8 11.5v.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: '0.74rem', color: '#fca5a5', fontWeight: 600 }}>
              일본 사시미 소비: 726K → 359K → 112K(2050 전망)
            </span>
          </div>

          {/* ── Chart ── */}
          <div style={{ height: '280px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tradeData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradExport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradImport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="year"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="#64748b"
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, 300]}
                  tickFormatter={(v) => `$${v}M`}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="#64748b"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[20, 45]}
                  tickFormatter={(v) => `${v}%`}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  stroke="#f59e0b"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '0.7rem', color: '#94a3b8' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="filletExport"
                  name="필릿 수출 ($M)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradExport)"
                  isAnimationActive={false}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="filletImport"
                  name="필릿 수입 ($M)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradImport)"
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="japanShare"
                  name="일본 비중 (%)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b', stroke: '#1e293b', strokeWidth: 1.5 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>

          {/* ── KPI Summary Row ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
            marginTop: '12px',
          }}>
            {[
              { label: '2024 일본 비중', value: '28%', color: '#f59e0b', sub: '전년 37%→28%' },
              { label: '수출 최고점', value: '$273M', color: '#10b981', sub: '2021년' },
              { label: '수입 최고점', value: '$250M', color: '#ef4444', sub: '2023년' },
            ].map((kpi, i) => (
              <div key={i} style={{
                background: `${kpi.color}08`, border: `1px solid ${kpi.color}20`,
                borderRadius: '6px', padding: '8px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{kpi.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: kpi.color, marginTop: '2px' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
