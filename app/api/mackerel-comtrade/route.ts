import { NextResponse } from 'next/server';

/**
 * UN Comtrade 글로벌 고등어 무역 흐름 API 
 * GET /api/mackerel-comtrade
 * 
 * 용도: 고등어(HS 030354) 주요 수출국 vs 수입국 간의 교역 매트릭스
 */

// 주요국 영문 desc → 한글 매핑 (L-01: 사용자 노출 문자열 한글화)
const KO_COUNTRY: Record<string, string> = {
  'Norway': '노르웨이', 'United Kingdom': '영국', 'Ireland': '아일랜드',
  'China': '중국', 'Japan': '일본', 'Rep. of Korea': '한국', 'Korea, Rep.': '한국',
  'Netherlands': '네덜란드', 'Nigeria': '나이지리아', 'Thailand': '태국',
  'Germany': '독일', 'France': '프랑스', 'Spain': '스페인', 'Denmark': '덴마크',
  'USA': '미국', 'United States of America': '미국', 'Morocco': '모로코',
  'Peru': '페루', 'Mauritania': '모리타니', 'European Union': 'EU',
};

const FALLBACK_FLOW = [
  { source: '노르웨이', target: 'EU', value: 85000 },
  { source: '노르웨이', target: '중국', value: 45000 },
  { source: '노르웨이', target: '일본', value: 38000 },
  { source: '노르웨이', target: '한국', value: 35000 },
  { source: '영국', target: '나이지리아', value: 25000 },
  { source: '영국', target: '네덜란드', value: 18000 },
  { source: '아일랜드', target: '나이지리아', value: 15000 },
  { source: '중국', target: '태국', value: 12000 },
];

export async function GET() {
  let isLive = false;
  let flows: { source: string; target: string; value: number }[] = FALLBACK_FLOW;

  try {
    // 2026-06-05 2차수정: premium(data/v1/get+키) 실패 확인 → working 형제 beef/korea-imports의 무료 preview 엔드포인트로 전환.
    // 주요 고등어 교역국 한정(노르웨이578·중국156·한국410·일본392, preview 레코드 한도 고려해 4개국). partnerCode 미지정=전 파트너.
    const REPORTERS = '578,156,410,392';
    const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?cmdCode=030354&reporterCode=${REPORTERS}&period=2023&flowCode=M,X`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });

    if (res.ok) {
      const json = await res.json();
      const rows: any[] = Array.isArray(json?.data) ? json.data : [];
      // 수출(X): reporter=수출국(source), partner=수입국(target)
      // 수입(M): partner=수출국(source), reporter=수입국(target)
      const parsed = rows
        .filter((r) => r.partnerCode && r.partnerCode !== 0 && Number(r.primaryValue) > 0)
        .map((r) => {
          const isExport = String(r.flowCode) === 'X';
          const srcDesc = isExport ? String(r.reporterDesc ?? '') : String(r.partnerDesc ?? '');
          const tgtDesc = isExport ? String(r.partnerDesc ?? '') : String(r.reporterDesc ?? '');
          return {
            source: KO_COUNTRY[srcDesc] || srcDesc || String(r.partnerCode),
            target: KO_COUNTRY[tgtDesc] || tgtDesc || String(r.reporterCode),
            value: Math.round(Number(r.primaryValue)),
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 12);
      // 실 파싱 데이터가 있을 때만 isLive=true (L-09: 미파싱 응답에 라이브 라벨 금지)
      if (parsed.length > 0) {
        flows = parsed;
        isLive = true;
      }
    }
  } catch (e) {
    console.warn('[UN Comtrade mackerel] 연동 실패, Fallback 데이터 사용');
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    isLive,
    source: isLive
      ? 'UN Comtrade API (HS 030354 실시간 파싱)'
      : 'UN Comtrade Fallback (HS 030354 정적 매핑)',
    tradeFlows: flows,
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
