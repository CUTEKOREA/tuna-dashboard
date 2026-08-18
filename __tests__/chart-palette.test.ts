import { describe, expect, it } from 'vitest';
import { CHART_RANK, colorForAtunaHub, colorForHold, HOLD_ID, HUB_ID, NEWS_CATEGORY_ID, PANOFI_ID, shareColor, VDS_ID } from '@/lib/chart-palette';

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

  it('keeps panofi channel colors in the identity set', () => {
    expect(PANOFI_ID.cosmo).toBe(HUB_ID.bkk);
    expect(PANOFI_ID.pfc).toBe(HUB_ID.vig);
    expect(PANOFI_ID.scodi).toBe(HUB_ID.mnt);
    expect(PANOFI_ID.scasa).toBe(HUB_ID.sey);
    expect(PANOFI_ID.abidjan).toBe(HUB_ID.abj);
    expect(PANOFI_ID.tema).toBe('#06b6d4');
  });

  it('keeps VDS and rank colors in the same identity set', () => {
    expect(VDS_ID.allocated).toBe(HUB_ID.bkk);
    expect(VDS_ID.consumed).toBe(HUB_ID.abj);
    expect(VDS_ID.remaining).toBe(HUB_ID.mnt);
    expect(VDS_ID.weekly).toBe(HUB_ID.sey);
    expect(CHART_RANK).toBe(HUB_ID.vig);
  });
});
