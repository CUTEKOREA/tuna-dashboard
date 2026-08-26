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
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: 'var(--w-slate-50)', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
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
    cardDesc="ISSF 2025 Status of the Stocks 기반 글로벌 참치 5개 어종 어획 구성비 (illustrative)"
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
      situation: `<div>
<p>글로벌 참치 어획 구성: <strong>가다랑어(Skipjack) 58.3%</strong>가 뚜렷한 1위. 황다랑어(Yellowfin) 21.7% 합쳐 상위 2개 어종이 <strong>80% 점유</strong>. 눈다랑어(Bigeye) 12.4%, 날개다랑어(Albacore) 5.8%는 비중 작지만 단가 프리미엄(가다랑어의 3~5배).</p>
<p>가다랑어는 표층 회유성 어종으로 ENSO·라니냐 충격 시 글로벌 공급이 <strong>약 20~25% 수준 위축(업계추정)</strong>. 가다랑어 의존도 60%는 단일 기후 변수에 대한 집중 리스크 포지션.</p>
<p>의미: 어종 다변화는 단순 portfolio가 아닌 <strong>"climate beta hedge"</strong>. 황다랑어·날개다랑어는 더 깊은 수심으로 ENSO 내성 높아 자연 헷지.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 단일 어종 60% 의존은 기후 변수 집중 노출. 4어종 분산으로 공급 변동성 완화 및 ASP 개선 가능(자체추정).</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>황다랑어 신규 어획권 확보</strong>: IATTC·WCPFC 황다랑어 쿼터 forward 매입. 비중 21.7% → 30%로 단계적 확대.</li>
<li style="margin-bottom: 8px;"><strong>날개다랑어 차세대 진입</strong>: 북태평양 날개다랑어 어장 라이센스 선매수 - 기후 변화에 따른 회유 패턴 변화를 선제 대응.</li>
<li><strong>어종 포트폴리오 리밸런싱</strong>: 4어종을 공급 변동성 기반으로 분기 단위 조정. 리스크 분산 효과 모니터링.</li>
</ol>
</div>`,
      source: 'ISSF 2025 Status of the Stocks (illustrative)',
    }}
  />
);

export default TunaSpeciesComposition;
