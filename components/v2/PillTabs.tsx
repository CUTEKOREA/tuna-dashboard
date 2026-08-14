/**
 * PillTabs — Deep Sea Command V2 필 탭 내비 (Vexto·Raktor 상단 탭 문법)
 *
 * 5-Pillar 계층화의 표준 진입점. 활성 탭은 commodity 단일 액센트,
 * 비활성은 저대비 무채색 표면. framer-motion layoutId로 활성 배경이 미끄러진다.
 *
 * 사용 예:
 * ```tsx
 * <PillTabs
 *   tabs={[{ key: 's1', label: '원료 수급' }, { key: 's2', label: '가공·생산' }]}
 *   activeKey={active}
 *   onChange={setActive}
 * />
 * ```
 */
'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface PillTab {
  key: string;
  label: string;          // L-01: 한글
  icon?: React.ReactNode; // Lucide 아이콘 (선택)
  badge?: string | number;
}

export interface PillTabsProps {
  tabs: PillTab[];
  activeKey: string;
  onChange: (key: string) => void;
  /** 활성 탭 단일 액센트 — commodity 시그니처 대표색 (D-04). */
  accentFrom?: string;
  /** @deprecated V2.5는 한 화면 1액센트만 사용한다. 호출부 호환을 위해 유지. */
  accentTo?: string;
  className?: string;
  /** tablist의 선택적 식별자 */
  id?: string;
  /** tablist의 접근성 이름 */
  ariaLabel?: string;
  /** 각 탭 id의 접두사. panelIdPrefix와 함께 tab/panel 관계를 만든다. */
  tabIdPrefix?: string;
  /** 각 탭 패널 id의 접두사. tabIdPrefix와 함께 tab/panel 관계를 만든다. */
  panelIdPrefix?: string;
}

export default function PillTabs({
  tabs,
  activeKey,
  onChange,
  accentFrom = '#22d3ee',
  className,
  id,
  ariaLabel = '필 탭',
  tabIdPrefix,
  panelIdPrefix,
}: PillTabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const reduce = useReducedMotion();

  const selectAndFocus = (key: string) => {
    tabRefs.current[key]?.focus();
    onChange(key);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    selectAndFocus(tabs[nextIndex].key);
  };

  return (
    <nav
      id={id}
      className={className}
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        gap: 6,
        padding: 5,
        borderRadius: 12,
        background: 'var(--dsc-surface)',
        border: '1px solid var(--dsc-surface-border)',
        backdropFilter: 'var(--dsc-surface-blur)',
        WebkitBackdropFilter: 'var(--dsc-surface-blur)',
        width: 'fit-content',
        maxWidth: '100%',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab, index) => {
        const active = tab.key === activeKey;
        const tabId = tabIdPrefix ? `${tabIdPrefix}-${tab.key}` : undefined;
        const panelId = panelIdPrefix ? `${panelIdPrefix}-${tab.key}` : undefined;
        return (
          <button
            key={tab.key}
            id={tabId}
            ref={(node) => { tabRefs.current[tab.key] = node; }}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onClick={() => onChange(tab.key)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              color: active ? 'var(--dsc-ink)' : 'var(--dsc-ink-muted)',
              fontSize: '0.85rem',
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s ease',
            }}
          >
            {active && (
              <motion.span
                layoutId="dsc-pill-active"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 8,
                  background: `${accentFrom}22`,
                  border: `1px solid ${accentFrom}4d`,
                  boxShadow: `0 0 10px ${accentFrom}1f`,
                }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '1px 7px',
                    borderRadius: 999,
                    background: 'rgba(244, 63, 94, 0.2)',
                    color: '#fda4af',
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
