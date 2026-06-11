import { NextResponse } from "next/server";

/**
 * 갈치 통합 인텔리전스 API
 * GET /api/galchi/intel?type=exchange|wits|comtrade|macro
 */

const ECOS_KEY = process.env.ECOS_API_KEY || "";

// ═══ Exchange Rate (ECOS) ═══
async function getExchangeRate() {
  const FALLBACK = { usdKrw: 1380, cnyKrw: 190, isLive: false, lastUpdated: "2026-05-13" };
  if (!ECOS_KEY) return FALLBACK;

  try {
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    // 731Y001: 원/달러 환율
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${ECOS_KEY}/json/kr/1/1/731Y001/D/${today}/${today}/0000001`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const json = await res.json();
      const items = json?.StatisticSearch?.row || [];
      if (items.length > 0) {
        const usdKrw = parseFloat(items[0].DATA_VALUE) || 1380;
        return { usdKrw, cnyKrw: Math.round(usdKrw / 7.25), isLive: true, lastUpdated: new Date().toISOString() };
      }
    }
  } catch {}
  return FALLBACK;
}

// ⚠️ 데이터 원천 재검증 중 (2026-06-11): 아래 착지원가·매크로 영향 계산의 입력값
// (CIF $2.08, 연간 26,797톤)은 HSK 0303899060 통관 집계 기반 — 갈치 귀속 미확인.
// HSK 재확인·재수집 전까지 프런트는 이 수치를 갈치 단정 수치로 노출하지 않는다.
const DATA_QUALITY_NOTE =
  "입력값(CIF·연간 수입량)이 HSK 0303899060 통관 집계 기반 — 품목 귀속 재검증 중(HSK 재확인 필요)";

// ═══ Landing Cost Calculator (WITS-based) ═══
function calcLandingCost(cifUsd: number, usdKrw: number) {
  const mfnRate = 0.10; // 갈치 MFN 10%
  const insuranceRate = 0.005;
  const handlingKrw = 50; // 통관+하역 원/kg

  const cifKrw = cifUsd * usdKrw;
  const tariff = cifKrw * mfnRate;
  const insurance = cifKrw * insuranceRate;
  const landed = cifKrw + tariff + insurance + handlingKrw;

  return {
    cifUsd, cifKrw: Math.round(cifKrw),
    tariffKrw: Math.round(tariff), tariffRate: mfnRate * 100,
    insuranceKrw: Math.round(insurance),
    handlingKrw,
    landedKrw: Math.round(landed),
    // 위판가 대비 스프레드
    auctionPriceKrw: 10300,
    spreadKrw: Math.round(10300 - landed),
    spreadPct: Math.round((10300 / landed - 1) * 1000) / 10,
  };
}

// ═══ Macro Risk Panel ═══
function getMacroRisk(usdKrw: number) {
  const baseline = 1350;
  const delta = usdKrw - baseline;
  const costImpactPerKg = Math.round(2.08 * delta * 0.1) / 10; // CIF $2.08 기준
  const annualImpact = Math.round(costImpactPerKg * 26797); // 연간 수입 26,797톤

  return {
    usdKrw,
    baseline,
    delta,
    costImpactPerKg: `${costImpactPerKg >= 0 ? "+" : ""}${costImpactPerKg}원/kg`,
    annualImpactMillion: `${annualImpact >= 0 ? "+" : ""}${Math.round(annualImpact / 100) / 10}백만원`,
    sensitivity: "원/달러 10원 변동 → 수입원가 ±20.8원/kg → 연간 ±5.6천만원",
    riskLevel: Math.abs(delta) > 50 ? "HIGH" : Math.abs(delta) > 20 ? "MEDIUM" : "LOW",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  const exchange = await getExchangeRate();
  const landingCost = { ...calcLandingCost(2.08, exchange.usdKrw), dataQualityNote: DATA_QUALITY_NOTE };
  const macroRisk = { ...getMacroRisk(exchange.usdKrw), dataQualityNote: DATA_QUALITY_NOTE };

  if (type === "exchange") return NextResponse.json({ exchange });
  if (type === "wits") return NextResponse.json({ landingCost });
  if (type === "macro") return NextResponse.json({ macroRisk });

  // all
  return NextResponse.json({
    source: "갈치 통합 인텔리전스 (ECOS+WITS+매크로)",
    lastUpdated: new Date().toISOString(),
    exchange,
    landingCost,
    macroRisk,
    // Comtrade 글로벌 포지셔닝 (fallback — 등록 후 라이브 전환)
    globalPosition: {
      source: "UN Comtrade HS 030389 (2023, fallback)",
      isLive: false,
      topImporters: [
        { rank: 1, country: "한국", volume: 26797, value: 55800 },
        { rank: 2, country: "일본", volume: 83724, value: 302000 },
        { rank: 3, country: "스페인", volume: 18500, value: 42000 },
        { rank: 4, country: "포르투갈", volume: 12300, value: 28000 },
        { rank: 5, country: "이탈리아", volume: 8900, value: 21000 },
      ],
      topExporters: [
        { rank: 1, country: "중국", volume: 245000, value: 510000 },
        { rank: 2, country: "인도", volume: 35000, value: 85000 },
        { rank: 3, country: "한국", volume: 986, value: 11000 },
      ],
      koreaPosition: { importRank: 1, exportRank: 3, importShare: "15.8%", exportShare: "0.3%" }
    }
  });
}
