const PUBLIC_SUPABASE_MFA_CODES = new Set([
  'validation_failed',
  'too_many_enrolled_mfa_factors',
  'mfa_factor_name_conflict',
  'mfa_factor_not_found',
  'insufficient_aal',
  'mfa_totp_enroll_not_enabled',
  'mfa_verified_factor_exists',
]);

export function getMfaDiagnosticCode(stage: string, error: unknown): string {
  if (!error || typeof error !== 'object' || !('code' in error)) return stage;
  const providerCode = (error as { code?: unknown }).code;
  return typeof providerCode === 'string' && PUBLIC_SUPABASE_MFA_CODES.has(providerCode)
    ? `${stage}:${providerCode}`
    : stage;
}
