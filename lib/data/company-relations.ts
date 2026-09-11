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
   * ⚠ 금액(`USD천`·`억원`)은 공통 축이 없어 **굵기에는 쓰지 않는다**(`strokeWeight` 참조).
   * ⚠ 누적치를 연간치와 같은 단위로 넣지 마라. 축이 다르면 값을 빼고 라벨로만 적는다.
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

/**
 * 편 밖의 상대. **아크의 끝점이 되고, 그 층에 걸린 것만 지도에 점으로 찍힌다.**
 *
 * ⚠ 좌표가 본사 핀과 겹치면 화면이 거짓말을 한다. 미쓰비시상사를 ニッスイ 본사와
 * 같은 점에 두면 「ニッスイ가 Thai Union 지분을 노렸다」로 읽힌다 — 실제로 그렇게 그려졌었다.
 * 편이 주소를 주지 않는 상대는 `basis` 에 **근사치임을 적고** 겹치지 않는 자리에 둔다.
 */
export const EXTERNAL_NODES: Record<
  string,
  { label: string; country: string; lat: number; lng: number; basis: string }
> = {
  'external:silla': { label: '신라교역', country: '대한민국', lat: 37.56, lng: 126.98,
    basis: '서울 중구 · 동원산업 본사(서초)와 겹치지 않게 시청 기준' },
  'external:panofi': { label: 'Panofi', country: '가나', lat: 5.62, lng: 0.02,
    basis: 'Ⅶ panofi · 테마(Tema)' },
  // 편이 주소를 주지 않는다. ニッスイ·極洋 본사 핀도 「도쿄」 한 단어라 셋이 한 점이 됐고,
  // 그 결과 Thai Union 으로 뻗는 지분선이 ニッスイ 핀에서 나가는 것처럼 보였다.
  'external:mitsubishi': { label: '미쓰비시상사', country: '일본', lat: 35.72, lng: 139.80,
    basis: 'Ⅱ history · 편에 주소가 없다. 도쿄 안에서 ニッスイ·極洋 핀과 겹치지 않게 띄운 자리이고 실제 본점 위치가 아니다' },
  'external:unicord': { label: 'Unicord PCL', country: '태국', lat: 13.75, lng: 100.52,
    basis: 'ⅩⅦ · 방콕 근사치 — 편에 주소가 없다. 사뭇사콘의 Sea Value 본사와 다른 법인이다' },
  'external:nfd': { label: 'National Fisheries Developments', country: '솔로몬제도', lat: -8.22, lng: 157.20,
    basis: 'ⅩⅩⅠ · WCPFC 등록부 소유자 칸 · 노로 기지' },
  'external:ati': { label: 'PT Aneka Tuna Indonesia', country: '인도네시아', lat: -7.65, lng: 112.91,
    basis: 'Ⅴ ati · 파수루안 · ITOCHU 47% + はごろも 33% + 외국계 1사 20%' },
  'external:cpgi': { label: 'Century Pacific Group, Inc.', country: '필리핀', lat: 14.55, lng: 121.03,
    basis: 'ⅩⅨ · 구 Century Canning Corporation · 비상장 지주' },
  'external:kingfisher': { label: 'Kingfisher Holdings Ltd', country: '태국', lat: 13.66, lng: 100.28,
    basis: 'ⅩⅤ · 사뭇사콘 · 영국의 동명 Kingfisher Foods 와 다른 회사다' },

  // 무역선의 끝점. **회사가 아니라 나라다.** 통관 통계를 회사 대 회사로 그리면 거짓이 된다.
  'external:kr-trade': { label: '대한민국 — 수출 통계', country: '대한민국', lat: 36.5, lng: 127.8,
    basis: '국가 중심 근사치 · 회사 노드가 아니다' },
  'external:th-trade': { label: '태국 — 수입 통계', country: '태국', lat: 15.2, lng: 101.0,
    basis: '국가 중심 근사치 · 회사 노드가 아니다' },
  'external:es-trade': { label: '스페인 — 수입 통계', country: '스페인', lat: 40.2, lng: -3.7,
    basis: '국가 중심 근사치 · 회사 노드가 아니다' },
  'external:it-trade': { label: '이탈리아 — 수입 통계', country: '이탈리아', lat: 42.6, lng: 12.6,
    basis: '국가 중심 근사치 · 회사 노드가 아니다' },
  'external:jp-trade': { label: '일본 — 수입 통계', country: '일본', lat: 36.2, lng: 138.3,
    basis: '국가 중심 근사치 · 회사 노드가 아니다' },
  'external:ph-trade': { label: '필리핀 — 수입 통계', country: '필리핀', lat: 12.5, lng: 122.0,
    basis: '국가 중심 근사치 · 회사 노드가 아니다' },
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
  { from: 'bolton', to: 'trimarine', kind: 'equity', status: 'active',
    label: '2013년 공동지배 49% → 2019년 잔여 51%', confirmed: true,
    basis: 'Ⅵ tables · 「Tri Marine 공동지배 49% EU 승인」 · 「Tri Marine 잔여 51% 취득」',
    caution: '대가는 비공개다. 당사자 보도자료가 「조건을 공개하지 않기로 합의」라 적는다' },
  { from: 'bolton', to: 'boltonfood', kind: 'equity', status: 'active',
    label: '이탈리아 식품 법인', confirmed: true,
    basis: 'Ⅵ profile · ⅩⅩ · 직접 연결자 Bolton Group S.r.l.',
    caution: '「그룹 €3.5십억이 식품 매출」로 쓰지 마라. 세제·화장품·접착제가 들어 있다' },
  // 47%·33% 는 **ATI 지분**이다. 둘은 ATI 의 공동출자자이고 서로의 지분이 아니다.
  // 이 두 줄을 itochu → はごろも 한 줄로 합치면 「ITOCHU 가 하고로모 47% 를 쥔다」가 된다.
  { from: 'itochu', to: 'external:ati', kind: 'equity', status: 'active',
    label: 'ATI 지분 47%', value: 47, unit: '%', confirmed: true,
    basis: 'Ⅴ ati · ITOCHU 47.0% + はごろもフーズ 33.0% + 외국계 1사 20.0% = 100%',
    caution: 'ITOCHU 가 하고로모 지분을 47% 쥔 것이 아니다. 둘 다 ATI 의 공동출자자다' },
  { from: 'hagoromo', to: 'external:ati', kind: 'equity', status: 'active',
    label: 'ATI 지분 33% · 議決権 33.0%', value: 33, unit: '%', confirmed: true,
    basis: 'Ⅴ ati · ⅩⅩⅨ · 하고로모 제97기 유가증권보고서 「持分法適用の関連会社」에 ATI 단 1사',
    caution: 'ITOCHU→하고로모 지분은 정책보유주식 1건이고 지분율이 편 어디에도 없다' },
  { from: 'external:unicord', to: 'bumblebee', kind: 'equity', status: 'ended',
    label: '1989년 US$269M 인수 → 파산', confirmed: true,
    basis: 'ⅩⅦ 연표 1989-09 · 매수 주체 Uni Group Inc. · **지분율은 편에 없다**',
    caution: '1989년에 산 것은 Unicord이고 지금 캔을 미국으로 보내는 것은 I.S.A. Value다. 같은 법인이 아니다' },
  { from: 'seavalue', to: 'external:unicord', kind: 'equity', status: 'active',
    label: '2005-09 Unicord 지분 98.51% 인수', value: 98.51, unit: '%', confirmed: true,
    basis: 'ⅩⅦ 연표 2005-09 · 1,477,631,210주 / 발행 1,500,000,000주',
    caution: '98.51% 는 Sea Value 가 Unicord 에서 가진 몫이다. 1989년 Unicord→Bumble Bee 지분율이 아니다' },
  // ⅩⅦ 이 「현재는 확인 못 했다」고 남긴 줄이다. confirmed:true 로 올리면 지금 살아 있는 지분이 된다.
  { from: 'bumblebee', to: 'seavalue', kind: 'equity', status: 'active',
    label: '2014년 기고 시점 지분 10%', confirmed: false,
    basis: 'ⅩⅦ 02절 · 2014-01-27 미 하원의원 기명 기고 · 등급 B · 그 뒤 변동 문서 미확인',
    caution: '방향이 자주 뒤바뀐다(Sea Value 가 Bumble Bee 를 가진 것이 아니다). 그리고 **지금도 보유한다고 쓰지 마라** — ⅩⅦ 이 현재를 미확인으로 남겼다' },
  { from: 'external:mitsubishi', to: 'thaiunion', kind: 'equity', status: 'active',
    label: '지분 6.19% (1992년~)', value: 6.19, unit: '%', confirmed: true,
    basis: 'Ⅱ history 1992 · 238,745,120주 · 2025년 확대 무산 뒤에도 그대로',
    caution: '「미쓰비시가 인수했다」로 쓰지 마라. 지분은 6.19% 그대로다' },
  { from: 'external:mitsubishi', to: 'thaiunion', kind: 'equity', status: 'failed',
    label: '20% 확대 시도 — 2025-09-29 무산', confirmed: false,
    basis: 'Ⅱ history 2025 · 공개매수 응모 미달로 자동 취소 · 2025-11 기준 새 제안 없음',
    caution: '무산된 것은 확대분이다. 위의 6.19% 는 살아 있다 — 자본선 자체를 회색으로 읽으면 안 된다' },
  { from: 'external:silla', to: 'external:panofi', kind: 'equity', status: 'active',
    label: '지분 45% · 2003년 취득 · 장부가액 0', value: 45, unit: '%', confirmed: true,
    basis: 'Ⅶ panofi · 자본잠식 235억원 → 407억원',
    caution: 'Ⅶ panofi 에 공급 방향을 말하는 행이 없다. 물건을 댄다고 쓰지 마라 — 선망 7척은 Panofi 쪽에 있다' },
  { from: 'jealsa', to: 'albacora', kind: 'equity', status: 'active',
    label: '부회장 법인이사석 — 지분율 미확인', confirmed: false,
    basis: 'Ⅸ albacora · ALONSO ESCURIS S.L. 2022-09~ · GLEIF는 NON_CONSOLIDATING',
    caution: '지분율은 어디에도 없다. 「지배지분은 아니다」까지만 말할 수 있다' },
  { from: 'external:cpgi', to: 'centurypacific', kind: 'equity', status: 'active',
    label: '지주 직접명의 62.994% · 예탁 포함 65.5%', value: 65.5, unit: '%', confirmed: true,
    basis: 'ⅩⅨ 기준선 §2 · 2,320,120,781주 / 발행 3,542,258,595주',
    caution: '지주 63%로 쓰지 마라. 63%는 직접명의분 62.994%의 반올림이다' },
  { from: 'umios', to: 'external:kingfisher', kind: 'equity', status: 'active',
    label: 'Kingfisher Holdings 지분 50.70%', value: 50.7, unit: '%', confirmed: true,
    basis: 'ⅩⅤ stats · 제82기 유가증권보고서 「関係会社の状況」',
    caution: '영국의 동명 Kingfisher Foods 와 다른 회사다' },
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
  // 누적치라 값을 빼 둔다. 연간 수출선(86,514톤/2025)과 같은 굵기 자로 재면 축이 어긋난다.
  { from: 'seavalue', to: 'starkist', kind: 'supply', status: 'active',
    label: '누적 16,694,091 kg (2006-11~2026-08)', confirmed: false,
    basis: 'ⅩⅦ stats · I.S.A. Value 명의 · 거래상대 행 최근일 2023-03-03 · 등급 B',
    caution: '연간 물량으로 쓸 수 없다 — HS 한정 여부와 연도별 배분이 확인되지 않은 20년 누적이다. 「그 회사의 공장이 Bumble Bee 캔을 만든다」를 담은 문서도 하나도 없다' },
  { from: 'itochu', to: 'hagoromo', kind: 'supply', status: 'active',
    label: '연 62.08억엔 매입 — 전량 ITOCHU를 거친다', confirmed: true,
    basis: 'Ⅴ ati · ⅩⅩⅨ · 하고로모 제97기 관련당사자 주석 — PT Aneka Tuna 제품 매입 6,207,917千円, 값은 ITOCHU 견적을 검토해 결정',
    caution: 'ITOCHU가 값을 정한다고 쓰지 마라. 원문은 「見積価格を検討のうえ決定」 — 결정은 하고로모다' },
  { from: 'sajo', to: 'itochu', kind: 'supply', status: 'active',
    label: 'MSC 인증 25척 중 11척 (44%)', value: 11, unit: '척', confirmed: true,
    basis: 'Ⅴ korea · siVessels · 사조 6 + 키리바시&사조 3 + 사조바누아투 2',
    caution: 'ITOCHU가 인증 보유자로서 신청·유지 비용을 진다. 지분 관계가 아니다' },
  // ── ⅩⅩⅠ 이 편이 확정한 공급선 ──────────────────────────
  // EU 결정문 ¶(66) 이 두 방향을 함께 적는다. 2012년 값이고 그때는 공동지배 이전이다.
  { from: 'trimarine', to: 'boltonfood', kind: 'supply', status: 'active',
    label: '2012년 Bolton 로인 수요의 [60-70]%', confirmed: false,
    basis: 'ⅩⅩⅠ · EU COMP/M.7010 ¶(66) · 구간 표기는 원문 그대로',
    caution: '2012년 값이고 당시 Bolton 은 아직 지배주주가 아니었다. 지금 값으로 쓰지 마라' },
  { from: 'trimarine', to: 'thaiunion', kind: 'supply', status: 'active',
    label: '콜롬비아·에콰도르 공장 → Tri Union Seafoods', value: 754.6, unit: '톤', confirmed: true,
    basis: 'ⅩⅩⅠ · 미국 세관 적하목록 · GRALCO 명의 14건 754,600 kg (2016-11~2022-06)',
    caution: '가장 늦은 선적이 2022년 6월이다. 「지금도」로 쓰지 마라' },
  { from: 'trimarine', to: 'bumblebee', kind: 'supply', status: 'active',
    label: '콜롬비아 공장 → Bumble Bee', value: 129.4, unit: '톤', confirmed: true,
    basis: 'ⅩⅩⅠ · 미국 세관 적하목록 · GRALCO 명의 2건 129,401 kg',
    caution: '이 회사는 Bolton 100% 자회사다 — 경쟁 진영에 대는 구조 자체가 이 편의 축이다' },
  { from: 'trimarine', to: 'jealsa', kind: 'supply', status: 'active',
    label: '에콰도르 공장 → Jealsa Rianxeira 29건', confirmed: true,
    basis: 'ⅩⅩⅠ · 미국 세관 적하목록 · SEAFMAN 명의 102건 중 최다 수하인 (2015-01~2022-02)',
    caution: '건수이지 물량이 아니다. 그룹 내부(Tri Marine Europe) 행은 4건뿐이다' },
  { from: 'trimarine', to: 'starkist', kind: 'supply', status: 'ended',
    label: '2019-09 알바코어 원어 201.104 MT', value: 201, unit: '톤', confirmed: true,
    basis: 'ⅩⅩⅠ · 미국 세관 선하증권 · 전면 인수 발표 직후',
    caution: '단발 선적 기록이다. 계속 거래로 읽지 마라' },
  { from: 'external:nfd', to: 'trimarine', kind: 'equity', status: 'active',
    label: '선단 법인 — 배는 전부 이 이름이다', confirmed: true,
    basis: 'ⅩⅩⅠ · WCPFC 등록부 소유자 칸 · 선망 6척 등재 · 2척 삭제',
    caution: '방향에 주의 — 이 편의 주어는 Tri Marine 이고 배를 가진 것은 계열 NFD 다' },
];


