import { afterEach, describe, expect, it, vi } from 'vitest';
import { aggregateByCountry, fetchKCSNitemtrade, parseKCSXml } from '../app/api/_shared/kcs-client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('KCS shared client', () => {
  it('parses XML items and resultCode without external parser dependencies', () => {
    const xml = `
      <response><header><resultCode>00</resultCode></header><body><items>
        <item>
          <year>202606</year><statKor>냉동 낙지</statKor>
          <statCd>VN</statCd><statCdCntnKor1>베트남</statCdCntnKor1>
          <impWgt>120000</impWgt><impDlr>960000</impDlr>
        </item>
      </items></body></response>`;

    const parsed = parseKCSXml(xml);

    expect(parsed.resultCode).toBe('00');
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0]).toMatchObject({
      year: '202606',
      statKor: '냉동 낙지',
      statCd: 'VN',
      statCdCntnKor1: '베트남',
      impWgt: '120000',
      impDlr: '960000',
    });
  });

  it('aggregates by statCdCntnKor1 and converts kg/USD into ton/thousand USD', () => {
    const agg = aggregateByCountry([
      {
        year: '202606',
        statKor: '냉동 낙지',
        statCd: 'VN',
        statCdCntnKor1: '베트남',
        impWgt: '120000',
        impDlr: '960000',
      },
      {
        year: '202606',
        statKor: '냉동 낙지',
        statCd: 'CN',
        statCdCntnKor1: '중국',
        impWgt: '80000',
        impDlr: '400000',
      },
    ], 'VN');

    expect(agg.totalWgt).toBe(200);
    expect(agg.totalDlr).toBe(1360);
    expect(agg.majorWgt).toBe(120);
    expect(agg.majorDlr).toBe(960);
    expect(agg.majorPct).toBe(60);
    expect(agg.cifPerKg).toBe(6.8);
    expect(agg.byOrigin[0]).toMatchObject({ origin: '베트남', volume: 120, value: 960, share: 60 });
    expect(agg.byOrigin.some((row) => row.origin.includes('낙지'))).toBe(false);
  });

  it('returns live result only when KCS resultCode is 00 and items exist', async () => {
    const xml = `
      <response><header><resultCode>00</resultCode></header><body><items>
        <item><year>202606</year><statCd>VN</statCd><statCdCntnKor1>베트남</statCdCntnKor1></item>
      </items></body></response>`;
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(xml, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchKCSNitemtrade({ hsSgn: '0307521000', year: '2026', month: '06', timeout: 50 });

    expect(result.isLive).toBe(true);
    expect(result.totalCount).toBe(1);
    expect(result.apiHealth).toMatchObject({ ok: true, items_count: 1, resultCode: '00' });
    expect(result.source).toContain('0307521000');
    const requestedUrl = String(fetchMock.mock.calls[0]?.[0] || '');
    expect(requestedUrl).toContain('strtYymm=202606');
    expect(requestedUrl).toContain('endYymm=202606');
    expect(requestedUrl).toContain('hsSgn=0307521000');
  });

  it('falls back honestly when KCS resultCode is not successful', async () => {
    const xml = '<response><header><resultCode>03</resultCode></header><body><items></items></body></response>';
    vi.stubGlobal('fetch', vi.fn(async () => new Response(xml, { status: 200 })));

    const result = await fetchKCSNitemtrade({ hsSgn: '0307521000', year: '2026', timeout: 50 });

    expect(result.isLive).toBe(false);
    expect(result.items).toEqual([]);
    expect(result.source).toContain('resultCode=03');
    expect(result.apiHealth).toMatchObject({ ok: false, items_count: 0, resultCode: '03' });
  });
});
