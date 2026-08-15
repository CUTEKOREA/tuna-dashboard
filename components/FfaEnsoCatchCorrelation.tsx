/**
 * R3. ENSO × 어획 상관 분석 차트
 *
 * NOAA ONI 지수와 WCPO 전체 어획량 간의 상관관계를 이중 Y축 ComposedChart로 시각화.
 * El Niño(적색), La Niña(청색), 중립(회색) 위상별 색상 코딩 적용.
 *
 * pillar: S1 (원료 수급)
 * source: NOAA CPC ONI + WCPFC Tuna Fishery Yearbook
 */

'use client';
import React from 'react';
import { Thermometer } from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, Cell,
} from 'recharts';
import WidgetCard from './WidgetCard';
import { truncateKoreanLabel } from '../lib/chart-standards';
import { ChartPatternDefs } from './ChartPatterns';

// ─── ENSO 위상 판별 ──────────────────────────────────────────────────────────

type EnsoPhase = 'elNino' | 'laNina' | 'neutral';

function getEnsoPhase(oni: number): EnsoPhase {
  if (oni >= 0.5) return 'elNino';
  if (oni <= -0.5) return 'laNina';
  return 'neutral';
}

function getPhaseColor(phase: EnsoPhase): string {
  switch (phase) {
    case 'elNino': return '#ef4444';   // Rose/Red
    case 'laNina': return '#3b82f6';   // Blue
    case 'neutral': return '#64748b';  // Slate/Gray
  }
}

function getPhaseLabel(phase: EnsoPhase): string {
  switch (phase) {
    case 'elNino': return '엘니뇨';
    case 'laNina': return '라니냐';
    case 'neutral': return '중립';
  }
}

// ─── 데이터 (NOAA CPC ONI 연평균 + WCPFC 총 어획량) ────────────────────────

interface EnsoDataPoint {
  year: number;
  oni: number;
  catch: number;
  phase: EnsoPhase;
}

const RAW_DATA: Omit<EnsoDataPoint, 'phase'>[] = [
  { year: 2012, oni: -0.5, catch: 2511 },
  { year: 2013, oni: -0.3, catch: 2570 },
  { year: 2014, oni:  0.3, catch: 2874 },
  { year: 2015, oni:  1.8, catch: 2726 },
  { year: 2016, oni:  0.8, catch: 2726 },
  { year: 2017, oni: -0.7, catch: 2540 },
  { year: 2018, oni: -0.4, catch: 2981 },
  { year: 2019, oni:  0.1, catch: 2918 },
  { year: 2020, oni: -1.0, catch: 2623 },
  { year: 2021, oni: -0.8, catch: 2632 },
  { year: 2022, oni: -0.6, catch: 2774 },
  { year: 2023, oni:  1.2, catch: 2660 },
  { year: 2024, oni:  0.5, catch: 3059 },
];

const data: EnsoDataPoint[] = RAW_DATA.map((d) => ({
  ...d,
  phase: getEnsoPhase(d.oni),
}));

// ─── 통계 계산 ──────────────────────────────────────────────────────────────

function computeCorrelation(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n === 0) return 0;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

const oniValues = data.map((d) => d.oni);
const catchValues = data.map((d) => d.catch);
const correlation = computeCorrelation(oniValues, catchValues);

const avgCatch = Math.round(catchValues.reduce((a, b) => a + b, 0) / catchValues.length);
const maxCatchYear = data.reduce((best, d) => (d.catch > best.catch ? d : best), data[0]);
const elNinoYears = data.filter((d) => d.phase === 'elNino').length;
const laNinaYears = data.filter((d) => d.phase === 'laNina').length;

// ─── 커스텀 툴팁 ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as EnsoDataPoint;
  if (!point) return null;

  return (
    <div style={{
      background: 'rgba(10, 16, 40, 0.95)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: '0.82rem',
    }}>
      <p style={{ color: 'var(--w-slate-50)', fontWeight: 700, margin: '0 0 6px 0' }}>
        {point.year}년
        <span style={{
          marginLeft: 8,
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#fff',
          background: getPhaseColor(point.phase),
        }}>
          {getPhaseLabel(point.phase)}
        </span>
      </p>
      <p style={{ color: 'var(--w-slate-400)', margin: '3px 0' }}>
        ONI 지수: <span style={{ color: getPhaseColor(point.phase), fontWeight: 600 }}>{point.oni > 0 ? '+' : ''}{point.oni.toFixed(1)}</span>
      </p>
      <p style={{ color: 'var(--w-slate-400)', margin: '3px 0' }}>
        WCPO 어획량: <span style={{ color: '#22d3ee', fontWeight: 600 }}>{point.catch.toLocaleString()}천 MT</span>
      </p>
    </div>
  );
};

// ─── 커스텀 범례 ────────────────────────────────────────────────────────────

