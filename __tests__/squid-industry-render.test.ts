import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import SquidIndustryDashboard, {
  SQUID_CHART_SLOTS,
} from '../components/market-understanding/SquidIndustryDashboard';
import SquidWidgetView from '../components/market-understanding/SquidWidgetView';
import {
  getSquidCatchData,
  getSquidChainStages,
  getSquidCrossStages,
  getSquidStages,
  getSquidTradeData,
  getSquidWidgetsMeta,
} from '../lib/data/squid-industry';
import {
  SQUID_ALL_NARRATIVES,
  SQUID_CHAIN_NARRATIVES,
  SQUID_CROSS_NARRATIVES,
} from '../lib/squid-industry-content';

describe('시장 이해 > 오징어 - 데이터 인테이크', () => {
  it('어종 합계가 세계 합계와 맞고 바스켓이 셋으로 갈려 있다', () => {
    const data = getSquidCatchData();

    const speciesSum = data.어종구성.reduce((total, row) => total + row.어획량, 0);
    // 「그 밖의 종」을 포함하므로 반올림 오차만 허용한다
    expect(Math.abs(speciesSum - data.요약.세계어획량)).toBeLessThanOrEqual(12);

    const basketSum = data.바스켓구성.reduce((total, row) => total + row.어획량, 0);
    expect(Math.abs(basketSum - data.요약.세계어획량)).toBeLessThanOrEqual(12);

    // 오징어·갑오징어·두족류 미분류를 갈라 두는 것이 이 품목 자료의 첫 규칙이다.
    // 하나로 뭉개지면 「합산하지 마라」는 경고 자체가 화면에서 사라진다.
    const kinds = data.바스켓구성.map((row) => row.구분);
    expect(kinds).toContain('오징어');
    expect(kinds).toContain('갑오징어');
    expect(kinds.length).toBeGreaterThanOrEqual(3);

    // 문어가 섞이면 바스켓이 오염된 것이다
    expect(kinds).not.toContain('문어');
  });

  it('국가 순위 비중 합이 100을 넘지 않고 한국이 집계돼 있다', () => {
    const data = getSquidCatchData();
    const shareSum = data.국가순위.reduce((total, row) => total + row.비중, 0);
    expect(shareSum).toBeGreaterThan(0);
    expect(shareSum).toBeLessThanOrEqual(100.5);

    expect(data.요약.한국순위).toBeGreaterThan(0);
    expect(data.요약.한국어획량).toBeGreaterThan(0);
  });

  it('원본이 낡으면 알 수 있게 기준연도가 2024년 이상이다', () => {
    // 참치에서 사전필터 추출본을 써서 두 릴리스 뒤처진 적이 있다.
    // 빌드 스크립트가 거부하지만 산출물 쪽에서도 한 번 더 잡는다.
    const catchData = getSquidCatchData();
    const trade = getSquidTradeData();
    expect(catchData.요약.기준연도).toBeGreaterThanOrEqual(2024);
    expect(catchData._meta.기준연도).toBe(catchData.요약.기준연도);
    expect(trade.요약.기준연도).toBeGreaterThanOrEqual(2024);
  });

  it('살오징어 붕괴 시계열이 정점과 최신을 함께 담는다', () => {
    const data = getSquidCatchData();
    const rows = data.살오징어붕괴;
    expect(rows.length).toBeGreaterThan(40);

    const latest = rows[rows.length - 1];
    expect(Number(latest.연도)).toBe(data.요약.기준연도);
    expect(latest.세계).toBe(data.요약.살오징어세계최신);

    // 붕괴가 실제로 붕괴여야 서사가 성립한다
    expect(data.요약.살오징어세계최신).toBeLessThan(data.요약.살오징어세계정점 * 0.2);
    expect(data.요약.살오징어한국최신).toBeLessThan(data.요약.살오징어한국정점 * 0.2);
  });

  it('양식이 사실상 0이라는 사실이 집계에 남아 있다', () => {
    // 「오징어는 양식이 안 된다」가 이 페이지의 교육 포인트 중 하나다.
    // 어느 날 양식 수치가 커지면 서술을 고쳐야 하므로 여기서 잡는다.
    const data = getSquidCatchData();
    expect(data.요약.양식누적).toBeLessThan(1000);
  });

  it('통관 집계가 오징어 아닌 품목을 뺀 사실을 들고 있다', () => {
    const trade = getSquidTradeData();
    // 조개류·전복·문어 조제품이 원본에 섞여 있었다. 뺀 규모를 화면에 밝힌다.
    expect(trade.바스켓제외.제외수입액).toBeGreaterThan(0);
    expect(trade.바스켓제외.제외품목.length).toBeGreaterThanOrEqual(3);
    expect(trade.바스켓제외.제외품목).toContain('문어 조제품');

    // 품목 단계는 원물 → 1차가공 → 완제품 순서를 지킨다
    const stages = trade.품목단계.map((row) => row.구분);
    expect(stages[0]).toBe('원물');
  });
});

