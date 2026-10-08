import raw from '@/public/data/companies/ppf_v1.json';

/**
 * Pan Pacific Foods (RMI) Inc. 기업 해부 인테이크 (참치 기업 해부 ⅬⅦ, 2026-09).
 *
 * 마셜제도 마주로 Delap 임차지의 참치 로인 공장, 上海开创(600097) 100 % 손자회사.
 * **모회사는 공장을 선망 허가 몫의 수단으로 적었고, 공장은 2021~2025년 가공 실적이 0이다. 2025년 순이익은 공장 법인 1,13 대 선단 법인 5.381,94만 위안.**
 *
 * ⚠ **금칙 (정본 `~/tunawork/ppf/notes/00_기준선_동결_집필용.md` O 절 > N 절 · `build/killed.py`).**
 *
 * 1. **약어 금지** — 공장 법인 Pan Pacific Foods / 선단 법인 Pan Pacific Fishing. 두 법인을 한 약어로 섞지 않는다.
 * 2. **「캔 공장」·「캔을 만든다」 금지** — 로인·통어 적입 공장, 캔 라인은 어느 문서에도 없다.
 * 3. **미국은 「닫힌 문」이 아니라 끊긴 판로** — 2008~2015 미국 신고 있음, 2016~2025 신고 없음. 「7년 0행」 단독 금지.
 * 4. **「모회사가 새 배를 넣었다」 금지** — JUNMETO 는 선단 법인 자기 출자(폐선 LOJET 대체). 2027 인도 2척은 开创远洋 발주.
 * 5. **停工损失은 그룹 연결 행** — 공장 법인 몫으로 적는 해는 2023(감소)·1H2026(증가)뿐.
 * 6. **2019 로인 322 t 은 회사가 정부에 신고한 값**, 약 3.000 t 은 회사가 FAO 면담에서 한 말. 「정부 수출표」 금지.
 * 7. **「공장이 없으면 입어 불가」 금지** — FSMA 25점 점수표의 한 칸(정부 수입과 택일).
 * 8. **2006 설립 주체는 上海远洋渔业** — 2007-12-31 开创远洋에 양도.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`ppf stats.${key} 가 숫자가 아니다`);
  return v;
}
const s = (key: string) => String(data.stats[key]);

export const ppfMeta = data._meta;
export const ppfCard = data.card;
export const ppfStats = data.stats;
export const ppfSourceNotes = data.sourcenotes;

/** 공장 — MIMRA·FAO(회사 설명)·MSC. */
export function plant() {
  return {
    가공: n('가공실적_t'), 시작: s('가공0_시작'), 끝: s('가공0_끝'), 신고: n('로인_2019_신고_t'), 면담: n('로인_2019_면담_t'), 배수: n('로인_배수'),
    적입: n('통어적입_2024_t'), MSC: s('MSC'), MSC발급: s('MSC_발급'), MSC만료: s('MSC_만료'), 임차: s('임차만료'), 장부가: n('건물장부가_2025'),
    능력하한: n('로인능력_하한_t일'), 능력상한: n('로인능력_상한_t일'), 냉동창고: n('냉동창고_t'), 척수: n('선망_척수'),
  };
}

/** 두 법인의 돈 — 上海开创 연보·반기보. */
export function money() {
  return {
    공장순이익: n('공장_순이익_2025'), 선단순이익: n('선단_순이익_2025'), 공장매출: n('공장_매출_2025'), 순자산: n('공장_순자산_2025'),
    공장실투자: n('공장_실투자'), 선단실투자: n('선단_실투자'), 신조: n('JUNMETO_USD만'),
    휴업1H: n('휴업손실_1H2026'), 휴업2025: n('휴업손실_2025'), 휴업배수: n('휴업손실_배수'), 귀속1H: n('귀속순이익_1H2026'),
  };
}

/** 판로 — UN Comtrade·자유연합협정·FSMA. */
export function market() {
  return {
    미국2008: n('미국_2008_t'), 미국정점: n('미국_정점_t'), 미국2015: n('미국_2015_t'), 미국행로인: n('미국행로인_2016_t'),
    MFN: n('로인_MFN_센트_kg'), FSMA: n('FSMA_최소점수'),
  };
}
