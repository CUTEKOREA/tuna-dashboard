import raw from '@/public/data/companies/majestic_v1.json';

/**
 * Majestic 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅩⅦ, 2026-09).
 *
 * 파푸아뉴기니 라에 말라항의 참치 통조림·로인 공장. 값은 많고 실측은 하나다.
 *
 * ⚠ **「5,000명이 일하던 공장」 금지.** 2012-08 「완전 가동이면 **최소** 5,000명」 전망치다.
 *    폐쇄 시 파트너사 집계는 1,300명이고 매체 5,000·협회장 5,500이 같은 사건에 붙는다.
 * ⚠ **「350 t/일 공장」을 실적으로 쓰지 마라.** 350을 실적으로 쓴 원문은 0건이고
 *    2019년 명판은 250·실가동 80이다.
 * ⚠ **「능력이 여섯 값」 금지 — 일곱이다**(120 포함). **「투자액이 여섯 값」도 금지** —
 *    달러 표기 넷은 키나 한 값의 환율 차다.
 * ⚠ **「장부가 0이니 공장이 무가치하다」 금지.** nil 은 지분법 장부가다 —
 *    지분 원가 약 500만 달러 대 설비 3,200만~3,800만 달러.
 * ⚠ **「태국 회사가 공장을 팔았다」 금지.** 판 것은 버진아일랜드 지주회사 지분 33.22%이고
 *    그 주석은 이 공장 이름을 적지 않는다.
 * ⚠ **「말소돼 죽은 회사」 금지.** 연차보고 비준수는 등록법인 90% 이상이고
 *    통지 4주 뒤 공개 행사에 회사 이름을 단 팀이 나온다.
 * ⚠ **「말레이시아 상장사의 자회사」 금지.** 그 회사 공장은 **필지 361**의 다른 법인이다.
 * ⚠ **「FCF·Frabelle이 인수했다」 금지.** Frabelle 은 2009년 창립 3사 중 하나이고
 *    새 이름은 FCF 하나다.
 * ⚠ **「Majestic Tuna Corporation 으로 상호를 바꿨다」 금지.** 등기부에 그 이름이 없다.
 * ⚠ **「배 셋을 소유한다」 금지 — 용선이다**(기국도 확인되지 않는다).
 * ⚠ **「2,100명」·「선단 20→14척」·「냉동창고 1,000 t·K6M」 금지.**
 *    전부 같은 도시의 **이웃 공장(Frabelle PNG)** 수치다.
 * ⚠ **「34% 늘었다」를 그대로 쓰지 마라.** 산술은 **+50.5%**다. 둘을 나란히 적는다.
 * ⚠ **「입어료 10,500과 6,500이 어긋난다」 금지.** 2018년 요율과 그 뒤 인하 요율이고
 *    10,500 은 협정 최저가 아니다(협정 최저는 2015~2017년 US$8,000).
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string | number[]>;
  sourcenotes: string[];
};

/** 숫자 칸만 골라 쓴다 — `등록번호`·`EU승인번호`는 문자열이고 `능력_값_t일`은 배열이다. */
function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`majestic stats.${key} 가 숫자가 아니다`);
  return v;
}

export const majesticMeta = data._meta;
export const majesticCard = data.card;
export const majesticStats = data.stats;
export const majesticSourceNotes = data.sourcenotes;

/**
 * 본문이 세는 처리능력 값의 목록과 개수.
 *
 * ⚠ **일곱이다.** 120 을 빼고 여섯으로 적은 판이 돌아다니는데 본문 표에 일곱 값이 있다.
 * ⚠ 이 목록은 전부 **명판·계획·전망**이고 실적이 아니다. 실측은 2019년 하루 80 t 하나뿐이고
 *    그때 가용으로 적힌 값이 250 이다 — 그래서 값 목록과 실측을 한 객체로 같이 돌려준다.
 */
export function capacityValues(): {
  값: number[]; 개수: number; 실측: number; 실측연도: number; 가용: number;
} {
  const 값 = data.stats['능력_값_t일'] as number[];
  return {
    값,
    개수: 값.length,
    실측: n('가동_실측_2019_t일'),
    실측연도: n('가동_실측_연도'),
    가용: n('능력_가용_2019_t일'),
  };
}

/**
 * 이 나라 참치 가공 생산의 2023 → 2024 증가.
 *
 * ⚠ **「34% 늘었다」를 그대로 옮기지 마라.** 장관 발표문이 한 문장에 79,209 · 119,232 · 34%
 * 세 값을 함께 적는데, 앞의 두 값이 맞으면 뒤의 값은 50.5%여야 한다. 어느 쪽도 임의로
 * 버리지 않으려고 발표증가율과 계산증가율을 둘 다 담아 돌려준다.
 */
export function nationalGrowth(): {
  2023: number; 2024: number; 발표증가율: number; 계산증가율: number; 단서: string;
} {
  const y23 = n('국가생산_2023_t');
  const y24 = n('국가생산_2024_t');
  return {
    2023: y23,
    2024: y24,
    발표증가율: n('국가생산_발표증가율_pct'),
    계산증가율: Number((((y24 - y23) / y23) * 100).toFixed(1)),
    단서: '장관 발표문이 한 문장에 세 값을 함께 적는데 34%와 50.5%는 같이 성립하지 않는다',
  };
}
