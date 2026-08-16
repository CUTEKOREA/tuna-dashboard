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

const ORIGINAL_OWNER = process.env.DASHBOARD_OWNER_EMAIL;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.DASHBOARD_OWNER_EMAIL = 'operator@example.com';
  mocks.getConfig.mockReturnValue({ url: 'https://example.supabase.co', anonKey: 'test-key' });
  mocks.getUser.mockResolvedValue({
    data: {
      user: {
        id: 'fleet-user-1',
        email: 'operator@example.com',
        email_confirmed_at: '2026-08-16T00:00:00.000Z',
        app_metadata: { provider: 'google', providers: ['google'] },
        identities: [{ provider: 'google' }],
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
  if (ORIGINAL_OWNER === undefined) delete process.env.DASHBOARD_OWNER_EMAIL;
  else process.env.DASHBOARD_OWNER_EMAIL = ORIGINAL_OWNER;
});

describe('fleet request authorization integration', () => {
  it('fails closed before contacting Supabase when the dashboard owner is missing', async () => {
    delete process.env.DASHBOARD_OWNER_EMAIL;

    await expect(authorizeFleetRequest()).resolves.toEqual({
      ok: false,
      status: 503,
      code: 'fleet_auth_unavailable',
    });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it('allows only the confirmed Google dashboard owner with AAL2', async () => {
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
          email: 'other@example.com',
          email_confirmed_at: '2026-08-16T00:00:00.000Z',
          app_metadata: { provider: 'google', providers: ['google'] },
          identities: [{ provider: 'google' }],
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

  it('accepts the owner when an existing email user is linked to Google', async () => {
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'fleet-user-1',
          email: 'operator@example.com',
          email_confirmed_at: '2026-08-16T00:00:00.000Z',
          app_metadata: { provider: 'email', providers: ['email', 'google'] },
          identities: [{ provider: 'email' }, { provider: 'google' }],
        },
      },
      error: null,
    });

    await expect(authorizeFleetRequest()).resolves.toEqual({
      ok: true,
      userId: 'fleet-user-1',
      email: 'operator@example.com',
      aal: 'aal2',
    });
  });

  it('rejects the owner when no Google identity is linked', async () => {
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'fleet-user-1',
          email: 'operator@example.com',
          email_confirmed_at: '2026-08-16T00:00:00.000Z',
          app_metadata: { provider: 'email', providers: ['email'] },
          identities: [{ provider: 'email' }],
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

  it('fails closed when another OAuth identity is also linked', async () => {
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'fleet-user-1',
          email: 'operator@example.com',
          email_confirmed_at: '2026-08-16T00:00:00.000Z',
          app_metadata: { provider: 'email', providers: ['email', 'google', 'github'] },
          identities: [{ provider: 'email' }, { provider: 'google' }, { provider: 'github' }],
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

  it('requires AAL2 after the dashboard owner check succeeds', async () => {
    mocks.getAal.mockResolvedValue({ data: { currentLevel: 'aal1' }, error: null });

    await expect(authorizeFleetRequest()).resolves.toEqual({
      ok: false,
      status: 403,
      code: 'mfa_required',
    });
  });
});
