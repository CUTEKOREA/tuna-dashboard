/**
 * 대왕오징어 조달 보고서(2026-09-12) 반영 회귀.
 * 식약처 원장 4,878건과 관세청 HSK 10자리 거울통계에서 온 값을 고정한다.
 * 에콰도르 원산 13,127톤은 원산국 기준 신고이고 경유국은 미확정이라, 그 한정을 본문에서 지운 채 값만 남는 것을 막는다.
 */
import { describe, expect, it } from 'vitest';

import { SQUID_ALL_NARRATIVES } from '../lib/squid-industry-content';

const stage = (k: string) => SQUID_ALL_NARRATIVES.find((s) => s.key === k);
const text = (k: string) => (stage(k)?.paragraphs ?? []).join('');

describe('대왕오징어 원장 반영 (s10)', () => {
  it('등급별 합이 전체와 맞는다', () => {
    expect(2350 + 1374 + 1154).toBe(4878);
    expect(2650 + 1842 + 325 + 37 + 19 + 3).toBe(4876); // 베트남 19·에콰도르 3 포함, 인도네시아 2 제외
  });

  it('본문이 종 기준 건수·제조소·수입자 집중도를 적는다', () => {
    const t = text('s10');
    expect(t).toContain('**4,878건**');
    expect(t).toContain('페루 99곳·칠레 53곳·중국 70곳');
    expect(t).toContain('상위 10곳이 29.0%, 상위 100곳이 87.9%');
    expect(t).toContain('**자숙이 0건**');
  });

  it('사실표 두 행은 B 등급이고 건수가 수량이 아님을 밝힌다', () => {
    const f = stage('s10')?.facts ?? [];
    const a = f.find((x) => x.label === '대왕오징어 수입신고 (종 기준)');
    const b = f.find((x) => x.label === '대왕오징어 제조소와 수입 명의');
    expect(a?.grade).toBe('B');
    expect(a?.note).toContain('수량이 아니다');
    expect(b?.grade).toBe('B');
  });
});

describe('원산지와 거울통계 (s06)', () => {
  it('본문이 원산국 기준과 에콰도르 어긋남을 함께 적는다', () => {
    const t = text('s06');
    expect(t).toContain('**원산국**');
    expect(t).toContain('**13,127톤**');
    expect(t).toContain('**81톤**');
    expect(t).toContain('세계 수출 전체가 10,488톤**');
  });

  it('경유국을 단정하지 않는다', () => {
    const t = text('s06');
    expect(t).toContain('공개 통계로 확정되지 않는다');
    expect(t).not.toMatch(/중국을 거쳐 들어온 것이다|페루를 거쳐 들어온 것이다/);
  });

  it('에콰도르 사실표가 경유국 미확정을 남긴다', () => {
    const f = (stage('s06')?.facts ?? []).find((x) => x.label === '에콰도르산 급증');
    expect(f?.grade).toBe('A');
    expect(f?.note).toContain('경유국은 미확정');
  });
});

describe('신규 공급국 (s02)', () => {
  it('멕시코·에콰도르 어획 규모가 사실표에 있다', () => {
    const f = (stage('s02')?.facts ?? []).find((x) => x.label.startsWith('새로 올라온 공급국'));
    expect(f?.value).toContain('95,239톤');
    expect(f?.grade).toBe('A');
  });
});
