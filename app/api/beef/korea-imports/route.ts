import { NextResponse } from 'next/server';
import { logApiFail, logApiSuccess, logSchemaIssue } from '@/lib/api-debug';

/**
 * 한국 소고기 수입 파트너 LIVE API — W6
 * GET /api/beef/korea-imports
 *
 * Primary: UN Comtrade v1 API (Public Preview, 무인증)
 *   - reporter=410 (KOREA REP)
 *   - cmdCode=0201,0202
 *   - flowCode=M (수입)
 *   - 응답 partner별 합산 → Top 6
 *
 * KCS 대신 Comtrade 사유:
 *   - KCS `unipass.customs.go.kr/ets/index.do` endpoint는 미존재
 *   - 공공데이터포털 KCS API는 cntyCd 필수 + XML 응답 → 복잡도 증가
 *   - UN Comtrade는 한국 수입 데이터 직접 제공 + 무인증 + 이미 W5에서 검증된 패턴
 *
 * Fallback: 정적 (beefData.ts koreaImportPartnersData)
 */

const FALLBACK = [
  { country: '미국', volume: 248000, pct: 47.6, share2018: 51.2 },
  { country: '호주', volume: 188000, pct: 36.1, share2018: 39.5 },
  { country: '뉴질랜드', volume: 38000, pct: 7.3, share2018: 5.8 },
  { country: '캐나다', volume: 22000, pct: 4.2, share2018: 1.5 },
  { country: '우루과이', volume: 15000, pct: 2.9, share2018: 1.2 },
  { country: '멕시코', volume: 9500, pct: 1.8, share2018: 0.8 },
];

// UN Comtrade partnerCode (M49) → 한글
const PARTNER_KO: Record<string, string> = {
  '840': '미국', '842': '미국', '36': '호주', '554': '뉴질랜드',
  '124': '캐나다', '858': '우루과이', '484': '멕시코', '32': '아르헨티나',
  '152': '칠레', '76': '브라질', '392': '일본', '156': '중국',
  '724': '스페인', '208': '덴마크', '528': '네덜란드', '372': '아일랜드',
  '250': '프랑스', '380': '이탈리아',
};

interface ComtradeImportRow {
  partnerCode: number;
  partnerDesc: string;
  primaryValue: number;
  netWgt: number;
  cmdCode: string;
}

async function fetchComtradeKoreaImports(year: string): Promise<typeof FALLBACK | null> {
  const label = `beef/korea-imports[KR<-all,${year}]`;
  // reporter=410 (한국), flowCode=M (수입), cmdCode=0201+0202
  const url = `https://comtradeapi.un.org/public/v1/preview/C/A/HS?cmdCode=0201,0202&reporterCode=410&period=${year}&flowCode=M`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) {
      logApiFail(label, `HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    const rows: ComtradeImportRow[] = json?.data || [];
    if (!rows.length) {
      logSchemaIssue(label, 'data[] non-empty', JSON.stringify(json).slice(0, 300));
      return null;
    }

    // partner별 합산 (cmdCode 0201+0202 통합)
    const byPartner: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      if (!r.partnerCode || r.partnerCode === 0 || r.partnerCode === 899) continue;
      const w = r.netWgt || 0;
      if (w <= 0) continue;
      const key = String(r.partnerCode);
      byPartner[key] = (byPartner[key] || 0) + w;
      total += w;
    }
    if (total <= 0) {
      logSchemaIssue(label, 'positive netWgt sum', `sum=${total}, rows=${rows.length}, sample=${JSON.stringify(rows[0]).slice(0, 200)}`);
      return null;
    }

    const sorted = Object.entries(byPartner)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([code, vol]) => ({
        country: PARTNER_KO[code] || `(M49 ${code})`,
        volume: Math.round(vol / 1000), // kg → 톤
        pct: Number(((vol / total) * 100).toFixed(1)),
        share2018: FALLBACK.find(f => f.country === (PARTNER_KO[code] || code))?.share2018 || 0,
      }));
    logApiSuccess(label, `${sorted.length} partners, top: ${sorted[0]?.country} ${sorted[0]?.pct}%`);
    return sorted;
  } catch (e) {
    logApiFail(label, 'exception', String(e));
    return null;
  }
}

export async function GET() {
  let data = FALLBACK;
  let isLive = false;
  let source = 'UN Comtrade 한국 수입 정적 미러';

  const year = String(new Date().getFullYear() - 1);
  const live = await fetchComtradeKoreaImports(year);
  if (live && live.length >= 3) {
    data = live;
    isLive = true;
    source = `UN Comtrade Public Preview — 한국 수입 (reporter=410, HS 0201+0202, ${year})`;
  } else {
    source = `UN Comtrade 응답 부족 — 정적 미러 (${year})`;
  }

  return NextResponse.json({
    isLive,
    source,
    fetchedAt: new Date().toISOString(),
    data,
  }, { headers: { 'Cache-Control': 's-maxage=604800, stale-while-revalidate=2592000' } });
}
