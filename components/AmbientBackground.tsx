'use client';

import React from 'react';
import styles from './AmbientBackground.module.css';

export default function AmbientBackground({ 
  accent = 'cyan' 
}: { accent?: 'cyan' | 'emerald' | 'gold' | 'rose' }) {
  const colorMap = {
    cyan:    ['rgba(6, 182, 212, 0.07)',   'rgba(16, 185, 129, 0.05)',  'rgba(6, 182, 212, 0)',   'rgba(16, 185, 129, 0)'],
    emerald: ['rgba(16, 185, 129, 0.08)',  'rgba(52, 211, 153, 0.05)',  'rgba(16, 185, 129, 0)',  'rgba(52, 211, 153, 0)'],
    gold:    ['rgba(252, 211, 77, 0.06)',  'rgba(245, 158, 11, 0.04)',  'rgba(252, 211, 77, 0)',  'rgba(245, 158, 11, 0)'],
    rose:    ['rgba(244, 63, 94, 0.06)',   'rgba(251, 113, 133, 0.04)', 'rgba(244, 63, 94, 0)',   'rgba(251, 113, 133, 0)'],
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
