import raw from '@/public/data/companies/grupomar_v1.json';

/**
 * Grupomar 기업 해부 인테이크 (참치 기업 해부 ⅬⅢ, 2026-09).
 *
 * 멕시코 콜리마주 만사니요 Fondeport 산업단지 **Calle Don Antonio Suárez Gutiérrez No. 5** 의 참치 그룹.
 * **선망 6척(Maratún 4 + Martuna 2)이 멕시코 기국 활성 선망 운반능력의 13,6 % — 가장 새 배를 들이고도 선단은 한 척 줄었다(2019년 명부 7척 → 6척).**
 *
 * ⚠ **금칙 (정본 `~/tunawork/grupomar/notes/00_기준선_메인확인.md` N 절 · `build/killed.py`).**
 *
 * 1. **「지주 법인이 등록부 어디에도 없다」 금지** — 조회한 공개 명부에 없을 뿐, EMIS(B)는 1982-08-25 설립 S.A. de C.V.로 적는다.
 * 2. **「100 % 자회사」 단정 금지** — 지분은 상업 DB(B) 기재뿐.
 * 3. **「돈이 간 자리는 배뿐」 금지** — 등록부로 실물·건조연도를 짚을 수 있는 투자가 배다. **「신조 4척 = 교체」 금지** — 2013~2014 세 척은 회사가 능력 확대로 적었고, 대체선 발언은 2023년 배뿐.
 * 4. **3.361 은 행 수** — QQW 두 원천 중복 포함, 추정 약 2.710건. 「1,78배」 단독 금지(2017~2022 1,38배).
 * 5. **2023~2025 CompraNet 은 Pinsa Comercial 이 크다 · 비교는 계약액(「더 많이 샀다」 금지)** — 1,88·3,44·5,13배(2025 부분 연도). QQW 와 합산 금지.
 * 6. **「Tuny 는 MSC 인증」 금지** — PAST 인증 2023-03-08 철회, 2026-05-20 개선 프로그램(인증 아님). Comprehensive 는 FIP 유형이지 등급 아님.
 * 7. **「Tuny 대두 0 %」는 2024 시험** — 2019 시험 Tuny Light 1~4 %.
 * 8. **회사 X 「65 % 초과가 10년 미만」** — IATTC 건조연도로는 6척 중 1척.
 * 9. **NOAA 2026-03-25 돌고래 안전 허위 표시 적발을 Tuny 로 적지 않는다** — 공급자 비공개.
 * 10. **「EU 에 캔참치를 가장 많이 판다」 금지** — Comext 상 멕시코산 1604 는 사실상 0.
 * 11. **2023 중독 사고 원인물질 미확정 · 2025 작업중단은 05-26 재개·05-27 합의 보도** — 「대량 해고」·「무기한 폐쇄」 금지.
 * 12. **Ventresca 는 「PRODUCTO IMPORTADO」** — 「Tuny 전 제품 만사니요산」 금지.
 * 13. **개인 실명은 공직자·등기 임원만** — 창업자 회장·DG 는 역할로. 주소의 도로명은 원문 그대로.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`grupomar stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const grupomarMeta = data._meta;
export const grupomarCard = data.card;
export const grupomarStats = data.stats;
export const grupomarSourceNotes = data.sourcenotes;

/** 단지와 선단 — IATTC·TRACES·IMPI. */
export function fleet() {
  return {
    주소: s('주소'), RFC: s('RFC'), 상표: s('상표'),
    척수: n('척수'), 운반능력: n('운반능력_t'), 몫: n('운반능력_몫_pct'), 분모: n('분모_t'),
    선령: n('평균선령'), 멕시코선령: n('멕시코평균선령'), 신조: n('신조'), 척수2023: n('척수_2023'), 동태평양: n('동태평양_선망'),
    MSC철회: s('MSC철회'), MSC개선: s('MSC개선'),
  };
}

/** 국가 조달 — QQW(1999~2022)·CompraNet(2023~2025). 합산 금지. */
export function procurement() {
  return {
    마린: n('조달_Marindustrias_mdp'), 핀사: n('조달_PinsaComercial_mdp'), 행수: n('조달_행수'),
    마린2025: n('조달_2025_Marindustrias_MXN'), 핀사2025: n('조달_2025_Pinsa_MXN'), 매출: n('매출_mdp'),
  };
}

/** 품질·사고·상표 — PROFECO·ASIPONA·USPTO. */
export function record() {
  return {
    표기: n('고형량_표기_g'), 하한: n('고형량_하한_g'), 상한: n('고형량_상한_g'),
    배상청구: n('배상청구_MXN'), USPTO: s('USPTO_재등록'),
  };
}
