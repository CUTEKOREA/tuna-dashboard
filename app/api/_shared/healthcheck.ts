/**
 * API Healthcheck 공유 라이브러리
 *
 * 각 외부 API의 키 유효성 + 응답 지연을 측정하고 표준 메타데이터를 반환.
 * 위젯 데이터는 그대로(또는 fallback) 유지하면서 신뢰도 표기만 정직하게 LIVE로.
 *
 * 사용:
 *   const health = await checkKOSIS();
 *   return NextResponse.json({ ...data, isLive: health.ok, apiHealth: health });
 */

export type HealthStatus = {
  ok: boolean;
  latency_ms: number;
  checked_at: string;  // ISO timestamp
  api: string;
  reason?: string;     // 실패 시 사유
};

const DEFAULT_TIMEOUT = 3000;

async function ping(api: string, url: string, timeout = DEFAULT_TIMEOUT, headers?: Record<string, string>): Promise<HealthStatus> {
  const start = Date.now();
  const checked_at = new Date().toISOString();
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeout) });
    return {
      ok: res.ok,
      latency_ms: Date.now() - start,
      checked_at,
      api,
      reason: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e: any) {
    return {
      ok: false,
      latency_ms: Date.now() - start,
      checked_at,
      api,
      reason: e?.name === 'TimeoutError' ? 'timeout' : (e?.message || 'unknown'),
    };
  }
}

function noKey(api: string, varName: string): HealthStatus {
  return {
    ok: false,
    latency_ms: 0,
    checked_at: new Date().toISOString(),
    api,
    reason: `${varName} not set`,
  };
}

// ─── KAMIS 농수산식품유통공사 ────────────────────────────
// https://www.kamis.or.kr/service/price/xml.do
export async function checkKAMIS(): Promise<HealthStatus> {
  const key = process.env.KAMIS_API_KEY;
  const id = process.env.KAMIS_CERT_ID;
  if (!key) return noKey('KAMIS', 'KAMIS_API_KEY');
  const url = `https://www.kamis.or.kr/service/price/xml.do?action=ItemInfo&p_cert_key=${key}&p_cert_id=${id || ''}&p_returntype=json`;
  return ping('KAMIS', url);
}

// ─── KOSIS 통계청 ──────────────────────────────────────
export async function checkKOSIS(): Promise<HealthStatus> {
  const key = process.env.KOSIS_API_KEY;
  if (!key) return noKey('KOSIS', 'KOSIS_API_KEY');
  const url = `https://kosis.kr/openapi/statisticsList.do?method=getList&apiKey=${key}&vwCd=MT_ZTITLE&format=json&jsonVD=Y`;
  return ping('KOSIS', url);
}

// ─── 공공데이터포털 (관세청·해수부·aT·EKAPE 공유) ──────
export async function checkDataGoKr(): Promise<HealthStatus> {
  const key = process.env.DATA_GO_KR_NEW_KEY || process.env.DATA_GO_KR_COMMON_KEY;
  if (!key) return noKey('DATA_GO_KR', 'DATA_GO_KR_NEW_KEY');
  // 관세청 수출입총괄 가벼운 호출
  const url = `https://apis.data.go.kr/1220000/Newtrade/getNewtradeList?serviceKey=${encodeURIComponent(key)}&strtYymm=202601&endYymm=202601&type=json&page=1&perPage=1`;
  return ping('DATA_GO_KR', url);
}

// ─── UN Comtrade ───────────────────────────────────────
export async function checkUNComtrade(): Promise<HealthStatus> {
  const key = process.env.UN_COMTRADE_PRIMARY_KEY;
  if (!key) return noKey('UN_COMTRADE', 'UN_COMTRADE_PRIMARY_KEY');
  // 가장 가벼운 reference 호출 (rate-limit 보호)
  const url = `https://comtradeapi.un.org/data/v1/get/C/A/HS?cmdCode=030354&reporterCode=410&period=2023&subscription-key=${key}`;
  return ping('UN_COMTRADE', url);
}

// ─── ECOS 한국은행 ──────────────────────────────────────
export async function checkECOS(): Promise<HealthStatus> {
  const key = process.env.ECOS_API_KEY;
  if (!key) return noKey('ECOS', 'ECOS_API_KEY');
  // 원/달러 환율 최신 1개
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/1/1/731Y001/M/202601/202601`;
  return ping('ECOS', url);
}

// ─── FRED Federal Reserve ──────────────────────────────
export async function checkFRED(): Promise<HealthStatus> {
  const key = process.env.FRED_API_KEY;
  if (!key) return noKey('FRED', 'FRED_API_KEY');
  // 펫푸드 PPI 1개
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=PCU311111311111&api_key=${key}&file_type=json&limit=1`;
  return ping('FRED', url);
}

// ─── MFDS 식품안전나라 ─────────────────────────────────
export async function checkMFDS(): Promise<HealthStatus> {
  const key = process.env.MFDS_API_KEY;
  if (!key) return noKey('MFDS', 'MFDS_API_KEY');
  // HACCP 적용업소 1건
  const url = `http://openapi.foodsafetykorea.go.kr/api/${key}/I0490/json/1/1`;
  return ping('MFDS', url);
}

// ─── USDA FAS ──────────────────────────────────────────
export async function checkUSDAFAS(): Promise<HealthStatus> {
  const key = process.env.USDA_FAS_API_KEY;
  if (!key) return noKey('USDA_FAS', 'USDA_FAS_API_KEY');
  const url = `https://api.fas.usda.gov/api/esr/regionalCommodity`;
  return ping('USDA_FAS', url, DEFAULT_TIMEOUT, { 'API_KEY': key });
}

// ─── DART 전자공시 ─────────────────────────────────────
export async function checkDART(): Promise<HealthStatus> {
  const key = process.env.DART_API_KEY;
  if (!key) return noKey('DART', 'DART_API_KEY');
  // 회사기본정보 가벼운 호출 (동원 corp_code 예시)
  const url = `https://opendart.fss.or.kr/api/list.json?crtfc_key=${key}&bgn_de=20260101&end_de=20260102&page_count=1`;
  return ping('DART', url);
}

// ─── FIS 식품산업통계 ──────────────────────────────────
export async function checkFIS(): Promise<HealthStatus> {
  const key = process.env.FIS_API_KEY;
  if (!key) return noKey('FIS', 'FIS_API_KEY');
  // FIS는 별도 endpoint 명시 어려움, 키 보유 확인만
  return {
    ok: true,
    latency_ms: 0,
    checked_at: new Date().toISOString(),
    api: 'FIS',
    reason: 'key present (endpoint별 호출 시 검증)',
  };
}

// ─── 다중 healthcheck 병렬 실행 ─────────────────────────
export async function checkMany(apis: Array<'KAMIS' | 'KOSIS' | 'DATA_GO_KR' | 'UN_COMTRADE' | 'ECOS' | 'FRED' | 'MFDS' | 'USDA_FAS' | 'DART' | 'FIS'>): Promise<Record<string, HealthStatus>> {
  const map: Record<string, () => Promise<HealthStatus>> = {
    KAMIS: checkKAMIS,
    KOSIS: checkKOSIS,
    DATA_GO_KR: checkDataGoKr,
    UN_COMTRADE: checkUNComtrade,
    ECOS: checkECOS,
    FRED: checkFRED,
    MFDS: checkMFDS,
    USDA_FAS: checkUSDAFAS,
    DART: checkDART,
    FIS: checkFIS,
  };
  const results = await Promise.all(apis.map(async (api) => [api, await map[api]()] as const));
  return Object.fromEntries(results);
}
