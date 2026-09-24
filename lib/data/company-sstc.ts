import raw from '@/public/data/companies/sstc_v1.json';

/**
 * South Seas Tuna Corporation 기업 해부 인테이크 (참치 기업 해부 ⅬⅡ, 2026-09).
 *
 * 파푸아뉴기니 웨와크 부두의 로인·어분 공장(회사등기 1-31938, 유럽연합 승인 09EPR019).
 * **2004~2015 대만 FCF 가 해상에서 산 참치를 가공비를 받고 로인으로 만들었다(두 판결의 다툼 없는 배경사실).**
 *
 * ⚠ **금칙 (정본 `~/tunawork/sstc/notes/00_기준선_메인확인.md` N 절 · `build/killed.py`).**
 *
 * 1. **가동률 37,5 % 금지** — 능력 분모가 100(NFA 2014·회사 1단계)과 200(EP 2012 전화·회사 기반 정격)으로 갈린다.
 * 2. **「법원이 FCF 를 모회사로 판단」 금지** — 2016 대표 선서진술의 배경사실이다.
 * 3. **「보세 공장이다」 단정 금지** — 세관 통제는 회사 주장(SC1761 ¶5). FCF 소유·가공 용역은 2004~2015 배경사실.
 * 4. **「영세율 패소」 금지** — N9290 은 절차 기각, 본안 미판단. 2023 두 판결로 이의 절차가 다시 열렸다(미결).
 * 5. **「K64,5백만이 세금」 금지** — 본세 K24,6백만, 나머지 가산세·이자. IRC 논리는 이전가격 + GST 미부과.
 * 6. **「용선료를 낸다」 금지** — WCPFC 용선자 등재는 조업 자격 지위. 2025 18척 → 2026 9척(반감).
 * 7. **「의무 양륙 없다」 금지** — 계획 본문엔 없지만 면허·VDS 3자 협정(2025-01)에 있다.
 * 8. **무역통계는 나라 단위** — EU 로인 스페인 65,1 % 를 SSTC 몫으로 쓰지 않는다. DG SANTE 2026 서면 감사도 국가 단위.
 * 9. **PNG→FCF→Bumble Bee 경로 금지** — 선서진술 ¶28 의 PNG 는 FCF 외 공급자 소재국.
 * 10. **Atuna 2026-07-16 「독일 PB 캔 공급사」 쓰지 않는다** — 자사·제3자 기록과 충돌(보류).
 * 11. **인증 정지(2025-01-10)를 세금 탓으로 쓰지 않는다** — 연차 현황보고 미제출, 같은 날 Nambawan·FCF 90973 도.
 * 12. **개인 실명 금지** — FCF 대표자·SSTC 경영진·노조 대표·판사는 역할·판결 번호로.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`sstc stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const sstcMeta = data._meta;
export const sstcCard = data.card;
export const sstcStats = data.stats;
export const sstcSourceNotes = data.sourcenotes;

/** 법인·세금 — IPA 등기와 판결. */
export function corp() {
  return {
    등록번호: s('등록번호'), 설립: s('설립'), 인증: s('인증'), EU승인: s('EU승인'), 협정: s('협정'), 가동: n('가동'),
    GST총액: n('GST_총액_K'), GST본세: n('GST_본세_K'), GST이자: n('GST_이자_K'), 압류: n('압류_K'),
  };
}

/** 공장·원어 — 능력 출처별, 용선, 리베이트. */
export function plant() {
  return {
    능력NFA: n('능력_NFA'), 능력EP: n('능력_EP'), 처리2018: n('처리_2018'), 물: n('물_L일'),
    용선2025: n('용선_2025'), 용선2026: n('용선_2026'), 리베이트: n('리베이트_USDt'),
    최저임금: n('최저임금_2026_K'), 시위: s('시위_2024'), 시위인원: n('시위인원'),
  };
}

/** 유럽 — 나라 단위 Comext. */
export function europe() {
  return { t2021: n('EU_2021_t'), t2025: n('EU_2025_t'), 스페인: n('로인_스페인_pct'), 로인비중: n('로인비중_2025_pct') };
}
