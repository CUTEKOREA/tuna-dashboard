import type {
  GmtsCanneryName,
  GmtsDashboardData,
  GmtsPriceQualifier,
  GmtsQualityFlag,
  GmtsSource,
  GmtsVesselRecord,
} from './data/gmts';

export type GmtsMetricTone = 'neutral' | 'positive' | 'warning';

export interface GmtsHeroMetric {
  value: string;
  unit: string;
  tone: GmtsMetricTone;
}

export interface GmtsCountHeroMetric {
  value: string;
  tone: 'neutral' | 'warning';
}

export interface GmtsPriceHeroMetric extends GmtsHeroMetric {
  qualifier: GmtsPriceQualifier;
  rawText: string;
}

export interface GmtsVolumeHeroMetric extends GmtsHeroMetric {
  deltaPct: number | null;
  currentYear: number | null;
  priorYear: number | null;
}

export interface GmtsHeroPresentation {
  report: {
    reportDate: string;
    reportDateLabel: string;
    operationalAsOf: null;
    operationalAsOfLabel: '운영 기준일 미기재';
    archiveLabel: string;
    statusLabel: '정적 스냅샷';
  };
  activeVessels: GmtsCountHeroMetric;
  completedVessels: GmtsHeroMetric;
  incomingVessels: GmtsHeroMetric;
  productionUtilization: GmtsHeroMetric;
  storageUtilization: GmtsHeroMetric;
  ytdVolume: GmtsVolumeHeroMetric;
  nonGspPrice: GmtsPriceHeroMetric;
  gspPrice: GmtsPriceHeroMetric;
}

export interface GmtsPortTrendPoint {
  reportDate: string;
  activeDeclaredCount: number | null;
  activeRecordCount: number;
  completedDeclaredCount: number | null;
  completedRecordCount: number;
  incomingDeclaredCount: number | null;
  incomingRecordCount: number;
}

export interface GmtsCanneryTrendPoint {
  reportDate: string;
  productionUtilizationPct: number | null;
  currentDailyProductionMt: number | null;
  maxDailyProductionMt: number | null;
  storageUtilizationPct: number | null;
  currentStockMt: number | null;
  storageCapacityMt: number | null;
  reportedProcessingDays: number | null;
}

export interface GmtsPriceTrendPoint {
  reportDate: string;
  nonGspAmount: number | null;
  nonGspQualifier: GmtsPriceQualifier;
  nonGspQualifierLabel: string;
  nonGspRawText: string;
  gspAmount: number | null;
  gspQualifier: GmtsPriceQualifier;
  gspQualifierLabel: string;
  gspRawText: string;
  premiumAmount: number | null;
  unit: '원문 분모 미기재';
}

export interface GmtsMonthlyVolumePoint {
  month: string;
  monthIndex: number;
  currentYear: number | null;
  priorYear: number | null;
  currentValue: number | null;
  priorValue: number | null;
  yearOverYearPct: number | null;
  unit: '원문 단위 미기재';
  revisions: Array<{
    previousReportDate: string;
    previousValue: number | null;
    reportDate: string;
    value: number | null;
  }>;
}

export interface GmtsVolumeComparison {
  currentYear: number | null;
  priorYear: number | null;
  currentComparableYtd: number | null;
  priorComparableYtd: number | null;
  deltaPct: number | null;
  comparableMonthIndexes: number[];
  unit: '원문 단위 미기재';
}

export interface GmtsPricePremiumComparison {
  amount: number | null;
  pct: number | null;
  unit: '원문 분모 미기재';
}

export interface GmtsLatestPortLanePresentation {
  declaredCount: number | null;
  recordCount: number;
  records: GmtsVesselRecord[];
  totalCargoMt: number | null;
  totalDischargedMt: number | null;
  totalShortMt: number | null;
  gensanAllocationMt: number | null;
}

export interface GmtsLatestCanneryPresentation {
  name: GmtsCanneryName;
  maximumProductionMt: number;
  currentProductionMt: number;
  productionUtilizationPercent: number;
  maximumCapacityMt: number;
  currentStockMt: number;
  storageUtilizationPercent: number;
  processingDays: number;
  requiresSourceCheck: boolean;
}

export interface GmtsInsight {
  situation: string;
  action: string;
}

