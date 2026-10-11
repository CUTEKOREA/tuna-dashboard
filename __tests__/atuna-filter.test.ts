import { describe, expect, it } from 'vitest';
import { filterAtunaHistory, type AtunaPriceRow } from '../lib/data/atuna-price-summary';

const rows: AtunaPriceRow[] = [
  { date: '2026-01-07', skj_bkk: 1500, yf_abj: 2400 },
  { date: '2026-01-21', skj_bkk: 1550 },
  { date: '2026-04-08', skj_bkk: 1700, yf_abj: 2500 },
  { date: '2026-07-15', skj_bkk: 1900, yf_abj: 2600 },
];

describe('filterAtunaHistory (V3 기간·입도 필터)', () => {
  it('전체 기간 + 주간 입도는 원본을 그대로 돌려준다', () => {
    expect(filterAtunaHistory(rows, 'all', 'week')).toEqual(rows);
  });

  it('기간 절단은 최신 관측일 기준이다 (오늘 날짜 아님)', () => {
    const sliced = filterAtunaHistory(rows, '6m', 'week');
    // 최신 2026-07-15 기준 6개월 → 2026-01-15 이후
    expect(sliced.map((r) => r.date)).toEqual(['2026-01-21', '2026-04-08', '2026-07-15']);
  });

  it('월간 입도는 시리즈별 관측치 평균이며 결측 시리즈를 0으로 채우지 않는다', () => {
    const monthly = filterAtunaHistory(rows, 'all', 'month');
    expect(monthly.map((r) => r.date)).toEqual(['2026-01', '2026-04', '2026-07']);
    expect(monthly[0].skj_bkk).toBe(1525); // (1500+1550)/2
    expect(monthly[0].yf_abj).toBe(2400);  // 관측 1회 — 평균은 그 값, 0 혼입 금지
    expect(monthly[1].skj_bkk).toBe(1700);
  });

  it('빈 입력은 빈 배열', () => {
    expect(filterAtunaHistory([], '3m', 'month')).toEqual([]);
  });
});

/* V3 뉴스 A안 — 임팩트 넘버·카테고리 추출 불변식 */
import {
  buildBriefingImpactNumbers,
  categorizeBriefingTitle,
  dailyBriefing,
  parseDailyBriefing,
} from '../lib/data/daily-briefing';

