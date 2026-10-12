import raw from '@/public/data/companies/sojitz_v1.json';

/**
 * 双日(Sojitz) 수산 기업 해부 인테이크 (참치 기업 해부 ⅬⅩⅡ, 2026-10).
 *
 * 東証プライム 2768 종합상사(지배주주 없음) 안의 「水産事業」 한 행. 참치를 직접 다루는 곳은
 * 냉동 참치를 배 단위로 사들여 静岡에서 가공하는 トライ産業과 長崎 鷹島 참다랑어 양식장 둘이다.
 *
 * ⚠ **금칙 (정본 `~/tunawork/sojitz/notes/00_기준선_동결_집필용.md` O 절 · `build/killed.py`).**
 *
 * 1. **「사시미 참치 사슬」 금지** — 축은 「스시 재료 포트폴리오 안의 참치 한 축」. 조각 간 거래 문서 0건.
 * 2. **46억 엔은 참치 이익이 아니다** — マリンフーズ 이익에 참치 아닌 사업이 섞인 「水産事業」 실력치.
 * 3. **저베이스 배수(3배·14배) 금지 · 현행 목표는 50억 엔.**
 * 4. **SFIH £62,4 M은 신주 납입이지 인수가가 아니다 · Sushi Avenue는 사업 양수 · NESI 지분 94,6 %.**
 * 5. **大連翔祥 지분 90 %·51 % 병기 · 鷹島는 2008 자체 설립(인수 아님) · 「4만 尾」를 출하량으로 바꾸지 않는다.**
 * 6. **「한국산을 산다」는 FFA 2017 업계 전언 한 갈래 · 0척은 RFMO 등록부 5종 기준과 함께.**
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`sojitz stats.${key} 가 숫자가 아니다`);
  return v;
}

export const sojitzMeta = data._meta;
export const sojitzCard = data.card;
export const sojitzStats = data.stats;
export const sojitzSourceNotes = data.sourcenotes;

/** 이익·인수 — 결산설명자료 실력치, IR資料 個社業績合算, 有報 취득대가, 세그먼트 순이익. */
export function money() {
  return {
    실력치: n('실력치_FY26'), MF: n('실력치_MF'), TRY: n('실력치_TRY'), 기타: n('실력치_기타'),
    FY25: n('실력치_FY25'), FY24: n('합산_FY24'), 목표: n('목표'),
    MF대가: n('MF_대가'), MF영업권: n('MF_영업권'),
    세그먼트몫: n('세그먼트몫'), 세그먼트순이익: n('세그먼트순이익'), SFIH납입: n('SFIH_납입'),
  };
}

/** 참치 두 축 — TRY 취급량·鷹島 양식·인증·선박 등록부. */
export function tuna() {
  return {
    TRY만t: n('TRY_만t'), 천연어: n('천연어'), 면허: n('면허'), MSC: n('MSC'), MSC하위: n('MSC_하위'), 선박: n('선박'),
    아카미: n('아카미'), 주토로: n('주토로'), 오토로: n('오토로'),
  };
}

/** 무역·한국 — 식약처 수입식품 원장 「TRY INC.」, 일본 냉동 눈다랑어 수입의 대만 몫. */
export function trade() {
  return {
    신고: n('TRY_신고'), 대서양: n('신고_대서양'), 참다랑어: n('신고_참다랑어'), 눈다랑어: n('신고_눈다랑어'),
    대만23: n('대만_2023'), 대만25: n('대만_2025'),
  };
}
