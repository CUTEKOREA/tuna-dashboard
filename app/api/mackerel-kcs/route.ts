import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 고등어 관세청 KCS 전용 API 
 * GET /api/mackerel-kcs
 * 
 * 용도: 고등어(HS 030354) 월별 수입 추이 및 주요 국가별 수입 점유율
 */

const KCS_API_KEY = process.env.KCS_API_KEY || 'fdbf3eb58f1157a1db7c9156e8ce7f88ed9fa2d996116d9079dddb5232133f7c';

const FALLBACK_MONTHLY = [
  { month: '2023-08', volume: 11200, value: 21500 },
  { month: '2023-09', volume: 13500, value: 25800 },
  { month: '2023-10', volume: 15200, value: 28900 },
  { month: '2023-11', volume: 14800, value: 27500 },
  { month: '2023-12', volume: 12100, value: 23100 },
  { month: '2024-01', volume: 16500, value: 31200 },
];

const FALLBACK_ORIGIN = [
  { name: '노르웨이', value: 85.2, fill: '#0ea5e9' },
  { name: '중국', value: 8.5, fill: '#f59e0b' },
  { name: '영국', value: 4.1, fill: '#10b981' },
  { name: '기타', value: 2.2, fill: '#64748b' },
];

export async function GET() {
  let monthly = [...FALLBACK_MONTHLY];
  let origin = [...FALLBACK_ORIGIN];
  let isLive = false;

  try {
    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startYymm = `${past.getFullYear()}${String(past.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList` +
      `?serviceKey=${KCS_API_KEY}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=030354`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    
    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
      
      if (items.length > 0) {
        const monthlyTotals: Record<string, { volume: number, value: number }> = {};
        const originTotals: Record<string, number> = {};
        let totalWgt = 0;

        for (const match of items) {
          const itemStr = match[1];
          const yearMatch = itemStr.match(/<year>([\s\S]*?)<\/year>/);
          const statKorMatch = itemStr.match(/<statKor>([\s\S]*?)<\/statKor>/);
          if (!yearMatch || yearMatch[1] === '총계') continue;
          
          const rawYear = yearMatch[1].replace(/\D/g, ''); 
          if (rawYear.length !== 6) continue;
          const monthKey = `${rawYear.substring(0,4)}-${rawYear.substring(4,6)}`;
          
          const impDlrMatch = itemStr.match(/<impDlr>([\d.]+)<\/impDlr>/);
          const impWgtMatch = itemStr.match(/<impWgt>([\d.]+)<\/impWgt>/);
          const wgt = impWgtMatch ? parseFloat(impWgtMatch[1]) : 0;
          const amt = impDlrMatch ? parseFloat(impDlrMatch[1]) : 0;
          
          if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = { volume: 0, value: 0 };
          monthlyTotals[monthKey].volume += wgt / 1000;
          monthlyTotals[monthKey].value += amt;
          
          if (wgt > 0 && statKorMatch) {
            const country = statKorMatch[1];
            if (!originTotals[country]) originTotals[country] = 0;
            originTotals[country] += wgt;
            totalWgt += wgt;
          }
        }
        
        const sortedMonths = Object.keys(monthlyTotals).sort().slice(-6);
        if (sortedMonths.length > 0) {
          monthly = sortedMonths.map(m => ({
            month: m,
            volume: Math.round(monthlyTotals[m].volume),
            value: Math.round(monthlyTotals[m].value)
          }));
          
          let norway = 0, china = 0, uk = 0, other = 0;
          Object.entries(originTotals).forEach(([c, w]) => {
            const pct = (w / totalWgt) * 100;
            if (c.includes('노르웨이')) norway += pct;
            else if (c.includes('중국')) china += pct;
            else if (c.includes('영국')) uk += pct;
            else other += pct;
          });
          
          origin = [
            { name: '노르웨이', value: Math.round(norway * 10)/10, fill: '#0ea5e9' },
            { name: '중국', value: Math.round(china * 10)/10, fill: '#f59e0b' },
            { name: '영국', value: Math.round(uk * 10)/10, fill: '#10b981' },
            { name: '기타', value: Math.round(other * 10)/10, fill: '#64748b' },
          ];
          
          isLive = true;
        }
      }
    }
  } catch (e) {
    console.warn('[KCS API] 연동 실패, Fallback 데이터 사용');
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    isLive,
    source: isLive ? '관세청 KCS OpenAPI (실시간)' : 'KCS Fallback',
    monthly,
    origin
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
