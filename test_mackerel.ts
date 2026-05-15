import { fetch } from "undici";

const KAMIS_API_KEY = process.env.KAMIS_API_KEY || '6438ce04ca4a3ec4bcc72f295ab386baa74e52cacce9f725803e18cd8c6d1030';
const KCS_API_KEY = process.env.KCS_API_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c';
const ECOS_API_KEY = process.env.ECOS_API_KEY || '7L1D61C80Q4I5B3Y54W1';

async function testKAMIS() {
    const today = new Date().toISOString().split('T')[0];
    const url = `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=02&p_country_code=1101&p_regday=${today}&p_convert_kg_yn=Y&p_item_category_code=400&p_cert_key=${KAMIS_API_KEY}&p_cert_id=silla&p_returntype=json`;
    console.log("KAMIS:", url);
}
testKAMIS();
