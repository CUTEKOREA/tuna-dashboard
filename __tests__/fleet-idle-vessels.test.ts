import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FleetIdleVesselPanel } from '@/components/FleetCharts';
import {
  FLEET_IDLE_NOTES,
  FLEET_IDLE_THRESHOLD_DAYS,
  resolveFleetIdleVessels,
} from '@/lib/fleet-idle-vessels';

describe('fleet idle vessel detection', () => {
  it('reports only vessels past the idle threshold, longest gap first', () => {
    const idle = resolveFleetIdleVessels();

    expect(idle.length).toBeGreaterThan(0);
    for (const row of idle) {
      expect(row.idleDays).toBeGreaterThanOrEqual(FLEET_IDLE_THRESHOLD_DAYS);
      expect(row.forgoneMt).toBe(Math.round(row.dailyAverageMt * row.idleDays));
      expect(row.regionSharePct).toBeGreaterThan(0);
    }
    expect([...idle].sort((a, b) => b.idleDays - a.idleDays)).toEqual(idle);
  });

  it('keeps MOAMARI listed with its towing note while the gap lasts', () => {
    const moamari = resolveFleetIdleVessels().find((row) => row.vessel === 'MOAMARI');

    expect(moamari).toMatchObject({ region: '태평양', lastCatchDate: '2026-08-13' });
    expect(moamari!.dailyAverageMt).toBeCloseTo(22.89, 2);
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).toContain('젠산');
    expect(FLEET_IDLE_NOTES.MOAMARI.lines.map((line) => line.label)).toContain('예인');
    expect(FLEET_IDLE_NOTES.MOAMARI.lines.every((line) => line.text.length > 0)).toBe(true);
  });

  it('hides a vessel once it lands a catch again', () => {
    // 임계치를 아주 크게 잡으면 어떤 선박도 남지 않아야 한다 — 재개 시 목록에서 빠지는 것과 같은 경로.
    expect(resolveFleetIdleVessels(10_000)).toEqual([]);
  });

  it('renders the idle panel without leaking protected detail', () => {
    const markup = renderToStaticMarkup(React.createElement(FleetIdleVesselPanel));

    expect(markup).toContain('가동 중단 선박');
    expect(markup).toContain('MOAMARI');
    expect(markup).not.toMatch(/[NS]\d{4}\s+[EW]\d{5}/);
  });
});
