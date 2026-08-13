import { HS_CODES } from '../../_shared/hs-codes';
import type { KCSItem } from '../../_shared/kcs-client';

/**
 * 관세청 nitemtrade 응답의 순수 집계 로직.
 *
 * 라우트 파일에서 분리한 이유는 Next.js App Router가 route.ts의 export를
 * (GET/POST/dynamic 등) 예약된 것만 허용하기 때문이다. 테스트가 붙어야 할
 * 로직이라 별도 모듈로 뺐다.
 */

const SHRIMP = HS_CODES.shrimp_frozen;

/** L-04: KCS 호출·집계는 HSK 10자리 기준. */
export const HSK_CODES: string[] = SHRIMP.hsk10 ?? [SHRIMP.hsSgn];

export const SHRIMP_LABEL = SHRIMP.label;

export type YearRollup = {
  year: string;
  importUsd: number;
  importKg: number;
  origins: { country: string; importUsd: number; importKg: number }[];
};

/** 총계행. 국가별 행과 함께 더하면 정확히 2배가 된다. */
function isTotalRow(item: KCSItem): boolean {
  return item.year === '총계' || item.statCdCntnKor1 === '총계';
}

export function rollup(year: string, items: KCSItem[]): YearRollup {
  const byCountry = new Map<string, { importUsd: number; importKg: number }>();
  let importUsd = 0;
  let importKg = 0;

  for (const item of items) {
    if (isTotalRow(item)) continue;
    // 화이트리스트 밖 세번이 섞여 오면 버린다(과대수집 방지).
    if (item.hsCd && !HSK_CODES.includes(item.hsCd)) continue;

    const usd = Number(item.impDlr ?? 0);
    const kg = Number(item.impWgt ?? 0);
    if (!Number.isFinite(usd) || !Number.isFinite(kg)) continue;

    importUsd += usd;
    importKg += kg;

    const country = item.statCdCntnKor1?.trim();
    if (!country) continue;
    const prev = byCountry.get(country) ?? { importUsd: 0, importKg: 0 };
    byCountry.set(country, { importUsd: prev.importUsd + usd, importKg: prev.importKg + kg });
  }

  const origins = [...byCountry.entries()]
    .map(([country, v]) => ({ country, ...v }))
    .sort((a, b) => b.importUsd - a.importUsd);

  return { year, importUsd, importKg, origins };
}

/** USD/kg → USD/MT. 분모가 0이면 만들어내지 않고 null. */
export function unitPricePerMT(importUsd: number, importKg: number): number | null {
  return importKg > 0 ? Math.round((importUsd / importKg) * 1000) : null;
}
