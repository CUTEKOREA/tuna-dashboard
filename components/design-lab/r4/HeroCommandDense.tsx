/**
 * r4 시안 — 승자 완전체의 밀도 변형. HeroCommand와 동일 + 허브 카드마다 8주 미니 스파크(r3-B 접목).
 * 비교 목적: 카드 안 추세선이 정보를 더하는가, 소음을 더하는가.
 */
'use client';

import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, ReferenceLine, ReferenceDot,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  SKJ_ATUNA_HUBS,
  YF_ATUNA_HUBS,
  latestTwoForAtunaHub,
  calcAtunaDeltaPct,
  type AtunaHubDefinition,
  type AtunaPriceRow,
} from '../../../lib/data/atuna-price-summary';

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

const ALL_HUBS: { hub: AtunaHubDefinition; kind: 'SKJ' | 'YF' }[] = [
  ...SKJ_ATUNA_HUBS.map((hub) => ({ hub, kind: 'SKJ' as const })),
  ...YF_ATUNA_HUBS.map((hub) => ({ hub, kind: 'YF' as const })),
];

function CommandTip({ active, payload }: {
  active?: boolean;
  payload?: { payload?: { date?: string; price?: number } }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point || typeof point.price !== 'number') return null;
  return (
    <div style={{
      background: '#303c46', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 8,
      padding: '6px 10px', fontSize: 12, color: '#ffffff', fontVariantNumeric: 'tabular-nums',
    }}>
      <div style={{ color: '#c6c9d2' }}>{point.date?.replace(/-/g, '.')}</div>
      <div style={{ fontWeight: 700 }}>${point.price.toLocaleString()} <span style={{ fontWeight: 400, color: '#c6c9d2' }}>($/MT)</span></div>
    </div>
  );
}

export default function HeroCommandDense({ rows }: { rows: AtunaPriceRow[] }) {
  const [selectedKey, setSelectedKey] = useState<string>(SKJ_ATUNA_HUBS[0].key);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const selected = ALL_HUBS.find(({ hub }) => hub.key === selectedKey) ?? ALL_HUBS[0];
  const pair = latestTwoForAtunaHub(rows, selected.hub);
  const delta = deltaView(calcAtunaDeltaPct(pair));
  const series = hubSeries(rows, selected.hub.key, 12);
  const prices = series.map((point) => point.price);
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const minPrice = prices.length ? Math.min(...prices) : null;
  const last = series[series.length - 1];

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 220 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {selected.kind === 'SKJ' ? '가다랑어' : '황다랑어'} {selected.hub.label} 현물가
          </div>
          <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
            {pair.latest ? `$${pair.latest.price.toLocaleString()}` : '—'}
            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>($/MT)</span>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: delta.color }}>직전 고시 대비 {delta.text}</div>
          {pair.latest && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
              기준일 {pair.latest.date.replace(/-/g, '.')} · 최근 12주 고시
            </div>
          )}
        </div>
        {series.length >= 2 && maxPrice !== null && minPrice !== null && (
          <LineChart width={430} height={120} data={series} margin={{ top: 12, right: 56, left: 8, bottom: 8 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <RechartsTooltip content={<CommandTip />} cursor={{ stroke: 'var(--text-muted)', strokeDasharray: '3 3' }} />
            <ReferenceLine y={maxPrice} stroke="#8d93a5" strokeDasharray="4 4" label={{ value: `최고 $${maxPrice.toLocaleString()}`, position: 'right', fontSize: 10, fill: 'var(--text-muted)' }} />
            <ReferenceLine y={minPrice} stroke="#8d93a5" strokeDasharray="4 4" label={{ value: `최저 $${minPrice.toLocaleString()}`, position: 'right', fontSize: 10, fill: 'var(--text-muted)' }} />
            <Line type="monotone" dataKey="price" stroke="var(--chart-s1, #509ee3)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            {last && <ReferenceDot x={last.date} y={last.price} r={4} fill="var(--chart-s1, #509ee3)" stroke="#ffffff" strokeWidth={1.5} />}
          </LineChart>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginTop: 16 }}>
        {ALL_HUBS.map(({ hub, kind }) => {
          const hubPair = latestTwoForAtunaHub(rows, hub);
          const hubDeltaRaw = calcAtunaDeltaPct(hubPair);
          const hubDelta = deltaView(hubDeltaRaw);
          const mini = hubSeries(rows, hub.key, 8);
          const miniColor = hubDeltaRaw === null || Math.abs(hubDeltaRaw) < 0.05
            ? '#8d93a5'
            : hubDeltaRaw > 0 ? UP : DOWN;
          const isActive = hub.key === selectedKey;
          const isHover = hub.key === hoverKey;
          return (
            <button
              key={hub.key}
              type="button"
              onClick={() => setSelectedKey(hub.key)}
              onMouseEnter={() => setHoverKey(hub.key)}
              onMouseLeave={() => setHoverKey(null)}
              aria-pressed={isActive}
              style={{
                textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                border: '1px solid ' + (isActive ? 'var(--chart-s1, #509ee3)' : 'var(--card-border, #e2e4e9)'),
                background: isActive ? 'rgba(80, 158, 227, 0.08)' : 'transparent',
                borderRadius: 8, padding: '8px 10px',
                transform: isHover ? 'translateY(-2px)' : 'none',
                boxShadow: isHover ? '0 6px 16px rgba(16, 24, 40, 0.12)' : 'none',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
              }}
            >
              <span>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{kind} {hub.label}</span>
                <span style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
                  {hubPair.latest ? `$${hubPair.latest.price.toLocaleString()}` : '—'}
                </span>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: hubDelta.color }}>{hubDelta.text}</span>
              </span>
              {mini.length >= 2 && (
                <LineChart width={72} height={30} data={mini} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <YAxis hide domain={['auto', 'auto']} />
                  <Line type="monotone" dataKey="price" stroke={miniColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              )}
            </button>
          );
        })}
      </div>
      <p style={{ margin: '10px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        허브 클릭 = 상단 시세·추이 전환 · 카드 추세선은 최근 8주 · 그래프에 마우스를 올리면 주간 수치
      </p>
    </div>
  );
}
