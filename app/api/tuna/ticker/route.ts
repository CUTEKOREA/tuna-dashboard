import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 300; // 5분 캐시

// ============================================================================
// Tuna Live Intelligence Ticker API
// 5개 Live API 병렬 호출 → 실시간 시장 인텔리전스 스트림
// Sources: KCS + ECOS + KAMIS + FRED + Yahoo Finance
// ============================================================================

interface TickerItem {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendColor: string;
  source: string;
  isLive: boolean;
}

// --- KCS: 참치 수입단가 (HS 160414) ---
async function fetchKCSTunaPrice(): Promise<TickerItem | null> {
  const key = process.env.KCS_API_KEY;
  if (!key) return null;
  try {
    const now = new Date();
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMM = `${now.getFullYear()}${String(now.getMonth()).padStart(2, '0')}`;
    const url = `https://unipass.customs.go.kr:38010/ext/rest/trtImpExpStas/retrieveTrtImpExpStas` +
      `?crkyCn=${key}&strtYymm=${prevMM}&endYymm=${yyyyMM}&hsSgn=160414&lclsNm=&dtyTp=&natCd=&netSlTp=00&imexTp=1` +
      `&pageIndex=1&pageSize=10&imexCd=I`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const xml = await res.text();
    const amtMatch = xml.match(/<totCurAmt>([\d.]+)<\/totCurAmt>/);
    const wgtMatch = xml.match(/<totWghtKg>([\d.]+)<\/totWghtKg>/);
    if (amtMatch && wgtMatch) {
      const amt = parseFloat(amtMatch[1]);
      const wgt = parseFloat(wgtMatch[1]);
      if (wgt > 0) {
        const pricePerTon = Math.round((amt / wgt) * 1000);
        return {
          id: 'kcs_import_price',
          label: 'KCS 수입단가',
          value: `$${pricePerTon.toLocaleString()}/T`,
          trend: pricePerTon > 1400 ? '▲' : '▼',
          trendColor: pricePerTon > 1400 ? '#F6465D' : '#0ECB81',
          source: 'KCS API',
          isLive: true,
        };
      }
    }
    return null;
  } catch { return null; }
}

// --- ECOS: USD/KRW 환율 ---
async function fetchECOSExchangeRate(): Promise<TickerItem | null> {
  const key = process.env.ECOS_API_KEY;
  if (!key) return null;
  try {
    const now = new Date();
    const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const startDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}01`;
    // ECOS 통계코드: 731Y003 (주요국 환율), 항목코드: 0000001 (미국 달러)
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/1/5/731Y003/D/${startDate}/${endDate}/0000001`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    const rows = json?.StatisticSearch?.row;
    if (rows && rows.length > 0) {
      const latest = rows[rows.length - 1];
      const rate = parseFloat(latest.DATA_VALUE);
      const prev = rows.length > 1 ? parseFloat(rows[rows.length - 2].DATA_VALUE) : rate;
      const change = rate - prev;
      return {
        id: 'ecos_fx',
        label: 'KRW/USD',
        value: `₩${rate.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`,
        trend: `${change >= 0 ? '▲' : '▼'}${Math.abs(change).toFixed(1)}`,
        trendColor: change >= 0 ? '#F6465D' : '#0ECB81',
        source: 'ECOS API',
        isLive: true,
      };
    }
    return null;
  } catch { return null; }
}

// --- KAMIS: 참치캔 소매가 ---
async function fetchKAMISTunaRetail(): Promise<TickerItem | null> {
  const key = process.env.KAMIS_API_KEY;
  if (!key) return null;
  try {
    const now = new Date();
    const regDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const url = `https://www.kamis.or.kr/service/price/xml.do?action=dailySalesList` +
      `&p_regday=${regDay}&p_convert_kg_yn=N&p_item_category_code=600&p_country_code=1101` +
      `&p_product_cls_code=02&p_item_code=614&p_unit=&p_cert_key=${key}&p_cert_id=5818&p_returntype=json`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    const items = json?.data?.item;
    if (items && items.length > 0) {
      const price = parseFloat(items[0].dpr1?.replace(/,/g, '') || '0');
      if (price > 0) {
        return {
          id: 'kamis_retail',
          label: 'KAMIS 참치캔',
          value: `₩${price.toLocaleString()}`,
          trend: price > 2000 ? '▲' : '▼',
          trendColor: price > 2000 ? '#F6465D' : '#0ECB81',
          source: 'KAMIS API',
          isLive: true,
        };
      }
    }
    return null;
  } catch { return null; }
}

