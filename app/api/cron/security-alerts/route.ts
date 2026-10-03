import { NextResponse } from 'next/server';
import { validSharedSecret } from '@/lib/security/policy';
import { dispatchSecurityAlert } from '@/lib/security/alerts';
import { createSecurityClient } from '@/lib/security/events';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 90;
const headers = { 'Cache-Control': 'private, no-store, max-age=0' };

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') ?? '';
  if (!validSharedSecret(auth.startsWith('Bearer ') ? auth.slice(7) : '', process.env.CRON_SECRET ?? '')) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401, headers });
  }
  try {
    const cleanup = await createSecurityClient().rpc('prune_dashboard_security_events');
    if (cleanup.error) throw new Error('security_retention_failed');
    const status = await dispatchSecurityAlert();
    return NextResponse.json({ ok: status !== 'unknown', status }, { headers, status: status === 'unknown' ? 502 : 200 });
  } catch {
    console.error('[security] alert_dispatch_failed');
    return NextResponse.json({ error: '보안 알림 처리를 확인해야 합니다.' }, { status: 503, headers });
  }
}
