import { z } from 'zod';

const nullableMt = z.number().finite().nullable();
const fishingHoldCapacitySchema = z.object({
  value: z.number().finite().positive(),
  unit: z.enum(['MT', '㎥']),
  source: z.enum(['FFA VRST', 'ICCAT']),
  asOf: z.iso.date(),
}).strict();
const regionAggregateSchema = z.object({
  asOf: z.iso.date(),
  dailyMt: z.number().finite(),
  monthlyMt: z.number().finite(),
  annualMt: z.number().finite(),
}).strict();

const reconciliationResultSchema = z.object({
  reportedMt: nullableMt,
  rowsMt: nullableMt,
  matches: z.boolean().nullable(),
  missingCount: z.number().int().nonnegative(),
}).strict();

const qualityCountsSchema = z.object({
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
}).strict();

const dailySeriesRegionSchema = z.object({
  totalMt: z.array(nullableMt),
  vessels: z.record(z.string(), z.array(nullableMt)),
}).strict();

const dailySeriesSchema = z.object({
  dates: z.array(z.iso.date()),
  pacific: dailySeriesRegionSchema,
  atlantic: dailySeriesRegionSchema,
}).strict();

export const fleetDailyPublicSchema = z.object({
  _meta: z.object({
    schemaVersion: z.literal(1),
    reportCount: z.number().int().positive(),
    firstReportDate: z.iso.date(),
    latestReportDate: z.iso.date(),
    latestAsOf: z.iso.date(),
    detailSha256: z.string().regex(/^[a-f0-9]{64}$/),
    detailSha256Compat: z.array(z.string().regex(/^[a-f0-9]{64}$/)).max(1).optional(),
  }).strict(),
  latest: z.object({
    reportDate: z.iso.date(),
    asOf: z.iso.date(),
    pacific: regionAggregateSchema,
    atlantic: regionAggregateSchema,
    carrier: z.object({
      loadedTotalMt: nullableMt,
      expectedRemainingMt: nullableMt,
    }).strict(),
  }).strict(),
  deltas: z.object({
    pacificDailyMt: z.number().finite(),
    atlanticDailyMt: z.number().finite(),
    totalDailyMt: z.number().finite(),
  }).strict(),
  reconciliation: z.object({
    pacificDaily: reconciliationResultSchema,
    atlanticDaily: reconciliationResultSchema,
    carrierLoaded: reconciliationResultSchema,
    carrierExpectedRemaining: reconciliationResultSchema,
    valid: z.boolean(),
    unavailableCount: z.number().int().nonnegative(),
    issueCount: z.number().int().nonnegative(),
  }).strict(),
  dailySeries: dailySeriesSchema,
  quality: z.object({
    counts: qualityCountsSchema,
    incompletePartialDifferences: z.number().int().nonnegative(),
    incompletePartialDifferenceDocuments: z.number().int().nonnegative(),
  }).strict(),
}).strict();

const fishingVesselSchema = z.object({
  name: z.string().min(1).max(120),
  position: z.string().max(80),
  catchMt: nullableMt,
  loadedMt: nullableMt,
  note: z.string().max(500),
  holdCapacity: fishingHoldCapacitySchema.nullable().optional(),
}).strict();

const carrierVesselSchema = z.object({
  name: z.string().min(1).max(160),
  displayName: z.string().min(1).max(160),
  capacityMt: nullableMt,
  entityType: z.enum(['vessel', 'container']),
  loadedMt: nullableMt,
  expectedRemainingMt: nullableMt,
  loadPlan: z.string().max(500),
  note: z.string().max(500),
}).strict();

const longlineVesselSchema = z.object({
  name: z.string().min(1).max(120),
  loadedMt: nullableMt,
  note: z.string().max(500),
}).strict();

export const fleetDailyDetailSchema = z.object({
  reportDate: z.iso.date(),
  asOf: z.iso.date(),
  pacific: regionAggregateSchema.extend({
    vessels: z.array(fishingVesselSchema).max(50),
  }).strict(),
  atlantic: regionAggregateSchema.extend({
    vessels: z.array(fishingVesselSchema).max(50),
  }).strict(),
  carrier: z.object({
    loadedTotalMt: nullableMt,
    expectedRemainingMt: nullableMt,
    vessels: z.array(carrierVesselSchema).max(50),
  }).strict(),
  longline: z.object({
    vessels: z.array(longlineVesselSchema).max(50),
  }).strict(),
}).strict();

export const fleetDailyDetailErrorCodeSchema = z.enum([
  'authentication_required',
  'fleet_access_required',
  'mfa_required',
  'fleet_auth_unavailable',
  'fleet_data_unavailable',
]);

const fleetDailyDetailResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), detail: fleetDailyDetailSchema }).strict(),
  z.object({ ok: z.literal(false), code: fleetDailyDetailErrorCodeSchema }).strict(),
]);

export type FleetDailyPublicPayload = z.infer<typeof fleetDailyPublicSchema>;
export type FleetDailyDailySeries = z.infer<typeof dailySeriesSchema>;
export type FleetDailyDetailPayload = z.infer<typeof fleetDailyDetailSchema>;
export type FleetDailyDetailErrorCode = z.infer<typeof fleetDailyDetailErrorCodeSchema>;
export type FleetDailyDetailResponse = z.infer<typeof fleetDailyDetailResponseSchema>;

export type FleetDailyDetailState =
  | { status: 'loading' }
  | { status: 'ready'; detail: FleetDailyDetailPayload }
  | { status: 'denied' | 'error'; code: FleetDailyDetailErrorCode };

export function validateFleetDailyPublicPayload(payload: unknown): FleetDailyPublicPayload {
  return fleetDailyPublicSchema.parse(payload);
}

export function validateFleetDailyDetailPayload(payload: unknown): FleetDailyDetailPayload {
  return fleetDailyDetailSchema.parse(payload);
}

export function validateFleetDailyDetailResponse(payload: unknown): FleetDailyDetailResponse {
  return fleetDailyDetailResponseSchema.parse(payload);
}
