/**
 * 기업 해부 갤러리 — 정렬과 규모 축 회귀 검사.
 *
 * 매출 환산은 정렬 순서에만 쓴다. 그래서 검사하는 것도 「환산값이 정확한가」가 아니라
 * 「환율이 흔들려도 순서가 그대로인가」다. 회사 간 격차가 1.5배 이상이라 그렇게 잡는다.
 */
import { describe, expect, it } from 'vitest';

import {
  COMPANY_SCALE,
  FX,
  revenueUsdM,
  scaleLabel,
  scaleOf,
} from '@/lib/data/company-scale';
import {
  countryOf,
  plateFor,
  sortCompanies,
  type CompanyCard,
} from '@/components/market-understanding/CompanyGallery';

/** WCAG 상대휘도. 명판 대비 검사에만 쓴다. */
function luminance(r: number, g: number, b: number): number {
  const lin = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** 명판을 국기색 위에 알파 합성한 뒤, 그 위 잉크와의 대비를 잰다. */
function contrastOverFlag(ink: string, flagHex: string): number {
  const m = plateFor(ink).match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
  if (!m) throw new Error(`명판 색을 못 읽었다: ${plateFor(ink)}`);
  const a = Number(m[4]);
  const plate = [1, 2, 3].map((i) => Number(m[i]));
  const flag = rgb(flagHex);
  const mixed = plate.map((v, i) => v * a + flag[i] * (1 - a));
  const l1 = luminance(mixed[0], mixed[1], mixed[2]);
  const l2 = luminance(...rgb(ink));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const CARDS: CompanyCard[] = [
  { key: 'frinsa', numeral: 'Ⅰ', name: 'Frinsa del Noroeste', country: '스페인 · 갈리시아', tagline: '', stats: [], flagCss: '', backInk: '#4a2f00' },
  { key: 'thaiunion', numeral: 'Ⅱ', name: 'Thai Union Group', country: '태국 · 사뭇사콘', tagline: '', stats: [], flagCss: '', backInk: '#f4f5f0' },
  { key: 'albacora', numeral: 'Ⅲ', name: 'Albacora, S.A.', country: '스페인 · 바스크 베르메오', tagline: '', stats: [], flagCss: '', backInk: '#f4f5f0' },
  { key: 'fcf', numeral: 'Ⅳ', name: 'FCF Co., Ltd.', country: '대만 · 가오슝', tagline: '', stats: [], flagCss: '', backInk: '#f4f5f0' },
  { key: 'itochu', numeral: 'Ⅴ', name: 'ITOCHU Corporation', country: '일본 · 오사카 · 도쿄', tagline: '', stats: [], flagCss: '', backInk: '#1b2733' },
];

describe('규모 축 데이터', () => {
  it('카드 5장 전부 매출 근거를 가진다', () => {
    for (const c of CARDS) expect(scaleOf(c.key), c.key).toBeDefined();
    expect(COMPANY_SCALE).toHaveLength(CARDS.length);
  });

  it('공시 없는 회사는 등급 C 로 표시된다', () => {
    // 알바코라는 CEO 발언, FCF 는 비상장이라 회장 발언이 전부다. A 로 올리면 거짓말이 된다.
    expect(scaleOf('albacora')?.등급).toBe('C');
    expect(scaleOf('fcf')?.등급).toBe('C');
    expect(scaleOf('itochu')?.등급).toBe('A');
    expect(scaleOf('thaiunion')?.등급).toBe('A');
    expect(scaleOf('frinsa')?.등급).toBe('A');
  });

  it('환율은 네 통화를 전부 덮는다', () => {
    for (const s of COMPANY_SCALE) expect(FX.usdPer[s.통화], s.통화).toBeGreaterThan(0);
    expect(FX.기준일).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('표기는 공시 원통화를 남긴다', () => {
    expect(scaleLabel('itochu')).toContain('14조 8,231억엔');
    expect(scaleLabel('frinsa')).toContain('741 M€');
    expect(scaleLabel('fcf')).toContain('600억 NT$');
  });
});

describe('매출순 정렬', () => {
  const order = sortCompanies(CARDS, 'revenue').map((c) => c.key);

  it('큰 회사가 앞이다', () => {
    expect(order).toEqual(['itochu', 'thaiunion', 'fcf', 'frinsa', 'albacora']);
  });

  it('이웃한 두 회사 격차가 1.4배 이상이라 환율이 흔들려도 순서가 안 바뀐다', () => {
    for (let i = 0; i < order.length - 1; i += 1) {
      const ratio = revenueUsdM(order[i]) / revenueUsdM(order[i + 1]);
      expect(ratio, `${order[i]} vs ${order[i + 1]}`).toBeGreaterThan(1.4);
    }
  });
});

describe('국가순 정렬', () => {
  it('가나다순이고 같은 나라는 수록순을 지킨다', () => {
    // 대만 · 스페인(프린사·알바코라) · 일본 · 태국
    expect(sortCompanies(CARDS, 'country').map((c) => c.key))
      .toEqual(['fcf', 'frinsa', 'albacora', 'itochu', 'thaiunion']);
  });

  it('국가는 소재지 앞부분만 뽑는다', () => {
    expect(countryOf(CARDS[4])).toBe('일본');
    expect(countryOf(CARDS[2])).toBe('스페인');
  });
});

describe('수록순', () => {
  it('원래 순서를 건드리지 않는다', () => {
    expect(sortCompanies(CARDS, 'listed').map((c) => c.key))
      .toEqual(CARDS.map((c) => c.key));
  });

  it('입력 배열을 변형하지 않는다', () => {
    const before = CARDS.map((c) => c.key);
    sortCompanies(CARDS, 'revenue');
    expect(CARDS.map((c) => c.key)).toEqual(before);
  });
});

describe('뒷면 명판 대비', () => {
  // 회사명이 국기 무늬에 먹히던 것이 이 화면의 출발점이다. 최악 배경에서도 읽혀야 한다.
  const 최악배경: [string, string, string][] = [
    ['albacora', '#f4f5f0', '#f4f5f0'], // 이쿠리냐 흰 십자
    ['albacora-red', '#f4f5f0', '#a32a2a'], // 붉은 사선
    ['itochu', '#1b2733', '#bc002d'], // 히노마루 붉은 원
    ['frinsa', '#4a2f00', '#e0b400'], // 로히괄다 노란 밴드
    ['thaiunion', '#f4f5f0', '#f4f5f0'], // 트라이롱 흰 밴드
    ['fcf', '#f4f5f0', '#1b3c8f'], // 청천백일 남색 사각
  ];

  it.each(최악배경)('%s — 최악 배경에서도 WCAG AAA(7:1)를 넘는다', (_l, ink, flag) => {
    expect(contrastOverFlag(ink, flag)).toBeGreaterThan(7);
  });

  it('밝은 잉크는 어두운 판, 어두운 잉크는 밝은 판을 받는다', () => {
    expect(plateFor('#f4f5f0')).toContain('rgba(9,');
    expect(plateFor('#1b2733')).toContain('rgba(250,');
  });
});
