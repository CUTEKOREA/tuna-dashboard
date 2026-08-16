'use client';

import React from 'react';
import { NowCard } from './NowCard';
import styles from './HeroNowStrip.module.css';

export type HeroNowItem = {
  now?: boolean;
  eyebrow: string;
  title: string;
  body: string;
};

/** 히어로 하단 흰 카드 한 줄. 지금 카드는 한 장만. */
export function HeroNowStrip({ items }: { items: HeroNowItem[] }) {
  return (
    <div className={styles.row} data-hero-now-strip="true">
      {items.map((item) => (
        <NowCard key={`${item.eyebrow}-${item.title}`} now={item.now} eyebrow={item.eyebrow} title={item.title}>
          {item.body}
        </NowCard>
      ))}
    </div>
  );
}
