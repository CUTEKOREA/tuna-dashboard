'use client';

import { useMemo, useState } from 'react';
import Chart, { Legend, type Serie } from '../../cosmo/Chart';
import { Grid, Panel, Pills, Sec, Table } from '../../panofi/PanofiUi';
import {
  aggregateCanneryAvg,
  aggregateWeeklyAvg,
  bangkokCanneries,
  bangkokCanneryPanel,
  bangkokPeriodLabel,
  bangkokStockShare,
  bangkokWeeklyKpi,
  bangkokWeeks,
  type BangkokCanneryWeek,
  type BangkokGranularity,
  type BangkokWeek,
} from '@/lib/data/bangkok-weekly';
import { HOLD_ID } from '@/lib/chart-palette';
import { C, canneryColor } from '../palette';

/* ── 표기 헬퍼 ─────────────────────────────────────────────────────────── */

const num = (v: number | null) => (v === null ? '–' : v.toLocaleString('ko-KR'));

const S = (key: string, name: string, color: string, extra: Partial<Serie> = {}): Serie => ({
  key, name, color, ...extra,
});

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

/* 입도별 X축 tick 간격 — 행 수가 입도마다 한 자릿수까지 줄어든다 */
const X_INTERVAL: Record<StockGran, number> = { weekly: 51, monthly: 5, quarterly: 1, yearly: 0 };

const AVG_NOTE =
  '기간 평균 - 재고·가공가능일수는 스톡 지표라 합산이 아니라 평균으로 집계한다. 기록 있는 주만 평균 (0 채움 없음), 관측 주가 없는 기간은 행을 생략한다.';

type StockView = { rows: Record<string, unknown>[]; xInterval: number; note?: string };

const avgViews = (
  pick: (w: BangkokWeek) => number | null,
  key: '재고' | '가공일수',
  dp: number,
): Record<StockGran, StockView> => {
  const agg = (g: BangkokGranularity): StockView => ({
    rows: aggregateWeeklyAvg(pick, g).map((a) => ({
      label: bangkokPeriodLabel(a.period),
      [key]: +a.value.toFixed(dp),
    })),
    xInterval: X_INTERVAL[g],
    note: AVG_NOTE,
  });
  return {
    weekly: { rows: weekRows.map((r) => ({ label: r.label, [key]: r[key] })), xInterval: X_INTERVAL.weekly },
    monthly: agg('monthly'),
    quarterly: agg('quarterly'),
    yearly: agg('yearly'),
  };
};

const STOCK_VIEWS = avgViews((w) => w.bkkStockMt, '재고', 0);
const DAYS_VIEWS = avgViews((w) => w.bkkDays, '가공일수', 1);

/* 캐너리별 시계열 — 태국 전 캐너리(방콕·송클라)를 복수 선택하고 입도를 전환한다.
   가동률(%)과 재고(MT)는 축이 달라 이중축 대신 패널을 분리한다. 병합은 기간 합집합, 보간 금지. */
const SHARE_PCT = new Map(bangkokStockShare.map((s) => [s.name, s.sharePct]));

/** 선택 후보 = 주간 시계열이 있는 전 캐너리. 재고 점유 큰 순, 점유 미상은 뒤로 */
const ALL_CANNERIES = bangkokCanneryPanel
  .map((p) => p.name)
  .sort((a, b) => (SHARE_PCT.get(b) ?? -1) - (SHARE_PCT.get(a) ?? -1) || a.localeCompare(b));

const DEFAULT_CANNERIES = ALL_CANNERIES.slice(0, 4);

const METRICS = [
  { suffix: '가동률', pick: (w: BangkokCanneryWeek) => w.utilPct, dp: 1 },
  { suffix: '재고', pick: (w: BangkokCanneryWeek) => w.stockMt, dp: 0 },
] as const;

function canneryRows(names: readonly string[], g: StockGran): Record<string, unknown>[] {
  const byKey = new Map<string, Record<string, string | number | null>>();
  const rowAt = (key: string, label: string) => {
    const cur = byKey.get(key) ?? { key, label };
    byKey.set(key, cur);
    return cur;
  };
  for (const name of names) {
    const panel = bangkokCanneryPanel.find((p) => p.name === name);
    if (!panel) continue;
    if (g === 'weekly') {
      for (const w of panel.weeks) {
        const row = rowAt(w.date, w.date.slice(2, 7));
        row[`${name}·가동률`] = w.utilPct;
        row[`${name}·재고`] = w.stockMt;
      }
      continue;
    }
    for (const m of METRICS) {
      for (const a of aggregateCanneryAvg(panel.weeks, m.pick, g)) {
        rowAt(a.period, bangkokPeriodLabel(a.period))[`${name}·${m.suffix}`] = +a.value.toFixed(m.dp);
      }
    }
  }
  return [...byKey.values()].sort((a, b) => String(a.key).localeCompare(String(b.key)));
}

/* 캐너리 색은 정체성 채도(HOLD_ID). 한 바퀴를 넘기면 점선으로 구분한다. */
const serieStyle = (i: number) => ({
  color: canneryColor(i),
  dash: Math.floor(i / HOLD_ID.length) % 2 === 1,
});

const CANNERY_GRAN_LABEL: Record<StockGran, string> = {
  weekly: '주간',
  monthly: '월간 평균',
  quarterly: '분기 평균',
  yearly: '연 평균',
};

