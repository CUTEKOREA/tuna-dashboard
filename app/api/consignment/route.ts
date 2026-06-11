import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ==========================================
// Helper: Safe API Health Check with timeout
// ==========================================
async function checkApiHealth(url: string, timeoutMs: number = 3000): Promise<'online' | 'degraded' | 'offline'> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal, method: 'HEAD' });
    clearTimeout(timer);
    return res.ok ? 'online' : 'degraded';
  } catch {
    return 'offline';
  }
}

// ==========================================
// Helper: Fetch KAMIS retail price for a product
// ==========================================
async function fetchKamisPrice(productCode: string, productName: string): Promise<number | null> {
  try {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const apiKey = process.env.KAMIS_API_KEY || '2d41cf53-ea88-42e2-b958-f21638f3528c';
    const url = `https://www.kamis.or.kr/service/price/xml.do?action=dailySalesList&p_cert_key=${apiKey}&p_cert_id=${process.env.KAMIS_CERT_ID || "7849"}&p_returntype=json&p_product_cls_code=02&p_regday=${dateStr}&p_convert_kg_yn=Y&p_item_category_code=600`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const items = data?.data?.item;
      if (Array.isArray(items)) {
        const match = items.find((item: any) => 
          item.item_name?.includes(productName) || item.product_cls_code === productCode
        );
        if (match?.dpr1) {
          const price = parseInt(match.dpr1.replace(/,/g, ''), 10);
          if (!isNaN(price) && price > 0) return price;
        }
      }
    }
  } catch {}
  return null;
}

// ==========================================
// Helper: Fetch NOAA ENSO SST Anomaly
// ==========================================
async function fetchSSTAnomaly(): Promise<number | null> {
  try {
    const res = await fetch('https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt', { next: { revalidate: 86400 } });
    if (res.ok) {
      const text = await res.text();
      const lines = text.trim().split('\n').filter((l: string) => l.trim());
      const lastLine = lines[lines.length - 1];
      const parts = lastLine.trim().split(/\s+/);
      const anomaly = parseFloat(parts[parts.length - 1]);
      if (!isNaN(anomaly)) return anomaly;
    }
  } catch {}
  return null;
}

