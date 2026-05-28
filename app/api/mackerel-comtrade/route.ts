import { NextResponse } from 'next/server';

/**
 * UN Comtrade 글로벌 고등어 무역 흐름 API 
 * GET /api/mackerel-comtrade
 * 
 * 용도: 고등어(HS 030354) 주요 수출국 vs 수입국 간의 교역 매트릭스
 */

const FALLBACK_FLOW = [
  { source: '노르웨이→EU', value: 85000 },
  { source: '노르웨이→중국', value: 45000 },
  { source: '노르웨이→일본', value: 38000 },
  { source: '노르웨이→한국', value: 35000 },
  { source: '영국→나이지리아', value: 25000 },
  { source: '영국→네덜란드', value: 18000 },
  { source: '아일랜드→나이지리아', value: 15000 },
  { source: '중국→태국', value: 12000 },
];

export async function GET() {
  const isLive = false;
  const flows = FALLBACK_FLOW;

  try {
    const comtradeKey = process.env.UN_COMTRADE_PRIMARY_KEY;
    if (comtradeKey && comtradeKey !== 'pending_issuance') {
      // UN Comtrade Premium API (HS 030354)
      const url = 'https://comtradeapi.un.org/data/v1/get/C/A/HS?cmdCode=030354&reporterCode=all&partnerCode=all&period=2023&flowCode=M,X';
      const res = await fetch(url, { 
        headers: { "Ocp-Apim-Subscription-Key": comtradeKey },
        signal: AbortSignal.timeout(5000) 
      });
      
      if (res.ok) {
        // NOTE: 응답 body 파싱 미구현. API 연결만 확인되었을 뿐 실제 데이터는 fallback 배열을 사용.
        // 정직한 라벨링: 연결만 확인된 상태는 Live가 아닌 'connected fallback'.
        // 실 파싱 구현 전까지 isLive = false 유지.
      }
    } else {
      // UN Comtrade Public API 연결 확인만 (Public API는 response 형식 다름, 파싱 미구현)
      const url = 'https://comtradeapi.un.org/public/v1/preview/C/A/HS?cmdCode=030354';
      await fetch(url, { signal: AbortSignal.timeout(5000) }).catch(() => null);
    }
  } catch (e) {
    console.warn('[UN Comtrade] 연동 실패, Fallback 데이터 사용');
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    isLive,
    source: 'UN Comtrade Fallback (HS 030354 정적 매핑, API 파싱 미구현)',
    tradeFlows: flows
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
