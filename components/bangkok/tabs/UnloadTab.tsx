'use client';

import Chart, { Legend, type Serie } from '../../cosmo/Chart';
import { Grid, Panel, Sec, Table } from '../../panofi/PanofiUi';
import {
  BANGKOK_TRADERS,
  TRADER_LABELS,
  bangkokMismatch,
  bangkokTraderAnnual,
  bangkokTraderMonthly,
  bangkokWeeklyKpi,
  bangkokWeeks,
} from '@/lib/data/bangkok-weekly';

/* ── 표기 헬퍼 ────────────────────────────────────────────────────────── */

const num = (v: number) => v.toLocaleString('ko-KR');
const gap = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('ko-KR')}`;

const SRC = `방콕사무소 주간보고 종합분석 (${bangkokWeeklyKpi.period}, ${bangkokWeeklyKpi.weeks}주)`;

/* ── 파생 데이터 (모듈 스코프 1회 계산) ───────────────────────────────── */

/** 주간 하역 — null 은 그대로 둔다 (무기록 주, 보간 금지) */
const unloadData = bangkokWeeks.map((w) => ({
  label: w.date.slice(2, 7),
  하역량: w.unloadMt,
}));
const unloadWeeks = bangkokWeeks.filter((w) => w.unloadMt !== null).length;

/** 월별 트레이더 구성 — 최근 24개월만 (전체는 아래 연도별 표) */
const MONTHLY_WINDOW = 24;
const traderMonthlyRecent = bangkokTraderMonthly.slice(-MONTHLY_WINDOW).map((m) => ({
  label: m.month.slice(2),
  ...Object.fromEntries(BANGKOK_TRADERS.map((t) => [TRADER_LABELS[t], m.volumes[t]])),
}));

const TRADER_SERIES: Serie[] = BANGKOK_TRADERS.map((t, i): Serie => ({
  key: TRADER_LABELS[t],
  name: TRADER_LABELS[t],
  color: `var(--cosmo-s${i + 1})`,
  type: 'bar',
  stackId: 'trader',
}));

const TRADER_LEGEND = BANGKOK_TRADERS.map((t, i) => ({
  name: TRADER_LABELS[t],
  color: `var(--cosmo-s${i + 1})`,
  box: true,
}));

/** 12개월 미만 집계 연도 — 표 note 에 정직하게 밝힌다 */
const partialYears = bangkokTraderAnnual
  .filter((y) => y.months < 12)
  .map((y) => `${y.year}년 ${y.months}개월`)
  .join(' · ');

/* ── 탭 ───────────────────────────────────────────────────────────────── */

export function UnloadTab() {
  return (
    <>
      <Sec>주간 하역</Sec>
      <Grid>
        <Panel
          span={12}
          title="주간 하역 물량"
          unit="(MT)"
          note={`전체 ${bangkokWeeks.length}주 중 하역 기록 ${unloadWeeks}주 — 무기록 주는 빈칸으로 둔다 (보간하지 않음). 주간치는 보고 시점 중복이 섞여 있어 단순 합산은 연도별 총량(연도별 표)과 일치하지 않는다.`}
          src={SRC}
        >
          <Chart
            data={unloadData}
            x="label"
            height={260}
            xInterval={25}
            series={[{ key: '하역량', name: '하역량', color: 'var(--cosmo-s1)', type: 'bar' }]}
            yFmt={num}
          />
        </Panel>
      </Grid>

      <Sec>트레이더 구성</Sec>
      <Grid>
        <Panel
          span={12}
          title="월별 트레이더 구성"
          unit="(MT)"
          note={`전체 ${bangkokTraderMonthly.length}개월 중 최근 ${MONTHLY_WINDOW}개월만 표시 — 전 기간 구성은 아래 연도별 표 참조.`}
          src={SRC}
        >
          <Chart
            data={traderMonthlyRecent}
            x="label"
            height={280}
            xInterval={2}
            series={TRADER_SERIES}
            yFmt={num}
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
