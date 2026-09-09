/**
 * 참치 기업 해부 20편의 **관계 원장**.
 *
 * 회사와 회사 사이에 선을 긋는다. 20편에 적힌 관계만 넣는다 — 업계에서 아는 거래라도
 * 편에 근거가 없으면 긋지 않는다.
 *
 * ## 이 파일이 지키는 것
 *
 * 1. **굵기는 숫자가 있는 관계에만.** `confirmed: false` 인 행은 `strokeWeight()` 가
 *    고정폭을 돌려준다. 규칙을 주석에 적으면 다음 사람이 깬다 — 함수로 막는다.
 * 2. **방향을 지어내지 않는다.** Bumble Bee ↔ Sea Value 는 흔히 반대로 적히는데
 *    실제로는 **Bumble Bee 가 Sea Value 의 10%** 를 갖는다(ⅩⅦ 금칙).
 * 3. **끝난 관계와 살아 있는 관계를 가른다.** Unicord → Bumble Bee 는 파산으로 끝났고
 *    미쓰비시 → Thai Union 지분 확대는 **무산**됐다. `status` 로 구분한다.
 * 4. **간접 지분은 단계 수를 적는다.** FCF → Bumble Bee 는 지주 사슬 6단이다.
 * 5. **무역선은 통관 통계가 있는 축만.** FCF 거래는 선상·환적항 인도라
 *    한국→대만 수출이 통계에 0으로 찍힌다 — 그 축은 무역선으로 긋지 않는다.
 */

export type RelationKind =
  /** 지분 소유. */
  | 'equity'
  /** 원료·완제품 공급. */
  | 'supply'
  /** 같은 명부·인증서에 함께 있다. 거래 실적이 아니다. */
  | 'registry'
  /** 통관 통계로 확인되는 물량 흐름. */
  | 'trade'
  /** 금융 보증·대여. */
  | 'finance';

export type RelationStatus =
  /** 지금 유효하다. */
  | 'active'
  /** 과거에 있었고 지금은 끝났다. */
  | 'ended'
  /** 시도했으나 성립하지 않았다. */
  | 'failed';

export interface Relation {
  /** `COMPANY_CARDS` 의 key. 편 밖의 상대는 `external:` 접두. */
  from: string;
  to: string;
  kind: RelationKind;
  status: RelationStatus;
  /** 화면에 뜨는 한 줄. */
  label: string;
  /**
   * 굵기 계산에 쓰는 값. **숫자가 확정된 관계에만 넣는다.**
   * 지분율은 %, 물량은 톤, 금액은 원문 통화 단위 그대로.
   */
  value?: number;
  unit?: '%' | '톤' | '척' | 'USD천' | '억원';
  /** 근거가 확정 자료인가. false 면 굵기·크기 계산에서 제외된다. */
  confirmed: boolean;
  /** 어느 편 어느 필드인가. 빈 문자열 금지. */
  basis: string;
  /** 이 관계를 쓸 때 하면 안 되는 말. 호버 카드에 그대로 뜬다. */
  caution?: string;
}

/** 편 밖의 상대. 지도에 점으로 찍히지만 카드가 없다. */
export const EXTERNAL_NODES: Record<string, { label: string; country: string; lat: number; lng: number }> = {
  'external:silla': { label: '신라교역', country: '대한민국', lat: 37.51, lng: 127.02 },
  'external:panofi': { label: 'Panofi', country: '가나', lat: 5.62, lng: 0.02 },
  'external:mitsubishi': { label: '미쓰비시상사', country: '일본', lat: 35.68, lng: 139.76 },
  'external:unicord': { label: 'Unicord PCL', country: '태국', lat: 13.54, lng: 100.28 },
  'external:hagoromo': { label: 'はごろもフーズ', country: '일본', lat: 35.02, lng: 138.49 },
  'external:trimarine': { label: 'Tri Marine', country: '싱가포르', lat: 1.29, lng: 103.85 },
};

/**
 * 층 3 — 자본. 국경을 넘는 지분선.
 */
