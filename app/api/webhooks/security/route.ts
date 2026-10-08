import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { validWebhookSignature, parseFirewallEvent } from '@/lib/security/policy';
import { createSecurityClient } from '@/lib/security/events';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 20;
const headers = { 'Cache-Control': 'private, no-store, max-age=0' };
const MAX_BODY_BYTES = 64_000;

export async function POST(request: Request) {
  const secret = process.env.VERCEL_SECURITY_WEBHOOK_SECRET ?? '';
  const projectId = process.env.SECURITY_VERCEL_PROJECT_ID ?? '';
  const teamId = process.env.SECURITY_VERCEL_TEAM_ID ?? '';
  if (process.env.SECURITY_ALERTS_ENABLED !== '1' || secret.length < 16 || !projectId || !teamId) {
    return NextResponse.json({ error: '알림 설정이 필요합니다.' }, { status: 503, headers });
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'JSON 요청이 필요합니다.' }, { status: 415, headers });
  }
  const signature = request.headers.get('x-vercel-signature') ?? '';
  if (!/^[a-f0-9]{40}$/i.test(signature)) {
    return NextResponse.json({ error: '서명이 올바르지 않습니다.' }, { status: 401, headers });
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: '본문이 너무 큽니다.' }, { status: 413, headers });
  }
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: '본문이 필요합니다.' }, { status: 400, headers });
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    void reader.cancel().catch(() => {});
  }, 5000);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return NextResponse.json({ error: '본문이 너무 큽니다.' }, { status: 413, headers });
      }
      chunks.push(value);
    }
  } catch {
    return NextResponse.json({ error: '본문을 읽을 수 없습니다.' }, { status: 400, headers });
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
  if (timedOut) return NextResponse.json({ error: '본문 수신 시간이 초과되었습니다.' }, { status: 408, headers });
  const raw = Buffer.concat(chunks);
  if (!validWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ error: '서명이 올바르지 않습니다.' }, { status: 401, headers });
  }
  let event;
  try { event = parseFirewallEvent(JSON.parse(raw.toString('utf8')), projectId, teamId, Date.now()); } catch { event = null; }
  if (!event) return NextResponse.json({ error: '지원하지 않는 알림입니다.' }, { status: 400, headers });
  try {
    const result = await createSecurityClient().rpc('record_dashboard_firewall_event', {
      p_event_key: createHash('sha256').update(event.id).digest('hex'),
      p_payload_hash: createHash('sha256').update(raw).digest('hex'),
      p_kind: event.kind,
    });
    if (result.error) throw new Error('record_failed');
    if (result.data === 'conflict') return NextResponse.json({ error: '중복 알림 내용이 일치하지 않습니다.' }, { status: 409, headers });
    if (!['recorded', 'duplicate'].includes(result.data)) throw new Error('record_invalid');
    // 수신 즉시 원자적으로 보존하고 5분 주기의 발송기로 처리한다.
    return NextResponse.json({ ok: true }, { headers });
  } catch {
    console.error('[security] firewall_event_record_failed');
    return NextResponse.json({ error: '알림을 저장하지 못했습니다.' }, { status: 503, headers });
  }
}
