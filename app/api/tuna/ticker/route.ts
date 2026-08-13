import { NextResponse } from 'next/server';
import { requireEnv, optionalEnv } from '../../_shared/env';

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

  // 프록시 URL이 설정되어 있으면 프록시를 경유 (Vercel 배포 시 공공기관 IP 차단 우회용)
  if (proxyUrl) {
    // 프록시를 실제로 쓸 때만 시크릿을 읽는다. 위에서 읽으면 프록시를 안 쓰는
    // 경로(로컬·프리렌더)까지 PROXY_SECRET을 요구하게 된다.
    const proxySecret = requireEnv('PROXY_SECRET');
    const finalUrl = `${proxyUrl}/proxy?secret=${proxySecret}&url=${encodeURIComponent(targetUrl)}`;
    return fetch(finalUrl, { next: { revalidate: revalidateTime } });
  }
  
  // 로컬 등 프록시가 필요 없을 때는 직접 호출
  return fetch(targetUrl, { next: { revalidate: revalidateTime } });
}

// --- KCS: 참치 수입단가 (HS 160414) ---
async function fetchKCSTunaPrice(): Promise<TickerItem | null> {
  const key = optionalEnv('DATA_GO_KR_NEW_KEY');
  if (!key) return null;
  try {
    const now = new Date();
    // Query last 3 months to ensure we get data even if this month's data isn't published yet
    const past = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` +
      `?serviceKey=${key}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=030343`;
    
    // KCS Unipass blocks AWS/Vercel IPs, so we MUST use the GCP Cloud Run proxy (Seoul IP)
    // KCS Public Data Portal does not block Vercel IPs, so we bypass the proxy
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const xml = await res.text();
    
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    
    if (items.length > 0) {
      const monthlyTotals: Record<string, { amt: number, wgt: number }> = {};
      
      for (const match of items) {
        const itemStr = match[1];
        const yearMatch = itemStr.match(/<year>([\s\S]*?)<\/year>/);
        if (!yearMatch || yearMatch[1] === '총계') continue;
        
        const year = yearMatch[1];
        const impDlrMatch = itemStr.match(/<impDlr>([\d.]+)<\/impDlr>/);
        const impWghtMatch = itemStr.match(/<impWgt>([\d.]+)<\/impWgt>/);
        
        if (!monthlyTotals[year]) monthlyTotals[year] = { amt: 0, wgt: 0 };
        if (impDlrMatch) monthlyTotals[year].amt += parseFloat(impDlrMatch[1]);
        if (impWghtMatch) monthlyTotals[year].wgt += parseFloat(impWghtMatch[1]);
      }
      
      const sortedMonths = Object.keys(monthlyTotals).sort();
      if (sortedMonths.length > 0) {
        const latestMonth = sortedMonths[sortedMonths.length - 1];
        const { amt, wgt } = monthlyTotals[latestMonth];
        
        if (wgt > 0) {
          // amt is in $1000s, wgt is in KG. 
          // (amt * 1000) yields total USD. wgt is in KG.
          // Example: amt=100 -> $100,000. wgt=50,000 -> 50,000 KG = 50 Tonnes.
          // Price per Tonne = ($100,000 / 50) = $2000/T.
          // Formula: (amt * 1000) / (wgt / 1000)
          let pricePerTon = Math.round((amt * 1000) / (wgt / 1000));
          
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
  const key = optionalEnv('DATA_GO_KR_NEW_KEY');
  if (!key) return null;
  try {
    const now = new Date();
    // Query last 3 months
    const past = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` +
      `?serviceKey=${key}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=160414`;
    
    // KCS Public Data Portal does not block Vercel IPs, so we bypass the proxy
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const xml = await res.text();
    
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    
    if (items.length > 0) {
      const monthlyTotals: Record<string, { amt: number, wgt: number }> = {};
      
      for (const match of items) {
        const itemStr = match[1];
        const yearMatch = itemStr.match(/<year>([\s\S]*?)<\/year>/);
        if (!yearMatch || yearMatch[1] === '총계') continue;
        
        const year = yearMatch[1];
        const expDlrMatch = itemStr.match(/<expDlr>([\d.]+)<\/expDlr>/);
        const expWghtMatch = itemStr.match(/<expWgt>([\d.]+)<\/expWgt>/);
        
        if (!monthlyTotals[year]) monthlyTotals[year] = { amt: 0, wgt: 0 };
        if (expDlrMatch) monthlyTotals[year].amt += parseFloat(expDlrMatch[1]);
        if (expWghtMatch) monthlyTotals[year].wgt += parseFloat(expWghtMatch[1]);
      }
      
      const sortedMonths = Object.keys(monthlyTotals).sort();
      if (sortedMonths.length > 0) {
        const latestMonth = sortedMonths[sortedMonths.length - 1];
        const { amt, wgt } = monthlyTotals[latestMonth];
        
        if (wgt > 0) {
          let pricePerTon = Math.round((amt * 1000) / (wgt / 1000));
          if (pricePerTon > 10000) pricePerTon = Math.round(pricePerTon / 1000);
          if (pricePerTon < 100) pricePerTon = Math.round(pricePerTon * 1000);
          
          let change = 0;
          if (sortedMonths.length > 1) {
            const prevMonth = sortedMonths[sortedMonths.length - 2];
            const pAmt = monthlyTotals[prevMonth].amt;
            const pWgt = monthlyTotals[prevMonth].wgt;
            
            if (pWgt > 0) {
              let prevPrice = Math.round((pAmt * 1000) / (pWgt / 1000));
              if (prevPrice > 10000) prevPrice = Math.round(prevPrice / 1000);
              if (prevPrice < 100) prevPrice = Math.round(prevPrice * 1000);
              change = pricePerTon - prevPrice;
            }
          }
          
          return {
            id: 'kamis_retail', // Keep ID so frontend mappings don't break
            label: 'KCS 참치캔 수출',
            value: `$${pricePerTon.toLocaleString()}/T`,
            trend: `${change >= 0 ? '▲' : '▼'}$${Math.abs(change).toLocaleString()}`,
            trendColor: change >= 0 ? '#F6465D' : '#0ECB81',
            source: 'KCS API',
            isLive: true,
          };
        }
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

// --- Fallback Values (2026-05-20 갱신: Atuna 실측 + 환율·유가 시점 반영) ---
const FALLBACK_TICKER: TickerItem[] = [
  { id: 'kcs_import_price', label: 'KCS 수입단가', value: '$1,975/T', trend: '▼ -6%', trendColor: '#0ECB81', source: 'Atuna skjbkk 2026-05-06 (Cached)', isLive: false },
  { id: 'ecos_fx', label: 'KRW/USD', value: '₩1,400.0', trend: '▲0.4%', trendColor: '#F6465D', source: 'ECOS (Cached)', isLive: false },
  { id: 'kamis_retail', label: 'KCS 참치캔 수출', value: '$2,400/T', trend: '▲ $80', trendColor: '#F6465D', source: 'KCS (Cached)', isLive: false },
  { id: 'fred_cpi', label: 'US CPI', value: '3.0%', trend: '▼ Cooling', trendColor: '#0ECB81', source: 'FRED (Cached)', isLive: false },
  { id: 'wti_crude', label: 'WTI Crude', value: '$85.0/bbl', trend: '▲4.2%', trendColor: '#F6465D', source: 'Yahoo (Cached, 호르무즈 위기 반영)', isLive: false },
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
