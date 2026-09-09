/**
 * 참치 세력 지구본 관문.
 *
 * 이 위젯의 위험은 렌더가 깨지는 것이 아니라 **없는 정밀도를 그리는 것**이다.
 * 20편 조사가 낸 「지도로 그리면 거짓이 되는 것」 다섯을 여기서 기계로 막는다.
 * 규칙을 주석에만 적으면 다음 사람이 깬다.
 */

import { describe, expect, it } from 'vitest';
import {
  ALL_POINTS,
  FLAG_STATES,
  HQ_POINTS,
  NO_FLEET,
  PLANT_POINTS,
  UNLOCATED_PLANTS,
  hasSize,
  isValidCoord,
} from '@/lib/data/company-geo';
import {
  ALL_RELATIONS,
  EXTERNAL_NODES,
  isSolid,
  strokeWeight,
} from '@/lib/data/company-relations';
import { COMPANY_CARDS } from '@/components/market-understanding/CompanyAnatomyDashboard';

const NUMERALS = [
  'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ',
  'ⅩⅠ', 'ⅩⅡ', 'ⅩⅢ', 'ⅩⅣ', 'ⅩⅤ', 'ⅩⅥ', 'ⅩⅦ', 'ⅩⅧ', 'ⅩⅨ', 'ⅩⅩ',
];

describe('좌표 원장', () => {
  it('20편 전부가 본사 핀을 갖는다', () => {
    expect(HQ_POINTS).toHaveLength(20);
    const cardKeys = COMPANY_CARDS.map((c) => c.key).sort();
    const hqKeys = HQ_POINTS.map((p) => p.company).sort();
    expect(hqKeys).toEqual(cardKeys);
  });

  it('편 번호가 카드와 같다', () => {
    const byKey = new Map(COMPANY_CARDS.map((c) => [c.key, c.numeral]));
    for (const p of HQ_POINTS) {
      expect(p.numeral, `${p.company} 편 번호`).toBe(byKey.get(p.company));
    }
    expect(HQ_POINTS.map((p) => p.numeral)).toEqual(NUMERALS);
  });

  it('모든 좌표가 지구 위에 있다', () => {
    for (const p of ALL_POINTS) {
      expect(isValidCoord(p), `${p.label} (${p.lat}, ${p.lng})`).toBe(true);
    }
  });

  it('모든 점이 근거를 들고 다닌다', () => {
    for (const p of ALL_POINTS) {
      expect(p.basis.trim().length, `${p.label} basis`).toBeGreaterThan(4);
    }
  });

  /** 규칙 1 — 본사 핀에 매출·규모를 붙이면 거짓이 된다. */
  it('본사 핀은 크기를 갖지 않는다', () => {
    for (const p of HQ_POINTS) {
      expect(hasSize(p), `${p.label} 은 본사인데 크기가 붙었다`).toBe(false);
      expect(p.sizeValue, `${p.label} sizeValue`).toBeUndefined();
    }
  });

  /** 크기를 주려면 단위가 있어야 한다. 단위 없는 값은 견줄 수 없다. */
  it('크기가 있는 거점은 단위를 갖는다', () => {
    for (const p of PLANT_POINTS) {
      if (typeof p.sizeValue === 'number') {
        expect(p.sizeUnit, `${p.label} 단위 없음`).toBeTruthy();
        expect(p.sizeValue).toBeGreaterThan(0);
      }
    }
  });

  /** 규칙 3 — 위치가 확인되지 않은 공장은 지도에 없다. */
  it('미확인 공장은 점으로 찍히지 않는다', () => {
    expect(UNLOCATED_PLANTS.length).toBeGreaterThan(0);
    for (const u of UNLOCATED_PLANTS) {
      expect(u.count).toBeGreaterThan(0);
      expect(u.basis).toMatch(/미확인/);
    }
  });

  /** 규칙 2 — 모항 데이터가 없으므로 선단을 점으로 만들지 않는다. */
  it('선단은 기국으로만 있고 지도 점이 아니다', () => {
    const labels = ALL_POINTS.map((p) => p.label).join(' ');
    expect(labels).not.toMatch(/모항|home\s*port/i);
    for (const f of FLAG_STATES) {
      expect(f.flags.length).toBeGreaterThan(0);
      for (const x of f.flags) expect(x.count).toBeGreaterThan(0);
    }
  });

  it('배 0척인 회사는 기국 목록에 없다', () => {
    const withFleet = new Set(FLAG_STATES.map((f) => f.company));
    for (const n of NO_FLEET) {
      expect(withFleet.has(n.company), `${n.company} 는 0척인데 기국이 붙었다`).toBe(false);
    }
  });
});

