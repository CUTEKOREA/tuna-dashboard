import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { SHRIMP_CHART_SLOTS } from '@/components/market-understanding/ShrimpIndustryDashboard';
import {
  SHRIMP_BRIEFING_POINTS,
  SHRIMP_NARRATIVES,
  SHRIMP_SOURCE_NOTES,
} from '@/lib/shrimp-industry-content';

const TEXT = [
  ...SHRIMP_NARRATIVES.flatMap((s) => [
    s.lede,
    ...s.paragraphs,
    ...s.facts.map((f) => `${f.value} ${f.note ?? ''} ${f.source}`),
  ]),
  ...SHRIMP_BRIEFING_POINTS.map((b) => `${b.headline} ${b.text}`),
  ...SHRIMP_SOURCE_NOTES,
  readFileSync(
    join(__dirname, '../components/market-understanding/ShrimpIndustryDashboard.tsx'),
    'utf8',
  ),
].join('\n');

describe('새우 보고서 이식 07~13단계', () => {
  it('단계 키가 14개이고 보고서 축이 붙어 있다', () => {
    expect(SHRIMP_NARRATIVES.map((n) => n.key)).toEqual([
      's01',
      's02',
      's03',
      's04',
      's05',
      's06',
      'x01',
      's07',
      's08',
      's09',
      's10',
      's11',
      's12',
      's13',
    ]);
    for (const key of ['s07', 's08', 's09', 's10', 's11', 's12', 's13']) {
      expect(SHRIMP_BRIEFING_POINTS.some((b) => b.stage === key)).toBe(true);
      expect(SHRIMP_CHART_SLOTS[key]?.length).toBeGreaterThan(0);
    }
  });

  it('보고서 핵심 수치가 본문·사실표에 있다', () => {
    for (const probe of [
      '104,977',
      '105,480',
      '8억 5,570만',
      '6억 9,920만',
      '24.8',
      '14.2',
      '34,588',
      '19,580',
      '1,090',
      '7,592',
      '76.0',
      '1억 3,150만',
      '22,176',
      '624',
      '1,481',
      '11,946,690',
      '174,868.939',
      '4,698.1',
      '12,050',
      '6.456',
      '1억 6,959만',
      '5,479',
      '16,185',
      '34,588 / (34,588+104,977)',
    ]) {
      expect(TEXT, `없음: ${probe}`).toContain(probe);
    }
  });

  it('합산 금지 숫자를 화면에 들이지 않는다', () => {
    expect(TEXT).not.toContain('1,913만');
    expect(TEXT).not.toContain('144,137');
  });

  it('적대 리뷰 P0·P1 오기와 문체 잔여를 남기지 않는다', () => {
    expect(TEXT).not.toContain('34,588톤을 수입 104,977톤으로 나눈');
    expect(TEXT).not.toContain('4,950');
    expect(TEXT).not.toContain('12,800');
    expect(TEXT).not.toContain('풍어');
    expect(TEXT).not.toContain('조기 종료');
    expect(TEXT).not.toContain('이 페이지 60.01%');
    expect(TEXT).not.toContain('개인 이름 없음');
    expect(TEXT).not.toContain('무역수지 8월호');
    expect(TEXT).not.toContain('평균 33,300');
    expect(TEXT).not.toContain('11.69달러/kg(가장 비싸고');
  });

  it('법인명만 쓰고 우일수산·다이아몬드새우가 있다', () => {
    expect(TEXT).toContain('우일수산');
    expect(TEXT).toContain('다이아몬드새우');
    expect(TEXT).not.toMatch(/대표이사|사장\s/);
  });
});
