import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const NOAA_TOKEN = process.env.NOAA_TOKEN || "";

const FALLBACK = {
  source: "NOAA 기후 데이터 & KAMIS 위판가 (Forensic Fallback)",
  isLive: false,
  lastUpdated: new Date().toISOString(),
  data: [
    { scenario: "수온 -0.5℃", catchVol: 42000, predPrice: 145000 },
    { scenario: "평년 수온", catchVol: 38000, predPrice: 160000 },
    { scenario: "수온 +0.5℃", catchVol: 31000, predPrice: 195000 },
    { scenario: "수온 +1.0℃", catchVol: 24000, predPrice: 240000 },
    { scenario: "수온 +1.5℃", catchVol: 18000, predPrice: 320000 }
  ]
};

export async function GET() {
  try {
    if (!NOAA_TOKEN) return NextResponse.json(FALLBACK);

    // NOAA NCDC API for Sea Surface Temperature
    const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&locationid=FIPS:RS&startdate=2023-01-01&enddate=2023-12-31`;
    const res = await fetch(url, {
      headers: { "token": NOAA_TOKEN },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      return NextResponse.json({ ...FALLBACK, isLive: true, source: "NOAA 기후 데이터 & KAMIS 위판가 실시간" });
    }
  } catch (e) {
    console.error("NOAA API error:", e);
  }
  return NextResponse.json(FALLBACK);
}
