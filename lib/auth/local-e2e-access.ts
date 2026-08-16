import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const LOCAL_E2E_AUTH_HEADER = 'x-dashboard-e2e-secret';

const MIN_SECRET_LENGTH = 32;
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', '[::1]', 'localhost']);

function hostnameFromForwardedHost(value: string): string | null {
  const first = value.split(',')[0]?.trim();
  if (!first) return null;

  try {
    return new URL(`http://${first}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  return leftBytes.byteLength === rightBytes.byteLength
    && timingSafeEqual(leftBytes, rightBytes);
}

/**
 * 빌드된 화면의 로컬 브라우저 회귀 테스트 전용 경계.
 * Vercel·외부 호스트에서는 환경값과 헤더가 있어도 항상 거부한다.
 */
export function isLocalDashboardE2ERequest(request: NextRequest): boolean {
  if (process.env.DASHBOARD_E2E_MODE !== 'local') return false;
  if (process.env.VERCEL || process.env.VERCEL_ENV) return false;

  const requestHostname = request.nextUrl.hostname.toLowerCase();
  if (!LOOPBACK_HOSTS.has(requestHostname)) return false;

  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost) {
    const forwardedHostname = hostnameFromForwardedHost(forwardedHost);
    if (!forwardedHostname || !LOOPBACK_HOSTS.has(forwardedHostname)) return false;
  }

  const expected = process.env.DASHBOARD_E2E_AUTH_SECRET ?? '';
  const supplied = request.headers.get(LOCAL_E2E_AUTH_HEADER) ?? '';
  if (expected.length < MIN_SECRET_LENGTH || supplied.length < MIN_SECRET_LENGTH) return false;

  return safeEqual(supplied, expected);
}
