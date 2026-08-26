import { describe, expect, it } from 'vitest';
import { getGmtsDashboard, type GmtsDashboardData } from '../lib/data/gmts';
import { buildGmtsPresentation } from '../lib/gmts-presentation';

function cloneDashboard(): GmtsDashboardData {
  return structuredClone(getGmtsDashboard());
}

describe('GMTS presentation model', () => {
  it('formats declared vessel counts for the latest report', () => {
    const view = buildGmtsPresentation(getGmtsDashboard());

    expect(view.hero.activeVessels).toEqual({ value: '2척', tone: 'neutral' });
    expect(view.hero.completedVessels).toEqual({ value: '1척', tone: 'neutral' });
    expect(view.hero.incomingVessels).toEqual({ value: '3척', tone: 'neutral' });
  });

  it('formats changed declared counts without attaching units to unknown values', () => {
    const data = cloneDashboard();
    data.latest.port.active.declaredCount = 2;
    data.latest.port.completed.declaredCount = null;
    data.latest.port.incoming.declaredCount = null;

    const view = buildGmtsPresentation(data);

    expect(view.hero.activeVessels).toEqual({ value: '2척', tone: 'neutral' });
    expect(view.hero.completedVessels).toEqual({ value: '미확정', tone: 'warning' });
    expect(view.hero.incomingVessels).toEqual({ value: '미확정', tone: 'warning' });
  });

  it('keeps missing source units visible in every price and volume surface', () => {
    const view = buildGmtsPresentation(getGmtsDashboard());

    expect(view.hero.gspPrice.unit).toBe('원문 분모 미기재');
    expect(view.hero.nonGspPrice.unit).toBe('원문 분모 미기재');
    expect(view.hero.ytdVolume.unit).toBe('원문 단위 미기재');
    expect(view.priceTrend.every((row) => row.unit === '원문 분모 미기재')).toBe(true);
    expect(view.monthlyVolume.every((row) => row.unit === '원문 단위 미기재')).toBe(true);
    expect(JSON.stringify(view)).not.toContain('$/MT');
  });

  it('derives the current comparable-volume movements', () => {
    const view = buildGmtsPresentation(getGmtsDashboard());

    expect(view.hero.ytdVolume.deltaPct).toBeCloseTo(-5.38, 2);
    expect(view.monthlyVolume.find((row) => row.month === '7월')?.yearOverYearPct)
      .toBeCloseTo(-21.30, 2);
    expect(view.comparisons.volume).toMatchObject({
      currentYear: 2026,
      priorYear: 2025,
      currentComparableYtd: 63736,
      priorComparableYtd: 67363,
      comparableMonthIndexes: [0, 1, 2, 3, 4, 5, 6],
    });
  });

  it('matches comparable YTD by month index when the current year has an internal gap', () => {
    const data = cloneDashboard();
    const current = data.volumeHistory.annual.find((row) => row.year === 2026);
    const prior = data.volumeHistory.annual.find((row) => row.year === 2025);
    if (!current || !prior) throw new Error('비교 연도 데이터가 필요합니다');
    current.months[1] = null;
    current.months[7] = 9000;

    const comparableIndexes = current.months
      .map((value, index) => value !== null && prior.months[index] !== null ? index : null)
      .filter((index): index is number => index !== null);
    const expectedCurrent = comparableIndexes.reduce(
      (sum, index) => sum + (current.months[index] ?? 0),
      0,
    );
    const expectedPrior = comparableIndexes.reduce(
      (sum, index) => sum + (prior.months[index] ?? 0),
      0,
    );

    const view = buildGmtsPresentation(data);

    expect(view.comparisons.volume.comparableMonthIndexes).toEqual([0, 2, 3, 4, 5, 6, 7]);
    expect(view.comparisons.volume.currentComparableYtd).toBe(expectedCurrent);
    expect(view.comparisons.volume.priorComparableYtd).toBe(expectedPrior);
  });

  it('keeps unavailable and zero-denominator comparisons null rather than fabricating zero', () => {
    const data = cloneDashboard();
    data.latest.prices.nonGspNonMsc.amount = 0;
    const current = data.volumeHistory.annual.at(-1);
    const prior = data.volumeHistory.annual.at(-2);
    if (!current || !prior) throw new Error('비교 연도 데이터가 필요합니다');
    current.months.fill(null);
    prior.months.fill(null);

    const view = buildGmtsPresentation(data);

    expect(view.comparisons.pricePremium.pct).toBeNull();
    expect(view.comparisons.volume).toMatchObject({
      currentComparableYtd: null,
      priorComparableYtd: null,
      deltaPct: null,
      comparableMonthIndexes: [],
    });
    expect(view.hero.ytdVolume).toMatchObject({ value: '미확정', deltaPct: null });
    expect(view.monthlyVolume.every((row) => row.yearOverYearPct === null)).toBe(true);
  });

  it('keeps declared vessel counts separate from observed row counts and leaves blanks as gaps', () => {
    const view = buildGmtsPresentation(getGmtsDashboard());
    const blankWeek = view.portTrend.find((row) => row.reportDate === '2026-04-08');

    expect(view.portTrend).toHaveLength(32);
    expect(blankWeek).toMatchObject({
      activeDeclaredCount: null,
      activeRecordCount: 0,
      completedDeclaredCount: null,
      completedRecordCount: 0,
    });
    expect(view.portTrend.at(-1)).toMatchObject({
      activeDeclaredCount: 2,
      activeRecordCount: 2,
      completedDeclaredCount: 1,
      completedRecordCount: 1,
      incomingDeclaredCount: 3,
      incomingRecordCount: 3,
    });
  });

  it('preserves price gaps, qualifiers, and raw text without interpolation', () => {
    const view = buildGmtsPresentation(getGmtsDashboard());
    const noPrice = view.priceTrend.find((row) => row.reportDate === '2026-02-25');
    const noOffer = view.priceTrend.find((row) => row.reportDate === '2026-05-06');
    const around = view.priceTrend.find((row) => row.reportDate === '2026-03-25');

    expect(view.priceTrend).toHaveLength(32);
    expect(noPrice).toMatchObject({ nonGspAmount: null, nonGspQualifier: 'no-price' });
    expect(noPrice?.nonGspRawText).toContain('No price');
    expect(noOffer).toMatchObject({ nonGspAmount: null, nonGspQualifier: 'no-offer' });
    expect(around).toMatchObject({
      nonGspQualifier: 'around',
      gspQualifier: 'around',
    });
  });

  it('derives the latest GSP premium and keeps TBA incoming cargo unconfirmed', () => {
    const view = buildGmtsPresentation(getGmtsDashboard());

    expect(view.comparisons.pricePremium).toEqual({
      amount: 50,
      pct: 2.38,
      unit: '원문 분모 미기재',
    });
    // 입항 예정 3척 화물은 원문 TBA·EMPTY — 합계를 0으로 만들지 않는다
    expect(view.latestPort.incoming).toMatchObject({
      totalCargoMt: null,
      gensanAllocationMt: null,
    });
  });

  it('derives current report figures and narrative from a changed typed fixture', () => {
    const data = cloneDashboard();
    const firstIncoming = data.latest.port.incoming.records[0];
    firstIncoming.cargo = 100;
    firstIncoming.gensanAllocation = 40;
    for (const record of data.latest.port.incoming.records.slice(1)) {
      record.cargo = null;
      record.gensanAllocation = null;
    }

    const view = buildGmtsPresentation(data);

    expect(view.latestPort.incoming).toMatchObject({
      totalCargoMt: 100,
      gensanAllocationMt: 40,
    });
    expect(view.insights.port.situation).toContain('100.000 MT');
    expect(view.insights.port.situation).toContain('40.000 MT');
    expect(view.insights.port.situation).not.toContain('4,994.414 MT');
  });

  it('builds Korean SIT and TAK text from the latest data with uncertainty visible', () => {
    const view = buildGmtsPresentation(getGmtsDashboard());

    expect(view.insights.port.situation.split('.').filter(Boolean).length).toBeGreaterThanOrEqual(2);
    expect(view.insights.port.situation).toContain('하역 완료 1척은 화물 580.000 MT 중 670.230 MT');
    expect(view.insights.port.situation).toContain('입항 예정 3척의 표시 총화물은 미확정 MT');
    expect(view.insights.port.situation).toContain('6,437.494 MT');
    expect(view.insights.port.situation).toContain('4,148.470 MT');
    // 초과 양하는 원문 수치 그대로 드러난다
    expect(view.insights.port.situation).toContain('F/V QUEEN ELLICE');
    expect(view.insights.port.situation).toContain('90.230 MT 초과 양하');
    expect(view.insights.port.action).toContain('Gensan 반입 예측치');
    expect(view.insights.cannery.situation).toContain('895/1,095 MT');
    expect(view.insights.cannery.situation).toContain('122%');
    expect(view.insights.priceVolume.situation).toContain('$50');
    expect(view.insights.priceVolume.situation).toContain('5.38%');
    expect(view.insights.priceVolume.action).toContain('분모 단위');
  });

  it('exposes structured quality and source summaries for the data-quality tab', () => {
    const view = buildGmtsPresentation(getGmtsDashboard());

    expect(view.qualitySummary.totalFlags).toBe(44);
    expect(view.qualitySummary.byCode.blankDeclaredCount).toBe(6);
    expect(view.qualitySummary.capacityExceeded).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Celebes', storageUtilizationPercent: 122 }),
    ]));
    expect(view.qualitySummary.volumeRevisions).toEqual(expect.arrayContaining([
      expect.objectContaining({ month: '2026-02', previousValue: 6220, value: 11968 }),
    ]));
    expect(view.qualitySummary.unknownRuleNotice).toContain('확정하지 않음');
    expect(view.sourceSummary).toMatchObject({
      status: 'STATIC',
      reportCount: 32,
      pageCount: 40,
      coverageStart: '2026-01-21',
      coverageEnd: '2026-08-26',
      latestReportDate: '2026-08-26',
      operationalAsOfLabel: '운영 기준일 미기재',
    });
    expect(view.sourceSummary.sources).toHaveLength(32);
    expect(view.sourceSummary.sources.at(-1)?.sha256Prefix).toHaveLength(12);
  });

  it('provides twelve Korean month labels and cannery trend totals', () => {
    const view = buildGmtsPresentation(getGmtsDashboard());

    expect(view.monthlyVolume.map((row) => row.month)).toEqual([
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월',
    ]);
    expect(view.canneryTrend).toHaveLength(32);
    expect(view.canneryTrend.at(-1)).toMatchObject({
      productionUtilizationPct: 82,
      currentDailyProductionMt: 895,
      maxDailyProductionMt: 1095,
      storageUtilizationPct: 43,
      currentStockMt: 17550,
      storageCapacityMt: 40600,
    });
  });
});
