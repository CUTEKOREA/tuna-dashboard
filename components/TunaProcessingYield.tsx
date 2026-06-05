/**
 * 참치 가공 수율 비교 (LineChart) — Stage 1 검증 위젯 #3
 *
 * spec: artifacts/spec_stage1.md
 * pillar: S2 (🏭 가공·생산)
 * gradient: cyan → blue 계열 4선 (어종별 구분)
 * ADR-0005 WidgetCard 사용
 */

'use client';
import React from 'react';
import { Factory } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import WidgetCard from './WidgetCard';

// ─── 정적 mock 데이터 (Stage 1 한정) ─────────────────────────────────────────
// 단위: % (원물 대비 수율)
// 출처: KFAS 한국수산과학회지 2024 + 산업통계 (Stage 1 mock)
// X축: 가공공정 한글 5자 이내 ✓ (D-05 통과)

const data = [
  { stage: '원물',   skipjack: 100, yellowfin: 100, bigeye: 100, albacore: 100 },
  { stage: '두절',   skipjack: 85,  yellowfin: 83,  bigeye: 82,  albacore: 84 },
  { stage: '삼분할', skipjack: 68,  yellowfin: 70,  bigeye: 72,  albacore: 71 },
  { stage: '정형',   skipjack: 56,  yellowfin: 60,  bigeye: 63,  albacore: 61 },
  { stage: '충전',   skipjack: 52,  yellowfin: 57,  bigeye: 60,  albacore: 58 },
];

const SPECIES: { key: string; name: string; color: string }[] = [
  { key: 'skipjack',  name: '가다랑어',   color: '#22d3ee' },
  { key: 'yellowfin', name: '황다랑어',   color: '#38bdf8' },
  { key: 'bigeye',    name: '눈다랑어',   color: '#3b82f6' },
  { key: 'albacore',  name: '날개다랑어', color: '#6366f1' },
];

// ─── 커스텀 툴팁 (한글 100%, W-02 단위 명기) ─────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: '0 0 4px 0', fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry: any, i: number) => {
        const species = SPECIES.find((s) => s.key === entry.dataKey);
        return (
          <p key={i} style={{ color: entry.color, margin: '2px 0', fontSize: '0.8rem' }}>
            {species?.name ?? entry.dataKey} · {entry.value}%
          </p>
        );
      })}
    </div>
  );
};

// ─── 위젯 본체 ───────────────────────────────────────────────────────────────

const TunaProcessingYield = () => (
  <WidgetCard
    title="참치 가공 수율 비교"
    icon={Factory}
    iconColor="#22d3ee"
    pillar="S2"
    cardDesc="KFAS 산업통계 기반 어종 4종의 5단계 가공공정 수율(원물=100% 기준) — illustrative 시뮬레이션"
    unit="(% / 원물 기준)"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    termTooltip={{
      term: 'KFAS',
      description: 'KFAS(한국수산과학회)는 수산 가공·양식·자원 분야의 학술 연구를 수행하는 국내 학회로, 산업통계·논문을 통해 가공 수율 데이터를 제공.',
    }}
    chartHeight={300}
    chart={
      <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis
          dataKey="stage"
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          domain={[40, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => {
            const species = SPECIES.find((s) => s.key === value);
            return <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{species?.name ?? value}</span>;
          }}
        />
        {SPECIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={2}
            dot={{ fill: s.color, r: 3, strokeWidth: 0 }}
            activeDot={{ fill: s.color, r: 5, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    }
    takeaway={{
      situation: `<div>
<p>"가공 수율(Processing Yield)"이란 원물 100kg을 가공 라인에 투입했을 때 최종 통조림 충전되는 살의 비율. 같은 1톤 원물을 사도 수율 차이만큼 매출이 다릅니다.</p>
<p>어종별 수율 차이: <strong>가다랑어 52% vs 눈다랑어 60%</strong> — 약 <strong>8%p 격차</strong>. 정형 단계(56% vs 63%)에서 격차 가장 크게 벌어짐. 가다랑어는 작은 size(평균 3~5kg)로 정형 손실이 큼.</p>
<p>의미: 8%p 수율 차이는 곧 8%p 매출 차이. 가다랑어 비중 60% 한국 가공 라인의 평균 수율을 +3~5%p 개선하면 <strong>연 15억원+ 원가 절감</strong>.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 가공 수율은 단순 KPI가 아닌 설비 투자 회수의 핵심 동인. 자동화 설비 도입 시 업계 추정 기준 18개월 내 회수 가능성 존재(내부 실사 필요).</p>
<p><strong>3단계 검토 방향</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>가다랑어 정형 자동화 라인 도입 검토</strong>: 글로벌 수산가공 자동화 시스템(노르웨이·아이슬란드산 등) — 수율 +3~5%p, 인건비 절감 가능성. 투자 규모·회수 기간은 라인 규모에 따라 별도 산정 필요.</li>
<li style="margin-bottom: 8px;"><strong>수율 기반 KPI 전환</strong>: 본사 KPI를 톤 가공량에서 수율 %로 전환해 라인별 월간 성과 비교 체계 구축.</li>
<li><strong>수율 최적화 노하우의 사업화 가능성 검토</strong>: 동남아 중소 가공사 대상 컨설팅·기술 라이센싱 — 수익 규모는 시장 조사 후 산정.</li>
</ol>
</div>`,
      source: 'KFAS 한국수산과학회지 2024 + 업계추정 (illustrative — Stage 1 mock)',
    }}
  />
);

export default TunaProcessingYield;
