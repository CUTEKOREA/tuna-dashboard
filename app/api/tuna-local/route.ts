import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataset = searchParams.get('dataset');

  try {
    let filePath = '';

    if (dataset === 'atuna-price') {
      filePath = path.join(process.cwd(), 'public', 'data', 'tuna', 'atuna', 'skjbkk.csv');
    } else if (dataset === 'eurostat-flow') {
      filePath = path.join(process.cwd(), 'public', 'data', 'tuna', 'eurostat', 'comext_160414_by_country_year_flow.csv');
    } else {
      return NextResponse.json({ error: 'Unknown dataset' }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Data file not found', path: filePath }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    
    const data = lines.slice(1).map((line) => {
      // Very basic CSV parser handling simple commas (no commas inside quotes in these datasets usually)
      const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = values[i];
      });
      return obj;
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching local tuna data:', error);
    return NextResponse.json({ error: 'Failed to read data', details: error.message }, { status: 500 });
  }
}
