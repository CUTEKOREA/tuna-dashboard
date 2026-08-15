'use client';

import { useState } from 'react';
import Chart, { Legend, type Serie } from '../../cosmo/Chart';
import { Grid, Panel, Pills, Sec, Table } from '../../panofi/PanofiUi';
import {
  BANGKOK_TRADERS,
  TRADER_LABELS,
  aggregateTraderVolumes,
  aggregateUnload,
  bangkokMismatch,
  bangkokTraderAnnual,
  bangkokTraderMonthly,
  bangkokWeeklyKpi,
  bangkokWeeks,
  type BangkokGranularity,
} from '@/lib/data/bangkok-weekly';

/* ── 표기 헬퍼 ────────────────────────────────────────────────────────── */

const num = (v: number) => v.toLocaleString('ko-KR');
const gap = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('ko-KR')}`;
const pctFmt = (v: number) => `${v.toFixed(1)}%`;

const SRC = `방콕사무소 주간보고 종합분석 (${bangkokWeeklyKpi.period}, ${bangkokWeeklyKpi.weeks}주)`;

/** 기간 키 → X축 라벨: "2020-08"→"20-08", "2020-Q3"→"20.3분기", "2020"→"2020" */
const periodLabel = (p: string) =>
  p.includes('Q') ? `${p.slice(2, 4)}.${p.slice(6)}분기` : p.length === 7 ? p.slice(2) : p;

/* ── 파생 데이터 (모듈 스코프 1회 계산) ───────────────────────────────── */

/** 주간 하역 — null 은 그대로 둔다 (무기록 주, 보간 금지) */
const unloadData = bangkokWeeks.map((w) => ({
  label: w.date.slice(2, 7),
  하역량: w.unloadMt,
}));
const unloadWeeks = bangkokWeeks.filter((w) => w.unloadMt !== null).length;

type UnloadGran = 'weekly' | BangkokGranularity;

const AGG_NOTE =
  '기록 있는 주만 합산 (0 채움 없음). 주간치는 보고 시점 중복이 섞여 있어 합산이 연도별 공식 총량(연도별 표)과 차이가 날 수 있다.';

const UNLOAD_VIEWS: Record<
  UnloadGran,
  { rows: { label: string; 하역량: number | null }[]; xInterval: number; note: string }
> = {
  weekly: {
    rows: unloadData,
    xInterval: 25,
    note: `전체 ${bangkokWeeks.length}주 중 하역 기록 ${unloadWeeks}주 — 무기록 주는 빈칸으로 둔다 (보간하지 않음). 주간치는 보고 시점 중복이 섞여 있어 단순 합산은 연도별 총량(연도별 표)과 일치하지 않는다.`,
  },
  monthly: {
    rows: aggregateUnload('monthly').map((a) => ({ label: periodLabel(a.period), 하역량: a.unloadMt })),
    xInterval: 5,
    note: AGG_NOTE,
  },
  quarterly: {
    rows: aggregateUnload('quarterly').map((a) => ({ label: periodLabel(a.period), 하역량: a.unloadMt })),
    xInterval: 1,
    note: AGG_NOTE,
  },
  yearly: {
    rows: aggregateUnload('yearly').map((a) => ({ label: periodLabel(a.period), 하역량: a.unloadMt })),
    xInterval: 0,
    note: AGG_NOTE,
  },
};

const UNLOAD_GRAN_OPTIONS = [
  { key: 'weekly', label: '주간' },
  { key: 'monthly', label: '월간' },
  { key: 'quarterly', label: '분기별' },
  { key: 'yearly', label: '연도별' },
] as const;

/** 트레이더 구성 — 입도별 { 라벨, 트레이더별 물량, 기간 합계 } */
type TraderRow = { label: string; volumes: Record<string, number>; total: number };

const MONTHLY_WINDOW = 24;
const traderMonthlyRecent: TraderRow[] = bangkokTraderMonthly.slice(-MONTHLY_WINDOW).map((m) => ({
  label: m.month.slice(2),
  volumes: Object.fromEntries(BANGKOK_TRADERS.map((t) => [TRADER_LABELS[t], m.volumes[t]])),
  total: m.totalCalc,
}));

const traderAggRows = (g: 'quarterly' | 'yearly'): TraderRow[] =>
  aggregateTraderVolumes(g).map((a) => ({
    label: periodLabel(a.period),
    volumes: Object.fromEntries(BANGKOK_TRADERS.map((t) => [TRADER_LABELS[t], a.volumes[t]])),
    total: a.totalMt,
  }));

const TRADER_VIEWS: Record<BangkokGranularity, { rows: TraderRow[]; xInterval: number; note: string }> = {
  monthly: {
    rows: traderMonthlyRecent,
    xInterval: 2,
    note: `전체 ${bangkokTraderMonthly.length}개월 중 최근 ${MONTHLY_WINDOW}개월만 표시 — 전 기간 구성은 아래 연도별 표 참조.`,
  },
  quarterly: {
    rows: traderAggRows('quarterly'),
    xInterval: 1,
    note: '월별 물량 합산 — 기록 있는 달만 (0 채움 없음).',
  },
  yearly: {
    rows: traderAggRows('yearly'),
    xInterval: 0,
    note: '월별 물량 합산 — 기록 있는 달만 (0 채움 없음). 연도별 공식 집계와의 격차는 아래 격차 표에 밝힌다.',
  },
};

const TRADER_GRAN_OPTIONS = [
  { key: 'monthly', label: '월별' },
  { key: 'quarterly', label: '분기별' },
  { key: 'yearly', label: '연도별' },
] as const;

const TRADER_UNIT_OPTIONS = [
  { key: 'mt', label: '실량 (MT)' },
  { key: 'pct', label: '비중 (%)' },
] as const;

const traderSeries = (pct: boolean): Serie[] =>
  BANGKOK_TRADERS.map((t, i): Serie => ({
    key: TRADER_LABELS[t],
    name: TRADER_LABELS[t],
    color: `var(--cosmo-s${i + 1})`,
    type: 'bar',
    stackId: 'trader',
    fmt: pct ? pctFmt : num,
  }));

const TRADER_LEGEND = BANGKOK_TRADERS.map((t, i) => ({
  name: TRADER_LABELS[t],
  color: `var(--cosmo-s${i + 1})`,
  box: true,
}));

/** 실량 → 차트 행. 비중 모드는 각 기간 합계 대비 % (100% 스택) */
const traderChartRows = (rows: TraderRow[], pct: boolean) =>
  rows.map((r) => ({
    label: r.label,
    ...(pct
      ? Object.fromEntries(
          Object.entries(r.volumes).map(([k, v]) => [k, r.total > 0 ? +((v / r.total) * 100).toFixed(1) : 0]),
        )
      : r.volumes),
  }));

/** 12개월 미만 집계 연도 — 표 note 에 정직하게 밝힌다 */
const partialYears = bangkokTraderAnnual
  .filter((y) => y.months < 12)
  .map((y) => `${y.year}년 ${y.months}개월`)
  .join(' · ');

/* ── 탭 ───────────────────────────────────────────────────────────────── */

export function UnloadTab() {
  const [unloadGran, setUnloadGran] = useState<UnloadGran>('weekly');
  const [traderGran, setTraderGran] = useState<BangkokGranularity>('monthly');
  const [traderUnit, setTraderUnit] = useState<'mt' | 'pct'>('mt');

  const unloadView = UNLOAD_VIEWS[unloadGran];
  const traderView = TRADER_VIEWS[traderGran];
  const traderPct = traderUnit === 'pct';

  return (
    <>
      <Sec>주간 하역</Sec>
      <Grid>
        <Panel
          span={12}
          title="하역 물량"
          unit="(MT)"
          note={unloadView.note}
          src={SRC}
        >
          <Pills
            options={UNLOAD_GRAN_OPTIONS}
            value={unloadGran}
            onChange={setUnloadGran}
            label="하역 물량 집계 입도"
          />
          <Chart
            data={unloadView.rows}
            x="label"
            height={260}
            xInterval={unloadView.xInterval}
            series={[{ key: '하역량', name: '하역량', color: 'var(--cosmo-s1)', type: 'bar' }]}
            yFmt={num}
          />
        </Panel>
      </Grid>

      <Sec>트레이더 구성</Sec>
      <Grid>
        <Panel
          span={12}
          title="트레이더 구성"
          unit={traderPct ? '(%)' : '(MT)'}
          note={`${traderView.note}${traderPct ? ' 비중은 각 기간 트레이더 합계 대비 100% 스택.' : ''}`}
          src={SRC}
        >
          <div className="pf-pillrow">
            <Pills
              options={TRADER_GRAN_OPTIONS}
              value={traderGran}
              onChange={setTraderGran}
              label="트레이더 구성 집계 입도"
            />
            <Pills
              options={TRADER_UNIT_OPTIONS}
              value={traderUnit}
              onChange={setTraderUnit}
              label="트레이더 구성 표시 단위"
            />
          </div>
          <Chart
            data={traderChartRows(traderView.rows, traderPct)}
            x="label"
            height={280}
            xInterval={traderView.xInterval}
            series={traderSeries(traderPct)}
            yFmt={traderPct ? (v) => `${v}%` : num}
          />
          <Legend items={TRADER_LEGEND} />
        </Panel>

        <Panel
          span={12}
          title="연도별 트레이더 점유"
          unit="물량 (MT) · 척수 (척)"
          note={partialYears ? `12개월 미만 집계: ${partialYears}.` : undefined}
          src={SRC}
        >
          <Table head={['연도', ...BANGKOK_TRADERS.map((t) => TRADER_LABELS[t]), '합계', '척수']}>
            {bangkokTraderAnnual.map((y) => (
              <tr key={y.year}>
                <td>{y.year}</td>
                {BANGKOK_TRADERS.map((t) => (
                  <td key={t}>{num(y.volumes[t])}</td>
                ))}
                <td>{num(y.totalMt)}</td>
                <td>{num(y.ships)}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={12}
          title="계산합 대 보고합 격차"
          unit="물량 (MT) · 척수 (척)"
          note={`트레이더 표의 계산합과 보고서 발표합이 어긋난 건이 ${bangkokMismatch.length}건 있다 — 전체 내역을 아래에 둔다 (조용히 덮지 않음).`}
          src={SRC}
        >
          <Table head={['구분', '계산합', '보고합', '격차', '확인 보고서']}>
            {bangkokMismatch.map((m) => (
              <tr key={m.where}>
                <td>{m.where}</td>
                <td>{num(m.calc)}</td>
                <td>{num(m.reported)}</td>
                <td>{gap(m.diff)}</td>
                <td>{m.sourceFile}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </Grid>
    </>
  );
}
