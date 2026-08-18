/**
 * 포클랜드 08단계 — 선박·회사 차트가 같은 달을 본다.
 *
 * 원본에 선박마다 m12~m5 가 있다. 어기 전체가 기본이고, 달을 고르면 그 달 판수만 다시 세운다.
 * 월별 kg 는 없어서 환산하지 않는다.
 */
'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

import {
  SEASON_LABELS,
  SEASON_MONTHS,
  type FalklandMonth,
  labelForMonth,
} from '@/lib/data/falkland-squid-vessels';
import styles from './TunaIndustryDashboard.module.css';

const FalklandMonthContext = createContext<{
  month: FalklandMonth;
  setMonth: (month: FalklandMonth) => void;
} | null>(null);

export function FalklandMonthProvider({ children }: { children: React.ReactNode }) {
  const [month, setMonth] = useState<FalklandMonth>('all');
  const value = useMemo(() => ({ month, setMonth }), [month]);
  return <FalklandMonthContext.Provider value={value}>{children}</FalklandMonthContext.Provider>;
}

export function useFalklandMonth() {
  return useContext(FalklandMonthContext) ?? { month: 'all' as const, setMonth: () => undefined };
}

export function FalklandMonthChips() {
  const { month, setMonth } = useFalklandMonth();
  const options: FalklandMonth[] = ['all', ...SEASON_MONTHS];

  return (
    <div className={styles.monthChips} role="group" aria-label="어기 월 선택">
      {options.map((option) => {
        const selected = option === month;
        return (
          <button
            key={option}
            type="button"
            className={selected ? styles.monthChipActive : styles.monthChip}
            aria-pressed={selected}
            onClick={() => setMonth(option)}
          >
            {labelForMonth(option)}
          </button>
        );
      })}
    </div>
  );
}

export function monthBarName(month: FalklandMonth): string {
  return month === 'all' ? '누계 물량 (판)' : `${SEASON_LABELS[SEASON_MONTHS.indexOf(month)]} 물량 (판)`;
}
