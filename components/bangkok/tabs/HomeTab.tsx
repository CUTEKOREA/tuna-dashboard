'use client';

import { useEffect, useMemo, useState } from 'react';
import Chart, { Legend, type Serie } from '../../cosmo/Chart';
import { Grid, Panel, Sec, Stat, Stats, Table } from '../../panofi/PanofiUi';
import {
  bangkokWeeklyKpi,
  bangkokWeeks,
  bangkokYearly,
  type BangkokWeek,
} from '@/lib/data/bangkok-weekly';
import { singaporeMgoAt, singaporeMgoMeta } from '@/lib/data/singapore-mgo';
import { appendSeasonalOutlook, buildOverviewRows, type AtunaHistoryRow } from '@/lib/bangkok-price-overview';
import { skjSeasonalOutlook } from '@/lib/data/skj-seasonal-outlook';
import { C } from '../palette';

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

/** 가격 3종은 단위가 같아($/t) 한 축에, 재고(MT)·가동률(%)은 같은 시간축의 별도 패널에 — 이중 축은 쓰지 않는다. */
const PRICE_COLORS = { office: C.bangkok, atuna: '#d95926', mgo: '#199e70' } as const;
const priceSeries: Serie[] = [
  { key: '방콕사무소', name: '방콕사무소 원어 시세', color: PRICE_COLORS.office, fmt: (v) => `${num(v)} 달러/톤` },
  { key: '어튜나', name: '어튜나 SKJ 방콕', color: PRICE_COLORS.atuna, fmt: (v) => `${num(v)} 달러/톤` },
  { key: 'MGO', name: '싱가포르 MGO', color: PRICE_COLORS.mgo, dash: true, fmt: (v) => `${num(v)} 달러/톤` },
  // 계절 패턴 참고선 — 예측이 아니다. 어튜나 기준점과 목표월 두 점만 있고 connectNulls로 잇는다.
  { key: '계절밴드', name: '계절 패턴 80% 밴드', color: PRICE_COLORS.atuna, type: 'area', connectNulls: true, fmt: (v) => `${num(v)} 달러/톤` },
  { key: '계절패턴', name: skjSeasonalOutlook.label, color: PRICE_COLORS.atuna, dash: true, connectNulls: true, fmt: (v) => `${num(v)} 달러/톤` },
];
const outlookCaption = `${skjSeasonalOutlook.label}: ${skjSeasonalOutlook.asOf.replace('-', '.')} $${num(skjSeasonalOutlook.anchorPrice)} → ${skjSeasonalOutlook.targetMonth.replace('-', '.')} $${num(skjSeasonalOutlook.value)} (80% 밴드 ${num(skjSeasonalOutlook.band80[0])}~${num(skjSeasonalOutlook.band80[1])}). 과거 ${skjSeasonalOutlook.history.years}년 중 하락 ${skjSeasonalOutlook.history.down}회(평균 ${skjSeasonalOutlook.history.meanPct}%), 최근 10년은 ${skjSeasonalOutlook.recent10y.down}/${skjSeasonalOutlook.recent10y.years}회(평균 ${skjSeasonalOutlook.recent10y.meanPct}%). 예측치가 아니라 과거 계절 패턴이며 밴드는 백테스트 선행 잔차다.`;
const stockSeries: Serie[] = [
  { key: '재고', name: '방콕 캐너리 보유 원어 합', color: '#0891b2', type: 'area', fmt: (v) => `${num(v)} MT` },
];
const utilSeries: Serie[] = [
  { key: '가동률', name: '방콕 캐너리 평균 가동률', color: '#c98500', fmt: (v) => `${num1(v)} %` },
];

const unloadRows = bangkokYearly.map((y) => ({ 연도: String(y.year), 하역: y.unloadTotalMt }));
const unloadSeries: Serie[] = [
  { key: '하역', name: '하역 총량', color: C.rank, type: 'bar', fmt: (v) => `${num(v)} MT` },
];

/* ── 개관 탭 ───────────────────────────────────────────────────────────── */

export function HomeTab() {
  // 어튜나 시세는 페이월 자료라 정적 번들에 넣지 않는다 — 소유자 로그인 세션으로 라우트에서 받아 온다.
  const [atunaHistory, setAtunaHistory] = useState<AtunaHistoryRow[]>([]);
  const [atunaState, setAtunaState] = useState<'idle' | 'ready' | 'error'>('idle');
  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/atuna-prices', { cache: 'no-store', credentials: 'same-origin', signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((body: { history?: AtunaHistoryRow[]; restricted?: boolean }) => {
        if (body.restricted || !Array.isArray(body.history)) throw new Error('restricted');
        setAtunaHistory(body.history);
        setAtunaState('ready');
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name !== 'AbortError') setAtunaState('error');
      });
    return () => ctrl.abort();
  }, []);
  const actualRows = useMemo(() => buildOverviewRows(bangkokWeeks, singaporeMgoAt, atunaHistory), [atunaHistory]);
  const overviewRows = useMemo(
    () => appendSeasonalOutlook(actualRows, skjSeasonalOutlook),
    [actualRows],
  );
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
          note={`값이 없는 주와 의심 플래그 주(이웃 대비 급변 — 예: 2024-01-10 원문 $2,000, 전후 주 $1,450·어튜나 $1,480)는 선을 끊어 표시한다 (보간·정정하지 않음). 어튜나 시세는 로그인 세션으로 불러오며${atunaState === 'error' ? ' — 이번엔 불러오지 못했다' : ''}, 싱가포르 MGO는 보고일 직전 영업일 종가(${singaporeMgoMeta.first}~${singaporeMgoMeta.last}). ${outlookCaption}`}
          src={`${SRC} · 어튜나 SKJ 1.8kg CFR 방콕 · Ship & Bunker 싱가포르 MGO`}
        >
          <Legend items={priceSeries.map((s) => ({ name: s.name, color: s.color, dash: s.dash }))} />
          <Chart data={overviewRows} x="주" height={260} series={priceSeries} xInterval={25} yFmt={num} />
        </Panel>
        <Panel span={6} title="방콕 캐너리 보유 원어 합" unit="MT · 주간보고 냉동재고 SUM" src={SRC}>
          <Chart data={actualRows} x="주" height={180} series={stockSeries} xInterval={40} yFmt={num} />
        </Panel>
        <Panel span={6} title="방콕 캐너리 평균 가동률" unit="% · 일생산 ÷ 최대생산" src={SRC}>
          <Chart data={actualRows} x="주" height={180} series={utilSeries} xInterval={40} yFmt={num1} domain={[0, 100]} />
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
