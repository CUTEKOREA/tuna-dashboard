import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  pnaAccessFee as a,
  zoneCompanyTotal,
  companyTotals,
  shinlaInstallmentDue,
} from '../lib/data/pna-access-fee';
import PnaAccessFeeWidgets from '../components/PnaAccessFeeWidgets';

/* 원자료 4건 (2026-09-03 배정):
 *   260903_참치선망 수역별 입어료 3차분 배정.xlsx
 *   2026어기 솔로몬, PNG 수역 입어료 3차분 배정(시행문).pdf
 *   Korea Overseas Fisheries Association - 3rd Installment ... Inv#009095.pdf  (PNG NFA)
 *   INVFISH0802026.pdf  (솔로몬 MFMR, INV.NO.FISH080/2026)
 * 아래 수치는 전부 원문 하드코딩이다. */

describe('PNA 수역별 입어료 데이터 계약', () => {
  it('출처 메타가 원본 4건을 가리킨다', () => {
    expect(a.source.allocation.file).toBe('260903_참치선망 수역별 입어료 3차분 배정.xlsx');
    expect(a.source.allocation.sha256).toBe(
      'd57ed6e7444c29e15f3becc21834dad65a5e615544b9ab72d019ec135718fea9',
    );
    expect(a.source.dispatch.sha256).toBe(
      '1f3df8576b8041fe8e6ddc0ec971c2da5c06db9319e5610584b69a3d5ee15838',
    );
    expect(a.source.invoices).toHaveLength(2);
    expect(a.source.invoices.map((i) => i.zone).sort()).toEqual(['png', 'sol']);
  });

  it('수역별 회사 배분이 원문 소계와 맞아떨어진다', () => {
    for (const z of a.zones) {
      const sum = zoneCompanyTotal(z);
      expect(sum.days).toBe(z.total.days);
      expect(sum.fee).toBeCloseTo(z.total.fee, 2);
    }
  });

  it('회사별 배분이 일수 × 단가 × 회차비율과 일치한다', () => {
    for (const z of a.zones) {
      for (const row of z.companies) {
        expect(row.fee).toBeCloseTo(row.days * z.unitCost * z.sharePct, 2);
      }
    }
  });

  it('솔로몬·PNG 3차분이 3차분 배정표와 일치한다', () => {
    const sol = a.zones.find((z) => z.id === 'sol')!;
    expect(sol.installment).toBe(3);
    expect(sol.sharePct).toBe(0.25);
    expect(sol.total).toEqual({ days: 175, fee: 437_500 });
    expect(sol.jointVenture).toEqual({ days: 17, fee: 42_500 });

    const png = a.zones.find((z) => z.id === 'png')!;
    expect(png.installment).toBe(3);
    expect(png.total).toEqual({ days: 1325, fee: 4_637_500 });
    // 33% 3회 균등이라 2차분과 금액이 같다 - 이 동일성은 오류가 아니다
    expect(png.total.fee).toBeCloseTo(png.total.days * png.unitCost / 3, 0);
  });

  it('인보이스 금액이 배정표 합계와 맞물린다', () => {
    const solInv = a.source.invoices.find((i) => i.zone === 'sol')!;
    const sol = a.zones.find((z) => z.id === 'sol')!;
    // 인보이스는 국적선 + 합작선을 한 장으로 청구한다
    expect(solInv.days).toBe(sol.total.days + sol.jointVenture!.days);
    expect(solInv.feeUsd).toBe(sol.total.fee + sol.jointVenture!.fee);
    expect(solInv.feeUsd).toBe(480_000);
    expect(solInv.totalUsd).toBe(480_005);

    const pngInv = a.source.invoices.find((i) => i.zone === 'png')!;
    expect(pngInv.feeUsd).toBe(4_637_500);
    expect(pngInv.dueDate).toBe('2026-09-30');
  });

  it('회사 합계가 수역 배분에서 파생되고 신라교역 일수가 원문과 같다', () => {
    const totals = companyTotals();
    const shinla = totals.find((c) => c.name === '신라교역')!;
    expect(shinla.days).toBe(781);
    expect(shinla.vessels).toBe(6);
    // 합계는 하드코딩이 아니라 수역 배분의 합이어야 한다
    const byHand = a.zones.reduce(
      (acc, z) => acc + (z.companies.find((c) => c.name === '신라교역')?.fee ?? 0), 0,
    );
    expect(shinla.fee).toBeCloseTo(byHand, 2);
    // 키리바시 국적선 표에는 5개사 밖의 사조 바누아투 몫이 함께 실린다 - 그만큼을 빼야 맞는다
    expect(totals.reduce((s, c) => s + c.days, 0)).toBe(
      a.zones.reduce((s, z) => s + z.total.days - (z.otherFee?.days ?? 0), 0),
    );
  });

  it('이번 3차분에 신라교역이 실제로 낼 금액을 뽑는다', () => {
    const due = shinlaInstallmentDue();
    expect(due.zones.map((z) => z.id).sort()).toEqual(['png', 'sol']);
    expect(due.fee).toBe(1_263_500 + 125_000);
    expect(due.total).toBe(1_388_502);       // 송금수수료 $2 포함
    expect(due.remitBy).toBe('2026-09-17');  // 협회 송금 기한(시행문)
  });

  it('납부 일정이 3차분 기한으로 갱신됐고 은행 계좌는 담지 않는다', () => {
    const png3 = a.payments.find((p) => p.zone === 'PNG 3차분(33%)')!;
    const sol3 = a.payments.find((p) => p.zone === '솔로몬 3차분(25%)')!;
    const remit = a.payments.find((p) => p.zone.startsWith('협회 송금 기한'))!;
    expect(remit.date).toBe('2026.09.17');
    expect(png3.date).toBe('2026.09.30');
    expect(sol3.date).toBe('2026.09.30');
    const blob = JSON.stringify(a);
    for (const secret of ['7012 972 860', '0260-002', 'BOSPPGPM', 'CBSISBSB', '026-57-000978']) {
      expect(blob).not.toContain(secret);
    }
  });
});

describe('선단 보드 입어료 위젯 노출', () => {
  it('3차분 수치가 렌더된다', () => {
    const markup = renderToStaticMarkup(React.createElement(PnaAccessFeeWidgets));
    expect(markup).toContain('3차분');
    expect(markup).toContain('1,263,500');  // PNG 신라교역
    expect(markup).toContain('125,000');    // 솔로몬 신라교역 3차분
    expect(markup).toContain('2026.09.17'); // 협회 송금 기한
    expect(markup).not.toContain('250,000'); // 솔로몬 2차분 금액은 더 이상 없다
  });
});
