/**
 * 참치 어종 구성비 (PieChart) — Stage 1 검증 위젯 #2
 *
 * spec: artifacts/spec_stage1.md
 * pillar: S1 (🐟 원료 수급)
 * gradient: cyan → blue → indigo 5단 (참치 시그니처 확장)
 * ADR-0005 WidgetCard 사용
 */

'use client';
import React from 'react';
import { Fish } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import WidgetCard from './WidgetCard';

// ─── 정적 mock 데이터 (Stage 1 한정) ─────────────────────────────────────────
// 단위: %
// 출처: ISSF 2025 Status of the Stocks (Stage 1 mock)
// 한글 라벨 5개 모두 7자 이내 ✓ (D-05 통과)

const data = [
  { species: '가다랑어', share: 58.3 },
  { species: '황다랑어', share: 21.7 },
  { species: '눈다랑어', share: 12.4 },
  { species: '날개다랑어', share: 5.8 },
  { species: '기타', share: 1.8 },
];

// 시그니처 그라디언트 5단 추출 — cyan → blue → indigo 자연 확장
const COLORS = ['#22d3ee', '#38bdf8', '#3b82f6', '#6366f1', '#8b5cf6'];

// ─── 커스텀 툴팁 (한글 100%, W-02 단위 명기) ─────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { species, share } = payload[0].payload;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
        {species} · {share}%
      </p>
    </div>
  );
};

// ─── 커스텀 라벨 (한글, 퍼센트 표기) ─────────────────────────────────────────

const renderLabel = ({ species, share, cx, cy, midAngle, innerRadius, outerRadius }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (share < 3) return null;
  return (
    <text x={x} y={y} fill="rgba(255,255,255,0.8)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
      {species} {share}%
    </text>
  );
};

// ─── 위젯 본체 ───────────────────────────────────────────────────────────────

const TunaSpeciesComposition = () => (
  <WidgetCard
    title="참치 어종 구성비"
    icon={Fish}
    iconColor="#22d3ee"
    pillar="S1"
    cardDesc="ISSF 2025 Status of the Stocks 기반 글로벌 참치 5개 어종 어획 구성비"
    unit="(%)"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    termTooltip={{
      term: 'ISSF',
      description: 'ISSF(국제지속가능수산재단)는 참치 자원의 지속가능한 이용을 위해 어획량·자원 건전성을 모니터링하는 국제기구.',
    }}
    chartHeight={320}
    chart={
      <PieChart>
        <Pie
          data={data}
          dataKey="share"
          nameKey="species"
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
      situation: '가다랑어가 58.3%로 압도적 1위, 황다랑어(21.7%)와 합쳐 상위 2개가 80% 점유. 눈다랑어·날개다랑어는 자원 회복 우려가 큰 12.4%·5.8%로 가공·횟감 수율은 낮으나 단가 프리미엄.',
      actionPlan: '가다랑어 의존도 높음 = ENSO·라니냐 한 번에 60% 공급 흔들림. 자원 안정성 위해 황다랑어·날개다랑어 신규 어획권 확보 검토 — 다변화로 공급 변동성 -30%.',
      source: 'ISSF 2025 Status of the Stocks (Stage 1 mock)',
    }}
  />
);

export default TunaSpeciesComposition;
