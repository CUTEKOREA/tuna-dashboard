'use client';

import React, { useMemo } from 'react';

import {
  marketRegimeCommon,
  marketRegimeFor,
  marketRegimeGeneratedAt,
  type MarketRegimeIndicator,
} from '@/lib/data/market-regime';

import styles from './MarketRegimeBand.module.css';

const MAX_OK_COMMODITY = 4;

function isOk(indicator: MarketRegimeIndicator): boolean {
  return indicator.status === 'ok';
}

/** 화면·테스트 공용 — status ok 지표 앞 4개(ENSO는 띠 컴포넌트가 별도 붙인다). */
export function selectMarketRegimeIndicators(
  _commodityKey: string,
  all: MarketRegimeIndicator[],
): MarketRegimeIndicator[] {
  if (all.length === 0) return [];
  return all.filter(isOk).slice(0, MAX_OK_COMMODITY);
}

/** 숫자·단위 표기(천 단위 쉼표, %는 소수 1자리). */
export function formatMarketRegimeValue(value: number | null, unit: string | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  if (unit === '%') {
    return `${value.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  }
  const n = Number.isInteger(value)
    ? value.toLocaleString('ko-KR')
    : value.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  if (!unit) return n;
  if (unit.startsWith('원') || unit.startsWith('°')) return `${n}${unit}`;
  return `${n} ${unit}`;
}

function formatGeneratedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAsof(asof: string): string {
  const [y, m, d] = asof.split('-');
  if (y && m && d) return `${y}.${m}.${d}`;
  return asof;
}

function baselineLine(indicator: MarketRegimeIndicator): string | null {
  if (!indicator.baseline || indicator.baseline.value == null) return null;
  const base = formatMarketRegimeValue(indicator.baseline.value, indicator.baseline.unit);
  // 기준 라벨은 데이터의 것을 그대로 쓴다 — 원문 「평년」을 「5년 평균」으로 바꿔 부르지 않는다.
  const label = (indicator.baseline.label ?? '비교 기준').replace(/^원문\s*/, '');
  const parts = [`${label} ${base}`];
  if (indicator.delta && indicator.delta.value != null) {
    const sign = indicator.delta.value > 0 ? '+' : '';
    const diff = formatMarketRegimeValue(indicator.delta.value, indicator.delta.unit);
    parts.push(`차이 ${sign}${diff}`);
  }
  return parts.join(' · ');
}

export interface MarketRegimeIndicatorCardProps {
  indicator: MarketRegimeIndicator;
  /** ENSO 카드는 스펙 표기로 라벨을 바꾼다. */
  enso?: boolean;
}

export function MarketRegimeIndicatorCard({ indicator, enso = false }: MarketRegimeIndicatorCardProps) {
  const pending = !isOk(indicator);
  const label = enso ? '엘니뇨 지수' : indicator.label;
  const baseline = baselineLine(indicator);

  return (
    <article
      className={`${styles.card} ${pending ? styles.cardPending : ''}`}
      data-regime-status={indicator.status}
    >
      <p className={styles.label}>{label}</p>
      <p className={`${styles.value} ${pending ? styles.valuePending : ''}`}>
        {pending ? '—' : formatMarketRegimeValue(indicator.value, indicator.unit)}
      </p>
      <p className={styles.asof}>
        {indicator.asof == null ? '기준일 없음' : `기준일 ${formatAsof(indicator.asof)}`}
      </p>
      {baseline && !pending && <p className={styles.baseline}>{baseline}</p>}
      {pending && <span className={styles.pendingTag}>갱신 대기</span>}
    </article>
  );
}

export interface MarketRegimeBandProps {
  commodityKey: string;
}

export default function MarketRegimeBand({ commodityKey }: MarketRegimeBandProps) {
  const commodityIndicators = marketRegimeFor(commodityKey);
  const selected = useMemo(
    () => selectMarketRegimeIndicators(commodityKey, commodityIndicators),
    [commodityKey, commodityIndicators],
  );

  if (selected.length === 0) return null;

  const enso = marketRegimeCommon().find((row) => row.id === 'enso_oni') ?? marketRegimeCommon()[0];
  const generatedAt = marketRegimeGeneratedAt();

  const sourceUrls = Array.from(
    new Set([...selected, ...(enso ? [enso] : [])].map((row) => row.source_url).filter(Boolean)),
  );

  return (
    <section className={styles.wrap} data-testid="market-regime-band" aria-label="시장 국면">
      <div className={styles.grid}>
        {selected.map((indicator) => (
          <MarketRegimeIndicatorCard key={indicator.id} indicator={indicator} />
        ))}
        {enso && <MarketRegimeIndicatorCard indicator={enso} enso />}
      </div>
      <p className={styles.meta}>
        2주마다 공개 통계로 갱신 · 갱신일 {formatGeneratedAt(generatedAt)}
        {sourceUrls.length > 0 && (
          <>
            {' · '}
            <span className={styles.sourceList}>
              {sourceUrls.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  출처
                </a>
              ))}
            </span>
          </>
        )}
      </p>
    </section>
  );
}