/**
 * 층 4 — 명부. 같은 등록부·인증서에 함께 있다.
 *
 * ⚠ **등재는 거래 실적이 아니다.** 등재가 사라진 것과 거래가 사라진 것은 다른 문장이다(Ⅶ 금칙).
 */
export const REGISTRY_RELATIONS: Relation[] = [
  { from: 'external:silla', to: 'bolton', kind: 'registry', status: 'active',
    label: '공급선 명단 5척 (2025년판)', value: 5, unit: '척', confirmed: true,
    basis: 'ⅩⅩ stats(2025년 5척) · Ⅵ korea(2021년 6척 → 2023년 0척 → 2024년 2척)',
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
 *
 * ⚠ **양 끝이 나라다.** 통관 통계를 회사 본사 핀에 물리면
 * 「신라교역이 Thai Union 에 86,514톤을 팔았다」로 읽힌다 — 실제로 그렇게 그려졌었다.
 * 이 층의 노드는 `external:*-trade` 이고 회사가 아니다.
 */
export const TRADE_RELATIONS: Relation[] = [
  { from: 'external:kr-trade', to: 'external:th-trade', kind: 'trade', status: 'active',
    label: '한국 → 태국 86,514톤 (2025년)', value: 86514, unit: '톤', confirmed: true,
    basis: 'Ⅱ koreaExport · 2024년 107,151톤에서 감소',
    caution: '나라 대 나라 통관 통계다. 어느 회사가 얼마를 샀는지가 아니다' },
  { from: 'external:kr-trade', to: 'external:es-trade', kind: 'trade', status: 'active',
    label: '한국 → 스페인 1,954톤 (2025년)', value: 1954, unit: '톤', confirmed: true,
    basis: 'Ⅰ koreaExport · 2024년 5,509톤에서 감소',
    caution: '나라 대 나라 통관 통계다. Frinsa 의 매입이 아니다' },
  { from: 'external:kr-trade', to: 'external:it-trade', kind: 'trade', status: 'active',
    label: '한국 → 이탈리아 2,548톤 · 금액 1위', value: 2548, unit: '톤', confirmed: true,
    basis: 'Ⅶ korea · ⅩⅩ · HS 0304.87 · 금액 36.88% 1위 / 중량 31.09% 2위',
    caution: '금액으로 1위이고 중량으로는 2위다. 축을 붙이지 않으면 거짓이 된다. 그리고 나라의 몫이지 JAIS 의 매입이 아니다' },
  { from: 'external:kr-trade', to: 'external:jp-trade', kind: 'trade', status: 'active',
    label: '한국 → 일본 9,901톤 · 단가 $5.89/kg', value: 9901, unit: '톤', confirmed: true,
    basis: 'Ⅴ korea · 세계평균 $4.17의 1.41배 · 수입국 5위',
    caution: '나라 대 나라 통관 통계다. ITOCHU 의 매입이 아니다' },
  // 몫(%)은 톤과 다른 축이라 굵기 값에서 뺀다.
  { from: 'external:kr-trade', to: 'external:ph-trade', kind: 'trade', status: 'active',
    label: '한국 수출 중 필리핀 몫 1.62% (2025년)', confirmed: true,
    basis: 'ⅩⅨ stats · 2022년 9.70%에서 3년 만에 6분의 1',
    caution: '분모는 한국의 전세계 수출 중량이다. Century Pacific 의 매입이 아니다' },
];

/**
 * 층 4 — 금융. 보증과 대여.
 */
export const FINANCE_RELATIONS: Relation[] = [
  { from: 'dongwon', to: 'starkist', kind: 'finance', status: 'active',
    label: '지급보증 USD 169,200천', value: 169200, unit: 'USD천', confirmed: true,
    basis: 'ⅩⅡ guarantee · 하나 뉴욕·SMBC 뉴욕·신한 뉴욕 · 달러 보증의 98.37%' },
  { from: 'external:silla', to: 'external:panofi', kind: 'finance', status: 'active',
    label: '대여금 196.8억원 · 지급보증 USD 31,500천', value: 196.8, unit: '억원', confirmed: true,
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
  // 금액은 통화가 둘(USD천·억원)이고 환율을 원장에 박을 수 없다.
  // 공통 축이 없으므로 **굵기에 쓰지 않는다** — 값은 라벨로만 읽힌다.
  return BASE + 0.4;
}

/** 확정된 관계만 실선이다. 미확인은 점선으로 간다. */
export function isSolid(r: Relation): boolean {
  return r.confirmed && r.status === 'active';
}
