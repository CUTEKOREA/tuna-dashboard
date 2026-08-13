import { NextResponse } from 'next/server';
import { requireEnv } from '../../_shared/env';

export const runtime = 'nodejs';
export const revalidate = 86400; // 연간 확정치 — 일 1회 재검증이면 충분
export const maxDuration = 60; // Comtrade 실측 지연: 5개년 호출 16~23초 (2026-07-06)

/**
 * A-5 글로벌 참치캔 수출 점유율 레이스 — UN Comtrade (연간)
 * GET /api/tuna/comtrade-race
 *
 * HS 160414(참치 조제품·통조림) 수출액(primaryValue, USD), flowCode=X, partnerCode=0(세계).
 * 6개 주요 수출국(태국 764·에콰도르 218·스페인 724·필리핀 608·중국 156·한국 410)의
 * 2015~2024 연간 수출액과 "6개국 합 대비" 점유율(%)을 반환.
 * 주의: 분모는 세계 총계가 아닌 6개국 합 (6개국이 글로벌 캔 수출의 약 70% 커버).
 *
 * 응답 레코드 특성 (2026-07-06 실호출 4,021행 검증):
 *  - 동일 reporter·period에 분류(motCode/customsCode/partner2Code)별 중복행 존재
 *    (예: 태국 2023 = 341행). 총계 행(motCode=0·customsCode=C00·partner2Code=0)이
 *    항상 최대 primaryValue와 일치함을 확인 → reporterCode+period별 max 채택으로 dedup.
 */

const COMTRADE_KEY =
  requireEnv('UN_COMTRADE_PRIMARY_KEY'); // L-10 fallback 키

const REPORTERS = [764, 218, 724, 608, 156, 410] as const;
const REPORTER_KEY: Record<number, CountryKey> = {
  764: 'thailand',
  218: 'ecuador',
  724: 'spain',
  608: 'philippines',
  156: 'china',
  410: 'korea',
};

type CountryKey = 'thailand' | 'ecuador' | 'spain' | 'philippines' | 'china' | 'korea';

export type RaceYearRow = {
  year: string;
  /** 각국 수출액 (백만 USD) */
  abs: Record<CountryKey, number>;
  /** 6개국 합 대비 점유율 (%) — 합계 100 */
  share: Record<CountryKey, number>;
  /** 6개국 합계 수출액 (백만 USD) */
  totalUsdM: number;
};

export type RaceApiData = {
  isLive: boolean;
  source: string;
  syncDate: string;
  latestYear: string;
  series: RaceYearRow[];
};

