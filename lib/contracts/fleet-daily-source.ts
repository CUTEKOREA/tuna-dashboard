import { z } from 'zod';

const nullableMt = z.number().finite().nullable();
const amountNumber = /^\(?([-+]?\d[\d,]*(?:\.\d+)?)/;
const approximateAmount = /^\(약\s*([-+]?\d[\d,]*(?:\.\d+)?)톤?\)$/;
const immediatelyParenthetical = /^[-+]?\d[\d,]*(?:\.\d+)?\(([-+]?\d[\d,]*(?:\.\d+)?)\)/;

function assertAmountContract(
  row: Record<string, unknown>,
  valueKey: string,
  rawKey: string,
  parentheticalKey: string,
  ctx: z.RefinementCtx,
) {
  const raw = row[rawKey];
  const value = row[valueKey];
  const parenthetical = row[parentheticalKey];
  const normalizedRaw = typeof raw === 'string' ? raw.replaceAll(/\s+/g, '') : '';
  const base = normalizedRaw.match(amountNumber)?.[1] ?? normalizedRaw.match(approximateAmount)?.[1];
  const parsedValue = base === undefined ? null : Number(base.replaceAll(',', ''));
  const parentheticalMatch = normalizedRaw.match(immediatelyParenthetical)?.[1];
  const parsedParenthetical = parentheticalMatch === undefined
    ? null
    : Number(parentheticalMatch.replaceAll(',', ''));
  // 원문 `-`는 0톤. 빈 칸만 미기입(null)으로 남긴다.
  const invalid = normalizedRaw === ''
    ? value !== null || parenthetical !== null
    : normalizedRaw === '-'
      ? value !== 0 || parenthetical !== null
      : parsedValue === null || value !== parsedValue || parenthetical !== parsedParenthetical;
  if (invalid) {
    ctx.addIssue({
      code: 'custom',
      path: [valueKey],
      message: '원문 금액과 저장값이 일치하지 않습니다',
    });
  }
}

const fishingVesselSchema = z.object({
  name: z.string().min(1),
  position: z.string(),
  catchMt: nullableMt,
  catchMtRaw: z.string(),
  catchMtParenthetical: nullableMt,
  loadedMt: nullableMt,
  loadedMtRaw: z.string(),
  loadedMtParenthetical: nullableMt,
  note: z.string(),
}).strict().superRefine((row, ctx) => {
  assertAmountContract(row, 'catchMt', 'catchMtRaw', 'catchMtParenthetical', ctx);
  assertAmountContract(row, 'loadedMt', 'loadedMtRaw', 'loadedMtParenthetical', ctx);
});

const carrierVesselSchema = z.object({
  name: z.string().min(1),
  entityType: z.enum(['vessel', 'container']),
  loadedMt: nullableMt,
  loadedMtRaw: z.string(),
  loadedMtParenthetical: nullableMt,
  expectedRemainingMt: nullableMt,
  expectedRemainingMtRaw: z.string(),
  expectedRemainingParentheticalMt: nullableMt,
  loadPlan: z.string(),
  note: z.string(),
}).strict().superRefine((row, ctx) => {
  assertAmountContract(row, 'loadedMt', 'loadedMtRaw', 'loadedMtParenthetical', ctx);
  assertAmountContract(row, 'expectedRemainingMt', 'expectedRemainingMtRaw', 'expectedRemainingParentheticalMt', ctx);
});

const longlineVesselSchema = z.object({
  name: z.string().min(1),
  loadedMt: nullableMt,
  loadedMtRaw: z.string(),
  loadedMtParenthetical: nullableMt,
  note: z.string(),
}).strict().superRefine((row, ctx) => {
  assertAmountContract(row, 'loadedMt', 'loadedMtRaw', 'loadedMtParenthetical', ctx);
});

const regionSchema = z.object({
  asOf: z.iso.date(),
  dailyMt: z.number().finite(),
  monthlyMt: z.number().finite(),
  annualMt: z.number().finite(),
}).strict();

const regionDailySchema = regionSchema.omit({ asOf: true }).strict();

const carrierSummarySchema = z.object({
  loadedTotalMt: nullableMt,
  loadedTotalMtRaw: z.string(),
  loadedTotalParentheticalMt: nullableMt,
  expectedRemainingMt: nullableMt,
  expectedRemainingMtRaw: z.string(),
  expectedRemainingParentheticalMt: nullableMt,
}).strict().superRefine((row, ctx) => {
  assertAmountContract(row, 'loadedTotalMt', 'loadedTotalMtRaw', 'loadedTotalParentheticalMt', ctx);
  assertAmountContract(row, 'expectedRemainingMt', 'expectedRemainingMtRaw', 'expectedRemainingParentheticalMt', ctx);
});

const dailySeriesRegionSchema = z.object({
  totalMt: z.array(z.number().finite().nullable()),
  vessels: z.record(z.string(), z.array(z.number().finite().nullable())),
}).strict();

const dailySummarySchema = z.object({
  reportDate: z.iso.date(),
  asOf: z.iso.date(),
  pacific: regionDailySchema,
  atlantic: regionDailySchema,
  carrier: carrierSummarySchema,
}).strict();

const RECONCILIATION_FIELDS = [
  'pacific.dailyMt',
  'atlantic.dailyMt',
  'carrier.loadedMt',
  'carrier.expectedRemainingMt',
] as const;

const reconciliationCheckSchema = z.object({
  reportDate: z.iso.date(),
  field: z.enum(RECONCILIATION_FIELDS),
  reportedMt: nullableMt,
  knownRowsMt: z.number().finite(),
  missingCount: z.number().int().nonnegative(),
  status: z.enum([
    'completeMatch',
    'completeMismatch',
    'reportedMissing',
    'incompleteUnavailable',
    'knownRowsExceedReported',
    'incompletePartialDifference',
  ]),
}).strict().superRefine((row, ctx) => {
  let expectedStatus: typeof row.status;
  if (row.reportedMt === null) expectedStatus = 'reportedMissing';
  else if (row.missingCount === 0) {
    expectedStatus = Math.abs(row.reportedMt - row.knownRowsMt) < 0.001
      ? 'completeMatch'
      : 'completeMismatch';
  } else if (row.knownRowsMt - row.reportedMt >= 0.001) expectedStatus = 'knownRowsExceedReported';
  else if (Math.abs(row.reportedMt - row.knownRowsMt) >= 0.001) expectedStatus = 'incompletePartialDifference';
  else expectedStatus = 'incompleteUnavailable';
  if (row.status !== expectedStatus) {
    ctx.addIssue({
      code: 'custom',
      path: ['status'],
      message: '검산 판정과 원문 보고 상태가 일치하지 않습니다',
    });
  }
});

const fleetDailySourceSchema = z.object({
  _meta: z.object({
    schemaVersion: z.literal(1),
    reportCount: z.number().int().positive(),
    firstReportDate: z.iso.date(),
    latestReportDate: z.iso.date(),
    latestAsOf: z.iso.date(),
  }).strict(),
  latest: z.object({
    reportDate: z.iso.date(),
    asOf: z.iso.date(),
    pacific: regionSchema.extend({ vessels: z.array(fishingVesselSchema).min(1) }).strict(),
    atlantic: regionSchema.extend({ vessels: z.array(fishingVesselSchema).min(1) }).strict(),
    carrier: carrierSummarySchema.safeExtend({ vessels: z.array(carrierVesselSchema).min(1) }).strict(),
    longline: z.object({ vessels: z.array(longlineVesselSchema) }).strict(),
  }).strict(),
  previous: dailySummarySchema,
  daily: z.array(dailySummarySchema).min(2),
  dailySeries: z.object({
    dates: z.array(z.iso.date()),
    pacific: dailySeriesRegionSchema,
    atlantic: dailySeriesRegionSchema,
  }).strict(),
  quality: z.object({
    reconciliationChecks: z.array(reconciliationCheckSchema),
    duplicateVesselRows: z.array(z.iso.date()),
    coordinateFormatIssues: z.array(z.iso.date()),
    longlineSectionMissing: z.array(z.iso.date()),
    counts: z.object({
      reconciliationChecks: z.number().int().nonnegative(),
      reconciliationCompleteChecks: z.number().int().nonnegative(),
      reconciliationUnavailableChecks: z.number().int().nonnegative(),
      reconciliationUnavailableDocuments: z.number().int().nonnegative(),
      reconciliationIssues: z.number().int().nonnegative(),
      reconciliationDocuments: z.number().int().nonnegative(),
      reconciliationPartialDifferences: z.number().int().nonnegative(),
      reconciliationPartialDifferenceDocuments: z.number().int().nonnegative(),
      duplicateVesselRows: z.number().int().nonnegative(),
      coordinateFormatIssues: z.number().int().nonnegative(),
      longlineSectionMissing: z.number().int().nonnegative(),
    }).strict(),
  }).strict(),
}).strict();

export type FleetDailySourcePayload = z.infer<typeof fleetDailySourceSchema>;

function dailyReportedMt(
  report: FleetDailySourcePayload['daily'][number],
  field: typeof RECONCILIATION_FIELDS[number],
) {
  if (field === 'pacific.dailyMt') return report.pacific.dailyMt;
  if (field === 'atlantic.dailyMt') return report.atlantic.dailyMt;
  if (field === 'carrier.loadedMt') return report.carrier.loadedTotalMt;
  return report.carrier.expectedRemainingMt;
}

export function validateFleetDailySourcePayload(payload: unknown): FleetDailySourcePayload {
  const parsed = fleetDailySourceSchema.safeParse(payload);
  if (!parsed.success) {
    const paths = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
    throw new Error(`fleet daily source contract is invalid: ${paths}`);
  }
  const fleet = parsed.data;
  const finalDaily = fleet.daily.at(-1)!;
  const previousDaily = fleet.daily.at(-2)!;

  if (fleet.daily.some((entry, index) => index > 0 && entry.reportDate <= fleet.daily[index - 1].reportDate)) {
    throw new Error('fleet daily source contract is invalid: daily report dates must be strictly ascending');
  }
  if (JSON.stringify(fleet.previous) !== JSON.stringify(previousDaily)) {
    throw new Error('fleet daily source contract is invalid: previous summary must equal the preceding daily aggregate');
  }
  const latestSummary = {
    pacific: {
      asOf: fleet.latest.pacific.asOf,
      dailyMt: fleet.latest.pacific.dailyMt,
      monthlyMt: fleet.latest.pacific.monthlyMt,
      annualMt: fleet.latest.pacific.annualMt,
    },
    atlantic: {
      asOf: fleet.latest.atlantic.asOf,
      dailyMt: fleet.latest.atlantic.dailyMt,
      monthlyMt: fleet.latest.atlantic.monthlyMt,
      annualMt: fleet.latest.atlantic.annualMt,
    },
    carrier: {
      loadedTotalMt: fleet.latest.carrier.loadedTotalMt,
      loadedTotalMtRaw: fleet.latest.carrier.loadedTotalMtRaw,
      loadedTotalParentheticalMt: fleet.latest.carrier.loadedTotalParentheticalMt,
      expectedRemainingMt: fleet.latest.carrier.expectedRemainingMt,
      expectedRemainingMtRaw: fleet.latest.carrier.expectedRemainingMtRaw,
      expectedRemainingParentheticalMt: fleet.latest.carrier.expectedRemainingParentheticalMt,
    },
  };
  const finalSummary = {
    pacific: { asOf: finalDaily.asOf, ...finalDaily.pacific },
    atlantic: { asOf: finalDaily.asOf, ...finalDaily.atlantic },
    carrier: finalDaily.carrier,
  };
  if (JSON.stringify(latestSummary) !== JSON.stringify(finalSummary)) {
    throw new Error('fleet daily source contract is invalid: latest summary must equal the final daily aggregate');
  }
  if (
    fleet._meta.reportCount !== fleet.daily.length
    || fleet._meta.firstReportDate !== fleet.daily[0].reportDate
    || fleet._meta.latestReportDate !== finalDaily.reportDate
    || fleet._meta.latestAsOf !== finalDaily.asOf
    || fleet.latest.reportDate !== finalDaily.reportDate
    || fleet.latest.asOf !== finalDaily.asOf
  ) {
    throw new Error('fleet daily source contract is invalid: metadata does not match daily aggregates');
  }

  const knownReportDates = new Set(fleet.daily.map((entry) => entry.reportDate));
  const checks = fleet.quality.reconciliationChecks;
  const checkKeys = checks.map((check) => `${check.reportDate}:${check.field}`);
  if (
    checks.length !== fleet._meta.reportCount * RECONCILIATION_FIELDS.length
    || checkKeys.length !== new Set(checkKeys).size
    || checks.some((check) => !knownReportDates.has(check.reportDate))
  ) {
    throw new Error('fleet daily source contract is invalid: quality checks must cover each report field exactly once');
  }
  const dailyByDate = new Map(fleet.daily.map((entry) => [entry.reportDate, entry]));
  if (checks.some((check) => check.reportedMt !== dailyReportedMt(dailyByDate.get(check.reportDate)!, check.field))) {
    throw new Error('fleet daily source contract is invalid: quality check reported totals must match daily aggregates');
  }
  const latestRows: Record<typeof RECONCILIATION_FIELDS[number], Array<number | null>> = {
    'pacific.dailyMt': fleet.latest.pacific.vessels.map((row) => row.catchMt),
    'atlantic.dailyMt': fleet.latest.atlantic.vessels.map((row) => row.catchMt),
    'carrier.loadedMt': fleet.latest.carrier.vessels.map((row) => row.loadedMt),
    'carrier.expectedRemainingMt': fleet.latest.carrier.vessels.map((row) => row.expectedRemainingMt),
  };
  const latestChecks = checks.filter((check) => check.reportDate === fleet.latest.reportDate);
  if (latestChecks.some((check) => {
    const rows = latestRows[check.field];
    const knownRowsMt = rows.reduce<number>((total, value) => total + (value ?? 0), 0);
    const missingCount = rows.filter((value) => value === null).length;
    return Math.abs(check.knownRowsMt - knownRowsMt) >= 0.001 || check.missingCount !== missingCount;
  })) {
    throw new Error('fleet daily source contract is invalid: latest quality checks must match latest detail rows');
  }

  const complete = checks.filter((check) => ['completeMatch', 'completeMismatch'].includes(check.status));
  const unavailable = checks.filter((check) => !['completeMatch', 'completeMismatch'].includes(check.status));
  const issues = checks.filter((check) => ['completeMismatch', 'knownRowsExceedReported'].includes(check.status));
  const differences = checks.filter((check) => ['completeMismatch', 'knownRowsExceedReported', 'incompletePartialDifference'].includes(check.status));
  const qualityDateArrays = [
    fleet.quality.duplicateVesselRows,
    fleet.quality.coordinateFormatIssues,
    fleet.quality.longlineSectionMissing,
  ];
  const counts = fleet.quality.counts;
  if (
    qualityDateArrays.some((dates) => dates.length !== new Set(dates).size || dates.some((value) => !knownReportDates.has(value)))
    || counts.reconciliationChecks !== checks.length
    || counts.reconciliationCompleteChecks !== complete.length
    || counts.reconciliationUnavailableChecks !== unavailable.length
    || counts.reconciliationUnavailableDocuments !== new Set(unavailable.map((check) => check.reportDate)).size
    || counts.reconciliationIssues !== issues.length
    || counts.reconciliationDocuments !== new Set(issues.map((check) => check.reportDate)).size
    || counts.reconciliationPartialDifferences !== differences.length
    || counts.reconciliationPartialDifferenceDocuments !== new Set(differences.map((check) => check.reportDate)).size
    || counts.duplicateVesselRows !== fleet.quality.duplicateVesselRows.length
    || counts.coordinateFormatIssues !== fleet.quality.coordinateFormatIssues.length
    || counts.longlineSectionMissing !== fleet.quality.longlineSectionMissing.length
  ) {
    throw new Error('fleet daily source contract is invalid: quality counts do not match quality evidence');
  }
  return fleet;
}
