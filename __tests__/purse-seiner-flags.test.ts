import { describe, expect, it } from 'vitest';
import { FLAG_EMOJI, vessels } from '../data/purseSeinerData';

describe('선망선 선적국 국기', () => {
  it('등록부에 있는 모든 선적국에 국기 이모지가 있다', () => {
    const flags = [...new Set(vessels.map((v) => v.flag))];
    expect(flags.length).toBeGreaterThan(20);
    const missing = flags.filter((flag) => !FLAG_EMOJI[flag]);
    expect(missing, `국기 없는 선적국: ${missing.join(', ')}`).toEqual([]);
  });

  it('한국은 태극기로 표기한다', () => {
    expect(FLAG_EMOJI['South Korea']).toBe('🇰🇷');
  });
});
