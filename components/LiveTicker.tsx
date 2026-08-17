'use client';

import React, { useState, useEffect } from 'react';
import styles from './LiveTicker.module.css';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { pctChange } from '../lib/metrics';

type Trend = 'up' | 'down' | 'neutral';

export interface TickerItem {
  label: string;
  value: string;
  diff?: string;
  trend?: Trend;
}

export function TickerQuote({ item }: { item: TickerItem }) {
  return (
    <div className={styles.tickerItem}>
      <span className={styles.label}>{item.label}</span>
      <span data-ticker-value="true" className={styles.value} style={{ fontFamily: 'var(--dsc-font-mono)' }}>
        {item.value}
      </span>
      {item.diff && (
        <span
          data-ticker-diff="true"
          className={styles[item.trend || 'neutral'] || styles.neutral}
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {item.trend === 'up' && <TrendingUp size={12} style={{ marginRight: '2px' }} />}
          {item.trend === 'down' && <TrendingDown size={12} style={{ marginRight: '2px' }} />}
          {item.trend === 'neutral' && <Minus size={12} style={{ marginRight: '2px' }} />}
          {item.diff}
        </span>
      )}
    </div>
  );
}

// 'YYYY-MM-DD' | 'YYYY.MM.DD' -> 'MM.DD' (else null — 미상 포맷은 표기 생략)
function toMonthDay(dateStr: string): string | null {
  const m = dateStr.match(/^\d{4}[-.](\d{2})[-.](\d{2})/);
  return m ? `${m[1]}.${m[2]}` : null;
}

// /api/atuna-prices history에서 해당 허브의 최신 비결측 행 + 직전 비결측 행 대비 Δ% 계산
// (페이월 데이터 보호: 정적 import 금지 — 번들 노출 차단, 인증된 API 경유만)
function buildAtunaItem(
  history: Array<Record<string, unknown>>,
  key: 'skj_bkk' | 'yf_sey',
  name: string
): TickerItem | null {
  const rows = history
    .filter((r) => typeof r[key] === 'number' && (r[key] as number) > 0 && typeof r.date === 'string')
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (rows.length === 0) return null;

  const latest = rows[rows.length - 1];
  const price = latest[key] as number;
  const date = latest.date as string;

  let diff: string | undefined;
  let trend: Trend | undefined;
  if (rows.length > 1) {
    const prevPrice = rows[rows.length - 2][key] as number;
    const pct = pctChange(price, prevPrice) ?? 0;
    diff = `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
    trend = pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral';
  }

  const asOf = toMonthDay(date);
  return {
    label: asOf ? `${name} · ${asOf}` : name,
    value: `$${price.toLocaleString()}`,
    diff,
    trend,
  };
}

// /api/mgo — isLive·dataAsOf 필드가 있으면 사용, 없으면 기존 방식(응답 OK 시 표시) 유지
async function fetchMgoItem(): Promise<TickerItem | null> {
  try {
    const res = await fetch('/api/mgo', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();

    const price = typeof data?.price === 'number' && data.price > 0 ? data.price : null;
    if (price === null) return null;

    // 방어적 분기: isLive가 boolean으로 오면 신뢰 (false = 라우트 fallback → 미표시)
    if (typeof data?.isLive === 'boolean' && !data.isLive) return null;

    const change = typeof data?.change === 'number' ? data.change : 0;
    const asOfRaw =
      typeof data?.dataAsOf === 'string' ? data.dataAsOf : typeof data?.date === 'string' ? data.date : null;
    const asOf = asOfRaw ? toMonthDay(asOfRaw) : null;

    // A-4: 라우트가 고백한 추정치 성격(isEstimate)을 화면 라벨까지 전달
    const baseName = data?.isEstimate === true ? 'MGO 싱가포르(환산추정)' : 'MGO 싱가포르';
    return {
      label: asOf ? `${baseName} · ${asOf}` : baseName,
      value: `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      diff: change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  } catch {
    return null; // fetch 실패 시 미표시 (가짜값 금지)
  }
}

// /api/exchange — 실패·fallback 응답이면 미표시 (가짜값 금지)
async function fetchFxItems(): Promise<TickerItem[]> {
  try {
    const res = await fetch('/api/exchange', { cache: 'no-store' });
    if (!res.ok) return [];
    const fx = await res.json();
    if (fx?.source === 'fallback') return [];

    const items: TickerItem[] = [];
    const usdKrw = typeof fx?.usd_krw === 'number' && fx.usd_krw > 0 ? fx.usd_krw : null;
    if (usdKrw === null) return [];

    items.push({
      label: 'USD/KRW',
      value: usdKrw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    });

    const usdJpy = typeof fx?.usd_jpy === 'number' && fx.usd_jpy > 0 ? fx.usd_jpy : null;
    if (usdJpy !== null) {
      const jpy100Krw = (usdKrw / usdJpy) * 100; // 100엔당 원화 환산 (크로스레이트)
      items.push({
        label: 'JPY/KRW (100엔)',
        value: jpy100Krw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      });
    }
    return items;
  } catch {
    return []; // fetch 실패 시 미표시 (가짜값 금지)
  }
}

export default function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    async function fetchAtunaHistory(): Promise<Array<Record<string, unknown>>> {
      try {
        const res = await fetch('/api/atuna-prices', { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.history) ? data.history : [];
      } catch {
        return []; // fetch 실패 시 SKJ/YF 미표시 (가짜값 금지)
      }
    }

    async function fetchLiveMarketData() {
      try {
        const [mgoItem, fxItems, atunaHistory] = await Promise.all([
          fetchMgoItem(),
          fetchFxItems(),
          fetchAtunaHistory(),
        ]);

        const next: TickerItem[] = [];
        const skj = buildAtunaItem(atunaHistory, 'skj_bkk', 'SKJ 방콕');
        if (skj) next.push(skj);
        const yf = buildAtunaItem(atunaHistory, 'yf_sey', 'YF 세이셸');
        if (yf) next.push(yf);
        if (mgoItem) next.push(mgoItem);
        next.push(...fxItems);

        // 항목 수 감소 보정: 4배 복제 (translateX(-50%) 루프 → 짝수 배 유지로 무한 스크롤 보존)
        setItems(next.length > 0 ? [...next, ...next, ...next, ...next] : []);
      } catch (err) {
        console.error('Ticker fetch error', err);
      }
    }

    fetchLiveMarketData();
    const interval = setInterval(fetchLiveMarketData, 300000); // refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) {
    return (
      <div className={styles.tickerWrap}>
        <div className={styles.tickerPrefix} data-ticker-tone="neutral">연결 중</div>
        <div className={styles.tickerInner} style={{ animation: 'none', paddingLeft: 160, fontSize: 13, color: 'var(--text-muted)' }}>
          📡 글로벌 시장 데이터 연결 중...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tickerWrap}>
      <div className={styles.tickerPrefix} data-ticker-tone="neutral">시장 시세</div>
      <div className={styles.tickerInner}>
        {items.map((item, idx) => (
          <TickerQuote key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}
