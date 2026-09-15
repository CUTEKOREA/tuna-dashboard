import raw from '@/public/data/companies/galapesca_v1.json';

/**
 * Galapesca S.A. 기업 해부 인테이크 (참치 기업 해부 ⅩⅬⅢ, 2026-09).
 *
 * 에콰도르 과야킬에서 StarKist 파우치를 만드는 공장인데, 그 공장을 갖고 있지 않다.
 * 건물 두 동과 창고 한 동과 기계를 네 계약으로 빌리고 그 안의 설비만 자기 장부에 둔다.
 *
 * ⚠ **「공장을 소유한다」 금지** — 건물 둘과 기계는 임차다. 「토지는 갖고 있다」와 갈라 쓴다.
 * ⚠ **「StarKist 파우치는 사모아에서 나온다」 금지** — 2026년 1분기 과야킬 8.532 t 대 사모아 2.662 t 이다.
 * ⚠ **「새우도 만든다」 금지** — 업종코드 C1020.01 의 문언이 새우일 뿐이고, 어느 원문도 새우 생산을
 *    적지 않는다. 같은 등록부에서 NIRSA 는 도매업, 살리카·테코페스카는 원양어업으로 올라 있다.
 * ⚠ **「매출의 85 %가 미국으로 간다」 금지** — 85,40 %는 **StarKist Co. 라는 상대방** 비중이고
 *    지역 북미 비중(2019년 85,9 %)은 분모가 다른 별개의 수다.
 * ⚠ **「동원산업이 원어를 대 준다」를 전량으로 쓰지 않는다** — 2019년 매입 12.392.025 는
 *    매출원가 93.517.783 의 13,25 %다.
 * ⚠ **「미국 법원이 이 공장을 다뤘다」 금지** — 담합 사건의 피고는 StarKist Co. 와 동원산업이고
 *    이 법인 이름은 공개 기록에 없다.
 * ⚠ **「선단이 없어서 원어를 못 구한다」 금지** — 배가 없는 것과 원어 조달은 다른 문장이다.
 * ⚠ **「2024년 매출이 줄어 위축됐다」 단정 금지** — 2020~2023 이 비어 있어 추세를 못 그린다.
 * ⚠ 회사 자칭 수치(하루 180 t · 냉동 5.300 t)를 감사받은 값 옆에 나란히 쓰지 않는다.
 * ⚠ 사내 자료는 쓰지 않았다. 전부 공시·당국 문서·등기·세관 신고·공개 매체다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

/** 숫자 칸만 골라 쓴다 — 승인번호·주소·날짜는 문자열이다. */
function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`galapesca stats.${key} 가 숫자가 아니다`);
  return v;
}

export const galapescaMeta = data._meta;
export const galapescaCard = data.card;
export const galapescaStats = data.stats;
export const galapescaSourceNotes = data.sourcenotes;

/**
 * 빌린 것 네 건과 그 값. **건물 둘의 합보다 기계 한 건이 크다.**
 *
 * ⚠ 이 합계는 2019년 연 임차료다. 2018년 1월에 시작한 세 계약은 5년이라 2022년 말에
 *    끝났고 그 뒤 계약의 임차료·기간은 공개된 제출본에 없다.
 */
export function leases(): {
  계약: { 임대인: string; 빌린것: string; 연임차료_USD: number }[];
  합계_USD: number;
  건물합_USD: number;
  기계_USD: number;
} {
  const 계약 = [
    { 임대인: 'IDAMESA', 빌린것: '공장 + 폐수처리장', 연임차료_USD: n('임차료_IDAMESA_USD') },
    { 임대인: 'INCOPECA', 빌린것: '참치 가공공장', 연임차료_USD: n('임차료_INCOPECA_USD') },
    { 임대인: 'EMPESEC', 빌린것: '기계·설비', 연임차료_USD: n('임차료_EMPESEC_USD') },
    { 임대인: 'INMOINVESTMENT', 빌린것: '창고 1동', 연임차료_USD: n('임차료_INMOINVESTMENT_USD') },
  ];
  return {
    계약,
    합계_USD: n('임차료_합계_2019_USD'),
    건물합_USD: n('임차_건물합_USD'),
    기계_USD: n('임차료_EMPESEC_USD'),
  };
}

/**
 * 빌린 껍데기와 자기 설비 — 2018년 말 유형자산 순장부 대 2019년 초 사용권자산.
 *
 * ⚠ 두 값의 시점이 하루 차이(2018-12-31 · 2019-01-01)로 맞닿아 있어 나란히 놓을 수 있다.
 * ⚠ 「건물·설비·개량」이 한 열로 묶여 있어 임차공장 개량분은 갈리지 않는다.
 */
export function ownedVsLeased(): {
  자기유형자산_USD: number; 사용권자산_USD: number; 배: number;
  토지_USD: number; 사용권자산_기말_USD: number; 단서: string;
} {
  return {
    자기유형자산_USD: n('자기유형자산_순장부_2018말_USD'),
    사용권자산_USD: n('사용권자산_2019초_USD'),
    배: n('자기대임차_배'),
    토지_USD: n('자기유형자산_토지_USD'),
    사용권자산_기말_USD: n('사용권자산_2019말_USD'),
    단서: '빌린 것은 건물과 기계 일부이고 라인을 채운 설비는 회사 장부에 있다',
  };
}

/**
 * 동원산업 공시가 적는 이 공장의 생산 실적 (t).
 *
 * ⚠ 캔 생산능력 연 36.000 t(가동일수 240일 → 하루 150 t)은 모회사 공시의 **능력**이고
 *    아래는 **실적**이다. 회사 자칭 하루 180 t 과 같은 줄에 놓지 않는다.
 */
export function production(): {
  연도별: { 연도: number; 파우치_t: number; 캔_t: number; 배: number }[];
  능력_연_t: number; 능력_일_t: number;
} {
  const 연도별 = [2023, 2024, 2025].map((y) => {
    const p = n(`파우치_${y}_t`);
    const c = n(`캔_${y}_t`);
    return { 연도: y, 파우치_t: p, 캔_t: c, 배: Math.round((p / c) * 10) / 10 };
  });
  return { 연도별, 능력_연_t: n('캔생산능력_연_t'), 능력_일_t: n('캔생산능력_일_t') };
}