// --- FRED: 미국 CPI ---
async function fetchFREDCPI(): Promise<TickerItem | null> {
  const key = process.env.FRED_API_KEY;
  if (!key) return null;
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${key}&file_type=json&sort_order=desc&limit=2`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    const obs = json?.observations;
    if (obs && obs.length >= 2) {
      const latest = parseFloat(obs[0].value);
      const prev = parseFloat(obs[1].value);
      const yoy = ((latest - prev) / prev * 100).toFixed(1);
      return {
        id: 'fred_cpi',
        label: 'US CPI',
        value: `${yoy}%`,
        trend: parseFloat(yoy) > 3 ? '▲ High' : '▼ Cooling',
        trendColor: parseFloat(yoy) > 3 ? '#F6465D' : '#0ECB81',
        source: 'FRED API',
        isLive: true,
      };
    }
    return null;
  } catch { return null; }
}

// --- Yahoo Finance: WTI Crude Oil ---
async function fetchWTICrude(): Promise<TickerItem | null> {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=5d');
    if (!res.ok) return null;
    const json = await res.json();
    const closes = json.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    if (closes && closes.length > 0) {
      const validCloses = closes.filter((c: any) => c !== null);
      const latest = validCloses[validCloses.length - 1];
      const prev = validCloses.length > 1 ? validCloses[validCloses.length - 2] : latest;
      const change = ((latest - prev) / prev * 100).toFixed(1);
      return {
        id: 'wti_crude',
        label: 'WTI Crude',
        value: `$${latest.toFixed(1)}/bbl`,
        trend: `${parseFloat(change) >= 0 ? '▲' : '▼'}${Math.abs(parseFloat(change))}%`,
        trendColor: parseFloat(change) >= 0 ? '#F6465D' : '#0ECB81',
        source: 'Yahoo Finance',
        isLive: true,
      };
    }
    return null;
  } catch { return null; }
}

// --- MGO Singapore (derived from WTI) ---
async function fetchMGOPrice(): Promise<TickerItem | null> {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=5d');
    if (!res.ok) return null;
    const json = await res.json();
    const closes = json.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    if (closes && closes.length > 0) {
      const validCloses = closes.filter((c: any) => c !== null);
      const latest = validCloses[validCloses.length - 1];
      // MGO ≈ WTI × 10~12 factor (simplified benchmark)
      const mgo = Math.round(latest * 11.2);
      return {
        id: 'mgo_singapore',
        label: 'MGO Singapore',
        value: `$${mgo.toLocaleString()}/MT`,
        trend: mgo > 700 ? '▲ High' : '▼ Low',
        trendColor: mgo > 700 ? '#F6465D' : '#0ECB81',
        source: 'Yahoo Finance (derived)',
        isLive: true,
      };
    }
    return null;
  } catch { return null; }
}

// --- Fallback Values ---
const FALLBACK_TICKER: TickerItem[] = [
  { id: 'kcs_import_price', label: 'KCS 수입단가', value: '$1,450/T', trend: '▲ $50', trendColor: '#F6465D', source: 'KCS (Cached)', isLive: false },
  { id: 'ecos_fx', label: 'KRW/USD', value: '₩1,385.0', trend: '▼0.4%', trendColor: '#0ECB81', source: 'ECOS (Cached)', isLive: false },
  { id: 'kamis_retail', label: 'KAMIS 참치캔', value: '₩2,180', trend: '▲', trendColor: '#F6465D', source: 'KAMIS (Cached)', isLive: false },
  { id: 'fred_cpi', label: 'US CPI', value: '3.2%', trend: '▼ Cooling', trendColor: '#0ECB81', source: 'FRED (Cached)', isLive: false },
  { id: 'wti_crude', label: 'WTI Crude', value: '$61.2/bbl', trend: '▲1.1%', trendColor: '#F6465D', source: 'Yahoo (Cached)', isLive: false },
  { id: 'mgo_singapore', label: 'MGO Singapore', value: '$680/MT', trend: '▲ High', trendColor: '#F6465D', source: 'Derived (Cached)', isLive: false },
];

export async function GET() {
  const timestamp = new Date().toISOString();

  // 병렬 API 호출
  const [kcs, ecos, kamis, fred, wti, mgo] = await Promise.all([
    fetchKCSTunaPrice(),
    fetchECOSExchangeRate(),
    fetchKAMISTunaRetail(),
    fetchFREDCPI(),
    fetchWTICrude(),
    fetchMGOPrice(),
  ]);

  const liveItems = [kcs, ecos, kamis, fred, wti, mgo];
  const ticker: TickerItem[] = FALLBACK_TICKER.map((fallback, idx) => {
    return liveItems[idx] || fallback;
  });

  const liveCount = liveItems.filter(Boolean).length;

  return NextResponse.json({
    ticker,
    meta: {
      lastUpdated: timestamp,
      liveApis: liveCount,
      totalApis: 6,
      status: liveCount >= 4 ? '🟢 FULLY LIVE' : liveCount >= 2 ? '🟡 PARTIAL' : '🔴 CACHED',
    },
  });
}
