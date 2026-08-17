/**
 * 조종석 모드 2단계 — 보조 지표 슬롯의 가드.
 *
 * 이 기능의 실패 모드는 둘이다.
 *   1. **기본 모드에 새어 나온다.** 조종석을 안 켠 사람 화면이 지저분해진다.
 *      노출은 CSS 한 곳(`.cockpit-only`)이 가르므로 그 규칙이 살아 있는지 본다.
 *   2. **차트와 어긋난 수치를 낸다.** 다른 배열을 넣거나 키를 잘못 짚으면 화면에
 *      «검증되지 않은 숫자»가 생기는데, 보조 지표라 아무도 검수하지 않는다.
 *      그래서 슬롯이 쓰는 배열의 합계를 원본 JSON 에서 다시 계산해 맞춘다.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MACKEREL_CHART_SLOTS } from '@/components/market-understanding/MackerelIndustryDashboard';
import { SHRIMP_CHART_SLOTS } from '@/components/market-understanding/ShrimpIndustryDashboard';
import { SQUID_CHART_SLOTS } from '@/components/market-understanding/SquidIndustryDashboard';
import { WHELK_CHART_SLOTS } from '@/components/market-understanding/WhelkIndustryDashboard';

const ROOT = join(__dirname, '..');

type Slot = { title: string; cockpitExtra?: () => React.ReactNode };

function allSlots(record: Record<string, Slot[]>): Slot[] {
  return Object.values(record).flat();
}

function renderExtra(slot: Slot): string {
  const node = slot.cockpitExtra?.();
  if (!node) return '';
  return renderToStaticMarkup(React.createElement(React.Fragment, null, node));
}

function readJson(name: string): Record<string, { [k: string]: unknown }[]> {
  return JSON.parse(readFileSync(join(ROOT, 'public/data', name), 'utf8'));
}

describe('조종석 보조 지표', () => {
  const SETS = [
    ['새우', SHRIMP_CHART_SLOTS],
    ['오징어', SQUID_CHART_SLOTS],
    ['골뱅이', WHELK_CHART_SLOTS],
    ['고등어', MACKEREL_CHART_SLOTS],
  ] as const;

  it('세 품목 모두 보조 지표를 실제로 달고 있다', () => {
    for (const [name, slots] of SETS) {
      const withExtra = allSlots(slots as never).filter((s) => s.cockpitExtra);
      expect(withExtra.length, `${name}: 보조 지표가 하나도 없다`).toBeGreaterThan(0);
    }
  });

  /** 기본 모드로 새면 이 기능은 실패다. 껍데기 클래스가 반드시 붙어야 한다. */
  it('모든 보조 지표가 cockpit-only 껍데기 안에 있다', () => {
    for (const [name, slots] of SETS) {
      for (const slot of allSlots(slots as never)) {
        if (!slot.cockpitExtra) continue;
        const html = renderExtra(slot);
        expect(html, `${name} · ${slot.title}`).toContain('class="cockpit-only"');
      }
    }
  });

  it('CSS 가 기본 모드에서 숨기고 조종석에서만 보인다', () => {
    const css = readFileSync(join(ROOT, 'app/globals.css'), 'utf8');
    expect(css).toMatch(/\.cockpit-only\s*\{\s*display:\s*none/);
    expect(css).toMatch(/\[data-density='cockpit'\]\s*\.cockpit-only\s*\{\s*display:\s*block/);
  });

  /**
   * 화면 수치가 원본과 맞는지 본다. 슬롯이 엉뚱한 배열이나 키를 짚어도 타입은 통과할 수
   * 있다 — 실제로 새우 국가별의 값 칸은 「생산량」이 아니라 「합계」였다.
   */
  it('표본 수와 합계가 원본 JSON 과 맞는다', () => {
    const cases: [string, string, string, string][] = [
      // [품목 라벨, JSON 파일, 배열 키, 값 칸]
      ['새우', 'shrimp_industry_v1.json', '국가별', '합계'],
      ['새우', 'shrimp_industry_v1.json', '종구성', '생산량'],
      ['오징어', 'squid_industry_v1.json', '국가순위', '어획량'],
      ['오징어', 'squid_industry_v1.json', '어종구성', '어획량'],
      ['골뱅이', 'whelk_industry_v1.json', '종구성', '생산량'],
      ['골뱅이', 'whelk_industry_v1.json', '참골뱅이상위국', '어획량'],
    ];
    // 고등어는 배열이 한 겹 안에 있어(`위판등급.rows`) 따로 센다.
    const mackerel = JSON.parse(
      readFileSync(join(ROOT, 'public/data/mackerel_industry_v1.json'), 'utf8'),
    ) as Record<string, { rows: Record<string, unknown>[] }>;

    const rendered = SETS.map(([, slots]) => allSlots(slots as never))
      .flat()
      .filter((s) => s.cockpitExtra)
      .map(renderExtra)
      .join('\n');

    for (const [key, valueKey] of [['위판등급', '물량'], ['수입원산지', '수입량']] as const) {
      const rows = mackerel[key].rows;
      const total = rows.reduce((n, r) => n + (Number(r[valueKey]) || 0), 0);
      expect(rendered, `고등어 · ${key}: 표본 수 불일치`).toContain(`<dd>${rows.length}개</dd>`);
      expect(rendered, `고등어 · ${key}: 합계 불일치`).toContain(
        `<dd>${Math.round(total).toLocaleString('ko-KR')}</dd>`,
      );
    }

    for (const [name, file, key, valueKey] of cases) {
      const rows = readJson(file)[key];
      const total = rows.reduce((n, r) => n + (Number(r[valueKey]) || 0), 0);
      expect(rendered, `${name} · ${key}: 표본 ${rows.length}개가 화면에 없다`).toContain(
        `<dd>${rows.length}개</dd>`,
      );
      expect(rendered, `${name} · ${key}: 합계가 원본과 다르다`).toContain(
        `<dd>${Math.round(total).toLocaleString('ko-KR')}</dd>`,
      );
    }
  });

  /** 잘린 항목이 있으면 그 사실을 밝혀야 한다. 그래프만 보면 상위가 전부인 줄 안다. */
  it('상위 N개만 그리는 차트는 잘린 개수를 밝힌다', () => {
    const squid = allSlots(SQUID_CHART_SLOTS as never).map(renderExtra).join('');
    const rows = readJson('squid_industry_v1.json')['국가순위'];
    expect(squid).toContain('차트에 없음');
    expect(squid).toContain(`<dd>${rows.length - 12}개</dd>`);
  });
});
