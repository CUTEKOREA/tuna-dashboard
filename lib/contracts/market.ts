import { z } from 'zod';

const Status = z.enum(['live', 'fallback']).or(z.string().min(1));

export const LiveFlag = z.object({
  isLive: z.boolean(),
  source: z.string().min(1),
});

export const TunaTickerItem = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  trend: z.string().min(1),
  trendColor: z.string().min(1),
  source: z.string().min(1),
  isLive: z.boolean(),
});

export const TunaTickerResponse = z.object({
  ticker: z.array(TunaTickerItem).min(5),
  meta: z.object({
    lastUpdated: z.string().min(1),
    liveApis: z.number().int().nonnegative(),
    totalApis: z.number().int().positive(),
    status: z.string().min(1),
  }),
});

export const SalmonKcsTimeseriesPoint = z.object({
  year: z.string().regex(/^\d{4}$/),
  qty_tonnes: z.number().finite().nonnegative(),
  val_million_usd: z.number().finite().nonnegative(),
  unit_price: z.number().finite().positive(),
});

export const SalmonKcsOriginPoint = z.object({
  country: z.string().min(1),
  share_pct: z.number().finite().nonnegative(),
  val_million_usd: z.number().finite().nonnegative(),
  type: z.string().min(1),
});

export const SalmonKcsProductPoint = z.object({
  product: z.string().min(1),
  share_pct: z.number().finite().nonnegative(),
  val_million_usd: z.number().finite().nonnegative(),
});

export const SalmonKcsFallbackResponse = LiveFlag.extend({
  status: Status,
  timestamp: z.string().min(1),
  hsCodes: z.record(z.string(), z.string().min(1)),
  data: z.union([
    z.array(SalmonKcsTimeseriesPoint).min(1),
    z.array(SalmonKcsOriginPoint).min(1),
    z.array(SalmonKcsProductPoint).min(1),
    z.object({
      timeseries: z.array(SalmonKcsTimeseriesPoint).min(1),
      by_origin: z.array(SalmonKcsOriginPoint).min(1),
      by_product: z.array(SalmonKcsProductPoint).min(1),
    }),
  ]),
  message: z.string().optional(),
});

export const SalmonKamisCommodity = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  market: z.string().min(1),
  unit: z.string().min(1),
  currentPrice: z.number().finite().positive(),
  prevPrice: z.number().finite().nonnegative().nullable().optional(),
  trend: z.string().min(1),
  change: z.string().nullable().optional(),
});

export const SalmonKamisHistoricalPoint = z.object({
  date: z.string().min(1),
  salmon_fresh: z.number().finite().positive(),
  salmon_frozen: z.number().finite().positive(),
  halibut: z.number().finite().positive(),
  chicken: z.number().finite().positive(),
});

export const SalmonKamisResponse = LiveFlag.extend({
  status: Status,
  timestamp: z.string().min(1),
  commodities: z.array(SalmonKamisCommodity).min(1),
  historicalSpread: z.array(SalmonKamisHistoricalPoint).min(1),
  salmonPremiumIndex: z.object({
    vs_halibut: z.number().finite().positive(),
    vs_chicken: z.number().finite().positive(),
    vs_pork: z.number().finite().positive(),
    trend: z.string().min(1),
  }),
});

export const SalmonComtradePoint = z.union([
  z.object({
    name: z.string().min(1),
    value: z.number().finite().nonnegative(),
    year: z.string().regex(/^\d{4}$/),
    hs: z.string().optional(),
  }),
  z.object({
    year: z.string().regex(/^\d{4}$/),
    importQty: z.number().finite().nonnegative(),
    importVal: z.number().finite().nonnegative(),
  }),
]);

export const SalmonComtradeResponse = LiveFlag.extend({
  status: Status,
  timestamp: z.string().min(1),
  hsCode: z.string().optional(),
  data: z.array(SalmonComtradePoint).min(1),
  count: z.number().int().nonnegative().optional(),
  message: z.string().optional(),
});

export function assertSharePctSaneish(points: { share_pct: number }[]): { ok: boolean; sum: number } {
  const sum = points.reduce((acc, point) => acc + point.share_pct, 0);
  return { ok: sum >= 95 && sum <= 101, sum: Math.round(sum * 10) / 10 };
}
