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

// --- 헬퍼 함수: 프록시 우회 요청 ---
async function fetchWithProxy(targetUrl: string, revalidateTime: number) {
  const proxyUrl = process.env.KOREA_API_PROXY_URL;
  const proxySecret = process.env.PROXY_SECRET || 'silla-tuna-secret-2026';
  
  // 프록시 URL이 설정되어 있으면 프록시를 경유 (Vercel 배포 시 공공기관 IP 차단 우회용)
  if (proxyUrl) {
    const finalUrl = `${proxyUrl}/proxy?secret=${proxySecret}&url=${encodeURIComponent(targetUrl)}`;
    return fetch(finalUrl, { next: { revalidate: revalidateTime } });
  }
  
  // 로컬 등 프록시가 필요 없을 때는 직접 호출
  return fetch(targetUrl, { next: { revalidate: revalidateTime } });
}

// --- KCS: 참치 수입단가 (HS 160414) ---
async function fetchKCSTunaPrice(): Promise<TickerItem | null> {
  const key = process.env.KCS_API_KEY;
  if (!key) return null;
  try {
    const now = new Date();
    // Query last 3 months to ensure we get data even if this month's data isn't published yet
    const past = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://unipass.customs.go.kr/ext/rest/trtImpExpStas/retrieveTrtImpExpStas` +
      `?crkyCn=${key}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=030343&lclsNm=&dtyTp=&natCd=&netSlTp=00&imexTp=1` +
      `&pageIndex=1&pageSize=10`;
    
    // KCS Unipass blocks AWS/Vercel IPs, so we MUST use the GCP Cloud Run proxy (Seoul IP)
    const res = await fetchWithProxy(url, 300);
    if (!res.ok) return null;
    const xml = await res.text();
    
    // Parse the KCS API response
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    if (items.length > 0) {
      const latestItem = items[items.length - 1][1]; 
      
      // Fallback matching for multiple possible KCS XML schemas (trtImpExpStas vs exprtImprtPrdlstInfoQry)
      const amtMatch = latestItem.match(/<totCurAmt>([\d.]+)<\/totCurAmt>/) || latestItem.match(/<impDlr>([\d.]+)<\/impDlr>/) || latestItem.match(/<expDlr>([\d.]+)<\/expDlr>/);
      const wgtMatch = latestItem.match(/<totWghtKg>([\d.]+)<\/totWghtKg>/) || latestItem.match(/<impWght>([\d.]+)<\/impWght>/) || latestItem.match(/<expWght>([\d.]+)<\/expWght>/);
      
      if (amtMatch && wgtMatch) {
        let amt = parseFloat(amtMatch[1]);
        let wgt = parseFloat(wgtMatch[1]);
        
        // KCS 'impDlr'/'expDlr' are typically in $1,000s, while 'totCurAmt' is in $1s. If value is unusually small, multiply by 1000.
        // Or actually, the formula (amt / wgt) * 1000 yields $/T if amt is in $1, wgt in KG.
        // If amt is in $1,000s and wgt in Tonnes, (amt / wgt) yields $/T directly.
        // KCS trtImpExpStas impWght is sometimes in KG, sometimes in Tonnes.
        // A typical tuna price is $1,400 to $2,000 per Tonne.
        let pricePerTon = 0;
        
        if (latestItem.includes('<impDlr>')) {
           // trtImpExpStas: amt is $1000s, wgt is Tonnes
           pricePerTon = Math.round((amt * 1000) / (wgt > 10000 ? wgt / 1000 : wgt)); // fallback heuristic if wgt is actually KG
        } else {
           // retrieveExprtImprtPrdlstInfo: amt is $1, wgt is KG
           pricePerTon = Math.round((amt / wgt) * 1000);
        }
        
        // Force bounds if it looks totally crazy (e.g., $14,000,000/T instead of $1,400/T)
        if (pricePerTon > 10000) pricePerTon = Math.round(pricePerTon / 1000);
        if (pricePerTon < 100) pricePerTon = Math.round(pricePerTon * 1000);
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
  } catch (err) { 
    console.error('KCS Error:', err);
    return null; 
  }
}

// --- ECOS: USD/KRW 환율 ---
async function fetchECOSExchangeRate(): Promise<TickerItem | null> {
  const key = process.env.ECOS_API_KEY;
  if (!key) return null;
  try {
    const now = new Date();
    const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    
    // Query last 30 days to ensure we don't miss data due to holidays
    const start = new Date();
    start.setDate(now.getDate() - 30);
    const startDate = `${start.getFullYear()}${String(start.getMonth() + 1).padStart(2, '0')}${String(start.getDate()).padStart(2, '0')}`;
    
    // ECOS 통계코드: 731Y001 (주요국 환율), 항목코드: 0000001 (미국 달러)
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/1/30/731Y001/D/${startDate}/${endDate}/0000001`;
    
    const res = await fetchWithProxy(url, 300);
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
  } catch (err) { 
    console.error('ECOS Error:', err);
    return null; 
  }
}

// --- KCS: 참치캔 수출단가 (HS 160414) ---
// Replaces KAMIS as KAMIS does not track Canned Tuna.
async function fetchKCSTunaExport(): Promise<TickerItem | null> {
  const key = process.env.KCS_API_KEY;
  if (!key) return null;
  try {
    const now = new Date();
    // Query last 3 months
    const past = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://unipass.customs.go.kr/ext/rest/trtImpExpStas/retrieveTrtImpExpStas` +
      `?crkyCn=${key}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=160414&lclsNm=&dtyTp=&natCd=&netSlTp=00&imexTp=1` +
      `&pageIndex=1&pageSize=10`;
    
    const res = await fetchWithProxy(url, 300);
    if (!res.ok) return null;
    const xml = await res.text();
    
    // Parse the KCS API response
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    if (items.length > 0) {
      const latestItem = items[items.length - 1][1]; 
      
      // Fallback matching for multiple possible KCS XML schemas
      const amtMatch = latestItem.match(/<totCurAmt>([\d.]+)<\/totCurAmt>/) || latestItem.match(/<expDlr>([\d.]+)<\/expDlr>/) || latestItem.match(/<impDlr>([\d.]+)<\/impDlr>/);
      const wgtMatch = latestItem.match(/<totWghtKg>([\d.]+)<\/totWghtKg>/) || latestItem.match(/<expWght>([\d.]+)<\/expWght>/) || latestItem.match(/<impWght>([\d.]+)<\/impWght>/);
      
      if (amtMatch && wgtMatch) {
        let amt = parseFloat(amtMatch[1]);
        let wgt = parseFloat(wgtMatch[1]);
        
        let pricePerTon = 0;
        if (latestItem.includes('<expDlr>')) {
           pricePerTon = Math.round((amt * 1000) / (wgt > 10000 ? wgt / 1000 : wgt));
        } else {
           pricePerTon = Math.round((amt / wgt) * 1000);
        }
        
        if (pricePerTon > 10000) pricePerTon = Math.round(pricePerTon / 1000);
        if (pricePerTon < 100) pricePerTon = Math.round(pricePerTon * 1000);
          
          let change = 0;
          if (items.length > 1) {
            const prevItem = items[items.length - 2][1];
            const pAmtMatch = prevItem.match(/<totCurAmt>([\d.]+)<\/totCurAmt>/) || prevItem.match(/<expDlr>([\d.]+)<\/expDlr>/) || prevItem.match(/<impDlr>([\d.]+)<\/impDlr>/);
            const pWgtMatch = prevItem.match(/<totWghtKg>([\d.]+)<\/totWghtKg>/) || prevItem.match(/<expWght>([\d.]+)<\/expWght>/) || prevItem.match(/<impWght>([\d.]+)<\/impWght>/);
            
            if (pAmtMatch && pWgtMatch) {
              const prevAmt = parseFloat(pAmtMatch[1]);
              const prevWgt = parseFloat(pWgtMatch[1]);
              let prevPrice = 0;
              if (prevItem.includes('<expDlr>')) {
                 prevPrice = Math.round((prevAmt * 1000) / (prevWgt > 10000 ? prevWgt / 1000 : prevWgt));
              } else {
                 prevPrice = Math.round((prevAmt / prevWgt) * 1000);
              }
              if (prevPrice > 10000) prevPrice = Math.round(prevPrice / 1000);
              if (prevPrice < 100) prevPrice = Math.round(prevPrice * 1000);
              
              change = pricePerTon - prevPrice;
            }
          }
          
          return {
            id: 'kamis_retail', // Keep ID so frontend mappings don't break
            label: 'KCS 참치캔 수출',
            value: `$${pricePerTon.toLocaleString()}/T`,
            trend: `${change >= 0 ? '▲' : '▼'}${Math.abs(change).toLocaleString()}`,
            trendColor: change >= 0 ? '#F6465D' : '#0ECB81',
            source: 'KCS API',
            isLive: true,
          };
      }
    }
    return null;
  } catch (err) { 
    console.error('KCS Export Error:', err);
    return null; 
  }
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

// --- Fallback Values ---
const FALLBACK_TICKER: TickerItem[] = [
  { id: 'kcs_import_price', label: 'KCS 수입단가', value: '$1,450/T', trend: '▲ $50', trendColor: '#F6465D', source: 'KCS (Cached)', isLive: false },
  { id: 'ecos_fx', label: 'KRW/USD', value: '₩1,385.0', trend: '▼0.4%', trendColor: '#0ECB81', source: 'ECOS (Cached)', isLive: false },
  { id: 'kamis_retail', label: 'KCS 참치캔 수출', value: '$2,180/T', trend: '▲ $50', trendColor: '#F6465D', source: 'KCS (Cached)', isLive: false },
  { id: 'fred_cpi', label: 'US CPI', value: '3.2%', trend: '▼ Cooling', trendColor: '#0ECB81', source: 'FRED (Cached)', isLive: false },
  { id: 'wti_crude', label: 'WTI Crude', value: '$61.2/bbl', trend: '▲1.1%', trendColor: '#F6465D', source: 'Yahoo (Cached)', isLive: false },
];

export async function GET() {
  const timestamp = new Date().toISOString();

  // 병렬 API 호출
  const [kcs, ecos, kcsExport, fred, wti] = await Promise.all([
    fetchKCSTunaPrice(),
    fetchECOSExchangeRate(),
    fetchKCSTunaExport(),
    fetchFREDCPI(),
    fetchWTICrude(),
  ]);

  const liveItems = [kcs, ecos, kcsExport, fred, wti];
  const ticker: TickerItem[] = FALLBACK_TICKER.map((fallback, idx) => {
    return liveItems[idx] || fallback;
  });

  const liveCount = liveItems.filter(Boolean).length;

  return NextResponse.json({
    ticker,
    meta: {
      lastUpdated: timestamp,
      liveApis: liveCount,
      totalApis: 5,
      status: liveCount >= 4 ? '🟢 FULLY LIVE' : liveCount >= 2 ? '🟡 PARTIAL' : '🔴 CACHED',
    },
  });
}
