'use client';

import Link from 'next/link';

import { AtlanticVesselTable } from './AtlanticVesselTable';
import { fleetDailyDeltaLabel } from '@/lib/data/fleet-daily-public';
import Chart, { Legend, type Serie } from '../cosmo/Chart';
import { Callout } from '../cosmo/Ui';
import { Grid, Panel, Sec, Signal, Signals, Stat, Stats, Table } from './PanofiUi';
import {
  actuals,
  annualSeries,
  annualVolumeSeries,
  atlanticNow,
  bangkokSeries,
  bep,
  catchBySpecies,
  channels,
  company,
  costBars,
  costStructure,
  dataQuality,
  exportByCommodity,
  exportByForm,
  exportByPartner,
  exportBySpecies,
  exportMarkets,
  fleetMargins,
  fleetTotals,
  fs2025,
  fuelSeries,
  h1,
  headline,
  importByPartner,
  industry,
  kpiSignals,
  latest,
  liquidity,
  liquidityBridge,
  liquiditySeries,
  mailDepartureConflicts,
  mailProcessingVsWeekly,
  marginRankShift,
  mirror,
  mirrorPairs,
  mirrorTopGap,
  mirrorUnmatched,
  monthlyEstimates,
  monthlySeries,
  bepChannelCross,
  pfc,
  priceSeries,
  priceWindow,
  priorities,
  processingSeries,
  receivableNow,
  receivableSeries,
  receivables,
  regionalLandingSeries,
  scenarios,
  seaTempSeries,
  sensitivityBars,
  stopCondition,
  temaGap,
  trade,
  tradeBalanceSeries,
  tradeLadderGap,
  tradeYear,
  valueLadder,
  vesselCostGroups,
  vesselFullPnl,
  weeks,
  ytd,
} from '@/lib/data/panofi';
import { ATLANTIC_MAIL_SOURCE, atlanticMails, latestAtlanticMail, mailMonthDay } from '@/lib/data/panofi-atlantic-mail';
import { CHART_RANK, HUB_ID, PANOFI_ID, SERIES as PALETTE, shareColor } from '@/lib/chart-palette';

/* --------------------------------------------------------------- 표기 헬퍼 */

const usd = (v: number) => `$${v.toLocaleString('en-US')}`;
const kusd = (v: number) => `${Math.round(v).toLocaleString('en-US')}천불`;
const musd = (v: number) => `${v.toLocaleString('en-US')}백만불`;
const man = (v: number) => `${v.toLocaleString('en-US')}만불`;
/** 숫자 뒤 조사 - 한국어로 읽은 끝소리로 고른다(1,850 «천팔백오십» → 으로, 1,445 «…오» → 로). */
const lastDigit = (n: number) => Math.abs(Math.round(n)) % 10;
const ro = (n: number) => ([0, 3, 6].includes(lastDigit(n)) ? '으로' : '로');
const ieot = (n: number) => ([0, 1, 3, 6, 7, 8].includes(lastDigit(n)) ? '이었다' : '였다');
const ton = (v: number) => `${v.toLocaleString('en-US')}톤`;
const pct = (v: number) => `${v}%`;
const num = (v: number | null | undefined) =>
  v === null || v === undefined ? '자료 없음' : v.toLocaleString('en-US');

/** 값이 없으면 0 으로 채우지 않는다 — '자료 없음'이 정직한 표시다. */
const orNA = (v: number | null | undefined, fmt: (n: number) => string) =>
  v === null || v === undefined ? '자료 없음' : fmt(v);

const S = (key: string, name: string, color: string, extra: Partial<Serie> = {}): Serie => ({
  key, name, color, ...extra,
});

/** 색은 실체를 따라간다 — 계열이 줄어도 남은 계열의 색이 바뀌지 않게 고정 배정한다. */
const C = {
  // 계열 1~5는 SERIES 앞 다섯 칸을 순서대로 — 이 순서가 인접 색각 검사를 통과한다(2026-09-11).
  s1: PALETTE[0],
  s2: PALETTE[1],
  s3: PALETTE[2],
  s4: PALETTE[3],
  s5: PALETTE[4],
  rank: CHART_RANK,
  mix: [shareColor(0), shareColor(1), shareColor(2)] as const,
  sign: ['#ef4444', '#3b82f6'] as [string, string], // 손익 부호 — 상태색이라 팔레트 밖
  danger: '#ef4444',
};

const SRC = {
  strategy: '「파노피 2026 상반기 평가·하반기 전략」(2026-07-29)',
  weekly: `「PANOFI 주간동향」 ${headline.weekCount}주 (${headline.rangeStart}~${headline.rangeEnd})`,
  ledger: `「2. 추정실적 (2026년 ${ytd.months}월).xlsx」 원장`,
  fs: '「Financial Statements(2025.12.31)」 신라교역 회계팀 확정 결산 xlsx - 세디 장부의 달러 환산, 분해는 시트 자체 각주',
  board: `「PANOFI 월간보고」 pptx ${liquidity.meta.sources.length}건 (${liquidity.meta.sources
    .map((s) => s.file.match(/\((\d+월)\)/)?.[1])
    .filter(Boolean)
    .join('·')})`,
  fleetDaily: `「해양수산본부 일일 업무보고」 ${atlanticNow.reportDate} 보고 · 선단 운영 화면 대서양 선망 공개 집계와 같은 값`,
  comtrade: 'UN Comtrade public preview · 가나(reporter 288) 보고 기준',
  nlm: 'NotebookLM 「가나 중심 서아프리카 참치 비즈니스 분석」(소스 82건, 등급 B)',
  grok: '외부 조사 1차출처 대조 (등급 B~부분확인)',
};

/* ------------------------------------------------------------------ 개관 */

export function HomeTab() {
  return (
    <>
      <Stats>
        <Stat k="가동 선망선" v={String(fleetTotals.activeCount)} unit="척" d={`총 ${num(fleetTotals.totalGt)} G/T`} />
        <Stat k={`${ytd.label} 생산`} v={num(ytd.productionT)} unit="톤" d={`전년동기 ${ytd.productionYoyPct}%`} tone="down" />
        <Stat k={`${ytd.label} 판매`} v={num(ytd.salesT)} unit="톤" d={`실현 어가 ${usd(ytd.priceUsdPerT)}/톤`} tone="down" />
        <Stat k="원장 손익분기" v={usd(ytd.ledgerBepUsdPerT)} unit="/톤" d={`실현 어가보다 $${Math.abs(ytd.ledgerBepUsdPerT - ytd.priceUsdPerT).toLocaleString('en-US')} ${ytd.ledgerBepUsdPerT >= ytd.priceUsdPerT ? '높음' : '낮음'} · 전략보고 상반기 ${usd(ytd.strategyBepUsdPerT)}`} tone="down" />
        <Stat k={`${ytd.label} 순손익`} v={kusd(ytd.netKusd)} tone="down" d="사내 원장 기준 · 이자·법인세 추징 반영" />
        <Stat k="자금 과부족" v={kusd(liquidityBridge?.endShortfall ?? receivables.cashShortfallKusd)} tone="down" d={`${liquidityBridge?.to ?? ''} 실측 · 그룹 합산 -3,000만불은 전략보고 6/30 기준`} />
      </Stats>

      <Sec>연도별 실적</Sec>
      <Grid>
        <Panel
          span={6}
          title="매출과 손익"
          unit={`백만 달러 · 2026년은 1~${ytd.months}월 누계`}
          note={`2025년은 영업이익 1,291만불을 냈지만 금융비용 676만불과 법인세를 빼고 나니 순이익이 0 근처였다. ${ytd.label}도 영업이익은 ${man(Math.round(ytd.operatingKusd / 10))} 흑자지만, 이자 ${man(Math.round(Math.abs(ytd.financeKusd) / 10))}과 법인세 ${man(Math.round(Math.abs(ytd.taxKusd) / 10))}을 빼면 순손익은 ${man(Math.round(Math.abs(ytd.netKusd) / 10))} ${ytd.netKusd < 0 ? '적자' : '흑자'}다. 전략보고의 상반기 순손익 ${man(Math.round(h1.netKusd / 10))}은 세금 추징분까지 합친 값이라 이 원장 순손익과 직접 비교하지 않는다. 회계팀 확정 결산(세디 장부를 달러로 환산한 값)은 2025년 순이익을 +2,298만불로 잡지만, 이는 세디 강세로 생긴 환산이익 때문이고 환율 효과를 빼면 249만불 적자다.`}
          src={`${SRC.strategy} · 2025 확정치 참조는 ${SRC.fs}`}
        >
          <Chart
            data={annualSeries}
            x="label"
            height={260}
            series={[
              S('매출', '매출', C.s1, { type: 'bar' }),
              S('영업이익', '영업이익', C.s2, { type: 'line' }),
              S('순이익', '순이익', C.s3, { type: 'line' }),
            ]}
            zeroLine
            yFmt={musd}
          />
          <Legend items={[
            { name: '매출', color: C.s1, box: true },
            { name: '영업이익', color: C.s2 },
            { name: '순이익', color: C.s3 },
          ]} />
        </Panel>
      </Grid>

      <Sec>주간 경영회의 신호등</Sec>
      <Signals>
        {kpiSignals.map((k) => (
          <Signal key={k.kpi} k={`${k.kpi} (${k.unit})`} normal={k.normal} warn={k.warn} action={k.action} />
        ))}
      </Signals>

      <Sec>법인</Sec>
      <Grid>
        <Panel span={12} src={`${SRC.nlm} · 선단 구성은 사내 확인(2026-08)`}>
          <div className="pf-note">
            {company.name}({company.nameEn})는 {company.established} {company.base}에 세운 {company.ownership}이다.
            현재 선단은 선망 {fleetTotals.activeCount}척이며, 외부 등록 자료에 남아 있는 운반선 볼타 글로리는
            매각이 완료돼 가동 대수에서 뺐다.
          </div>
        </Panel>
      </Grid>
    </>
  );
}

