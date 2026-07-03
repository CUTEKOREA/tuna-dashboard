import { NextResponse } from 'next/server';
import { getCrossCommodityIntelligence } from '../../../lib/data/cross-commodity-intelligence';

export const runtime = 'nodejs';
export const revalidate = 3600;

const SOURCE_FILE = 'lib/data/cross-commodity-intelligence.ts';

export async function GET() {
  const intelligence = getCrossCommodityIntelligence();

  return NextResponse.json({
    ...intelligence,
    isLive: false,
    _metadata: {
      isLive: false,
      status: 'STATIC',
      source: SOURCE_FILE,
      syncDate: intelligence.meta.syncDate,
      method: intelligence.meta.method,
      apiHealth: {
        ok: true,
        reason: 'static cross-commodity model exported for UI and automation consumers',
      },
    },
  });
}
