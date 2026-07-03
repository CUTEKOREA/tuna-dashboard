import { describe, expect, it } from 'vitest';
import { extractDatasetMeta } from '../lib/data/metadata';
import { getFtaQuarterlyData, getFtaQuarterlyMeta } from '../lib/data/fta-quarterly';
import { getUsdaWidgetData, getUsdaWidgetMeta } from '../lib/data/usda-widgets';

describe('data intake metadata', () => {
  it('extracts embedded _meta from USDA widget datasets', () => {
    const meta = getUsdaWidgetMeta('beef');

    expect(meta.status).toBe('SYNCED');
    expect(meta.source).toContain('USDA');
    expect(meta.fetchedAt).toBe('2026-05-30');
    expect(meta.method).toContain('Librarian');
    expect(meta.version).toBe('v1');
  });

  it('serves garlic USDA widgets through the data intake module', () => {
    const data = getUsdaWidgetData('garlic');
    const meta = getUsdaWidgetMeta('garlic');

    expect(data.widgets.length).toBeGreaterThan(0);
    expect(meta.status).toBe('SYNCED');
    expect(meta.source).toContain('KREI');
  });

  it('extracts top-level source from FTA quarterly datasets', () => {
    const data = getFtaQuarterlyData('shrimp');
    const meta = getFtaQuarterlyMeta('shrimp');

    expect(meta.status).toBe('SYNCED');
    expect(meta.source).toContain('KMI');
    expect(meta.method).toBe('KMI PDF 수동 추출');
    expect(meta.source).toBe(extractDatasetMeta(data).source);
  });

  it('uses explicit fallback metadata for raw arrays', () => {
    const rawArray = getUsdaWidgetData('beef').widgets.slice(0, 1);
    const meta = extractDatasetMeta(rawArray, {
      source: 'manual fixture',
      status: 'STATIC',
      fetchedAt: '2026-07-03',
    });

    expect(meta).toMatchObject({
      source: 'manual fixture',
      status: 'STATIC',
      fetchedAt: '2026-07-03',
      syncDate: '2026-07-03',
    });
  });
});
