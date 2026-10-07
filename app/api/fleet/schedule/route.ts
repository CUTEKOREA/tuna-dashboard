import { NextResponse } from 'next/server';

import { getFleetPortSchedule } from '@/lib/data/fleet-port-schedule';
import { authorizeFleetRequest } from '@/lib/fleet/request-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  Pragma: 'no-cache',
  Vary: 'Cookie',
  'X-Content-Type-Options': 'nosniff',
} as const;

function scheduleJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  for (const [name, value] of Object.entries(RESPONSE_HEADERS)) headers.set(name, value);
  return NextResponse.json(body, { ...init, headers });
}

export async function GET() {
  const access = await authorizeFleetRequest();
  if (!access.ok) {
    return scheduleJson({ ok: false, code: access.code }, { status: access.status });
  }

  try {
    return scheduleJson({ ok: true, schedule: getFleetPortSchedule() });
  } catch {
    return scheduleJson({ ok: false, code: 'fleet_data_unavailable' }, { status: 503 });
  }
}
