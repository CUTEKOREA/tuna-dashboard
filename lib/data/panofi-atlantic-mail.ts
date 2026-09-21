/**
 * PANOFI 「대서양 상황」 주말 메일 (가나 법인 → 본사 팀장, 사용자 제공 캡처 3건).
 *
 * 주간동향 docx(화요일자)와 같은 주를 다루지만 주말에 한 번 더 온다. MGO 는 직전 주간동향 값을
 * 그대로 옮긴다 — 8/30 메일 = 8/25 판, 9/6 = 9/1 판, 9/13 = 9/8 판, 9/20 = 9/15 판(`weeklyPair`, 테스트가 대조한다).
 * 메일에만 있는 값(스카사 어가, 그랑블루 판매가·운임, 코스모 원어 재고, 세네갈 입출항)을 여기 둔다.
 *
 * 발신·수신자, 선장·임원 등 사람 이름은 싣지 않는다. 좌표도 싣지 않는다(해역 이름으로만).
 */

export interface AtlanticMailCall {
  vessel: string;
  tons: number | null;
  /** 원문 표기 그대로 «8/22». 연도는 2026. */
  arrive: string;
  depart: string | null;
  status: string;
}

export interface AtlanticMail {
  /** 본문 「대서양 상황(9월 13일)」의 기준일 */
  date: string;
  /** MGO 가 같은 주간동향 reportDate */
  weeklyPair: string;
  mgo: { tema: number; tanker: number | null; abidjan: number | null; dakar: number | null };
  cosmo: {
    priceUsd: number;
    priceMonth: string;
    nextMonthUnderNegotiation: boolean;
    dailyProcessingT: number;
    stock: { asOf: string; totalT: number; sjT: number; yfT: number | null; mixT: number | null };
  };
  pfc: { priceUsd: number | null; note: string | null };
  scasa: { priceUsd: number; dailyProcessingT: number };
  grandBleuSales: { market: string; priceUsd: number; terms: string }[];
  freightUsdPerT: number | null;
  senegalCalls: AtlanticMailCall[];
  notes: string[];
}

export const ATLANTIC_MAIL_SOURCE = 'PANOFI 「대서양 상황」 주말 메일 4건(8/30·9/6·9/13·9/20) 캡처';

