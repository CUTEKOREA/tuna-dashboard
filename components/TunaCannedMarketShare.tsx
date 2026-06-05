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
    cardDesc="닐슨IQ retail audit + 한국경제 2026-03 보도 기반 국내 참치 통조림 브랜드별 점유율 (동원 80% 돌파 신호 반영)"
    unit="(%)"
    telemetry={{ status: 'STATIC', syncDate: '닐슨IQ 2025 + 한국경제 2026-03' }}
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
      situation: `<div>
<p>한국 참치 통조림 시장은 사실상 <strong>"양강 과점"</strong> 구조. <strong>동원 71.2% + 사조 14.8% = 86% 점유</strong>. 나머지 14%를 신라교역(3.9%)·CJ·기타가 나눠 가짐.</p>
<p>이 구도가 의미하는 바: 소비자직판 통조림 시장은 정면 진입이 어려움. 동원·사조의 마케팅 예산(업계 추정 수천억원 규모)과 소매 매대 점유율은 후발 업체가 단기간에 따라잡기 어려운 자본 격차.</p>
<p>신라교역 위치: 기업 간 거래(가공·도매·가정간편식/주문자 생산)는 강하지만 소비자 직접 판매 브랜드로 전환하지 못하는 상황. 이는 약점이 아니라 차별화 기회 — 동원과의 정면 충돌 없이 프리미엄 틈새 시장으로 진입 가능.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 통조림 소비자직판 정면 진입 지양. 대신 <strong>"프리미엄 틈새 + 가정간편식 교차 판매"</strong>로 차별화. 점유율보다 마진율이 핵심 성과 지표.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>프리미엄 횟감·자숙액 활용 가정간편식 틈새</strong>: 즉석국·찌개·죽 같은 가정간편식(HMR) 품목으로 동원·사조가 약한 세그먼트 침투. 평균 판매 단가 +30~50% 프리미엄 목표(자체 추정).</li>
<li style="margin-bottom: 8px;"><strong>기업 간 거래 → 소비자 직판 점진적 전환</strong>: 기존 주문자 생산(OEM) 거래처(이마트 PB·노브랜드)에서 자사 브랜드로 점진 전환. 시나리오상 3년 내 점유율 +2~3%p 가능.</li>
<li><strong>"직접 판매(DTC) + 가정간편식 + 반려동물 사료" 3트랙 확장</strong>: 통조림 본업은 기업 간 거래 유지, 소비자 채널은 가정간편식·직접 판매·반려동물 사료로 우회. EV/EBITDA 멀티플을 통조림 단일 사업 수준에서 복합 카테고리 브랜드 수준으로 재평가받는 전략(illustrative 시나리오).</li>
</ol>
</div>`,
      source: '닐슨IQ 2025 H1 국내 참치 통조림 시장점유율 (Stage 1 mock)',
    }}
  />
);

export default TunaCannedMarketShare;
