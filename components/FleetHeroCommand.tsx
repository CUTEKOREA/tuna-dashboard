/**
 * 선망선 어획 지휘형 카드 — 디자인 랩 6라운드 채택본 (★4 «정보 이해 만족», 2026-08-17).
 * 선망선 10척 카드(연간 누계+1~8월 미니 추세) 클릭 → 상단 연간·당월·시즌 일평균·월별 차트 전환.
 * 소스는 fleet-operations 주간 랭킹 단독 — 히어로의 공개 집계(fleet-daily-public)와 기준일이
 * 달라 섞지 않는다. 증감은 완결 월끼리(6월 대비 7월)만 (부분 집계 왜곡 금지).
 */
'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { purseSeineCatch } from '../lib/fleet-operations-2026-08-09';
import { pctChange } from '../lib/metrics';

/* 증감 시맨틱 토큰 (globals.css SSOT) — 주식 컨벤션 (상승 빨강·하락 파랑) */
const UP = 'var(--delta-up, #ef4444)';
const DOWN = 'var(--delta-down, #3b82f6)';
const FLAT = 'var(--text-muted)';

const MONTH_LABELS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월'];

/** 기준일 — «주간 랭킹 기준 2026.08.03~08.09» */
const PERIOD_TEXT =
  `${purseSeineCatch.period.from.replace(/-/g, '.')}~${purseSeineCatch.period.to.slice(5).replace('-', '.')}`;

type FleetVessel = { vessel: string; monthly: number[]; totalMt: number };

const VESSELS: FleetVessel[] = purseSeineCatch.monthlyByVessel.map((row) => ({
  vessel: row.vessel,
  monthly: row.monthlyMt,
  totalMt: row.totalMt,
}));

/** 시즌 실적은 선박 코드 일치로만 조인 — 못 찾으면 «—» */
const SEASON_BY_VESSEL = new Map(
  purseSeineCatch.seasonRanking.map((row) => [row.vessel, row]),
);

function monthSeries(monthly: number[]) {
  return monthly.map((mt, index) => ({
    month: MONTH_LABELS[index] ?? `${index + 1}월`,
    mt,
  }));
}

/** 당월(8월 진행 중) vs 전월(7월) */
/* 마지막 달(8월)은 기준일까지의 부분 집계 — 완전 월과 비교하면 전 선박이 급락처럼 왜곡된다.
   증감은 «완결 월끼리»(6월 대비 7월)만 계산한다 (SOUL ④ 숫자 정직) */
function monthDeltaPct(monthly: number[]): number | null {
  if (monthly.length < 3) return null;
  return pctChange(monthly[monthly.length - 2], monthly[monthly.length - 3]);
}

function deltaView(delta: number | null): { color: string; text: string } {
  if (delta === null) return { color: FLAT, text: '직전 없음' };
  if (Math.abs(delta) < 0.05) return { color: FLAT, text: '보합 0.0%' };
  return {
    color: delta > 0 ? UP : DOWN,
    text: `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(1)}%`,
  };
}

function CatchTip({ active, payload }: {
  active?: boolean;
  payload?: { payload?: { month?: string; mt?: number } }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point || typeof point.mt !== 'number') return null;
  return (
    <div style={{
      background: '#303c46', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 8,
      padding: '6px 10px', fontSize: 12, color: '#ffffff', fontVariantNumeric: 'tabular-nums',
    }}>
      <div style={{ color: '#c6c9d2' }}>{point.month}</div>
      <div style={{ fontWeight: 700 }}>
        {point.mt.toLocaleString()} <span style={{ fontWeight: 400, color: '#c6c9d2' }}>(MT)</span>
      </div>
    </div>
  );
}

export default function FleetHeroCommand() {
  const [selectedVessel, setSelectedVessel] = useState<string>(VESSELS[0].vessel);
  const [hoverVessel, setHoverVessel] = useState<string | null>(null);

  const selected = VESSELS.find((row) => row.vessel === selectedVessel) ?? VESSELS[0];
  const series = monthSeries(selected.monthly);
  const delta = deltaView(monthDeltaPct(selected.monthly));
  const currentMonth = selected.monthly[selected.monthly.length - 1];
  const season = SEASON_BY_VESSEL.get(selected.vessel);

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 240 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            선망선 {selected.vessel} 연간 누계 어획량
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {selected.totalMt.toLocaleString()}
            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>(MT)</span>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: delta.color }}>
            6월 대비 7월 (완결 월 기준) {delta.text}
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>8월 누계</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
                {currentMonth.toLocaleString()}
                <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 3 }}>(MT)</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>시즌 일평균</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
                {season ? season.dailyCatchMt.toLocaleString() : '—'}
                <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 3 }}>(MT/일)</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
            주간 랭킹 기준 {PERIOD_TEXT} · 8월은 기준일까지 집계 중
          </div>
        </div>
        <BarChart width={430} height={140} data={series} margin={{ top: 12, right: 12, left: 8, bottom: 4 }}>
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
          <YAxis hide domain={[0, 'auto']} />
          <RechartsTooltip content={<CatchTip />} cursor={{ fill: 'rgba(141, 147, 165, 0.12)' }} />
          <Bar dataKey="mt" fill="var(--chart-s1, #38bdf8)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginTop: 16 }}>
        {VESSELS.map((row) => {
          const rowDeltaRaw = monthDeltaPct(row.monthly);
          const rowDelta = deltaView(rowDeltaRaw);
          const mini = monthSeries(row.monthly);
          const miniColor = rowDeltaRaw === null || Math.abs(rowDeltaRaw) < 0.05
            ? 'var(--delta-flat, #8d93a5)'
            : rowDeltaRaw > 0 ? UP : DOWN;
          const isActive = row.vessel === selectedVessel;
          const isHover = row.vessel === hoverVessel;
          return (
            <button
              key={row.vessel}
              type="button"
              onClick={() => setSelectedVessel(row.vessel)}
              onMouseEnter={() => setHoverVessel(row.vessel)}
              onMouseLeave={() => setHoverVessel(null)}
              aria-pressed={isActive}
              style={{
                textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                border: '1px solid ' + (isActive ? 'var(--chart-s1, #38bdf8)' : 'var(--card-border, #e2e4e9)'),
                background: isActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                borderRadius: 8, padding: '8px 10px',
                transform: isHover ? 'translateY(-2px)' : 'none',
                boxShadow: isHover ? '0 6px 16px rgba(16, 24, 40, 0.12)' : 'none',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              }}
            >
              <span>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{row.vessel}</span>
                <span style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
                  {row.totalMt.toLocaleString()}
                </span>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: rowDelta.color }}>{rowDelta.text}</span>
              </span>
              {mini.length >= 2 && (
                <LineChart width={72} height={30} data={mini} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <YAxis hide domain={['auto', 'auto']} />
                  <Line type="monotone" dataKey="mt" stroke={miniColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              )}
            </button>
          );
        })}
      </div>
      <p style={{ margin: '10px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        선박 클릭 = 상단 누계·월별 추이 전환 · 카드 값은 연간 누계 (MT) · 증감은 6월 대비 7월(완결 월), 추세선은 1~8월 · 그래프에 마우스를 올리면 월별 어획량
      </p>
    </div>
  );
}
