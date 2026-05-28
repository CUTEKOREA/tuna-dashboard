import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'ecos';
  
  const proxyUrl = process.env.KOREA_API_PROXY_URL;
  if (!proxyUrl) {
    return NextResponse.json({ error: 'KOREA_API_PROXY_URL is not set' });
  }

  let targetUrl = '';
  if (type === 'ecos') {
    const ecosKey = process.env.ECOS_API_KEY;
    const now = new Date();
    const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const startDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}01`;
    targetUrl = `https://ecos.bok.or.kr/api/StatisticSearch/${ecosKey}/json/kr/1/5/731Y003/D/${startDate}/${endDate}/0000001`;
  } else if (type === 'kamis') {
    const kamisId = process.env.KAMIS_CERT_ID;
    const kamisKey = process.env.KAMIS_CERT_KEY;
    const today = new Date().toISOString().split('T')[0];
    targetUrl = `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=02&p_regday=${today}&p_convert_kg_yn=Y&p_item_category_code=600&p_cert_key=${kamisKey}&p_cert_id=${kamisId}&p_returntype=json`;
  } else if (type === 'kcs') {
    const kcsKey = (process.env.DATA_GO_KR_NEW_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c');
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const searchBgnDe = `${lastMonth.getFullYear()}${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    const searchEndDe = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    targetUrl = `https://unipass.customs.go.kr/ext/rest/trtImpExpStas/retrieveTrtImpExpStas?crkyCn=${kcsKey}&strtYymm=${searchBgnDe}&endYymm=${searchEndDe}&hsSgn=160414&lclsNm=&dtyTp=&natCd=&netSlTp=00&imexTp=1&pageIndex=1&pageSize=10&imexCd=E`;
  }

  const finalUrl = proxyUrl ? `${proxyUrl}/proxy?secret=silla-tuna-secret-2026&url=${encodeURIComponent(targetUrl)}` : targetUrl;

  try {
    const res = await fetch(finalUrl);
    const text = await res.text();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      finalUrl,
      body: text.substring(0, 1000)
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message
    });
  }
}
