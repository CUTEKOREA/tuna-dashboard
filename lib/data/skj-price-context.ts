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
  const gap = years > 0 ? `${years}년 ${months}개월` : `${months}개월`;
  return `$${mark.price.toLocaleString()} — ${mark.previous.date.slice(0, 7).replace('-', '.')} 이후 처음(${gap} 만)`;
}
