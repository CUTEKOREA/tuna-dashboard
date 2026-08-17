/**
 * FilterSegment — 디자인 랩 5라운드 필터 시안 «세그먼트형».
 * 옵션마다 보더를 두르는 대신 연회색 트랙 하나 안에서 흰 배경 썸이 좌우로 미끄러진다.
 * «지금 어디에 있는가»를 색 대비가 아니라 위치와 움직임으로 알린다.
 * 상태는 자체 useState 더미 — 어떤 차트에도 연결되지 않는다.
 */
'use client';

import React, { useState } from 'react';
import { CalendarRange, Clock3 } from 'lucide-react';
import {
  ATUNA_GRAIN_LABELS,
  ATUNA_PERIOD_LABELS,
  type AtunaGrainKey,
  type AtunaPeriodKey,
} from '../../../lib/data/atuna-price-summary';

const PERIOD_KEYS: AtunaPeriodKey[] = ['3m', '6m', '1y', 'all'];
const GRAIN_KEYS: AtunaGrainKey[] = ['week', 'month'];

/** 시안 작성 기준일 — 데이터 기준일이 아니다 (더미 상태 시안) */
const SPEC_DATE = '2026-08-17';

const BORDER = 'var(--card-border, #e2e4e9)';
/** 트랙 안쪽 여백 — 썸 크기 계산이 이 값에 묶여 있다 */
const PAD = 3;

function SegmentedGroup<K extends string>({
  icon,
  label,
  options,
  active,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  options: { key: K; label: string }[];
  active: K;
  onChange: (key: K) => void;
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.key === active),
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 52,
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
        }}
      >
        {icon}
        {label}
      </span>

      <div
        role="group"
        aria-label={label}
        style={{
          position: 'relative',
          display: 'inline-grid',
          // minmax(0,1fr) 로 칸 폭을 균등 고정 — 썸의 translateX(100%) 계산 전제
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
          padding: PAD,
          borderRadius: 10,
          border: `1px solid ${BORDER}`,
          background: 'var(--dsc-bg-deep, #f1f2f4)',
        }}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: PAD,
            bottom: PAD,
            left: PAD,
            width: `calc((100% - ${PAD * 2}px) / ${options.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
            borderRadius: 7,
            background: 'var(--dsc-surface, #ffffff)',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.18)',
            transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {options.map((option) => {
          const on = option.key === active;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(option.key)}
              style={{
                position: 'relative',
                zIndex: 1,
                appearance: 'none',
                background: 'none',
                border: 'none',
                padding: '7px 16px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.9rem',
                fontWeight: on ? 700 : 400,
                letterSpacing: '-0.01em',
                color: on ? 'var(--text-main)' : 'var(--text-muted)',
                transition: 'color 180ms ease',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterSegment() {
  const [period, setPeriod] = useState<AtunaPeriodKey>('6m');
  const [grain, setGrain] = useState<AtunaGrainKey>('week');
  const [lifted, setLifted] = useState(false);

  return (
    <div
      className="dsc-card"
      onMouseEnter={() => setLifted(true)}
      onMouseLeave={() => setLifted(false)}
      style={{
        padding: '18px 22px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transform: lifted ? 'translateY(-2px)' : 'none',
        transition: 'transform 180ms ease',
      }}
    >
      <SegmentedGroup
        icon={<CalendarRange size={14} aria-hidden />}
        label="기간"
        options={PERIOD_KEYS.map((key) => ({ key, label: ATUNA_PERIOD_LABELS[key] }))}
        active={period}
        onChange={setPeriod}
      />
      <SegmentedGroup
        icon={<Clock3 size={14} aria-hidden />}
        label="입도"
        options={GRAIN_KEYS.map((key) => ({ key, label: ATUNA_GRAIN_LABELS[key] }))}
        active={grain}
        onChange={setGrain}
      />

      <p
        style={{
          margin: 0,
          paddingTop: 12,
          borderTop: `1px solid ${BORDER}`,
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontWeight: 400,
        }}
      >
        선택 상태{' '}
        <strong style={{ fontWeight: 700, color: 'var(--text-main)' }}>
          {ATUNA_PERIOD_LABELS[period]} · {ATUNA_GRAIN_LABELS[grain]}
        </strong>
        {' — '}시안 미리보기 — 더미 상태 (어떤 차트에도 연결되지 않음 · 시안 기준일 {SPEC_DATE})
      </p>
    </div>
  );
}
