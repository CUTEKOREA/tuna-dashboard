import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { cosmoQualityReport as q } from '../lib/data/cosmo-quality-report';
import ProductionTab from '../components/cosmo/tabs/ProductionTab';

/* 원자료: OTTO FRANCK 품질개선 보고_COSMO 20260827.pdf — 「COSMO 품질개선 보고」 2026-08-27, 16쪽.
 * 아래 수치는 전부 PDF 원문 하드코딩이다. 계약이 원문에서 멀어지면 여기서 깨진다. */

describe('cosmo 품질개선 보고 데이터 계약', () => {
  it('출처 메타가 원본 파일을 가리킨다', () => {
    expect(q.source.file).toBe('OTTO FRANCK 품질개선 보고_COSMO 20260827.pdf');
    expect(q.source.reportDate).toBe('2026-08-27');
    expect(q.source.pages).toBe(16);
    expect(q.source.sha256).toBe(
      '88a0828eb624d26f273c8028b961b3f0391205ab6e1dc73020457b2e81fe7b46',
    );
  });

  it('클레임 접수 내역 4건이 접수일 오름차순으로 원문과 일치한다', () => {
    expect(q.claims).toHaveLength(4);
    expect(q.claims.map((c) => c.receivedAt)).toEqual([
      '2025-06-02', '2025-11-13', '2026-06-25', '2026-08-06',
    ]);
    // 마지막 건만 제조일자가 둘이다
    expect(q.claims.map((c) => c.producedAt.length)).toEqual([1, 1, 1, 2]);
    expect(q.claims[3].producedAt).toEqual(['2026-04-09', '2026-05-07']);
    // 4건 모두 같은 제품이다 — 특정 SKU 에 몰려 있다는 것이 이 표의 요지
    expect(new Set(q.claims.map((c) => c.product)).size).toBe(1);
    expect(q.claims[2].defects).toContain('염도 높음');
  });

  it('접수 공문 날짜와 불량 유형 3종이 원문과 일치한다', () => {
    expect(q.trigger.date).toBe('2026-08-14');
    expect(q.trigger.buyer).toBe('OTTO FRANCK');
    expect(q.defects).toHaveLength(3);
  });

  it('클리너 인원과 생산성 표가 원문 증감과 맞아떨어진다', () => {
    expect(q.cleaners.rows.map((r) => [r.year, r.count])).toEqual([
      [2024, 790], [2025, 713], [2026, 603],
    ]);
    // 원문 「26년 대비 증감」 +187 / +110 은 2026년 대비 차이다
    const y26 = q.cleaners.rows[2].count;
    expect(q.cleaners.rows[0].count - y26).toBe(187);
    expect(q.cleaners.rows[1].count - y26).toBe(110);

    expect(q.productivity.rows.map((r) => r.kgPerManHour)).toEqual([23.2, 25.5, 26.4]);
    expect(q.productivity.rows.map((r) => r.headcount)).toEqual([717, 714, 566]);
    // 전년비 증가율은 원문 인쇄값이며 kg/m.hr 로 재계산해도 같은 자리에서 맞는다
    expect(q.productivity.rows[1].yoy).toBeCloseTo(25.5 / 23.2 - 1, 3);
    expect(q.productivity.rows[2].yoy).toBeCloseTo(26.4 / 25.5 - 1, 3);
    // 두 표는 기준 월이 다르다 — 섞어 쓰면 안 된다
    expect(q.cleaners.basis).not.toBe(q.productivity.basis);
  });

  it('냉동창고 견적과 온도 회복 기록이 원문 합계와 맞는다', () => {
    const sum = q.freezer.quote.items.reduce((a, i) => a + i.qty * i.unitKrw, 0);
    expect(sum).toBe(141_000_000);
    expect(sum).toBe(q.freezer.quote.totalKrw);
    expect(q.freezer.recovery.map((r) => r.tempC)).toEqual([-5, -10, -15, -18]);
    // 소요일수는 직전 기록일과의 실제 간격과 같아야 한다
    const days = (a: string, b: string) =>
      Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
    q.freezer.recovery.slice(1).forEach((r, i) => {
      expect(r.elapsedDays).toBe(days(q.freezer.recovery[i].date, r.date));
    });
  });

  it('공정별 대책과 실행 계획이 원문 건수만큼 있고 개인 이름을 담지 않는다', () => {
    expect(q.processStages.length).toBeGreaterThanOrEqual(9);
    expect(q.actions).toHaveLength(9);
    // 원문에 등장하는 개인 이름은 저장소에 남기지 않는다 — 직책으로만 적는다
    const blob = JSON.stringify(q);
    for (const name of ['Dave', 'Clement', 'Bright', '석창균']) {
      expect(blob).not.toContain(name);
    }
  });
});

describe('생산 보드 품질 섹션 노출', () => {
  it('OTTO FRANCK 클레임과 개선 대책이 렌더된다', () => {
    const markup = renderToStaticMarkup(React.createElement(ProductionTab));
    expect(markup).toContain('OTTO FRANCK');
    expect(markup).toContain('2026.08.14');   // 공문 접수일
    expect(markup).toContain('603');          // 2026년 클리너 수
    expect(markup).toContain('141');          // 콘덴서 1기 견적 (백만원)
    expect(markup).toContain('클리닝 부적합');
    expect(markup).not.toContain('Dave');
  });
});
