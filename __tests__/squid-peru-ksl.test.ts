/**
 * KSL(칠카) 사내 미팅 반영 회귀 (2026-09-11).
 * 등기 기준 한국계 7곳 합계는 그대로 두고, 미팅으로 확인한 KSL 을 더한 8곳 합계를 따로 싣는다.
 * 미팅에서 들은 값은 본인 진술이라 공개 자료 칸(능력·자숙 비율)을 덮어쓰지 않는다.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PeruPlantTable } from '../components/market-understanding/CompanyResearchTables';
import { peruLedger, peruPlants } from '../lib/data/squid-peru-supply';
import { SQUID_ALL_NARRATIVES } from '../lib/squid-industry-content';

const ksl = peruPlants.find((p) => p.공장 === 'KSL');

describe('KSL 한국계(미팅 확인) 반영', () => {
  it('공개 자료 칸은 그대로, 미팅 값은 자칭 칸에만 있다', () => {
    expect(ksl?.한국계경영).toBe('예(미팅)');
    expect(ksl?.능력_톤일).toBeNull();
    expect(ksl?.자숙_pct).toBe(44.1);
    expect(ksl?.미팅_자칭).toMatchObject({ 가공능력_톤일: 300, 월작업일: 25, 냉동창고_톤: 1500, 연안조업선_척: 4, 자숙_pct_약: 80 });
  });

  it('7곳 합계는 등기 기준을 유지하고 8곳 합계는 KSL 을 더한 값이다', () => {
    const korean7 = peruPlants.filter((p) => p.한국계경영 === '예');
    expect(korean7).toHaveLength(7);
    expect(korean7.reduce((s, p) => s + p.신고건수, 0)).toBe(peruLedger.한국계7사_신고건수);
    expect(peruLedger.한국계_미팅포함8사_신고건수).toBe(peruLedger.한국계7사_신고건수 + (ksl?.신고건수 ?? 0));
    expect(peruLedger.한국계_미팅포함8사_직원).toBe(peruLedger.한국계7사_직원 + (ksl?.직원 ?? 0));
    expect(((peruLedger.한국계_미팅포함8사_신고건수 / peruLedger.전체_신고건수) * 100).toFixed(1)).toBe('47.1');
  });

  it('표에 미팅 확인 표시와 자칭 값이 나오고 신고 원장 자숙 비율도 함께 보인다', () => {
    const html = renderToStaticMarkup(React.createElement(PeruPlantTable, { rows: peruPlants, total: peruLedger.전체_신고건수 }));
    expect(html).toContain('한국계 경영 · 사내 미팅 확인');
    expect(html).toContain('자칭(2026-09-11 미팅)');
    expect(html).toContain('자칭 자숙 약 80% (신고 원장 44.1%)');
  });

  it('본문과 사실표가 두 기준을 나란히 적고 미팅 값은 C 등급이다', () => {
    const s10 = SQUID_ALL_NARRATIVES.find((s) => s.key === 's10');
    const text = s10?.paragraphs.join('') ?? '';
    expect(text).toContain('1,129건');
    expect(text).toContain('1,247건');
    const f = s10?.facts.find((x) => x.label.startsWith('KSL 사내 미팅'));
    expect(f?.grade).toBe('C');
    expect(f?.note).toContain('44.1%');
  });

  it('개인 이름을 싣지 않는다', () => {
    const all = JSON.stringify({ peruPlants, SQUID_ALL_NARRATIVES });
    expect(all).not.toMatch(/김두삼|두삼/);
  });
});
