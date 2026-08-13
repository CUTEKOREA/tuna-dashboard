import { NextResponse } from 'next/server';
import { HS_CODES } from '../../_shared/hs-codes';
import { requireAnyEnv } from '../../_shared/env';

export const runtime = 'nodejs';
export const revalidate = 300;

/**
 * 김(Laver) 관세청 KCS 수출 통관 전용 API — 마른김(원초)
 * GET /api/kim/customs
 *
 * 용도: 마른김 HS 1212.21 월별 수출 통관 추이 + 주요 수출 대상국 비중.
 * 김은 한국이 수출국이므로 import(imp*)가 아닌 export(exp*) 필드를 집계한다.
 * 패턴: app/api/mackerel-kcs (L-11 자체 inline regex 파싱), L-10 fallback 키, L-12 isLive 필드.
 *
 * ⚠️ 2026-06-28 국가별 LIVE화 (destIsLive 정상화):
 *   nitemtrade 응답에서 국가명은 <statCdCntnKor1>(예: "미국"), 국가코드는 <statCd>(예: "US")이고
 *   <statKor>은 세부 품목명("건조한 것"/"염장한 것"/"기타")이다. 기존 코드가 <statKor>을 국가로
 *   오인해 미국/일본 매칭이 항상 0 → destIsLive=false 였다. 국가 집계를 statCd 기준으로 교체.
 *   조미김(HS 2008.99.50.10)은 별도 라우트 /api/kim/customs-seasoned 로 분리 집계.
 *
 * ⚠️ 2026-06-28 종 혼입 제거 (L-04 10자리 정밀):
 *   HS 1212.21(6자리)은 "식용 해조류" 바스켓 — 김(1212.21.1x)·미역(2x)·다시마(3x)·기타 해조류 혼재.
 *   실측 결과 김이 ~77%, 나머지 ~23%가 미역·다시마였다(단가도 미역·다시마가 평균을 끌어내림).
 *   <hsCd> 10자리 prefix "1212211"(=김류)만 집계해 미역·다시마를 배제한다. 6자리 호출은 김의 모든
 *   가공상태(건조/염장/냉동/기타) 10자리를 한 번에 수집하기 위함이며, prefix 필터로 정밀도를 확보.
 */

const KCS_API_KEY = () => requireAnyEnv('DATA_GO_KR_NEW_KEY', 'DATA_GO_KR_COMMON_KEY');
const KIM_DRY_HS = HS_CODES.kim_dried.hsSgn;
const KIM_DRY_PREFIX = HS_CODES.kim_dried.prefix;

// 대상국 비중 차트 색상 (Okabe-Ito A11Y 팔레트 — 색맹 안전)
const DEST_PALETTE = ['#0072B2', '#E69F00', '#009E73', '#CC79A7', '#56B4E9', '#D55E00', '#64748b'];

// Fallback: 관세청 1212.21.1x(김류) 실수집 스냅샷(2026-06-28) — isLive=false로 정직 표기
const FALLBACK_MONTHLY = [
  { month: '2025-08', volume: 1133, value: 37600 },
  { month: '2025-09', volume: 1021, value: 31400 },
  { month: '2025-10', volume: 921, value: 25100 },
  { month: '2025-11', volume: 937, value: 23800 },
  { month: '2025-12', volume: 1230, value: 30200 },
  { month: '2026-01', volume: 1804, value: 44500 },
];

// Fallback 대상국: 관세청 실수집(2025-08~2026-01 김류 물량 비중) — 원초는 아시아 가공국향
const FALLBACK_DEST = [
  { name: '중국', value: 30.2, fill: '#0072B2' },
  { name: '러시아 연방', value: 17.5, fill: '#E69F00' },
  { name: '일본', value: 16.4, fill: '#009E73' },
  { name: '태국', value: 14.9, fill: '#CC79A7' },
  { name: '대만', value: 5.0, fill: '#56B4E9' },
  { name: '베트남', value: 4.7, fill: '#D55E00' },
  { name: '기타', value: 11.3, fill: '#64748b' },
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
      `?serviceKey=${KCS_API_KEY()}&strtYymm=${startYymm}&endYymm=${yyyyMM}&hsSgn=${KIM_DRY_HS}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });

    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

      if (items.length > 0) {
        const monthlyTotals: Record<string, { volume: number, value: number }> = {};
        const destTotals: Record<string, { name: string; wgt: number }> = {};
        let totalWgt = 0;

        for (const match of items) {
          const itemStr = match[1];
          const yearMatch = itemStr.match(/<year>([\s\S]*?)<\/year>/);
          if (!yearMatch || yearMatch[1] === '총계') continue;

          // 김류(1212.21.1x)만 — 미역(2x)·다시마(3x)·기타 해조류 제외 (L-04 10자리 정밀)
          const hsCd = (itemStr.match(/<hsCd>([\s\S]*?)<\/hsCd>/)?.[1] || '').trim();
          if (!KIM_DRY_PREFIX || !hsCd.startsWith(KIM_DRY_PREFIX)) continue;

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

          // 국가 집계: <statCd>=국가코드(US), <statCdCntnKor1>=국가명(미국). statKor은 품목명이라 사용 금지.
          if (wgt > 0) {
            const ccMatch = itemStr.match(/<statCd>([\s\S]*?)<\/statCd>/);
            const cnMatch = itemStr.match(/<statCdCntnKor1>([\s\S]*?)<\/statCdCntnKor1>/);
            const cc = (ccMatch?.[1] || '').trim();
            const name = (cnMatch?.[1] || '').trim();
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
    console.warn('[KIM KCS API] 연동 실패, Fallback 데이터 사용');
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    isLive,
    destIsLive,
    hsCode: '1212.21.1x (마른김/원초 김, 미역·다시마 제외)',
    source: isLive ? '관세청 KCS OpenAPI 수출통관 (실시간)' : 'KCS Fallback (KATI 2024 기반)',
    monthly,
    dest,
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
