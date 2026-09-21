import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FleetIdleVesselPanel } from '@/components/FleetCharts';
import { fleetDailyPublic } from '@/lib/data/fleet-daily-public';
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
      // forgoneMt 는 반올림 전 평균으로 계산되고 dailyAverageMt 는 소수 2자리로 내보낸다.
      // 둘을 정확히 맞추면 어느 날은 1 차이로 깨진다(2026-09-09: 398 vs 399).
      expect(Math.abs(row.forgoneMt - row.dailyAverageMt * row.idleDays)).toBeLessThanOrEqual(1);
      expect(row.regionSharePct).toBeGreaterThan(0);
    }
    expect([...idle].sort((a, b) => b.idleDays - a.idleDays)).toEqual(idle);
  });

  it('keeps MOAMARI listed with its towing note while the gap lasts', () => {
    const moamari = resolveFleetIdleVessels().find((row) => row.vessel === 'MOAMARI');

    expect(moamari).toMatchObject({ region: '태평양', lastCatchDate: '2026-08-13' });
    /* 일평균은 계열이 하루 늘 때마다 다시 계산된다 - 값을 못박으면 매일 깨진다
     * (2026-09-08 에 22.43 → 22.28). 지켜야 할 것은 «계열에서 나온 값인가» 다. */
    expect(moamari!.dailyAverageMt).toBeGreaterThan(0);
    expect(Math.abs(moamari!.forgoneMt - moamari!.dailyAverageMt * moamari!.idleDays)).toBeLessThanOrEqual(1);
    expect(moamari!.idleDays).toBeGreaterThan(0);
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).toContain('젠산');
    // 2026-09-02 선장 사고보고서(8/18): 손상은 로프가드가 아니라 프로펠러 볼트 3개 파손
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).toContain('프로펠러 볼트 3개 파손');
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).not.toContain('로프가드');
    const damage = FLEET_IDLE_NOTES.MOAMARI.lines.find((line) => line.label.startsWith('손상'))!;
    expect(damage.text).toContain('프로펠러 볼트 3개 파손');
    expect(damage.text).toContain('잠수부 점검');
    // 카드는 line.text 를 그대로 출력한다 — 마크다운 강조를 쓰면 별표가 화면에 보인다
    for (const line of FLEET_IDLE_NOTES.MOAMARI.lines) expect(line.text).not.toContain('**');
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
    expect(fee.text).toContain('10/2 도착 기준 32일');
    expect(fee.text).toContain('$24.6만~32.8만');
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).toContain('계약 항해 24~26일');
    // 확정과 예상을 섞지 않는다 — 도착일·총액은 예상치로만 적는다
    expect(FLEET_IDLE_NOTES.MOAMARI.headline).toContain('예상');
    const split = FLEET_IDLE_NOTES.MOAMARI.lines.find((line) => line.label === '확정 / 예상 구분')!;
    expect(split.text).toContain('전부 예상치');
    expect(FLEET_IDLE_NOTES.MOAMARI.lines.every((line) => line.text.length > 0)).toBe(true);
  });

  it('re-reads the towing note against every new daily report', () => {
    /* 도착 예정일은 일일보고 비고에만 있고 보고마다 바뀐다. 9/8~9/11 네 번 반영하는 동안
     * 서술이 9/7 의 「10/4 · 34일 · 139만불」에 그대로 남았다(실제 보고는 10/15·10/16·10/11·10/20).
     * 새 보고를 넣으면 이 테스트가 깨진다 - 비고를 대조하고 서술과 asOf 를 함께 고친다. */
    expect(FLEET_IDLE_NOTES.MOAMARI.asOf).toBe(fleetDailyPublic._meta.latestReportDate);
  });

  it('does not call a vessel idle when its load rose on unreported days', () => {
    /* S/JUP 은 8/12 이후 보고일 어획이 전부 «-» 인데 선적량이 65 → 365 로 늘었다(9/14 보고 기준).
     * 보고일 어획만 보던 판정은 «무실적 22보고일 · 기회손실 약 245 MT» 로 잘못 띄웠다. */
    const idle = resolveFleetIdleVessels();
    expect(idle.find((row) => row.vessel === 'S/JUP')).toBeUndefined();
    // MOAMARI 는 8/14→8/18 사이 선적량이 745→760 으로 늘었다(입항 전 주말 어획). 그 뒤 전재로 비어
    // 더 늘지 않았으므로 가동 중단이 맞고, 공백은 8/18 부터 센다.
    const moamari = idle.find((row) => row.vessel === 'MOAMARI')!;
    expect(moamari).toMatchObject({ lastCatchDate: '2026-08-13', lastLoadIncreaseDate: '2026-08-18' });
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
