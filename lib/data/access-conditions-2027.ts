import { pnaAccessFee } from '@/lib/data/pna-access-fee';

/**
 * 2027어기 입어조건 변경 — 제4차 참치선망어업위원회 회의자료(2026-09-21)와
 * 방콕 출장보고의 WTPO 협의 내용에서 «2027년에 달라지는 것»만 옮긴다.
 *
 * 화면의 VDS·입어료 탭은 2026어기 배정과 소진만 보여 준다. 2027 협상은 이미 진행 중이고
 * (PNG 9/28~29 영상회의) 할당이 줄어드는 쪽이라, 올해 숫자 옆에 내년 조건을 같이 둔다.
 *
 * 협상 대표·참석자 등 사람 이름은 옮기지 않는다.
 */
export interface AccessConditionChange {
  zone: string;
  /** 무엇이 달라지는가 */
  item: string;
  y2026: string;
  y2027: string;
  /** 우리에게 유리(ease)·불리(tighten)·중립(flat) */
  direction: 'tighten' | 'ease' | 'flat';
}

export const accessConditions2027 = {
  source: {
    file: '260918_제4차 참치선망어업위원회 회의자료.pdf',
    sha256: 'e9f821754e2a43fb6ab9466f8d5f602a3d4351e22247c7f5c94a293d05457e3e',
    meetingDate: '2026-09-21',
    note: 'PNG 협상은 2026-09-28~29 영상회의 예정이라 위 표의 PNG 조건은 제안서(VALATOP) 기준이다.',
  },
  changes: [
    {
      zone: '파푸아뉴기니',
      item: '최초 할당 (고정할당의 60%)',
      y2026: '1,325일',
      y2027: '989일',
      direction: 'tighten',
    },
    {
      zone: '파푸아뉴기니',
      item: '총 고정할당',
      y2026: '2,209일',
      y2027: '1,694일',
      direction: 'tighten',
    },
    {
      zone: '파푸아뉴기니',
      item: '산정 기준',
      y2026: '최근 5개년 + 10% 가산',
      y2027: '최근 9개년, 가산 없음',
      direction: 'tighten',
    },
    {
      zone: '솔로몬',
      item: '조업일수',
      y2026: '192일 (척당 약 5.8일)',
      y2027: '231일 (척당 7일)',
      direction: 'ease',
    },
    {
      zone: '솔로몬',
      item: '유보일수',
      y2026: '없음',
      y2027: '100일 (6월 말까지 유효)',
      direction: 'ease',
    },
    {
      zone: '솔로몬',
      item: 'VDS 전배 (IN)',
      y2026: '$500/일',
      y2027: '무상',
      direction: 'ease',
    },
    {
      zone: '미크로네시아',
      item: 'FSMA 전배비 (PNA 결의)',
      y2026: '$4,000/일',
      y2027: '$6,000/일',
      direction: 'tighten',
    },
    {
      zone: '투발루',
      item: '2027 구매일수',
      y2026: '150일',
      y2027: '협상 중 (10~11월 온라인 논의)',
      direction: 'flat',
    },
  ] satisfies AccessConditionChange[],
} as const;

/**
 * 붙임1 VALATOP 서한(2026-09-02, PNG 수산청 → 한국원양산업협회)의 전배 규칙.
 * 본문 표는 「추가 구매일수에 따라 단계별 허용」이라고만 적어 숫자가 없다 — 실제 규칙은 이 4단계다.
 *
 * 구매일수를 고정할당의 몇 %까지 가져가느냐로 **전배 IN 권리 자체가 갈린다.**
 * 최초 할당(60%)만 받으면 PNG 수역으로 끌어오는 전배가 «불가» 다.
 *
 * 서한의 수신·서명자 이름은 옮기지 않는다.
 */
export interface ValatopTier {
  /** 화면 표기용 이름 */
  label: string;
  /** 고정할당 대비 구간 */
  sharePct: [number, number];
  minDays: number;
  maxDays: number | null;
  transferIn: string;
  transferInFee: string;
  transferOut: string;
  transferOutFee: string;
}

