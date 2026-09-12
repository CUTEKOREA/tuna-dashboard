import { NextRequest, NextResponse } from 'next/server';
import { requireAnyEnv } from '../_shared/env';

export const dynamic = 'force-dynamic';

/**
 * 해양수산부·관세청 공공데이터 API — 참치 특화 통합 라우트
 *
 *  - select0040List / getselect0040List : 위판장별 위탁판매   (해수부 1192000)
 *  - select0070List / getselect0070List : 수산물 품목별 수출입 (해수부 1192000)
 *  - select0180List / getselect0180List : 어업생산통계         (해수부 1192000)
 *  - seaimextrnpcst / getSeaImexTrnpCst : 해상수출입 운송비용  (관세청 1220000)
 *
 * 2026-09-12 실측으로 고친 것 — 이전 판은 네 건 모두 응답을 받은 적이 없다.
 *  1. 오퍼레이션이 빠져 서비스 주소만 불렀다. 운송비용은 이름도 틀렸다(`getSeaimextrnpcstList`).
 *     data.go.kr 은 오퍼레이션이 틀리면 결과코드 12(폐기된 서비스)를 준다 — 서비스가 죽은 것처럼 보인다.
 *  2. 필수 파라미터가 없었다. 해수부 셋은 이름이 다 `baseDt` 인데 자릿수만 다르다
 *     (위판 8자리 · 수출입 6자리 · 생산 4자리). 자릿수가 틀리면 결과코드 03(데이터 없음)이다.
 *     운송비용은 `cntyCd`(국가)와 `imexTpcd`(1 수출·2 수입)가 둘 다 있어야 한다.
 *  3. 응답 필드 이름이 전부 추측이었다. 아래 매핑은 실제 응답에서 뽑았다.
 *  4. 실패를 지어낸 숫자로 덮었다. 이제 덮지 않는다 — 실패는 실패로 나간다.
 */

// 계정마다 인증키가 여러 벌이고 재발급하면 이전 값이 죽는다. 순서대로 시도한다.
const SERVICE_KEY = () =>
  requireAnyEnv('DATA_GO_KR_KEY_2', 'DATA_GO_KR_NEW_KEY', 'DATA_GO_KR_COMMON_KEY');

const MOF_BASE = 'https://apis.data.go.kr/1192000';
const KCS_BASE = 'https://apis.data.go.kr/1220000';

/** 관세청 운송비용이 받는 국가코드. 목록 밖이면 결과코드 99로 거절한다. */
export const FREIGHT_COUNTRIES: Record<string, string> = {
  USW: '미국서부',
  USE: '미국동부',
  EU: '유럽연합',
  CN: '중국',
  JP: '일본',
  VN: '베트남',
};

interface ApiEndpoint {
  url: string;
  /** 호출 시점에 따라 기준일이 달라지므로 함수로 만든다. */
  params: (opts: Record<string, string>) => Record<string, string>;
  transform: (items: any[]) => any;
  title: string;
  unit: string;
  /**
   * 호출자가 기준일을 안 줬을 때 몇 달까지 되짚을지.
   * 공표가 두세 달 늦는다 — 지난달로 물으면 늘 결과코드 03 이 온다.
   */
  retreat?: { key: string; months: number };
}

/** yyyy·yyyyMM·yyyyMMdd 중 필요한 자릿수만 남긴다. */
function digits(value: string | undefined, width: number, fallback: string): string {
  const only = (value ?? '').replace(/\D/g, '');
  return only.length === width ? only : fallback;
}