export const atlanticMails: AtlanticMail[] = [
  {
    date: '2026-08-30',
    weeklyPair: '2026-08-25',
    // 다카 MGO 는 원문이 «XOF 650/KL ($1,120)» — 주간동향 8/25 판은 1,121 로 환산이 1 다르다.
    mgo: { tema: 1_563, tanker: 1_401, abidjan: null, dakar: 1_120 },
    cosmo: {
      priceUsd: 1_700, priceMonth: '8월', nextMonthUnderNegotiation: false, dailyProcessingT: 85,
      stock: { asOf: '2026-08-29', totalT: 4_165, sjT: 3_520, yfT: 25, mixT: 620 },
    },
    pfc: { priceUsd: null, note: '원어 부족(0톤)으로 금주 가공 중단' },
    scasa: { priceUsd: 1_800, dailyProcessingT: 100 },
    grandBleuSales: [{ market: '페루', priceUsd: 1_920, terms: 'CIF · 컨테이너' }],
    freightUsdPerT: null,
    senegalCalls: [
      { vessel: 'CAP ATLANTIQUE', tons: 42, arrive: '8/17', depart: null, status: '상가 수리 대기' },
      { vessel: 'GRANADA', tons: 700, arrive: '8/13', depart: '8/19', status: '하역 후 출항' },
      { vessel: 'XIXILI', tons: 955, arrive: '8/11', depart: '8/17', status: '하역 후 출항' },
      { vessel: 'SEA FRONTIER', tons: 830, arrive: '8/19', depart: '8/23', status: '하역 후 출항' },
      { vessel: 'SEA DEFENDER', tons: 920, arrive: '8/25', depart: null, status: '하역 중' },
    ],
    notes: [
      'P/COM 900톤 9/1 타코라디 입항, 수출 허가를 받아 아비장에서 하역 예정',
      '라이베리아·인근 공해 빠야오 기록이 좋아 P/MAS·P/PATH 조업 중, 아센시온 부근 동쪽에 빠야오 어장이 이어질 것으로 예상(P/GRACE)',
      'P/PATH·P/QUEEN·P/GRACE 입항 시기가 겹쳐 테마 코스모·GGL 창고와 스카사 상황을 보고 입항지·판매처 협의 중',
      'P/GRACE 9/4~5 만선 입항 예상, 어종 C·D, 마켓 사이즈 80~90%',
      '가나 수역 AGNES 1·IRIS QUEEN·IRIS J 실적 부진, MGO(1달 기준)를 다 쓰면 테마 입항 하역 예정',
      '모리타니아 기상 불량으로 피항이 잦고 월말까지 불량 예상 — 선박들이 남쪽 빠야오 어장으로 이동',
      '태평양 ELSPETH 10월까지 조업 후 세네갈 이동(현지인 합작 운영), CARIBE 도 대서양(세네갈)으로 이동 예정',
      '다카 조선소 문제로 COSMOS KIM 은 10월 아비장 까레나 조선소에서 상가 수리 계획',
    ],
  },
  {
    date: '2026-09-06',
    weeklyPair: '2026-09-01',
    mgo: { tema: 1_569, tanker: 1_445, abidjan: 1_302, dakar: null },
    cosmo: {
      priceUsd: 1_700, priceMonth: '8월', nextMonthUnderNegotiation: true, dailyProcessingT: 90,
      stock: { asOf: '2026-09-02', totalT: 4_174, sjT: 3_850, yfT: 51, mixT: 273 },
    },
    pfc: { priceUsd: 1_900, note: null },
    scasa: { priceUsd: 1_800, dailyProcessingT: 100 },
    grandBleuSales: [],
    freightUsdPerT: null,
    senegalCalls: [
      { vessel: 'COSMOS KIM', tons: 980, arrive: '8/22', depart: null, status: '하역 완료, 임시국적 증서 갱신 중' },
      { vessel: 'CAP ATLANTIQUE', tons: null, arrive: '8/17', depart: null, status: '출항 일정 미정, 상가 수리 대기' },
      { vessel: 'ORIENTAL KIM', tons: null, arrive: '9/5', depart: null, status: '톤수 확인 중, 하역 중' },
      { vessel: 'XIXILI', tons: 715, arrive: '9/1', depart: null, status: '운반선 BOYANG BERING 전재 중' },
    ],
    notes: [
      '라이베리아·인근 공해 빠야오 기록 양호, 아센시온 부근에서 잔고기 대어',
      '공해 수온이 오르며 빠야오에 고기 붙는 속도가 늦어지고 있어 어장이 서경 7도까지 옮겨갈 전망',
      '가나 연안에도 고기가 조금씩 보이며 사이즈는 SC·SD 위주',
      'P/GRACE 아비장 하역 후 마지막 항차, 선장·기관장 어기교대 준비',
      '모리타니아 기상이 예보마다 달라 선박들이 조업 가능 수역을 찾아 남쪽으로 이동',
      '아비장: BAO WIN 430톤(로컬 마켓) 9/4 · GUEOTEC 1,000톤(YF 400·SJ 600, SCODI) 9/3 입항 하역, DICHA UNO 750톤·ATLANTICE GLORY 850톤 하역 후 출항 준비',
      '벨리즈 국적 선망선 HAI FU·HAI YU 2척(중국계) 9/6 아비장 입항, 1척 추가 투입 예정',
      'SCODI 일간 80톤 생산·원어 약 4,000톤 보유, 새 CEO 선출 — 이전 소유주는 PP 그룹에 지분을 넘김',
    ],
  },
  {
    date: '2026-09-13',
    weeklyPair: '2026-09-08',
    mgo: { tema: 1_573, tanker: 1_442, abidjan: 1_232, dakar: null },
    cosmo: {
      priceUsd: 1_700, priceMonth: '8월', nextMonthUnderNegotiation: true, dailyProcessingT: 95,
      // 원문 «9/11 기준 재고 3,725톤 (SJ 3,725톤)» — YF·MIX 는 적지 않았다. 0 이 아니라 미기재다.
      stock: { asOf: '2026-09-11', totalT: 3_725, sjT: 3_725, yfT: null, mixT: null },
    },
    pfc: { priceUsd: 1_900, note: null },
    scasa: { priceUsd: 1_950, dailyProcessingT: 100 },
    grandBleuSales: [
      { market: '콜롬비아', priceUsd: 2_000, terms: 'TRIMARINE 경유 1,000톤 운반선 판매' },
      { market: '북아프리카', priceUsd: 2_050, terms: 'LEVEL' },
    ],
    freightUsdPerT: 320,
    senegalCalls: [
      { vessel: 'COSMOS KIM', tons: 980, arrive: '8/22', depart: null, status: '하역 완료, 임시국적 증서 갱신 중' },
      { vessel: 'CAP ATLANTIQUE', tons: null, arrive: '8/17', depart: null, status: '출항 일정 미정, 상가 수리 중' },
      { vessel: 'ORIENTAL KIM', tons: 900, arrive: '9/5', depart: '9/11', status: '출항 완료' },
      { vessel: 'PONT SAINT LOUIS', tons: 1_100, arrive: '9/6', depart: '9/10', status: '출항 완료' },
      { vessel: 'SEA DEFENDER', tons: null, arrive: '9/10', depart: null, status: '톤수 확인 중, 하역 중' },
      { vessel: 'SEA BREEZE', tons: null, arrive: '9/13', depart: null, status: '톤수 확인 중, 하역 중' },
    ],
    notes: [
      '지난주 파노피 선단 몇몇 선박 대어, 어획 양호',
      '적도 남쪽 아센시온 부근은 SJ C~D 위주 잔고기 어장, 라이베리아 수역·인근은 SJ A~B 로 사이즈 양호 — 9월까지 유지될 것이라는 선장 의견이 많음',
      '조류는 동류지만 빠야오가 제자리를 돌고 북쪽 빠야오가 남쪽으로 내려오지 않아 빠야오 유실이 늘고 있음',
      'P/FORE 라이베리아 수역 빠야오 조업 계획(대부분 20~30톤 사이즈 양호)',
      '어기교대 예정: P/GRACE(마지막 항차) · P/FORE(1~2항차) · P/QUEEN(2항차) 선장 교대',
      '모리타니아 기상은 여전히 불량해 호전될 때만 조업 — 일부 선박은 피항하거나 기니·시에라리온 수역으로 옮겨 FAD 철거',
      '9/21 2명 가나 도착 예정, P/MAS 발전기 수리 중',
    ],
  },
  {
    date: '2026-09-20',
    weeklyPair: '2026-09-15',
    mgo: { tema: 1_586, tanker: 1_619, abidjan: 1_222, dakar: null },
    cosmo: {
      // 8월 어가 $1,700 이 마지막 거래다 - 9월은 거래 자체가 없었다(재고 때문에 10월 중순 이후를 원함).
      priceUsd: 1_700, priceMonth: '8월', nextMonthUnderNegotiation: false, dailyProcessingT: 100,
      stock: { asOf: '2026-09-20', totalT: 3_160, sjT: 3_130, yfT: 30, mixT: null },
    },
    pfc: { priceUsd: null, note: null },
    scasa: { priceUsd: 1_950, dailyProcessingT: 100 },
    grandBleuSales: [],
    freightUsdPerT: null,
    senegalCalls: [
      { vessel: 'COSMOS KIM', tons: 980, arrive: '8/22', depart: null, status: '하역 완료, 임시국적 증서 갱신 중' },
      { vessel: 'CAP ATLANTIQUE', tons: null, arrive: '8/17', depart: null, status: '출항 일정 미정, 상가 수리 중' },
      { vessel: 'SEA DEFENDER', tons: 920, arrive: '9/10', depart: '9/14', status: '출항 완료' },
      { vessel: 'SEA BREEZE', tons: 840, arrive: '9/13', depart: '9/16', status: '출항 완료' },
      { vessel: 'WESTERN KIM', tons: null, arrive: '9/17', depart: null, status: '톤수 확인 중, 하역 중' },
      { vessel: 'SEA FRONTIER', tons: null, arrive: '9/17', depart: null, status: '톤수 확인 중, 하역 중' },
    ],
    notes: [
      'P/MAS 9/12 테마 입항, 3번 발전기 수리 후 9/17 출항 완료',
      '아센시온·라이베리아 수역 위주 조업으로 일부 대어는 있었으나 어장은 전반적으로 소강, 여전히 잔고기 조업 중',
      'P/DIS 를 뺀 P/FORE·P/PATH·P/QUEEN·P/GRACE·P/COM 의 선적량이 비슷해 테마 입항이 몰릴 전망 — 일부는 아비장 입항 후 로컬 마켓 하역(잔고기)을 검토 중',
      'P/GRACE 는 사재용 마지막 항차로 선장·기관장 어기교대 출국 준비 중',
      '가나 연안 빠야오 조업선(AGNES 1·IRIS-J)의 실적이 좋아 파노피 선장들도 연안 어장 형성 가능성을 언급(사이즈 양호)',
      'GGL 은 원어 4,200톤 보유·일간 100톤 판매 중이며 코스모 리턴 780톤·PFC 1차 리턴 약 207톤을 안고 있어, 파노피 선단 2~3척이 테마에 함께 입항하면 하역이 어렵다는 뜻을 밝혔다',
      '세네갈 수역은 지난 주말 카보베르데·모리타니아 기상이 나빴으나 다음 주 중순까지는 호전 전망 — 유럽 국적선은 민델로에서 전재했고, 일부 세네갈 국적선은 모리타니아 어장 종료를 예상해 기니·기니비사우 수역에 FAD 를 투하했다',
      '파노피 발전기 기술자 2명이 9/19 귀국했고, TRUST 인수선 JC FAMILIA(구 MARAWA 2)는 9월 말 부산 출항 계획이다',
    ],
  },
];

export const latestAtlanticMail = atlanticMails[atlanticMails.length - 1];

/** «2026-08-30» → «8/30» */
export const mailMonthDay = (iso: string) => `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;
