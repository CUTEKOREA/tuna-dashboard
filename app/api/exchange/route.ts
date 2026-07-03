import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 환율 API — open.er-api.com (무료·무키 공개 API).
 * L-10 참고: 이 라우트는 API 키 자체가 불필요하므로 process.env fallback 키 패턴 비대상.
 */

// 하드코딩 캐시 fallback의 실제 기준일.
// 2026-05-13 = repo history 재작성 커밋일 — 이 캐시값(1455.75 등)이 존재했음이
// 증명 가능한 가장 이른 날짜. fallback 응답에 "오늘" 날짜를 찍지 않는다 (정직 표기).
const FALLBACK_AS_OF = '2026-05-13';

/** 오늘(UTC) − dataAsOf 일수. 파싱 실패 시 -1. */
function staleDaysFrom(dataAsOf: string): number {
  const asOf = new Date(`${dataAsOf}T00:00:00Z`).getTime();
  if (Number.isNaN(asOf)) return -1;
  return Math.max(0, Math.floor((Date.now() - asOf) / 86_400_000));
}

function fallbackResponse() {
  return NextResponse.json({
    usd_krw: 1455.75,
    usd_jpy: 152.50,
    eur_krw: 1600.50,
    nok_krw: 135.20,
    date: FALLBACK_AS_OF.replace(/-/g, '.'),
    source: 'fallback',
    // L-12 표준 필드 — fallback은 정직하게 isLive: false
    isLive: false,
    dataAsOf: FALLBACK_AS_OF,
    staleDays: staleDaysFrom(FALLBACK_AS_OF),
  });
}

export async function GET() {
  try {
    // Try exchangerate-api (free tier)
    const res = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (res.ok) {
      const data = await res.json();
      const krwRate = data.rates?.KRW;
      const jpyRate = data.rates?.JPY;
      const eurRate = data.rates?.EUR;
      const nokRate = data.rates?.NOK;

      if (krwRate) {
        // 데이터의 실제 기준일 = API가 알려주는 최종 갱신일 (응답 생성일 아님)
        const dataAsOf = data.time_last_update_utc
          ? new Date(data.time_last_update_utc).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);

        return NextResponse.json({
          usd_krw: Math.round(krwRate * 100) / 100,
          usd_jpy: jpyRate ? Math.round(jpyRate * 100) / 100 : null,
          eur_krw: eurRate ? Math.round((krwRate / eurRate) * 100) / 100 : null, // 결측 시 null — live 응답에 캐시값 혼입 금지
          nok_krw: nokRate ? Math.round((krwRate / nokRate) * 100) / 100 : null,
          date: dataAsOf.replace(/-/g, '.'),
          source: 'er-api',
          // L-12 표준 필드
          isLive: true,
          dataAsOf,
          staleDays: staleDaysFrom(dataAsOf),
        });
      }
    }

    // Fallback — 실제 캐시 기준일 표기 (오늘 날짜 위장 금지)
    return fallbackResponse();
  } catch {
    return fallbackResponse();
  }
}
