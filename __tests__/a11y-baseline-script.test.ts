import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'check_a11y_baseline.mjs');
const ENV = { ...process.env, GITHUB_STEP_SUMMARY: '', GITHUB_RUN_ID: '' };

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];
const META = { axeVersion: '4.13.0', tags: ['wcag2a', 'wcag2aa', 'wcag21aa'], viewports: VIEWPORTS };

type Violation = { id: string; impact: string; nodes: number };
type Result = { route: string; viewport: string; violations?: Violation[]; skipped?: string };

const cc = (impact: string, nodes: number): Violation[] => [{ id: 'color-contrast', impact, nodes }];
const report = (results: Result[], meta: Record<string, unknown> = {}) => ({ meta: { ...META, theme: 'light', ...meta }, results });
const both = (route: string, desktop: Violation[], mobile: Violation[] = desktop): Result[] => [
  { route, viewport: 'desktop', violations: desktop },
  { route, viewport: 'mobile', violations: mobile },
];

async function writeJson(dir: string, name: string, value: unknown) {
  const file = path.join(dir, name);
  await writeFile(file, JSON.stringify(value), 'utf8');
  return file;
}

function run(args: string[]) {
  return execFileAsync(process.execPath, [SCRIPT_PATH, ...args], { env: ENV });
}

// 리포트로 기준선을 만든 뒤 다른 리포트를 비교한다
async function gate(baseResults: Result[], nowResults: Result[], nowMeta: Record<string, unknown> = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), 'a11y-baseline-'));
  const baseline = path.join(dir, 'baseline.json');
  await run(['--update', '--baseline', baseline, '--report', await writeJson(dir, 'base.json', report(baseResults))]);
  const now = await writeJson(dir, 'now.json', report(nowResults, nowMeta));
  return { dir, baseline, compare: () => run(['--baseline', baseline, '--report', now]) };
}

describe('a11y baseline gate script', () => {
  it('passes its assert-based self-test', async () => {
    const { stdout } = await run(['--self-test']);
    expect(stdout).toContain('자체 점검 통과');
  });

  it('passes when every theme · route · viewport · rule · impact matches', async () => {
    const g = await gate(both('/market', cc('serious', 2)), both('/market', cc('serious', 2)));
    await expect(g.compare()).resolves.toMatchObject({ stdout: expect.stringContaining('접근성 기준선 OK') });
  });

  it('fails with route · viewport · rule · delta when serious nodes grow', async () => {
    const g = await gate(both('/market', cc('serious', 2)), both('/market', cc('serious', 5), cc('serious', 2)));
    await expect(g.compare()).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining('/market · desktop · color-contrast (serious) 2 → 5  (+3)') });
  });

  it('does not let desktop 3→2 and mobile 2→3 cancel out', async () => {
    const g = await gate(both('/market', cc('serious', 3), cc('serious', 2)), both('/market', cc('serious', 2), cc('serious', 3)));
    await expect(g.compare()).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining('/market · mobile · color-contrast (serious) 2 → 3  (+1)') });
  });

  it('fails when a viewport result is missing or the whole baseline route is missing', async () => {
    const missingMobile = await gate(both('/market', cc('serious', 2)), [{ route: '/market', viewport: 'desktop', violations: cc('serious', 2) }]);
    await expect(missingMobile.compare()).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining('/market 뷰포트 측정 누락: mobile') });

    const missingRoute = await gate([...both('/market', []), ...both('/fleet', [])], both('/fleet', []));
    await expect(missingRoute.compare()).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining('기준선 화면 /market 이 측정되지 않았습니다(리포트에 없음)') });
  });

  it('fails when the same node count is promoted serious → critical', async () => {
    const g = await gate(both('/market', cc('serious', 3)), both('/market', cc('critical', 3), cc('serious', 3)));
    await expect(g.compare()).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining('/market · desktop · color-contrast (critical) 0 → 3  (+3)') });
  });

  it('ratchets 5 → 3 → 5: a decrease fails until the baseline is lowered, then 5 fails again', async () => {
    const g = await gate(both('/market', cc('serious', 5)), both('/market', cc('serious', 3)));
    await expect(g.compare()).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining('a11y-baseline-candidate') });

    // 기준선 낮추기(= CI 후보 생성과 같은 명령)
    const three = await writeJson(g.dir, 'three.json', report(both('/market', cc('serious', 3))));
    await run(['--update', '--baseline', g.baseline, '--report', three]);
    const lowered = JSON.parse(await readFile(g.baseline, 'utf8'));
    expect(lowered.themes.light['/market'].desktop.rules['color-contrast'].serious).toBe(3);
    await expect(run(['--baseline', g.baseline, '--report', three])).resolves.toMatchObject({ stdout: expect.stringContaining('접근성 기준선 OK') });

    const five = await writeJson(g.dir, 'five.json', report(both('/market', cc('serious', 5))));
    await expect(run(['--baseline', g.baseline, '--report', five])).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining('(serious) 3 → 5  (+2)') });
    // --update 로 회귀를 기준선에 묻지 못한다
    await expect(run(['--update', '--baseline', g.baseline, '--report', five])).rejects.toMatchObject({ code: 1, stderr: expect.stringContaining('높아지는 키 2개') });
  });

  it('fails when report meta (axe version · tags · viewports · theme) differs from the baseline', async () => {
    const rows = both('/market', cc('serious', 2));
    for (const [meta, msg] of [
      [{ axeVersion: '4.14.0' }, 'axe 버전 4.13.0 ≠ 리포트 4.14.0'],
      [{ tags: ['wcag2a'] }, '태그'],
      [{ viewports: [VIEWPORTS[0], { name: 'mobile', width: 375, height: 667 }] }, 'mobile 390×844 ≠ 리포트'],
      [{ theme: 'dark' }, '기준선에 이 테마가 없습니다'],
    ] as const) {
      const g = await gate(rows, rows, meta);
      await expect(g.compare()).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining(msg) });
    }
  });

  it('round-trips the CI log block with --decode', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'a11y-baseline-'));
    const out = path.join(dir, 'candidate.json');
    const rep = await writeJson(dir, 'r.json', report(both('/market', cc('serious', 2))));
    const { stdout } = await run(['--update', '--print', '--baseline', path.join(dir, 'none.json'), '--out', out, '--report', rep]);
    const log = stdout.split('\n').map((l) => `2026-10-08T15:18:55.5493693Z ${l}`).join('\n');
    const logFile = path.join(dir, 'job.log');
    await writeFile(logFile, log, 'utf8');
    const decoded = path.join(dir, 'decoded.json');
    await run(['--decode', logFile, '--out', decoded]);
    expect(JSON.parse(await readFile(decoded, 'utf8'))).toEqual(JSON.parse(await readFile(out, 'utf8')));
  });
});
