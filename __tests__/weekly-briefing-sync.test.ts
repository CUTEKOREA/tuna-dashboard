import { describe, expect, it } from 'vitest';
import { parseWeeklyBriefing } from '../lib/data/daily-briefing';

const validDay = {
  date: '2026-10-05',
  digest: [
    { title: 'Cepesca, 연료비 86% 급증' },
    { title: '방콕 가다랑어 가격 올해 53% 상승' },
    { title: 'EU-세이셸 참치 협정, 이행 단계로' },
  ],
  articles: [
    { titleKo: '기사 A', paragraphs: ['첫 문단.'] },
    { titleKo: '기사 B', paragraphs: ['첫 문단.'] },
    { titleKo: '기사 C', paragraphs: ['첫 문단.'] },
  ],
};

describe('weekly briefing loader', () => {
  it('rejects empty days at build time', () => {
    expect(() => parseWeeklyBriefing({
      weekStart: '2026-10-05',
      weekEnd: '2026-10-09',
      days: [],
    })).toThrow(/days는 비어 있을 수 없습니다/);
  });

  it('validates each day with the daily briefing contract', () => {
    expect(() => parseWeeklyBriefing({
      weekStart: '2026-10-05',
      weekEnd: '2026-10-09',
      days: [{
        ...validDay,
        digest: [{ title: '한 건만' }],
      }],
    })).toThrow(/digest는 3건 이상/);
  });

  it('requires days in ascending date order', () => {
    expect(() => parseWeeklyBriefing({
      weekStart: '2026-10-05',
      weekEnd: '2026-10-09',
      days: [
        { ...validDay, date: '2026-10-06' },
        { ...validDay, date: '2026-10-05' },
      ],
    })).toThrow(/날짜 오름차순/);
  });

  it('rejects a week range that is not Monday through Friday', () => {
    expect(() => parseWeeklyBriefing({
      weekStart: '2026-10-06',
      weekEnd: '2026-10-09',
      days: [validDay],
    })).toThrow(/월요일부터 금요일/);
  });

  it('rejects a day outside the stated week', () => {
    expect(() => parseWeeklyBriefing({
      weekStart: '2026-10-05',
      weekEnd: '2026-10-09',
      days: [{ ...validDay, date: '2026-10-12' }],
    })).toThrow(/주간 범위/);
  });

  it('rejects duplicate dates and weekend editions', () => {
    expect(() => parseWeeklyBriefing({
      weekStart: '2026-10-05',
      weekEnd: '2026-10-09',
      days: [validDay, validDay],
    })).toThrow(/중복/);
    expect(() => parseWeeklyBriefing({
      weekStart: '2026-10-05',
      weekEnd: '2026-10-09',
      days: [{ ...validDay, date: '2026-10-10' }],
    })).toThrow(/주말/);
  });

  it('accepts a well-formed weekly payload', () => {
    const weekly = parseWeeklyBriefing({
      weekStart: '2026-10-05',
      weekEnd: '2026-10-09',
      days: [
        validDay,
        { ...validDay, date: '2026-10-06' },
      ],
    });
    expect(weekly.weekStart).toBe('2026-10-05');
    expect(weekly.days.map((day) => day.date)).toEqual(['2026-10-05', '2026-10-06']);
  });
});
