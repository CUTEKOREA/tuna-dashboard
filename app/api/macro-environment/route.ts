import { NextResponse } from 'next/server';

// ============================================================================
// Phase 0: 글로벌 환경 스캔 API — ECOS + FRED + KOTRA
// POST /api/macro-environment
// ============================================================================

const ECOS_BASE = 'https://ecos.bok.or.kr/api';
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
const KOTRA_BASE = 'https://apis.data.go.kr/B551170';

// --- ECOS: 한국은행 환율 조회 ---
async function fetchECOSExchangeRate(targetCurrency: string) {
  const apiKey = process.env.ECOS_API_KEY;
  if (!apiKey) return null;

  // 환율 통계표 코드: 731Y001, 항목: 0000001 (매매기준율)
  const currencyMap: Record<string, string> = {
    'USD': '0000001', 'JPY': '0000002', 'EUR': '0000003',
    'CNY': '0000053', 'GBP': '0000005', 'THB': '0000016',
    'VND': '0000055', 'IDR': '0000017',
  };

  const itemCode = currencyMap[targetCurrency] || currencyMap['USD'];
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
  const startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');

  const url = `${ECOS_BASE}/StatisticSearch/${apiKey}/json/kr/1/30/731Y001/D/${startDate}/${endDate}/${itemCode}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const rows = data?.StatisticSearch?.row;
    if (!rows || rows.length === 0) return null;

    const latest = rows[rows.length - 1];
    const trend = rows.slice(-20).map((r: any) => ({
      date: r.TIME,
      rate: parseFloat(r.DATA_VALUE),
    }));

    return {
      currency: targetCurrency,
      currentRate: parseFloat(latest.DATA_VALUE),
      date: latest.TIME,
      trend,
      source: 'ECOS_LIVE',
    };
  } catch (e) {
    console.warn('[ECOS] Error:', e);
    return null;
  }
}

// --- FRED: 미국 금리 & CPI ---
async function fetchFREDSeries(seriesId: string, limit: number = 12) {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return null;

  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const obs = data?.observations;
    if (!obs || obs.length === 0) return null;

    return {
      seriesId,
      latest: { date: obs[0].date, value: parseFloat(obs[0].value) },
      trend: obs.reverse().map((o: any) => ({ date: o.date, value: parseFloat(o.value) })),
      source: 'FRED_LIVE',
    };
  } catch (e) {
    console.warn('[FRED] Error:', e);
    return null;
  }
}

// --- KOTRA: 해외시장 뉴스 ---
async function fetchKOTRAMarketNews(countryCode: string) {
  const apiKey = process.env.DATA_GO_KR_NEW_KEY;
  if (!apiKey) return [];

  const kotraCountryMap: Record<string, string> = {
    '중국': 'CN', '베트남': 'VN', '태국': 'TH', '인도네시아': 'ID',
    '미국': 'US', '일본': 'JP', '인도': 'IN', '노르웨이': 'NO',
  };
  const code = kotraCountryMap[countryCode] || countryCode;

  const url = `${KOTRA_BASE}/overseasMarketNews?serviceKey=${apiKey}&numOfRows=5&pageNo=1&type=json&search4=${code}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.response?.body?.items?.item || data?.items || [];

    return (Array.isArray(items) ? items : [items]).slice(0, 5).map((item: any) => ({
      title: item.TITLE || item.title || 'N/A',
      date: item.WRITE_DATE || item.write_date || 'N/A',
      country: item.NATY_NM || item.natn_nm || code,
      summary: (item.CONTENT || item.content || '').substring(0, 200),
      source: 'KOTRA_LIVE',
    }));
  } catch (e) {
    console.warn('[KOTRA News] Error:', e);
    return [];
  }
}

// --- KOTRA: 국가별 물가정보 ---
async function fetchKOTRAPriceInfo(countryCode: string) {
  const apiKey = process.env.DATA_GO_KR_NEW_KEY;
  if (!apiKey) return null;

  const kotraCountryMap: Record<string, string> = {
    '중국': 'CN', '베트남': 'VN', '태국': 'TH', '인도네시아': 'ID',
    '미국': 'US', '일본': 'JP', '인도': 'IN',
  };
  const code = kotraCountryMap[countryCode] || countryCode;

  const url = `${KOTRA_BASE}/priceInfoByNatn?serviceKey=${apiKey}&numOfRows=10&pageNo=1&type=json&search1=${code}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.response?.body?.items?.item || data?.items || [];

    return {
      country: countryCode,
      prices: (Array.isArray(items) ? items : [items]).slice(0, 10).map((item: any) => ({
        itemName: item.ITEM_NM || item.item_nm || 'N/A',
        price: item.PRICE || item.price || 'N/A',
        unit: item.UNIT || item.unit || '',
        currency: item.CURNCY || item.curncy || 'USD',
      })),
      source: 'KOTRA_LIVE',
    };
  } catch (e) {
    console.warn('[KOTRA Price] Error:', e);
    return null;
  }
}

// --- Main Handler ---
export async function POST(req: Request) {
  try {
    const { country } = await req.json();
    if (!country) {
      return NextResponse.json({ error: 'country is required' }, { status: 400 });
    }

    // Currency mapping for ECOS
    const countryCurrencyMap: Record<string, string> = {
      '중국': 'CNY', '베트남': 'VND', '태국': 'THB', '인도네시아': 'IDR',
      '미국': 'USD', '일본': 'JPY', '인도': 'USD', '노르웨이': 'EUR',
    };
    const targetCurrency = countryCurrencyMap[country] || 'USD';

    // Parallel API calls
    const [exchangeRate, fedRate, cpi, marketNews, priceInfo] = await Promise.all([
      fetchECOSExchangeRate(targetCurrency),
      fetchFREDSeries('DFF', 12),       // Federal Funds Rate
      fetchFREDSeries('CPIAUCSL', 12),   // CPI
      fetchKOTRAMarketNews(country),
      fetchKOTRAPriceInfo(country),
    ]);

    return NextResponse.json({
      country,
      exchangeRate,
      fedRate,
      cpi,
      marketNews,
      priceInfo,
      _meta: {
        dataSources: ['ECOS (한국은행)', 'FRED (미연준)', 'KOTRA (해외시장뉴스)', 'KOTRA (물가정보)'],
        timestamp: new Date().toISOString(),
        mockDataUsed: false,
      }
    });
  } catch (error: any) {
    console.error('[Macro Environment] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