describe('관계 원장', () => {
  it('모든 관계가 근거를 들고 다닌다', () => {
    expect(ALL_RELATIONS.length).toBeGreaterThan(10);
    for (const r of ALL_RELATIONS) {
      expect(r.basis.trim().length, `${r.label} basis`).toBeGreaterThan(4);
      expect(r.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('양 끝이 아는 노드다', () => {
    const known = new Set([...HQ_POINTS.map((p) => p.company), ...Object.keys(EXTERNAL_NODES)]);
    for (const r of ALL_RELATIONS) {
      expect(known.has(r.from), `from ${r.from}`).toBe(true);
      expect(known.has(r.to), `to ${r.to}`).toBe(true);
    }
  });

  /** 규칙 5 — 근거 없는 관계를 굵게 그리면 없는 정밀도를 만든다. */
  it('미확인 관계는 값이 있어도 고정폭이다', () => {
    const base = strokeWeight({
      from: 'a', to: 'b', kind: 'equity', status: 'active',
      label: 'x', confirmed: false, value: 100, unit: '%', basis: 'test',
    });
    const confirmed = strokeWeight({
      from: 'a', to: 'b', kind: 'equity', status: 'active',
      label: 'x', confirmed: true, value: 100, unit: '%', basis: 'test',
    });
    expect(base).toBeLessThan(confirmed);
    for (const r of ALL_RELATIONS.filter((x) => !x.confirmed)) {
      expect(strokeWeight(r), `${r.label} 는 미확인인데 굵다`).toBe(base);
    }
  });

  it('확정되고 살아 있는 관계만 실선이다', () => {
    for (const r of ALL_RELATIONS) {
      expect(isSolid(r)).toBe(r.confirmed && r.status === 'active');
    }
  });

  /** 규칙 3 — 끝난 관계와 무산된 관계를 살아 있는 것처럼 그리지 않는다. */
  it('끝나거나 무산된 관계가 실제로 있다', () => {
    expect(ALL_RELATIONS.some((r) => r.status === 'ended')).toBe(true);
    expect(ALL_RELATIONS.some((r) => r.status === 'failed')).toBe(true);
  });

  /** 방향이 자주 뒤바뀌는 자리. ⅩⅦ 금칙이 명시한다. */
  it('Bumble Bee 가 Sea Value 를 갖는 방향이다', () => {
    const r = ALL_RELATIONS.find(
      (x) => x.kind === 'equity' && x.from === 'bumblebee' && x.to === 'seavalue',
    );
    expect(r, 'Bumble Bee → Sea Value 관계가 없다').toBeDefined();
    expect(
      ALL_RELATIONS.some((x) => x.kind === 'equity' && x.from === 'seavalue' && x.to === 'bumblebee'),
      'Sea Value → Bumble Bee 로 뒤집힌 행이 있다',
    ).toBe(false);
  });

  /** Ⅳ 금칙 — 선상·환적 인도라 한국→대만 수출은 통계에 0으로 찍힌다. */
  it('통계에 안 잡히는 축을 무역선으로 긋지 않는다', () => {
    const bad = ALL_RELATIONS.find((r) => r.kind === 'trade' && r.to === 'fcf');
    expect(bad, '한국→대만 무역선이 그어졌다').toBeUndefined();
  });

  /** 금칙 문장은 관계에 붙어 있어야 호버 카드에 뜬다. */
  it('주의가 필요한 관계에 금칙 문장이 붙어 있다', () => {
    const withCaution = ALL_RELATIONS.filter((r) => r.caution);
    expect(withCaution.length).toBeGreaterThanOrEqual(8);
    for (const r of withCaution) {
      expect(r.caution!.trim().length).toBeGreaterThan(10);
    }
  });
});
