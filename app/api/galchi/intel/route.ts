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

// ✅ HSK 재검증 완료 (2026-06-11): 착지원가·매크로 영향 계산 입력값을
// 관세청 HSK 0303.89-2000(냉동 갈치, nitemtrade 품목명 "갈치" 확인) 2025 실측으로 교체.
// CIF $3.61/kg · 연간 수입 13,327톤 (구 0303899060=아귀 입력값 폐기).
const GALCHI_CIF_USD = 3.61;      // 2025 연간 평균 CIF (USD/kg, HSK 0303892000 실측)
const GALCHI_ANNUAL_TONS = 13327; // 2025 연간 수입량 (톤, HSK 0303892000 실측)
const HSK_NOTE = "HSK 0303.89-2000 냉동 갈치 검증 완료 (2026-06-11, 2025 실측 CIF $3.61/kg · 13,327톤)";

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
  const costImpactPerKg = Math.round(GALCHI_CIF_USD * delta * 10) / 10; // 원/kg (CIF $3.61/kg 실측 기준)
  const annualImpactM = Math.round(costImpactPerKg * GALCHI_ANNUAL_TONS / 1000); // 백만원 (연간 13,327톤)

  return {
    usdKrw,
    baseline,
    delta,
    costImpactPerKg: `${costImpactPerKg >= 0 ? "+" : ""}${costImpactPerKg}원/kg`,
    annualImpactMillion: `${annualImpactM >= 0 ? "+" : ""}${annualImpactM.toLocaleString()}백만원`,
    sensitivity: "원/달러 10원 변동 → 수입원가 ±36.1원/kg → 연간 ±4.8억원 (2025 실측 기준)",
    riskLevel: Math.abs(delta) > 50 ? "HIGH" : Math.abs(delta) > 20 ? "MEDIUM" : "LOW",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  const exchange = await getExchangeRate();
  const landingCost = { ...calcLandingCost(GALCHI_CIF_USD, exchange.usdKrw), hskNote: HSK_NOTE };
  const macroRisk = { ...getMacroRisk(exchange.usdKrw), hskNote: HSK_NOTE };

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
      source: "UN Comtrade HS 030389 (2023, fallback) · 한국 행은 관세청 HSK 0303.89-2000 실측(2024) — 타국은 광역 HS6 집계라 갈치 외 어종 포함",
      isLive: false,
      topImporters: [
        { rank: 1, country: "한국", volume: 13430, value: 43176 },
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
