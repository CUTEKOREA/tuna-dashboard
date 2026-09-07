import raw from '@/public/data/companies/nissui_v1.json';

/**
 * ニッスイ 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅧ, 2026-09).
 *
 * 편 ⅩⅥ 極洋이 부문 이름에서 「鰹・鮪」를 지웠다면, 이 회사는 2024년에 국내 양식 참치를
 * ㈱ニッスイまぐろ로 묶어 **상호에 참치를 박았다.** 그런데 그 법인은 제111기 유가증권보고서
 * 관계회사 표에 행이 없다(「その他48社」).
 *
 * ⚠ **「단기양식 참다랑어가 이익을 두 배로 만들었다」는 쓸 수 없다.** 회사 워터폴의 최소 버킷이
 *   69억엔이고 참치는 그 안 네 요인 중 하나다. 수산 증익의 약 40%는 북미·남미다.
 * ⚠ **「배를 줄였더니 이익이 늘었다」만 적지 마라.** 그 배는 같은 해 1,159백만엔 감손됐다
 *   (遊休資産·칠레·船舶). 다만 特別損失이라 세그먼트 영업이익 아래에 있다.
 * ⚠ **108.1%는 연결 기준일 때만 100%를 넘는다.** 4부문 계로는 95.5%다.
 * ⚠ **「나머지 부문이 깎았다」는 반대다.** 나머지 세 보고부문은 +441로 보탰고, 깎은 것은
 *   全社経費(△714)와 その他(△426)다.
 * ⚠ **物流 이익률 14.50%로 배수를 만들지 마라.** 내부매출이 총매출의 46.11%이고 총매출로 재면 7.82%다.
 * ⚠ **蓄養과 短期養殖을 같은 말로 묶지 마라.** 회사 축은 재지 기간, 관청 축은 종묘 출처다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const nissuiMeta = data._meta;
export const nissuiCard = data.card;
export const nissuiStats = data.stats;
export const nissuiSourceNotes = data.sourcenotes;

/** 水産 부문 이익이 전기 대비 몇 배가 됐는가. */
export function marineProfitMultiple(): number {
  return Number((data.stats.수산이익_당기 / data.stats.수산이익_전기).toFixed(2));
}

/** 物流 이익률이 분모를 총매출로 바꾸면 몇 %p 내려가는가. */
export function logisticsMarginGap(): number {
  return Number((data.stats.물류_외부기준_이익률 - data.stats.물류_총매출기준_이익률).toFixed(2));
}
