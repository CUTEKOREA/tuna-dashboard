import { describe, expect, it } from 'vitest';

import * as operations from '@/lib/unloading-operations';

type VesselChoice = { id: string; status: string };
type TimelineInput = { date: string; dailyAmount: number; cumAmount: number };
type ChartPoint = {
  name: string;
  dailyAmount: number;
  cumulativeAmount: number;
  isNoWorkDay: boolean;
};

const resolveSelectedVesselId = (operations as unknown as {
  resolveSelectedVesselId?: (vessels: VesselChoice[], requestedId?: string) => string | null;
}).resolveSelectedVesselId;

const buildContinuousUnloadingChartData = (operations as unknown as {
  buildContinuousUnloadingChartData?: (timeline: TimelineInput[], dateRange: string) => ChartPoint[];
}).buildContinuousUnloadingChartData;

describe('하역 선박 선택과 연속 날짜 시계열', () => {
  const vessels: VesselChoice[] = [
    { id: 'hikari-bangkok-2026-07', status: '하역중' },
    { id: 'sein-venus', status: '하역완료 (Completed)' },
  ];

  it('명시 선택이 없으면 현재 하역 중인 HIKARI 1을 기본 선택한다', () => {
    expect(resolveSelectedVesselId?.(vessels, '')).toBe('hikari-bangkok-2026-07');
  });

  it('사용자가 명시한 완료 선박 선택은 유지한다', () => {
    expect(resolveSelectedVesselId?.(vessels, 'sein-venus')).toBe('sein-venus');
  });

  it('SEIN VENUS 작업 공백일을 0 MT와 직전 누계로 채운다', () => {
    const timeline: TimelineInput[] = [
      { date: '8/7', dailyAmount: 174.64, cumAmount: 174.64 },
      { date: '8/8', dailyAmount: 109.07, cumAmount: 283.71 },
      { date: '8/10', dailyAmount: 331.47, cumAmount: 615.18 },
      { date: '8/11', dailyAmount: 462.81, cumAmount: 1077.99 },
      { date: '8/13', dailyAmount: 159.59, cumAmount: 1237.58 },
      { date: '8/14', dailyAmount: 424.78, cumAmount: 1662.36 },
      { date: '8/15', dailyAmount: 350.74, cumAmount: 2013.1 },
      { date: '8/17', dailyAmount: 312.57, cumAmount: 2325.67 },
      { date: '8/18', dailyAmount: 339.73, cumAmount: 2665.4 },
      { date: '8/19', dailyAmount: 277.87, cumAmount: 2943.27 },
      { date: '8/20', dailyAmount: 147.49, cumAmount: 3090.76 },
      { date: '8/21', dailyAmount: 148.8, cumAmount: 3239.56 },
      { date: '8/22', dailyAmount: 89.52, cumAmount: 3329.08 },
    ];

    const points = buildContinuousUnloadingChartData?.(
      timeline,
      '2026.08.07 ~ 2026.08.22',
    );

    expect(points?.filter((point) => point.isNoWorkDay).map((point) => point.name)).toEqual([
      '8/9',
      '8/12',
      '8/16',
    ]);
    expect(points?.find((point) => point.name === '8/12')).toMatchObject({
      dailyAmount: 0,
      cumulativeAmount: 1077.99,
    });
  });

  it('하역 전 선적기록은 그래프에서 제외하고 다일 보고 구간은 무작업일로 만들지 않는다', () => {
    const points = buildContinuousUnloadingChartData?.(
      [
        { date: '7/2~7/4', dailyAmount: 0, cumAmount: 0 },
        { date: '4/29~30', dailyAmount: 152.33, cumAmount: 349.36 },
        { date: '5/2', dailyAmount: 125.25, cumAmount: 800.11 },
      ],
      '2026.04.29 ~ 2026.05.02',
    );

    expect(points?.map((point) => point.name)).toEqual(['4/29~30', '5/1', '5/2']);
    expect(points?.find((point) => point.name === '5/1')).toMatchObject({
      dailyAmount: 0,
      cumulativeAmount: 349.36,
      isNoWorkDay: true,
    });
  });

  it('같은 날 복수 양수 보고는 일일량을 합치고 누계 최댓값으로 한 점만 만든다', () => {
    const points = buildContinuousUnloadingChartData?.(
      [
        { date: '8/7', dailyAmount: 100, cumAmount: 150 },
        { date: '8/7', dailyAmount: 50, cumAmount: 100 },
        { date: '8/9', dailyAmount: 25, cumAmount: 175 },
      ],
      '2026.08.07 ~ 2026.08.09',
    );

    expect(points).toEqual([
      { name: '8/7', dailyAmount: 150, cumulativeAmount: 150, isNoWorkDay: false },
      { name: '8/8', dailyAmount: 0, cumulativeAmount: 150, isNoWorkDay: true },
      { name: '8/9', dailyAmount: 25, cumulativeAmount: 175, isNoWorkDay: false },
    ]);
  });
});
