import rawFleetDailyPublic from './generated/fleet-daily-public.json';
import { validateFleetDailyPublicPayload } from '@/lib/contracts/fleet-daily-api';

export const fleetDailyPublic = validateFleetDailyPublicPayload(rawFleetDailyPublic);
export const fleetDailyPublicLatest = fleetDailyPublic.latest;
export const fleetDailyPublicDeltas = fleetDailyPublic.deltas;
export const fleetDailyPublicReconciliation = fleetDailyPublic.reconciliation;
export const fleetDailyPublicDetailSha256 = fleetDailyPublic._meta.detailSha256;
export const fleetDailyPublicDetailSha256Compat = fleetDailyPublic._meta.detailSha256Compat ?? [];
