/**
 * 오징어 산업해부 보고서 제25판(2026-08-27) 신규 내용의 시장 이해 페이지 동기화 회귀.
 * 원자료: 수협중앙회 어업경영조사보고(2025년판, 조사연도 2024) · 수협 계통판매 월보 재집계 ·
 * 머코프레스 2026-08-12 / 언더커런트 뉴스 2026-08-20 보도(C등급).
 */
import { describe, expect, it } from 'vitest';
import { SQUID_ALL_NARRATIVES } from '@/lib/squid-industry-content';

const stage = (key: string) => {
  const found = SQUID_ALL_NARRATIVES.find((s) => s.key === key);
  if (!found) throw new Error(`stage ${key} 없음`);
  return found;
};

describe('보고서 제25판 → 시장 이해 동기화', () => {
  it('s04에 포클랜드 로리고 일시 중단 신호가 보도 등급으로 실려 있다', () => {
    const s = stage('s04');
    const f = s.facts.find((f) => f.label.includes('포클랜드') && f.value.includes('일시 중단'));
    expect(f).toBeDefined();
    expect(f?.grade).toBe('C');
    expect(f?.asOf).toContain('2026-08');
    expect(f?.note).toContain('원문 미확보');
  });

  it('s07에 중국 재고 소진 국면과 4분기 공급 리스크 창이 실려 있다', () => {
    const s = stage('s07');
    const text = s.paragraphs.join('');
    expect(text).toContain('재고 소진');
    expect(text).toContain('4분기');
    const f = s.facts.find((f) => f.label.includes('중국') && f.value.includes('재고 소진'));
    expect(f?.grade).toBe('C');
  });

  it('s07 소비자가가 8월 하순 확정 관측으로 갱신됐다', () => {
    const c = stage('s07').facts.find((f) => f.label === '한국 소비자가');
    expect(c?.value).toBe('5,570 원/마리');
    expect(c?.asOf).toBe('2026-08-25');
  });

  it('s09에 수협 계통판매 어종 분해와 결측 한계가 실려 있다', () => {
    const s = stage('s09');
    const text = s.paragraphs.join('');
    expect(text).toContain('13,199');
    expect(text).toContain('갑오징어');
    const f = s.facts.find((f) => f.source.includes('계통판매'));
    expect(f).toBeDefined();
    expect(f?.note).toContain('57개월');
  });

  it('s13에 어업경영조사 척당 손익이 실려 있다', () => {
    const s = stage('s13');
    const f = s.facts.find((f) => f.source.includes('어업경영조사'));
    expect(f).toBeDefined();
    expect(f?.value).toContain('△56');
    expect(s.paragraphs.join('')).toContain('1,844');
  });
});
