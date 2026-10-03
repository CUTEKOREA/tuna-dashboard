import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import path from 'node:path';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  access: { ok: true, status: 200, code: 'granted' },
  exists: vi.fn(), read: vi.fn(), list: vi.fn(),
}));
vi.mock('@/lib/auth/request-auth', () => ({ authorizeDashboardRequest: async () => mocks.access }));
vi.mock('fs', () => ({ default: { existsSync: mocks.exists, readFileSync: mocks.read, readdirSync: mocks.list } }));
import { GET } from '../app/api/atuna-daily/route';

const dataDir = path.join(process.cwd(), 'data/atuna_daily');
const request = (query = '') => new NextRequest(`https://dashboard.example/api/atuna-daily${query}`);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.access = { ok: true, status: 200, code: 'granted' };
  mocks.exists.mockImplementation((file: string) => file === dataDir || file.endsWith('2026-05-19.json') || file.endsWith('proof.json'));
  mocks.list.mockReturnValue(['2026-05-19.json', 'not-a-date.json']);
  mocks.read.mockReturnValue(JSON.stringify({ summary_kr: '정상 자료', market_signals: [] }));
});
afterEach(() => vi.restoreAllMocks());

describe('Atuna 날짜 파일 접근 경계', () => {
  it.each(['../../private/proof', '..\\private\\proof', '%2e%2e%2fprivate%2fproof', '%252e%252e%252fprivate', '2026-05-19/../../proof', '2026-05-19\0', '2026-02-30', '', '2026-05-19.json'])('잘못된 날짜 %s는 파일을 읽기 전에 거부한다', async (date) => {
    const response = await GET(request(`?date=${encodeURIComponent(date)}`));
    expect(response.status).toBe(400);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('URL에서 디코딩된 경로 순회와 중복 date도 거부한다', async () => {
    for (const query of ['?date=%2e%2e%2f%2e%2e%2fprivate%2fproof', '?date=2026-05-19&date=../../private/proof']) {
      expect((await GET(request(query))).status).toBe(400);
    }
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('정상 날짜와 기본 최근 자료 조회를 유지한다', async () => {
    const exact = await GET(request('?date=2026-05-19'));
    expect(exact.status).toBe(200);
    expect(await exact.json()).toMatchObject({ status: 'SYNCED', requested_date: '2026-05-19', data: { summary_kr: '정상 자료' } });
    expect(mocks.read).toHaveBeenCalledWith(path.join(dataDir, '2026-05-19.json'), 'utf-8');
    expect(await (await GET(request())).json()).toMatchObject({ requested_days: 7, available_dates: ['2026-05-19'] });
  });
  it('없는 정상 날짜는 404, 미인증은 자료 없이 401이다', async () => {
    expect((await GET(request('?date=2026-05-20'))).status).toBe(404);
    mocks.access = { ok: false, status: 401, code: 'authentication_required' };
    expect((await GET(request('?date=../../private/proof'))).status).toBe(401);
    expect(mocks.read).not.toHaveBeenCalled();
  });
});
