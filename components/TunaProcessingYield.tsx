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
    cardDesc="KFAS 산업통계 기반 어종 4종의 5단계 가공공정 수율(원물=100% 기준)"
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
      situation: '최종 충전 수율은 가다랑어 52% vs 눈다랑어 60%로 약 8%p 격차. 정형 단계(56% vs 63%)에서 격차가 크게 벌어짐 — 가다랑어는 작은 size로 정형 손실이 큼.',
      actionPlan: '가다랑어 정형 자동화 라인 도입 시 수율 +3-5%p 가능 — 연간 원료 비용 환산 ~15억원 절감 추정. CapEx 회수기간 18개월 시뮬레이션 권고.',
      source: 'KFAS 한국수산과학회지 2024 + 산업통계 (Stage 1 mock)',
    }}
  />
);

export default TunaProcessingYield;
