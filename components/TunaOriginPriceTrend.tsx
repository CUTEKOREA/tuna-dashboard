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
import { ChartPatternDefs } from './ChartPatterns';

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
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: 'var(--w-slate-50)', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
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
    cardDesc="WCPFC·IATTC 2025 Q3 공개 자료 기반 자체추정 - 5대 해역별 산지 단가 (Stage 0 illustrative)"
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
            <stop offset="100%" stopColor="var(--w-blue-500)" />
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(140,170,255,0.10)' }} />
        <Bar dataKey="price" fill="url(#tunaOriginPriceGradient)" radius={[4, 4, 0, 0]} />
      </BarChart>
    }
    takeaway={{
      situation: `<div>
<p>"산지 단가"란 어선이 어획해 양륙한 시점의 원물 가격. 글로벌 5대 해역(지중해·동태평양·서태평양·인도양·서아프리카)별로 가격이 다르며 이 차이가 우리 매입 의사결정의 1차 판단 기준.</p>
<p>5대 해역 평균: <strong>1,550원/kg, 전월 대비 +2.3%</strong>. 상승 견인: 지중해(1,780원/kg, +8.7%), 동태평양(1,620원/kg, +5.4%). 반대로 인도양은 -3.2% 약세. <strong>해역간 가격 분산이 확대 중</strong>이라는 게 핵심 신호.</p>
<p>의미: 분산 확대 = 차익거래 기회 확대. 인도양 약세 + 지중해 강세를 적극적으로 활용하면 매입원가 -5~8%p 절감 가능. 단일 해역 의존 공급사는 이런 차익 기회를 놓침.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 해역간 가격 분산은 단순 정보가 아닌 <strong>차익 거래 신호</strong>. 본사 매매 담당이 매주 5대 해역 가격을 모니터링하여 매입 포트폴리오를 동적 리밸런싱.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>지중해 상승 원인 30일 내 재검증</strong>: 일시적 환율 효과 vs 항만 비용 구조 변화 - 환율이면 헷지, 구조면 거점 재배치.</li>
<li style="margin-bottom: 8px;"><strong>인도양 약세 활용 4분기 비축 확대</strong>: 인도양 6개월 선도매입 확정. 예상 마진 갭 +2.1pp 회수.</li>
<li><strong>산지가 차익 거래북 구축</strong>: 5대 해역 롱-숏 자동 거래. ICE·SGX와 장외스왑(OTC)으로 페이퍼 헤지 결합.</li>
</ol>
</div>`,
      source: 'WCPFC 2025 Q3 + IATTC 추정치 (Stage 0 mock)',
    }}
  />
);

export default TunaOriginPriceTrend;
