import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, 'scripts', 'audit_api_cache_policy.mjs');

async function writeRoute(apiDir: string, route: string, source: string) {
  const routeDir = path.join(apiDir, ...route.split('/'));
  await mkdir(routeDir, { recursive: true });
  await writeFile(path.join(routeDir, 'route.ts'), source, 'utf8');
}

async function makeApiDir() {
  const dir = await mkdtemp(path.join(tmpdir(), 'api-cache-policy-'));
  const apiDir = path.join(dir, 'api');
  await mkdir(apiDir, { recursive: true });
  return apiDir;
}

describe('api cache policy audit script', () => {
  it('passes when the explicit cache policy count meets the floor', async () => {
    const apiDir = await makeApiDir();
    await writeRoute(apiDir, 'fresh', "export const revalidate = 300;\nexport async function GET() {}\n");
    await writeRoute(apiDir, 'live', "export const dynamic = 'force-dynamic';\nexport async function GET() {}\n");
    await writeRoute(apiDir, 'legacy', "export async function GET() { return Response.json({ ok: true }); }\n");

    const { stdout } = await execFileAsync(process.execPath, [
      SCRIPT_PATH,
      '--api-dir',
      apiDir,
      '--min-explicit-policy',
      '2',
    ]);

    expect(stdout).toContain('API cache policy OK');
    expect(stdout).toContain('2/3');
  });

  it('fails with missing route samples when the floor is not met', async () => {
    const apiDir = await makeApiDir();
    await writeRoute(apiDir, 'fresh', "export const revalidate = 300;\nexport async function GET() {}\n");
    await writeRoute(apiDir, 'legacy', "export async function GET() { return Response.json({ ok: true }); }\n");

    await expect(execFileAsync(process.execPath, [
      SCRIPT_PATH,
      '--api-dir',
      apiDir,
      '--min-explicit-policy',
      '2',
    ])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('/api/legacy'),
    });
  });
});
