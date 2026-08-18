'use client'
import { C } from '../palette'
import Chart, { Legend } from '../Chart'
import { PageHead, Card, Kpi, Callout, SecHead } from '../Ui'
import {
  weeks, weeklySeries, checks, latest, meta,
  musd, usd, num, pct, n,
} from '@/lib/data/cosmo'

const m1 = (v: number) => (v / 1e6).toFixed(1) + 'M'
const m2 = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M'
const k0 = (v: number) => (v / 1e3).toFixed(0) + 'k'
const r2 = (v: number) => v.toFixed(2)

/** 값 폭이 좁은 계열은 0 기준 축에서 한 선으로 뭉갠다 — 데이터 범위 ±pad 로 자른 축 */
const tightDomain = (vals: (number | null | undefined)[], pad = 0.3): [number, number] => {
  const v = vals.filter((x): x is number => typeof x === 'number')
  const lo = Math.min(...v)
  const hi = Math.max(...v)
  const m = (hi - lo) * pad
  return [lo - m, hi + m]
}

/** 주간 순현금흐름 = 외부 입금 − 외부 출금.
 *  원본에 externalIn/OutUsd 가 비어 있는 주는 총입출금에서 계좌간 이동(transferUsd)을 뺀 값으로 대체한다.
 *  (총입금·총출금에는 계좌간 이동이 양쪽에 그대로 들어 있어 그대로 쓰면 유출입이 과대계상된다) */
const rows = (() => {
  let acc = 0
  return weeklySeries.map((s, i) => {
    const c = weeks[i].cash
    const tr = c.transferUsd
    const extIn = c.externalInUsd ?? (c.inUsd != null && tr != null ? c.inUsd - tr : null)
    const extOut = c.externalOutUsd ?? (c.outUsd != null && tr != null ? c.outUsd - tr : null)
    const net = s.cashNet ?? (extIn != null && extOut != null ? extIn - extOut : null)
    if (net != null) acc += net
    return {
      ...s,
      extIn, extOut,
      cashNet: net,
      cashNetCum: net == null ? null : acc,
      transferUsd: tr ?? null,
      ghcUsd: c.byCurrency.find((x) => x.ccy === 'GHC')?.endUsd ?? null,
    }
  })
})()

