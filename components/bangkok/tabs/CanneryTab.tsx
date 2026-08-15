'use client';

import Chart, { Legend, type Serie } from '../../cosmo/Chart';
import { Grid, Panel, Sec, Table } from '../../panofi/PanofiUi';
import {
  bangkokCanneries,
  bangkokStockShare,
  bangkokWeeklyKpi,
  bangkokWeeks,
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

/* 재고 점유 상위 10 (전체 17) — 값은 총재고 대비 비중(%) */
const stockTop = [...bangkokStockShare]
  .sort((a, b) => b.sharePct - a.sharePct)
  .slice(0, 10)
  .map((s) => ({ label: s.name, 점유율: s.sharePct }));

/* ── 캐너리·재고 ───────────────────────────────────────────────────────── */

export function CanneryTab() {
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
        <Panel span={6} title="방콕 재고" unit="(MT)" src={SRC}>
          <Chart
            data={weekRows}
            x="label"
            height={240}
            xInterval={51}
            series={[S('재고', '재고', C.s1, { type: 'area' })]}
            yFmt={(v) => v.toLocaleString('ko-KR')}
          />
        </Panel>

        <Panel span={6} title="가공가능일수" unit="(일)" src={SRC}>
          <Chart
            data={weekRows}
            x="label"
            height={240}
            xInterval={51}
            series={[S('가공일수', '가공가능일수', C.s3)]}
            yFmt={(v) => `${v}일`}
          />
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
