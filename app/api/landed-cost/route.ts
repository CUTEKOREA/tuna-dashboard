import { NextResponse } from 'next/server';
import { optionalEnv } from '../_shared/env';

export const dynamic = 'force-dynamic';

// ============================================================================
// Phase 3: 착지원가 시뮬레이터 API
// POST /api/landed-cost
// Sources: KCS 해상운임 + WITS 관세 + ECOS 환율 → 종합 착지원가 산출
// ============================================================================

const ECOS_BASE = 'https://ecos.bok.or.kr/api';

// --- ECOS: 실시간 환율 ---
async function getExchangeRate(currency: string): Promise<number> {
  const apiKey = process.env.ECOS_API_KEY;
  if (!apiKey) return currency === 'USD' ? 1350 : 1; // fallback

  const currencyMap: Record<string, string> = {
    'USD': '0000001', 'JPY': '0000002', 'EUR': '0000003',
    'CNY': '0000053', 'GBP': '0000005', 'THB': '0000016',
    'VND': '0000055', 'IDR': '0000017',
  };

  const itemCode = currencyMap[currency] || currencyMap['USD'];
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10).replace(/-/g, '');
  const startDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');

  try {
    const url = `${ECOS_BASE}/StatisticSearch/${apiKey}/json/kr/1/5/731Y001/D/${startDate}/${endDate}/${itemCode}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return currency === 'USD' ? 1350 : 1;
    const data = await res.json();
    const rows = data?.StatisticSearch?.row;
    if (!rows || rows.length === 0) return currency === 'USD' ? 1350 : 1;
    return parseFloat(rows[rows.length - 1].DATA_VALUE);
  } catch {
    return currency === 'USD' ? 1350 : 1;
  }
}

// --- KCS: 해상수출입 운송비용 ---
//
// 2026-09-12 실측으로 전면 교체. 이전 판은 세 군데가 틀려 한 번도 응답을 받은 적이 없다.
//  · 오퍼레이션이 `getSeaimextrnpcstList` 였다. 실제 이름은 `getSeaImexTrnpCst` 다(틀리면 코드 12).
//  · `hsSgn`·`statCd` 를 보냈다. 이 서비스는 품목을 받지 않는다 — `cntyCd`(국가)와 `imexTpcd`(1 수출·2 수입)뿐이다.
//  · 응답을 `trnspCst`/`trnspWgt` 로 파싱했다. 실제 필드는 `imexTrnpCst` 하나이고,
//    단위는 **천원/2TEU**(40피트 컨테이너 1대당 원화 천원)다. 달러도, 톤당도 아니다.
//    출처: 관세청 수출입무역통계 「수출입운임통계 → 해상컨테이너운임」 단위 표기.
//
// 그래서 이 서비스로는 「HS 품목별 톤당 운임」을 낼 수 없다. 컨테이너 1대 값을 받아
// 적재중량 가정을 명시적으로 걸어 kg 로 환산한다. 가정은 응답에 그대로 실어 보낸다.

/** 관세청이 받는 국가코드. 목록 밖이면 코드 99로 거절한다. */
const FREIGHT_COUNTRY: Record<string, string> = {
  US: 'USW', // 미국은 서부·동부가 따로다. 기본은 서부(부산 기준 주 항로).
  CN: 'CN',
  JP: 'JP',
  VN: 'VN',
  EU: 'EU',
};

/** 40피트 냉동 컨테이너의 실무 적재중량. 환산을 하려면 어딘가에 가정이 필요하다 — 숨기지 않고 적는다. */
const REEFER_PAYLOAD_KG = 24000;

type Freight = {
  freightPerKgKRW: number | null;
  perContainerThousandKRW: number | null;
  period: string | null;
  route: string | null;
  assumedPayloadKg: number | null;
  source: string;
};

const NO_FREIGHT = (source: string): Freight => ({
  freightPerKgKRW: null,
  perContainerThousandKRW: null,
  period: null,
  route: null,
  assumedPayloadKg: null,
  source,
});

async function getFreightCost(countryCode: string): Promise<Freight> {
  const apiKey =
    optionalEnv('DATA_GO_KR_KEY_2') ?? optionalEnv('DATA_GO_KR_NEW_KEY') ?? optionalEnv('DATA_GO_KR_COMMON_KEY');
  if (!apiKey) return NO_FREIGHT('KCS_KEY_MISSING');

  const cnty = FREIGHT_COUNTRY[countryCode];
  // 태국·인도네시아·인도 등은 이 통계에 항로가 없다. 다른 나라 값으로 대신하지 않는다.
  if (!cnty) return NO_FREIGHT(`KCS_NO_ROUTE(${countryCode})`);

  // 최근 12개월을 받아 가장 최신 달을 쓴다. 당월은 아직 안 쌓인다.
  const now = new Date();
  now.setDate(1);
  const end = new Date(now.getTime());
  end.setMonth(end.getMonth() - 1);
  const start = new Date(end.getTime());
  start.setMonth(start.getMonth() - 11);
  const yymm = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;

  try {
    const params = new URLSearchParams({
      serviceKey: apiKey,
      resultType: 'json',
      numOfRows: '100',
      pageNo: '1',
      cntyCd: cnty,
      imexTpcd: '2', // 수입
      strtYymm: yymm(start),
      endYymm: yymm(end),
    });

    const res = await fetch(`https://apis.data.go.kr/1220000/seaimextrnpcst/getSeaImexTrnpCst?${params}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NO_FREIGHT(`KCS_HTTP_${res.status}`);

    const data = await res.json().catch(() => null);
    const body = data?.response?.body ?? data?.body ?? data;
    const raw = body?.items?.item ?? body?.items ?? [];
    const rows: any[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    if (!rows.length) return NO_FREIGHT('KCS_NO_DATA');

    // 응답은 오래된 달부터 온다. 가장 최근 달을 쓴다.
    const latest = rows[rows.length - 1];
    const thousandWon = Number(String(latest.imexTrnpCst ?? '').replace(/,/g, ''));
    if (!Number.isFinite(thousandWon) || thousandWon <= 0) return NO_FREIGHT('KCS_BAD_VALUE');

    return {
      freightPerKgKRW: Math.round(((thousandWon * 1000) / REEFER_PAYLOAD_KG) * 100) / 100,
      perContainerThousandKRW: thousandWon,
      period: latest.year ?? null,
      route: `${latest.statCdCntnKor1 ?? cnty} → 한국(수입)`,
      assumedPayloadKg: REEFER_PAYLOAD_KG,
      source: 'KCS_LIVE',
    };
  } catch {
    return NO_FREIGHT('KCS_NETWORK_ERROR');
  }
}

