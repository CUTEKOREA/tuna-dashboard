'use client';

import React from 'react';
import styles from './AmbientBackground.module.css';

export default function AmbientBackground({ 
  accent = 'cyan' 
}: { accent?: 'cyan' | 'emerald' | 'gold' | 'rose' }) {
  // Deep Ocean Aurora — 비비드 오로라 밴드 (2026-06-28 [CC]). orb은 blur+screen 블렌드(.module.css).
  const colorMap = {
    cyan:    ['rgba(34, 211, 238, 0.30)',  'rgba(168, 85, 247, 0.26)',  'rgba(34, 211, 238, 0)',   'rgba(168, 85, 247, 0)'],
    emerald: ['rgba(45, 212, 191, 0.28)',  'rgba(99, 102, 241, 0.24)',  'rgba(45, 212, 191, 0)',   'rgba(99, 102, 241, 0)'],
    gold:    ['rgba(255, 190, 92, 0.24)',  'rgba(168, 85, 247, 0.22)',  'rgba(255, 190, 92, 0)',   'rgba(168, 85, 247, 0)'],
    rose:    ['rgba(244, 63, 94, 0.24)',   'rgba(168, 85, 247, 0.24)',  'rgba(244, 63, 94, 0)',    'rgba(168, 85, 247, 0)'],
  };

  const [c1, c2, c1_transparent, c2_transparent] = colorMap[accent];

  return (
    <div className={styles.ambientWrapper} aria-hidden="true">
      <div className={styles.orb1} style={{ background: `radial-gradient(circle, ${c1}, ${c1_transparent} 70%)` }} />
      <div className={styles.orb2} style={{ background: `radial-gradient(circle, ${c2}, ${c2_transparent} 70%)` }} />
      <div className={styles.orb3} style={{ background: `radial-gradient(circle, ${c1}, ${c1_transparent} 70%)` }} />
      <div className={styles.lightRays} />
    </div>
  );
}
