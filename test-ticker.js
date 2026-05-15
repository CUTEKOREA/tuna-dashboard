

async function fetchWithProxy(targetUrl) {
  const proxyUrl = process.env.KOREA_API_PROXY_URL;
  const proxySecret = process.env.PROXY_SECRET || 'silla-tuna-secret-2026';
  
  if (proxyUrl) {
    const finalUrl = `${proxyUrl}/proxy?secret=${proxySecret}&url=${encodeURIComponent(targetUrl)}`;
    return fetch(finalUrl);
  }
  return fetch(targetUrl);
}

async function testKAMIS() {
  const key = process.env.KAMIS_API_KEY;
  if (!key) {
    console.log("NO KAMIS KEY");
    return;
  }
  try {
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const regDay = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const url = `https://www.kamis.or.kr/service/price/xml.do?action=dailySalesList` +
        `&p_regday=${regDay}&p_convert_kg_yn=N&p_item_category_code=600&p_country_code=1101` +
        `&p_product_cls_code=02&p_item_code=614&p_unit=&p_cert_key=${key}&p_cert_id=5818&p_returntype=json`;
      
      const res = await fetchWithProxy(url);
      const text = await res.text();
      console.log(`KAMIS [${regDay}]: Status ${res.status}, Length: ${text.length}`);
      try {
        const json = JSON.parse(text);
        if (typeof json === 'object' && json.condition && json.condition[0]?.length === 0) {
            console.log(`KAMIS [${regDay}]: NO DATA (condition 0)`);
            continue;
        }
        const items = json?.data?.item;
        if (items && items.length > 0) {
            console.log(`KAMIS [${regDay}]: FOUND DATA!`, items[0].dpr1);
            return;
        } else {
            console.log(`KAMIS [${regDay}]: Empty items`);
        }
      } catch (e) {
        console.log(`KAMIS JSON parse error`, text.substring(0, 100));
      }
    }
  } catch (e) {
    console.log('KAMIS error', e.message);
  }
}

async function testKCS() {
  const key = process.env.KCS_API_KEY;
  if (!key) {
    console.log("NO KCS KEY");
    return;
  }
  try {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://unipass.customs.go.kr:38010/ext/rest/trtImpExpStas/retrieveTrtImpExpStas` +
      `?crkyCn=${key}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=160414&lclsNm=&dtyTp=&natCd=&netSlTp=00&imexTp=1` +
      `&pageIndex=1&pageSize=10&imexCd=I`;
    
    const res = await fetchWithProxy(url);
    const xml = await res.text();
    console.log(`KCS XML length: ${xml.length}, Status: ${res.status}`);
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    if (items.length > 0) {
      const latestItem = items[items.length - 1][1];
      const amtMatch = latestItem.match(/<totCurAmt>([\d.]+)<\/totCurAmt>/);
      const wgtMatch = latestItem.match(/<totWghtKg>([\d.]+)<\/totWghtKg>/);
      console.log(`KCS Match AMT: ${amtMatch?.[1]}, WGT: ${wgtMatch?.[1]}`);
    } else {
      console.log("KCS NO ITEMS:", xml.substring(0, 200));
    }
  } catch (e) {
    console.log('KCS error', e.message);
  }
}

async function testECOS() {
  const key = process.env.ECOS_API_KEY;
  if (!key) {
    console.log("NO ECOS KEY");
    return;
  }
  try {
    const now = new Date();
    const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const start = new Date();
    start.setDate(now.getDate() - 30);
    const startDate = `${start.getFullYear()}${String(start.getMonth() + 1).padStart(2, '0')}${String(start.getDate()).padStart(2, '0')}`;
    
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/1/30/731Y003/D/${startDate}/${endDate}/0000001`;
    const res = await fetchWithProxy(url);
    const text = await res.text();
    console.log(`ECOS length: ${text.length}, Status: ${res.status}`);
    try {
        const json = JSON.parse(text);
        const rows = json?.StatisticSearch?.row;
        if (rows && rows.length > 0) {
            console.log(`ECOS DATA FOUND: ${rows.length} rows, Latest: ${rows[rows.length - 1].DATA_VALUE}`);
        } else {
            console.log(`ECOS NO ROWS:`, text);
        }
    } catch(e) {
        console.log(`ECOS JSON Parse error`, text.substring(0, 100));
    }
  } catch(e) {
    console.log('ECOS error', e.message);
  }
}

async function run() {
  await testECOS();
  await testKAMIS();
  await testKCS();
}
run();
