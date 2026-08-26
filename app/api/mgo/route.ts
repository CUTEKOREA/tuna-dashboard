import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * MGO(선박용 경유) 가격 — 주의: 실호가가 아닌 **Brent 선물 환산 추정치**.
 *
 * 환산 로직 (isEstimate: true 로 정직 표기):
 *   - MGO는 통상 Brent 대비 ~80-90% 프리미엄에 거래 → 계수 1.85
 *   - 1 MT ≈ 7.45 배럴 → $/bbl × 7.45 = $/MT
 *   - 실제 싱가포르 MGO 벙커 호가(Ship & Bunker 등)는 유료 — 라이브 연동 미구현.
 */
const MGO_MULTIPLIER = 1.85 * 7.45;
const ESTIMATE_METHOD = 'Brent 선물 기반 환산 추정 (계수 1.85×7.45)';

// 하드코딩 캐시 fallback의 실제 기준일.
// 2026-05-13 = repo history 재작성 커밋일 — 이 캐시값(2050.00)이 존재했음이
// 증명 가능한 가장 이른 날짜. fallback 응답에 "오늘" 날짜를 찍지 않는다 (정직 표기).
const FALLBACK_AS_OF = '2026-05-13';

/** 오늘(UTC) − dataAsOf 일수. 파싱 실패 시 -1. */
function staleDaysFrom(dataAsOf: string): number {
  const asOf = new Date(`${dataAsOf}T00:00:00Z`).getTime();
  if (Number.isNaN(asOf)) return -1;
  return Math.max(0, Math.floor((Date.now() - asOf) / 86_400_000));
}

const toDotDate = (isoDate: string) => isoDate.replace(/-/g, '.');

export async function GET() {
  // Method 1: Yahoo Finance Brent Crude (BZ=F) → MGO 환산 추정
  try {
    const res = await fetch(
      'https://query2.finance.yahoo.com/v8/finance/chart/BZ%3DF?range=5d&interval=1d',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        next: { revalidate: 3600 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close || [];
      const timestamps: number[] = result?.timestamp || [];

      // close와 timestamp를 짝지어 유효 종가만 추출 (dataAsOf = 실제 거래일)
      const valid: { ts: number | null; close: number }[] = [];
      closes.forEach((c, i) => {
        if (c !== null && c > 0) valid.push({ ts: timestamps[i] ?? null, close: c });
      });

      if (valid.length >= 1) {
        const latest = valid[valid.length - 1];
        const previous = valid.length > 1 ? valid[valid.length - 2] : latest;

        const brent = Math.round(latest.close * 100) / 100;
        const mgoPrice = Math.round(latest.close * MGO_MULTIPLIER * 100) / 100;
        const mgoPrev = Math.round(previous.close * MGO_MULTIPLIER * 100) / 100;
        const change = Math.round((mgoPrice - mgoPrev) * 100) / 100;

        // 데이터의 실제 기준일 = 최신 유효 종가의 거래일 (응답 생성일 아님)
        const dataAsOf = latest.ts
          ? new Date(latest.ts * 1000).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);

        return NextResponse.json({
          price: mgoPrice,
          change: change,
          date: toDotDate(dataAsOf),
          source: 'Brent 선물(BZ=F, Yahoo Finance) 환산 추정 - MGO 실호가 아님',
          status: 'live',
          // L-12 표준 필드
          isLive: true,
          dataAsOf,
          staleDays: staleDaysFrom(dataAsOf),
          // A-4 정직 표기 필드
          brent,
          isEstimate: true,
          method: ESTIMATE_METHOD,
        });
      }
    }
  } catch (err) {
    console.error('Yahoo Finance fetch failed:', err);
  }

  // Method 2: ExchangeRate.host commodities endpoint (backup) → MGO 환산 추정
  try {
    const res = await fetch(
      'https://api.exchangerate.host/latest?base=USD&symbols=BRENTOIL',
      { next: { revalidate: 3600 } }
    );

    if (res.ok) {
      const data = await res.json();
      const brent = data?.rates?.BRENTOIL;

      if (brent && brent > 0) {
        const mgoPrice = Math.round(brent * MGO_MULTIPLIER * 100) / 100;
        // exchangerate.host /latest는 기준일(date: YYYY-MM-DD)을 함께 반환
        const dataAsOf =
          typeof data?.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date)
            ? data.date
            : new Date().toISOString().slice(0, 10);

        return NextResponse.json({
          price: mgoPrice,
          change: 0,
          date: toDotDate(dataAsOf),
          source: 'Brent(exchangerate.host) 환산 추정 - MGO 실호가 아님',
          status: 'live',
          // L-12 표준 필드
          isLive: true,
          dataAsOf,
          staleDays: staleDaysFrom(dataAsOf),
          // A-4 정직 표기 필드
          brent: Math.round(brent * 100) / 100,
          isEstimate: true,
          method: ESTIMATE_METHOD,
        });
      }
    }
  } catch (err) {
    console.error('ExchangeRate.host fetch failed:', err);
  }

  // Method 3: 하드코딩 캐시 fallback — 실제 캐시 기준일을 표기 (오늘 날짜 위장 금지)
  return NextResponse.json({
    price: 2050.00,
    change: null, // fallback 캐시에 실변동치 없음 — 허구 등락 표시 금지
    date: toDotDate(FALLBACK_AS_OF),
    source: 'fallback',
    status: 'cached',
    // L-12 표준 필드 — fallback은 정직하게 isLive: false
    isLive: false,
    dataAsOf: FALLBACK_AS_OF,
    staleDays: staleDaysFrom(FALLBACK_AS_OF),
    // A-4 정직 표기 필드 — 라이브 Brent 없음
    brent: null,
    isEstimate: true,
    method: `${ESTIMATE_METHOD} - 하드코딩 캐시`,
  });
}
