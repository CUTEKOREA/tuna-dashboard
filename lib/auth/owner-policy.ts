export type OwnerAccessCode =
  | 'authentication_required'
  | 'configuration_required'
  | 'google_account_required'
  | 'owner_required';

export type OwnerAccessResult =
  | {
      ok: true;
      email: string;
      subject: string;
    }
  | {
      ok: false;
      status: 401 | 403 | 503;
      code: OwnerAccessCode;
    };

export interface DashboardOwnerClaims {
  sub?: unknown;
  email?: unknown;
  role?: unknown;
  is_anonymous?: unknown;
  amr?: unknown;
  app_metadata?: {
    provider?: unknown;
    providers?: unknown;
  } | null;
}

export interface DashboardOwnerUser {
  id?: unknown;
  email?: unknown;
  email_confirmed_at?: unknown;
  app_metadata?: {
    provider?: unknown;
    providers?: unknown;
  } | null;
  identities?: Array<{ provider?: unknown }> | null;
}

const PUBLIC_AUTH_PATHS = new Set([
  '/auth/callback',
  '/auth/start',
  '/login',
  '/mail/login',
]);

const PUBLIC_SERVICE_PATHS = new Set([
  '/api/webhooks/unloading',
  // 주간 브리핑 cron — 라우트 내부에서 CRON_SECRET(Bearer, 32자+ timingSafeEqual) 자체 검증
  '/api/cron/weekly-briefing',
  // 로그아웃 상태의 기존 서비스워커도 새 버전을 받아 과거 캐시를 삭제해야 한다.
  '/sw.js',
]);

const DEFAULT_NEXT_PATH = '/market';

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function hasOnlyGoogleOrEmailProviders(
  metadata: DashboardOwnerClaims['app_metadata'],
): boolean {
  const providers: unknown[] = [];
  if (metadata?.provider !== undefined) providers.push(metadata.provider);
  if (metadata?.providers !== undefined) {
    if (!Array.isArray(metadata.providers)) return false;
    providers.push(...metadata.providers);
  }
  if (providers.length === 0) return false;

  const normalized = providers.map((provider) => (
    typeof provider === 'string' ? provider.trim().toLowerCase() : ''
  ));
  return normalized.includes('google')
    && normalized.every((provider) => provider === 'google' || provider === 'email');
}

function hasOAuthAuthenticationMethod(amr: unknown): boolean {
  if (!Array.isArray(amr)) return false;
  return amr.some((entry) => {
    if (typeof entry === 'string') return entry.trim().toLowerCase() === 'oauth';
    if (!entry || typeof entry !== 'object' || !('method' in entry)) return false;
    const method = (entry as { method?: unknown }).method;
    return typeof method === 'string' && method.trim().toLowerCase() === 'oauth';
  });
}

function hasGoogleIdentity(user: DashboardOwnerUser): boolean {
  if (!hasOnlyGoogleOrEmailProviders(user.app_metadata) || !Array.isArray(user.identities)) {
    return false;
  }
  const providers = user.identities.map((identity) => (
    typeof identity.provider === 'string' ? identity.provider.trim().toLowerCase() : ''
  ));
  return providers.length > 0
    && providers.includes('google')
    && providers.every((provider) => provider === 'google' || provider === 'email');
}

// 쉼표 구분 복수 이메일 허용 (예: "a@x.com,b@y.com"). 빈 항목은 무시하되
// 형식이 틀린 항목이 하나라도 있으면 전체를 무효로 본다 — 오타로 몰래 잠기거나
// 열리는 대신 configuration_required(503)로 fail-closed.
export function parseDashboardOwnerEmails(value: string | undefined): string[] | null {
  if (typeof value !== 'string') return null;
  const entries = value.split(',').map(normalizeEmail).filter((entry) => entry !== '');
  if (entries.length === 0) return null;
  const valid = entries.every((entry) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry));
  return valid ? entries : null;
}

// 운영 소유자(DASHBOARD_OWNER_EMAIL)에 추가 허용 계정(DASHBOARD_ALLOWED_EMAILS,
// 쉼표 구분)을 병합한 설정 문자열. 소유자 변수가 비어 있으면 추가 목록만으로는
// 절대 열리지 않는다 (fail-closed) — 소유자 등록이 항상 선행 조건.
export function dashboardOwnerEmailConfig(): string | undefined {
  const owner = process.env.DASHBOARD_OWNER_EMAIL;
  if (typeof owner !== 'string' || owner.trim() === '') return undefined;
  const extra = process.env.DASHBOARD_ALLOWED_EMAILS;
  if (typeof extra === 'string' && extra.trim() !== '') return `${owner},${extra}`;
  return owner;
}

export function evaluateDashboardOwnerClaims(
  claims: DashboardOwnerClaims | null,
  configuredOwnerEmail: string | undefined,
): OwnerAccessResult {
  const ownerEmails = parseDashboardOwnerEmails(configuredOwnerEmail);
  if (!ownerEmails) {
    return { ok: false, status: 503, code: 'configuration_required' };
  }
  if (
    !claims
    || claims.role !== 'authenticated'
    || claims.is_anonymous === true
    || typeof claims.sub !== 'string'
    || !claims.sub
  ) {
    return { ok: false, status: 401, code: 'authentication_required' };
  }

  const email = normalizeEmail(claims.email);
  if (!ownerEmails.includes(email)) {
    return { ok: false, status: 403, code: 'owner_required' };
  }
  if (
    !hasOnlyGoogleOrEmailProviders(claims.app_metadata)
    || !hasOAuthAuthenticationMethod(claims.amr)
  ) {
    return { ok: false, status: 403, code: 'google_account_required' };
  }

  return { ok: true, email, subject: claims.sub };
}

export function evaluateDashboardOwnerUser(
  user: DashboardOwnerUser | null,
  configuredOwnerEmail: string | undefined,
): OwnerAccessResult {
  const ownerEmails = parseDashboardOwnerEmails(configuredOwnerEmail);
  if (!ownerEmails) {
    return { ok: false, status: 503, code: 'configuration_required' };
  }
  if (
    !user
    || typeof user.id !== 'string'
    || !user.id
    || typeof user.email_confirmed_at !== 'string'
    || !user.email_confirmed_at
  ) {
    return { ok: false, status: 401, code: 'authentication_required' };
  }

  const email = normalizeEmail(user.email);
  if (!ownerEmails.includes(email)) {
    return { ok: false, status: 403, code: 'owner_required' };
  }
  if (!hasGoogleIdentity(user)) {
    return { ok: false, status: 403, code: 'google_account_required' };
  }

  return { ok: true, email, subject: user.id };
}

export function isPublicDashboardPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.has(pathname) || PUBLIC_SERVICE_PATHS.has(pathname);
}

export function normalizeDashboardNextPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_NEXT_PATH;
  }

  try {
    const base = new URL('https://dashboard.invalid');
    const parsed = new URL(value, base);
    if (parsed.origin !== base.origin) return DEFAULT_NEXT_PATH;
    if (PUBLIC_AUTH_PATHS.has(parsed.pathname)) return DEFAULT_NEXT_PATH;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return DEFAULT_NEXT_PATH;
  }
}
