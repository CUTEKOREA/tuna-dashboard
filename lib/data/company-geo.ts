/**
 * 참치 기업 해부 20편의 **지리 원장**.
 *
 * 20편 어디에도 위경도가 없다. 편이 확정한 것은 **도시 이름**까지이고, 좌표는 그 도시의
 * 공개 좌표를 여기서 붙인 것이다. 그래서 모든 행이 `basis` 로 「어느 편 어느 필드가 그 도시를
 * 말하는가」를 들고 다닌다.
 *
 * ## 이 파일이 지키는 다섯 가지 — 조사가 낸 「지도로 그리면 거짓이 되는 것」
 *
 * 1. **본사와 생산 거점을 가른다.** 본사 핀에 매출을 붙이면 거짓이 된다. Albacora 의 몸통은
 *    스페인이 아니라 에콰도르 포소르하(가공매출의 74%)이고, Nauterra 는 상업등기부에
 *    그 상호의 법인이 **0건**이며, Bolton Food 등기 본점은 밀라노가 아니라 체르메나테다.
 *    → `kind: 'hq'` 는 크기를 갖지 않는다. 크기는 `kind: 'plant'` 에만 붙는다.
 * 2. **선단을 지도에 찍지 않는다.** 20편에 **모항이 한 건도 없다.** 있는 것은 기국뿐이고,
 *    Nauterra 8척 중 7척이 엘살바도르 기이며 Kyokuyo 4척은 전부 자회사 명의다.
 *    → 선단은 `FLAG_STATES` 로만 두고 지도 위 점으로 만들지 않는다.
 * 3. **미확인 거점은 찍지 않는다.** Jealsa 공장 7곳·Bumble Bee 자가 공장 1곳은 위치가 없다.
 *    → `UNLOCATED_PLANTS` 에 개수만 적고 회사 패널에서 「위치 미확인 n곳」으로 낸다.
 * 4. **국가를 칠하지 않는다.** Bolton 매출의 32.7%가 접착제·세제·화장품이고 ITOCHU 는
 *    수산 실적 공시가 0건이다. 회사 하나를 나라 하나에 칠하면 그 사실이 지워진다.
 * 5. **규모 값의 단위를 섞지 않는다.** `sizeValue` 는 `sizeUnit` 이 같은 것끼리만 견준다.
 *
 * ⚠ 좌표는 도시 중심의 근사치다. 부두·공장의 정확한 위치가 아니다.
 */

/** 지점 종류. 본사는 크기를 갖지 않는다(1번 규칙). */
export type GeoKind = 'hq' | 'plant';

export interface GeoPoint {
  /** `COMPANY_CARDS` 의 key 와 같다. */
  company: string;
  /** 편 로마숫자. */
  numeral: string;
  kind: GeoKind;
  /** 화면에 띄우는 지점 이름. */
  label: string;
  country: string;
  lat: number;
  lng: number;
  /** 어느 편 어느 필드가 이 도시를 말하는가. 빈 문자열 금지. */
  basis: string;
  /** 크기를 줄 값. `kind: 'plant'` 이고 값이 있을 때만. */
  sizeValue?: number;
  /** `sizeValue` 의 단위. 다른 단위끼리 견주지 않는다. */
  sizeUnit?: '명' | '톤/년' | 'MT/일';
  /** 보조 설명 한 줄. */
  note?: string;
  /**
   * 거점 성격. **없으면 생산이다.**
   * 「캔은 어디서 만들어지는가」에 답하는 층이라, 트레이딩·구매 법인을
   * 「생산 거점」으로 찍으면 그 층의 물음 자체가 거짓이 된다.
   */
  role?: 'trading' | 'sourcing';
}

/** 이 점이 실제로 물건을 만드는 곳인가. */
export function isProduction(p: GeoPoint): boolean {
  return p.kind === 'plant' && !p.role;
}

/**
 * 본사·등기지 20곳.
 *
 * 도시는 `COMPANY_CARDS` 의 `country` 필드와 각 편 인테이크 `_meta.국가` 가 확정한다.
 * ITOCHU 는 등기 본점(오사카)과 본사(도쿄)가 갈리므로 등기 본점을 찍는다.
 */
