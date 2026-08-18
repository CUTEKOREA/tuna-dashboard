import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { HUB_ID, RFMO_ID } from '../lib/chart-palette';
import {
  TUNA_FALLBACK_COLORS,
  TUNA_ROLE,
  colorForCountry,
  colorForHub,
  colorForRfmo,
  colorForSeries,
  colorForSpecies,
} from '../lib/tuna-chart-colors';

const WHITE = '#ffffff';

function relativeLuminance(hex: string): number {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((value) => parseInt(value, 16) / 255) ?? [];
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe('참치 차트 색', () => {
  it('같은 종은 집계·위젯에서 같은 색이다', () => {
    expect(colorForSpecies('가다랑어')).toBe(colorForSeries('가다랑어 (통조림용)', 4));
    expect(colorForSpecies('황다랑어')).toBe(colorForSeries('황다랑어 (사시미용)', 1));
    expect(colorForSpecies('눈다랑어')).toBe(colorForSeries('Skipjack'.replace('Skipjack', '눈다랑어')));
    expect(colorForSeries('가다랑어', 0)).toBe(colorForSeries('Skipjack', 7));
    expect(colorForSeries('황다랑어', 0)).toBe(colorForSeries('Yellowfin', 3));
  });

  it('오징어 보라를 쓰지 않는다', () => {
    const names = ['가다랑어', '황다랑어', '눈다랑어', '날개다랑어', 'ICCAT', '아비장', '대한민국'];
    for (const name of names) {
      expect(colorForSeries(name), name).not.toBe('#7c3aed');
    }
    expect(TUNA_FALLBACK_COLORS).not.toContain('#7c3aed');
  });

  it('한국은 붉은 강조, 다른 나라는 물량색이다', () => {
    expect(colorForCountry('대한민국')).toBe(TUNA_ROLE.highlight);
    expect(colorForCountry('일본')).toBe(TUNA_ROLE.volume);
    expect(colorForSeries('대한민국', 3)).toBe(TUNA_ROLE.highlight);
  });

  it('항구·기구 색이 서로 겹치지 않는다', () => {
    const hubs = ['방콕', '만타', '세이셸', '아비장', '비고'].map(colorForHub);
    expect(new Set(hubs).size).toBe(5);
    const rfmos = ['WCPFC', 'IOTC', 'IATTC', 'ICCAT', 'CCAMLR'].map(colorForRfmo);
    expect(new Set(rfmos).size).toBe(5);
    expect(colorForRfmo('WCPFC')).not.toBe(colorForRfmo('ICCAT'));
    expect(colorForRfmo('IATTC')).not.toBe(TUNA_ROLE.processed);
  });

  it('항구·기구는 선단 DB 정체성 집과 같다', () => {
    expect(colorForHub('방콕')).toBe(HUB_ID.bkk);
    expect(colorForHub('만타')).toBe(HUB_ID.mnt);
    expect(colorForHub('세이셸')).toBe(HUB_ID.sey);
    expect(colorForHub('아비장')).toBe(HUB_ID.abj);
    expect(colorForHub('비고')).toBe(HUB_ID.vig);
    expect(colorForRfmo('WCPFC')).toBe(RFMO_ID.WCPFC);
    expect(colorForRfmo('IOTC')).toBe(RFMO_ID.IOTC);
    expect(colorForRfmo('IATTC')).toBe(RFMO_ID.IATTC);
    expect(colorForRfmo('ICCAT')).toBe(RFMO_ID.ICCAT);
    expect(TUNA_ROLE.volume).toBe(HUB_ID.bkk);
  });

  it('고정색이 흰 지면에서 그래픽 대비 3:1을 넘는다', () => {
    const colors = [
      colorForSpecies('가다랑어'),
      colorForSpecies('황다랑어'),
      colorForSpecies('날개다랑어'),
      TUNA_ROLE.highlight,
      TUNA_ROLE.processed,
    ];
    for (const color of colors) {
      expect(contrastRatio(color, WHITE), color).toBeGreaterThanOrEqual(3);
    }
  });

  it('차트 파일이 인덱스 순환 팔레트와 오징어 보라를 쓰지 않는다', () => {
    const catchCharts = readFileSync(
      join(process.cwd(), 'components/market-understanding/TunaCatchCharts.tsx'),
      'utf8',
    );
    const widgets = readFileSync(
      join(process.cwd(), 'components/market-understanding/TunaIndustryChart.tsx'),
      'utf8',
    );
    expect(catchCharts).toContain('colorForSpecies');
    expect(widgets).toContain('colorForSeries');
    expect(catchCharts).not.toMatch(/#7c3aed/);
    expect(widgets).not.toMatch(/SERIES_COLORS/);
    expect(widgets).not.toMatch(/#7c3aed/);
  });
});
