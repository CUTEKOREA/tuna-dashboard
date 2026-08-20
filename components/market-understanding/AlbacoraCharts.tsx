'use client';

/**
 * Albacora 기업 해부 차트.
 *
 * ⚠ 이 회사에는 «매출 시계열»이 없다. 비상장이라 절대액이 공개되지 않는다.
 *   그래서 규모를 보여주는 축이 **매출이 아니라 톤수**다 — 선단 GT, 어획량, EMAS 물량.
 * ⚠ 「SIA 매출 vs 실물 물량」이 이 화면의 존재 이유다. 매출은 2.7% 줄었는데 투입은 44%
 *   빠졌다. 두 계열을 같은 그림에 겹쳐야 «단가가 물량 붕괴를 가렸다»가 보인다.
 * ⚠ 단위가 다른 계열(M€ vs 톤, 톤 vs %)만 축을 나눈다. 그 외 이중축은 쓰지 않는다.
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
  albacoraCamposPrices,
  albacoraCatch,
  albacoraFleet,
  albacoraPlants,
  albacoraSacYield,
  albacoraSafety,
  albacoraSalesDest,
  albacoraSiaTonnage,
  flagCounts,
} from '@/lib/data/company-albacora';
import SafeResponsiveContainer from '../SafeResponsiveContainer';

const MARGIN = { top: 12, right: 16, left: 0, bottom: 8 };
const AXIS = { stroke: 'var(--mu-axis)', tick: { fill: 'var(--mu-axis)', fontSize: 11 } } as const;
const grid = <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />;
const legend = <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />;

/* 바스크 차콜리 초록 — Frinsa(주황)·Thai Union(남색)과 색으로도 회사를 가른다. */
const BASE = '#1f5d4c';
const MARK = '#a32a2a';
const DIM = '#94a3b8';

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

/**
 * 선박별 GT. 상위 3척(INTERTUNA TRES·ALBATUN TRES·DOS)이 4,400 GT 대로 세계 최대급이고
 * 나머지와 층이 갈린다 — 그 층을 색으로 가른다.
 */