export interface GmtsQualitySummary {
  totalFlags: number;
  byCode: {
    blankDeclaredCount: number;
    priceQualifier: number;
    volumeRevision: number;
    capacityExceeded: number;
    priceBasisUnitMissing: number;
    volumeUnitMissing: number;
  };
  blankDeclaredCounts: Extract<GmtsQualityFlag, { code: 'blank_declared_count' }>[];
  priceQualifiers: Extract<GmtsQualityFlag, { code: 'price_qualifier' }>[];
  volumeRevisions: Extract<GmtsQualityFlag, { code: 'volume_revision' }>[];
  capacityExceeded: Extract<GmtsQualityFlag, { code: 'capacity_exceeded' }>[];
  missingUnits: Array<Extract<GmtsQualityFlag, {
    code: 'price_basis_unit_missing' | 'volume_unit_missing';
  }>>;
  unknownRuleNotice: string;
}

export interface GmtsSourcePresentation extends GmtsSource {
  sha256Prefix: string;
}

export interface GmtsSourceSummary {
  status: 'STATIC';
  statusLabel: '정적 스냅샷';
  reportCount: number;
  pageCount: number;
  coverageStart: string;
  coverageEnd: string;
  latestReportDate: string;
  operationalAsOf: null;
  operationalAsOfLabel: '운영 기준일 미기재';
  sources: GmtsSourcePresentation[];
}

export interface GmtsPresentation {
  hero: GmtsHeroPresentation;
  portTrend: GmtsPortTrendPoint[];
  canneryTrend: GmtsCanneryTrendPoint[];
  priceTrend: GmtsPriceTrendPoint[];
  monthlyVolume: GmtsMonthlyVolumePoint[];
  comparisons: {
    pricePremium: GmtsPricePremiumComparison;
    volume: GmtsVolumeComparison;
  };
  latestPort: {
    active: GmtsLatestPortLanePresentation;
    completed: GmtsLatestPortLanePresentation;
    incoming: GmtsLatestPortLanePresentation;
  };
  latestCanneries: GmtsLatestCanneryPresentation[];
  insights: {
    port: GmtsInsight;
    cannery: GmtsInsight;
    priceVolume: GmtsInsight;
  };
  qualitySummary: GmtsQualitySummary;
  sourceSummary: GmtsSourceSummary;
}

const KOREAN_MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
] as const;

const PRICE_QUALIFIER_LABELS: Record<GmtsPriceQualifier, string> = {
  quoted: '호가',
  'no-price': '가격 없음',
  'no-offer': '제안 없음',
  'no-transaction': '거래 없음',
  around: '약',
  level: '수준',
  under: '미만',
  'old-contract': '기존 계약',
};

const PRICE_UNIT = '원문 분모 미기재' as const;
const VOLUME_UNIT = '원문 단위 미기재' as const;

function round(value: number, digits = 2): number {
  const scale = 10 ** digits;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}

function percentChange(current: number | null, prior: number | null): number | null {
  if (current === null || prior === null || prior === 0) return null;
  return round(((current - prior) / prior) * 100);
}

function sumNullable(values: Array<number | null>): number | null {
  const known = values.filter((value): value is number => value !== null);
  if (known.length === 0) return null;
  return round(known.reduce((sum, value) => sum + value, 0), 3);
}

function formatInteger(value: number | null): string {
  return value === null ? '미확정' : value.toLocaleString('ko-KR');
}

