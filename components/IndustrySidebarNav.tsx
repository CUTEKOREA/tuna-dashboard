/**
 * 왼쪽 메뉴 「시장 이해」의 분류 접기 그룹과 「전체 품목(N)」.
 *
 * 주력 5개(★)는 app/page.tsx 가 섹션 제목 아래 칩으로 그리고, 이 컴포넌트는 그 아래만 맡는다.
 *  - 분류 8개를 접기 그룹으로 둔다. 기본은 접힘이고 지금 페이지가 속한 분류는 펼친다.
 *  - 펼침 상태는 localStorage 에 둔다(읽기·쓰기 실패는 무시 — 사생활 모드 등).
 *  - 접기 버튼은 네이티브 button 이라 키보드(Enter·Space)로 펼친다. aria-expanded·aria-controls 를 단다.
 *  - 분류마다 장식 색(배지·개수 알약·세로 선·활성 줄)과 lucide 아이콘을 둔다. 주력 품목은 목록에서 이름 앞에 ★.
 *  - 품목 줄 끝에 보고서 연월의 신선도 점. 오늘 날짜는 마운트 뒤에 읽는다(첫 렌더는 점 없음).
 */
'use client';

import React, { useEffect, useState } from 'react';
import { Apple, Beef, Carrot, ChevronRight, Coffee, Droplet, Fish, LayoutGrid, Nut, Wheat, type LucideIcon } from 'lucide-react';

import { editionFreshness } from '@/lib/data/edition-freshness';
import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_HUB_PATH,
  INDUSTRY_ITEMS,
  INDUSTRY_PINNED,
  industryItemForPath,
  itemsInCategory,
} from '@/lib/data/industry-registry';

import styles from './IndustrySidebarNav.module.css';

// 색만으로 뜻을 전하지 않도록 점의 title·aria-label 에 상태를 글로 붙인다
const FRESHNESS_WORDS = { fresh: '3개월 이내', aging: '1년 이내', stale: '1년 넘음' } as const;

export const INDUSTRY_NAV_STORAGE_KEY = 'industry-nav-open';

/** 분류 → 장식 색 CSS 변수(IndustrySidebarNav.module.css 의 .nav 에 다크·라이트 값이 있다) */
const CATEGORY_COLOR_VARS: Record<string, string> = {
  수산: '--industry-cat-fishery',
  축산: '--industry-cat-livestock',
  '곡물·서류': '--industry-cat-grain',
  과일: '--industry-cat-fruit',
  '견과·종실': '--industry-cat-nut',
  '채소·향신': '--industry-cat-veg',
  유지: '--industry-cat-oil',
  '기호·원료': '--industry-cat-luxury',
};

/** 분류 → 배지 아이콘(장식 — 분류 이름이 바로 옆에 글로 있다) */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  수산: Fish,
  축산: Beef,
  '곡물·서류': Wheat,
  과일: Apple,
  '견과·종실': Nut,
  '채소·향신': Carrot,
  유지: Droplet,
  '기호·원료': Coffee,
};

const PINNED_KEYS = new Set(INDUSTRY_PINNED.map((item) => item.key));

