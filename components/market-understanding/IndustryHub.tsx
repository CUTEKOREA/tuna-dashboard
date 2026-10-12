/**
 * 「시장 이해 > 전체 품목」 — 허브 `/industry` 와 공통 품목 라우트 `/industry/[key]` 의 입구.
 *
 * 경로가 `/industry/<key>` 면 그 품목 페이지를, 아니면 허브(검색·분류 필터·카드)를 낸다.
 * 카드의 수치·연월은 원문 표지(`hub_v1.json`)이고, 전용 페이지가 있는 품목은 기존 경로로 보낸다.
 */
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  cardFacts,
  INDUSTRY_CATEGORIES,
  INDUSTRY_HUB_PATH,
  INDUSTRY_ITEMS,
  industryItem,
  isGenericIndustryItem,
  type IndustryItem,
} from '@/lib/data/industry-registry';
import IndustryItemDashboard from './IndustryItemDashboard';
import styles from './IndustryHub.module.css';

const ALL = '전체';

/** 검색은 품목 이름·분류·키·보고서 제목에 건다. */
export function filterIndustryItems(items: readonly IndustryItem[], query: string, category: string): IndustryItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => (
    (category === ALL || item.category === category)
    && (!q || [item.name, item.category, item.key, item.title].some((s) => s.toLowerCase().includes(q)))
  ));
}

export function IndustryHubCards() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const shown = useMemo(() => filterIndustryItems(INDUSTRY_ITEMS, query, category), [query, category]);

  return (
    <div className={styles.hub} data-testid="industry-hub">
      <header>
        <h1 className={styles.title}>전체 품목</h1>
        <p className={styles.intro}>
          품목 {INDUSTRY_ITEMS.length}개의 해부보고서. 카드의 수치는 보고서 표지 값이다.
        </p>
      </header>

      <div className={styles.controls}>
        <input
          type="search"
          className={styles.search}
          placeholder="품목 검색 (예: 쌀, 커피)"
          aria-label="품목 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.filters} role="group" aria-label="분류 필터">
          {[ALL, ...INDUSTRY_CATEGORIES].map((c) => (
            <button
              key={c}
              type="button"
              className={styles.filter}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.count} aria-live="polite">{shown.length}개 품목</p>

      {shown.length === 0 ? (
        <p className={styles.empty}>맞는 품목이 없다.</p>
      ) : (
        <ul className={styles.grid}>
          {shown.map((item) => (
            <li key={item.key}>
              <Link href={item.href} className={styles.card} data-industry-card={item.key}>
                <span className={styles.cardHead}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.category}>{item.category}</span>
                </span>
                {cardFacts(item).length > 0 && (
                  <dl className={styles.facts}>
                    {cardFacts(item).slice(0, 2).map((f) => (
                      <div key={f.k} className={styles.fact}>
                        <dt>{f.k}</dt>
                        <dd>
                          {f.v}
                          <span>{f.n}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                <span className={styles.edition}>보고서 {item.edition}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function IndustryHub() {
  const pathname = usePathname();
  const key = pathname?.startsWith(`${INDUSTRY_HUB_PATH}/`) ? decodeURIComponent(pathname.slice(INDUSTRY_HUB_PATH.length + 1)).replace(/\/+$/, '') : '';
  if (!key) return <IndustryHubCards />;

  const item = industryItem(key);
  if (!item || !isGenericIndustryItem(item)) {
    return (
      <div className={styles.hub}>
        <p className={styles.empty} role="alert">
          {item ? `${item.name}은(는) 전용 페이지가 있다. ` : `「${key}」 품목이 없다. `}
          <Link href={item ? item.href : INDUSTRY_HUB_PATH}>{item ? `${item.name} 페이지로` : '전체 품목으로'}</Link>
        </p>
      </div>
    );
  }
  return <IndustryItemDashboard key={item.key} item={item} />;
}