function formatDecimal(value: number | null, digits = 3): string {
  if (value === null) return '미확정';
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPrice(value: number | null): string {
  return value === null ? '미확정' : `$${value.toLocaleString('ko-KR')}`;
}

function formatReportDate(value: string): string {
  return value.replaceAll('-', '.');
}

function metricTone(delta: number | null): GmtsMetricTone {
  if (delta === null || delta === 0) return 'neutral';
  return delta > 0 ? 'positive' : 'warning';
}

function buildLanePresentation(
  lane: GmtsDashboardData['latest']['port']['active'],
): GmtsLatestPortLanePresentation {
  return {
    declaredCount: lane.declaredCount,
    recordCount: lane.recordCount,
    records: lane.records,
    totalCargoMt: sumNullable(lane.records.map((record) => record.cargo)),
    totalDischargedMt: sumNullable(lane.records.map((record) => record.discharged)),
    totalShortMt: sumNullable(lane.records.map((record) => record.short)),
    gensanAllocationMt: sumNullable(lane.records.map((record) => record.gensanAllocation)),
  };
}

function buildVolumeComparison(data: GmtsDashboardData): GmtsVolumeComparison {
  const ordered = [...data.volumeHistory.annual].sort((left, right) => left.year - right.year);
  const current = ordered.at(-1);
  const prior = ordered.at(-2);

  if (!current || !prior) {
    return {
      currentYear: current?.year ?? null,
      priorYear: prior?.year ?? null,
      currentComparableYtd: null,
      priorComparableYtd: null,
      deltaPct: null,
      comparableMonthIndexes: [],
      unit: VOLUME_UNIT,
    };
  }

  const comparableMonthIndexes = current.months
    .map((value, index) => value !== null && prior.months[index] !== null ? index : null)
    .filter((index): index is number => index !== null);
  const currentComparableYtd = comparableMonthIndexes.length === 0
    ? null
    : comparableMonthIndexes.reduce((sum, index) => sum + (current.months[index] ?? 0), 0);
  const priorComparableYtd = comparableMonthIndexes.length === 0
    ? null
    : comparableMonthIndexes.reduce((sum, index) => sum + (prior.months[index] ?? 0), 0);

  return {
    currentYear: current.year,
    priorYear: prior.year,
    currentComparableYtd,
    priorComparableYtd,
    deltaPct: percentChange(currentComparableYtd, priorComparableYtd),
    comparableMonthIndexes,
    unit: VOLUME_UNIT,
  };
}

function buildMonthlyVolume(
  data: GmtsDashboardData,
  comparison: GmtsVolumeComparison,
): GmtsMonthlyVolumePoint[] {
  const current = data.volumeHistory.annual.find((row) => row.year === comparison.currentYear);
  const prior = data.volumeHistory.annual.find((row) => row.year === comparison.priorYear);

  return KOREAN_MONTHS.map((month, monthIndex) => {
    const currentValue = current?.months[monthIndex] ?? null;
    const priorValue = prior?.months[monthIndex] ?? null;
    const revisionMonth = current
      ? `${current.year}-${String(monthIndex + 1).padStart(2, '0')}`
      : null;

    return {
      month,
      monthIndex,
      currentYear: current?.year ?? null,
      priorYear: prior?.year ?? null,
      currentValue,
      priorValue,
      yearOverYearPct: percentChange(currentValue, priorValue),
      unit: VOLUME_UNIT,
      revisions: revisionMonth === null
        ? []
        : data.volumeHistory.revisions
          .filter((revision) => revision.month === revisionMonth)
          .map(({ previousReportDate, previousValue, reportDate, value }) => ({
            previousReportDate,
            previousValue,
            reportDate,
            value,
          })),
    };
  });
}

function buildQualitySummary(flags: GmtsQualityFlag[]): GmtsQualitySummary {
  const summary: GmtsQualitySummary = {
    totalFlags: flags.length,
    byCode: {
      blankDeclaredCount: 0,
      priceQualifier: 0,
      volumeRevision: 0,
      capacityExceeded: 0,
      priceBasisUnitMissing: 0,
      volumeUnitMissing: 0,
    },
    blankDeclaredCounts: [],
    priceQualifiers: [],
    volumeRevisions: [],
    capacityExceeded: [],
    missingUnits: [],
    unknownRuleNotice: '원문에서 확인되지 않은 값은 화면에서도 확정하지 않음',
  };

  for (const flag of flags) {
    switch (flag.code) {
      case 'blank_declared_count':
        summary.byCode.blankDeclaredCount += 1;
        summary.blankDeclaredCounts.push(flag);
        break;
      case 'price_qualifier':
        summary.byCode.priceQualifier += 1;
        summary.priceQualifiers.push(flag);
        break;
      case 'volume_revision':
        summary.byCode.volumeRevision += 1;
        summary.volumeRevisions.push(flag);
        break;
      case 'capacity_exceeded':
        summary.byCode.capacityExceeded += 1;
        summary.capacityExceeded.push(flag);
        break;
      case 'price_basis_unit_missing':
        summary.byCode.priceBasisUnitMissing += 1;
        summary.missingUnits.push(flag);
        break;
      case 'volume_unit_missing':
        summary.byCode.volumeUnitMissing += 1;
        summary.missingUnits.push(flag);
        break;
    }
  }

  return summary;
}

function buildPricePremium(data: GmtsDashboardData): GmtsPricePremiumComparison {
  const nonGsp = data.latest.prices.nonGspNonMsc.amount;
  const gsp = data.latest.prices.gspNonMsc.amount;
  const amount = nonGsp === null || gsp === null ? null : round(gsp - nonGsp, 2);

  return {
    amount,
    pct: amount === null || nonGsp === null || nonGsp === 0
      ? null
      : round((amount / nonGsp) * 100),
    unit: PRICE_UNIT,
  };
}

function buildInsights(
  data: GmtsDashboardData,
  latestPort: GmtsPresentation['latestPort'],
  comparison: GmtsVolumeComparison,
  premium: GmtsPricePremiumComparison,
): GmtsPresentation['insights'] {
  const { latest } = data;
  const activeStatement = latest.port.active.declaredCount === null
    ? '하역 중 건수는 원문 공란이므로 확정하지 않습니다.'
    : `하역 중 건수는 ${latest.port.active.declaredCount}척입니다.`;
  const overdueIncoming = latest.port.incoming.records
    .filter((record) => record.dates.etaStart.value !== null
      && record.dates.etaStart.value < latest.reportDate)
    .map((record) => record.displayName);
  const overdueSubject = overdueIncoming.length > 0
    ? overdueIncoming.join('·')
    : '입항 예정 선박';
  const exceededCanneries = data.qualityFlags
    .filter((flag): flag is Extract<GmtsQualityFlag, { code: 'capacity_exceeded' }> => (
      flag.code === 'capacity_exceeded' && flag.reportDate === latest.reportDate
    ));
  const capacitySubject = exceededCanneries.map((flag) => flag.name).join('·') || '용량 초과 공장';
  const capacityPercent = exceededCanneries.at(0)?.storageUtilizationPercent ?? null;
  const latestCurrentMonthIndex = comparison.comparableMonthIndexes.at(-1);
  const latestMonth = latestCurrentMonthIndex === undefined
    ? null
    : KOREAN_MONTHS[latestCurrentMonthIndex];
  const monthlyComparison = latestCurrentMonthIndex === undefined
    ? null
    : percentChange(
      data.volumeHistory.annual.find((row) => row.year === comparison.currentYear)
        ?.months[latestCurrentMonthIndex] ?? null,
      data.volumeHistory.annual.find((row) => row.year === comparison.priorYear)
        ?.months[latestCurrentMonthIndex] ?? null,
    );

  return {
    port: {
      situation: `${formatReportDate(latest.reportDate)} 보고에서 하역 완료 ${latest.port.completed.recordCount}척은 화물 ${formatDecimal(latestPort.completed.totalCargoMt)} MT 중 ${formatDecimal(latestPort.completed.totalDischargedMt)} MT를 양하했고 SHORT는 ${formatDecimal(latestPort.completed.totalShortMt)} MT입니다. 입항 예정 ${latest.port.incoming.recordCount}척의 표시 총화물은 ${formatDecimal(latestPort.incoming.totalCargoMt)} MT이지만, Gensan 명시 배정량은 ${formatDecimal(latestPort.incoming.gensanAllocationMt)} MT로 분리됩니다. ${activeStatement}`,
      action: `${overdueSubject}의 실제 입항·접안 상태를 운영 기록으로 재확인하고, 표시 총화물을 Gensan 반입 예측치로 직접 사용하지 않습니다.`,
    },
    cannery: {
      situation: `${latest.canneries.filter((row) => row.name !== 'Total').length}개 공장의 일생산은 ${formatInteger(latest.canneryTotal.currentDailyProductionMt)}/${formatInteger(latest.canneryTotal.maxDailyProductionMt)} MT로 가동률 ${latest.canneryTotal.productionUtilizationPct}%이고, 냉동 재고는 ${formatInteger(latest.canneryTotal.currentStockMt)}/${formatInteger(latest.canneryTotal.storageCapacityMt)} MT로 이용률 ${latest.canneryTotal.storageUtilizationPct}%입니다. ${capacitySubject}는 원문상 창고 이용률 ${formatInteger(capacityPercent)}%로 보고되어 원문 확인이 필요합니다.`,
      action: `${capacitySubject}의 용량·재고 기준을 GMTS에 재확인하고, 정정 전까지 ${formatInteger(capacityPercent)}%를 추가 배정 가능 여력으로 해석하지 않습니다.`,
    },
    priceVolume: {
      situation: `${formatReportDate(latest.reportDate)} 보고 가격은 Non-GSP ${formatPrice(latest.prices.nonGspNonMsc.amount)}, GSP ${formatPrice(latest.prices.gspNonMsc.amount)}로 차이는 ${formatPrice(premium.amount)}이며, 원문은 분모 단위를 명시하지 않았습니다. ${comparison.currentYear ?? '현재 연도'}년 비교 가능 누적 반입량 ${formatInteger(comparison.currentComparableYtd)}은 ${comparison.priorYear ?? '전년'}년 동기보다 ${comparison.deltaPct === null ? '비교 미확정' : `${Math.abs(comparison.deltaPct).toFixed(2)}% ${comparison.deltaPct < 0 ? '낮고' : '높고'}`}, ${latestMonth ?? '최신 월'}은 전년 동월보다 ${monthlyComparison === null ? '비교 미확정입니다' : `${Math.abs(monthlyComparison).toFixed(2)}% ${monthlyComparison < 0 ? '낮습니다' : '높습니다'}`}.`,
      action: `GSP 프리미엄 ${formatPrice(premium.amount)}의 분모 단위와 거래 기준을 GMTS에 확인한 뒤 구매 비교에 사용하고, ${latestMonth ?? '최신 월'} 반입 변화를 다음 보고의 공장 재고와 함께 점검합니다.`,
    },
  };
}

export function buildGmtsPresentation(data: GmtsDashboardData): GmtsPresentation {
  const volumeComparison = buildVolumeComparison(data);
  const pricePremium = buildPricePremium(data);
  const latestPort = {
    active: buildLanePresentation(data.latest.port.active),
    completed: buildLanePresentation(data.latest.port.completed),
    incoming: buildLanePresentation(data.latest.port.incoming),
  };
  const qualitySummary = buildQualitySummary(data.qualityFlags);
  const ytdValue = volumeComparison.currentComparableYtd;

  return {
    hero: {
      report: {
        reportDate: data.latest.reportDate,
        reportDateLabel: `보고일 ${formatReportDate(data.latest.reportDate)}`,
        operationalAsOf: data.latest.operationalAsOf,
        operationalAsOfLabel: '운영 기준일 미기재',
        archiveLabel: `${data.metadata.reportCount}건 정적 스냅샷`,
        statusLabel: '정적 스냅샷',
      },
      activeVessels: data.latest.port.active.declaredCount === null
        ? { value: '미확정', tone: 'warning' }
        : { value: `${data.latest.port.active.declaredCount}척`, tone: 'neutral' },
      completedVessels: {
        value: formatInteger(data.latest.port.completed.declaredCount),
        unit: '척',
        tone: data.latest.port.completed.declaredCount === null ? 'warning' : 'neutral',
      },
      incomingVessels: {
        value: formatInteger(data.latest.port.incoming.declaredCount),
        unit: '척',
        tone: data.latest.port.incoming.declaredCount === null ? 'warning' : 'neutral',
      },
      productionUtilization: {
        value: formatInteger(data.latest.canneryTotal.productionUtilizationPct),
        unit: '%',
        tone: 'neutral',
      },
      storageUtilization: {
        value: formatInteger(data.latest.canneryTotal.storageUtilizationPct),
        unit: '%',
        tone: 'neutral',
      },
      ytdVolume: {
        value: formatInteger(ytdValue),
        unit: VOLUME_UNIT,
        tone: metricTone(volumeComparison.deltaPct),
        deltaPct: volumeComparison.deltaPct,
        currentYear: volumeComparison.currentYear,
        priorYear: volumeComparison.priorYear,
      },
      nonGspPrice: {
        value: formatPrice(data.latest.prices.nonGspNonMsc.amount),
        unit: PRICE_UNIT,
        tone: data.latest.prices.nonGspNonMsc.amount === null ? 'warning' : 'neutral',
        qualifier: data.latest.prices.nonGspNonMsc.qualifier,
        rawText: data.latest.prices.nonGspNonMsc.rawText,
      },
      gspPrice: {
        value: formatPrice(data.latest.prices.gspNonMsc.amount),
        unit: PRICE_UNIT,
        tone: data.latest.prices.gspNonMsc.amount === null ? 'warning' : 'neutral',
        qualifier: data.latest.prices.gspNonMsc.qualifier,
        rawText: data.latest.prices.gspNonMsc.rawText,
      },
    },
    portTrend: data.weekly.map(({ reportDate, port }) => ({
      reportDate,
      activeDeclaredCount: port.active.declaredCount,
      activeRecordCount: port.active.recordCount,
      completedDeclaredCount: port.completed.declaredCount,
      completedRecordCount: port.completed.recordCount,
      incomingDeclaredCount: port.incoming.declaredCount,
      incomingRecordCount: port.incoming.recordCount,
    })),
    canneryTrend: data.weekly.map(({ reportDate, canneryTotal }) => ({
      reportDate,
      productionUtilizationPct: canneryTotal.productionUtilizationPct,
      currentDailyProductionMt: canneryTotal.currentDailyProductionMt,
      maxDailyProductionMt: canneryTotal.maxDailyProductionMt,
      storageUtilizationPct: canneryTotal.storageUtilizationPct,
      currentStockMt: canneryTotal.currentStockMt,
      storageCapacityMt: canneryTotal.storageCapacityMt,
      reportedProcessingDays: canneryTotal.reportedProcessingDays,
    })),
    priceTrend: data.weekly.map(({ reportDate, prices }) => ({
      reportDate,
      nonGspAmount: prices.nonGspNonMsc.amount,
      nonGspQualifier: prices.nonGspNonMsc.qualifier,
      nonGspQualifierLabel: PRICE_QUALIFIER_LABELS[prices.nonGspNonMsc.qualifier],
      nonGspRawText: prices.nonGspNonMsc.rawText,
      gspAmount: prices.gspNonMsc.amount,
      gspQualifier: prices.gspNonMsc.qualifier,
      gspQualifierLabel: PRICE_QUALIFIER_LABELS[prices.gspNonMsc.qualifier],
      gspRawText: prices.gspNonMsc.rawText,
      premiumAmount: prices.nonGspNonMsc.amount === null || prices.gspNonMsc.amount === null
        ? null
        : round(prices.gspNonMsc.amount - prices.nonGspNonMsc.amount, 2),
      unit: PRICE_UNIT,
    })),
    monthlyVolume: buildMonthlyVolume(data, volumeComparison),
    comparisons: {
      pricePremium,
      volume: volumeComparison,
    },
    latestPort,
    latestCanneries: data.latest.canneries
      .filter(({ name }) => name !== 'Total')
      .map((cannery) => ({
        name: cannery.name,
        maximumProductionMt: cannery.maximumProductionMt,
        currentProductionMt: cannery.currentProductionMt,
        productionUtilizationPercent: cannery.productionUtilizationPercent,
        maximumCapacityMt: cannery.maximumCapacityMt,
        currentStockMt: cannery.currentStockMt,
        storageUtilizationPercent: cannery.storageUtilizationPercent,
        processingDays: cannery.processingDays,
        requiresSourceCheck: qualitySummary.capacityExceeded.some((flag) => (
          flag.reportDate === data.latest.reportDate && flag.name === cannery.name
        )),
      })),
    insights: buildInsights(data, latestPort, volumeComparison, pricePremium),
    qualitySummary,
    sourceSummary: {
      status: data.metadata.status,
      statusLabel: '정적 스냅샷',
      reportCount: data.metadata.reportCount,
      pageCount: data.metadata.pageCount,
      coverageStart: data.metadata.coverageStart,
      coverageEnd: data.metadata.coverageEnd,
      latestReportDate: data.metadata.latestReportDate,
      operationalAsOf: data.latest.operationalAsOf,
      operationalAsOfLabel: '운영 기준일 미기재',
      sources: data.sources.map((source) => ({
        ...source,
        sha256Prefix: source.sha256.slice(0, 12),
      })),
    },
  };
}
