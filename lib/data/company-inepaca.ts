import raw from '@/public/data/companies/inepaca_v1.json';

/**
 * INEPACA 기업 해부 인테이크 (참치 기업 해부 ⅬⅧ, 2026-09).
 *
 * 에콰도르 만타 Malecón의 Van Camp's 캔 공장(1949 등기), 파나마 증권시장 등록 발행인.
 * **Seatech International 과 임원·이사를 공유하고, 두 회사는 같은 경제 그룹이 아니라고 공시한다. 주주는 2024년부터 Estrella Blanca de Panamá 100 %.**
 *
 * ⚠ **금칙 (정본 `~/tunawork/inepaca/notes/00_기준선_동결_집필용.md` N 절 · `build/killed.py`).**
 *
 * 1. **「원조 공장」·「Seatech의 전신」 금지** — 1949는 법인 등기. Van Camp's와 잇는 가장 이른 등록은 1989 INVIMA.
 * 2. **「자매사·계열사·자회사」 금지** — 지분 관계 등기 없음. 「임원과 이사를 공유하되 같은 그룹은 아니라고 공시」까지.
 * 3. **「Seatech 선단」 금지** — 감사보고서는 「원료 공급자의 배」. 명세 14척 중 12척이 ⅬⅥ의 두 주소 12척과 이름이 같다.
 * 4. **Andean Trading 은 「표기만 다르다」** — 서식 「INTERNACIONAL」 대 상표 원부 「INTERNATIONAL INC.」. 지분율 없음.
 * 5. **「선원 22명」 금지** — 기소 22명 중 1명은 출항 명단에 없던 멕시코 국적자. 선주·법인 기소 없음, 판결 공개 없음.
 * 6. **2026-09-07 격침 선박** — 미 남부사령부는 이름 없이 발표. MonteCristi 특정은 가족·매체.
 * 7. **개인 실명 금지** — 등기 임원·이사·선원은 역할로만.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`inepaca stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const inepacaMeta = data._meta;
export const inepacaCard = data.card;
export const inepacaStats = data.stats;
export const inepacaSourceNotes = data.sourcenotes;

/** 배와 원료 — IATTC·감사보고서. */
export function fleet() {
  return {
    척수: n('선망_척수'), 운반: n('운반능력_t'), 몫: n('선망몫_pct'), 선령: n('평균선령'), 나라: n('에콰도르_선망'),
    선급2016: n('선급금_2016'), 선급2019: n('선급금_2019'), 선급2021: n('선급금_2021'), 명세: n('명세_척수'), 일치: n('이름일치_척수'),
    코카인: n('코카인_t'), 기소: n('기소_인원'),
  };
}

/** 돈 — 감사 재무제표·파나마 연차보고. */
export function money() {
  return {
    매출2025: n('매출_2025'), 순이익2025: n('순이익_2025'), 매출2020: n('매출_2020'), 퇴직연금: n('퇴직연금몫_2025'),
    배당2019: n('배당_2019'), 배당그해: n('배당배수_그해'), 배당전년: n('배당배수_전년'),
    내수2020: n('내수_2020'), 내수2025: n('내수_2025'), 수출2019: n('수출_2019'), 수출2025: n('수출_2025'),
    인원: n('인원_2025'), 능력참치: n('능력_참치_t일'), 능력정어리: n('능력_정어리_t일'), 과태료: n('SMV_과태료'),
    주주: n('주주_EB_pct'), 변경: s('주주_변경연도'), Seatech영업수익: n('Seatech_영업수익_2025'),
  };
}

/** 매대 — Tía 온라인 가격·INVIMA. */
export function shelf() {
  return { VC: n('VanCamps_kg'), Real: n('Real_kg'), PB: n('PB_kg'), INVIMA: n('INVIMA_유효') };
}
