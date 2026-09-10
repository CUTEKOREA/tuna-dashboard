import raw from '@/public/data/companies/ati_v1.json';

/**
 * PT Aneka Tuna Indonesia 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅣ, 2026-09).
 *
 * 伊藤忠·はごろも 가 세운 인도네시아 동자바의 캔참치 공장이다. 일본 조제참치 수입 2위국의 물량을 만든다.
 *
 * ⚠ **「준수 1위」로 쓰지 마라.** 재단 표의 맨 윗줄은 정렬 규칙(준수 낮은 순) 때문이다. Major 1건은 24사 중 이 회사뿐이다.
 * ⚠ **「9.6% → 0」으로 쓰지 마라.** 개정 직전 인도네시아산이 쓸 수 있던 최저는 AJCEP 5%다.
 * ⚠ **「연 105,000 t」으로 쓰지 마라.** 일 250 t 능력으로 420일이 필요하다. 연간 처리량은 확정치가 없다.
 * ⚠ **FIP 명부 118척을 선단으로 쓰지 마라.** WCPFC 등록부의 자사 선박은 0척이다.
 * ⚠ **「39%가 지속가능 원료」로 쓰지 마라.** 一本釣り 비중(취급량 분모)과 MSC 비중(구매 톤 분모)은 다르다.
 * ⚠ **「이 회사 수출의 87%가 호주」로 쓰지 마라.** 87%의 분모는 인도네시아의 대호주 조제참치 수출이다.
 * ⚠ **「공장 강제노동」으로 쓰지 마라.** 보고서가 지목한 것은 공급 추정 선박의 노동이다.
 * ⚠ **지분법 이익을 33%로 나눠 순이익을 만들지 마라.** 연결 조정이 섞인다.
 * ⚠ **「シーチキン은 이 회사 브랜드」로 쓰지 마라.** はごろもフーズ의 등록상표다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const atiMeta = data._meta;
export const atiCard = data.card;
export const atiStats = data.stats;
export const atiSourceNotes = data.sourcenotes;

/** 월 원료 대비 월 제품 — 캔·파우치 합산 수율. */
export function monthlyYieldPct(): number {
  const s = data.stats;
  const out = s.월제품_캔_톤 + s.월제품_파우치_톤;
  const inp = s.월원료_캔_톤 + s.월원료_파우치_톤;
  return Number(((out / inp) * 100).toFixed(1));
}

/** 일본 HS 1604.14 수입액(2025) 중 인도네시아산. 이 회사 몫이 아니라 나라 몫이다. */
export function japanImportShareIdnPct(): number {
  const s = data.stats;
  return Number(((s.일본수입_인니_2025_천엔 / s.일본수입_1604_2025_천엔) * 100).toFixed(1));
}

/** はごろも 연결에 들어온 지분법 이익의 증감 — 제96기 → 제97기. */
export function equityIncomeChangePct(): number {
  const s = data.stats;
  return Number(((s.지분법이익_97기_천엔 / s.지분법이익_96기_천엔 - 1) * 100).toFixed(1));
}

/** 한국 냉동 가다랑어 수출 중 인도네시아 행. 분모는 한국의 대세계 수출 중량. */
export function koreaSkjShareToIdnPct(): number {
  const s = data.stats;
  return Number(((s.한국_0303_43_대인니_톤 / s.한국_0303_43_세계_톤) * 100).toFixed(2));
}

/** 조달 비중 변화(%p) — 회사 정책 문서 2024판 → 2026-03판. */
export function mscShiftPp(): number {
  return data.stats.MSC_2025_pct - data.stats.MSC_2024_pct;
}
