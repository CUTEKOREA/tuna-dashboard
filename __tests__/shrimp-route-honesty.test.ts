import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getCompliance } from '../app/api/shrimp/compliance/route';
import { GET as getEmergingMarkets } from '../app/api/shrimp/emerging-markets/route';
import { GET as getForecast } from '../app/api/shrimp/forecast/route';
import { clearCache } from '../lib/cache';

const CACHE_KEYS = [
  'shrimp_compliance_radar',
  'shrimp_emerging_markets',
  'shrimp_price_forecast',
];

function clearShrimpRouteCaches() {
  for (const key of CACHE_KEYS) clearCache(key);
}

beforeEach(() => {
  clearShrimpRouteCaches();
});

afterEach(() => {
  clearShrimpRouteCaches();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('/api/shrimp/emerging-markets', () => {
  it('returns only country-period Comtrade total rows and states the HS 391390 limitation', async () => {
    vi.stubEnv('UN_COMTRADE_PRIMARY_KEY', 'comtrade-test-key');
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json({
      data: [
        {
          period: '2024', reporterCode: 156, reporterISO: 'CHN', reporterDesc: 'China',
          partnerCode: 0, partner2ISO: 'W00', motCode: 0, customsCode: 'C00',
          primaryValue: 250, isReported: true, legacyEstimationFlag: 0,
        },
        {
          period: '2024', reporterCode: 410, reporterISO: 'KOR', reporterDesc: 'Rep. of Korea',
          partnerCode: 0, partner2ISO: 'W00', motCode: 0, customsCode: 'C00',
          primaryValue: 100, isReported: true, legacyEstimationFlag: 0,
        },
        {
          period: '2024', reporterCode: 410, reporterISO: 'KOR', reporterDesc: 'Rep. of Korea',
          partnerCode: 0, partner2ISO: 'W00', motCode: 0, customsCode: 'C00',
          primaryValue: 80, isReported: true, legacyEstimationFlag: 0,
        },
        {
          period: '2023', reporterCode: 410, reporterISO: 'KOR', reporterDesc: 'Rep. of Korea',
          partnerCode: 0, partner2ISO: 'W00', motCode: 0, customsCode: 'C00',
          primaryValue: 70, isReported: false, legacyEstimationFlag: 6,
        },
        {
          period: '2024', reporterCode: 410, reporterISO: 'KOR', reporterDesc: 'Rep. of Korea',
          partnerCode: 0, partner2ISO: 'USA', motCode: 0, customsCode: 'C00', primaryValue: 999,
        },
        {
          period: '2024', reporterCode: 410, reporterISO: 'KOR', reporterDesc: 'Rep. of Korea',
          partnerCode: 0, partner2ISO: 'W00', motCode: 1, customsCode: 'C00', primaryValue: 888,
        },
        {
          period: '2024', reporterCode: 410, reporterISO: 'KOR', reporterDesc: 'Rep. of Korea',
          partnerCode: 0, partner2ISO: 'W00', motCode: 0, customsCode: 'C01', primaryValue: 777,
        },
      ],
    }));
    vi.stubGlobal('fetch', fetchMock);

    const payload = await (await getEmergingMarkets()).json();

    expect(payload).toMatchObject({
      isLive: true,
      source: 'UN Comtrade HS 391390',
      sources: { comtrade: 'live' },
      chitosanTrade: {
        hsCode: '391390',
        exports: [
          {
            period: '2024', reporterCode: 156, reporterISO: 'CHN', reporter: 'China',
            exportValue_USD: 250, isReported: true, legacyEstimationFlag: 0,
          },
          {
            period: '2024', reporterCode: 410, reporterISO: 'KOR', reporter: 'Rep. of Korea',
            exportValue_USD: 100, isReported: true, legacyEstimationFlag: 0,
          },
          {
            period: '2023', reporterCode: 410, reporterISO: 'KOR', reporter: 'Rep. of Korea',
            exportValue_USD: 70, isReported: false, legacyEstimationFlag: 6,
          },
        ],
      },
    });
    expect(payload.chitosanTrade.limitation).toContain('키토산 전용 코드가 아니다');
    expect(payload.chitosanTrade.limitation).toContain('키토산 시장 규모가 아니다');
    expect(payload).not.toHaveProperty('chitosanMarket');
    expect(payload).not.toHaveProperty('halalExport');
    expect(payload).not.toHaveProperty('rteMarket');

    const requestedUrl = new URL(String(fetchMock.mock.calls[0][0]));
    expect(requestedUrl.searchParams.has('reporterCode')).toBe(false);
    expect(requestedUrl.searchParams.get('partnerCode')).toBe('0');
    expect(requestedUrl.searchParams.get('partner2Code')).toBe('0');
    expect(requestedUrl.searchParams.get('motCode')).toBe('0');
    expect(requestedUrl.searchParams.get('customsCode')).toBe('C00');
    expect(JSON.stringify(payload)).not.toContain('comtrade-test-key');
  });

  it('returns null without fetching or inventing fallback values when the key is absent', async () => {
    vi.stubEnv('UN_COMTRADE_PRIMARY_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const payload = await (await getEmergingMarkets()).json();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(payload).toMatchObject({
      isLive: false,
      source: '사용 가능한 출처 없음',
      sources: { comtrade: 'unavailable' },
      chitosanTrade: null,
    });
  });
});