/* 재고 점유 상위 10 (전체 17) — 값은 총재고 대비 비중(%) */
const stockTop = [...bangkokStockShare]
  .sort((a, b) => b.sharePct - a.sharePct)
  .slice(0, 10)
  .map((s) => ({ label: s.name, 점유율: s.sharePct }));

/* ── 캐너리·재고 ───────────────────────────────────────────────────────── */

export function CanneryTab() {
  const [stockGran, setStockGran] = useState<StockGran>('weekly');
  const [daysGran, setDaysGran] = useState<StockGran>('weekly');
  const [picked, setPicked] = useState<readonly string[]>(DEFAULT_CANNERIES);
  const [canneryGran, setCanneryGran] = useState<StockGran>('weekly');
  const stockView = STOCK_VIEWS[stockGran];
  const daysView = DAYS_VIEWS[daysGran];

  const rows = useMemo(() => canneryRows(picked, canneryGran), [picked, canneryGran]);
  const allOn = picked.length === ALL_CANNERIES.length;

  /* 선택 순서와 무관하게 색을 고정하려고 항상 ALL_CANNERIES 순서로 되돌린다.
     마지막 하나는 해제하지 않는다 — 빈 차트는 «데이터 없음»과 구분되지 않는다. */
  const toggle = (name: string) =>
    setPicked((cur) =>
      cur.includes(name)
        ? cur.length > 1 ? cur.filter((n) => n !== name) : cur
        : ALL_CANNERIES.filter((n) => n === name || cur.includes(n)),
    );

  const legend = picked.map((n) => ({ name: n, ...serieStyle(ALL_CANNERIES.indexOf(n)) }));
  const series = (suffix: '가동률' | '재고', fmt: (v: number) => string) =>
    picked.map((n) => {
      const style = serieStyle(ALL_CANNERIES.indexOf(n));
      return S(`${n}·${suffix}`, n, style.color, { dash: style.dash, fmt });
    });

  const canneryNote =
    `선택 ${picked.length}개 / 전체 ${ALL_CANNERIES.length}개 (방콕·송클라) · ${CANNERY_GRAN_LABEL[canneryGran]}. ` +
    (canneryGran === 'weekly'
      ? '무기록 주는 선을 끊는다 (보간하지 않음).'
      : '가동률·재고는 스톡 지표라 합산이 아니라 기간 평균 (0 채움 없음, 관측 없는 기간은 행 생략).') +
    (picked.length > HOLD_ID.length ? ' 선택이 많으면 색만으로 구분되지 않는다 - 툴팁·범례로 확인한다.' : '');

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
              S('방콕', '방콕', C.bangkok),
              S('송클라', '송클라', C.songkhla),
            ]}
            yFmt={(v) => `${v}%`}
          />
          <Legend items={[
            { name: '방콕', color: C.bangkok },
            { name: '송클라', color: C.songkhla },
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
            series={[S('재고', '재고', C.bangkok, { type: 'area' })]}
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
            series={[S('가공일수', '가공가능일수', C.rank)]}
            yFmt={(v) => `${v}일`}
          />
        </Panel>
      </Grid>

      <Sec>캐너리별 추이</Sec>
      {/* 두 패널이 같은 선택·입도를 쓰므로 컨트롤은 한 벌만 패널 밖에 둔다 */}
      <div className="pf-pillrow" style={{ marginBottom: 'var(--pf-gap)' }}>
        <Pills
          options={STOCK_GRAN_OPTIONS}
          value={canneryGran}
          onChange={setCanneryGran}
          label="캐너리별 추이 집계 입도"
        />
        <div className="pf-pills" role="group" aria-label="캐너리 선택">
          <button
            type="button"
            className={`pf-pill${allOn ? ' on' : ''}`}
            aria-pressed={allOn}
            onClick={() => setPicked(allOn ? DEFAULT_CANNERIES : ALL_CANNERIES)}
          >
            전체
          </button>
          {ALL_CANNERIES.map((name) => {
            const on = picked.includes(name);
            return (
              <button
                key={name}
                type="button"
                className={`pf-pill${on ? ' on' : ''}`}
                aria-pressed={on}
                onClick={() => toggle(name)}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
      <Grid>
        <Panel
          span={6}
          title="캐너리별 가동률 추이"
          unit="(%)"
          note={canneryNote}
          src={SRC}
        >
          <Chart
            data={rows}
            x="label"
            height={250}
            xInterval={X_INTERVAL[canneryGran]}
            series={series('가동률', (v) => `${v}%`)}
            yFmt={(v) => `${v}%`}
          />
          <Legend items={legend} />
        </Panel>

        <Panel
          span={6}
          title="캐너리별 원어재고 추이"
          unit="(MT)"
          note={canneryNote}
          src={SRC}
        >
          <Chart
            data={rows}
            x="label"
            height={250}
            xInterval={X_INTERVAL[canneryGran]}
            series={series('재고', (v) => v.toLocaleString('ko-KR'))}
            yFmt={(v) => v.toLocaleString('ko-KR')}
          />
          <Legend items={legend} />
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
          note={`전체 ${bangkokStockShare.length}개 캐너리 중 상위 10 - 총재고 대비 비중`}
          src={SRC}
        >
          <Chart
            data={stockTop}
            x="label"
            height={280}
            horizontal
            labelWidth={110}
            series={[S('점유율', '점유율', C.rank, { type: 'bar' })]}
            yFmt={(v) => `${v}%`}
          />
        </Panel>
      </Grid>
    </>
  );
}
