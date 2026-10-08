/** 2026어기 PNA 수역별 입어료 배정 인테이크 (ADR-0005).
 *
 *  원자료는 한국원양산업협회가 배정하는 수역별 입어료 배정표와 그에 딸린 인보이스다.
 *  회차(1차·2차·3차)가 수역마다 따로 굴러가므로 **수역별로 회차와 지급 비율이 다르다.**
 *  총액을 더할 때 이 점을 감추지 않도록 각 수역이 installment·sharePct 를 들고 있다.
 *
 *  은행 계좌·SWIFT·수취계좌번호는 인보이스에 있으나 저장소에 담지 않는다.
 */

export interface CompanyAllocation {
  name: string;
  vessels: number;
  days: number;
  /** 해당 회차 지급액 = days × unitCost × sharePct */
  fee: number;
}

export interface AccessFeeZone {
  id: string;
  name: string;
  nameKr: string;
  /** 이 수역의 최신 배정 회차 */
  installment: number;
  /** 그 회차가 총입어료에서 차지하는 비율 */
  sharePct: number;
  /** 조업일수 단가 ($/일) */
  unitCost: number;
  dueDate: string;
  color: string;
  companies: CompanyAllocation[];
  /** 국적선 소계 (배정표 「계」 열) */
  total: { days: number; fee: number };
  /** 합작선은 별도 모집단이라 국적선 소계에 섞지 않는다 */
  jointVenture?: { days: number; fee: number };
  /** 국적선 표에 함께 실리지만 위 5개사가 아닌 몫 (키리바시 사조 바누아투) */
  otherFee?: { name: string; days: number; fee: number };
  /** 신라교역 몫의 제반경비 (옵서버·허가·등록·MCS 등). 회차와 무관하게 한 번 부과된다. */
  shinlaExtras: number;
  /** 이번 회차 송금에 함께 붙는 송금수수료 — 제반경비와 성격이 다르므로 분리한다 */
  shinlaRemitFee: number;
  /** 제반경비의 산출 근거 — 재현 가능한 것만 적는다 */
  shinlaExtrasNote: string;
}

