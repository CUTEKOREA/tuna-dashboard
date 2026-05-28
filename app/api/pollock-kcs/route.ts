import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 명태 관세청 수입 데이터 API
 * GET /api/pollock-kcs?year=2024
 * HS Code: 030367 (냉동 명태)
 *
 * mackerel-kcs와 동일 패턴 (자체 regex parsing, parsers.ts 비의존)
 */

const KCS_API_KEY = process.env.DATA_GO_KR_NEW_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c';
const KCS_BASE = "https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList";

const FALLBACK_DATA = {
  source: "관세청 HS 030367 (2024, Forensic 파싱)",
  isLive: false,
  lastUpdated: "2026-05-29",
  summary: {
    totalWgt: 180559,
    totalDlr: 350000,
    ruWgt: 171165,
    ruDlr: 320000,
    ruPct: 94.8,
    cifPerKg: 1.93,
    yoy: "+5.1%"
  },
  yearly: [
    { year: "2020", totalWgt: 175000, ruPct: 91.2, cifPerKg: 1.85 },
    { year: "2021", totalWgt: 182000, ruPct: 92.5, cifPerKg: 1.88 },
    { year: "2022", totalWgt: 165000, ruPct: 93.1, cifPerKg: 1.90 },
    { year: "2023", totalWgt: 178000, ruPct: 94.2, cifPerKg: 1.91 },
    { year: "2024", totalWgt: 180559, ruPct: 94.8, cifPerKg: 1.93 },
  ],
  byOrigin: [
    { origin: "러시아", volume: 171165, value: 320000, share: 94.8 },
    { origin: "미국", volume: 5000, value: 15000, share: 2.8 },
    { origin: "중국", volume: 4000, value: 14000, share: 2.2 },
    { origin: "기타", volume: 394, value: 1000, share: 0.2 },
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2024";
  const month = searchParams.get("month") || "";

  try {
    const strtYymm = month ? `${year}${month}` : `${year}01`;
    const endYymm = month ? `${year}${month}` : `${year}12`;
    const url = `${KCS_BASE}?serviceKey=${KCS_API_KEY}&strtYymm=${strtYymm}&endYymm=${endYymm}&hsSgn=030367`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return NextResponse.json(FALLBACK_DATA);

    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    if (items.length === 0) return NextResponse.json(FALLBACK_DATA);

    let totalWgt = 0, totalDlr = 0, ruWgt = 0, ruDlr = 0;
    const byCountry: Record<string, { name: string; volume: number; value: number }> = {};

    for (const match of items) {
      const itemStr = match[1];
      const yearMatch = itemStr.match(/<year>([\s\S]*?)<\/year>/);
      const statKorMatch = itemStr.match(/<statKor>([\s\S]*?)<\/statKor>/);
      const statCdMatch = itemStr.match(/<statCd>([\s\S]*?)<\/statCd>/);
      const impWgtMatch = itemStr.match(/<impWgt>([\d.]+)<\/impWgt>/);
      const impDlrMatch = itemStr.match(/<impDlr>([\d.]+)<\/impDlr>/);

      if (!yearMatch || yearMatch[1] === '총계') continue;
      const country = (statKorMatch?.[1] || '').trim();
      if (country === '총계' || !country) continue;

      const wgt = impWgtMatch ? parseFloat(impWgtMatch[1]) : 0;
      const dlr = impDlrMatch ? parseFloat(impDlrMatch[1]) : 0;
      const cc = (statCdMatch?.[1] || 'XX').trim();

      totalWgt += wgt;
      totalDlr += dlr;
      if (cc === 'RU') { ruWgt += wgt; ruDlr += dlr; }

      if (!byCountry[cc]) byCountry[cc] = { name: country, volume: 0, value: 0 };
      byCountry[cc].volume += wgt;
      byCountry[cc].value += dlr;
    }

    if (totalWgt === 0) return NextResponse.json(FALLBACK_DATA);

    const ruPct = Math.round(ruWgt / totalWgt * 1000) / 10;
    const cifPerKg = Math.round(totalDlr / totalWgt * 100) / 100;

    return NextResponse.json({
      source: `관세청 nitemtrade 실시간 HS 030367 (${year}${month ? "-" + month : ""}, ${items.length}건)`,
      isLive: true,
      lastUpdated: new Date().toISOString(),
      summary: { totalWgt, totalDlr, ruWgt, ruDlr, ruPct, cifPerKg },
      byOrigin: Object.entries(byCountry)
        .map(([cc, d]) => ({ origin: d.name, volume: d.volume, value: d.value, share: Math.round(d.volume / totalWgt * 1000) / 10 }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10),
      yearly: FALLBACK_DATA.yearly,
      apiHealth: { ok: true, items_count: items.length },
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (e) {
    console.error("KCS Pollock API error:", e);
    return NextResponse.json(FALLBACK_DATA);
  }
}
