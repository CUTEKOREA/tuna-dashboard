/**
 * 「시장 이해」 고등어·골뱅이·새우 세 페이지의 가드.
 *
 * 오징어에서 겪은 세 가지 사고를 그대로 막는다.
 *   1. 대시보드를 한 번만 렌더해서 첫 단계만 검사 → 나머지 단계의 크래시를 놓쳤다
 *      → 여기서는 **모든 단계의 모든 차트를 하나씩** 렌더한다
 *   2. 축(xKey)이 없거나 없는 컬럼을 가리켜 차트가 빈 채로 나갔다
 *      → 서술이 낫표로 지목한 이름이 실제 차트 제목으로 존재하는지 대조한다
 *   3. 본문 수치와 집계 JSON 이 어긋났다
 *      → 핵심 수치를 JSON 에서 다시 계산해 본문 문자열과 맞춘다
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import MackerelIndustryDashboard, {
  MACKEREL_CHART_SLOTS,
} from '../components/market-understanding/MackerelIndustryDashboard';
import ShrimpIndustryDashboard, {
  SHRIMP_CHART_SLOTS,
} from '../components/market-understanding/ShrimpIndustryDashboard';
import WhelkIndustryDashboard, {
  WHELK_CHART_SLOTS,
} from '../components/market-understanding/WhelkIndustryDashboard';
import type {
  BriefingPoint,
  ChartSlot,
  StageNarrative,
} from '../components/market-understanding/CommodityIndustryDashboard';
import {
  getMackerelIndustryData,
  getShrimpIndustryData,
  getWhelkIndustryData,
} from '../lib/data/commodity-industry';
import {
  MACKEREL_BRIEFING_POINTS,
  MACKEREL_NARRATIVES,
  MACKEREL_SOURCE_NOTES,
} from '../lib/mackerel-industry-content';
import {
  SHRIMP_BRIEFING_POINTS,
  SHRIMP_NARRATIVES,
  SHRIMP_SOURCE_NOTES,
} from '../lib/shrimp-industry-content';
import {
  WHELK_BRIEFING_POINTS,
  WHELK_NARRATIVES,
  WHELK_SOURCE_NOTES,
} from '../lib/whelk-industry-content';

interface Page {
  이름: string;
  narratives: StageNarrative[];
  slots: Record<string, ChartSlot[]>;
  briefing: BriefingPoint[];
  notes: string[];
  render: () => React.ReactElement;
}

const PAGES: Page[] = [
  {
    이름: '고등어',
    narratives: MACKEREL_NARRATIVES,
    slots: MACKEREL_CHART_SLOTS,
    briefing: MACKEREL_BRIEFING_POINTS,
    notes: MACKEREL_SOURCE_NOTES,
    render: () => React.createElement(MackerelIndustryDashboard),
  },
  {
    이름: '골뱅이',
    narratives: WHELK_NARRATIVES,
    slots: WHELK_CHART_SLOTS,
    briefing: WHELK_BRIEFING_POINTS,
    notes: WHELK_SOURCE_NOTES,
    render: () => React.createElement(WhelkIndustryDashboard),
  },
  {
    이름: '새우',
    narratives: SHRIMP_NARRATIVES,
    slots: SHRIMP_CHART_SLOTS,
    briefing: SHRIMP_BRIEFING_POINTS,
    notes: SHRIMP_SOURCE_NOTES,
    render: () => React.createElement(ShrimpIndustryDashboard),
  },
];

describe('시장 이해 3품목 — 서술 골격', () => {
  it.each(PAGES)('$이름 — 단계마다 서술과 근거가 다 채워져 있다', (page) => {
    expect(page.narratives.length).toBeGreaterThanOrEqual(4);
    for (const stage of page.narratives) {
      expect(stage.key).toMatch(/^[sx]\d\d$/);
      expect(stage.numeral).not.toBe('');
      expect(stage.title).not.toBe('');
      expect(stage.question).not.toBe('');
      expect(stage.lede.length).toBeGreaterThan(20);
      expect(stage.paragraphs.length).toBeGreaterThanOrEqual(3);
      // 근거 없는 서술을 막는다. 참치·오징어와 같은 기준이다
      expect(stage.facts.length).toBeGreaterThanOrEqual(3);
      for (const fact of stage.facts) {
        expect(fact.value).not.toBe('');
        expect(fact.source).not.toBe('');
        expect(['A', 'B', 'C']).toContain(fact.grade);
        expect(fact.asOf).not.toBe('');
      }
    }
  });

  it.each(PAGES)('$이름 — 단계 키가 겹치지 않는다', (page) => {
    const keys = page.narratives.map((stage) => stage.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(PAGES)('$이름 — 브리핑과 출처 주의가 비어 있지 않다', (page) => {
    expect(page.briefing.length).toBeGreaterThanOrEqual(4);
    expect(page.notes.length).toBeGreaterThanOrEqual(4);
    const stageKeys = new Set(page.narratives.map((stage) => stage.key));
    for (const line of [...page.briefing.map((p) => p.text), ...page.notes]) {
      expect(line.length).toBeGreaterThan(10);
      // L-01 — 사용자 노출 문자열은 한글이어야 한다
      expect(line).toMatch(/[가-힣]/);
    }
    // 요약 한 줄마다 근거가 있는 단계로 갈 수 있어야 한다
    for (const point of page.briefing) {
      expect(stageKeys.has(point.stage), `${page.이름}: ${point.stage} 단계가 없다`).toBe(true);
    }
  });
});

describe('시장 이해 3품목 — 차트 참조 무결성', () => {
  it.each(PAGES)('$이름 — 본문이 지목한 낫표 이름이 실제 차트 제목이다', (page) => {
    const titles = new Set(
      Object.values(page.slots).flatMap((slots) => slots.map((slot) => slot.title)),
    );

    for (const stage of page.narratives) {
      const text = [stage.lede, ...stage.paragraphs].join('\n');
      for (const match of text.matchAll(/「([^」]+)」/g)) {
        expect(
          titles.has(match[1]),
          `${page.이름} ${stage.key}: 「${match[1]}」 라는 차트가 없다`,
        ).toBe(true);
      }
    }
  });

  it.each(PAGES)('$이름 — 차트 슬롯이 실재하는 단계에만 달려 있다', (page) => {
    const keys = new Set(page.narratives.map((stage) => stage.key));
    for (const key of Object.keys(page.slots)) {
      expect(keys.has(key), `${page.이름}: ${key} 단계가 없는데 차트가 달렸다`).toBe(true);
    }
  });

  it.each(PAGES)('$이름 — 차트마다 제목·설명·텔레메트리가 있다', (page) => {
    for (const slots of Object.values(page.slots)) {
      for (const slot of slots) {
        expect(slot.title).toMatch(/[가-힣]/);
        expect(slot.caption.length).toBeGreaterThan(10);
        expect(['STATIC', 'SYNCED', 'LIVE']).toContain(slot.telemetry.status);
        // 정적 산출물이므로 LIVE 를 달면 안 된다 (L-09)
        expect(slot.telemetry.status).toBe('STATIC');
        expect(slot.telemetry.syncDate).not.toBe('');
      }
    }
  });
});

describe('시장 이해 3품목 — 렌더', () => {
  it.each(PAGES)('$이름 — 대시보드가 렌더된다', (page) => {
    const html = renderToStaticMarkup(page.render());
    expect(html).toContain('30초 브리핑');
    expect(html).toContain('출처와 한계');
    expect(html).toMatch(/data-commodity="(mackerel|whelk|shrimp)"/);
  });

  it('새우 01단계는 차트 둘을 근거 블록에 둔다', () => {
    const html = renderToStaticMarkup(React.createElement(ShrimpIndustryDashboard));
    // 2026-08-17 사용자 지시: 본문 위 근거 레일 폐지 — 차트는 전부 사실표 아래 근거 블록
    expect(html).toContain('stageMore');
    expect(html).not.toContain('evidenceRail');
    expect(html).toContain('양식과 자연산 75년');
    expect(html).toContain('생산 방식별 규모');
    expect(html).toContain('shrimp-industry-tab');
    // 75년 시계열은 전폭, 옆의 규모 막대는 반폭
    expect(html).toMatch(/data-span="full"[^>]*>[\s\S]*양식과 자연산 75년|양식과 자연산 75년[\s\S]*data-span="full"/);
  });

  it('표는 전폭, 일반 그래프는 반폭이다', () => {
    const brand = SHRIMP_CHART_SLOTS.s04.find((s) => s.title.startsWith('브랜드와 점유율'));
    const korea = SHRIMP_CHART_SLOTS.s04.find((s) => s.title.startsWith('한국 종별 생산량'));
    const trend = SHRIMP_CHART_SLOTS.s01.find((s) => s.title.includes('75년'));
    const env = SHRIMP_CHART_SLOTS.s01.find((s) => s.title.startsWith('생산 방식별'));
    expect(brand?.span).toBe('full');
    expect(korea?.span).not.toBe('full');
    expect(trend?.span).toBe('full');
    expect(env?.span).not.toBe('full');

    const css = readFileSync(
      join(process.cwd(), 'components/market-understanding/TunaIndustryDashboard.module.css'),
      'utf8',
    );
    expect(css).toContain("[data-span='full']");
    expect(css).not.toContain('.catchGrid > .catchFigure:last-child:nth-child(odd)');
  });

  // 오징어에서 겪은 사고를 그대로 막는 검사다.
  // 대시보드를 한 번 렌더하면 첫 단계만 그려지므로 나머지 단계의 크래시를 못 본다.
  it.each(PAGES)('$이름 — 모든 단계의 모든 차트가 개별로 렌더된다', (page) => {
    for (const [key, slots] of Object.entries(page.slots)) {
      for (const slot of slots) {
        expect(() => renderToStaticMarkup(React.createElement(React.Fragment, null, slot.render())))
          .not.toThrow();
        expect(key).toMatch(/^[sx]\d\d$/);
      }
    }
  });

  it('고등어·골뱅이·새우 액센트 스코프가 CSS에 있다', () => {
    const css = readFileSync(
      join(process.cwd(), 'components/market-understanding/TunaIndustryDashboard.module.css'),
      'utf8',
    );
    expect(css).toContain("data-commodity='mackerel'");
    expect(css).toContain("data-commodity='whelk'");
    expect(css).toContain("data-commodity='shrimp'");
  });

  it('캡션 설명은 세로 flex-basis 로 부풀지 않는다', () => {
    const css = readFileSync(
      join(process.cwd(), 'components/market-understanding/TunaIndustryDashboard.module.css'),
      'utf8',
    );
    // 예전 가로 배치의 `flex: 1 1 18rem` 이 세로 캡션에서 높이 18rem 빈칸이 됐다
    expect(css).not.toMatch(/\.catchCaption span\s*\{[^}]*flex:\s*1\s+1\s+18rem/);
    expect(css).toContain('.chartFrame');
    expect(css).toContain('.catchTitleRow');
  });
});

describe('고등어 — 집계와 본문 대조', () => {
  const data = getMackerelIndustryData();
  const text = MACKEREL_NARRATIVES.flatMap((s) => [s.lede, ...s.paragraphs]).join('\n');
  const facts = MACKEREL_NARRATIVES.flatMap((s) => s.facts);

  it('원본이 낡으면 알 수 있게 기준연도가 2024년 이상이다', () => {
    expect(Number(data.한국어획._meta.기준연도)).toBeGreaterThanOrEqual(2024);
  });

  it('연근해 비중과 어획 합계가 본문 수치와 맞는다', () => {
    const total = data.한국어획.해역.reduce((sum, row) => sum + row.어획량, 0);
    expect(Math.abs(total - Number(data.한국어획._meta.합계))).toBeLessThanOrEqual(2);
    expect(text).toContain(Number(data.한국어획._meta.합계).toLocaleString('en-US'));

    const coastal = data.한국어획.해역.find((row) => row.해역 === '북서태평양');
    expect(coastal).toBeDefined();
    // 본문은 읽기 좋게 반올림하고, 근거표는 집계값을 그대로 싣는다
    expect(text).toContain(String(data.한국어획._meta.원양비중));
    expect(facts.some((fact) => fact.value.includes(String(coastal?.비중)))).toBe(true);
  });

  it('최소 크기 등급을 빼지 않았다', () => {
    // 「갈고등어」는 별개 어종이 아니라 고등어 200g 이하 치어의 등급이다.
    // 빼고 세면 위판 물량의 91%가 사라져 「최하 78%」라는 틀린 그림이 나온다 — 실제로 그랬다.
    const names = data.위판등급.rows.map((r) => r.등급);
    expect(names, '갈고등어를 다시 빼면 등급 구성이 통째로 어긋난다').toContain('갈고등어');
    const smallest = data.위판등급.rows.find((r) => r.등급 === '갈고등어')!;
    expect(smallest.비중).toBeGreaterThan(80);
    // 무엇인지 화면에 밝혀야 한다 — 시장 이름이라 그냥 두면 다른 물고기로 읽힌다
    expect(String((smallest as unknown as { 설명?: string }).설명 ?? '')).toContain('200g');
    expect(String(data.위판등급._meta.정정)).toContain('크기 등급');
  });

  it('등급 단가와 물량 비중이 본문과 맞는다', () => {
    const grades = data.위판등급.rows;
    expect(grades.length).toBeGreaterThanOrEqual(3);

    const top = grades.find((row) => row.등급.includes('상'));
    const bottom = grades.find((row) => row.등급.includes('하'));
    expect(top).toBeDefined();
    expect(bottom).toBeDefined();
    expect(text).toContain(top!.가중평균단가.toLocaleString('en-US'));
    expect(text).toContain(bottom!.가중평균단가.toLocaleString('en-US'));
    expect(text).toContain(String(bottom!.비중));

    // 물량이 가장 많은 등급이 단가는 가장 낮다 — 이 페이지의 핵심 주장이다
    const byVolume = [...grades].sort((a, b) => b.물량 - a.물량);
    expect(byVolume[0].가중평균단가).toBeLessThan(top!.가중평균단가);
    expect(byVolume[0].등급).toBe('갈고등어');
  });

  it('노르웨이 비중이 본문과 맞고 1위다', () => {
    const first = data.수입원산지.rows[0];
    expect(first.원산지).toBe('노르웨이');
    expect(text).toContain(String(first.비중));
    expect(facts.some((fact) => fact.value.includes(String(first.비중)))).toBe(true);
  });
});

describe('골뱅이 — 집계와 본문 대조', () => {
  const data = getWhelkIndustryData();
  const text = WHELK_NARRATIVES.flatMap((s) => [s.lede, ...s.paragraphs]).join('\n');

  it('원본이 낡으면 알 수 있게 기준연도가 2024년 이상이다', () => {
    expect(data.요약.기준연도).toBeGreaterThanOrEqual(2024);
  });

  it('다섯 과(科)가 갈려 있고 합계가 맞는다', () => {
    expect(data.종구성.length).toBeGreaterThanOrEqual(4);
    const sum = data.종구성.reduce((total, row) => total + row.생산량, 0);
    expect(Math.abs(sum - data.요약.세계생산합계)).toBeLessThanOrEqual(5);

    const groups = data.종구성.map((row) => row.그룹);
    expect(groups).toContain('피뿔고둥류');
    expect(groups).toContain('참골뱅이류');
    expect(text).toContain(String(data.요약.최대그룹비중));
    expect(text).toContain(String(data.요약.참골뱅이비중));
  });

  it('참골뱅이는 양식이 0이고 한국 어획도 0이다', () => {
    const buccinum = data.종구성.find((row) => row.그룹 === '참골뱅이류');
    expect(buccinum?.양식).toBe(0);
    expect(data.요약.한국참골뱅이어획).toBe(0);
    expect(data.참골뱅이상위국.some((row) => row.국가 === '대한민국')).toBe(false);
  });

  it('국내 생산 계열이 코드별로 갈려 있고 연도가 겹치지 않는다', () => {
    const 골뱅이 = data.한국생산.계열['골뱅이'] ?? [];
    const 고둥류 = data.한국생산.계열['고둥류'] ?? [];
    expect(골뱅이.length).toBeGreaterThan(0);
    expect(고둥류.length).toBeGreaterThan(0);

    // 같은 연도가 두 계열에 함께 있으면 한 선으로 이어 그릴 위험이 생긴다
    const overlap = new Set(골뱅이.map((r) => r.연도));
    expect(고둥류.some((r) => overlap.has(r.연도))).toBe(false);

    // 한 계열 안에서 연도가 중복되면 선이 겹쳐 두 배로 보인다 (실제로 났던 결함)
    for (const rows of Object.values(data.한국생산.계열)) {
      const years = rows.map((r) => r.연도);
      expect(new Set(years).size).toBe(years.length);
    }
  });

  it('수입 상대국이 중복되지 않는다', () => {
    const names = data.한국수입.rows.map((row) => row.국가);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('새우 — 집계와 본문 대조', () => {
  const data = getShrimpIndustryData();
  const text = SHRIMP_NARRATIVES.flatMap((s) => [s.lede, ...s.paragraphs]).join('\n');
  const facts = SHRIMP_NARRATIVES.flatMap((s) => s.facts);

  it('원본이 낡으면 알 수 있게 기준연도가 2024년 이상이다', () => {
    expect(data.요약.기준연도).toBeGreaterThanOrEqual(2024);
  });

  it('어획과 양식의 합이 세계 생산과 맞는다', () => {
    // 셋 다 각자 반올림한 값이라 1톤 오차가 난다
    expect(Math.abs(data.요약.양식 + data.요약.자연산 - data.요약.세계생산)).toBeLessThanOrEqual(2);
    // 본문은 어획·양식을 따로 적고, 합계는 근거표가 싣는다
    expect(text).toContain(data.요약.양식.toLocaleString('en-US'));
    expect(text).toContain(data.요약.자연산.toLocaleString('en-US'));
    expect(
      facts.some((fact) => fact.value.includes(data.요약.세계생산.toLocaleString('en-US'))),
    ).toBe(true);
    expect(text).toContain(String(data.요약.양식비중));
  });

  it('양식 비중이 자연산을 넘어선 지점이 시계열에 있다', () => {
    const rows = data.양식자연산추이;
    expect(rows.length).toBeGreaterThan(10);
    expect(rows[0].양식비중).toBeLessThan(5);
    expect(rows[rows.length - 1].양식비중).toBeGreaterThan(50);

    const crossed = rows.find((row) => row.양식비중 >= 50);
    expect(crossed).toBeDefined();
    expect(text).toContain(crossed!.연도);
  });

  it('종 코드가 한글로 매핑돼 있다', () => {
    // 「기타 새우(AKS)」 같은 라벨이 화면에 나간 적이 있다. 집계가 막지만 여기서도 잡는다
    for (const row of [...data.종구성, ...data.한국종구성]) {
      expect(row.종).not.toMatch(/기타 새우\(/);
      expect(row.종).toMatch(/[가-힣]/);
    }
    expect(text).toContain(String(data.요약.최대종비중));
  });

  it('양식 환경이 갈려 있고 담수 몫이 본문과 맞는다', () => {
    const envs = Object.fromEntries(data.양식환경.map((row) => [row.환경, row]));
    expect(envs['기수']).toBeDefined();
    expect(envs['담수']).toBeDefined();

    const sum = data.양식환경.reduce((total, row) => total + row.생산량, 0);
    expect(Math.abs(sum - data.요약.양식)).toBeLessThanOrEqual(2);
    expect(text).toContain(String(data.요약.담수양식비중));
    expect(text).toContain(data.요약.담수양식.toLocaleString('en-US'));
  });

  it('한국은 세계와 반대로 자연산이 많다', () => {
    expect(data.요약.한국양식비중).not.toBeNull();
    expect(data.요약.한국양식비중!).toBeLessThan(data.요약.양식비중);
    expect(data.한국종구성[0].종).toBe('젓새우');
    expect(text).toContain(String(data.요약.한국양식비중));
  });
});
