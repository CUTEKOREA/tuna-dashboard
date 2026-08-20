'use client';

/**
 * Frinsa 기업 해부 차트.
 *
 * ⚠ 매출(M€)과 순이익률(%)은 단위가 달라 축을 나눈다. 그 외에는 이중축을 쓰지 않는다 —
 *   서로 다른 단위를 한 축에 얹으면 없는 상관을 보여주게 된다.
 */
import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getSmartRotation, truncateXAxis } from '@/lib/chart-standards';
import {
  frinsaGalicia,
  frinsaKoreaExport,
  frinsaPriceLadder,
  frinsaSourcing,
  marginSeries,
  sustainabilityBy,
} from '@/lib/data/company-frinsa';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

const MARGIN = { top: 12, right: 16, left: 0, bottom: 8 };
const AXIS = { stroke: 'var(--mu-axis)', tick: { fill: 'var(--mu-axis)', fontSize: 11 } } as const;
const grid = <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />;
const legend = <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />;

/* 스페인 캔참치 — 갈리시아 가공 클러스터. 시그니처 색은 품목이 아니라 회사에 준다. */
const BASE = '#c2410c';
const MARK = '#f59e0b';

function Tip({ active, payload, label }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.3)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#f8fafc' }}>
      <div style={{ marginBottom: 4, opacity: 0.75 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name} {typeof p.value === 'number' ? p.value.toLocaleString('ko-KR') : p.value}
        </div>
      ))}
    </div>
  );
}

/** 가격 사다리 — 같은 회사 제품이 층마다 얼마나 벌어지는가. */
export function FrinsaPriceLadderChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(() => [...frinsaPriceLadder].reverse(), []);
  const rot = getSmartRotation(rows.map((r) => r.층));
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
        {grid}
        <XAxis dataKey="층" {...AXIS} tickFormatter={truncateXAxis} angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'} height={rot.angle ? 68 : 30} interval={0} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${v}`} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="eurPerKg" name="단가 (€/kg)" isAnimationActive={animate}>
          {rows.map((r) => (
            <Cell key={r.층} fill={r.eurPerKg > 100 ? MARK : BASE} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 매출과 순이익률. 단위가 달라 축을 나눈다. */
export function FrinsaFinancialChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(() => marginSeries().map((r) => ({ ...r, 라벨: `${r.연도}년` })), []);
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="라벨" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} tickFormatter={(v: number) => `${v}%`} domain={[0, 8]} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="left" dataKey="매출" name="매출 (M€)" fill={BASE} isAnimationActive={animate} />
        <Line yAxisId="right" type="monotone" dataKey="순이익률" name="순이익률 (%)" stroke={MARK} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 갈리시아 3강 매출. 2025년 Frinsa 는 미공표라 값이 없다 — 0 으로 그리지 않는다. */
export function FrinsaGaliciaChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(
    () => (['y2020', 'y2023', 'y2024', 'y2025'] as const).map((k) => ({
      연도: k.slice(1),
      ...Object.fromEntries(frinsaGalicia.map((c) => [c.기업.split(' ')[0], c[k]])),
    })),
    [],
  );
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="Jealsa" name="Jealsa (M€)" fill="#64748b" isAnimationActive={animate} />
        <Bar dataKey="Frinsa" name="Frinsa (M€)" fill={BASE} isAnimationActive={animate} />
        <Bar dataKey="Nauterra" name="Nauterra (M€)" fill="#94a3b8" isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 참치 원어 구매량. 「그룹 합계」는 스페인+포르투갈이라 나란히 두면 이중계상이다. */
export function FrinsaSourcingChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(() => frinsaSourcing.filter((r) => !r.구분.includes('합계') && !r.구분.includes('전체')), []);
  return (
    <SafeResponsiveContainer width="100%" height={250}>
      <ComposedChart data={rows} margin={MARGIN} layout="vertical">
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <YAxis type="category" dataKey="구분" {...AXIS} width={140} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="톤" name="구매량 (톤)" fill={BASE} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 2025년 참치 구매 출처. 두 축이 같은 것을 재지 않아 나눠 그린다. */
export function FrinsaSustainabilityChart({ axis }: { axis: string }) {
  const animate = !useReducedMotion();
  const rows = useMemo(() => sustainabilityBy(axis), [axis]);
  return (
    <SafeResponsiveContainer width="100%" height={240}>
      <ComposedChart data={rows} margin={MARGIN} layout="vertical">
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
        <YAxis type="category" dataKey="구분" {...AXIS} width={130} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="비중" name="비중 (%)" isAnimationActive={animate}>
          {rows.map((r) => (
            // 「어디에도 해당 없음」을 짚는다 — 이 표의 요지가 그 칸이다.
            <Cell key={r.구분} fill={r.구분.includes('해당 없음') ? MARK : BASE} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 → 스페인 냉동참치 수출. 물량과 금액이 함께 움직이는지 본다. */
export function FrinsaKoreaExportChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(
    () => frinsaKoreaExport.map((r) => ({ 라벨: `${r.연도}년`, 톤: Math.round(r.kg / 1000), 백만달러: Number((r.usd / 1_000_000).toFixed(1)) })),
    [],
  );
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="라벨" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} tickFormatter={(v: number) => `$${v}M`} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="left" dataKey="톤" name="수출량 (톤)" fill={BASE} isAnimationActive={animate} />
        <Line yAxisId="right" type="monotone" dataKey="백만달러" name="수출액 (백만$)" stroke={MARK} strokeWidth={2} dot={{ r: 4 }} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}
