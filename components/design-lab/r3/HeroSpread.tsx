/**
 * r3 시안 — 스프레드 포커스. 방콕 KPI + SKJ 5개 허브의 최저~최고 가로 스프레드 바.
 * 「어디서 사고 어디가 비싼가」를 한 줄로 답하는 것이 목적.
 * 가로 바는 recharts 없이 순수 div 포지셔닝 — 축·툴팁이 필요 없는 1차원 분포다.
 * rows는 호출부 주입 — 이 파일은 fetch하지 않는다.
 */
'use client';

import React from 'react';
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

export default function HeroSpread({ rows }: { rows: AtunaPriceRow[] }) {
  // 관측 있는 허브만 가격 오름차순 — 배열 양 끝이 곧 최저·최고다
  const points = SKJ_ATUNA_HUBS.flatMap((hub) => {
    const pair = latestTwoForAtunaHub(rows, hub);
    if (!pair.latest) return [];
    return [{
      key: hub.key,
      label: hub.label,
      price: pair.latest.price,
      date: pair.latest.date,
      deltaPct: calcAtunaDeltaPct(pair),
    }];
  }).sort((a, b) => a.price - b.price);

  const bkk = points.find((point) => point.key === SKJ_ATUNA_HUBS[0].key) ?? null;
  const baseDate = bkk?.date ?? points.map((point) => point.date).sort().pop() ?? null;

  if (points.length === 0) {
    return (
      <div className="dsc-card" style={{ padding: '20px 22px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>SKJ 허브 가격 스프레드 ($/MT)</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)', marginTop: 8 }}>
          관측 없음 — 기준일 —
        </div>
      </div>
    );
  }

  const lo = points[0];
  const hi = points[points.length - 1];
  const range = hi.price - lo.price;
  const spreadPct = lo.price !== 0 ? (range / lo.price) * 100 : null;
  // 전 허브 동가(range 0) 또는 단일 허브면 가운데 한 점으로 모은다
  const posPct = (price: number) => (range === 0 ? 50 : ((price - lo.price) / range) * 100);

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>방콕 SKJ 현물가</span>
        <span
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--text-main)',
          }}
        >
          {bkk ? usd(bkk.price) : '—'}
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>($/MT)</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: deltaColor(bkk ? bkk.deltaPct : null) }}>
          {deltaText(bkk ? bkk.deltaPct : null)}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
          기준일 {baseDate ? baseDate.replace(/-/g, '.') : '—'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>SKJ 허브 가격대</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
          관측 {points.length}개 허브 · 점 색은 직전 고시 대비 등락
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>
          격차 {usd(range)}
          <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 5 }}>
            {spreadPct === null ? '' : `(${spreadPct.toFixed(1)}%)`}
          </span>
        </span>
      </div>

      <div style={{ position: 'relative', height: 10, borderRadius: 999, background: 'var(--card-border, #e2e4e9)', margin: '12px 9px 0' }}>
        {points.map((point) => (
          <div
            key={point.key}
            title={`${point.label} ${usd(point.price)} · ${deltaText(point.deltaPct)}`}
            style={{
              position: 'absolute',
              left: `${posPct(point.price)}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: deltaColor(point.deltaPct),
              boxShadow: '0 0 0 2px var(--card-border, #e2e4e9)',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 10 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>최저 {lo.label}</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>{usd(lo.price)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>최고 {hi.label}</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-main)' }}>{usd(hi.price)}</div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid var(--card-border, #e2e4e9)',
          fontSize: '0.74rem',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {points.map((point) => (
          <span key={point.key} style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{point.label}</span> {usd(point.price)}{' '}
            <span style={{ fontWeight: 700, color: deltaColor(point.deltaPct) }}>{deltaText(point.deltaPct)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
