import { z } from 'zod';
import rawInsights from './unloading-fleet-insights.json';

const Pct = z.number().min(-100).max(100);
const Mt = z.number().nonnegative();
const Year = z.number().int().min(2021).max(2030);

export const FleetInsightsSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  snapshotStatus: z.literal('SYNCED'),
  syncDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  coverage: z.object({
    resultsVoyages: z.number().int().positive(),
    resultsTransfers: z.number().int().positive(),
    sizingVoyages: z.number().int().nonnegative(),
    logsheets: z.number().int().nonnegative(),
  }).strict(),
  vessels: z.array(z.object({
    vessel: z.string().min(1),
    transfers: z.number().int().positive(),
    reportedMt: Mt,
    actualMt: Mt,
    variancePct: Pct,
  }).strict()).min(1),
  transferPorts: z.array(z.object({
    port: z.string().min(1),
    nameKo: z.string().min(1),
    actualMt: Mt,
    sharePct: z.number().min(0).max(100),
  }).strict()).min(1),
  leadDays: z.array(z.object({
    year: Year,
    medianDays: z.number().nonnegative(),
    transfers: z.number().int().positive(),
  }).strict()),
  sizing: z.array(z.object({
    year: Year,
    voyages: z.number().int().positive(),
    species: z.array(z.object({
      species: z.enum(['SJ', 'YF', 'BET']),
      largePct: z.number().min(0).max(100),
      totalMt: Mt,
    }).strict()).min(1),
  }).strict()),
  schools: z.array(z.object({
    year: Year,
    sets: z.number().int().positive(),
    catchMt: Mt,
    unassociatedPct: z.number().min(0).max(100),
    driftingFadPct: z.number().min(0).max(100),
    otherPct: z.number().min(0).max(100),
  }).strict()),
}).strict();

export type FleetInsights = z.infer<typeof FleetInsightsSchema>;

export const unloadingFleetInsights: FleetInsights = FleetInsightsSchema.parse(rawInsights);