export const pnaAccessFee = {
  source: {
    allocation: {
      file: '260903_참치선망 수역별 입어료 3차분 배정.xlsx',
      sha256: 'd57ed6e7444c29e15f3becc21834dad65a5e615544b9ab72d019ec135718fea9',
      issuedAt: '2026-09-03',
    },
    dispatch: {
      file: '2026어기 솔로몬, PNG 수역 입어료 3차분 배정(시행문).pdf',
      sha256: '1f3df8576b8041fe8e6ddc0ec971c2da5c06db9319e5610584b69a3d5ee15838',
      issuedAt: '2026-09-03',
      issuer: '한국원양산업협회',
      /** 협회 외화계좌 송금 기한 — 정부 납기(9/30)보다 앞선다. 출어사가 실제로 지켜야 할 날짜다. */
      remitBy: '2026-09-17',
    },
    invoices: [
      {
        zone: 'png',
        file: 'Korea Overseas Fisheries Association - 3rd Installment for VDS 2026 Fishing Period Inv#009095.pdf',
        sha256: '5cdce4f097c1581b6aa83c9d2023a36879b697a0e043f734528b5f554070d9a3',
        no: 'INV0000009095',
        issuer: 'National Fisheries Authority (PNG)',
        issuedAt: '2026-08-19',
        dueDate: '2026-09-30',
        /** 인보이스는 33% 몫을 «EEZ Days 441.66 × $10,500.16» 로 적는다 (1,325 × 1/3) */
        days: 441.66,
        unitUsd: 10_500.16,
        feeUsd: 4_637_500,
        totalUsd: 4_637_500,
      },
      {
        zone: 'sol',
        file: 'INVFISH0802026.pdf',
        sha256: '4c1d3dccd5c205df4446f5645896de5f90dc6fe1d4352dd82a6de1f3a1fb5847',
        no: 'INV.NO.FISH080/2026',
        issuer: 'Ministry of Fisheries & Marine Resources (Solomon Islands)',
        issuedAt: '2026-09-03',
        dueDate: '2026-09-30',
        /** 국적선 175일 + 합작선 17일을 한 장으로 청구한다 */
        days: 192,
        unitUsd: 10_000,
        feeUsd: 480_000,
        bankChargeUsd: 5,
        totalUsd: 480_005,
      },
    ],
  },

  /** 배정표 원문에 남은 어긋남 — 고치지 않고 드러낸다 */
  sourceCaveats: [
    '솔로몬 배정표 각주가 「조업일수 1차분(25%) 2026년 12월 31일까지 납부」로 적혀 있다. 2차분(2026-06-30)·3차분(2026-09-30)보다 뒤라 성립하지 않으며 2025년의 오기로 보인다.',
    'PNG 신라교역 제반경비 98,689달러는 2차분 배정표에서 이어받은 값이다. 이번 배정표의 척당 요율표로는 재현되지 않아 원본 확인이 필요하다.',
    '솔로몬 송금수수료는 배정표가 3개사에 각 2달러씩 6달러를 배분하는데, 인보이스의 은행 수수료는 5달러다.',
  ],

  zones: [
    {
      id: 'png', name: 'PNG', nameKr: '파푸아뉴기니',
      installment: 3, sharePct: 1 / 3, unitCost: 10_500, dueDate: '2026-09-30', color: '#ef4444',
      companies: [
        { name: '동원산업', vessels: 9, days: 542, fee: 1_897_000 },
        { name: '사조산업', vessels: 5, days: 302, fee: 1_057_000 },
        { name: '사조씨푸드', vessels: 1, days: 60, fee: 210_000 },
        { name: '사조오양', vessels: 1, days: 60, fee: 210_000 },
        { name: '신라교역', vessels: 6, days: 361, fee: 1_263_500 },
      ],
      total: { days: 1325, fee: 4_637_500 },
      shinlaExtras: 98_689,
      shinlaRemitFee: 0,
      shinlaExtrasNote: '2차분 배정표 승계값 — 이번 배정표로는 재현되지 않는다',
    },
    {
      id: 'ki', name: 'Kiribati', nameKr: '키리바시',
      installment: 2, sharePct: 0.5, unitCost: 10_750, dueDate: '2026-07-01', color: '#f59e0b',
      companies: [
        { name: '동원산업', vessels: 9, days: 352, fee: 1_892_000 },
        { name: '사조산업', vessels: 5, days: 196, fee: 1_053_500 },
        { name: '사조씨푸드', vessels: 1, days: 39, fee: 209_625 },
        { name: '사조오양', vessels: 1, days: 39, fee: 209_625 },
        { name: '신라교역', vessels: 6, days: 234, fee: 1_257_750 },
      ],
      total: { days: 1000, fee: 5_375_000 },
      otherFee: { name: '사조 바누아투', days: 140, fee: 752_500 },
      shinlaExtras: 36_000,
      shinlaRemitFee: 20,
      shinlaExtrasNote: '등록비 3,000 + 옵서버비 3,000 = 척당 6,000 × 6척',
    },
    {
      id: 'fsm', name: 'FSM', nameKr: '미크로네시아',
      installment: 2, sharePct: 0.5, unitCost: 11_025, dueDate: '2026-07-01', color: '#8b5cf6',
      companies: [
        { name: '동원산업', vessels: 9, days: 142, fee: 782_775 },
        { name: '사조산업', vessels: 5, days: 63, fee: 347_287.5 },
        { name: '사조씨푸드', vessels: 1, days: 13, fee: 71_662.5 },
        { name: '사조오양', vessels: 1, days: 13, fee: 71_662.5 },
        { name: '신라교역', vessels: 6, days: 84, fee: 463_050 },
      ],
      total: { days: 315, fee: 1_736_437.5 },
      jointVenture: { days: 5, fee: 27_562.5 },
      shinlaExtras: 102_600,
      shinlaRemitFee: 3.5,
      shinlaExtrasNote: '1차분 등록비 3,600 + 허가비 60,000 + 옵서버 관리비 39,000 (제반경비는 1차분에 한 번 부과)',
    },
    {
      id: 'sol', name: 'Solomon', nameKr: '솔로몬',
      installment: 3, sharePct: 0.25, unitCost: 10_000, dueDate: '2026-09-30', color: '#06b6d4',
      companies: [
        { name: '동원산업', vessels: 9, days: 70, fee: 175_000 },
        { name: '사조산업', vessels: 5, days: 39, fee: 97_500 },
        { name: '사조씨푸드', vessels: 1, days: 8, fee: 20_000 },
        { name: '사조오양', vessels: 1, days: 8, fee: 20_000 },
        { name: '신라교역', vessels: 6, days: 50, fee: 125_000 },
      ],
      total: { days: 175, fee: 437_500 },
      jointVenture: { days: 17, fee: 42_500 },
      shinlaExtras: 0,
      shinlaRemitFee: 2,
      shinlaExtrasNote: '제반경비 없음 — 배정표가 3개사에만 송금수수료 2달러씩 배분',
    },
    {
      id: 'tv', name: 'Tuvalu', nameKr: '투발루',
      installment: 1, sharePct: 1, unitCost: 10_000, dueDate: '2026-07-01', color: '#10b981',
      companies: [
        { name: '동원산업', vessels: 9, days: 46, fee: 460_000 },
        { name: '사조산업', vessels: 5, days: 22, fee: 220_000 },
        { name: '사조씨푸드', vessels: 1, days: 4, fee: 40_000 },
        { name: '사조오양', vessels: 1, days: 4, fee: 40_000 },
        { name: '신라교역', vessels: 6, days: 40, fee: 400_000 },
      ],
      total: { days: 116, fee: 1_160_000 },
      jointVenture: { days: 34, fee: 340_000 },
      shinlaExtras: 84_000,
      shinlaRemitFee: 33.5,
      shinlaExtrasNote: '옵서버비 24,000 + 허가비 30,000 + 선원경비 30,000',
    },
    {
      id: 'nr', name: 'Nauru', nameKr: '나우루',
      installment: 1, sharePct: 1, unitCost: 10_000, dueDate: '2026-07-01', color: '#ec4899',
      companies: [
        { name: '동원산업', vessels: 9, days: 28, fee: 280_000 },
        { name: '사조산업', vessels: 5, days: 34, fee: 340_000 },
        { name: '사조씨푸드', vessels: 1, days: 7, fee: 70_000 },
        { name: '사조오양', vessels: 1, days: 7, fee: 70_000 },
        { name: '신라교역', vessels: 6, days: 12, fee: 120_000 },
      ],
      total: { days: 88, fee: 880_000 },
      jointVenture: { days: 12, fee: 120_000 },
      shinlaExtras: 48_000,
      shinlaRemitFee: 8.5,
      shinlaExtrasNote: '허가비 척당 8,000 × 6척',
    },
  ] as AccessFeeZone[],

  /** 회차별 납부 일정. done 은 배정표·시행문에 근거가 있을 때만 표시한다. */
  payments: [
    { zone: 'PNG 1차분(33%)', date: '2025.12.31', done: true },
    { zone: '키리바시 1차분', date: '2025.12.31', done: true },
    { zone: 'FSM 1차분(50%)', date: '2025.12.31', done: true },
    { zone: '솔로몬 1차분(25%)', date: '2025.12.31', done: true },
    { zone: '솔로몬 2차분(50%)', date: '2026.06.30', done: true },
    { zone: 'PNG 2차분(33%)', date: '2026.06.30', done: true },
    { zone: 'FSM 2차분(50%)', date: '2026.07.01', done: false },
    { zone: '키리바시 2차분', date: '2026.07.01', done: false },
    { zone: '협회 송금 기한 (솔로몬·PNG 3차분)', date: '2026.09.17', done: false },
    { zone: '솔로몬 3차분(25%)', date: '2026.09.30', done: false },
    { zone: 'PNG 3차분(33%)', date: '2026.09.30', done: false },
  ],

  /** PNG 입어 지원선 제반경비 배정 (해운사별, 단위 $) */
  supportShips: [
    { name: 'SEIN SHIPPING', nameKr: '세인해운', vessels: 22, total: 186_328.56 },
    { name: 'JISUNG SHIPPING', nameKr: '지성해운', vessels: 11, total: 93_164.28 },
    { name: 'BOYANG(Khana)', nameKr: '가나마린', vessels: 8, total: 67_755.84 },
    { name: 'DONGWON', nameKr: '동원산업', vessels: 5, total: 42_347.4 },
    { name: 'EASTERN STAR', nameKr: '오션해운', vessels: 2, total: 16_938.96 },
    { name: 'ES SHIPPING', nameKr: 'ES해운', vessels: 1, total: 8_469.48 },
  ],

  companyColors: {
    동원산업: '#3b82f6',
    신라교역: '#f59e0b',
    사조산업: '#8b5cf6',
    사조씨푸드: '#10b981',
    사조오양: '#06b6d4',
  } as Record<string, string>,
} as const;

