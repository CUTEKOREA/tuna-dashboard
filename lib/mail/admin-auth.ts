export interface MailAdminIdentity {
  email?: string | null;
  emailConfirmedAt?: string | null;
  appRole?: unknown;
  userRole?: unknown;
}

export function parseAdminEmailAllowlist(value: string | undefined): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isMailAdmin(
  identity: MailAdminIdentity,
  allowlist: ReadonlySet<string>,
): boolean {
  if (!identity.emailConfirmedAt) return false;
  const email = identity.email?.trim().toLowerCase();
  if (!email) return false;
  if (identity.appRole === 'admin') return true;

  return allowlist.has(email);
}
