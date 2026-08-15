'use client';

import Chart, { type Serie } from '../../cosmo/Chart';
import { Grid, Panel, Sec, Stat, Stats, Table } from '../../panofi/PanofiUi';
import {
  bangkokWeeklyKpi,
  bangkokWeeks,
  bangkokYearly,
  type BangkokWeek,
} from '@/lib/data/bangkok-weekly';

/* ── 표기 헬퍼 ─────────────────────────────────────────────────────────── */

const num = (v: number) => v.toLocaleString('ko-KR');
const num1 = (v: number) =>
  v.toLocaleString('ko-KR', { maximumFractionDigits: 1 });

const SRC = `방콕사무소 주간보고 종합분석 (${bangkokWeeklyKpi.period}, ${bangkokWeeklyKpi.weeks}주)`;

/** 지표별로 값이 있는 마지막 주를 찾는다 — null 은 보간하지 않는다. */
function latest(pick: (w: BangkokWeek) => number | null): { date: string; value: number } | null {
  for (let i = bangkokWeeks.length - 1; i >= 0; i--) {
    const value = pick(bangkokWeeks[i]);
    if (value !== null) return { date: bangkokWeeks[i].date, value };
  }
  return null;
}

const latestPrice = latest((w) => w.price);
const latestStock = latest((w) => w.bkkStockMt);
const latestUtil = latest((w) => w.bkkUtil);
const latestDays = latest((w) => w.bkkDays);
const latestUnload = latest((w) => w.unloadMt);

/* ── 차트 데이터 (모듈 스코프 — 원천이 정적이다) ───────────────────────── */

const priceRows = bangkokWeeks.map((w) => ({ 주: w.date.slice(2, 7), 시세: w.price }));
const priceSeries: Serie[] = [
  { key: '시세', name: '원어 시세', color: 'var(--cosmo-s1)', fmt: (v) => `${num(v)} 달러/톤` },
];

const unloadRows = bangkokYearly.map((y) => ({ 연도: String(y.year), 하역: y.unloadTotalMt }));
const unloadSeries: Serie[] = [
  { key: '하역', name: '하역 총량', color: 'var(--cosmo-s2)', type: 'bar', fmt: (v) => `${num(v)} MT` },
];

/* ── 개관 탭 ───────────────────────────────────────────────────────────── */

export function HomeTab() {
  return (
    <>
      <Stats>
        <Stat
          k="원어 시세"
          v={latestPrice ? num(latestPrice.value) : '자료 없음'}
          unit="달러/톤"
          d={latestPrice?.date}
        />
        <Stat
          k="방콕 재고"
          v={latestStock ? num(latestStock.value) : '자료 없음'}
          unit="MT"
          d={latestStock?.date}
        />
        <Stat
          k="방콕 가동률"
          v={latestUtil ? num1(latestUtil.value) : '자료 없음'}
          unit="%"
          d={latestUtil?.date}
        />
        <Stat
          k="가공가능일수"
          v={latestDays ? num1(latestDays.value) : '자료 없음'}
          unit="일"
          d={latestDays?.date}
        />
        <Stat
          k="최근 하역"
          v={latestUnload ? num(latestUnload.value) : '자료 없음'}
          unit="MT"
          d={latestUnload?.date}
        />
      </Stats>

      <Sec>주간 원어 시세</Sec>
      <Grid>
        <Panel
          span={12}
          title="원어 시세 추이"
          unit="달러/톤 · 전체 기간"
          note="값이 없는 주는 선을 끊어 표시한다 (보간하지 않음)."
          src={SRC}
        >
          <Chart data={priceRows} x="주" height={260} series={priceSeries} xInterval={25} yFmt={num} />
        </Panel>
      </Grid>

      <Sec>연도별 실적</Sec>
      <Grid>
        <Panel span={6} title="연도별 하역 총량" unit="MT" src={SRC}>
          <Chart data={unloadRows} x="연도" height={240} series={unloadSeries} yFmt={num} />
        </Panel>

        <Panel span={6} title="연도별 요약" unit="주간보고 집계" src={SRC}>
          <Table head={['연도', '주차 (주)', '시세 평균 (달러/톤)', '가동률 평균 (%)', '하역 총량 (MT)', '입항 (척)']}>
            {bangkokYearly.map((y) => (
              <tr key={y.year}>
                <td>{y.year}</td>
                <td>{num(y.weeks)}</td>
                <td>{num(Math.round(y.priceAvg))}</td>
                <td>{num1(y.bkkUtilAvg)}</td>
                <td>{num(Math.round(y.unloadTotalMt))}</td>
                <td>{num(y.shipsTotal)}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </Grid>
    </>
  );
}
