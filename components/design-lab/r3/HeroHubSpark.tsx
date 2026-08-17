/**
 * r3 시안 — 허브별 미니 스파크. 8개 허브 카드마다 최신가·증감·최근 8주 미니 스파크라인(80×28).
 * 대표 KPI 하나 대신 «어느 허브가 어느 방향으로 움직이는가»를 8개 동시에 읽힌다.
 */
'use client';

import React from 'react';
import { LineChart, Line, YAxis } from 'recharts';
import {
  SKJ_ATUNA_HUBS,
  YF_ATUNA_HUBS,
  latestTwoForAtunaHub,
  calcAtunaDeltaPct,
  type AtunaPriceRow,
} from '../../../lib/data/atuna-price-summary';

/* 주식 컨벤션 — 상승 빨강, 하락 파랑, 보합·불명 회색 */
const UP = '#ef4444';
const DOWN = '#3b82f6';
const FLAT = 'var(--text-muted)';

function deltaView(delta: number | null): { color: string; text: string } {
  if (delta === null) return { color: FLAT, text: '직전 없음' };
  if (Math.abs(delta) < 0.05) return { color: FLAT, text: '보합 0.0%' };
  return {
    color: delta > 0 ? UP : DOWN,
    text: `${delta > 0 ? '▲' : '▼'} ${Math.abs(delta).toFixed(1)}%`,
  };
}

function hubSeries(rows: AtunaPriceRow[], hubKey: string, count: number) {
  return rows
    .filter((row) => typeof row.date === 'string' && typeof row[hubKey] === 'number')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-count)
    .map((row) => ({ date: row.date, price: row[hubKey] as number }));
}

export default function HeroHubSpark({ rows }: { rows: AtunaPriceRow[] }) {
  const hubs = [
    ...SKJ_ATUNA_HUBS.map((hub) => ({ hub, kind: 'SKJ' })),
    ...YF_ATUNA_HUBS.map((hub) => ({ hub, kind: 'YF' })),
  ].map(({ hub, kind }) => {
    const pair = latestTwoForAtunaHub(rows, hub);
    return {
      hub,
      kind,
      pair,
      view: deltaView(calcAtunaDeltaPct(pair)),
      series: hubSeries(rows, hub.key, 8),
    };
  });

  /* 기준일은 허브마다 다를 수 있다 — 최신 관측일을 대표로 쓴다 */
  const latestDate = hubs.reduce<string | null>((max, item) => {
    const date = item.pair.latest?.date;
    if (!date) return max;
    return max === null || date > max ? date : max;
  }, null);

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>허브별 원어 현물가</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>($/MT) · 최근 8주 추이</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
          {latestDate ? `기준일 ${latestDate.replace(/-/g, '.')}` : '기준일 —'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(178px, 1fr))',
          gap: 10,
          marginTop: 14,
        }}
      >
        {hubs.map(({ hub, kind, pair, view, series }) => (
          <div
            key={`${kind}-${hub.key}`}
            style={{
              border: '1px solid var(--card-border, #e2e4e9)',
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minWidth: 0,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {kind} {hub.label}
              </div>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--text-main)',
                  lineHeight: 1.2,
                }}
              >
                {pair.latest ? `$${pair.latest.price.toLocaleString()}` : '—'}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: view.color, whiteSpace: 'nowrap' }}>
                {view.text}
              </div>
            </div>

            {series.length >= 2 ? (
              <LineChart width={80} height={28} data={series} margin={{ top: 3, right: 3, left: 3, bottom: 3 }}>
                <YAxis hide domain={['auto', 'auto']} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={view.color === FLAT ? 'var(--chart-s1, #509ee3)' : view.color}
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            ) : (
              <span style={{ width: 80, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
