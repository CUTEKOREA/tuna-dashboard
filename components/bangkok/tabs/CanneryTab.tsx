'use client';

import { useState } from 'react';
import Chart, { Legend, type Serie } from '../../cosmo/Chart';
import { Grid, Panel, Pills, Sec, Table } from '../../panofi/PanofiUi';
import {
  aggregateWeeklyAvg,
  bangkokCanneries,
  bangkokCanneryPanel,
  bangkokPeriodLabel,
  bangkokStockShare,
  bangkokWeeklyKpi,
  bangkokWeeks,
  type BangkokGranularity,
  type BangkokWeek,
} from '@/lib/data/bangkok-weekly';

/* ── 표기 헬퍼 ─────────────────────────────────────────────────────────── */

const num = (v: number | null) => (v === null ? '–' : v.toLocaleString('ko-KR'));

const S = (key: string, name: string, color: string, extra: Partial<Serie> = {}): Serie => ({
  key, name, color, ...extra,
});

const C = {
  s1: 'var(--cosmo-s1)', s2: 'var(--cosmo-s2)', s3: 'var(--cosmo-s3)',
};

const SRC = `방콕사무소 주간보고 종합분석 (${bangkokWeeklyKpi.period}, ${bangkokWeeklyKpi.weeks}주)`;

const REGION_LABELS: Record<string, string> = { BKK: '방콕', SKL: '송클라' };

/* 주간 시계열 — null 보간 없이 그대로 (Chart connectNulls=false) */
const weekRows = bangkokWeeks.map((w) => ({
  label: w.date.slice(2, 7),
  방콕: w.bkkUtil,
  송클라: w.sklUtil,
  재고: w.bkkStockMt,
  가공일수: w.bkkDays,
}));

/* 방콕 재고·가공가능일수 입도 전환 — 스톡 변수라 합산이 아니라 «기간 평균»으로 집계한다 */
type StockGran = 'weekly' | BangkokGranularity;

const STOCK_GRAN_OPTIONS = [
  { key: 'weekly', label: '주간' },
  { key: 'monthly', label: '월간' },
  { key: 'quarterly', label: '분기별' },
  { key: 'yearly', label: '연도별' },
] as const;

const AVG_NOTE =
  '기간 평균 — 재고·가공가능일수는 스톡 지표라 합산이 아니라 평균으로 집계한다. 기록 있는 주만 평균 (0 채움 없음), 관측 주가 없는 기간은 행을 생략한다.';

type StockView = { rows: Record<string, unknown>[]; xInterval: number; note?: string };

const avgViews = (
  pick: (w: BangkokWeek) => number | null,
  key: '재고' | '가공일수',
  dp: number,
): Record<StockGran, StockView> => {
  const agg = (g: BangkokGranularity, xInterval: number): StockView => ({
    rows: aggregateWeeklyAvg(pick, g).map((a) => ({
      label: bangkokPeriodLabel(a.period),
      [key]: +a.value.toFixed(dp),
    })),
    xInterval,
    note: AVG_NOTE,
  });
  return {
    weekly: { rows: weekRows.map((r) => ({ label: r.label, [key]: r[key] })), xInterval: 51 },
    monthly: agg('monthly', 5),
    quarterly: agg('quarterly', 1),
    yearly: agg('yearly', 0),
  };
};

const STOCK_VIEWS = avgViews((w) => w.bkkStockMt, '재고', 0);
const DAYS_VIEWS = avgViews((w) => w.bkkDays, '가공일수', 1);

/* 캐너리별 주간 시계열 — 재고 점유 상위 4개, 날짜 합집합에 병합 (보간 금지).
   가동률(%)과 재고(MT)는 축이 달라 이중축 대신 패널을 분리한다. */
const TOP_CANNERIES = [...bangkokStockShare]
  .sort((a, b) => b.sharePct - a.sharePct)
  .map((s) => s.name)
  .filter((n) => bangkokCanneryPanel.some((p) => p.name === n))
  .slice(0, 4);

