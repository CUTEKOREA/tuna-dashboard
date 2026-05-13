export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtypes=TC', {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error(`GDACS API responded with status: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch GDACS TC feed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
