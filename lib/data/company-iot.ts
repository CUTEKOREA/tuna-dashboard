import raw from '@/public/data/companies/iot_v1.json';

/**
 * Indian Ocean Tuna Ltd 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅢ, 2026-09).
 *
 * 인도양 한가운데 섬나라의 캔참치 공장 하나다. 이 나라 국내수출의 74.8%(2024)가 이 캔이다.
 *
 * ⚠ **「유럽 수출이 40% 줄었다」를 공장 축소로 쓰지 마라.** 총수출은 2024년 +28%, 2025년 유럽 향 +31%다.
 * ⚠ **「제조업 수출의 95%」로 쓰지 마라.** 회사 발언의 재인용이고 국가통계 분모로 재계산되지 않는다.
 * ⚠ **88%를 하나로 쓰지 마라.** 대유럽 88%(연도 없음)·통조림/수산물 88.1%(표로 닫힘)·주어 뒤집은 오독 셋이다.
 * ⚠ **공장 매입 56,319 t 을 총원료로 쓰지 마라.** 양륙분이고 냉동어 수입 65,250 t 이 따로 있다.
 * ⚠ **「같은 선단에서 산다」로 쓰지 마라.** 명부 겹침은 조달 명단이지 구매 증거가 아니다.
 * ⚠ **「우리 배가 이 공장에 댄다」로 쓰지 마라.** 전량 항내 환적이라 전재 쪽이다.
 * ⚠ **「집단해고가 없었다」로 쓰지 마라.** 1심 관할인 국제무역지대 고용평의회 결정문이 공개되지 않는다.
 * ⚠ **「세이셸산이면 이 공장」으로 쓰지 마라.** EU 등재 가공시설이 7곳이다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const iotMeta = data._meta;
export const iotCard = data.card;
export const iotStats = data.stats;
export const iotSourceNotes = data.sourcenotes;

/** 캔참치가 이 나라 국내수출에서 차지하는 몫. 분모는 국내수출이지 제조업 수출이 아니다. */
export function cannedShareOfExportsPct(year: 2024 | 2025 = 2024): number {
  const a = year === 2024 ? data.stats.캔참치_2024_백만SCR : data.stats.캔참치_2025_백만SCR;
  const b = year === 2024 ? data.stats.국내수출_2024_백만SCR : data.stats.국내수출_2025_백만SCR;
  return Number(((a / b) * 100).toFixed(1));
}

/**
 * 캔참치 수출에서 유럽이 차지하는 몫.
 *
 * ⚠ 2025년 값(74.8%)은 국내수출 대비 몫과 우연히 같은 수다 — 분모가 다르다.
 */
export function euShareOfCannedPct(year: 2019 | 2023 | 2024 | 2025): number {
  const eu = data.stats[`EU향_${year}_톤`];
  const tot = data.stats[`총수출_${year}_톤`];
  return Number(((eu / tot) * 100).toFixed(1));
}

/** 항구 양륙분에서 이 공장이 받는 몫. 분모는 양륙 88,569 t 이지 항구 합계가 아니다. */
export function landingShareOfPortPct(): number {
  const { 공장매입_2024_톤: a, 양륙_2024_톤: b } = data.stats;
  return Number(((a / b) * 100).toFixed(1));
}

/** 양륙만 원료로 볼 때 나오는 수율 — 물리적으로 불가능해 수입분의 존재를 보여 준다. */
export function impossibleYieldPct(): number {
  const { 캔생산_2023_톤: a, 공장매입_2023_톤: b } = data.stats;
  return Number(((a / b) * 100).toFixed(0));
}

/** 이 나라 배타적경제수역 허가 선망 중 자국 국적 몫. */
export function domesticFlagShareSafe(): number {
  const { 세이셸국적선망_척: a, 허가선망_2024_척: b } = data.stats;
  return Number(((a / b) * 100).toFixed(0));
}

/** 항구를 지나는 물량 중 섬에 남는 몫(양륙). 나머지는 전재로 나간다. */
export function landedSharePct(): number {
  const { 양륙_2024_톤: a, 항구_선망물량_2024_톤: b } = data.stats;
  return Number(((a / b) * 100).toFixed(1));
}
