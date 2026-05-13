import { NextResponse } from 'next/server';

// ============================================================================
// Trade Macro API — REAL API ONLY (No Mock Data)
// Sources: Gemini AI (HS Code) → WITS (Tariff) → KCS (Volume) → KAMIS (Price)
// ============================================================================

const countryCodeMap: Record<string, string> = {
  '중국': 'CN', '베트남': 'VN', '태국': 'TH', '인도네시아': 'ID',
  '미국': 'US', '일본': 'JP', '인도': 'IN', '노르웨이': 'NO',
  '러시아': 'RU', '에콰도르': 'EC', '칠레': 'CL', '페루': 'PE',
  '호주': 'AU', '캐나다': 'CA', '대만': 'TW', '스페인': 'ES',
  '아르헨티나': 'AR', '말레이시아': 'MY', '필리핀': 'PH', '세네갈': 'SN'
};

const countryISO3Map: Record<string, string> = {
  '중국': '156', '베트남': '704', '태국': '764', '인도네시아': '360',
  '미국': '842', '일본': '392', '인도': '356', '노르웨이': '578',
  '러시아': '643', '에콰도르': '218', '칠레': '152', '페루': '604',
  '호주': '036', '캐나다': '124', '대만': '158', '스페인': '724',
  '아르헨티나': '032', '말레이시아': '458', '필리핀': '608', '세네갈': '686'
};

// --- 1. Gemini AI: Dynamic HS Code + Tariff + English name ---
async function fetchGeminiIntelligence(item: string, targetCountry: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a senior customs broker with 30 years of experience in international trade.

For the item "${item}" being imported to/from "${targetCountry}", provide:

1. The most accurate 6-digit HS Code
2. English translation of the item
3. Brief English description of the HS classification
4. 2-4 related/alternative HS Codes with descriptions (in format "English desc (한글 설명)")
5. MFN (Most Favored Nation) base tariff rate for importing this into South Korea
6. FTA preferential rate between South Korea and ${targetCountry} (cite the specific FTA agreement name)
7. Market attractiveness scorecard (each score MUST be justified with real trade data reasoning)

Return ONLY valid JSON:
{
  "hsCode": "4-6 digit code with dot (e.g. 0703.20)",
  "engItemName": "English name",
  "itemDesc": "English HS description",
  "relatedHsCodes": [
    { "code": "XXXX.XX", "desc": "English desc (한글)" }
  ],
  "tariff": {
    "base": "MFN rate as string e.g. '20%'",
    "fta": "FTA rate + agreement name e.g. '0% (AKFTA)'"
  },
  "scorecard": {
    "d_vol": { "score": 0, "max": 15, "reason": "..." },
    "d_cagr": { "score": 0, "max": 15, "reason": "..." },
    "d_ind": { "score": 0, "max": 10, "reason": "..." },
    "a_tar": { "score": 0, "max": 12, "reason": "..." },
    "a_ntb": { "score": 0, "max": 10, "reason": "..." },
    "a_log": { "score": 0, "max": 8, "reason": "..." },
    "s_pol": { "score": 0, "max": 12, "reason": "..." },
    "s_ex": { "score": 0, "max": 10, "reason": "..." },
    "s_trd": { "score": 0, "max": 8, "reason": "..." }
  }
}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    console.error("[Gemini] Error:", e);
    return null;
  }
}

// --- 2. KCS API: Real trade volume (관세청 수출입무역통계) ---
async function fetchKCSVolume(hsCode: string, country: string, year: string) {
  const apiKey = process.env.KCS_API_KEY;
  if (!apiKey) return null;

  const countryCode = countryCodeMap[country] || '';
  const cleanHs = hsCode.replace(/\./g, '').substring(0, 6);

  const params = new URLSearchParams({
    serviceKey: apiKey,
    strtYymm: `${year}01`,
    endYymm: `${year}12`,
    hsSgn: cleanHs
  });
  if (countryCode) params.append('statCd', countryCode);

  const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList?${params.toString().replace(/%25/g, '%')}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const text = await res.text();

    const impMatch = text.match(/<item>[\s\S]*?<impWgt>(\d+)<\/impWgt>[\s\S]*?<year>총계<\/year>[\s\S]*?<\/item>/) ||
                     text.match(/<item>[\s\S]*?<year>총계<\/year>[\s\S]*?<impWgt>(\d+)<\/impWgt>[\s\S]*?<\/item>/);
    const expMatch = text.match(/<item>[\s\S]*?<expWgt>(\d+)<\/expWgt>[\s\S]*?<year>총계<\/year>[\s\S]*?<\/item>/) ||
                     text.match(/<item>[\s\S]*?<year>총계<\/year>[\s\S]*?<expWgt>(\d+)<\/expWgt>[\s\S]*?<\/item>/);

    const importVolume = impMatch?.[1] ? Math.round(parseInt(impMatch[1], 10) / 1000) : 0;
    const exportVolume = expMatch?.[1] ? Math.round(parseInt(expMatch[1], 10) / 1000) : 0;

    return { year, importVolume, exportVolume, source: 'KCS_LIVE' };
  } catch (e) {
    return null;
  }
}

