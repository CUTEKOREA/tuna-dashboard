import raw from '@/public/data/companies/ppgroup_v1.json';

/**
 * Parlevliet & Van der Plas(PP Group) 기업 해부 인테이크 (참치 기업 해부 ⅬⅩⅣ, 2026-10).
 *
 * 네덜란드 부어류·새우·유통 그룹이 2016년에 산 프랑스 선망 선단 CFTO 위에 캔 가공 지주 TOG를
 * 2021년 50 %, 2026년 100 %로 소유 계열화했다. 원어 흐름은 어느 결산에도 숫자가 없다.
 *
 * ⚠ **금칙 (정본 `~/tunawork/ppgroup/03_통합/00_기준선_메인확인.md` §3 · `build/killed.py`).**
 *
 * 1. **「참치 회사」 금지** — 참치 몫은 가정과 함께만(지분법 7 · 비례연결 12 · pro-forma 14~17 %, 계산).
 * 2. **「운영 13척」이지 「소유 13척」이 아니다** — 등록부로 소유가 서는 것은 인도양 8척.
 * 3. **가문 정리 재원 €312,5m의 차주 법인은 미상** — 「그룹이 빌렸다」 금지.
 * 4. **「원료 안정」은 PP의 말이 아니다** — Atuna 해설·TOG 결산 주석.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`ppgroup stats.${key} 가 숫자가 아니다`);
  return v;
}

function s(key: string): string {
  const v = data.stats[key];
  if (typeof v !== 'string') throw new Error(`ppgroup stats.${key} 가 문자열이 아니다`);
  return v;
}

export const ppgroupMeta = data._meta;
export const ppgroupCard = data.card;
export const ppgroupStats = data.stats;
export const ppgroupSourceNotes = data.sourcenotes;

/** 그룹 재무·가문 지분 정리 — Quote(KvK 예탁 서류 인용). 차주 법인은 기사에 없다. */
export function money() {
  return {
    매출23: n('매출_2023'), 이익23: n('이익_2023'), 매출24: n('매출_2024'), 이익24: n('이익_2024'), 이익25: n('이익_2025'),
    대가: n('가문대가'), earnout: n('earnout'), 브리지: n('브리지론'), vendor: n('vendor_loan'),
  };
}

/** 참치 축 — 몫 세 가정(계산), TOG 지분, CFTO 선단, 생산 법인. */
export function tuna() {
  return {
    지분법: n('몫_지분법'), 비례: n('몫_비례'), proforma: s('몫_proforma'), FTE: n('몫_FTE'),
    tog21: n('TOG_2021'), tog26: n('TOG_2026'), 사모펀드: n('사모펀드'), 신주: n('신주'),
    운영: n('운영척'), 대서양: n('대서양'), 인도양: n('인도양'), 등록소유: n('등록소유'),
    SCODI: n('SCODI'), PFOI: n('PFOI'), 연결24: n('TOG연결_2024'), 연결23: n('TOG연결_2023'),
  };
}

/** 무역·한국 — Eurostat 코트디부아르산 캔참치, 한국 상장 참치 6사 공시. */
export function trade() {
  return {
    eu25: n('EU_CI_2025'), eu19: n('EU_CI_2019'), 프랑스: n('프랑스몫'), 관세: n('제3국관세'),
    공시: n('공시'), 적중: n('공시_적중'),
  };
}
