/**
 * 기업 해부 5사의 규모 축 — 갤러리 「매출순」 정렬용.
 *
 * 다섯 회사가 다섯 통화로 매출을 낸다. 한 줄에 세우려면 공통 단위가 있어야 해서
 * USD 로 환산한다. 환산은 정렬 순서를 정하는 데만 쓰고, 화면에는 회사가 실제로
 * 공시한 통화 표기를 그대로 띄운다.
 *
 * 기준연도가 회사마다 다르고(2023~FY2025) 둘은 경영진 발언이 근거다. 등급을 달아
 * 둔 이유이며, 화면에도 그대로 나간다.
 */

/** 환율 — 두 독립 출처가 소수 셋째 자리까지 일치한 날의 값이다. */
export const FX = {
  기준일: '2026-08-20',
  출처: 'ECB 참조환율(EUR·JPY·THB) · exchangerate-api(TWD — ECB 미고시)',
  /** 1 통화당 USD */
  usdPer: {
    EUR: 1 / 0.85609,
    JPY: 1 / 158.76,
    THB: 1 / 32.915,
    TWD: 1 / 31.808514,
  },
} as const;

export type ScaleCurrency = keyof typeof FX.usdPer;

export interface CompanyScale {
  key: string;
  통화: ScaleCurrency;
  /** 백만 단위 원화폐 금액 */
  금액: number;
  /** 회사가 공시·발언한 그대로의 표기 */
  표기: string;
  기준: string;
  /** A=법정공시·감사받은 재무제표, C=경영진 발언·업계 매체 */
  등급: 'A' | 'C';
  근거: string;
}

export const COMPANY_SCALE: CompanyScale[] = [
  {
    key: 'frinsa',
    통화: 'EUR',
    금액: 741,
    표기: '741 M€',
    기준: '2024',
    등급: 'A',
    근거: '연결 매출 공시',
  },
  {
    key: 'thaiunion',
    통화: 'THB',
    금액: 132719,
    표기: '1,327억 밧',
    기준: '2025',
    등급: 'A',
    근거: '연결 재무제표',
  },
  {
    key: 'albacora',
    통화: 'EUR',
    금액: 500,
    표기: '약 5.0억 €',
    기준: '2023',
    등급: 'C',
    근거: 'CEO 발언 — 절대액 공시 없음',
  },
  {
    key: 'fcf',
    통화: 'TWD',
    금액: 60000,
    표기: '600억 NT$',
    기준: '회장 발언',
    등급: 'C',
    근거: '비상장 — 매출 공시 없음',
  },
  {
    key: 'itochu',
    통화: 'JPY',
    금액: 14823100,
    표기: '14조 8,231억엔',
    기준: 'FY2025',
    등급: 'A',
    근거: '유가증권보고서 제102기 연결 수익',
  },
];

const BY_KEY = new Map(COMPANY_SCALE.map((s) => [s.key, s]));

export function scaleOf(key: string): CompanyScale | undefined {
  return BY_KEY.get(key);
}

/** 정렬 키. 백만 USD. */
export function revenueUsdM(key: string): number {
  const s = BY_KEY.get(key);
  return s ? s.금액 * FX.usdPer[s.통화] : 0;
}

/** 화면 표기 — 「741 M€ · ≈US$0.87B」 */
export function scaleLabel(key: string): string {
  const s = BY_KEY.get(key);
  if (!s) return '';
  const b = revenueUsdM(key) / 1000;
  return `${s.표기} · ≈US$${b < 10 ? b.toFixed(2) : b.toFixed(1)}B`;
}
