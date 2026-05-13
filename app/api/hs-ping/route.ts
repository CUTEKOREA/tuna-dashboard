import { NextResponse } from 'next/server';

// HS Ping API Pipeline — HS Code Auto-Classification
// POST /api/hs-ping — Classify product description → HS/HTS codes
// GET  /api/hs-ping — Health check + supported countries
// Docs: https://hsping.com/docs
// Free Tier: 100 lookups/month, 50/min rate limit

const HSPING_BASE = 'https://api.hsping.com/api/v1';
const HSPING_TIMEOUT = 10000;

const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States', system: 'HTS' },
  { code: 'CA', name: 'Canada', system: 'HS' },
  { code: 'GB', name: 'United Kingdom', system: 'HS' },
  { code: 'EU', name: 'European Union', system: 'CN' },
  { code: 'SG', name: 'Singapore', system: 'HS' },
  { code: 'AU', name: 'Australia', system: 'HS' },
  { code: 'IN', name: 'India', system: 'ITC-HS' },
];

// Curated fallback: Silla Co. pre-classified products
const HS_FALLBACK: Record<string, { hsCode: string; description: string; confidence: number; country: string; chapter: string; notes: string }[]> = {
  'frozen yellowfin tuna': [
    { hsCode: '0303.42.00', description: 'Yellowfin tunas (Thunnus albacares), frozen', confidence: 0.98, country: 'US', chapter: '03 — Fish', notes: 'Excl. fillets (0304), livers/roes (0302.91)' },
    { hsCode: '0303.42', description: 'Yellowfin tunas, frozen (6-digit)', confidence: 0.97, country: 'KR', chapter: '03', notes: 'MFN 10%, AKFTA 0%' },
  ],
  'frozen skipjack tuna': [
    { hsCode: '0303.43.00', description: 'Skipjack/stripe-bellied bonito (Katsuwonus pelamis), frozen', confidence: 0.97, country: 'US', chapter: '03 — Fish', notes: 'Primary canning species' },
  ],
  'canned tuna': [
    { hsCode: '1604.14.10', description: 'Tunas, in airtight containers', confidence: 0.95, country: 'US', chapter: '16 — Prep. of meat/fish', notes: 'Includes albacore and yellowfin' },
    { hsCode: '1604.14.22', description: 'Tunas, in oil, airtight containers', confidence: 0.93, country: 'US', chapter: '16', notes: 'Oil-packed variants' },
  ],
  'frozen hairtail': [
    { hsCode: '0303.89.00', description: 'Other fish, frozen, n.e.s.', confidence: 0.92, country: 'US', chapter: '03', notes: 'Largehead hairtail (Trichiurus lepturus)' },
    { hsCode: '0303.89.0065', description: 'Cutlassfish (hairtail), frozen', confidence: 0.95, country: 'US', chapter: '03', notes: 'USITC specific subheading' },
  ],
  'frozen mackerel': [
    { hsCode: '0303.54.00', description: 'Mackerels (Scomber scombrus/japonicus/australasicus), frozen', confidence: 0.97, country: 'US', chapter: '03', notes: 'All mackerel species' },
  ],
  'frozen alaska pollock': [
    { hsCode: '0303.63.00', description: 'Alaska Pollack (Theragra chalcogramma), frozen', confidence: 0.98, country: 'US', chapter: '03', notes: 'Primary surimi raw material' },
  ],
  'frozen shrimp': [
    { hsCode: '0306.17.00', description: 'Other shrimps and prawns, frozen', confidence: 0.96, country: 'US', chapter: '03', notes: 'Vannamei, black tiger, etc.' },
    { hsCode: '0306.17.0040', description: 'Shell-on shrimp, count >15/lb, frozen', confidence: 0.91, country: 'US', chapter: '03', notes: 'HTS 10-digit for shell-on' },
  ],
  'frozen squid': [
    { hsCode: '0307.43.00', description: 'Squid (Ommastrephes spp., Loligo spp.), frozen', confidence: 0.95, country: 'US', chapter: '03', notes: 'Includes Illex, Dosidicus' },
  ],
  'fresh garlic': [
    { hsCode: '0703.20.00', description: 'Garlic, fresh or chilled', confidence: 0.99, country: 'US', chapter: '07 — Vegetables', notes: 'KR: 360% MFN tariff' },
  ],
  'cashew nuts shelled': [
    { hsCode: '0801.32.00', description: 'Cashew nuts, fresh or dried, shelled', confidence: 0.98, country: 'US', chapter: '08 — Fruits/nuts', notes: 'Largest: Vietnam, India' },
  ],
  'cocoa beans': [
    { hsCode: '1801.00.00', description: 'Cocoa beans, whole or broken, raw or roasted', confidence: 0.99, country: 'US', chapter: '18 — Cocoa', notes: 'Origin: Ghana, Côte d\'Ivoire' },
  ],
  'cassava dried': [
    { hsCode: '0714.10.20', description: 'Cassava (manioc), dried (chips/pellets)', confidence: 0.96, country: 'US', chapter: '07', notes: 'Tapioca starch under 1108.14' },
  ],
};

