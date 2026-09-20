import raw from '@/public/data/companies/kingfisher_v1.json';

/**
 * Kingfisher Holdings(SEAPAC · KF Foods) 기업 해부 인테이크 (참치 기업 해부 ⅩⅬⅤ, 2026-09).
 *
 * 태국 참치 가공사로 불리는 그룹인데 지주회사 의결권 **50,70 %** 를 일본 상장사 Umios 가 쥔다.
 * 공장 하나는 소매협회가 **감사받은 생산범위 전체**가 사람 아닌 것이 먹는 물건이다 —
 * 방푸 SP-1 증서(BRCFD 692930)의 범위가 통째로 for pet food 이고 제외 항목 칸이 「없음」이다.
 *
 * ⚠ **동명이인 셋을 섞지 않는다** — 영국 Kingfisher plc(주택용품)·영국 Kingfisher Foods·
 *    국제 참치 지속가능 단체 명부의 「Kingfisher Foods」는 이 회사가 아니다. 지분도 거래도 없다.
 * ⚠ **Nautilus 를 이 회사 브랜드로 적지 않는다** — 태국 Pataya Food Industries 의 브랜드다.
 * ⚠ **「임시직 3.287명 = 이주노동자」 금지** — 공시는 「임시」라고만 적는다. 그 칸을 다른 말로
 *    옮기면 문서에 없는 뜻을 넣는 것이 된다.
 * ⚠ **2015년 통신사 보도를 「강제노동이 확인됐다」로 적지 않는다** — 적힌 것은 세 자리다.
 *    트럭 한 대 · 냉동창고 회사의 납품 확인 · 월 약 100 t 미국 선적. 공장 강제노동·선박 소유·
 *    당국 처분은 그 보도에 없다.
 * ⚠ **「사뭇사콘 회사」로 뭉뚱그리지 않는다** — 네 법인 중 셋은 방콕 야나와 등기이고
 *    **KF Foods 만** 등기 주소가 사뭇사콘 나디의 공장 자리다. 방푸·송클라는 공장 주소다.
 * ⚠ **지주회사 순이익률 44,7 %를 가공 수익성으로 읽지 않는다** — 임대료·배당·송클라
 *    영업이익의 구성을 공개 요약이 갈라 주지 않는다.
 * ⚠ **「인증이 취소됐다」 금지** — 만료(갱신하지 않음)·정지(자격을 멈춤)·취소(지움)는 다르다.
 *    이 그룹의 명부에 취소는 없다. 어분 인증은 정지 뒤 **재개**다.
 * ⚠ **나라 단위 수출통계를 이 회사 물량으로 읽지 않는다** — 세관 통계에 회사 이름 칸이 없고
 *    이 그룹의 펫푸드·어분·냉동 새우와 오징어는 이 세번으로 나가지도 않는다.
 * ⚠ **「일본 회사가 100 % 갖고 있다」 금지** — 지주회사는 의결권 50,70 %, 사업회사 둘이
 *    100,00 % 전부 간접이다.
 * ⚠ **「소매협회 인증이 둘 다 만료」·「현행 증서가 없다」 금지** — KF Foods 증서 0113095 는
 *    **2027-05-20 까지 유효**하고 등급 A+ 다. 지난 것은 SEAPAC 두 공장의 공개본이다.
 * ⚠ **「공개 기록에 가장 많이 남는 물건」 금지** — 세지 않은 최상급이다. **감사받은 생산범위**로
 *    말한다(방푸 SP-1 증서 BRCFD 692930 의 범위가 통째로 for pet food, 제외 항목 None).
 * ⚠ **「Pataya 지분을 샀다」 금지** — 2026-09-14 발표는 **취득 결정**이다(원문 「取得することを決定」).
 *    대금과 완료일은 공개되지 않았다.
 * ⚠ **「순수 지주회사」 금지** — 송클라에 유럽연합 승인번호 1035 를 가진 자체 공장이 있고,
 *    태국 등기 업종은 냉동수산물 제조다.
 * ⚠ **「지분이 어긋난다」 금지** — 일본 공시의 間接所有割合은 자회사가 쥔 의결권을 **액면 가산**한
 *    값이라 50,70 %와 100 % 간접이 양립한다. 어긋난 게 아니라 주주명부가 비어 있는 것이다.
 * ⚠ **「등록법인 매출 14위」 금지** — 전수 순위가 아니라 컨설팅사가 고른 **주요 15개사 표의
 *    14번째 줄**이다(2번째 줄 CPF 는 매출 칸이 N/A).
 * ⚠ 참치 9사 합은 **112.335** 백만 바트이고 이 회사 몫은 **3,1 %** 다. 115.335·3,0 % 는 틀렸다.
 * ⚠ 사내 자료는 쓰지 않았다. 전부 일본 유가증권보고서·태국 상업등기·당국 명부·인증기관 증서·
 *    세관 통계와 공개 매체다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

/** 숫자 칸만 골라 쓴다 — 등기번호·증서번호·날짜는 문자열이다. */
function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`kingfisher stats.${key} 가 숫자가 아니다`);
  return v;
}

