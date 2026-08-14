/**
 * PillTabs — Deep Sea Command V2 필 탭 내비 (Vexto·Raktor 상단 탭 문법)
 *
 * 5-Pillar 계층화의 표준 진입점. 활성 탭은 시그니처 그라디언트 발광,
 * 비활성은 글래스 표면. framer-motion layoutId로 활성 배경이 미끄러진다.
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

import React from 'react';
import { motion } from 'framer-motion';

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
  /** 활성 탭 발광 그라디언트 — commodity 시그니처 (D-04). 기본 참치 cyan→blue */
  accentFrom?: string;
  accentTo?: string;
  className?: string;
}

export default function PillTabs({
  tabs,
  activeKey,
  onChange,
  accentFrom = '#22d3ee',
  accentTo = '#3b82f6',
  className,
}: PillTabsProps) {
  return (
    <nav
      className={className}
      role="tablist"
      style={{
        display: 'flex',
        gap: 6,
        padding: 5,
        borderRadius: 999,
        background: 'var(--dsc-surface)',
        border: '1px solid var(--dsc-surface-border)',
        backdropFilter: 'var(--dsc-surface-blur)',
        WebkitBackdropFilter: 'var(--dsc-surface-blur)',
        width: 'fit-content',
        maxWidth: '100%',
        overflowX: 'auto',
      }}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: 'transparent',
              color: active ? '#f8fafc' : 'var(--text-muted)',
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
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${accentFrom}33, ${accentTo}33)`,
                  border: `1px solid ${accentFrom}55`,
                  boxShadow: `0 0 16px ${accentFrom}2e`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
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
