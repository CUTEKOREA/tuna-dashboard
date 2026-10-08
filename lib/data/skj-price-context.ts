import type { AtunaPriceRow } from '@/lib/data/atuna-price-summary';

/**
 * 방콕 어가를 읽는 데 필요한 «업계 전제» — 2026-09-16 방콕 출장보고와 9/21 참치선망어업위원회
 * 회의자료에서 시장 판단에 해당하는 문장만 옮긴다.
 *
 * 수치(어가·반입량)는 여기 적지 않는다. 어가는 `data/atuna_prices.json`, 반입량은 운반선
 * 주간동향이 정본이다. 여기 있는 것은 «그 수치를 어떤 전제로 읽고 있는가» 뿐이다.
 *
 * 화면이 계절 기준선(9→12월 하락)을 내보내는데 업계는 내년 2월까지 강세를 전제로 움직인다.
 * 둘 중 하나를 지우지 않고 나란히 둔다 - 기준선은 과거 평균이고 전제는 지금의 구매 행동이다.
 *
 * 사람 이름·회사 간 분쟁·인수 평가처럼 대외 공개가 곤란한 내용은 옮기지 않는다.
 */
export interface SkjPriceContext {
  source: { file: string; sha256: string; reportDate: string }[];
  /** 업계가 가격을 읽는 전제 */
  premise: { label: string; detail: string }[];
  /** 공급을 줄이는 쪽으로 작동하는 사건들 */
  supplyNotes: string[];
}

export const skjPriceContext: SkjPriceContext = {
  source: [
    {
      file: '방콕 출장보고 (종합).docx',
      sha256: '4dbb23a0798432fd9a140a09c951d22fe96d010bb98e7c02a0775a9b90c9b7e2',
      reportDate: '2026-09-16',
    },
    {
      file: '260918_제4차 참치선망어업위원회 회의자료.pdf',
      sha256: 'e9f821754e2a43fb6ab9466f8d5f602a3d4351e22247c7f5c94a293d05457e3e',
      reportDate: '2026-09-21',
    },
  ],
  premise: [
    {
      label: '10월 어가',
      detail: '대형 캐너리가 10월 $2,200을 수용한다고 밝혔고, 트레이더들은 어획 부진과 유가 재상승을 들어 추가 상승 쪽에 무게를 둡니다.',
    },
    {
      label: '엘니뇨 전제',
      detail: '대형 캐너리는 엘니뇨가 최소 2027년 2월까지 이어진다는 전제로 구매 정책을 세웠습니다 — 가격보다 원어 확보가 먼저라는 입장입니다.',
    },
    {
      label: '캐너리 대응',
      detail: '완제품 가격에 어가 상승분을 다 넘기지 못해 일간 가공량을 20~40% 줄였고, 완제품 계약도 장기에서 단기로 옮겨 갔습니다. 구매 한계선은 $2,100이라고 말하지만 10월분은 이미 $2,200에 수용됐습니다.',
    },
    {
      label: '경비',
      detail: '중동 우회 환적으로 20피트 드라이 컨테이너 운임이 $5,000 수준까지 올랐고, 완제품 대금 결제도 「계약 30% + 도착 후 180일」로 불리해졌습니다.',
    },
  ],
  supplyNotes: [
    '운반선 2척(약 8,500톤)이 라이선스 문제로 방콕 하역이 막혀 베트남·필리핀으로 분산 판매될 예정입니다.',
    '세네갈발 화물의 어체 블록화 사고 이후 방콕 캐너리가 대서양 물량을 기피하는 분위기입니다.',
    '인도양 어획이 호전됐지만 유럽 선단은 판매 루트가 여러 갈래라 방콕 반입은 제한적일 것으로 봅니다 — 어가가 더 뛰면 지난 5월처럼 일시에 몰릴 수 있습니다.',
  ],
};

