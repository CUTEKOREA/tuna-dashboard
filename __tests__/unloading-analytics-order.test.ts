import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import UnloadingAnalytics from '@/components/UnloadingAnalytics';

function vessel(
  name: string,
  dateRange: string,
  timeline: Array<{ date: string; dailyAmount: number }>,
) {
  return {
    name,
    dateRange,
    status: dailyAmountTotal(timeline) > 0 ? '하역완료' : '하역대기',
    reportedTotal: 1000,
    actualTotal: dailyAmountTotal(timeline),
    surplus: 0,
    species: [],
    timeline: timeline.map((entry) => ({
      ...entry,
      time: entry.dailyAmount > 0 ? '08:00 ~ 18:00' : '-',
      targetHol: '-',
      cumAmount: entry.dailyAmount,
      quality: '-',
    })),
  };
}

function dailyAmountTotal(timeline: Array<{ dailyAmount: number }>): number {
  return timeline.reduce((sum, entry) => sum + entry.dailyAmount, 0);
}

describe('선박 벤치마크 최근 작업 순서', () => {
  it('마지막 실제 하역일이 최신인 선박부터 표시하고 실적 없는 대기선은 마지막에 둔다', () => {
    const vessels = {
      sameDay: vessel('M/V 4월26일선', '2026.04.26 ~ 2026.04.26', [
        { date: '4/26', dailyAmount: 180 },
      ]),
      waiting: vessel('M/V 대기선', '2026.08.20 하역 예정', [
        { date: '8/20', dailyAmount: 0 },
      ]),
      rangeEnd: vessel('M/V 4월27일선', '2026.04.26 ~ 2026.04.27', [
        { date: '4/26~27', dailyAmount: 190 },
      ]),
      monthRange: vessel('M/V 5월1일선', '2026.04.30 ~ 2026.05.01', [
        { date: '4/30~5/01', dailyAmount: 195 },
      ]),
      summaryOnly: {
        ...vessel('M/V 5월3일선', '2026.05.02 ~ 2026.05.03', []),
        status: '하역완료',
        actualTotal: 240,
      },
      december: vessel('M/V 2025년선', '2025.12.30 ~ 2025.12.31', [
        { date: '12/31', dailyAmount: 210 },
      ]),
      crossYear: vessel('M/V 연도경계선', '2025.12.31 ~ 2026.01.02', [
        { date: '12/31~1/02', dailyAmount: 220 },
      ]),
      withFutureRest: {
        ...vessel('M/V 8월15일선', '2026.08.07 ~ 진행중', [
          { date: '8/15', dailyAmount: 350 },
          { date: '8/20', dailyAmount: 0 },
        ]),
        status: '하역중',
      },
      newestActual: {
        ...vessel('M/V 8월16일선', '2026.08.10 ~ 진행중', [
          { date: '8/16', dailyAmount: 320 },
        ]),
        status: '하역중',
      },
    };

    const markup = renderToStaticMarkup(
      React.createElement(UnloadingAnalytics, {
        selectedVessel: vessels.withFutureRest,
        vesselId: 'withFutureRest',
        allVessels: vessels,
        holdsData: {},
      }),
    );
    const tableBody = markup.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '';
    const names = Array.from(tableBody.matchAll(/M\/V [^<]+/g), match => match[0]);

    expect(names).toEqual([
      'M/V 8월16일선',
      'M/V 8월15일선',
      'M/V 5월3일선',
      'M/V 5월1일선',
      'M/V 4월27일선',
      'M/V 4월26일선',
      'M/V 연도경계선',
      'M/V 2025년선',
      'M/V 대기선',
    ]);
  });
});
