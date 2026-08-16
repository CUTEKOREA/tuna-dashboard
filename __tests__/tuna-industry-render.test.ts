import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TunaIndustryDashboard, {
  CATCH_CHART_SLOTS,
} from '../components/market-understanding/TunaIndustryDashboard';
import {
  getChainStages,
  getCrossStages,
  getSkjPriceTimeline,
  getTunaCatchData,
  getTunaIndustryStages,
  getTunaTradeData,
  SKJ_HUBS,
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

  it('차트에 노출되는 문자열이 한글이다 — 약어·단위·고유명사만 예외 (L-01)', () => {
    // 원본 93위젯 중 일부는 시리즈 name 이 비어 있어 렌더러가 영문 dataKey 를 그대로
    // 범례에 노출한다. 큐레이션이 한글 표시명을 주지 않으면 화면에 영문이 남는다.
    // 축 라벨(데이터 셀)도 같은 이유로 검사한다.
    // 낱말 단위로 쪼갠다. "USD/kg" 는 통화와 단위 두 낱말이지 영문 문구가 아니다.
    const allowed = new Set([
      // 통화·단위
      'USD', 'EUR', 'JPY', 'KRW', 'MT', 'kg', 't', 'm', 'km', 'min', 'ton',
      // 기관·지표 약어
      'RFMO', 'WCPFC', 'IATTC', 'IOTC', 'ICCAT', 'CCSBT', 'ISSF', 'FAO', 'FFA',
      'EUMOFA', 'KOSIS', 'TTIA', 'ANFACO', 'NOAA', 'PNA', 'VDS', 'MSC', 'MMPA',
      'ATQ', 'CFR', 'EU', 'US', 'UN', 'HS', 'HSK', 'MGO', 'CPUE', 'EMS', 'FAD',
      'SG', 'A', 'GPM', 'TU', 'WCPO', 'EPO', 'WPO', 'IO', 'CAPEX', 'OPEX', 'YTD', 'CFP',
      // 자원 지표
      'F', 'FMSY', 'MSY', 'SSB', 'TRO', 'TAC',
      // 고유명사
      'Comtrade', 'Atuna',
    ]);
    const englishTokens = (text: string) =>
      (text.match(/[A-Za-z]+/g) ?? []).filter((token) => !allowed.has(token));

    const offenders: string[] = [];
    for (const stage of getTunaIndustryStages()) {
      for (const widget of stage.widgets) {
        const surfaces: string[] = [widget.title];
        for (const series of [...(widget.lines ?? []), ...(widget.bars ?? []), ...(widget.areas ?? [])]) {
          surfaces.push(series.name);
        }
        for (const row of widget.data) {
          for (const value of Object.values(row)) {
            if (typeof value === 'string') surfaces.push(value);
          }
        }
        for (const surface of surfaces) {
          const tokens = englishTokens(surface);
          if (tokens.length > 0) offenders.push(`${widget.id}: "${surface}" → ${tokens.join(', ')}`);
        }
      }
    }

    expect(offenders, `한글화가 빠진 노출 문자열:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('모든 위젯이 현황·실행지침과 카드 설명을 갖췄다 (W-04)', () => {
    // 셋 중 하나라도 비면 카드가 반쪽이 된다. 격자가 카드를 같은 행 높이로 늘리던 시절에는
    // 그 반쪽 카드 아래가 통째로 비어 보였다 — 2026-08 사용자 지적으로 드러난 결함이다.
    const offenders: string[] = [];
    for (const stage of getTunaIndustryStages()) {
      for (const widget of stage.widgets) {
        if (!widget.situation?.trim()) offenders.push(`${widget.id}: 현황(SIT) 없음`);
        if (!widget.takeaway?.trim()) offenders.push(`${widget.id}: 실행지침(TAK) 없음`);
        // cardDesc 는 methodology 또는 source 에서 온다. 둘 다 없으면 출처 없는 위젯이다.
        if (!widget.methodology?.trim() && !widget.source?.trim()) {
          offenders.push(`${widget.id}: 방법론·출처 둘 다 없음`);
        }
      }
    }
    expect(offenders, `반쪽 카드:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('집계 기준연도가 FAO 현재 릴리스만큼 최신이다', () => {
    // 2026-08 감사에서 드러난 실수: 사전필터 추출본을 쓰는 바람에 어획 집계가 2022년에
    // 멈춰 있었다. FAO 어획통계의 현재 기준연도는 2024년이다(2026-03 릴리스).
    // 다음에 원본이 낡으면 빌드 스크립트가 막지만, 이미 커밋된 산출물은 이 테스트가 잡는다.
    const data = getTunaCatchData();
    expect(
      data.요약.기준연도,
      'FAO 어획통계 기준연도가 2024년보다 낮다 — 낡은 추출본으로 집계했을 가능성',
    ).toBeGreaterThanOrEqual(2024);

    // 참다랑어 축양 계열도 같은 릴리스에서 나와야 한다.
    const bluefin = data.참다랑어자연산대축양;
    expect(bluefin.length).toBeGreaterThan(0);
    expect(Number(bluefin[bluefin.length - 1].연도)).toBeGreaterThanOrEqual(2024);

    // 가격 시계열은 월 단위라 더 최신이어야 한다.
    const prices = getSkjPriceTimeline();
    const lastMonth = String(prices.points[prices.points.length - 1].월);
    expect(lastMonth >= '2026-06', `가격 시계열이 ${lastMonth} 에서 멈췄다`).toBe(true);
  });

  it('위젯마다 데이터 기준연도가 붙어 화면에서 연식을 알 수 있다', () => {
    // 원본 기관의 공표 주기가 달라 위젯끼리 기준연도가 어긋나는 것은 어쩔 수 없다.
    // 다만 **낡은 줄 모르고 보는 것**은 막아야 한다.
    const stages = getTunaIndustryStages();
    const withYear = stages.flatMap((s) => s.widgets).filter((w) => typeof w.dataYear === 'number');
    const total = stages.flatMap((s) => s.widgets).length;
    expect(withYear.length / total, '연도를 못 뽑은 위젯이 너무 많다').toBeGreaterThan(0.8);
  });

  it('서술이 「」로 지목한 위젯이 그 단계에 실제로 있다', () => {
    // 서술은 "아래 「위젯 제목」이 …를 보여준다" 식으로 근거를 가리킨다.
    // 큐레이션에서 위젯을 옮기거나 제목을 바꾸면 그 지목이 허공을 가리키게 되는데,
    // 화면에서는 조용히 사라져 눈에 띄지 않는다. 여기서 잡는다.
    const stages = getTunaIndustryStages();
    const quoted = /「([^」]+)」/g;

    for (const narrative of ALL_NARRATIVES) {
      const stage = stages.find((entry) => entry.key === narrative.key);
      expect(stage, `${narrative.key} 단계가 없다`).toBeDefined();
      // 화면의 카드는 큐레이션 위젯 + 직접 그린 차트 슬롯 둘 다다. 양쪽을 다 인정한다.
      const titles = new Set([
        ...stage!.widgets.map((widget) => widget.title),
        ...(CATCH_CHART_SLOTS[narrative.key] ?? []).map((slot) => slot.title),
      ]);
      const text = [...narrative.paragraphs, narrative.lede].join('\n');

      for (const match of text.matchAll(quoted)) {
        expect(
          titles.has(match[1]),
          `${narrative.key}: 서술이 「${match[1]}」을 가리키는데 그 단계에 없다`,
        ).toBe(true);
      }
    }
  });

  it('본문이 인용한 FishStat 수치가 집계 결과와 글자 그대로 같다', () => {
    // 서술은 사람이 쓰고 집계는 스크립트가 만든다. 둘이 어긋나면 페이지가 거짓을 말한다.
    // 집계를 다시 돌렸을 때 본문만 옛 숫자로 남는 것이 이 페이지의 가장 위험한 회귀다.
    const data = getTunaCatchData();
    const summary = data.요약;
    const species = Object.fromEntries(data.어종구성.map((row) => [row.어종, row]));
    const bluefinShare = Number(
      (
        species['대서양참다랑어'].비중 +
        species['남방참다랑어'].비중 +
        species['태평양참다랑어'].비중
      ).toFixed(2),
    );

    const quoted = ALL_NARRATIVES.flatMap((entry) => [
      ...entry.paragraphs,
      entry.lede,
      ...entry.facts.map((fact) => `${fact.label} ${fact.value} ${fact.note ?? ''}`),
    ]).join('\n');

    // 백분율은 본문이 소수 둘째 자리까지 적고 집계는 뒤 0을 떨어뜨린다(47.4 대 47.40).
    // 표기 차이는 신선도 문제가 아니므로 숫자로 비교한다.
    const pct = (value: number) => [`${value}%`, `${value.toFixed(2)}%`];
    const containsAny = (candidates: string[]) => candidates.some((c) => quoted.includes(c));

    expect(quoted).toContain(`${summary.세계어획량.toLocaleString('en-US')} 톤`);
    expect(containsAny(pct(summary.최대해역비중 ?? 0)), '최대해역 비중이 본문과 다르다').toBe(true);
    expect(quoted).toContain(
      `${summary.한국어획량?.toLocaleString('en-US')} 톤 — 세계 ${summary.한국순위}위`,
    );
    for (const [name, row] of Object.entries(species)) {
      if (row.비중 < 1) continue; // 참다랑어 3종은 아래에서 합산으로 검사한다
      expect(
        containsAny(pct(row.비중)),
        `${name} 비중 ${row.비중}% 가 본문에 없다 — 집계를 다시 돌린 뒤 서술이 안 따라온 것이다`,
      ).toBe(true);
    }
    expect(containsAny(pct(bluefinShare)), '참다랑어 3종 합계 비중이 본문과 다르다').toBe(true);
  });

  it('본문이 인용한 교역 수치가 집계 결과와 글자 그대로 같다', () => {
    // 어획 쪽과 같은 이유다. 교역은 원본이 2023년에서 2024년으로 갈아끼워진 직후라
    // 서술만 옛 숫자로 남을 위험이 특히 크다.
    const trade = getTunaTradeData();
    const quoted = ALL_NARRATIVES.flatMap((entry) => [
      ...entry.paragraphs,
      entry.lede,
      ...entry.facts.map((fact) => `${fact.label} ${fact.value} ${fact.note ?? ''}`),
    ]).join('\n');

    const num = (value: number) => value.toLocaleString('en-US');

    // 품목군 단가 — 이 페이지의 교역 단계가 가르치려는 핵심 숫자다
    for (const group of trade.품목군구성) {
      expect(
        quoted.includes(num(group.단가)),
        `${group.구분} 단가 ${num(group.단가)} 가 본문에 없다 — 집계를 다시 돌린 뒤 서술이 안 따라온 것이다`,
      ).toBe(true);
    }

    // 한국 최신 연도 — 수출단가와 세계평균은 이 페이지의 결론 문장을 떠받친다
    const korea = trade.수출단가비교.at(-1);
    expect(korea).toBeDefined();
    expect(quoted).toContain(num(korea!.한국));
    expect(quoted).toContain(num(korea!.세계평균));

    // 기준연도가 밀렸는데 본문이 안 따라오면 여기서 걸린다
    expect(trade.요약.기준연도).toBeGreaterThanOrEqual(2024);
  });

  it('항구별 가격 시계열이 결측을 메우지 않고 격차를 옳게 잰다', () => {
    const timeline = getSkjPriceTimeline();

    expect(timeline.points.length).toBeGreaterThan(100);
    expect(SKJ_HUBS).toHaveLength(5);

    // 결측은 null 로 남아야 한다. 앞 값으로 메우면 없는 고시가를 있는 것처럼 그린다.
    const hasNull = timeline.points.some((point) =>
      SKJ_HUBS.some((hub) => point[hub.label] === null),
    );
    expect(hasNull).toBe(true);

    // 격차는 다섯 항구가 모두 고시된 달에서만 잰다 — 빠진 항구가 최고·최저였을 수 있다.
    const spread = timeline.latestSpread;
    expect(spread).not.toBeNull();
    if (spread) {
      const row = timeline.points.find((point) => point.월 === spread.month);
      expect(row).toBeDefined();
      const prices = SKJ_HUBS.map((hub) => row?.[hub.label]).filter(
        (value): value is number => typeof value === 'number',
      );
      expect(prices).toHaveLength(SKJ_HUBS.length);
      expect(spread.maxPrice).toBe(Math.max(...prices));
      expect(spread.minPrice).toBe(Math.min(...prices));
      expect(spread.gap).toBe(spread.maxPrice - spread.minPrice);
    }

    // 항구 라벨은 화면에 그대로 노출되므로 한글이어야 한다 (L-01).
    for (const hub of SKJ_HUBS) {
      expect(hub.label).toMatch(/^[가-힣]+$/);
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

    expect(markup).toContain('참치');
    expect(markup).toContain('참치 산업 해부');
    expect(markup).toContain('data-now="true"');
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

    expect(markup).toContain('참치');
    expect(markup).toContain('참치 산업 해부');
    expect(markup).toContain('data-now="true"');
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