export const EQUITY_RELATIONS: Relation[] = [
  { from: 'fcf', to: 'bumblebee', kind: 'equity', status: 'active',
    label: '간접 100% · 지주 사슬 6단', value: 100, unit: '%', confirmed: true,
    basis: 'ⅩⅣ chain · Ⅳ group · Bumble Bee Foods LLC → Holding 1 → FCF Americas → Besford → Skymax → FCF',
    caution: '「FCF가 직접 인수했다」로 쓰지 마라. 매수인은 Tonos 세 법인이고 FCF는 보증인이었다' },
  { from: 'dongwon', to: 'starkist', kind: 'equity', status: 'active',
    label: '100% 자회사', value: 100, unit: '%', confirmed: true,
    basis: 'ⅩⅠ _meta · ⅩⅡ · StarKist Samoa · Galapesca 연결 4법인' },
  { from: 'bolton', to: 'nauterra', kind: 'equity', status: 'active',
    label: '지분 40% · 이사회 10석 중 4석', value: 40, unit: '%', confirmed: true,
    basis: 'Ⅹ stats · Bolton 지분 40%',
    caution: '6:4를 경쟁당국이 적었다고 쓰지 마라. 결정문은 이사회 인원을 가렸다' },
  { from: 'bolton', to: 'external:trimarine', kind: 'equity', status: 'active',
    label: '2013·2019년 2단계 인수', confirmed: true,
    basis: 'Ⅵ 로더 주석 · 2019-07 참치 공급망 100%',
    caution: '대가는 비공개다. 당사자 보도자료가 「조건을 공개하지 않기로 합의」라 적는다' },
  { from: 'bolton', to: 'boltonfood', kind: 'equity', status: 'active',
    label: '이탈리아 식품 법인', confirmed: true,
    basis: 'Ⅵ profile · ⅩⅩ · 직접 연결자 Bolton Group S.r.l.',
    caution: '「그룹 €3.5십억이 식품 매출」로 쓰지 마라. 세제·화장품·접착제가 들어 있다' },
  { from: 'itochu', to: 'external:hagoromo', kind: 'equity', status: 'active',
    label: 'ATI 합작 — ITOCHU 47% · はごろも 33%', value: 47, unit: '%', confirmed: true,
    basis: 'Ⅴ ati · 인도네시아 파수루안 · 외국계 1사 20%' },
  { from: 'external:unicord', to: 'bumblebee', kind: 'equity', status: 'ended',
    label: '1989년 US$269M · 지분 98.51% → 파산', value: 98.51, unit: '%', confirmed: true,
    basis: 'ⅩⅦ stats · Uni Group Inc.',
    caution: '1989년에 산 것은 Unicord이고 지금 캔을 미국으로 보내는 것은 I.S.A. Value다. 같은 법인이 아니다' },
  { from: 'bumblebee', to: 'seavalue', kind: 'equity', status: 'active',
    label: 'Bumble Bee가 Sea Value 지분 10%', value: 10, unit: '%', confirmed: true,
    basis: 'ⅩⅦ 로더 금칙 · 「Bumble Bee owns a 10 percent share in Sea Value」',
    caution: '방향이 자주 뒤바뀐다. Sea Value가 Bumble Bee를 가진 것이 아니다' },
  { from: 'external:mitsubishi', to: 'thaiunion', kind: 'equity', status: 'failed',
    label: '지분 6.19% → 20% 확대 시도, 2025년 무산', value: 6.19, unit: '%', confirmed: true,
    basis: 'Ⅱ history · 2025-09-29 공개매수 응모 미달로 자동 취소',
    caution: '「미쓰비시가 인수했다」로 쓰지 마라. 지분은 6.19% 그대로다' },
  { from: 'jealsa', to: 'albacora', kind: 'equity', status: 'active',
    label: '부회장 법인이사석 — 지분율 미확인', confirmed: false,
    basis: 'Ⅸ albacora · ALONSO ESCURIS S.L. 2022-09~ · GLEIF는 NON_CONSOLIDATING',
    caution: '지분율은 어디에도 없다. 「지배지분은 아니다」까지만 말할 수 있다' },
  { from: 'centurypacific', to: 'centurypacific', kind: 'equity', status: 'active',
    label: '지주 직접명의 62.994% · 예탁 포함 65.5%', value: 65.5, unit: '%', confirmed: true,
    basis: 'ⅩⅨ 기준선 §2 · 2,320,120,781주 / 발행 3,542,258,595주',
    caution: '지주 63%로 쓰지 마라. 63%는 직접명의분 62.994%의 반올림이다' },
  { from: 'umios', to: 'umios', kind: 'equity', status: 'active',
    label: 'Kingfisher 지분 50.7%', value: 50.7, unit: '%', confirmed: true,
    basis: 'ⅩⅤ stats' },
];

/**
 * 층 4 — 공급. 누가 누구에게 대는가.
 */
