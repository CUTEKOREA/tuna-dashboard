import { NextResponse } from 'next/server';
import { getCachedData } from '../../../../lib/cache';
import { optionalEnv } from '../../_shared/env';

export const dynamic = 'force-dynamic';

type SourceStatus = 'live' | 'unavailable';

type ChitosanTradeRow = {
  period: string;
  reporterCode: number;
  reporterISO: string | null;
  reporter: string;
  exportValue_USD: number;
  isReported: boolean | null;
  legacyEstimationFlag: number | null;
};

const HS_391390_LIMITATION =
  'HS 391390은 키토산 전용 코드가 아니다. 기타 천연중합체 및 변성 천연중합체 전체를 포함하며 키토산은 그 일부다. 이 수출액은 키토산 시장 규모가 아니다.';

function toTradeRows(value: unknown): ChitosanTradeRow[] {
  if (!Array.isArray(value)) return [];

  // Comtrade can return duplicate breakdown rows. Keep only the World/total
  // dimensions required by the specification, then retain the largest total
  // for each reporter and period instead of double-counting it.
  const rowsByReporterPeriod = new Map<string, ChitosanTradeRow>();

  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') continue;
    const row = candidate as Record<string, unknown>;
    if (
      Number(row.partnerCode) !== 0
      || row.partner2ISO !== 'W00'
      || Number(row.motCode) !== 0
      || row.customsCode !== 'C00'
    ) continue;

    const period = typeof row.period === 'string' ? row.period : String(row.period ?? '');
    const reporterCode = Number(row.reporterCode);
    const reporter = typeof row.reporterDesc === 'string' ? row.reporterDesc.trim() : '';
    const exportValue = Number(row.primaryValue);
    if (
      !/^\d{4}$/.test(period)
      || !Number.isInteger(reporterCode)
      || reporterCode <= 0
      || !reporter
      || !Number.isFinite(exportValue)
      || exportValue < 0
    ) continue;

    const estimationFlag = Number(row.legacyEstimationFlag);
    const parsed: ChitosanTradeRow = {
      period,
      reporterCode,
      reporterISO: typeof row.reporterISO === 'string' ? row.reporterISO : null,
      reporter,
      exportValue_USD: exportValue,
      isReported: typeof row.isReported === 'boolean' ? row.isReported : null,
      legacyEstimationFlag: Number.isFinite(estimationFlag) ? estimationFlag : null,
    };
    const key = `${reporterCode}|${period}`;
    const existing = rowsByReporterPeriod.get(key);
    if (!existing || parsed.exportValue_USD > existing.exportValue_USD) {
      rowsByReporterPeriod.set(key, parsed);
    }
  }

  return [...rowsByReporterPeriod.values()].sort(
    (a, b) => b.period.localeCompare(a.period) || b.exportValue_USD - a.exportValue_USD,
  );
}

async function fetchChitosanTrade(key: string): Promise<ChitosanTradeRow[]> {
  try {
    const url = new URL('https://comtradeapi.un.org/data/v1/get/C/A/HS');
    url.searchParams.set('cmdCode', '391390');
    url.searchParams.set('flowCode', 'X');
    url.searchParams.set('period', '2023,2024');
    url.searchParams.set('partnerCode', '0');
    url.searchParams.set('partner2Code', '0');
    url.searchParams.set('motCode', '0');
    url.searchParams.set('customsCode', 'C00');
    url.searchParams.set('maxRecords', '500');
    url.searchParams.set('includeDesc', 'true');
    url.searchParams.set('subscription-key', key);

    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];
    const json = await response.json() as { data?: unknown };
    return toTradeRows(json.data);
  } catch (error) {
    console.error(
      'Comtrade HS 391390 API Error:',
      error instanceof Error ? error.name : 'unknown',
    );
    return [];
  }
}

export async function GET() {
  try {
    const data = await getCachedData('shrimp_emerging_markets', async () => {
      const key = optionalEnv('UN_COMTRADE_PRIMARY_KEY');
      const exports = key ? await fetchChitosanTrade(key) : [];
      const isLive = exports.length > 0;
      const comtradeStatus: SourceStatus = isLive ? 'live' : 'unavailable';

      return {
        timestamp: new Date().toISOString(),
        isLive,
        source: isLive ? 'UN Comtrade HS 391390' : '사용 가능한 출처 없음',
        sources: { comtrade: comtradeStatus },
        chitosanTrade: isLive ? {
          hsCode: '391390',
          description: '기타 천연중합체 및 변성 천연중합체',
          limitation: HS_391390_LIMITATION,
          exports,
        } : null,
      };
    }, 86400);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { isLive: false, error: 'Failed to fetch emerging markets data' },
      { status: 500 },
    );
  }
}
