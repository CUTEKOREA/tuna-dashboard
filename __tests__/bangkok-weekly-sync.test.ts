import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SYNC_SCRIPT = 'scripts/sync_bangkok_report.sh';

const SOURCE_FIXTURE = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>방콕 주간보고</title></head>
<body>
<header class="hero"><div class="wrap">
  <h1>방콕사무소 주간보고 종합분석</h1>
  <div class="sub">2020년 5월 27일 ~ 2026년 8월 12일 · 주간보고 292건(고유 287주)</div>
</div></header>
<nav class="toc"><a href="#summary">핵심 요약</a></nav>
<div class="wrap"><section id="summary">
  <div class="kpis">
    <div class="kpi"><div class="lab">분석 대상</div><div class="val">287주</div></div>
    <div class="kpi"><div class="lab">최신 시세</div><div class="val">$1,960</div></div>
    <div class="kpi"><div class="lab">방콕 재고</div><div class="val">117,400 MT</div></div>
    <div class="kpi"><div class="lab">가공가능일수</div><div class="val">44일</div></div>
    <div class="kpi"><div class="lab">2026 누적 하역</div><div class="val">326,005 MT</div></div>
    <div class="kpi"><div class="lab">하이솔트 확정액</div><div class="val">USD 14.2만</div></div>
  </div>
</section></div>
</body></html>`;

function runSync(input: string, htmlOutput: string, jsonOutput: string) {
  return spawnSync(
    'bash',
    [
      SYNC_SCRIPT,
      '--input', input,
      '--html-output', htmlOutput,
      '--json-output', jsonOutput,
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  );
}

describe('Bangkok weekly report sync', () => {
  it('extracts the six header KPIs and injects one idempotent dark override without changing the source', () => {
    const directory = mkdtempSync(join(tmpdir(), 'bangkok-weekly-sync-'));
    const input = join(directory, 'source.html');
    const firstHtml = join(directory, 'first.html');
    const firstJson = join(directory, 'first.json');
    const secondHtml = join(directory, 'second.html');
    const secondJson = join(directory, 'second.json');
    writeFileSync(input, SOURCE_FIXTURE, 'utf8');

    const first = runSync(input, firstHtml, firstJson);

    expect(first.status, first.stderr).toBe(0);
    expect(existsSync(firstHtml)).toBe(true);
    expect(existsSync(firstJson)).toBe(true);
    if (!existsSync(firstHtml) || !existsSync(firstJson)) return;

    expect(JSON.parse(readFileSync(firstJson, 'utf8'))).toEqual({
      period: '2020.05~2026.08',
      weeks: 287,
      latestPrice: 1960,
      stockMt: 117400,
      processDays: 44,
      cumUnloadMt: 326005,
      highSaltUsd: 142000,
    });

    const transformed = readFileSync(firstHtml, 'utf8');
    expect(transformed.match(/BEGIN:V25D_BANGKOK_DARK/g)).toHaveLength(1);
    expect(transformed).toContain('background: #0a0a0b');
    expect(transformed).toContain('background: rgba(24, 24, 27, 0.72)');
    expect(transformed).toContain('header.hero,');
    expect(transformed).toContain('#summary > .kpis');
    expect(transformed).toContain('display: none !important');
    expect(transformed).toContain('<nav class="toc">');
    expect(readFileSync(input, 'utf8')).toBe(SOURCE_FIXTURE);

    const second = runSync(firstHtml, secondHtml, secondJson);

    expect(second.status, second.stderr).toBe(0);
    expect(existsSync(secondHtml)).toBe(true);
    expect(existsSync(secondJson)).toBe(true);
    if (!existsSync(secondHtml) || !existsSync(secondJson)) return;
    expect(readFileSync(secondHtml, 'utf8')).toBe(transformed);
    expect(readFileSync(secondJson, 'utf8')).toBe(readFileSync(firstJson, 'utf8'));
  });

  it('fails closed without creating outputs when a required KPI is missing', () => {
    const directory = mkdtempSync(join(tmpdir(), 'bangkok-weekly-failure-'));
    const input = join(directory, 'source.html');
    const htmlOutput = join(directory, 'report.html');
    const jsonOutput = join(directory, 'kpi.json');
    writeFileSync(
      input,
      SOURCE_FIXTURE.replace(
        '<div class="kpi"><div class="lab">최신 시세</div><div class="val">$1,960</div></div>',
        '',
      ),
      'utf8',
    );

    const result = runSync(input, htmlOutput, jsonOutput);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('방콕 주간보고 동기화 실패');
    expect(result.stderr).toContain('최신 시세');
    expect(existsSync(htmlOutput)).toBe(false);
    expect(existsSync(jsonOutput)).toBe(false);
  });
});