/** yyyyMM 에서 n 개월 뒤로. */
function monthsBefore(yymm: string, n: number): string {
  const y = Number(yymm.slice(0, 4));
  const m = Number(yymm.slice(4, 6));
  const d = new Date(y, m - 1 - n, 1);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** 최근 완료된 달(당월은 아직 안 쌓인다). */
function lastMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const num = (v: any) => Number(String(v ?? '').replace(/,/g, '')) || 0;

const ENDPOINTS: Record<string, ApiEndpoint> = {
  // 위판장별 위탁판매 현황 — baseDt 8자리
  consignment_sales: {
    url: `${MOF_BASE}/select0040List/getselect0040List`,
    params: (o) => ({
      type: 'json',
      numOfRows: '100',
      pageNo: '1',
      baseDt: digits(o.date, 8, `${lastMonth()}01`),
    }),
    title: '위판장별 위탁판매 현황',
    unit: 'kg · 원',
    transform: (items) =>
      items.map((i) => ({
        date: i.csmtDe ?? null,
        cooperative: i.mxtrNm ?? null,
        market: i.csmtmktNm ?? null,
        species: i.mprcStdCodeNm ?? null,
        state: i.kdfshSttusNm ?? null, // 활어 / 선어 / 냉동
        fishery: i.fshrNm ?? null,
        weightKg: num(i.csmtWt),
        unitPriceWon: num(i.csmtUntpc),
        amountWon: num(i.csmtAmount),
      })),
  },

  // 수산물 품목별 수출입 — baseDt 6자리(yyyyMM)
  trade_by_item: {
    url: `${MOF_BASE}/select0070List/getselect0070List`,
    params: (o) => ({
      type: 'json',
      numOfRows: '100',
      pageNo: '1',
      baseDt: digits(o.month, 6, lastMonth()),
    }),
    title: '수산물 품목별 수출입 현황',
    unit: 'kg · USD',
    retreat: { key: 'month', months: 6 },
    transform: (items) =>
      items.map((i) => ({
        month: i.stdYymm ?? null,
        itemName: i.mprcExipitmNm ?? null,
        itemCode: i.mprcExipitmCode ?? null,
        flow: i.imxprtSeNm ?? null, // 수출 / 수입
        weightKg: num(i.imxprtWt),
        amountUsd: num(i.imxprtDollarAmount),
      })),
  },

  // 어업생산통계 — baseDt 4자리(yyyy)
  fishery_production: {
    url: `${MOF_BASE}/select0180List/getselect0180List`,
    params: (o) => ({
      type: 'json',
      numOfRows: '100',
      pageNo: '1',
      baseDt: digits(o.year, 4, String(new Date().getFullYear() - 2)),
    }),
    title: '연도별 총괄 어업생산통계',
    unit: '원본 필드 그대로',
    // 이 데이터셋은 냉동·선어·활어별 수량/금액을 freezeQty1..n 처럼 번호로 준다.
    // 번호가 무엇을 가리키는지 명세에 없어 임의로 이름 붙이지 않고 원본을 그대로 넘긴다.
    transform: (items) => items,
  },

  // 해상수출입 운송비용 — 국가코드 + 수출입구분 필수
  shipping_cost: {
    url: `${KCS_BASE}/seaimextrnpcst/getSeaImexTrnpCst`,
    params: (o) => {
      const country = (o.country ?? 'USW').toUpperCase();
      // 구간을 안 주면 아무것도 안 온다. 기본은 최근 12개월이다.
      const end = o.endYymm ? digits(o.endYymm, 6, lastMonth()) : lastMonth();
      return {
        resultType: 'json',
        numOfRows: '100',
        pageNo: '1',
        cntyCd: FREIGHT_COUNTRIES[country] ? country : 'USW',
        imexTpcd: o.flow === '수출' ? '1' : '2',
        strtYymm: o.startYymm ? digits(o.startYymm, 6, monthsBefore(end, 11)) : monthsBefore(end, 11),
        endYymm: end,
      };
    },
    title: '해상 수출입 운송비용',
    retreat: { key: 'endYymm', months: 6 },
    // 관세청 공표 단위. 40피트 컨테이너 1대(=2TEU)당 총비용이고 통화는 원화 천원이다.
    unit: '천원/2TEU',
    transform: (items) =>
      items.map((i) => ({
        period: i.year ?? null, // '2024.01' 형태
        countryCode: i.statCd ?? null,
        country: i.statCdCntnKor1 ?? null,
        costThousandWonPer2Teu: num(i.imexTrnpCst),
      })),
  },
};

/** data.go.kr 응답에서 행과 결과코드를 뽑는다. JSON·XML 봉투를 모두 받는다. */
function readEnvelope(text: string): { rows: any[]; code: string; message: string; total: number | null } {
  let code = '';
  let message = '';
  let rows: any[] = [];
  let total: number | null = null;

  try {
    const data = JSON.parse(text);
    // 해수부 1192000 은 봉투 이름이 `responseJson` 이다(관세청은 `response`).
    // 이름 하나 놓치면 본문 대신 전체 객체를 뒤지게 되고, 행이 안 잡혀 **빈 배열이 성공으로** 나간다.
    const envelope = data?.responseJson ?? data?.response ?? data;
    const body = envelope?.body ?? data?.body ?? data;
    const header = envelope?.header ?? data?.header ?? {};
    code = String(header.resultCode ?? data?.resultCode ?? '');
    message = String(header.resultMsg ?? data?.resultMsg ?? '');
    const items = body?.items?.item ?? body?.items ?? body?.item ?? [];
    rows = Array.isArray(items) ? items : items ? [items] : [];
    // 해수부는 총건수를 header 에 넣는다. body 만 보면 늘 null 이다.
    const totalRaw = body?.totalCount ?? header?.totalCount;
    total = totalRaw != null ? Number(totalRaw) : null;
  } catch {
    // 관세청 운송비용은 resultType=json 을 무시하고 XML 로 답한다(2026-09-12 실측).
    // 키·활용신청 문제도 XML(OpenAPI_ServiceResponse)로 온다. 둘 다 여기서 읽는다.
    code = text.match(/<resultCode>([^<]*)</)?.[1] ?? text.match(/<returnReasonCode>([^<]*)</)?.[1] ?? '';
    message =
      text.match(/<resultMsg>([^<]*)</)?.[1] ??
      text.match(/<returnAuthMsg>([^<]*)</)?.[1] ??
      text.match(/<errMsg>([^<]*)</)?.[1] ??
      text.slice(0, 200);
    for (const m of text.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const row: Record<string, string> = {};
      for (const f of m[1].matchAll(/<(\w+)>([^<]*)<\/\1>/g)) row[f[1]] = f[2];
      rows.push(row);
    }
    const totalText = text.match(/<totalCount>(\d+)</)?.[1];
    total = totalText != null ? Number(totalText) : null;
  }
  return { rows, code, message, total };
}

type Result =
  | { ok: true; title: string; unit: string; total: number | null; data: any[]; source: string }
  | { ok: false; title: string; error: string; source: string };

async function fetchEndpoint(key: string, opts: Record<string, string>): Promise<Result> {
  const endpoint = ENDPOINTS[key];
  if (!endpoint) return { ok: false, title: key, error: `모르는 데이터셋: ${key}`, source: 'ROUTE' };

  // 기준일을 안 받았고 되짚기가 열려 있으면, 데이터가 나올 때까지 한 달씩 물러난다.
  const retreat = endpoint.retreat;
  if (retreat && !opts[retreat.key]) {
    let month = lastMonth();
    for (let i = 0; i < retreat.months; i++) {
      const attempt = await fetchOnce(endpoint, { ...opts, [retreat.key]: month });
      if (attempt.ok && attempt.data.length > 0) return attempt;
      // 키·권한 문제면 달을 바꿔도 소용없다. 그대로 올린다.
      if (!attempt.ok && !/결과코드 03/.test(attempt.error)) return attempt;
      month = monthsBefore(month, 1);
    }
    return { ok: false, title: endpoint.title, error: `최근 ${retreat.months}개월에 공표된 값이 없다`, source: 'UPSTREAM' };
  }
  return fetchOnce(endpoint, opts);
}

async function fetchOnce(endpoint: ApiEndpoint, opts: Record<string, string>): Promise<Result> {

  const label = `해양수산부·관세청 ${endpoint.title}`;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams({ ...endpoint.params(opts), serviceKey: SERVICE_KEY() });
  } catch (error: any) {
    return { ok: false, title: endpoint.title, error: error.message, source: 'ENV' };
  }

  try {
    const response = await fetch(`${endpoint.url}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    });

    // 포털은 키·활용신청 문제를 4xx 본문으로 알려 준다. 상태코드만 올리면 원인이 사라진다.
    const { rows, code, message, total } = readEnvelope(await response.text());

    if (code && code !== '00' && code !== '0') {
      return { ok: false, title: endpoint.title, error: `결과코드 ${code}: ${message}`, source: 'UPSTREAM' };
    }
    if (!response.ok) {
      return { ok: false, title: endpoint.title, error: `HTTP ${response.status}: ${message}`, source: 'UPSTREAM' };
    }

    return {
      ok: true,
      title: endpoint.title,
      unit: endpoint.unit,
      total,
      data: endpoint.transform(rows),
      source: label,
    };
  } catch (error: any) {
    return { ok: false, title: endpoint.title, error: error.message ?? String(error), source: 'NETWORK' };
  }
}

/**
 * 여섯 항로를 한 번에 받아 월별로 합친다. 한 번 부르면 되니 위젯이 6번 왕복하지 않는다.
 * 반환은 recharts 가 바로 먹는 모양이다: [{ period: '2025.01', USW: 2640, CN: 1350, … }]
 */
async function fetchFreightMatrix(opts: Record<string, string>) {
  const codes = Object.keys(FREIGHT_COUNTRIES);
  const results = await Promise.all(codes.map((c) => fetchEndpoint('shipping_cost', { ...opts, country: c })));

  const byPeriod = new Map<string, Record<string, any>>();
  const failed: string[] = [];
  results.forEach((res, i) => {
    const code = codes[i];
    if (!res.ok) {
      failed.push(`${code}: ${res.error}`);
      return;
    }
    for (const row of res.data) {
      if (!row.period) continue;
      const bucket = byPeriod.get(row.period) ?? { period: row.period };
      bucket[code] = row.costThousandWonPer2Teu;
      byPeriod.set(row.period, bucket);
    }
  });

  const series = [...byPeriod.values()].sort((a, b) => String(a.period).localeCompare(String(b.period)));
  if (series.length === 0) {
    return { ok: false as const, title: '해상 수출입 운송비용', error: failed.join(' · ') || '데이터 없음', source: 'UPSTREAM' };
  }
  return {
    ok: true as const,
    title: '해상 수출입 운송비용',
    unit: '천원/2TEU',
    total: series.length,
    routes: codes.filter((c) => series.some((row) => row[c] != null)),
    routeNames: FREIGHT_COUNTRIES,
    failed,
    data: series,
    source: '관세청 해상 수출입 운송비용',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { endpoint, endpoints, ...opts } = body ?? {};

    if (endpoint === 'shipping_cost_all') {
      return NextResponse.json(await fetchFreightMatrix(opts));
    }
    if (endpoint) {
      return NextResponse.json(await fetchEndpoint(endpoint, opts));
    }

    const wanted: string[] = Array.isArray(endpoints) && endpoints.length ? endpoints : Object.keys(ENDPOINTS);
    const results = await Promise.all(wanted.map((k) => fetchEndpoint(k, opts)));
    return NextResponse.json(Object.fromEntries(wanted.map((k, i) => [k, results[i]])));
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message ?? String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const endpoint = params.get('endpoint');
  const opts = Object.fromEntries(params.entries());
  if (endpoint === 'shipping_cost_all') return NextResponse.json(await fetchFreightMatrix(opts));
  if (endpoint) return NextResponse.json(await fetchEndpoint(endpoint, opts));

  const keys = Object.keys(ENDPOINTS);
  const results = await Promise.all(keys.map((k) => fetchEndpoint(k, opts)));
  return NextResponse.json(Object.fromEntries(keys.map((k, i) => [k, results[i]])));
}
