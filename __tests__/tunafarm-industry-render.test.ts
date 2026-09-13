/**
 * 「시장 이해 > 참치 양식」 가드.
 *
 * 1. 단계 아홉이 한 페이지에 이어서 그려지고 브리핑 수와 단계 수가 같다.
 * 2. 보고서 원문 핵심 수치가 화면에 있다(재계산 없이 원문 표기 그대로).
 * 3. **층 경계 문구**가 있다 — 입식 상한과 총허용어획량은 다른 층이고, 명부 행 수는 농장 수가 아니다.
 * 4. **검증에서 철회한 주장이 되살아나지 않는다** — 이 편은 세 축 검증에서 P0 아홉을 받았고,
 *    철회된 문장이 다시 들어오는 것이 가장 큰 회귀 위험이다.
 * 5. 개인 이름이 없다(명부 원본에 개인 소유자가 있어 익명화했다).
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TunafarmIndustryDashboard, {
  TUNAFARM_CHART_SLOTS,
} from '@/components/market-understanding/TunafarmIndustryDashboard';
import { getTunafarmCounts, getTunafarmChapterNames } from '@/lib/data/tunafarm-industry';
import { isActiveMenu, getDashboardTitle, SIDEBAR_SECTIONS } from '@/lib/dashboard-registry';
import {
  TUNAFARM_BRIEFING_POINTS,
  TUNAFARM_CHAPTER_BY_STAGE,
  TUNAFARM_NARRATIVES,
  TUNAFARM_SOURCE_NOTES,
} from '@/lib/tunafarm-industry-content';

const html = renderToStaticMarkup(React.createElement(TunafarmIndustryDashboard));
const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');

describe('참치 양식 - 레지스트리', () => {
  it('메뉴 키가 등록돼 있다', () => {
    expect(isActiveMenu('tunafarm-industry')).toBe(true);
    expect(getDashboardTitle('tunafarm-industry')).toBe('참치 양식');
  });

  it('시장 이해 구역에 들어 있다', () => {
    const understanding = SIDEBAR_SECTIONS.find((s) => s.items.some((i) => i.key === 'tunafarm-industry'));
    expect(understanding).toBeDefined();
    expect(understanding?.items.map((i) => i.key)).toContain('tunafarm-industry');
  });
});

describe('참치 양식 - 구성', () => {
  it('단계가 아홉이고 브리핑과 짝이 맞는다', () => {
    expect(TUNAFARM_NARRATIVES).toHaveLength(9);
    expect(TUNAFARM_BRIEFING_POINTS).toHaveLength(TUNAFARM_NARRATIVES.length);
    const stages = TUNAFARM_NARRATIVES.map((n) => n.numeral);
    expect(TUNAFARM_BRIEFING_POINTS.map((b) => b.stage)).toEqual(stages);
  });

  it('모든 단계가 서술과 사실을 갖는다', () => {
    for (const n of TUNAFARM_NARRATIVES) {
      expect(n.paragraphs.length).toBeGreaterThanOrEqual(3);
      expect(n.facts.length).toBeGreaterThanOrEqual(3);
      const chars = n.paragraphs.join('').length;
      expect(chars).toBeGreaterThan(400);
    }
  });

  it('출처 주석이 자료마다 있다', () => {
    expect(TUNAFARM_SOURCE_NOTES.length).toBeGreaterThanOrEqual(6);
    expect(TUNAFARM_SOURCE_NOTES.join(' ')).toContain('0304.87.1000');
  });

  it('아홉 단계가 한 페이지에 이어서 나온다', () => {
    for (const n of TUNAFARM_NARRATIVES) {
      expect(text).toContain(n.title);
    }
  });
});

describe('참치 양식 - 발행본 표가 실린다', () => {
  it('표 46개와 콜아웃 19개를 옮겼다', () => {
    const c = getTunafarmCounts();
    expect(c.tables).toBe(46);
    expect(c.callouts).toBe(19);
  });

  it('아홉 단계가 모두 표 슬롯을 갖는다', () => {
    for (const n of TUNAFARM_NARRATIVES) {
      expect(TUNAFARM_CHART_SLOTS[n.key], `${n.key} 슬롯`).toBeDefined();
      expect(TUNAFARM_CHART_SLOTS[n.key].length).toBeGreaterThan(0);
    }
  });

  it('장 이름이 발행본 표기와 맞는다 — 틀리면 표가 안 붙는다', () => {
    const names = getTunafarmChapterNames();
    for (const n of TUNAFARM_NARRATIVES) {
      const chapter = TUNAFARM_CHAPTER_BY_STAGE[n.key];
      expect(chapter, `${n.key} 장 매핑`).toBeDefined();
      expect(names, `${chapter} 가 JSON 에 있다`).toContain(chapter);
    }
  });

  it('표 본문이 화면에 그려진다', () => {
    // 발행본 표에만 있는 값들. 서술에는 없다.
    for (const v of ['ATEU1MLT00004', 'AT001TUR00011', 'ATEU1HRV00012', '2,156', '12,300']) {
      expect(text, v).toContain(v);
    }
  });
});

describe('참치 양식 - 원문 수치', () => {
  const MUST = [
    '68,443', // FAO 2024 세계 양식 생산(보고한 나라 합)
    '13.52', // 2024 산지 출하 단가
    '405', // 일본 인공종묘 유래 출하
    '75,199.84', // 인가 입식 상한 합계
    '48,403', // 동부 총허용어획량 2026~2028
    '8,959', // CCSBT 사이트 중복 제거 입식능력
    '2,578.52', // 모로코 입식
    '4,360.90', // 모로코 도살 후
    '12,971', // 모로코 마리 수 - 코호트 동일성의 증거
    '69%', // 모로코 증육률
    '2,577', // 이탈리아 2007년 실물 보고
    '435.3', // 이탈리아 마지막 보고값
    '1.85', // 종묘 대 사료 배수
    '7,168.3', // 2025 한국 수입 물량
    '81.8%', // 일본 경유 대서양참다랑어
    '158어장', // 일본 수산청 명부
    '57.9%', // 이탈리아 정부 부처 소유 비중
  ];
  it.each(MUST)('원문 수치 %s 가 화면에 있다', (v) => {
    expect(text).toContain(v);
  });
});

describe('참치 양식 - 층 경계', () => {
  it('입식 상한이 출하 능력이 아니라고 적는다', () => {
    expect(text).toMatch(/출하 능력이 아니/);
  });

  it('명부 행 수를 농장 수로 읽지 말라고 적는다', () => {
    expect(text).toMatch(/행 수를 「?농장 수」?로/);
  });

  it('FAO 합계가 세계 전수가 아니라고 적는다', () => {
    expect(text).toMatch(/보고한 나라들의 합|세계 전수가 아니/);
  });

  it('관세청 기준과 원장 기준이 다르다고 적는다', () => {
    expect(TUNAFARM_SOURCE_NOTES.join(' ')).toMatch(/원산국.*선적국|선적국.*원산국/);
  });
});

describe('참치 양식 - 철회된 주장이 되살아나지 않는다', () => {
  // 적대 검증 세 축에서 철회된 문장들. 다시 **단정형으로** 들어오면 회귀다.
  //
  // ⚠ 낫표(「」) 안의 인용은 금지하지 않는다 — 철회를 기록하려면 그 문장을 적어야 한다.
  //   처음에 인용까지 막았더니 「철회했다」고 적은 자리가 전부 걸렸다.
  //   그래서 낫표로 감싸인 구간을 지운 뒤에 검사한다.
  const unquoted = text.replace(/「[^」]*」/g, ' ');

  const BANNED: Array<[string, RegExp]> = [
    ['일본 수요가 유력하다는 단정', /일본 수요\s*(감소)?\s*(가|는)\s*유력/],
    ['부등식이 정의로 선다는 단정', /정의로 선다/],
    ['종묘가 사료의 다섯 배라는 단정', /사료의 다섯 배/],
    ['0으로 보고한다는 단정', /0으로 보고한다/],
    ['크로아티아가 줄었다는 단정', /크로아티아가 7곳에서 4곳으로 줄/],
  ];
  it.each(BANNED)('%s 가 없다', (_label, re) => {
    expect(unquoted).not.toMatch(re);
  });

  it('철회한 주장을 출처 주석이 명시한다', () => {
    const notes = TUNAFARM_SOURCE_NOTES.join(' ');
    expect(notes).toMatch(/철회/);
  });
});

describe('참치 양식 - 표기 규약', () => {
  it('개인 이름이 없다', () => {
    // 명부 원본에 개인 소유자가 있어 익명화했다. 라틴문자 인명이 본문에 남으면 안 된다.
    const names = ['VAROVIC', 'GENNARO', 'SAVIOUR', 'ELLUL', 'AZZOPARDI'];
    for (const n of names) expect(text.toUpperCase()).not.toContain(n);
  });

  it('불확정을 불확정으로 적는다', () => {
    expect(text).toMatch(/미확정|확정하지 못했다/);
  });

  it('검증에서 되돌린 사실을 감추지 않는다', () => {
    expect(text).toMatch(/되돌렸다|철회|틀렸다/);
  });
});
