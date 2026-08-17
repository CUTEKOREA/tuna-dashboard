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

  it('낡은 어획 비중을 담지 않았다', () => {
    // 참조 자료는 가다랑어 58%·눈다랑어 8% 로 적는데 우리 FAO 2024 집계는 60.52%·5.58% 다.
    // 수치는 우리 집계를 쓰므로 이 필드를 들이면 같은 화면에 두 값이 뜬다.
    for (const p of data.어종프로필) {
      expect(p, `${p.어종} 에 낡은 비중이 들어왔다`).not.toHaveProperty('참치 어획 중 비중');
    }
  });

  it('어종 이름이 저장소 FAO 집계와 맞물린다', () => {
    // 참조 자료의 「Northern Bluefin」은 옛 이름이다. 이름이 어긋나면 카드에 수치가 안 붙는다
    const names = data.어종프로필.map((p) => p.어종);
    for (const n of ['가다랑어', '황다랑어', '눈다랑어', '날개다랑어', '대서양참다랑어']) {
      expect(names, `${n} 이 없다 — 이름 대조표를 확인하라`).toContain(n);
    }
    expect(names).not.toContain('북방참다랑어');
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

describe('출처 성격을 밝혔나', () => {
  it('셀레늄 지표에 해석 주의가 붙어 있다', () => {
    // 같은 자료에 업계 매체의 재해석이 실려 있다. 지표값과 해석을 나눠 읽어야 한다
    const sel = data.식품안전.rows.filter((r) => r.항목 === '셀레늄');
    expect(sel.length).toBeGreaterThanOrEqual(3);
    const caveat = sel.find((r) => r.구분 === '해석 주의');
    expect(caveat, '셀레늄에 해석 주의 행이 없다').toBeDefined();
    expect(caveat!.설명).toContain('합의된 결론이 아니');
  });

  it('본문이 지표와 해석을 갈라 적었다', () => {
    const s07 = ALL_NARRATIVES.find((n) => n.key === 's07');
    const text = [s07!.lede, ...s07!.paragraphs].join('\n');
    expect(text).toContain('건강편익값');
    expect(text).toContain('학계에서 합의된 결론이 아니');
  });

  it('업계가 만든 기구라는 사실을 밝혔다', () => {
    // 이 페이지의 선단 수치 출처가 업계 연합이라는 점을 숨기지 않는다
    const x02 = ALL_NARRATIVES.find((n) => n.key === 'x02');
    const text = [x02!.lede, ...x02!.paragraphs].join('\n');
    expect(text).toContain('업계 기업과 과학자');
    expect(text).toContain('누가 세었는지');
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
    expect(titles).toContain('어종 카드 — 무엇이 어떻게 쓰이는가');
    for (const t of ['가공장이 통과해야 하는 인증 (제도 분류)', '식품안전 기준과 실제 함량']) {
      const slot = Object.values(CATCH_CHART_SLOTS).flat().find((s) => s.title === t);
      expect(() =>
        renderToStaticMarkup(React.createElement(React.Fragment, null, slot!.render())),
      ).not.toThrow();
    }
  });
});