export async function GET(request: Request) {
  try {
    // public/data 는 배포에 포함됨(기존 data/ 는 .gitignore /data/ 로 미배포 → 프로덕션 빈 차트 원인이었음)
    const filePath = path.join(process.cwd(), 'public', 'data', 'consignment_3year.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const baseData = JSON.parse(fileContents);

    // ==========================================
    // [D7 FIX] Float precision cleanup
    // ==========================================
    const roundQty = (obj: any) => {
      if (obj && typeof obj.saleQty === 'number') {
        obj.saleQty = Math.round(obj.saleQty);
      }
      if (obj && typeof obj.saleAmount === 'number') {
        obj.saleAmount = Math.round(obj.saleAmount);
      }
    };
    if (baseData.yearlyTop) {
      for (const yr of Object.keys(baseData.yearlyTop)) {
        baseData.yearlyTop[yr].forEach(roundQty);
      }
    }
    if (baseData.monthlyDetail) {
      for (const m of Object.keys(baseData.monthlyDetail)) {
        baseData.monthlyDetail[m].forEach(roundQty);
      }
    }

    // ==========================================
    // [D8 FIX] Partial-year metadata for 2026
    // 달력 월이 아닌 monthlyDetail에 실재하는 월로 라벨 산출 (존재하지 않는 월 누적 주장 방지)
    // ==========================================
    if (baseData._meta) {
      baseData._meta.partialYears = {};
      const months2026 = Object.keys(baseData.monthlyDetail || {})
        .filter((m: string) => m.startsWith('2026-'))
        .map((m: string) => parseInt(m.slice(5, 7), 10))
        .filter((n: number) => Number.isFinite(n));
      if (months2026.length > 0) {
        const firstMonth = Math.min(...months2026);
        const lastMonth = Math.max(...months2026);
        baseData._meta.partialYears['2026'] = {
          isPartial: true,
          monthsCovered: months2026.length,
          label: `${firstMonth}~${lastMonth}월 (실집계 ${months2026.length}개월)`
        };
      }
    }

    // ==========================================
    // Phase 1: Real API Fetches (parallel)
    // ==========================================
    
    // 1. Exchange Rate
    let exchangeRate = 1400.00;
    let erStatus: 'online' | 'degraded' | 'offline' = 'offline';
    
    // 2. MGO/Brent Price
    let mgoPrice = 0;
    let mgoStatus: 'online' | 'degraded' | 'offline' = 'offline';
    
    // 3. SST Anomaly
    let sstAnomaly: number | null = null;
    
    // 4. KAMIS domestic prices
    let mackerelLocalPrice: number | null = null;
    let squidLocalPrice: number | null = null;

    // Parallel fetch all APIs
    const [erResult, mgoResult, sstResult, mackerelResult, squidResult] = await Promise.allSettled([
      // Exchange rate
      fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } })
        .then(r => r.ok ? r.json() : null),
      // MGO via Brent proxy
      fetch('https://query2.finance.yahoo.com/v8/finance/chart/BZ%3DF?range=1d&interval=1d', { next: { revalidate: 3600 } })
        .then(r => r.ok ? r.json() : null),
      // NOAA SST
      fetchSSTAnomaly(),
      // KAMIS mackerel
      fetchKamisPrice('0261', '고등어'),
      // KAMIS squid
      fetchKamisPrice('0271', '오징어'),
    ]);

    // Process exchange rate
    if (erResult.status === 'fulfilled' && erResult.value?.rates?.KRW) {
      exchangeRate = erResult.value.rates.KRW;
      erStatus = 'online';
    }

    // Process MGO
    if (mgoResult.status === 'fulfilled' && mgoResult.value) {
      const close = mgoResult.value?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.[0];
      if (close) {
        mgoPrice = Math.round(close * 1.18 * 7.45 * 100) / 100;
        mgoStatus = 'online';
      }
    }

    // Process SST Anomaly
    if (sstResult.status === 'fulfilled' && sstResult.value !== null) {
      sstAnomaly = sstResult.value;
    }

    // Process KAMIS prices
    if (mackerelResult.status === 'fulfilled' && mackerelResult.value) {
      mackerelLocalPrice = mackerelResult.value;
    }
    if (squidResult.status === 'fulfilled' && squidResult.value) {
      squidLocalPrice = squidResult.value;
    }

    // ==========================================
    // [D3 FIX] Calculate fishing risk score dynamically
    // ==========================================
    // Formula: base from MGO cost pressure + SST anomaly amplifier
    const mgoRiskComponent = mgoPrice > 0 ? Math.min(50, Math.round((mgoPrice / 3000) * 50)) : 25;
    const sstRiskComponent = sstAnomaly !== null ? Math.min(50, Math.round(Math.abs(sstAnomaly) * 25)) : 15;
    const fishingRiskScore = Math.min(100, mgoRiskComponent + sstRiskComponent);

    // ==========================================
    // [D4/D5 FIX] Compute arbitrage with real/fallback prices
    // ==========================================
    const mackerelImportUsd = 1.85; // CIF 노르웨이산 고등어 (EUMOFA 기준)
    const squidImportUsd = 4.2;     // CIF 페루산 오징어 (UN Comtrade 기준)
    
    const mackerelLocal = mackerelLocalPrice || 3100; // KAMIS fallback
    const squidLocal = squidLocalPrice || 7800;       // KAMIS fallback
    
    const mackerelImportKrw = Math.round(mackerelImportUsd * exchangeRate);
    const squidImportKrw = Math.round(squidImportUsd * exchangeRate);

    // ==========================================
    // [D6 FIX] Compute margin tracker from latest consignment data
    // ==========================================
    // Calculate actual average auction price from the latest month's data
    const monthKeys = Object.keys(baseData.monthlyDetail || {}).sort();
    const latestMonth = monthKeys[monthKeys.length - 1];
    let localAuctionAvg = 4500; // fallback
    if (latestMonth && baseData.monthlyDetail[latestMonth]) {
      const monthData = baseData.monthlyDetail[latestMonth];
      const totalAmt = monthData.reduce((s: number, i: any) => s + (i.saleAmount || 0), 0);
      const totalQty = monthData.reduce((s: number, i: any) => s + (i.saleQty || 0), 0);
      if (totalQty > 0) {
        localAuctionAvg = Math.round(totalAmt / totalQty);
      }
    }
    // Retail markup estimated at 1.8~2.2x based on aT statistics
    const retailMultiplier = 2.0;
    const retailAvg = Math.round(localAuctionAvg * retailMultiplier);
    const marginSpread = retailAvg - localAuctionAvg;

    // ==========================================
    // [D1 FIX] Real network health check (limited)
    // ==========================================
    const networksStatus: Record<string, string> = {
      mof_consignment: 'online', // verified: data loaded from local JSON (해양수산부 공공데이터)
      kcs_customs: 'standby',    // not actively queried in this endpoint
      kamis_retail: mackerelLocalPrice || squidLocalPrice ? 'online' : 'standby',
      nifs_ocean: 'standby',     // not actively queried
      mgo_energy: mgoStatus,
      bok_exchange: erStatus,
      noaa_climate: sstAnomaly !== null ? 'online' : 'standby',
      fao_global: 'standby',     // not actively queried
      fbx_freight: 'standby'     // not actively queried
    };

    // ==========================================
    // Construct Live Intelligence Object
    // ==========================================
    const liveIntelligence = {
      timestamp: new Date().toISOString(),
      networksStatus,
      metrics: {
        exchangeRate: exchangeRate,
        isExchangeRateLive: erStatus === 'online',
        mgoPrice: mgoPrice || 2050,
        isMgoLive: mgoStatus === 'online',
        mgoBasis: mgoStatus === 'online'
          ? '브렌트유 선물 × 7.45(배럴→톤) × 1.18(MGO 정제 프리미엄) 프록시 산식'
          : '시세 조회 실패 — 고정 기준치 $2,050/MT 표시 중',
        seaTemperatureAnomaly: sstAnomaly ?? 0,
        isSstLive: sstAnomaly !== null,
        fishingRiskScore: fishingRiskScore,
        fishingRiskBasis: '자체 산식: MGO 비용 압력(최대 50점) + ONI 수온 편차(최대 50점) 합산 — 실측 출어 통계 아님',
        latestAuctionMonth: latestMonth || 'N/A',
        arbitrage: {
          basis: `수입단가 = CIF 고정 기준치(고등어 $${mackerelImportUsd}/kg EUMOFA 노르웨이산 · 오징어 $${squidImportUsd}/kg UN Comtrade 페루산) × 환율 — CIF는 실시간 시세 아님`,
          isImportLive: false,
          mackerel: {
            importPriceKrw: mackerelImportKrw,
            importCifUsd: mackerelImportUsd,
            localPriceKrw: mackerelLocal,
            signal: mackerelImportKrw < mackerelLocal ? 'IMPORT' : 'LOCAL_BUY',
            spreadPercent: Math.round(Math.abs((mackerelImportKrw - mackerelLocal) / mackerelLocal * 100)),
            isLocalLive: !!mackerelLocalPrice,
          },
          squid: {
            importPriceKrw: squidImportKrw,
            importCifUsd: squidImportUsd,
            localPriceKrw: squidLocal,
            signal: squidImportKrw < squidLocal ? 'IMPORT' : 'LOCAL_BUY',
            spreadPercent: Math.round(Math.abs((squidImportKrw - squidLocal) / squidLocal * 100)),
            isLocalLive: !!squidLocalPrice,
          }
        },
        retailMarginTracker: {
          localAuctionAvg: localAuctionAvg,
          retailAvg: retailAvg,
          marginSpread: marginSpread,
          retailMultiplier: retailMultiplier,
          isRetailEstimate: true,
          retailBasis: `추정 소매가 = 산지 위판가 × ${retailMultiplier} (aT 유통단계별 통계 기반 추정 계수) — aT 실측 소매가 아님`,
          status: marginSpread > 0 ? 'PROFITABLE' : 'NEGATIVE',
          dataSource: latestMonth ? `${latestMonth} 위판 실측 기반` : 'fallback'
        }
      }
    };

    baseData._liveIntelligence = liveIntelligence;

    return NextResponse.json(baseData);
  } catch (error) {
    console.error('Failed to read consignment_3year.json or fetch APIs:', error);
    return NextResponse.json({ error: 'Failed to load consignment intelligence data' }, { status: 500 });
  }
}
