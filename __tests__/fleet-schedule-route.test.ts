import React from 'react';
import { existsSync, readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ authorize: vi.fn(), getSchedule: vi.fn() }));
vi.mock('@/lib/fleet/request-auth', () => ({ authorizeFleetRequest: mocks.authorize }));
vi.mock('@/lib/data/fleet-port-schedule', () => ({ getFleetPortSchedule: mocks.getSchedule }));

import { GET } from '@/app/api/fleet/schedule/route';
import { FleetPortScheduleTable } from '@/components/FleetPortSchedule';
import { validateFleetPortSchedule } from '@/lib/contracts/fleet-port-schedule';

const SCHEDULE = {
  asOf: '2026-10-07',
  printedDate: '2027. 10. 7. (화)',
  source: { file: '선박 입항일정 및 선원 교대/선박 수리 계획', sha256: 'f'.repeat(64) },
  rows: [
    { vessel: 'MARI', loadedMt: 0, port: '젠산', eta: '10/2', etd: '10/11', observerChange: true, crewOn: ['2기사'], crewOff: ['3기사'], repair: '도킹 수리 작업' },
    { vessel: 'KONA', loadedMt: 435, port: null, eta: null, etd: null, observerChange: false, crewOn: ['갑판'], crewOff: [], repair: null },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authorize.mockResolvedValue({ ok: true, userId: 'u1', email: 'operator@example.com' });
  mocks.getSchedule.mockReturnValue(SCHEDULE);
});

describe('/api/fleet/schedule GET', () => {
  it.each([[401, 'authentication_required'], [403, 'fleet_access_required']] as const)(
    'returns %s %s without loading private data', async (status, code) => {
      mocks.authorize.mockResolvedValue({ ok: false, status, code });
      const response = await GET();
      expect(response.status).toBe(status);
      expect(response.headers.get('cache-control')).toBe('private, no-store, max-age=0');
      expect(response.headers.get('vary')).toContain('Cookie');
      await expect(response.json()).resolves.toEqual({ ok: false, code });
      expect(mocks.getSchedule).not.toHaveBeenCalled();
    });

  it('returns the schedule to an allowlisted user', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    await expect(response.json()).resolves.toEqual({ ok: true, schedule: SCHEDULE });
  });

  it('fails closed when the env payload is absent or invalid', async () => {
    mocks.getSchedule.mockImplementation(() => { throw new Error('missing'); });
    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ ok: false, code: 'fleet_data_unavailable' });
  });
});

describe('입항 일정 계약', () => {
  it('선원 교대 칸에 실명(영문·한글 이름+직책)이 들어오면 거부한다', () => {
    expect(() => validateFleetPortSchedule(SCHEDULE)).not.toThrow();
    const withName = structuredClone(SCHEDULE);
    withName.rows[0].crewOn = ['2기사 DUKIMAN KOSIM'];
    expect(() => validateFleetPortSchedule(withName)).toThrow();
  });

  it('표가 미정·교체·직책 인원을 그린다', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetPortScheduleTable, { schedule: SCHEDULE }));
    for (const s of ['MARI', '젠산', '10/11', '교체', '승선 1명: 2기사 / 하선 1명: 3기사', '도킹 수리 작업', '미정']) expect(markup).toContain(s);
  });

  it('로컬 원본(artifacts, git 제외)이 있으면 계약을 통과한다', () => {
    const path = 'artifacts/fleet-port-schedule.json';
    if (!existsSync(path)) return; // CI 에는 없다 - 공개 저장소라 값은 env 로만 배포한다
    const schedule = validateFleetPortSchedule(JSON.parse(readFileSync(path, 'utf8')));
    expect(schedule.rows.length).toBeGreaterThan(0);
  });
});
