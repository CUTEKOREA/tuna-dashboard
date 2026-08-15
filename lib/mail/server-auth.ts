import { isMailAdmin } from './admin-auth';

export interface ServerMailUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

type MailAccessDenied = {
  ok: false;
  status: 401 | 403;
  code: 'authentication_required' | 'admin_required' | 'mfa_required';
};

type MailAccessGranted = {
  ok: true;
  userId: string;
  email: string;
  aal: string;
};

export type MailAccessResult = MailAccessDenied | MailAccessGranted;

export function evaluateMailAccess(
  user: ServerMailUser | null,
  aal: string | null,
  allowlist: ReadonlySet<string>,
  requireAal2: boolean,
): MailAccessResult {
  if (!user) {
    return { ok: false, status: 401, code: 'authentication_required' };
  }

  const appRole = user.app_metadata?.role;
  if (!isMailAdmin({
    email: user.email,
    emailConfirmedAt: user.email_confirmed_at,
    appRole,
    userRole: user.user_metadata?.role,
  }, allowlist)) {
    return { ok: false, status: 403, code: 'admin_required' };
  }

  if (requireAal2 && aal !== 'aal2') {
    return { ok: false, status: 403, code: 'mfa_required' };
  }

  return {
    ok: true,
    userId: user.id,
    email: user.email?.trim().toLowerCase() ?? '',
    aal: aal ?? 'aal1',
  };
}
