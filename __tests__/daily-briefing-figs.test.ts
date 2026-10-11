import { describe, expect, it } from 'vitest';
import {
  buildBriefingImpactNumbers,
  parseDailyBriefing,
} from '../lib/data/daily-briefing';

describe('briefing impact numbers from lead article figs', () => {
  it('리드 기사 figs 3개를 가공 없이 value·label 로보낸다', () => {
    const briefing = parseDailyBriefing({
      date: '2026-10-09',
      digest: [
        { title: '헤드라인 1' },
        { title: '헤드라인 2' },
        { title: '헤드라인 3' },
      ],
      articles: [
        {
          titleKo: '리드',
          paragraphs: ['본문.'],
          figs: [
            { value: 'EUR 4억 5,250만', caption: 'Van der Plas 지분 인수 대금' },
            { value: 'EUR 6,000만', caption: '언아웃 추가 지급 가능 (향후 3년 실적 조건)' },
            { value: 'EUR 15억 이상', caption: '2025년 매출 (이익 EUR 6,700만)' },
          ],
        },
        { titleKo: '기사 2', paragraphs: ['본문.'] },
        { titleKo: '기사 3', paragraphs: ['본문.'] },
      ],
    });

    expect(buildBriefingImpactNumbers(briefing)).toEqual([
      { value: 'EUR 4억 5,250만', label: 'Van der Plas 지분 인수 대금' },
      { value: 'EUR 6,000만', label: '언아웃 추가 지급 가능 (향후 3년 실적 조건)' },
      { value: 'EUR 15억 이상', label: '2025년 매출 (이익 EUR 6,700만)' },
    ]);
  });

  it('limit 인자로 잘라낸다', () => {
    const briefing = parseDailyBriefing({
      date: '2026-10-09',
      digest: [{ title: 'a' }, { title: 'b' }, { title: 'c' }],
      articles: [
        {
          titleKo: '리드',
          paragraphs: ['본문.'],
          figs: [
            { value: '1', caption: '캡션 1' },
            { value: '2', caption: '캡션 2' },
            { value: '3', caption: '캡션 3' },
          ],
        },
        { titleKo: '2', paragraphs: ['본문.'] },
        { titleKo: '3', paragraphs: ['본문.'] },
      ],
    });
    expect(buildBriefingImpactNumbers(briefing, 2)).toHaveLength(2);
  });
});