describe('/api/shrimp/forecast', () => {
  it('returns the latest valid FRED observation with its matching date and keeps partial success live', async () => {
    vi.stubEnv('FRED_API_KEY', 'fred-test-key');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('series_id=DCOILWTICO')) {
        return Response.json({ observations: [
          { date: '2026-08-12', value: '.' },
          { date: '2026-08-11', value: '83.25' },
        ] });
      }
      throw new Error('fred-test-key');
    });
    vi.stubGlobal('fetch', fetchMock);

    const payload = await (await getForecast()).json();

    expect(payload).toMatchObject({
      isLive: true,
      source: 'FRED (DCOILWTICO, DEXKOUS)',
      macro: {
        wtiOil_USD: 83.25,
        wtiObservedAt: '2026-08-11',
        usdKrw: null,
        fxObservedAt: null,
      },
    });
    expect(payload.note).toContain('새우 가격 전망은 제공하지 않는다');
    expect(payload).not.toHaveProperty('forecast');
    expect(payload).not.toHaveProperty('historicalBenchmark');
    expect(payload).not.toHaveProperty('methodology');
    expect(payload).not.toHaveProperty('macroInputs');
    expect(JSON.stringify(payload)).not.toContain('fred-test-key');
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('fred-test-key');
  });

  it('returns null macro values without fetching when the FRED key is absent', async () => {
    vi.stubEnv('FRED_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const payload = await (await getForecast()).json();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(payload).toMatchObject({
      isLive: false,
      source: 'FRED (DCOILWTICO, DEXKOUS)',
      macro: {
        wtiOil_USD: null,
        wtiObservedAt: null,
        usdKrw: null,
        fxObservedAt: null,
      },
    });
  });
});

describe('/api/shrimp/compliance', () => {
  it('lists only WTO as live and returns the WTO rows when only WTO succeeds', async () => {
    vi.stubEnv('WTO_API_KEY', 'wto-test-key');
    vi.stubEnv('MFDS_API_KEY', '');
    const wtoRows = [{ notifier: 'EU', date: '2026-08-01', subject: 'SPS notice' }];
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ Dataset: wtoRows })));

    const payload = await (await getCompliance()).json();

    expect(payload).toMatchObject({
      isLive: true,
      source: 'WTO SPS',
      sources: { wto: 'live', mfds: 'unavailable' },
      antibioticDetection: {
        origin: 'unavailable',
        source: '사용 가능한 데이터 없음',
        recentViolations: null,
      },
      wtoSpsNotifications: wtoRows,
    });
    expect(payload.regulatoryRadar.length).toBeGreaterThan(0);
    for (const item of payload.regulatoryRadar) {
      expect(item.origin).toBe('static');
      expect(item.asOf).toBeTruthy();
    }
    expect(JSON.stringify(payload)).not.toContain('wto-test-key');
  });

  it('lists only MFDS as live and returns the MFDS rows when only MFDS succeeds', async () => {
    vi.stubEnv('WTO_API_KEY', '');
    vi.stubEnv('MFDS_API_KEY', 'mfds-test-key');
    const mfdsRows = [{ PRDLST_NM: '냉동 새우', BSSH_NM: '검사 대상 업체' }];
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ I0490: { row: mfdsRows } })));

    const payload = await (await getCompliance()).json();

    expect(payload).toMatchObject({
      isLive: true,
      source: 'MFDS',
      sources: { wto: 'unavailable', mfds: 'live' },
      antibioticDetection: {
        origin: 'live',
        source: 'MFDS',
        recentViolations: mfdsRows,
      },
      wtoSpsNotifications: null,
    });
    expect(JSON.stringify(payload)).not.toContain('mfds-test-key');
  });

  it('returns only the labeled static radar and null source data when both keys are absent', async () => {
    vi.stubEnv('WTO_API_KEY', '');
    vi.stubEnv('MFDS_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const payload = await (await getCompliance()).json();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(payload).toMatchObject({
      isLive: false,
      source: '정적 스냅샷',
      sources: { wto: 'unavailable', mfds: 'unavailable' },
      antibioticDetection: {
        origin: 'unavailable',
        source: '사용 가능한 데이터 없음',
        recentViolations: null,
      },
      wtoSpsNotifications: null,
    });
  });
});
