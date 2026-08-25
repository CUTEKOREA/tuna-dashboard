export interface FleetServerUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

type FleetAccessDenied = {
  ok: false;
  status: 401 | 403 | 503;
  code: 'authentication_required' | 'fleet_access_required' | 'fleet_auth_unavailable';
};

type FleetAccessGranted = {
  ok: true;
  userId: string;
  email: string;
};

export type FleetAccessResult = FleetAccessDenied | FleetAccessGranted;

export function parseFleetEmailAllowlist(value: string | undefined): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function buildFleetEffectiveAllowlist(
  fleetValue: string | undefined,
  mailValue: string | undefined,
): Set<string> {
  const fleet = parseFleetEmailAllowlist(fleetValue);
  const mail = parseFleetEmailAllowlist(mailValue);
  return new Set([...fleet].filter((email) => mail.has(email)));
}

export function evaluateFleetAccess(
  user: FleetServerUser | null,
  allowlist: ReadonlySet<string>,
): FleetAccessResult {
  if (!user) {
    return { ok: false, status: 401, code: 'authentication_required' };
  }

  const email = user.email?.trim().toLowerCase();
  if (!email || !user.email_confirmed_at || !allowlist.has(email)) {
    return { ok: false, status: 403, code: 'fleet_access_required' };
  }
  return { ok: true, userId: user.id, email };
}
