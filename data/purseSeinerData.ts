// 글로벌 참치 선망선 데이터베이스 — 5개 지역수산관리기구 등록부 파생
//
// 2026-08-17 재구축: 손으로 만든 155척 큐레이션은 등록부와 대조되지 않는 선박
// (「Kumasi Explorer」 등)이 섞여 있어 폐기했다 — 실제 가나 파노피 선단(선망 7척)이
// 한 척도 없었다. 지금 목록은 scripts/build_purse_seiner_data.py 가 등록부에서
// 선망선만 걸러 만든 전사라 재현 가능하다. IMO 는 등록부가 주는 경우에만 있다.
// 개인 소유는 N/A 로 눕혔다(실명 금지 규율).

export interface PurseSeinerVessel {
  name: string;
  imo: string;
  operator: string;
  gt: number | null;
  flag: string;
  rfmos: string[];
}

export const RFMO_COLORS: Record<string, string> = {
  WCPFC: '#3b82f6',
  IOTC: '#10b981',
  IATTC: '#f59e0b',
  ICCAT: '#ef4444',
  CCSBT: '#8b5cf6',
};

export const RFMO_NAMES: Record<string, string> = {
  WCPFC: 'Western & Central Pacific',
  IOTC: 'Indian Ocean',
  IATTC: 'Inter-American Tropical',
  ICCAT: 'International Atlantic',
  CCSBT: 'Southern Bluefin',
};

export const CONTINENT_MAP: Record<string, string> = {
  "South Korea": "Asia",
  "Chinese Taipei": "Asia",
  "China": "Asia",
  "Japan": "Asia",
  "Iran": "Asia",
  "Indonesia": "Asia",
  "Philippines": "Asia",
  "Thailand": "Asia",
  "Spain": "Europe",
  "France": "Europe",
  "Italy": "Europe",
  "Turkey": "Europe",
  "Ecuador": "Americas",
  "Mexico": "Americas",
  "Colombia": "Americas",
  "Panama": "Americas",
  "Venezuela": "Americas",
  "Brazil": "Americas",
  "Ghana": "Africa",
  "Senegal": "Africa",
  "Côte d'Ivoire": "Africa",
  "Seychelles": "Indian Ocean Islands",
  "Mauritius": "Indian Ocean Islands",
  "Oman": "Middle East",
  "Kenya": "Africa",
  "Tanzania": "Africa",
  "FSM (Micronesia)": "Pacific Islands",
  "Marshall Islands": "Pacific Islands",
  "Morocco": "Africa", "Tunisia": "Africa", "Algeria": "Africa", "Libya": "Africa",
  "Egypt": "Africa", "Gabon": "Africa", "Guinea": "Africa", "Cape Verde": "Africa",
  "South Africa": "Africa", "Madagascar": "Africa", "Mozambique": "Africa",
  "Vietnam": "Asia", "Sri Lanka": "Asia", "India": "Asia",
  "Maldives": "Asia", "Malaysia": "Asia", "Syria": "Middle East",
  "Papua New Guinea": "Pacific Islands", "Solomon Islands": "Pacific Islands",
  "Kiribati": "Pacific Islands", "Vanuatu": "Pacific Islands", "Tuvalu": "Pacific Islands",
  "Nauru": "Pacific Islands", "Cook Islands": "Pacific Islands", "Fiji": "Pacific Islands",
  "Samoa": "Pacific Islands", "Tonga": "Pacific Islands",
  "New Caledonia": "Pacific Islands", "French Polynesia": "Pacific Islands",
  "United States": "Americas", "Peru": "Americas", "El Salvador": "Americas",
  "Guatemala": "Americas", "Nicaragua": "Americas", "Honduras": "Americas",
  "Costa Rica": "Americas", "Belize": "Americas", "Curaçao": "Americas",
  "St. Vincent": "Americas", "Bolivia": "Americas", "Guyana": "Americas",
  "Portugal": "Europe", "Greece": "Europe", "Malta": "Europe", "Cyprus": "Europe",
  "Croatia": "Europe", "Albania": "Europe", "Norway": "Europe", "Russia": "Europe",
  "Australia": "Oceania", "New Zealand": "Oceania",
  "Liberia": "Africa", "Bahamas": "Americas"
};

