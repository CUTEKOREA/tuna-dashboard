/**
 * 시장 이해 다섯 품목 화면의 「보고서 원문 보기」와 원문 그림·장 제목 렌더.
 *
 * 원문 HTML 은 `scripts/sync_industry_report_html.py` 가 docs/evidence 에서 public 으로
 * **바이트 그대로** 복사한다. 원문을 고치면 다시 돌려야 하고, 잊으면 여기서 죽는다.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import MackerelIndustryDashboard from '../components/market-understanding/MackerelIndustryDashboard';
import OctopusIndustryDashboard from '../components/market-understanding/OctopusIndustryDashboard';
import PollockIndustryDashboard from '../components/market-understanding/PollockIndustryDashboard';
import ShrimpIndustryDashboard from '../components/market-understanding/ShrimpIndustryDashboard';
import SquidIndustryDashboard from '../components/market-understanding/SquidIndustryDashboard';
import TunaAnatomyDashboard from '../components/market-understanding/TunaAnatomyDashboard';
import { chapterHead } from '../components/market-understanding/IndustryReportFlow';
import { reportFigures } from '../lib/data/company-report-figures';
import { reportProse } from '../lib/data/company-report-prose';

const PAGES = [
  ['pollock', PollockIndustryDashboard],
  ['octopus', OctopusIndustryDashboard],
  ['shrimp', ShrimpIndustryDashboard],
  ['squid', SquidIndustryDashboard],
  ['tuna', TunaAnatomyDashboard],
] as const;

const root = process.cwd();

describe('보고서 원문 파일', () => {
  it.each(PAGES)('%s - public 사본이 docs/evidence 원문과 바이트까지 같다', (key) => {
    const copy = join(root, `public/reports/industry/${key}-2026-10.html`);
    expect(existsSync(copy), copy).toBe(true);
    const original = readFileSync(join(root, `docs/evidence/industry-${key}-2026-10/보고서.html`));
    expect(readFileSync(copy).equals(original)).toBe(true);
  });

  it('원문에 인쇄 스타일이 있어 브라우저 인쇄로 PDF 가 된다', () => {
    for (const [key] of PAGES) {
      expect(readFileSync(join(root, `public/reports/industry/${key}-2026-10.html`), 'utf8'), key)
        .toContain('@media print');
    }
  });
});

const markup = new Map(PAGES.map(([key, Page]) => [key, renderToStaticMarkup(React.createElement(Page))]));

describe('화면 렌더', () => {
  it.each(PAGES)('%s - 히어로 아래에 「보고서 원문 보기」 새 탭 링크와 인쇄 안내가 있다', (key) => {
    const html = markup.get(key) ?? '';
    const link = `<a href="/reports/industry/${key}-2026-10.html" target="_blank" rel="noopener noreferrer">보고서 원문 보기</a>`;
    expect(html).toContain(link);
    expect(html).toContain('PDF 저장');
    // 히어로 다음, 30초 브리핑 앞
    expect(html.indexOf(link)).toBeLessThan(html.indexOf('30초 브리핑'));
  });

  it('원문 링크는 원문이 있는 품목에만 붙는다', () => {
    expect(renderToStaticMarkup(React.createElement(MackerelIndustryDashboard))).not.toContain('보고서 원문 보기');
  });

  it.each(PAGES)('%s - 원문 본문 절의 장 제목이 렌더된 화면에 있다', (key) => {
    const html = (markup.get(key) ?? '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
    const missing = reportProse(key).map(chapterHead).filter((head) => !html.includes(head));
    expect(missing).toEqual([]);
  });

  it('오징어 - 원문 그림 14개가 범위 지정 스타일과 함께 렌더되고 이미지는 정적 파일이다', () => {
    const html = markup.get('squid') ?? '';
    const figs = reportFigures('squid');
    expect(figs).toHaveLength(14);
    expect((html.match(/<div[^>]*data-fig="squid-/g) ?? []).length).toBe(14);
    expect(html).toContain('class="metrics"');
    expect(html).toContain('class="bars"');
    expect(html).toContain('Illex argentinus');
    expect(html).toContain('그림 3. 재무 87개사의 영업이익률 분포');
    expect(html).not.toContain('base64');
    // 그림 스타일은 그 그림 안에만 걸린다 — 규칙마다 [data-fig] 범위가 붙는다
    const styles = [...html.matchAll(/<style>(\[data-fig="squid-[^<]*)<\/style>/g)];
    expect(styles).toHaveLength(14);
    for (const m of styles) {
      for (const sel of m[1].split('}').filter(Boolean).map((rule) => rule.split('{')[0])) {
        expect(sel, sel).toMatch(/^\[data-fig="squid-[^"]+"\]/);
      }
    }
    for (const m of html.matchAll(/<img[^>]*src="([^"]+)"/g)) {
      if (m[1].includes('/figures/')) expect(existsSync(join(root, 'public', m[1])), m[1]).toBe(true);
    }
  });
});