export const valatop2027 = {
  letterDate: '2026-09-02',
  issuer: 'PNG 수산청(NFA)',
  /** 9개년 평균으로 정한 협회 고정할당 */
  fixedAllocationDays: 1_694,
  /** 고정할당의 60% — 이 아래로는 받을 수 없다 */
  startUpDays: 989,
  unitCostUsd: 10_500,
  /** 기준 기간을 5년에서 9년으로 늘린 이유 — 서한이 밝힌 근거 */
  referenceBasis: '엘니뇨·라니냐(ENSO) 국면을 함께 담아 단기 기후 변동의 영향을 줄이기 위해 9개년 평균을 썼다고 서한이 밝혔습니다.',
  tiers: [
    {
      label: '1단계 (100% 이상)',
      sharePct: [100, 100],
      minDays: 1_694,
      maxDays: null,
      transferIn: '무제한',
      transferInFee: '무료',
      transferOut: '무제한',
      transferOutFee: '무료',
    },
    {
      label: '2단계 (90~99%)',
      sharePct: [90, 99],
      minDays: 1_525,
      maxDays: 1_693,
      transferIn: '무제한',
      transferInFee: '고정할당의 10%까지 무료, 초과분 $1,000/일',
      transferOut: '무제한',
      transferOutFee: '무료',
    },
    {
      label: '3단계 (80~89%)',
      sharePct: [80, 89],
      minDays: 1_355,
      maxDays: 1_524,
      transferIn: '고정할당의 20%까지',
      transferInFee: '10%까지 $2,000/일, 초과분 $4,000/일',
      transferOut: '무제한',
      transferOutFee: '$2,000/일',
    },
    {
      label: '최초 할당 (60%)',
      sharePct: [60, 79],
      minDays: 989,
      maxDays: 1_354,
      transferIn: '불가',
      transferInFee: '해당 없음',
      transferOut: '무제한',
      transferOutFee: '$2,000/일',
    },
  ] satisfies ValatopTier[],
  /** 합작선은 협회와 별도로 각자 배정받는다 — 같은 4단계가 각각 걸린다 */
  jointVentures: [
    { name: '키리코레', fixedAllocationDays: 268, startUpDays: 161 },
    { name: '사조 바누아투', fixedAllocationDays: 192, startUpDays: 115 },
  ],
} as const;

/** 구매일수가 어느 단계에 떨어지는지 — 표에서 찾는다(손으로 적지 않는다). */
export function valatopTierOf(days: number): ValatopTier | null {
  return valatop2027.tiers.find(
    (tier) => days >= tier.minDays && (tier.maxDays === null || days <= tier.maxDays),
  ) ?? null;
}

/**
 * 전배 IN 이 열리는 3단계(80%)까지 올리는 데 드는 추가 비용.
 * 최초 할당만 받으면 전배 IN 이 막히므로, 협상 전에 이 값이 판단 재료가 된다.
 */
export function valatopTransferInUpgrade(shinlaSharePct?: number) {
  const target = valatop2027.tiers.find((tier) => tier.label.startsWith('3단계'))!;
  const extraDays = target.minDays - valatop2027.startUpDays;
  const extraUsd = extraDays * valatop2027.unitCostUsd;
  const share = shinlaSharePct ?? null;
  return {
    fromDays: valatop2027.startUpDays,
    toDays: target.minDays,
    extraDays,
    extraUsd,
    shinlaExtraDays: share === null ? null : Math.round(extraDays * share),
    shinlaExtraUsd: share === null ? null : Math.round(extraDays * share) * valatop2027.unitCostUsd,
  };
}

/**
 * PNG 최초 할당이 줄면 우리 몫이 얼마가 되는지 — 2026 배정표의 신라 비중을 그대로 적용한다.
 * 협상 전이라 «제안서대로 갔을 때»의 값이고, 비중은 배정표에서 파생한다(손으로 적지 않는다).
 */
export function pngShinlaOutlook2027() {
  const png = pnaAccessFee.zones.find((zone) => zone.id === 'png');
  const shinla = png?.companies.find((company) => company.name === '신라교역');
  if (!png || !shinla) return null;

  const share = shinla.days / png.total.days;
  const days2026 = shinla.days;
  const allocation2027 = 989; // 회의자료 VALATOP 최초 할당
  const days2027 = Math.round(allocation2027 * share);
  return {
    share,
    days2026,
    days2027,
    deltaDays: days2027 - days2026,
    unitCost: png.unitCost,
    /** 일수 감소가 그대로 입어료 감소이기도 하다 - 조업 기회 손실과 비용 절감이 같이 온다 */
    feeDelta: (days2027 - days2026) * png.unitCost,
  };
}