/** 주간동향 추출 필드 → 화면 이름. 키는 추출 스크립트가 정한다. */
const COVERAGE_LABEL: Record<string, string> = {
  'prices.cosmoTema': '코스모 어가 (테마)',
  'prices.scodiAbidjan': 'SCODI 어가 (아비장)',
  'fx.cediPerUsd': '세디/달러 환율',
  'dailyProcessing.COSMO': '코스모 일 가공량',
  'receivables.totalUsd': '아비장 미수금 합계',
  'fuel(형식 온전)': '유가 (양식 온전)',
  'fleetStatus(관측됨)': '선단 동향 (기재됨)',
  'senegalFleet': '세네갈 선단 입출항',
  'fishingGround.coastalMax': '연안 수온 상단값',
};

/* ------------------------------------------------------------- 선단·조업 */

export function FleetTab() {
  const deltaTone = atlanticNow.dailyDeltaMt >= 0 ? '▲' : '▼';
  return (
    <>
      <Sec>오늘의 조업 - 대서양 선망 7척</Sec>
      <Stats>
        <Stat
          k="일간 어획" v={atlanticNow.dailyMt.toLocaleString()} unit="톤"
          tone={atlanticNow.dailyDeltaMt >= 0 ? 'up' : 'down'}
          d={`${fleetDailyDeltaLabel} ${deltaTone}${Math.abs(atlanticNow.dailyDeltaMt).toLocaleString()}톤 · ${atlanticNow.asOf} 기준`}
        />
        <Stat k="월간 누계" v={atlanticNow.monthlyMt.toLocaleString()} unit="톤" d={`${Number(atlanticNow.asOf.slice(5, 7))}월 어획`} />
        <Stat k="연간 누계" v={atlanticNow.annualMt.toLocaleString()} unit="톤" d="2026년 어획" />
      </Stats>
      <p className="pf-src" style={{ margin: '0 0 14px' }}>
        {SRC.fleetDaily} - 선박 위치는 <Link href="/fleet">/fleet</Link> (로그인)
      </p>
      <AtlanticVesselTable />

      <Sec>척당 경제학</Sec>
      <Grid>
        <Panel
          span={6}
          title="직접마진 - 공통비 배부 전"
          unit="백만 달러"
          note={`상반기 7척 직접마진 합계 ${man(Math.round(fleetTotals.totalMarginMusd * 100))}로 같은 기간 공통비 ${fleetTotals.sharedCostMusd}만불을 덮지 못한다(전략보고 기준 - 아래 1~8월 원장의 배부 후 세전이익과 기간·기준이 다르다). 척당 문제가 아니라 선단 전체의 물량 문제다.`}
          src={`${SRC.strategy} §5-1`}
        >
          <Chart
            data={fleetMargins.map((v) => ({ label: v.name, 직접마진: v.marginMusd }))}
            x="label" height={250} horizontal labelWidth={92}
            series={[S('직접마진', '직접마진', C.rank, { type: 'bar', signColor: C.sign })]}
            zeroLine yFmt={musd}
          />
        </Panel>

        <Panel
          span={6}
          title="세전이익 - 공통비 배부 후"
          unit="천 달러"
          note={`배부 전후로 순위가 뒤집히는 배가 있다. 어느 배를 줄일지 판단할 때는 반드시 배부 후를 본다. ${ytd.pretaxProfitNames.length ? `${ytd.label} 세전 흑자를 낸 배는 ${ytd.pretaxProfitNames.join('·')} ${ytd.pretaxProfitNames.length}척이다.` : `${ytd.label} 세전 흑자를 낸 배는 없다.`}`}
          src={`${SRC.ledger} 실적(생산) 시트`}
        >
          <Chart
            data={vesselFullPnl.map((v) => ({ label: v.name, 세전이익: Math.round((v.세전이익 ?? 0) / 1000) }))}
            x="label" height={250} horizontal labelWidth={92}
            series={[S('세전이익', '세전이익', C.rank, { type: 'bar', signColor: C.sign })]}
            zeroLine yFmt={kusd}
          />
        </Panel>

        <Panel
          span={12}
          title="순위 역전"
          unit="직접마진 순위 대비 배부 후 세전이익 순위"
          note={`개별 총톤수는 회사 공개자료(sla.co.kr)와 ICCAT 등록부가 일치하는 값이며 7척 합 ${num(fleetTotals.totalGt)} G/T 다. ${ytd.label} 생산은 원장 실적(생산) 시트 기준으로 누계 ${orNA(actuals.byVessel.totals.생산량MT, (n) => num(Math.round(n)))}톤과 맞는다 - 어종·사이즈 배분 합계 ${num(actuals.meta.catchMixTotalMT)}톤과는 ${num(ytd.catchMixGapT)}톤 차이가 나며 원본 그대로 두었다. 주간동향 원문에는 자사선 조업량이 없어(입출항·상태만 기재) 척별 생산은 원장에서만 온다.`}
          src={`${SRC.strategy} §5-1 + ${SRC.ledger} + 선박 등록 제원(sla.co.kr·ICCAT)`}
        >
          <Table head={['선박', '총톤수 (G/T)', `${ytd.label} 생산 (톤)`, '직접마진 순위', '완전손익 순위', '변동', '세전이익 (달러)']}>
            {marginRankShift.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{num(r.gt)}</td>
                <td>{orNA(r.productionT, (n) => num(Math.round(n)))}</td>
                <td>{r.직접마진순위 ?? '-'}</td>
                <td>{r.완전손익순위}</td>
                <td className={(r.shift ?? 0) > 0 ? 'up' : (r.shift ?? 0) < 0 ? 'down' : ''}>
                  {r.shift === null || r.shift === 0 ? '-' : r.shift > 0 ? `▲${r.shift}` : `▼${-r.shift}`}
                </td>
                <td className={(r.세전이익 ?? 0) >= 0 ? 'up' : 'down'}>{num(Math.round(r.세전이익 ?? 0))}</td>
              </tr>
            ))}
            <tr className="sum">
              <td>합계</td>
              <td>{num(fleetTotals.totalGt)}</td>
              <td>{orNA(actuals.byVessel.totals.생산량MT, (n) => num(Math.round(n)))}</td>
              <td colSpan={3} />
              <td className="down">{num(Math.round(actuals.byVessel.totals.세전이익 ?? 0))}</td>
            </tr>
          </Table>
        </Panel>
      </Grid>

      <Sec>어획 구성과 원가</Sec>
      <Grid>
        <Panel
          span={6}
          title="어종별 생산"
          unit="톤"
          note={`가다랑어가 ${catchBySpecies[0]?.비중}%로 주력이며 통조림 원료로 나간다. 어종·사이즈 원장 합계 ${num(actuals.meta.catchMixTotalMT)}톤은 총 생산 ${num(ytd.productionT)}톤과 ${num(ytd.catchMixGapT)}톤 차이가 난다(잡어·미배분으로 추정, 원본 그대로).`}
          src={`${SRC.ledger} 매출단가 시트`}
        >
          <Chart
            data={catchBySpecies} x="label" height={220}
            series={[S('생산량', '생산량', C.rank, { type: 'bar' })]}
            yFmt={ton}
          />
        </Panel>

        <Panel
          span={6}
          title="척별 원가 3분류"
          unit="천 달러 · 재료비 / 노무비 / 경비"
          src={`${SRC.ledger} 실적(생산) 시트 제조원가`}
        >
          <Chart
            data={vesselCostGroups} x="label" height={220}
            series={[
              S('재료비', '재료비', C.mix[0], { type: 'bar', stackId: 'c' }),
              S('노무비', '노무비', C.mix[1], { type: 'bar', stackId: 'c' }),
              S('경비', '경비', C.mix[2], { type: 'bar', stackId: 'c' }),
            ]}
            yFmt={kusd}
          />
          <Legend items={[
            { name: '재료비 (유류·윤활유)', color: C.mix[0], box: true },
            { name: '노무비 (선원)', color: C.mix[1], box: true },
            { name: '경비 (선용품·어구·수선·입어료·항만)', color: C.mix[2], box: true },
          ]} />
        </Panel>
      </Grid>

      <Sec>어장과 역내 공급</Sec>
      <Grid>
        <Panel
          span={6} title="어장 수온" unit="섭씨 · 주간 상단값"
          note="연안과 대양의 수온차가 벌어지면 어군이 흩어져 항차 효율이 떨어진다. 금어기(3/17~4/30)에는 조업이 멈춘다."
          src={SRC.weekly}
        >
          <Chart
            data={seaTempSeries} x="label" height={200} xInterval={4}
            series={[S('연안', '연안', C.s1, { type: 'line' }), S('대양', '대양', C.s2, { type: 'line' })]}
            yFmt={(v) => `${v}℃`}
          />
          <Legend items={[{ name: '연안', color: C.s1 }, { name: '대양', color: C.s2 }]} />
        </Panel>

        <Panel
          span={6} title="어장·선단 메모" unit={`주말 메일 ${mailMonthDay(latestAtlanticMail.date)}`}
          src={ATLANTIC_MAIL_SOURCE}
        >
          <ul className="pf-note" style={{ margin: 0, paddingLeft: 18 }}>
            {latestAtlanticMail.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </Panel>

        {/* 물량과 척수는 단위가 다르다. 한 그림에 두 축을 얹으면 없는 상관을 만들어 낸다 —
            두 패널로 나눠 각자 축을 하나만 갖게 한다. */}
        <Panel span={12} title="역내 입항 물량" unit="톤 · 세네갈·EU 선단" src={SRC.weekly}>
          <Chart
            data={regionalLandingSeries} x="label" height={200} xInterval={6}
            series={[S('입항톤수', '입항 물량', C.rank, { type: 'bar' })]}
            yFmt={ton}
          />
        </Panel>
        <Panel
          span={12} title="역내 입항 척수" unit="척"
          note="역내 입항이 몰리면 가공사 처리 슬롯과 선석이 함께 막혀 항차 사이클이 늘어난다. 목표는 6일 이내다."
          src={SRC.weekly}
        >
          <Chart
            data={regionalLandingSeries} x="label" height={200} xInterval={6}
            series={[S('척수', '척수', C.rank, { type: 'line' })]}
            yFmt={(v) => `${v}척`}
          />
        </Panel>

        <Panel
          span={12} title="세네갈 선단 입출항" unit={`주말 메일 ${mailMonthDay(latestAtlanticMail.date)} · 톤`}
          note="주간동향(화요일자) 사이에 오는 주말 메일이라 입출항이 며칠 더 최신이다. 톤수를 확인 중인 배는 비워 둔다."
          src={ATLANTIC_MAIL_SOURCE}
        >
          <Table head={['선박', '물량', '입항', '출항', '상태']}>
            {latestAtlanticMail.senegalCalls.map((c) => (
              <tr key={c.vessel}>
                <td>{c.vessel}</td>
                <td>{orNA(c.tons, num)}</td>
                <td>{c.arrive}</td>
                <td>{c.depart ?? '미정'}</td>
                <td style={{ textAlign: 'left' }}>{c.status}</td>
              </tr>
            ))}
          </Table>
          {mailDepartureConflicts.length > 0 && (
            <Callout kind="warn" label="주간동향과 어긋남">
              {mailDepartureConflicts.map((c) =>
                `${c.vessel} - ${c.mailLabel} 메일은 「${c.mailStatus}」인데 ${c.weeklyLabel} 주간동향은 ${c.weeklyDepart} 출항 완료로 적었다.`,
              ).join(' ')}
            </Callout>
          )}
        </Panel>
      </Grid>
    </>
  );
}

