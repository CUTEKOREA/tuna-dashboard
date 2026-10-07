import { z } from 'zod';

/**
 * 「선박 입항일정 및 선원 교대/선박 수리 계획」 — 선박 상세와 같은 보호 경로로만 나간다.
 * 저장소가 공개라 값은 git 에 두지 않는다(로컬 artifacts + 프로덕션 env `FLEET_PORT_SCHEDULE_JSON`).
 *
 * 선원 교대는 **직책만** 싣는다. 원문에는 승·하선자 실명과 국적 표기가 있다 - 실명은 /fleet 선장 실적표만 예외다.
 * 그래서 교대 항목은 한글 직책 문자열만 통과시킨다(영문 이름이 섞이면 계약에서 거부).
 */
const crewRole = z.string().min(1).max(40).regex(/^[가-힣0-9\s()·,/]+$/, '교대 항목은 한글 직책만 허용');
const shortText = z.string().min(1).max(20);

export const fleetPortScheduleRowSchema = z.object({
  vessel: shortText,
  loadedMt: z.number().finite().nonnegative().nullable(),
  /** null = 원문 «미정» */
  port: shortText.nullable(),
  eta: shortText.nullable(),
  etd: shortText.nullable(),
  observerChange: z.boolean(),
  crewOn: z.array(crewRole).max(12),
  crewOff: z.array(crewRole).max(12),
  repair: z.string().min(1).max(300).nullable(),
}).strict();

export const fleetPortScheduleSchema = z.object({
  asOf: z.iso.date(),
  /** 원문 머리글 그대로(연도 오기 포함) */
  printedDate: z.string().min(1).max(30),
  source: z.object({
    file: z.string().min(1).max(200),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  }).strict(),
  rows: z.array(fleetPortScheduleRowSchema).max(30),
}).strict();

export const fleetPortScheduleErrorCodeSchema = z.enum([
  'authentication_required',
  'fleet_access_required',
  'mfa_required',
  'fleet_auth_unavailable',
  'fleet_data_unavailable',
]);

const fleetPortScheduleResponseSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), schedule: fleetPortScheduleSchema }).strict(),
  z.object({ ok: z.literal(false), code: fleetPortScheduleErrorCodeSchema }).strict(),
]);

export type FleetPortSchedule = z.infer<typeof fleetPortScheduleSchema>;
export type FleetPortScheduleRow = z.infer<typeof fleetPortScheduleRowSchema>;
export type FleetPortScheduleResponse = z.infer<typeof fleetPortScheduleResponseSchema>;

export function validateFleetPortSchedule(payload: unknown): FleetPortSchedule {
  return fleetPortScheduleSchema.parse(payload);
}

export function validateFleetPortScheduleResponse(payload: unknown): FleetPortScheduleResponse {
  return fleetPortScheduleResponseSchema.parse(payload);
}
