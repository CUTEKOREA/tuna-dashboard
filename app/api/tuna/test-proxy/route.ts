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
 * 응답은 고정된 대상 origin과 HTTP 상태만 제공한다. URL 경로, 원문 본문,
 * 예외 메시지는 짧은 키·인코딩·잘린 키까지 포함할 수 있어 반환하지 않는다.
 * ENABLE_PROXY_DIAGNOSTICS=1일 때만 동작한다.
 */

const DIAGNOSTIC_TARGETS: Record<string, string> = {
  ecos: 'https://ecos.bok.or.kr',
  kamis: 'https://www.kamis.or.kr',
  kcs: 'https://unipass.customs.go.kr',
};

export async function GET(req: Request) {
  // 진단 라우트는 기본 비활성. 켜야만 동작한다.
  if (optionalEnv('ENABLE_PROXY_DIAGNOSTICS') !== '1') {
    return NextResponse.json({ error: 'diagnostics disabled' }, { status: 404 });
  }

  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'ecos';
  if (!Object.hasOwn(DIAGNOSTIC_TARGETS, type)) {
    return NextResponse.json({ error: '지원하지 않는 진단 대상입니다.' }, { status: 400 });
  }

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
    await res.body?.cancel();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      target: DIAGNOSTIC_TARGETS[type],
      body: '응답 본문은 보안상 제공하지 않습니다.',
    });
  } catch {
    return NextResponse.json({
      error: '프록시 요청에 실패했습니다.',
    });
  }
}
