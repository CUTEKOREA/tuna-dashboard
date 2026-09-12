import { NextResponse } from 'next/server';
import { optionalEnv } from '../_shared/env';

export const dynamic = 'force-dynamic';

// ============================================================================
// Phase 4: 리스크 레이더 API
// POST /api/risk-radar
// Sources: MFDS 식약처 + KOTRA 무역사기 + OFAC 제재 리스트
// ============================================================================

// --- MFDS: 수입식품 부적합 ---
// 2026-09-12 확인: 이 오픈API 는 존재하지 않는다. 공공데이터포털에서
// `FoodFlshdImprtRejectInfoService` 검색 결과가 0건이고, 이름 변형 세 가지(무접미·02·03) 모두
// 결과코드 12(해당 오픈API 서비스가 없거나 폐기됨)를 준다. 키 문제가 아니다.
// 그래서 호출을 지웠다. 매 요청마다 8초 타임아웃을 물고 실패하던 자리다.
// 대체 출처를 붙일 때 이 함수만 갈아 끼우면 된다.
function fetchMFDSRejections(_itemName: string) {
  return {
    count: null,
    items: [] as Array<Record<string, string>>,
    source: 'MFDS_SERVICE_RETIRED(포털에 해당 오픈API 없음 — 2026-09-12 확인)',
    available: false,
  };
}

// --- KOTRA: 무역사기 사례 ---
async function fetchKOTRAFraudCases(country: string) {
  const apiKey = optionalEnv('DATA_GO_KR_NEW_KEY');
  if (!apiKey) return { count: 0, cases: [], source: 'API_KEY_MISSING' };

  const kotraCountryMap: Record<string, string> = {
    '중국': 'CN', '베트남': 'VN', '태국': 'TH', '인도네시아': 'ID',
    '미국': 'US', '일본': 'JP', '인도': 'IN', '나이지리아': 'NG',
  };
  const code = kotraCountryMap[country] || country;

  try {
    const url = `https://apis.data.go.kr/B551170/cmmrcFraudCase?serviceKey=${apiKey}&numOfRows=10&pageNo=1&type=json&search4=${code}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { count: 0, cases: [], source: 'KOTRA_ERROR' };

    const data = await res.json();
    const items = data?.response?.body?.items?.item || data?.items || [];
    const parsed = (Array.isArray(items) ? items : [items]).map((i: any) => ({
      title: i.TITLE || i.title || 'N/A',
      date: i.WRITE_DATE || i.write_date || 'N/A',
      country: i.NATY_NM || i.natn_nm || country,
      fraudType: i.FRAUD_TYPE || i.fraud_type || 'N/A',
      summary: (i.CONTENT || i.content || '').substring(0, 300),
      damageAmount: i.DAMAGE_AMT || i.damage_amt || 'N/A',
    }));

    return { count: parsed.length, cases: parsed, source: 'KOTRA_LIVE' };
  } catch (e) {
    console.warn('[KOTRA Fraud] Error:', e);
    return { count: 0, cases: [], source: 'KOTRA_NETWORK_ERROR' };
  }
}

// --- OFAC SDN List Check (lightweight) ---
async function checkOFACSanctions(country: string) {
  // OFAC sanctioned countries (updated 2024)
  const sanctionedCountries = new Set([
    'CU', 'IR', 'KP', 'SY', 'RU', // Full/Partial sanctions
    'BY', 'MM', 'VE', 'NI', 'ZW', 'SD',
  ]);

  const countryCodeMap: Record<string, string> = {
    '중국': 'CN', '베트남': 'VN', '태국': 'TH', '인도네시아': 'ID',
    '미국': 'US', '일본': 'JP', '인도': 'IN', '러시아': 'RU',
    '쿠바': 'CU', '이란': 'IR', '북한': 'KP', '시리아': 'SY',
    '미얀마': 'MM', '베네수엘라': 'VE',
  };

  const code = countryCodeMap[country] || country;
  const isSanctioned = sanctionedCountries.has(code);

  return {
    country: code,
    isSanctioned,
    sanctionLevel: isSanctioned ? (
      ['CU', 'IR', 'KP', 'SY'].includes(code) ? 'FULL' : 'PARTIAL'
    ) : 'NONE',
    warning: isSanctioned
      ? `⚠️ ${country}(${code})는 OFAC 제재 대상국입니다. 거래 전 법률 검토 필수.`
      : `✅ ${country}(${code})는 OFAC 제재 대상국이 아닙니다.`,
    source: 'OFAC_REFERENCE_DB',
  };
}

// --- Gemini AI: 종합 리스크 분석 ---
async function generateRiskAssessment(country: string, item: string, mfdsCount: number | null, fraudCount: number, isSanctioned: boolean) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a trade compliance analyst. Based on these REAL data points:
- Item: "${item}" imported from "${country}"
- MFDS food safety violations: ${mfdsCount === null ? 'unavailable (the source API no longer exists — do not treat this as zero)' : `${mfdsCount} cases found`}
- KOTRA trade fraud cases in ${country}: ${fraudCount} cases found
- OFAC sanctions status: ${isSanctioned ? 'SANCTIONED' : 'CLEAR'}

Provide a risk assessment in JSON format:
{
  "overallRisk": "LOW|MEDIUM|HIGH|CRITICAL",
  "score": 0-100 (100=safest),
  "summary_kr": "2-3 sentence Korean summary for executives",
  "recommendations_kr": ["action item 1 in Korean", "action item 2"]
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
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

// --- Main Handler ---
export async function POST(req: Request) {
  try {
    const { country, item } = await req.json();
    if (!country || !item) {
      return NextResponse.json({ error: 'country and item required' }, { status: 400 });
    }

    // Parallel API calls
    const [mfds, fraud, ofac] = await Promise.all([
      fetchMFDSRejections(item),
      fetchKOTRAFraudCases(country),
      checkOFACSanctions(country),
    ]);

    // AI Risk Assessment
    const aiAssessment = await generateRiskAssessment(
      country, item, mfds.count, fraud.count, ofac.isSanctioned
    );

    return NextResponse.json({
      country,
      item,
      mfds,
      fraud,
      ofac,
      aiAssessment,
      // L-12: 표준 isLive — 외부 소스 중 하나라도 실측 성공 시에만 true
      isLive: mfds.source === 'MFDS_LIVE' || fraud.source === 'KOTRA_LIVE',
      _meta: {
        dataSources: {
          mfds: mfds.source,
          fraud: fraud.source,
          ofac: ofac.source,
          aiAssessment: aiAssessment ? 'Gemini AI' : 'UNAVAILABLE',
        },
        timestamp: new Date().toISOString(),
        mfdsAvailable: mfds.available,
      }
    });
  } catch (error: any) {
    console.error('[Risk Radar] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