export const HQ_POINTS: GeoPoint[] = [
  { company: 'frinsa', numeral: 'Ⅰ', kind: 'hq', label: 'Frinsa 본사', country: '스페인',
    lat: 42.55, lng: -8.99, basis: 'Ⅰ _meta.국가 · Ribeira (A Coruña)' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'hq', label: 'Thai Union 본사', country: '태국',
    lat: 13.55, lng: 100.27, basis: 'Ⅱ _meta.국가 · 사뭇사콘' },
  { company: 'albacora', numeral: 'Ⅲ', kind: 'hq', label: 'Albacora 등기 본점', country: '스페인',
    lat: 43.42, lng: -2.72, basis: 'Ⅲ profile · Pol. Ind. Landabaso, 48370 Bermeo',
    note: '본사가 있는 곳이지 생산이 일어나는 곳이 아니다' },
  { company: 'fcf', numeral: 'Ⅳ', kind: 'hq', label: 'FCF 본사', country: '대만',
    lat: 22.60, lng: 120.31, basis: 'Ⅳ profile · 高雄市前鎮區民權二路8號28樓' },
  { company: 'itochu', numeral: 'Ⅴ', kind: 'hq', label: 'ITOCHU 등기 본점', country: '일본',
    lat: 34.70, lng: 135.50, basis: 'Ⅴ profile · 오사카 우메다(본사는 도쿄 기타아오야마)' },
  { company: 'bolton', numeral: 'Ⅵ', kind: 'hq', label: 'Bolton Group 본사', country: '이탈리아',
    lat: 45.48, lng: 9.20, basis: 'Ⅵ profile · Via G.B. Pirelli 19, 20124 Milano' },
  { company: 'jais', numeral: 'Ⅶ', kind: 'hq', label: 'JAIS 본사', country: '이탈리아',
    lat: 45.45, lng: 9.16, basis: 'Ⅶ profile · Via Andrea Solari 43, 20144 Milano',
    note: '배도 공장도 자회사도 없다' },
  { company: 'frabelle', numeral: 'Ⅷ', kind: 'hq', label: 'Frabelle 본사', country: '필리핀',
    lat: 14.66, lng: 120.94, basis: 'Ⅷ _meta.국가 · Navotas' },
  { company: 'jealsa', numeral: 'Ⅸ', kind: 'hq', label: 'Jealsa 본사', country: '스페인',
    lat: 42.65, lng: -8.89, basis: 'Ⅸ _meta.국가 · Boiro (A Coruña)' },
  { company: 'nauterra', numeral: 'Ⅹ', kind: 'hq', label: 'Nauterra 본사', country: '스페인',
    lat: 43.21, lng: -8.69, basis: 'Ⅹ _meta.국가 · Carballo · 등기 상호 Luis Calvo Sanz, S.A.',
    note: '상업등기부에 「Nauterra」 법인은 0건이다' },
  { company: 'starkist', numeral: 'ⅩⅠ', kind: 'hq', label: 'StarKist 본사', country: '미국',
    lat: 38.96, lng: -77.36, basis: 'ⅩⅠ _meta · Reston, Virginia' },
  { company: 'dongwon', numeral: 'ⅩⅡ', kind: 'hq', label: '동원산업 본사', country: '대한민국',
    lat: 37.48, lng: 127.02, basis: 'ⅩⅡ _meta.국가 · 서울 서초' },
  { company: 'sajo', numeral: 'ⅩⅢ', kind: 'hq', label: '사조 본사', country: '대한민국',
    lat: 37.57, lng: 126.94, basis: 'ⅩⅢ _meta.국가 · 서울 서대문' },
  { company: 'bumblebee', numeral: 'ⅩⅣ', kind: 'hq', label: 'Bumble Bee 본사', country: '미국',
    lat: 32.72, lng: -117.16, basis: 'ⅩⅣ _meta.국가 · San Diego, CA' },
  { company: 'umios', numeral: 'ⅩⅤ', kind: 'hq', label: 'Umios 본사', country: '일본',
    lat: 35.66, lng: 139.75, basis: 'ⅩⅤ _meta.국가 · 도쿄 미나토' },
  { company: 'kyokuyo', numeral: 'ⅩⅥ', kind: 'hq', label: '極洋 본사', country: '일본',
    lat: 35.67, lng: 139.76, basis: 'ⅩⅥ _meta.국가 · 도쿄' },
  { company: 'seavalue', numeral: 'ⅩⅦ', kind: 'hq', label: 'Sea Value 본사', country: '태국',
    lat: 13.54, lng: 100.28, basis: 'ⅩⅦ _meta.국가 · 사뭇사콘' },
  { company: 'nissui', numeral: 'ⅩⅧ', kind: 'hq', label: 'ニッスイ 본사', country: '일본',
    lat: 35.68, lng: 139.76, basis: 'ⅩⅧ _meta.국가 · 도쿄' },
  { company: 'centurypacific', numeral: 'ⅩⅨ', kind: 'hq', label: 'Century Pacific 본사', country: '필리핀',
    lat: 14.58, lng: 121.06, basis: 'ⅩⅨ _meta.국가 · Pasig' },
  { company: 'boltonfood', numeral: 'ⅩⅩ', kind: 'hq', label: 'Bolton Food 등기 본점', country: '이탈리아',
    lat: 45.71, lng: 9.09, basis: 'ⅩⅩ 기준선 §1 · Via Einaudi 18/22, 22072 Cermenate (CO)',
    note: '밀라노가 아니다. 밀라노는 지주의 주소다' },
  { company: 'trimarine', numeral: 'ⅩⅩⅠ', kind: 'hq', label: 'Tri Marine 등기', country: '싱가포르',
    lat: 1.29, lng: 103.85, basis: 'ⅩⅩⅠ · TRI-MARINE INTERNATIONAL (PTE) LTD · UEN 197601267M · 1976-06-21' },
  { company: 'princes', numeral: 'ⅩⅩⅡ', kind: 'hq', label: 'Princes Group plc 등기', country: '영국',
    lat: 53.41, lng: -3.00, basis: 'ⅩⅩⅡ · Companies House 02328824 · Royal Liver Building, Pier Head, Liverpool L3 1NX',
    note: '1988-12-15 설립 · 최초 상호 MITOPEN LIMITED · 2025-08-11 사모→공개 재등록' },
  { company: 'iot', numeral: 'ⅩⅩⅢ', kind: 'hq', label: 'Indian Ocean Tuna 등기·공장', country: '세이셸',
    lat: -4.62, lng: 55.45, basis: 'ⅩⅩⅢ · Fishing Port, PO Box 676, Victoria, Mahe · Thai Union Europe 60% · 정부 40%',
    note: '1987년 정부가 세운 Conserveries de l\'Océan Indien 이 전신 · 1995-11 개명' },
  { company: 'ati', numeral: 'ⅩⅩⅣ', kind: 'hq', label: 'PT Aneka Tuna Indonesia 본사·제1공장', country: '인도네시아',
    lat: -7.56, lng: 112.70, basis: 'ⅩⅩⅣ · Jl. Raya Surabaya–Malang Km.38, Gempol, Pasuruan · 伊藤忠 47.0% · はごろも 33.00%',
    note: '1991-10 설립 · 1992-11 상업생산 · 유럽연합 승인 138.13.B/C(2021 목록)' },
  { company: 'nirsa', numeral: 'ⅩⅩⅤ', kind: 'hq', label: 'NIRSA 본점', country: '에콰도르',
    lat: -2.19, lng: -79.89, basis: 'ⅩⅩⅤ · 본점 과야킬(회사감독청 등기, 도시 좌표) · 지주 Corporación Real Corprealsa 99.99%',
    note: '활동 개시 1957-11-05 · 정어리 통조림으로 출발, 참치 1968년' },
  { company: 'eurofish', numeral: 'ⅩⅩⅥ', kind: 'hq', label: 'Eurofish 본점·공장', country: '에콰도르',
    lat: -0.99, lng: -80.69, basis: 'ⅩⅩⅥ · 몬테크리스티 Arroyo Azul, Calle Transmarina y Av. Hugo Mayo (만타–몬테크리스티 경계, 근사 좌표) · 주주 IBEROPESCA 39.93%',
    note: '1998-09-08 만타 등기 · 2007 본점 몬테크리스티 이전 · EU 승인 575' },
  { company: 'tecopesca', numeral: 'ⅩⅩⅦ', kind: 'hq', label: 'Tecopesca 본점·공장', country: '에콰도르',
    lat: -0.97, lng: -80.64, basis: 'ⅩⅩⅦ · 하라미호 Km 4.5 Vía Manta–Rocafuerte (MSC 유통망 증서 주소, 근사 좌표) · 지주 GRUPOVISION GVHOLDING 99.99%',
    note: '1999-06-15 만타 설립 · EU 승인 591 · 배 없는 캐너리' },
  { company: 'dongwonfnb', numeral: 'ⅩⅩⅧ', kind: 'hq', label: '동원F&B 본점', country: '대한민국',
    lat: 37.47, lng: 127.04, basis: 'ⅩⅩⅧ · 서울 서초구 마방로 68(사업보고서, 도시 좌표) · 동원산업 100%(2025-07-14 주식교환)',
    note: '2000-11-01 동원산업에서 인적분할 · 2025-07-31 상장폐지 · 참치캔 출시 1982' },
  { company: 'hagoromo', numeral: 'ⅩⅩⅨ', kind: 'hq', label: 'はごろもフーズ 본점', country: '일본',
    lat: 35.01, lng: 138.49, basis: 'ⅩⅩⅨ · 등기 본점 静岡市清水区島崎町(유가증권보고서, 구 단위 근사 좌표) · 실무 본사 静岡市駿河区 · 東証スタンダード 2831',
    note: '1931년 기름절임 참치캔으로 시작 · 1958년 「シーチキン」 상표 등록 · 재단 46.67%' },
  { company: 'cnfc', numeral: 'ⅩⅩⅩ', kind: 'hq', label: '中水集团远洋 본점', country: '중국',
    lat: 39.83, lng: 116.29, basis: 'ⅩⅩⅩ · 北京市丰台区南四环西路188号(2025 연보, 구 단위 근사 좌표) · 深交所 000798 · 中国水产 33.90% + 舟山海洋渔业 17.78%',
    note: '1998-01 설립 · 연보 네 권에 「罐」 0회 · 2025 참치 매출총이익률 −6.96%' },  { company: 'kaichuang', numeral: 'ⅩⅩⅪ', kind: 'hq', label: '上海开创 본사', country: '중국',
    lat: 31.27, lng: 121.53, basis: 'ⅩⅩⅪ · 上海市杨浦区安浦路661号(2025 연보 사무 주소, 구 단위 근사 좌표) · 上交所 600097 · 上海远洋渔业 42.26% · 光明食品 간접 42.83%',
    note: '1997 설립·상장 · 2008 역합병으로 원양어업 회사가 됨 · 2025 캔 매출총이익 몫 52.48%' },  { company: 'alliance', numeral: 'ⅩⅩⅫ', kind: 'hq', label: 'Alliance Select 등록 본사', country: '필리핀',
    lat: 14.58, lng: 121.06, basis: 'ⅩⅩⅫ · Suite 3104A West Tower, PSE Centre, Ortigas, Pasig City(2025 연차보고서, 시 단위 근사 좌표) · 필리핀증권거래소 FOOD · Strongoak 55.31%',
    note: '2003 설립 · 2006-11-08 상장 · 생산은 제너럴산토스 한 부지 · 2026-09-02 감자·모회사 증자안 의결' },  { company: 'herdez', numeral: 'ⅩⅩⅩⅢ', kind: 'hq', label: 'Grupo Herdez 본사', country: '멕시코',
    lat: 19.43, lng: -99.13, basis: 'ⅩⅩⅩⅢ · 멕시코시티(시 단위 근사 좌표) · 멕시코증권거래소 HERDEZ · Hechos con Amor 68.51%',
    note: '2020-07-29 참치 선단·공장·상표 매각 · 현행 공시 열 권에 「atún」 0회 · 참치는 브랜드 보유·위탁 생산' },
  { company: 'sajoseafood', numeral: 'ⅩⅩⅩⅣ', kind: 'hq', label: '사조씨푸드 본사', country: '대한민국',
    lat: 37.575, lng: 126.945, basis: 'ⅩⅩⅩⅣ · 서울특별시 서대문구 통일로 107-39 502호(2025 사업보고서, 구 단위 근사 좌표 — 최대주주 사조산업과 같은 사조빌딩이라 ⅩⅢ 본사와 같은 건물이고 핀만 겹치지 않게 띄웠다) · 유가증권시장 014710 · 사조산업 63.64%(2026-06-30)',
    note: '사무실 324㎡를 사조산업에서 임차 · 참치 매출 1,465억 7,640만(별도의 67.41%) 대 그 부문 설비 장부가 3억 5,962만' },
  { company: 'garavilla', numeral: 'ⅩⅩⅩⅤ', kind: 'hq', label: 'Grupo Conservas Garavilla 본점', country: '스페인',
    lat: 43.2676, lng: -2.935, basis: 'ⅩⅩⅩⅤ · Plaza Euskadi 5, 토레 이베르드롤라 25층, 빌바오(2025-04-03 본점 이전 등기, 가구 단위 근사 좌표) · NIF B95617643 · Bolton Food S.p.A. 단독주주 선언 등기 2025-09-16',
    note: '현행 법인은 2010-07-15 설립(Sea Solutions Conservera S.L.) · 2012-05-16 상호 변경 · 2012-08-23 구 S.A. 흡수·소멸 — 1887년은 브랜드·가업의 기원이지 이 법인이 아니다 · 주소 이동 문다카 → 사무도(2018-01-16) → 빌바오' },
  { company: 'salica', numeral: 'ⅩⅩⅩⅥ', kind: 'hq', label: 'Salica Industria Alimentaria 본점', country: '스페인',
    lat: 43.4083, lng: -2.744,
    basis: 'ⅩⅩⅩⅥ · Polígono Industrial Landabaso s/n, 48370 베르메오(공단 단위 근사 좌표) · CIF A48434781 · RM Bizkaia Hoja BI-181-A · 설립등기 1990-06-01 · 2000-08-21까지 상호는 「Sociedad Alimentaria Campos Astorquiza, S.A.」',
    note: '모회사 Albacora S.A.(편 Ⅲ)가 같은 공단에 있어 핀만 띄웠다 — 같은 자리를 두 번 찍으면 아크가 남의 핀에서 출발한다 · CAMPOS·BACHI·AIKO·ASTOR·SALICA 다섯 상표 전부 이 법인 명의이고 모회사에서 넘어온 상표는 0건이다' },
  { company: 'majestic', numeral: 'ⅩⅩⅩⅦ', kind: 'hq', label: 'Majestic Seafood Corporation 등기주소', country: '파푸아뉴기니',
    lat: -6.683, lng: 147.031,
    basis: 'ⅩⅩⅩⅦ · Portion 640, Busu Road, Malahang, Lae, Morobe Province 411(말라항 공업지구 단위 근사 좌표) · 등록번호 1-67560 · 2009-04-24 등록 · 외국기업 · 외국인투자 인증 92714',
    note: '본사와 공장이 같은 자리다 — 핀이 겹치면 아크가 남의 핀에서 출발하므로 공장 핀만 조금 띄웠다 · 같은 도시에 Frabelle(편 Ⅷ) 라에 핀이 이미 있어 그 좌표와도 떼어 놓았다, 두 공장은 다른 법인이다 · 2025-11-01 연차보고 미제출 말소 통지 → 2026-02-13 복원(등록법인 90% 이상이 비준수다)' },
  { company: 'sca', numeral: 'ⅩⅩⅩⅧ', kind: 'hq', label: 'Société de Conserverie en Afrique 등기주소', country: '세네갈',
    lat: 14.6785, lng: -17.4262,
    basis: 'ⅩⅩⅩⅧ · Quai de Pêche, Môle 10, BP 782, 다카르(다카르 자치항 어항 부두 단위 근사 좌표) · 취득 2012-01-02 · 동원산업 60%(150,000주) · 유럽연합 수출 인가 005/93/C',
    note: '본사와 공장이 같은 자리다 — 핀이 겹치면 아크가 남의 핀에서 출발하므로 공장 핀만 조금 띄웠다 · 세네갈 등기번호(RCCM)·납세번호(NINEA)는 상사법원·투자청 공개 검색이 열리지 않아 미확인이고 현지 파트너 40%의 주주명도 공시에 없다 · 공장이 다카르 자치항 구역 안에 있다는 것은 세네갈 환경·분류시설 등록부가 확정한다(「SCASA(구 SNCDS)」로 적는다)' },
];

