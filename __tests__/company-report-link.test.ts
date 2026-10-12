/**
 * 기업 해부 각 편 화면의 「보고서 원문 보기」.
 *
 * 원문 HTML 은 `scripts/sync_industry_report_html.py` 가 docs/evidence/company-<key>-<판>/보고서.html 에서
 * public/reports/company/<key>.html 로 **바이트 그대로** 복사한다. 원문을 고치면 다시 돌려야 하고, 잊으면 여기서 죽는다.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CompanyAnatomyDashboard, { COMPANY_CARDS } from '@/components/market-understanding/CompanyAnatomyDashboard';

const root = process.cwd();
const evidence = readdirSync(join(root, 'docs/evidence')).filter((d) => d.startsWith('company-'));
const KEYS = COMPANY_CARDS.map((c) => c.key);

describe('기업 보고서 원문 사본', () => {
  it.each(KEYS)('%s - public 사본이 docs/evidence 원문과 바이트까지 같다', (key) => {
    const dir = evidence.find((d) => d.replace(/^company-/, '').replace(/-\d{4}-\d{2}$/, '') === key);
    expect(dir, `docs/evidence/company-${key}-* 없음`).toBeTruthy();
    const copy = join(root, `public/reports/company/${key}.html`);
    expect(existsSync(copy), copy).toBe(true);
    expect(readFileSync(copy).equals(readFileSync(join(root, 'docs/evidence', dir!, '보고서.html')))).toBe(true);
  });
});

describe('기업 해부 화면', () => {
  it.each(['frinsa', 'sojitz', 'nesi'])('%s - 히어로 아래 30초 브리핑 앞에 원문 보기 새 탭 링크가 한 번 있다', (key) => {
    const html = renderToStaticMarkup(React.createElement(CompanyAnatomyDashboard, { initialCompany: key }));
    const link = `<a href="/reports/company/${key}.html" target="_blank" rel="noopener noreferrer">보고서 원문 보기</a>`;
    expect(html).toContain(link);
    expect(html.split('보고서 원문 보기').length - 1).toBe(1);
    expect(html.indexOf(link)).toBeLessThan(html.indexOf('30초 브리핑'));
  });

  it('회사 선택 갤러리에는 원문 링크가 없다', () => {
    const html = renderToStaticMarkup(React.createElement(CompanyAnatomyDashboard));
    expect(html).not.toContain('보고서 원문 보기');
  });
});
