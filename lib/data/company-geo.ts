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
