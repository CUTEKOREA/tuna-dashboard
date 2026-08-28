/**
 * 하역 항차 정적 원장 — DB(/api/unloading-db)에 없는 완료 항차 포함 전체 스냅샷.
 * 2026-08-17 UnloadingStatus 내장 상수에서 추출 (SSOT, ADR 0005 방향) —
 * 화면·갤러리가 같은 병합(정적 ∪ DB)을 쓰게 한다. 내용 무변.
 */

export type UnloadingLoad = {
  sourceVessel: string;
  hatch: string;
  amount: number;
};


export type UnloadingAllocation = {
  consignee: string;
  amount: number;
  loads: UnloadingLoad[];
};


export type UnloadingObservation = {
  sourceVessel: string;
  hatch: string;
  temperaturesC: number[];
};


export type UnloadingSpeciesEntry = {
  id: string;
  name: string;
  reported: number;
  actual: number;
  surplus: number;
};
;

export type UnloadingTimelineEntry = {
  date: string;
  time: string;
  targetHol: string;
  consignee?: string | null;
  allocations?: UnloadingAllocation[];
  observations?: UnloadingObservation[];
  dailyAmount: number;
  cumAmount: number;
  speciesAmounts?: { SJ: number; YF: number } | null;
  remainingAmount?: number | null;
  quality: string;
};
;

export type UnloadingVesselData = {
  name: string;
  dateRange: string;
  /** 입항일 (하역 개시 전 대기 포함 체선 계산용, K Group 보고 ARRIVED ON) */
  arrivalDate?: string | null;
  location: string;
  buyer: string;
  motherVessel?: string;
  status: string;
  reportedTotal: number;
  actualTotal: number;
  annualActualTotal?: number;
  annualStartDate?: string;
  holdDataAvailable?: boolean;
  holdSpeciesBreakdownAvailable?: boolean;
  unclassifiedActual?: number;
  speciesBreakdownAsOf?: string | null;
  speciesBreakdownNote?: string | null;
  surplus: number;
  species: UnloadingSpeciesEntry[];
  timeline: UnloadingTimelineEntry[];
  finalReport?: unknown;
};
;

