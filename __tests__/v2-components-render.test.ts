import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HeroZone from '../components/v2/HeroZone';
import PillTabs from '../components/v2/PillTabs';

describe('Deep Sea Command V2 — HeroZone', () => {
  it('kpi 유형: 타이틀·주인공 KPI·단위·보조 KPI를 렌더한다 (W-02 단위 병기)', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HeroZone, {
        variant: 'kpi',
        title: '시장 동향',
        subtitle: '방콕 SKJ 어가 기준',
        primaryKpi: { label: '방콕 SKJ 현물가', value: 1900, unit: '($/MT)' },
        secondaryKpis: [{ label: '주간 변동', value: 110, unit: '($/MT)' }],
      }),
    );

    expect(markup).toContain('시장 동향');
    expect(markup).toContain('($/MT)');
    expect(markup).toContain('방콕 SKJ 현물가');
    expect(markup).toContain('주간 변동');
  });

  it('map 유형: 경고→권고 패널이 SIT 줄과 TAK 권고 줄을 함께 렌더한다 (스펙 §3)', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HeroZone, {
        variant: 'map',
        title: '물류·가공',
        warning: {
          title: '콜드체인 경보',
          lines: ['방콕 하역 대기 3척 13,764MT'],
          recommend: '냉동 운반선 우선 배정 권고',
        },
      }),
    );

    expect(markup).toContain('콜드체인 경보');
    expect(markup).toContain('방콕 하역 대기 3척 13,764MT');
    expect(markup).toContain('냉동 운반선 우선 배정 권고');
  });

  it('vessel 유형: 배경 슬롯과 하단 스트립을 렌더한다 (이미지 교체 가능 구조, 스펙 §6)', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HeroZone, {
        variant: 'vessel',
        title: '선단 운영',
        background: React.createElement('img', { src: '/heroes/seiner.webp', alt: '' }),
        strip: React.createElement('div', null, '제701태창호'),
      }),
    );

    expect(markup).toContain('/heroes/seiner.webp');
    expect(markup).toContain('제701태창호');
  });
});

describe('Deep Sea Command V2 — VesselTopSVG', () => {
  it('데이터 intensity가 있는 해치만 발광 필터를 받는다 (장식 발광 금지, V2 §5)', async () => {
    const { default: VesselTopSVG } = await import('../components/v2/VesselTopSVG');
    const markup = renderToStaticMarkup(
      React.createElement(VesselTopSVG, {
        kind: 'carrier',
        hatches: [
          { id: 'h1', intensity: 0.9 },
          { id: 'h2', intensity: 0 },
        ],
      }),
    );

    // 발광 필터는 intensity>0 해치에만 — 정확히 1회 등장
    expect(markup.match(/url\(#vsl-glow\)/g)?.length).toBe(1);
    // carrier는 크레인 마스트 2기 렌더
    expect(markup).toContain('선박 상면 도면');
  });
});

describe('Deep Sea Command V2 — PillTabs', () => {
  it('탭 라벨을 렌더하고 활성 탭에 aria-selected를 단다', () => {
    const markup = renderToStaticMarkup(
      React.createElement(PillTabs, {
        tabs: [
          { key: 's1', label: '원료 수급' },
          { key: 's2', label: '가공·생산', badge: 3 },
        ],
        activeKey: 's1',
        onChange: () => {},
      }),
    );

    expect(markup).toContain('원료 수급');
    expect(markup).toContain('가공·생산');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('>3<');
  });
});