const CustomLegend = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--w-red-500)' }} />
      엘니뇨 (ONI ≥ 0.5)
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--w-blue-500)' }} />
      라니냐 (ONI ≤ -0.5)
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--w-slate-500)' }} />
      중립
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-block', width: 12, height: 3, borderRadius: 2, background: '#22d3ee' }} />
      WCPO 어획량
    </span>
  </div>
);

// ─── 위젯 본체 ──────────────────────────────────────────────────────────────

export default function FfaEnsoCatchCorrelation() {
  return (
    <WidgetCard
      title="ENSO × 어획량 상관 분석"
      icon={Thermometer}
      iconColor="#22d3ee"
      pillar="S1"
      cardDesc="NOAA(미국 해양대기청) ONI 지수와 WCPO(서중태평양) 참치 총 어획량(천 MT)의 연도별 상관관계 시각화"
      telemetry={{ status: 'STATIC', syncDate: '2025-Q4' }}
      termTooltip={{
        term: 'ONI',
        description: '해양 엘니뇨 지수(Oceanic Niño Index). NOAA가 산출하는 ENSO 모니터링 핵심 지표로, 니뇨 3.4 해역(5°N–5°S, 120°–170°W) 해수면 온도 편차의 3개월 이동평균.',
      }}
      kpiPanel={[
        { label: '상관계수(r)', value: correlation.toFixed(2), sub: 'ONI vs 어획량' },
        { label: '평균 어획량', value: `${avgCatch.toLocaleString()}`, sub: '천 MT (2012–2024)' },
        { label: '최대 어획', value: `${maxCatchYear.catch.toLocaleString()}`, sub: `${maxCatchYear.year}년`, trendColor: '#10b981' },
        { label: 'ENSO 위상', value: `${elNinoYears}/${laNinaYears}`, sub: '엘니뇨/라니냐 연수' },
      ]}
      chartHeight={320}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="ensoCatchLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="var(--w-blue-500)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="year"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            tickFormatter={(v) => truncateKoreanLabel(v, 7)}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'var(--w-slate-400)', fontSize: 10 }}
            domain={[-1.5, 2.5]}
            tickFormatter={(v: number) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1))}
            label={{
              value: 'ONI 지수',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'var(--w-slate-400)', fontSize: 10 },
              offset: -5,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: '#22d3ee', fontSize: 10 }}
            domain={[2200, 3200]}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}K`}
            label={{
              value: '어획량 (천 MT)',
              angle: 90,
              position: 'insideRight',
              style: { fill: '#22d3ee', fontSize: 10 },
              offset: -5,
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend content={<CustomLegend />} />
          <ReferenceLine
            yAxisId="left"
            y={0}
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="4 4"
            label={{
              value: 'ONI=0',
              position: 'left',
              style: { fill: 'var(--w-slate-400)', fontSize: 9 },
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="oni"
            name="ONI 지수"
            barSize={24}
            radius={[3, 3, 0, 0]}
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={getPhaseColor(entry.phase)} fillOpacity={0.75} />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="catch"
            name="WCPO 어획량"
            stroke="url(#ensoCatchLineGrad)"
            strokeWidth={2.5}
            dot={{ fill: '#22d3ee', r: 4, strokeWidth: 0 }}
            activeDot={{ fill: 'var(--w-blue-500)', r: 6, strokeWidth: 2, stroke: '#22d3ee' }}
          />
        </ComposedChart>
      }
      takeaway={{
        situation: `2012–2024년 NOAA ONI 지수와 WCPO 참치 어획량의 피어슨 상관계수는 ${correlation.toFixed(2)}로, 단순 선형 상관은 약합니다. 그러나 ENSO는 어획 '총량'보다 '어장 분포'에 실질적 영향을 줍니다. 엘니뇨 시기(2015, 2023) 난수역(warm pool)이 동쪽으로 확장하면서 PNA(태평양도서국) 배타적 경제수역 밖으로 어장이 이동해 VDS 조업일수 가치가 변동합니다. 반대로 라니냐(2020–2022) 기간에는 서적도 해역에 어장이 집중되어 PNA EEZ 내 어획 효율이 높아지는 경향이 나타납니다.`,
        actionPlan: `ENSO 예보(NOAA CFS v2, ECMWF SEAS5)를 분기별로 모니터링하여 원료 소싱 전략을 조정할 것을 권고합니다. 엘니뇨 전환 시 중·동태평양 선단 배치 확대 및 PNA 외 공해 조업 라이선스 사전 확보를 검토하고, 라니냐 전환 시 PNA VDS 조업일 확보에 집중하여 단위 비용을 절감하는 전략을 고려할 수 있습니다.`,
        source: 'NOAA CPC ONI + WCPFC 참치 어업 연감(Tuna Fishery Yearbook, 2012–2024)',
      }}
    />
  );
}
