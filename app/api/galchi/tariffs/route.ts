import { NextResponse } from 'next/server';

const TARIFFS_KEY = process.env.TARIFFS_API_KEY || "";
const TARIFFS_BASE = "https://api.tariffs.io/v1/calculate";

const FALLBACK = {
  source: "Tariffs API (Local DB Fallback)",
  isLive: false,
  data: [
    { month: "Jan", "MFN 관세원가": 3500, "세네갈 FTA 원가": 3200 },
    { month: "Feb", "MFN 관세원가": 3550, "세네갈 FTA 원가": 3250 },
    { month: "Mar", "MFN 관세원가": 3600, "세네갈 FTA 원가": 3200 },
    { month: "Apr", "MFN 관세원가": 3650, "세네갈 FTA 원가": 3150 },
    { month: "May", "MFN 관세원가": 3700, "세네갈 FTA 원가": 3100 },
  ]
};

export async function GET() {
  try {
    if (!TARIFFS_KEY) return NextResponse.json(FALLBACK);

    const res = await fetch(`${TARIFFS_BASE}?hs_code=030389`, {
      headers: { 'Authorization': `Bearer ${TARIFFS_KEY}` },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json = await res.json();
      // Assume json.data maps to our format
      if (json && json.data) {
         return NextResponse.json({
           source: "Tariffs API (Real-time MFN/FTA Simulator)",
           isLive: true,
           data: json.data.map((d: any) => ({
             month: d.month,
             "MFN 관세원가": d.mfn_cost,
             "세네갈 FTA 원가": d.fta_cost
           }))
         });
      }
    }
  } catch (e) {
    console.warn("Tariffs API failed, using fallback", e);
  }

  return NextResponse.json(FALLBACK);
}