/**
 * 생산 거점.
 *
 * 인테이크에 **거점명이 적힌 것만** 넣는다. 인력·캐파 수치가 붙는 곳에만 `sizeValue` 를 준다.
 * 도시가 미확인인 공장은 여기 없고 `UNLOCATED_PLANTS` 로 간다.
 */
export const PLANT_POINTS: GeoPoint[] = [
  // ── Ⅲ Albacora ─────────────────────────────────────────────
  { company: 'albacora', numeral: 'Ⅲ', kind: 'plant', label: 'SIA 베르메오', country: '스페인',
    lat: 43.42, lng: -2.72, sizeValue: 138, sizeUnit: '명',
    basis: 'Ⅲ plants[0] · 2025년 매출 65.8 M€' },
  { company: 'albacora', numeral: 'Ⅲ', kind: 'plant', label: 'SAC 갈리시아', country: '스페인',
    lat: 42.60, lng: -8.93, sizeValue: 68, sizeUnit: '명',
    basis: 'Ⅲ plants[1] · 2025년 매출 15.7 M€' },
  { company: 'albacora', numeral: 'Ⅲ', kind: 'plant', label: 'SAE 포소르하', country: '에콰도르',
    lat: -2.71, lng: -80.25, sizeValue: 2358, sizeUnit: '명',
    basis: 'Ⅲ plants[2] · 2025년 매출 233.3 M€',
    note: '가공매출의 74%가 여기서 나온다. 이 회사의 몸통이다' },

  // ── Ⅱ Thai Union ───────────────────────────────────────────
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '사뭇사콘 단지', country: '태국',
    lat: 13.55, lng: 100.27, basis: 'Ⅱ factories[0] · 참치 가공 + 제관·라벨' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '송클라', country: '태국',
    lat: 7.19, lng: 100.60, basis: 'Ⅱ factories[1] · i-Tail 펫케어·냉동새우' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '벤륵', country: '베트남',
    lat: 10.64, lng: 106.48, basis: 'Ⅱ factories[2] · Yueh Chyang Canned Food' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '빅토리아', country: '세이셸',
    lat: -4.62, lng: 55.45, basis: 'Ⅱ factories[3] · Indian Ocean Tuna 60%',
    note: '세계 최대급 캐너리' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '테마', country: '가나',
    lat: 5.62, lng: 0.02, basis: 'Ⅱ factories[4] · Pioneer Food Cannery 100%',
    note: '냉동창고 8,000톤 2024-07-18 개소' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '두아르네네·캥페르', country: '프랑스',
    lat: 48.10, lng: -4.33, basis: 'Ⅱ factories[5] · Paul Paulet · MerAlliance' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '페니시', country: '포르투갈',
    lat: 39.36, lng: -9.38, basis: 'Ⅱ factories[6] · European Seafood Investment' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '그니에비노', country: '폴란드',
    lat: 54.72, lng: 18.00, basis: 'Ⅱ factories[7] · 캔수산' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '자스니츠', country: '독일',
    lat: 54.51, lng: 13.63, basis: 'Ⅱ factories[8] · Rügen Fisch · 참치유 정제' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '크레팅가', country: '리투아니아',
    lat: 55.89, lng: 21.25, basis: 'Ⅱ factories[9] · 수산 가공' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '베르겐', country: '노르웨이',
    lat: 60.39, lng: 5.32, basis: 'Ⅱ factories[10] · King Oscar AS' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '도모데도보', country: '러시아',
    lat: 55.44, lng: 37.76, basis: 'Ⅱ factories[11] · Dalpromryba' },
  { company: 'thaiunion', numeral: 'Ⅱ', kind: 'plant', label: '수라바야', country: '인도네시아',
    lat: -7.25, lng: 112.75, basis: 'Ⅱ factories[13] · PT TU Kharisma Lestari 33.15%' },

  // ── Ⅹ Nauterra ─────────────────────────────────────────────
  { company: 'nauterra', numeral: 'Ⅹ', kind: 'plant', label: '카르바요', country: '스페인',
    lat: 43.21, lng: -8.69, sizeValue: 415, sizeUnit: '명',
    basis: 'Ⅹ plants[0] · 캐파 56,000톤' },
  { company: 'nauterra', numeral: 'Ⅹ', kind: 'plant', label: '이타자이', country: '브라질',
    lat: -26.91, lng: -48.66, sizeValue: 2428, sizeUnit: '명',
    basis: 'Ⅹ plants[1] · 캐파 86,000톤' },
  { company: 'nauterra', numeral: 'Ⅹ', kind: 'plant', label: '라우니온', country: '엘살바도르',
    lat: 13.34, lng: -87.84, sizeValue: 1366, sizeUnit: '명',
    basis: 'Ⅹ plants[3] · 캐파 24,000톤' },

  // ── ⅩⅠ StarKist (동원산업 100%) ────────────────────────────
  { company: 'starkist', numeral: 'ⅩⅠ', kind: 'plant', label: '파고파고', country: '미국령 사모아',
    lat: -14.28, lng: -170.70, sizeValue: 108000, sizeUnit: '톤/년',
    basis: 'ⅩⅠ entities · production · 2025년 실적 82,554톤' },
  { company: 'starkist', numeral: 'ⅩⅠ', kind: 'plant', label: '과야킬', country: '에콰도르',
    lat: -2.19, lng: -79.89, sizeValue: 36000, sizeUnit: '톤/년',
    basis: 'ⅩⅠ entities · Galapesca S.A. 1999-08-23' },

  // ── Ⅷ Frabelle ─────────────────────────────────────────────
  { company: 'frabelle', numeral: 'Ⅷ', kind: 'plant', label: 'PNG 라에', country: '파푸아뉴기니',
    lat: -6.73, lng: 147.00, sizeValue: 140, sizeUnit: 'MT/일',
    basis: 'Ⅷ stats · 실생산 120~130 MT/일 · 현지고용 1,800명',
    note: '필리핀 국내에는 자사 참치 캐너리가 없다' },

  // ── Ⅴ ITOCHU ───────────────────────────────────────────────
  { company: 'itochu', numeral: 'Ⅴ', kind: 'plant', label: '파수루안', country: '인도네시아',
    lat: -7.65, lng: 112.91, sizeValue: 250, sizeUnit: 'MT/일',
    basis: 'Ⅴ ati · ATI 2공장 · ITOCHU 47%',
    note: '2016년 현장 확인 수치다' },

  // ── ⅩⅦ Sea Value ───────────────────────────────────────────
  { company: 'seavalue', numeral: 'ⅩⅦ', kind: 'plant', label: '사뭇사콘 공장 3곳', country: '태국',
    lat: 13.53, lng: 100.30, sizeValue: 1000, sizeUnit: 'MT/일',
    basis: 'ⅩⅦ stats.공장_수 = 3 · 캐파 1,000톤/일' },

  // ── Ⅰ Frinsa ───────────────────────────────────────────────
  { company: 'frinsa', numeral: 'Ⅰ', kind: 'plant', label: '리베이라', country: '스페인',
    lat: 42.55, lng: -8.99, basis: 'Ⅰ profile · 설립지 · 캔 자체 제조 · 그룹 약 1,300명' },
  { company: 'frinsa', numeral: 'Ⅰ', kind: 'plant', label: '싱가포르 구매본부', country: '싱가포르',
    lat: 1.35, lng: 103.82, basis: 'Ⅰ bai2024 · 세전이익 €5,012,317', role: 'sourcing' },

  // ── Ⅳ FCF 그룹 거점 ────────────────────────────────────────
  { company: 'fcf', numeral: 'Ⅳ', kind: 'plant', label: '시미즈 (F.C.N.)', country: '일본',
    lat: 35.02, lng: 138.49, basis: 'Ⅳ group · 보고경계 5개사', role: 'trading' },
  { company: 'fcf', numeral: 'Ⅳ', kind: 'plant', label: '싱가포르 (F.C.S.)', country: '싱가포르',
    lat: 1.29, lng: 103.85, basis: 'Ⅳ group · Trading & Fishery', role: 'trading' },
  { company: 'fcf', numeral: 'Ⅳ', kind: 'plant', label: '파나마 (Thalassic)', country: '파나마',
    lat: 8.98, lng: -79.52, basis: 'Ⅳ group · 공식 거점 목록에 없던 법인', role: 'trading' },

  // ── ⅩⅩⅠ Tri Marine 가공 3사 ─────────────────────────────
  // 회사 지속가능보고서가 스스로 세는 가공공장은 셋이다. 이탈리아 공장은 그 셋에 없다.
  { company: 'trimarine', numeral: 'ⅩⅩⅠ', kind: 'plant', label: 'SolTuna (노로)', country: '솔로몬제도',
    lat: -8.22, lng: 157.20, sizeValue: 20914, sizeUnit: '톤/년',
    basis: 'ⅩⅩⅠ · 2021년 20,914 metric tons of tuna products',
    note: '솔로몬 최대 민간 고용주 · 2,000명 초과' },
  { company: 'trimarine', numeral: 'ⅩⅩⅠ', kind: 'plant', label: 'SEAFMAN (만타)', country: '에콰도르',
    lat: -0.95, lng: -80.73, sizeValue: 28357, sizeUnit: '톤/년',
    basis: 'ⅩⅩⅠ · 2021년 28,357 metric tons of tuna products',
    note: '자기 브랜드가 없다 — 남의 브랜드 34개를 채운다' },
  { company: 'trimarine', numeral: 'ⅩⅩⅠ', kind: 'plant', label: 'GRALCO (바랑키야)', country: '콜롬비아',
    lat: 10.99, lng: -74.79, sizeValue: 800, sizeUnit: '명',
    basis: 'ⅩⅩⅠ · 종업원 800명 초과 · 생산량은 ⚠️미확인',
    note: 'Alamar 브랜드 생산' },

  // ── ⅩⅩⅡ Princes 모리셔스 두 사이트 ───────────────────────
  // 두 공장은 지분이 다른 별개 법인이다. 51% 를 두 곳에 함께 걸지 않는다.
  { company: 'princes', numeral: 'ⅩⅩⅡ', kind: 'plant', label: 'Princes Tuna (Mauritius) · 리슈테르', country: '모리셔스',
    lat: -20.14, lng: 57.53, sizeValue: 240, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅡ · 계정서 자회사 주석 직접 51% · PO Box 131, New Trunk Road, Riche Terre, Port Louis',
    note: '캔 라인 7 · 이 법인 매출 £189,970천 = Fish 부문의 54.12%' },
  { company: 'princes', numeral: 'ⅩⅩⅡ', kind: 'plant', label: 'Indico Canning · 마린로드', country: '모리셔스',
    lat: -20.16, lng: 57.50, sizeValue: 220, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅡ · 계정서 자회사 주석 간접 68% · Marine Road, Port Louis',
    note: '로인·파우치·병. 지분이 리슈테르와 다르다' },

  // ── ⅩⅩⅢ Indian Ocean Tuna — 공장과 등기가 같은 자리다 ─────
  { company: 'iot', numeral: 'ⅩⅩⅢ', kind: 'plant', label: 'Indian Ocean Tuna (빅토리아)', country: '세이셸',
    lat: -4.62, lng: 55.46, sizeValue: 335, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅢ · 처리 능력 335 t/일(측정일 미기재) · 일 150만~200만 캔',
    note: '2024년 항구 양륙 매입 56,319 t — 양륙 88,569 t 의 64%. 총원료는 이보다 크다' },

  // ── ⅩⅩⅣ Aneka Tuna Indonesia — 두 공장을 합친 능력만 1차 문서에 있다 ─────
  { company: 'ati', numeral: 'ⅩⅩⅣ', kind: 'plant', label: 'Aneka Tuna 겜폴·판다안', country: '인도네시아',
    lat: -7.62, lng: 112.69, sizeValue: 250, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅣ · WCPFC-SC13-2017/ST-IP-05 「250 t/day with new plant」(2016~17 현장조사, 두 공장 합)',
    note: '2025-08 주 수산청: 월 원료 1,841.6 t · 월 제품 862.6 t(수율 46.8%). 연간 총량은 확정치 없음' },

  // ── ⅩⅩⅤ NIRSA — 능력은 회사 발언을 인용한 기사 한 건뿐이다 ─────
  { company: 'nirsa', numeral: 'ⅩⅩⅤ', kind: 'plant', label: 'NIRSA 포소르하 참치·정어리 공장', country: '에콰도르',
    lat: -2.70, lng: -80.25, sizeValue: 420, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅤ · 2018년 수산실 게시 기사가 회사 발언을 인용한 참치 가공능력 일 420 t(회사 공식 문서에는 없다)',
    note: '자체 부두가 공정 시설에서 400 m · 냉동창고 20,000 t(회사 소개) · MSC 유통망 MSC-C-56655' },

  // ── ⅩⅩⅥ Eurofish — 능력 자칭치 대신 경영자 보고서의 실측 일 처리량 ─────
  { company: 'eurofish', numeral: 'ⅩⅩⅥ', kind: 'plant', label: 'Eurofish 몬테크리스티 공장', country: '에콰도르',
    lat: -0.98, lng: -80.68, sizeValue: 171.9, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅥ · 2019 경영자 보고서 가공 41,422.74 t ÷ 241일 = 일 171.9 t (회사 자칭 연간 최대 76,800 t 은 조건 미공개)',
    note: '캔·파우치 73.45% · 로인 26.38% · 펫푸드 공장 2019 가동 · 같은 부지에 Marprot 어분 공장(EU 3546)' },

  // ── ⅩⅩⅦ Tecopesca — 감사 주석의 설비 능력(자숙 기준) ─────
  { company: 'tecopesca', numeral: 'ⅩⅩⅦ', kind: 'plant', label: 'Tecopesca 하라미호 공장', country: '에콰도르',
    lat: -0.96, lng: -80.63, sizeValue: 230, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅦ · 2017 감사 주석 자숙 230 t/일(청소 210 t/일). 회사 게시물 자칭 2024 일 340 t 은 정의가 달라 쓰지 않았다',
    note: '가공 원료 55% 캔 · 45% 로인(2018 경영자 보고서) · MSC 유통망 MSC-C-55841 · BRCGS AA+' },

  // ── ⅩⅩⅧ 동원F&B — 식품안전나라 생산실적 연간 톤을 사업보고서 연간 가동일수로 나눈 값 ─────
  { company: 'dongwonfnb', numeral: 'ⅩⅩⅧ', kind: 'plant', label: '동원F&B 창원공장', country: '대한민국',
    lat: 35.22, lng: 128.68, sizeValue: 74, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅧ · 2025년 참치 수산물가공품 생산 19,536 t(식품안전나라 I0300) ÷ 연간 가동일수 264일(사업보고서) = 일 74 t(계산)',
    note: '동원 브랜드 캔 2024년 38,135 t 중 창원 21,032 t(55%) · 나머지 삼진물산(목포)·신진물산(함안)' },

  // ── ⅩⅩⅨ はごろもフーズ — 유가증권보고서 주요 설비 표의 인원(생산능력은 공시에 없다) ─────
  { company: 'hagoromo', numeral: 'ⅩⅩⅨ', kind: 'plant', label: 'はごろもフーズ 焼津プラント', country: '일본',
    lat: 34.87, lng: 138.32, sizeValue: 115, sizeUnit: '명',
    basis: 'ⅩⅩⅨ · 2026-03-31 주요 설비 「缶詰生産設備」 장부가 1,728,635千円 · 인원 115명(유가증권보고서). 생산능력·가동률은 공시에 없다',
    note: '1951년 신설, 1988년 시내 이전 · 시 단위 근사 좌표' },
  { company: 'hagoromo', numeral: 'ⅩⅩⅨ', kind: 'plant', label: 'はごろもフーズ 新清水プラント', country: '일본',
    lat: 35.03, lng: 138.47, sizeValue: 65, sizeUnit: '명',
    basis: 'ⅩⅩⅨ · 2026-03-31 주요 설비 「缶詰生産設備」 장부가 2,919,655千円 · 인원 65명(유가증권보고서). 2017년 업계지 보도의 계획 능력은 참치캔 하루 약 19만 캔',
    note: '2020-10 신설 鮪・鰹缶詰製造工場 · 구 단위 근사 좌표 · 협력공장 약 70곳(전 제품 기준)은 따로' },

  // ── ⅩⅩⅩ 中水集团远洋 — 캔 공장이 아니다. 초저온 가공센터와 바누아투 로인 공장 ─────
  { company: 'cnfc', numeral: 'ⅩⅩⅩ', kind: 'plant', label: '中水 저우산 참치 연구개발가공센터', country: '중국',
    lat: 30.07, lng: 122.07, sizeValue: 5000, sizeUnit: '톤/년',
    basis: 'ⅩⅩⅩ · 저우산일보 2025-06-23 시운전 기사: 가공 라인 연 5,000 t 이상 · −60℃ 참치 냉장 5,000 t. 연보는 「超低温冷库」만 적고 톤수 없음 · 캔 아님',
    note: '2025 고정자산 전환 1억 5,377만 위안 · 2025 효익 13만 위안 「尚未完全达产」 · 구 단위 근사 좌표' },
  { company: 'cnfc', numeral: 'ⅩⅩⅩ', kind: 'plant', label: 'Sino-Van(中瓦渔业) 살릴리 로인 공장', country: '바누아투',
    lat: -17.74, lng: 168.31,
    basis: 'ⅩⅩⅩ · 연보 연결 자회사 中瓦渔业 51% 「码头运营、加工」 · 외교부 2015 「中瓦首个合资企业,成立于2008年」 · 로인 가공(Atuna 2026-06-23). 캔 설비는 2022 발표 뒤 미가동',
    note: '2025 매출 855만 위안 · 순손실 75만 위안 · 2026-06 바누아투 정부 감사 착수 · 시 단위 근사 좌표' },

  // ── ⅩⅩⅪ 上海开创 — 캔은 스페인 Albo 공장 하나. 저우산은 로인, 마셜 식품 법인은 멈춤 ─────
  { company: 'kaichuang', numeral: 'ⅩⅩⅪ', kind: 'plant', label: 'Albo 살바테라 데 미뇨 공장(PLISAN)', country: '스페인',
    lat: 42.08, lng: -8.47,
    basis: 'ⅩⅩⅪ · 연보: 신공장 투자 2,525만 유로(부가세 공제 뒤)·2021-04 착공·2022-12 시생산. 2025 캔 생산 5,809만 캔(연보, 규모 단위가 캔이라 크기로 싣지 않음)',
    note: '2023-04 개소(Cadena SER) · 비고·셀레이로 공장 2022년 폐쇄 · 타피아 조제식품 2026-03 이전(Expansión) · 산업단지 단위 근사 좌표' },
  { company: 'kaichuang', numeral: 'ⅩⅩⅪ', kind: 'plant', label: '舟山环太 岱山 로인 공장', country: '중국',
    lat: 30.25, lng: 122.20, sizeValue: 10968, sizeUnit: '톤/년',
    basis: 'ⅩⅩⅪ · 2025 연보 로인(鱼柳) 생산 10,968.47 t(생산 실적이지 능력이 아님) · 「产品以鱼柳为主，主要销往国外市场」 · 2022년 가동 · 캔 아님',
    note: '2025 로인 매출총이익률 1.07% · 2026 상반기 순손실 2,050만 위안 · 현 단위 근사 좌표' },
  { company: 'kaichuang', numeral: 'ⅩⅩⅪ', kind: 'plant', label: '泛太食品(마셜제도) 식품 법인', country: '마셜제도',
    lat: 7.09, lng: 171.38,
    basis: 'ⅩⅩⅪ · 연보 손자회사 「远洋捕捞及食品加工业」 · 2025 매출 7,519만 위안 · 제품·능력은 연보에 없음',
    note: '2023·2026 상반기 연보 「停工损失」 — 가동이 멈춘 기간이 있다 · 마주로 근사 좌표' },

  // ── ⅩⅩⅫ Alliance Select — 공장이 아니라 부지가 하나다 ─────
  { company: 'alliance', numeral: 'ⅩⅩⅫ', kind: 'plant', label: 'Alliance Select 제너럴산토스 공장', country: '필리핀',
    lat: 6.06, lng: 125.13, sizeValue: 102, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅫ · Purok Saydala, Barangay Tambler, General Santos City · 부지 68,751 ㎡(AMHI 소유, ASFII 임차) · 처리량 102 t/일(2025 주주총회 의사록), 가동률 81%(2024) · 명판 능력은 공시에 없다',
    note: '같은 부지에 캔·파우치·냉동 로인 설비와 어분·어유 설비, Big Glory Bay 연어 설비(985.88 ㎡)가 함께 있다 · 2013년 Foodport 가공 경제구역 지정 · 2026-06-08 지진으로 중단, 6-18 단계 재개 · 구 단위 근사 좌표' },
  { company: 'alliance', numeral: 'ⅩⅩⅫ', kind: 'plant', label: 'PT IAFI 비퉁 공장(가동 중단)', country: '인도네시아',
    lat: 1.44, lng: 125.19,
    basis: 'ⅩⅩⅫ · 2008년 인수·일 90 t으로 증설 · 2019-10-18 고정자산 매각 후 사업 목적을 수출 무역으로 변경 · 2023~2025년 영업 없음',
    note: '일 90 t은 매각 전 수치다 — 제너럴산토스 능력으로 옮겨 쓰지 않는다 · 투자액 499만 9,000달러 전액 손상 · 시 단위 근사 좌표' },

  // ── ⅩⅩⅩⅢ Grupo Herdez — 2020년에 판 공장. 지금은 남의 것이다 ─────
  { company: 'herdez', numeral: 'ⅩⅩⅩⅢ', kind: 'plant', label: '푸에르토치아파스 참치 공장(2020년 매각)', country: '멕시코',
    lat: 14.71, lng: -92.40, sizeValue: 22240, sizeUnit: '톤/년',
    basis: 'ⅩⅩⅩⅢ · Grupo KUO 2019년 연차보고서 공장표: 푸에르토치아파스 · 1997년 가동 · 참치·어유·단백분 · 연 22,240 t · 가동률 56%(환산 처리량 12,454 t, 계산) · 2019년까지 청정산업·MSC 인증 보유',
    note: '2020-07-29 매각 — 현재 운영자는 Procesamiento Especializado de Alimentos(상표 등록·항만청 기록). 2022년 KUO 공장표에서 이 행이 사라졌다 · 항만 단위 근사 좌표' },

  // ── ⅩⅩⅩⅣ 사조씨푸드 — 원문이 「공장」이라 부르는 곳은 김을 만드는 익산뿐이다 ─────
  { company: 'sajoseafood', numeral: 'ⅩⅩⅩⅣ', kind: 'plant', label: '부산 참치 가공·냉동 거점', country: '대한민국',
    lat: 35.09, lng: 129.02, sizeValue: 6336, sizeUnit: '톤/년',
    basis: 'ⅩⅩⅩⅣ · 부산광역시 서구 원양로 71 · 명판 6,336 t/년(8시간 × 22일 × 24 t × 12개월, 264일 가정) · 2025 생산실적 7,583 t · 가동률 105.74%(2,191hr ÷ 2,072hr, 259일 가정) · 부문 설비 장부가 3억 5,962만 원(토지·건물 0)',
    note: '사업보고서는 주소를 적지 않는다 — 이 주소는 같은 그룹 종속회사 등기 주소이고 동일 건물인지 원문이 말하지 않는다 · 원문의 이름은 「부산사업」·「부산물류센터」·「부산창고」 셋이고 동일성 판정이 없다 · 유일한 설비 사양은 −25℃ 냉동창고 한 줄 · 냉동창고 777㎡는 최대주주 사조산업에서 임차(2025 임차료 3억 6,942만 원) · 구 단위 근사 좌표' },
  { company: 'sajoseafood', numeral: 'ⅩⅩⅩⅣ', kind: 'plant', label: '익산공장(조미김)', country: '대한민국',
    // 명판이 봉 단위라 크기 축(톤/년·MT/일·명)에 얹을 수 없다. 얹으면 참치 능력처럼 읽힌다.
    lat: 35.94, lng: 126.98,
    basis: 'ⅩⅩⅩⅣ · 전라북도 익산시 석암로9길 26 · 명판 22,491만 봉/년(8시간 × 22일 × 89만 봉 기준) · 2025 생산실적 12,742만 봉 · 가동률 93.24% · 식품부문 유형자산 65억 8,325만 원(토지 20억 7,380만 포함) · 2007-04 HACCP',
    note: '참치 라인이 아니다 — 조미김이다. 참치 가공은 부산 거점이 맡는다 · 사업보고서는 「익산공장」 이름만 적고 주소를 적지 않는다 · 시 단위 근사 좌표' },

  // ── ⅩⅩⅩⅤ Conservas Garavilla — 가공공장 넷. 도면이 있는 곳은 오 그로베뿐이다 ─────
  //    크기 축을 넷에 고르게 줄 수 없다. 오 그로베는 인가 「캔상자」라 톤·명 축에 못 얹고,
  //    카보 데 크루스는 면적·능력·인원이 전부 원문에 없다. 사람이 잡히는 두 곳에만 크기를 준다.
  { company: 'garavilla', numeral: 'ⅩⅩⅩⅤ', kind: 'plant', label: '오 그로베 공장(Bolton Food S.L.)', country: '스페인',
    lat: 42.4944, lng: -8.8873,
    basis: 'ⅩⅩⅩⅤ · Rúa Jaime Amézaga 144, 36980 오 그로베(폰테베드라) · 좌표는 EU 산업배출 포털 사업장 레코드(식별자 5480)의 42.494391 / −8.887325 · 갈리시아 통합환경허가 AAI 2006/0347 · 부지 44,131 ㎡ + 공유수면 점용 14,900 ㎡ · 인가 라인 2024-03 15개 → 2025-03 9개(참치 전용 5·고등어 4) · 인가 캔상자 5,587,610 → 6,744,212(참치 몫 3,910,568은 개편 전후 동일) · 보일러 3×5.22 MWt·스팀 6,000 kg/h · 담수 301,015 ㎥/년·해수 125,000 ㎥/년·방류 821,250 ㎥/년·신 폐수처리장 1,500 ㎥/일',
    note: '분당 665캔과 가동률 32.06%는 2025년에 폐지된 홍합 라인의 명판값이라 현재형으로 쓰지 않는다 · 참치를 다루던 라인은 13 → 5로 줄었고 같은 것은 라인 수가 아니라 참치 인가 능력이다 · 2025년 배출 2,778 tCO2eq · 공장 단독 인원은 원문에 없다(Bolton Food S.L. 법인 평균 444.32명, 2022)' },
  { company: 'garavilla', numeral: 'ⅩⅩⅩⅤ', kind: 'plant', label: '카보 데 크루스 공장', country: '스페인',
    lat: 42.625, lng: -8.81,
    basis: 'ⅩⅩⅩⅤ · 카보 데 크루스, 보이로(A Coruña) · 번지는 원문에 없다(교구 단위 근사 좌표) · GCG 비재무정보보고서의 「plantas transformadoras」 넷 중 하나 · 2025년 배출 663 tCO2eq(2024년 421)',
    note: 'IPPC 시설이 아니다 — 갈리시아 AAI 명부 122건과 EU 산업배출 등록부 두 대조군에 모두 없고 이는 누락이 아니라 완제품 일 75 t 문턱 아래라는 뜻이다 · 면적·라인·능력·실적·인원이 전부 원문에 없다 · EINF 2022가 이곳을 「폰테베드라」로 적은 것은 오기이고 보이로는 A Coruña 도다' },
  { company: 'garavilla', numeral: 'ⅩⅩⅩⅤ', kind: 'plant', label: '만타 공장(Conservas Isabel Ecuatoriana)', country: '에콰도르',
    lat: -0.943, lng: -80.702, sizeValue: 1799, sizeUnit: '명',
    basis: 'ⅩⅩⅩⅤ · Calle 125 y Av. 103, Los Esteros, 만타(등기 주소, 구 단위 근사 좌표) · 에콰도르 평균 인원 1,799.00명(2022, 남 622·여 1,177) · 에너지 116,652.77 GJ(2022) · 2025년 배출 11,692 tCO2eq(2024년 15,211) · ARCSA 회수 결의 ARCSA-LR-AAPG-359-24(로트 L24-162-OBV, 비소 INEN 184:2013 초과, 해당 라인 상업활동 잠정정지)',
    note: '사람이 가장 많은데 가장 얇게 보인다 — 면적·라인 수·분당 캔 수·능력·가동률이 전부 원문에 없다 · 「만타 월 28,000 t」은 에콰도르 산업 전체 값이라 이 공장에 옮겨 적지 않는다 · 인원 3,533명은 CIESA + Seafman 합이라 단독으로 쓰면 거짓이다 · 오 그로베의 라인·속도·면적을 이 칸에 옮기지 않는다' },
  { company: 'garavilla', numeral: 'ⅩⅩⅩⅤ', kind: 'plant', label: '아가디르 공장(Société Nouvelle Cosarno)', country: '모로코',
    lat: 30.428, lng: -9.645, sizeValue: 428, sizeUnit: '명',
    basis: 'ⅩⅩⅩⅤ · Rue Al Bahara, Quartier Industriel Anza, BP 6196, 80002 아가디르(공업지구 단위 근사 좌표) · 모로코 평균 인원 428.00명(2022) · 에너지 35,972.77 GJ(2022) · 2025년 배출 4,890 tCO2eq(2024년 4,167) · ONSSA 위생승인 2081(통조림)',
    note: '같은 주소에 승인이 둘이다 — NOUVELLE COSARNO 2(PEF.25.0195.18)는 가공이 아니라 냉장 보관이다 · 면적·라인·능력·실적이 원문에 없다 · 「73,000 t」은 분모가 그룹 판매량(56,000 t 이상)을 넘어서므로 단독 인용하지 않는다 · 2024년 물 위험 평가에서 그룹 전 사업장 중 물리적 위험 최고' },

  // ── ⅩⅩⅩⅥ Salica — 가공공장 셋. 문턱이 문서를 정한다 ─────
  //    모회사 Albacora(편 Ⅲ)가 같은 세 곳을 이미 찍었다. 편이 다르면 핀도 달라야
  //    호버가 섞이지 않으므로 세 곳 모두 기존 좌표에서 띄웠다.
  //    크기 축은 셋 다 「명」으로 맞춘다 — 면적·능력·실적은 세 칸을 채우지 못한다
  //    (베르메오만 허가에 능력이 있고, 포소르하는 면적도 라인도 원문에 없다).
  { company: 'salica', numeral: 'ⅩⅩⅩⅥ', kind: 'plant', label: '베르메오 공장(Salica Industria Alimentaria)', country: '스페인',
    lat: 43.4055, lng: -2.7425, sizeValue: 138, sizeUnit: '명',
    basis: 'ⅩⅩⅩⅥ · Polígono Industrial Landabaso, 48370 베르메오(공단 단위 근사 좌표) · 통합환경허가 AAI00228(코드 16-I-01-000000000228, 최초 2012-04-18 · 개정 2023-11-30, 바스크 관보 2024/515) · 부지 18,150 ㎡ · 건축 12,224.59 ㎡ · 인가 능력 48,015 t/년(범주 9.1.b.i, 완제품 기준) · 증기발생기 YGNIS 2기(각 5 MW 미만, 굴뚝 10.5 m·12.5 m) · 용수 100% 시 상수도 · 방류는 시 하수 한 점, 새벽 1시~6시 금지 · 균질조 2×250 ㎥ + 부상분리 · 2025년 인원 138명 · 2025년 매출 65.8 M€',
    note: '셋 중 사람이 가장 적은데 문서가 가장 두껍다 — 산업배출지침 범주에 걸려 12년 동안 정기검사를 다섯 번 받았다 · 2024년 실측 참치 투입 1,459 t · 물 36,200 ㎥ · 전력 1,051,371 kWh(태양광 27%) · 천연가스 2,441,333 kWh · 허가의 48,015 t과 2022년 총투입 5,838 t을 나눈 12.2%는 가동률이 아니다(완제품 상한 대 캔·세척제 포함 원료·부자재) · 「가장 작은 공장」은 사람 기준이고 부지는 아 포브라가 작다' },
  { company: 'salica', numeral: 'ⅩⅩⅩⅥ', kind: 'plant', label: '아 포브라 두 카라미냘 공장(Salica Alimentos Congelados)', country: '스페인',
    lat: 42.5785, lng: -8.9285, sizeValue: 68, sizeUnit: '명',
    basis: 'ⅩⅩⅩⅥ · A Pobra do Caramiñal(A Coruña) · 번지는 원문에 없다(읍 단위 근사 좌표) · CIF A15670748 · RM A Coruña Hoja SC-22395 · 설립 1998-11-20 · **S.A.이지 S.L.이 아니다** · 2004년 신공장 부지 10,000 ㎡ · 건축 5,500 ㎡ · 가동 190일/년 · 완제품 2024년 2,230.20 t · 2025년 인원 68명 · 2025년 매출 15.7 M€',
    note: '통합환경허가 대상이 아니다 — 완제품 하루 21 t으로 문턱에 못 미치고 갈리시아 허가 등록부에 이 공장이 없다(같은 읍의 허가 보유 두 곳은 다른 회사) · 그런데 회사가 스스로 내는 환경선언의 암모니아성 질소 연평균이 2021~2024년 46·33·36·37 mg/L로 한도 30을 네 해 연속 넘는다 · 「갈리시아가 베르메오보다 더럽다」로 읽지 않는다, 감시체계가 다르다(주 검사 대 자기 신고) · 2004년 신공장 총투자 5,743,842 €의 절반이 보조금이고 2025-09 해양 회복탄력성 사업도 2,469,947.79 € 중 절반(1,234,973.90 €)이 보조금이다' },
  { company: 'salica', numeral: 'ⅩⅩⅩⅥ', kind: 'plant', label: '포소르하 공장(Salica del Ecuador)', country: '에콰도르',
    lat: -2.7178, lng: -80.2745, sizeValue: 2358, sizeUnit: '명',
    basis: 'ⅩⅩⅩⅥ · Nery Chalén, Guarillo Grande-Posorja(구역 단위 근사 좌표) · RUC 0992185228001 · 설립 2001-04-18(공정증서 22001072829 — GLEIF의 2001-07-25는 오류) · 에콰도르 생산부 수산가공공장 명부 공식코드 PP-670(내부코드 261) · 국제선박항만보안 사설 수출 터미널 ECPSJ-0001 · 2025년 인원 2,358명 · 2025년 매출 233.3 M€ · Albacora S.A. 직접 99.99998%',
    note: '「관청 문서가 0건」이 아니다 — 명부에 코드로 있고 유럽연합이 발주한 2024년 6월 항만 보안 평가에도 위험도 「alto」로 들어간다. 열리지 않은 것은 이 회선이다 · 면적·라인 수·능력·생산실적이 전부 원문에 없어 크기 축은 인원으로만 준다 · 물량은 그룹 원단위 역산으로만 보인다(2022년 6.4만 → 2025년 8.8만 t, +38%, B등급) — 회사 자칭 「연 55,000 t」과 어긋난다 · 2019년 특수관계 매출이 총수익의 32%였다' },

  // ── ⅩⅩⅩⅦ Majestic — 공장 하나. 값은 많고 실측은 하나다 ─────
  //    크기 축에 명판을 쓰지 않는다. 120·150·200·250·350·380·600 t/일 일곱 값은 전부
  //    계획·명판·전망이고, 실제로 돌아간 날을 적은 원문은 2019년 하나뿐이다.
  //    같은 도시에 Frabelle(편 Ⅷ) 라에 핀이 이미 있어 좌표를 떼어 놓았다 — 다른 법인이다.
  { company: 'majestic', numeral: 'ⅩⅩⅩⅦ', kind: 'plant', label: '라에 말라항 공장(Majestic Seafood)', country: '파푸아뉴기니',
    lat: -6.686, lng: 147.028, sizeValue: 80, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅩⅦ · Portion 640, Busu Road, Malahang, Lae, Morobe Province 411(말라항 공업지구 단위 근사 좌표) · 유럽연합 승인 07EPR5110(가공시설, 같은 목록에 이 나라 가공시설 다섯 곳 더) · 크기 값 80 t/일은 **명판이 아니라 2019년 실측 가동**이다(가용으로 적힌 값은 250) · 캔참치 + 냉동 쿡트 로인 · 2013-06 개장 · 2023-06 중단',
    note: '능력으로 적힌 값이 일곱이다(120·150·200·250·350·380·600 t/일) — 전부 계획·명판·전망이라 지도의 크기 축에 올리지 않았다. 「350 t/일 공장」을 실적으로 쓴 원문은 0건이고 2019년 명판은 250으로 내려가 있는데 그 사유를 적은 원문이 없다 · 부지·건물 면적과 연도별 생산 실적은 원문 0건이다(설비 명세 열 칸 중 두 칸이 통째로 빈다) · 「5,000명이 일하던 공장」이 아니다 — 2012-08 「완전 가동이면 최소 5,000명」 전망치이고 폐쇄 시 파트너사 집계는 1,300명이다 · 「2,100명」·「선단 20→14척」·「냉동창고 1,000 t·K6M」은 같은 도시 이웃 공장(Frabelle PNG) 수치다 · 서류는 살아 있다 — Friend of the Sea 2029-04-14까지 유효 · Dolphin Safe 등재 · 중국 해관총서 9598200018(상업 미러) · 다만 MSC-C-54164는 회원명부에만 있고 공급자 디렉터리에서 확인되지 않는다' },

  // ── ⅩⅩⅩⅧ S.C.A — 공장 하나. 본사와 같은 부두다 ─────
  //    크기 축에 명판을 쓰지 않는다. 「하루 120 t」은 회사가 말한 명판이고, 같은 취재가
  //    그때 실제를 하루 90~100 t 이라 적는다. 명판과 실제가 한 문서에 함께 적힌 자리가
  //    거기 하나뿐이라 크기 값은 실측 구간의 하한 90 을 쓴다.
  //    연 단위로 적힌 값 여덟(15,000~18,000·20,000 통조림·20,000 대사관 전망·25,000·15,000·50,000·30,000·60,000)은
  //    설비 상한·그때 가공량·원어 처리량·목표·전신 공장 능력이 뒤섞인 것이라 올리지 않았다.
  { company: 'sca', numeral: 'ⅩⅩⅩⅧ', kind: 'plant', label: '다카르 몰 10 공장(S.C.A)', country: '세네갈',
    lat: 14.6755, lng: -17.4293, sizeValue: 90, sizeUnit: 'MT/일',
    basis: 'ⅩⅩⅩⅧ · Quai de Pêche, Môle 10, BP 782, 다카르(다카르 자치항 어항 부두 단위 근사 좌표) · 유럽연합 수출 인가 005/93/C(현행 목록 2026-08-24 유효 · 명부가 「구 SE-SNCDS」 승계를 같은 줄에 적는다) · 관리연쇄 증서 MSC-C-65106(2026-05-08~2029-05-07) · 미국 식품의약국 등재 · IFS · BRC · 크기 값 90 t/일은 **명판이 아니라 2025년 5월 실가동 90~100 t 의 하한**이다(명판으로 적힌 값은 120)',
    note: '능력으로 적힌 값이 여덟인데 **실적을 적은 것이 0건**이다 — 설비 상한 50,000 t/년(회사 영문 사이트)·그때 가공량 30,000(2025-07 그룹 브리핑)·목표 60,000(같은 브리핑)·전신 공장 25,000(2011년 인수 발표)·2018년 원어 처리량 15,000(매체)·1968년 시설 두 값·주세네갈 한국대사관 2016년 자료의 2022년 전망 20,000이 뒤섞여 있다. 모회사 공시 열다섯 건 전수 검색에서 능력 값은 0건이다 · 부지·건물 면적과 연도별 생산 실적은 어느 원문에도 없고 라인은 캔·파우치 두 계열만 확인된다(대수·속도 없음) · 「하루 120 t 공장」을 실적으로 쓰지 않는다 — 실가동이 90~100이고 회사가 든 사유는 「물고기가 귀하다」다 · 「연 50,000 t 공장」도 실적이 아니다 · 전신 공장(1968년 Conserveries du Sénégal · SNCDS)의 능력·고용을 이 회사 것으로 쓰지 않는다, 승계된 것은 부지와 인가번호다 · 고용은 2024년 1월 1,700명 → 2025년 5월 1,300명이고 사유가 적힌 원문이 없다, 「1,700명 이상」·「1,800명 가까이」는 조업사와 **합산**이다' },
];

