import raw from '@/public/data/companies/seatech_v1.json';

/**
 * Seatech International Inc. 기업 해부 인테이크 (참치 기업 해부 ⅬⅥ, 2026-09).
 *
 * 콜롬비아 카르타헤나 Mamonal km 8 의 캔참치 공장(Van Camp's 콜롬비아판). 영국령 버진아일랜드 회사의 콜롬비아 지점.
 * **IATTC 등록부 소유자 칸에 Seatech 이 없고, 콜롬비아 기국 활성 선망 12척이 두 주소의 12개 법인 명의로 한 척씩 올라 있다. 부채의 97,5 %는 매입채무 및 기타채무 한 줄이다.**
 *
 * ⚠ **금칙 (정본 `~/tunawork/seatech/notes/00_기준선_동결_집필용.md` O 절 > N 절 · `build/killed.py`).**
 *
 * 1. **「Seatech 선단/소유 12척」 금지** — 두 주소의 12개 법인이 한 척씩. 장부 선박은 유형자산의 0,26 %.
 * 2. **「Van Camp's 는 Seatech(또는 Colombina) 상표」 금지** — 29류 권리자는 파나마 법인 Andean Trading International.
 * 3. **「거래처 외상으로 돈다」 금지** — 「매입채무 및 기타채무 한 줄」. 상대가 원료 공급자인지 본점인지는 공개되지 않는다.
 * 4. **「봉인하자 관계없다고 했다」 금지** — 회사는 봉인 전부터 여러 차례 그렇게 말해 왔다.
 * 5. **「세금이 순이익을 플러스로 돌렸다」 금지** — 세전이 이미 +3,2억 COP.
 * 6. **원산지 누적의 2016-12-30 약정은 럼주 사례** — 참치와 잇지 않는다. 누가 누적을 썼는지는 문서에 없다.
 * 7. **나라 단위 통계(어획·수입·EU 수입)를 Seatech 물량으로 쓰지 않는다.** 미국 Van Camp's·MonteCristi 는 다른 회사.
 * 8. **개인 실명 금지** — 등기 대표·총지배인·선원은 역할로만.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`seatech stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const seatechMeta = data._meta;
export const seatechCard = data.card;
export const seatechStats = data.stats;
export const seatechSourceNotes = data.sourcenotes;

/** 선단 — IATTC·EU TRACES·노동부. */
export function fleet() {
  return {
    EU: s('EU번호'), 활성: n('활성선망_척수'), 두주소: n('두주소_척수'), 운반능력: n('운반능력_t'), 두주소운반: n('두주소_운반능력_t'),
    몫: n('두주소_몫_pct'), 동태평양: n('동태평양_몫_pct'), 선령: n('평균선령'), 동결선: n('EU동결선_척수'), 한주소: n('한주소_척수'),
    봉인일: s('봉인일'), 봉인: n('봉인_척수'), 유형자산: n('유형자산_2025'), 선박: n('선박_2025'), 선박몫: n('선박_몫_pct'),
  };
}

/** 장부 — Supersociedades 2025. */
export function books() {
  return {
    매출2024: n('매출_2024'), 매출2025: n('매출_2025'), 증감: n('매출증감_pct'), 영업손익: n('영업손익_2025'), 기타비용: n('기타비용_2025'),
    부채: n('부채_2025'), 매입채무: n('매입채무_2025'), 매입채무몫: n('매입채무_몫_pct'), 금융비용: n('금융비용_2025'), 금융수익: n('금융수익_2025'),
    금융비용매출: n('금융비용_매출_pct'),
  };
}

/** 상표·등록·매대·무역. */
export function brand() {
  return {
    제조: n('INVIMA_제조'), 수입: n('INVIMA_수입'), 표장: n('표장_검색'), Andean: n('표장_Andean'), 출원일: s('표장_출원일'), 출원: n('표장_출원건수'),
    Colombina: n('Colombina_VC_2025'), 거울최소: n('거울_최소'), 거울최대: n('거울_최대'), 이탈리아: n('이탈리아_몫_pct'), EU: s('EU무관세_적용'),
    VC_kg: n('VC물_kg'), TAEQ_kg: n('TAEQ_kg'), 배수: n('가격배수'), 어분: n('어분_t_일'), 인력: n('인력'),
  };
}
