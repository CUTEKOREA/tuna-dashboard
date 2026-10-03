import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { getSupabaseServiceConfig } from '@/lib/mail/server-env';
import type { OwnerAccessResult } from '@/lib/auth/owner-policy';
import { classifySecurityRequest, type SecuritySignal } from './policy';

export function createSecurityClient() {
  const { url, serviceRoleKey } = getSupabaseServiceConfig();
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (url, init) => fetch(url, {
        ...init,
        signal: init?.signal
          ? AbortSignal.any([init.signal, AbortSignal.timeout(2500)])
          : AbortSignal.timeout(2500),
      }),
    },
  });
}

export async function recordSecuritySignal(signal: SecuritySignal): Promise<void> {
  const { data, error } = await createSecurityClient().rpc('record_dashboard_security_event', {
    p_kind: signal.kind, p_actor_hash: signal.actorHash, p_route_group: signal.routeGroup,
  });
  if (error || data !== true) throw new Error('security_event_record_failed');
}

export function queueSecurityObservation(request: NextRequest, access: OwnerAccessResult, event?: NextFetchEvent) {
  if (!event || process.env.SECURITY_ALERTS_ENABLED !== '1') return;
  const signal = classifySecurityRequest({
    path: request.nextUrl.pathname, method: request.method, access,
    key: process.env.SECURITY_EVENT_HASH_KEY ?? '',
    day: new Date().toISOString().slice(0, 10),
  });
  if (!signal) return;
  event.waitUntil(recordSecuritySignal(signal).catch(() => {
    // 비밀값·요청·오류 원문은 기록하지 않는다. 집계 장애는 인증 판단을 바꾸지 않는다.
    console.error('[security] event_record_failed');
  }));
}
