import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getConfig: vi.fn(),
  createClient: vi.fn(),
  getUser: vi.fn(),
  getAal: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/auth/supabase-request', () => ({
  getSupabaseRequestConfig: mocks.getConfig,
  createServerUserClient: mocks.createClient,
}));

import { authorizeFleetRequest } from '@/lib/fleet/request-auth';

const ORIGINAL_FLEET = process.env.FLEET_ALLOWED_EMAILS;
const ORIGINAL_MAIL = process.env.MAIL_ADMIN_EMAILS;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.FLEET_ALLOWED_EMAILS = 'operator@example.com,fleet-only@example.com';
  process.env.MAIL_ADMIN_EMAILS = 'operator@example.com,mail-only@example.com';
  mocks.getConfig.mockReturnValue({ url: 'https://example.supabase.co', anonKey: 'test-key' });
  mocks.getUser.mockResolvedValue({
    data: {
      user: {
        id: 'fleet-user-1',
        email: 'operator@example.com',
        email_confirmed_at: '2026-08-16T00:00:00.000Z',
      },
    },
    error: null,
  });
  mocks.getAal.mockResolvedValue({ data: { currentLevel: 'aal2' }, error: null });
  mocks.createClient.mockResolvedValue({
    auth: {
      getUser: mocks.getUser,
      mfa: { getAuthenticatorAssuranceLevel: mocks.getAal },
    },
  });
});

afterEach(() => {
  if (ORIGINAL_FLEET === undefined) delete process.env.FLEET_ALLOWED_EMAILS;
  else process.env.FLEET_ALLOWED_EMAILS = ORIGINAL_FLEET;
  if (ORIGINAL_MAIL === undefined) delete process.env.MAIL_ADMIN_EMAILS;
  else process.env.MAIL_ADMIN_EMAILS = ORIGINAL_MAIL;
});

describe('fleet request authorization integration', () => {
  it('fails closed before contacting Supabase when either allowlist is missing', async () => {
    delete process.env.MAIL_ADMIN_EMAILS;

    await expect(authorizeFleetRequest()).resolves.toEqual({
      ok: false,
      status: 503,
      code: 'fleet_auth_unavailable',
    });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it('allows only a confirmed AAL2 user in both administrator allowlists', async () => {
    await expect(authorizeFleetRequest()).resolves.toEqual({
      ok: true,
      userId: 'fleet-user-1',
      email: 'operator@example.com',
      aal: 'aal2',
    });

    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'fleet-user-2',
          email: 'fleet-only@example.com',
          email_confirmed_at: '2026-08-16T00:00:00.000Z',
        },
      },
      error: null,
    });
    await expect(authorizeFleetRequest()).resolves.toEqual({
      ok: false,
      status: 403,
      code: 'fleet_access_required',
    });
  });

  it('requires AAL2 after the administrator intersection succeeds', async () => {
    mocks.getAal.mockResolvedValue({ data: { currentLevel: 'aal1' }, error: null });

    await expect(authorizeFleetRequest()).resolves.toEqual({
      ok: false,
      status: 403,
      code: 'mfa_required',
    });
  });
});
