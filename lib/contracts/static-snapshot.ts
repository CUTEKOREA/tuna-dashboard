import { z } from 'zod';

export const StaticSnapshotResponse = z.object({
  isLive: z.literal(false),
  _metadata: z.object({
    isLive: z.literal(false),
    status: z.literal('STATIC'),
    source: z.string().min(1),
    syncDate: z.string().min(1).optional(),
    method: z.string().min(1).optional(),
    apiHealth: z.object({
      ok: z.boolean(),
      reason: z.string().min(1).optional(),
    }).optional(),
  }).passthrough(),
}).passthrough();

export type StaticSnapshotResponse = z.infer<typeof StaticSnapshotResponse>;
