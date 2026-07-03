import { NextResponse } from "next/server";
import { HS_CODES } from "../../_shared/hs-codes";

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 갈치 관세청 수입 데이터 API
 * GET /api/galchi/kcs?year=2025&month=04
 * HS Code: 0303892000 (냉동 갈치)
 *
 * ✅ HSK 재검증 완료 (2026-06-11):
 *  - 0303892000 → 관세청 nitemtrade 응답 품목명(statKor) "갈치" (냉동) — 본 라우트 채택
 *  - 0302892000 → statKor "갈치" (신선·냉장, 연 60~180톤 소규모 — 별도 미사용)
 *  - 0303899060 → statKor "아귀" — 기존 오귀속 코드 (2026-06-11 폐기)
 *  - 0303896000 → statKor "학꽁치" — agri_data README의 오기 코드 (채택 금지)
 *  교차근거: KMI 「FTA체결국 수산물 수입동향」 분기보고서의 냉동 갈치 집계도
 *  관세청 HSK 0303.89.20.00 기반. 실수집 결과(오만·세네갈·남아공·모로코 중심,
 *  2025 전체 13,327톤)가 KMI 국가별 표(오만 4.2·세네갈 2.8·남아공 2.5천 톤)와 정합.
 *
 * mackerel-kcs와 동일 패턴 (자체 regex parsing, L-11).
 */

const KCS_API_KEY = process.env.DATA_GO_KR_NEW_KEY || process.env.DATA_GO_KR_COMMON_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c';
const KCS_BASE = "https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList";
const HSK = HS_CODES.galchi_frozen.hsSgn;

// 관세청 nitemtrade HSK 0303892000 실수집 집계 (2018-2025 연간, 2026-06-11 수집)
// 단위: totalWgt 톤, totalDlr 천 USD, cifPerKg USD/kg
const YEARLY_ACTUAL = [
  { year: "2018", totalWgt: 17320, totalDlr: 70842, cnPct: 19.4, cifPerKg: 4.09 },
  { year: "2019", totalWgt: 15240, totalDlr: 55489, cnPct: 12.7, cifPerKg: 3.64 },
  { year: "2020", totalWgt: 18966, totalDlr: 70786, cnPct: 7.4, cifPerKg: 3.73 },
  { year: "2021", totalWgt: 15185, totalDlr: 57274, cnPct: 8.6, cifPerKg: 3.77 },
  { year: "2022", totalWgt: 12858, totalDlr: 41314, cnPct: 4.9, cifPerKg: 3.21 },
  { year: "2023", totalWgt: 14617, totalDlr: 50257, cnPct: 3.7, cifPerKg: 3.44 },
  { year: "2024", totalWgt: 13430, totalDlr: 43176, cnPct: 4.5, cifPerKg: 3.21 },
  { year: "2025", totalWgt: 13327, totalDlr: 48057, cnPct: 7.6, cifPerKg: 3.61 },
];

const FALLBACK_DATA = {
  source: "관세청 HSK 0303.89-2000 냉동 갈치 (2025 연간 실수집 스냅샷 · HSK 검증 완료 2026-06-11)",
  isLive: false,
  hskVerified: "0303892000 — 관세청 품목명 '갈치' 확인 (2026-06-11, 구 0303899060=아귀 폐기)",
  lastUpdated: "2026-06-11",
  year: "2025",
  summary: {
    totalWgt: 13327,
    totalDlr: 48057,
    cnWgt: 1011,
    cnDlr: 5716,
    cnPct: 7.6,
    cifPerKg: 3.61,
    yoy: "-0.8%"
  },
  yearly: YEARLY_ACTUAL,
  byOrigin: [
    { origin: "오만", volume: 4153, value: 15936, share: 31.2 },
    { origin: "세네갈", volume: 2843, value: 10852, share: 21.3 },
    { origin: "남아공", volume: 2468, value: 6179, share: 18.5 },
    { origin: "모로코", volume: 1186, value: 3765, share: 8.9 },
    { origin: "중국", volume: 1011, value: 5716, share: 7.6 },
    { origin: "베네수엘라", volume: 377, value: 1317, share: 2.8 },
    { origin: "기타", volume: 1290, value: 4292, share: 9.7 },
  ]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year") || "2025";
  const month = searchParams.get("month") || "";

  try {
    const strtYymm = month ? `${year}${month}` : `${year}01`;
    const endYymm = month ? `${year}${month}` : `${year}12`;
    const url = `${KCS_BASE}?serviceKey=${KCS_API_KEY}&strtYymm=${strtYymm}&endYymm=${endYymm}&hsSgn=${HSK}`;

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
      const statKorMatch = itemStr.match(/<statCdCntnKor1>([\s\S]*?)<\/statCdCntnKor1>/);
      const statCdMatch = itemStr.match(/<statCd>([\s\S]*?)<\/statCd>/);
      const impWgtMatch = itemStr.match(/<impWgt>([\d.]+)<\/impWgt>/);
      const impDlrMatch = itemStr.match(/<impDlr>([\d.]+)<\/impDlr>/);

      if (!yearMatch || yearMatch[1] === '총계') continue;
      const country = (statKorMatch?.[1] || '').trim();
      if (country === '총계' || country === '-' || !country) continue;

      const wgt = impWgtMatch ? parseFloat(impWgtMatch[1]) : 0;
      const dlr = impDlrMatch ? parseFloat(impDlrMatch[1]) : 0;
      const cc = (statCdMatch?.[1] || 'XX').trim();

      // 단위 변환 (L-11): impWgt kg → 톤, impDlr USD → 천 USD
      const wgtT = wgt / 1000;
      const dlrK = dlr / 1000;
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
      source: `관세청 nitemtrade 실시간 HSK 0303.89-2000 냉동 갈치 (${year}${month ? "-" + month : ""}, ${items.length}건 · HSK 검증 완료)`,
      isLive: true,
      hskVerified: "0303892000 — 관세청 품목명 '갈치' 확인 (2026-06-11)",
      lastUpdated: new Date().toISOString(),
      year,
      summary: {
        totalWgt: Math.round(totalWgt),
        totalDlr: Math.round(totalDlr),
        cnWgt: Math.round(cnWgt),
        cnDlr: Math.round(cnDlr),
        cnPct,
        cifPerKg
      },
      byOrigin: Object.values(byCountry)
        .map((d) => ({ origin: d.name, volume: Math.round(d.volume), value: Math.round(d.value), share: Math.round(d.volume / totalWgt * 1000) / 10 }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10),
      yearly: YEARLY_ACTUAL,
      apiHealth: { ok: true, items_count: items.length },
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (e) {
    console.error("KCS Galchi API error:", e);
    return NextResponse.json(FALLBACK_DATA);
  }
}
