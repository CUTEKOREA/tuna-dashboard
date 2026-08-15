'use client';

import { useState } from 'react';
import Chart from '../../cosmo/Chart';
import { Grid, Panel, Pills, Sec, Table } from '../../panofi/PanofiUi';
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

/* 해설 예시 셀 — 하역 물량 시차 4주. 하드코딩하지 않고 표에서 꺼낸다. */
const exampleCell = bangkokCorr
  .find((m) => m.metric === 'unload_mt')
  ?.lags.find((l) => l.lagWeeks === 4);
const exampleR = exampleCell && exampleCell.r !== null ? exampleCell.r : null;

const peakMonth = bangkokSeasonality.reduce((a, b) => (b.unloadMt > a.unloadMt ? b : a));
const lowMonth = bangkokSeasonality.reduce((a, b) => (b.unloadMt < a.unloadMt ? b : a));

const mt = (v: number) => Math.round(v).toLocaleString('ko-KR');

/* 하역 계절성 입도 전환 — 분기 값은 물량 재합산이 아니라 «월평균값들의 분기 평균»
   (계절성 비교 기준을 월간과 동일하게 유지하기 위함) */
const seasonMonthlyRows = bangkokSeasonality.map((m) => ({
  label: `${m.month}월`,
  하역량: Math.round(m.unloadMt),
}));

const seasonQuarterlyRows = [1, 2, 3, 4].flatMap((q) => {
  const ms = bangkokSeasonality.filter((m) => Math.ceil(m.month / 3) === q);
  return ms.length
    ? [{ label: `${q}분기`, 하역량: Math.round(ms.reduce((s, m) => s + m.unloadMt, 0) / ms.length) }]
    : [];
});

const SEASON_GRAN_OPTIONS = [
  { key: 'monthly', label: '월별' },
  { key: 'quarterly', label: '분기별' },
] as const;
type SeasonGran = (typeof SEASON_GRAN_OPTIONS)[number]['key'];

const SEASON_VIEWS: Record<
  SeasonGran,
  { rows: { label: string; 하역량: number }[]; title: string; unit: string; note: string }
> = {
  monthly: {
    rows: seasonMonthlyRows,
    title: '월별 평균 하역 물량',
    unit: 'MT · 전 기간 월평균',
    note: `성수기는 ${peakMonth.month}월 (${mt(peakMonth.unloadMt)} MT), 비수기는 ${lowMonth.month}월 (${mt(lowMonth.unloadMt)} MT)이다.`,
  },
  quarterly: {
    rows: seasonQuarterlyRows,
    title: '분기별 평균 하역 물량',
    unit: 'MT · 월평균값의 분기 평균',
    note: '분기 값 = 해당 분기 3개월 월평균값의 단순 평균 (물량 재합산·가중 아님 — 월간과 같은 계절성 비교 기준 유지).',
  },
};

export function LeadingTab() {
  const [seasonGran, setSeasonGran] = useState<SeasonGran>('monthly');
  const seasonView = SEASON_VIEWS[seasonGran];

  return (
    <>
      <Sec>시세 선행 상관</Sec>
      <Grid>
        <Panel span={12} title="이 표를 읽는 법" src={SRC}>
          <div className="pf-note">
            아래 표는 각 지표의 N주 전 값이 현재 원어 시세와 얼마나 같이 움직였는지를
            상관계수 r로 보여드립니다. r는 -1부터 +1 사이의 값으로, +1에 가까울수록 두 값이
            같은 방향으로, -1에 가까울수록 반대 방향으로 움직였다는 뜻입니다. 음의 상관은
            예컨대 재고가 늘어난 뒤 시세가 내려가는 경향이 있었다는 의미입니다. 절댓값
            |r|가 0.3에 못 미치면 함께 움직인 정도가 낮아 방향 판단의 근거로 삼기
            어렵습니다.
            {exampleCell && exampleR !== null && (
              <>
                {' '}예를 들어 하역 물량 시차 4주의 r={exampleR.toFixed(2)}는 4주 전 하역
                물량이 많았던 시기에 현재 시세가 {exampleR < 0 ? '낮은' : '높은'} 경향이
                있었다는 뜻이며, 표본 {exampleCell.n}주에서 계산된 값입니다.
              </>
            )}
            {' '}표본 주수가 적을수록 우연히 큰 상관이 나올 수 있으니 괄호의 주수를 함께
            봐 주시기 바랍니다.
          </div>
          <div className="pf-note">
            <b>상관계수 (r)</b> — 두 시계열이 같이 움직인 정도. -1(정반대)~+1(같은 방향), 0은 무관.
            <br />
            <b>시차 (주)</b> — 지표를 시세보다 N주 앞당겨 비교한 간격. «시차 4주»는 4주 전 지표
            값과 현재 시세의 비교.
            <br />
            <b>표본 (주수)</b> — 상관 계산에 실제로 짝이 맞은 주간 관측치 수. 적을수록 우연에 취약.
          </div>
        </Panel>

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
          title={seasonView.title}
          unit={seasonView.unit}
          note={seasonView.note}
          src={SRC}
        >
          <Pills
            options={SEASON_GRAN_OPTIONS}
            value={seasonGran}
            onChange={setSeasonGran}
            label="하역 계절성 집계 입도"
          />
          <Chart
            data={seasonView.rows}
            x="label"
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
