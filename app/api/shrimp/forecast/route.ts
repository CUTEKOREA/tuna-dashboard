import { NextResponse } from 'next/server';
import { getCachedData } from '../../../../lib/cache';
import { optionalEnv } from '../../_shared/env';

export const dynamic = 'force-dynamic';

type FredObservation = {
  value: number | null;
  observedAt: string | null;
};

const UNAVAILABLE_OBSERVATION: FredObservation = {
  value: null,
  observedAt: null,
};

function latestValidObservation(value: unknown): FredObservation {
  if (!value || typeof value !== 'object') return UNAVAILABLE_OBSERVATION;
  const observations = (value as { observations?: unknown }).observations;
  if (!Array.isArray(observations)) return UNAVAILABLE_OBSERVATION;

  for (const candidate of observations) {
    if (!candidate || typeof candidate !== 'object') continue;
    const row = candidate as Record<string, unknown>;
    const rawValue = typeof row.value === 'string' ? row.value.trim() : row.value;
    const observedAt = typeof row.date === 'string' ? row.date : '';
    if (rawValue === '' || rawValue === '.') continue;
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || !/^\d{4}-\d{2}-\d{2}$/.test(observedAt)) continue;
    return { value: parsed, observedAt };
  }

  return UNAVAILABLE_OBSERVATION;
}

async function fetchFredObservation(
  key: string,
  seriesId: 'DCOILWTICO' | 'DEXKOUS',
): Promise<FredObservation> {
  try {
    const url = new URL('https://api.stlouisfed.org/fred/series/observations');
    url.searchParams.set('series_id', seriesId);
    url.searchParams.set('api_key', key);
    url.searchParams.set('file_type', 'json');
    url.searchParams.set('sort_order', 'desc');
    url.searchParams.set('limit', '5');

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return UNAVAILABLE_OBSERVATION;
    return latestValidObservation(await response.json());
  } catch (error) {
    console.error(
      `FRED ${seriesId} API Error:`,
      error instanceof Error ? error.name : 'unknown',
    );
    return UNAVAILABLE_OBSERVATION;
  }
}

export async function GET() {
  try {
    const data = await getCachedData('shrimp_price_forecast', async () => {
      const key = optionalEnv('FRED_API_KEY');
      const [oil, fx] = key
        ? await Promise.all([
          fetchFredObservation(key, 'DCOILWTICO'),
          fetchFredObservation(key, 'DEXKOUS'),
        ])
        : [UNAVAILABLE_OBSERVATION, UNAVAILABLE_OBSERVATION];
      const isLive = oil.value !== null || fx.value !== null;

      return {
        timestamp: new Date().toISOString(),
        isLive,
        source: 'FRED (DCOILWTICO, DEXKOUS)',
        macro: {
          wtiOil_USD: oil.value,
          wtiObservedAt: oil.observedAt,
          usdKrw: fx.value,
          fxObservedAt: fx.observedAt,
        },
        note: '새우 가격 전망은 제공하지 않는다. 이전 구현의 VAR 모형은 실재하지 않았고 계수가 출처 없는 임의값이었다.',
      };
    }, 7200);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { isLive: false, error: 'Failed to fetch FRED macro data' },
      { status: 500 },
    );
  }
}
