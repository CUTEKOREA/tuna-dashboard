import raw from '@/public/data/companies/kfl_v1.json';

/**
 * Kiribati Fish Limited 기업 해부 인테이크 (참치 기업 해부 ⅬⅨ, 2026-09).
 *
 * 키리바시 타라와 Betio Wharf의 수산 가공 합작사, 키리바시 유일의 EU 승인 가공장 KIR-KFL-EU-01.
 * **2026년 WCPFC 용선 명부에 KFL 이름으로 통보된 외국 배 36척. 上海开创(600097) 선급금 최대 상대 2.725,35만 위안(2026-06-30, 명목 없음).**
 *
 * ⚠ **금칙 (정본 `~/tunawork/kfl/notes/00_기준선_동결_집필용.md` N 절 · `build/killed.py`).**
 *
 * 1. **「KFL 선단」·「KFL이 36척 운영」 금지** — 「KFL 이름으로 용선 통보된 배」. 등록 소유자는 중국·마셜 법인. KFL 명의는 BLUE FORTUNE 31·32.
 * 2. **600097 선망 12척 = 开创远洋 소유 4 + 지배주주 上海远洋 소유 임차 2(金汇18·58) + 泛太渔业 6** — 「上海开创 6척」·「전체」 금지.
 * 3. **CMM ¶7 귀속은 보고·한도 계산** — 권리·배분 몫 아님(CMM 2025-02 ¶8), 공해 선망 용선 어획은 기국 몫(TCC22-2026-03).
 * 4. **선급금 명목 단정 금지** — 입어료·용선료로 쓰지 않는다. 협회→KFL 인과 병치 금지.
 * 5. **지분은 열 벌** — 단일 지분율 금지. 수산부 「their shareholder」는 상장사 공시와 충돌.
 * 6. **연도별 용선 척수는 통보 기준 상한값** — 「정점」 금지, 첫 통보 2015-09.
 * 7. **나라 단위 통계(0303·030487 무역·FFA 고용)를 KFL 물량으로 쓰지 않는다.** 캔 없음.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`kfl stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const kflMeta = data._meta;
export const kflCard = data.card;
export const kflStats = data.stats;
export const kflSourceNotes = data.sourcenotes;

/** 용선 — WCPFC 용선 통보 명부·선박 명부. */
export function charter() {
  return {
    척수: n('용선_2026'), 선망: n('용선_선망'), 연승: n('용선_연승'), 누적: n('용선_누적'), 첫통보: s('첫통보'),
    주최: n('키리바시_주최'), KBPL: n('KBPL'), KIFL: n('KIFL'), 소유4: n('개창_소유'), 임차2: n('지배주주_임차'), 泛太: n('泛太'), 명의배: n('명의배'),
  };
}

/** 돈 — 上海开创 반기보·연보. */
export function money() {
  return { 선급금: n('선급금_만위안'), 비중: n('선급금_pct'), 협회: n('협회_만위안'), 金汇18: n('金汇18'), 金汇58: n('金汇58') };
}

/** 공장·판로 — 정부 보고서·STDF·Comext·Comtrade·MSC. */
export function plant() {
  return {
    능력: n('능력_t일'), 인원: n('인원_최근'), 인원2018: n('인원_2018'), 인원2023: n('인원_2023'), 양륙: n('양륙_월_t'),
    EU필레: n('EU필레_2024_t'), EU원어: n('EU원어_2024_t'), 일본필레: n('일본필레_2025_t'),
    MSC: s('MSC'), MSC만료: s('MSC_만료'), EU요청: s('EU요청'),
  };
}
