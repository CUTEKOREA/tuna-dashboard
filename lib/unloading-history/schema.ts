import { z } from 'zod';
import { CANONICAL_PORT_CODES } from './constants';

export const HistoryYearSchema = z.union([
  z.literal(2021),
  z.literal(2022),
  z.literal(2023),
  z.literal(2024),
  z.literal(2025),
]);

export const VerificationSchema = z.enum(['verified', 'partial', 'unverified']);
export const DisplayYearBasisSchema = z.enum([
  'daily_report',
  'completion_year',
  'source_year',
]);
export const AllocationMethodSchema = z.enum([
  'daily_report',
  'completion_year',
  'final_report_adjustment',
]);

const IsoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).superRefine((value, ctx) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    ctx.addIssue({ code: 'custom', message: 'date must be a valid ISO calendar date' });
  }
});
const ExtractorVersionSchema = z.string().regex(/^[A-Za-z0-9._-]{1,64}$/);
export const PortCodeSchema = z.enum(CANONICAL_PORT_CODES);
export const hasPrivateTextMarker = (value: string) => (
  /(?:^|\/)(?:Users|Volumes|home|root|private|tmp|var|etc)(?:\/|$)/i.test(value)
  || /(?:^|\s)~\//.test(value)
  || /(?:^|[^A-Za-z0-9])[A-Za-z]:/.test(value)
  || /\b[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)
  || /\b(?:file|https?|smb|ftp|data|mailto):\/{0,2}/i.test(value)
  || value.includes('\\')
  || /@[^\s@]+\.[^\s@]+|GoogleDrive-/i.test(value)
);
const PublicSafeTextSchema = z.string().min(1).superRefine((value, ctx) => {
  if (
    hasPrivateTextMarker(value)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'public text must not contain private path or account markers',
    });
  }
});

export const YearAllocationSchema = z.object({
  year: HistoryYearSchema,
  actualMt: z.number().finite().nonnegative(),
  method: AllocationMethodSchema,
  portCodes: z.array(PortCodeSchema),
}).strict().superRefine((value, ctx) => {
  if (value.method !== 'final_report_adjustment' && value.portCodes.length === 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'dated allocations require at least one port',
    });
  }
});

export const AnnualHistorySchema = z.object({
  year: HistoryYearSchema,
  verifiedActualMt: z.number().finite().nonnegative(),
  verifiedVoyageCount: z.number().int().nonnegative(),
  candidateVoyageCount: z.number().int().nonnegative(),
  partialCount: z.number().int().nonnegative(),
  unverifiedCount: z.number().int().nonnegative(),
  averageVerifiedMt: z.number().finite().nonnegative(),
  portCount: z.number().int().nonnegative(),
  ports: z.array(z.object({ code: z.string(), nameKo: z.string() }).strict()),
  allocationMethodCounts: z.object({
    dailyReport: z.number().int().nonnegative(),
    completionYear: z.number().int().nonnegative(),
    finalReportAdjustment: z.number().int().nonnegative(),
  }).strict(),
  isMinimumVerifiedTotal: z.boolean(),
}).strict();

export const PublicPortSchema = z.object({
  code: PortCodeSchema,
  nameKo: PublicSafeTextSchema,
}).strict();

export const PublicAnnualHistorySchema = AnnualHistorySchema.extend({
  ports: z.array(PublicPortSchema),
});

const CompletionYearBaselineSchema = z.object({
  year: HistoryYearSchema,
  verifiedActualMt: z.number().finite().nonnegative(),
  verifiedVoyageCount: z.number().int().nonnegative(),
  candidateVoyageCount: z.number().int().nonnegative(),
}).strict();

const PublicVesselSchema = z.object({
  canonicalName: PublicSafeTextSchema,
}).strict();

export const PublicHistoryVoyageSchema = z.object({
  voyageId: z.string().regex(/^[a-z0-9-]+$/),
  sourceYear: HistoryYearSchema,
  completionYear: HistoryYearSchema.nullable(),
  displayYearBasis: DisplayYearBasisSchema,
  vessel: PublicVesselSchema,
  period: z.object({
    startDate: IsoDateSchema.nullable(),
    endDate: IsoDateSchema.nullable(),
  }).strict(),
  ports: z.array(PublicPortSchema),
  reportedMt: z.number().finite().nonnegative().nullable(),
  actualMt: z.number().finite().nonnegative().nullable(),
  verification: VerificationSchema,
  kpiIncluded: z.boolean(),
  yearAllocations: z.array(YearAllocationSchema),
  evidenceDocumentCount: z.number().int().nonnegative(),
}).strict();

export const UnloadingHistoryPublicResponseSchema = z.object({
  success: z.literal(true),
  meta: z.object({
    sourceLabel: z.literal('Google Drive 하역업무 정제본'),
    sourceFolderCount: z.number().int().nonnegative(),
    sourceFileCount: z.number().int().nonnegative(),
    processedFileCount: z.number().int().nonnegative(),
    failedFileCount: z.number().int().nonnegative(),
    candidateVoyageCount: z.number().int().nonnegative(),
    verifiedVoyageCount: z.number().int().nonnegative(),
    partialVoyageCount: z.number().int().nonnegative(),
    unverifiedVoyageCount: z.number().int().nonnegative(),
    snapshotStatus: z.literal('SYNCED'),
    generatedAt: z.string().datetime({ offset: true }),
    dataAsOf: IsoDateSchema,
    extractorVersion: ExtractorVersionSchema,
  }).strict(),
  completionYearBaseline: z.array(CompletionYearBaselineSchema).length(5),
  annual: z.array(PublicAnnualHistorySchema).length(5),
  voyages: z.array(PublicHistoryVoyageSchema).length(98),
  isLive: z.literal(false),
  snapshotStatus: z.literal('SYNCED'),
  _metadata: z.object({
    isLive: z.literal(false),
    status: z.literal('STATIC'),
    source: z.literal('lib/unloading-history/history_2021_2025.json'),
    syncDate: IsoDateSchema,
    dataAsOf: IsoDateSchema,
    schemaVersion: z.literal('1.0.0'),
    method: z.literal('결정론적 Excel 추출·최종보고 우선·일보 교차검증'),
    apiHealth: z.object({
      ok: z.literal(true),
    }).strict(),
  }).strict(),
}).strict();

export type PublicHistoryVoyage = z.infer<typeof PublicHistoryVoyageSchema>;
export type UnloadingHistoryPublicResponse = z.infer<typeof UnloadingHistoryPublicResponseSchema>;