export const UNLOADING_STATIC_VESSELS: Record<string, UnloadingVesselData> = {
  'sein-phoenix': {
    name: 'M/V SEIN PHOENIX',
    dateRange: '2026.05.23 ~ 2026.06.18',
    location: 'BANGKOK, THAILAND',
    buyer: 'FCF CO.,LTD',
    motherVessel: '-',
    status: '하역완료 (Completed)',
    reportedTotal: 6955.000,
    actualTotal: 7060.950,
    surplus: 105.950,
    species: [
      { id: 'SJ', name: 'Skipjack', reported: 6646.000, actual: 6677.150, surplus: 31.150 },
      { id: 'YF', name: 'Yellowfin', reported: 309.000, actual: 383.800, surplus: 74.800 }
    ],
    timeline: [
      { date: '5/23', time: '08:10 ~ 20:30', targetHol: 'S/HAR(#2-A)', dailyAmount: 146.890, cumAmount: 146.890, quality: '어창 개방 측정온도 -24.0℃ ~ -25.0℃. 외관상태 및 색택 전반적으로 양호.' },
      { date: '5/24', time: '-', targetHol: '-', dailyAmount: 0, cumAmount: 146.890, quality: '일요일 휴무.' },
      { date: '5/25', time: '08:10 ~ 19:00', targetHol: 'S/HAR(#2-A), S/EXP(#4-A)', dailyAmount: 216.090, cumAmount: 362.980, quality: '어창 온도 -21.0℃ ~ -24.0℃. 외관상태 양호.' },
      { date: '5/26', time: '08:00 ~ 20:30', targetHol: 'S/SPR(#4-A, #4-B)', dailyAmount: 224.690, cumAmount: 587.670, quality: '어창 개방 측정온도 -24.0℃ ~ -26.0℃. 외관상태 및 색택 전반적으로 양호.' },
      { date: '5/27', time: '08:10 ~ 20:00', targetHol: 'S/SPR(#1-A, #4-B), S/HAR(#2-A)', dailyAmount: 239.990, cumAmount: 827.660, quality: '어창 개방 측정온도 -20.0℃ ~ -24.0℃. 외관상태 및 색택 전반적으로 양호.' },
      { date: '5/28', time: '08:10 ~ 23:00', targetHol: 'S/SPR(#1-A, #4-B), MOAKONA(#2-A, #2-B)', dailyAmount: 287.940, cumAmount: 1115.600, quality: 'S/SPR: 어창 개방 측정온도 -20.0℃ ~ -24.0℃. MOAKONA: -22.0℃ ~ -23.0℃. 외관상태 및 색택 전반적으로 양호.' },
      { date: '5/29', time: '08:30 ~ 21:00', targetHol: 'MOAKONA(#2-B), S/SPR(#4-B)', dailyAmount: 318.110, cumAmount: 1433.710, quality: 'S/SPR(#4-B): 어창 개방 측정온도 -20.0℃ ~ -21.0℃. MOAKONA(#2-B): -22.0℃ ~ -23.0℃. 외관상태 및 색택 전반적으로 양호. 명일(5/30) 약 310톤 하역 진행 예정.' },
      { date: '5/30', time: '08:10 ~ 19:00', targetHol: 'S/SPR(#1-A, #4-B, #4-C)', dailyAmount: 307.410, cumAmount: 1741.120, quality: '어창 개방 측정온도 -18.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호. 명일(5/31) 약 300톤 하역 진행 예정.' },
      { date: '5/31', time: '08:10 ~ 13:00', targetHol: 'MOAKONA(#2-B)', dailyAmount: 93.560, cumAmount: 1834.680, quality: '어창 개방 측정온도 -20.0℃ ~ -21.0℃. 외관상태 및 색택 전반적으로 양호. 명일(6/1) 약 300톤 하역 진행 예정.' },
      { date: '6/1', time: '08:20 ~ 20:20', targetHol: 'MOAKONA(#2-B), MOAMARI(#4-C)', dailyAmount: 271.530, cumAmount: 2106.210, quality: 'MOAKONA(#2-B): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호. MOAMARI(#4-C): 어창 개방 측정온도 -20.0℃ ~ -23.0℃. 외관상태 및 색택 전반적으로 양호. 명일(6/2)은 약 250톤 하역 진행 예정.' },
      { date: '6/2', time: '08:20 ~ 14:00', targetHol: 'S/SPR(#1-A), MOAMARI(#4-C)', dailyAmount: 198.780, cumAmount: 2304.990, quality: 'S/SPR(#1-A): 어창 개방 측정온도 -20.0℃ ~ -21.0℃. 외관상태 및 색택 전반적으로 양호. MOAMARI(#4-C): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호. 명일(6/3)은 약 235톤 하역 진행 예정.' },
      { date: '6/3', time: '08:10 ~ 18:40', targetHol: 'S/PIO(#3-A), MOAKONA(#2-B)', dailyAmount: 236.140, cumAmount: 2541.130, quality: 'S/PIO(#3-A): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호. MOAKONA(#2-B): 어창 개방 측정온도 -21.0℃ ~ -22.0℃. 외관상태 및 색택 전반적으로 양호. 명일(6/4) 약 330톤 하역 진행 예정.' },
      { date: '6/4', time: '08:20 ~ 18:30', targetHol: 'S/PIO(#3-A), MOAKONA(#2-B)', dailyAmount: 322.870, cumAmount: 2864.000, quality: 'S/PIO(#3-A)- 어창 개방 측정온도는 -18.0℃ ~ -21.0℃ 입니다.- 외관상태 및 색택 전반적으로 양호하였습니다. MOAKONA(#2-B)- 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다.- 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/5) 약 580톤 하역 진행 예정.' },
      { date: '6/5', time: '08:10 ~ 18:20', targetHol: 'S/HAR(#1-B), MOAKONA(#2-B), S/PIO(#3-A,#3-B), MOAMARI(#4-C,#4-D)', dailyAmount: 438.050, cumAmount: 3302.050, quality: 'S/PIO(#3-A,#3-B) - 어창 개방 측정온도는 -18.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/HAR(#1-B) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. MOAKONA(#2-B) - 어창 개방 측정온도는 -18.0℃ ~ -19.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. MOAMARI(#4-C,#4-D) - 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/6) 약 450톤 하역 진행 예정.' },
      { date: '6/6', time: '08:10 ~ 18:00', targetHol: 'S/PIO(#3-B), S/SPR(#4-D), N/STAR(#2-C)', dailyAmount: 465.960, cumAmount: 3768.010, quality: 'S/PIO(#3-B) - 어창 개방 측정온도는 -18.0℃ ~ -19.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/SPR(#4-D) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. N/STAR(#2-C) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/7,공휴일)은 하역작업이 없으며, 재명일(6/8) 약 586톤 하역 진행 예정.' },
      { date: '6/7', time: '-', targetHol: '-', dailyAmount: 0, cumAmount: 3768.010, quality: '공휴일 휴무.' },
      { date: '6/8', time: '08:10 ~ 16:50', targetHol: 'N/STAR(#2-C:128.460), S/SPR(#4-D:143.560), S/HAR(#1-B:78.060), S/PIO(#3-B:152.410)', dailyAmount: 502.530, cumAmount: 4270.540, quality: 'S/PIO(#3-B) - 어창 개방 측정온도는 -18.0℃ ~ -19.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/HAR(#1-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/SPR(#4-D) - 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. N/STAR(#2-C) - 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/9)은 약 250톤 하역 진행 예정.' },
      { date: '6/9', time: '08:10 ~ 14:00', targetHol: 'N/STAR(#2-C), S/PIO(#3-B)', dailyAmount: 214.900, cumAmount: 4485.440, quality: 'S/PIO(#3-B) - 어창 개방 측정온도는 -17.0℃ ~ -18.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. N/STAR(#2-C) - 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/10)은 약 185톤 하역 진행 예정.' },
      { date: '6/10', time: '09:00 ~ 17:30', targetHol: 'N/STAR(#2-C)', dailyAmount: 178.280, cumAmount: 4663.720, quality: 'N/STAR(#2-C) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/11)은 약 100톤 하역 진행 예정.' },
      { date: '6/11', time: '08:10 ~ 14:00', targetHol: 'S/PIO(#3-B)', dailyAmount: 112.920, cumAmount: 4776.640, quality: 'S/PIO(#3-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/12)은 약 150톤 하역 진행 예정.' },
      { date: '6/12', time: '08:10 ~ 16:00', targetHol: 'N/STAR(#2-C), S/PIO(#3-B,#3-C)', dailyAmount: 146.200, cumAmount: 4922.840, quality: 'S/PIO(#3-B,#3-C) - 어창 개방 측정온도는 -17.0℃ ~ -20.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. N/STAR(#2-C) - 어창 개방 측정온도는 -19.0℃ ~ -20.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/13)은 약 530톤 하역 진행 예정.' },
      { date: '6/13', time: '08:10 ~ 18:30', targetHol: 'S/HAR(#1-B:131.450), N/STAR(#2-C,#2-D:196.600), S/JUP(#3-C:161.730)', dailyAmount: 489.780, cumAmount: 5412.620, quality: 'S/HAR(#1-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/JUP(#3-C) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. N/STAR(#2-C,#2-D) - 어창 개방 측정온도는 -18.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/14)은 약 100톤 하역 진행 예정.' },
      { date: '6/14', time: '08:00 ~ 14:20', targetHol: 'S/JUP(#3-C)', dailyAmount: 93.750, cumAmount: 5506.370, quality: 'S/JUP(#3-C) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/15)은 약 210톤 하역 진행 예정.' },
      { date: '6/15', time: '08:20 ~ 18:20', targetHol: 'S/JUP(#3-C,#3-D)', dailyAmount: 227.990, cumAmount: 5734.360, quality: 'S/JUP(#3-C,#3-D) - 어창 개방 측정온도는 -19.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/16)은 약 380톤 하역 진행 예정.' },
      { date: '6/16', time: '08:10 ~ 18:10', targetHol: 'S/SPR(#4-D), N/STAR(#2-D), S/JUP(#3-D)', dailyAmount: 390.960, cumAmount: 6125.320, quality: 'S/JUP(#3-D) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/SPR(#4-D) - 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. N/STAR(#2-D) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/17)은 약 485톤 하역 진행 예정.' },
      { date: '6/17', time: '08:10 ~ 19:30', targetHol: 'S/HAR(#1-B,#1-C), N/STAR(#2-D), S/JUP(#3-D)', dailyAmount: 486.080, cumAmount: 6611.400, quality: 'S/JUP(#3-D) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/HAR(#1-B,#1-C) - 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. N/STAR(#2-D) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/18) 하역 종료 예정.' },
      { date: '6/18', time: '08:20 ~ 17:40', targetHol: 'S/HAR(#1-C), S/JUP(#3-D)', dailyAmount: 449.550, cumAmount: 7060.950, quality: 'S/JUP(#3-D) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/HAR(#1-C) - 어창 개방 측정온도는 -19.0℃ ~ -20.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 6/18 하역 최종 종료.' }
    ]
  },
  'bao-lucky': {
    name: 'M/V BAO LUCKY',
    dateRange: '2026.06.02 ~ 진행중',
    location: 'BANGKOK, THAILAND',
    buyer: 'FCF CO.,LTD',
    motherVessel: '-',
    status: '하역중 (In Progress)',
    reportedTotal: 4803.000,
    actualTotal: 3387.850,
    surplus: -1415.150,
    species: [
      { id: 'SJ', name: 'Skipjack', reported: 4176.000, actual: 2965.650, surplus: -1210.350 },
      { id: 'YF', name: 'Yellowfin', reported: 627.000, actual: 422.200, surplus: -204.800 }
    ],
    timeline: [
      { 
        date: '6/2', 
        time: '09:00 ~ 17:10', 
        targetHol: 'S/EXP(#4-A), N/STAR(#1-A)', 
        dailyAmount: 229.160, 
        cumAmount: 229.160, 
        quality: 'S/EXP(#4-A): 어창 개방 측정온도 -18.0℃ ~ -19.0℃. 외관상태 및 색택 전반적으로 양호. N/STAR(#1-A): 어창 개방 측정온도 -19.0℃ ~ -20.0℃. 외관상태 및 색택 전반적으로 양호. 명일(6/3)은 약 176톤 하역 진행 예정.' 
      },
      {
        date: '6/3',
        time: '08:00 ~ 18:00',
        targetHol: 'S/EXP(#4-B)',
        dailyAmount: 180.340,
        cumAmount: 409.500,
        quality: 'S/EXP(#4-B): 어창 개방 측정온도 -20.0℃. 양호. 명일(6/4) 약 410톤 하역 진행 예정.'
      },
      {
        date: '6/4',
        time: '08:20 ~ 15:20',
        targetHol: 'N/STAR(#1-A), S/EXP(#2-A,#4-A), MOAKONA(#2-A)',
        dailyAmount: 417.350,
        cumAmount: 826.850,
        quality: '제품상태:N/STAR(#1-A) - 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다.S/EXP(#2-A,#4-A) - 어창 개방 측정온도는 -19.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다.MOAKONA(#2-A) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/5) 약 270톤 하역 진행 예정.'
      },
      {
        date: '6/5',
        time: '08:00 ~ 16:50',
        targetHol: 'S/PIO(#3-A), N/STAR(#1-A), S/EXP(#4-A)',
        dailyAmount: 309.670,
        cumAmount: 1136.520,
        quality: 'S/PIO(#3-A) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/EXP(#4-A) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. N/STAR(#1-A) - 어창 개방 측정온도는 -19.0℃ ~ -20.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/6) 약 270톤 하역 진행 예정.'
      },
      {
        date: '6/6',
        time: '08:20 ~ 15:50',
        targetHol: 'S/EXP(#4-A), N/STAR(#1-A), MOAMARI(#2-A)',
        dailyAmount: 276.890,
        cumAmount: 1413.410,
        quality: 'S/EXP(#4-A) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. N/STAR(#1-A) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. MOAMARI(#2-A) - 어창 개방 측정온도는 -19.0℃ ~ -20.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/7,공휴일)은 하역 작업이 없으며, 재명일(6/8) 약 550톤 하역 진행 예정.'
      },
      {
        date: '6/7',
        time: '-',
        targetHol: '-',
        dailyAmount: 0,
        cumAmount: 1413.410,
        quality: '공휴일 휴무.'
      },
      {
        date: '6/8',
        time: '08:00 ~ 20:20',
        targetHol: 'N/STAR(#1-B:207.750), MOAKONA(#2-A:89.070), S/PIO(#3-A:70.380), S/EXP(#4-A:59.245,#4-B:59.245)',
        dailyAmount: 485.690,
        cumAmount: 1899.100,
        quality: 'N/STAR(#1-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/PIO(#3-A) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/EXP(#4-A,#4-B) - 어창 개방 측정온도는 -18.0℃ ~ -20.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. MOAKONA(#2-A) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/9)은 약 70톤 하역 진행 예정.'
      },
      {
        date: '6/9',
        time: '08:30 ~ 11:50',
        targetHol: 'S/PIO(#3-A)',
        dailyAmount: 37.600,
        cumAmount: 1936.700,
        quality: 'S/PIO(#3-A) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/10)은 약 335톤 하역 진행 예정.'
      },
      {
        date: '6/10',
        time: '08:10 ~ 19:40',
        targetHol: 'MOAKONA(#2-A:81.590), S/CHA(#3-A:116.580), S/PIO(#4-B:86.270)',
        dailyAmount: 284.440,
        cumAmount: 2221.140,
        quality: 'S/PIO(#4-B) - 어창 개방 측정온도는 -19.0℃ ~ -20.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. S/CHA(#3-A) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. MOAKONA(#2-A) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/11)은 약 180톤 하역 진행 예정.'
      },
      {
        date: '6/11',
        time: '08:10 ~ 14:10',
        targetHol: 'MOAKONA(#2-A:107.730), S/CHA(#3-A,#3-B:98.800)',
        dailyAmount: 206.530,
        cumAmount: 2427.670,
        quality: 'S/CHA(#3-A,#3-B) - 어창 개방 측정온도는 -20.0℃ ~ -23.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. MOAKONA(#2-A) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 명일(6/12)은 약 100톤 하역 진행 예정.'
      },
      {
        date: '6/12',
        time: '08:20 ~ 14:30',
        targetHol: 'MOAKONA(#2-A)',
        dailyAmount: 66.660,
        cumAmount: 2494.330,
        quality: 'MOAKONA(#2-A) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. - 외관상태 및 색택 전반적으로 양호하였습니다. 6/13~6/14 하역 작업 없음. 월요일(6/15) 하역 재개 예정.'
      },
      {
        date: '6/15',
        time: '08:20 ~ 19:40',
        targetHol: 'KONA(#2-A,#2-B), S/CHA(#3-B), S/PIO(#4-B)',
        dailyAmount: 256.500,
        cumAmount: 2750.830,
        quality: 'MOAKONA(#2-A,#2-B) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃. S/CHA(#3-B) - -22.0℃ ~ -23.0℃. S/PIO(#4-B) - -20.0℃ ~ -21.0℃. 명일(6/16)은 약 240톤 하역 작업 예정.'
      },
      {
        date: '6/16',
        time: '08:10 ~ 15:30',
        targetHol: 'S/PIO(#4-B), KONA(#2-B), S/CHA(#3-B)',
        dailyAmount: 243.860,
        cumAmount: 2994.690,
        quality: 'MOAKONA(#2-A,#2-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. S/CHA(#3-B) - 어창 개방 측정온도는 -22.0℃ ~ -23.0℃ 입니다. S/PIO(#4-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. 명일(6/17)은 약 95톤 하역 작업 예정입니다.'
      },
      {
        date: '6/17',
        time: '08:10 ~ 10:20',
        targetHol: 'S/PIO(#4-B), MOAKONA(#2-B)',
        dailyAmount: 69.010,
        cumAmount: 3063.700,
        quality: 'MOAKONA(#2-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. S/PIO(#4-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. 명일(6/18)은 약 377톤 하역 작업 예정입니다.'
      },
      {
        date: '6/18',
        time: '08:20 ~ 20:00',
        targetHol: 'N/STAR(#1-B), MOAMARI(#1-B), MOAKONA(#2-B)',
        dailyAmount: 324.150,
        cumAmount: 3387.850,
        quality: 'MOAKONA(#2-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. MOAMARI(#1-B) - 어창 개방 측정온도는 -21.0℃ ~ -22.0℃ 입니다. N/STAR(#1-B) - 어창 개방 측정온도는 -20.0℃ ~ -21.0℃ 입니다. 명일(6/19)은 약 430톤 하역 작업 예정입니다.'
      }
    ]
  },
  'hikari': {
    name: 'M/V HIKARI',
    dateRange: '2026.04.26 ~ 2026.05.02',
    location: 'GENSAN, PHILIPPINES',
    buyer: 'FCF CO., LTD.',
    motherVessel: 'MOAKONA MR-01',
    status: '하역완료 (Completed)',
    reportedTotal: 826.000,
    actualTotal: 800.110,
    surplus: -25.890,
    species: [
      { id: 'SJ', name: 'Skipjack', reported: 734.000, actual: 800.110, surplus: 66.110 },
      { id: 'YF', name: 'Yellowfin', reported: 92.000, actual: 0, surplus: -92.000 }
    ],
    timeline: [
      { date: '4/26~27', time: '22:00 ~ 07:00', targetHol: 'MOAKONA(#3-B)', dailyAmount: 8.210, cumAmount: 8.210, quality: '외관상태 및 색택 전반적으로 양호.' },
      { date: '4/27~28', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-B)', dailyAmount: 39.770, cumAmount: 47.980, quality: 'MK:#3-B 어창 개방 측정온도 -22.9°C ~ -23.4°C. 외관상태 양호.' },
      { date: '4/28~29', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-B)', dailyAmount: 149.050, cumAmount: 197.030, quality: 'MK:#3-B 어창 온도 -22.0℃ ~ -22.2℃. 외관 양호.' },
      { date: '4/29~30', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-B)', dailyAmount: 152.330, cumAmount: 349.360, quality: 'MK:#3-B 어창 온도 -21.9℃ ~ -22.3℃.' },
      { date: '4/30~5/01', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-B, #3-C)', dailyAmount: 185.880, cumAmount: 535.240, quality: 'MK:#3-B 종료. MK:#3-C 어창 측정 -22.0℃. 전반적 양호.' },
      { date: '5/01~02', time: '06:00 ~ 06:00', targetHol: 'MOAKONA(#3-C, #4-C)', dailyAmount: 139.620, cumAmount: 674.860, quality: 'Night shift 계량기 고장으로 하역중단. 어창 온도 -20.9℃ ~ -21.8℃.' },
      { date: '5/02', time: '06:00 ~ 22:00', targetHol: 'MOAKONA(#3-C)', dailyAmount: 125.250, cumAmount: 800.110, quality: '5/02 22:00 하역 최종 종료. SHORT 25.890 MT' }
    ]
  },
  'dinok': {
    name: 'M/V DINOK',
    dateRange: '2026.04.23 ~ 2026.05.19',
    location: 'BANGKOK, THAILAND',
    buyer: 'FCF CO.,LTD',
    status: '하역완료 (Completed)',
    reportedTotal: 4385.000,
    actualTotal: 4534.380,
    surplus: 149.380,
    species: [
      { id: 'SJ', name: 'Skipjack', reported: 4099.000, actual: 4180.620, surplus: 81.620 },
      { id: 'YF', name: 'Yellowfin', reported: 286.000, actual: 353.760, surplus: 67.760 }
    ],
    timeline: [
      { date: '4/23', time: '08:10 ~ 20:40', targetHol: 'S/EXP(#1-A), S/SPR(#3-A)', dailyAmount: 253.470, cumAmount: 253.470, quality: '어창 온도 -21.0℃ ~ -22.0℃. 양호.' },
      { date: '4/24', time: '08:10 ~ 20:50', targetHol: 'S/EXP(#1-A), S/SPR(#3-A)', dailyAmount: 308.530, cumAmount: 562.000, quality: '어창 온도 -20.0℃ ~ -21.0℃. 양호.' },
      { date: '4/25', time: '08:10 ~ 17:30', targetHol: 'S/EXP(#1-A)', dailyAmount: 201.540, cumAmount: 763.540, quality: '4/26 Cannery 휴무. 명일 200톤 하역 예정.' },
      { date: '4/27', time: '08:20 ~ 19:30', targetHol: 'S/EXP(#3-A,#3-B), S/SPR(#3-A)', dailyAmount: 194.690, cumAmount: 958.230, quality: 'S/SPR #3-A 하역완료. 온도 -17.0℃ ~ -20.0℃.' },
      { date: '4/28', time: '10:00 ~ 20:30', targetHol: 'S/EXP(#1-A, #2-A)', dailyAmount: 165.880, cumAmount: 1124.110, quality: '온도 -18.0℃ ~ -19.0℃. 양호.' },
      { date: '4/29', time: '08:10 ~ 18:10', targetHol: 'S/EXP(#2-A, #3-B), S/HAR(#1-B)', dailyAmount: 434.960, cumAmount: 1559.070, quality: '명일 100톤 예정.' },
      { date: '4/30', time: '08:10 ~ 14:20', targetHol: 'S/EXP(#2-A)', dailyAmount: 112.890, cumAmount: 1671.960, quality: '5/1~3 연휴 휴무.' },
      { date: '5/4', time: '08:10 ~ 20:00', targetHol: 'S/EXP(#2-A), S/HAR(#1-B...)', dailyAmount: 500.710, cumAmount: 2172.670, quality: '온도 -19.0℃ ~ -22.0℃. 명일 300톤 예정.' },
      { date: '5/5', time: '08:10 ~ 20:20', targetHol: 'S/HAR(#1-C, #2-B)', dailyAmount: 257.100, cumAmount: 2429.770, quality: '온도 -20.0℃ ~ -23.0℃. 명일 휴무.' },
      { date: '5/7', time: '13:20 ~ 15:10', targetHol: 'S/CHA(#3-B)', dailyAmount: 63.400, cumAmount: 2493.170, quality: '명일 5/8 하역 없음. 5/9 재개.' },
      { date: '5/9', time: '08:10 ~ 16:30', targetHol: 'S/CHA(#3-B)', dailyAmount: 211.880, cumAmount: 2705.050, quality: '온도 -19.0℃ ~ -20.0℃. 5/10 일요일 하역 없음.' },
      { date: '5/11', time: '08:10 ~ 18:10', targetHol: 'S/CHA(#3-B, #3-C)', dailyAmount: 200.310, cumAmount: 2905.360, quality: '온도 -19.0℃ ~ -21.0℃. 5/12 사정상 휴무, 5/13 재개 예정.' },
      { date: '5/13', time: '08:10 ~ 18:50', targetHol: 'S/CHA(#3-C)', dailyAmount: 247.860, cumAmount: 3153.220, quality: '어창 온도 -19.0℃ ~ -20.0℃. 외관상태 양호. 명일 250톤 예정.' },
      { date: '5/14', time: '08:10 ~ 18:40', targetHol: 'S/CHA(#3-C)', dailyAmount: 257.360, cumAmount: 3410.580, quality: '어창 온도 -18.0℃ ~ -19.0℃. 전반적으로 양호.' },
      { date: '5/15', time: '08:10 ~ 19:00', targetHol: 'S/HAR(#2-B)', dailyAmount: 235.810, cumAmount: 3646.390, quality: '어창 온도 -22.0℃ ~ -23.0℃. 전반적으로 양호.' },
      { date: '5/16', time: '08:10 ~ 19:30', targetHol: 'S/HAR, S/JUP, S/CHA', dailyAmount: 285.730, cumAmount: 3932.120, quality: '#1-C 유증기로 하역중단. S/HAR -19~-20℃, S/JUP -20~-23℃.' },
      { date: '5/18', time: '08:10 ~ 22:10', targetHol: 'S/EXP, S/HAR, S/JUP', dailyAmount: 426.760, cumAmount: 4358.880, quality: '어창 온도 -17.0℃ ~ -21.0℃. 외관 양호.' },
      { date: '5/19', time: '08:20 ~ 15:40', targetHol: 'S/JUP(#2-C)', dailyAmount: 175.500, cumAmount: 4534.380, quality: '어창 개방 측정온도 -18.0℃ ~ -19.0℃. 외관상태 및 색택 전반적으로 양호. 하역 완료.' }
    ],
    finalReport: {
      takeaway: {
        situation: "보고량(4,385톤) 대비 149.380톤 증가한 4,534.380톤으로 방콕 하역 종료.",
        insight: "S/JUP(#2-C) 홀드 하역(175.5톤)을 마지막으로 하역 최종 완료. SJ(+81.62톤) 및 YF(+67.76톤) 모두 보고량 대비 증량 실적 달성."
      }
    }
  },
  'heng-hong-11': {
    name: 'M/V HENG HONG 11',
    dateRange: '2026.04.06 ~ 04.07',
    location: 'BANGKOK, THAILAND',
    buyer: 'JA GLOBAL CO.,LTD',
    status: '하역완료 (Completed)',
    reportedTotal: 200.000,
    actualTotal: 231.850,
    surplus: 31.850,
    species: [
      { id: 'SJ', name: 'Skipjack', reported: 190.000, actual: 208.050, surplus: 18.050 },
      { id: 'YF', name: 'Yellowfin', reported: 10.000, actual: 23.800, surplus: 13.800 }
    ],
    timeline: [
      { date: '4/6', time: '08:10 ~ 13:10', targetHol: 'S/HAR(#1-B)', dailyAmount: 102.050, cumAmount: 102.050, quality: '어창 온도 -20.0℃ ~ -21.0℃.' },
      { date: '4/7', time: '08:10 ~ 16:00', targetHol: 'S/HAR(#1-B)', dailyAmount: 129.800, cumAmount: 231.850, quality: '어창 온도 -20.0℃ ~ -21.0℃.' }
    ]
  },
  'liaoyu-reefer-1': {
    name: 'M/V LIAOYU REEFER 1',
    dateRange: '2026.02.25 ~ 03.11',
    location: 'BANGKOK, THAILAND',
    buyer: 'FCF CO.,LTD',
    status: '하역완료 (Completed)',
    reportedTotal: 5135.000,
    actualTotal: 5119.770,
    surplus: -15.230,
    species: [
      { id: 'SJ', name: 'Skipjack', reported: 4399.000, actual: 4355.790, surplus: -43.210 },
      { id: 'YF', name: 'Yellowfin', reported: 736.000, actual: 763.980, surplus: 27.980 }
    ],
    timeline: [
      { date: '2/26', time: '08:00 ~ 15:40', targetHol: 'S/EXP(#3-A), MOAMARI(#2-A)', dailyAmount: 309.060, cumAmount: 687.690, quality: '온도 -18.0℃ ~ -21.0℃.' },
      { date: '2/27', time: '08:00 ~ 17:00', targetHol: 'MOAMARI(#1-A,#2-A), S/SPR', dailyAmount: 416.480, cumAmount: 1104.170, quality: '온도 -18.0℃ ~ -23.0℃.' },
      { date: '2/28', time: '08:00 ~ 11:40', targetHol: 'MOAMARI, S/EXP, S/SPR', dailyAmount: 238.260, cumAmount: 1342.430, quality: '양호' },
      { date: '3/2', time: '08:10 ~ 19:10', targetHol: 'MOAMARI, S/EXP, S/SPR', dailyAmount: 467.230, cumAmount: 1809.660, quality: '온도 -18.0℃ ~ -22.0℃.' },
      { date: '3/3', time: '08:10 ~ 19:30', targetHol: 'S/EXP, S/CHA, S/SPR', dailyAmount: 362.380, cumAmount: 2172.040, quality: '온도 -18.0℃ ~ -21.0℃.' },
      { date: '3/4', time: '08:10 ~ 22:10', targetHol: 'MOAMARI, S/CHA, S/SPR', dailyAmount: 625.300, cumAmount: 2797.340, quality: '양호' },
      { date: '3/5', time: '08:10 ~ 19:30', targetHol: 'MOAMARI, S/SPR', dailyAmount: 440.360, cumAmount: 3237.700, quality: '온도 -18.0℃ ~ -21.0℃.' },
      { date: '3/6', time: '08:10 ~ 16:50', targetHol: 'S/CHA, S/SPR', dailyAmount: 369.630, cumAmount: 3607.330, quality: '양호' },
      { date: '3/7', time: '08:10 ~ 16:10', targetHol: 'S/SPR, MARI, S/CHA', dailyAmount: 371.800, cumAmount: 3979.130, quality: '온도 -18.0℃ ~ -21.0℃.' },
      { date: '3/8', time: '08:40 ~ 13:50', targetHol: 'S/SPR(#2-C)', dailyAmount: 83.930, cumAmount: 4063.060, quality: '온도 -19.0℃ ~ -20.0℃.' },
      { date: '3/9', time: '08:10 ~ 11:50', targetHol: 'S/SPR(#2-C)', dailyAmount: 97.430, cumAmount: 4160.490, quality: '양호' },
      { date: '3/10', time: '08:10 ~ 21:50', targetHol: 'MOAMARI, S/SPR', dailyAmount: 651.980, cumAmount: 4812.470, quality: '양호' },
      { date: '3/11', time: '08:10 ~ 15:40', targetHol: 'S/EXP(#3-A), MOAMARI(#2-A)', dailyAmount: 307.300, cumAmount: 5119.770, quality: '온도 -18.0℃ ~ -21.0℃.' }
    ],
    finalReport: {
      takeaway: {
        situation: "전체 물량 오차는 매우 적으나 내부 규격 변동이 큼.",
        insight: "FREESCHOOL MSC 규격 대량 강등 발생(-704톤). 하역/선별 과정에서의 MSC 인증 유지 및 품질 관리 프로세스 점검 요망."
      }
    }
  }
};

