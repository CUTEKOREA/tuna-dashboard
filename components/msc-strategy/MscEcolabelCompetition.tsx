'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Tag } from 'lucide-react';
import WidgetCard from '../WidgetCard';

/* ── Data ─────────────────────────────────────────────────────────── */

const ecolabelData = [
  { label: 'MSC', awareness: 54, trust: 75, purchase: 44 },
  { label: 'Dolphin-Safe', awareness: 68, trust: 65, purchase: 38 },
  { label: 'ASC', awareness: 22, trust: 60, purchase: 15 },
  { label: 'Friend of Sea', awareness: 12, trust: 45, purchase: 8 },
];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(15,23,42,0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

/* ── Component ────────────────────────────────────────────────────── */

export default function MscEcolabelCompetition() {
  const chartElement = (
    <BarChart data={ecolabelData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
      <XAxis
        dataKey="label"
        stroke="rgba(255,255,255,0.4)"
        tick={{ fill: '#94a3b8', fontSize: 12 }}
      />
      <YAxis
        domain={[0, 100]}
        stroke="rgba(255,255,255,0.4)"
        tick={{ fill: '#94a3b8', fontSize: 11 }}
        tickFormatter={(v: number) => `${v}%`}
      />
      <Tooltip
        contentStyle={TOOLTIP_STYLE}
        formatter={(value: number, name: string) => [`${value}%`, name]}
      />
      <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.78rem' }} />
      <Bar dataKey="awareness" name="인지도" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
      <Bar dataKey="trust" name="신뢰도" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
      <Bar dataKey="purchase" name="구매 전환" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
    </BarChart>
  );

  const kpiCallout = (
    <div style={{
      marginTop: '16px',
      background: 'rgba(167,139,250,0.08)',
      border: '1px solid rgba(167,139,250,0.2)',
      borderRadius: 10,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#a78bfa',
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
      }}>
        +81.3%
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '2px' }}>
          MSC + Dolphin-Safe 이중라벨 프리미엄
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          헤도닉 가격 모델 기준, 단독 MSC(+44.6%) 대비 약 2배의 프리미엄 효과
        </div>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="W10. 에코라벨 경쟁 포지션 비교"
      icon={Tag}
      iconColor="#38bdf8"
      pillar="S5"
      cardDesc="MSC·Dolphin-Safe·ASC·Friend of Sea 4대 에코라벨의 인지도·신뢰도·구매전환 비교"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      chart={chartElement}
      chartHeight={320}
      customBody={kpiCallout}
      takeaway={{
        situation: "Dolphin-Safe가 인지도(68%) 1위이나 구매 전환(38%)에서 MSC(44%)에 뒤짐. MSC는 '인지도 대비 구매 전환율'이 81.5%로 최고 — 라벨을 아는 소비자의 대다수가 실제 구매로 전환. 이중 라벨(MSC+DS) 적용 시 +81.3% 헤도닉 프리미엄.",
        actionPlan: "MSC 단독보다 Dolphin-Safe와의 이중 라벨 전략이 프리미엄 극대화에 유효. 수출 제품에 MSC+Dolphin-Safe 동시 표기를 표준화하면 +81% 가격 프리미엄 확보 가능.",
        source: "MSC UK Consumer Insights 2024, MSC Annual Report 2023-2024, Banguning Asgha et al. 2025",
      }}
    />
  );
}
