import { NextResponse } from 'next/server';
import { getBniGlobalDashboard } from '../../../lib/data/bni-global';

export const runtime = 'nodejs';
export const revalidate = 3600;

const SOURCE_FILE = 'data/bni_global_dashboard.json';

export async function GET() {
  const dashboard = getBniGlobalDashboard();

  return NextResponse.json({
    ...dashboard,
    isLive: false,
    _metadata: {
      isLive: false,
      status: dashboard.meta.status,
      source: SOURCE_FILE,
      syncDate: dashboard.meta.syncDate,
      method: dashboard.meta.method,
      apiHealth: {
        ok: true,
        reason: 'static BNI Global customer market dashboard dataset',
      },
    },
  });
}