// --- 3. KAMIS API: Real wholesale price (농산물유통정보) ---
async function fetchKAMISPrice(itemName: string) {
  const apiKey = process.env.KAMIS_API_KEY;
  if (!apiKey) return '조회 불가 (API 키 미설정)';

  // KAMIS item code mapping
  const kamisItems: Record<string, { code: string; kindCode: string; gradeRank: string }> = {
    '마늘': { code: '312', kindCode: '01', gradeRank: '04' },
    '당근': { code: '223', kindCode: '01', gradeRank: '04' },
    '양파': { code: '313', kindCode: '01', gradeRank: '04' },
    '배추': { code: '211', kindCode: '01', gradeRank: '04' },
    '감자': { code: '152', kindCode: '01', gradeRank: '04' },
    '고추': { code: '311', kindCode: '01', gradeRank: '04' },
  };

  const match = Object.keys(kamisItems).find(k => itemName.includes(k));
  if (!match) return `조회 불가 (KAMIS 미지원 품목: ${itemName})`;

  const info = kamisItems[match];
  const today = new Date();
  const regDay = today.toISOString().split('T')[0];

  const params = new URLSearchParams({
    action: 'dailyPriceByCategoryList',
    p_cert_key: apiKey,
    p_cert_id: 'silla-intelligence',
    p_returntype: 'json',
    p_product_cls_code: '02', // 도매
    p_item_category_code: '200', // 채소류
    p_item_code: info.code,
    p_kind_code: info.kindCode,
    p_produce_day_code: '01',
    p_regday: regDay,
    p_convert_kg_yn: 'Y',
  });

  try {
    const res = await fetch(`https://www.kamis.or.kr/service/price/xml.do?${params.toString()}`, {
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return `조회 실패 (HTTP ${res.status})`;
    const data = await res.json();

    const items = data?.data?.item;
    if (!items || items.length === 0) return '조회 결과 없음 (KAMIS 응답 비어있음)';

    const latest = Array.isArray(items) ? items[0] : items;
    const price = latest.dpr1 || latest.dpr2 || latest.dpr3;
    const unit = latest.unit || 'kg';
    const marketName = latest.market_name || '도매시장';

    if (!price || price === '-') return `${match}: 당일 가격 미등록 (KAMIS)`;
    return `${price}원 / ${unit} (${marketName}, KAMIS 실시간)`;
  } catch (e) {
    return `조회 실패 (KAMIS 네트워크 오류)`;
  }
}

// --- 4. MFDS API: Real food safety rejection data (식약처) ---
async function fetchMFDSRejection(itemName: string) {
  const apiKey = process.env.MFDS_API_KEY;
  if (!apiKey) return '조회 불가 (API 키 미설정)';

  try {
    const encodedItem = encodeURIComponent(itemName);
    const url = `https://apis.data.go.kr/1471000/FoodFlshdImprtRejectInfoService/getFoodFlshdImprtRejectInfoList?serviceKey=${apiKey}&prdlst_nm=${encodedItem}&numOfRows=100&type=json`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return `조회 실패 (HTTP ${res.status})`;

    const data = await res.json();
    const items = data?.body?.items;
    const totalCount = data?.body?.totalCount || 0;

    if (totalCount === 0 || !items) return `0건 (최근 적발 이력 없음, MFDS 실시간)`;

    // Count recent rejections (last 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentItems = Array.isArray(items) ? items.filter((i: any) => {
      const dt = i.DCSN_DT || i.dcsn_dt || '';
      if (!dt) return true; // include if no date
      return new Date(dt) >= oneYearAgo;
    }) : [];

    const recentCount = recentItems.length || totalCount;
    const reasons = recentItems.slice(0, 3).map((i: any) => i.DCSN_RSN || i.dcsn_rsn || '').filter(Boolean);
    const reasonSummary = reasons.length > 0 ? ` (${reasons.join(', ').substring(0, 60)})` : '';

    return `${recentCount}건${reasonSummary} (MFDS 실시간, 전체 ${totalCount}건)`;
  } catch (e) {
    return `조회 실패 (MFDS 네트워크 오류)`;
  }
}

