import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const SOURCE_FILE = 'data/tuna_extract_dashboard.json';

function withStaticMetadata(data: Record<string, unknown>, apiHealth?: { ok: boolean; reason?: string }) {
  return {
    ...data,
    isLive: false,
    _metadata: {
      isLive: false,
      status: 'STATIC',
      source: SOURCE_FILE,
      syncDate: '2026-H1',
      method: 'static snapshot with component-level fallback',
      ...(apiHealth ? { apiHealth } : {}),
    },
  };
}

export async function GET() {
  const filePath = path.join(process.cwd(), SOURCE_FILE);
  let data: Record<string, unknown> = {};

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(withStaticMetadata(data, {
        ok: false,
        reason: `${SOURCE_FILE} missing; component fallbacks are active`,
      }));
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to read tuna extract JSON:", error);
    return NextResponse.json(withStaticMetadata({}, {
      ok: false,
      reason: 'Failed to parse static snapshot; component fallbacks are active',
    }));
  }

  return NextResponse.json(withStaticMetadata(data, { ok: true }));
}
