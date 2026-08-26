/**
 * FFA 조업허가 선단 가드.
 *
 * 이 자료에서 틀리기 쉬운 곳은 세 군데다.
 *   ① 빈 칸을 0 으로 셀지 결측으로 셀지 (등록일 이전이면 결측이다)
 *   ② 배 자신의 중앙값만 기준 삼으면 상시 절반 보고하는 배가 만점을 받는다
 *   ③ 어창 용량은 ㎥ 와 t 가 섞여 있어 합칠 수 없다
 */
import { describe, expect, it } from 'vitest';

import {
  activeButShort,
  ffaBelowNorm,
  ffaByFlag,
  ffaByType,
  ffaDays,
  ffaKorea,
  ffaMeta,
  ffaNotReporting,
  ffaSummary,
  ffaTypeNorms,
  koreaHoldsByUnit,
  topFlags,
} from '@/lib/data/ffa-vrst';

describe('FFA 집계 정합', () => {
  it('국기별 척수 합이 총척수와 같다', () => {
    expect(ffaByFlag.reduce((a, r) => a + r.척수, 0)).toBe(ffaSummary.총척수);
    expect(ffaByFlag).toHaveLength(ffaSummary.국기수);
  });

  it('선종별 척수 합이 총척수와 같다', () => {
    expect(ffaByType.reduce((a, r) => a + r.척수, 0)).toBe(ffaSummary.총척수);
  });

  it('상위 국가 묶음도 총척수를 보존한다', () => {
    // 「그 외」로 접을 때 잔여를 빠뜨리면 합이 줄어든다.
    expect(topFlags(8).reduce((a, r) => a + r.척수, 0)).toBe(ffaSummary.총척수);
    expect(topFlags(8).at(-1)?.국기).toBe('그 외');
  });

  it('14일 구간이다', () => {
    expect(ffaDays).toHaveLength(ffaSummary.일수);
    expect(ffaDays[0]).toBe('2026-08-01');
    expect(ffaDays.at(-1)).toBe('2026-08-14');
  });

  it('원본 집계 시트의 불일치를 숨기지 않는다', () => {
    // FFA 가 붙여 둔 집계표는 중국 행의 선종 열 합이 1척 모자란다.
    // 원표를 썼다는 사실과 함께 화면에 남아야 한다.
    expect(ffaMeta.주의).toMatch(/중국/);
    expect(ffaMeta.주의).toMatch(/원표/);
  });

  it('측정 경계를 명시한다 - 자격이지 조업 실적이 아니다', () => {
    expect(ffaMeta.측정경계).toMatch(/조업일이 아니다|어획량/);
  });
});

describe('VMS 보고 결손 판정', () => {
  it('결손일은 무보고일보다 적을 수 없다', () => {
    // 절반 넘게 못 받은 배는 중앙값이 0 이라 「미달 0일」로 뒤집힌다.
    for (const r of ffaNotReporting) {
      expect(r.결손일, r.선명).toBeGreaterThanOrEqual(r.무보고일);
    }
  });

  it('결손일이 적용일을 넘지 않는다', () => {
    for (const r of ffaNotReporting) {
      expect(r.결손일, r.선명).toBeLessThanOrEqual(r.적용일);
      expect(r.적용일, r.선명).toBeLessThanOrEqual(ffaSummary.일수);
    }
  });

  it('FFA 미보고 표기 수가 요약과 맞는다', () => {
    expect(ffaNotReporting).toHaveLength(ffaSummary.미보고척수);
  });

  it('선망 표준 주기는 운반선의 두 배다', () => {
    const norm = Object.fromEntries(ffaTypeNorms.map((n) => [n.선종, n.표준주기]));
    expect(norm['선망']).toBe(48);
    expect(norm['운반선']).toBe(24);
  });

  it('표준 미달 선박은 자체 주기가 선종 표준보다 낮다', () => {
    expect(ffaBelowNorm.length).toBeGreaterThan(0);
    for (const r of ffaBelowNorm) {
      expect(r.자체주기, r.선명).toBeLessThan(r.선종표준);
    }
  });

  it('FFA 표기가 정상인데 결손인 배가 따로 잡힌다', () => {
    // 이 목록이 이 자료의 값이다. FFA 표기만 믿으면 통째로 놓친다.
    const a = activeButShort();
    expect(a.length).toBeGreaterThan(0);
    expect(a.length).toBeLessThan(ffaBelowNorm.length);
    for (const r of a) expect(r.VMS === 'ACTIVE' || r.VMS === '정상').toBe(true);
  });
});

describe('한국 선단', () => {
  it('선종별 합이 한국 척수와 같다', () => {
    expect(ffaKorea.선종별.reduce((a, r) => a + r.척수, 0)).toBe(ffaSummary.한국척수);
  });

  it('선주별 합이 선망 척수와 같다', () => {
    const seiners = ffaKorea.선종별.find((r) => r.선종 === '선망')?.척수 ?? 0;
    expect(ffaKorea.선주별.reduce((a, o) => a + o.척수, 0)).toBe(seiners);
    expect(seiners).toBe(22);
  });

  it('선주 대표 표기는 원본 표기이지 정규화 키가 아니다', () => {
    // 정규화는 법인격 접미(Co / Ltd / Corporation …)를 지운다. 화면에 그 결과가
    // 나가면 등록부에 없는 이름이 생긴다 — 접미가 남아 있으면 원본 표기다.
    for (const o of ffaKorea.선주별) {
      expect(o.선주, o.선주).toMatch(/\b(Co|Ltd|CO|LTD|Corporation|CORPORATION|Inc)\b/);
      expect(o.선박).toHaveLength(o.척수);
    }
  });

  it('신라 선망 6척이 한 선주로 묶인다', () => {
    // 등록부에 "Silla Co., Ltd" 와 "Silla Co. Ltd" 두 표기가 있다.
    const silla = ffaKorea.선주별.find((o) => o.선주.toUpperCase().includes('SILLA'));
    expect(silla?.척수).toBe(6);
    expect(silla?.표기수).toBeGreaterThan(1);
  });

  it('어창 용량은 두 단위가 섞여 있고 합치지 않는다', () => {
    const m3 = koreaHoldsByUnit('㎥');
    const t = koreaHoldsByUnit('t');
    expect(m3.length).toBeGreaterThan(0);
    expect(t.length).toBeGreaterThan(0);
    for (const h of m3) expect(h.단위).toBe('㎥');
    for (const h of t) expect(h.단위).toBe('t');
    // 단위 경고가 살아 있어야 한다.
    expect(ffaMeta.단위경고).toMatch(/더하거나|합치/);
  });
});
