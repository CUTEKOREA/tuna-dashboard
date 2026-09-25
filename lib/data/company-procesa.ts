import raw from '@/public/data/companies/procesa_v1.json';

/**
 * Grupo Procesa 기업 해부 인테이크 (참치 기업 해부 ⅬⅣ, 2026-09).
 *
 * 멕시코 치아파스주 타파출라 Puerto Chiapas 의 캔·파우치 참치 가공 법인(Nair·Marina Azul).
 * **상표 Nair·Marina Azul 에 메자닌 펀드(2017)·Rabobank 뉴욕 지점(2022) 질권이 기재됐고, 2026-06-19 법원 보전처분이 상표 17건에 예비 기재됐다.**
 *
 * ⚠ **금칙 (정본 `~/tunawork/procesa/notes/00_기준선_메인확인.md` N 절 · `build/killed.py`).**
 *
 * 1. **「멕시코에서 가장 늙은 선단」 금지** — 4척 이상 소유 그룹 가운데 평균 선령 최고(50,5년). 1~2척 선주 중 더 늙은 곳이 있다.
 * 2. **보전처분은 17건** — 「NAIR 두 건」 금지. 소멸 2건·거절 출원 1건은 기재 거부. 「파산」「압류」 금지.
 * 3. **채권양도 인정 신청(2026-03-27)은 보정 요구 뒤 결과 미상** — 「기재됐다」「각하됐다」 금지.
 * 4. **Bumble Bee 와의 계약 형태는 공개되지 않았다** — 「샀다·빌렸다·합작했다」 금지. 관계 고리는 시장 발언(간접화법)·시장 X 배석 기록(B).
 * 5. **FDA 2023 기록으로 「2023년부터 Procesa 위탁가공」 추론 금지.** 3.000명은 주정부 전망, 2026-07 보도 830명.
 * 6. **12.454 t 는 용량×가동률 환산** — 실생산량 아님. KUO 570,1 은 pro forma 현금흐름 효과, 매각가 아님.
 * 7. **조달 446,4 는 원수치(중복 포함)** — 마지막 기록 2019, 2020~2022 미대조. 「끊겼다」 금지.
 * 8. **공장 능력 확대 문장은 항만공사 문안** — DG 발언 아님. DG 는 「총괄책임자」, 이름은 쓰지 않는다.
 * 9. **Diken International 은 코아우일라 권리자** — 「할리스코 기업」 금지. Qualtia 기록은 쓰지 않는다.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`procesa stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const procesaMeta = data._meta;
export const procesaCard = data.card;
export const procesaStats = data.stats;
export const procesaSourceNotes = data.sourcenotes;

/** 선단 — IATTC. */
export function fleet() {
  return {
    EU: s('EU번호'), 척수: n('척수'), 운반능력: n('운반능력_t'), 몫: n('운반능력_몫_pct'), 분모: n('분모_t'),
    선령: n('평균선령'), 멕시코선령: n('멕시코평균선령'), 침몰: s('침몰일'), MSC철회: s('MSC철회'), MSC개선: s('MSC개선'),
  };
}

/** 상표·담보·법원 — IMPI MARCia·공문. */
export function marks() {
  return {
    보전: n('보전처분_건수'), 보전일: s('보전처분_기재일'), 사건: s('사건번호'), 양도신청: s('채권양도_신청일'), 보정: s('보정요구일'),
    소멸: s('MA862797_만료'), 새등록: s('MA2992959_등록'),
  };
}

/** 조달·Bumble Bee·매대. */
export function market() {
  return {
    조달: n('조달_원수치_mdp'), 조달중복제거: n('조달_중복제거_mdp'), 조달마지막: s('조달_마지막'),
    FDA: s('FDA_등재'), 가동식: s('가동식'), BB고용: n('BB_고용'),
    Nair_kg: n('Nair_kg'), 파우치올리브_kg: n('MA_파우치올리브_kg'), KUO용량: n('KUO_용량_t'), KUO가동률: n('KUO_가동률_pct'),
  };
}
