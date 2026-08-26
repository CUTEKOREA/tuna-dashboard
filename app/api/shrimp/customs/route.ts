import { NextResponse } from 'next/server';
import { fetchKCSNitemtrade } from '../../_shared/kcs-client';
import { getCachedData } from '../../../../lib/cache';
import { HSK_CODES, SHRIMP_LABEL, rollup, unitPricePerMT, type YearRollup } from './rollup';

export const dynamic = 'force-dynamic';

/**
 * 관세청 nitemtrade — 한국 새우 수입 실적.
 *
 * 2026-08-13 재작성. 이전 구현의 결함 4건을 정리했다.
 *  1. 6자리 030617을 hsSgn으로 넘겨 호출 → 룰북 L-04/A-03(KCS는 HSK 10자리 의무) 위반.
 *     6자리만 쓰면 조제(1605)가 빠져 베트남 수입액이 45% 사라진다.
 *  2. `fetch(url, { timeout: 5000 } as RequestInit)` → fetch에 timeout 옵션은 없다.
 *     타입 단언으로 무시됐을 뿐 아무 효과가 없었다. 공유 클라이언트의
 *     `AbortSignal.timeout()`으로 대체.
 *  3. 정규식이 `<item>…</item>` 경계를 넘어 매칭돼 다른 item의 값을 물어올 수 있었다.
 *     공유 클라이언트가 item 단위로 먼저 분할한다.
 *  4. 총계행의 `impDlr` 하나만 뽑아 원산지 분해가 불가능했고, `metrics`(수입량·단가·
 *     상위 원산지)는 라이브/폴백 양쪽 모두 하드코딩 상수였다. 실측 집계로 대체.
 */

async function fetchYear(year: string): Promise<{ rollup: YearRollup; isLive: boolean }> {
  const results = await Promise.all(
    HSK_CODES.map((hsSgn) => fetchKCSNitemtrade({ hsSgn, year })),
  );
  const live = results.filter((r) => r.isLive);
  const items = live.flatMap((r) => r.items);
  // 한 세번이라도 살아 있으면 그 범위만으로 집계한다. 전멸이면 라이브 아님.
  return { rollup: rollup(year, items), isLive: live.length > 0 };
}

export async function GET() {
  try {
    const data = await getCachedData(
      'kcs_shrimp_import_v2',
      async () => {
        const years = ['2024', '2025', '2026'];
        const fetched = await Promise.all(years.map(fetchYear));
        const liveYears = fetched.filter((f) => f.isLive && f.rollup.importUsd > 0);

        if (liveYears.length === 0) {
          // 폴백에 가짜 수치를 만들지 않는다. 값이 없으면 없다고 말한다 (L-09).
          return {
            timestamp: new Date().toISOString(),
            isLive: false,
            source: '관세청 nitemtrade 응답 없음 - 표시할 실측값 없음',
            scope: { hsk10: HSK_CODES, label: SHRIMP_LABEL },
            liveImportData: [],
            metrics: null,
          };
        }

        const latest = liveYears[liveYears.length - 1].rollup;

        return {
          timestamp: new Date().toISOString(),
          isLive: true,
          source: `관세청 nitemtrade 실측 (HSK ${HSK_CODES.length}개 세번)`,
          scope: { hsk10: HSK_CODES, label: SHRIMP_LABEL },
          liveImportData: liveYears.map((f) => ({
            year: f.rollup.year,
            // 백만 USD. 소수 1자리는 표시 편의이지 정밀도 주장 아님.
            value: Number((f.rollup.importUsd / 1_000_000).toFixed(1)),
          })),
          metrics: {
            baseYear: latest.year,
            importUsd: latest.importUsd,
            importMT: Number((latest.importKg / 1000).toFixed(1)),
            avgUnitPrice_USD_per_MT: unitPricePerMT(latest.importUsd, latest.importKg),
            topOrigins: latest.origins.slice(0, 5).map((o) => ({
              country: o.country,
              volumeMT: Number((o.importKg / 1000).toFixed(1)),
              priceUSD_per_MT: unitPricePerMT(o.importUsd, o.importKg),
            })),
          },
        };
      },
      3600,
    );

    return NextResponse.json(data);
  } catch (e) {
    // 키 미설정도 여기로 온다. 키 값 자체는 절대 로그에 남기지 않는다.
    console.error('KCS shrimp customs failed:', e instanceof Error ? e.name : 'unknown');
    return NextResponse.json({ error: 'Failed to fetch Korea Customs Data' }, { status: 500 });
  }
}
