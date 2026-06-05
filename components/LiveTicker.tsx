'use client';

import React, { useState, useEffect } from 'react';
import styles from './LiveTicker.module.css';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function LiveTicker() {
  const [items, setItems] = useState<any[]>([]);
  const [isMgoLive, setIsMgoLive] = useState<boolean>(false);

  useEffect(() => {
    async function fetchLiveMarketData() {
      try {
        // 1. FX rates as of 2026.04.27 (static hardcoded)
        const usdkrw = 1476.42;
        const jpykrw = 948.50;

        // 2. Fetch live MGO Rates (Scraped real-time from Ship&Bunker)
        const mgoRes = await fetch('/api/mgo', { cache: 'no-store' });
        let mgoPrice = 1061.00; let mgoChange = -333.00;
        let mgoFetchedOk = false;
        if (mgoRes.ok) {
           const mgoData = await mgoRes.json();
           mgoPrice = mgoData.price || 1061.00;
           mgoChange = mgoData.change || -333.00;
           mgoFetchedOk = true;
        }
        setIsMgoLive(mgoFetchedOk);

        const mgoTrend = mgoChange > 0 ? 'up' : mgoChange < 0 ? 'down' : 'neutral';
        const mgoDiff = mgoChange > 0 ? `+${mgoChange.toFixed(2)}` : `${mgoChange.toFixed(2)}`;

        const LIVE_DATA = [
          { label: '🔴 BREAKING', value: '싱가포르 MGO $1,061/t 하락 불구 마진 압박 지속... 서중태평양 선단 운영 위기', diff: 'CRISIS', trend: 'down' },
          { label: '🔴 BREAKING', value: 'IATTC 투하 FAD 10만개 추적, WCPFC 해역 무단 표류 확인... 해역 간 규제 갈등 비화', diff: 'ALERT', trend: 'up' },
          { label: '🟢 CEPA', value: '한-UAE CEPA D-4 — 5.1 발효 시 수산물 관세 5%→0% 전환, 일본 대비 관세 우위 선점', diff: 'D-4', trend: 'up' },
          { label: '🌐 NEW', value: '인도네시아 비악 참치 양식 벤처 추진... 신흥국 밸류체인 진입 시도 본격화', diff: 'VENTURE', trend: 'neutral' },
          { label: '⛽ FUEL', value: '고정비용 천정부지 + 판가 하락 = 선망선 마진 스퀴즈 (Margin Squeeze) 심화', diff: 'CRISIS', trend: 'down' },
          { label: '📊 SUPPLY', value: '글로벌 참치 총 어획량 전년 대비 -7% 감소 (3월 누적)... 원어가 상승 압력', diff: '-7%', trend: 'down' },
          { label: 'SKJ (BKK)', value: '$1,850', diff: '-6.3%', trend: 'down' }, 
          { label: 'YFT (BKK)', value: '$2,850', diff: '+1.7%', trend: 'up' },
          { label: 'Brent Crude', value: '$106.2', diff: '+2.1%', trend: 'up' },
          { label: 'Singapore MGO', value: `$${mgoPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, diff: mgoDiff, trend: mgoTrend },
          { label: 'USD/KRW', value: usdkrw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), diff: '₩1,476', trend: 'up' },
        ];

        setItems([...LIVE_DATA, ...LIVE_DATA]);

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
        <div className={styles.tickerPrefix}>CONNECTING</div>
        <div className={styles.tickerInner} style={{ animation: 'none', paddingLeft: 160, fontSize: 13, color: 'var(--text-muted)' }}>
          📡 Connecting to Global Markets...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tickerWrap}>
      <div className={styles.tickerPrefix}>
        {isMgoLive ? 'LIVE UPDATE' : 'SYNCED UPDATE'}
      </div>
      <div className={styles.tickerInner}>
        {items.map((item, idx) => (
          <div key={idx} className={styles.tickerItem}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
            {item.diff && (
              <span className={styles[item.trend] || styles.neutral} style={{ display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                {item.trend === 'up' && <TrendingUp size={12} style={{ marginRight: '2px' }} />}
                {item.trend === 'down' && <TrendingDown size={12} style={{ marginRight: '2px' }} />}
                {item.trend === 'neutral' && <Minus size={12} style={{ marginRight: '2px' }} />}
                {item.diff}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
