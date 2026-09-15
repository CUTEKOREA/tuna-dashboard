import raw from '@/public/data/companies/cosi_v1.json';

/**
 * Chicken of the Sea(Tri-Union Seafoods, LLC) 기업 해부 인테이크 (참치 기업 해부 ⅩⅬⅣ, 2026-09).
 *
 * 미국 참치 담합에서 셋 가운데 **유일하게 기소되지 않은** 회사다. 먼저 자백하고 법무부의
 * 조건부 사면을 받아 형사 벌금이 0이었고, 민사에서는 트랙마다 따로 냈다.
 *
 * ⚠ **「세 회사가 모두 기소됐다」 금지** — 법무부가 기소한 법인은 둘, 개인은 넷이고
 *    그 명단에 이 회사와 그 임직원은 없다. 민사에서 셋이 합의금을 낸 것과 다른 사실이다.
 * ⚠ **「사면이라 아무것도 물지 않았다」 금지** — 형사만 면했다. 집단 세 트랙 3.570만 달러와
 *    워싱턴주 동의명령 50만 달러는 냈고, 개별 합의는 금액이 공개되지 않아 총액을 정할 수 없다.
 * ⚠ **합의금 2.000만과 1.620만을 섞어 쓰지 않는다** — 앞은 합의서가 정한 상한(합의금 1.500만 +
 *    관리비 최대 500만)이고 뒤는 총 합의이익에 산입된 실현액이다.
 * ⚠ **「미국 공장에서 만든다」 금지** — 라이언스는 프리쿡 로인을 받아 캔에 넣는 곳이고,
 *    브랜드 물량의 상당 부분은 완제품 수입이다. 어느 쪽이 얼마인지는 공개 자료로 갈리지 않는다.
 * ⚠ **「Product of Thailand」로 브랜드 전체를 묶지 않는다** — 기름캔은 가나, 클럽캔은 폴란드
 *    충전에 세관 원산지 판정은 가나(NY N341162)다.
 * ⚠ **14,6 %와 80 %를 한 문장에 넣지 않는다** — 분모가 상온 수산물 전체와 포장참치로 다르다.
 *    앞 편(StarKist)이 쓴 「COSI 9,1 %」는 분모·방법론이 불명이라 재인용하지 않는다.
 * ⚠ **「관세 때문에 공장이 문을 닫았다」 금지** — 주 5일에서 주 4일로 줄었다는 것이 회사 발언이다.
 * ⚠ **2025년 2월 회수를 「Chicken of the Sea 회수」로 적지 않는다** — 그 브랜드는 목록에 없었다.
 *    같은 주가 받은 10만 달러도 이 회사가 아니라 Bumble Bee 전 최고경영자에게서 나왔다.
 * ⚠ 나라 단위 수입통계를 이 브랜드의 물량으로 읽지 않는다 — 세번 1604.14 는 로인과 완제품을
 *    한 바스켓에 담는다.
 * ⚠ 사내 자료는 쓰지 않았다. 전부 법원 명령·공시·당국 문서·세관 판정·공개 매체다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

/** 숫자 칸만 골라 쓴다 — 주소·판정번호·날짜는 문자열이다. */
function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`cosi stats.${key} 가 숫자가 아니다`);
  return v;
}

export const cosiMeta = data._meta;
export const cosiCard = data.card;
export const cosiStats = data.stats;
export const cosiSourceNotes = data.sourcenotes;

/**
 * 형사에서 0이었던 값이 민사에서 트랙마다 붙었다.
 *
 * ⚠ 합계는 **집단 세 트랙만**이다. 워싱턴주 동의명령 50만은 이 합에 없고,
 *    월마트·크로거 등 개별 합의는 금액이 공개되지 않아 총액을 정할 수 없다.
 */
export function settlements(): {
  트랙: { 이름: string; 금액_USD: number }[];
  합계_USD: number;
  형사벌금_USD: number;
  형사_StarKist_USD: number;
  형사_BumbleBee_USD: number;
  주정부_USD: number;
  모회사추가충당_USD: number;
  전문가추정_USD: number;
} {
  const 트랙 = [
    { 이름: '최종소비자', 금액_USD: n('합의_최종소비자_USD') },
    { 이름: '직접구매자', 금액_USD: n('합의_직접구매자_USD') },
    { 이름: '상업조리 구매자', 금액_USD: n('합의_상업조리_USD') },
  ];
  return {
    트랙,
    합계_USD: n('합의_세트랙합계_USD'),
    형사벌금_USD: n('형사벌금_COSI_USD'),
    형사_StarKist_USD: n('형사벌금_StarKist_USD'),
    형사_BumbleBee_USD: n('형사벌금_BumbleBee_USD'),
    주정부_USD: n('주정부_동의명령_USD'),
    모회사추가충당_USD: n('모회사_추가충당_2019_2Q_USD'),
    전문가추정_USD: n('전문가추정_과징액_USD'),
  };
}

/**
 * 모회사 연차보고서가 적는 미국 점유율 세 해.
 *
 * ⚠ 분모는 참치가 아니라 **미국 상온 수산물 시장 전체**다. 제9연방항소법원이 적은
 *    「세 회사가 포장참치의 80 % 초과」와 같은 줄에 놓으면 독자가 셋 중 하나를 잘못 읽는다.
 */
export function share(): {
  연도별: { 연도: number; pct: number; 기준: string }[];
  분모: string;
  포장참치_3사_pct: number;
} {
  return {
    연도별: [
      { 연도: 2023, pct: n('점유율_2023_pct'), 기준: '모회사 보고서가 적은 2023년 값' },
      { 연도: 2024, pct: n('점유율_2024_pct'), 기준: String(data.stats['점유율_2024_기준기간']) },
      { 연도: 2025, pct: n('점유율_2025_pct'), 기준: String(data.stats['점유율_2025_기준기간']) },
    ],
    분모: String(data.stats['점유율_분모']),
    포장참치_3사_pct: n('3사합계_포장참치_pct'),
  };
}

/**
 * 모회사 재무제표 주석의 미국 매출 — 고객 소재지 기준.
 *
 * ⚠ 발표자료의 「미국·캐나다」는 지역 기준이라 정의가 다르다. 두 계열을 잇지 않는다.
 * ⚠ 이것은 그룹의 미국 매출이고 **이 브랜드의 매출이 아니다.** 브랜드 단위 손익은
 *    어느 공시에도 없다.
 */
export function parentUs(): {
  연도별: { 연도: number; 천바트: number; 비중_pct: number }[];
  감소_pct: number;
  분기_2026_1Q_천바트: number;
  그룹공장분_pct_pt: number;
  그룹밖_pct_pt: number;
} {
  return {
    연도별: [
      { 연도: 2021, 천바트: n('미국매출_2021_천바트'), 비중_pct: n('미국매출_2021_비중_pct') },
      { 연도: 2025, 천바트: n('미국매출_2025_천바트'), 비중_pct: n('미국매출_2025_비중_pct') },
    ],
    감소_pct: n('미국매출_4년감소_pct'),
    분기_2026_1Q_천바트: n('미국매출_2026_1Q_천바트'),
    그룹공장분_pct_pt: n('미국매출_그룹공장분_pct_pt'),
    그룹밖_pct_pt: n('미국매출_그룹밖_pct_pt'),
  };
}
