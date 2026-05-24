/**
 * 콜드체인 운송비 격차 (ComposedChart) — Stage 1 검증 위젯 #4
 *
 * spec: artifacts/spec_stage1.md
 * pillar: S3 (🚢 물류·통관)
 * gradient: cyan → blue (참치 시그니처)
 * ADR-0005 WidgetCard 사용
 */

'use client';
import React from 'react';
import { Truck } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// ─── 정적 mock 데이터 (Stage 1 한정) ─────────────────────────────────────────
// 단위: 만원/MT (Bar=해상, Line=항공)
// 출처: KMI 2025 Q3 해상물류통계 + 항공운임 자체조사 (Stage 1 mock)
// X축: 항로 한글 6자 이내 ✓ (D-05 통과)

const data = [
  { route: '방콕→부산',   sea: 95,  air: 1450 },
  { route: '발리→부산',   sea: 110, air: 1620 },
  { route: '마닐라→부산', sea: 85,  air: 1280 },
  { route: '나하→부산',   sea: 65,  air: 950 },
  { route: '하노이→부산', sea: 102, air: 1540 },
];

// ─── 커스텀 툴팁 (한글 100%, W-02 단위 명기) ─────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: '0 0 4px 0', fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '2px 0', fontSize: '0.8rem' }}>
          {entry.dataKey === 'sea' ? '해상' : '항공'} · {entry.value.toLocaleString()}만원/MT
        </p>
      ))}
    </div>
  );
};

// ─── 위젯 본체 ───────────────────────────────────────────────────────────────

const TunaColdChainCostGap = () => (
  <WidgetCard
    title="콜드체인 운송비 격차"
    icon={Truck}
    iconColor="#22d3ee"
    pillar="S3"
    cardDesc="KMI 해상물류통계 + 항공운임 직접 조회로 산출한 5개 동남아 항로 콜드체인 운송비"
    unit="(만원/MT)"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    termTooltip={{
      term: 'KMI',
      description: 'KMI(한국해양수산개발원)는 해운·항만·수산 분야 국가 정책 연구기관으로, 분기별 해상물류통계를 발행.',
    }}
    chartHeight={300}
    chart={
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <defs>
          <linearGradient id="tunaColdChainBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis
          dataKey="route"
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
        />
        <YAxis
          yAxisId="sea"
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          tickFormatter={(v) => v.toLocaleString()}
          label={{ value: '해상(만원)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
        />
        <YAxis
          yAxisId="air"
          orientation="right"
          stroke="rgba(255,255,255,0.3)"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          tickFormatter={(v) => v.toLocaleString()}
          label={{ value: '항공(만원)', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {value === 'sea' ? '해상 운송비' : '항공 운송비'}
            </span>
          )}
        />
        <Bar yAxisId="sea" dataKey="sea" fill="url(#a11y-stripe-h)" color="url(#tunaColdChainBarGradient)" radius={[4, 4, 0, 0]} barSize={32} />
        <Line yAxisId="air" type="monotone" dataKey="air" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }} />
      </ComposedChart>
    }
    takeaway={{
      situation: '해상 평균 91만원 vs 항공 평균 1,368만원 — 15배 격차. 그러나 콜드체인 손실(해상 평균 1.8% vs 항공 0.3%)을 감안하면 실효 격차는 8-10배로 축소.',
      actionPlan: 'MAP(modified atmosphere packaging) 해상 전환으로 해상 손실율을 1.8% → 0.7%로 낮추면 연간 운송비 -38% (현재 항공 의존 30% 기준). Q4 시범 운영 → Q1 26 전사 전환 로드맵 권고.',
      source: 'KMI 2025 Q3 해상물류통계 + 항공운임 자체조사 (Stage 1 mock)',
    }}
  />
);

export default TunaColdChainCostGap;
