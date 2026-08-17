/**
 * FilterUnderline — 디자인 랩 5라운드 필터 시안 «언더라인 탭형».
 * pill을 걷어내고 활성 탭을 액센트 굵은 언더라인 + 900 웨이트로만 표시한다
 * (V3 스펙 PillTabs의 언더라인 변형 실물). 대비를 테두리가 아니라 밑줄과 웨이트로 만든다.
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

function UnderlineTabs<K extends string>({
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
  const [hoverKey, setHoverKey] = useState<K | null>(null);

  return (
    <div
      role="group"
      aria-label={label}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 52,
          paddingBottom: 10,
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
        }}
      >
        {icon}
        {label}
      </span>

      <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${BORDER}` }}>
        {options.map((option) => {
          const on = option.key === active;
          const hovered = hoverKey === option.key;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(option.key)}
              onMouseEnter={() => setHoverKey(option.key)}
              onMouseLeave={() => setHoverKey(null)}
              style={{
                appearance: 'none',
                background: 'none',
                border: 'none',
                // 컨테이너 1px 보더 위에 3px 언더라인을 겹쳐 얹는다
                borderBottom: `3px solid ${
                  on ? 'var(--accent-primary)' : hovered ? BORDER : 'transparent'
                }`,
                marginBottom: -1,
                padding: '8px 15px 9px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: on ? 900 : 400,
                letterSpacing: '-0.01em',
                color: on
                  ? 'var(--accent-primary)'
                  : hovered
                    ? 'var(--text-main)'
                    : 'var(--text-muted)',
                transition: 'color 140ms ease, border-color 140ms ease',
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

export default function FilterUnderline() {
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
        gap: 14,
        transform: lifted ? 'translateY(-2px)' : 'none',
        transition: 'transform 180ms ease',
      }}
    >
      <UnderlineTabs
        icon={<CalendarRange size={14} aria-hidden />}
        label="기간"
        options={PERIOD_KEYS.map((key) => ({ key, label: ATUNA_PERIOD_LABELS[key] }))}
        active={period}
        onChange={setPeriod}
      />
      <UnderlineTabs
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
