'use client';

import React, { useState, useEffect } from 'react';
import styles from './LiveTicker.module.css';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function LiveTicker() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLiveMarketData() {
      try {
        // 1. FX rates as of 2026.04.27
        const usdkrw = 1476.42; 
        const jpykrw = 948.50;
        
        // 2. Fetch live MGO Rates (Scraped real-time from Ship&Bunker)
        const mgoRes = await fetch('/api/mgo', { cache: 'no-store' });
        let mgoPrice = 1870.00; let mgoChange = 1170.00;
        if (mgoRes.ok) {
           const mgoData = await mgoRes.json();
           mgoPrice = mgoData.price;
           mgoChange = mgoData.change;
        }

        const mgoTrend = mgoChange > 0 ? 'up' : mgoChange < 0 ? 'down' : 'neutral';
        const mgoDiff = mgoChange > 0 ? `+${mgoChange.toFixed(2)}` : `${mgoChange.toFixed(2)}`;

        const LIVE_DATA = [
          { label: '🔴 BREAKING', value: '미-이란 평화협상 교착 — 호르무즈 해협 봉쇄 지속, Brent $105+/bbl... 선단 운영비 상승 압박', diff: 'CRISIS', trend: 'down' },
          { label: '🔴 BREAKING', value: 'IATTC 가다랑어(SKJ) 어획량 전년 대비 -26% 급감 (1~3월)... 공급 수축 → 가격 강세 지속', diff: 'ALERT', trend: 'up' },
          { label: '🟢 CEPA', value: '한-UAE CEPA D-4 — 5.1 발효 시 수산물 관세 5%→0% 전환, 일본 대비 관세 우위 선점', diff: 'D-4', trend: 'up' },
          { label: '🌐 EXPO', value: 'Seafood Expo Global 바르셀로나 폐막 — 35,500명 참가, 2,290개사 85개국 역대 최고', diff: 'RECORD', trend: 'up' },
          { label: '⛽ FUEL', value: 'MGO 위기 — 연료비 선단 운영비 30~50% 차지, 다수 어선 조업 중단·귀항', diff: 'CRISIS', trend: 'down' },
          { label: '📊 SUPPLY', value: '글로벌 참치 총 어획량 전년 대비 -7% 감소 (3월 누적)... 원어가 상승 압력', diff: '-7%', trend: 'down' },
          { label: 'SKJ (BKK)', value: '$2,050', diff: '0.0%', trend: 'neutral' }, 
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
        <div className={styles.tickerPrefix}>LIVE UPDATE</div>
        <div className={styles.tickerInner} style={{ animation: 'none', paddingLeft: 160, fontSize: 13, color: 'var(--text-muted)' }}>
          📡 Connecting to Global Markets...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tickerWrap}>
      <div className={styles.tickerPrefix}>
        LIVE UPDATE
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