/**
 * 위치가 확인되지 않은 공장.
 *
 * **지도에 찍지 않는다.** 회사 패널에서 개수만 낸다 — 「위치 미확인 n곳」.
 * 찍어 넣으면 없는 정밀도를 만드는 것이다.
 */
export const UNLOCATED_PLANTS: { company: string; count: number; basis: string }[] = [
  { company: 'jealsa', count: 7, basis: 'Ⅸ stats.산업공장 = 7 · 위치 미확인' },
  { company: 'bumblebee', count: 1, basis: 'ⅩⅣ stats.자가_참치공장 = 1 · 위치 미확인' },
  { company: 'thaiunion', count: 1, basis: 'Ⅱ factories[12] · Tri-Union Seafoods 미국 · 도시 미확인' },
  { company: 'nauterra', count: 1, basis: 'Ⅹ plants[2] · 브라질 용기공장 · 도시 미확인' },
];

/**
 * 선단의 **기국** 분포.
 *
 * 20편에 **모항이 한 건도 없다.** 기국은 배가 어디서 조업하는지가 아니라 어느 나라 깃발을
 * 다는지다. 그래서 이 값을 지도 위 점으로 만들지 않는다 — 회사 패널의 배지로만 쓴다.
 */
/**
 * 선단의 기국.
 *
 * ⚠ **기국이 아닌 칸이 섞인다.** 편에 따라 등록부 이름(WCPFC 등록·ICCAT 비활성)이나
 * 소유 구분(해외 자회사·합작)으로만 적힌 것이 있다. 그것을 나라처럼 배지에 늘어놓으면
 * 「어느 나라 깃발을 다는가」라는 물음에 다른 축의 답을 섞어 내는 것이 된다.
 * `isFlag: false` 로 갈라 화면에서 따로 낸다.
 */
