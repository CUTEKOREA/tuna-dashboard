import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT = join(process.cwd(), 'scripts', 'check_fleet_client_leak.mjs');
const temporaryDirectories: string[] = [];

function createWorkspace() {
  const workspace = mkdtempSync(join(tmpdir(), 'fleet-client-leak-'));
  temporaryDirectories.push(workspace);
  mkdirSync(join(workspace, '.next', 'static'), { recursive: true });
  writeFileSync(join(workspace, '.next', 'static', 'app.js'), 'public aggregate only', 'utf8');
  return workspace;
}

function runCheck(workspace: string, ...args: string[]) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: workspace,
    encoding: 'utf8',
    env: { ...process.env, FLEET_DAILY_DETAIL_JSON: '' },
  });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('fleet client leak script', () => {
  it('fails closed when no private evidence is available', () => {
    const workspace = createWorkspace();
    const result = runCheck(workspace);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('보호 상세 증거가 없어');
  });

  it('allows an explicit synthetic contract check for secretless CI', () => {
    const workspace = createWorkspace();
    const result = runCheck(workspace, '--allow-synthetic');

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('합성 경계 증거');
  });

  it('rejects parsed private evidence that contains no protected tokens', () => {
    const workspace = createWorkspace();
    mkdirSync(join(workspace, 'artifacts'), { recursive: true });
    writeFileSync(join(workspace, 'artifacts', 'fleet-daily-detail.json'), '{}', 'utf8');

    const result = runCheck(workspace);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('검사할 토큰을 찾지 못했습니다');
  });

  it('detects protected coordinates, notes, and plans without source exceptions', () => {
    const workspace = createWorkspace();
    const detail = {
      latest: {
        pacific: { vessels: [{ position: 'N0001 E00001 (QA)', note: '시험 보호 비고' }] },
        atlantic: { vessels: [] },
        carrier: { vessels: [{ loadPlan: '시험 보호 일정', note: '-' }] },
        longline: { vessels: [] },
      },
    };
    mkdirSync(join(workspace, 'artifacts'), { recursive: true });
    writeFileSync(join(workspace, 'artifacts', 'fleet-daily-detail.json'), JSON.stringify(detail), 'utf8');
    writeFileSync(
      join(workspace, '.next', 'static', 'app.js'),
      'N0001 E00001 (QA) 시험 보호 비고 시험 보호 일정',
      'utf8',
    );

    const result = runCheck(workspace);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('3개 보호 토큰');
  });
});
