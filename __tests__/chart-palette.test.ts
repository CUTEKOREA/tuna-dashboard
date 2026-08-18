import { describe, expect, it } from 'vitest';
import { colorForAtunaHub, colorForHold, HOLD_ID, HUB_ID, NEWS_CATEGORY_ID, shareColor } from '@/lib/chart-palette';

describe('chart-palette (선단 DB 4겹)', () => {
  it('keeps the same port the same color on skipjack and yellowfin', () => {
    expect(colorForAtunaHub('skj_abj')).toBe(HUB_ID.abj);
    expect(colorForAtunaHub('yf_abj')).toBe(HUB_ID.abj);
    expect(colorForAtunaHub('skj_bkk')).toBe(HUB_ID.bkk);
  });

  it('does not use the old Metabase hub greens and browns', () => {
    expect(Object.values(HUB_ID)).not.toContain('#509ee3');
    expect(Object.values(HUB_ID)).not.toContain('#3f6212');
    expect(Object.values(HUB_ID)).not.toContain('#9a3412');
  });

  it('covers every briefing category chip', () => {
    expect(NEWS_CATEGORY_ID).toMatchObject({
      시장: HUB_ID.bkk,
      규제: HUB_ID.abj,
      원료가: HUB_ID.sey,
      무역: HUB_ID.mnt,
      조업: HUB_ID.vig,
      뉴스: '#8d93a5',
    });
  });

  it('cycles share pastels without throwing', () => {
    expect(shareColor(0)).toBe('#f4b4c4');
    expect(shareColor(8)).toBe('#f4b4c4');
  });

  it('cycles hold colors in the identity set, not Metabase browns', () => {
    expect(colorForHold(0)).toBe(HOLD_ID[0]);
    expect(colorForHold(HOLD_ID.length)).toBe(HOLD_ID[0]);
    expect(HOLD_ID).not.toContain('#509ee3');
    expect(HOLD_ID).not.toContain('#9a3412');
  });
});
