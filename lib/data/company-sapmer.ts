import raw from '@/public/data/companies/sapmer_v1.json';

/**
 * SAPMER SA 기업 해부 인테이크 (참치 기업 해부 ⅬⅩ, 2026-09).
 *
 * 레위니옹 르포르의 선주(Euronext Growth ALMER). 이빨고기 연승 4척·가재선 1척, 2006~2026 인도양 선망.
 * **신조 선망 9척 중 4척은 가문 쪽 SPV 명의였지만 2019년부터 상장사 연결 장부에 사용권자산으로 있었다.
 * 2026-09-09 마지막 세 척을 CFTO에 넘겨 선망 0척.**
 *
 * ⚠ **금칙 (정본 `~/tunawork/sapmer/notes/00_기준선_동결_집필용.md` L·N 절 · `build/killed.py`).**
 *
 * 1. **「장부 밖의 배」 금지** — 연결 밖인 것은 SPV 법인이다. 배는 금융리스(사용권자산)로 상장사 장부에 있었다.
 * 2. **「매각 대가 네 건 모두 비공개」 금지** — 4,9 M€·8,4 M€(RFA 현금흐름), US$ 19.146.300(IOST 연차). 값이 없는 것은 2023-11 SPV 2척과 2026 CFTO.
 * 3. **「2 %」는 참치 EBITDA 마진** — 그룹 EBITDA 안의 참치 몫은 8,8 %.
 * 4. **쿼터 −24,0 %를 선령·무풀 하나로 돌리지 않는다** — TAC −13,7 %와 배분 개편이 겹쳤다.
 * 5. **「albacore」는 황다랑어** — 「알바코어」 금지.
 * 6. **WOFCO는 매체 표기** — 등록 소유자는 파나마·스페인 3개 법인.
 * 7. **모리셔스 쿼터는 회사·정부 진술을 나란히** — 한쪽 단정 금지. 「증자로 빚을 갚았다」 금지.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`sapmer stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const sapmerMeta = data._meta;
export const sapmerCard = data.card;
export const sapmerStats = data.stats;
export const sapmerSourceNotes = data.sourcenotes;

/** 선단 — IOTC e-RAV·IATTC·RFA·CBRD. */
export function fleet() {
  return {
    최대: n('선망_최대'), 거친: n('선망_거친'), 현재: n('선망_현재'), SPV: n('SPV_척'), 상장사: n('상장사_명의'),
    사용권자산: n('사용권자산_2019'), 대가1: n('대가_Manapany'), 대가2: n('대가_Belouve'), 대가SPV: n('대가_SPV_USD'),
  };
}

/** 돈 — RFA 2014~2025. */
export function money() {
  return {
    매출: n('매출_2025'), 순이익: n('순이익_2025'), 참치매출: n('참치_매출'), 참치비중: n('참치_비중'), 마진: n('참치_마진'),
    EBITDA몫: n('참치_EBITDA몫'), 참치세전: n('참치_세전'), 참치손상: n('참치_손상'), 손상합: n('손상합_2020_2025'),
    손실2023: n('순손실_2023'), 순차입: n('순차입_2025'), 지배: n('지배블록'), 지역정부: n('지역정부'), 증자1: n('증자_1차'), 증자2: n('증자_2차'),
    ETP: n('ETP_2025'),
  };
}

/** 이빨고기·인증·한국 — TAAF 결정문·MSC·관세청. */
export function legine() {
  return {
    TAC24: n('TAC_2024'), TAC25: n('TAC_2025'), TAC변화: n('TAC_변화'), 쿼터24: n('쿼터_Sapmer_2024'), 쿼터25: n('쿼터_Sapmer_2025'),
    쿼터변화: n('쿼터_변화'), 몫: n('쿼터_몫'), MSC: s('MSC_인증서'), MSC적격: s('MSC_적격'), 가처분: s('가처분'), 가처분일: s('가처분_일'),
    한국몫: n('한국_2025_몫'), 한국t: n('한국_2025_t'),
  };
}
