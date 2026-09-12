import { describe, expect, it } from 'vitest';

import {
  hasLedger,
  ledgerFor,
  ledgerThirdRows,
  ledgerTopRows,
  originLine,
  seasiaLedgerMeta,
  speciesLine,
} from '@/lib/data/seasia-ledger';
import { headsOf } from '@/lib/data/seasia-processors';

/**
 * 아홉 어종 원장을 가공국으로 재집계한 자료다. 기존 「한국 거래처 전수표」와 기준이 달라
 * 건수가 어긋나는 것이 정상이고, 그 사실이 화면에 적혀 있어야 한다 — 그것까지 고정한다.
 */
describe('태국·베트남 가공 제조소 원장', () => {
  it('두 나라만 있고 다른 나라는 이 절을 그리지 않는다', () => {
    expect(hasLedger('태국')).toBe(true);
    expect(hasLedger('베트남')).toBe(true);
    expect(hasLedger('인도네시아')).toBe(false);
  });

  it('태국 집계가 원장 재집계값과 같다', () => {
    const t = ledgerFor('태국')!;
    expect(t.n).toBe(2235);
    expect(t.facilities).toBe(37);
    expect(t.inRegistry).toBe(35);
    expect(t.onlyLedger).toBe(2);
    expect(t.thirdFacilities).toBe(7);
    // 제조소 수 = 전수표에 있는 곳 + 원장에만 있는 곳
    expect(t.inRegistry + t.onlyLedger).toBe(t.facilities);
  });

  it('베트남 집계가 원장 재집계값과 같다', () => {
    const v = ledgerFor('베트남')!;
    expect(v.n).toBe(11123);
    expect(v.facilities).toBe(216);
    expect(v.inRegistry).toBe(200);
    expect(v.onlyLedger).toBe(16);
    expect(v.thirdFacilities).toBe(22);
    expect(v.inRegistry + v.onlyLedger).toBe(v.facilities);
  });

  it('어종군 건수 합이 나라별 신고 수와 같다', () => {
    for (const c of ['태국', '베트남']) {
      const led = ledgerFor(c)!;
      const sum = led.species.reduce((a, [, n]) => a + n, 0);
      expect(sum).toBe(led.n);
    }
  });

  it('제3국 원료 건수가 원산지 구성과 어긋나지 않는다', () => {
    for (const c of ['태국', '베트남']) {
      const led = ledgerFor(c)!;
      const own = led.origins.find(([k]) => k === c)?.[1] ?? 0;
      // 상위 6개국만 담으므로 자국분 + 제3국분이 전체를 넘지 않는다
      expect(own + led.thirdCountry).toBeLessThanOrEqual(led.n);
      expect(led.thirdCountry).toBeGreaterThan(0);
    }
  });

  it('표에 어종군과 원료 원산지 열이 있다 — 기존 전수표가 비운 두 칸이다', () => {
    for (const c of ['태국', '베트남']) {
      const heads = headsOf(ledgerTopRows(c));
      expect(heads).toContain('어종군');
      expect(heads).toContain('원료 원산지');
      expect(heads).toContain('제3국 원료');
      expect(heads).toContain('조사보고서 대조');
    }
  });

  it('상위 20곳은 신고 건수 내림차순이다', () => {
    for (const c of ['태국', '베트남']) {
      const led = ledgerFor(c)!;
      const ns = led.top.map((r) => Number(r['신고']));
      expect(ns.length).toBe(20);
      expect([...ns].sort((a, b) => b - a)).toEqual(ns);
    }
  });

  it('제3국 표는 전부 제3국 원료 칸이 채워져 있다', () => {
    for (const c of ['태국', '베트남']) {
      const rows = ledgerThirdRows(c);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) expect(r['제3국 원료']?.v).not.toBe('–');
    }
  });

  it('태국 제3국 표에 KF FOODS 가 있고 아르헨티나 원료가 적힌다', () => {
    const rows = ledgerThirdRows('태국');
    const kf = rows.find((r) => (r['제조소(원장 표기)']?.v ?? '').includes('KF FOODS'));
    expect(kf).toBeDefined();
    expect(kf!['원료 원산지']?.v).toContain('아르헨티나');
    expect(kf!['조사보고서 대조']?.tags).toContain('Top Pick');
  });

  it('두 표를 더하지 말라는 경고가 자료에 붙어 있다', () => {
    expect(seasiaLedgerMeta.diff).toContain('더하거나 덮지 않는다');
    expect(seasiaLedgerMeta.basis).toContain('물량이 아니다');
    expect(seasiaLedgerMeta.merge).toContain('한 줄로 묶었다');
  });

  it('표기가 여러 벌인 제조소는 이름에 그 사실이 붙는다', () => {
    // HOP TAN 은 CORP / CORPORATION / CORP. 세 표기가 한 회사다. 기존 전수표는 갈라 두므로
    // 행끼리 건수를 맞춰 보면 어긋난다 — 그 어긋남의 이유가 표에 보여야 한다.
    const vn = ledgerTopRows('베트남');
    const hopTan = vn.find((r) => (r['제조소(원장 표기)']?.v ?? '').includes('HOP TAN'));
    expect(hopTan).toBeDefined();
    expect(hopTan!['제조소(원장 표기)']!.v).toContain('+표기');
    expect(Number(hopTan!['신고']!.v.replace(/,/g, ''))).toBe(960);
  });

  it('모회사와 자회사를 한 줄로 붙이지 않는다', () => {
    // THAI UNION GROUP PUBLIC(모회사·아르헨티나 원료 3건)과 THAI UNION SEAFOOD(자회사·태국산 94건)는
    // 다른 법인이다. 접미사 정규화에서 GROUP·PUBLIC 을 떼면 같은 키가 되어 97건 한 줄이 됐다
    // (Codex 검증 P0, 2026-09-12). 둘이 갈려 있는지 고정한다.
    const rows = [...ledgerTopRows('태국'), ...ledgerThirdRows('태국')];
    const names = rows.map((r) => r['제조소(원장 표기)']?.v ?? '');
    const sub = rows.find((r) => (r['제조소(원장 표기)']?.v ?? '').includes('THAI UNION SEAFOOD'));
    const grp = rows.find((r) => (r['제조소(원장 표기)']?.v ?? '').includes('THAI UNION GROUP'));
    expect(sub).toBeDefined();
    expect(grp).toBeDefined();
    expect(Number(sub!['신고']!.v.replace(/,/g, ''))).toBe(94);
    expect(Number(grp!['신고']!.v.replace(/,/g, ''))).toBe(3);
    expect(sub!['원료 원산지']!.v).toBe('태국 94');
    expect(grp!['제3국 원료']!.v).toContain('100%');
    // 묶였다면 이름에 「+표기」가 붙는다 — 붙어 있으면 안 된다
    expect(names.filter((n) => n.includes('THAI UNION') && n.includes('+표기'))).toHaveLength(0);
  });

  it('요약 한 줄이 값을 가진다', () => {
    expect(speciesLine('태국')).toContain('문어·낙지');
    expect(originLine('태국')).toContain('태국');
    expect(speciesLine('인도네시아')).toBe('');
  });
});