// Korean product description mapping for fuzzy matching
const KR_TO_EN: Record<string, string> = {
  '냉동 황다랑어': 'frozen yellowfin tuna', '황다랑어': 'frozen yellowfin tuna',
  '냉동 가다랑어': 'frozen skipjack tuna', '가다랑어': 'frozen skipjack tuna',
  '참치 통조림': 'canned tuna', '참치통조림': 'canned tuna',
  '냉동 갈치': 'frozen hairtail', '갈치': 'frozen hairtail',
  '냉동 고등어': 'frozen mackerel', '고등어': 'frozen mackerel',
  '냉동 명태': 'frozen alaska pollock', '명태': 'frozen alaska pollock',
  '냉동 새우': 'frozen shrimp', '새우': 'frozen shrimp',
  '냉동 오징어': 'frozen squid', '오징어': 'frozen squid',
  '마늘': 'fresh garlic', '신선 마늘': 'fresh garlic',
  '캐슈넛': 'cashew nuts shelled', '카카오': 'cocoa beans',
  '카사바': 'cassava dried', '참치': 'frozen yellowfin tuna',
};

async function classifyWithHSPing(query: string, country: string = 'US'): Promise<any | null> {
  const apiKey = process.env.HSPING_API_KEY;
  if (!apiKey) return null;

  const url = `${HSPING_BASE}/find?q=${encodeURIComponent(query)}&country=${country}`;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), HSPING_TIMEOUT);
    const resp = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: ctrl.signal,
    });
    clearTimeout(tid);
    if (!resp.ok) {
      console.warn(`[HS Ping] ${resp.status}: ${await resp.text()}`);
      return null;
    }
    return await resp.json();
  } catch (e: any) {
    console.warn(`[HS Ping] Error: ${e.message}`);
    return null;
  }
}

export async function GET() {
  const hasKey = !!process.env.HSPING_API_KEY;
  return NextResponse.json({
    service: 'HS Ping Classification API', version: '1.0.0',
    status: hasKey ? 'operational' : 'fallback_only',
    apiKeyConfigured: hasKey,
    freeTierLimit: '100 lookups/month',
    supportedCountries: SUPPORTED_COUNTRIES,
    fallbackProducts: Object.keys(HS_FALLBACK).length,
    preClassifiedKR: Object.keys(KR_TO_EN).length,
    endpoints: {
      POST: { body: { query: 'Product description (EN/KR)', country: 'US|CA|GB|EU|SG (default: US)' } },
    },
  });
}

export async function POST(req: Request) {
  try {
    const { query, country } = await req.json();
    if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });

    const targetCountry = country || 'US';
    let source: 'HSPING_LIVE' | 'HSPING_FALLBACK' = 'HSPING_FALLBACK';

    // Normalize: Korean → English
    const normalizedQuery = KR_TO_EN[query] || query.toLowerCase().trim();

    // 1) Try HS Ping Live API
    const liveResult = await classifyWithHSPing(normalizedQuery, targetCountry);
    if (liveResult && (liveResult.results || liveResult.data)) {
      source = 'HSPING_LIVE';
      return NextResponse.json({
        meta: { query, normalizedQuery, country: targetCountry, source, timestamp: new Date().toISOString(),
          reliability: { score: 95, grade: 'S', label: 'Live HS Ping API' },
          quota: liveResult.quota || null,
        },
        classifications: liveResult.results || liveResult.data || liveResult,
      });
    }

    // 2) Fallback — pre-classified DB
    const fallback = HS_FALLBACK[normalizedQuery];
    if (fallback) {
      return NextResponse.json({
        meta: { query, normalizedQuery, country: targetCountry, source, timestamp: new Date().toISOString(),
          reliability: { score: 85, grade: 'A', label: 'Pre-classified DB' },
        },
        classifications: fallback.filter(f => f.country === targetCountry || targetCountry === 'ALL' || f.country === 'KR'),
        allClassifications: fallback,
      });
    }

    // 3) Fuzzy match fallback
    const fuzzyKey = Object.keys(HS_FALLBACK).find(k =>
      normalizedQuery.includes(k) || k.includes(normalizedQuery) ||
      k.split(' ').some(w => normalizedQuery.includes(w) && w.length > 3)
    );
    if (fuzzyKey) {
      return NextResponse.json({
        meta: { query, normalizedQuery, matchedKey: fuzzyKey, country: targetCountry, source: 'HSPING_FUZZY', timestamp: new Date().toISOString(),
          reliability: { score: 70, grade: 'B', label: 'Fuzzy Match' },
        },
        classifications: HS_FALLBACK[fuzzyKey],
      });
    }

    return NextResponse.json({
      meta: { query, normalizedQuery, source: 'NONE', timestamp: new Date().toISOString() },
      classifications: [],
      suggestion: 'Register HSPING_API_KEY in .env.local for live classification, or add product to pre-classified DB',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
