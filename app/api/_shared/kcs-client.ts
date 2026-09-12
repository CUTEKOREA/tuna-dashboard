import { dataGoKrKeys, DATA_GO_KR_KEY_ERRORS, requireAnyEnv } from './env';
/**
 * 관세청 KCS API 공유 클라이언트
 *
 * mackerel-kcs/pollock-kcs/galchi-kcs의 자체 inline regex 패턴을 단일 모듈로 추출.
 * 룰북 V4.2 L-11 (mackerel 패턴 통일) + L-10 (Fallback 키 패턴) 준수.
 *
 * 사용:
 *   import { fetchKCSNitemtrade, parseKCSXml } from "@/app/api/_shared/kcs-client";
 *   const result = await fetchKCSNitemtrade({ hsSgn: '0801320000', year: '2024' });
 */

export const KCS_API_KEY = () =>
  requireAnyEnv('DATA_GO_KR_NEW_KEY', 'DATA_GO_KR_COMMON_KEY');

export const KCS_BASE = "https://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList";

export type KCSItem = {
  year?: string;
  statKor?: string;
  statCd?: string;
  statCdCntnKor1?: string;
  impWgt?: string;
  impDlr?: string;
  expWgt?: string;
  expDlr?: string;
  hsCd?: string;
};

export type KCSResult = {
  isLive: boolean;
  items: KCSItem[];
  totalCount: number;
  source: string;
  apiHealth: { ok: boolean; items_count: number; resultCode?: string };
};

/**
 * 공공데이터포털 KCS nitemtrade XML 파싱 (자체 inline regex).
 * L-11 룰북 준수: parsers.ts alias import 없이 inline.
 */
export function parseKCSXml(xml: string): { items: KCSItem[]; resultCode?: string } {
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const resultCode = xml.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1];

  const items: KCSItem[] = [];
  for (const match of itemMatches) {
    const itemStr = match[1];
    const fields: KCSItem = {};
    const fieldRegex = /<(\w+)>([^<]*)<\/\1>/g;
    let fm: RegExpExecArray | null;
    while ((fm = fieldRegex.exec(itemStr)) !== null) {
      (fields as any)[fm[1]] = fm[2];
    }
    items.push(fields);
  }

  return { items, resultCode };
}

/**
 * 관세청 nitemtrade API 호출 (HS 코드별 월별 수출입).
 *
 * @param hsSgn HS 코드 (예: '0801320000' for 캐슈 in-shell)
 * @param year 연도 (예: '2024')
 * @param month 월 (선택, '01'~'12')
 * @returns 파싱된 아이템 + 라이브 상태
 */
export async function fetchKCSNitemtrade(params: {
  hsSgn: string;
  year: string;
  month?: string;
  timeout?: number;
}): Promise<KCSResult> {
  const { hsSgn, year, month, timeout = 8000 } = params;
  const strtYymm = month ? `${year}${month}` : `${year}01`;
  const endYymm = month ? `${year}${month}` : `${year}12`;

  const fail = (source: string, resultCode?: string): KCSResult => ({
    isLive: false,
    items: [],
    totalCount: 0,
    source,
    apiHealth: { ok: false, items_count: 0, ...(resultCode ? { resultCode } : {}) },
  });

  // 키 미설정은 "API 사용 불가"와 같다. 가짜 키를 만들지도, 라우트를 죽이지도 않고
  // 아래 실패 경로와 똑같이 isLive:false로 떨어뜨린다 (L-09).
  const keys = dataGoKrKeys();
  if (keys.length === 0) return fail('KCS Fallback (credential not configured)');

  let last = fail('KCS Fallback (no attempt)');
  // 키를 순서대로 시도한다. 키 계통 코드(30 등)면 다음 키로 넘어간다 — 한 벌이 죽어 있어도 살아난다.
  for (const key of keys) {
    const url = `${KCS_BASE}?serviceKey=${key}&strtYymm=${strtYymm}&endYymm=${endYymm}&hsSgn=${hsSgn}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
      if (!res.ok) {
        last = fail(`KCS Fallback (HTTP ${res.status})`);
        continue;
      }
      const xml = await res.text();
      const { items, resultCode } = parseKCSXml(xml);

      if (items.length === 0 || resultCode !== "00") {
        last = fail(`KCS Fallback (resultCode=${resultCode || 'none'})`, resultCode);
        if (resultCode && DATA_GO_KR_KEY_ERRORS.has(resultCode)) continue;
        return last;
      }

      return {
        isLive: true,
        items,
        totalCount: items.length,
        source: `관세청 nitemtrade 실시간 HS ${hsSgn} (${year}${month ? '-' + month : ''})`,
        apiHealth: { ok: true, items_count: items.length, resultCode },
      };
    } catch (e: any) {
      last = fail(`KCS Fallback (${e?.name === 'TimeoutError' ? 'timeout' : 'error'})`);
    }
  }
  return last;
}

/**
 * KCS items를 국가별 집계 (kg → 톤 변환 적용).
 *
 * @param items parseKCSXml 결과
 * @param majorCountryCode 점유율 추적 대상 (예: 'CN' for 중국)
 * @returns 집계 결과 (톤·천USD 단위)
 */
export function aggregateByCountry(
  items: KCSItem[],
  majorCountryCode?: string
) {
  let totalWgt = 0;
  let totalDlr = 0;
  let majorWgt = 0;
  let majorDlr = 0;
  const byCountry: Record<string, { name: string; volume: number; value: number }> = {};

  for (const item of items) {
    if (item.year === "총계" || item.statKor === "총계" || !item.statKor) continue;
    const wgt = parseFloat(item.impWgt || "0") / 1000; // kg → 톤
    const dlr = parseFloat(item.impDlr || "0") / 1000; // USD → 천USD
    const cc = (item.statCd || "XX").trim();
    // statCdCntnKor1이 국가명 (예: "베트남"), statKor는 HS 코드명 (예: "냉동 낙지")
    const ccName = (item.statCdCntnKor1 || item.statKor || cc).trim();

    totalWgt += wgt;
    totalDlr += dlr;
    if (majorCountryCode && cc === majorCountryCode) {
      majorWgt += wgt;
      majorDlr += dlr;
    }

    if (!byCountry[cc]) byCountry[cc] = { name: ccName, volume: 0, value: 0 };
    byCountry[cc].volume += wgt;
    byCountry[cc].value += dlr;
  }

  const majorPct = totalWgt > 0 ? Math.round((majorWgt / totalWgt) * 1000) / 10 : 0;
  const cifPerKg = totalWgt > 0 ? Math.round((totalDlr / totalWgt) * 100) / 100 : 0;

  return {
    totalWgt,
    totalDlr,
    majorWgt,
    majorDlr,
    majorPct,
    cifPerKg,
    byOrigin: Object.values(byCountry)
      .map((d) => ({
        origin: d.name,
        volume: d.volume,
        value: d.value,
        share: totalWgt > 0 ? Math.round((d.volume / totalWgt) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10),
  };
}