export const kingfisherMeta = data._meta;
export const kingfisherCard = data.card;
export const kingfisherStats = data.stats;
export const kingfisherSourceNotes = data.sourcenotes;

/**
 * 도쿄가 쥔 몫.
 *
 * ⚠ 지주회사 50,70 %와 사업회사 100 % 간접은 **어긋나지 않는다** — 일본 공시의 간접 지분은
 *    자회사가 쥔 의결권을 액면 그대로 더해 적는 값이고, 같은 표에서 지주회사 자신이
 *    50,70(7,47)로 적히는 것이 그 증거다. 빈 자리는 태국 주주명부이고 그것은 유료다.
 */
export function voting(): {
  지주회사_pct: number;
  간접분_pct: number;
  사업회사_pct: number;
  법인_수: number;
  방콕등기_수: number;
  등기본점: string;
} {
  return {
    지주회사_pct: n('모회사_의결권_pct'),
    간접분_pct: n('모회사_간접분_pct'),
    사업회사_pct: n('사업회사_간접지분_pct'),
    법인_수: n('법인_수'),
    방콕등기_수: n('방콕등기_법인_수'),
    등기본점: String(data.stats['등기본점']),
  };
}

/**
 * 같은 부지에 법인 셋이 겹치는 나디 사업장 — 일본 유가증권보고서 주요 설비 표(2026-03-31).
 *
 * ⚠ 방푸·송클라·어분 공장은 이 표에 **행이 없다.** 금액이 섞인 것이 아니라 실리지 않았다.
 * ⚠ 임시직 칸은 공시가 「임시」라고만 적는다 — 다른 말로 옮기지 않는다.
 */
export function plants(): {
  거점: { 법인: string; 장부가_백만엔: number; 정사원: number; 임시직: number | null }[];
  토지_m2: number;
  정사원_두공장: number;
  임시직_두공장: number;
  기준일: string;
} {
  return {
    거점: [
      { 법인: 'SEAPAC 나디', 장부가_백만엔: n('장부가_SEAPAC_나디_백만엔'), 정사원: n('정사원_SEAPAC_명'), 임시직: n('임시직_SEAPAC_명') },
      { 법인: 'KF Foods 나디', 장부가_백만엔: n('장부가_KFFoods_나디_백만엔'), 정사원: n('정사원_KFFoods_명'), 임시직: n('임시직_KFFoods_명') },
      { 법인: 'Kingfisher Holdings 나디(대여)', 장부가_백만엔: n('장부가_Holdings_나디_백만엔'), 정사원: n('정사원_Holdings_명'), 임시직: null },
    ],
    토지_m2: n('토지_Holdings_나디_m2'),
    정사원_두공장: n('정사원_두공장_명'),
    임시직_두공장: n('임시직_두공장_명'),
    기준일: String(data.stats['설비표_기준일']),
  };
}

/**
 * 소매협회 증서 셋 — 살아 있는 것과 공개본이 지난 것.
 *
 * ⚠ **KF Foods 0113095 는 2027-05-20 까지 유효하다(A+).** 「둘 다 만료」·「현행 증서가 없다」는
 *    틀린 문장이다. 지난 것은 SEAPAC 두 공장의 **공개본**이고, 갱신본이 회사 페이지에 걸려
 *    있지 않다는 것과 인증이 사라졌다는 것은 같지 않다.
 * ⚠ 방푸 증서의 감사받은 생산범위는 통째로 for pet food 이고 제외 항목 칸이 「없음」이다 —
 *    최상급으로 부풀리지 말고 이 범위 그대로 말한다.
 */
export function certs(): { 공장: string; 증서: string; 만료: string; 등급: string; 살아있나: boolean }[] {
  return [
    { 공장: 'KF Foods 나디', 증서: String(data.stats['BRC_KFFoods_증서']), 만료: String(data.stats['BRC_KFFoods_만료']), 등급: String(data.stats['BRC_KFFoods_등급']), 살아있나: true },
    { 공장: 'SEAPAC 방푸 SP-1', 증서: String(data.stats['BRC_방푸_증서']), 만료: String(data.stats['BRC_방푸_만료']), 등급: String(data.stats['BRC_방푸_등급']), 살아있나: false },
    { 공장: 'SEAPAC 나디 SP-2', 증서: String(data.stats['BRC_나디_증서']), 만료: String(data.stats['BRC_나디_만료']), 등급: String(data.stats['BRC_나디_등급']), 살아있나: false },
  ];
}
