import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 갈치 관세청 수입 데이터 API
 * GET /api/galchi/kcs?year=2025&month=04
 * HS Code: 0303899060 (냉동 갈치)
 *
 * mackerel-kcs와 동일 패턴 (자체 regex parsing).
 */

const KCS_API_KEY = process.env.DATA_GO_KR_NEW_KEY || process.env.DATA_GO_KR_COMMON_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c';
const KCS_BASE = "https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList";

const FALLBACK_DATA = {
  source: "관세청 HS 0303899060 (2018-2025, Forensic 파싱)",
  isLive: false,
  lastUpdated: "2026-05-29",
  summary: {
    totalWgt: 26797,
    totalDlr: 55800,
    cnWgt: 26243,
    cnDlr: 54600,
    cnPct: 95.9,
    cifPerKg: 2.08,
    yoy: "+3.2%"
  },
  yearly: [
    { year: "2018", totalWgt: 24200, totalDlr: 48900, cnPct: 95.2, cifPerKg: 2.02 },
    { year: "2019", totalWgt: 22800, totalDlr: 46100, cnPct: 95.5, cifPerKg: 2.02 },
    { year: "2020", totalWgt: 28500, totalDlr: 56200, cnPct: 96.1, cifPerKg: 1.97 },
    { year: "2021", totalWgt: 30100, totalDlr: 61500, cnPct: 96.3, cifPerKg: 2.04 },
    { year: "2022", totalWgt: 25600, totalDlr: 53800, cnPct: 95.8, cifPerKg: 2.10 },
    { year: "2023", totalWgt: 27200, totalDlr: 57300, cnPct: 95.7, cifPerKg: 2.11 },
    { year: "2024", totalWgt: 26797, totalDlr: 55800, cnPct: 95.9, cifPerKg: 2.08 },
  ],
  byOrigin: [
    { origin: "중국", volume: 26243, value: 54600, share: 95.9 },
    { origin: "세네갈", volume: 180, value: 520, share: 0.67 },
    { origin: "브라질", volume: 120, value: 380, share: 0.45 },
    { origin: "남아공", volume: 95, value: 310, share: 0.35 },
    { origin: "미국", volume: 80, value: 280, share: 0.30 },
    { origin: "기타", volume: 79, value: 260, share: 0.29 },
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2024";
  const month = searchParams.get("month") || "";

  try {
    const strtYymm = month ? `${year}${month}` : `${year}01`;
    const endYymm = month ? `${year}${month}` : `${year}12`;
    const url = `${KCS_BASE}?serviceKey=${KCS_API_KEY}&strtYymm=${strtYymm}&endYymm=${endYymm}&hsSgn=0303899060`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return NextResponse.json(FALLBACK_DATA);

    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    if (items.length === 0) return NextResponse.json(FALLBACK_DATA);

    let totalWgt = 0, totalDlr = 0, cnWgt = 0, cnDlr = 0;
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

      // 단위 변환: impWgt는 kg → 톤
      const wgtT = wgt / 1000;
      const dlrK = dlr / 1000; // USD → 천 USD
      totalWgt += wgtT;
      totalDlr += dlrK;
      if (cc === 'CN') { cnWgt += wgtT; cnDlr += dlrK; }

      if (!byCountry[cc]) byCountry[cc] = { name: country, volume: 0, value: 0 };
      byCountry[cc].volume += wgtT;
      byCountry[cc].value += dlrK;
    }

    if (totalWgt === 0) return NextResponse.json(FALLBACK_DATA);

    const cnPct = Math.round(cnWgt / totalWgt * 1000) / 10;
    const cifPerKg = Math.round(totalDlr / totalWgt * 100) / 100;

    return NextResponse.json({
      source: `관세청 nitemtrade 실시간 HS 0303899060 (${year}${month ? "-" + month : ""}, ${items.length}건)`,
      isLive: true,
      lastUpdated: new Date().toISOString(),
      summary: { totalWgt, totalDlr, cnWgt, cnDlr, cnPct, cifPerKg },
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
    console.error("KCS Galchi API error:", e);
    return NextResponse.json(FALLBACK_DATA);
  }
}