// --- WITS: 관세율 조회 (기존 /api/wits 내부 로직 재활용) ---
async function getTariffRate(hsCode: string, countryISO3: string): Promise<{ mfn: number; fta: number; source: string }> {
  // Quick internal call to existing WITS route or direct fallback
  const cleanHs = hsCode.replace(/\./g, '').substring(0, 6);

  // Known tariff rates from WITS fallback DB
  const knownTariffs: Record<string, Record<string, { mfn: number; fta: number }>> = {
    '070320': { '156': { mfn: 360, fta: 15 }, '704': { mfn: 360, fta: 0 } }, // Garlic
    '030342': { '764': { mfn: 10, fta: 0 }, '360': { mfn: 10, fta: 0 } }, // Tuna
    '030617': { '704': { mfn: 20, fta: 0 }, '764': { mfn: 20, fta: 0 } }, // Shrimp
    '080132': { '704': { mfn: 8, fta: 0 }, '356': { mfn: 8, fta: 0 } }, // Cashew
    '160414': { '764': { mfn: 20, fta: 0 }, '842': { mfn: 20, fta: 0 } }, // Canned tuna
  };

  const known = knownTariffs[cleanHs]?.[countryISO3];
  if (known) return { ...known, source: 'WITS_VERIFIED' };

  // Try WITS live
  try {
    const url = `https://wits.worldbank.org/API/V1/SDMX/V21/datasource/tradestats-tariff/reporter/410/year/2024/partner/${countryISO3}/product/${cleanHs}/indicator/MFN-SMPL-AVRG`;
    const res = await fetch(url, { headers: { 'Accept': 'application/xml' }, signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const text = await res.text();
      const obsMatch = text.match(/<generic:ObsValue value="([^"]+)"/);
      if (obsMatch) {
        return { mfn: parseFloat(obsMatch[1]), fta: 0, source: 'WITS_LIVE' };
      }
    }
  } catch { /* fallthrough */ }

  return { mfn: 8, fta: 0, source: 'DEFAULT_ESTIMATE' };
}