export const FLAG_STATES: {
  company: string;
  flags: { country: string; count: number; isFlag?: false }[];
  basis: string;
  /** 배지에 같이 띄울 단서. 척수의 성격이 소유가 아닐 때 쓴다. */
  note?: string;
}[] = [
  { company: 'albacora',
    flags: [{ country: '스페인', count: 8 }, { country: '파나마', count: 2 }, { country: '모리셔스', count: 2 }],
    basis: 'Ⅲ fleet · 등록부 확인 12척(회사 표기 23척·웹 18척)' },
  { company: 'nauterra',
    flags: [{ country: '엘살바도르', count: 7 }, { country: '스페인', count: 1 }],
    basis: 'Ⅹ fleet · 선명·IMO·기국·유형' },
  { company: 'itochu',
    flags: [{ country: '대만', count: 12 }, { country: '대한민국', count: 6 }, { country: '키리바시', count: 3 },
            { country: '투발루', count: 2 }, { country: '바누아투', count: 2 }],
    basis: 'Ⅴ fleet · MSC 집단인증 명부 25척 · 인증 보유자가 ITOCHU일 뿐 소유선이 아니다',
    note: 'MSC 집단인증 명부 — 소유선이 아니다' },
  { company: 'sajo',
    flags: [{ country: '대한민국', count: 6 }, { country: '해외 자회사', count: 2, isFlag: false }],
    basis: 'ⅩⅢ fleet · purse · 참치선망 8척' },
  { company: 'dongwon',
    flags: [{ country: '대한민국', count: 24 }, { country: '합작', count: 1, isFlag: false },
            { country: '해외 자회사', count: 10, isFlag: false }],
    basis: 'ⅩⅡ fleet · 총 35척(선망 19)' },
  { company: 'jealsa',
    flags: [{ country: '등록부 확인', count: 3, isFlag: false }],
    basis: 'Ⅸ fleet · 회사 표기 2척 / 등록부 3척' },
  { company: 'kyokuyo',
    flags: [{ country: '일본', count: 4 }],
    basis: 'ⅩⅥ sourcenotes · 전부 100% 자회사 極洋水産 명의' },
  { company: 'nissui',
    flags: [{ country: '일본', count: 2 }],
    basis: 'ⅩⅧ sourcenotes · WCPFC 등록부 + MSC-F-31618' },
  { company: 'bolton',
    flags: [{ country: 'WCPFC 등록', count: 10, isFlag: false }, { country: 'IATTC 등록', count: 4, isFlag: false },
            { country: 'ICCAT 비활성', count: 3, isFlag: false }],
    basis: 'Ⅵ ownFleet · 조달 선단 399척과 혼동하지 않는다' },
  { company: 'nirsa',
    flags: [{ country: '에콰도르', count: 14 }],
    basis: 'ⅩⅩⅤ · IATTC 등록부 2026-08-17 등록 소유자 NIRSA S.A. 선망 14척 15,639 m³',
    note: '넷은 파나마·니카라과·코스타리카 어창 용적 이전선이다 — 기국은 에콰도르. 운항만 맡은 El Marquez(파나마 법인 소유)는 넣지 않았다' },
  { company: 'eurofish',
    flags: [{ country: '에콰도르', count: 15 }, { country: '인증 연계', count: 19, isFlag: false }],
    basis: 'ⅩⅩⅥ · MSC-F-31557 부속서(2024-07-03) Eurofish 연계 19척 중 IATTC 2026-08-17 에콰도르 기국 15척 15,894 m³',
    note: '소유가 아니라 인증 연계 — 등록 소유자는 에콰도르 단선 법인·스페인·파나마·미국 법인. 소유자 칸 Eurofish 0척' },
  { company: 'cnfc',
    flags: [{ country: '중국', count: 61 }],
    basis: 'ⅩⅩⅩ · RFMO 등록부(2026-08-17) 소유 명의 CNFC OVERSEAS FISHERIES 68행, 기구 간 중복 제외 61척 · 전부 연승',
    note: '선망선은 자회사 中渔环球 명의로 따로 등록 — 여기 세지 않았다. 등록은 조업의 증거가 아니다' },
  { company: 'kaichuang',
    flags: [{ country: '중국', count: 6 }, { country: '마셜제도', count: 6 }],
    basis: 'ⅩⅩⅪ · RFMO 등록부(WCPFC·FFA, 2026-08-17) 선망 12척 — 중국 선적 JIN HUI 6·8·9·68(开创远洋)·18·58(上海远洋渔业 소유, 开创 임차) · 마셜 선적 6척(泛太渔业, JUNMETO 2025-12 인도)',
    note: '연보의 선망 11척은 JUNMETO 투입 전 수 · 운반선 KAICHUANG 101·102(지배주주 소유)는 세지 않았다. 등록은 조업의 증거가 아니다' },
  { company: 'sajoseafood',
    flags: [{ country: '대한민국', count: 3 }],
    basis: 'ⅩⅩⅩⅣ · 2025 사업보고서 별도 주석 「당기말 현재 당사 보유의 원양참치어선은 3척으로 만선기준으로 1,600톤의 어획능력」 · 구성 선망 1·연승 2 · 선박 장부가 102억 4,430만 원, 3개년 취득·처분 0',
    note: '연승 점유는 회사 단독 853 M/T·1.8%·2척이다 — 사조그룹 소계 13,156 M/T·28.2%·32척과 섞지 않는다' },
  { company: 'garavilla',
    flags: [{ country: '에콰도르', count: 2 }, { country: '스페인', count: 2 }],
    basis: 'ⅩⅩⅩⅤ · IATTC·WCPFC 선박등록부 선주명 조회 — 에콰도르 선적 SAN ANDRES(IMO 8909252·GT 2,193)·CHARO(IMO 8107646·GT 2,384, 1985년 Astilleros del Cadagua 건조)는 Conservas Isabel Ecuatoriana S.A. 등기소유, 스페인 선적 AURORA B(IMO 9156058·GT 2,479)·ROSITA C(IMO 9210969·GT 2,501.88)는 Atunera Dularra S.L. 소유 · 전부 선망',
    note: '에콰도르 두 척은 등기 소유자가 만타 법인이고 2022년 1월부터 운영은 그룹의 수산 트레이딩 회사다 — 소유와 운영이 갈려 있다 · 선적항은 1차로 확인되지 않아 적지 않는다 · 이 4척이 2022년에 태운 567,823.7 GJ는 공장 넷 합(237,070.59 GJ)의 2.39배다' },
  { company: 'salica',
    flags: [{ country: '그룹 보고서 기재(기국 미확인)', count: 23, isFlag: false }],
    basis: 'ⅩⅩⅩⅥ · Albacora 그룹 비재무정보보고서 2025 — 선박 23척(용선 4척 포함) · 어획 2024년 207,000 t · 2025년 약 200,000 t',
    note: '이 편의 주어는 가공 세 법인이고 배는 모회사 Albacora S.A.(편 Ⅲ) 것이다 — 기국 내역은 이 편의 원문에 없어 나라로 세지 않는다 · 「선망선 18척」은 웹 표기이고 보고서는 23척이다 · 그룹 가공량 역산 92,800 t을 대면 잡은 것의 46%쯤이 그룹 공장을 거치고, 스페인 두 공장만 보면 5% 수준이다' },
  { company: 'majestic',
    flags: [{ country: '용선 3척(기국 미확인)', count: 3, isFlag: false }],
    basis: 'ⅩⅩⅩⅦ · 2026년 유효 용선 3척 — CHESSA-888(운반선 2,045 t) · QUEEN EVELYN-101 · QUEEN JENNY-138',
    note: '**소유가 아니라 용선이다** — 「배 셋을 소유한다」로 쓰지 않는다 · 기국이 이 편의 원문에 없어 나라로 세지 않는다 · 생산은 2023-06에 멈췄지만 배 세 척은 2026년에도 이 회사 이름으로 등록부에 남아 있다, 멈춘 것은 생산이고 서류는 살아 있다' },
];

