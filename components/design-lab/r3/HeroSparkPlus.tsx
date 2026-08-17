/**
 * r3 시안 — C(추세형) 개량. 대형 KPI + 12주 스파크라인에
 * 최고·최저 가로 점선(ReferenceLine)과 마지막 관측 dot 강조를 얹는다.
 * rows는 호출부 주입 — 이 파일은 fetch하지 않는다.
 */
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, ReferenceDot } from 'recharts';
import {
  SKJ_ATUNA_HUBS,
  latestTwoForAtunaHub,
  calcAtunaDeltaPct,
  type AtunaPriceRow,
} from '../../../lib/data/atuna-price-summary';

/** 주식 컨벤션 — 상승 빨강 / 하락 파랑 / 보합·불명 무채색 */
const UP = '#ef4444';
const DOWN = '#3b82f6';
const FLAT = 'var(--text-muted)';

/** 0.05% 미만은 표기상 0.0%로 찍히므로 보합색으로 묶는다 */
function deltaColor(pct: number | null): string {
  if (pct === null || Math.abs(pct) < 0.05) return FLAT;
  return pct > 0 ? UP : DOWN;
}

function deltaText(pct: number | null): string {
  if (pct === null) return '직전 없음';
  if (Math.abs(pct) < 0.05) return '보합 0.0%';
  return `${pct > 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}%`;
}

function usd(value: number): string {
  return `$${value.toLocaleString()}`;
}

export default function HeroSparkPlus({ rows }: { rows: AtunaPriceRow[] }) {
  const hub = SKJ_ATUNA_HUBS[0];
  const pair = latestTwoForAtunaHub(rows, hub);
  const deltaPct = calcAtunaDeltaPct(pair);

  const recent = rows
    .filter((row) => typeof row.date === 'string' && typeof row[hub.key] === 'number' && Number.isFinite(row[hub.key]))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12)
    .map((row) => ({ date: row.date, price: row[hub.key] as number }));

  const prices = recent.map((point) => point.price);
  const hasChart = recent.length >= 2;
  const maxPrice = hasChart ? Math.max(...prices) : null;
  const minPrice = hasChart ? Math.min(...prices) : null;
  // 점선 라벨이 차트 밖으로 잘리지 않도록 도메인에 여백을 준다
  const pad = maxPrice !== null && minPrice !== null ? Math.max((maxPrice - minPrice) * 0.28, 15) : 0;
  const last = recent[recent.length - 1];
  const trendPct = hasChart && recent[0].price !== 0
    ? ((last.price - recent[0].price) / recent[0].price) * 100
    : null;

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 210 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>방콕 SKJ 현물가</div>
          <div
            style={{
              fontSize: '2.7rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-main)',
              lineHeight: 1.1,
            }}
          >
            {pair.latest ? usd(pair.latest.price) : '—'}
            <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 7 }}>($/MT)</span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: deltaColor(deltaPct), marginTop: 2 }}>
            {deltaText(deltaPct)}
            <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>직전 고시 대비</span>
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: 8 }}>
            기준일 {pair.latest ? pair.latest.date.replace(/-/g, '.') : '—'}
          </div>
          {hasChart && maxPrice !== null && minPrice !== null && (
            <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: 3 }}>
              최근 {recent.length}주 최고 {usd(maxPrice)} · 최저 {usd(minPrice)}
            </div>
          )}
        </div>

        <div>
          {hasChart && maxPrice !== null && minPrice !== null ? (
            <LineChart width={380} height={124} data={recent} margin={{ top: 14, right: 14, left: 10, bottom: 10 }}>
              <XAxis dataKey="date" hide />
              <YAxis hide domain={[minPrice - pad, maxPrice + pad]} />
              <ReferenceLine
                y={maxPrice}
                stroke="var(--text-muted)"
                strokeDasharray="3 3"
                strokeOpacity={0.55}
                label={{ value: `최고 ${usd(maxPrice)}`, position: 'insideTopLeft', fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
              />
              <ReferenceLine
                y={minPrice}
                stroke="var(--text-muted)"
                strokeDasharray="3 3"
                strokeOpacity={0.55}
                label={{ value: `최저 ${usd(minPrice)}`, position: 'insideBottomLeft', fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={deltaColor(trendPct)}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <ReferenceDot x={last.date} y={last.price} r={4.5} fill={deltaColor(deltaPct)} stroke="none" />
            </LineChart>
          ) : (
            <div style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)', padding: '30px 0' }}>
              최근 추세 표시 불가 — 관측 2주 미만
            </div>
          )}
          {hasChart && (
            <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)', paddingLeft: 10 }}>
              선 색 = {recent.length}주 추세{' '}
              <span style={{ fontWeight: 700, color: deltaColor(trendPct) }}>{deltaText(trendPct)}</span> · 끝점 = 최신 고시
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
