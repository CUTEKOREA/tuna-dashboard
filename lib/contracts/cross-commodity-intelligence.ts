import { z } from 'zod';

const Score = z.number().int().min(0).max(100);

export const CrossCommodityTelemetry = z.object({
  status: z.literal('STATIC'),
  syncDate: z.string().min(1),
  source: z.string().min(1),
  method: z.string().min(1),
});

export const CrossCommoditySubstitutionSignal = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  elasticity: z.number().finite().nonnegative(),
  priceGapPct: z.number().finite().nonnegative(),
  demandShiftPct: z.number().finite().nonnegative(),
  confidence: Score,
  trigger: z.string().min(1),
  action: z.string().min(1),
  pressureScore: Score,
});

export const CrossCommodityRiskFactor = z.object({
  factor: z.string().min(1),
  impacts: z.record(z.string().min(1), Score),
  averageImpact: Score,
  highestCommodity: z.string().min(1),
  level: z.enum(['낮음', '보통', '높음', '긴급']),
  action: z.string().min(1),
});

export const CrossCommodityPortfolioCandidate = z.object({
  commodity: z.string().min(1),
  marginScore: Score,
  demandMomentum: Score,
  supplyRisk: Score,
  hedgeFit: Score,
  portfolioScore: Score,
  decision: z.enum(['증액', '유지', '축소']),
  reason: z.string().min(1),
});

export const CrossCommodityAnomalyAlert = z.object({
  sourceKind: z.enum(['substitution', 'risk']),
  sourceKey: z.string().min(1),
  title: z.string().min(1),
  commodity: z.string().min(1),
  metric: z.string().min(1),
  watchRoute: z.string().regex(/^\/api\//),
  currentValue: z.number().finite().nonnegative(),
  threshold: z.number().finite().nonnegative(),
  unit: z.string().min(1),
  severity: z.enum(['주의', '경계', '긴급']),
  breached: z.literal(true),
  urgencyScore: Score,
  action: z.string().min(1),
});

export const CrossCommodityIntelligenceResponse = z.object({
  meta: CrossCommodityTelemetry,
  substitutionSignals: z.array(CrossCommoditySubstitutionSignal).min(1),
  riskFactors: z.array(CrossCommodityRiskFactor).min(1),
  portfolioCandidates: z.array(CrossCommodityPortfolioCandidate).min(1),
  anomalyAlerts: z.array(CrossCommodityAnomalyAlert).min(1),
  headline: z.object({
    primaryRotation: z.string().min(1),
    topRisk: z.string().min(1),
    topAllocation: z.string().min(1),
    topAlert: z.string().min(1),
  }),
  isLive: z.literal(false),
  _metadata: z.object({
    isLive: z.literal(false),
    status: z.literal('STATIC'),
    source: z.string().min(1),
    syncDate: z.string().min(1),
    method: z.string().min(1),
    apiHealth: z.object({
      ok: z.literal(true),
      reason: z.string().min(1),
    }),
  }).passthrough(),
});

export type CrossCommodityIntelligenceResponse = z.infer<typeof CrossCommodityIntelligenceResponse>;
