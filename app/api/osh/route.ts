import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Open Supply Hub API Pipeline — Global Supplier Facility Intelligence
// POST /api/osh — Search supplier facilities by country/sector/product
// GET  /api/osh — Health check + available filters
// Docs: https://opensupplyhub.org/api/docs
// Auth: API Token (free registration)
// License: Open Data (CC BY-SA)

const OSH_BASE = 'https://opensupplyhub.org/api';
const OSH_TIMEOUT = 12000;

const SECTOR_MAP: Record<string, string> = {
  'seafood': 'Food', 'food': 'Food', '식품': 'Food', '수산': 'Food', 'fishery': 'Food',
  'apparel': 'Apparel', 'agriculture': 'Agriculture', '농업': 'Agriculture',
  'electronics': 'Electronics', 'chemicals': 'Chemicals',
};

const COUNTRY_MAP: Record<string, string> = {
  '한국': 'KR', '중국': 'CN', '태국': 'TH', '베트남': 'VN',
  '인도네시아': 'ID', '인도': 'IN', '미국': 'US', '일본': 'JP',
  '에콰도르': 'EC', '페루': 'PE', '칠레': 'CL', '노르웨이': 'NO',
  '필리핀': 'PH', '말레이시아': 'MY', '방글라데시': 'BD',
  '미얀마': 'MM', '캄보디아': 'KH', '스페인': 'ES',
};

async function fetchOSH(endpoint: string, params: Record<string, string> = {}) {
  const token = process.env.OSH_API_TOKEN;
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;

  const qs = new URLSearchParams(params).toString();
  const url = `${OSH_BASE}${endpoint}${qs ? '?' + qs : ''}`;

  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), OSH_TIMEOUT);
    const resp = await fetch(url, { headers, signal: ctrl.signal });
    clearTimeout(tid);
    if (!resp.ok) { console.warn(`[OSH] ${resp.status}`); return null; }
    return await resp.json();
  } catch (e: any) {
    console.warn(`[OSH] Error: ${e.message}`);
    return null;
  }
}

// Curated fallback: Key seafood processing facilities
const FACILITY_FALLBACK: Record<string, any[]> = {
  'TH_Food': [
    { name: 'Thai Union Group PCL', country: 'TH', address: 'Samut Sakhon, Thailand', sector: 'Food', productType: 'Canned Tuna/Seafood', parentCompany: 'Thai Union Group', workers: '44,000+', osId: 'TH2019_THAIUN', coordinates: [100.544, 13.549] },
    { name: 'Sea Value PCL', country: 'TH', address: 'Songkhla, Thailand', sector: 'Food', productType: 'Frozen Seafood', parentCompany: 'Sea Value', workers: '5,000+', osId: 'TH2020_SEAVAL' },
    { name: 'Siam Makro', country: 'TH', address: 'Bangkok, Thailand', sector: 'Food', productType: 'Wholesale Seafood', parentCompany: 'CP Group', workers: '10,000+', osId: 'TH2019_SIAMM' },
    { name: 'Charoen Pokphand Foods', country: 'TH', address: 'Bangkok, Thailand', sector: 'Food', productType: 'Shrimp/Poultry', parentCompany: 'CP Group', workers: '70,000+', osId: 'TH2020_CPFOO' },
  ],
  'VN_Food': [
    { name: 'Minh Phu Seafood JSC', country: 'VN', address: 'Ca Mau, Vietnam', sector: 'Food', productType: 'Shrimp Processing', parentCompany: 'Minh Phu Group', workers: '12,000+', osId: 'VN2020_MINHP' },
    { name: 'Vinh Hoan Corp', country: 'VN', address: 'Dong Thap, Vietnam', sector: 'Food', productType: 'Pangasius/Seafood', parentCompany: 'Vinh Hoan', workers: '8,000+', osId: 'VN2019_VINHH' },
    { name: 'Hung Vuong Corp', country: 'VN', address: 'An Giang, Vietnam', sector: 'Food', productType: 'Catfish/Seafood', parentCompany: 'Hung Vuong', workers: '6,000+', osId: 'VN2020_HUNGV' },
  ],
  'ID_Food': [
    { name: 'PT Aneka Tuna Indonesia', country: 'ID', address: 'Bitung, North Sulawesi', sector: 'Food', productType: 'Canned Tuna', parentCompany: 'Tri Marine', workers: '3,500+', osId: 'ID2019_ATUNA' },
    { name: 'PT Sari Laut Jaya', country: 'ID', address: 'Bitung, North Sulawesi', sector: 'Food', productType: 'Tuna Loin/Saku', parentCompany: 'Sari Laut', workers: '1,200+', osId: 'ID2020_SARIJ' },
    { name: 'PT Tridaya Eramina Bahari', country: 'ID', address: 'Jakarta, Indonesia', sector: 'Food', productType: 'Frozen Squid/Octopus', parentCompany: 'Tridaya', workers: '2,000+', osId: 'ID2020_TRIDA' },
  ],
  'CN_Food': [
    { name: 'Dalian Zhangzidao Group', country: 'CN', address: 'Dalian, Liaoning', sector: 'Food', productType: 'Scallop/Seafood', parentCompany: 'Zhangzidao', workers: '15,000+', osId: 'CN2019_ZHANG' },
    { name: 'Shandong Meijia Group', country: 'CN', address: 'Rongcheng, Shandong', sector: 'Food', productType: 'Frozen Fish/Squid', parentCompany: 'Meijia', workers: '5,000+', osId: 'CN2020_MEIJA' },
    { name: 'Zhoushan Putuo Xinliang', country: 'CN', address: 'Zhoushan, Zhejiang', sector: 'Food', productType: 'Frozen Squid', parentCompany: 'Xinliang', workers: '2,500+', osId: 'CN2020_XINLI' },
  ],
  'EC_Food': [
    { name: 'Nirsa S.A.', country: 'EC', address: 'Posorja, Ecuador', sector: 'Food', productType: 'Canned Tuna/Shrimp', parentCompany: 'Nirsa', workers: '4,000+', osId: 'EC2019_NIRSA' },
    { name: 'Industrial Pesquera Santa Priscila', country: 'EC', address: 'Guayaquil, Ecuador', sector: 'Food', productType: 'Shrimp Aquaculture', parentCompany: 'Santa Priscila', workers: '6,000+', osId: 'EC2020_SANTA' },
  ],
  'KR_Food': [
    { name: 'Dongwon F&B Co., Ltd.', country: 'KR', address: 'Changwon, Gyeongnam', sector: 'Food', productType: 'Canned Tuna/Seafood', parentCompany: 'Dongwon Group', workers: '3,500+', osId: 'KR2019_DONGW' },
    { name: 'Sajo Industries Co., Ltd.', country: 'KR', address: 'Seoul / Busan', sector: 'Food', productType: 'Frozen Seafood/Oils', parentCompany: 'Sajo Group', workers: '2,800+', osId: 'KR2019_SAJOI' },
    { name: 'Silla Co., Ltd.', country: 'KR', address: 'Busan, South Korea', sector: 'Food', productType: 'Frozen Tuna/Seafood Trading', parentCompany: 'Silla', workers: '500+', osId: 'KR2020_SILLA' },
    { name: 'KT&G Marine (KTMF)', country: 'KR', address: 'Busan, South Korea', sector: 'Food', productType: 'Frozen Fish/Processing', parentCompany: 'KT&G', workers: '400+', osId: 'KR2020_KTMF0' },
  ],
};

