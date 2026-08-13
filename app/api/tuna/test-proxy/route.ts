import { NextResponse } from 'next/server';
import { requireEnv, optionalEnv } from '../../_shared/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 프록시 경유 진단용 라우트.
 *
 * 2026-08-13: 이 라우트가 응답 본문에 자격증명을 그대로 실어 보내고 있었다.
 * `finalUrl`을 그대로 반환했는데 그 URL은
 * `${proxyUrl}/proxy?secret=${PROXY_SECRET}&url=<대상URL>` 형태이고,
 * 대상 URL에는 type에 따라 ECOS_API_KEY · KAMIS_CERT_KEY · DATA_GO_KR_NEW_KEY가
 * 쿼리스트링으로 박혀 있었다. 인증 없는 공개 라우트라 누구나 호출하면
 * 키 네 종을 한 번에 가져갈 수 있었다.
 *
 * 두 가지를 바꿨다.
 *  1. 응답에서 비밀을 제거한다. URL은 호스트·경로만 남기고 쿼리값을 가린다.
 *     업스트림 본문도 알려진 비밀 문자열이 있으면 지운다.
 *  2. 진단 라우트이므로 기본적으로 꺼 둔다. ENABLE_PROXY_DIAGNOSTICS=1일 때만 동작한다.
 */

/** 응답에 실릴 수 있는 값들. 하나라도 새면 안 된다. */
function secretValues(): string[] {
  return [
    'PROXY_SECRET',
    'DATA_GO_KR_NEW_KEY',
    'DATA_GO_KR_COMMON_KEY',
    'ECOS_API_KEY',
    'KAMIS_CERT_KEY',
    'KAMIS_API_KEY',
    'KAMIS_CERT_ID',
    'KOREA_API_PROXY_URL',
  ]
    .map((name) => process.env[name])
    .filter((v): v is string => !!v && v.length >= 8);
}

/** 알려진 비밀 문자열을 지운다. 길이 순 내림차순으로 지워 부분치환을 피한다. */
function redact(text: string): string {
  let out = text;
  for (const secret of secretValues().sort((a, b) => b.length - a.length)) {
    out = out.split(secret).join('‹redacted›');
  }
  return out;
}

/** URL에서 쿼리값을 전부 가린다. 키 이름만 남겨 어떤 파라미터를 보냈는지는 보이게 한다. */
function safeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const keys = [...u.searchParams.keys()];
    return `${u.origin}${u.pathname}${keys.length ? `?${keys.map((k) => `${k}=‹redacted›`).join('&')}` : ''}`;
  } catch {
    return '‹unparseable url›';
  }
}

export async function GET(req: Request) {
  // 진단 라우트는 기본 비활성. 켜야만 동작한다.
  if (optionalEnv('ENABLE_PROXY_DIAGNOSTICS') !== '1') {
    return NextResponse.json({ error: 'diagnostics disabled' }, { status: 404 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'ecos';

  const proxyUrl = optionalEnv('KOREA_API_PROXY_URL');
  if (!proxyUrl) {
    return NextResponse.json({ error: 'KOREA_API_PROXY_URL is not set' });
  }

  let targetUrl = '';
  if (type === 'ecos') {
    const ecosKey = optionalEnv('ECOS_API_KEY');
    const now = new Date();
    const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const startDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}01`;
    targetUrl = `https://ecos.bok.or.kr/api/StatisticSearch/${ecosKey}/json/kr/1/5/731Y003/D/${startDate}/${endDate}/0000001`;
  } else if (type === 'kamis') {
    const kamisId = optionalEnv('KAMIS_CERT_ID');
    const kamisKey = optionalEnv('KAMIS_CERT_KEY');
    const today = new Date().toISOString().split('T')[0];
    targetUrl = `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=02&p_regday=${today}&p_convert_kg_yn=Y&p_item_category_code=600&p_cert_key=${kamisKey}&p_cert_id=${kamisId}&p_returntype=json`;
  } else if (type === 'kcs') {
    const kcsKey = requireEnv('DATA_GO_KR_NEW_KEY');
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const searchBgnDe = `${lastMonth.getFullYear()}${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    const searchEndDe = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    targetUrl = `https://unipass.customs.go.kr/ext/rest/trtImpExpStas/retrieveTrtImpExpStas?crkyCn=${kcsKey}&strtYymm=${searchBgnDe}&endYymm=${searchEndDe}&hsSgn=160414&lclsNm=&dtyTp=&natCd=&netSlTp=00&imexTp=1&pageIndex=1&pageSize=10&imexCd=E`;
  }

  const finalUrl = `${proxyUrl}/proxy?secret=${requireEnv('PROXY_SECRET')}&url=${encodeURIComponent(targetUrl)}`;

  try {
    const res = await fetch(finalUrl);
    const text = await res.text();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      // 원본 URL은 절대 그대로 내보내지 않는다.
      target: safeUrl(targetUrl),
      body: redact(text.substring(0, 1000)),
    });
  } catch (err) {
    return NextResponse.json({
      error: redact(err instanceof Error ? err.message : 'unknown'),
    });
  }
}