/**
 * 시장 동향 상단 「가다랑어 방콕」 해설 — Atuna 최근 한 달 기사(영문 원문)만 근거로 쓴다(2026-10-06 사용자 지시).
 * 원문: `~/silla-tuna-daily/sources/<날짜>.txt`(데일리 브리핑이 받아 둔 Atuna 기사 전문). 문장마다 근거 기사 날짜를 단다.
 * 초안은 Codex 가 쓰고 메인이 원문과 대조해 고쳤다 - TTIA 발언을 «소비자가 인상이 어렵다»로 옮긴 오역을
 * 원문(«높은 운영비가 소비자에게 닿지 않게 하는 것이 최우선»)대로 바로잡았다.
 * 방콕 사무소 탭은 출장보고 전제(`skjPriceContext`)를 계속 쓴다 - 둘은 출처가 다르다.
 */
export interface SkjAtunaMonthContext {
  period: { from: string; to: string };
  sources: { date: string; sha256: string; titles: string[] }[];
  premise: { label: string; detail: string; sources: string[]; text?: undefined }[];
  supplyNotes: { text: string; sources: string[]; detail?: undefined }[];
}

export const skjAtunaMonthContext: SkjAtunaMonthContext = {
  period: { from: '2026-09-07', to: '2026-10-05' },
  sources: [
    { date: '2026-09-09', sha256: '861538a1bfcd54dc29489e4347648f30dad08d58fe67e583bc73836e52e83904', titles: ['Will Tuna Raw Material Prices Head Higher?', 'Bangkok Skipjack Price Climbs As Packers Still Face Supply Crunch'] },
    { date: '2026-09-15', sha256: 'bafa27f6ba9088b4efcf3a4b0969277cc811db140c0379671f7a50eef6d2f525', titles: ['Bangkok Skipjack RM Price Continues Upward, A Worry For Tuna Sector'] },
    { date: '2026-09-16', sha256: '99c77b37795249253c5645e52997c1eba6e052e8f2c7b17b96378efbe29bd8c9', titles: ['Diesel Costs Weigh On WCPO Fishing Fleets', 'Manta Tuna Sector Squeezed By Poor Skipjack Supply'] },
    { date: '2026-09-17', sha256: 'c86156afe980b34d8b4b5901fc53a59b1f49d809769fa3dc234e96c67afcd35c', titles: ['TTIA Urges Global Tuna Industry To Put Cooperation Ahead Of Competition'] },
    { date: '2026-09-18', sha256: '98fb41fe7cf372ce8dbd49f6fb94f2488add4d240cebf23b99b8a6f5f83c7677', titles: ['IO Catches Improve Slightly: Skipjack Price Firms'] },
    { date: '2026-09-22', sha256: 'e887544576f36fb959084301edc46c253c74e9047c1b4e12bedc68514766f130', titles: ['Readers Saw Skipjack Price Rise Coming'] },
    { date: '2026-09-25', sha256: 'f32570a3c2d4e696f2c67ba5dd71dca0f48c86ae2a3e3fdddefe830bcdc2df03', titles: ['Thai Union Earnings Forecast Downgraded As Cost Pressures Climb'] },
    { date: '2026-10-02', sha256: 'c51d3f335fd5c50642d05e2d4693a46802ee4c058286c165ede161ede8e3b2a8', titles: ['Bangkok Skipjack Price Nears Historic Peak'] },
  ],
  premise: [
    {
      label: '가격 흐름',
      detail: '방콕 냉동 원어 가다랑어 고시가는 9/9 톤당 $2,100, 9/15 $2,200, 10/2 $2,300으로 한 달 새 세 번 올랐습니다. 1월 초 $1,500에서 53% 오른 값이고, 역대 고점 $2,350(2013년·2017년)에 $50 차이로 다가섰습니다.',
      sources: ['2026-09-09', '2026-09-15', '2026-10-02'],
    },
    {
      label: '공급 부족',
      detail: '8/15 집어장치(FAD) 금어기가 끝났지만 중서부태평양 선망 어획은 7월 이후 살아나지 않았고, 9~11월 강한 엘니뇨가 확인돼 어군이 평소 어장에서 벗어났습니다. 9/15 싱가포르 선박용 경유는 톤당 $1,448로 한 주 새 14% 올라 선주 호가를 끌어올렸습니다.',
      sources: ['2026-09-15', '2026-09-16', '2026-10-02'],
    },
    {
      label: '캐너리 대응',
      detail: '대형 캐너리는 필요한 만큼만 사며 높은 호가에 버티고, 소형 가공업체가 웃돈을 내 물량을 잡고 있습니다. 태국참치산업협회(TTIA)는 높은 운영비가 소비자에게 닿지 않게 하는 것을 최우선 과제로 꼽았고, JP모건은 원어가·운임 상승을 들어 Thai Union의 2026~2027년 이익 전망을 17~19% 낮췄습니다.',
      sources: ['2026-09-17', '2026-09-25', '2026-10-02'],
    },
    {
      label: '앞으로 볼 것',
      detail: '10/2 기준 실거래는 톤당 $2,300~2,350이고 선주들은 $100~150을 더 부르지만 그 값의 체결은 아직 확인되지 않았습니다. Atuna 독자 설문에서 고점에 닿았다고 본 응답은 4%뿐이었습니다.',
      sources: ['2026-09-22', '2026-10-02'],
    },
  ],
  supplyNotes: [
    { text: '태국은 인도양산 가다랑어 수입을 늘렸지만(상반기 37,242톤, 대부분 1분기) 중서부태평양 부족분을 다 메우지 못했습니다.', sources: ['2026-09-09', '2026-10-02'] },
    { text: '인도양 어획은 8월보다 조금 나아졌으나 작년보다 적고, 세이셸 FOB 1,645유로(약 $1,885)에 운임 약 $350을 더하면 CFR 약 $2,235로 방콕과 큰 차이가 없습니다.', sources: ['2026-09-18'] },
    { text: '동태평양은 에콰도르 선망 가다랑어 양륙이 1월~8월 초 116,326톤으로 전년보다 76,881톤 줄어 만타 가격이 톤당 약 $2,300까지 올랐고, 일부 가공업체는 인도양산을 더 비싸게 사 갑니다.', sources: ['2026-09-16'] },
  ],
};

