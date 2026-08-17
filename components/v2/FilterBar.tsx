/**
 * FilterBar — V3 페이지 레벨 필터 바 (Metabase 필터 + Time grouping 번안, 스펙 §4-1)
 *
 * 디자인 랩 5라운드 채택(r5-B ★4, 2026-08-17): pill 나열 → 세그먼트 컨트롤.
 * 연회색 트랙 안에서 흰 썸이 활성 위치로 미끄러진다 — 위치·움직임으로 상태를 알린다.
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

function SegmentGroup<K extends string>({
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
  const activeIndex = Math.max(0, options.findIndex((option) => option.key === active));

  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.groupLabel}>
        {icon}
        {label}
      </span>
      <div
        className={styles.track}
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        <span
          aria-hidden
          className={styles.thumb}
          style={{
            width: `calc((100% - 6px) / ${options.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`${styles.segment} ${option.key === active ? styles.segmentActive : ''}`}
            aria-pressed={option.key === active}
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
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
      <SegmentGroup
        icon={<CalendarRange size={14} aria-hidden />}
        label="기간"
        options={periodOptions}
        active={period}
        onChange={onPeriodChange}
      />
      <SegmentGroup
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
