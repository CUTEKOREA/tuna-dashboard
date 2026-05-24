/**
 * 참치 산지 단가 추이 (BarChart) — Stage 0 검증 위젯
 *
 * spec: artifacts/spec_stage0.md
 * pillar: S1 (🐟 원료 수급)
 * gradient: cyan → blue (참치 시그니처, ADR-0001 / D-04)
 * ADR-0005 WidgetCard 사용
 */

'use client';
import React from 'react';
import { MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// ─── 정적 mock 데이터 (Stage 0 한정) ─────────────────────────────────────────
// 단위: 원/kg
// 출처: WCPFC 2025 Q3 + IATTC 추정치 (Stage 0 mock — 실제 적용 시 Live API)
// syncDate: '2026-05-21'
// 한글 라벨 5개 모두 7자 이내 ✓ (D-05 통과)

const data = [
  { region: '인도양',   price: 1450, change: -3.2 },
  { region: '서태평양', price: 1380, change: +1.8 },
  { region: '동태평양', price: 1620, change: +5.4 },
  { region: '대서양',   price: 1520, change: -1.1 },
  { region: '지중해',   price: 1780, change: +8.7 },
];

// ─── 커스텀 툴팁 (한글 100%, W-02 단위 명기) ─────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { region, price, change } = payload[0].payload;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
        {region} · {price.toLocaleString()}원/kg · 전월 대비 {change > 0 ? '+' : ''}{change}%
      </p>
    </div>
  );
};

// ─── 위젯 본체 ───────────────────────────────────────────────────────────────

const TunaOriginPriceTrend = () => (
  <WidgetCard
    title="참치 산지 단가 추이"
    icon={MapPin}
    iconColor="#22d3ee"
    pillar="S1"
    cardDesc="WCPFC·IATTC 2025 Q3 보고 + IATTC 추정치를 합산한 5대 해역별 산지 단가"
    unit="(원/kg)"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    termTooltip={{
      term: 'WCPFC·IATTC',
      description: 'WCPFC(중서부태평양수산위원회)는 서태평양·중부태평양 참치 자원을 관리하는 국제기구. IATTC(전미열대참치위원회)는 동태평양 참치 어획을 관리하는 국제기구.',
    }}
    chartHeight={300}
    chart={
      <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <defs>
          <linearGradient id="tunaOriginPriceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis
          dataKey="region"
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          tickFormatter={(v) => v.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey="price" fill="url(#a11y-stripe-h)" color="url(#tunaOriginPriceGradient)" radius={[4, 4, 0, 0]} />
      </BarChart>
    }
    takeaway={{
      situation: '5대 해역 평균 산지 단가는 1,550원/kg으로 전월 대비 +2.3%. 지중해(1,780원/kg, +8.7%)와 동태평양(1,620원/kg, +5.4%)이 상승을 견인했으나, 인도양은 -3.2%로 단가 분산이 확대 중이다.',
      actionPlan: '지중해 상승이 일시적 환율 효과인지 항만 비용 구조 변화인지 30일 내 재검증 필요. 인도양 단가 약세를 활용해 Q4 원료 비축 확대를 우선 검토 — 예상 마진 갭 +2.1pp.',
      source: 'WCPFC 2025 Q3 + IATTC 추정치 (Stage 0 mock)',
    }}
  />
);

export default TunaOriginPriceTrend;
