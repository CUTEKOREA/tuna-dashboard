import { describe, it, expect } from 'vitest';
import {
  parseSyncDate, freshnessOf, ageLabel, toneOf, STALE_DAYS,
} from '@/lib/sync-freshness';

/* 값은 전부 저장소에서 실제로 쓰이는 syncDate 문자열이다(581개를 훑어 뽑았다).
   지어낸 형식으로 시험하면 통과해도 화면은 그대로 틀린다. */

const NOW = new Date('2026-09-15T00:00:00Z');
const at = (s: string) => parseSyncDate(s)?.at.toISOString().slice(0, 10);

describe('parseSyncDate — 저장소에 실제로 있는 네 가지 형식', () => {
  it('YYYY-MM-DD', () => {
    expect(at('2026-08-05')).toBe('2026-08-05');
    expect(at('2018-01-30')).toBe('2018-01-30');
  });

  it('YYYY-MM 은 그 달 «1일»로 본다 — 보수적으로', () => {
    expect(at('2026-05')).toBe('2026-05-01');
    expect(parseSyncDate('2026-05')?.precision).toBe('month');
  });

  it('연도만 있으면 그 해 «1월 1일»', () => {
    expect(at('2024')).toBe('2024-01-01');
    expect(parseSyncDate('2024')?.precision).toBe('year');
  });

  it('어기 표기 2025-26 은 끝 연도의 시작', () => {
    expect(at('2025-26')).toBe('2026-01-01');
    expect(parseSyncDate('2025-26')?.precision).toBe('season');
  });

  it('접미사·출처명이 붙어 있어도 날짜를 집는다', () => {
    expect(at('2026-08-17 조사')).toBe('2026-08-17');
    expect(at('2024년 기준')).toBe('2024-01-01');
    expect(at('KREI 2026')).toBe('2026-01-01');
    expect(at('aT 2026.01')).toBe('2026-01-01');
    expect(at('연보 2024')).toBe('2024-01-01');
  });

  it('날짜가 아닌 값은 «읽은 척하지 않는다»', () => {
    for (const s of ['참고용 (Reference Only)', '내부 원가 모델', 'KCS', 'FAOSTAT',
                     '전략 목표', '추정 (선도계약)', '', undefined]) {
      expect(parseSyncDate(s as string)).toBeNull();
    }
  });

  it('달이 범위를 벗어나면 안 읽는다 (2026-27 은 어기지 달이 아니다)', () => {
    expect(parseSyncDate('2026-27')?.precision).toBe('season');
    expect(parseSyncDate('2026-13-01')).not.toBeNull();   // 연도만 읽힌다
    expect(at('2026-13-01')).toBe('2026-01-01');
  });
});

describe('freshnessOf — 등급', () => {
  it('LIVE 는 기준일 개념이 없다', () => {
    expect(freshnessOf('LIVE', '2018-01-30', NOW).tier).toBe('live');
  });

  it('90일 이내는 fresh, 18개월 이내는 ok, 그 밖은 stale', () => {
    expect(freshnessOf('SYNCED', '2026-08-05', NOW).tier).toBe('fresh');
    expect(freshnessOf('STATIC', '2026-01-01', NOW).tier).toBe('ok');
    expect(freshnessOf('STATIC', '2018-01-30', NOW).tier).toBe('stale');
  });

  it('경계 하루 차이로 갈린다', () => {
    const edge = new Date(NOW.getTime() - STALE_DAYS * 86_400_000);
    const over = new Date(NOW.getTime() - (STALE_DAYS + 1) * 86_400_000);
    const day = (d: Date) => d.toISOString().slice(0, 10);
    expect(freshnessOf('STATIC', day(edge), NOW).tier).toBe('ok');
    expect(freshnessOf('STATIC', day(over), NOW).tier).toBe('stale');
  });

  it('못 읽는 값은 unknown — 최신인 척도 오래된 척도 하지 않는다', () => {
    const f = freshnessOf('STATIC', '참고용 (Reference Only)', NOW);
    expect(f.tier).toBe('unknown');
    expect(f.ageDays).toBeNull();
    expect(f.ageText).toBeNull();
  });
});

describe('ageLabel · toneOf', () => {
  it('나이를 사람 말로', () => {
    expect(ageLabel(3)).toBe('3일 전');
    expect(ageLabel(90)).toBe('2개월 전');
    expect(ageLabel(365)).toBe('1년 전');
    expect(ageLabel(400)).toBe('1년 1개월 전');
  });

  it('색을 받는 tone 은 stale·unknown·accent 뿐이다', () => {
    expect(toneOf('fresh')).toBe('neutral');
    expect(toneOf('ok')).toBe('neutral');
    expect(toneOf('stale')).toBe('stale');
    expect(toneOf('unknown')).toBe('unknown');
    expect(toneOf('live')).toBe('accent');
  });
});
