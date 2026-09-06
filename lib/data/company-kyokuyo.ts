import raw from '@/public/data/companies/kyokuyo_v1.json';

/**
 * 極洋 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅥ, 2026-09).
 *
 * 2023년 3월기까지 보고부문 이름 하나가 「鰹・鮪」였다. 제101기에 관리구분을 바꾸며
 * 生鮮事業으로 흡수했고, 회사가 전기를 신 구분으로 재작성해 공표한 덕분에
 * **같은 해를 두 구분으로 견줄 수 있다.**
 *
 * ⚠ **이익 몫의 분모는 세그먼트이익 합계다.** 연결 영업이익(8,105)으로 나누면 65.70%가
 *   나오는데 그것은 미배분 전사비용을 빼기 전 값과 뺀 뒤 값을 섞는 것이다.
 * ⚠ **「매출의 14%로 이익의 57%」만 단독으로 쓰지 마라.** 구 구분에서만 성립하고
 *   현행 구분으로 같은 해를 읽으면 26.67% / 58.02%다.
 * ⚠ **이름을 지운 것과 이익이 무너진 것을 인과로 묶지 마라.** 같은 해에 일어난 두 사건이고
 *   원문은 둘을 연결하지 않는다. 生鮮事業에는 초밥 재료 가공이 함께 있다.
 * ⚠ **「초저온 운반선을 접었다」로 쓰지 마라.** 접은 것은 冷蔵運搬船事業이고 그 배는
 *   바나나를 실었다. 「超低温」은 有報에 0회다.
 * ⚠ **표를 세로로 더한 값을 검산으로 쓰지 마라.** 절사 때문에 계와 어긋난다.
 * ⚠ **한국 3사 부재를 A등급으로 올리지 마라.** 신라교역이 고객을 「고객 A」로 가린다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const kyokuyoMeta = data._meta;
export const kyokuyoCard = data.card;
export const kyokuyoStats = data.stats;
export const kyokuyoSourceNotes = data.sourcenotes;

/** 구 「鰹・鮪」의 이익 몫 ÷ 매출 몫. 분모는 세그먼트이익 합계와 연결매출이다. */
export function oldSegmentLeverage(): number {
  return Number((data.stats.구부문_이익몫 / data.stats.구부문_매출몫).toFixed(2));
}

/** 生鮮事業 이익이 정점(FY2023 재작성) 대비 저점(FY2024)까지 줄어든 폭(%). 음수다. */
export function freshProfitTrough(): number {
  const { 생선_이익_저점_백만엔: low, 생선_이익_정점_백만엔: high } = data.stats;
  return Number((((low - high) / high) * 100).toFixed(1));
}
