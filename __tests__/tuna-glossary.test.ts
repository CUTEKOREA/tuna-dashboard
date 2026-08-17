/**
 * 용어 사전과 어종 자원상태 가드.
 *
 * 이 자료는 Atuna 참조 페이지에서 뽑은 **용어·분류**다. 수치는 여기서 가져오지 않는다 —
 * 원문이 출처를 FAO FishStat 이라고 스스로 밝히고 이 저장소가 그 원본을 직접 집계하므로,
 * 재인용하면 한 다리 건넌 값이 된다.
 *
 * 자원상태는 **평가 시점이 있는 판정**이다. 연도가 빠지면 오늘 상태로 읽히므로 검사한다.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TunaIndustryDashboard, {
  CATCH_CHART_SLOTS,
} from '../components/market-understanding/TunaIndustryDashboard';
import { getTunaGlossary } from '../lib/data/tuna-industry';
import { ALL_NARRATIVES } from '../lib/tuna-industry-content';

const data = getTunaGlossary();

describe('용어 사전 — 데이터', () => {
  it('약어가 충분히 있고 중복되지 않는다', () => {
    expect(data.약어.length).toBeGreaterThanOrEqual(100);
    const keys = data.약어.map((r) => r.약어);
    expect(new Set(keys).size).toBe(keys.length);
    for (const row of data.약어) {
      expect(row.약어).not.toBe('');
      expect(row.영문).not.toBe('');
    }
  });

  it('자주 쓰는 약어에는 한글이 붙어 있다', () => {
    // 화면 라벨이 영문으로 흐르는 것을 막는 것이 이 사전의 목적이다(L-01)
    const ko = Object.fromEntries(data.약어.map((r) => [r.약어, r.한글]));
    for (const key of ['SKJ', 'YFT', 'BET', 'WCPFC', 'IATTC', 'IOTC', 'ICCAT', 'FAD', 'IUU']) {
      expect(ko[key], `${key} 에 한글이 없다`).toBeTruthy();
    }
  });

  it('어종 프로필의 이름이 한글이다', () => {
    expect(data.어종프로필.length).toBeGreaterThanOrEqual(6);
    for (const p of data.어종프로필) {
      expect(p.어종, `${p.원문명} 이 한글로 안 옮겨졌다`).toMatch(/[가-힣]/);
      expect(p.원문명).not.toBe('');
    }
  });
});

describe('자원상태 — 평가에는 시점이 있다', () => {
  it('행마다 평가연도가 있다', () => {
    expect(data.자원상태.length).toBeGreaterThanOrEqual(20);
    for (const row of data.자원상태) {
      expect(row.평가연도, `${row.어종}/${row.해역} 에 평가연도가 없다`).toMatch(/^\d{4}$/);
      expect(row.어종).toMatch(/[가-힣]/);
      expect(row.해역).toMatch(/[가-힣]/);
      expect(row.상태).toMatch(/[가-힣]/);
    }
  });

  it('평가연도가 오래됐다는 사실이 본문에 적혀 있다', () => {
    const s01 = ALL_NARRATIVES.find((n) => n.key === 's01');
    const text = [s01!.lede, ...s01!.paragraphs].join('\n');
    expect(text).toContain('평가에는 시점이 있다');
    expect(text).toContain('오늘 상태가 아니라');
  });

  it('수치를 이 자료에서 가져오지 않았다고 적혀 있다', () => {
    expect(String(data._meta.수치제외)).toContain('FAO FishStat');
  });
});

describe('인증·식품안전 — 성격을 섞지 않았나', () => {
  it('인증은 층위가 구분돼 있다', () => {
    const rows = data.인증.rows;
    expect(rows.length).toBeGreaterThanOrEqual(6);
    const kinds = new Set(rows.map((r) => r.구분));
    expect(kinds.size).toBeGreaterThanOrEqual(3);
    for (const r of rows) {
      expect(r.이름).toMatch(/[가-힣]/);
      expect(r.무엇.length).toBeGreaterThan(10);
    }
    expect(data.인증.사회책임항목.length).toBe(8);
  });

  it('식품안전은 규제와 관측을 갈라 놓았다', () => {
    // 평균 함량을 허용 상한으로 오해하는 것이 이 표의 가장 큰 위험이다
    const rows = data.식품안전.rows;
    const kinds = new Set(rows.map((r) => r.구분));
    expect(kinds.has('규제')).toBe(true);
    expect(kinds.has('관측')).toBe(true);
    for (const r of rows) {
      expect(r.구분, `${r.항목} 의 구분이 비었다`).not.toBe('');
      expect(r.값).not.toBe('');
    }
    expect(String(data.식품안전._meta.주의)).toContain('2차 인용');
  });

  it('수은 평균과 상한이 서로 다른 구분으로 들어 있다', () => {
    const hg = data.식품안전.rows.filter((r) => r.항목 === '수은');
    const avg = hg.find((r) => r.값.includes('0.391'));
    const cap = hg.find((r) => r.값.includes('1.0 ppm'));
    expect(avg!.구분).toBe('관측');
    expect(cap!.구분).toBe('규제');
  });
});

describe('화면 노출', () => {
  it('자원상태 표가 01단계에 있다', () => {
    const titles = Object.values(CATCH_CHART_SLOTS).flat().map((s) => s.title);
    expect(titles).toContain('어종별 계군 상태 (기구 평가)');
    const slot = CATCH_CHART_SLOTS.s01.find((s) => s.title === '어종별 계군 상태 (기구 평가)');
    expect(slot!.telemetry.syncDate).toContain('2022');
    expect(() =>
      renderToStaticMarkup(React.createElement(React.Fragment, null, slot!.render())),
    ).not.toThrow();
  });

  it('용어 사전이 페이지에 렌더된다', () => {
    const html = renderToStaticMarkup(React.createElement(TunaIndustryDashboard));
    expect(html).toContain('용어 사전');
    // 한글이 붙은 약어가 실제로 화면에 나오는지
    expect(html).toContain('중서부태평양수산위원회');
    expect(html).toContain('집어장치');
  });

  it('인증표와 식품안전표가 각 단계에 있다', () => {
    const titles = Object.values(CATCH_CHART_SLOTS).flat().map((s) => s.title);
    expect(titles).toContain('가공장이 통과해야 하는 인증 (제도 분류)');
    expect(titles).toContain('식품안전 기준과 실제 함량');
    for (const t of ['가공장이 통과해야 하는 인증 (제도 분류)', '식품안전 기준과 실제 함량']) {
      const slot = Object.values(CATCH_CHART_SLOTS).flat().find((s) => s.title === t);
      expect(() =>
        renderToStaticMarkup(React.createElement(React.Fragment, null, slot!.render())),
      ).not.toThrow();
    }
  });
});
