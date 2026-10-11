/**
 * 왼쪽 메뉴 「시장 이해」의 분류 접기 그룹과 「전체 품목(N)」.
 *
 * 주력 5개(★)는 레지스트리 SIDEBAR_SECTIONS 가 그대로 그리고, 이 컴포넌트는 그 아래만 맡는다.
 *  - 분류 8개를 접기 그룹으로 둔다. 기본은 접힘이고 지금 페이지가 속한 분류는 펼친다.
 *  - 펼침 상태는 localStorage 에 둔다(읽기·쓰기 실패는 무시 — 사생활 모드 등).
 *  - 접기 버튼은 네이티브 button 이라 키보드(Enter·Space)로 펼친다. aria-expanded·aria-controls 를 단다.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight, LayoutGrid } from 'lucide-react';

import {
  INDUSTRY_CATEGORIES,
  INDUSTRY_HUB_PATH,
  INDUSTRY_ITEMS,
  industryItemForPath,
  itemsInCategory,
} from '@/lib/data/industry-registry';

export const INDUSTRY_NAV_STORAGE_KEY = 'industry-nav-open';

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
    <div data-testid="industry-sidebar-nav">
      {INDUSTRY_CATEGORIES.map((category, index) => {
        const expanded = open.includes(category);
        const listId = `industry-nav-group-${index}`;
        const items = itemsInCategory(category);
        return (
          <div key={category}>
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
                style={{ transform: expanded ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s ease' }}
              />
              <span>{category}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.7 }}>{items.length}</span>
            </button>
            <ul id={listId} hidden={!expanded} style={{ listStyle: 'none', margin: 0, padding: '0 0 0 1.25rem' }}>
              {items.map((item) => {
                const active = path === item.href;
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
                      <span>{item.name}</span>
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
