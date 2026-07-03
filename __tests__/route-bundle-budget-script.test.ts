import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'check_route_bundle_budget.mjs');

async function writeStatsFile(entries: unknown[]) {
  const dir = await mkdtemp(path.join(tmpdir(), 'route-bundle-budget-'));
  const statsPath = path.join(dir, 'route-bundle-stats.json');
  await writeFile(statsPath, JSON.stringify(entries, null, 2), 'utf8');
  return statsPath;
}

describe('route bundle budget script', () => {
  it('passes when every route stays within the configured first-load budget', async () => {
    const statsPath = await writeStatsFile([
      { route: '/', firstLoadUncompressedJsBytes: 900_000, firstLoadChunkPaths: [] },
      { route: '/[category]', firstLoadUncompressedJsBytes: 650_000, firstLoadChunkPaths: [] },
    ]);

    const { stdout } = await execFileAsync(process.execPath, [
      SCRIPT_PATH,
      '--stats',
      statsPath,
      '--max-route-bytes',
      '1000000',
      '--max-category-bytes',
      '700000',
    ]);

    expect(stdout).toContain('Bundle budget OK');
    expect(stdout).toContain('/[category]');
  });

  it('fails with route details when a route exceeds the budget', async () => {
    const statsPath = await writeStatsFile([
      { route: '/heavy', firstLoadUncompressedJsBytes: 1_250_000, firstLoadChunkPaths: [] },
    ]);

    await expect(execFileAsync(process.execPath, [
      SCRIPT_PATH,
      '--stats',
      statsPath,
      '--max-route-bytes',
      '1000000',
    ])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('/heavy'),
    });
  });
});
