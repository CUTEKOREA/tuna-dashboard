/**
 * 「시장 이해 > 문어」 가드.
 *
 * 1. 단계 10개(s01~s09 + x01)가 한 페이지에 이어서 그려지고 탭 수와 절 수가 같다.
 * 2. 보고서 원문 핵심 수치가 화면에 있다(재계산 없이 원문 표기 그대로).
 * 3. 세번 경계 문구가 있다. 0307521000 만 문어 전용, 1605550000 은 종 분리 없음, FAO 한국은 3종 합.
 * 4. 옛 낙지 페이지 자료를 읽지 않는다(`/api/octopus/kcs`·옛 octopus JSON).
 * 5. 신라에스지는 「내부 검토」로 라벨하고 골뱅이 캔 가동률은 문어 실적이 아니라고 적는다.
 * 6. L-01 한글, 출판형 문체, 개인 이름 없음.
 */
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import OctopusIndustryDashboard, {
  OCTOPUS_CHART_SLOTS,
} from '@/components/market-understanding/OctopusIndustryDashboard';
import {
  octopusFrozenTradeRows,
  octopusPreparedTradeRows,
} from '@/components/market-understanding/OctopusCharts';
import { getOctopusIndustryData } from '@/lib/data/octopus-industry';
import { isActiveMenu, getDashboardTitle, SIDEBAR_SECTIONS } from '@/lib/dashboard-registry';
import {
  OCTOPUS_BRIEFING_POINTS,
  OCTOPUS_NARRATIVES,
  OCTOPUS_SOURCE_NOTES,
} from '@/lib/octopus-industry-content';

const KEYS = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 'x01'];
const html = renderToStaticMarkup(React.createElement(OctopusIndustryDashboard));
const PROSE = OCTOPUS_NARRATIVES.flatMap((s) => [s.title, s.question, s.lede, ...s.paragraphs]).join('\n');
const TEXT = [
  PROSE,
  ...OCTOPUS_NARRATIVES.flatMap((s) => s.facts.map((f) => `${f.label} ${f.value} ${f.note ?? ''}`)),
].join('\n');
const FILES = [
  'components/market-understanding/OctopusIndustryDashboard.tsx',
  'components/market-understanding/OctopusCharts.tsx',
  'lib/octopus-industry-content.ts',
  'lib/data/octopus-industry.ts',
  'scripts/build_octopus_industry_data.py',
].map((f) => readFileSync(join(process.cwd(), f), 'utf8'));

