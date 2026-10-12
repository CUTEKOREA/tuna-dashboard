/**
 * 「시장 이해 > 참치 양식」 가드.
 *
 * 2026-10-12: 화면 원문이 세계 참치 양식 조사 제1보에서 해부보고서 「한국 시장의 양식 참다랑어」
 * (표준 틀 15절)로 바뀌었다. 화면 단언은 새 보고서 기준이고, 제1보는 「참고」 링크로만 잇는다.
 * 옛 손 작성 모듈(`lib/tunafarm-industry-content.ts`·`lib/data/tunafarm-industry.ts`)은 화면에 쓰지 않으며
 * 그 모듈 자체의 단언(구성·장 매핑·출처 주석)은 그대로 둔다.
 *
 * 1. 15단계가 한 페이지에 이어서 그려지고 단계 제목이 원문 h2 부제다.
 * 2. 보고서 원문 핵심 수치가 화면에 있다(재계산 없이 원문 표기 그대로).
 * 3. **층 경계 문구**가 있다 — 국내 통계는 축양·완전양식을 가르지 않고, 원장 건수는 물량이 아니다.
 * 4. **제1보 검증에서 철회한 주장이 되살아나지 않는다.**
 * 5. 개인 이름이 없다.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TunafarmIndustryDashboard, {
  TUNAFARM_REPORT_NARRATIVES,
  TUNAFARM_WORLD_REPORT_HREF,
} from '@/components/market-understanding/TunafarmIndustryDashboard';
import { getTunafarmCounts, getTunafarmChapterNames } from '@/lib/data/tunafarm-industry';
import { isActiveMenu, getDashboardTitle } from '@/lib/dashboard-registry';
import { industryItem } from '@/lib/data/industry-registry';
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
    // 2026-10-12: 메뉴는 주력 5 고정 + 분류 접기. 참치 양식은 「수산」 그룹에서 전용 경로로 간다.
    expect(industryItem('tunafarm')).toMatchObject({ category: '수산', href: '/tunafarm-industry' });
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
      // 다른 품목 대시보드 수준(절당 1,000자 이상)을 바닥으로 둔다.
      // 표만 채운 절은 서술 추출에서 빈다 — `build_report_prose.py` 는 para 블록만 가져간다.
      expect(n.paragraphs.length).toBeGreaterThanOrEqual(5);
      expect(n.facts.length).toBeGreaterThanOrEqual(3);
      const chars = n.paragraphs.join('').length;
      expect(chars, `${n.key} 서술량`).toBeGreaterThan(1000);
    }
  });

  it('출처 주석이 자료마다 있다', () => {
    expect(TUNAFARM_SOURCE_NOTES.length).toBeGreaterThanOrEqual(6);
    expect(TUNAFARM_SOURCE_NOTES.join(' ')).toContain('0304.87.1000');
  });

  it('15단계가 한 페이지에 이어서 나오고 제목은 원문 h2 부제다', () => {
    // 2026-10-12: 해부보고서 15절을 1절=1단계로 싣는다. 손 작성 제목·질문은 없다.
    expect(TUNAFARM_REPORT_NARRATIVES).toHaveLength(15);
    for (const n of TUNAFARM_REPORT_NARRATIVES) {
      expect(text).toContain(n.title);
    }
    expect(text).toContain('한눈에 보는 양식 참다랑어');
    expect(text).toContain('공개 자료로 닫히지 않는 물음');
  });

  it('보고서 원문 보기와 「참고: 세계 참치 양식 조사 제1보 원문 보기」 한 줄이 있다', () => {
    expect(html).toContain('href="/reports/industry/tunafarm-2026-10.html"');
    expect(html).toContain(`href="${TUNAFARM_WORLD_REPORT_HREF}"`);
    expect(html.match(/참고: 세계 참치 양식 조사 제1보 원문 보기/g)).toHaveLength(1);
  });
});

describe('참치 양식 - 발행본 표가 실린다', () => {
  it('표 46개와 콜아웃 19개를 옮겼다', () => {
    const c = getTunafarmCounts();
    expect(c.tables).toBe(46);
    expect(c.callouts).toBe(19);
  });

  it('원문 표 15개가 그 절의 서술 흐름 안에 있다(표 없는 절: 01·07·09·11·15)', () => {
    const slots = (n: (typeof TUNAFARM_REPORT_NARRATIVES)[number]) => (n.flow ?? []).filter((item) => item.kind === 'slot').length;
    expect(TUNAFARM_REPORT_NARRATIVES.reduce((sum, n) => sum + slots(n), 0)).toBe(15);
    expect(TUNAFARM_REPORT_NARRATIVES.filter((n) => slots(n) === 0).map((n) => n.key)).toEqual(['s01', 's07', 's09', 's11', 's15']);
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
    // 원문 표 칸 값(03절 수입 연도·06절 명의·10절 제조소·13절 값)
    for (const v of ['3,147.3', '동원산업(주)', 'TRY INC.', '46,978', '욕지도 정치망 치어의 가두리 입식 시작']) {
      expect(text, v).toContain(v);
    }
  });
});

describe('참치 양식 - 원문 수치', () => {
  const MUST = [
    // 표지 cover-facts 여덟 타일 값
    '14.276', // 2025 국내 해면양식
    '7,168.3', // 2025 참다랑어 수입
    '0.20%', // 수입량 대비 국내 양식
    '48.839', // 국내 양식 정점 2022
    '81.2%', // 필레 비중
    '84.6%', // 원장 수출국 일본
    '1,491건', // 축양 대상 3종 신고
    '−46.6%', // 2026 1~8월 국내 양식
    // 본문
    '65.3%', // 상위 10곳 신고 건수 비중
    '5.073톤', // 2026 1~8월 출하
    '151.3백만 달러', // 2025 수입 금액
  ];
  it.each(MUST)('원문 수치 %s 가 화면에 있다', (v) => {
    expect(text).toContain(v);
  });
});

describe('참치 양식 - 층 경계', () => {
  it('국내 생산 통계가 축양과 완전양식을 가르지 않는다고 적는다', () => {
    expect(text).toContain('국내 생산 통계는 두 방식을 구분하지 않는다');
  });

  it('원장 신고 건수가 물량이 아니라고 적는다', () => {
    expect(text).toContain('신고 건수 기준이며 물량 비중은 원장에 나오지 않는다');
    expect(text).toContain('건수는 수입 물량이나 최종 판매량이 아님');
  });

  it('양식·어획 비교가 입식 비율이 아니라고 적는다', () => {
    expect(text).toContain('규모 비교이며 입식 비율이 아니다');
  });

  it('관세청 기준과 원장 기준이 다르다고 적는다(옛 출처 주석 모듈)', () => {
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
    // 2026-10-06 정정: 2025년 단년 관세청 비중을 2024-04~2026-09 원장과 맞댄 기간 불일치, 그리고 두 자료로 입증할 수 없는 인과
    ['2025년 단년 관세청 중량 비중', /통마리 18\.8%/],
    ['통마리가 건당 무겁다는 인과', /건당 무거우니/],
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

  it('공개 자료로 닫히지 않는 것을 닫힌 것처럼 적지 않는다', () => {
    expect(text).toContain('KOSIS에서 확인할 수 없다');
    expect(text).toContain('참다랑어 양식만 떼어 낸 재무는 공시에 없다');
  });
});
