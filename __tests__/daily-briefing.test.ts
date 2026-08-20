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
import { dailyBriefing, buildDailyBriefingTakeaways } from '../lib/data/daily-briefing';

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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\'', '&#x27;');
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
  // 데이터는 매일 sync로 갱신된다 — 특정 날짜의 문구를 고정하지 말고
  // lib/data/daily-briefing.ts 가 노출하는 현재 데이터에서 기대값을 유도한다.
  // 2026-08-17 r5-A 채택: 신문 1면형(NewsFrontPage)이 데일리 브리핑 위젯을 대체
  it('renders the front-page news with date line and lead headline on the market dashboard', () => {
    const markup = renderToStaticMarkup(React.createElement(MarketDashboard));
    const displayDate = dailyBriefing.date.replaceAll('-', '.');

    expect(markup).toContain('오늘의 참치 뉴스');
    expect(markup).toContain(`기준일 ${displayDate}`);
    expect(markup).toContain(escapeHtml(dailyBriefing.articles[0].titleKo));
    expect(markup).not.toContain('저가 수요는 견고하지만 관세 부담은 공급망 안에서 재배분');
    expect(markup).not.toContain('태국 원어 수요 둔화와 연승선 투명성 요구를 동시에 관리');
  });

  it('renders every article headline with full text collapsed by default', () => {
    const markup = renderToStaticMarkup(React.createElement(MarketDashboard));

    // 신문 1면형: 리드 1건 + 나머지 기사 전부 제목·첫 문장 상시 노출, 전문은 클릭 펼침
    for (const article of dailyBriefing.articles) {
      expect(markup).toContain(escapeHtml(article.titleKo));
    }
    expect(markup).toContain('계속 읽기');
    // 기본 상태에서 리드 2번째 문단(전문)은 미노출
    const leadSecond = dailyBriefing.articles[0].paragraphs[1];
    if (leadSecond) expect(markup).not.toContain(escapeHtml(leadSecond));
    expect(dailyBriefing.articles.length).toBeGreaterThanOrEqual(3);
  });

});

describe('기사 인포그래픽 이미지', () => {
  // 이미지는 옵셔널이다 — 그날 매칭되는 그림이 없는 기사가 정상적으로 존재한다.
  // 다만 붙어 있다면 아래 두 가지는 반드시 참이어야 한다.
  const withImage = dailyBriefing.articles.filter((a) => a.image);

  it('이미지 경로는 그 회차 폴더의 webp 를 가리킨다', () => {
    for (const article of withImage) {
      expect(article.image).toMatch(
        new RegExp(`^/data/briefing/${dailyBriefing.date}/.+\\.webp$`),
      );
    }
  });

  it('같은 그림이 두 기사에 붙지 않는다', () => {
    // 한 그림이 두 기사에 붙으면 둘 중 하나는 그 기사의 그림이 아니다.
    // 독자에게는 근거로 보이므로 무-창작 위반이 된다.
    const paths = withImage.map((a) => a.image);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
