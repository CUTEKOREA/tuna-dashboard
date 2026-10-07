import 'server-only';

import { validateFleetPortSchedule, type FleetPortSchedule } from '@/lib/contracts/fleet-port-schedule';

const MAX_BYTES = 32 * 1024;
let cachedSource: string | null = null;
let cachedSchedule: FleetPortSchedule | null = null;

/** 프로덕션 env `FLEET_PORT_SCHEDULE_JSON` 에서만 읽는다. 없거나 깨지면 보호 경로가 503 으로 닫힌다. */
export function getFleetPortSchedule(): FleetPortSchedule {
  const source = process.env.FLEET_PORT_SCHEDULE_JSON;
  if (!source || /[\u0000]/.test(source) || Buffer.byteLength(source, 'utf8') > MAX_BYTES) {
    throw new Error('fleet port schedule is unavailable');
  }
  if (cachedSource === source && cachedSchedule) return cachedSchedule;
  const schedule = validateFleetPortSchedule(JSON.parse(source));
  cachedSource = source;
  cachedSchedule = schedule;
  return schedule;
}
