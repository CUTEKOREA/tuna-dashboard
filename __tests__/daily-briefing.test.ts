import React from 'react';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import MarketDashboard from '../components/MarketDashboard';

const fixture = join(
  process.cwd(),
  '__tests__/fixtures/참치뉴스_게시판용_2026-08-13.html',
);
const temporaryDirectories: string[] = [];

function makeTemporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'tuna-daily-briefing-test-'));
  temporaryDirectories.push(directory);
  return directory;
}

function runSyncScript(args: string[]) {
  return spawnSync('python3', ['scripts/sync_daily_briefing.py', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

function countOccurrences(value: string, token: string): number {
  return value.split(token).length - 1;
}

function textByTestId(markup: string, testId: string): string | undefined {
  const pattern = new RegExp(
    `data-testid="${testId}"[^>]*>([\\s\\S]*?)<\\/span>`,
  );
  return pattern.exec(markup)?.[1].replace(/<[^>]+>/g, '');
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('daily tuna briefing sync', () => {
  it('selects the latest filename date and restores legacy HTML entities', () => {
    const root = makeTemporaryDirectory();
    const sourceDirectory = join(root, 'source');
    const output = join(root, 'tuna_daily_briefing.json');
    mkdirSync(sourceDirectory);
    copyFileSync(fixture, join(sourceDirectory, '참치뉴스_게시판용_2026-08-12.html'));
    copyFileSync(fixture, join(sourceDirectory, '참치뉴스_게시판용_2026-08-13.html'));

    const result = runSyncScript(['--source-dir', sourceDirectory, '--output', output]);

    expect(result.status, result.stderr).toBe(0);
    const briefing = JSON.parse(readFileSync(output, 'utf8'));
    expect(briefing.date).toBe('2026-08-13');
    expect(briefing.digest.length).toBeGreaterThanOrEqual(3);
    expect(briefing.articles.length).toBeGreaterThanOrEqual(3);
    expect(briefing.digest[0].title).toBe(
      '동원그룹 상반기 매출 5조 1,000억원, 9.1% 증가 — 수산 부문이 견인',
    );
    expect(briefing.articles[0]).toEqual({
      titleKo: '동원그룹 상반기 매출 증가, 수산 부문이 견인',
      titleEn: 'Dongwon Group Reports Higher Turnover',
      paragraphs: [
        '동원그룹이 참치를 포함한 수산 부문의 실적 개선에 힘입어 올해 상반기 매출이 늘었다고 밝혔다.',
        '동원그룹은 2026년 상반기 매출 5조 1,000억원을 기록해 전년 대비 9.1% 늘었다.',
      ],
    });
    expect(briefing.articles[1].paragraphs[1]).toContain('−16%');
  });

  it('fails clearly without creating an output file when required blocks are missing', () => {
    const root = makeTemporaryDirectory();
    const input = join(root, '참치뉴스_게시판용_2026-08-13.html');
    const output = join(root, 'tuna_daily_briefing.json');
    writeFileSync(input, '<html><body><b>헤드라인만 있음</b></body></html>', 'utf8');

    const result = runSyncScript(['--input', input, '--output', output]);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('브리핑 동기화 실패');
    expect(existsSync(output)).toBe(false);
  });
});

describe('daily tuna briefing widget', () => {
  it('renders the synced date and first digest headline on the market dashboard', () => {
    const markup = renderToStaticMarkup(React.createElement(MarketDashboard));

    expect(markup).toContain('오늘의 참치 뉴스 · 2026.08.13');
    expect(markup).toContain(
      '동원그룹 상반기 매출 5조 1,000억원, 9.1% 증가 — 수산 부문이 견인',
    );
    expect(markup).toContain('>SYNCED<');
    expect(markup).toContain('data-testid="daily-briefing-articles"');
    expect(markup).not.toContain('저가 수요는 견고하지만 관세 부담은 공급망 안에서 재배분');
    expect(markup).not.toContain('태국 원어 수요 둔화와 연승선 투명성 요구를 동시에 관리');
  });

  it('renders five digest items and five article accordions closed by default', () => {
    const markup = renderToStaticMarkup(React.createElement(MarketDashboard));

    expect(
      countOccurrences(markup, 'data-testid="daily-briefing-digest-item"'),
    ).toBe(5);
    expect(
      countOccurrences(markup, 'data-testid="daily-briefing-article"'),
    ).toBe(5);
    expect(markup).not.toMatch(/<details[^>]*\sopen(?:=|>)/);
    expect(markup).not.toContain('Dongwon Group Reports Higher Turnover');
  });

  it('uses the top two digest titles and an exact article directive for SIT and TAK', () => {
    const markup = renderToStaticMarkup(React.createElement(MarketDashboard));

    expect(textByTestId(markup, 'daily-briefing-sit')).toBe(
      '동원그룹 상반기 매출 5조 1,000억원, 9.1% 증가 — 수산 부문이 견인. ' +
      '태국 캔참치 상반기 수출 250,887 M/T, 대미 16% 감소 — 호르무즈 여파로 중동 엇갈려.',
    );
    expect(textByTestId(markup, 'daily-briefing-tak')).toBe(
      '시장자문위원회(MAC)는 참치·수산물 기업의 비례성, 법적 확실성, 그리고 더 높은 시장 안정성을 확보하도록 EU 집행위에 플랫폼 안정화와 시행 정합성 개선을 촉구했다.',
    );
  });
});
