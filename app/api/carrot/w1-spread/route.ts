import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const revalidate = 86400;

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/carrot_w1_hegemony.json', 'utf8');
    const baseData = JSON.parse(fileContents);

    return NextResponse.json({
      isLive: false,
      source: "KAMIS x KCS static spread snapshot",
      data: baseData,
      _metadata: {
        isLive: false,
        status: "STATIC",
        source: "data/carrot_w1_hegemony.json",
        syncDate: "2026-06-06",
        method: "static JSON snapshot; no live perturbation",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch W1 spread data" }, { status: 500 });
  }
}
