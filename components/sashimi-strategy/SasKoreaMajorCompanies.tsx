'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const companies = [
  { name: '동원산업', revenue: '8.94조', opProfit: '5,013억', tunaShare: 4, note: 'StarKist US#1 46%', color: '#38bdf8', exportShare: 49.2 },
  { name: '동원F&B', revenue: '4.48조', opProfit: '1,835억', tunaShare: 47, note: '국내 캔 81.4%', color: '#10b981', exportShare: 0 },
  { name: '사조산업', revenue: '6,352억', opProfit: '-94억 적자', tunaShare: 41, note: '적자 전환', color: '#ef4444', exportShare: 8.8 },
  { name: '신라교역', revenue: '4,961억', opProfit: '164억', tunaShare: 80, note: '원양 특화', color: '#a78bfa', exportShare: 14.9 },
  { name: '한성기업', revenue: '3,325억', opProfit: '110억', tunaShare: 7.6, note: '다각화', color: '#22d3ee', exportShare: 0 },
  { name: '사조씨푸드', revenue: '1,883억', opProfit: '95억', tunaShare: 65.7, note: '사시미 전문', color: '#f59e0b', exportShare: 13.9 },
  { name: '동원수산', revenue: '1,837억', opProfit: '53억', tunaShare: 53.2, note: '사시미 전문', color: '#f472b6', exportShare: 0 },
];

const exportData = companies
  .filter((c) => c.exportShare > 0)
  .sort((a, b) => b.exportShare - a.exportShare);

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: '#1a2442', border: '1px solid #334155', borderRadius: '8px',
      padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0' }}>{label}</div>
      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
        수출 점유율: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{payload[0]?.value}%</span>
      </div>
    </div>
  );
};

export default function SasKoreaMajorCompanies() {
  return (
    <WidgetCard
      id="W-SAS15"
      title="한국 주요 참치 기업 현황"
      description="FY2024 매출·영업이익·참치 비중·수출 점유율"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="한국 7대 참치 기업의 재무 현황과 수출 시장 점유율을 카드 그리드 + 수평 바 차트로 비교"
      takeaway={{
        situation: '한국 참치 산업은 동원그룹(동원산업 8.94조 + 동원F&B 4.48조)이 수출 점유율 49.2%로 압도적 1위입니다. 순수 사시미 전문 기업은 사조씨푸드(수출 541억 > 내수 240억)와 동원수산(365억)으로, 두 기업 모두 수출 의존도가 높습니다. 사조산업은 영업적자(-94억)로 구조조정 압력을 받고 있습니다.',
        actionPlan: '동원그룹의 수직 통합(어획→가공→유통→소매) 모델이 업계 최고 수준이며, StarKist를 통한 미국 캐닝 시장 46% 점유는 글로벌 수직계열화의 대표 사례입니다. 중소기업은 사시미 특화 + 어종 다각화로 니치 전략이 필요합니다.',
        source: 'DART FY2024, KOSFA, KR_company_profiles.csv',
      }}
      customBody={
        <div style={{ padding: '8px 0' }}>
          {/* ── Company Cards Grid ── */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px', maxHeight: '340px', overflowY: 'auto',
            paddingRight: '4px',
          }}>
            {companies.map((c, i) => (
              <div key={i} style={{
                background: `${c.color}08`,
                border: `1px solid ${c.color}22`,
                borderRadius: '8px',
                padding: '12px 14px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Color accent top strip */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: `linear-gradient(90deg, ${c.color}, transparent)`,
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '2px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: c.color }}>{c.name}</div>
                  <span style={{
                    fontSize: '0.62rem', background: `${c.color}20`, color: c.color,
                    padding: '2px 6px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>{c.note}</span>
                </div>

                <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>매출</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0' }}>{c.revenue}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>영업이익</div>
                    <div style={{
                      fontSize: '0.82rem', fontWeight: 700,
                      color: c.opProfit.includes('적자') ? '#ef4444' : '#10b981',
                    }}>{c.opProfit}</div>
                  </div>
                </div>

                {/* Tuna share bar */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>참치 비중</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: c.color }}>{c.tunaShare}%</span>
                  </div>
                  <div style={{ background: '#1a2442', borderRadius: '3px', height: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${c.tunaShare}%`, height: '100%',
                      background: `linear-gradient(90deg, ${c.color}, ${c.color}80)`,
                      borderRadius: '3px',
                    }} />
                  </div>
                </div>

                {c.exportShare > 0 && (
                  <div style={{
                    marginTop: '8px', fontSize: '0.68rem', color: '#94a3b8',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>수출 점유율</span>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{c.exportShare}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Export Market Share Bar Chart ── */}
          <div style={{ marginTop: '16px' }}>
            <div style={{
              fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8',
              marginBottom: '8px', paddingLeft: '4px',
            }}>
              수출 시장 점유율 (Top 4)
            </div>
            <div style={{ height: '160px', width: '100%' }}>
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={exportData}
                  layout="vertical"
                  margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 55]}
                    tickFormatter={(v) => `${v}%`}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    stroke="#64748b"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    stroke="#94a3b8"
                    width={70}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="exportShare"
                    name="수출 점유율"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                    isAnimationActive={false}
                    label={{
                      position: 'right',
                      fontSize: 11,
                      fill: '#94a3b8',
                      formatter: (v: number) => `${v}%`,
                    }}
                  >
                    {exportData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
          </div>
        </div>
      }
    />
  );
}
