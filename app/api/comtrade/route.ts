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

/** 이 구독 경로는 상대국 목록을 명시해야 국가별 행을 준다. 참치·수산 주요 공급국이다. */
const DEFAULT_PARTNERS = ['764', '218', '156', '704', '360', '608', '842', '392', '604'].join(',');

/** 응답의 partnerDesc 가 비어 오는 일이 있다. 코드로도 이름을 찾을 수 있게 둔다. */
const PARTNER_NAME: Record<string, string> = {
  '764': '태국', '218': '에콰도르', '156': '중국', '704': '베트남', '360': '인도네시아',
  '608': '필리핀', '842': '미국', '392': '일본', '604': '페루', '410': '대한민국',
};

export async function POST(req: Request) {
  let isLive = false;
  let flows: any[] = [];
  
  try {
    const body = await req.json();
    const { 
      cmdCode = '160414', 
      // 2026-09-12 실측. 이 구독 경로는 `all` 을 신고국·상대국 어느 쪽에서도 받지 않는다(둘 다 HTTP 400).
      // 예전 기본값이 양쪽 다 'all' 이라 구독 키가 있어도 항상 400 → 아래 정적 폴백으로 떨어졌다.
      // 상대국을 0(세계 총계)으로 두면 200 이 오지만 이 화면은 국가→국가 흐름도라
      // 파서가 상대국 0 행을 버린다. 그래서 주요 공급국을 명시적으로 나열한다.
      reporterCode = '410', 
      partnerCode = DEFAULT_PARTNERS, 
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
      let rows: any[] = Array.isArray(json?.data) ? json.data : [];
      // 공개 preview 경로는 reporterCode 를 받지 않는다. 거르지 않으면 엉뚱한 나라 행이
      // 「한국 기준」인 것처럼 isLive 로 올라간다.
      if (!(comtradeKey && comtradeKey !== 'pending_issuance')) {
        rows = rows.filter((r) => String(r.reporterCode) === String(reporterCode));
      }
      // 실제 응답을 flows로 파싱: 수입(M)은 partner=수출원산지(source)→reporter=수입국(target)
      const parsed = rows
        .filter((r) => r.partnerCode && r.partnerCode !== 0 && Number(r.primaryValue) > 0)
        .map((r) => ({
          source:
            KO_COUNTRY[String(r.partnerDesc)] ||
            r.partnerDesc ||
            PARTNER_NAME[String(r.partnerCode)] ||
            String(r.partnerCode),
          target:
            KO_COUNTRY[String(r.reporterDesc)] ||
            r.reporterDesc ||
            PARTNER_NAME[String(r.reporterCode)] ||
            String(r.reporterCode),
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
  } catch {
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
