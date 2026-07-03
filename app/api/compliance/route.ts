import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ============================================================================
// Compliance & Sanctions Radar API
// 1차: OFAC SDN(Specially Designated Nationals) 목록 실시간 조회 (공개 CSV, 키 불필요)
// 2차: 조회 실패 시 — 수산 분야 알려진 제재·IUU 엔티티 참조 DB로 폴백 (정직 STATIC)
// ============================================================================

// OFAC SDN 공개 CSV (인증 불필요, 현행 Sanctions List Service 직행 엔드포인트). 실패 시 참조 DB 폴백.
const OFAC_SDN_URL = 'https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/SDN.CSV';

// --- 수산 분야 알려진 제재/IUU 참조 DB (실제 공개 사실 기반, 폴백용) ---
// Pingtan(강제노동/IUU), Norebo(러시아 제재), Dalian Ocean(IUU) 등은 공개 보도·정부 자료 근거.
const REFERENCE_DB: Record<string, any> = {
  'thai union': { entity: 'Thai Union Group PCL', eu: { status: 'clean', detail: 'EU 참조 DB 무매칭' }, riskScore: 95, riskLevel: 'LOW' },
  'dongwon': { entity: 'Dongwon Industries', eu: { status: 'clean', detail: 'EU 참조 DB 무매칭' }, riskScore: 97, riskLevel: 'LOW' },
  'silla': { entity: 'Silla Co., Ltd.', eu: { status: 'clean', detail: 'EU 참조 DB 무매칭' }, riskScore: 98, riskLevel: 'LOW' },
  'sajo': { entity: 'Sajo Industries', eu: { status: 'clean', detail: 'EU 참조 DB 무매칭' }, riskScore: 96, riskLevel: 'LOW' },
  'nirsa': { entity: 'Nirsa S.A.', eu: { status: 'clean', detail: 'EU 참조 DB 무매칭' }, riskScore: 90, riskLevel: 'LOW' },
  'minh phu': { entity: 'Minh Phu Seafood', eu: { status: 'partial', detail: '유사명 — 수동 검토 권고' }, riskScore: 72, riskLevel: 'MEDIUM' },
  'dalian ocean': { entity: 'Dalian Ocean Fishing', eu: { status: 'partial', detail: 'IUU 선박 중첩(보도)' }, riskScore: 35, riskLevel: 'HIGH' },
  'pingtan': { entity: 'Pingtan Marine Enterprise', eu: { status: 'partial', detail: 'IUU·강제노동 우려(보도)' }, riskScore: 15, riskLevel: 'HIGH' },
  'norebo': { entity: 'Norebo Holding', eu: { status: 'partial', detail: '러시아 제재 EDD 필요' }, riskScore: 18, riskLevel: 'HIGH' },
  'pescanova': { entity: 'Nueva Pescanova', eu: { status: 'clean', detail: 'EU 참조 DB 무매칭' }, riskScore: 92, riskLevel: 'LOW' },
};

// OFAC SDN CSV에서 엔티티명 매칭 (실시간). 성공 시 {live:true, matches}, 실패 시 {live:false}.
async function queryOfacSdn(query: string): Promise<{ live: boolean; matches: string[] }> {
  if (query.length < 4) return { live: false, matches: [] };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(OFAC_SDN_URL, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'tuna-dashboard-compliance/1.0' },
      next: { revalidate: 86400 }, // 일 1회 캐시 (OFAC 명단은 매일 갱신)
    });
    clearTimeout(timer);
    if (!res.ok) return { live: false, matches: [] };
    const text = await res.text();
    const q = query.toLowerCase();
    const matches: string[] = [];
    // SDN.csv 형식: ent_num,"SDN_Name","SDN_Type","Program",...
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*\d+,"([^"]*)"/);
      if (m) {
        const name = m[1];
        if (name.toLowerCase().includes(q)) {
          matches.push(name);
          if (matches.length >= 5) break;
        }
      }
    }
    return { live: true, matches };
  } catch {
    return { live: false, matches: [] };
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Compliance & Sanctions API',
    version: '2.0.0',
    primarySource: 'OFAC SDN List (live CSV)',
    fallbackSource: 'Seafood sanctions/IUU reference DB (static)',
    endpoints: { POST: { body: { entity: 'string' }, response: 'ScreeningResult' } },
  });
}

export async function POST(req: Request) {
  try {
    const { entity } = await req.json();
    if (!entity || typeof entity !== 'string') {
      return NextResponse.json({ error: 'entity name is required' }, { status: 400 });
    }
    const query = entity.toLowerCase().trim();

    // 참조 DB 매칭 (EU·IUU 컨텍스트 + 폴백)
    const refKey = Object.keys(REFERENCE_DB).find(
      (k) => query.includes(k) || k.includes(query) || k.split(' ').some((w) => w.length > 3 && query.includes(w)),
    );
    const ref = refKey ? REFERENCE_DB[refKey] : null;

    // 1차: OFAC SDN 실시간 조회
    const ofac = await queryOfacSdn(query);

    if (ofac.live) {
      const flagged = ofac.matches.length > 0;
      const result = {
        entity,
        ofac: flagged
          ? { status: 'flagged', detail: `OFAC SDN 일치: ${ofac.matches[0]}${ofac.matches.length > 1 ? ` 외 ${ofac.matches.length - 1}건` : ''}` }
          : { status: 'clean', detail: 'OFAC SDN 목록 무매칭 (실시간 조회)' },
        eu: ref?.eu ?? { status: 'clean', detail: 'EU 참조 DB 무매칭' },
        riskScore: flagged ? 10 : (ref?.riskScore ?? 85),
        riskLevel: flagged ? 'CRITICAL' : (ref?.riskLevel ?? 'LOW'),
        isLive: true,
        source: 'OFAC_SDN_LIVE',
      };
      return NextResponse.json({
        meta: {
          query: entity,
          reliability: { score: 92, grade: 'A', label: 'OFAC SDN 실시간 조회' },
          source: 'OFAC_SDN_LIVE',
          isLive: true,
        },
        result,
      });
    }

    // 2차: 폴백 — 참조 DB (정직 STATIC)
    const result = ref
      ? { entity: ref.entity, ofac: { status: 'clean', detail: 'OFAC 실시간 조회 실패 — 참조 DB 기준' }, eu: ref.eu, riskScore: ref.riskScore, riskLevel: ref.riskLevel, isLive: false, source: 'OFAC_REFERENCE_DB' }
      : { entity, ofac: { status: 'partial', detail: 'OFAC 실시간 조회 실패 — 참조 DB 무매칭' }, eu: { status: 'partial', detail: '참조 DB 무매칭' }, riskScore: 60, riskLevel: 'MEDIUM', isLive: false, source: 'OFAC_REFERENCE_DB' };

    return NextResponse.json({
      meta: {
        query: entity,
        reliability: { score: 70, grade: 'B', label: '사전심사 참조 DB (OFAC 실시간 조회 실패)' },
        source: 'OFAC_REFERENCE_DB',
        isLive: false,
      },
      result,
    });
  } catch (error: any) {
    console.error('[Compliance API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
