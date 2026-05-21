/**
 * 참치 통조림 시장점유 (PieChart) — Stage 1 검증 위젯 #5
 *
 * spec: artifacts/spec_stage1.md
 * pillar: S4 (📈 판매·수요)
 * gradient: cyan → blue → indigo 5단 (위젯 #2와 동일 팔레트)
 * ADR-0005 WidgetCard 사용
 */

'use client';
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import WidgetCard from './WidgetCard';

// ─── 정적 mock 데이터 (Stage 1 한정) ─────────────────────────────────────────
// 단위: %
// 출처: 닐슨IQ 2025 H1 국내 참치 통조림 시장점유율 (Stage 1 mock)
// 한글 라벨 5개 모두 7자 이내 ✓ (D-05 통과)

const data = [
  { brand: '동원참치',   share: 71.2 },
  { brand: '사조참치',   share: 14.8 },
  { brand: '오뚜기',     share: 6.5 },
  { brand: '신라참치',   share: 3.9 },
  { brand: '기타',       share: 3.6 },
];

// 시그니처 그라디언트 5단 — 위젯 #2와 동일 팔레트 (일관성)
const COLORS = ['#22d3ee', '#38bdf8', '#3b82f6', '#6366f1', '#8b5cf6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { brand, share } = payload[0].payload;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
        {brand} · {share}%
      </p>
    </div>
  );
};

const renderLabel = ({ brand, share, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (share < 5) return null;
  return (
    <text x={x} y={y} fill="rgba(255,255,255,0.8)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
      {brand} {share}%
    </text>
  );
};

const TunaCannedMarketShare = () => (
  <WidgetCard
    title="참치 통조림 시장점유"
    icon={ShoppingCart}
    iconColor="#22d3ee"
    pillar="S4"
    cardDesc="닐슨IQ 2025 상반기 retail audit 기반 국내 참치 통조림 브랜드별 점유율"
    unit="(%)"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    termTooltip={{
      term: '닐슨IQ',
      description: '닐슨IQ(NielsenIQ)는 글로벌 소비재 시장 조사 기관으로, POS 기반 retail audit을 통해 브랜드별 시장점유율 데이터를 제공.',
    }}
    chartHeight={320}
    chart={
      <PieChart>
        <Pie
          data={data}
          dataKey="share"
          nameKey="brand"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={renderLabel}
          labelLine={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    }
    takeaway={{
      situation: '동원이 71.2%로 카테고리 dominant, 상위 2개(동원+사조)가 86% 점유의 듀오폴리. 신라교역 3.9% — 가공·도매 경쟁력이 retail 브랜드로 transfer되지 못한 구조.',
      actionPlan: 'B2B(가공·HMR/벤더 OEM) 우위를 B2C 브랜드로 전이하려면 동원·사조와 정면 광고전 대신 프리미엄 횟감·자숙액 활용 HMR niche 진입 — 향후 3년 점유율 +2-3%p 목표.',
      source: '닐슨IQ 2025 H1 국내 참치 통조림 시장점유율 (Stage 1 mock)',
    }}
  />
);

export default TunaCannedMarketShare;
