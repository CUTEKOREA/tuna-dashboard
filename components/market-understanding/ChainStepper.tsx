/**
 * 밸류체인 단계 내비 — 필 탭 대신 사슬 + 횡단 축.
 *
 * 탭은 서로 대체 가능한 보기용이다. 이 페이지의 단계는 앞에서 뒤로 물건을 넘긴다.
 * 사슬은 숫자와 연결선, 횡단 축은 점선 칩으로 순서가 아님을 표시한다.
 */
'use client';

import React, { useRef } from 'react';

import styles from './TunaIndustryDashboard.module.css';

export interface ChainStep {
  key: string;
  numeral: string;
  label: string;
}

export function isChainKey(key: string, numeral: string): boolean {
  return /^s\d+/i.test(key) || /^\d+$/.test(numeral);
}

export function shortStepLabel(title: string, max = 7): string {
  const head = title.split(/\s*[—–-]\s*/)[0]?.trim() || title;
  return head.length > max ? head.slice(0, max) : head;
}

export interface ChainStepperProps {
  chain: ChainStep[];
  cross: ChainStep[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function ChainStepper({
  chain,
  cross,
  activeKey,
  onSelect,
}: ChainStepperProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const chainIndex = chain.findIndex((step) => step.key === activeKey);
  const progress = chain.length <= 1 || chainIndex < 0 ? 0 : chainIndex / (chain.length - 1);

  const focusAndSelect = (key: string) => {
    refs.current[key]?.focus();
    onSelect(key);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    list: ChainStep[],
    index: number,
  ) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % list.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + list.length) % list.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = list.length - 1;
    else return;
    event.preventDefault();
    focusAndSelect(list[next].key);
  };

  return (
    <nav className={styles.stageNav} aria-label="밸류체인 단계 이동">
      {chain.length > 0 && (
        <div
          className={styles.chainTrackWrap}
          style={{
            ['--progress' as string]: String(progress),
            ['--chain-count' as string]: String(chain.length),
          }}
        >
          <span className={styles.chainFill} aria-hidden="true" />
          <ol
            className={styles.chainTrack}
            style={{
              gridTemplateColumns: `repeat(${chain.length}, minmax(2.75rem, 1fr))`,
            }}
          >
          {chain.map((step, index) => {
            const current = step.key === activeKey;
            return (
              <li key={step.key} className={styles.chainItem}>
                <button
                  type="button"
                  ref={(node) => {
                    refs.current[step.key] = node;
                  }}
                  className={styles.chainStep}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`${step.numeral} ${step.label}`}
                  data-done={chainIndex > index ? 'true' : undefined}
                  tabIndex={current || (chainIndex < 0 && index === 0) ? 0 : -1}
                  onClick={() => onSelect(step.key)}
                  onKeyDown={(event) => handleKeyDown(event, chain, index)}
                >
                  <span className={styles.chainDot}>{step.numeral}</span>
                  <span className={styles.chainLabel}>{shortStepLabel(step.label)}</span>
                </button>
              </li>
            );
          })}
          </ol>
        </div>
      )}

      {cross.length > 0 && (
        <div className={styles.crossRow}>
          <span className={styles.crossRowLabel}>횡단</span>
          {cross.map((step, index) => {
            const current = step.key === activeKey;
            return (
              <button
                key={step.key}
                type="button"
                ref={(node) => {
                  refs.current[step.key] = node;
                }}
                className={styles.crossChip}
                aria-current={current ? 'true' : undefined}
                aria-label={`${step.numeral} ${step.label}`}
                tabIndex={current ? 0 : -1}
                onClick={() => onSelect(step.key)}
                onKeyDown={(event) => handleKeyDown(event, cross, index)}
              >
                {step.numeral} {shortStepLabel(step.label, 8)}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
