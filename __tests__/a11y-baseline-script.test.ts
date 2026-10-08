import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const SCRIPT_PATH = path.join(process.cwd(), 'scripts', 'check_a11y_baseline.mjs');

async function writeJson(dir: string, name: string, value: unknown) {
  const file = path.join(dir, name);
  await writeFile(file, JSON.stringify(value), 'utf8');
  return file;
}

describe('a11y baseline gate script', () => {
  it('passes its assert-based self-test (증가·감소·새 화면·오류)', async () => {
    const { stdout } = await execFileAsync(process.execPath, [SCRIPT_PATH, '--self-test']);
    expect(stdout).toContain('자체 점검 통과');
  });

  it('fails with route · rule · delta when serious nodes grow', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'a11y-baseline-'));
    const baseline = await writeJson(dir, 'baseline.json', {
      themes: { light: { '/market': { critical: 0, serious: 2, moderate: 0, minor: 0, rules: { 'color-contrast': { impact: 'serious', nodes: 2 } } } } },
    });
    const report = await writeJson(dir, 'report.json', {
      meta: { theme: 'light' },
      results: [{ route: '/market', viewport: 'desktop', violations: [{ id: 'color-contrast', impact: 'serious', nodes: 5 }] }],
    });

    await expect(
      execFileAsync(process.execPath, [SCRIPT_PATH, '--baseline', baseline, '--report', report], { env: { ...process.env, GITHUB_STEP_SUMMARY: '' } }),
    ).rejects.toMatchObject({ code: 1, stdout: expect.stringContaining('/market · color-contrast (serious) 2 → 5  (+3)') });
  });
});
