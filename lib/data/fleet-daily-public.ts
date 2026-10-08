import rawFleetDailyPublic from './generated/fleet-daily-public.json';
import { validateFleetDailyPublicPayload } from '@/lib/contracts/fleet-daily-api';

export const fleetDailyPublic = validateFleetDailyPublicPayload(rawFleetDailyPublic);
export const fleetDailyPublicLatest = fleetDailyPublic.latest;
export const fleetDailyPublicDeltas = fleetDailyPublic.deltas;
export const fleetDailyPublicReconciliation = fleetDailyPublic.reconciliation;
export const fleetDailyPublicSeries = fleetDailyPublic.dailySeries;
export const fleetDailyPublicDetailSha256 = fleetDailyPublic._meta.detailSha256;
export const fleetDailyPublicDetailSha256Compat = fleetDailyPublic._meta.detailSha256Compat ?? [];

/** 일간 증감 라벨. 증감은 직전 «보고» 와 비교한 값이라, 보고가 하루를 건너뛰면(주말·휴일) «전일 대비»가 아니다.
 *  2026-10-06 보고는 직전이 10/2 보고라 나흘 간격이었다 - 그때는 «직전 보고(10/2) 대비» 로 쓴다. */
export const fleetDailyDeltaLabel = (() => {
  const dates = fleetDailyPublicSeries.dates;
  const prev = dates[dates.length - 2];
  const last = dates[dates.length - 1];
  if (!prev || !last) return '전일 대비';
  const gapDays = Math.round((Date.parse(last) - Date.parse(prev)) / 86_400_000);
  return gapDays <= 1 ? '전일 대비' : `직전 보고(${Number(prev.slice(5, 7))}/${Number(prev.slice(8, 10))}) 대비`;
})();
