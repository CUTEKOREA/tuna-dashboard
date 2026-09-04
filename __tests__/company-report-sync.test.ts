/**
 * 보고서 사본·추출 동기화 가드.
 *
 * 발행본이 두 벌(Drive 원본 · docs/evidence 사본)인데 한쪽만 고친 세션들이 있었다.
 * 그 결과 라이브가 **틀린 사실을 서비스**했다 — Thai Union 인수 연표(King Oscar 2010 ↔ 2014-11),
 * FCF 판결(「선고되지 않았다」 ↔ 실제 선고·무죄). Drive 는 이 저장소 밖이라 테스트가 못 보므로,
 * 여기서는 **저장소 안에서 지킬 수 있는 것**만 지킨다.
 */
import { describe, expect, it } from 'vitest';

import { REPORT_TABLE_COMPANIES, reportTables } from '@/lib/data/company-report-tables';
import { reportProse } from '@/lib/data/company-report-prose';
import { thaiUnionBrands } from '@/lib/data/company-thaiunion';

describe('같은 사실을 두 곳에 적지 않는다', () => {
  it('브랜드 인수 연도를 손코딩 데이터가 들고 있지 않다', () => {
    // 들고 있으면 보고서를 정정해도 화면이 안 따라온다. 실제로 그렇게 틀린 날짜가 나갔다.
    for (const b of thaiUnionBrands) {
      expect(Object.keys(b), b.브랜드).not.toContain('인수');
    }
  });

  it('인수 연표는 보고서 표에서 온다', () => {
    const t = reportTables('thaiunion').find((x) => x.head.includes('브랜드') && x.head.some((h) => h.includes('본거지')));
    expect(t, '보고서 인수 표가 추출되지 않았다').toBeTruthy();
    const flat = JSON.stringify(t);
    expect(flat).toContain('2014-11');   // King Oscar — 2010 이 아니다
    expect(flat).toContain('2016·2021'); // Rügen Fisch · Hawesta
  });
});

describe('추출이 본문을 흘리지 않는다', () => {
  it.each(REPORT_TABLE_COMPANIES)('%s - 절마다 서술 블록이 있다', (c) => {
    for (const sec of reportProse(c)) {
      expect(sec.blocks.length, `${c} ${sec.sid} 빈 절`).toBeGreaterThan(0);
    }
  });

  it('전 편 합계 서술이 15만 자를 밑돌지 않는다', () => {
    // 표 제거 정규식이 중첩 div 를 못 세 FCF 06절에서 5,621자를 삼킨 적이 있다.
    // 목록·인용·부록을 놓쳐 JAIS 는 62%만 화면에 왔다. 하한선으로 막는다.
    const n = REPORT_TABLE_COMPANIES.reduce(
      (a, c) => a + reportProse(c).reduce(
        (b, s) => b + s.blocks.reduce((t, x) => t + x.text.length + (x.title?.length ?? 0), 0), 0), 0);
    expect(n).toBeGreaterThanOrEqual(150_000);
  });

  it('부록 절이 버려지지 않는다', () => {
    // FCF·JAIS 의 「자료의 한계」·「자료 출처」가 단계 매핑 없이 통째로 빠져 있었다.
    for (const c of ['fcf', 'jais']) {
      const ids = reportProse(c).map((s) => s.sid);
      expect(ids, `${c} 부록`).toContain('sa');
      expect(ids, `${c} 부록`).toContain('sb');
    }
  });
});
