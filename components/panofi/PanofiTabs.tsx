'use client';

import type { ReactNode } from 'react';

import Chart, { Legend, type Serie } from '../cosmo/Chart';
import { Callout, Card as BaseCard, Kpi, SecHead } from '../cosmo/Ui';
import {
  annualSeries,
  bangkokSeries,
  bep,
  channels,
  company,
  costBars,
  costStructure,
  dataQuality,
  exportMarkets,
  fleetMargins,
  fleetTotals,
  fuelSeries,
  h1,
  headline,
  industry,
  kpiSignals,
  latest,
  pfc,
  priceSeries,
  priorities,
  processingSeries,
  receivableSeries,
  receivables,
  regionalLandingSeries,
  scenarios,
  seaTempSeries,
  sensitivityBars,
  stopCondition,
  actuals,
  monthlySeries,
  annualVolumeSeries,
  vesselFullPnl,
  marginRankShift,
  catchBySpecies,
  vesselCostGroups,
  liquidity,
  liquiditySeries,
  liquidityBridge,
  monthlyEstimates,
  trade,
  tradeBalanceSeries,
  tradeLadderGap,
  tradeYear,
  exportByCommodity,
  exportByForm,
  exportBySpecies,
  exportByPartner,
  importByPartner,
  mirror,
  mirrorPairs,
  mirrorUnmatched,
  mirrorTopGap,
  valueLadder,
  weeks,
} from '@/lib/data/panofi';

/* --------------------------------------------------------------- 표기 헬퍼 */

/**
 * 출처를 항상 달고 다니는 카드.
 *
 * 이 화면의 수치는 사내 원장·주간동향·전략보고·유엔 무역통계·외부 조사가 섞여 있고
 * 같은 항목이라도 «판매기준»과 «생산기준»처럼 기준이 다르면 값이 달라진다. 출처와
 * 기준을 카드마다 붙여야 숫자가 어긋났을 때 어디를 다시 볼지 바로 알 수 있다.
 */
function Card({ src, note, children, ...rest }: {
  title?: string; sub?: string; note?: ReactNode; span?: number;
  src?: ReactNode; children: ReactNode;
}) {
  return (
    <BaseCard
      {...rest}
      note={
        <>
          {note}
          {src && <div className="panofi-src">출처 — {src}</div>}
        </>
      }
    >
      {children}
    </BaseCard>
  );
}

const usd = (v: number) => `$${v.toLocaleString('en-US')}`;
const musd = (v: number) => `${v.toLocaleString('en-US')}만불`;
const kusd = (v: number) => `${Math.round(v).toLocaleString('en-US')}천불`;
const pct = (v: number) => `${v}%`;

/** 값이 없으면 0 으로 채우지 않는다 — '자료 없음'이 정직한 표시다. */
const orNA = (v: number | null | undefined, fmt: (n: number) => string) =>
  v === null || v === undefined ? '자료 없음' : fmt(v);

const S = (key: string, name: string, color: string, extra: Partial<Serie> = {}): Serie => ({
  key,
  name,
  color,
  ...extra,
});

/* ------------------------------------------------------------------ 개관 */

