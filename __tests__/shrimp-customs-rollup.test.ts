import { describe, expect, it } from 'vitest';
import { HSK_CODES, rollup, unitPricePerMT } from '@/app/api/shrimp/customs/rollup';

/**
 * 관세청 새우 집계의 함정 회귀 테스트.
 *
 * 실제 값은 아카이브 스냅샷(2026-07-06, 2026.01~05)에서 가져왔다.
 * 이전 구현은 총계행 하나만 읽어 원산지 분해가 불가능했고, 6자리 조회라
 * 조제(1605)가 통째로 빠져 있었다.
 */

const item = (over: Record<string, string>) => ({
  year: '2026.01',
  hsCd: '0306171090',
  statCdCntnKor1: '베트남',
  impDlr: '0',
  impWgt: '0',
  ...over,
});

describe('shrimp customs rollup', () => {
  it('HSK 10자리 9개 세번을 스코프로 삼는다 (L-04)', () => {
    expect(HSK_CODES).toHaveLength(9);
    expect(HSK_CODES.every((c) => c.length === 10)).toBe(true);
    // 조제(1605)가 빠지면 베트남 수입액이 45% 사라진다.
    expect(HSK_CODES.some((c) => c.startsWith('1605'))).toBe(true);
  });

  it('총계행을 국가행과 합산하지 않는다', () => {
    const r = rollup('2026', [
      item({ statCdCntnKor1: '베트남', impDlr: '100', impWgt: '10' }),
      item({ statCdCntnKor1: '중국', impDlr: '50', impWgt: '5' }),
      // 관세청 응답에는 국가행과 나란히 총계행이 온다. 더하면 정확히 2배가 된다.
      item({ year: '총계', statCdCntnKor1: '총계', impDlr: '150', impWgt: '15' }),
    ]);
    expect(r.importUsd).toBe(150);
    expect(r.importKg).toBe(15);
    expect(r.origins.map((o) => o.country)).toEqual(['베트남', '중국']);
  });

  it('화이트리스트 밖 세번을 버린다 (과대수집 방지)', () => {
    const r = rollup('2026', [
      item({ hsCd: '0306171090', impDlr: '100', impWgt: '10' }),
      item({ hsCd: '0302999999', impDlr: '999', impWgt: '99' }), // 새우 아님
    ]);
    expect(r.importUsd).toBe(100);
  });

  it('같은 국가의 여러 세번을 합산해 금액순으로 정렬한다', () => {
    const r = rollup('2026', [
      item({ hsCd: '0306171090', statCdCntnKor1: '베트남', impDlr: '72457', impWgt: '8000' }),
      item({ hsCd: '1605211000', statCdCntnKor1: '베트남', impDlr: '59011', impWgt: '5000' }),
      item({ hsCd: '0306171090', statCdCntnKor1: '중국', impDlr: '71477', impWgt: '9000' }),
    ]);
    expect(r.origins[0]).toEqual({ country: '베트남', importUsd: 131468, importKg: 13000 });
    expect(r.origins[1].country).toBe('중국');
  });

  it('숫자가 아닌 값은 집계에 넣지 않는다', () => {
    const r = rollup('2026', [
      item({ impDlr: '100', impWgt: '10' }),
      item({ impDlr: 'N/A', impWgt: '5' }),
    ]);
    expect(r.importUsd).toBe(100);
  });

  it('분모가 0이면 단가를 만들어내지 않는다', () => {
    expect(unitPricePerMT(1000, 0)).toBeNull();
    // 7.98 USD/kg = 7,980 USD/MT (아카이브 실측 030617 평균)
    expect(unitPricePerMT(222_170_260, 27_848_457)).toBe(7978);
  });
});
