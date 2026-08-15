import 'server-only';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error('메일 서버 설정이 완료되지 않았습니다');
  return value;
}

function requiredSecret(name: string): string {
  const value = process.env[name];
  if (!value || /[\r\n\u0000]/.test(value)) throw new Error('메일 서버 설정이 완료되지 않았습니다');
  return value;
}

export function getMailPublicBaseUrl(
  nodeEnv: string = process.env.NODE_ENV ?? 'production',
): string {
  const value = required('MAIL_PUBLIC_BASE_URL');
  const url = new URL(value);
  const isLocalDevelopment = (
    nodeEnv === 'development'
    && url.protocol === 'http:'
    && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
  );
  if (
    (url.protocol !== 'https:' && !isLocalDevelopment)
    || url.username
    || url.password
    || url.pathname !== '/'
    || url.search
    || url.hash
  ) {
    throw new Error('메일 공개 기준 URL 설정이 올바르지 않습니다');
  }
  return url.origin;
}

export function getMailEncryptionKey(): string {
  return required('MAIL_TOKEN_ENCRYPTION_KEY');
}

export function getGoogleOAuthConfig(): { clientId: string; clientSecret: string } {
  return {
    clientId: required('GOOGLE_OAUTH_CLIENT_ID'),
    clientSecret: required('GOOGLE_OAUTH_CLIENT_SECRET'),
  };
}

export function getCompanySmtpConfig(): {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
} {
  const host = required('COMPANY_SMTP_HOST').toLowerCase();
  const port = Number(required('COMPANY_SMTP_PORT'));
  const user = required('COMPANY_SMTP_USER').toLowerCase();
  const from = required('COMPANY_SMTP_FROM').toLowerCase();
  if (
    host !== 'mail1.sla.co.kr'
    || port !== 587
    || user !== from
    || !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@sla\.co\.kr$/i.test(user)
  ) {
    throw new Error('회사 SMTP 설정이 올바르지 않습니다');
  }
  return {
    host,
    port,
    user,
    password: requiredSecret('COMPANY_SMTP_PASSWORD'),
    from,
  };
}

export function getSupabaseAuthConfig(): {
  url: string;
  anonKey: string;
} {
  return {
    url: required('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

export function getSupabaseServiceConfig(): {
  url: string;
  serviceRoleKey: string;
} {
  return {
    url: required('NEXT_PUBLIC_SUPABASE_URL'),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  };
}
