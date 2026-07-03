import { z } from 'zod';

export const UsdaFasApiHealth = z.object({
  ok: z.boolean(),
  reason: z.string().optional(),
});

export const UsdaFasRouteResponse = z.object({
  isLive: z.boolean(),
  source: z.string().min(1),
  lastUpdated: z.string().min(1),
  marketYear: z.string().regex(/^\d{4}$/),
  commodityCode: z.string().min(1),
  records: z.array(z.unknown()),
  totalCount: z.number().int().nonnegative().optional(),
  apiHealth: UsdaFasApiHealth.optional(),
  note: z.string().optional(),
});

export type UsdaFasRouteResponseT = z.infer<typeof UsdaFasRouteResponse>;
