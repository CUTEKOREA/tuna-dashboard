import raw from '@/public/data/companies/kaichuang_v1.json';

/**
 * 上海开创国际海洋资源(SKMIC) 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅪ, 2026-09).
 *
 * 상하이 국유 식품그룹 光明食品의 원양어업 상장사. 중서부태평양 선망선과 스페인 참치캔 브랜드 Albo를 함께 가졌다.
 *
 * ⚠ **「선단의 참치로 Albo 캔을 만든다(수직계열)」로 쓰지 마라.** 연보에 그 흐름이 없고, 2023년 참치 판매의 98.75%가 중국 내 판매다.
 * ⚠ **「캔만 흑자」로 쓰지 마라.** 캔은 매출총이익의 과반이지만 순이익의 7할은 泛太渔业(선망)에 잡힌다.
 * ⚠ **JIN HUI 18·58을 开创 소유로 세지 마라.** 등록 소유 명의는 지배주주 上海远洋渔业이고 开创이 임차한다.
 * ⚠ 캔 제품 행(罐头食品)과 Albo 법인 매출은 0.21% 다르다 — 같은 값으로 섞지 않는다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const kaichuangMeta = data._meta;
export const kaichuangCard = data.card;
export const kaichuangStats = data.stats;
export const kaichuangSourceNotes = data.sourcenotes;

const pct = (a: number, b: number) => Number(((a / b) * 100).toFixed(2));

/** 2025 주영업 매출총이익 가운데 캔 몫(%). */
export function canGrossShare(): number {
  const s = data.stats;
  return pct(s.캔_매출_2025_cny - s.캔_원가_2025_cny, s.주영업_매출_2025_cny - s.주영업_원가_2025_cny);
}

/** 2025 광고·판촉비 ÷ 캔 매출총이익(%). */
export function adToCanGross(): number {
  const s = data.stats;
  return pct(s.광고판촉_2025_cny, s.캔_매출_2025_cny - s.캔_원가_2025_cny);
}

/** 2025 연결 순이익 가운데 泛太渔业 순이익 몫(%, 내부거래 보정 없음). */
export function panPacificShare(): number {
  const s = data.stats;
  return pct(s.泛太渔业_순이익_2025_cny, s.순이익_2025_cny);
}

/** 2025 연결 순이익 가운데 Albo 순이익 몫(%). */
export function alboShare(): number {
  const s = data.stats;
  return pct(s.Albo_순이익_2025_cny, s.순이익_2025_cny);
}
