const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1];
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  }
});

async function testKCS() {
  const key = process.env.KCS_API_KEY;
  const now = new Date();
  const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMM = `${now.getFullYear()}${String(now.getMonth()).padStart(2, '0')}`;
  const url = `https://unipass.customs.go.kr:38010/ext/rest/trtImpExpStas/retrieveTrtImpExpStas?crkyCn=${key}&strtYymm=${prevMM}&endYymm=${yyyyMM}&hsSgn=160414&lclsNm=&dtyTp=&natCd=&netSlTp=00&imexTp=1&pageIndex=1&pageSize=10&imexCd=I`;
  console.log('KCS URL:', url);
  try {
    const res = await fetch(url);
    console.log('KCS Status:', res.status);
    const text = await res.text();
    console.log('KCS Response:', text.substring(0, 200));
  } catch (err) {
    console.error('KCS Error:', err);
  }
}

async function testECOS() {
  const key = process.env.ECOS_API_KEY;
  const now = new Date();
  const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const startDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}01`;
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/1/5/731Y003/D/${startDate}/${endDate}/0000001`;
  console.log('ECOS URL:', url);
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log('ECOS Response:', JSON.stringify(json).substring(0, 200));
  } catch (err) {
    console.error('ECOS Error:', err);
  }
}

async function testKAMIS() {
  const key = process.env.KAMIS_API_KEY;
  const now = new Date();
  const regDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const url = `https://www.kamis.or.kr/service/price/xml.do?action=dailySalesList&p_regday=${regDay}&p_convert_kg_yn=N&p_item_category_code=600&p_country_code=1101&p_product_cls_code=02&p_item_code=614&p_unit=&p_cert_key=${key}&p_cert_id=5818&p_returntype=json`;
  console.log('KAMIS URL:', url);
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log('KAMIS Response:', text.substring(0, 200));
  } catch (err) {
    console.error('KAMIS Error:', err);
  }
}

async function run() {
  await testKCS();
  await testECOS();
  await testKAMIS();
}
run();
