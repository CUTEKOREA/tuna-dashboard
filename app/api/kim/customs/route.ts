import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 김(Laver) 관세청 KCS 수출 통관 전용 API
 * GET /api/kim/customs
 *
 * 용도: 김(마른김 HS 1212.21) 월별 수출 통관 추이 + 주요 수출 대상국 비중.
 * 김은 한국이 수출국이므로 import(imp*)가 아닌 export(exp*) 필드를 집계한다.
 * 패턴: app/api/mackerel-kcs (L-11 자체 inline regex 파싱), L-10 fallback 키, L-12 isLive 필드.
 */

const KCS_API_KEY = process.env.DATA_GO_KR_NEW_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c';

// Fallback: KATI/관세청 2024 검증 실적(연간) 기반 월 환산 추정 (isLive=false로 정직 표기)
const FALLBACK_MONTHLY = [
  { month: '2024-08', volume: 2700, value: 79000 },
  { month: '2024-09', volume: 2850, value: 83000 },
  { month: '2024-10', volume: 2950, value: 86000 },
  { month: '2024-11', volume: 3050, value: 90000 },
  { month: '2024-12', volume: 3200, value: 95000 },
  { month: '2025-01', volume: 2900, value: 88000 },
];

// Fallback 대상국: KATI/aT 2024 검증 수치(백만 USD → 비중)
const FALLBACK_DEST = [
  { name: '미국', value: 31.4, fill: '#0072B2' },
  { name: '일본', value: 29.3, fill: '#E69F00' },
  { name: '태국', value: 13.2, fill: '#009E73' },
  { name: '러시아', value: 12.9, fill: '#CC79A7' },
  { name: '중국', value: 12.8, fill: '#56B4E9' },
];

export async function GET() {
  let monthly = [...FALLBACK_MONTHLY];
  let dest = [...FALLBACK_DEST];
  let isLive = false;
  let destIsLive = false;

  try {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` +
      `?serviceKey=${KCS_API_KEY}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=121221`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });

    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      if (items.length > 0) {
        const monthlyTotals: Record<string, { volume: number, value: number }> = {};
        const destTotals: Record<string, number> = {};
        let totalWgt = 0;

        for (const match of items) {
          const itemStr = match[1];
          const yearMatch = itemStr.match(/<year>([\s\S]*?)<\/year>/);
          const statKorMatch = itemStr.match(/<statKor>([\s\S]*?)<\/statKor>/);
          if (!yearMatch || yearMatch[1] === '총계') continue;

          const rawYear = yearMatch[1].replace(/\D/g, '');
          if (rawYear.length !== 6) continue;
          const monthKey = `${rawYear.substring(0, 4)}-${rawYear.substring(4, 6)}`;

          // 김 = 수출국 → export 필드 집계
          const expDlrMatch = itemStr.match(/<expDlr>([\d.]+)<\/expDlr>/);
          const expWgtMatch = itemStr.match(/<expWgt>([\d.]+)<\/expWgt>/);
          const wgt = expWgtMatch ? parseFloat(expWgtMatch[1]) : 0;  // kg
          const amt = expDlrMatch ? parseFloat(expDlrMatch[1]) : 0;  // USD

          if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = { volume: 0, value: 0 };
          monthlyTotals[monthKey].volume += wgt / 1000;   // kg → 톤
          monthlyTotals[monthKey].value += amt / 1000;    // USD → 천USD

          if (wgt > 0 && statKorMatch) {
            const country = statKorMatch[1].trim();
            if (country && country !== '총계' && country.length > 0) {
              if (!destTotals[country]) destTotals[country] = 0;
              destTotals[country] += wgt;
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

          if (totalWgt > 0) {
            let us = 0, jp = 0, cn = 0, th = 0, ru = 0, other = 0;
            Object.entries(destTotals).forEach(([c, w]) => {
              const pct = (w / totalWgt) * 100;
              if (c.includes('미국')) us += pct;
              else if (c.includes('일본')) jp += pct;
              else if (c.includes('중국') || c.includes('중화')) cn += pct;
              else if (c.includes('태국')) th += pct;
              else if (c.includes('러시아')) ru += pct;
              else other += pct;
            });
            if (us > 0 || jp > 0) {
              const r = (x: number) => Math.round(x * 10) / 10;
              dest = [
                { name: '미국', value: r(us), fill: '#0072B2' },
                { name: '일본', value: r(jp), fill: '#E69F00' },
                { name: '태국', value: r(th), fill: '#009E73' },
                { name: '러시아', value: r(ru), fill: '#CC79A7' },
                { name: '중국', value: r(cn), fill: '#56B4E9' },
                { name: '기타', value: r(other), fill: '#64748b' },
              ];
              destIsLive = true;
            }
          }

          isLive = true;
        }
      }
    }
  } catch (e) {
    console.warn('[KIM KCS API] 연동 실패, Fallback 데이터 사용');
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    isLive,
    destIsLive,
    hsCode: '1212.21 (마른김/원초)',
    source: isLive ? '관세청 KCS OpenAPI 수출통관 (실시간)' : 'KCS Fallback (KATI 2024 기반)',
    monthly,
    dest,
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
