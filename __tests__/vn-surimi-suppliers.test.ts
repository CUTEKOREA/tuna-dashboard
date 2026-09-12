/**
 * 동남아 가공사 조사 화면의 베트남 연육·오징어 공급사 블록 회귀.
 * 원장 집계(연육 3,253건 중 29사, 오징어류 2,555건·제조소 98곳)와 겹침 3건을 고정한다.
 */
import { describe, expect, it } from 'vitest';

import {
  vnSurimiRows,
  vnSquidTopRows,
  vnSupplierMeta,
  vnSurimiDeclarations,
  vnRegistrationRisk,
} from '../lib/data/vn-surimi-suppliers';

describe('베트남 연육 공급사 29사', () => {
  it('29개사가 있고 회사·신고·등록 칸이 빈 채로 들어오지 않는다', () => {
    expect(vnSurimiRows).toHaveLength(29);
    expect(vnSupplierMeta.surimiFirms).toBe(29);
    for (const r of vnSurimiRows) {
      expect(r['회사']?.v.length).toBeGreaterThan(1);
      expect(r['한국향 연육 신고']?.v).toMatch(/\d+건/);
      expect(r['식약처 등록']?.v.length).toBeGreaterThan(0);
    }
  });

  it('신고 건수 합이 베트남 원장 집계 범위 안에 있다', () => {
    const n = vnSurimiDeclarations();
    expect(n).toBeGreaterThan(3000);
    expect(n).toBeLessThanOrEqual(3253);
  });

  it('등록 만료·갱신필요 공급사를 따로 센다', () => {
    expect(vnRegistrationRisk().length).toBeGreaterThan(0);
  });
});

describe('베트남산 오징어류 제조소', () => {
  it('상위 10곳이 있고 1위가 NGOC HONG이다', () => {
    expect(vnSquidTopRows).toHaveLength(10);
    expect(vnSquidTopRows[0]?.['제조소']?.v).toContain('NGOC HONG');
  });

  it('제조소 수·신고 수와 연육 29사 겹침을 밝힌다', () => {
    expect(vnSupplierMeta.squidFacilities).toBe(98);
    expect(vnSupplierMeta.squidDeclarations).toBe(2555);
    expect(vnSupplierMeta.overlap).toContain('3건');
    expect(vnSupplierMeta.overlap).toContain('KIEN CUONG');
  });

  it('건수가 물량이 아니라는 한정을 남긴다', () => {
    expect(vnSupplierMeta.note).toContain('물량이 아니다');
  });
});
