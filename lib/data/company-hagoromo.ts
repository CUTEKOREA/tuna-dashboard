import raw from '@/public/data/companies/hagoromo_v1.json';

/**
 * はごろもフーズ 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅨ, 2026-09).
 *
 * 「シーチキン」 상표를 가진 시즈오카의 참치캔 회사. 자사 캔 공장 둘에 협력공장 약 70곳.
 *
 * ⚠ **70곳을 참치 위탁처로 쓰지 마라.** 유가증권보고서의 그 수는 전 제품 기준이다.
 * ⚠ **PT Aneka Tuna 매입 ÷ ツナ等 매출 비율을 만들지 마라.** 매입가와 판매가를 나누게 된다.
 * ⚠ **2026-08 가격 인상과 EPA 무관세를 인과로 잇지 마라.** 날짜만 같다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const hagoromoMeta = data._meta;
export const hagoromoCard = data.card;
export const hagoromoStats = data.stats;
export const hagoromoSourceNotes = data.sourcenotes;

/** 연결 매출 중 伊藤忠商事 앞 매출 몫(전 제품, 2026년 3월기). */
export function itochuSalesSharePct(): number {
  const s = data.stats;
  return Number(((s.伊藤忠_매출_FY26_jpy_k / s.연결_매출_FY26_jpy_k) * 100).toFixed(1));
}

/** 연결 매출 중 3대 상사 앞 매출 몫(전 제품, 2026년 3월기). */
export function tradingHousesSharePct(): number {
  const s = data.stats;
  const sum = s.伊藤忠_매출_FY26_jpy_k + s.三菱商事_매출_FY26_jpy_k + s.三井物産_매출_FY26_jpy_k;
  return Number(((sum / s.연결_매출_FY26_jpy_k) * 100).toFixed(1));
}

/** L 플레이크 70 g 세 캔 kg당 값 ÷ 이온 자체상표 세 캔 kg당 값. */
export function pbMultiple(): number {
  const s = data.stats;
  return Number((s.L플레이크_3캔_jpy_kg / s.이온PB_3캔_jpy_kg).toFixed(2));
}