import rawPurseSeiners from '../public/data/tuna_purse_seiners_v1.json';

export const PURSE_SEINER_META = (rawPurseSeiners as { _meta: Record<string, unknown> })._meta;

export const vessels: PurseSeinerVessel[] =
  (rawPurseSeiners as unknown as { vessels: PurseSeinerVessel[] }).vessels;

export const TOTAL_VESSELS = vessels.length;
export const MULTI_RFMO_COUNT = vessels.filter((v) => v.rfmos.length >= 2).length;
export const TOTAL_FLAGS = new Set(vessels.map((v) => v.flag)).size;
export const TOTAL_OPERATORS = new Set(vessels.filter((v) => v.operator !== 'N/A').map((v) => v.operator)).size;
export const TOTAL_RFMOS = new Set(vessels.flatMap((v) => v.rfmos)).size;



// Helper functions
export function getRfmoStats() {
  const stats: Record<string, { count: number; flags: Record<string, number>; operators: Record<string, number> }> = {};
  for (const v of vessels) {
    for (const rfmo of v.rfmos) {
      if (!stats[rfmo]) stats[rfmo] = { count: 0, flags: {}, operators: {} };
      stats[rfmo].count++;
      stats[rfmo].flags[v.flag] = (stats[rfmo].flags[v.flag] || 0) + 1;
      if (v.operator !== 'N/A') {
        stats[rfmo].operators[v.operator] = (stats[rfmo].operators[v.operator] || 0) + 1;
      }
    }
  }
  return stats;
}

export function getFlagStats() {
  const stats: Record<string, number> = {};
  for (const v of vessels) {
    stats[v.flag] = (stats[v.flag] || 0) + 1;
  }
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([flag, count]) => ({ flag, count }));
}

export function getOperatorStats() {
  const stats: Record<string, { count: number; rfmos: Set<string> }> = {};
  for (const v of vessels) {
    const op = v.operator;
    if (op === 'N/A') continue;
    if (!stats[op]) stats[op] = { count: 0, rfmos: new Set() };
    stats[op].count++;
    v.rfmos.forEach(r => stats[op].rfmos.add(r));
  }
  return Object.entries(stats)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([operator, data]) => ({ operator, count: data.count, rfmos: Array.from(data.rfmos) }));
}

export function getContinentStats() {
  const stats: Record<string, number> = {};
  for (const v of vessels) {
    const continent = CONTINENT_MAP[v.flag] || 'Other';
    stats[continent] = (stats[continent] || 0) + 1;
  }
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([continent, count]) => ({ continent, count }));
}

export const FLAG_EMOJI: Record<string, string> = {
  'South Korea': '🇰🇷', 'Chinese Taipei': '🇹🇼', 'China': '🇨🇳', 'Japan': '🇯🇵',
  'Spain': '🇪🇸', 'France': '🇫🇷', 'Ecuador': '🇪🇨', 'Mexico': '🇲🇽',
  'Seychelles': '🇸🇨', 'Mauritius': '🇲🇺', 'Iran': '🇮🇷', 'Indonesia': '🇮🇩',
  'Philippines': '🇵🇭', 'Thailand': '🇹🇭', 'Ghana': '🇬🇭', 'Colombia': '🇨🇴',
  'Panama': '🇵🇦', 'Italy': '🇮🇹', 'Oman': '🇴🇲', 'Kenya': '🇰🇪',
  'Tanzania': '🇹🇿', 'Venezuela': '🇻🇪', 'Turkey': '🇹🇷', 'Senegal': '🇸🇳',
  'Brazil': '🇧🇷', "Côte d'Ivoire": '🇨🇮', 'FSM (Micronesia)': '🇫🇲',
  'Marshall Islands': '🇲🇭',
};
