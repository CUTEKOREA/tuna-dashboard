/**
 * 베트남산 오징어류 제조소 반영 회귀 (2026-09-12).
 * 식약처 수입신고 원장(처리일 2024-09-12~2026-09-10)을 제품명 오징어·SQUID·CUTTLE 로 조회한 합집합에서
 * 낙지·주꾸미를 뺀 2,555건을 기준으로 한다. 합집합 정리라 사실표는 B 등급이다.
 */
import { describe, expect, it } from 'vitest';

import { SQUID_ALL_NARRATIVES } from '../lib/squid-industry-content';

const s10 = SQUID_ALL_NARRATIVES.find((s) => s.key === 's10');
const text = s10?.paragraphs.join('') ?? '';

describe('베트남산 오징어류 제조소', () => {
  it('구성 합계가 전체와 맞는다', () => {
    expect(1362 + 1148 + 45).toBe(2555);
    expect(((790 / 2555) * 100).toFixed(1)).toBe('30.9');
    expect(218 + 158 + 143 + 141 + 130).toBe(790);
  });

  it('본문이 전체 건수·상위 제조소·연육 공장 겹침·계열 예외를 적는다', () => {
    expect(text).toContain('**2,555건**');
    expect(text).toContain('790건(30.9%)');
    expect(text).toContain('**3건**(HOA THANG 갑오징어 2건, BASEAFOOD 조미오징어 1건)');
    expect(text).toContain('KIEN CUONG SEAFOOD가 CJ프레시웨이에 냉동 갑오징어 8건');
  });

  it('사실표 두 행은 B 등급이고 건수가 수량이 아님을 밝힌다', () => {
    const total = s10?.facts.find((f) => f.label.startsWith('베트남산 오징어류 수입신고'));
    const overlap = s10?.facts.find((f) => f.label === '베트남 연육 공장 29곳의 오징어류 신고');
    expect(total?.grade).toBe('B');
    expect(total?.value.startsWith('2,555건')).toBe(true);
    expect(total?.note).toContain('수량이 아니다');
    expect(overlap?.grade).toBe('B');
    expect(overlap?.value.startsWith('3건')).toBe(true);
  });
});