const canneryWeekRows = (() => {
  const byDate = new Map<string, Record<string, string | number | null>>();
  for (const name of TOP_CANNERIES) {
    const panel = bangkokCanneryPanel.find((p) => p.name === name);
    if (!panel) continue;
    for (const w of panel.weeks) {
      const row = byDate.get(w.date) ?? { date: w.date, label: w.date.slice(2, 7) };
      row[`${name}·가동률`] = w.utilPct;
      row[`${name}·재고`] = w.stockMt;
      byDate.set(w.date, row);
    }
  }
  return [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
})();

const CANNERY_COLORS = [C.s1, C.s2, C.s3, 'var(--cosmo-s4)'];
const canneryLegend = TOP_CANNERIES.map((n, i) => ({ name: n, color: CANNERY_COLORS[i] }));
const canneryUtilSeries = TOP_CANNERIES.map((n, i) =>
  S(`${n}·가동률`, n, CANNERY_COLORS[i], { fmt: (v) => `${v}%` }),
);
const canneryStockSeries = TOP_CANNERIES.map((n, i) =>
  S(`${n}·재고`, n, CANNERY_COLORS[i], { fmt: (v) => v.toLocaleString('ko-KR') }),
);
const CANNERY_TREND_NOTE = `재고 점유 상위 ${TOP_CANNERIES.length}개 캐너리 (${TOP_CANNERIES.join(' · ')}) — 무기록 주는 선을 끊는다 (보간하지 않음).`;

/* 재고 점유 상위 10 (전체 17) — 값은 총재고 대비 비중(%) */
const stockTop = [...bangkokStockShare]
  .sort((a, b) => b.sharePct - a.sharePct)
  .slice(0, 10)
  .map((s) => ({ label: s.name, 점유율: s.sharePct }));

/* ── 캐너리·재고 ───────────────────────────────────────────────────────── */

export function CanneryTab() {
  const [stockGran, setStockGran] = useState<StockGran>('weekly');
  const [daysGran, setDaysGran] = useState<StockGran>('weekly');
  const stockView = STOCK_VIEWS[stockGran];
  const daysView = DAYS_VIEWS[daysGran];

  return (
    <>
      <Sec>가동률</Sec>
      <Grid>
        <Panel
          span={12}
          title="방콕 대 송클라 가동률"
          unit="(%)"
          src={SRC}
        >
          <Chart
            data={weekRows}
            x="label"
            height={260}
            xInterval={25}
            series={[
              S('방콕', '방콕', C.s1),
              S('송클라', '송클라', C.s2),
            ]}
            yFmt={(v) => `${v}%`}
          />
          <Legend items={[
            { name: '방콕', color: C.s1 },
            { name: '송클라', color: C.s2 },
          ]} />
        </Panel>
      </Grid>

      <Sec>방콕 재고</Sec>
      <Grid>
        <Panel span={6} title="방콕 재고" unit="(MT)" note={stockView.note} src={SRC}>
          <Pills
            options={STOCK_GRAN_OPTIONS}
            value={stockGran}
            onChange={setStockGran}
            label="방콕 재고 집계 입도"
          />
          <Chart
            data={stockView.rows}
            x="label"
            height={240}
            xInterval={stockView.xInterval}
            series={[S('재고', '재고', C.s1, { type: 'area' })]}
            yFmt={(v) => v.toLocaleString('ko-KR')}
          />
        </Panel>

        <Panel span={6} title="가공가능일수" unit="(일)" note={daysView.note} src={SRC}>
          <Pills
            options={STOCK_GRAN_OPTIONS}
            value={daysGran}
            onChange={setDaysGran}
            label="가공가능일수 집계 입도"
          />
          <Chart
            data={daysView.rows}
            x="label"
            height={240}
            xInterval={daysView.xInterval}
            series={[S('가공일수', '가공가능일수', C.s3)]}
            yFmt={(v) => `${v}일`}
          />
        </Panel>
      </Grid>

      <Sec>캐너리별 추이</Sec>
      <Grid>
        <Panel
          span={6}
          title="캐너리별 가동률 추이"
          unit="(%)"
          note={CANNERY_TREND_NOTE}
          src={SRC}
        >
          <Chart
            data={canneryWeekRows}
            x="label"
            height={250}
            xInterval={51}
            series={canneryUtilSeries}
            yFmt={(v) => `${v}%`}
          />
          <Legend items={canneryLegend} />
        </Panel>

        <Panel
          span={6}
          title="캐너리별 원어재고 추이"
          unit="(MT)"
          note={CANNERY_TREND_NOTE}
          src={SRC}
        >
          <Chart
            data={canneryWeekRows}
            x="label"
            height={250}
            xInterval={51}
            series={canneryStockSeries}
            yFmt={(v) => v.toLocaleString('ko-KR')}
          />
          <Legend items={canneryLegend} />
        </Panel>
      </Grid>

      <Sec>캐너리 스냅샷</Sec>
      <Grid>
        <Panel span={12} src={SRC}>
          <Table head={['이름', '권역', '가동 (톤/일)', '가동률 (%)', '재고 (MT)', '가공일수 (일)']}>
            {bangkokCanneries.map((c) => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{REGION_LABELS[c.region] ?? c.region}</td>
                <td>{num(c.current)}</td>
                <td>{num(c.utilPct)}</td>
                <td>{num(c.stockMt)}</td>
                <td>{num(c.days)}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={12}
          title="재고 점유"
          unit="(%)"
          note={`전체 ${bangkokStockShare.length}개 캐너리 중 상위 10 — 총재고 대비 비중`}
          src={SRC}
        >
          <Chart
            data={stockTop}
            x="label"
            height={280}
            horizontal
            labelWidth={110}
            series={[S('점유율', '점유율', C.s1, { type: 'bar' })]}
            yFmt={(v) => `${v}%`}
          />
        </Panel>
      </Grid>
    </>
  );
}
