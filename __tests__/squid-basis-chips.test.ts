import { describe, expect, it } from 'vitest';
import { daysSince, freshnessColor } from '../components/squid/BasisChips';
import { isExcerptOnly } from '../components/squid/GenericWidget';

const NOW = new Date(2026, 7, 13); // 2026-08-13

describe('daysSince — 기준일 경과 계산', () => {
  it('일 단위 날짜를 그대로 센다', () => {
    expect(daysSince('2026-08-11', NOW)).toBe(2);
  });

  it('월만 주어지면 그 달의 마지막 날을 관측 종료로 본다', () => {
    // 2026-05 → 2026-05-31 기준
    expect(daysSince('2026-05', NOW)).toBe(74);
  });

  it('연도만 주어지면 12월 31일을 관측 종료로 본다', () => {
    expect(daysSince('2024', NOW)).toBe(590);
  });

  it('윤년 2월을 정확히 처리한다', () => {
    // 2024-02 → 2024-02-29
    expect(daysSince('2024-02', new Date(2024, 2, 1))).toBe(1);
  });

  it('형식이 아니면 null', () => {
    expect(daysSince('2026년 8월', NOW)).toBeNull();
  });
});

describe('freshnessColor — 신선도 색', () => {
  it('90일 이내는 정상', () => {
    expect(freshnessColor(0)).toBe('#10b981');
    expect(freshnessColor(90)).toBe('#10b981');
  });

  it('91~365일은 주의', () => {
    expect(freshnessColor(91)).toBe('#f59e0b');
    expect(freshnessColor(365)).toBe('#f59e0b');
  });

  it('365일 초과는 경고', () => {
    expect(freshnessColor(366)).toBe('#f43f5e');
  });

  it('산출 불가는 중립색', () => {
    expect(freshnessColor(null)).toBe('#94a3b8');
  });
});

describe('isExcerptOnly — 원문 발췌 판별', () => {
  it('전부 source_excerpt 면 참', () => {
    expect(isExcerptOnly([{ kind: 'source_excerpt', text: 'a' }])).toBe(true);
  });
  it('하나라도 구조화 행이 섞이면 거짓 (표로 그려야 한다)', () => {
    expect(isExcerptOnly([{ kind: 'source_excerpt', text: 'a' }, { year: 2026, tonnes: 1 }])).toBe(false);
  });
  it('빈 배열은 거짓 — 빈 카드는 SquidCard 가 따로 처리한다', () => {
    expect(isExcerptOnly([])).toBe(false);
  });
  it('배열이 아니면 거짓', () => {
    expect(isExcerptOnly({ kind: 'source_excerpt' })).toBe(false);
  });
});
