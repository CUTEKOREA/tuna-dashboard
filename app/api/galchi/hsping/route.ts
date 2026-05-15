import { NextResponse } from 'next/server';

const HSPING_KEY = process.env.HSPING_API_KEY || "";
const HSPING_BASE = "https://api.hsping.com/v1/classify";

const FALLBACK = {
  source: "HS Ping API (Local DB Fallback)",
  isLive: false,
  data: [
    { form: "냉동 통갈치", hsCode: "0303.89.9000", conf: 99.8 },
    { form: "갈치 토막 (Steak)", hsCode: "0304.89.0000", conf: 98.5 },
    { form: "갈치 순살 (Fillet)", hsCode: "0304.89.0000", conf: 99.1 },
    { form: "건조/염장 갈치", hsCode: "0305.59.0000", conf: 96.4 },
  ]
};

export async function GET() {
  try {
    if (!HSPING_KEY) return NextResponse.json(FALLBACK);

    const res = await fetch(`${HSPING_BASE}?q=hairtail`, {
      headers: { 'Authorization': `Bearer ${HSPING_KEY}` },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json = await res.json();
      // Assume json.results maps to our format
      if (json && json.results) {
         return NextResponse.json({
           source: "HS Ping API (Live Classification)",
           isLive: true,
           data: json.results.map((r: any) => ({
             form: r.query,
             hsCode: r.hs_code,
             conf: Math.round(r.confidence * 1000) / 10
           }))
         });
      }
    }
  } catch (e) {
    console.warn("HS Ping API failed, using fallback", e);
  }

  return NextResponse.json(FALLBACK);
}
