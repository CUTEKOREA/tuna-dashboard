'use client';

import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  type?: 'card' | 'chart' | 'table' | 'text';
  count?: number;
}

export default function SkeletonLoader({ type = 'card', count = 4 }: SkeletonLoaderProps) {
  if (type === 'chart') {
    return (
      <div className={styles.chartSkeleton}>
        <div className={styles.shimmer} style={{ width: '40%', height: 16, borderRadius: 8 }} />
        <div className={styles.chartBars}>
          {Array.from({ length: 12 }).map((_: any, i: number) => (
            <div 
              key={i} 
              className={`${styles.bar} ${styles.shimmer}`}
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={styles.tableSkeleton}>
        {Array.from({ length: count }).map((_: any, i: number) => (
          <div key={i} className={styles.tableRow}>
            <div className={`${styles.shimmer}`} style={{ width: '25%', height: 14 }} />
            <div className={`${styles.shimmer}`} style={{ width: '35%', height: 14 }} />
            <div className={`${styles.shimmer}`} style={{ width: '20%', height: 14 }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={styles.textSkeleton}>
        <div className={styles.shimmer} style={{ width: '60%', height: 18, marginBottom: 12 }} />
        <div className={styles.shimmer} style={{ width: '100%', height: 12, marginBottom: 8 }} />
        <div className={styles.shimmer} style={{ width: '90%', height: 12, marginBottom: 8 }} />
        <div className={styles.shimmer} style={{ width: '75%', height: 12 }} />
      </div>
    );
  }

  return (
    <div className={styles.cardGrid}>
      {Array.from({ length: count }).map((_: any, i: number) => (
        <div key={i} className={styles.cardSkeleton}>
          <div className={styles.shimmer} style={{ width: '50%', height: 14 }} />
          <div className={styles.shimmer} style={{ width: '40%', height: 32, marginTop: 12 }} />
          <div className={styles.shimmer} style={{ width: '60%', height: 12, marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}
