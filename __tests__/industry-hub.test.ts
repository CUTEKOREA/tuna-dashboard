/**
 * 시장 이해 허브(/industry)·공통 품목 라우트(/industry/[key])·분류 접기 메뉴·참치 통합.
 *
 * 공통 라우트는 품목마다 컴포넌트가 없으므로 **루프 테스트**로 39품목을 전부 원문과 대조한다 —
 * 서술·장 제목·표·히어로 수치를 원문 HTML 에서 독립적으로 다시 읽어 화면과 맞춰 본다.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import IndustrySidebarNav from '../components/IndustrySidebarNav';
import CommodityIndustryDashboard from '../components/market-understanding/CommodityIndustryDashboard';
import { filterIndustryItems, IndustryHubCards } from '../components/market-understanding/IndustryHub';
import { buildIndustryItemSpec } from '../components/market-understanding/IndustryItemDashboard';
import { PORK_CHART_SLOTS, PORK_LEGACY_STAGE_MAP } from '../components/market-understanding/PorkLegacySlots';
import { PORK_WIDGETS } from '../components/PorkWidgets';
import { MACKEREL_CHART_SLOTS, MACKEREL_REPORT_NARRATIVES } from '../components/market-understanding/MackerelIndustryDashboard';
import { TUNA_MERGED_CHART_SLOTS } from '../components/market-understanding/TunaIndustryDashboard';
import { TUNA_ANATOMY_REPORT_NARRATIVES } from '../components/market-understanding/TunaAnatomyDashboard';
import { WHELK_CHART_SLOTS, WHELK_REPORT_NARRATIVES } from '../components/market-understanding/WhelkIndustryDashboard';
import type { ChartSlot } from '../components/market-understanding/CommodityIndustryDashboard';
import { isPublicDashboardPath } from '../lib/auth/owner-policy';
import { isActiveMenu, SIDEBAR_SECTIONS, VALID_MENUS } from '../lib/dashboard-registry';
import { reportProse } from '../lib/data/company-report-prose';
import { reportTables } from '../lib/data/company-report-tables';
import {
  BODY_CARD_FACTS,
  cardFacts,
  INDUSTRY_CATEGORIES,
  INDUSTRY_ITEMS,
  INDUSTRY_PINNED,
  industryItemForPath,
  industryPageTitle,
  isGenericIndustryItem,
} from '../lib/data/industry-registry';
import { MACKEREL_SOURCE_NOTES } from '../lib/mackerel-industry-content';
import { WHELK_SOURCE_NOTES } from '../lib/whelk-industry-content';
import nextConfig from '../next.config.mjs';

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

/** HTML → 비교용 평문. 태그를 걷고 엔터티를 풀고 공백을 하나로 줄인다. */
function plain(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/\s+/g, ' ');
}
/** 추출기(report_prose._text)와 같은 규칙의 평문 — 근거 칩은 빼고 태그는 공백 없이 걷는다. */
function flat(html: string): string {
  return plain(
    html
      .replace(/<span class="chip[^"]*"[^>]*>[\s\S]*?<\/span>/g, ' ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/(\d)<sup[^>]*>(\d+)<\/sup>/g, (_m, a: string, b: string) => a + [...b].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join(''))
      .replace(/<[^>]+>/g, ''),
  );
}
const squash = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\s+/g, ' ').trim();