function readOpen(): string[] {
  try {
    const raw = window.localStorage.getItem(INDUSTRY_NAV_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : [];
  } catch {
    return [];
  }
}

function writeOpen(open: string[]): void {
  try {
    window.localStorage.setItem(INDUSTRY_NAV_STORAGE_KEY, JSON.stringify(open));
  } catch {
    /* 저장 못 해도 메뉴는 동작한다 */
  }
}

export interface IndustrySidebarNavProps {
  pathname: string | null;
  onNavigate: (href: string) => void;
  itemClassName: string;
  activeClassName: string;
}

export default function IndustrySidebarNav({
  pathname,
  onNavigate,
  itemClassName,
  activeClassName,
}: IndustrySidebarNavProps) {
  const current = industryItemForPath(pathname);
  const currentCategory = current?.category;
  const withCurrent = (list: string[]) => (
    currentCategory && !list.includes(currentCategory) ? [...list, currentCategory] : list
  );
  // 첫 렌더는 서버와 같게(저장값 없이) 그리고, 저장된 펼침 상태는 마운트 뒤에 합친다 — 하이드레이션 불일치 방지.
  const [open, setOpen] = useState<string[]>(() => withCurrent([]));
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    const saved = readOpen();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 저장소는 마운트 뒤에만 읽을 수 있다
    setOpen((prev) => [...new Set([...prev, ...saved])]);
    setRestored(true);
  }, []);

  // 신선도 점은 오늘 날짜에 달렸다 — 서버 렌더와 어긋나지 않게 마운트 뒤에만 계산한다.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 오늘 날짜는 마운트 뒤에만 읽는다(하이드레이션 불일치 방지)
    setNow(Date.now());
  }, []);

  // 다른 분류의 페이지로 옮겨 가면 그 분류를 펼친다(렌더 중 조정 — 이펙트에서 setState 하지 않는다).
  const [seenCategory, setSeenCategory] = useState(currentCategory);
  if (seenCategory !== currentCategory) {
    setSeenCategory(currentCategory);
    const next = withCurrent(open);
    if (next !== open) setOpen(next);
  }

  useEffect(() => {
    if (restored) writeOpen(open);
  }, [open, restored]);

  const toggle = (category: string) => {
    setOpen((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
  };

  const path = pathname?.replace(/\/+$/, '') ?? '';

  return (
    <div data-testid="industry-sidebar-nav" className={styles.nav}>
      {INDUSTRY_CATEGORIES.map((category, index) => {
        const expanded = open.includes(category);
        const listId = `industry-nav-group-${index}`;
        const items = itemsInCategory(category);
        const Icon = CATEGORY_ICONS[category] ?? LayoutGrid;
        return (
          <div
            key={category}
            style={{ '--cat-color': `var(${CATEGORY_COLOR_VARS[category] ?? '--industry-cat-none'})` } as React.CSSProperties}
          >
            <button
              type="button"
              className={itemClassName}
              aria-expanded={expanded}
              aria-controls={listId}
              onClick={() => toggle(category)}
              data-industry-group={category}
            >
              <ChevronRight
                size={18}
                aria-hidden="true"
                className={styles.chevron}
                style={{ transform: expanded ? 'rotate(90deg)' : undefined }}
              />
              <span className={styles.badge} aria-hidden="true" data-category-badge={category}>
                <Icon size={13} />
              </span>
              <span>{category}</span>
              <span className={styles.count}>{items.length}</span>
            </button>
            <ul id={listId} hidden={!expanded} className={styles.groupList}>
              {items.map((item) => {
                const active = path === item.href;
                const freshness = now === null ? null : editionFreshness(item.edition, now);
                const editionLabel = (item.edition ? `보고서 ${item.edition}` : '보고서 연월 없음')
                  + (freshness ? ` · ${FRESHNESS_WORDS[freshness]}` : '');
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      className={`${itemClassName} ${active ? activeClassName : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => onNavigate(item.href)}
                      data-industry-item={item.key}
                      style={{ fontSize: '0.85em', paddingTop: 4, paddingBottom: 4 }}
                    >
                      {PINNED_KEYS.has(item.key) && (
                        <span className={styles.pin} role="img" aria-label="주력 품목" data-pinned-star="true">★</span>
                      )}
                      <span>{item.name}</span>
                      {freshness && (
                        <span
                          className={`${styles.editionDot} ${styles[freshness]}`}
                          role="img"
                          title={editionLabel}
                          aria-label={editionLabel}
                          data-edition-dot={freshness}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      <button
        type="button"
        className={`${itemClassName} ${path === INDUSTRY_HUB_PATH ? activeClassName : ''}`}
        aria-current={path === INDUSTRY_HUB_PATH ? 'page' : undefined}
        onClick={() => onNavigate(INDUSTRY_HUB_PATH)}
        data-industry-hub-link="true"
      >
        <LayoutGrid size={18} />
        <span>전체 품목({INDUSTRY_ITEMS.length})</span>
      </button>
    </div>
  );
}