describe('briefing impact extraction (V3 뉴스 A안)', () => {
  // 2026-10-10: 「오늘의 수치」가 다이제스트 제목을 정규식으로 긁는 대신 기사 핵심수치
  // 스트립(figs)을 읽는다. 아래 두 회귀는 정규식이 문장에서 숫자를 떼어내려다 난 것이라,
  // 값과 캡션이 처음부터 나뉘어 들어오는 지금은 같은 실패가 일어날 수 없다.
  //   · 2026-09-21 「USD 2,500만」이 「USD 2,500」으로 잘려 1만분의 1로 표시
  //   · 2026-09-22 「64,782 M/T(전년比 -13%)」에서 물량 대신 뒤쪽 -13% 가 잡힘
  // 제목을 긁지 않으니 제목에 수치를 끌어올릴 이유도 없어졌다(10/05~10/09 5회 연속 손질).
  const leadWith = (figs: readonly { value: string; caption: string }[]) => parseDailyBriefing({
    date: '2026-10-09',
    digest: [
      { title: '숫자 없는 헤드라인' },
      { title: '여기에도 수치가 없다' },
      { title: '세 번째도 마찬가지' },
    ],
    articles: [
      { titleKo: '리드', paragraphs: ['이렇게 해야 한다.'], figs },
      { titleKo: 'ㄴ', paragraphs: ['본문'], figs: [
        { value: '쓰이지 않음', caption: '리드가 아닌 기사' },
        { value: '쓰이지 않음', caption: '리드가 아닌 기사' },
        { value: '쓰이지 않음', caption: '리드가 아닌 기사' },
      ] },
      { titleKo: 'ㄷ', paragraphs: ['본문'], figs: [
        { value: '쓰이지 않음', caption: '리드가 아닌 기사' },
        { value: '쓰이지 않음', caption: '리드가 아닌 기사' },
        { value: '쓰이지 않음', caption: '리드가 아닌 기사' },
      ] },
    ],
  });

  it('리드 기사 figs 를 값·캡션 그대로 쓴다 — 문장에서 잘라내지 않는다', () => {
    const numbers = buildBriefingImpactNumbers(leadWith([
      { value: 'EUR 4억 5,250만', caption: 'Van der Plas 지분 인수 대금' },
      { value: 'EUR 6,000만', caption: '언아웃 추가 지급 가능 (향후 3년 실적 조건)' },
      { value: 'EUR 15억 이상', caption: '2025년 매출 (이익 EUR 6,700만)' },
    ]));
    expect(numbers).toHaveLength(3);
    expect(numbers[0]).toEqual({ value: 'EUR 4억 5,250만', label: 'Van der Plas 지분 인수 대금' });
    // 예전 정규식이면 「EUR 4억」에서 끊기거나 라벨이 문장 중간에서 잘렸다.
    expect(numbers[1].value).toBe('EUR 6,000만');
    expect(numbers[2].label).toBe('2025년 매출 (이익 EUR 6,700만)');
  });

  it('다이제스트에 수치가 하나도 없어도 리드 figs 로 채워진다', () => {
    // 10/05~10/09 다섯 회차가 전부 이 모양이었고, 그때마다 제목을 손질해야 했다.
    const numbers = buildBriefingImpactNumbers(leadWith([
      { value: '157,262 M/T', caption: '1~6월 EU 캔참치 수출' },
      { value: 'EUR 6,020', caption: '톤당 평균 가격' },
      { value: 'EUR 5,922', caption: '프랑스 톤당 가격' },
    ]));
    expect(numbers.map((n) => n.value)).toEqual(['157,262 M/T', 'EUR 6,020', 'EUR 5,922']);
  });

  it('리드가 아닌 기사의 figs 는 쓰지 않는다', () => {
    const numbers = buildBriefingImpactNumbers(leadWith([
      { value: '1', caption: '리드 첫째' },
      { value: '2', caption: '리드 둘째' },
      { value: '3', caption: '리드 셋째' },
    ]));
    expect(numbers.every((n) => n.label.startsWith('리드'))).toBe(true);
  });

  it('실데이터에서 임팩트 넘버 3개가 값·라벨 모두 채워져 나온다', () => {
    const numbers = buildBriefingImpactNumbers(dailyBriefing);
    // 0개면 반복문이 안 돌아 조용히 통과하므로 개수를 먼저 못박는다.
    expect(numbers).toHaveLength(3);
    for (const impact of numbers) {
      expect(impact.label.trim().length).toBeGreaterThan(0);
      // 게시판 figs 값은 「과테말라」·「수백 곳」처럼 숫자가 없을 수도 있다.
      // 숫자를 요구하면 정당한 회차가 테스트에서 막힌다.
      expect(impact.value.trim().length).toBeGreaterThan(0);
    }
  });

  it('리드 기사에 figs 가 없으면 빌드에서 막는다', () => {
    expect(() => parseDailyBriefing({
      date: '2026-10-09',
      digest: [{ title: 'a' }, { title: 'b' }, { title: 'c' }],
      articles: [
        { titleKo: '리드', paragraphs: ['본문'] },
        { titleKo: 'ㄴ', paragraphs: ['본문'] },
        { titleKo: 'ㄷ', paragraphs: ['본문'] },
      ],
    })).toThrow(/articles\[0\]\.figs는 3건/);
  });

  it('카테고리 배지는 항상 정의된 값 중 하나다', () => {
    const allowed = ['시장', '규제', '원료가', '무역', '조업', '뉴스'];
    for (const item of dailyBriefing.digest) {
      expect(allowed).toContain(categorizeBriefingTitle(item.title));
    }
  });
});
