/**
 * Thai Union SKU 카탈로그 회귀 검사.
 *
 * 값은 원자료에서 그대로 읽으므로 여기서 지키는 것은 「무엇이 없는지」가 흐려지지 않는가다.
 * 빈 칸을 채워 넣거나, 회사 공개자료(A)와 소비자 데이터베이스(B)를 섞어 세면
 * 그때부터 화면이 거짓말을 시작한다.
 */
import { describe, expect, it } from 'vitest';

import {
  byGrade,
  fillRate,
  pricesOf,
  skusOf,
  skuTotal,
  speciesMix,
  tuBrands,
  tuPrices,
  tuSkuMeta,
  tuSkus,
  tunaSkus,
} from '@/lib/data/company-thaiunion-skus';

const 공식 = ['John West', 'Chicken of the Sea', 'Petit Navire', 'Rügen Fisch', 'Hawesta', 'King Oscar'];
const OFF = ['Mareblu', 'Parmentier', 'Sealect'];

describe('카탈로그 규모', () => {
  it('아홉 브랜드 467 SKU 다', () => {
    expect(tuBrands).toHaveLength(9);
    expect(skuTotal()).toBe(467);
  });

  it('브랜드 표의 합이 SKU 수와 같다', () => {
    expect(tuBrands.reduce((a, b) => a + b.수, 0)).toBe(skuTotal());
  });

  it('브랜드별 실제 행 수가 표와 맞는다', () => {
    for (const b of tuBrands) expect(skusOf(b.브랜드).length, b.브랜드).toBe(b.수);
  });

  it('소매가 186건이 전부 브랜드에 붙어 있다', () => {
    expect(tuPrices).toHaveLength(186);
    const names = new Set(tuBrands.map((b) => b.브랜드));
    for (const p of tuPrices) expect(names.has(p.브랜드), p.브랜드).toBe(true);
  });
});

describe('출처 등급을 섞지 않는다', () => {
  it('공식 카탈로그 여섯 곳은 A 다', () => {
    for (const b of 공식) {
      expect(skusOf(b).every((s) => s.등급 === 'A'), b).toBe(true);
    }
  });

  it('전용 사이트가 없는 셋은 B 다', () => {
    for (const b of OFF) {
      expect(skusOf(b).every((s) => s.등급 === 'B'), b).toBe(true);
    }
  });

  it('A 314 · B 153 으로 갈린다', () => {
    expect(byGrade()).toEqual({ A: 314, B: 153 });
    expect(byGrade().A + byGrade().B).toBe(skuTotal());
  });

  it('메타가 등급의 뜻을 밝힌다', () => {
    expect(tuSkuMeta.등급).toContain('Open Food Facts');
    expect(tuSkuMeta.한계).toContain('채우지 않고');
  });
});

describe('없는 값을 만들지 않는다', () => {
  it('빈 칸은 「-」로 남는다', () => {
    // 채워진 비율이 100%가 되면 어딘가에서 값을 지어낸 것이다.
    expect(fillRate('어종')).toBeLessThan(100);
    expect(fillRate('규격')).toBeLessThan(100);
    expect(fillRate('인증')).toBeLessThan(100);
  });

  it('현재 채움률이 밑돌지 않는다', () => {
    // 추출이 조용히 나빠지는 것을 막는 하한선이다.
    expect(fillRate('어종')).toBeGreaterThanOrEqual(94);
    expect(fillRate('규격')).toBeGreaterThanOrEqual(77);
    expect(fillRate('인증')).toBeGreaterThanOrEqual(34);
  });

  it('제품명은 한 건도 비지 않는다', () => {
    for (const s of tuSkus) expect(s.제품명.trim(), s.url).not.toBe('');
  });

  it('이름이 없는 OFF 항목은 셋뿐이고 바코드를 남긴다', () => {
    const 미기재 = tuSkus.filter((s) => s.제품명.startsWith('(제품명 미기재'));
    expect(미기재).toHaveLength(3);
    for (const s of 미기재) expect(s.제품명).toMatch(/바코드 \d+/);
  });
});

describe('어종', () => {
  it('참치가 절반을 넘지 않는다 - 브랜드를 사 모은 결과다', () => {
    expect(tunaSkus()).toBeGreaterThan(150);
    expect(tunaSkus() / skuTotal()).toBeLessThan(0.5);
  });

  it('학명은 한글명으로 묶인다', () => {
    // 「청어 (Clupea harengus)」와 「청어」가 따로 세어지면 구성표가 틀린다.
    const mix = speciesMix();
    expect(mix.every((r) => !r.어종.includes('('))).toBe(true);
    expect(mix.some((r) => r.어종 === '청어')).toBe(true);
  });

  it('구성 합이 어종이 적힌 SKU 수 이상이다', () => {
    // 한 SKU 가 어종을 둘 달면 양쪽에 센다. 그래서 같지 않고 크거나 같다.
    const 있음 = tuSkus.filter((s) => s.어종 !== '-').length;
    const 합 = speciesMix().reduce((a, r) => a + r.수, 0);
    expect(합).toBeGreaterThanOrEqual(있음);
    expect(합 - 있음).toBeLessThan(5);
  });

  it('Rügen Fisch 에는 참치가 없다', () => {
    // 독일 두 브랜드 중 참치를 맡은 쪽은 Hawesta 다. 보고서의 주장을 데이터가 받쳐야 한다.
    expect(skusOf('Rügen Fisch').some((s) => /참치|다랑어/.test(s.어종))).toBe(false);
    expect(skusOf('Hawesta').filter((s) => /참치/.test(s.어종)).length).toBeGreaterThan(5);
  });
});

describe('소매가', () => {
  it('모든 행에 소매처와 기준일이 붙어 있다', () => {
    for (const p of tuPrices) {
      expect(p.소매처.trim(), p.제품명).not.toBe('');
      expect(p.기준일, p.제품명).toMatch(/\d{4}-\d{2}-\d{2}|-/);
    }
  });

  it('영국 가격은 Morrisons 에서만 나온다', () => {
    // 다른 영국 소매처는 전부 차단됐다(조사노트 F-1). 그 사실이 데이터에도 남아야 한다.
    const uk = tuPrices.filter((p) => p.국가 === '영국');
    expect(uk.length).toBeGreaterThan(0);
    expect(new Set(uk.map((p) => p.소매처))).toEqual(new Set(['Morrisons']));
  });

  it('브랜드별 조회가 전체와 맞는다', () => {
    const 합 = tuBrands.reduce((a, b) => a + pricesOf(b.브랜드).length, 0);
    expect(합).toBe(tuPrices.length);
  });
});
