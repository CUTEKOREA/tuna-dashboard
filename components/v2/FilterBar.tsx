/**
 * FilterBar — V3 페이지 레벨 필터 바 (Metabase 필터 pill + Time grouping 번안, 스펙 §4-1)
 *
 * 흰 pill(1px 보더, radius 8) 그룹 두 개: 기간 프리셋 + 시간 입도.
 * 상태는 호출부가 쥔다(제어 컴포넌트). URL 동기화도 호출부 책임.
 * scope 캡션으로 «무엇에 적용되는가»를 정직하게 명시한다 — 전 위젯 적용처럼 보이면 안 된다.
 */
'use client';

import React from 'react';
import { CalendarRange, Clock3 } from 'lucide-react';
import styles from './FilterBar.module.css';

export interface FilterPill<K extends string> {
  key: K;
  label: string;
}

function PillGroup<K extends string>({
  icon,
  label,
  options,
  active,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  options: FilterPill<K>[];
  active: K;
  onChange: (key: K) => void;
}) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.groupLabel}>
        {icon}
        {label}
      </span>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={`${styles.pill} ${option.key === active ? styles.pillActive : ''}`}
          aria-pressed={option.key === active}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function FilterBar<P extends string, G extends string>({
  periodOptions,
  period,
  onPeriodChange,
  grainOptions,
  grain,
  onGrainChange,
  scopeNote,
}: {
  periodOptions: FilterPill<P>[];
  period: P;
  onPeriodChange: (key: P) => void;
  grainOptions: FilterPill<G>[];
  grain: G;
  onGrainChange: (key: G) => void;
  /** 이 필터가 실제로 적용되는 범위 — 정직 표기 의무 */
  scopeNote: string;
}) {
  return (
    <div className={styles.bar}>
      <PillGroup
        icon={<CalendarRange size={14} aria-hidden />}
        label="기간"
        options={periodOptions}
        active={period}
        onChange={onPeriodChange}
      />
      <PillGroup
        icon={<Clock3 size={14} aria-hidden />}
        label="입도"
        options={grainOptions}
        active={grain}
        onChange={onGrainChange}
      />
      <span className={styles.scopeNote}>{scopeNote}</span>
    </div>
  );
}