export default function Cash() {
  const last = rows[rows.length - 1]
  const prev = rows[rows.length - 2]
  const opening = weeks[0].cash.beginUsd ?? null
  const wowDelta = n(last.cashUsd) - n(prev?.cashUsd)
  const ytdDelta = n(last.cashUsd) - n(opening)

  const netRows = rows.filter((r) => r.cashNet != null)
  const negWeeks = netRows.filter((r) => n(r.cashNet) < 0).length
  const netSum = n(last.cashNetCum)
  const bridgeGap = ytdDelta - netSum
  const worstNet = [...netRows].sort((a, b) => n(a.cashNet) - n(b.cashNet))[0]
  const bestNet = [...netRows].sort((a, b) => n(b.cashNet) - n(a.cashNet))[0]

  const byCash = [...rows].sort((a, b) => n(a.cashUsd) - n(b.cashUsd))
  const lowest = byCash[0]
  const highest = byCash[byCash.length - 1]

  const inflow = n(latest.cash.inUsd)
  const transfer = n(latest.cash.transferUsd)
  const transferShare = inflow ? transfer / inflow : null

  // 통화별 — 최신 주 기말잔액(USD 환산) 기준, 연초 기초와 비교
  const totalEnd = latest.cash.byCurrency.reduce((a, c) => a + n(c.endUsd), 0)
  const ccyRows = latest.cash.byCurrency
    .map((c) => {
      const open = weeks[0].cash.byCurrency.find((x) => x.ccy === c.ccy)
      return {
        ccy: c.ccy,
        begin: open?.beginUsd ?? null,
        end: c.endUsd,
        delta: n(c.endUsd) - n(open?.beginUsd),
        share: totalEnd ? n(c.endUsd) / totalEnd : 0,
      }
    })
    .sort((a, b) => n(b.end) - n(a.end))
  const usdRow = ccyRows.find((c) => c.ccy === 'USD')
  const nonUsd = ccyRows.filter((c) => c.ccy !== 'USD').reduce((a, c) => a + n(c.end), 0)

  // GHC 환율 노출
  const rate0 = rows[0].ghcRate
  const rate1 = last.ghcRate
  const depreciation = n(rate0) ? n(rate1) / n(rate0) - 1 : null
  const ghcUsd = n(ccyRows.find((c) => c.ccy === 'GHC')?.end)
  const ghcAtOpenRate = ghcUsd * (1 + n(depreciation))
  const fxExposure = ghcAtOpenRate - ghcUsd
  const ghcSeries = rows.map((r) => n(r.ghcUsd))
  const ghcMin = Math.min(...ghcSeries)
  const ghcMax = Math.max(...ghcSeries)

  // 검산 — 자금 항등식(기초 + 입금 − 출금 = 기말)
  const cashChecks = checks.filter((c) => c.name === '자금 항등식')
  const cashFails = cashChecks.filter((c) => !c.ok)

  return (
    <>
      <PageHead
        title="자금"
        lead={`현금이 실제로 늘고 있는지, 통화·환율 노출이 얼마인지를 봅니다. 총 입출금에는 계좌간 이동이 섞여 있어 실질 유출입은 이를 제거한 순현금흐름으로 따로 계산했습니다.`}
        meta={[
          `주간 ${meta.weekRange[0]}~${meta.weekRange[1]}주 (${meta.weekCount}주, 결측 ${meta.missingWeeks.join(',') || '없음'})`,
          `통화 ${latest.cash.byCurrency.length}종`,
          `자금 항등식 검산 ${cashChecks.length}건 중 이상 ${cashFails.length}건`,
        ]}
      />

      <SecHead>핵심 수치</SecHead>
      <div className="grid g4">
        <Card>
          <Kpi k="현금잔액" v={musd(last.cashUsd)}
            d={`${latest.week}주차 기말 · 전 통화 USD 환산`} />
        </Card>
        <Card>
          <Kpi k="전주 대비" v={musd(wowDelta)} tone={wowDelta >= 0 ? 'up' : 'down'}
            d={`${prev?.label} ${musd(prev?.cashUsd)} → ${musd(last.cashUsd)}`} />
        </Card>
        <Card>
          <Kpi k="주간 순현금흐름" v={musd(last.cashNet)} tone={n(last.cashNet) >= 0 ? 'up' : 'down'}
            d={`외부 입금 ${musd(last.extIn)} − 외부 출금 ${musd(last.extOut)}`} />
        </Card>
        <Card>
          <Kpi k="연초 대비" v={musd(ytdDelta)} tone={ytdDelta >= 0 ? 'up' : 'down'}
            d={`연초 기초 ${musd(opening)} 대비 ${pct(n(opening) ? ytdDelta / n(opening) : null, 1)}`} />
        </Card>
        <Card>
          <Kpi k="GHC 환율" v={num(rate1, 2)} unit=" GHC/USD"
            tone={n(depreciation) > 0 ? 'down' : 'up'}
            d={`연초 ${num(rate0, 2)} · GHC ${pct(depreciation, 1)} 절하`} />
        </Card>
        <Card>
          <Kpi k="GHC 보유 (USD 환산)" v={musd(ghcUsd)}
            d={`현금의 ${pct(totalEnd ? ghcUsd / totalEnd : null, 1)} · 환율 변동에 직접 노출`} />
        </Card>
      </div>

      <SecHead id="sec-flow">현금은 늘고 있나</SecHead>
      <div className="grid g2">
        <Card
          title="현금잔액 추이"
          sub="전 통화 USD 환산 주말 잔액. 점선은 연초 기초 잔액."
          note={<>연초 {musd(opening)} → {latest.week}주차 <b>{musd(last.cashUsd)}</b>({musd(ytdDelta)}).
            최저 {musd(lowest.cashUsd)}({lowest.label}) · 최고 {musd(highest.cashUsd)}({highest.label})로
            변동폭이 <b>{musd(n(highest.cashUsd) - n(lowest.cashUsd))}</b>, 최신 잔액의
            {' '}{(n(n(highest.cashUsd) - n(lowest.cashUsd)) / Math.max(1, n(last.cashUsd))).toFixed(1)}배입니다.
            잔액 수준보다 주간 진폭이 큰 구조라 특정 주의 잔액만으로 판단하기 어렵습니다.</>}
        >
          <Legend items={[
            { name: '현금잔액', color: C.rank, box: true },
            { name: `연초 ${musd(opening)}`, color: 'var(--cosmo-muted)', dash: true },
          ]} />
          <Chart
            data={rows} x="label" height={250} yFmt={m1} xInterval={3}
            refLines={opening != null ? [{ y: opening, color: 'var(--cosmo-muted)' }] : undefined}
            series={[{ key: 'cashUsd', name: '현금잔액', color: C.rank, type: 'area', fmt: m2 }]}
          />
        </Card>

        <Card
          title="주간 순현금흐름 (계좌간 이동 제외)"
          sub="외부 입금 − 외부 출금. 계좌간 이동은 회사 밖으로 나가지 않으므로 양쪽에서 뺐습니다."
          note={<>{netRows.length}주 중 <b>{negWeeks}주가 순유출</b>. 최대 유출 {musd(worstNet?.cashNet)}({worstNet?.label}),
            최대 유입 {musd(bestNet?.cashNet)}({bestNet?.label}).
            {latest.week}주차 총 입금 {musd(latest.cash.inUsd)} 중 계좌간 이동이 <b>{musd(latest.cash.transferUsd)}
            ({pct(transferShare, 0)})</b>이라, 원본의 총 입금·총 출금을 그대로 쓰면 유출입이 그만큼 과대계상됩니다.
            원본에 외부 입출금 항목이 비어 있어 총액에서 계좌간 이동을 차감해 산출했습니다.</>}
        >
          <Legend items={[
            { name: '순유입', color: C.sign[0], box: true },
            { name: '순유출', color: C.sign[1], box: true },
          ]} />
          <Chart
            data={rows} x="label" height={250} yFmt={m1} xInterval={3} zeroLine
            series={[{
              key: 'cashNet', name: '순현금흐름', color: C.s1, type: 'bar',
              signColor: C.sign, fmt: m2,
            }]}
          />
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <Card
          title="누적 순현금흐름"
          sub="주간 순현금흐름을 연초부터 누적한 값. 영업·투자·재무를 합친 실질 순유입."
          note={<>{latest.week}주차 누적 <b>{musd(netSum)}</b>.
            같은 기간 잔액 변동은 {musd(ytdDelta)}로 <b>{musd(bridgeGap)}</b> 차이가 나는데,
            {meta.missingWeeks.length
              ? <> {meta.missingWeeks.join(',')}주차 자료가 결측이라 그 주의 흐름이 누적에서 빠져 있기 때문입니다.
                  누적선의 기울기는 참고용이고, 절대 수준은 결측분만큼 낮게 나옵니다.</>
              : <> 결측 주차는 없으므로 이 차이는 계좌간 이동·환산 차이에서 옵니다 —
                  누적 순현금흐름은 <b>외부 유출입만</b> 더한 값이라 잔액 변동과 정확히 일치하지 않습니다.</>}</>}
        >
          <Legend items={[{ name: '누적 순현금흐름', color: C.rank }]} />
          <Chart
            data={rows} x="label" height={250} yFmt={m1} xInterval={3} zeroLine
            series={[{ key: 'cashNetCum', name: '누적 순현금흐름', color: C.rank, fmt: m2 }]}
          />
        </Card>

        <Card
          title="통화별 잔액 구성"
          sub={`${latest.week}주차 기말 잔액을 통화별 USD 환산액으로. 로그축이 아니므로 소액 통화는 막대가 거의 보이지 않습니다.`}
          note={<>USD가 <b>{pct(usdRow?.share, 1)}</b>({musd(usdRow?.end)}), 비USD 합계 {musd(nonUsd)}
            ({pct(totalEnd ? nonUsd / totalEnd : null, 1)}). 비USD의 대부분은 GHC {musd(ghcUsd)}로,
            <b>환율 노출은 사실상 GHC 하나</b>입니다. EUR·GBP·JPY는 합쳐도
            {' '}{musd(nonUsd - ghcUsd)} 수준이라 환위험 관점에서는 무시할 만합니다.</>}
        >
          <Legend items={[{ name: '기말 잔액 (USD 환산)', color: C.rank, box: true }]} />
          <Chart
            data={ccyRows} x="ccy" height={250} yFmt={m1} xInterval={0}
            series={[{ key: 'end', name: '기말 잔액', color: C.rank, type: 'bar', fmt: (v) => usd(v, 0) }]}
          />
        </Card>
      </div>

      <SecHead>통화 · 환율 노출</SecHead>
      <div className="grid g2">
        <Card
          title="GHC 환율 추이와 보유 잔액"
          sub="GHC/USD 환율(좌)과 GHC 보유액의 USD 환산 잔액(우). 환율 상승 = 세디 절하. 환율 축은 변동 폭이 좁아 0 이 아니라 데이터 범위에서 시작한다."
          note={<>연초 {num(rate0, 3)} → {latest.week}주차 {num(rate1, 3)}로 GHC <b>{pct(depreciation, 1)} 절하</b>.
            현재 GHC 보유 {musd(ghcUsd)}를 연초 환율로 평가하면 {musd(ghcAtOpenRate)}이므로,
            보유분에 대한 환산 손실 규모는 <b>약 {usd(fxExposure, 0)}</b>로 추정됩니다
            (현 잔액 × 절하율에 의한 단순 추정이며, 실제 손익은 보유 시점·기간에 따라 달라집니다).
            GHC 잔액이 기간 중 {k0(ghcMin)}~{k0(ghcMax)} 사이를 오가 노출 규모도 주마다 크게 변합니다.</>}
        >
          <Legend items={[
            { name: 'GHC/USD 환율', color: C.s2 },
            { name: 'GHC 보유 (USD 환산)', color: C.s3, box: true },
          ]} />
          <Chart
            data={rows} x="label" height={250} xInterval={3}
            yFmt={r2} y2Fmt={k0} domain={tightDomain(rows.map((r) => r.ghcRate))}
            series={[
              { key: 'ghcUsd', name: 'GHC 보유', color: C.s3, type: 'bar', axis: 'right', fmt: (v) => usd(v, 0) },
              { key: 'ghcRate', name: 'GHC/USD', color: C.s2, fmt: (v) => v.toFixed(3) },
            ]}
          />
        </Card>

        <Card
          title="통화별 잔액"
          sub="연초 기초 대비 최신 주 기말 잔액. 전액 USD 환산 기준."
          note={<>원본 자금현황은 계좌 단위로 작성되지만 대시보드에는 <b>통화별 소계까지만</b> 싣습니다(계좌번호 미노출).
            연초 대비 GHC는 {musd(ccyRows.find((c) => c.ccy === 'GHC')?.delta)}, USD는 {musd(usdRow?.delta)} 변동했습니다.
            환산액이므로 통화별 증감에는 잔고 변동과 환율 변동이 섞여 있어 분리되지 않습니다.</>}
        >
          <div className="tw" style={{ marginBottom: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>통화</th>
                  <th className="n">연초 기초</th>
                  <th className="n">기말 잔액</th>
                  <th className="n">증감</th>
                  <th className="n">비중</th>
                </tr>
              </thead>
              <tbody>
                {ccyRows.map((c) => (
                  <tr key={c.ccy}>
                    <td><span className="tag">{c.ccy}</span></td>
                    <td className="n">{usd(c.begin, 0)}</td>
                    <td className="n">{usd(c.end, 0)}</td>
                    <td className="n" style={{ color: c.delta >= 0 ? C.sign[0] : C.sign[1] }}>{usd(c.delta, 0)}</td>
                    <td className="n">{pct(c.share, 1)}</td>
                  </tr>
                ))}
                <tr>
                  <td><b>합계</b></td>
                  <td className="n">{usd(weeks[0].cash.beginUsd, 0)}</td>
                  <td className="n"><b>{usd(totalEnd, 0)}</b></td>
                  <td className="n">{usd(ytdDelta, 0)}</td>
                  <td className="n">{pct(1, 1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SecHead>검산</SecHead>
      <Card
        title="자금 항등식"
        sub="기초 + 입금 − 출금 = 기말. 잔차가 허용치를 넘은 주차만 표시합니다."
        note={<>검산 {cashChecks.length}건 중 이상 <b>{cashFails.length}건</b>.
          {cashFails.length > 0
            ? <> 잔차는 최신 잔액의 {pct(n(cashFails[0]?.residual) / Math.max(1, n(last.cashUsd)), 3)} 수준으로 방향성을 바꿀 크기는 아니지만,
              해당 주차의 입출금 내역은 원본 대조가 필요합니다.</>
            : <> 주간 현금 흐름은 원본과 일치합니다.</>}</>}
      >
        {cashFails.length > 0 ? (
          <div className="tw" style={{ marginBottom: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>주차</th>
                  <th className="n">잔차 (USD)</th>
                  <th className="n">기말 잔액 대비</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {cashFails.map((c) => {
                  const w = rows.find((r) => r.week === c.week)
                  return (
                    <tr key={c.week} className="warn">
                      <td>{c.week}주</td>
                      <td className="n">{usd(c.residual, 2)}</td>
                      <td className="n">{pct(n(w?.cashUsd) ? c.residual / n(w?.cashUsd) : null, 3)}</td>
                      <td>{c.note || '기초 + 입금 − 출금 ≠ 기말'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="csub" style={{ margin: 0 }}>
            {cashChecks.length}건 모두 정상. 기초 + 입금 − 출금 = 기말이 전 주차에서 성립합니다.
          </p>
        )}
      </Card>

      <div style={{ marginTop: 18 }}>
        <Callout kind={ytdDelta >= 0 ? 'info' : 'warn'} label="지금 읽히는 것">
          현금잔액은 연초 {musd(opening)}에서 {latest.week}주차 <b>{musd(last.cashUsd)}</b>로 {musd(ytdDelta)}
          {ytdDelta >= 0 ? ' 늘었습니다' : ' 줄었습니다'}. 다만 계좌간 이동을 제거한 순현금흐름 기준으로는
          {' '}{netRows.length}주 중 <b>{negWeeks}주가 순유출</b>이고, 주간 진폭이
          {' '}{musd(bestNet?.cashNet)}에서 {musd(worstNet?.cashNet)}까지 벌어져 잔액이 늘었다기보다
          {' '}<b>큰 유출입이 상쇄된 결과</b>에 가깝습니다. 총 입출금은 최신 주 기준 {pct(transferShare, 0)}가
          계좌간 이동이라 그대로 보면 규모가 부풀려집니다.
          통화 노출은 GHC 한 곳에 몰려 있고({musd(ghcUsd)}, 현금의 {pct(totalEnd ? ghcUsd / totalEnd : null, 1)}),
          GHC는 연초 대비 <b>{pct(depreciation, 1)} 절하</b>돼 현 보유분 기준 약 {usd(fxExposure, 0)}의 환산 손실
          노출이 추정됩니다. GHC 잔액을 필요 운전자금 수준으로 낮추면 이 노출은 바로 줄어듭니다.
        </Callout>
      </div>
    </>
  )
}
