import raw from '@/public/data/companies/nesi_v1.json';

/**
 * NESI(New England Seafood International) 기업 해부 인테이크 (참치 기업 해부 ⅬⅩⅢ, 2026-10).
 *
 * 어선도 양식장도 없이 14개국 공급사에게서 사서 Chessington·Grimsby·Paignton 에서 2차 가공해
 * 영국 대형 소매 PB와 자사 브랜드 Leap로 파는 냉장 수산 가공사. 지주 SFIH(NESI 94,6 %)를 2026-10 双日이 가졌다.
 *
 * ⚠ **금칙 (정본 `~/tunawork/nesi/notes/00_기준선_동결_집필용.md` O 절 · `build/killed.py`).**
 *
 * 1. **「참치 회사」·「백색어 회사」 단정 금지** — 물량은 백색어, 특허·브랜드는 참치 해동.
 * 2. **「영국 최대 횟감 참치 수입사」는 자칭이다 · M&S 참치 납품 근거 없음.**
 * 3. **双日 = SFIH 100 %, NESI = 94,6 % · SH01 £62,4 m는 신주 납입이지 인수가가 아니다.**
 * 4. **17,6 %는 참치 매출 비중도 그 상한도 아니다**(원료 수입액 대 가공 후 판매액, 계산).
 * 5. **관세청 121.237 kg은 수입자 미상 · 한국 연승선은 2025 HRIA 한 척(회사 성명).**
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`nesi stats.${key} 가 숫자가 아니다`);
  return v;
}

export const nesiMeta = data._meta;
export const nesiCard = data.card;
export const nesiStats = data.stats;
export const nesiSourceNotes = data.sourcenotes;

/** 재무·소유 — Companies House 계정, SFIH 취득가격 배분, Barclays 한도·담보, UK Seafood Fund. */
export function money() {
  return {
    매출: n('매출_2025'), 순이익: n('순이익_2025'), 영국: n('영국비중'), 인원: n('인원'), FY13: n('매출_FY2013'),
    지분: n('지분'), 대가: n('인수대가'), 무형: n('무형자산'), 기술: n('개발기술'),
    한도: n('한도'), 담보: n('담보'), 바클레이즈: n('담보_Barclays'), 보조금: n('보조금'),
  };
}

/** 참치·조달 — 영국 횟감 관련 참치 수입, 공급국, 선박 등록부, 공장, 매대 값. */
export function tuna() {
  return {
    수입액: n('수입액'), 수입t: n('수입t'), 상한: n('상한'), 공급국: n('공급국'), 선박: n('선박'), 공장: n('공장'),
    Leap: n('Leap_kg'), PB: n('PB_kg'),
  };
}

/** 한국 — 관세청 한국→영국 냉동 참치 필레 수출(수입자 미상), 발송국 기준 영국 통계. */
export function korea() {
  return { kg: n('한국kg'), 단가: n('한국단가'), t21: n('한국_2021t'), t25: n('한국_2025t') };
}
