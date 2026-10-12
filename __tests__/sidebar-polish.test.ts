/**
 * 왼쪽 메뉴 다듬기(2026-10-12) — 신선도 점 경계, 분류 점·주력 ★, ⌘K 품목 검색, 주력 칩.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { filterPaletteEntries, PALETTE_ENTRIES } from '../components/CommandPalette';
import IndustrySidebarNav from '../components/IndustrySidebarNav';
import { editionFreshness } from '../lib/data/edition-freshness';
import { INDUSTRY_CATEGORIES, INDUSTRY_ITEMS, INDUSTRY_PINNED } from '../lib/data/industry-registry';

const DAY = 86_400_000;
// 2026년 9월 말일 = 2026-09-30 UTC 자정
const SEP_END = Date.UTC(2026, 8, 30);

describe('보고서 연월 신선도', () => {
  it.each([
    [0, 'fresh'],
    [89, 'fresh'],
    [90, 'fresh'],
    [91, 'aging'],
    [364, 'aging'],
    [365, 'aging'],
    [366, 'stale'],
  ] as const)('말일부터 %i일 → %s', (days, expected) => {
    expect(editionFreshness('2026년 9월', SEP_END + days * DAY)).toBe(expected);
  });

  it('그 달 말일 전(달 중간)은 초록', () => {
    expect(editionFreshness('2026년 10월', Date.UTC(2026, 9, 12))).toBe('fresh');
  });

  it('빈 값·읽지 못하는 값은 회색', () => {
    for (const v of ['', undefined, null, '2026-10', '2026년 13월']) {
      expect(editionFreshness(v, SEP_END)).toBe('stale');
    }
  });
});

describe('IndustrySidebarNav — 분류 점·주력 ★', () => {
  const html = renderToStaticMarkup(React.createElement(IndustrySidebarNav, {
    pathname: '/industry', onNavigate: () => undefined, itemClassName: 'item', activeClassName: 'active',
  }));

  it('분류 버튼마다 색 점이 하나씩, 8개', () => {
    const dots = [...html.matchAll(/data-category-dot="([^"]+)"/g)].map((m) => m[1]);
    expect(dots).toEqual([...INDUSTRY_CATEGORIES]);
    expect(dots).toHaveLength(8);
    // 분류 색은 CSS 변수로 둔다
    expect(html).toContain('--cat-color:var(--industry-cat-fishery)');
    expect(html).toContain('--cat-color:var(--industry-cat-luxury)');
  });

  it('주력 5개는 목록에 남고 이름 앞에 ★ 가 붙는다', () => {
    const starred = [...html.matchAll(/data-industry-item="([^"]+)"[^>]*><span[^>]*data-pinned-star="true"/g)].map((m) => m[1]);
    expect(starred.sort()).toEqual(INDUSTRY_PINNED.map((i) => i.key).sort());
    expect([...html.matchAll(/data-industry-item=/g)]).toHaveLength(INDUSTRY_ITEMS.length);
  });

  it('첫 렌더(서버)에는 신선도 점이 없다 — 하이드레이션 불일치 방지', () => {
    expect(html).not.toContain('data-edition-dot');
  });
});

describe('⌘K 팔레트 — 품목 48개', () => {
  // 전용 페이지가 있는 품목(골뱅이 등)은 운영 메뉴 항목 한 줄로만 나온다 — 품목 이름으로 찾으면 그 화면으로 간다.
  it('"골뱅이"로 찾으면 한 줄만 나오고 그 화면으로 간다', () => {
    const hits = filterPaletteEntries(PALETTE_ENTRIES, '골뱅이');
    expect(hits).toHaveLength(1);
    expect(hits[0].target).toEqual({ menu: 'whelk-industry' });
  });

  it('공통 라우트 품목은 「이름 · 분류」로 href 로 간다', () => {
    const generic = INDUSTRY_ITEMS.filter((i) => i.href.startsWith('/industry/'));
    expect(generic.length).toBeGreaterThan(0);
    const item = generic[0];
    expect(filterPaletteEntries(PALETTE_ENTRIES, item.name)).toContainEqual(expect.objectContaining({
      label: `${item.name} · ${item.category}`,
      target: { href: item.href },
    }));
  });

  it('48개 품목이 모두 한 번씩 찾아진다(중복 없음)', () => {
    for (const item of INDUSTRY_ITEMS) {
      const hits = filterPaletteEntries(PALETTE_ENTRIES, item.name).filter((e) =>
        ('href' in e.target && e.target.href === item.href) || ('menu' in e.target && `/${e.target.menu}` === item.href));
      expect(hits, item.name).toHaveLength(1);
    }
  });
});

describe('주력 칩·구역 구분', () => {
  const page = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
  const css = readFileSync(join(process.cwd(), 'app/page.module.css'), 'utf8');

  it('주력 5개는 섹션 제목 아래 가로 칩(flex-wrap)이고 aria-current 를 단다', () => {
    expect(page).toContain('section.items.map(renderPinnedChip)');
    expect(page).toMatch(/className=\{`\$\{styles\.pinnedChip\}[^`]*`\}\s*aria-current=/);
    expect(css).toMatch(/\.pinnedChips \{[^}]*flex-wrap: wrap/);
  });

  it('검색 버튼은 다시 만들지 않는다(⌘K 단축키만)', () => {
    expect(page).not.toMatch(/빠른 검색<\/|<Search\b/);
  });

  it('구역 사이 구분선', () => {
    expect(page).toContain('styles.sidebarSectionBreak');
    expect(page).toContain('styles.sidebarToolsBreak');
    expect(css).toMatch(/\.sidebarSectionBreak \{[^}]*border-top/);
  });
});