export function AlbFleetGtChart() {
  const animate = !useReducedMotion();
  const rot = getSmartRotation(albacoraFleet.map((v) => v.선명));
  return (
    <SafeResponsiveContainer width="100%" height={340}>
      <ComposedChart data={albacoraFleet} margin={{ ...MARGIN, bottom: rot.angle ? 72 : 8 }}>
        {grid}
        <XAxis dataKey="선명" {...AXIS} tickFormatter={truncateXAxis} angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'} height={rot.angle ? 86 : 30} interval={0} />
        <YAxis {...AXIS} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="gt" name="총톤수 (GT)" isAnimationActive={animate}>
          {albacoraFleet.map((v) => (
            <Cell key={v.선명} fill={v.gt >= 4000 ? MARK : BASE} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 기국별 척수·GT. 스페인 8 · 파나마 2 · 모리셔스 2 — 적용 규제가 갈리는 지점이다. */
export function AlbFlagChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(() => flagCounts(), []);
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="선적" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} allowDecimals={false} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="left" dataKey="척수" name="척수" fill={BASE} isAnimationActive={animate} />
        <Line yAxisId="right" dataKey="gt" name="합계 GT" stroke={MARK} strokeWidth={2}
          dot={{ r: 3 }} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 어획물 판매처 비중(%). 인도양·동태평양 두 축이 55%이고 스페인 본토는 10%뿐이다. */
export function AlbSalesDestChart() {
  const animate = !useReducedMotion();
  const rot = getSmartRotation(albacoraSalesDest.map((r) => r.판매처));
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={albacoraSalesDest} margin={{ ...MARGIN, bottom: rot.angle ? 72 : 8 }}>
        {grid}
        <XAxis dataKey="판매처" {...AXIS} tickFormatter={truncateXAxis} angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'} height={rot.angle ? 86 : 30} interval={0} />
        <YAxis {...AXIS} unit="%" />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="비중" name="비중 (%)" isAnimationActive={animate}>
          {albacoraSalesDest.map((r) => (
            <Cell key={r.판매처} fill={r.판매처 === '기타' ? DIM : BASE} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 연간 어획량(톤). 2024 207천 → 2025 약 200천. */
export function AlbCatchChart() {
  const animate = !useReducedMotion();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={albacoraCatch} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis {...AXIS} domain={[0, 240000]} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="톤" name="어획량 (톤)" fill={BASE} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 가공 3사 매출(M€)과 직원 수. 에콰도르 한 곳이 매출 74%·인력 92%다. */
export function AlbPlantChart() {
  const animate = !useReducedMotion();
  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <ComposedChart data={albacoraPlants} margin={MARGIN}>
        {grid}
        <XAxis dataKey="플랜트" {...AXIS} tickFormatter={truncateXAxis} />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="left" dataKey="y2024" name="2024 매출 (M€)" fill={DIM} isAnimationActive={animate} />
        <Bar yAxisId="left" dataKey="y2025" name="2025 매출 (M€)" fill={BASE} isAnimationActive={animate} />
        <Line yAxisId="right" dataKey="직원" name="직원 (명)" stroke={MARK} strokeWidth={2}
          dot={{ r: 4 }} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/**
 * SIA 베르메오 정육 참치 투입량(톤). EMAS 환경선언 — 법정 공개 문서다.
 * 2023년 −44% 가 이 화면의 핵심이고, 매출은 같은 기간 2.7% 줄었을 뿐이다.
 */
export function AlbSiaTonnageChart() {
  const animate = !useReducedMotion();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={albacoraSiaTonnage} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} unit="%" domain={[-60, 20]} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="left" dataKey="톤" name="투입 톤수 (t)" isAnimationActive={animate}>
          {albacoraSiaTonnage.map((r) => (
            <Cell key={r.연도} fill={(r.전년비 ?? 0) < 0 ? MARK : BASE} />
          ))}
        </Bar>
        <Line yAxisId="right" dataKey="전년비" name="전년비 (%)" stroke={MARK} strokeWidth={2}
          strokeDasharray="4 3" dot={{ r: 4 }} connectNulls isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/**
 * SAC 갈리시아 원료 → 제품(톤)과 수율(%).
 * 물량이 많을 때 수율이 떨어지고 적을 때 올라간다 — 고부가 비중이 물량에 반비례한다.
 */
export function AlbSacYieldChart() {
  const animate = !useReducedMotion();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={albacoraSacYield} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} unit="%" domain={[55, 80]} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="left" dataKey="원료" name="원료 (t)" fill={BASE} isAnimationActive={animate} />
        <Bar yAxisId="left" dataKey="제품" name="제품 (t)" fill={DIM} isAnimationActive={animate} />
        <Line yAxisId="right" dataKey="수율" name="수율 (%)" stroke={MARK} strokeWidth={2}
          dot={{ r: 4 }} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/**
 * Campos 자사몰 가격 사다리(EUR). 프린사가 **부위**로 갈렸다면 이쪽은
 * **인증(APR·MSC)과 대용량**으로 갈린다 — MSC 대용량을 붉게 세운다.
 */
export function AlbCamposPriceChart() {
  const animate = !useReducedMotion();
  const rot = getSmartRotation(albacoraCamposPrices.map((r) => r.제품));
  return (
    <SafeResponsiveContainer width="100%" height={380}>
      <ComposedChart data={albacoraCamposPrices} margin={{ ...MARGIN, bottom: rot.angle ? 96 : 8 }}>
        {grid}
        <XAxis dataKey="제품" {...AXIS} tickFormatter={truncateXAxis} angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'} height={rot.angle ? 110 : 30} interval={0} />
        <YAxis {...AXIS} unit="€" />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="가격" name="가격 (EUR)" isAnimationActive={animate}>
          {albacoraCamposPrices.map((r) => (
            <Cell key={r.제품} fill={r.축.startsWith('MSC') ? MARK : r.축 === 'APR' ? BASE : DIM} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 산업안전 지표. 사고 109건(여 29·남 80)이 선단업의 재해 노출 층위를 보여준다.
 * ⚠ 스페인 INSHT 기준이라 타이유니온 LTIFR 과 직접 비교되지 않는다.
 */
export function AlbSafetyChart() {
  const animate = !useReducedMotion();
  const rot = getSmartRotation(albacoraSafety.map((r) => r.지표));
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={albacoraSafety} margin={{ ...MARGIN, bottom: rot.angle ? 60 : 8 }}>
        {grid}
        <XAxis dataKey="지표" {...AXIS} tickFormatter={truncateXAxis} angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'} height={rot.angle ? 74 : 30} interval={0} />
        <YAxis {...AXIS} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="남성" name="남성" fill={BASE} isAnimationActive={animate} />
        <Bar dataKey="여성" name="여성" fill={MARK} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}
