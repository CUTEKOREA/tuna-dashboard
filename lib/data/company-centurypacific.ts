import raw from '@/public/data/companies/centurypacific_v1.json';

/**
 * Century Pacific Food 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅨ, 2026-09).
 *
 * 캔참치 회사로 알려져 있으나 수산 부문이 매출의 40.28%이고 그 부문은 참치와 정어리를 함께 담는다.
 * 어선은 중서부태평양 선박등록부에 0척인데 국제기구 공시는 참치 매입의 59%를 선박 직구매로 적는다.
 *
 * ⚠ **「Marine 부문 = 참치」로 쓰지 마라.** 그 부문은 참치·정어리·기타 수산물이다.
 * ⚠ **「매출의 80%가 참치 브랜드」로 쓰지 마라.** Branded 약 80%는 수산·육류·유가공·코코넛을 다 담는다.
 * ⚠ **「₱80~90억을 투자했다」로 쓰지 마라.** 2026-06-30 주주총회가 재확인한 계획이고 집행이 아니다.
 * ⚠ **「7월 7일 청문에서 진술했다」로 쓰지 마라.** 출석 요청 제출까지가 확인된 사실이다.
 * ⚠ **지주 63%로 쓰지 마라.** 직접명의분 62.994%의 반올림이고 예탁분을 더하면 65.5%다.
 * ⚠ **대법원 판례 세 건의 당사자는 지주의 옛 상호**이지 상장사가 아니다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const centurypacificMeta = data._meta;
export const centurypacificCard = data.card;
export const centurypacificStats = data.stats;
export const centurypacificSourceNotes = data.sourcenotes;

/** 수산 부문 외부매출이 연결 매출에서 차지하는 몫(%). 회사 인쇄값이 아니라 재계산이다. */
export function marineSharePct(): number {
  return Number(
    ((data.stats.수산부문_외부매출_2025 / data.stats.연결매출_2025) * 100).toFixed(2),
  );
}

/** 2026년 상반기 유형자산 지출을 단순 연율화했을 때 계획 하단 대비 몇 %인가. */
export function capexPaceVsPlanPct(): number {
  return data.stats.연율화_계획대비_퍼센트;
}

/** 상반기 지출 가운데 아직 자산이 아닌 공급자 선수금의 몫(%). */
export function advanceSharePct(): number {
  return Number(((data.stats.선수금_2026H1 / data.stats.capex_2026H1) * 100).toFixed(1));
}

/** 한국 몫이 2022년 대비 몇 분의 일이 됐는가. */
export function koreaShareShrinkFactor(): number {
  return Number((data.stats.한국몫_2022_퍼센트 / data.stats.한국몫_2025_퍼센트).toFixed(1));
}