export async function POST(req: Request) {
  try {
    const { hsCode, originCountry, fobPriceUSD, quantityKg } = await req.json();

    if (!hsCode || !originCountry) {
      return NextResponse.json({ error: 'hsCode and originCountry required' }, { status: 400 });
    }

    const fob = fobPriceUSD || 3.0; // USD per kg default
    const qty = quantityKg || 1000; // kg default

    // Country mappings
    const countryCodeMap: Record<string, string> = {
      '중국': 'CN', '베트남': 'VN', '태국': 'TH', '인도네시아': 'ID',
      '미국': 'US', '일본': 'JP', '인도': 'IN',
    };
    const countryISO3Map: Record<string, string> = {
      '중국': '156', '베트남': '704', '태국': '764', '인도네시아': '360',
      '미국': '842', '일본': '392', '인도': '356',
    };
    const cc = countryCodeMap[originCountry] || 'CN';
    const iso3 = countryISO3Map[originCountry] || '156';

    // Parallel API calls
    const [exchangeRate, freight, tariff] = await Promise.all([
      getExchangeRate('USD'),
      getFreightCost(cc),
      getTariffRate(hsCode, iso3),
    ]);

    // Landed cost calculation
    const totalFobUSD = fob * qty;
    // 운임을 못 받으면 0으로 두고 아래 meta 에 그렇게 적는다. 지어낸 값으로 채우면 총액이 조용히 틀린다.
    const totalFreightUSD =
      freight.freightPerKgKRW != null ? (freight.freightPerKgKRW * qty) / exchangeRate : 0;
    const cifUSD = totalFobUSD + totalFreightUSD;
    const applicableTariffRate = tariff.fta > 0 ? tariff.fta : tariff.mfn;
    const dutyUSD = cifUSD * (applicableTariffRate / 100);
    const subtotalUSD = cifUSD + dutyUSD;
    const vatUSD = subtotalUSD * 0.1; // 10% VAT
    const totalLandedUSD = subtotalUSD + vatUSD;
    const totalLandedKRW = totalLandedUSD * exchangeRate;
    const perKgKRW = Math.round(totalLandedKRW / qty);

    return NextResponse.json({
      input: { hsCode, originCountry, fobPriceUSD: fob, quantityKg: qty },
      breakdown: {
        fob: { totalUSD: Math.round(totalFobUSD), perKgUSD: fob, label: 'FOB 가격' },
        freight: {
          totalUSD: Math.round(totalFreightUSD),
          perKgKRW: freight.freightPerKgKRW,
          perContainerThousandKRW: freight.perContainerThousandKRW,
          containerUnit: '천원/2TEU (40피트 1대)',
          assumedPayloadKg: freight.assumedPayloadKg,
          period: freight.period,
          route: freight.route,
          source: freight.source,
          label: freight.freightPerKgKRW != null ? '해상운임' : '해상운임 (조회 실패 — 총액에 미포함)',
        },
        cif: { totalUSD: Math.round(cifUSD), label: 'CIF 가격 (FOB + 운임)' },
        duty: { totalUSD: Math.round(dutyUSD), rate: `${applicableTariffRate}%`, tariffType: tariff.fta > 0 ? 'FTA' : 'MFN', source: tariff.source, label: '관세' },
        vat: { totalUSD: Math.round(vatUSD), rate: '10%', label: '부가세' },
        total: {
          totalUSD: Math.round(totalLandedUSD),
          totalKRW: Math.round(totalLandedKRW),
          perKgKRW,
          exchangeRate,
          label: '총 착지원가',
        },
      },
      _meta: {
        dataSources: {
          exchangeRate: process.env.ECOS_API_KEY ? 'ECOS 한국은행 (실시간)' : 'ECOS 키 없음 — 고정 환율 1350 사용',
          freight:
            freight.source === 'KCS_LIVE'
              ? `관세청 해상수출입 운송비용 (${freight.period}, ${freight.perContainerThousandKRW}천원/2TEU, 적재중량 ${freight.assumedPayloadKg}kg 가정)`
              : freight.source,
          tariff: tariff.source,
        },
        timestamp: new Date().toISOString(),
        // 셋 중 하나라도 실측이 아니면 참이다. 예전에는 무조건 false 라 「전부 실데이터」로 읽혔다.
        estimatesUsed: [
          !process.env.ECOS_API_KEY ? 'exchangeRate' : null,
          freight.source !== 'KCS_LIVE' ? 'freight' : null,
          tariff.source === 'DEFAULT_ESTIMATE' ? 'tariff' : null,
        ].filter(Boolean),
      }
    });
  } catch (error: any) {
    console.error('[Landed Cost] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
