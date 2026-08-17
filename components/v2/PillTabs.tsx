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
  /**
   * @deprecated 실제로는 쓰이지 않는다. 활성 필 배경은 전역 `--accent-primary` 로 고정돼 있고
   * `__tests__/v2-components-render.test.ts` 가 그 고정을 강제한다 — 품목 시그니처 색을 여기
   * 넣으면 흰 글자 대비가 4.5:1 아래로 떨어지는 조합이 생긴다(teal-600 등). 시그니처 색(D-04)은
   * 히어로 KPI 와 차트가 낸다. 호출부 호환을 위해 남겨 둔다.
   */
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
  /**
   * 탭이 넘치면 가로 스크롤 대신 다음 줄로 내린다.
   *
   * 탭이 10개쯤 되면 가로 스크롤은 잘 안 굴러간다 — 스크롤바가 숨는 macOS 에서는
   * 더 있다는 사실조차 안 보이고, 활성 탭이 화면 밖에 있으면 지금 어디인지도 모른다.
   * 단계 내비처럼 «전체를 한눈에 보는 것»이 목적인 곳에서는 줄을 늘리는 편이 낫다.
   */
  wrap?: boolean;
}

export default function PillTabs({
  tabs,
  activeKey,
  onChange,

  className,
  id,
  ariaLabel = '필 탭',
  tabIdPrefix,
  panelIdPrefix,
  wrap = false,
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
        // 줄바꿈을 켜면 스크롤 컨테이너를 만들지 않는다. 둘을 같이 두면 넘칠 때
        // 스크롤도 되고 줄도 바뀌어 어느 쪽으로 움직일지 예측이 안 된다.
        flexWrap: wrap ? 'wrap' : 'nowrap',
        overflowX: wrap ? 'visible' : 'auto',
        rowGap: wrap ? 6 : undefined,
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
              color: active ? '#ffffff' : 'var(--dsc-ink-muted)',
              fontSize: '0.85rem',
              fontWeight: active ? 700 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s ease',
            }}
          >
            {active && (
              <motion.span
                /* layoutId 는 인스턴스마다 달라야 한다. 패널을 살려 두는 셸에서는
                   여러 PillTabs 가 동시에 마운트돼 있어, 같은 id 를 쓰면
                   활성 알약이 패널을 건너뛰어 날아간다. */
                layoutId={`dsc-pill-active-${tabIdPrefix ?? id ?? ariaLabel}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 8,
                  /* 활성 필은 전역 강조색 단색 + 흰 글자로 고정한다.
                     품목 시그니처 색을 여기 넣으면 흰 글자 대비가 4.5:1 아래로 떨어지는
                     조합이 생긴다(예: teal-600). 시그니처 색은 히어로와 차트가 낸다. */
                  background: 'var(--accent-primary)',
                  border: '1px solid var(--accent-primary)',
                  boxShadow: '0 2px 8px rgba(16, 24, 40, 0.18)',
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
