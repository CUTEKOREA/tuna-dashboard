import { HUB_ID } from '@/lib/chart-palette';

/** GMTS 차트 색. 시리즈는 hex 를 넘긴다 — --chart-s* 를 쓰지 않는다. */
export const C = {
  completed: HUB_ID.bkk,
  active: HUB_ID.sey,
  incoming: HUB_ID.abj,
  production: HUB_ID.bkk,
  storage: HUB_ID.sey,
  nonGsp: HUB_ID.bkk,
  gsp: HUB_ID.mnt,
  currentYear: HUB_ID.bkk,
  priorYear: HUB_ID.abj,
  revision: HUB_ID.sey,
  icon: HUB_ID.bkk,
};