export interface SkjPriceHighMark {
  /** 최신 고시가 */
  price: number;
  date: string;
  /** 그 값 이상이었던 직전 고시 (없으면 null = 계열 사상 최고) */
  previous: { date: string; price: number } | null;
  /** 직전 고시까지의 간격 — 「N년 만」 표기에 쓴다 */
  monthsSince: number | null;
}

/**
 * 최신 고시가가 얼마 만의 수준인지 계열에서 파생한다.
 * 「2017년 이래 최고」 같은 문장을 손으로 적으면 다음 고시에 그대로 남는다.
 */
export function skjPriceHighMark(rows: AtunaPriceRow[], key = 'skj_bkk'): SkjPriceHighMark | null {
  const series = rows
    .filter((row): row is AtunaPriceRow & Record<string, number> => typeof row[key] === 'number')
    .map((row) => ({ date: row.date, price: row[key] as number }))
    .sort((left, right) => left.date.localeCompare(right.date));
  if (series.length === 0) return null;

  const latest = series[series.length - 1];
  const earlier = series.slice(0, -1).filter((point) => point.price >= latest.price);
  const previous = earlier.length > 0 ? earlier[earlier.length - 1] : null;
  const monthsSince = previous === null ? null : monthsBetween(previous.date, latest.date);
  return { price: latest.price, date: latest.date, previous, monthsSince };
}

function monthsBetween(from: string, to: string): number {
  const [fromYear, fromMonth] = from.split('-').map(Number);
  const [toYear, toMonth] = to.split('-').map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

/** 「2017.10 이후 처음」 같은 한 줄. 최고가 경신이면 그렇게 적는다. */
export function skjPriceHighMarkLabel(mark: SkjPriceHighMark | null): string | null {
  if (mark === null) return null;
  if (mark.previous === null) return `$${mark.price.toLocaleString()} — 계열 사상 최고`;
  const years = Math.floor((mark.monthsSince ?? 0) / 12);
  const months = (mark.monthsSince ?? 0) % 12;
  // «9년 0개월 만» 처럼 0개월을 붙이지 않는다
  const gap = years > 0 ? (months > 0 ? `${years}년 ${months}개월` : `${years}년`) : `${months}개월`;
  return `$${mark.price.toLocaleString()} — ${mark.previous.date.slice(0, 7).replace('-', '.')} 이후 처음(${gap} 만)`;
}
