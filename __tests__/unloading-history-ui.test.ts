import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import snapshot from '../lib/unloading-history/history_2021_2025.json';
import { UnloadingHistoryPublicResponseSchema } from '../lib/unloading-history/schema';
import {
  decodeUnloadingHistoryResponse,
  getVoyageActualForYear,
  getVoyagePortsForYear,
  reduceHistoryLoadState,
  UnloadingHistoryView,
  getNextHistoryYear,
  getVisibleHistoryVoyages,
} from '../components/UnloadingHistory';

const dataset = UnloadingHistoryPublicResponseSchema.parse(snapshot);

describe('UnloadingHistoryView', () => {
  it('defaults to 2025 and renders the reviewed total and voyage rows', () => {
    const markup = renderToStaticMarkup(
      React.createElement(UnloadingHistoryView, { dataset }),
    );

    expect(markup).toContain('2021~2025 역사 실적');
    expect(markup).toContain('76,050.239');
    expect(markup).toContain('SEIN SAPPHIRE');
    expect(markup).not.toContain('HUA FU 207');
    expect(markup).toContain('SYNCED');
  });

  it('wraps keyboard year navigation', () => {
    expect(getNextHistoryYear(2025, 'ArrowRight')).toBe(2021);
    expect(getNextHistoryYear(2021, 'ArrowLeft')).toBe(2025);
    expect(getNextHistoryYear(2024, 'Home')).toBe(2021);
    expect(getNextHistoryYear(2022, 'End')).toBe(2025);
  });

  it('filters selected-year rows by allocation port', () => {
    const songkhla = getVisibleHistoryVoyages(dataset.voyages, 2025, 'SKL');
    const vessels = songkhla.map((row) => row.vessel.canonicalName);

    expect(vessels).toContain('SEIN GRACE');
    expect(vessels).not.toContain('SEIN TOPAZ');
  });

  it('uses selected calendar-year allocations and preserves excluded actuals', () => {
    const taiJi = dataset.voyages.find((row) => row.vessel.canonicalName === 'TAI JI')!;
    const partial = dataset.voyages.find(
      (row) => row.voyageId === 'liaoyu-reefer-1-2021-03-17-bkk',
    )!;

    expect(getVoyageActualForYear(taiJi, 2022)).toBe(2101.34);
    expect(getVoyageActualForYear(taiJi, 2023)).toBe(3170.06);
    expect(getVoyageActualForYear(partial, 2021)).toBe(1061.14);
    expect(getVoyageActualForYear(partial, 2022)).toBeNull();
    expect(getVoyagePortsForYear(taiJi, 2022).map((port) => port.code)).toEqual(['HCM']);
    expect(getVoyagePortsForYear(taiJi, 2023).map((port) => port.code)).toEqual(['HCM']);
  });

  it('rejects malformed nested API data instead of rendering it as ready', () => {
    const malformed = structuredClone(dataset) as Record<string, unknown>;
    const voyages = malformed.voyages as Array<Record<string, unknown>>;
    voyages[0] = {
      ...voyages[0],
      period: { startDate: '2025-99-99', endDate: '2025-01-01' },
    };

    expect(decodeUnloadingHistoryResponse(dataset)).toEqual(dataset);
    expect(decodeUnloadingHistoryResponse(malformed)).toBeNull();
    expect(decodeUnloadingHistoryResponse({ success: true, annual: [], voyages: [] })).toBeNull();
  });

  it('rejects unexpected or incomplete fields outside the public contract', () => {
    const unexpectedVoyage = structuredClone(dataset) as Record<string, unknown>;
    const unexpectedRows = unexpectedVoyage.voyages as Array<Record<string, unknown>>;
    unexpectedRows[0] = {
      ...unexpectedRows[0],
      unexpectedInternalDetail: 'not public',
    };

    const invalidMetadata = structuredClone(dataset) as Record<string, unknown>;
    (invalidMetadata._metadata as Record<string, unknown>).apiHealth = null;

    const missingBaseline = structuredClone(dataset) as Record<string, unknown>;
    delete missingBaseline.completionYearBaseline;

    expect(decodeUnloadingHistoryResponse(unexpectedVoyage)).toBeNull();
    expect(decodeUnloadingHistoryResponse(invalidMetadata)).toBeNull();
    expect(decodeUnloadingHistoryResponse(missingBaseline)).toBeNull();
  });

  it('matches strict public scalar enums, dates, ports, and safe text', () => {
    const prototypePort = structuredClone(dataset) as Record<string, unknown>;
    const portRows = prototypePort.voyages as Array<Record<string, unknown>>;
    const firstPorts = portRows[0].ports as Array<Record<string, unknown>>;
    firstPorts[0] = { ...firstPorts[0], code: 'toString' };

    const coercedEnum = structuredClone(dataset) as Record<string, unknown>;
    const enumRows = coercedEnum.voyages as Array<Record<string, unknown>>;
    enumRows[0] = { ...enumRows[0], verification: ['verified'] };

    const offsetlessDate = structuredClone(dataset) as Record<string, unknown>;
    (offsetlessDate.meta as Record<string, unknown>).generatedAt = '2026-08-12T12:00:00';

    const impossibleDate = structuredClone(dataset) as Record<string, unknown>;
    (impossibleDate.meta as Record<string, unknown>).generatedAt = '2026-02-30T00:00:00+09:00';

    const privateText = structuredClone(dataset) as Record<string, unknown>;
    const textRows = privateText.voyages as Array<Record<string, unknown>>;
    textRows[0] = { ...textRows[0], vessel: { canonicalName: 'C:\\private\\voyage' } };

    expect(decodeUnloadingHistoryResponse(prototypePort)).toBeNull();
    expect(decodeUnloadingHistoryResponse(coercedEnum)).toBeNull();
    expect(decodeUnloadingHistoryResponse(offsetlessDate)).toBeNull();
    expect(decodeUnloadingHistoryResponse(impossibleDate)).toBeNull();
    expect(decodeUnloadingHistoryResponse(privateText)).toBeNull();
  });

  it('isolates a failed load and returns to ready only after retry succeeds', () => {
    const failed = reduceHistoryLoadState({ kind: 'loading' }, { type: 'failure' });
    const retrying = reduceHistoryLoadState(failed, { type: 'retry' });
    const ready = reduceHistoryLoadState(retrying, { type: 'success', dataset });

    expect(failed).toEqual({ kind: 'error' });
    expect(retrying).toEqual({ kind: 'loading' });
    expect(ready).toEqual({ kind: 'ready', dataset });
  });

  it('replaces a ready snapshot after background refresh and keeps it on refresh failure', () => {
    const current = { kind: 'ready', dataset } as const;
    const refreshedDataset = structuredClone(dataset);
    refreshedDataset.meta.verifiedVoyageCount += 1;

    const refreshed = reduceHistoryLoadState(current, {
      type: 'success',
      dataset: refreshedDataset,
    });
    const retained = reduceHistoryLoadState(refreshed, { type: 'failure' });

    expect(refreshed).toEqual({ kind: 'ready', dataset: refreshedDataset });
    expect(retained).toEqual(refreshed);
  });

  it('renders accessible filters, exact chart summaries, and excluded rows', () => {
    const markup = renderToStaticMarkup(
      React.createElement(UnloadingHistoryView, { dataset, initialYear: 2022 }),
    );

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('id="unloading-history-tab-2022"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('검증된 최소치');
    expect(markup).toContain('부분 자료 · 연간 지표 합계 제외');
    expect(markup).toContain('2,101.340');
    expect(markup.match(/달력연도 배분/g)?.length).toBeGreaterThanOrEqual(2);
    expect(markup).toContain('2025년 검증 하역량 76,050.239MT, 검증 항차 17척');
    expect(markup).toContain('STATIC은 배포 스냅샷 전달 방식');
  });
});
