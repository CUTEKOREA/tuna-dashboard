import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const fileMap: Record<string, string> = {
  'w01': 'cold_storage/cold_storage_w01.json',
  'w02': 'cold_storage/cold_storage_w02.json',
  'w03': 'cold_storage/cold_storage_w03.json',
  'w04': 'cold_storage/cold_storage_w04.json',
  'w05': 'cold_storage/cold_storage_w05.json',
  'w06': 'cold_storage/cold_storage_w06.json',
  'w07': 'cold_storage/cold_storage_w07.json',
  'w08': 'cold_storage/cold_storage_w08.json',
  'w09': 'cold_storage/cold_storage_w09.json',
  'k01': 'cold_storage/cold_storage_k01.json',
  'k02': 'cold_storage/cold_storage_k02.json',
  'k03': 'cold_storage/cold_storage_k03.json',
  'k04': 'cold_storage/cold_storage_k04.json',
  'k05': 'cold_storage/cold_storage_k05.json',
  'k06': 'cold_storage/cold_storage_k06.json',
  'k07': 'cold_storage/cold_storage_k07.json',
  'k08': 'cold_storage/cold_storage_k08.json',
  'us01': 'cold_storage/cold_storage_us01.json',
  'us02': 'cold_storage/cold_storage_us02.json',
  'us03': 'cold_storage/cold_storage_us03.json',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !fileMap[id]) {
      return NextResponse.json({ error: 'Invalid or missing id parameter' }, { status: 400 });
    }

    const filename = fileMap[id];
    // public/data/ 우선 (Vercel 배포 호환), data/ 폴백 (로컬)
    let filePath = path.join(process.cwd(), 'public', 'data', filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), 'data', filename);
    }
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `File not found: ${filename}` }, { status: 404 });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json({
      data,
      isLive: false,
      _metadata: {
        isLive: false,
        status: 'STATIC',
        source: filename,
        syncDate: '2026-06',
        method: 'static JSON widget snapshot',
      },
    });
  } catch (error) {
    console.error('API /api/cold-storage/widget error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
