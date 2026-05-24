import { NextResponse } from 'next/server';

/**
 * 글로벌 소고기 무역 흐름 Top 8 LIVE API — W5
 * GET /api/beef/trade-flow
 *
 * Primary: UN Comtrade v1 API
 *   - HS 0201 (Bovine meat, fresh/chilled) + 0202 (Bovine meat, frozen)
 *   - 수출(X) 양자 흐름, 가장 최근 완료 연도
 *   - 상위 8개 export 라우트 (reporter → partner) 추출
 * Auth: COMTRADE_API_KEY (Ocp-Apim-Subscription-Key)
 * Fallback: 정적 캐시 (beefData.ts tradeFlowData 동기화)
 */

const FALLBACK = [
  { route: '브라질 → 중국', value: 6420, volume: 1352 },
  { route: '호주 → 미국', value: 2980, volume: 412 },
  { route: '미국 → 일본', value: 2156, volume: 285 },
  { route: '호주 → 일본', value: 1842, volume: 263 },
  { route: '브라질 → 미국', value: 1620, volume: 245 },
  { route: '미국 → 한국', value: 2310, volume: 248 },
  { route: '호주 → 한국', value: 1485, volume: 188 },
  { route: '뉴질랜드 → 미국', value: 985, volume: 165 },
];

// UN Comtrade country code (M49) → 한국 표기
const COUNTRY_KO: Record<string, string> = {
  '36': '호주', '76': '브라질', '124': '캐나다', '156': '중국', '203': '체코',
  '208': '덴마크', '276': '독일', '300': '그리스', '352': '아이슬란드',
  '356': '인도', '372': '아일랜드', '380': '이탈리아', '392': '일본',
  '410': '한국', '484': '멕시코', '528': '네덜란드', '554': '뉴질랜드',
  '578': '노르웨이', '724': '스페인', '826': '영국', '840': '미국',
  '858': '우루과이', '218': '에콰도르', '32': '아르헨티나', '600': '파라과이',
  '710': '남아공', '764': '태국', '704': '베트남', '458': '말레이시아',
  '702': '싱가포르', '344': '홍콩', '158': '대만',
  '842': '미국', '643': '러시아', '792': '튀르키예', '634': '카타르',
  '784': '아랍에미리트', '682': '사우디', '818': '이집트', '604': '페루',
  '152': '칠레', '170': '콜롬비아', '442': '룩셈부르크', '56': '벨기에',
  '40': '오스트리아', '203': '체코', '616': '폴란드', '748': '에스와티니',
};

interface ComtradeRow {
  reporterCode: number;
  reporterDesc: string;
  partnerCode: number;
  partnerDesc: string;
  primaryValue: number;
  netWgt: number;
  period: number;
  cmdCode: string;
}

function ko(code: number, fallback: string) {
  return COUNTRY_KO[String(code)] || fallback;
}

async function fetchComtradeBeef(key: string | undefined): Promise<{ data: typeof FALLBACK; via: 'premium' | 'preview' } | null> {
  // 가장 최근 완료 연도 — 보통 전년도
  const year = new Date().getFullYear() - 1;
  // HS 0201 (신선/냉장) + 0202 (냉동) — 합산
  const isPremium = !!(key && key !== 'pending_issuance');
  const base = isPremium
    ? 'https://comtradeapi.un.org/data/v1/get/C/A/HS'
    : 'https://comtradeapi.un.org/public/v1/preview/C/A/HS';
  // 핵심 수출 6개국 (브라질·호주·미국·뉴질랜드·우루과이·아르헨티나)
  // Premium은 reporter=all 가능, Preview는 specific 필요
  const reporterParam = isPremium ? 'all' : '76,36,840,554,858,32';
  const url = `${base}?cmdCode=0201,0202&reporterCode=${reporterParam}&period=${year}&flowCode=X${isPremium ? '&partnerCode=all&maxRecords=5000' : ''}`;

  try {
    const res = await fetch(url, {
      headers: isPremium ? { 'Ocp-Apim-Subscription-Key': key as string } : {},
      signal: AbortSignal.timeout(20000),
      next: { revalidate: 86400 * 7 }, // 1w cache (월간 갱신으로 충분)
    });
    if (!res.ok) return null;
    const json = await res.json();
    const rows: ComtradeRow[] = json?.data || [];
    if (!rows.length) return null;

    // reporter → partner 양자별 합산 (HS 0201+0202 통합)
    const flowMap: Record<string, { value: number; volume: number; reporter: number; partner: number }> = {};
    for (const r of rows) {
      // 'World'(0) · 'Areas, nes'(899) 파트너 제외, 자기 자신 제외, 음수/0 제외
      if (!r.partnerCode || r.partnerCode === 0 || r.partnerCode === 899) continue;
      if (r.reporterCode === r.partnerCode) continue;
      if (!r.primaryValue || r.primaryValue <= 0) continue;
      const key = `${r.reporterCode}-${r.partnerCode}`;
      if (!flowMap[key]) {
        flowMap[key] = { value: 0, volume: 0, reporter: r.reporterCode, partner: r.partnerCode };
      }
      flowMap[key].value += r.primaryValue; // USD
      flowMap[key].volume += r.netWgt || 0; // kg
    }

    const top8 = Object.values(flowMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map(f => {
        // Reporter name lookup
        const reporterRow = rows.find(r => r.reporterCode === f.reporter);
        const partnerRow = rows.find(r => r.partnerCode === f.partner);
        const reporterKo = ko(f.reporter, reporterRow?.reporterDesc || String(f.reporter));
        const partnerKo = ko(f.partner, partnerRow?.partnerDesc || String(f.partner));
        return {
          route: `${reporterKo} → ${partnerKo}`,
          value: Math.round(f.value / 1_000_000), // USD → 백만 USD
          volume: Math.round(f.volume / 1_000_000), // kg → 천 톤
        };
      });

    return { data: top8, via: isPremium ? 'premium' : 'preview' };
  } catch {
    return null;
  }
}

export async function GET() {
  const key = process.env.COMTRADE_API_KEY;
  let data = FALLBACK;
  let isLive = false;
  let source = '유엔 무역통계(UN Comtrade) 정적 미러';

  const live = await fetchComtradeBeef(key);
  if (live && live.data.length >= 3) {
    data = live.data;
    isLive = true;
    const channel = live.via === 'premium' ? 'Premium API' : 'Public Preview (무인증, 500 records)';
    source = `UN Comtrade ${channel} — HS 0201+0202 ${new Date().getFullYear() - 1} 수출, 1주 캐시`;
  } else if (key) {
    source = 'UN Comtrade Premium 응답 부족 — 정적 미러';
  } else {
    source = 'UN Comtrade Public Preview 실패 — 정적 미러';
  }

  return NextResponse.json({
    isLive,
    source,
    fetchedAt: new Date().toISOString(),
    data,
  }, {
    headers: { 'Cache-Control': 's-maxage=604800, stale-while-revalidate=2592000' },
  });
}
