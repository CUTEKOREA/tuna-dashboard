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
  it('수치 토큰을 원문 그대로 뽑고, 없는 항목은 만들어내지 않는다', () => {
    const briefing = parseDailyBriefing({
      date: '2026-08-14',
      digest: [
        { title: '숫자 없는 헤드라인' },
        { title: '만타 가다랑어 원료가 USD 2,200으로 2% 상승' },
        { title: '몰디브 참치 수출, 관세 인하 후 20% 증가' },
      ],
      articles: [
        { titleKo: 'ㄱ', paragraphs: ['이렇게 해야 한다.'] },
        { titleKo: 'ㄴ', paragraphs: ['본문'] },
        { titleKo: 'ㄷ', paragraphs: ['본문'] },
      ],
    });
    const numbers = buildBriefingImpactNumbers(briefing);
    expect(numbers).toHaveLength(2);
    expect(numbers[0].value).toBe('USD 2,200');
    expect(numbers[0].label).toBe('만타 가다랑어 원료가');
    expect(numbers[1].value).toBe('20%');
  });

  it('실데이터에서 임팩트 넘버 라벨이 전부 비어 있지 않다', () => {
    for (const impact of buildBriefingImpactNumbers(dailyBriefing)) {
      expect(impact.label.length).toBeGreaterThanOrEqual(4);
      expect(impact.value).toMatch(/\d/);
    }
  });

  it('카테고리 배지는 항상 정의된 값 중 하나다', () => {
    const allowed = ['시장', '규제', '원료가', '무역', '조업', '뉴스'];
    for (const item of dailyBriefing.digest) {
      expect(allowed).toContain(categorizeBriefingTitle(item.title));
    }
  });
});
