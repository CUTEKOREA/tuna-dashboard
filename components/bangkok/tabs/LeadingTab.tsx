'use client';

import Chart from '../../cosmo/Chart';
import { Grid, Panel, Sec, Table } from '../../panofi/PanofiUi';
import {
  bangkokCorr,
  bangkokSeasonality,
  bangkokWeeklyKpi,
} from '@/lib/data/bangkok-weekly';

const SRC = `방콕사무소 주간보고 종합분석 (${bangkokWeeklyKpi.period}, ${bangkokWeeklyKpi.weeks}주)`;

/* 해석 문장은 하드코딩하지 않고 상관 테이블에서 직접 계산한다. */
const corrCells = bangkokCorr.flatMap((m) =>
  m.lags.map((l) => ({ label: m.label, lagWeeks: l.lagWeeks, r: l.r, n: l.n })),
);
const validCells = corrCells.filter((c) => c.r !== null) as {
  label: string; lagWeeks: number; r: number; n: number;
}[];
const strongest = validCells.reduce((a, b) => (Math.abs(b.r) > Math.abs(a.r) ? b : a));
const weakCount = validCells.filter((c) => Math.abs(c.r) < 0.3).length;

const peakMonth = bangkokSeasonality.reduce((a, b) => (b.unloadMt > a.unloadMt ? b : a));
const lowMonth = bangkokSeasonality.reduce((a, b) => (b.unloadMt < a.unloadMt ? b : a));

const mt = (v: number) => Math.round(v).toLocaleString('ko-KR');

export function LeadingTab() {
  return (
    <>
      <Sec>시세 선행 상관</Sec>
      <Grid>
        <Panel
          span={12}
          title="지표별 시세 선행 상관"
          unit="상관계수 r · 괄호는 표본 주수"
          note={
            <>
              전체 {validCells.length}개 상관값 중 {weakCount}개가 |r| 0.3 미만의 약한 상관이다.
              가장 큰 상관은 {strongest.label} 시차 {strongest.lagWeeks}주의
              r={strongest.r.toFixed(2)}({strongest.r < 0 ? '음' : '양'}의 상관)이다.
              이 수준의 상관은 <b>단독 매매 신호로 쓰지 말 것</b> — 시세 방향성의 보조 참고로만 쓴다.
            </>
          }
          src={SRC}
        >
          <Table head={['지표', ...bangkokCorr[0].lags.map((l) => `시차 ${l.lagWeeks}주`)]}>
            {bangkokCorr.map((m) => (
              <tr key={m.metric}>
                <td>{m.label}</td>
                {m.lags.map((l) => (
                  <td key={l.lagWeeks}>
                    {l.r === null ? '–' : `${l.r.toFixed(2)} (${l.n}주)`}
                  </td>
                ))}
              </tr>
            ))}
          </Table>
        </Panel>
      </Grid>

      <Sec>하역 계절성</Sec>
      <Grid>
        <Panel
          span={12}
          title="월별 평균 하역 물량"
          unit="MT · 전 기간 월평균"
          note={`성수기는 ${peakMonth.month}월 (${mt(peakMonth.unloadMt)} MT), 비수기는 ${lowMonth.month}월 (${mt(lowMonth.unloadMt)} MT)이다.`}
          src={SRC}
        >
          <Chart
            data={bangkokSeasonality.map((m) => ({ 월: `${m.month}월`, 하역량: Math.round(m.unloadMt) }))}
            x="월"
            height={250}
            xInterval={0}
            series={[{ key: '하역량', name: '하역량 (MT)', color: 'var(--cosmo-s1)', type: 'bar' }]}
            yFmt={(v) => v.toLocaleString('ko-KR')}
          />
        </Panel>
      </Grid>
    </>
  );
}