/** 배가 0척인 회사. 이 사실 자체가 이 산업의 구조다. */
/**
 * 이 층에 선단이 없는 회사.
 *
 * ⚠ 대부분은 **등록부·명부의 부재**이지 소유의 부재가 아니다. 「배가 0척이다」로
 * 뭉치면 확인한 것보다 센 말이 된다 — 화면 문구는 「자사 명의 등재 0척」으로 낸다.
 */
export const NO_FLEET: { company: string; basis: string }[] = [
  { company: 'frinsa', basis: 'Ⅰ stats · 보유 선단 0척' },
  { company: 'thaiunion', basis: 'Ⅱ stats · 보유 선단 0척' },
  { company: 'fcf', basis: 'Ⅳ stats · 자사 보유 어선 0척(협력 공급 어선 600척+)' },
  { company: 'starkist', basis: 'ⅩⅠ registries · RFMO 자사 명의 0척' },
  { company: 'bumblebee', basis: 'ⅩⅣ stats · 선박명부 등재 0척' },
  { company: 'centurypacific', basis: 'ⅩⅨ stats · RFV 어선 0척(매입의 59%는 선박 직구매)' },
  { company: 'jais', basis: 'Ⅶ stats · 공장·선박·자회사 0개' },
  { company: 'alliance', basis: 'ⅩⅩⅫ · 공시에 자사 어선 기재 없음 — 어업 자회사 PT Van De Zee 2024-08 청산 · 관계사 2014년 조업 중단 · 유형자산에 선박 계정 없음(운송장비 33만 3,510달러가 전부)' },
  { company: 'herdez', basis: 'ⅩⅩⅩⅢ · 2020-07-29 참치 어선·조업장비 매각 공시 — 이후 선단 기재 없음. 2015년 어업청 발표의 8척이 매각 전 마지막 수치(B)' },
  { company: 'trimarine', basis: 'ⅩⅩⅠ · WCPFC·IATTC·FFA 세 등록부의 소유자·운영자 칸 모두 0척. 배는 계열 NFD 명의다' },
  { company: 'princes', basis: 'ⅩⅩⅡ · ISSF PVR(2026-08-20)·FFA Good Standing(2026-09-02) 두 명부에 0척. 회사 ESG 보고서도 「선박을 소유하지 않는다」로 적는다' },
  { company: 'iot', basis: 'ⅩⅩⅢ · 자사 명의 어선 0척. 이 나라 국적 선망 13척은 경쟁 그룹 공급선 명부와 IMO 기준 전부 겹치지만 이 공장의 구매 문서는 없다' },
  { company: 'ati', basis: 'ⅩⅩⅣ · WCPFC 승인선박기록(2026-08-17) 인도네시아 145척 중 소유사·주소 0척. FIP 명부 118척은 운영사 소유다' },
  { company: 'tecopesca', basis: 'ⅩⅩⅦ · IATTC 등록부(2026-08-17) 소유·운항자 칸 0척, TUNACONS MSC 부속서 0건. 원료는 해마다 바뀌는 매입처(2019 특수관계자 표 13곳)에서 산다' },
  { company: 'dongwonfnb', basis: 'ⅩⅩⅧ · 자사 선박 0척. 원료는 모회사 동원산업(선망 11척·연승 8척 등 35척)에서 산다 — 2025년 1,172억 원(특수관계자 주석)' },
  { company: 'sca', basis: 'ⅩⅩⅩⅧ · 공시상 영업활동이 「참치제품 가공 및 유통」·「제조업」이고 **선박 기재가 한 줄도 없다**. 같은 부두의 조업사 CAPSEN(동원산업 49% · 연결 사유 「실질지배력 보유」)이 배를 갖는다 — 서아프리카 최초 해양관리협의회 인증(MSC-F-31638)을 받은 조업 단위가 그쪽이고 인증 단위 이름은 「CAPSEN & Grand Bleu」 공동이다(인증 시점 여섯 척 중 둘은 Grand Bleu 소유). 모회사 사업보고서의 「해외 자회사 선망선 7척」은 법인별로 쪼개지지 않아 세네갈 몫을 확정할 수 없다' },
  { company: 'hagoromo', basis: 'ⅩⅩⅨ · 자사 선박 0척(2026년 3월기 유가증권보고서에 「船舶」·「漁船」 0회). 원료·위탁 제품은 상사 경유 — PT Aneka Tuna 제품 매입 62억 792만 엔은 전량 伊藤忠商事 경유' },
];

/** 지도에 찍는 모든 점. */
export const ALL_POINTS: GeoPoint[] = [...HQ_POINTS, ...PLANT_POINTS];

/** 좌표가 지구 위에 있는가. 테스트가 이 함수를 쓴다. */
export function isValidCoord(p: GeoPoint): boolean {
  return p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180;
}

/** 크기를 줄 수 있는 점인가. 본사는 언제나 false다(1번 규칙). */
export function hasSize(p: GeoPoint): boolean {
  return p.kind === 'plant' && typeof p.sizeValue === 'number' && !!p.sizeUnit;
}
