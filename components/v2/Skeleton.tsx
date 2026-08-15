import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  label: string;
  count?: number;
  variant?: 'block' | 'card-row';
  className?: string;
}

export default function Skeleton({
  label,
  count = 1,
  variant = 'block',
  className,
}: SkeletonProps) {
  const itemCount = Math.max(1, Math.floor(count));
  const variantClass = variant === 'card-row' ? styles.cardRow : styles.block;

  return (
    <div
      className={[styles.root, variantClass, className].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className={styles.label}>{label}</span>
      <div className={styles.items} aria-hidden="true">
        {Array.from({ length: itemCount }, (_, index) => (
          <span key={index} className={styles.item} data-skeleton-item="true" />
        ))}
      </div>
    </div>
  );
}
