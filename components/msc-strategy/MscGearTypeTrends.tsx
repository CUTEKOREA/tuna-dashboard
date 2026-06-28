'use client';

import React from 'react';
import { Anchor } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import WidgetCard from '../WidgetCard';

/* ── Data ─────────────────────────────────────────────────────────────────── */

const gearData = [
  { year: '2019', purseSeine: 1200, poleAndLine: 380, longline: 150, other: 70 },
  { year: '2020', purseSeine: 1350, poleAndLine: 400, longline: 180, other: 85 },
  { year: '2021', purseSeine: 1500, poleAndLine: 420, longline: 210, other: 90 },
  { year: '2022', purseSeine: 1700, poleAndLine: 450, longline: 240, other: 95 },
  { year: '2023', purseSeine: 1950, poleAndLine: 480, longline: 270, other: 100 },
  { year: '2024', purseSeine: 2200, poleAndLine: 510, longline: 300, other: 110 },
];

/* ── Tooltip ──────────────────────────────────────────────────────────────── */

const tooltipStyle = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

const gearLabels: Record<string, string> = {
  purseSeine: '선망 (Purse Seine)',
  poleAndLine: '채낚기 (Pole & Line)',
  longline: '연승 (Longline)',
  other: '기타',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: '#e2e8f0' }}>{label}년</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: p.color }}>{gearLabels[p.dataKey] || p.dataKey}</span>
          <span style={{ fontWeight: 600 }}>{p.value.toLocaleString()} 천MT</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid rgba(148,163,184,0.2)', marginTop: 4, paddingTop: 4, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#94a3b8' }}>합계</span>
        <span>{total.toLocaleString()} 천MT</span>
      </div>
    </div>
  );
};

/* ── Legend formatter ─────────────────────────────────────────────────────── */

const legendFormatter = (value: string) => {
  return gearLabels[value] || value;
};

/* ── Component ────────────────────────────────────────────────────────────── */

export default function MscGearTypeTrends() {
  return (
    <WidgetCard
      title="W-MSC02. 어구별 MSC 인증 어획량 추이"
      icon={Anchor}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="MSC 인증 참치 어획량을 어구 유형(선망·채낚기·연승·기타)별로 분류한 적층 면적 차트"
      unit="천 MT"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      chartHeight={320}
      chart={
        <AreaChart data={gearData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="gPurseSeine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gPoleAndLine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gLongline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gOther" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#64748b" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={legendFormatter}
            wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8', paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey="other"
            stackId="1"
            stroke="#64748b"
            fill="url(#gOther)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="longline"
            stackId="1"
            stroke="#a78bfa"
            fill="url(#gLongline)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="poleAndLine"
            stackId="1"
            stroke="#10b981"
            fill="url(#gPoleAndLine)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="purseSeine"
            stackId="1"
            stroke="#38bdf8"
            fill="url(#gPurseSeine)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      }
      takeaway={{
        situation: 'MSC 인증 어획량의 70%가 선망(Purse Seine)에 집중. 채낚기(Pole & Line)는 16%로 프리미엄 마케팅 가치가 높지만 물량 한계. 연승(Longline)은 9.6%로 혼획 이슈 때문에 인증 확대가 가장 느림.',
        actionPlan: '선망 중심 한국 선단은 FAD-free 조업 비율을 높여 MSC 인증 유지·확대에 유리한 포지션. 다만 DFAD 규제 강화(2025 WCPFC)에 대비한 FAD-free 전환 비용 선제 투자 필요.',
        source: 'MSC Sustainable Tuna Yearbook 2025/2026, MSC Annual Report 2024-2025',
      }}
    />
  );
}
