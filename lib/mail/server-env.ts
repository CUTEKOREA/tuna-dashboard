import 'server-only';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error('메일 서버 설정이 완료되지 않았습니다');
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