/* ------------------------------------------------------------ 어가·채널 */

export function PriceTab() {
  const m = pfc.measured;
  return (
    <>
      <Stats>
        <Stat k="PFC (테마)" v={orNA(latest.prices.pfcTema, usd)} unit="/톤"
          d={`${latest.prices.pfcTemaMonth ?? '월 미상'} 기준 · 측정 ${priceWindow.weekCount}주 중 변동 ${priceWindow.changes.PFC}회`} />
        <Stat k="코스모 (테마)" v={orNA(latest.prices.cosmoTema, usd)} unit="/톤"
          d={`${latest.prices.cosmoTemaMonth ?? '월 미상'} 기준 · 변동 ${priceWindow.changes.코스모}회`} />
        <Stat k="SCODI (아비장)" v={orNA(latest.prices.scodiAbidjan, usd)} unit="/톤"
          d={`${latest.prices.scodiAbidjanMonth ?? '월 미상'} 기준 · 변동 ${priceWindow.changes.SCODI}회`} />
        {/* 두 채널의 월이 갈린 주에는 뺄셈이 성립하지 않는다 - 숫자를 만들지 않고 그 사실을 쓴다 */}
        <Stat
          k="PFC 격차"
          v={temaGap.usdPerT != null ? usd(temaGap.usdPerT) : '비교 불가'}
          unit={temaGap.comparable ? '/톤' : undefined}
          tone={temaGap.comparable && (temaGap.usdPerT ?? 0) < 0 ? 'down' : undefined}
          d={temaGap.comparable
            ? `측정 ${priceWindow.weekCount}주 평균 ${usd(m.gapVsCosmoUsdPerT.mean)}`
            : `PFC ${temaGap.pfcMonth ?? '미상'} · 코스모 ${temaGap.cosmoMonth ?? '미상'} 기준`} />
        <Stat k="원장 손익분기" v={usd(ytd.ledgerBepUsdPerT)} unit="/톤" d={`전략보고 상반기 ${usd(bep.priceUsdPerT)}`} />
      </Stats>

      <Sec>채널별 어가</Sec>
      <Grid>
        <Panel
          span={12} title={`채널별 어가 ${headline.weekCount}주`} unit="달러/톤"
          note={`원장 ${ytd.label} 손익분기 ${usd(ytd.ledgerBepUsdPerT)}를 넘은 주는 ${headline.weekCount}주 중 ${bepChannelCross.rows.map((r) => `${r.name} ${r.weeksAbove}주(${r.firstLabel}부터)`).join(' · ') || '없다'}. 전략보고 상반기 손익분기는 ${usd(bep.priceUsdPerT)}${ieot(bep.priceUsdPerT)}. 로컬 마켓은 즉시 현금이지만 분기점을 크게 밑돌아 저가 사이즈 소진용으로만 쓴다.`}
          src={SRC.weekly}
        >
          <Chart
            data={priceSeries} x="label" height={280} xInterval={4}
            series={[
              S('코스모', '코스모 (관계사)', PANOFI_ID.cosmo, { type: 'line' }),
              S('PFC', 'PFC (연간계약)', PANOFI_ID.pfc, { type: 'line' }),
              S('SCODI', 'SCODI (시장연동)', PANOFI_ID.scodi, { type: 'line' }),
              S('아비장로컬', '아비장 로컬', PANOFI_ID.abidjan, { type: 'line' }),
              S('테마로컬', '테마 로컬', PANOFI_ID.tema, { type: 'line' }),
            ]}
            refLines={[{ y: ytd.ledgerBepUsdPerT, label: `원장 BEP ${usd(ytd.ledgerBepUsdPerT)}`, color: C.danger }]}
            yFmt={usd}
          />
          <Legend items={[
            { name: '코스모 (관계사)', color: PANOFI_ID.cosmo },
            { name: 'PFC (연간계약)', color: PANOFI_ID.pfc },
            { name: 'SCODI (시장연동)', color: PANOFI_ID.scodi },
            { name: '아비장 로컬', color: PANOFI_ID.abidjan },
            { name: '테마 로컬', color: PANOFI_ID.tema },
          ]} />
        </Panel>
      </Grid>

      <Sec>PFC 수요독점</Sec>
      <Grid>
        <Panel
          span={12} title="가공사별 일일 처리량" unit="톤"
          note={m.caveat}
          src={`${SRC.weekly} · 소유구조는 ${SRC.nlm}`}
        >
          <Chart
            data={processingSeries} x="label" height={230} xInterval={4}
            series={[
              S('PFC', 'PFC', PANOFI_ID.pfc, { type: 'line' }),
              S('코스모', '코스모', PANOFI_ID.cosmo, { type: 'line' }),
              S('SCODI', 'SCODI', PANOFI_ID.scodi, { type: 'line' }),
              S('SCASA', '스카사', PANOFI_ID.scasa, { type: 'line' }),
            ]}
            yFmt={ton}
          />
          <Legend items={[
            { name: 'PFC', color: PANOFI_ID.pfc }, { name: '코스모', color: PANOFI_ID.cosmo },
            { name: 'SCODI', color: PANOFI_ID.scodi }, { name: '스카사', color: PANOFI_ID.scasa },
          ]} />
          <Callout kind="warn" label="판정">{m.verdict}</Callout>
          <Callout kind="info" label="근거">
            {m.volumeTest.finding} {m.volumeTest.decisiveCase} 이탈이 불가능한 이유는 대안 채널의 흡수 상한이다.
            SCODI는 {m.absorptionLimits.SCODI}, 코스모는 {m.absorptionLimits.코스모}, 로컬은 {m.absorptionLimits.로컬마켓}.
          </Callout>
          {/* 근거 바로 아래에 둔다. 교란을 각주로 밀면 판정만 읽고 넘어간다. */}
          <Callout kind="warn" label="아직 제거하지 못한 교란">
            {m.seasonalConfound.detail} {m.seasonalConfound.howToSettle}
          </Callout>
          <Callout kind="info" label="프레임">{m.verdictNote}</Callout>
          {/* 판정은 고정 창의 실측이다. 창 밖에서 전제가 흔들리면 판정 옆에 붙여 둔다 -
              각주로 밀면 판정만 읽고 넘어간다. */}
          {latest.prices.pfcTema != null && latest.prices.pfcTema !== m.currentPrices.PFC && (
            <Callout kind="warn" label="측정 창 밖의 변화">
              위 판정은 {m.currentPrices.asOf}까지 {priceWindow.weekCount}주 실측이다.
              그 뒤 {latest.reportDate} 주간동향에서 PFC가 {usd(m.currentPrices.PFC)}에서{' '}
              {usd(latest.prices.pfcTema)}({latest.prices.pfcTemaMonth ?? '월 미상'} 어가)으로 올라
              {latest.prices.cosmoTema != null && latest.prices.pfcTema > latest.prices.cosmoTema
                ? ' 코스모를 처음으로 넘어섰다.'
                : ' 움직였다.'}{' '}
              {temaGap.underNegotiation
                ? `다만 코스모는 ${temaGap.cosmoMonth ?? '지난달'} 값을 그대로 둔 채 협의 중이라 두 채널의 격차는 아직 같은 기준으로 비교할 수 없다. «저가 구매자인데도 물량이 안 빠진다»는 전제가 바뀌는지는 코스모 ${temaGap.pfcMonth ?? '당월'} 어가가 확정된 뒤 다시 잰다.`
                : temaGap.comparable
                  ? `코스모도 ${temaGap.cosmoMonth} 어가를 ${usd(latest.prices.cosmoTema ?? 0)}${ro(latest.prices.cosmoTema ?? 0)} 확정해 격차는 ${usd(temaGap.usdPerT ?? 0)}(${(temaGap.usdPerT ?? 0) > 0 ? 'PFC 우위' : '코스모 우위'})다. «저가 구매자인데도 물량이 안 빠진다»는 전제가 바뀌는지는 이 확정가로 다음 측정 창에서 다시 잰다.`
                  : ''}
            </Callout>
          )}
        </Panel>
      </Grid>

      <Sec>채널 정책과 국제 기준가</Sec>
      <Grid>
        <Panel span={6} title="채널 정책" unit="7월 기준" src={`${SRC.strategy} §6`}>
          <Table head={['채널', '지역', '어가 (달러/톤)', '성격', '하반기 방침']}>
            {channels.map((c) => (
              <tr key={c.channel}>
                <td>{c.channel}</td>
                <td>{c.location}</td>
                <td>{num(c.priceUsdPerT)}</td>
                <td style={{ textAlign: 'left' }}>{c.trait}</td>
                <td style={{ textAlign: 'left' }}>{c.policy}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={6} title="방콕 기준가" unit="달러/톤 · 가다랑어"
          note={industry.skipjackBangkok.caveat}
          src={SRC.grok}
        >
          <Chart
            data={bangkokSeries} x="label" height={200}
            series={[S('방콕', '방콕 가다랑어', HUB_ID.bkk, { type: 'bar' })]}
            yFmt={usd}
          />
        </Panel>
      </Grid>

      <Sec>주말 대서양 메일</Sec>
      <Grid>
        <Panel
          span={12} title={`주말 메일 ${atlanticMails.length}건 - 주간동향에 없는 값`} unit="어가·운임 달러/톤 · 선박용 경유(MGO) 달러/KL · 물량 톤"
          note={(() => {
            const first = atlanticMails[0];
            const last = latestAtlanticMail;
            const sales = last.grandBleuSales.map((g) => g.priceUsd);
            const scasaMove = last.scasa.priceUsd !== first.scasa.priceUsd
              ? `스카사 어가가 ${usd(first.scasa.priceUsd)}에서 ${usd(last.scasa.priceUsd)}${ro(last.scasa.priceUsd)} 올라 코스모(${usd(last.cosmo.priceUsd)}, ${last.cosmo.priceMonth})보다 ${usd(last.scasa.priceUsd - last.cosmo.priceUsd)} 높다.`
              : `스카사 어가는 ${usd(last.scasa.priceUsd)}${ro(last.scasa.priceUsd)} 그대로다.`;
            const salesLine = sales.length
              ? ` 그랑블루는 ${usd(Math.min(...sales))}~${usd(Math.max(...sales))}에 팔았다${last.freightUsdPerT != null ? `(운임 ${usd(last.freightUsdPerT)})` : ''}. 코스모 어가와의 차이가 운임을 빼고도 남는지가 판매처 협의의 기준이 된다.`
              : '';
            return `${scasaMove}${salesLine} 경유(MGO) 가격은 메일마다 직전 주간동향 값을 그대로 옮긴다.`;
          })()}
          src={ATLANTIC_MAIL_SOURCE}
        >
          <Table head={['항목', ...atlanticMails.map((m) => mailMonthDay(m.date))]}>
            <tr>
              <td>스카사 어가</td>
              {atlanticMails.map((m) => <td key={m.date}>{usd(m.scasa.priceUsd)}</td>)}
            </tr>
            <tr>
              <td>코스모 어가</td>
              {atlanticMails.map((m) => (
                <td key={m.date}>{usd(m.cosmo.priceUsd)} ({m.cosmo.priceMonth}){m.cosmo.nextMonthUnderNegotiation ? ' · 다음 달 협의 중' : ''}</td>
              ))}
            </tr>
            <tr>
              <td>PFC 어가</td>
              {atlanticMails.map((m) => <td key={m.date}>{m.pfc.priceUsd != null ? usd(m.pfc.priceUsd) : m.pfc.note ?? '자료 없음'}</td>)}
            </tr>
            <tr>
              <td>그랑블루 판매가</td>
              {atlanticMails.map((m) => (
                <td key={m.date} style={{ textAlign: 'left' }}>
                  {m.grandBleuSales.length ? m.grandBleuSales.map((g) => `${g.market} ${usd(g.priceUsd)} (${g.terms})`).join(' · ') : '-'}
                </td>
              ))}
            </tr>
            <tr>
              <td>운임</td>
              {atlanticMails.map((m) => <td key={m.date}>{orNA(m.freightUsdPerT, usd)}</td>)}
            </tr>
            <tr>
              <td>코스모 일 가공</td>
              {atlanticMails.map((m) => <td key={m.date}>{ton(m.cosmo.dailyProcessingT)}</td>)}
            </tr>
            <tr>
              <td>코스모 원어 재고</td>
              {atlanticMails.map((m) => (
                <td key={m.date}>{ton(m.cosmo.stock.totalT)} ({mailMonthDay(m.cosmo.stock.asOf)})</td>
              ))}
            </tr>
            <tr>
              <td>경유(MGO) 테마 · 해상 급유 · 아비장</td>
              {atlanticMails.map((m) => (
                <td key={m.date}>{[m.mgo.tema, m.mgo.tanker, m.mgo.abidjan].map((v) => orNA(v, usd)).join(' · ')}</td>
              ))}
            </tr>
          </Table>
          <Callout kind="warn" label="주간동향과 어긋나는 가공량">
            {mailProcessingVsWeekly.map((r) =>
              `${r.weeklyLabel} 주간동향 코스모 ${orNA(r.cosmoWeekly, ton)} 대 ${r.mailLabel} 메일 ${ton(r.cosmoMail)}`,
            ).join(', ')}.
            {new Set(mailProcessingVsWeekly.map((r) => r.cosmoWeekly)).size === 1
              && new Set(mailProcessingVsWeekly.map((r) => r.cosmoMail)).size > 1
              ? ' 주간동향은 같은 값을 이어 적고 메일만 움직인다.'
              : ''}{' '}
            코스모 주간보고 원장과의 대조는 코스모 화면의 데이터 품질 탭에 있다.
            {mailProcessingVsWeekly.filter((r) => r.pfcMailNote).map((r) =>
              ` ${r.weeklyLabel} 주간동향은 PFC 일 ${orNA(r.pfcWeekly, ton)}인데 ${r.mailLabel} 메일은 「${r.pfcMailNote}」이다.`,
            ).join('')}
          </Callout>
        </Panel>
      </Grid>
    </>
  );
}

/* ------------------------------------------------------------- 손익·원가 */

export function ProfitTab() {
  return (
    <>
      <Stats>
        <Stat k="매출액" v={kusd(ytd.revenueKusd)} d={`전년동기 ${ytd.revenueYoyPct}%`} tone="down" />
        <Stat k="매출총이익" v={kusd(ytd.grossProfitKusd)} d={`전년동기 ${ytd.grossProfitYoyPct}%`} tone="down" />
        <Stat k="영업이익" v={kusd(ytd.operatingKusd)} tone={ytd.operatingKusd >= 0 ? 'up' : 'down'} />
        <Stat k="당기순이익" v={kusd(ytd.netKusd)} tone="down" d="사내 원장 기준" />
        <Stat k="원가율" v={pct(ytd.costRatioPct ?? 0)} tone="down" d={`전년동기 ${pct(ytd.costRatioPrevPct ?? 0)}`} />
      </Stats>
      {ytd.lastMonth ? (
        <Callout kind="info" label={`${ytd.lastMonth.month} 한 달`}>
          판매 {num(Math.round(ytd.lastMonth.수량MT ?? 0))}톤 · 단가 {usd(Math.round(ytd.lastMonth.평균단가 ?? 0))}
          · 영업이익 {kusd(Math.round((ytd.lastMonth.영업이익 ?? 0) / 1000))}
          · 당기순이익 {kusd(Math.round((ytd.lastMonth.당기순이익 ?? 0) / 1000))}.
          누계 생산 {num(ytd.productionT)}톤, 판매 {num(ytd.salesT)}톤, 기말재고 {num(ytd.inventoryT)}톤.
          {ytd.months}개월을 연환산하지 않는다.
        </Callout>
      ) : null}

      <Sec>2025 확정 결산</Sec>
      <Grid>
        <Panel
          span={12}
          title="2025 확정 결산 - 회계팀 재무제표"
          unit="백만 달러 · 세디 장부를 달러로 환산한 값"
          note={`매출 ${man(fs2025.breakdown.revenue)}은 원장 8,376만불(판매기준)·전략보고 8,400만불과 기준이 다르다. 회계 결산은 세디 장부를 달러로 환산한 값이라 다른 두 수치와 맞추지 않았다. 영업이익 ${man(fs2025.breakdown.op)}(+7.2%)은 전략보고 기준의 기록 경신과 방향이 같지만(회계 기준 시계열은 2개년뿐) 이자 ${man(Math.abs(fs2025.breakdown.interest))}이 여전히 이익을 잠식하고, 기타 대손상각 ${man(fs2025.breakdown.badDebt)}이 새로 얹혔다.`}
          src={SRC.fs}
        >
          <Table head={['구분', '2024', '2025', '전년비']}>
            {fs2025.isRows.map((r) => (
              <tr key={r.item}>
                <td>{r.item}</td>
                <td className={(r.y2024 ?? 0) >= 0 ? '' : 'down'}>{num(r.y2024)}</td>
                <td className={r.y2025 >= 0 ? 'up' : 'down'}><b>{num(r.y2025)}</b></td>
                <td>{r.yoyPct === null ? '흑자 전환' : `${r.yoyPct >= 0 ? '+' : ''}${r.yoyPct}%`}</td>
              </tr>
            ))}
          </Table>
          <Callout kind="warn" label={`순이익 +${man(fs2025.breakdown.net)}의 실체`}>
            흑자 전환의 실체는 외환손익 +{man(fs2025.breakdown.fxTotal)}이다 - 세디 절상으로 기말환율이
            {' '}{fs2025.fx.close2024}에서 {fs2025.fx.close2025}(세디/달러)로 내려가 외화부채의 세디 환산액이
            급감했고, 환산이익만 +{man(fs2025.breakdown.fxTranslationGain)}이다. 외환을 제외한 실질은
            {' '}{man(fs2025.breakdown.netExFx)}로 전년 +{man(fs2025.breakdown.netExFxPrev)}에서 적자 전환이며,
            유형자산처분이익까지 빼면 {man(fs2025.breakdown.netExFxExDisposal)}, 척당
            {' '}{man(fs2025.breakdown.perVesselKusd / 10)}(전년 +{man(fs2025.breakdown.perVesselPrevKusd / 10)})이다.
            이 분해는 추정이 아니라 회계팀 시트 자체 각주다.
          </Callout>
        </Panel>
      </Grid>

      <Sec>비용 구조와 민감도</Sec>
      <Grid>
        <Panel
          span={6} title="비용 구조" unit={`매출 대비 % · ${costStructure.basisNote}`}
          note="유류가 매출의 39.6%로 지배적이다. 이미 특별공급가로 시장 대비 25% 싸게 사고 있어 단가 절감 여지는 제한적이며, 레버는 소모량(척당 KL/조업일)과 운항 계획이다."
          src={`${SRC.strategy} §4`}
        >
          <Chart
            data={costBars} x="label" height={300} horizontal labelWidth={104}
            series={[S('비중', '매출 대비 비중', C.rank, { type: 'bar' })]}
            yFmt={pct}
          />
        </Panel>

        <Panel
          span={6} title="하반기 손익 민감도" unit="만 달러 · 기준 판매 38,000톤 대비"
          note="어가 ±$50/톤이 ±190만불로 가장 크지만 시황이라 통제 밖이다. 통제권 안에서 가장 큰 레버는 어획 ±2,000톤(±150만불)이며, 이것이 하반기 전략을 «잔고기 시즌 어획 극대화»로 모는 이유다."
          src={`${SRC.strategy} §4 - 내부 가정 기반(등급 C)`}
        >
          <Chart
            data={sensitivityBars} x="label" height={300} horizontal labelWidth={118}
            series={[S('영향', '손익 영향', C.rank, { type: 'bar' })]}
            yFmt={man}
          />
        </Panel>
      </Grid>

      <Sec>월별·연도별 추이</Sec>
      <Grid>
        {/* 물량과 단가는 단위가 다르다. 이중축 대신 두 패널로 나눈다. */}
        <Panel span={6} title="월별 판매량" unit="톤 · 판매기준" src={`${SRC.ledger} 실적 시트 월별 현황`}>
          <Chart data={monthlySeries} x="label" height={200}
            series={[S('판매량', '판매량', C.rank, { type: 'bar' })]} yFmt={ton} />
        </Panel>
        <Panel span={6} title="월별 평균단가" unit="달러/톤" note={actuals.meta.caveat} src={`${SRC.ledger} 실적 시트`}>
          <Chart data={monthlySeries} x="label" height={200}
            series={[S('평균단가', '평균단가', C.s3, { type: 'line' })]} yFmt={usd} />
        </Panel>

        <Panel
          span={6} title="연도별 판매량" unit="톤 · 판매기준"
          note="전략보고가 인용하는 2025년 66,674톤은 생산기준이다. 여기 64,689톤은 판매기준이라 값이 다르며 충돌이 아니다."
          src={`${SRC.ledger} 실적 시트 연도별 현황 - 판매기준`}
        >
          <Chart data={annualVolumeSeries} x="label" height={200}
            series={[S('판매량', '판매량', C.rank, { type: 'bar' })]} yFmt={ton} />
        </Panel>
        <Panel
          span={6} title="연도별 평균단가와 원가율" unit="달러/톤 · %"
          note="2023년 1,499달러가 최고였고 이후 1,270~1,295 대에서 횡보한다. 원가율은 물량이 많은 해에 낮아진다 - 규모의 경제가 실제로 작동한다."
          src={`${SRC.ledger} 실적 시트`}
        >
          <Chart data={annualVolumeSeries} x="label" height={180}
            series={[S('평균단가', '평균단가', C.s3, { type: 'line' })]} yFmt={usd} />
          <Chart data={annualVolumeSeries} x="label" height={130}
            series={[S('원가율', '원가율', C.rank, { type: 'line' })]} yFmt={pct} />
          <Legend items={[{ name: '평균단가 (달러/톤)', color: C.s3 }, { name: '원가율 (%)', color: C.rank }]} />
        </Panel>
      </Grid>
    </>
  );
}

/* ------------------------------------------------------------- 자금·미수금 */

/** 과부족 증감 서술 — 방향이 달마다 바뀌므로(7/31 «회수했는데 악화» → 8/31 «채권이 늘며 개선») 부호에서 만든다. */
function liquidityNote(b: NonNullable<typeof liquidityBridge>): string {
  const sign = (v: number | null) => (v === null ? '-' : `${v > 0 ? '+' : ''}${num(v)}`);
  const ar = b.매출채권 ?? 0;
  const ap = b.매입채무 ?? 0;
  const ytd = `${b.from} → ${b.to} 과부족 ${sign(b.과부족)}천불: 현금 ${sign(b.현금)}, 매출채권 ${sign(b.매출채권)}(${ar <= 0 ? '회수' : '미회수 증가'}), 매입채무 ${sign(b.매입채무)}(${ap > 0 ? '외상 증가' : '상환'}).`;
  const driver = ap > 0 && ap >= Math.abs(ar)
    ? ' 연초 대비로는 매입채무가 가장 크게 움직여 과부족을 벌렸다.'
    : ar > 0 ? ' 연초 대비로는 매출채권 증가가 과부족을 덮고 있다 - 현금이 아니라 받을 돈이다.' : '';
  const st = b.step;
  const month = b.prevAsOf && st.과부족 !== null
    ? ` 직전 ${b.prevAsOf} 대비로는 ${Math.abs(st.과부족 ?? 0).toLocaleString('en-US')}천불${(st.과부족 ?? 0) > 0 ? ' 개선' : ' 악화'}이며 매출채권 ${sign(st.매출채권)} · 매입채무 ${sign(st.매입채무)} · 현금 ${sign(st.현금)}이다.${(st.매출채권 ?? 0) > 0 && (st.과부족 ?? 0) > 0 ? ' 개선분은 대부분 아직 회수되지 않은 채권이라 회수 전까지 현금 여력은 그대로다.' : ''}`
    : '';
  return `${ytd}${driver}${month} 미수금 회수만으로는 뒤집히지 않으며 매입채무 만기 재조정과 관계사 결제 캘린더가 함께 가야 한다.`;
}

/** 추정손익 서술 — 빠진 달과 최신 격차를 계열에서 센다(«3·6월 공백» 고정 문장이 6월분 입수 뒤에도 남았다). */
function estimateNote(): string {
  const have = new Set(liquidity.estimates.map((e) => e.forMonth));
  const last = liquidity.estimates[liquidity.estimates.length - 1];
  const gaps = Array.from({ length: last ? last.forMonth : 0 }, (_, i) => i + 1).filter((m) => !have.has(m));
  const gap = last && last.net !== null && last.netPrevYear !== null ? last.net - last.netPrevYear : null;
  const head = `월간보고의 «당월(추정)» 표는 1월부터의 누계 순손익이다(${gaps.length ? `${gaps.join('·')}월분은 보고 공백` : '공백 없음'}).`;
  return last && gap !== null
    ? `${head} 최신 ${last.forMonth}월 추정 누계는 ${kusd(last.net ?? 0)}로 전년 동기 ${kusd(last.netPrevYear ?? 0)}보다 ${kusd(Math.abs(gap))} ${gap < 0 ? '낮다' : '높다'}.`
    : head;
}

export function CashTab() {
  return (
    <>
      <Stats>
        <Stat
          k="자금 과부족"
          v={kusd(liquidityBridge?.endShortfall ?? receivables.cashShortfallKusd)}
          tone="down"
          d={liquidityBridge ? `${liquidityBridge.to} 월간보고 실측` : undefined}
        />
        <Stat
          k="아비장 미수금"
          v={kusd(receivableNow.currentKusd)}
          tone={receivableNow.sincePeakKusd <= 0 ? 'up' : 'down'}
          d={`정점 대비 ${kusd(receivableNow.sincePeakKusd)} · ${receivableNow.asOf ?? '기준일 미상'} 주간동향`}
        />
        {liquidityBridge && (
          <>
            <Stat k="현금 증감" v={kusd(liquidityBridge.현금 ?? 0)} tone={(liquidityBridge.현금 ?? 0) >= 0 ? 'up' : 'down'} d="2025-12-31 대비" />
            <Stat k="매출채권 증감" v={kusd(liquidityBridge.매출채권 ?? 0)} tone={(liquidityBridge.매출채권 ?? 0) <= 0 ? 'up' : 'down'} d="줄면 회수 성공" />
            <Stat k="매입채무 증감" v={kusd(liquidityBridge.매입채무 ?? 0)} tone={(liquidityBridge.매입채무 ?? 0) > 0 ? 'down' : 'up'} d="늘면 외상 증가" />
          </>
        )}
      </Stats>

      <Sec>2025년말 재무상태</Sec>
      <Grid>
        <Panel
          span={12}
          title="재무상태표 (2025-12-31)"
          unit="백만 달러 · 회계팀 확정 결산"
          note="부채 111.2백만불이 자산 73.5백만불을 넘어 자본총계 -37.7백만불의 완전자본잠식이다. 전년 -46.5백만불에서 8.7백만불 개선됐지만 이는 사실상 세디 절상 환산이익의 성격이라 체질 개선이 아니다. 순이익 +23.0백만불인데 개선이 8.7백만불에 그친 것은 기초 음(-)자본을 낮아진 기말환율로 재환산한 -18.9백만불이 상쇄했기 때문이다(배당·오류 아님). 부채 쪽은 장기외화미지급금이 41.4백만불에서 17.7백만불로 급감하고 미지급금 29.2백만불이 새로 계상됐다 - 상환인지 유동 재분류인지 원본에 설명이 없어 «구성 변화»로만 적는다. 단기차입금은 여전히 41.8백만불 남아 있다."
          src={`${SRC.fs} · 세디 환율 실측은 ${SRC.weekly}`}
        >
          <Table head={['항목', '2024', '2025']}>
            {fs2025.bsRows.map((r) => (
              <tr key={r.item}>
                <td>{r.item}</td>
                {/* 미지급금의 전년 null 은 결측이 아니라 미계상이다 — '자료 없음'으로 뭉개지 않는다. */}
                <td className={(r.y2024 ?? 0) >= 0 ? '' : 'down'}>{r.y2024 === null ? '- 미계상' : num(r.y2024)}</td>
                <td className={r.y2025 >= 0 ? '' : 'down'}><b>{num(r.y2025)}</b></td>
              </tr>
            ))}
          </Table>
          <Callout kind="warn" label="2026년 역회전 리스크">
            2025년 자본 개선과 순이익 흑자는 기말환율 {fs2025.fx.close2024} → {fs2025.fx.close2025}(세디/달러)
            절상의 산물이다. 세디는 2026년 들어 다시 절하 중이다 - 주간동향 실측으로
            {' '}{fs2025.cedi2026.low.rate}({fs2025.cedi2026.low.date})에서
            {' '}{fs2025.cedi2026.latest.rate}({fs2025.cedi2026.latest.date})까지 밀렸다. 이 추세가 연말까지
            가면 2025년 환산이익이 2026년 환산손실로 역회전하며, 노출 규모는 외화부채 잔액이다.
          </Callout>
        </Panel>
      </Grid>

      <Sec>자금유동성</Sec>
      <Grid>
        <Panel
          span={6} title="월말 잔액과 과부족" unit="천 달러 · 과부족 = 현금 + 매출채권 − 매입채무"
          note={liquidity.meta.caveat}
          src={SRC.board}
        >
          <Chart
            data={liquiditySeries} x="label" height={270}
            series={[
              // 막대·선 네 계열이 SERIES 앞 네 칸 순서라 인접 검사를 통과한다(2026-09-11).
              // 과부족 부호색은 다른 손익 막대와 같은 C.sign(한국식 — 양수 빨강·음수 파랑).
              S('과부족', '과부족', C.s1, { type: 'bar', signColor: C.sign }),
              S('현금', '현금', C.s2, { type: 'line' }),
              S('매출채권', '매출채권', C.s3, { type: 'line' }),
              S('매입채무', '매입채무', C.s4, { type: 'line' }),
            ]}
            zeroLine yFmt={kusd}
          />
          <Legend items={[
            { name: '과부족', color: C.s1, box: true },
            { name: '현금', color: C.s2 },
            { name: '매출채권', color: C.s3 },
            { name: '매입채무', color: C.s4 },
          ]} />
        </Panel>

        <Panel
          span={6} title="과부족은 무엇이 움직였나"
          note={liquidityBridge ? liquidityNote(liquidityBridge) : liquidity.meta.caveat}
          src={SRC.board}
        >
          {liquidityBridge && (
            <Table head={['항목', '증감 (천 달러)']}>
              <tr><td>현금</td><td className={(liquidityBridge.현금 ?? 0) >= 0 ? 'up' : 'down'}>{num(liquidityBridge.현금)}</td></tr>
              <tr><td>매출채권</td><td className={(liquidityBridge.매출채권 ?? 0) <= 0 ? 'up' : 'down'}>{num(liquidityBridge.매출채권)}</td></tr>
              <tr><td>매입채무</td><td className={(liquidityBridge.매입채무 ?? 0) > 0 ? 'down' : 'up'}>{num(liquidityBridge.매입채무)}</td></tr>
              <tr className="sum"><td>과부족</td><td className={(liquidityBridge.과부족 ?? 0) >= 0 ? 'up' : 'down'}>{num(liquidityBridge.과부족)}</td></tr>
            </Table>
          )}
        </Panel>
      </Grid>

      <Sec>미수금·유가·추정</Sec>
      <Grid>
        <Panel
          span={6} title="아비장 미수금" unit="천 달러"
          note={`정점 ${kusd(receivableNow.peakKusd)}에서 ${receivableNow.recoveryPeriod} 사이 ${kusd(receivables.abidjanKusd)}까지 줄였다가, ${receivableNow.asOf ?? '최근'} 주간동향에서 ${kusd(receivableNow.currentKusd)}로 다시 늘었다.`}
          src={SRC.weekly}
        >
          <Chart data={receivableSeries} x="label" height={210} xInterval={4}
            series={[S('미수금', '아비장 미수금', PANOFI_ID.abidjan, { type: 'area' })]} yFmt={kusd} />
        </Panel>

        <Panel
          span={6} title="유가" unit="달러/킬로리터"
          note="테마가 아비장보다 꾸준히 비싸다. 하역항 선택이 유류비에 직접 반영되므로 항차 계획과 함께 본다. 2026년 3월 17일부터 4개 지점 표기로 바뀌었다."
          src={SRC.weekly}
        >
          <Chart data={fuelSeries} x="label" height={210} xInterval={4}
            series={[
              S('아비장', '아비장 (트럭)', PANOFI_ID.abidjan, { type: 'line' }),
              S('테마', '테마 (트럭)', PANOFI_ID.tema, { type: 'line' }),
              S('다카르', '다카르 (트럭)', PANOFI_ID.dakar, { type: 'line' }),
              S('탱커', '양상 (탱커선)', PANOFI_ID.tanker, { type: 'line' }),
            ]}
            yFmt={usd} />
          <Legend items={[
            { name: '아비장', color: PANOFI_ID.abidjan }, { name: '테마', color: PANOFI_ID.tema },
            { name: '다카르', color: PANOFI_ID.dakar }, { name: '양상 (탱커선)', color: PANOFI_ID.tanker },
          ]} />
        </Panel>

        <Panel
          span={6} title="익월 추정손익" unit="천 달러"
          note={estimateNote()}
          src={SRC.board}
        >
          <Chart data={monthlyEstimates} x="label" height={210}
            series={[
              S('전년실적', '전년 동기 실적', C.s4, { type: 'bar' }),
              S('당년추정', '당년 추정', C.s1, { type: 'bar' }),
            ]}
            zeroLine yFmt={kusd} />
          <Legend items={[
            { name: '전년 동기 실적', color: C.s4, box: true },
            { name: '당년 추정', color: C.s1, box: true },
          ]} />
        </Panel>

        <Panel span={6} title="소송·채권" src={`${SRC.weekly} · ${SRC.strategy}`}>
          {receivables.cases.map((c) => (
            <div key={c.party} style={{ marginBottom: 9 }}>
              <div className="pf-stat-k" style={{ marginBottom: 3 }}>
                {c.party}{'amountEur' in c && c.amountEur ? ` · ${c.amountEur.toLocaleString('en-US')} 유로` : ''}
              </div>
              <div className="pf-note">{c.status}</div>
            </div>
          ))}
        </Panel>
      </Grid>
    </>
  );
}

/* ------------------------------------------------------------- 하반기 전략 */

export function StrategyTab() {
  const row = (metric: string) => scenarios.rows.find((r) => r.metric === metric)!;
  const h2Sales = row('판매량(톤)');
  const h2Net = row('H2 순이익');
  const h2Annual = row('2026 연간 순이익');
  return (
    <>
      <Sec>하반기 시나리오</Sec>
      <Grid>
        <Panel
          span={12} title="시나리오 3안" unit={scenarios.basisNote}
          note={`전제 - 하방: ${scenarios.premise.down} · 기준: ${scenarios.premise.base} · 상향: ${scenarios.premise.up}`}
          src={`${SRC.strategy} §8 - 2025 실적은 실측(A), 3안은 내부 가정(C)`}
        >
          <Table head={['구분', '2025 하반기 실적', '하방', '기준', '상향']}>
            {scenarios.rows.map((r) => (
              <tr key={r.metric}>
                <td>{r.metric}</td>
                <td>{r.actual2025H2 === null ? '-' : num(r.actual2025H2)}</td>
                <td>{num(r.down)}</td>
                <td><b>{num(r.base)}</b></td>
                <td>{num(r.up)}</td>
              </tr>
            ))}
          </Table>
          <Callout kind="info" label="읽는 법">
            기준안이면 하반기 순이익 +{man(Math.round(h2Net.base / 10))}로 연간 순손실을 {man(Math.round(h2Annual.base / 10))}에서 멈춘다.
            기준안 판매 {num(h2Sales.base)}톤은 2025년 하반기 판매 {num(h2Sales.actual2025H2)}톤의
            {' '}{Math.round((h2Sales.base / h2Sales.actual2025H2!) * 100)}%라 무리한 목표가 아니다.
            상향이면 연간 손익분기 부근까지 회복하고, 하방이어도 하반기 자체는 균형이다.
            연간 성적의 바닥은 사내 원장 기준 {ytd.label} 순손익 {kusd(ytd.netKusd)}이다. 전략보고의 상반기 순손익 -699만불은 세금 추징분까지 합친 값이다.
          </Callout>
        </Panel>
      </Grid>

      <Sec>우선순위 6</Sec>
      <Grid>
        {priorities.map((p) => (
          <Panel key={p.rank} span={6} title={`${p.rank}. ${p.task}`} unit={`시한 ${p.due}`} src={`${SRC.strategy} §10`}>
            <div className="pf-note">{p.detail}</div>
            <div className="pf-stat-k">기대효과 - {p.effect}</div>
          </Panel>
        ))}
        <Panel span={12} src={`${SRC.strategy} §10`}>
          <Callout kind="warn" label="중단 조건">{stopCondition}</Callout>
        </Panel>
      </Grid>
    </>
  );
}

/* -------------------------------------------------------------- 가나 산업 */

export function IndustryTab() {
  return (
    <>
      <Stats>
        <Stat k="가공 처리능력" v={num(industry.processingCapacityTPerYear)} unit="톤/년" d={`테마항 3사 · ${industry.processingCapacityBasisYear}년 기준`} />
        <Stat k="연간 통조림 생산" v={num(industry.annualCannedOutputT)} unit="톤" d={`${industry.annualCannedOutputBasisYear} 기준`} />
        <Stat k="설비 가동률" v={`${industry.utilizationPct[0]}~${industry.utilizationPct[1]}%`} d="원료 계절 편차" />
        <Stat k="통조림 수출액" v={(industry.exports.cannedTunaUsd2025 / 1e6).toFixed(1)} unit="백만불" tone="up" d={`2025년 · 전년비 +${industry.exports.cannedTunaYoyPct}% · ${num(industry.exports.cannedTunaT2025)}톤`} />
        <Stat k="유럽(EU·영국) 비중" v={pct(industry.exports.euSharePct)} d="외부 조사 · 영국이 단일 최대" />
      </Stats>

      <Sec>밸류 사다리와 가공</Sec>
      <Grid>
        <Panel span={6} title="밸류 사다리" unit={industry.valueLadder.unit} note={industry.valueLadder.note} src={SRC.nlm}>
          <Chart data={valueLadder} x="label" height={210} horizontal labelWidth={118}
            series={[S('단가', '단가', C.rank, { type: 'bar' })]}
            yFmt={(v) => `${v.toLocaleString('en-US')}유로`} />
        </Panel>

        <Panel
          span={6} title="테마항 가공공장"
          note={`${industry.cannersNote} ${industry.capacityCaveat} 고용 인원은 출처마다 갈린다 - 파이오니어 푸드 캐너리 1,800명 이상 / 약 1,100명(최고경영자 발언) / 1,000명 이상, 코스모 씨푸드 600명 이상 / 407명(수혜자 보고서). 교차검증이 필요하다.`}
          src={`${SRC.nlm} · 흡수 사실은 사내 확인(2026-08-15)`}
        >
          <Table head={['공장', '소유', '설립', '처리능력', '고용', '주력 제품']}>
            {industry.cannersDetail.map((c) => (
              <tr key={c.plant}>
                <td>{c.plantKo}</td>
                <td style={{ textAlign: 'left' }}>{c.owner}</td>
                <td>{c.founded ?? '자료 없음'}</td>
                <td style={{ textAlign: 'left' }}>
                  {c.capacityTPerDay ? `일 ${c.capacityTPerDay}톤 (실가동 ${c.operatingTPerDay}톤${'operatingNote' in c && c.operatingNote ? ` · ${c.operatingNote}` : ''})` : (c.capacity ?? '자료 없음')}
                </td>
                <td>{c.employees ?? '자료 없음'}</td>
                <td style={{ textAlign: 'left' }}>{c.products}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </Grid>

      <Sec>통조림 수출 실측</Sec>
      <Grid>
        <Panel
          span={6} title="수출 상대국" unit="백만 달러 · 2025년 · 다랑어 조제품(HS 160414)"
          note={industry.exports.externalClaim.note}
          src={industry.exports.topMarketsBasis}
        >
          <Chart data={exportMarkets} x="label" height={230} horizontal labelWidth={86}
            series={[S('금액', '수출액', C.rank, { type: 'bar' })]} yFmt={musd} />
        </Panel>
        <Panel
          span={6} title="Comtrade 실측 대비 외부 조사" unit="백만 달러 · 2025년 통조림 수출"
          note={industry.exports.monthlyCompleteness}
          src={`${industry.exports.basis} · 월별 12개월 대조 2026-08-15`}
        >
          <Table head={['구분', '2024', '2025', '전년비']}>
            <tr>
              <td>Comtrade 실측</td>
              <td>{num(Math.round(industry.exports.cannedTunaUsd2024 / 1e6))}</td>
              <td><b>{num(Math.round(industry.exports.cannedTunaUsd2025 / 1e6))}</b></td>
              <td className="up">+{industry.exports.cannedTunaYoyPct}%</td>
            </tr>
            <tr>
              <td>외부 조사 주장</td>
              <td>{num(Math.round(industry.exports.cannedTunaUsd2024 / 1e6))}</td>
              <td>{num(Math.round(industry.exports.externalClaim.usd / 1e6))}</td>
              <td>+{industry.exports.externalClaim.yoyPct}%</td>
            </tr>
            <tr className="sum">
              <td>차이</td>
              <td>-</td>
              <td className="down">{num(Math.round((industry.exports.externalClaim.usd - industry.exports.cannedTunaUsd2025) / 1e6))}</td>
              <td>-</td>
            </tr>
          </Table>
        </Panel>
      </Grid>

      <Sec>선단·창고·규제</Sec>
      <Grid>
        <Panel span={4} title="선단 규모" src={SRC.nlm}>
          {industry.fleet.map((f) => (
            <div key={f.fact.slice(0, 20)} className="pf-note" style={{ marginBottom: 7 }}>
              {f.fact}{'year' in f && f.year ? ` (${f.year}년)` : ''}
            </div>
          ))}
        </Panel>
        <Panel span={4} title="냉동창고" src={SRC.nlm}>
          {industry.coldChain.map((c) => (
            <div key={c.fact.slice(0, 20)} className="pf-note" style={{ marginBottom: 7 }}>{c.fact}</div>
          ))}
        </Panel>
        <Panel span={4} title="사업자 구도" src={SRC.nlm}>
          {industry.players.map((p) => (
            <div key={p.bloc} style={{ marginBottom: 8 }}>
              <div className="pf-stat-k" style={{ marginBottom: 2 }}>{p.bloc}</div>
              <div className="pf-note">{p.fact}</div>
            </div>
          ))}
        </Panel>

        {industry.regulation.map((r) => (
          <Panel key={r.topic} span={6} title={r.topic} src={`${SRC.nlm} · ${SRC.grok}`}>
            <div className="pf-note">{r.fact}</div>
            {'scope' in r && r.scope && <div className="pf-stat-k">적용 범위 - {r.scope}</div>}
            {'caveat' in r && r.caveat && <Callout kind="warn" label="유의">{r.caveat}</Callout>}
            {'conflict' in r && r.conflict && <Callout kind="warn" label="출처 충돌">{r.conflict}</Callout>}
            {'resolved' in r && r.resolved && <Callout kind="info" label="충돌 해소">{r.resolved}</Callout>}
            {'outcome' in r && r.outcome && <div className="pf-stat-k">시행 성과 - {r.outcome}</div>}
          </Panel>
        ))}

        <Panel span={12} title={industry.gta.nameKo} unit={industry.gta.members} src={SRC.nlm}>
          <ul className="pf-note" style={{ margin: 0, paddingLeft: 16 }}>
            {industry.gta.roles.map((r) => <li key={r} style={{ marginBottom: 3 }}>{r}</li>)}
          </ul>
        </Panel>
      </Grid>
    </>
  );
}

/* -------------------------------------------------------------- 수출입 */

export function TradeTab() {
  const gap = tradeLadderGap;
  return (
    <>
      {gap && (
        <Stats>
          <Stat k="냉동 원어" v={usd(gap.rawUsdPerT)} unit="/톤" d="파노피가 파는 칸" />
          <Stat k="조제·통조림" v={usd(gap.cannedUsdPerT)} unit="/톤" tone="up" d="가나 수출이 나가는 칸" />
          <Stat k="배수" v={`${gap.multiple}배`} tone="up" />
          <Stat k="통조림 금액 비중" v={pct(gap.cannedSharePct)} />
          <Stat k="거울통계 비율" v={`${mirror.meta.totalRatio}배`} tone="down" d="운임·보험 차라면 1.05~1.15" />
        </Stats>
      )}

      <Sec>무역수지와 밸류 사다리</Sec>
      <Grid>
        <Panel span={6} title="무역수지" unit="백만 달러" note={trade.meta.caveat} src={SRC.comtrade}>
          <Chart data={tradeBalanceSeries} x="label" height={230}
            series={[
              S('수출', '수출', C.s1, { type: 'bar' }),
              S('수입', '수입', C.s3, { type: 'bar' }),
              S('무역수지', '무역수지', C.s2, { type: 'line' }),
            ]}
            zeroLine yFmt={musd} />
          <Legend items={[
            { name: '수출', color: C.s1, box: true },
            { name: '수입', color: C.s3, box: true },
            { name: '무역수지', color: C.s2 },
          ]} />
        </Panel>

        {gap && (
          <Panel
            span={6} title="가공 단계별 수출 단가" unit={`달러/톤 · ${tradeYear}년`}
            note={`같은 참치가 통조림 칸으로 올라가면 톤당 ${gap.multiple}배가 된다. 가나 참치 수출액의 ${gap.cannedSharePct}%가 이 칸에서 나가고 파노피는 원어 칸에서 판다. 어가 협상보다 밸류체인 위치가 손익을 크게 정한다 - 가나·유럽연합 잠정 경제동반자협정(2016)의 가공 참치 무관세·무쿼터가 이 구조를 떠받친다.`}
            src={SRC.comtrade}
          >
            <Chart data={exportByForm} x="label" height={230} horizontal labelWidth={96}
              series={[S('단가', '수출 단가', C.rank, { type: 'bar' })]} yFmt={usd} />
          </Panel>
        )}
      </Grid>

      <Sec>품목·어종·상대국</Sec>
      <Grid>
        <Panel span={6} title="품목별 수출" unit={`${tradeYear}년`} src={SRC.comtrade}>
          <Table head={['품목', '금액 (백만 달러)', '물량 (톤)', '단가 (달러/톤)']}>
            {exportByCommodity.map((c) => (
              <tr key={c.label}>
                <td>{c.label}</td>
                <td>{num(c.금액)}</td>
                <td>{num(c.물량)}</td>
                <td>{c.단가 === null ? '자료 없음' : num(c.단가)}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={6} title="어종별 수출" unit={`백만 달러 · ${tradeYear}년 원어 기준`}
          note={(() => {
            const byValue = [...exportBySpecies].sort((a, b) => b.valueUsd - a.valueUsd)[0];
            const byQty = [...exportBySpecies].sort((a, b) => (b.물량 ?? 0) - (a.물량 ?? 0))[0];
            const lead = byValue && byQty && byValue.label === byQty.label
              ? `금액·물량 모두 ${byValue.label}가 앞선다(${exportBySpecies.map((r) => `${r.label} ${num(r.물량)}톤`).join(' · ')}).`
              : `금액은 ${byValue?.label}, 물량은 ${byQty?.label}가 앞선다.`;
            return `필레와 통조림은 어종이 합쳐져 보고되므로 제외했다. ${lead}`;
          })()}
          src={SRC.comtrade}
        >
          <Chart data={exportBySpecies} x="label" height={210}
            series={[S('금액', '수출액', C.rank, { type: 'bar' })]} yFmt={musd} />
        </Panel>

        <Panel
          span={6} title="수출 상대국" unit={`백만 달러 · ${tradeYear}년`}
          note="상위 4개국이 모두 유럽연합·영국이다. 유럽 리테일 규격과 지속가능성 인증이 사실상 진입 조건이며, 해양관리협의회 인증을 2026년 1월에 딴 이유도 여기에 있다."
          src={SRC.comtrade}
        >
          <Chart data={exportByPartner} x="label" height={260} horizontal labelWidth={86}
            series={[S('금액', '수출액', C.rank, { type: 'bar' })]} yFmt={musd} />
        </Panel>

        <Panel
          span={6} title="수입 상대국" unit={`백만 달러 · ${tradeYear}년`}
          note="가나 가공공장은 자국 선단 양륙만으로 설비를 못 채운다. 계절 부족기에 인접국과 원양선단 물량을 수입해 메우는 구조이며, 이 수입이 늘면 국내 원어 어가 협상력은 그만큼 약해진다."
          src={SRC.comtrade}
        >
          <Chart data={importByPartner} x="label" height={260} horizontal labelWidth={86}
            series={[S('금액', '수입액', C.rank, { type: 'bar' })]} yFmt={musd} />
        </Panel>
      </Grid>

      <Sec>거울통계 교차검증</Sec>
      <Grid>
        <Panel
          span={6} title="가나 보고 vs 상대국 보고" unit={`백만 달러 · ${mirror.meta.year}년`}
          note={mirror.meta.interpretation}
          src="UN Comtrade public preview · 가나 보고 vs 상대국 보고 대조"
        >
          <Chart data={mirrorPairs} x="label" height={280} horizontal labelWidth={124}
            series={[
              S('가나수출', '가나 보고 (수출)', C.s1, { type: 'bar' }),
              S('상대국수입', '상대국 보고 (수입)', C.s3, { type: 'bar' }),
            ]}
            yFmt={musd} />
          <Legend items={[
            { name: '가나 보고 (수출)', color: C.s1, box: true },
            { name: '상대국 보고 (수입)', color: C.s3, box: true },
          ]} />
          {mirrorTopGap && (
            <Callout kind="warn" label="가장 큰 격차">
              {mirrorTopGap.partner} 세번 {mirrorTopGap.hs} - 가나는 {mirrorTopGap.가나수출}백만 달러를 수출했다고
              보고했는데 {mirrorTopGap.partner}은 {mirrorTopGap.상대국수입}백만 달러를 가나에서 수입했다고 보고한다.
              {' '}{mirrorTopGap.ratio}배, 금액으로 {Math.round(mirrorTopGap.gapUsd / 1e6)}백만 달러 차다. 최대 시장에서
              이만큼 벌어지는 것은 운임·보험 차로 설명되지 않는다. 제3국을 거친 물량이 원산지 기준으로 가나에
              귀속되는 것과 가나 측 미보고, 두 가지가 모두 가능하며 이 자료만으로는 가르지 못한다.
            </Callout>
          )}
          {mirrorUnmatched.length > 0 && (
            <Callout kind="warn" label="받은 쪽 기록이 없는 건">
              {mirrorUnmatched.map((u) => `${u.partner} 세번 ${u.hs} ${u.가나수출 >= 1 ? `${u.가나수출}백만 달러` : '1백만 달러 미만'}`).join(' · ')} -
              가나는 수출했다고 보고하지만 상대국의 대응 수입 보고가 없다. 두 나라 모두 유엔 콤트레이드 보고가
              늦거나 빠지는 경우가 있어 미보고로 단정하지 않는다.
            </Callout>
          )}
          <div className="pf-note">
            함의 - 이 탭의 품목·상대국 수치는 모두 <b>가나 보고 기준</b>이다. 상대국 장부가 더 크다면 실제
            물동량은 여기 표시된 것보다 클 수 있다. 파노피 실적 판단에는 사내 원장을 쓰고, 무역통계는 시장
            구조를 읽는 용도로만 본다.
          </div>
        </Panel>
      </Grid>
    </>
  );
}

/* ------------------------------------------------------------ 데이터 품질 */

export function QualityTab() {
  return (
    <>
      <Stats>
        <Stat k="주간동향" v={String(dataQuality.weekCount)} unit="주" d={`${headline.rangeStart} ~ ${headline.rangeEnd}`} />
        <Stat k="정상 신호 주차" v={String(dataQuality.nominalWeeks)} unit="주" d="결측이 아님" />
        <Stat k="실제 결측" v={String(dataQuality.missingWeeks)} unit="주" tone="up" />
        <Stat k="원문 일자 오타" v={String(dataQuality.statedYearMismatch.length)} unit="주" tone="down" />
        <Stat k="외부 조사 공백" v={String(pfc.sourceGaps.length)} unit="건" tone="down" />
      </Stats>

      <Sec>커버리지와 이슈</Sec>
      <Grid>
        <Panel
          span={6} title="주간동향 필드별 확보율"
          note="자료를 불러올 때마다 항목별 확보율을 점검해, 양식이 바뀐 주차를 놓치지 않는다."
          src={SRC.weekly}
        >
          <Table head={['항목', '확보 주차', '비율']}>
            {Object.entries(dataQuality.coverage).map(([k, v]) => (
              <tr key={k}>
                <td>{COVERAGE_LABEL[k] ?? k}</td>
                <td>{v} / {dataQuality.weekCount}</td>
                <td>{Math.round((v / dataQuality.weekCount) * 100)}%</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel span={6} title="알려진 원자료 이슈" src="사내 원자료 전수 확인 (2026-08-15)">
          <div className="pf-note" style={{ marginBottom: 8 }}>
            <b>선박 동향 표기</b> - {dataQuality.weekCount}주 중 {dataQuality.nominalWeeks}주는 선박별 항목 대신
            「각 선 특이사항 없이 안전 조업 중」 한 줄만 온다. 결측이 아니라 정상 신호이므로 구분해 기록했다.
          </div>
          <div className="pf-note" style={{ marginBottom: 8 }}>
            <b>원문 일자 오타</b> - {dataQuality.statedYearMismatch.length}주치 원문의 「일자」가 2025년으로 적혀 있다.
            파일명 스탬프를 정본으로 삼았고 데이터 영향은 없다.
          </div>
          <div className="pf-note" style={{ marginBottom: 8 }}>
            <b>기준 차이</b> - 전략보고의 2025년 66,674톤은 생산기준, 원장 연도별 표의 64,689톤은 판매기준이다.
            충돌이 아니라 기준이 다르다.
          </div>
          <div className="pf-note" style={{ marginBottom: 8 }}>
            <b>매입채무 불일치</b> - {liquidity.meta.knownDiscrepancy}
          </div>
          <div className="pf-note">
            <b>채널 물량 비중 부재</b> - {pfc.measured.caveat}
          </div>
        </Panel>

        <Panel
          span={6} title="외부 조사에서 채우지 못한 칸"
          note="비어 있는 칸을 추정으로 메우지 않았다. 이 중 「가격 선도자냐」는 주간동향 실측으로 답의 범위를 좁혔다(«수요독점과 일치하는 패턴»까지)."
          src={SRC.nlm}
        >
          <ul className="pf-note" style={{ margin: 0, paddingLeft: 16 }}>
            {pfc.sourceGaps.map((g) => <li key={g} style={{ marginBottom: 3 }}>{g}</li>)}
          </ul>
        </Panel>

        <Panel span={6} title="근거 등급" src="자체 정의">
          <Table head={['등급', '뜻']}>
            {Object.entries(dataQuality.grades).map(([k, v]) => (
              <tr key={k}><td>{k}</td><td style={{ textAlign: 'left' }}>{v}</td></tr>
            ))}
          </Table>
        </Panel>

        <Panel
          span={12} title="출처"
          src={`최신 주간동향 원본 - ${latest.source} · SHA-256 ${latest.sha256.slice(0, 16)}… · 총 ${weeks.length}주`}
        >
          <Table head={['구분', '자료', '기준일']}>
            {dataQuality.sources.map((s) => (
              <tr key={s.key}>
                <td>{s.type}</td>
                <td style={{ textAlign: 'left' }}>{s.title}{'note' in s && s.note ? ` - ${s.note}` : ''}</td>
                <td>{s.date}</td>
              </tr>
            ))}
          </Table>
        </Panel>
      </Grid>
    </>
  );
}
