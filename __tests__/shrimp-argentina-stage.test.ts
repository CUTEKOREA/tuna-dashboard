import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SHRIMP_CHART_SLOTS } from '@/components/market-understanding/ShrimpIndustryDashboard';
import {
  SHRIMP_BRIEFING_POINTS,
  SHRIMP_NARRATIVES,
  SHRIMP_SOURCE_NOTES,
} from '@/lib/shrimp-industry-content';
import {
  argentinaCatch,
  argentinaKoreaImports,
  argentinaMeta,
  argentinaRoutes,
  argentinaShare,
  KOREA_AVG_UNIT_PRICE,
  PROCESSOR_TAB_MATCH,
} from '@/lib/data/shrimp-argentina';

const ROOT = join(__dirname, '..');
const STAGE = SHRIMP_NARRATIVES.find((n) => n.key === 's05');

describe('새우 05단계 — 아르헨티나', () => {
  it('단계가 04와 바스켓 사이에 놓인다', () => {
    const keys = SHRIMP_NARRATIVES.map((n) => n.key);
    expect(keys).toEqual(['s01', 's02', 's03', 's04', 's05', 's06', 'x01']);
  });

  it('브리핑에 이 단계 항목이 있다', () => {
    expect(SHRIMP_BRIEFING_POINTS.some((b) => b.stage === 's05')).toBe(true);
  });

  /**
   * 이 페이지의 다른 단계는 FAO 생산 통계다. 05만 통관·수출 기준이라 더할 수 없다.
   * 경계를 본문에서 지우면 읽는 사람이 자연스럽게 더한다 — 그래서 테스트로 잡는다.
   */
  it('측정 경계를 본문 첫 문단과 출처 각주 양쪽에서 밝힌다', () => {
    expect(STAGE?.paragraphs[0]).toMatch(/더할 수 없다/);
    expect(SHRIMP_SOURCE_NOTES.some((n) => n.includes('05단계'))).toBe(true);
    // 문구가 아니라 뜻을 잡는다. 문장을 다듬을 때마다 테스트가 깨지면 테스트를 고치게 되고,
    // 그러다 보면 경계 자체가 사라져도 통과한다.
    expect(argentinaMeta.measurementBoundary).toMatch(/더하거나 견줄 수 없다/);
    expect(argentinaMeta.measurementBoundary).toMatch(/종별 코드가 아니라/);
  });

  /** HS 030617 은 종별 코드가 아니다. 이 한정을 지우면 화면이 «전부 홍새우»라고 말하게 된다. */
  it('HS 030617 이 종을 증명하지 못한다는 한정을 본문과 각주에서 밝힌다', () => {
    expect(STAGE?.paragraphs.join(' ')).toMatch(/종별 코드가 아니다/);
    expect(SHRIMP_SOURCE_NOTES.some((n) => n.includes('Pleoticus muelleri'))).toBe(true);
  });

  /** 보고서보다 강하게 단정하지 않는다. 원문은 «어렵다»이지 «불가능하다»가 아니다. */
  it('보고서의 완곡한 표현을 단정으로 바꾸지 않는다', () => {
    const body = STAGE?.paragraphs.join(' ') ?? '';
    expect(body).not.toMatch(/약속받을 수 있는 산지가 아니다/);
    expect(body).not.toMatch(/반복 거래가 안 된다/);
    expect(body).toMatch(/선뜻 약속받기 어려운/);
  });

  it('공개 조회행이 물량이 아니라는 단서를 데이터가 들고 있다', () => {
    expect(argentinaMeta.recordCaveat).toMatch(/물량이 아니라/);
  });

  /** 베트남 0건은 「없다」가 아니라 「확인되지 않았다」이다. 둘을 섞으면 사실이 뒤집힌다. */
  it('베트남은 0건이지만 부재가 아니라 미입증으로 표기된다', () => {
    const vn = argentinaRoutes.find((r) => r.국가 === '베트남');
    expect(vn?.건수).toBe(0);
    expect(vn?.검증).toBe('미입증');
    expect(STAGE?.paragraphs.join(' ')).toMatch(/입증되지 않았다는 뜻/);
  });

  it('아르헨티나 몫이 보고서의 3.65%·5.74%와 맞는다', () => {
    const s = argentinaShare();
    expect(s).not.toBeNull();
    expect(s!.물량비중).toBeCloseTo(3.65, 1);
    expect(s!.금액비중).toBeCloseTo(5.74, 1);
    expect(s!.단가).toBeGreaterThan(KOREA_AVG_UNIT_PRICE);
  });

  it('어획 계열은 출처가 섞여 있고 그 구분이 데이터에 남아 있다', () => {
    const kinds = new Set(argentinaCatch.map((r) => r.구분));
    expect(kinds).toEqual(new Set(['FAO 어획', '정부 양륙']));
  });

  it('한국 수입표는 물량 내림차순이다', () => {
    const qty = argentinaKoreaImports.map((r) => r.물량);
    expect([...qty].sort((a, b) => b - a)).toEqual(qty);
  });

  /**
   * 교차링크가 가리키는 회사가 실제로 가공사 조사 데이터에 있어야 한다.
   * 표기가 달라(THAI UNION SEAFOOD / GROUP) 이름이 어긋나면 링크가 거짓말이 된다.
   */
  it('방콕 가공사 탭 대응표의 회사가 그 데이터에 실재한다', () => {
    const raw = readFileSync(
      join(ROOT, 'public/data/bangkok/seasia_processors.json'),
      'utf8',
    );
    const doc = JSON.parse(raw) as {
      countries: Record<string, { profiles: Record<string, { v?: string }>[] }>;
    };
    const names = new Set<string>();
    for (const rep of Object.values(doc.countries)) {
      for (const row of rep.profiles) {
        const v = (row['회사/등기'] ?? row['회사/세번·DL'])?.v;
        if (v) names.add(v.trim());
      }
    }
    for (const target of Object.values(PROCESSOR_TAB_MATCH)) {
      expect(names.has(target), `가공사 조사에 없는 회사: ${target}`).toBe(true);
    }
  });

  it('보고서 근거가 저장소에 남아 있다', () => {
    for (const f of ['korea_2026-08-11.md', 'asean_2026-08-12.md']) {
      const p = join(ROOT, 'docs/evidence/shrimp-argentina-2026-08', f);
      expect(readFileSync(p, 'utf8').length).toBeGreaterThan(10_000);
    }
  });

  /**
   * 화면을 눈으로 못 여는 환경이 있다(로컬 인증 게이트). 그래서 «사람이 읽을 값이
   * 실제로 마크업에 나오는가»를 렌더해서 본다. 차트가 크래시 없이 그려지는지는
   * commodity-industry-render 가 이미 전 단계·전 차트로 검사한다.
   */
  it('s05 슬롯이 사람이 읽을 수치를 실제로 그려낸다', () => {
    const slots = SHRIMP_CHART_SLOTS.s05;
    expect(slots).toBeTruthy();
    expect(slots.length).toBe(4);

    const html = slots
      .map((s) => renderToStaticMarkup(React.createElement(React.Fragment, null, s.render())))
      .join('');

    // 표는 서버 렌더에서 값이 그대로 나온다. 차트는 클라이언트 측정이 필요해 비어 있을 수 있다.
    for (const probe of ['KF Foods', 'PT. Mega Marine Pride', '베트남', '155건', '방콕사무소']) {
      expect(html, `마크업에 없음: ${probe}`).toContain(probe);
    }
    // 「없다」와 「확인되지 않았다」를 섞지 않는다.
    expect(html).toContain('이 자료에서 확인 없음');
  });

  it('슬롯 캡션이 통관 기준임을 밝힌다', () => {
    const caps = SHRIMP_CHART_SLOTS.s05.map((s) => s.caption).join(' ');
    expect(caps).toMatch(/통관 신고 기준/);
    expect(caps).toMatch(/수입량이 아니다/);
  });
});