describe('47품목 레지스트리 (실제 48 — 발주서 분류 목록 합)', () => {
  it('키 중복 0', () => {
    const keys = INDUSTRY_ITEMS.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
    const names = INDUSTRY_ITEMS.map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('분류 8개, 분류별 합이 전체 품목 수와 같다', () => {
    expect(INDUSTRY_CATEGORIES).toEqual(['수산', '축산', '곡물·서류', '과일', '견과·종실', '채소·향신', '유지', '기호·원료']);
    const counts = INDUSTRY_CATEGORIES.map((c) => INDUSTRY_ITEMS.filter((item) => item.category === c).length);
    expect(counts).toEqual([12, 4, 7, 5, 6, 5, 4, 5]);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(INDUSTRY_ITEMS.length);
    expect(INDUSTRY_ITEMS.length).toBe(48);
  });

  it('전용 페이지 9품목은 기존 경로로, 나머지 39품목은 공통 라우트로 간다', () => {
    const dedicated = INDUSTRY_ITEMS.filter((item) => !isGenericIndustryItem(item));
    expect(dedicated.map((item) => item.href).sort()).toEqual([
      '/mackerel-industry', '/octopus-industry', '/pollock-industry', '/shrimp-industry', '/squid-industry',
      '/surimi-industry', '/tuna-industry', '/tunafarm-industry', '/whelk-industry',
    ]);
    for (const item of dedicated) expect(isActiveMenu(item.href.slice(1)), item.href).toBe(true);
    expect(INDUSTRY_ITEMS.filter(isGenericIndustryItem)).toHaveLength(39);
  });

  it('허브 카드 48개 — 이름·분류·표지 앞 2타일·보고서 연월', () => {
    const html = renderToStaticMarkup(React.createElement(IndustryHubCards));
    const cards = [...html.matchAll(/data-industry-card="([^"]+)"/g)].map((m) => m[1]);
    expect(cards).toEqual(INDUSTRY_ITEMS.map((item) => item.key));
    const text = plain(html);
    for (const item of INDUSTRY_ITEMS) {
      expect(html).toContain(`href="${item.href}"`);
      expect(text).toContain(`보고서 ${item.edition}`);
      for (const f of cardFacts(item).slice(0, 2)) expect(text, `${item.key} ${f.k}`).toContain(`${f.k} ${f.v} ${f.n}`);
    }
  });

  it('표지 타일이 없는 골뱅이·참치 양식 카드는 원문 요지 첫 단락의 수치 2개를 쓴다', () => {
    expect(Object.keys(BODY_CARD_FACTS).sort()).toEqual(['tunafarm', 'whelk']);
    for (const [key, facts] of Object.entries(BODY_CARD_FACTS)) {
      const item = INDUSTRY_ITEMS.find((i) => i.key === key)!;
      expect(item.facts, key).toEqual([]);
      expect(facts).toHaveLength(2);
      expect(cardFacts(item)).toBe(facts);
      const doc = read(`docs/evidence/industry-${key}-2026-10/보고서.html`);
      // 요지(0장) 첫 단락 = 요지 머리(「0. 요지」 h2 또는 id="s0") 뒤 첫 <li>/<p>
      const head = /요지<\/h2>|id="s0"[^>]*>[^<]*<\/p>/.exec(doc)!;
      const rest = doc.slice(head.index + head[0].length);
      const first = flat(/<(li|p)\b[^>]*>([\s\S]*?)<\/\1>/.exec(rest)![2]);
      for (const f of facts) {
        expect(f.quote, `${key} ${f.k}`).toContain(f.v);
        expect(first, `${key} ${f.quote}`).toContain(f.quote);
        expect(flat(doc)).toContain(f.quote);
      }
    }
  });

  it('검색·분류 필터', () => {
    expect(filterIndustryItems(INDUSTRY_ITEMS, '', '전체')).toHaveLength(48);
    expect(filterIndustryItems(INDUSTRY_ITEMS, '', '유지').map((i) => i.key)).toEqual(['canola_oil', 'olive', 'palm_oil', 'sunflower_oil']);
    expect(filterIndustryItems(INDUSTRY_ITEMS, '쌀', '전체').map((i) => i.key)).toEqual(['rice']);
    expect(filterIndustryItems(INDUSTRY_ITEMS, '쌀', '과일')).toEqual([]);
  });

  it('카드 수치·연월은 원문 표지에서 읽었다', () => {
    for (const item of INDUSTRY_ITEMS) {
      const doc = read(`docs/evidence/industry-${item.key}-2026-10/보고서.html`);
      const cover = plain(doc.slice(0, doc.indexOf('</header>')));
      for (const f of item.facts) expect(cover, `${item.key} ${f.k}`).toContain(`${f.k} ${f.v} ${f.n}`);
    }
  });
});

/** 원문에서 독립적으로 읽은 본문 절(부록 대문자 id 제외). */
function originalSections(doc: string) {
  return [...doc.matchAll(/<section id="(s\d+)">([\s\S]*?)<\/section>/g)].map((m) => {
    const h2 = /<h2[^>]*><span class="h2n">([\s\S]*?)<\/span>([\s\S]*?)<\/h2>/.exec(m[2]);
    const [num, label] = plain(h2?.[1] ?? '').split('/').map((s) => s.trim());
    return { sid: m[1], body: m[2], num, label, subtitle: plain(h2?.[2] ?? '').trim(), tables: (m[2].match(/<table\b/g) ?? []).length };
  });
}

const GENERIC = INDUSTRY_ITEMS.filter(isGenericIndustryItem);

describe('공통 품목 라우트 /industry/[key] — 품목마다 원문 대조', () => {
  it.each(GENERIC.map((item) => [item.key, item] as const))('%s', (key, item) => {
    const doc = read(`docs/evidence/industry-${key}-2026-10/보고서.html`);
    const data = {
      tables: JSON.parse(read(`public/data/companies/${key}_tables_v1.json`)),
      prose: JSON.parse(read(`public/data/companies/${key}_prose_v1.json`)),
      figures: JSON.parse(read(`public/data/companies/${key}_figures_v1.json`)),
    };
    const spec = buildIndustryItemSpec(item, data);
    const html = renderToStaticMarkup(React.createElement(CommodityIndustryDashboard, { spec }));
    const screen = plain(html);
    const docText = flat(doc);
    const screenFlat = flat(html);
    const secs = originalSections(doc);

    // 원문 사본 바이트 일치
    expect(readFileSync(join(root, `public/reports/industry/${key}-2026-10.html`)).equals(readFileSync(join(root, `docs/evidence/industry-${key}-2026-10/보고서.html`)))).toBe(true);
    expect(html).toContain(`<a href="/reports/industry/${key}-2026-10.html" target="_blank" rel="noopener noreferrer">보고서 원문 보기</a>`);
    expect(html).toContain('PDF 저장');

    // 1절 = 1단계, 단계 제목 = 원문 h2 부제, 질문 없음
    expect(secs.map((s) => s.sid)).toEqual(Array.from({ length: 11 }, (_, i) => `s${String(i + 1).padStart(2, '0')}`));
    expect(spec.narratives.map((n) => n.title)).toEqual(secs.map((s) => s.subtitle));
    expect(spec.narratives.every((n) => n.question === '')).toBe(true);
    expect(html).not.toContain('stageQuestion');

    // 장 제목 누락 0 — 「라벨: 부제」가 화면에 있다
    for (const s of secs) expect(screen, `${key} ${s.sid} 장 제목`).toContain(`${s.label}: ${s.subtitle}`);

    // 서술: 모든 블록이 원문에 있고 화면에도 있다
    const blocks = reportProse(key).flatMap((sec) => sec.blocks);
    expect(blocks.length).toBeGreaterThan(30);
    for (const b of blocks) {
      const raw = (b.kind === 'h3' ? b.title ?? '' : b.text).replace(/\s+/g, ' ').trim();
      const text = squash(raw);
      if (!text) continue;
      expect(docText, `${key} 원문에 없는 서술: ${raw.slice(0, 40)}`).toContain(raw);
      expect(screenFlat, `${key} 화면에 없는 서술: ${text.slice(0, 40)}`).toContain(text);
    }

    // 표: 원문 본문 표 수와 같고, 머리글·첫 행·끝 행 값이 화면에 있다
    const tables = reportTables(key);
    expect(tables).toHaveLength(secs.reduce((a, s) => a + s.tables, 0));
    for (const t of tables) {
      for (const h of t.head) expect(screenFlat, `${key} 머리글 ${h}`).toContain(squash(h));
      for (const row of [t.rows[0], t.rows[t.rows.length - 1]]) {
        for (const c of row) if (c) expect(screenFlat, `${key} 표 값 ${c}`).toContain(squash(c));
      }
    }

    // 히어로: 표지 타일을 글자 그대로
    expect(item.facts.length).toBe(8);
    for (const f of item.facts) {
      expect(screen, `${key} 히어로 ${f.k}`).toContain(f.k);
      expect(screen, `${key} 히어로 ${f.v}`).toContain(f.v);
      expect(screen, `${key} 히어로 ${f.n}`).toContain(f.n);
    }
  });
});

describe('왼쪽 메뉴 — 주력 5 고정 + 분류 접기 + 전체 품목', () => {
  it('주력 5개(★ 참치·오징어·명태·연육·새우)가 시장 이해 맨 위에 고정된다', () => {
    const understanding = SIDEBAR_SECTIONS.find((s) => s.section === 'understanding');
    expect(understanding?.items.map((i) => i.key)).toEqual([
      'tuna-industry', 'squid-industry', 'pollock-industry', 'surimi-industry', 'shrimp-industry',
    ]);
    expect(INDUSTRY_PINNED.map((i) => i.key)).toEqual(['tuna', 'squid', 'pollock', 'surimi', 'shrimp']);
    const page = read('app/page.tsx');
    expect(page).toContain('★ ${item.label}');
    expect(page).toContain('<IndustrySidebarNav');
  });

  const nav = (pathname: string) => renderToStaticMarkup(React.createElement(IndustrySidebarNav, {
    pathname, onNavigate: () => undefined, itemClassName: 'item', activeClassName: 'active',
  }));

  it('분류 8개가 접기 버튼이고 aria-expanded·aria-controls 가 있다. 현재 분류만 펼친다', () => {
    const html = nav('/industry/rice');
    const groups = [...html.matchAll(/<button type="button" class="item" aria-expanded="(true|false)" aria-controls="([^"]+)" data-industry-group="([^"]+)"/g)];
    expect(groups.map((m) => m[3])).toEqual([...INDUSTRY_CATEGORIES]);
    expect(groups.filter((m) => m[1] === 'true').map((m) => m[3])).toEqual(['곡물·서류']);
    // 접힌 목록은 hidden, 펼친 목록은 보인다
    for (const m of groups) {
      const list = new RegExp(`<ul id="${m[2]}"( hidden="")?`).exec(html);
      expect(Boolean(list?.[1]), m[3]).toBe(m[1] === 'false');
    }
    expect(html).toContain('aria-current="page" data-industry-item="rice"');
    // 네이티브 button 이라 키보드 Enter·Space 로 펼친다
    expect(html).not.toMatch(/<div[^>]*role="button"/);
  });

  it('전용 페이지에서도 그 분류를 펼친다(고등어 → 수산)', () => {
    expect(industryItemForPath('/mackerel-industry')?.category).toBe('수산');
    const html = nav('/mackerel-industry');
    expect(html).toMatch(/aria-expanded="true"[^>]*data-industry-group="수산"/);
    expect([...html.matchAll(/aria-expanded="true"/g)]).toHaveLength(1);
  });

  it('허브·다른 메뉴에서는 전부 접혀 있고, 맨 끝 「전체 품목(48)」이 허브로 간다', () => {
    const html = nav('/industry');
    expect(html).not.toContain('aria-expanded="true"');
    expect(html).toContain('전체 품목(48)');
    expect(html.lastIndexOf('data-industry-group')).toBeLessThan(html.indexOf('data-industry-hub-link'));
    expect(html).toMatch(/class="item active" aria-current="page" data-industry-hub-link="true"/);
  });

  it('펼침 상태는 localStorage 에 둔다', () => {
    const src = read('components/IndustrySidebarNav.tsx');
    expect(src).toContain("INDUSTRY_NAV_STORAGE_KEY = 'industry-nav-open'");
    expect(src).toMatch(/localStorage\.getItem\(INDUSTRY_NAV_STORAGE_KEY\)/);
    expect(src).toMatch(/localStorage\.setItem\(INDUSTRY_NAV_STORAGE_KEY/);
  });

  it('돼지고기는 별도 섹션이 아니라 시장 이해 > 축산 분류의 공통 라우트로 간다', () => {
    expect(SIDEBAR_SECTIONS.map((s) => s.section)).not.toContain('livestock');
    expect(INDUSTRY_ITEMS.find((i) => i.key === 'pork')).toMatchObject({ category: '축산', href: '/industry/pork' });
  });
});

describe('라우트·보호·리다이렉트', () => {
  it('/industry 와 /industry/[key] 라우트 파일이 대시보드 셸을 띄운다', () => {
    expect(read('app/industry/page.tsx')).toContain("from '../[category]/page'");
    expect(read('app/industry/[key]/page.tsx')).toContain("from '../../[category]/page'");
    expect(read('app/page.tsx')).toContain("path?.startsWith('industry/')) return 'industry'");
  });

  it('새 라우트와 원문·JSON 경로도 로그인 보호(matcher /:path*)가 덮는다', () => {
    expect(read('proxy.ts')).toMatch(/matcher:\s*\['\/:path\*'\]/);
    for (const p of ['/industry', '/industry/rice', '/reports/industry/rice-2026-10.html', '/data/companies/rice_prose_v1.json']) {
      expect(isPublicDashboardPath(p), p).toBe(false);
    }
  });

  it('/tuna-anatomy 는 /tuna-industry 로 보낸다. 메뉴에서는 지웠다', async () => {
    const redirects = await (nextConfig as { redirects: () => Promise<Array<{ source: string; destination: string }>> }).redirects();
    expect(redirects).toContainEqual(expect.objectContaining({ source: '/tuna-anatomy', destination: '/tuna-industry' }));
    expect(VALID_MENUS).not.toContain('tuna-anatomy' as never);
    expect(SIDEBAR_SECTIONS.flatMap((s) => s.items.map((i) => i.key))).not.toContain('tuna-anatomy' as never);
  });
});

describe('돼지고기 통합 — 옛 /pork 위젯 11개는 /industry/pork 원문 단계 끝 「근거」로', () => {
  const item = INDUSTRY_ITEMS.find((i) => i.key === 'pork')!;
  const data = {
    tables: JSON.parse(read('public/data/companies/pork_tables_v1.json')),
    prose: JSON.parse(read('public/data/companies/pork_prose_v1.json')),
    figures: JSON.parse(read('public/data/companies/pork_figures_v1.json')),
  };

  it('위젯 11개가 빠짐없이 원문 11단계 안으로 가고, 화면에 제목·출처가 뜬다', () => {
    const spec = buildIndustryItemSpec(item, data);
    const keys = new Set(spec.narratives.map((n) => n.key));
    expect(Object.keys(PORK_WIDGETS).sort()).toEqual(Object.keys(PORK_LEGACY_STAGE_MAP).sort());
    expect(Object.values(PORK_CHART_SLOTS).flat()).toHaveLength(11);
    for (const [stage, slots] of Object.entries(spec.chartSlots)) {
      expect(keys.has(stage), stage).toBe(true);
      expect(new Set(slots.map((s) => s.title)).size, stage).toBe(slots.length);
    }
    const html = renderToStaticMarkup(React.createElement(CommodityIndustryDashboard, { spec }));
    for (const w of Object.values(PORK_WIDGETS)) {
      expect(html, w.title).toContain(w.title);
      expect(html, w.source).toContain(`출처: ${w.source}`);
    }
  });

  it('자급률 위젯 캡션이 66%의 기준과 표지 73.0%의 기준을 함께 적는다(값은 원문에 있다)', () => {
    const slot = PORK_CHART_SLOTS.s03.find((s) => s.title === '한국 단백질 자급률 갭')!;
    for (const t of ['66%', '2022년', 'FAOSTAT', 'PSD', '73.0%', 'KREI', '66.4%', '도체중량']) expect(slot.caption, t).toContain(t);
    const doc = plain(read('docs/evidence/industry-pork-2026-10/보고서.html'));
    expect(doc).toContain('자급률(국내 수급표) 73.0%');
    expect(doc).toContain('미국 농무부 PSD 공식치(도체중량)로는 2025년 66.4%');
  });

  it('/pork 는 /industry/pork 로 307, 메뉴·명령 팔레트에 옛 돼지고기가 없다', async () => {
    const redirects = await (nextConfig as { redirects: () => Promise<Array<{ source: string; destination: string; permanent: boolean }>> }).redirects();
    expect(redirects).toContainEqual({ source: '/pork', destination: '/industry/pork', permanent: false });
    expect(SIDEBAR_SECTIONS.flatMap((s) => s.items.map((i) => i.key))).not.toContain('pork');
  });
});

describe('참치 통합 — 옛 「참치」 위젯은 원문 단계 끝 「근거」로', () => {
  it('모든 근거 슬롯이 원문 15단계 안에 있고 한 단계에 같은 제목이 두 번 없다', () => {
    const keys = new Set(TUNA_ANATOMY_REPORT_NARRATIVES.map((n) => n.key));
    for (const [stage, slots] of Object.entries(TUNA_MERGED_CHART_SLOTS)) {
      expect(keys.has(stage), stage).toBe(true);
      const titles = slots.map((s) => s.title);
      expect(new Set(titles).size, stage).toBe(titles.length);
    }
  });
});

/** 「NN단계」「NN·NN단계」「NN~NN단계」 의 번호들 */
function stageRefs(text: string): number[] {
  return [...text.matchAll(/(\d{2})(?:[·~](\d{2}))?단계/g)].flatMap((m) => [m[1], m[2]].filter(Boolean).map(Number));
}
const captions = (slots: Record<string, ChartSlot[]>) =>
  Object.values(slots).flat().flatMap((s) => [s.title, s.caption, s.sourceLine ?? '']);

describe('캡션·출처 주의의 「NN단계」는 그 페이지의 실제 단계 수 이하다', () => {
  it.each([
    ['고등어', MACKEREL_REPORT_NARRATIVES.length, [...captions(MACKEREL_CHART_SLOTS), ...MACKEREL_SOURCE_NOTES]],
    ['골뱅이', WHELK_REPORT_NARRATIVES.length, [...captions(WHELK_CHART_SLOTS), ...WHELK_SOURCE_NOTES]],
    ['참치', TUNA_ANATOMY_REPORT_NARRATIVES.length, captions(TUNA_MERGED_CHART_SLOTS)],
  ] as const)('%s', (_name, count, texts) => {
    for (const text of texts) {
      for (const n of stageRefs(text)) expect(n, text.slice(0, 60)).toBeLessThanOrEqual(count);
    }
  });
});

describe('탭 제목 — /industry/[key] 는 「전체 품목」이 아니라 품목명', () => {
  it('공통 품목 경로는 품목명, 허브·전용 페이지·다른 메뉴는 메뉴 제목', () => {
    expect(industryPageTitle('/industry/rice', '전체 품목')).toBe('쌀');
    expect(industryPageTitle('/industry/pork/', '전체 품목')).toBe('돼지고기');
    expect(industryPageTitle('/industry', '전체 품목')).toBe('전체 품목');
    expect(industryPageTitle('/tuna-industry', '참치')).toBe('참치');
    expect(industryPageTitle('/market', '시장')).toBe('시장');
    for (const item of GENERIC) expect(industryPageTitle(item.href, '전체 품목')).toBe(item.name);
  });

  it('셸이 경로를 보고 탭 제목을 정한다(품목 화면이 덮어쓴 값을 셸이 다시 덮지 않게)', () => {
    const page = read('app/page.tsx');
    expect(page).toContain('document.title = `${industryPageTitle(pathname, getDashboardTitle(activeMenu))} | 참치왕국`');
    expect(page).toContain('}, [activeMenu, pathname]);');
    expect(read('components/market-understanding/IndustryItemDashboard.tsx')).not.toContain('document.title');
  });
});

describe('/industry/[key] 서버 키 검증', () => {
  it('레지스트리에 없는 키와 전용 페이지가 있는 키는 404로 끊는다', async () => {
    const { default: Page } = await import('../app/industry/[key]/page');
    for (const key of ['no-such-item', '..%2F..%2Fetc', 'tuna']) {
      await expect(Page({ params: Promise.resolve({ key }) })).rejects.toThrow();
    }
  });
  it('전용 페이지가 없는 품목 키는 통과한다', async () => {
    const { default: Page } = await import('../app/industry/[key]/page');
    await expect(Page({ params: Promise.resolve({ key: 'rice' }) })).resolves.toBeTruthy();
  });
});
