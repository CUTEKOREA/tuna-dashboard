'use client';

import React from 'react';
import type { ActiveMenu } from '@/lib/dashboard-registry';
import styles from './OperationPills.module.css';

export const OPERATION_PILLS: { key: ActiveMenu; label: string }[] = [
  { key: 'market', label: '시장 동향' },
  { key: 'fleet', label: '선단 운영' },
  { key: 'unloading', label: '하역 현황' },
  { key: 'logistics', label: '물류·가공' },
];

export default function OperationPills({
  activeKey,
  onSelect,
}: {
  activeKey: ActiveMenu;
  onSelect: (key: ActiveMenu) => void;
}) {
  return (
    <nav className={styles.row} aria-label="실시간 운영">
      {OPERATION_PILLS.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            className={`${styles.pill} ${active ? styles.active : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
