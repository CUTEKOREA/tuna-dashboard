import 'server-only';

export function getDashboardPublicOrigin(
  nodeEnv: string = process.env.NODE_ENV ?? 'production',
): string {
  const raw = process.env.DASHBOARD_PUBLIC_BASE_URL?.trim();
  if (!raw) throw new Error('대시보드 공개 기준 URL 설정이 필요합니다');

  const url = new URL(raw);
  const localDevelopment = nodeEnv === 'development'
    && url.protocol === 'http:'
    && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  if (
    (url.protocol !== 'https:' && !localDevelopment)
    || url.username
    || url.password
    || url.pathname !== '/'
    || url.search
    || url.hash
  ) {
    throw new Error('대시보드 공개 기준 URL 설정이 올바르지 않습니다');
  }

  return url.origin;
}