// ─── 정직 fallback (2026-07-06 실호출 확정치 스냅샷, 백만 USD) ────────────────
const FALLBACK_ABS: { year: string; v: Record<CountryKey, number> }[] = [
  { year: '2015', v: { thailand: 1996.9, ecuador: 706.8, spain: 448.1, philippines: 229.5, china: 339.8, korea: 12.9 } },
  { year: '2016', v: { thailand: 2002.2, ecuador: 741.4, spain: 479.4, philippines: 179.2, china: 359.7, korea: 11.9 } },
  { year: '2017', v: { thailand: 2082.8, ecuador: 1055.5, spain: 584.8, philippines: 370.2, china: 416.2, korea: 11.4 } },
  { year: '2018', v: { thailand: 2274.5, ecuador: 1126.4, spain: 645.5, philippines: 353.0, china: 486.5, korea: 13.3 } },
  { year: '2019', v: { thailand: 2185.4, ecuador: 1066.2, spain: 578.8, philippines: 356.2, china: 502.8, korea: 15.1 } },
  { year: '2020', v: { thailand: 2373.4, ecuador: 1033.4, spain: 662.7, philippines: 344.4, china: 579.2, korea: 18.0 } },
  { year: '2021', v: { thailand: 1917.8, ecuador: 1135.9, spain: 631.1, philippines: 345.1, china: 701.9, korea: 21.3 } },
  { year: '2022', v: { thailand: 2284.3, ecuador: 1337.4, spain: 643.7, philippines: 339.9, china: 788.7, korea: 20.0 } },
  { year: '2023', v: { thailand: 2087.4, ecuador: 1188.7, spain: 786.5, philippines: 319.3, china: 832.2, korea: 22.9 } },
  { year: '2024', v: { thailand: 2498.6, ecuador: 1410.3, spain: 797.3, philippines: 417.8, china: 1052.6, korea: 22.5 } },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

function buildSeries(absByYear: Map<string, Record<CountryKey, number>>): RaceYearRow[] {
  const years = [...absByYear.keys()].sort();
  const rows: RaceYearRow[] = [];
  for (const year of years) {
    const abs = absByYear.get(year)!;
    const total = (Object.values(abs) as number[]).reduce((a, b) => a + b, 0);
    if (total <= 0) continue;
    const share = {} as Record<CountryKey, number>;
    for (const k of Object.keys(abs) as CountryKey[]) {
      share[k] = round1((abs[k] / total) * 100);
    }
    rows.push({
      year,
      abs: Object.fromEntries(
        (Object.entries(abs) as [CountryKey, number][]).map(([k, v]) => [k, round1(v)])
      ) as Record<CountryKey, number>,
      share,
      totalUsdM: round1(total),
    });
  }
  return rows;
}

function fallbackPayload(): RaceApiData {
  const map = new Map<string, Record<CountryKey, number>>();
  for (const r of FALLBACK_ABS) map.set(r.year, { ...r.v });
  const series = buildSeries(map);
  return {
    isLive: false, // L-09/L-12: fallback도 정직 표기
    source: 'UN Comtrade 스냅샷 (2026-07-06 실호출 확정치)',
    syncDate: '2026-07-06',
    latestYear: series[series.length - 1]?.year ?? '2024',
    series,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// UN Comtrade 실호출 — period 콤마 목록.
// 실측(2026-07-06): 10개년 단일 호출 47초(serverless 한도 초과 위험), 5개년 16~23초.
// 병렬 2회 분할은 초당 호출 제한(429 "Rate limit is exceeded. Try again in 1 seconds") 실측 →
// 순차 호출 + 1.1초 간격 + 시간 예산 방식 채택.
async function fetchComtrade(
  periods: string[],
  timeoutMs: number
): Promise<Map<string, Record<CountryKey, number>> | null> {
  const url =
    `https://comtradeapi.un.org/data/v1/get/C/A/HS` +
    `?cmdCode=160414&flowCode=X&partnerCode=0` +
    `&reporterCode=${REPORTERS.join(',')}` +
    `&period=${periods.join(',')}` +
    `&subscription-key=${COMTRADE_KEY}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];
  if (rows.length === 0) return null;

  // dedup: reporterCode+period별 최대 primaryValue = 총계 행 (실호출 검증 완료)
  const best = new Map<string, number>(); // "reporterCode|period" → USD
  for (const r of rows) {
    const rc = Number(r?.reporterCode);
    const period = String(r?.period ?? '');
    const v = Number(r?.primaryValue);
    if (!REPORTER_KEY[rc] || !/^\d{4}$/.test(period) || !Number.isFinite(v) || v <= 0) continue;
    const key = `${rc}|${period}`;
    if (v > (best.get(key) ?? 0)) best.set(key, v);
  }
  if (best.size === 0) return null;

  const byYear = new Map<string, Record<CountryKey, number>>();
  for (const [key, usd] of best) {
    const [rcStr, period] = key.split('|');
    const countryKey = REPORTER_KEY[Number(rcStr)];
    if (!byYear.has(period)) {
      byYear.set(period, { thailand: 0, ecuador: 0, spain: 0, philippines: 0, china: 0, korea: 0 });
    }
    byYear.get(period)![countryKey] = usd / 1e6; // USD → 백만 USD
  }
  return byYear;
}

export async function GET() {
  const PERIODS = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  try {
    // 시간 예산 (maxDuration 60초 내 안전 마진)
    const deadline = Date.now() + 53_000;
    const remaining = () => deadline - Date.now();

    // 1) 최근 5개년(의사결정 핵심 구간) 우선 — 예산 대부분 배정 (실측 지연 편차 16~40초).
    //    빠른 실패(429 등) 시에만 1.2초 후 1회 재시도.
    let recent = await fetchComtrade(PERIODS.slice(5), Math.min(40_000, remaining())).catch(() => null);
    if ((!recent || recent.size === 0) && remaining() > 15_000) {
      await sleep(1_200);
      recent = await fetchComtrade(PERIODS.slice(5), Math.min(25_000, remaining() - 2_000)).catch(() => null);
    }
    if (!recent || recent.size === 0) {
      return NextResponse.json(fallbackPayload());
    }

    // 2) 초기 5개년 — 초당 호출 제한 회피 간격 후 순차 호출 (예산 부족 시 생략)
    let early: Map<string, Record<CountryKey, number>> | null = null;
    if (remaining() > 8_000) {
      await sleep(1_100);
      early = await fetchComtrade(
        PERIODS.slice(0, 5),
        Math.max(5_000, Math.min(22_000, remaining() - 2_000))
      ).catch(() => null);
    }

    // 3) 초기 5개년 실패·생략 시 → 확정 스냅샷(2015~2019는 불변 과거 확정치)으로 보충 (정직 표기)
    let hybrid = false;
    const byYear = new Map<string, Record<CountryKey, number>>();
    if (early && early.size > 0) {
      for (const [y, v] of early) byYear.set(y, v);
    } else {
      hybrid = true;
      for (const r of FALLBACK_ABS.filter((r) => Number(r.year) <= 2019)) {
        byYear.set(r.year, { ...r.v });
      }
    }
    for (const [y, v] of recent) byYear.set(y, v);

    const series = buildSeries(byYear);
    if (series.length === 0) return NextResponse.json(fallbackPayload());

    const payload: RaceApiData = {
      isLive: true, // L-12 표준 필드
      source: hybrid
        ? 'UN Comtrade API (LIVE 2020~2024 · HS 160414 · 2015~2019는 확정 스냅샷 보충)'
        : 'UN Comtrade API (LIVE · HS 160414 · flowCode=X · partner=세계)',
      syncDate: new Date().toISOString().slice(0, 10),
      latestYear: series[series.length - 1].year,
      series,
    };
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(fallbackPayload());
  }
}