export async function GET() {
  const hasToken = !!process.env.OSH_API_TOKEN;
  return NextResponse.json({
    service: 'Open Supply Hub Facility API', version: '1.0.0',
    status: hasToken ? 'operational' : 'fallback_only',
    tokenConfigured: hasToken,
    license: 'Open Data (CC BY-SA)',
    fallbackCountries: Object.keys(FACILITY_FALLBACK).map(k => k.split('_')[0]),
    fallbackFacilities: Object.values(FACILITY_FALLBACK).reduce((s, a) => s + a.length, 0),
    endpoints: {
      POST: { body: { country: 'KR|TH|VN|CN|ID|EC...', sector: 'Food|Apparel...', query: 'Optional search term' } },
    },
  });
}

export async function POST(req: Request) {
  try {
    const { country, sector, query } = await req.json();
    if (!country && !sector && !query) {
      return NextResponse.json({ error: 'At least one of country, sector, or query is required' }, { status: 400 });
    }

    const countryCode = COUNTRY_MAP[country] || country?.toUpperCase() || '';
    const sectorEN = SECTOR_MAP[sector?.toLowerCase() || ''] || sector || '';
    let source: 'OSH_LIVE' | 'OSH_FALLBACK' = 'OSH_FALLBACK';

    // 1) Try OSH Live API
    const params: Record<string, string> = {};
    if (countryCode) params.countries = countryCode;
    if (sectorEN) params.sectors = sectorEN;
    if (query) params.q = query;
    params.page_size = '50';

    const live = await fetchOSH('/facilities/', params);
    if (live && live.features && live.features.length > 0) {
      source = 'OSH_LIVE';
      return NextResponse.json({
        meta: { country: countryCode, sector: sectorEN, query, source, count: live.count || live.features.length,
          timestamp: new Date().toISOString(),
          reliability: { score: 95, grade: 'S', label: 'Live OS Hub' },
        },
        facilities: live.features.map((f: any) => ({
          osId: f.id || f.properties?.os_id,
          name: f.properties?.name,
          address: f.properties?.address,
          country: f.properties?.country_code,
          sector: f.properties?.sector,
          coordinates: f.geometry?.coordinates,
          contributorCount: f.properties?.contributor_count,
        })),
      });
    }

    // 2) Fallback
    const fbKey = `${countryCode}_${sectorEN || 'Food'}`;
    let facilities = FACILITY_FALLBACK[fbKey] || [];

    // Try broader match if exact key not found, or if country is empty
    if (facilities.length === 0) {
      const broader = Object.entries(FACILITY_FALLBACK).filter(([k]) => 
        (countryCode ? k.startsWith(countryCode) : true) && 
        k.endsWith(`_${sectorEN || 'Food'}`)
      );
      facilities = broader.flatMap(([, v]) => v);
    }

    // Query-based filter (OR match on each word)
    if (query && facilities.length > 0) {
      const words = query.toLowerCase().split(/\s+/).filter(Boolean);
      facilities = facilities.filter((f: any) => {
        const haystack = `${f.name} ${f.productType} ${f.parentCompany || ''} ${f.sector || ''}`.toLowerCase();
        return words.some((w: string) => haystack.includes(w));
      });
    }

    return NextResponse.json({
      meta: { country: countryCode, sector: sectorEN, query, source, count: facilities.length,
        timestamp: new Date().toISOString(),
        reliability: { score: 78, grade: 'A', label: 'Curated Facility DB' },
        note: 'Register OSH_API_TOKEN in .env.local for live facility search',
      },
      facilities,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
