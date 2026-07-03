import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  KcsMonthlyOriginResponse,
  KcsOriginSummaryResponse,
  assertDestSharesSaneish,
  assertOriginSharesSaneish,
} from '../lib/contracts/kcs';

async function jsonOf(res: Response) {
  expect(res.status).toBe(200);
  return res.json();
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('/api/mackerel-kcs (고등어 KCS)', () => {
  it('LIVE XML에서 국가명은 statCdCntnKor1로 집계하고 금액은 천USD 단위로 변환', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const xml = `
      <response><body><items>
        <item>
          <year>202606</year><hsCd>0303540000</hsCd><statKor>냉동 고등어</statKor>
          <statCd>NO</statCd><statCdCntnKor1>노르웨이</statCdCntnKor1>
          <impWgt>800000</impWgt><impDlr>1600000</impDlr>
        </item>
        <item>
          <year>202606</year><hsCd>0303540000</hsCd><statKor>냉동 고등어</statKor>
          <statCd>CN</statCd><statCdCntnKor1>중국</statCdCntnKor1>
          <impWgt>200000</impWgt><impDlr>500000</impDlr>
        </item>
      </items></body></response>`;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(xml, { status: 200 })));

    const mod = await import('../app/api/mackerel-kcs/route');
    const parsed = KcsMonthlyOriginResponse.parse(await jsonOf(await mod.GET()));

    expect(parsed.isLive).toBe(true);
    expect(parsed.hsCode).toBe('030354');
    expect(parsed.monthly[0]).toMatchObject({ month: '2026-06', volume: 1000, value: 2100 });
    expect(parsed.origin.find((r) => r.name === '노르웨이')?.value).toBe(80);
    expect(parsed.origin.find((r) => r.name === '중국')?.value).toBe(20);
    expect(parsed.origin.some((r) => r.name.includes('고등어'))).toBe(false);
    const { ok, sum } = assertDestSharesSaneish(parsed.origin);
    expect(ok, `origin 합 ${sum}%`).toBe(true);
  });

  it('KCS 실패 시 fallback도 월별·원산국 계약을 만족', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('network disabled in test'))));

    const mod = await import('../app/api/mackerel-kcs/route');
    const parsed = KcsMonthlyOriginResponse.parse(await jsonOf(await mod.GET()));

    expect(parsed.isLive).toBe(false);
    expect(parsed.hsCode).toBe('030354');
    const { ok, sum } = assertDestSharesSaneish(parsed.origin);
    expect(ok, `origin 합 ${sum}%`).toBe(true);
  });
});

describe('/api/fishery?source=kcs (고등어 통합 BFF)', () => {
  it('LIVE XML에서 국가명은 statCdCntnKor1로 집계하고 금액은 천USD 단위로 변환', async () => {
    const xml = `
      <response><body><items>
        <item>
          <year>202606</year><hsCd>0303540000</hsCd><statKor>냉동 고등어</statKor>
          <statCd>NO</statCd><statCdCntnKor1>노르웨이</statCdCntnKor1>
          <impWgt>800000</impWgt><impDlr>1600000</impDlr>
        </item>
        <item>
          <year>202606</year><hsCd>0303540000</hsCd><statKor>냉동 고등어</statKor>
          <statCd>CN</statCd><statCdCntnKor1>중국</statCdCntnKor1>
          <impWgt>200000</impWgt><impDlr>500000</impDlr>
        </item>
      </items></body></response>`;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(xml, { status: 200 })));

    const mod = await import('../app/api/fishery/route');
    const parsed = KcsMonthlyOriginResponse.parse(
      await jsonOf(await mod.GET(new Request('http://localhost/api/fishery?source=kcs')))
    );

    expect(parsed.isLive).toBe(true);
    expect(parsed.monthly[0]).toMatchObject({ month: '2026-06', volume: 1000, value: 2100 });
    expect(parsed.origin.find((r) => r.name === '노르웨이')?.value).toBe(80);
    expect(parsed.origin.find((r) => r.name === '중국')?.value).toBe(20);
    expect(parsed.origin.some((r) => r.name.includes('고등어'))).toBe(false);
    const { ok, sum } = assertDestSharesSaneish(parsed.origin);
    expect(ok, `origin 합 ${sum}%`).toBe(true);
  });
});

describe('/api/pollock-kcs (명태 KCS)', () => {
  it('LIVE XML에서 국가명은 statCdCntnKor1로 집계하고 명태 품목명 혼입을 막음', async () => {
    const xml = `
      <response><body><items>
        <item>
          <year>202606</year><hsCd>0303670000</hsCd><statKor>냉동 명태</statKor>
          <statCd>RU</statCd><statCdCntnKor1>러시아</statCdCntnKor1>
          <impWgt>800000</impWgt><impDlr>1600000</impDlr>
        </item>
        <item>
          <year>202606</year><hsCd>0303670000</hsCd><statKor>냉동 명태</statKor>
          <statCd>US</statCd><statCdCntnKor1>미국</statCdCntnKor1>
          <impWgt>200000</impWgt><impDlr>500000</impDlr>
        </item>
      </items></body></response>`;
    vi.stubGlobal('fetch', vi.fn(async () => new Response(xml, { status: 200 })));

    const mod = await import('../app/api/pollock-kcs/route');
    const json = await jsonOf(await mod.GET(new Request('http://localhost/api/pollock-kcs?year=2026&month=06')));

    expect(json.isLive).toBe(true);
    expect(json.source).toContain('030367');
    expect(json.summary).toMatchObject({ totalWgt: 1000, totalDlr: 2100, ruWgt: 800, ruDlr: 1600, ruPct: 80 });
    expect(json.byOrigin.find((r: { origin: string }) => r.origin === '러시아')?.share).toBe(80);
    expect(json.byOrigin.find((r: { origin: string }) => r.origin === '미국')?.share).toBe(20);
    expect(json.byOrigin.some((r: { origin: string }) => r.origin.includes('명태'))).toBe(false);
  });
});

describe('/api/galchi/kcs (갈치 KCS)', () => {
  it('fallback 응답이 HSK 검증·요약·원산국 계약을 만족', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('network disabled in test'))));

    const mod = await import('../app/api/galchi/kcs/route');
    const parsed = KcsOriginSummaryResponse.parse(
      await jsonOf(await mod.GET(new Request('http://localhost/api/galchi/kcs?year=2025')))
    );

    expect(parsed.isLive).toBe(false);
    expect(parsed.hskVerified).toContain('0303892000');
    expect(parsed.summary.totalWgt).toBeGreaterThan(1000);
    expect(parsed.summary.cifPerKg).toBeGreaterThan(0);
    const { ok, sum } = assertOriginSharesSaneish(parsed.byOrigin);
    expect(ok, `byOrigin 합 ${sum}%`).toBe(true);
  });
});
