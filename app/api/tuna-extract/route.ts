import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  const filePath = path.join(process.cwd(), 'data/tuna_extract_dashboard.json');
  let data;
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to read tuna extract JSON:", error);
    return NextResponse.json({ error: 'Failed to load tuna extract data' }, { status: 500 });
  }

  return NextResponse.json(data);
}
