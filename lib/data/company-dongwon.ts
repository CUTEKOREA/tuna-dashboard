import raw from '@/public/data/companies/dongwon_v1.json';

/**
 * 동원산업㈜ 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅡ, 2026-09).
 *
 * 1969년 설립·1989년 상장한 원양어업 회사이고, 2022-11-01 동원엔터프라이즈 흡수합병으로
 * 공정거래법상 지주회사가 됐다. 여기 수치는 전부 **제57기 사업보고서(2026-03-18 제출)** 원문이다.
 *
 * ⚠ **「참치가 연결 매출의 3.54%」로 쓰지 마라.** 3.54%는 수산사업부문(= 참치 등 수산물 **어획**)의
 *   외부수익 비중이다. 참치캔은 식품가공유통부문 안에 있어 따로 세어지지 않고,
 *   다섯 개 보고부문 어느 이름에도 「참치」가 없다. 게다가 부문간수익 244,801백만원을 뺀 뒤의 값이다.
 * ⚠ **「순수 지주회사」로 쓰지 마라.** 어획·가공·물류를 직접 영위하는 **사업형 지주회사**다.
 *   별도 매출 1,106,250백만원, 선단 35척, 연간 약 20만톤이 그 「직접」의 크기다.
 * ⚠ **주식교환 2,246억을 현금 지출로 쓰지 마라.** 연결현금흐름표 주석이 「현금 유출입이 없는 거래」로
 *   명시한다. 2025년 별도에서 실제로 나간 현금은 배당 678.6억·유형자산 584.7억·이자 291.9억이다.
 * ⚠ **「임대매출 등이 어획보다 크다」로 쓰지 마라.** 그 칸 325,387백만원에 자회사 배당수익
 *   93,765,071천원이 들어 있다. 빼면 231,622백만원으로 어획물 245,839백만원보다 작다.
 * ⚠ **동원수산㈜를 계열로 넣지 마라.** RFMO 명부의 `DONGWON FISHERIES`(마포구)는 다른 회사이고
 *   원양수출표에 2.47%로 따로 적힌다.
 * ⚠ **파우치에 생산능력 값을 붙이지 마라.** 그 행에는 능력 칸이 없다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; corp_code: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  segments: { 부문: string; 매출액: number; 부문간: number; 외부수익: number; 영업이익: number; 상각: number }[];
  consol: Record<string, number>;
  region: { 지역: string; 당기: number; 전기: number; 비유동자산: number }[];
  standalone: { 유형: string; 내수: number; 수출: number; 합계: number; 제56기: number; 제55기: number }[];
  standalone_total: Record<string, number>;
  fleet: Record<string, number | string>[];
  fleet_registry: Record<string, number>;
  catch: Record<string, number | string>;
  exportshare: { 회사: string; 천USD: number; 비율: number }[];
  export_total: number;
  capital: { 시점: string; 사건: string; 증감: number; 주식수: number }[];
  swap: Record<string, number | string>;
  merger2022: Record<string, number | string>;
  ownership: { 주주: string; 기초: number; 기말: number }[];
  ownership_total: Record<string, number>;
  guarantee: { 대상: string; 통화: string; 금액: number; 은행: string }[];
  credit: Record<string, number>;
  production: { 공장: string; 품목: string; 능력: number | null; y2025: number; y2024: number; y2023: number }[];
  rawprice: Record<string, string | number>[];
  priceladder: { 제품: string; 채널: string; 규격g: number; 단위: string; 가격: number; 캔당: number; ['원per kg']: number; 어육: number | null }[];
  ftc: { 의결일: string; 사건: string; 피심인: string; 처분: string; 과징금: number }[];
  strategy: { 사안: string; 말: string; 돈: string; 판정: string }[];
  peers: { 회사: string; 집행억: number; 어디: string; 참치: string }[];
  cashflow: Record<string, number>;
};

export const dongwonMeta = data._meta;
export const dongwonCard = data.card;
export const dongwonStats = data.stats;
export const dongwonSegments = data.segments;
export const dongwonExportShare = data.exportshare;
export const dongwonProduction = data.production;
export const dongwonPriceLadder = data.priceladder;
export const dongwonStrategy = data.strategy;
export const dongwonPeers = data.peers;
export const dongwonFtc = data.ftc;

/** 어획부문 외부수익이 연결에서 차지하는 몫(%). 「참치 비중」이 아니다. */
export function catchSharePct(): number {
  return dongwonStats.어획_외부수익_비중;
}

/** 원양 수출실적 1위와 2위의 격차(%p). 분모는 협회 집계 387,000천$. */
export function exportLeadGapPct(): number {
  const [first, second] = data.exportshare;
  return Number((first.비율 - second.비율).toFixed(2));
}

/** 특수관계자 지급보증 가운데 달러 보증에서 StarKist 한 건이 차지하는 몫(%). */
export function starkistGuaranteeSharePct(): number {
  const usd = data.guarantee.filter((g) => g.통화 === 'USD');
  const total = usd.reduce((s, g) => s + g.금액, 0);
  const sk = usd.find((g) => g.대상 === 'StarKist Co.')?.금액 ?? 0;
  return Number(((sk / total) * 100).toFixed(2));
}

/** 「말」만 있고 「돈」이 따라가지 않은 전략 축의 수. */
export function strategyGapAxes(): number {
  return data.strategy.filter((s) => s.판정 !== '집행됨').length;
}

export const dongwonStrategyAxes = data.strategy.length;

/**
 * 2025년 별도에서 실제로 나간 현금(억원). 주식교환 2,246억은 여기 없다 —
 * 공시가 「현금 유출입이 없는 거래」로 적기 때문이다.
 */
export function cashOutBillionKrw(): number {
  return Math.round(data.cashflow.현금유출_중간배당 / 1e8);
}

/** 경쟁사가 2024~2026에 집행한 돈 가운데 참치와 무관한 몫(억원). */
export function peerNonTunaBillionKrw(): number {
  return data.peers
    .filter((p) => p.참치 === '아님' || p.참치 === '미확인')
    .reduce((s, p) => s + p.집행억, 0);
}

export const dongwonSourceNotes = [
  '재무·부문·지역·선단·보증·담보·차입·배당·지배구조·StarKist 생산과 원어 단가는 동원산업㈜ 제57기 사업보고서(2026-03-18 제출) 원문이다.',
  '선박 등록은 WCPFC Record of Fishing Vessels·IATTC Regional Vessel Register 2026-08-17 수집분이다.',
  '인증은 ISSF ProActive Vessel Register 2026-08-20, Earth Island Institute Dolphin Safe 2026-05-30, MSC Sustainable Tuna Yearbook 2026이다.',
  '공정거래 처분은 법제처 결정문과 공정거래위원회 보도자료 원문이다.',
  '소매가는 동원몰 상품 상세와 이마트몰 값표의 단위가격 표시이고 조회일은 2026-09-06이다. 전부 순중량 기준이며 고형량은 확인되지 않았다.',
];
