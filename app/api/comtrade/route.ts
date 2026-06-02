import { NextResponse } from 'next/server';

/**
 * UN Comtrade 글로벌 무역 흐름 API
 * POST /api/comtrade
 *
 * Payload:
 * {
 *   cmdCode: string, // HS Code (e.g., '030232' for yellowfin tuna, '160414' for prepared tuna)
 *   reporterCode?: string, // 'all' or UN country code
 *   partnerCode?: string,  // 'all' or UN country code
 *   period?: string,       // '2023' or '2024'
 *   flowCode?: string      // 'M' for import, 'X' for export, 'M,X' for both
 * }
 */

// 주요국 영문 desc → 한글 매핑 (라이브 파싱 시 L-01 한글화)
const KO_COUNTRY: Record<string, string> = {
  'USA': '미국', 'United States of America': '미국', 'Japan': '일본', 'Rep. of Korea': '한국',
  'Korea, Rep.': '한국', 'China': '중국', 'Thailand': '태국', 'Viet Nam': '베트남',
  'Indonesia': '인도네시아', 'Mexico': '멕시코', 'Spain': '스페인', 'Ecuador': '에콰도르',
  'Philippines': '필리핀', 'Taiwan': '대만', 'Other Asia, nes': '대만', 'Panama': '파나마',
  'EU': 'EU', 'France': '프랑스', 'Italy': '이탈리아', 'Germany': '독일', 'Malta': '몰타',
};

const FALLBACK_FLOWS: Record<string, any> = {
  '160414': [
    { source: '태국', target: '미국', value: 850000 },
    { source: '태국', target: '일본', value: 320000 },
    { source: '에콰도르', target: 'EU', value: 540000 },
    { source: '인도네시아', target: '미국', value: 210000 },
    { source: '중국', target: 'EU', value: 150000 },
    { source: '베트남', target: '미국', value: 120000 },
  ],
  '030232': [
    { source: '한국', target: '일본', value: 18000 },
    { source: '한국', target: '태국', value: 15000 },
    { source: '대만', target: '일본', value: 25000 },
    { source: '스페인', target: 'EU', value: 35000 },
  ]
};

export async function POST(req: Request) {
  let isLive = false;
  let flows: any[] = [];
  
  try {
    const body = await req.json();
    const { 
      cmdCode = '160414', 
      reporterCode = 'all', 
      partnerCode = 'all', 
      period = '2023', 
      flowCode = 'M,X' 
    } = body;

    flows = FALLBACK_FLOWS[cmdCode] || FALLBACK_FLOWS['160414'];

    const comtradeKey = process.env.UN_COMTRADE_PRIMARY_KEY;
    const url = comtradeKey && comtradeKey !== 'pending_issuance'
      ? `https://comtradeapi.un.org/data/v1/get/C/A/HS?cmdCode=${cmdCode}&reporterCode=${reporterCode}&partnerCode=${partnerCode}&period=${period}&flowCode=${flowCode}`
      : `https://comtradeapi.un.org/public/v1/preview/C/A/HS?cmdCode=${cmdCode}&period=${period}&flowCode=${flowCode}`;
    const res = await fetch(url, {
      headers: comtradeKey && comtradeKey !== 'pending_issuance' ? { 'Ocp-Apim-Subscription-Key': comtradeKey } : {},
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const json = await res.json();
      const rows: any[] = Array.isArray(json?.data) ? json.data : [];
      // 실제 응답을 flows로 파싱: 수입(M)은 partner=수출원산지(source)→reporter=수입국(target)
      const parsed = rows
        .filter((r) => r.partnerCode && r.partnerCode !== 0 && Number(r.primaryValue) > 0)
        .map((r) => ({
          source: KO_COUNTRY[String(r.partnerDesc)] || r.partnerDesc || String(r.partnerCode),
          target: KO_COUNTRY[String(r.reporterDesc)] || r.reporterDesc || String(r.reporterCode),
          value: Math.round(Number(r.primaryValue)),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12);
      // 파싱된 실데이터가 있을 때만 isLive=true (L-09: 미파싱 응답에 라이브 라벨 금지)
      if (parsed.length > 0) {
        flows = parsed;
        isLive = true;
      }
    }
  } catch (e) {
    console.warn('[UN Comtrade] 연동 실패, Fallback 데이터 사용');
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    isLive,
    source: isLive ? 'UN Comtrade API (실시간 파싱)' : 'UN Comtrade Fallback (정적 예시)',
    tradeFlows: flows,
    meta: {
      reliability: { grade: isLive ? 'S' : 'B', score: isLive ? 98 : 75 }
    }
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
