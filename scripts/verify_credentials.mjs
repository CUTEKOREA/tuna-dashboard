#!/usr/bin/env node
/**
 * 자격증명 점검 CLI.
 *
 * 각 서비스에 최소 요청을 보내 env에 든 키가 실제로 인증되는지 확인한다.
 * 키 재발급 전후로 돌려 "구 키가 죽었는지 / 새 키가 사는지"를 판정하는 용도다.
 *
 *   node scripts/verify_credentials.mjs              # 전체
 *   node scripts/verify_credentials.mjs DATA_GO_KR   # 일부
 *
 * 키 값은 절대 출력하지 않는다. 설정 여부와 응답 결과만 보고한다.
 * 종료 코드: 설정된 키가 전부 통과하면 0, 하나라도 실패하면 1.
 */

const TIMEOUT_MS = 8000;

/**
 * 각 항목은 env 이름과, 그 키로 실제 인증이 필요한 최소 요청 하나를 갖는다.
 * 인증이 안 되면 4xx나 서비스 고유 오류 코드가 돌아오는 엔드포인트를 골랐다.
 */
const SERVICES = [
  {
    id: 'DATA_GO_KR',
    env: ['DATA_GO_KR_NEW_KEY', 'DATA_GO_KR_COMMON_KEY', 'KCS_API_KEY'],
    portal: 'https://www.data.go.kr/iim/api/selectAPIAcountView.do',
    url: (k) =>
      `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList?serviceKey=${encodeURIComponent(k)}&strtYymm=202601&endYymm=202601&hsSgn=0306171090`,
    // data.go.kr은 인증 실패도 HTTP 200에 XML 오류코드로 준다.
    judge: async (res) => {
      const text = await res.text();
      if (/SERVICE_KEY_IS_NOT_REGISTERED|SERVICE ERROR|등록되지 않은 인증키/.test(text)) {
        return { ok: false, reason: '인증키 미등록/폐기' };
      }
      if (/<resultCode>00<\/resultCode>/.test(text)) return { ok: true };
      const code = text.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1];
      return { ok: false, reason: `resultCode=${code ?? 'none'}` };
    },
  },
  {
    id: 'FISHERY',
    env: ['FISHERY_API_KEY'],
    portal: 'https://www.data.go.kr/iim/api/selectAPIAcountView.do',
    url: (k) =>
      `https://api.odcloud.kr/api/15115888/v1/uddi:f1f70029-fcde-426c-a9fa-cfa0b7fe0b96?page=1&perPage=1&serviceKey=${encodeURIComponent(k)}`,
    judge: async (res) => (res.ok ? { ok: true } : { ok: false, reason: `HTTP ${res.status}` }),
  },
  {
    id: 'KAMIS',
    env: ['KAMIS_API_KEY'],
    portal: 'https://www.kamis.or.kr/customer/reference/openapi_list.do',
    url: (k) =>
      `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=02&p_item_category_code=100&p_cert_key=${encodeURIComponent(k)}&p_cert_id=${process.env.KAMIS_CERT_ID ?? ''}&p_returntype=json`,
    judge: async (res) => {
      const text = await res.text();
      if (/인증키|권한|error/i.test(text) && !/"data"/.test(text)) {
        return { ok: false, reason: '인증 거부 응답' };
      }
      return res.ok ? { ok: true } : { ok: false, reason: `HTTP ${res.status}` };
    },
  },
  {
    id: 'DART',
    env: ['DART_API_KEY'],
    portal: 'https://opendart.fss.or.kr/uss/umt/EgovMberSrch.do',
    url: (k) => `https://opendart.fss.or.kr/api/list.json?crtfc_key=${encodeURIComponent(k)}&page_count=1`,
    judge: async (res) => {
      const j = await res.json().catch(() => null);
      // 000 정상, 013 데이터없음(키는 유효), 그 외는 키 문제로 본다.
      if (j && ['000', '013'].includes(j.status)) return { ok: true };
      return { ok: false, reason: `status=${j?.status ?? 'none'} ${j?.message ?? ''}`.trim() };
    },
  },
  {
    id: 'USDA_FAS',
    env: ['USDA_FAS_API_KEY'],
    portal: 'https://apps.fas.usda.gov/opendataweb/home',
    url: () => 'https://api.fas.usda.gov/api/esr/regions',
    headers: (k) => ({ 'X-Api-Key': k }),
    judge: async (res) => (res.ok ? { ok: true } : { ok: false, reason: `HTTP ${res.status}` }),
  },
  {
    id: 'US_CENSUS',
    env: ['USCENSUS_API_KEY'],
    portal: 'https://api.census.gov/data/key_signup.html',
    url: (k) =>
      `https://api.census.gov/data/timeseries/intltrade/imports/hs?get=CTY_NAME&I_COMMODITY=030617&time=2024-01&key=${encodeURIComponent(k)}`,
    judge: async (res) => (res.ok ? { ok: true } : { ok: false, reason: `HTTP ${res.status}` }),
  },
  {
    id: 'UN_COMTRADE',
    env: ['UN_COMTRADE_PRIMARY_KEY', 'UN_COMTRADE_SECONDARY_KEY'],
    portal: 'https://comtradedeveloper.un.org/signin',
    url: (k) =>
      `https://comtradeapi.un.org/data/v1/get/C/A/HS?cmdCode=030617&flowCode=M&partnerCode=0&reporterCode=410&period=2023&subscription-key=${encodeURIComponent(k)}`,
    judge: async (res) => (res.ok ? { ok: true } : { ok: false, reason: `HTTP ${res.status}` }),
  },
];

async function checkOne(service, envName) {
  const key = process.env[envName];
  if (!key) return { envName, state: 'UNSET' };
  const started = Date.now();
  try {
    const res = await fetch(service.url(key), {
      headers: service.headers ? service.headers(key) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const verdict = await service.judge(res);
    return { envName, state: verdict.ok ? 'LIVE' : 'DEAD', reason: verdict.reason, ms: Date.now() - started };
  } catch (e) {
    const name = e?.name === 'TimeoutError' ? 'timeout' : (e?.name ?? 'error');
    return { envName, state: 'ERROR', reason: name, ms: Date.now() - started };
  }
}

const wanted = process.argv.slice(2).map((s) => s.toUpperCase());
const targets = wanted.length ? SERVICES.filter((s) => wanted.includes(s.id)) : SERVICES;

if (targets.length === 0) {
  console.error(`알 수 없는 서비스. 사용 가능: ${SERVICES.map((s) => s.id).join(', ')}`);
  process.exit(2);
}

let failed = 0;
let checked = 0;

for (const service of targets) {
  console.log(`\n▶ ${service.id}`);
  for (const envName of service.env) {
    const r = await checkOne(service, envName);
    if (r.state === 'UNSET') {
      console.log(`   ○ ${envName.padEnd(28)} 미설정`);
      continue;
    }
    checked += 1;
    const mark = r.state === 'LIVE' ? '✓' : '✗';
    const tail = r.reason ? ` — ${r.reason}` : '';
    console.log(`   ${mark} ${envName.padEnd(28)} ${r.state} (${r.ms}ms)${tail}`);
    if (r.state !== 'LIVE') failed += 1;
  }
  console.log(`   발급/재발급: ${service.portal}`);
}

console.log(`\n검사 ${checked}건 · 실패 ${failed}건`);
if (checked === 0) {
  console.log('설정된 키가 없다. 재발급 후 env를 채우고 다시 실행하라.');
}
process.exit(failed > 0 ? 1 : 0);
