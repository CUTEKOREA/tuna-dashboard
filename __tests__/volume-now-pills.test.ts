import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VolumeBarChart, VolumeBarShape } from '../components/charts/VolumeBar';
import { NowCard } from '../components/v2/NowCard';
import OperationPills from '../components/v2/OperationPills';

describe('VolumeBar', () => {
  it('최근 고시 막대와 평균 기준선을 그린다', () => {
    const markup = renderToStaticMarkup(
      React.createElement(VolumeBarChart, {
        data: [
          { label: '07.30', value: 1790 },
          { label: '08.06', value: 1900 },
        ],
        name: '방콕 SKJ',
        unit: '($/MT)',
      }),
    );

    expect(markup).toContain('data-volume-bar="true"');
    expect(markup).toContain('평균');
    expect(markup).toContain('($/MT)');
  });

  it('점이 1개면 차트를 그리지 않는다', () => {
    const markup = renderToStaticMarkup(
      React.createElement(VolumeBarChart, {
        data: [{ label: '08.06', value: 1900 }],
        name: '방콕 SKJ',
        unit: '($/MT)',
      }),
    );
    expect(markup).toBe('');
  });

  it('3면 기둥 도형을 그린다', () => {
    const markup = renderToStaticMarkup(
      React.createElement(VolumeBarShape, {
        x: 10,
        y: 20,
        width: 24,
        height: 80,
        highlighted: true,
      }),
    );
    expect(markup).toContain('<path');
    expect(markup).toContain('<rect');
  });
});

describe('NowCard', () => {
  it('활성 카드에만 지금 칩을 붙인다', () => {
    const now = renderToStaticMarkup(
      React.createElement(NowCard, { now: true, eyebrow: '하역', title: '세인비너스' }),
    );
    const idle = renderToStaticMarkup(
      React.createElement(NowCard, { now: false, eyebrow: '대기', title: '히카리' }),
    );
    expect(now).toContain('지금');
    expect(now).toContain('data-now="true"');
    expect(idle).not.toContain('지금');
    expect(idle).toContain('data-now="false"');
  });
});

describe('OperationPills', () => {
  it('운영 4메뉴를 한글로 나열하고 현재 페이지만 표시한다', () => {
    const markup = renderToStaticMarkup(
      React.createElement(OperationPills, {
        activeKey: 'fleet',
        onSelect: () => {},
      }),
    );
    expect(markup).toContain('시장 동향');
    expect(markup).toContain('선단 운영');
    expect(markup).toContain('하역 현황');
    expect(markup).toContain('물류·가공');
    expect(markup).toContain('aria-current="page"');
    expect(markup).not.toContain('Fleet');
  });
});