/** 수역의 회사 배분 합계 — 배정표 「계」와 대조하기 위한 재계산 */
export function zoneCompanyTotal(zone: AccessFeeZone): { days: number; fee: number } {
  const base = zone.companies.reduce(
    (a, c) => ({ days: a.days + c.days, fee: a.fee + c.fee }),
    { days: 0, fee: 0 },
  );
  if (!zone.otherFee) return base;
  return { days: base.days + zone.otherFee.days, fee: base.fee + zone.otherFee.fee };
}

export interface CompanyTotal {
  name: string;
  vessels: number;
  days: number;
  fee: number;
  color: string;
  isShinla: boolean;
}

/** 회사 합계는 하드코딩하지 않고 수역 배분에서 파생한다 — 표와 총계가 어긋날 수 없게 */
export function companyTotals(): CompanyTotal[] {
  const acc = new Map<string, CompanyTotal>();
  for (const zone of pnaAccessFee.zones) {
    for (const c of zone.companies) {
      const cur = acc.get(c.name) ?? {
        name: c.name,
        vessels: c.vessels,
        days: 0,
        fee: 0,
        color: pnaAccessFee.companyColors[c.name] ?? '#94a3b8',
        isShinla: c.name === '신라교역',
      };
      cur.vessels = Math.max(cur.vessels, c.vessels);
      cur.days += c.days;
      cur.fee += c.fee;
      acc.set(c.name, cur);
    }
  }
  return [...acc.values()].sort((a, b) => b.fee - a.fee);
}

/** 이번 회차에 신라교역이 실제로 송금할 금액 — 시행문이 지목한 수역만 */
export function shinlaInstallmentDue() {
  const zones = pnaAccessFee.zones.filter((z) => z.dueDate === '2026-09-30');
  const rows = zones.map((z) => {
    const c = z.companies.find((x) => x.name === '신라교역')!;
    return { id: z.id, nameKr: z.nameKr, installment: z.installment, days: c.days, fee: c.fee, remitFee: z.shinlaRemitFee };
  });
  const fee = rows.reduce((a, r) => a + r.fee, 0);
  const remitFee = rows.reduce((a, r) => a + r.remitFee, 0);
  return {
    zones: rows,
    fee,
    remitFee,
    total: fee + remitFee,
    remitBy: pnaAccessFee.source.dispatch.remitBy,
    dueDate: '2026-09-30',
  };
}