describe('시장 이해 > 오징어 - 위젯 큐레이션', () => {
  it('생성 데이터에 앰대시가 재유입되지 않는다', () => {
    const emDash = String.fromCodePoint(0x2014);
    for (const file of ['squid_industry_widgets_v1.json']) {
      const text = readFileSync(join(process.cwd(), 'public/data', file), 'utf8');
      expect(text, file).not.toContain(emDash);
    }
  });

  it('최신 KMI·칠레·모니터링 위젯과 핵심 감시행을 노출한다', () => {
    const meta = getSquidWidgetsMeta() as { 생성일: string; 원본: string };
    expect(meta.생성일).toBe('2026-08-27');
    expect(meta.원본).toContain('위젯 62개');

    const widgets = getSquidStages().flatMap((stage) => stage.widgets);
    const ids = widgets.map((widget) => widget.id);
    expect(ids).toContain('B_kmi_consumer_price');
    expect(ids).toContain('A_chile_jibia_quota');
    expect(ids).toContain('E_monitoring_calendar');
    expect(widgets).toHaveLength(33);

    const monitoring = widgets.find((widget) => widget.id === 'E_monitoring_calendar');
    const visibleIds = (monitoring?.data ?? [])
      .slice(0, 12)
      .map((row) => String(row.source_id));
    expect(visibleIds).toEqual(
      expect.arrayContaining([
        'SQ-PRC-KMI',
        'SQ-PRC-KAMIS',
        'SQ-MGT-PRODUCE',
        'SQ-MGT-SERNAPESCA',
        'SQ-TRD-CN-CUSTOMS',
      ]),
    );
  });

  it('본문 사실표도 최신 KMI·KAMIS·칠레 정본과 일치한다', () => {
    const valueStage = SQUID_ALL_NARRATIVES.find((stage) => stage.key === 's07');
    const sourcingStage = SQUID_ALL_NARRATIVES.find((stage) => stage.key === 's10');
    expect(valueStage).toBeDefined();
    expect(sourcingStage).toBeDefined();

    const consumer = valueStage?.facts.find((fact) => fact.label === '한국 소비자가');
    expect(consumer).toMatchObject({
      value: '5,570 원/마리',
      asOf: '2026-08-25',
      grade: 'B',
    });
    expect(consumer?.note).toContain('8월 26일 화면 비교값 5,440원');

    const wholesale = valueStage?.facts.find(
      (fact) => fact.label === '국내 도매가: 원양과 연근해',
    );
    expect(wholesale?.asOf).toBe('2026-08-26');

    const chile = sourcingStage?.facts.find(
      (fact) => fact.label === '칠레 대왕오징어 쿼터 소진율',
    );
    expect(chile).toMatchObject({ value: '65.011%', grade: 'A' });
    expect(chile?.asOf).toContain('130,021.9741톤');
    expect(chile?.asOf).toContain('69,978.0259톤');

    const currentText = JSON.stringify([valueStage, sourcingStage]);
    expect(currentText).not.toContain('4,926 원/마리');
    expect(currentText).not.toContain('60.93%');
    expect(currentText).not.toContain('121,868.76톤');
  });

  it('모든 위젯이 현황·실행지침을 갖춘다 (W-04)', () => {
    // 반쪽 카드가 나오는 것을 막는다. 참치에서 사용자가 지적했던 결함이다.
    const missing: string[] = [];
    for (const stage of getSquidStages()) {
      for (const widget of stage.widgets) {
        if (!widget.situation || !widget.takeaway) missing.push(`${stage.key}/${widget.id}`);
      }
    }
    expect(missing, `현황·실행지침 결측: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('모든 위젯이 방법론 또는 출처를 갖춘다', () => {
    const missing: string[] = [];
    for (const stage of getSquidStages()) {
      for (const widget of stage.widgets) {
        if (!widget.cardDesc && !widget.source) missing.push(`${stage.key}/${widget.id}`);
      }
    }
    expect(missing, `방법론·출처 결측: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('위젯에 그릴 것이 실제로 있다', () => {
    // 데이터도 발췌도 없는 위젯은 화면에 빈 카드로 남는다.
    const empty: string[] = [];
    for (const stage of getSquidStages()) {
      for (const widget of stage.widgets) {
        const rows = widget.data?.length ?? 0;
        const quotes = widget.excerpts?.length ?? 0;
        if (rows === 0 && quotes === 0) empty.push(`${stage.key}/${widget.id}`);
      }
    }
    expect(empty, `빈 위젯: ${empty.join(', ')}`).toHaveLength(0);
  });

  it('화면에 나가는 문자열에 영문이 남지 않는다 (L-01)', () => {
    // 학명·영문 라벨이 큐레이션을 빠져나가면 여기서 걸린다.
    const offenders: string[] = [];
    // 룰북 L-01 화이트리스트 — 통화코드·단위·기관 약어
    const allowed = /^(nei|GT|USD|EUR|KRW|JPY|CNY|kg|t|HS|HSK|MSC|IUU|FAO|CSV|PDF|XLSX|API|JSON)$/i;
    // 기관명·간행물명이 들어가는 열은 원어를 남긴다. 번역하면 원문을 찾을 수 없다.
    // 큐레이션 스크립트의 PROPER_NOUN_COLUMNS 와 같은 목록이어야 한다.
    const properNoun = new Set([
      'source_id',
      'series',
      'publisher',
      'landing_url',
      'source_path',
      'latest_verified',
      'next_check',
      'gate_id',
      'reporter_code',
      'country_code',
      'hs6',
      'size_grade',
      'trend',
      'kind',
    ]);

    const check = (value: unknown, where: string) => {
      if (typeof value !== 'string') return;
      for (const token of value.match(/[A-Za-z][A-Za-z.\-]{2,}/g) ?? []) {
        if (allowed.test(token)) continue;
        offenders.push(`${where}: ${token}`);
      }
    };

    for (const stage of getSquidStages()) {
      for (const widget of stage.widgets) {
        check(widget.title, `${widget.id}.title`);
        for (const column of widget.columns ?? []) check(column.label, `${widget.id}.column`);
        for (const series of widget.series ?? []) check(series.name, `${widget.id}.series`);
        for (const row of widget.data.slice(0, 40)) {
          for (const [key, value] of Object.entries(row)) {
            if (properNoun.has(key)) continue;
            check(value, `${widget.id}.${key}`);
          }
        }
      }
    }
    expect(offenders.slice(0, 12), `영문 잔존: ${offenders.slice(0, 12).join(' / ')}`).toHaveLength(0);
  });

  it('측정 기준의 값도 한글이다 (라이브에서 sum_within_stage 가 노출됐다)', () => {
    const offenders: string[] = [];
    for (const stage of getSquidStages()) {
      for (const widget of stage.widgets) {
        for (const [key, value] of Object.entries(widget.basis ?? {})) {
          if (typeof value !== 'string') continue;
          for (const token of value.match(/[A-Za-z]{3,}/g) ?? []) {
            offenders.push(`${widget.id}.${key}: ${token}`);
          }
        }
      }
    }
    expect(offenders, `측정 기준 영문 잔존: ${offenders.join(' / ')}`).toHaveLength(0);
  });

  it('방법론 캡션과 측정 기준에 원본 영문 키가 남지 않는다', () => {
    // 캡션은 화면에 그대로 나간다. 학명 열 이름·활중량 코드를 그대로 쓰면 L-01.
    for (const stage of getSquidStages()) {
      for (const widget of stage.widgets) {
        expect(widget.cardDesc ?? '', widget.id).not.toMatch(/Scientific_Name|Q_tlw/);
        for (const [key, value] of Object.entries(widget.basis ?? {})) {
          expect(String(value), `${widget.id}.${key}`).not.toMatch(
            /^(catch|allocation|export_unit)$/i,
          );
        }
      }
    }
  });

  it('원문 발췌는 한글 번역이 있는 것만 싣는다', () => {
    for (const stage of getSquidStages()) {
      for (const widget of stage.widgets) {
        for (const quote of widget.excerpts ?? []) {
          expect(quote.인용.trim().length, `${widget.id} 빈 인용`).toBeGreaterThan(0);
          // 한글이 하나도 없으면 번역이 안 된 원문이다
          expect(/[가-힣]/.test(quote.인용), `${widget.id} 한글 없는 발췌`).toBe(true);
        }
      }
    }
  });

  /**
   * 큐레이션 JSON 의 단계는 모두 서술을 가져야 한다 — 위젯만 있고 설명이 없으면
   * 화면에 제목만 뜬다.
   *
   * 반대는 성립하지 않는다. **서술이 정본이고 JSON 은 큐레이션 위젯의 출처일 뿐**이라,
   * 위젯 없이 차트만 붙는 단계(08 선박별 — 사내 자료)가 있을 수 있다.
   */
  it('큐레이션 단계가 모두 서술을 갖는다', () => {
    const chain = getSquidChainStages().map((stage) => stage.key);
    const cross = getSquidCrossStages().map((stage) => stage.key);
    const narrated = new Set(SQUID_ALL_NARRATIVES.map((entry) => entry.key));
    for (const key of [...chain, ...cross]) {
      expect(narrated.has(key), `${key}: 큐레이션 단계인데 서술이 없다`).toBe(true);
    }
    // 서술 순서는 사슬 → 횡단이어야 한다. 뒤집히면 탭 순서가 어긋난다.
    const chainNarr = SQUID_CHAIN_NARRATIVES.map((e) => e.key);
    expect(chainNarr.slice(0, chain.length)).toEqual(chain);
    expect(SQUID_CROSS_NARRATIVES.map((e) => e.key)).toEqual(cross);
  });
});

describe('시장 이해 > 오징어 - 서술', () => {
  it('서술이 「」로 지목한 위젯·차트가 그 단계에 실제로 있다', () => {
    // 큐레이션에서 위젯을 옮기거나 제목을 바꾸면 지목이 허공을 가리키는데,
    // 화면에서는 조용히 사라져 눈에 띄지 않는다. 여기서 잡는다.
    const stages = getSquidStages();
    const quoted = /「([^」]+)」/g;

    for (const narrative of SQUID_ALL_NARRATIVES) {
      // 큐레이션 위젯이 없는 단계도 있다(08 선박별 — 사내 자료 차트만 붙는다).
      // 그 경우 차트 슬롯만으로 지목을 확인한다.
      const stage = stages.find((entry) => entry.key === narrative.key);
      const titles = new Set([
        ...(stage?.widgets ?? []).map((widget) => widget.title),
        ...(SQUID_CHART_SLOTS[narrative.key] ?? []).map((slot) => slot.title),
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

  it('본문이 인용한 집계 수치가 집계 결과와 글자 그대로 같다', () => {
    // 서술은 사람이 쓰고 집계는 스크립트가 만든다. 집계를 다시 돌렸을 때
    // 본문만 옛 숫자로 남는 것이 이 페이지의 가장 위험한 회귀다.
    const data = getSquidCatchData();
    const trade = getSquidTradeData();
    const quoted = SQUID_ALL_NARRATIVES.flatMap((entry) => [
      ...entry.paragraphs,
      entry.lede,
      ...entry.facts.map((fact) => `${fact.label} ${fact.value} ${fact.note ?? ''}`),
    ]).join('\n');

    const num = (value: number) => value.toLocaleString('en-US');

    expect(quoted).toContain(num(data.요약.세계어획량));
    expect(quoted).toContain(num(data.요약.한국어획량));
    expect(quoted).toContain(num(data.요약.살오징어세계정점));
    expect(quoted).toContain(num(data.요약.살오징어세계최신));
    expect(quoted).toContain(num(data.요약.살오징어한국정점));
    expect(quoted).toContain(num(data.요약.살오징어한국최신));
    expect(quoted).toContain(num(trade.요약.수입량));

    // 품목 단계별 단가 — 이 페이지가 가르치려는 핵심 숫자다
    for (const stage of trade.품목단계) {
      expect(quoted.includes(num(stage.단가)), `${stage.구분} 단가 ${num(stage.단가)} 가 본문에 없다`).toBe(
        true,
      );
    }
  });

  it('모든 사실에 출처와 등급이 붙는다', () => {
    for (const narrative of SQUID_ALL_NARRATIVES) {
      for (const fact of narrative.facts) {
        expect(fact.source.length, `${narrative.key} 출처 없음`).toBeGreaterThan(0);
        expect(['A', 'B', 'C']).toContain(fact.grade);
        expect(fact.asOf.length, `${narrative.key} 기준시점 없음`).toBeGreaterThan(0);
      }
    }
  });
});

describe('시장 이해 > 오징어 - 렌더', () => {
  it('대시보드가 서버에서 그려진다', () => {
    const markup = renderToStaticMarkup(React.createElement(SquidIndustryDashboard));
    expect(markup).toContain('squid-industry-dashboard');
    expect(markup).toContain('data-commodity="squid"');
    expect(markup).toContain('오징어');
    expect(markup).toContain('오징어 산업 해부');
    expect(markup).toContain('data-hero-now-strip="true"');
    expect(markup).toContain('data-now="true"');
    expect(markup).toContain('30초 브리핑');
    // 2026-08-17 사용자 지시: 본문 위 근거 레일 폐지 — 차트는 전부 사실표 아래 근거 블록
    expect(markup).toContain('stageMore');
    expect(markup).not.toContain('evidenceRail');
    expect(markup).toContain('squid-industry-tab');
    expect(markup).toContain('어종별 어획량 구성');
    expect(markup).toContain('무엇을 오징어라 부르는가');
  });

  it('요약만 그리는 모드가 동작한다', () => {
    const markup = renderToStaticMarkup(
      React.createElement(SquidIndustryDashboard, { heroOnly: true }),
    );
    expect(markup).toContain('오징어');
    expect(markup).toContain('오징어 산업 해부');
    expect(markup).toContain('data-hero-now-strip="true"');
    expect(markup).not.toContain('30초 브리핑');
  });

  it('위젯 30개가 하나도 빠짐없이 그려진다', () => {
    // 이 검사가 없어서 배포 후에 페이지가 죽었다. 원본 셀에 객체 배열이 들어 있었고
    // React 가 그것을 자식으로 받으면 페이지 전체가 사라진다. 단계 하나가 죽으면
    // 그 단계만 비는 것이 아니라 대시보드가 통째로 오류 화면이 된다.
    const broken: string[] = [];
    for (const stage of getSquidStages()) {
      for (const widget of stage.widgets) {
        try {
          const markup = renderToStaticMarkup(
            React.createElement(SquidWidgetView, { widget }),
          );
          if (markup.length < 20) broken.push(`${stage.key}/${widget.id} (빈 출력)`);
        } catch (error) {
          broken.push(`${stage.key}/${widget.id} - ${(error as Error).message.slice(0, 80)}`);
        }
      }
    }
    expect(broken, `렌더 실패: ${broken.join(' / ')}`).toHaveLength(0);
  });

  it('셀에 객체·배열이 남아 있지 않다', () => {
    // 위 검사를 통과해도 데이터에 중첩 구조가 남아 있으면 렌더러 방어에만 기대는 셈이다.
    // 큐레이션에서 펴는 것이 정석이므로 데이터 쪽도 잡는다.
    const nested: string[] = [];
    for (const stage of getSquidStages()) {
      for (const widget of stage.widgets) {
        for (const row of widget.data) {
          for (const [key, value] of Object.entries(row)) {
            if (value !== null && typeof value === 'object') {
              nested.push(`${widget.id}.${key}`);
            }
          }
        }
      }
    }
    expect(nested, `중첩 셀: ${nested.join(', ')}`).toHaveLength(0);
  });

  it('차트 슬롯이 모두 그려진다', () => {
    for (const [key, slots] of Object.entries(SQUID_CHART_SLOTS)) {
      for (const slot of slots) {
        const markup = renderToStaticMarkup(
          React.createElement(() => slot.render() as React.ReactElement),
        );
        expect(markup.length, `${key}/${slot.title} 이 비었다`).toBeGreaterThan(20);
      }
    }
  });
});
