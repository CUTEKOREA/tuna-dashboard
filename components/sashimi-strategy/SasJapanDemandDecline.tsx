'use client';

import React from 'react';
import * as chartFmt from '../../lib/chartFormatters';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { TrendingDown } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const consumptionData = [
  { year: '2000', sashimi: 726, perCapita: 5.7 },
  { year: '2005', sashimi: 620, perCapita: 4.9 },
  { year: '2010', sashimi: 530, perCapita: 4.2 },
  { year: '2015', sashimi: 450, perCapita: 3.5 },
  { year: '2018', sashimi: 410, perCapita: 3.2 },
  { year: '2020', sashimi: 380, perCapita: 3.0 },
  { year: '2022', sashimi: 359, perCapita: 2.86 },
  { year: '2030', sashimi: 250, perCapita: 2.1 },
  { year: '2040', sashimi: 175, perCapita: 1.6 },
  { year: '2050', sashimi: 112, perCapita: 1.1 },
];

const kpis = [
  { label: '사시미 소비 감소', value: '-51%', sub: '726K→359K톤 (2000→2022)', color: '#ef4444' },
  { label: '2050 전망', value: '112K톤', sub: '현재의 1/3 이하', color: '#f59e0b' },
  { label: '1인당 수산물', value: '21.4kg', sub: '40.2→21.4 (-47%)', color: '#a78bfa' },
  { label: '참치 수입 2024', value: '$1.59B', sub: 'YoY -14.2%', color: '#38bdf8' },
];

export default function SasJapanDemandDecline() {
  return (
    <WidgetCard
      id="W-SAS19"
      title="일본 사시미 수요 장기 감소 — 글로벌 리스크"
      icon={TrendingDown}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="세계 최대 사시미 시장의 구조적 축소 — 한국·EU 수출 의존국 모두에 영향"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: "일본 사시미 소비는 726,000t(2000)에서 359,000t(2022)으로 51% 감소했으며, 2050년에는 ~112,000t으로 현재의 1/3 이하로 축소될 전망입니다. 1인당 수산물 소비도 40.2kg→21.4kg(-47%)으로 하락세가 지속됩니다. 2024년 참치 수입은 $1.588B(-14.2% YoY)로 감소했습니다.",
        actionPlan: "일본 수요 감소는 한국(사시미 80% 수출→일본)과 EU(BFT 90% 수출→일본) 모두에 구조적 리스크입니다. 대안 시장으로 미국 포케($2B, CAGR 22.3%), 중국 신흥 사시미, EU 슈퍼마켓 스시 채널로 수출 다변화가 시급합니다. Balfegó(스페인)는 이미 미국 38%, 중국 15%로 다변화 중입니다.",
        source: "Japan MAFF/JFA White Paper FY2023-24, Kawamoto 2026 (Fisheries Science), GLOBEFISH",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {kpis.map((k) => (
              <div key={k.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px',
                border: '1px solid rgba(140,170,255,0.12)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
                <div style={{ fontSize: '0.58rem', color: '#64748b', marginTop: '1px' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Decline Chart */}
          <div style={{ height: 220, width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="jpDeclineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}K`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: '#e2e8f0' }}
                  formatter={(value: unknown, name: unknown) => [`${chartFmt.formatChartNumber(value)}K톤`, name === 'sashimi' ? '사시미 소비' : '1인당']}
                />
                <ReferenceLine x="2022" stroke="#f59e0b" strokeDasharray="5 5" label={{ value: '현재', fill: '#f59e0b', fontSize: 10, position: 'top' }} />
                <Area type="monotone" dataKey="sashimi" name="sashimi" stroke="#ef4444" strokeWidth={2.5} fill="url(#jpDeclineGrad)" isAnimationActive={false} />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>

          {/* Impact callout */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
          }}>
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
              fontSize: '0.7rem', color: '#94a3b8',
            }}>
              <strong style={{ color: '#f59e0b' }}>🇰🇷 한국 영향</strong><br />
              사시미 80% 수출→일본 — 장기 축소 리스크
            </div>
            <div style={{
              padding: '10px 12px', borderRadius: '8px',
              background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)',
              fontSize: '0.7rem', color: '#94a3b8',
            }}>
              <strong style={{ color: '#a78bfa' }}>🇪🇺 EU 영향</strong><br />
              BFT 90% 수출→일본 — 중국/미국 다변화 중
            </div>
          </div>
        </div>
      }
    />
  );
}
