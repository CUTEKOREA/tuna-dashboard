import { NextResponse } from 'next/server';
import { HS_CODES } from '../../_shared/hs-codes';

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 김(Laver) 관세청 KCS 수출 통관 전용 API — 조미김(고부가 가공)
 * GET /api/kim/customs-seasoned
 *
 * 용도: 조미김 HS 2008.99.50.10 월별 수출 통관 추이 + 주요 수출 대상국 비중.
 * 마른김(원초, HS 1212.21 → /api/kim/customs)과 분리 집계. 조미김은 김 수출의 ~67%(고부가).
 *
 * ⚠️ HSK 검증 (2026-06-28 실수집):
 *   - 6자리 200899(기타 조제식료품)는 사과·포도·팝콘 등 혼재 → 광의라 직접 사용 금지(과대집계).
 *   - 10자리 2008995010 → statKor="김" 단일 품목으로 정확 분리. 본 라우트 채택(L-04 HSK 10자리 의무).
 *   - 실측(2025-08~2026-01): 월 ~1,400~1,850톤 / $46~62M, 미국 34%·일본 19.8% 우위.
 * 패턴: app/api/kim/customs 와 동일 (L-11 inline regex, L-10 fallback 키, L-12 isLive 필드).
 */

const KCS_API_KEY = process.env.DATA_GO_KR_NEW_KEY || process.env.DATA_GO_KR_COMMON_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c';
const HSK = HS_CODES.kim_seasoned.hsSgn;
const STAT_KOR_GUARD = HS_CODES.kim_seasoned.statKorGuard;

// 대상국 비중 차트 색상 (Okabe-Ito A11Y 팔레트 — 색맹 안전)
const DEST_PALETTE = ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#56B4E9', '#D55E00', '#64748b'];

// Fallback: 관세청 2008.99.50.10 실수집 스냅샷(2026-06-28) — isLive=false로 정직 표기
const FALLBACK_MONTHLY = [
  { month: '2025-08', volume: 1436, value: 46500 },
  { month: '2025-09', volume: 1718, value: 56100 },
  { month: '2025-10', volume: 1467, value: 47800 },
  { month: '2025-11', volume: 1852, value: 61500 },
  { month: '2025-12', volume: 1841, value: 62400 },
  { month: '2026-01', volume: 1689, value: 55400 },
];

// Fallback 대상국: 관세청 실수집(2025-08~2026-01 물량 비중)
const FALLBACK_DEST = [
  { name: '미국', value: 34.0, fill: '#0072B2' },
  { name: '일본', value: 19.8, fill: '#E69F00' },
  { name: '베트남', value: 5.0, fill: '#009E73' },
  { name: '필리핀', value: 4.5, fill: '#CC79A7' },
  { name: '캐나다', value: 4.1, fill: '#56B4E9' },
  { name: '호주', value: 3.8, fill: '#D55E00' },
  { name: '기타', value: 28.8, fill: '#64748b' },
];

export async function GET() {
  let monthly = [...FALLBACK_MONTHLY];
  let dest = [...FALLBACK_DEST];
  let isLive = false;
  let destIsLive = false;

  try {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - 7, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` +
      `?serviceKey=${KCS_API_KEY}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=${HSK}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });

    if (res.ok) {
      const xml = await res.text();
      const resultCode = xml.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1];
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      if (resultCode === '00' && items.length > 0) {
        const monthlyTotals: Record<string, { volume: number, value: number }> = {};
        const destTotals: Record<string, { name: string; wgt: number }> = {};
        let totalWgt = 0;

        for (const match of items) {
          const itemStr = match[1];
          const yearMatch = itemStr.match(/<year>([\s\S]*?)<\/year>/);
          if (!yearMatch || yearMatch[1] === '총계') continue;

          const rawYear = yearMatch[1].replace(/\D/g, '');
          if (rawYear.length !== 6) continue;
          const monthKey = `${rawYear.substring(0, 4)}-${rawYear.substring(4, 6)}`;

          // 10자리 코드라 statKor은 항상 "김"이지만 방어적으로 확인 (혼재 차단)
          const statKor = itemStr.match(/<statKor>([\s\S]*?)<\/statKor>/)?.[1]?.trim();
          if (statKor && statKor !== STAT_KOR_GUARD && statKor !== '-') continue;

          // 김 = 수출국 → export 필드 집계
          const wgt = parseFloat(itemStr.match(/<expWgt>([\d.]+)<\/expWgt>/)?.[1] || '0');  // kg
          const amt = parseFloat(itemStr.match(/<expDlr>([\d.]+)<\/expDlr>/)?.[1] || '0');  // USD

          if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = { volume: 0, value: 0 };
          monthlyTotals[monthKey].volume += wgt / 1000;   // kg → 톤
          monthlyTotals[monthKey].value += amt / 1000;    // USD → 천USD

          // 국가 집계: <statCd>=국가코드(US), <statCdCntnKor1>=국가명(미국).
          if (wgt > 0) {
            const cc = (itemStr.match(/<statCd>([\s\S]*?)<\/statCd>/)?.[1] || '').trim();
            const name = (itemStr.match(/<statCdCntnKor1>([\s\S]*?)<\/statCdCntnKor1>/)?.[1] || '').trim();
            if (cc && cc !== '-' && name && name !== '-' && name !== '총계') {
              if (!destTotals[cc]) destTotals[cc] = { name, wgt: 0 };
              destTotals[cc].wgt += wgt;
              totalWgt += wgt;
            }
          }
        }

        const sortedMonths = Object.keys(monthlyTotals).sort().slice(-6);
        if (sortedMonths.length > 0) {
          monthly = sortedMonths.map(m => ({
            month: m,
            volume: Math.round(monthlyTotals[m].volume),
            value: Math.round(monthlyTotals[m].value),
          }));

          // 동적 top-6 국가 + 기타 (수출 물량 기준 비중 %)
          if (totalWgt > 0) {
            const ranked = Object.values(destTotals).sort((a, b) => b.wgt - a.wgt);
            const top = ranked.slice(0, 6);
            const otherWgt = ranked.slice(6).reduce((s, d) => s + d.wgt, 0);
            const r = (x: number) => Math.round((x / totalWgt) * 1000) / 10;
            dest = top.map((d, i) => ({ name: d.name, value: r(d.wgt), fill: DEST_PALETTE[i] }));
            if (otherWgt > 0) dest.push({ name: '기타', value: r(otherWgt), fill: DEST_PALETTE[6] });
            destIsLive = true;
          }

          isLive = true;
        }
      }
    }
  } catch {
    console.warn('[KIM 조미김 KCS API] 연동 실패, Fallback 데이터 사용');
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    isLive,
    destIsLive,
    hsCode: '2008.99.50.10 (조미김)',
    source: isLive ? '관세청 KCS OpenAPI 수출통관 (실시간)' : 'KCS Fallback (관세청 2026-06 실수집)',
    monthly,
    dest,
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