export const SUPPLY_RELATIONS: Relation[] = [
  { from: 'external:silla', to: 'fcf', kind: 'supply', status: 'active',
    label: '매출 의존 46.3% (FY2024)', value: 46.3, unit: '%', confirmed: true,
    basis: 'Ⅳ sillaDependency · FY2019 42.5 → FY2024 46.3 → FY2025 39.8',
    caution: '회사가 고객 이름을 밝힌 것이 아니다. 「고객 A」를 FCF로 본 것은 선행 조사의 산정이다' },
  { from: 'fcf', to: 'bumblebee', kind: 'supply', status: 'active',
    label: '알바코어 95~100% · 라이트미트 70~100%', value: 95, unit: '%', confirmed: true,
    basis: 'ⅩⅣ supply · FCF 계약선박 500척 · 공급자 교체에 6~12개월' },
  { from: 'seavalue', to: 'starkist', kind: 'supply', status: 'active',
    label: '누적 16,694,091 kg', value: 16694, unit: '톤', confirmed: true,
    basis: 'ⅩⅦ stats · I.S.A. Value 명의',
    caution: '「그 회사의 공장이 Bumble Bee 캔을 만든다」를 담은 문서는 하나도 없다' },
  { from: 'itochu', to: 'external:hagoromo', kind: 'supply', status: 'active',
    label: '연 62.08억엔 매입 — 전량 ITOCHU를 거친다', confirmed: true,
    basis: 'Ⅴ ati' },
  { from: 'sajo', to: 'itochu', kind: 'supply', status: 'active',
    label: 'MSC 인증 25척 중 11척 (44%)', value: 11, unit: '척', confirmed: true,
    basis: 'Ⅴ korea · siVessels · 사조 6 + 키리바시&사조 3 + 사조바누아투 2',
    caution: 'ITOCHU가 인증 보유자로서 신청·유지 비용을 진다. 지분 관계가 아니다' },
  { from: 'external:silla', to: 'external:panofi', kind: 'supply', status: 'active',
    label: '지분 45% · 선망 7척 전량 담보권', value: 45, unit: '%', confirmed: true,
    basis: 'Ⅶ panofi · 2003년 취득 · 장부가액 0' },
];

/**
 * 층 4 — 명부. 같은 등록부·인증서에 함께 있다.
 *
 * ⚠ **등재는 거래 실적이 아니다.** 등재가 사라진 것과 거래가 사라진 것은 다른 문장이다(Ⅶ 금칙).
 */
export const REGISTRY_RELATIONS: Relation[] = [
  { from: 'external:silla', to: 'bolton', kind: 'registry', status: 'active',
    label: '공급선 명단 5척 (2025년판)', value: 5, unit: '척', confirmed: true,
    basis: 'ⅩⅩ stats · 2021년 6척 → 2023년 0척 → 2024년 2척 → 2025년 5척',
    caution: '명단은 척수만 적는다. 2025년판 분모는 964척이고 한국 국적선은 23척이다' },
  { from: 'dongwon', to: 'bolton', kind: 'registry', status: 'active',
    label: '공급선 명단 10척 (2025년판)', value: 10, unit: '척', confirmed: true,
    basis: 'ⅩⅩ 05 조달노트 · RFV 소유자 칸 · 한국 국적선 중 최다',
    caution: '이 명단에서 한국 국적선이 가장 많은 곳은 신라교역이 아니라 동원이다' },
  { from: 'sajo', to: 'bolton', kind: 'registry', status: 'active',
    label: '공급선 명단 7척 (2025년판)', value: 7, unit: '척', confirmed: true,
    basis: 'ⅩⅩ 05 조달노트 · 선복 777~1,105 GT' },
  { from: 'jealsa', to: 'albacora', kind: 'registry', status: 'active',
    label: 'MSC 집단 인증서 한 장 아래 함께 등재', confirmed: true,
    basis: 'Ⅸ albacora · AGAC 집단 인증 · Bolton도 같은 증서' },
  { from: 'bolton', to: 'albacora', kind: 'registry', status: 'active',
    label: 'Albacora 등록부 12행 중 2척이 Bolton 계열 소유', value: 2, unit: '척', confirmed: true,
    basis: 'Ⅲ fleet · ROSITA C · AURORA B → Atunera Dularra SL → Grupo Conservas Garavilla' },
  { from: 'jais', to: 'fcf', kind: 'registry', status: 'ended',
    label: '인증 명부 판매권자 — 2023-11 이후 0행', confirmed: true,
    basis: 'Ⅶ fos · 2018-10 43행 → 2019-06 FCF 병기 → 2023-11 이후 0행 네 판 연속',
    caution: '등재가 사라진 것이 거래가 사라진 것과 같다고 읽으면 안 된다. 기관이 삭제 사유를 적지 않았다' },
  { from: 'jais', to: 'external:panofi', kind: 'registry', status: 'ended',
    label: '가나 블록 병기 (2018~2020) → 2022-12 Panofi 단독', confirmed: true,
    basis: 'Ⅶ axes · AFT76·AFT94·AFT95·AFT96·CRV15가 ICCAT 등록부와 일치' },
];

