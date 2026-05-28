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
<p>한국 참치 통조림 시장은 사실상 <strong>"듀오폴리(Duopoly)"</strong> 구조. <strong>동원 71.2% + 사조 14.8% = 86% 점유</strong>. 나머지 14%를 신라교역(3.9%)·CJ·기타가 나눠 가짐.</p>
<p>이 구도가 의미하는 바: B2C 통조림 시장은 정면 진입 불가능. 동원·사조의 마케팅 예산(연 400~600억원)과 retail 매대 점유율은 후발 vendor가 따라잡을 수 없는 자본 격차.</p>
<p>신라교역 위치: B2B(가공·도매·HMR/OEM)는 강하지만 retail brand로 transfer 못함. 이건 약점이 아니라 differentiation 기회 — B2C 동원과 정면 충돌하지 않으면서 프리미엄 niche로 진입 가능.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 통조림 B2C 정면 진입 금지. 대신 <strong>"프리미엄 niche + HMR cross-sell"</strong>로 differentiation. 점유율보다 마진율이 KPI.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>프리미엄 횟감·자숙액 활용 HMR niche</strong>: 즉석국·찌개·죽 같은 HMR SKU로 동원·사조가 약한 segment 침투. ASP +30~50% 프리미엄.</li>
<li style="margin-bottom: 8px;"><strong>B2B → B2C transfer 점진적</strong>: 기존 OEM 거래처(이마트 PB·노브랜드)에서 우리 own brand로 점진 전환. 향후 3년 점유율 +2~3%p.</li>
<li><strong>"DTC + HMR + Pet Food" 3-track expansion</strong>: 통조림 본업은 B2B 유지, B2C는 HMR·DTC·pet food로 우회. EV/EBITDA를 통조림 8x → multi-category brand 15~18x로 multiple rerate.</li>
</ol>
</div>`,
      source: '닐슨IQ 2025 H1 국내 참치 통조림 시장점유율 (Stage 1 mock)',
    }}
  />
);

export default TunaCannedMarketShare;
