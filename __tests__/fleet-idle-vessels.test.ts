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
    // 2026-09-02 선장 사고보고서(8/18): 손상은 로프가드가 아니라 프로펠러 볼트 3개 파손
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).toContain('프로펠러 볼트 3개 파손');
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).not.toContain('로프가드');
    const damage = FLEET_IDLE_NOTES.MOAMARI.lines.find((line) => line.label.startsWith('손상'))!;
    expect(damage.text).toContain('프로펠러 볼트 3개 파손');
    expect(damage.text).toContain('잠수부 점검');
    const cause = FLEET_IDLE_NOTES.MOAMARI.lines.find((line) => line.label.startsWith('사고 경위'))!;
    expect(cause.text).toContain('SEIN KASAMA');
    expect(cause.text).toContain('ASTERN');
    // 2026-09-02: 계약(항해 24~26일·일 $41,000)과 현재 속도 30일을 분리해 적는다
    const labels = FLEET_IDLE_NOTES.MOAMARI.lines.map((line) => line.label);
    expect(labels).toContain('예인 계약');
    expect(labels).toContain('예인 진행 (예상)');
    expect(labels).toContain('예인료 (계약 확정 / 총액 예상)');
    const contract = FLEET_IDLE_NOTES.MOAMARI.lines.find((line) => line.label === '예인 계약')!;
    expect(contract.text).toContain('24~26일');
    expect(contract.text).toContain('$41,000');
    const fee = FLEET_IDLE_NOTES.MOAMARI.lines.find((line) => line.label.startsWith('예인료'))!;
    expect(fee.text).toContain('17억원');
    expect(fee.text).toContain('$16.4만~24.6만');
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).toContain('계약 항해 24~26일');
    // 확정과 예상을 섞지 않는다 — 도착일·총액은 예상치로만 적는다
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).toContain('예상');
    const split = FLEET_IDLE_NOTES.MOAMARI.lines.find((line) => line.label === '확정 / 예상 구분')!;
    expect(split.text).toContain('전부 예상치');
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
