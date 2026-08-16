import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TunaIndustryDashboard from '../components/market-understanding/TunaIndustryDashboard';
import {
  getChainStages,
  getCrossStages,
  getTunaCatchData,
  getTunaIndustryStages,
} from '../lib/data/tuna-industry';
import { ALL_NARRATIVES, CHAIN_NARRATIVES, CROSS_NARRATIVES } from '../lib/tuna-industry-content';

describe('시장 이해 > 참치 — 데이터 인테이크', () => {
  it('FishStat 집계가 주요 상업어종 7종을 담고 합계가 어종 합과 맞는다', () => {
    const data = getTunaCatchData();

    expect(data.어종구성).toHaveLength(7);
    expect(data._meta.기준연도).toBe(data.요약.기준연도);

    const speciesSum = data.어종구성.reduce((total, row) => total + row.어획량, 0);
    // 반올림 오차만 허용한다. 어긋나면 집계 스크립트가 잘못 돈 것이다.
    expect(Math.abs(speciesSum - data.요약.세계어획량)).toBeLessThanOrEqual(7);

    const shareSum = data.어종구성.reduce((total, row) => total + row.비중, 0);
    expect(Math.abs(shareSum - 100)).toBeLessThan(0.5);
  });

  it('해역·관할 집계가 세계 합계와 일치한다', () => {
    const data = getTunaCatchData();

    const areaSum = data.해역순위.reduce((total, row) => total + row.어획량, 0);
    expect(Math.abs(areaSum - data.요약.세계어획량)).toBeLessThanOrEqual(20);

    const rfmoSum = data.관할별.reduce((total, row) => total + row.어획량, 0);
    expect(Math.abs(rfmoSum - data.요약.세계어획량)).toBeLessThanOrEqual(20);

    // 관할이 '미분류'로 새는 해역이 있으면 AREA_META 매핑이 빠진 것이다.
    expect(data.해역순위.every((row) => row.관할 !== '미분류')).toBe(true);
  });

  it('국가·어종 라벨이 100% 한글이다 (L-01)', () => {
    const data = getTunaCatchData();
    const koreanOnly = /^[가-힣·\s]+$/;

    for (const row of data.국가순위) {
      expect(row.국가, `국가명이 한글이 아니다: ${row.국가}`).toMatch(koreanOnly);
    }
    for (const row of data.어종구성) {
      expect(row.어종, `어종명이 한글이 아니다: ${row.어종}`).toMatch(koreanOnly);
    }
  });

  it('선별 위젯이 10개 단계로 나뉘고 전부 SYNCED 로 표기된다 (L-09)', () => {
    const stages = getTunaIndustryStages();

    expect(stages).toHaveLength(10);
    expect(getChainStages()).toHaveLength(7);
    expect(getCrossStages()).toHaveLength(3);

    for (const stage of stages) {
      expect(stage.widgets.length).toBeGreaterThan(0);
      for (const widget of stage.widgets) {
        // 정적 재사용이므로 LIVE 가 남아 있으면 안 된다.
        expect(widget.telemetry).toBe('SYNCED');
        expect(widget.data.length).toBeGreaterThan(0);
        // 결론 선언형 제목의 대괄호 태그가 남아 있으면 큐레이션이 빠진 것이다.
        expect(widget.title.startsWith('[')).toBe(false);
      }
    }
  });

  it('시리즈 스키마가 정규화돼 있다 — key 누락·중복이 없다', () => {
    // 원본 93위젯은 `dataKey`+`stroke` 세대와 `key`+`color` 세대가 섞여 있다.
    // 큐레이션에서 정규화하지 않으면 렌더러가 같은 key(undefined)를 반복 받아
    // React 가 "unique key prop" 경고를 내고 시리즈가 겹쳐 그려진다.
    for (const stage of getTunaIndustryStages()) {
      for (const widget of stage.widgets) {
        const keys = [
          ...(widget.lines ?? []),
          ...(widget.bars ?? []),
          ...(widget.areas ?? []),
        ].map((series) => series.key);

        for (const key of keys) {
          expect(key, `${widget.id}: 시리즈 key 가 비어 있다`).toBeTruthy();
        }
        expect(new Set(keys).size, `${widget.id}: 시리즈 key 가 중복된다`).toBe(keys.length);

        // x축 키가 데이터 행에 실재해야 차트가 라벨을 찾는다.
        const firstRow = widget.data[0];
        if (widget.xKey && firstRow) {
          expect(
            Object.prototype.hasOwnProperty.call(firstRow, widget.xKey),
            `${widget.id}: xKey "${widget.xKey}" 가 데이터 행에 없다`,
          ).toBe(true);
        }
      }
    }
  });

  it('모든 단계에 서술이 짝지어져 있다', () => {
    const stageKeys = getTunaIndustryStages().map((stage) => stage.key);
    const narrativeKeys = ALL_NARRATIVES.map((entry) => entry.key);

    expect(new Set(narrativeKeys)).toEqual(new Set(stageKeys));
    expect(CHAIN_NARRATIVES).toHaveLength(7);
    expect(CROSS_NARRATIVES).toHaveLength(3);

    for (const narrative of ALL_NARRATIVES) {
      expect(narrative.paragraphs.length).toBeGreaterThanOrEqual(3);
      expect(narrative.facts.length).toBeGreaterThanOrEqual(3);
      // 인용한 수치에는 예외 없이 출처와 기준 시점이 붙어야 한다.
      for (const fact of narrative.facts) {
        expect(fact.source.length).toBeGreaterThan(0);
        expect(fact.asOf.length).toBeGreaterThan(0);
        expect(['A', 'B', 'C']).toContain(fact.grade);
      }
    }
  });
});

describe('시장 이해 > 참치 — 렌더', () => {
  it('첫 단계와 30초 브리핑, 분기도, 출처 고지를 함께 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(TunaIndustryDashboard));

    expect(markup).toContain('참치 산업 해부');
    expect(markup).toContain('30초 브리핑');
    expect(markup).toContain('참치 밸류체인 분기도');
    expect(markup).toContain('출처와 한계');

    // 분기도의 두 경로가 모두 그려져야 한다 — 이 페이지의 핵심 주장이다.
    expect(markup).toContain('통조림 경로');
    expect(markup).toContain('사시미 경로');
    expect(markup).toContain('선망');
    expect(markup).toContain('연승');

    // 기본 활성 단계는 01 자원과 해역이다.
    expect(markup).toContain('자원과 해역');
    expect(markup).toContain('참치가 사는 바다는 누구의 관할인가');
  });

  it('heroOnly 는 히어로만 렌더하고 본문은 내지 않는다', () => {
    const markup = renderToStaticMarkup(
      React.createElement(TunaIndustryDashboard, { heroOnly: true }),
    );

    expect(markup).toContain('참치 산업 해부');
    expect(markup).not.toContain('30초 브리핑');
    expect(markup).not.toContain('출처와 한계');
  });

  it('히어로가 단위를 괄호로 병기한다 (W-02)', () => {
    const markup = renderToStaticMarkup(
      React.createElement(TunaIndustryDashboard, { heroOnly: true }),
    );

    expect(markup).toContain('(톤)');
    expect(markup).toContain('세계 주요 상업 참치 어획량');
  });
});
