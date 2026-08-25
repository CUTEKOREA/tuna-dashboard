import { describe, expect, it } from 'vitest';

import {
  buildFleetEffectiveAllowlist,
  evaluateFleetAccess,
  parseFleetEmailAllowlist,
} from '@/lib/fleet/server-auth';

const CONFIRMED_USER = {
  id: 'fleet-user-1',
  email: 'operator@example.com',
  email_confirmed_at: '2026-08-16T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {},
};

describe('fleet detail server authorization', () => {
  it('normalizes only explicit fleet email allowlist entries', () => {
    expect(parseFleetEmailAllowlist(' Operator@Example.com, second@example.com, ')).toEqual(
      new Set(['operator@example.com', 'second@example.com']),
    );
    expect(buildFleetEffectiveAllowlist(
      'operator@example.com, fleet-only@example.com',
      'operator@example.com, mail-only@example.com',
    )).toEqual(new Set(['operator@example.com']));
  });

  it('returns 401 when the server cannot verify a user', () => {
    expect(evaluateFleetAccess(null, new Set())).toEqual({
      ok: false,
      status: 401,
      code: 'authentication_required',
    });
  });

  it('rejects unconfirmed, non-allowlisted, app admin, and user metadata role claims', () => {
    expect(evaluateFleetAccess(
      { ...CONFIRMED_USER, email_confirmed_at: undefined },
      new Set(['operator@example.com']),
    )).toEqual({ ok: false, status: 403, code: 'fleet_access_required' });
    expect(evaluateFleetAccess(CONFIRMED_USER, new Set())).toEqual({
      ok: false,
      status: 403,
      code: 'fleet_access_required',
    });
    expect(evaluateFleetAccess(
      { ...CONFIRMED_USER, app_metadata: { role: 'admin' } },
      new Set(),
    )).toEqual({ ok: false, status: 403, code: 'fleet_access_required' });
    expect(evaluateFleetAccess(
      { ...CONFIRMED_USER, user_metadata: { role: 'operations' } },
      new Set(),
    )).toEqual({ ok: false, status: 403, code: 'fleet_access_required' });
  });

  it('grants confirmed allowlisted users without a second authentication factor', () => {
    const allowlist = new Set(['operator@example.com']);
    expect(evaluateFleetAccess(CONFIRMED_USER, allowlist)).toEqual({
      ok: true,
      userId: 'fleet-user-1',
      email: 'operator@example.com',
    });
  });
});
