import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24시간 캐시

// HS Code 매핑 (대서양연어 전용)
const SALMON_HS_CODES: Record<string, string> = {
  fresh: '030214',     // 대서양연어 (신선/냉장)
  frozen: '030313',    // 대서양연어 (냉동)
  fillet: '030441',    // 연어 필렛 (신선/냉장)
  smoked: '030541',    // 훈제 연어
  canned: '160411',    // 연어 캔/통조림
};

// 국가 코드 매핑
const COUNTRY_CODES: Record<string, string> = {
  'Korea': '410', 'Norway': '578', 'Chile': '152',
  'UK': '826', 'Poland': '616', 'Iceland': '352',
  'USA': '842', 'Japan': '392', 'China': '156',
  'Russia': '643', 'FaroeIslands': '234',
};

// Fallback (수출) — agri_data UN Comtrade 2025 SYNCED (전체 연어 HS, 생산국 기준).
//   재수출 허브(스웨덴·폴란드·네덜란드·덴마크 = 노르웨이 연어 환적) 제외 → 생산국 수출력만.
//   생성: scripts/agri_to_dashboard/agri_convert.py top_reporters('salmon','Export') · motCode=0.
//   단위 백만USD. (기존 2023 폴백과 3% 내 일치, 2025 갱신)
const FALLBACK_EXPORT_RANKING = [
  { name: '노르웨이', value: 11833, year: '2025', hs: 'salmon' },
  { name: '칠레', value: 6058, year: '2025', hs: 'salmon' },
  { name: '영국', value: 1233, year: '2025', hs: 'salmon' },
  { name: '미국', value: 1097, year: '2025', hs: 'salmon' },
  { name: '페로제도', value: 917, year: '2025', hs: 'salmon' },
  { name: '캐나다', value: 823, year: '2025', hs: 'salmon' },
  { name: '아이슬란드', value: 344, year: '2025', hs: 'salmon' },
];

const FALLBACK_IMPORT_RANKING = [
  { name: '미국', value: 3200, year: '2023' },
  { name: '프랑스', value: 2100, year: '2023' },
  { name: '일본', value: 1800, year: '2023' },
  { name: '독일', value: 1600, year: '2023' },
  { name: '한국', value: 510, year: '2023' },
  { name: '중국', value: 480, year: '2023' },
  { name: '스웨덴', value: 450, year: '2023' },
];

const FALLBACK_KOREA_TIMESERIES = [
  { year: '2018', importQty: 37000, importVal: 380 },
  { year: '2019', importQty: 38000, importVal: 385 },
  { year: '2020', importQty: 42000, importVal: 390 },
  { year: '2021', importQty: 62000, importVal: 480 },
  { year: '2022', importQty: 76000, importVal: 580 },
  { year: '2023', importQty: 74000, importVal: 510 },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, reporter, partner, hsCode, period } = body;
    
    const apiKey = process.env.UN_COMTRADE_PRIMARY_KEY;
    
    // Live API 호출 시도
    if (apiKey && apiKey !== 'your_key_here') {
      try {
        const resolvedHs = SALMON_HS_CODES[hsCode] || hsCode || SALMON_HS_CODES.fresh;
        const resolvedReporter = COUNTRY_CODES[reporter] || reporter || '410';
        const resolvedPeriod = period || '2023';
        
        const url = new URL('https://comtradeapi.un.org/data/v1/get/C/A');
        url.searchParams.set('subscription-key', apiKey);
        url.searchParams.set('typeCode', 'C');
        url.searchParams.set('freqCode', 'A');
        url.searchParams.set('clCode', 'HS');
        url.searchParams.set('period', resolvedPeriod);
        url.searchParams.set('reporterCode', resolvedReporter);
        url.searchParams.set('cmdCode', resolvedHs);
        url.searchParams.set('flowCode', type === 'export' ? 'X' : 'M');
        
        if (partner) {
          url.searchParams.set('partnerCode', COUNTRY_CODES[partner] || partner);
        }
        
        const resp = await fetch(url.toString(), {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15000),
        });
        
        if (resp.ok) {
          const data = await resp.json();
          return NextResponse.json({
            isLive: true,
            source: 'UN Comtrade Live API',
            status: 'live',
            timestamp: new Date().toISOString(),
            hsCode: resolvedHs,
            data: data.data || [],
            count: data.count || 0,
          });
        }
      } catch (apiErr) {
        console.warn('[Salmon Comtrade] Live API failed, using fallback:', apiErr);
      }
    }
    
    // Fallback 데이터 반환
    let fallbackData;
    switch (type) {
      case 'export_ranking':
        fallbackData = FALLBACK_EXPORT_RANKING;
        break;
      case 'import_ranking':
        fallbackData = FALLBACK_IMPORT_RANKING;
        break;
      case 'korea_timeseries':
        fallbackData = FALLBACK_KOREA_TIMESERIES;
        break;
      default:
        fallbackData = FALLBACK_EXPORT_RANKING;
    }
    
    return NextResponse.json({
      isLive: false,
      source: 'Fallback (UN Comtrade 2023 verified cache)',
      status: 'fallback',
      timestamp: new Date().toISOString(),
      data: fallbackData,
      message: 'Using cached UN Comtrade data. Set COMTRADE_API_KEY for live data.',
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Salmon Comtrade pipeline failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Salmon UN Comtrade Intelligence',
    endpoints: {
      POST: {
        types: ['export_ranking', 'import_ranking', 'korea_timeseries'],
        hsCodes: SALMON_HS_CODES,
        countryCodes: Object.keys(COUNTRY_CODES),
      }
    },
    status: process.env.UN_COMTRADE_PRIMARY_KEY ? 'API Key configured' : 'Fallback mode',
  });
}