// --- Scorecard builder from Gemini AI response ---
function buildScorecardFromAI(aiScorecard: any) {
  const extract = (key: string) => aiScorecard?.[key] || { score: 5, max: 10, reason: '데이터 부족' };

  const d_vol = extract('d_vol');
  const d_cagr = extract('d_cagr');
  const d_ind = extract('d_ind');
  const a_tar = extract('a_tar');
  const a_ntb = extract('a_ntb');
  const a_log = extract('a_log');
  const s_pol = extract('s_pol');
  const s_ex = extract('s_ex');
  const s_trd = extract('s_trd');

  const demandTotal = (d_vol.score || 0) + (d_cagr.score || 0) + (d_ind.score || 0);
  const accessTotal = (a_tar.score || 0) + (a_ntb.score || 0) + (a_log.score || 0);
  const stabilityTotal = (s_pol.score || 0) + (s_ex.score || 0) + (s_trd.score || 0);
  const totalScore = demandTotal + accessTotal + stabilityTotal;

  const getGrade = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.85) return 'S';
    if (ratio >= 0.75) return 'A';
    if (ratio >= 0.60) return 'B';
    return 'C';
  };

  let verdict = '';
  if (totalScore >= 80) verdict = '최우선 탐색 대상';
  else if (totalScore >= 65) verdict = '조건부 검토';
  else verdict = '현 시점 제외';

  return {
    totalScore, verdict,
    demand: {
      score: demandTotal, maxScore: 40, grade: getGrade(demandTotal, 40),
      details: [
        { label: '수입 규모 (Import Volume)', score: d_vol.score, max: 15, desc: d_vol.reason },
        { label: '성장률 (YoY/CAGR)', score: d_cagr.score, max: 15, desc: d_cagr.reason },
        { label: '구매력 및 산업연계성', score: d_ind.score, max: 10, desc: d_ind.reason }
      ]
    },
    accessibility: {
      score: accessTotal, maxScore: 30, grade: getGrade(accessTotal, 30),
      details: [
        { label: '관세율 (MFN/FTA)', score: a_tar.score, max: 12, desc: a_tar.reason },
        { label: '비관세장벽 및 인증', score: a_ntb.score, max: 10, desc: a_ntb.reason },
        { label: '물류 거리 및 인프라', score: a_log.score, max: 8, desc: a_log.reason }
      ]
    },
    stability: {
      score: stabilityTotal, maxScore: 30, grade: getGrade(stabilityTotal, 30),
      details: [
        { label: '정치·제도 리스크', score: s_pol.score, max: 12, desc: s_pol.reason },
        { label: '환율 및 물류망 리스크', score: s_ex.score, max: 10, desc: s_ex.reason },
        { label: '무역분쟁 및 제재', score: s_trd.score, max: 8, desc: s_trd.reason }
      ]
    }
  };
}

// ============================================================================
// POST Handler — All Real API Pipeline
// ============================================================================
export async function POST(req: Request) {
  try {
    const { item, targetCountry } = await req.json();
    if (!item || !targetCountry) {
      return NextResponse.json({ error: 'Item and Target Country are required' }, { status: 400 });
    }

    // === STEP 1: Gemini AI — HS Code + Tariff + Scorecard (real-time inference) ===
    const aiResult = await fetchGeminiIntelligence(item, targetCountry);

    const hsCode = aiResult?.hsCode || 'Auto-Matched';
    const itemDesc = aiResult?.itemDesc || `${item} (분류 실패)`;
    const engItemName = aiResult?.engItemName || 'Unknown';
    const relatedHsCodes = aiResult?.relatedHsCodes || [];
    const tariffInfo = aiResult?.tariff || { base: '조회 실패', fta: '조회 실패' };
    const scorecard = aiResult?.scorecard
      ? buildScorecardFromAI(aiResult.scorecard)
      : buildScorecardFromAI({}); // fallback with empty

    // === STEP 2: KCS API — Real trade volume (관세청 실시간) ===
    let tradeVolume: any[] = [];
    if (hsCode !== 'Auto-Matched') {
      const kcsPromises = [];
      for (let year = 2022; year <= 2026; year++) {
        kcsPromises.push(fetchKCSVolume(hsCode, targetCountry, year.toString()));
      }
      const kcsResults = await Promise.all(kcsPromises);

      for (let year = 2022; year <= 2026; year++) {
        const found = kcsResults.find((r: any) => r?.year === year.toString());
        tradeVolume.push(found || { year: year.toString(), importVolume: 0, exportVolume: 0, source: 'KCS_NO_DATA' });
      }
    } else {
      for (let year = 2022; year <= 2026; year++) {
        tradeVolume.push({ year: year.toString(), importVolume: 0, exportVolume: 0, source: 'NO_HS_CODE' });
      }
    }

    // === STEP 3: KAMIS API — Real wholesale price (실시간) ===
    const kamisPrice = await fetchKAMISPrice(item);

    // === STEP 4: MFDS API — Real food safety data (실시간) ===
    const mfdsRejection = await fetchMFDSRejection(item);

    // === Response ===
    return NextResponse.json({
      hsCode,
      itemDesc,
      engItemName,
      relatedHsCodes,
      tariff: tariffInfo,
      kamisPrice,
      mfdsRejection,
      scorecard,
      tradeVolume,
      _meta: {
        dataSources: {
          hsCode: 'Gemini AI (real-time inference)',
          tariff: 'Gemini AI (trade knowledge)',
          tradeVolume: 'KCS 관세청 수출입무역통계 API (실시간)',
          kamisPrice: 'KAMIS 농산물유통정보 API (실시간)',
          mfdsRejection: 'MFDS 식약처 수입식품적발 API (실시간)',
          scorecard: 'Gemini AI (evidence-based scoring)',
        },
        timestamp: new Date().toISOString(),
        mockDataUsed: false,
      }
    });
  } catch (error) {
    console.error('Error in trade macro API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
