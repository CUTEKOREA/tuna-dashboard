'use client';

/**
 * Thai Union 기업 해부 차트.
 *
 * ⚠ 매출(십억 밧)과 마진(%)은 단위가 달라 축을 나눈다. 그 외에는 이중축을 쓰지 않는다.
 * ⚠ 「연결 vs 개별」 차트가 이 화면의 존재 이유다 — 개별이 연결보다 큰 비정상 배치를
 *   숫자가 아니라 길이로 보여준다.
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
  thaiUnionCapacity,
  thaiUnionConVsSep,
  thaiUnionFinancials,
  thaiUnionKoreaExport,
  thaiUnionMscTrend,
  thaiUnionSegments,
  thaiUnionTc25,
} from '@/lib/data/company-thaiunion';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

const MARGIN = { top: 12, right: 16, left: 0, bottom: 8 };
const AXIS = { stroke: 'var(--mu-axis)', tick: { fill: 'var(--mu-axis)', fontSize: 11 } } as const;
const grid = <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />;
const legend = <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />;

/* 태국 왕실 남색 — Frinsa(주황)와 색으로도 회사를 가른다. */
const BASE = '#1e40af';
const MARK = '#f59e0b';
const SEP = '#b45309';

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

/** 카테고리별 매출(십억 밧)과 GPM(%). 단위가 달라 축을 나눈다. */
export function TuSegmentChart() {
  const animate = !useReducedMotion();
  const rot = getSmartRotation(thaiUnionSegments.map((r) => r.카테고리));
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={thaiUnionSegments} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
        {grid}
        <XAxis dataKey="카테고리" {...AXIS} tickFormatter={truncateXAxis} angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'} height={rot.angle ? 68 : 30} interval={0} />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} unit="%" />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="left" dataKey="매출" name="매출 (십억 밧)" fill={BASE} isAnimationActive={animate} />
        <Line yAxisId="right" dataKey="gpm" name="GPM (%)" stroke={MARK} strokeWidth={2}
          dot={{ r: 3 }} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 자사 브랜드 매출 비중(%). Ambient 55.7 vs PetCare 1.2 — 두 모델의 대비가 요지다. */
export function TuBrandShareChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(
    () => thaiUnionSegments.filter((r) => r.브랜드비중 !== null),
    [],
  );
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="카테고리" {...AXIS} />
        <YAxis {...AXIS} unit="%" domain={[0, 100]} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="브랜드비중" name="자사 브랜드 비중 (%)" isAnimationActive={animate}>
          {rows.map((r) => (
            <Cell key={r.카테고리} fill={(r.브랜드비중 ?? 0) < 10 ? MARK : BASE} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 그룹 캐파(톤/년). 참치 57만 톤이 축이다. */
export function TuCapacityChart() {
  const animate = !useReducedMotion();
  const rot = getSmartRotation(thaiUnionCapacity.map((r) => r.품목));
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={thaiUnionCapacity} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
        {grid}
        <XAxis dataKey="품목" {...AXIS} tickFormatter={truncateXAxis} angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'} height={rot.angle ? 68 : 30} interval={0} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 10000)}만`} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="톤" name="캐파 (톤/년)" isAnimationActive={animate}>
          {thaiUnionCapacity.map((r) => (
            <Cell key={r.품목} fill={r.품목 === '참치' ? MARK : BASE} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 조달 어장 구성 추이. MSC 가 2년 만에 31→71.4% — 누적 막대로 «졸업» 이동을 보인다. */
export function TuMscTrendChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(
    () => thaiUnionMscTrend.map((r) => ({ ...r, 라벨: `${r.연도}년` })),
    [],
  );
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="라벨" {...AXIS} />
        <YAxis {...AXIS} unit="%" domain={[0, 100]} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="msc" name="MSC 인증" stackId="a" fill={BASE} isAnimationActive={animate} />
        <Bar dataKey="심사중" name="MSC 심사중" stackId="a" fill="#3b82f6" isAnimationActive={animate} />
        <Bar dataKey="fip" name="FIP" stackId="a" fill="#93c5fd" isAnimationActive={animate} />
        <Bar dataKey="무관계" name="해당 없음" stackId="a" fill={MARK} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** TC25 6대 약속 이행률. 목표는 전부 100% — 미달 구간이 노랗다. */
export function TuTc25Chart() {
  const animate = !useReducedMotion();
  const rot = getSmartRotation(thaiUnionTc25.map((r) => r.약속));
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={thaiUnionTc25} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
        {grid}
        <XAxis dataKey="약속" {...AXIS} tickFormatter={truncateXAxis} angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'} height={rot.angle ? 68 : 30} interval={0} />
        <YAxis {...AXIS} unit="%" domain={[0, 100]} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="실적" name="2024 이행률 (%)" isAnimationActive={animate}>
          {thaiUnionTc25.map((r) => (
            <Cell key={r.약속} fill={r.실적 >= 100 ? BASE : MARK} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 연결 매출(십억 밧)과 GPM(%). 2023 매출은 원본 미수록이라 비어 있다 — 0 이 아니다. */
export function TuFinancialChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(
    () => thaiUnionFinancials.map((r) => ({
      라벨: `${r.연도}년`,
      매출: r.매출 === null ? null : Number((r.매출 / 1000).toFixed(1)),
      gpm: r.gpm,
    })),
    [],
  );
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="라벨" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} unit="%" domain={[15, 20]} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="left" dataKey="매출" name="연결 매출 (십억 밧)" fill={BASE} isAnimationActive={animate} />
        <Line yAxisId="right" dataKey="gpm" name="매출총이익률 (%)" stroke={MARK} strokeWidth={2}
          dot={{ r: 3 }} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 연결 vs 개별 — 개별이 큰 항목이 갈색이다. 이 역전이 4층 함정의 실체다. */
export function TuConVsSepChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(
    () => thaiUnionConVsSep.map((r) => ({
      항목: r.항목,
      연결: Number((r.연결 / 1e6).toFixed(1)),
      개별: Number((r.개별 / 1e6).toFixed(1)),
    })),
    [],
  );
  const rot = getSmartRotation(rows.map((r) => r.항목));
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
        {grid}
        <XAxis dataKey="항목" {...AXIS} tickFormatter={truncateXAxis} angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'} height={rot.angle ? 68 : 30} interval={0} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${v.toLocaleString('ko-KR')}`} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="연결" name="연결 (십억 밧)" fill={BASE} isAnimationActive={animate} />
        <Bar dataKey="개별" name="개별 (십억 밧)" fill={SEP} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 → 태국 냉동참치 수출. 물량과 금액의 단위가 달라 축을 나눈다. */
export function TuKoreaExportChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(
    () => thaiUnionKoreaExport.map((r) => ({
      라벨: `${r.연도}년`,
      톤: Math.round(r.톤),
      백만달러: Number((r.usd / 1e6).toFixed(1)),
    })),
    [],
  );
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="라벨" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} tickFormatter={(v: number) => v.toLocaleString('ko-KR')} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="left" dataKey="톤" name="물량 (톤)" fill={BASE} isAnimationActive={animate} />
        <Line yAxisId="right" dataKey="백만달러" name="금액 (백만$)" stroke={MARK} strokeWidth={2}
          dot={{ r: 4 }} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}