describe('문어 산업 페이지 - 구조', () => {
  it('단계 키가 10개이고 탭 수와 절 수가 같다', () => {
    expect(OCTOPUS_NARRATIVES.map((n) => n.key)).toEqual(KEYS);
    const tabs = new Set(html.match(/id="octopus-industry-tab-[^"]+"/g) ?? []);
    const stages = new Set(html.match(/id="octopus-stage-[^"]+"/g) ?? []);
    expect(tabs.size).toBe(KEYS.length);
    expect(stages.size).toBe(tabs.size);
    // 연속 모드: 페이저 손잡이가 없고 이동 단위는 「단계」다
    expect(html).not.toContain('stageNext');
    expect(html).toContain('단계에서 보기');
    expect(html).toContain('aria-label="맨 위로"');
  });

  it('탭 라벨에 부제가 붙지 않는다', () => {
    for (const n of OCTOPUS_NARRATIVES) {
      expect(n.title.split(' - ')[0]).not.toContain(' - ');
      expect(n.title.split(' - ')[0].length).toBeLessThanOrEqual(8);
    }
  });

  it('브리핑이 모든 단계에 하나씩 있고 차트는 실재하는 단계에만 달린다', () => {
    for (const key of KEYS) {
      expect(OCTOPUS_BRIEFING_POINTS.some((b) => b.stage === key), key).toBe(true);
    }
    for (const key of Object.keys(OCTOPUS_CHART_SLOTS)) {
      expect(KEYS).toContain(key);
    }
    for (const slot of Object.values(OCTOPUS_CHART_SLOTS).flat()) {
      expect(slot.title).toMatch(/[가-힣]/);
      expect(slot.caption.length).toBeGreaterThan(10);
      expect(slot.telemetry.status).toBe('STATIC');
    }
  });

  it('본문 낫표는 실제 차트 제목만 가리킨다', () => {
    const titles = new Set(Object.values(OCTOPUS_CHART_SLOTS).flat().map((s) => s.title));
    for (const n of OCTOPUS_NARRATIVES) {
      for (const m of [n.lede, ...n.paragraphs].join('\n').matchAll(/「([^」]+)」/g)) {
        expect(titles.has(m[1]), `${n.key}: 「${m[1]}」 차트가 없다`).toBe(true);
      }
    }
  });

  it('레지스트리에 새 키로만 등록된다', () => {
    expect(isActiveMenu('octopus-industry')).toBe(true);
    expect(isActiveMenu('octopus')).toBe(false);
    expect(getDashboardTitle('octopus-industry')).toBe('문어');
    const understanding = SIDEBAR_SECTIONS.find((s) => s.section === 'understanding')?.items.map((i) => i.key) ?? [];
    expect(understanding.indexOf('octopus-industry')).toBe(understanding.indexOf('pollock-industry') + 1);
    const page = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    expect(page).toContain("'octopus-industry': <OctopusIndustryDashboard />");
    // 옛 라우트는 404 그대로
    expect(readFileSync(join(process.cwd(), 'app/octopus/page.tsx'), 'utf8')).toContain('notFound()');
  });
});

describe('문어 산업 페이지 - 수치와 경계', () => {
  it('보고서 핵심 수치가 화면에 있다', () => {
    for (const probe of [
      '4,502', // 히어로·04단계: 2025 냉동 문어
      '9.48',
      '4,270만 달러',
      '389,920',
      '400,787',
      '110,559',
      '18,386',
      '10,111',
      '8,029',
      '20.6%',
      '23,557',
      '16,443',
      '27,153',
      '1,569',
      '5,995',
      '6.06',
      '2,408만 달러',
      '1,134만 달러',
      '83%',
      '78%',
      '1,888',
      '10.48',
      '416',
      '285톤에서 7월 124톤',
      '623,079',
      '1,955',
      '687',
      '127',
      '2,093,904',
      '4,794,422',
      '1,618,876',
      '133곳',
      '12곳',
      '187건',
      '91곳',
      '211',
      '72%',
      '9,525',
      '40.5%',
      'KORP-249',
      '1,195천 캔',
      '9,219',
      '62.6%',
    ]) {
      expect(html, `화면에 없음: ${probe}`).toContain(probe);
    }
  });

  it('세번 경계 문구가 화면에 있다', () => {
    expect(html).toContain('문어 전용');
    expect(html).toContain('0307521000');
    expect(html).toContain('1605550000');
    expect(html).toContain('종 분리 없음');
    expect(html).toContain('3종 합');
    expect(TEXT).toContain('한 차트에 두지 않는다');
    expect(TEXT).toMatch(/더하지 않는다/);
  });

  it('냉동 문어와 조제 문어류를 한 차트 데이터에 넣지 않는다', () => {
    const data = getOctopusIndustryData();
    const frozen = octopusFrozenTradeRows(data);
    const prepared = octopusPreparedTradeRows(data);
    expect(frozen.length).toBeGreaterThan(0);
    expect(prepared.length).toBeGreaterThan(0);
    for (const row of frozen) {
      expect(Object.keys(row).sort()).toEqual(['연도', '톤']);
      expect(row).not.toHaveProperty('조제문어류_톤');
      expect(row).not.toHaveProperty('냉동문어_톤');
    }
    for (const row of prepared) {
      expect(Object.keys(row).sort()).toEqual(['연도', '톤']);
      expect(row).not.toHaveProperty('냉동문어_톤');
      expect(row).not.toHaveProperty('조제문어류_톤');
    }
    const charts = readFileSync(join(process.cwd(), 'components/market-understanding/OctopusCharts.tsx'), 'utf8');
    const barBlocks = charts.match(/<BarChart[\s\S]*?<\/BarChart>/g) ?? [];
    expect(barBlocks.length).toBe(2);
    for (const block of barBlocks) {
      const hasFrozenHs = block.includes('0307521000');
      const hasPreparedHs = block.includes('1605550000');
      expect(hasFrozenHs && hasPreparedHs, '두 세번이 한 BarChart에 있다').toBe(false);
      expect(block.includes('냉동문어_톤') && block.includes('조제문어류_톤')).toBe(false);
    }
    expect(html).not.toContain('냉동 문어와 조제 문어류 수입');
    expect(html).toContain('냉동 문어 수입 2019~2025 (톤)');
    expect(html).toContain('조제 문어류 수입 2022~2025 (톤)');
  });

  it('신라에스지는 내부 검토로 라벨하고 문어 실적과 떼어 놓는다', () => {
    const s09 = OCTOPUS_NARRATIVES.find((n) => n.key === 's09')!;
    expect(s09.title.startsWith('내부 검토')).toBe(true);
    expect(s09.lede).toContain('내부 검토');
    expect(s09.lede).toContain('문어 시장 크기가 아니다');
    const rate = s09.facts.find((f) => f.value.includes('40.5%'))!;
    expect(rate.note).toContain('문어 실적 아님');
    // 다른 단계는 신라에스지를 시장 크기로 쓰지 않는다
    for (const n of OCTOPUS_NARRATIVES.filter((x) => x.key !== 's09')) {
      expect([n.lede, ...n.paragraphs].join('\n')).not.toContain('신라에스지');
    }
    expect(OCTOPUS_BRIEFING_POINTS.find((b) => b.stage === 's09')?.headline).toContain('내부 검토');
  });

  it('옛 낙지 페이지 자료를 쓰지 않는다', () => {
    for (const source of FILES) {
      expect(source).not.toContain('octopus_real');
      expect(source).not.toContain('/api/octopus/kcs');
      expect(source).not.toContain('octopus_global_catch');
      expect(source).not.toContain('octopus_fta_quarterly');
    }
    expect(html).not.toContain('3,538,798');
    expect(html).not.toContain('OCM');
    expect(html).not.toContain('낙지 전략');
  });

  it('데이터 파일은 1MB 미만이고 세번 경계와 합산 금지를 적어 둔다', () => {
    const path = join(process.cwd(), 'public/data/octopus_industry_v1.json');
    expect(statSync(path).size).toBeLessThan(1_000_000);
    const data = getOctopusIndustryData();
    expect(JSON.stringify(data._meta.세번경계)).toContain('0307521000');
    expect(String(data._meta.합산금지)).toContain('더하거나');
    // 조제 세번은 2022년에 생겼다. 그 전을 0으로 채우지 않는다
    expect(data.수입.연도별.find((r) => r.연도 === '2019')?.조제문어류_톤).toBeNull();
  });
});

describe('문어 산업 페이지 - 문체와 표기', () => {
  it('사용자 노출 문자열은 한글이다 (L-01)', () => {
    for (const line of [...OCTOPUS_BRIEFING_POINTS.map((b) => b.text), ...OCTOPUS_SOURCE_NOTES]) {
      expect(line).toMatch(/[가-힣]/);
      expect(line.length).toBeGreaterThan(10);
    }
  });

  it('출판형 문체를 지킨다', () => {
    const all = [TEXT, ...OCTOPUS_BRIEFING_POINTS.map((b) => `${b.headline ?? ''} ${b.text}`), ...OCTOPUS_SOURCE_NOTES].join('\n');
    expect(all).not.toContain('—');
    expect(all).not.toMatch(/[«»]/);
    expect(all).not.toMatch(/이 보고서는|이 페이지는|확인하지 못했다/);
    expect(all).not.toContain('387건');
    expect(all).not.toContain('기계 대조');
    expect(all).not.toContain('재수집이 없어');
    expect(all).not.toContain('개인 이름은 뺐다');
    expect(PROSE).not.toMatch(/더해도 16/);
    expect(PROSE).not.toContain('5,995톤은 중국이 78%');
    expect(PROSE).toContain('조제 문어류 수입액의 78%가 중국');
    expect(PROSE).toContain('각 연도 1~10월 평균');
    expect(PROSE).toContain('같은 기간 누계 소비량');
    expect(TEXT).toContain('원장 6,305,473 kg(6,305 t)이고 보고서는 6,306 t로 적었다(차이 원인 미확인)');
    expect(TEXT).not.toContain('6,305,473 kg(반올림 차)');
    expect(TEXT).toContain('보고서 4,270만 달러, 원장 4,268만 달러');
    const products = OCTOPUS_NARRATIVES.find((n) => n.key === 's06')!.facts.find((f) => f.value.includes('1,955'))!;
    expect(products.asOf).toBe('2026-09-02 기준 등록·생산실적 통합 목록');
    const otherHs = OCTOPUS_NARRATIVES.find((n) => n.key === 'x01')!.terms.find((t) => t.term === '0307519000')!;
    expect(otherHs.description).not.toContain('활낙지');
    expect(otherHs.description).toContain('문어 활어 전용이 아니다');
  });

  it('개인 이름을 올리지 않는다', () => {
    expect(html).not.toContain('셰프');
    expect(html).not.toContain('정호영');
    expect(html).not.toContain('이동건');
    expect(html).toContain('남선푸드');
    expect(html).toContain('블루칩글로벌');
  });
});
