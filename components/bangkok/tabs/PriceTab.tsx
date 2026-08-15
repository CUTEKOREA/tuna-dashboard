'use client';

import Chart, { Legend, type Serie } from '../../cosmo/Chart';
import { Grid, Panel, Sec, Table } from '../../panofi/PanofiUi';
import {
  bangkokPriceFlags,
  bangkokWeeklyKpi,
  bangkokWeeks,
  bangkokYearly,
} from '@/lib/data/bangkok-weekly';

/* ── 표기 헬퍼 ─────────────────────────────────────────────────────────── */

const usd = (v: number) => `$${v.toLocaleString('ko-KR')}`;

const S = (key: string, name: string, color: string, extra: Partial<Serie> = {}): Serie => ({
  key, name, color, ...extra,
});

const C = {
  s1: 'var(--cosmo-s1)', s2: 'var(--cosmo-s2)', s3: 'var(--cosmo-s3)',
};

const SRC = `방콕사무소 주간보고 종합분석 (${bangkokWeeklyKpi.period}, ${bangkokWeeklyKpi.weeks}주)`;

/* ── 파생 (null 은 계산에서 제외, 보간하지 않는다) ─────────────────────── */

const priced = bangkokWeeks.filter((w) => w.price !== null);
const priceMin = Math.min(...priced.map((w) => w.price as number));
const priceMax = Math.max(...priced.map((w) => w.price as number));
const latest = priced[priced.length - 1];
const missingWeeks = bangkokWeeks.length - priced.length;
const suspectWeeks = bangkokWeeks.filter((w) => w.suspect).length;

const weeklySeries = bangkokWeeks.map((w) => ({ label: w.date.slice(2, 7), 시세: w.price }));

const recent = bangkokWeeks.slice(-26);
const recentSeries = recent.map((w) => ({ label: w.date.slice(2), 시세: w.price }));
const recentPriced = recent.filter((w) => w.price !== null).map((w) => w.price as number);

const yearlySeries = bangkokYearly.map((y) => ({
  label: String(y.year),
  평균: y.priceAvg,
  최저: y.priceMin,
  최고: y.priceMax,
}));

/* ── 원어 시세 탭 ──────────────────────────────────────────────────────── */

export function PriceTab() {
  return (
    <>
      <Sec>주간 시세</Sec>
      <Grid>
        <Panel
          span={12} title="원어 시세 주간 추이" unit="달러/톤"
          note={`최신 ${usd(latest.price as number)} (${latest.date} 주). 기간 최저 ${usd(priceMin)} ~ 최고 ${usd(priceMax)}. 값 없는 ${missingWeeks}주는 보간 없이 끊어 표시.`}
          src={SRC}
        >
          <Chart
            data={weeklySeries} x="label" height={280} xInterval={26}
            series={[S('시세', '원어 시세', C.s1, { type: 'line' })]}
            yFmt={usd}
          />
        </Panel>
      </Grid>

      <Sec>연도별 범위</Sec>
      <Grid>
        <Panel
          span={12} title="연도별 시세 범위" unit="달러/톤 · 값 없는 주 제외 산출"
          note="막대는 연평균, 점선은 그 해 주간 최저·최고. 막대와 점선의 간격이 넓을수록 해당 연도의 변동성이 크다."
          src={SRC}
        >
          <Chart
            data={yearlySeries} x="label" height={250}
            series={[
              S('평균', '연평균', C.s1, { type: 'bar' }),
              S('최고', '최고', C.s2, { type: 'line', dash: true }),
              S('최저', '최저', C.s3, { type: 'line', dash: true }),
            ]}
            yFmt={usd}
          />
          <Legend items={[
            { name: '연평균', color: C.s1, box: true },
            { name: '최고', color: C.s2, dash: true },
            { name: '최저', color: C.s3, dash: true },
          ]} />
        </Panel>
      </Grid>

      <Sec>이상치 점검</Sec>
      <Grid>
        <Panel
          span={6} title="시세 이상치 플래그" unit="달러/톤"
          note={`의심 플래그 주차 ${suspectWeeks}주 / 전체 ${bangkokWeeks.length}주 — 이웃 주 중앙값 대비 급변 기준. 원 기록은 정정하지 않고 그대로 둔다.`}
          src={SRC}
        >
          <Table head={['날짜', '기록값 (달러/톤)', '이웃 중앙값 (달러/톤)', '괴리율 (%)']}>
            {bangkokPriceFlags.map((f) => (
              <tr key={f.date}>
                <td>{f.date}</td>
                <td>{f.value.toLocaleString('ko-KR')}</td>
                <td>{f.neighborsMedian.toLocaleString('ko-KR')}</td>
                <td>{Math.round((f.value / f.neighborsMedian - 1) * 100)}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={6} title="최근 26주 확대" unit="달러/톤"
          note={`구간 최저 ${usd(Math.min(...recentPriced))} ~ 최고 ${usd(Math.max(...recentPriced))}.`}
          src={SRC}
        >
          <Chart
            data={recentSeries} x="label" height={230} xInterval={3}
            series={[S('시세', '원어 시세', C.s1, { type: 'line' })]}
            yFmt={usd}
          />
        </Panel>
      </Grid>
    </>
  );
}