/**
 * 층 4 — 무역. **통관 통계가 있는 축만.**
 *
 * ⚠ FCF 거래는 선상·환적항 인도라 매수인 국적과 화물 목적지가 분리된다 —
 * 한국→대만 참치 수출은 통계에 0으로 찍힌다. 그래서 그 축은 여기 없다(Ⅳ 금칙).
 */
export const TRADE_RELATIONS: Relation[] = [
  { from: 'external:silla', to: 'thaiunion', kind: 'trade', status: 'active',
    label: '한국 → 태국 86,514톤 (2025년)', value: 86514, unit: '톤', confirmed: true,
    basis: 'Ⅱ koreaExport · 2024년 107,151톤에서 감소',
    caution: '이 값은 「태국」이라는 시장의 몫이지 이 회사 한 곳의 매입이 아니다' },
  { from: 'external:silla', to: 'frinsa', kind: 'trade', status: 'active',
    label: '한국 → 스페인 1,954톤 (2025년)', value: 1954, unit: '톤', confirmed: true,
    basis: 'Ⅰ koreaExport · 2024년 5,509톤에서 감소' },
  { from: 'external:silla', to: 'jais', kind: 'trade', status: 'active',
    label: '한국 → 이탈리아 2,548톤 · 금액 1위', value: 2548, unit: '톤', confirmed: true,
    basis: 'Ⅶ korea · ⅩⅩ · HS 0304.87 · 금액 36.88% 1위 / 중량 31.09% 2위',
    caution: '금액으로 1위이고 중량으로는 2위다. 축을 붙이지 않으면 거짓이 된다' },
  { from: 'external:silla', to: 'itochu', kind: 'trade', status: 'active',
    label: '한국 → 일본 9,901톤 · 단가 $5.89/kg', value: 9901, unit: '톤', confirmed: true,
    basis: 'Ⅴ korea · 세계평균 $4.17의 1.41배 · 수입국 5위' },
  { from: 'external:silla', to: 'centurypacific', kind: 'trade', status: 'active',
    label: '한국 → 필리핀 몫 1.62% (2025년)', value: 1.62, unit: '%', confirmed: true,
    basis: 'ⅩⅨ stats · 2022년 9.70%에서 3년 만에 6분의 1',
    caution: '분모는 한국의 전세계 수출 중량이다. 이 회사의 매입이 아니라 나라의 몫이다' },
];

/**
 * 층 4 — 금융. 보증과 대여.
 */
export const FINANCE_RELATIONS: Relation[] = [
  { from: 'dongwon', to: 'starkist', kind: 'finance', status: 'active',
    label: '지급보증 USD 169,200천', value: 169200, unit: 'USD천', confirmed: true,
    basis: 'ⅩⅡ guarantee · 하나 뉴욕·SMBC 뉴욕·신한 뉴욕 · 달러 보증의 98.37%' },
  { from: 'external:silla', to: 'external:panofi', kind: 'finance', status: 'active',
    label: '대여금 196.8억원 · 지급보증 USD 31,500천', value: 19680, unit: '억원', confirmed: true,
    basis: 'Ⅶ panofi · 수취채권 949.9억원 · 이자수익 70.1억원',
    caution: 'Panofi는 자본잠식이 235억원에서 407억원으로 커졌다' },
];

/** 층별 관계 묶음. */
export const RELATIONS_BY_LAYER = {
  capital: EQUITY_RELATIONS,
  ours: [...SUPPLY_RELATIONS, ...REGISTRY_RELATIONS, ...TRADE_RELATIONS, ...FINANCE_RELATIONS],
} as const;

export const ALL_RELATIONS: Relation[] = [
  ...EQUITY_RELATIONS,
  ...SUPPLY_RELATIONS,
  ...REGISTRY_RELATIONS,
  ...TRADE_RELATIONS,
  ...FINANCE_RELATIONS,
];

/**
 * 선 굵기.
 *
 * **`confirmed: false` 는 값이 있어도 고정폭이다.** 근거가 확정되지 않은 관계를
 * 굵게 그리면 없는 정밀도를 만든다. 규칙을 함수로 박아 다음 사람이 못 깨게 한다.
 */
export function strokeWeight(r: Relation): number {
  const BASE = 0.35;
  if (!r.confirmed || typeof r.value !== 'number') return BASE;
  if (r.unit === '%') return BASE + (Math.min(r.value, 100) / 100) * 1.15;
  if (r.unit === '척') return BASE + Math.min(r.value / 12, 1) * 1.15;
  if (r.unit === '톤') return BASE + Math.min(r.value / 90000, 1) * 1.15;
  return BASE + 0.4;
}

/** 확정된 관계만 실선이다. 미확인은 점선으로 간다. */
export function isSolid(r: Relation): boolean {
  return r.confirmed && r.status === 'active';
}