export function HomeTab() {
  return (
    <>
      <SecHead>선단 한눈에</SecHead>
      <div className="grid">
        <Card
        src={`선단 구성은 사내 확인(2026-08) · 생산·손익은 「파노피 2026 상반기 평가·하반기 전략」(2026-07-29)`} title="운영 선단" sub="선망선 기준. 운반선 볼타 글로리는 매각 완료">
          <div className="kpis">
            <Kpi k="가동 선망선" v={String(fleetTotals.activeCount)} unit="척" />
            <Kpi k="선단 총톤수" v={fleetTotals.totalGt.toLocaleString('en-US')} unit="G/T" />
            <Kpi k="상반기 생산" v={h1.productionT.toLocaleString('en-US')} unit="톤" d={`전년비 ${h1.productionYoyPct}%`} tone="down" />
            <Kpi k="상반기 순손익" v={kusd(h1.netKusd)} tone="down" d="매출총이익 소멸 + 이자 + 세무추징" />
          </div>
          <div className="cnote">
            {company.name}는 {company.established} {company.base}에 세운 {company.ownership}이다.
          </div>
        </Card>

        <Card
        src={`「2. 추정실적 (2026년 6월).xlsx」 실적 시트 · 최신 어가는 「PANOFI 주간동향」 2026-08-11`} title="손익분기 어가와 현재 어가" sub="단위: 달러/톤. 손익분기선을 넘겨야 물량이 이익이 된다">
          <div className="kpis">
            <Kpi k="손익분기 어가" v={usd(bep.priceUsdPerT)} unit="/톤" />
            <Kpi k="상반기 실현 어가" v={usd(h1.priceUsdPerT)} unit="/톤" tone="down" d={`분기점 대비 ${usd(h1.priceUsdPerT - bep.priceUsdPerT)}`} />
            <Kpi k="코스모 (최신)" v={orNA(headline.latestCosmoPrice, usd)} unit="/톤" />
            <Kpi k="SCODI (최신)" v={orNA(headline.latestScodiPrice, usd)} unit="/톤" />
          </div>
          <div className="cnote">
            현재 어가로는 어떤 규모로도 흑자가 나지 않는다. 손익분기 물량은 어가 1,300 가정 시 월 {bep.monthlyVolumeT.toLocaleString('en-US')}톤이다.
          </div>
        </Card>
      </div>

      <SecHead>연도별 실적</SecHead>
      <Card
        src={`「파노피 2026 상반기 평가·하반기 전략」(2026-07-29) 연도별 실적`} sub="단위: 백만 달러. 2026은 상반기 누계다" note="2025년은 어획 66,674톤·영업이익 1,291만불로 기록 해였으나 금융비용 -676만불과 법인세로 순이익이 0 부근이었다. 영업으로 벌어 이자·세금으로 소진하는 구조가 만성이며, 2026년엔 영업까지 적자로 꺾였다.">
        <Chart
          data={annualSeries}
          x="label"
          height={300}
          series={[
            S('매출', '매출', 'var(--cosmo-s1)', { type: 'bar' }),
            S('영업이익', '영업이익', 'var(--cosmo-s2)', { type: 'line' }),
            S('순이익', '순이익', 'var(--cosmo-s3)', { type: 'line', signColor: ['var(--cosmo-up)', 'var(--cosmo-down)'] }),
          ]}
          zeroLine
          yFmt={(v) => `${v}M`}
        />
      </Card>

      <SecHead>주간 경영회의 신호등</SecHead>
      <div className="grid">
        {kpiSignals.map((k) => (
          <Card key={k.kpi} title={k.kpi} sub={`단위: ${k.unit}`}>
            <div className="kpis">
              <Kpi k="정상" v={k.normal} />
              <Kpi k="경보" v={k.warn} tone="down" />
            </div>
            <div className="cnote">적색 시 조치 — {k.action}</div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------- 선단·조업 */

export function FleetTab() {
  return (
    <>
      <SecHead>척당 경제학 — 벌어주는 배와 까먹는 배</SecHead>
      <Card
        src={`「파노피 2026 상반기 평가·하반기 전략」 §5-1 척당 경제학 — 공통비 배부 전 직접마진`}
        sub="상반기 직접마진(백만 달러) = 매출 추정 − 직접원가. 공통비·판관비·이자 배부 전"
        note={`7척 직접마진 합계는 ${fleetTotals.totalMarginMusd}백만불로 공통비 ${fleetTotals.sharedCostMusd}만불을 덮지 못한다. 척당 문제가 아니라 선단 전체의 물량 문제다. 마스터(-1.20)는 파망 사고와 상가수리가 겹친 반기라 구조적 부실선으로 단정하지 않는다.`}
      >
        <Chart
          data={fleetMargins.map((v) => ({ label: v.name, 직접마진: v.marginMusd }))}
          x="label"
          height={280}
          horizontal
          labelWidth={130}
          series={[S('직접마진', '직접마진', 'var(--cosmo-s1)', { type: 'bar', signColor: ['var(--cosmo-up)', 'var(--cosmo-down)'] })]}
          zeroLine
          yFmt={(v) => `${v}M`}
        />
      </Card>

      <SecHead>선박 제원과 상반기 생산</SecHead>
      <Card
        src={`제원은 외부 등록 정보(ICCAT·업계 분석, 등급 B) · 생산·마진은 전략보고 §5-1`} sub="총톤수(G/T)와 상반기 생산량(톤)">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>선박</th><th>총톤수 (G/T)</th><th>상반기 생산 (톤)</th><th>직접마진 (백만 달러)</th></tr>
            </thead>
            <tbody>
              {fleetMargins.map((v) => (
                <tr key={v.code}>
                  <td>{v.name}</td>
                  <td>{v.gt.toLocaleString('en-US')}</td>
                  <td>{v.productionT.toLocaleString('en-US')}</td>
                  <td className={v.marginMusd >= 0 ? 'up' : 'down'}>{v.marginMusd.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="sum">
                <td>합계</td>
                <td>{fleetTotals.totalGt.toLocaleString('en-US')}</td>
                <td>{fleetTotals.totalProductionT.toLocaleString('en-US')}</td>
                <td>{fleetTotals.totalMarginMusd.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>어장 수온</SecHead>
      <Card
        src={`「PANOFI 주간동향」 31주(2025-12-23~2026-08-11) 어장상황 실측`} sub="단위: 섭씨. 주간동향 실측 상단값 — 어황 선행지표로 읽는다" note="연안과 대양의 수온차가 벌어지면 어군이 흩어져 항차 효율이 떨어진다. 금어기(3/17~4/30)에는 조업 자체가 멈춘다.">
        <Chart
          data={seaTempSeries}
          x="label"
          height={240}
          xInterval={3}
          series={[
            S('연안', '연안', 'var(--cosmo-s1)', { type: 'line' }),
            S('대양', '대양', 'var(--cosmo-s2)', { type: 'line' }),
          ]}
          yFmt={(v) => `${v}℃`}
        />
      </Card>

      <SecHead>역내 공급 압력 — 세네갈·EU 선단 입항</SecHead>
      <Card
        src={`「PANOFI 주간동향」 31주 조업선 동향(세네갈·EU 선단) 표`} sub="주간 입항 물량(톤)과 척수. 파노피 자사선이 아니라 같은 어장을 쓰는 경쟁 선단이다" note="역내 입항이 몰리면 가공사 처리 슬롯과 선석이 함께 막혀 항차 사이클이 늘어난다. 항차 사이클 목표는 6일 이내다.">
        <Chart
          data={regionalLandingSeries}
          x="label"
          height={240}
          xInterval={3}
          series={[
            S('입항톤수', '입항 물량', 'var(--cosmo-s1)', { type: 'bar' }),
            S('척수', '척수', 'var(--cosmo-s3)', { type: 'line', axis: 'right' }),
          ]}
          yFmt={(v) => `${v.toLocaleString('en-US')}톤`}
          y2Fmt={(v) => `${v}척`}
        />
      </Card>

      <SecHead>척당 완전손익 — 공통비를 배부하면 순위가 뒤집힌다</SecHead>
      <Card
        src={`「2. 추정실적 (2026년 6월).xlsx」 실적(생산) 시트 — 공통비·판관비·금융비용 배부 후`}
        sub="상반기 세전이익(달러). 공통비·판관비·금융비용까지 배부한 뒤의 값"
        note="위의 직접마진은 공통비 배부 전이라 «누가 많이 벌어오나»를 보고, 이 표는 배부 후라 «누가 회사 손익에 얼마를 남기나»를 본다. 두 지표의 순위가 어긋나는 배가 있으므로 어느 배를 줄일지 판단할 때는 반드시 배부 후를 본다. 상반기에는 일곱 척 모두 세전 적자다."
      >
        <Chart
          data={vesselFullPnl.map((v) => ({ label: v.name, 세전이익: Math.round((v.세전이익 ?? 0) / 1000) }))}
          x="label"
          height={280}
          horizontal
          labelWidth={110}
          series={[S('세전이익', '세전이익', 'var(--cosmo-s1)', { type: 'bar', signColor: ['var(--cosmo-up)', 'var(--cosmo-down)'] })]}
          zeroLine
          yFmt={kusd}
        />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>선박</th><th>직접마진 순위</th><th>완전손익 순위</th><th>변동</th><th>세전이익 (달러)</th></tr></thead>
            <tbody>
              {marginRankShift.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td>{r.직접마진순위 ?? '자료 없음'}</td>
                  <td>{r.완전손익순위}</td>
                  <td className={(r.shift ?? 0) > 0 ? 'up' : (r.shift ?? 0) < 0 ? 'down' : ''}>
                    {r.shift === null ? '—' : r.shift > 0 ? `▲${r.shift}` : r.shift < 0 ? `▼${-r.shift}` : '—'}
                  </td>
                  <td>{(r.세전이익 ?? 0).toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>어종 구성</SecHead>
      <Card
        src={`「2. 추정실적 (2026년 6월).xlsx」 매출단가 시트 — 척별×어종×사이즈 원장`}
        sub="상반기 생산량(톤)과 비중. 척별·사이즈별 원장을 어종으로 합산했다"
        note={`가다랑어가 ${catchBySpecies[0]?.비중}%로 주력이며 통조림 원료로 나간다. 어종·사이즈 원장 합계는 ${actuals.meta.catchMixTotalMT.toLocaleString('en-US')}톤으로 총 생산 ${h1.productionT.toLocaleString('en-US')}톤과 약 1,966톤 차이가 난다 — 잡어와 미배분 물량으로 보이며 원본 자체의 차이라 임의로 맞추지 않았다.`}
      >
        <Chart
          data={catchBySpecies}
          x="label"
          height={240}
          series={[S('생산량', '생산량', 'var(--cosmo-s1)', { type: 'bar' })]}
          yFmt={(v) => `${v.toLocaleString('en-US')}톤`}
        />
      </Card>

      <SecHead>척별 원가 3분류</SecHead>
      <Card
        src={`「2. 추정실적 (2026년 6월).xlsx」 실적(생산) 시트 제조원가 40여 계정`} sub="단위: 천 달러. 재료비(유류·윤활유)·노무비(선원)·경비(선용품·어구·수선·입어료·항만 등)">
        <Chart
          data={vesselCostGroups}
          x="label"
          height={280}
          series={[
            S('재료비', '재료비', 'var(--cosmo-s1)', { type: 'bar', stackId: 'c' }),
            S('노무비', '노무비', 'var(--cosmo-s2)', { type: 'bar', stackId: 'c' }),
            S('경비', '경비', 'var(--cosmo-s3)', { type: 'bar', stackId: 'c' }),
          ]}
          yFmt={kusd}
        />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------ 어가·채널 */

export function PriceTab() {
  const m = pfc.measured;
  return (
    <>
      <SecHead>채널별 어가 31주</SecHead>
      <Card
        src={`「PANOFI 주간동향」 31주 어가동향 실측`}
        sub="단위: 달러/톤. 관계사·연간계약·시장연동·로컬 네 성격이 한 화면에 있다"
        note={`손익분기 어가 ${usd(bep.priceUsdPerT)}를 넘는 채널이 최근에야 생겼다. 로컬 마켓은 즉시 현금이지만 분기점을 크게 밑돌아 저가 사이즈 소진용으로만 쓴다.`}
      >
        <Chart
          data={priceSeries}
          x="label"
          height={300}
          xInterval={3}
          series={[
            S('코스모', '코스모 (관계사)', 'var(--cosmo-s1)', { type: 'line' }),
            S('PFC', 'PFC (연간계약)', 'var(--cosmo-s2)', { type: 'line' }),
            S('SCODI', 'SCODI (시장연동)', 'var(--cosmo-s3)', { type: 'line' }),
            S('아비장로컬', '아비장 로컬', 'var(--cosmo-s4)', { type: 'line', dash: true }),
            S('테마로컬', '테마 로컬', 'var(--cosmo-s5)', { type: 'line', dash: true }),
          ]}
          refLines={[{ y: bep.priceUsdPerT, label: `손익분기 ${usd(bep.priceUsdPerT)}`, color: 'var(--cosmo-down)' }]}
          yFmt={usd}
        />
      </Card>

      <SecHead>PFC 수요독점 — 낮게 사는데 물량은 더 온다</SecHead>
      <Card
        src={`가격·물량은 「PANOFI 주간동향」 31주 실측 · 소유구조는 NotebookLM 「가나 중심 서아프리카 참치 비즈니스 분석」(소스 82건, 등급 B)`}
        sub="타이유니온 자회사 PFC의 지배 방식을 31주 실측으로 판정한 결과"
        note={m.caveat}
      >
        <div className="kpis">
          <Kpi k="PFC 어가 변동" v={`${m.priceChangeCount.PFC}회`} d={`31주 중 · SCODI는 ${m.priceChangeCount.SCODI}회`} />
          <Kpi k="코스모 대비 평균 격차" v={usd(m.gapVsCosmoUsdPerT.mean)} unit="/톤" tone="down" />
          <Kpi k="현재 격차" v={usd(m.currentGapUsdPerT)} unit="/톤" tone="down" d={`${m.currentPrices.asOf} 기준`} />
          <Kpi k="격차 -80 이하 구간 물량" v={`${m.volumeTest.wideGapWeeks.avgPfcDailyT}톤`} unit="/일" d={`격차 좁을 때 ${m.volumeTest.narrowGapWeeks.avgPfcDailyT}톤`} tone="up" />
        </div>

        <Chart
          data={processingSeries}
          x="label"
          height={260}
          xInterval={3}
          series={[
            S('PFC', 'PFC', 'var(--cosmo-s2)', { type: 'line' }),
            S('코스모', '코스모', 'var(--cosmo-s1)', { type: 'line' }),
            S('SCODI', 'SCODI', 'var(--cosmo-s3)', { type: 'line' }),
            S('SCASA', 'SCASA', 'var(--cosmo-s4)', { type: 'line' }),
          ]}
          yFmt={(v) => `${v}톤`}
        />
        <Legend items={[{ name: '가공사별 일일 처리량 (톤)', color: 'var(--cosmo-muted)' }]} />

        <Callout kind="warn" label="판정">
          {m.verdict}
        </Callout>
        <Callout kind="info" label="근거">
          {m.volumeTest.finding} {m.volumeTest.decisiveCase} 이탈이 불가능한 이유는 대안 채널의 흡수 상한이다 —
          SCODI는 {m.absorptionLimits.SCODI}, 코스모는 {m.absorptionLimits.코스모}, 로컬은 {m.absorptionLimits.로컬마켓}.
        </Callout>
        <Callout kind="info" label="프레임">
          {m.verdictNote}
        </Callout>
      </Card>

      <SecHead>채널 정책</SecHead>
      <Card
        src={`「파노피 2026 상반기 평가·하반기 전략」 §6 판매채널·가격`} sub="7월 기준 어가와 하반기 운영 방침">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>채널</th><th>지역</th><th>어가 (달러/톤)</th><th>성격</th><th>하반기 방침</th></tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.channel}>
                  <td>{c.channel}</td>
                  <td>{c.location}</td>
                  <td>{c.priceUsdPerT.toLocaleString('en-US')}</td>
                  <td>{c.trait}</td>
                  <td>{c.policy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>방콕 기준가 대비</SecHead>
      <Card
        src={`Thai Union 방콕 양륙 시세·FAO GLOBEFISH(2026-07-23) — Grok 1차출처 대조(등급 B)`} sub="단위: 달러/톤. 방콕 양륙 가다랑어는 서아프리카 어가의 국제 벤치마크다" note={industry.skipjackBangkok.caveat}>
        <Chart
          data={bangkokSeries}
          x="label"
          height={240}
          series={[S('방콕', '방콕 가다랑어', 'var(--cosmo-s1)', { type: 'bar' })]}
          yFmt={usd}
        />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------- 손익·원가 */

export function ProfitTab() {
  return (
    <>
      <SecHead>상반기 적자의 3겹 구조</SecHead>
      <Card
        src={`「파노피 2026 상반기 평가·하반기 전략」 §3 + 「2. 추정실적 (2026년 6월).xlsx」 실적 시트`} sub="단위: 천 달러" note={h1.breakdown}>
        <div className="kpis">
          <Kpi k="매출액" v={kusd(h1.revenueKusd)} d={`전년비 ${h1.revenueYoyPct}%`} tone="down" />
          <Kpi k="매출총이익" v={kusd(h1.grossProfitKusd)} d={`전년비 ${h1.grossProfitYoyPct}%`} tone="down" />
          <Kpi k="영업이익" v={kusd(h1.operatingKusd)} tone="down" />
          <Kpi k="당기순이익" v={kusd(h1.netKusd)} tone="down" />
        </div>
        <div className="cnote">
          원가율이 {h1.costRatioPrevPct}%에서 {h1.costRatioPct}%로 올랐다. 물량이 {h1.productionYoyPct}% 줄면서 고정비 희석에 실패한 결과다.
        </div>
      </Card>

      <SecHead>비용 구조</SecHead>
      <Card
        src={`「파노피 2026 상반기 평가·하반기 전략」 §4 비용구조`}
        sub={`매출 대비 비중(%). ${costStructure.basisNote}`}
        note="유류가 매출의 39.6%로 지배적이다. 이미 특별공급가로 시장 대비 25% 싸게 사고 있어 단가 절감 여지는 제한적이며, 레버는 소모량(척당 KL/조업일)과 운항 계획이다."
      >
        <Chart
          data={costBars}
          x="label"
          height={340}
          horizontal
          labelWidth={130}
          series={[S('비중', '매출 대비 비중', 'var(--cosmo-s1)', { type: 'bar' })]}
          yFmt={pct}
        />
      </Card>

      <SecHead>월별 추이</SecHead>
      <Card
        src={`「2. 추정실적 (2026년 6월).xlsx」 실적 시트 월별 현황 — 판매기준`}
        sub="단위: 판매량(톤)·평균단가(달러/톤). 추정실적 원장 1~6월"
        note={actuals.meta.caveat}
      >
        <Chart
          data={monthlySeries}
          x="label"
          height={260}
          series={[
            S('판매량', '판매량', 'var(--cosmo-s1)', { type: 'bar' }),
            S('평균단가', '평균단가', 'var(--cosmo-s3)', { type: 'line', axis: 'right' }),
          ]}
          yFmt={(v) => `${v.toLocaleString('en-US')}톤`}
          y2Fmt={usd}
        />
      </Card>

      <SecHead>연도별 판매량과 어가</SecHead>
      <Card
        src={`「2. 추정실적 (2026년 6월).xlsx」 실적 시트 연도별 현황 — **판매기준**. 전략보고가 인용하는 2025년 66,674톤은 생산기준이라 여기 64,689톤과 다르다(충돌 아님)`} sub="단위: 판매량(톤)·평균단가(달러/톤)·원가율(%). 2026은 상반기 누계" note="2023년 평균단가 1,499달러가 최고였고 이후 1,270~1,295 대에서 횡보한다. 원가율은 물량이 많은 해에 낮아진다 — 규모의 경제가 실제로 작동한다는 증거다.">
        <Chart
          data={annualVolumeSeries}
          x="label"
          height={260}
          series={[
            S('판매량', '판매량', 'var(--cosmo-s1)', { type: 'bar' }),
            S('평균단가', '평균단가', 'var(--cosmo-s3)', { type: 'line', axis: 'right' }),
          ]}
          yFmt={(v) => `${v.toLocaleString('en-US')}톤`}
          y2Fmt={usd}
        />
      </Card>

      <SecHead>하반기 손익 민감도</SecHead>
      <Card
        src={`「파노피 2026 상반기 평가·하반기 전략」 §4 민감도 — 내부 가정 기반(등급 C)`} sub="단위: 만 달러. 기준 시나리오(판매 38,000톤) 대비 변수별 영향" note="어가 ±$50/톤이 ±190만불로 가장 크지만 시황이라 통제 밖이다. 통제권 안에서 가장 큰 레버는 어획 ±2,000톤(±150만불)이며, 이것이 하반기 전략을 «잔고기 시즌 어획 극대화»로 모는 이유다.">
        <Chart
          data={sensitivityBars}
          x="label"
          height={300}
          horizontal
          labelWidth={150}
          series={[S('영향', '손익 영향', 'var(--cosmo-s1)', { type: 'bar' })]}
          yFmt={musd}
        />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------- 자금·미수금 */

export function CashTab() {
  return (
    <>
      <SecHead>아비장 미수금 회수</SecHead>
      <Card
        src={`「PANOFI 주간동향」 31주 아비장 마켓 미수금 표`}
        sub="단위: 천 달러. 주간동향 실측 31주"
        note={`정점 ${kusd(receivables.abidjanPeakKusd)}에서 ${kusd(receivables.abidjanKusd)}까지 줄였다(${receivables.recoveryPeriod}). 회수는 성공했으나 그 자금이 유류·수리·이자로 소진되고 매입채무가 늘어 자금 과부족은 오히려 악화됐다.`}
      >
        <Chart
          data={receivableSeries}
          x="label"
          height={280}
          xInterval={3}
          series={[S('미수금', '아비장 미수금', 'var(--cosmo-s3)', { type: 'area' })]}
          yFmt={kusd}
        />
      </Card>

      <SecHead>자금 과부족</SecHead>
      <Card sub="단위: 천 달러">
        <div className="kpis">
          <Kpi k="자금 과부족" v={kusd(receivables.cashShortfallKusd)} tone="down" />
          <Kpi k="아비장 미수금 잔액" v={kusd(receivables.abidjanKusd)} d={`정점 대비 ${kusd(receivables.recoveredKusd)}`} tone="up" />
        </div>
        <div className="cnote">{receivables.cashShortfallNote}</div>
      </Card>

      <SecHead>자금유동성 월별</SecHead>
      <Card
        src={`「PANOFI 월간보고」 pptx 5건(1·2·4·5·7월) 자금유동성 표`}
        sub="단위: 천 달러. 월간보고 원본. 과부족 = 현금 + 매출채권 − 매입채무"
        note={liquidity.meta.caveat}
      >
        <Chart
          data={liquiditySeries}
          x="label"
          height={300}
          series={[
            S('현금', '현금', 'var(--cosmo-s1)', { type: 'line' }),
            S('매출채권', '매출채권', 'var(--cosmo-s2)', { type: 'line' }),
            S('매입채무', '매입채무', 'var(--cosmo-s4)', { type: 'line' }),
            S('과부족', '과부족', 'var(--cosmo-s3)', { type: 'bar', signColor: ['var(--cosmo-up)', 'var(--cosmo-down)'] }),
          ]}
          zeroLine
          yFmt={kusd}
        />
      </Card>

      {liquidityBridge && (
        <>
          <SecHead>회수했는데 왜 더 나빠졌나</SecHead>
          <Card
        src={`「PANOFI 월간보고」 pptx — 2025-12-31 대비 2026-06-30`}
            sub={`${liquidityBridge.from} → ${liquidityBridge.to} 증감(천 달러)`}
            note="매출채권을 줄이고 현금을 늘렸는데도 과부족이 벌어진 이유는 매입채무다. 회수한 자금이 유류·수리·이자로 나가고 외상이 그보다 크게 쌓였다. 미수금 회수만으로는 과부족이 뒤집히지 않으며, 매입채무 만기 구조 재조정과 관계사 결제 캘린더 합의가 함께 가야 한다."
          >
            <div className="kpis">
              <Kpi k="현금" v={kusd(liquidityBridge.현금 ?? 0)} tone={(liquidityBridge.현금 ?? 0) >= 0 ? 'up' : 'down'} />
              <Kpi k="매출채권" v={kusd(liquidityBridge.매출채권 ?? 0)} tone="up" d="줄면 회수 성공" />
              <Kpi k="매입채무" v={kusd(liquidityBridge.매입채무 ?? 0)} tone="down" d="늘면 외상 증가" />
              <Kpi k="과부족 변화" v={kusd(liquidityBridge.과부족 ?? 0)} tone="down" d={`${kusd(liquidityBridge.startShortfall ?? 0)} → ${kusd(liquidityBridge.endShortfall ?? 0)}`} />
            </div>
          </Card>
        </>
      )}

      <SecHead>익월 추정손익</SecHead>
      <Card
        src={`「PANOFI 월간보고」 pptx 5건 익월 추정손익 표`} sub="단위: 천 달러. 월간보고가 제시한 익월 순손익 추정과 전년 동월 실적" note="월간보고 3·6월분은 원본이 없어 빠져 있다. 4월 이후 전년 대비 낙폭이 커지는 흐름이 그대로 보인다.">
        <Chart
          data={monthlyEstimates}
          x="label"
          height={240}
          series={[
            S('전년실적', '전년 동월 실적', 'var(--cosmo-s4)', { type: 'bar' }),
            S('당년추정', '당년 추정', 'var(--cosmo-s1)', { type: 'bar' }),
          ]}
          zeroLine
          yFmt={kusd}
        />
      </Card>

      <SecHead>소송·채권</SecHead>
      <div className="grid">
        {receivables.cases.map((c) => (
          <Card key={c.party} title={c.party} sub={'amountEur' in c && c.amountEur ? `채권액 ${c.amountEur.toLocaleString('en-US')} 유로` : undefined}>
            <p className="body">{c.status}</p>
          </Card>
        ))}
      </div>

      <SecHead>유가</SecHead>
      <Card
        src={`「PANOFI 주간동향」 31주 유가 표`} sub="단위: 달러/킬로리터. 2026년 3월 17일부터 4개 지점 표기로 바뀌었다" note="테마가 아비장보다 꾸준히 비싸다. 하역항 선택이 유류비에 직접 반영되므로 항차 계획과 함께 본다.">
        <Chart
          data={fuelSeries}
          x="label"
          height={280}
          xInterval={3}
          series={[
            S('아비장', '아비장 (트럭)', 'var(--cosmo-s1)', { type: 'line' }),
            S('테마', '테마 (트럭)', 'var(--cosmo-s2)', { type: 'line' }),
            S('다카르', '다카르 (트럭)', 'var(--cosmo-s3)', { type: 'line' }),
            S('탱커', '양상 (탱커선)', 'var(--cosmo-s4)', { type: 'line', dash: true }),
          ]}
          yFmt={usd}
        />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------- 하반기 전략 */

export function StrategyTab() {
  const rows = scenarios.rows;
  return (
    <>
      <SecHead>하반기 시나리오</SecHead>
      <Card
        src={`「파노피 2026 상반기 평가·하반기 전략」 §8 하반기 시나리오 — 2025 실적은 실측(A), 하방·기준·상향은 내부 가정(C)`} sub={scenarios.basisNote} note={`전제 — 하방: ${scenarios.premise.down} · 기준: ${scenarios.premise.base} · 상향: ${scenarios.premise.up}`}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>구분</th><th>2025 하반기 실적</th><th>하방</th><th>기준</th><th>상향</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.metric}>
                  <td>{r.metric}</td>
                  <td>{r.actual2025H2 === null ? '—' : r.actual2025H2.toLocaleString('en-US')}</td>
                  <td>{r.down.toLocaleString('en-US')}</td>
                  <td><b>{r.base.toLocaleString('en-US')}</b></td>
                  <td>{r.up.toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="info" label="읽는 법">
          기준 실행 시 하반기 +301만불로 연간 -398만불을 방어한다. 2025년 하반기 어획의 71%면 충분한 목표다.
          상향(2025 수준)이면 연간 손익분기 부근까지 회복하고, 하방이어도 하반기 자체는 균형이다 —
          연간 성적은 이미 상반기 -699만불로 깔렸고 하반기는 몇 만불을 회복하느냐의 게임이다.
        </Callout>
      </Card>

      <SecHead>하반기 우선순위</SecHead>
      <div className="grid">
        {priorities.map((p) => (
          <Card key={p.rank} title={`${p.rank}. ${p.task}`} sub={`시한 ${p.due}`}>
            <p className="body">{p.detail}</p>
            <div className="cnote">기대효과 — {p.effect}</div>
          </Card>
        ))}
      </div>

      <Callout kind="warn" label="중단 조건">{stopCondition}</Callout>
    </>
  );
}

/* -------------------------------------------------------------- 가나 산업 */

export function IndustryTab() {
  return (
    <>
      <SecHead>가나 참치 밸류 사다리</SecHead>
      <Card
        src={`NotebookLM 「가나 중심 서아프리카 참치 비즈니스 분석」(소스 82건, 등급 B)`}
        sub={`단위: ${industry.valueLadder.unit}`}
        note={industry.valueLadder.note}
      >
        <Chart
          data={valueLadder}
          x="label"
          height={260}
          horizontal
          labelWidth={150}
          series={[S('단가', '단가', 'var(--cosmo-s1)', { type: 'bar' })]}
          yFmt={(v) => `${v.toLocaleString('en-US')}유로`}
        />
      </Card>

      <SecHead>테마항 가공공장</SecHead>
      <Card
        src={`NotebookLM 「가나 중심 서아프리카 참치 비즈니스 분석」(소스 82건, 등급 B)`} sub={`3사 연간 처리능력 ${industry.processingCapacityTPerYear.toLocaleString('en-US')}톤 · 가나 연간 통조림 생산 ${industry.annualCannedOutputT.toLocaleString('en-US')}톤`} note={`업계 평균 가동률은 설비 대비 ${industry.utilizationPct[0]}~${industry.utilizationPct[1]}% 수준이다. 원료 공급의 계절 편차가 커 설비를 다 못 돌린다.`}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>공장</th><th>소유</th><th>설립</th><th>처리능력</th><th>고용</th><th>주력 제품</th></tr>
            </thead>
            <tbody>
              {industry.cannersDetail.map((c) => (
                <tr key={c.plant}>
                  <td>{c.plantKo}</td>
                  <td>{c.owner}</td>
                  <td>{c.founded ?? '자료 없음'}</td>
                  <td>{c.capacityTPerDay ? `일 ${c.capacityTPerDay}톤 (실가동 ${c.operatingTPerDay}톤)` : (c.capacity ?? '자료 없음')}</td>
                  <td>{c.employees ?? '자료 없음'}</td>
                  <td>{c.products}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>냉동창고</SecHead>
      <div className="grid">
        {industry.coldChain.map((c) => (
          <Card key={c.fact.slice(0, 20)}>
            <p className="body">{c.fact}</p>
          </Card>
        ))}
      </div>

      <SecHead>수출 시장</SecHead>
      <Card
        sub={`단위: 백만 달러. ${industry.exports.basisNote}`}
        note={`가나산 참치의 약 ${industry.exports.euSharePct}%가 유럽연합으로 간다. 2025년 통조림 수출액은 ${(industry.exports.cannedTunaUsd2025 / 1e6).toFixed(1)}백만 달러로 전년비 ${industry.exports.cannedTunaYoyPct}% 늘었다. 영국이 단일 최대 시장으로 연 ${industry.exports.topMarkets[0].annualT?.toLocaleString('en-US')}톤을 수입한다.`}
      >
        <Chart
          data={exportMarkets}
          x="label"
          height={260}
          series={[S('금액', '수출액', 'var(--cosmo-s1)', { type: 'bar' })]}
          yFmt={(v) => `${v}백만불`}
        />
      </Card>

      <SecHead>선단 규모</SecHead>
      <div className="grid">
        {industry.fleet.map((f) => (
          <Card key={f.fact.slice(0, 24)}>
            <p className="body">{f.fact}{'year' in f && f.year ? ` (${f.year}년)` : ''}</p>
          </Card>
        ))}
      </div>

      <SecHead>규제</SecHead>
      <div className="grid">
        {industry.regulation.map((r) => (
          <Card key={r.topic} title={r.topic}>
            <p className="body">{r.fact}</p>
            {'scope' in r && r.scope && <div className="cnote">적용 범위 — {r.scope}</div>}
            {'caveat' in r && r.caveat && <Callout kind="warn" label="유의">{r.caveat}</Callout>}
            {'conflict' in r && r.conflict && <Callout kind="warn" label="출처 충돌">{r.conflict}</Callout>}
          </Card>
        ))}
      </div>

      <SecHead>사업자 구도</SecHead>
      <div className="grid">
        {industry.players.map((p) => (
          <Card key={p.bloc} title={p.bloc}>
            <p className="body">{p.fact}</p>
          </Card>
        ))}
      </div>

      <SecHead>가나참치협회</SecHead>
      <Card title={industry.gta.nameKo} sub={industry.gta.members}>
        <ul className="list">
          {industry.gta.roles.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </Card>
    </>
  );
}

/* -------------------------------------------------------------- 수출입 */

export function TradeTab() {
  const gap = tradeLadderGap;
  return (
    <>
      <SecHead>가나 참치 무역수지</SecHead>
      <Card
        sub="단위: 백만 달러. 유엔 콤트레이드에 가나가 보고한 값"
        note={trade.meta.caveat}
      >
        <Chart
          data={tradeBalanceSeries}
          x="label"
          height={280}
          series={[
            S('수출', '수출', 'var(--cosmo-s1)', { type: 'bar' }),
            S('수입', '수입', 'var(--cosmo-s3)', { type: 'bar' }),
            S('무역수지', '무역수지', 'var(--cosmo-s2)', { type: 'line' }),
          ]}
          zeroLine
          yFmt={(v) => `${v}백만불`}
        />
      </Card>

      {gap && (
        <>
          <SecHead>밸류 사다리 — 무역통계로 본 칸 사이 거리</SecHead>
          <Card
            sub={`${tradeYear}년 수출 단가(달러/톤). 파노피가 파는 칸과 가나 수출이 나가는 칸`}
            note={`같은 참치가 통조림 칸으로 올라가면 톤당 ${gap.multiple}배가 된다. 가나 참치 수출액의 ${gap.cannedSharePct}%가 이 칸에서 나가고, 파노피는 원어 칸에서 판다. 어가 협상보다 밸류체인 위치가 손익을 크게 정한다는 뜻이다 — 가나·유럽연합 잠정 경제동반자협정(2016)으로 가공 참치가 유럽연합에 무관세·무쿼터로 들어가는 것이 이 구조를 떠받친다.`}
          >
            <div className="kpis">
              <Kpi k="냉동 원어" v={usd(gap.rawUsdPerT)} unit="/톤" />
              <Kpi k="조제·통조림" v={usd(gap.cannedUsdPerT)} unit="/톤" tone="up" />
              <Kpi k="배수" v={`${gap.multiple}배`} />
              <Kpi k="통조림 금액 비중" v={pct(gap.cannedSharePct)} />
            </div>
            <Chart
              data={exportByForm}
              x="label"
              height={240}
              horizontal
              labelWidth={110}
              series={[S('단가', '수출 단가', 'var(--cosmo-s1)', { type: 'bar' })]}
              yFmt={usd}
            />
          </Card>
        </>
      )}

      <SecHead>품목별 수출</SecHead>
      <Card
        src={`UN Comtrade public preview · 가나(reporter 288) 보고 기준`} sub={`${tradeYear}년 · 금액(백만 달러)과 단가(달러/톤)`}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>품목</th><th>금액 (백만 달러)</th><th>물량 (톤)</th><th>단가 (달러/톤)</th></tr></thead>
            <tbody>
              {exportByCommodity.map((c) => (
                <tr key={c.label}>
                  <td>{c.label}</td>
                  <td>{c.금액.toLocaleString('en-US')}</td>
                  <td>{c.물량.toLocaleString('en-US')}</td>
                  <td>{c.단가 === null ? '자료 없음' : c.단가.toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>어종별 수출</SecHead>
      <Card
        src={`UN Comtrade public preview · 가나 보고 기준`}
        sub={`${tradeYear}년 원어 기준(냉동·신선). 필레와 통조림은 어종이 합쳐져 보고되므로 제외했다`}
        note="파노피가 잡는 주력은 가다랑어와 황다랑어다. 통계상 황다랑어 금액이 앞서지만 물량은 가다랑어가 통조림 원료로 더 많이 나간다."
      >
        <Chart
          data={exportBySpecies}
          x="label"
          height={240}
          series={[
            S('금액', '수출액', 'var(--cosmo-s1)', { type: 'bar' }),
            S('단가', '단가', 'var(--cosmo-s3)', { type: 'line', axis: 'right' }),
          ]}
          yFmt={(v) => `${v}백만불`}
          y2Fmt={usd}
        />
      </Card>

      <SecHead>수출 상대국</SecHead>
      <Card
        sub={`${tradeYear}년 · 단위: 백만 달러`}
        note="상위 4개국이 모두 유럽연합·영국이다. 유럽 리테일 규격과 지속가능성 인증이 사실상 진입 조건이며, 해양관리협의회 인증을 2026년 1월에 딴 이유도 여기에 있다."
      >
        <Chart
          data={exportByPartner}
          x="label"
          height={300}
          horizontal
          labelWidth={110}
          series={[S('금액', '수출액', 'var(--cosmo-s1)', { type: 'bar' })]}
          yFmt={(v) => `${v}백만불`}
        />
      </Card>

      <SecHead>거울통계 — 받은 쪽 장부와 맞대보면</SecHead>
      <Card
        src={`UN Comtrade public preview · 가나 보고 vs 상대국 보고 대조`}
        sub={`${mirror.meta.year}년 · 단위: 백만 달러. 가나가 «수출했다»고 보고한 값과 상대국이 «가나에서 수입했다»고 보고한 값`}
        note={mirror.meta.interpretation}
      >
        <div className="kpis">
          <Kpi k="가나 수출 합계" v={`${Math.round(mirror.meta.ghanaExportTotalUsd / 1e6)}`} unit="백만불" />
          <Kpi k="상대국 수입 합계" v={`${Math.round(mirror.meta.partnerImportTotalUsd / 1e6)}`} unit="백만불" tone="up" />
          <Kpi k="합계 비율" v={`${mirror.meta.totalRatio}배`} d="운임·보험 차라면 1.05~1.15" tone="down" />
          <Kpi k="쌍별 중앙값" v={`${mirror.meta.medianRatio}배`} tone="down" />
        </div>
        <Chart
          data={mirrorPairs}
          x="label"
          height={300}
          horizontal
          labelWidth={130}
          series={[
            S('가나수출', '가나 보고(수출)', 'var(--cosmo-s1)', { type: 'bar' }),
            S('상대국수입', '상대국 보고(수입)', 'var(--cosmo-s3)', { type: 'bar' }),
          ]}
          yFmt={(v) => `${v}백만불`}
        />
        {mirrorTopGap && (
          <Callout kind="warn" label="가장 큰 격차">
            {mirrorTopGap.partner} 세번 {mirrorTopGap.hs} — 가나는 {mirrorTopGap.가나수출}백만 달러를
            수출했다고 보고했는데 {mirrorTopGap.partner}은 {mirrorTopGap.상대국수입}백만 달러를 가나에서
            수입했다고 보고한다. {mirrorTopGap.ratio}배, 금액으로 {Math.round(mirrorTopGap.gapUsd / 1e6)}백만 달러 차다.
            최대 시장에서 이만큼 벌어지는 것은 운임·보험 차로 설명되지 않는다. 제3국을 거친 물량이
            원산지 기준으로 가나에 귀속되는 것과 가나 측 미보고, 두 가지가 모두 가능하며 이 자료만으로는
            가르지 못한다.
          </Callout>
        )}
        {mirrorUnmatched.length > 0 && (
          <Callout kind="warn" label="받은 쪽 기록이 없는 건">
            {mirrorUnmatched.map((u) => `${u.partner} 세번 ${u.hs} ${u.가나수출}백만 달러`).join(' · ')} —
            가나는 수출했다고 보고하지만 상대국의 대응 수입 보고가 없다. 두 나라 모두 유엔 콤트레이드
            보고가 늦거나 빠지는 경우가 있어 미보고로 단정하지 않는다.
          </Callout>
        )}
        <div className="cnote">
          함의 — 이 화면의 품목·상대국 수치는 모두 <b>가나 보고 기준</b>이다. 상대국 장부가 더 크다면
          실제 물동량은 여기 표시된 것보다 클 수 있다. 파노피의 실적 판단에는 사내 원장을 쓰고,
          무역통계는 시장 구조를 읽는 용도로만 본다.
        </div>
      </Card>

      <SecHead>수입 상대국 — 원어를 어디서 채우나</SecHead>
      <Card
        sub={`${tradeYear}년 · 단위: 백만 달러`}
        note="가나 가공공장은 자국 선단 양륙만으로 설비를 못 채운다. 계절 부족기에 인접국과 원양선단 물량을 수입해 메우는 구조이며, 이 수입이 늘면 국내 원어 어가 협상력은 그만큼 약해진다."
      >
        <Chart
          data={importByPartner}
          x="label"
          height={280}
          horizontal
          labelWidth={110}
          series={[S('금액', '수입액', 'var(--cosmo-s3)', { type: 'bar' })]}
          yFmt={(v) => `${v}백만불`}
        />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------ 데이터 품질 */

export function QualityTab() {
  return (
    <>
      <SecHead>원자료 커버리지</SecHead>
      <Card
        sub={`주간동향 ${dataQuality.weekCount}주 기계 추출 (${headline.rangeStart} ~ ${headline.rangeEnd})`}
        note="추출 스크립트가 필드별 결측률을 매 실행마다 보고한다. 포맷이 바뀐 주차를 조용히 넘기지 않기 위한 자기점검이다."
      >
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>필드</th><th>확보 주차</th><th>비율</th></tr></thead>
            <tbody>
              {Object.entries(dataQuality.coverage).map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v} / {dataQuality.weekCount}</td>
                  <td>{Math.round((v / dataQuality.weekCount) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>알려진 원자료 이슈</SecHead>
      <div className="grid">
        <Card title="선박 동향 표기 방식">
          <p className="body">
            {dataQuality.weekCount}주 중 {dataQuality.nominalWeeks}주는 선박별 항목 대신
            「각 선 특이사항 없이 안전 조업 중」 한 줄만 온다. 결측이 아니라 정상 신호이므로
            자료 없음과 구분해 기록했다. 실제 결측은 {dataQuality.missingWeeks}주다.
          </p>
        </Card>
        <Card title="원문 일자 오타">
          <p className="body">
            {dataQuality.statedYearMismatch.length}주치 원문의 「일자」가 2025년으로 적혀 있다
            (연초에 연도를 바꾸지 않은 것으로 보인다). 파일명 스탬프를 정본으로 삼았고
            데이터에는 영향이 없다.
          </p>
          <div className="cnote">해당 주차 — {dataQuality.statedYearMismatch.join(', ')}</div>
        </Card>
        <Card title="유가 표기 전환">
          <p className="body">
            2026년 3월 17일부터 단일값에서 4개 지점 표로 바뀌었다. 그 전 9주는 지점 구분이 없어
            아비장 계열로만 표시한다.
          </p>
        </Card>
        <Card title="채널 물량 비중 부재">
          <p className="body">{pfc.measured.caveat}</p>
        </Card>
      </div>

      <SecHead>근거 등급</SecHead>
      <Card sub="이 화면의 모든 수치에는 출처와 등급이 붙어 있다">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>등급</th><th>뜻</th></tr></thead>
            <tbody>
              {Object.entries(dataQuality.grades).map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>출처</SecHead>
      <Card>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>구분</th><th>자료</th><th>기준일</th></tr></thead>
            <tbody>
              {dataQuality.sources.map((s) => (
                <tr key={s.key}>
                  <td>{s.type}</td>
                  <td>{s.title}{'note' in s && s.note ? ` — ${s.note}` : ''}</td>
                  <td>{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SecHead>외부 조사에서 채우지 못한 칸</SecHead>
      <Card sub="타이유니온·PFC 지배력 조사에서 공개 자료로 확인되지 않은 항목" note="비어 있는 칸을 추정으로 메우지 않았다. 이 중 「가격 선도자냐」는 우리 주간동향 실측으로 직접 답했다.">
        <ul className="list">
          {pfc.sourceGaps.map((g) => <li key={g}>{g}</li>)}
        </ul>
      </Card>

      <SecHead>최신 주차 원본</SecHead>
      <Card>
        <div className="kpis">
          <Kpi k="보고일" v={latest.reportDate} />
          <Kpi k="작성자" v={latest.author ?? '자료 없음'} />
          <Kpi k="총 주차" v={String(weeks.length)} unit="주" />
        </div>
        <div className="cnote">원본 파일 — {latest.source} · SHA-256 {latest.sha256.slice(0, 16)}…</div>
      </Card>
    </>
  );
}
