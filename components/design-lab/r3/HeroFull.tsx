/**
 * r3 시안 — 풀 하이브리드. r2-B(밀도형 스탯 스트립) + r2-C(추세형 스파크라인) 결합.
 * 좌: 방콕 SKJ 대형 KPI+증감 / 우: 12주 스파크라인(마지막 점 강조) / 하: 8허브 스탯 스트립 1행.
 */
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, ReferenceDot } from 'recharts';
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

export default function HeroFull({ rows }: { rows: AtunaPriceRow[] }) {
  const bkkHub = SKJ_ATUNA_HUBS[0];
  const bkk = latestTwoForAtunaHub(rows, bkkHub);
  const bkkDelta = deltaView(calcAtunaDeltaPct(bkk));
  const recent = hubSeries(rows, bkkHub.key, 12);
  const lastPoint = recent.length > 0 ? recent[recent.length - 1] : null;
  const hubs = [
    ...SKJ_ATUNA_HUBS.map((hub) => ({ hub, kind: 'SKJ' })),
    ...YF_ATUNA_HUBS.map((hub) => ({ hub, kind: 'YF' })),
  ];

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>방콕 SKJ 현물가</div>
          <div
            style={{
              fontSize: '2.6rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-main)',
              lineHeight: 1.15,
            }}
          >
            {bkk.latest ? `$${bkk.latest.price.toLocaleString()}` : '—'}
            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>($/MT)</span>
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: bkkDelta.color, marginTop: 2 }}>
            직전 고시 대비 {bkkDelta.text}
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: 4 }}>
            {bkk.latest ? `기준일 ${bkk.latest.date.replace(/-/g, '.')}` : '기준일 —'} · 최근 12주 고시
          </div>
        </div>

        {recent.length >= 2 && lastPoint && (
          <LineChart width={360} height={96} data={recent} margin={{ top: 10, right: 12, left: 10, bottom: 10 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="var(--chart-s1, #509ee3)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceDot x={lastPoint.date} y={lastPoint.price} r={4.5} fill={bkkDelta.color} stroke="none" />
          </LineChart>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
          gap: 6,
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid var(--card-border, #e2e4e9)',
        }}
      >
        {hubs.map(({ hub, kind }) => {
          const pair = latestTwoForAtunaHub(rows, hub);
          const view = deltaView(calcAtunaDeltaPct(pair));
          return (
            <div key={`${kind}-${hub.key}`} style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {kind} {hub.label}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--text-main)',
                }}
              >
                {pair.latest ? `$${pair.latest.price.toLocaleString()}` : '—'}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: view.color, whiteSpace: 'nowrap' }}>
                {view.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
