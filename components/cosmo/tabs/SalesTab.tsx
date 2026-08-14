'use client'
import Chart, { Legend } from '../Chart'
import { PageHead, Card, Kpi, Callout, SecHead } from '../Ui'
import {
  weeks, weeklySeries, latest, meta, quoteStats, marginBuckets, breakevenMargin,
  movingAvg, musd, usd, num, pct, n,
} from '@/lib/data/cosmo'

const m1 = (v: number) => (v / 1e6).toFixed(1) + 'M'
const m2 = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M'
const k0 = (v: number) => '$' + (v / 1000).toFixed(0) + 'k'
const k1 = (v: number) => '$' + (v / 1000).toFixed(1) + 'k'
const fclFmt = (v: number) => num(v, 0) + ' FCL'
const wkFmt = (v: number) => v.toFixed(1) + '주'
const cntFmt = (v: number) => num(v, 0) + '건'

type WRow = (typeof weeklySeries)[number]
/** salesMA4 는 lib/data 에서 런타임에 덧붙는 키라 타입에 없다 */
const ma4 = (r: WRow | undefined) =>
  (r as unknown as { salesMA4?: number | null } | undefined)?.salesMA4 ?? null

export default function Sales() {
  const last = weeklySeries[weeklySeries.length - 1]

  /* 주간 판매액 진폭 */
  const swingRows = weeklySeries.filter((r) => n(r.salesWeek) > 0)
  const peak = swingRows.reduce((a, r) => (n(r.salesWeek) > n(a.salesWeek) ? r : a), swingRows[0])
  const trough = swingRows.reduce((a, r) => (n(r.salesWeek) < n(a.salesWeek) ? r : a), swingRows[0])
  const swing = n(peak.salesWeek) / n(trough.salesWeek)

  /* 1주차 누적 재계산 — 원본은 salesCumUsdRaw 에 남아 있다 */
  const rawCarry = weeks.find((w) => w.salesCumUsdRaw != null)

  /* 품목별 누적 (최신 주 기준) */
  const items = latest.sales
    .filter((s) => s.cumUsd != null)
    .sort((a, b) => n(b.cumUsd) - n(a.cumUsd))
  const itemTotal = items.reduce((a, s) => a + n(s.cumUsd), 0)
  const fclItems = items.filter((s) => s.unit === 'Fcl')
  const fclShare = fclItems.reduce((a, s) => a + n(s.cumUsd), 0) / itemTotal
  const mixRows = items.map((s) => ({ label: s.label, cumUsd: s.cumUsd }))

  /* FCL 3종 단가 추이 */
  const priceItems = ['RETAIL', 'CATERING', 'POUCH']
  const lbl = (it: string) => latest.sales.find((s) => s.item === it)?.label ?? it
  const priceRows = weeks.map((w) => {
    const row: Record<string, unknown> = { label: `${w.week}주` }
    priceItems.forEach((it) => { row[it] = w.sales.find((s) => s.item === it)?.cumPrice ?? null })
    return row
  })
  const priceNow = priceItems.map((it) => n(latest.sales.find((s) => s.item === it)?.cumPrice))
  const spread = Math.max(...priceNow) - Math.min(...priceNow)
  /* 세 계열이 $60k 대에 몰려 있어 0 기준 축이면 한 선으로 뭉갠다 — 데이터 범위로 자른다 */
  const priceVals = priceRows
    .flatMap((r) => priceItems.map((it) => r[it]))
    .filter((v): v is number => typeof v === 'number')
  const pricePad = (Math.max(...priceVals) - Math.min(...priceVals)) * 0.3
  const priceDomain: [number, number] =
    [Math.min(...priceVals) - pricePad, Math.max(...priceVals) + pricePad]

  /* 수주잔량 소진 — 주간 판매 FCL(선적) 대비 */
  const fclWeek = weeks.map((w) =>
    w.sales.filter((s) => s.unit === 'Fcl').reduce((a, s) => a + n(s.weekQty), 0))
  const fclMA4 = movingAvg(fclWeek)
  const burnRows = weeklySeries.map((r, i) => ({
    label: r.label,
    fclWeek: fclWeek[i],
    burnRate: n(r.backlogFcl) ? fclWeek[i] / n(r.backlogFcl) : null,
    coverWeeks: n(fclMA4[i]) && n(r.backlogFcl) ? n(r.backlogFcl) / n(fclMA4[i]) : null,
  }))
  const coverNow = burnRows[burnRows.length - 1].coverWeeks
  const backlogUnit = n(last.backlogFcl) ? n(last.backlogUsd) / n(last.backlogFcl) : 0

  /* 수출·내수 — 1주차는 전년 이월 원본이 그대로 남아 있어 제외 */
  const exDom = weeklySeries.filter((r) => n(r.exportCum) <= n(r.salesCum))
  const exDomSkipped = weeklySeries.filter((r) => n(r.exportCum) > n(r.salesCum)).map((r) => r.week)
  const exportShare = n(last.exportCum) / (n(last.exportCum) + n(last.domesticCum))

  /* 견적 마진 */
  const riskHi = Math.max(...marginBuckets.filter((b) => b.risk).map((b) => b.hi))
  const bucketRows = marginBuckets.map((b) => ({
    label: b.label,
    risk: b.risk ? b.count : null,
    safe: b.risk ? null : b.count,
  }))
  const riskCount = marginBuckets.filter((b) => b.risk).reduce((a, b) => a + b.count, 0)
  const worst = quoteStats.sorted.slice(0, 15)

  /* 손익분기 이상 견적의 물량 비중 — 건수가 아니라 물량이 상쇄 여력을 결정한다 */
  const aboveBe = (() => {
    const be = breakevenMargin?.required ?? 0.03
    const fclOf = (t: string) => { const m = /(-?\d+(?:\.\d+)?)/.exec(t ?? ''); return m ? Number(m[1]) : 0 }
    const withQty = quoteStats.sorted.map((q) => ({ q, fcl: fclOf(q.qty) })).filter((x) => x.fcl > 0)
    const total = withQty.reduce((a, x) => a + x.fcl, 0)
    const above = withQty.filter((x) => x.q.margin >= be)
    return { count: above.length, fcl: above.reduce((a, x) => a + x.fcl, 0),
             share: total ? above.reduce((a, x) => a + x.fcl, 0) / total : 0 }
  })()

  return (
    <>
      <PageHead
        title="판매 · 수주"
        lead={`무엇이 얼마에 팔리고 있고, 앞으로 들어올 물량의 마진이 어떤지를 봅니다. 누적 판매는 ${musd(last.salesCum)}, 수주잔량은 ${num(last.backlogFcl, 0)} FCL(${musd(last.backlogUsd)}) 이지만 신규 견적의 마진 중앙값은 ${pct(quoteStats.median, 2)} 입니다.`}
        meta={[
          `주간 ${meta.weekRange[0]}~${meta.weekRange[1]}주 (${meta.weekCount}주, 결측 ${meta.missingWeeks.join(',')})`,
          `견적 ${quoteStats.total}건 · 마진값 있는 건 ${quoteStats.withMargin}건`,
          `판매 품목 ${items.length}종`,
          '선적 기준 (회계 인식과 다름)',
          '판매 계획 없음 — 원본 계획대비 칸이 전 주차 0',
        ]}
      />

      <SecHead>핵심 수치</SecHead>
      <div className="grid g3">
        <Card>
          <Kpi k="누적 판매액" v={musd(last.salesCum)}
            d={`${latest.week}주차까지 · 선적 기준`} />
        </Card>
        <Card>
          <Kpi k="최신 주간 판매액" v={musd(last.salesWeek)}
            tone={n(last.salesWeek) >= n(ma4(last)) ? 'up' : 'down'}
            d={`4주 평균 ${musd(ma4(last))} 대비 ${pct(n(last.salesWeek) / n(ma4(last)) - 1, 0)}`} />
        </Card>
        <Card>
          <Kpi k="4주 이동평균" v={musd(ma4(last))}
            d={`주간값 진폭 최대 ${swing.toFixed(0)}배 — 추세는 이 선으로`} />
        </Card>
        <Card>
          <Kpi k="수주잔량" v={num(last.backlogFcl, 0)} unit=" FCL"
            d={`${musd(last.backlogUsd)} · 내재 단가 ${usd(backlogUnit)}/FCL`} />
        </Card>
        <Card>
          <Kpi k="수출 비중" v={pct(exportShare, 1)}
            d={`내수 ${pct(1 - exportShare, 1)} (${musd(last.domesticCum)})`} />
        </Card>
        <Card>
          <Kpi k="견적 마진 (물량가중)" v={pct(quoteStats.weightedMargin, 2)} tone="down"
            d={breakevenMargin
              ? `손익분기 ${pct(breakevenMargin.required, 1)} 필요 · 중앙값 ${pct(quoteStats.median, 2)} · 역마진 ${quoteStats.negative}건`
              : `중앙값 ${pct(quoteStats.median, 2)} · 역마진 ${quoteStats.negative}건`} />
        </Card>
      </div>

      <SecHead id="sec-repricing">재가격 대상 — 먼저 볼 것</SecHead>
      <div style={{ marginTop: 14 }}>
        <Card
          title={`저마진 견적 하위 ${worst.length}건`}
          sub="마진 오름차순. 붉은 행은 역마진, 노란 행은 손익분기 마진 미달."
          note={<>하위 {worst.length}건의 마진은 {pct(worst[0].margin, 2)} ~ {pct(worst[worst.length - 1].margin, 2)}
            {' '}구간에 있습니다. 원가는 <b>제조원가 + 기타비용</b>이며 판매가와의 차이가 곧 마진이라,
            케이스당 {usd(n(worst[0].sellPrice) - n(worst[0].totalCost), 2)} 수준의 차이로 수주 여부가 갈립니다.
            수량 열은 원본이 문자열(FCL 수)이라 금액 환산은 하지 않았습니다.</>}
        >
          <div className="tw" style={{ marginBottom: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>주차</th><th>거래처</th><th>품목</th><th>스펙</th>
                  <th className="n">수량</th><th className="n">제조원가</th>
                  <th className="n">총원가</th><th className="n">판매가</th><th className="n">마진</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((q, i) => (
                  <tr key={`${q.week}-${q.customer}-${i}`}
                    className={q.margin < 0 ? 'bad' : q.margin < (breakevenMargin?.required ?? 0.03) ? 'warn' : undefined}>
                    <td>{q.week}주</td>
                    <td>{q.customer}</td>
                    <td><span className="tag">{q.kind}</span> {q.fish}</td>
                    <td>{q.spec} · {q.style} · {q.media}</td>
                    <td className="n">{q.qty}</td>
                    <td className="n">{usd(q.mfgCost, 2)}</td>
                    <td className="n">{usd(q.totalCost, 2)}</td>
                    <td className="n">{usd(q.sellPrice, 2)}</td>
                    <td className="n">{pct(q.margin, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SecHead>판매 흐름</SecHead>
      <div className="grid g2">
        <Card
          span={2}
          title="주간 판매액과 4주 이동평균"
          sub="막대는 주간 실적, 선은 4주 이동평균. 선적 타이밍 때문에 주간값 자체로는 추세를 읽을 수 없다."
          note={<>최대 <b>{musd(peak.salesWeek)}</b>({peak.label}) 대 최소 {musd(trough.salesWeek)}({trough.label})
            — <b>{swing.toFixed(0)}배 차이</b>. 이동평균은 {musd(ma4(last))} 수준에서 크게 벗어나지 않아,
            판매 규모 자체는 흔들려도 평균 물량은 유지되고 있습니다.
            {rawCarry && <> 1주차 누적은 원본이 전년 이월분을 포함한 {musd(rawCarry.salesCumUsdRaw)}
              이라 주간값으로 재계산해 넣었습니다(원본은 salesCumUsdRaw 필드에 보존).</>}
            {' '}{meta.missingWeeks.join(',')}주차는 원본 결측이라 선이 끊깁니다.</>}
        >
          <Legend items={[
            { name: '주간 판매액', color: 'var(--cosmo-s1)', box: true },
            { name: '4주 이동평균', color: 'var(--cosmo-s2)' },
          ]} />
          <Chart
            data={weeklySeries} x="label" height={260} yFmt={m1} xInterval={2}
            series={[
              { key: 'salesWeek', name: '주간 판매액', color: 'var(--cosmo-s1)', type: 'bar', fmt: m2 },
              { key: 'salesMA4', name: '4주 이동평균', color: 'var(--cosmo-s2)', fmt: m2 },
            ]}
          />
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <Card
          title="품목별 누적 매출"
          sub={`${latest.week}주차 누적 기준. 매출액 순.`}
          note={<>상위 품목은 <b>{items[0].label} {musd(items[0].cumUsd)}</b>({pct(n(items[0].cumUsd) / itemTotal, 1)}),
            다음이 {items[1].label} {musd(items[1].cumUsd)}({pct(n(items[1].cumUsd) / itemTotal, 1)}).
            FCL 단위로 파는 {fclItems.length}종이 누적 매출의 <b>{pct(fclShare, 1)}</b>를 차지해,
            피쉬밀·부산물({pct(1 - fclShare, 1)})은 사실상 부수입입니다.</>}
        >
          <Chart
            data={mixRows} x="label" height={260} yFmt={m1} xInterval={0}
            series={[{ key: 'cumUsd', name: '누적 매출', color: 'var(--cosmo-s1)', type: 'bar', fmt: m2 }]}
          />
        </Card>

        <Card
          title="수출 vs 내수 누적"
          sub="누적 판매액을 수출·내수로 나눈 것. 내수는 축이 달라 오른쪽."
          note={<>수출 <b>{musd(last.exportCum)}</b> 대 내수 {musd(last.domesticCum)}로,
            내수 비중은 <b>{pct(1 - exportShare, 1)}</b>에 그칩니다. 환율·현지 수요와 무관하게
            손익은 수출 단가에 거의 전적으로 걸려 있습니다.
            {exDomSkipped.length > 0 && <> {exDomSkipped.join(',')}주차는 수출·내수 누적만 전년 이월 원본이
              그대로 남아 있어(누적 판매액보다 큼) 제외했습니다.</>}</>}
        >
          <Legend items={[
            { name: '수출 누적', color: 'var(--cosmo-s1)', box: true },
            { name: '내수 누적 (우축)', color: 'var(--cosmo-s3)' },
          ]} />
          <Chart
            data={exDom} x="label" height={260} yFmt={m1} y2Fmt={k0} xInterval={2}
            series={[
              { key: 'exportCum', name: '수출 누적', color: 'var(--cosmo-s1)', type: 'area', fmt: m2 },
              { key: 'domesticCum', name: '내수 누적', color: 'var(--cosmo-s3)', axis: 'right', fmt: m2 },
            ]}
          />
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <Card
          span={2}
          title="주력 품목 단가 추이"
          sub="FCL 단위 누적 평균 단가. 주간 단가가 아니라 누적이라 변동이 완만하다. 품목 간 차이가 작아 축은 0 이 아니라 데이터 범위에서 시작한다."
          note={<>{lbl('CATERING')} <b>{usd(priceNow[1])}</b> · {lbl('RETAIL')} {usd(priceNow[0])} ·
            {' '}{lbl('POUCH')} {usd(priceNow[2])}로, 최고·최저 품목 간 격차는 <b>{usd(spread)}/FCL</b>입니다.
            세 품목 모두 연초 이후 뚜렷한 상승 없이 <b>박스권</b>이라,
            원가가 오르면 단가로 흡수할 여지가 없습니다.</>}
        >
          <Legend items={priceItems.map((it, i) => ({ name: lbl(it), color: `var(--cosmo-s${i + 1})` }))} />
          <Chart
            data={priceRows} x="label" height={250} yFmt={k1} xInterval={2} domain={priceDomain}
            series={priceItems.map((it, i) => ({
              key: it, name: lbl(it), color: `var(--cosmo-s${i + 1})`, fmt: (v: number) => usd(v),
            }))}
          />
        </Card>
      </div>

      <SecHead>수주잔량</SecHead>
      <div className="grid g2">
        <Card
          title="수주잔량 추이"
          sub="미선적 수주 물량(FCL, 왼쪽)과 금액(USD, 오른쪽)."
          note={<>{weeklySeries[0].label} {num(weeklySeries[0].backlogFcl, 0)} FCL에서
            현재 <b>{num(last.backlogFcl, 0)} FCL</b>({musd(last.backlogUsd)})로
            {' '}{pct(n(last.backlogFcl) / n(weeklySeries[0].backlogFcl) - 1, 0)} 변동했습니다.
            물량과 금액이 거의 겹쳐 움직여, 잔량 증감이 단가 변화가 아니라 <b>물량 자체</b>에서 옵니다.
            잔량에 내재된 단가는 {usd(backlogUnit)}/FCL.</>}
        >
          <Legend items={[
            { name: '수주잔량 FCL', color: 'var(--cosmo-s1)' },
            { name: '수주잔량 금액 (우축)', color: 'var(--cosmo-s3)', dash: true },
          ]} />
          <Chart
            data={weeklySeries} x="label" height={250} yFmt={(v) => num(v, 0)} y2Fmt={m1} xInterval={2}
            series={[
              { key: 'backlogFcl', name: '수주잔량 FCL', color: 'var(--cosmo-s1)', fmt: fclFmt },
              { key: 'backlogUsd', name: '수주잔량 금액', color: 'var(--cosmo-s3)', axis: 'right', dash: true, fmt: m2 },
            ]}
          />
        </Card>

        <Card
          title="수주잔량 소진 속도"
          sub="막대는 주간 선적 FCL, 선은 잔량 ÷ 최근 4주 평균 선적 = 소진에 걸리는 주수(오른쪽)."
          note={<>현재 잔량은 최근 4주 평균 선적({num(fclMA4[fclMA4.length - 1], 1)} FCL/주) 기준
            <b> {wkFmt(n(coverNow))}</b>치입니다. 주간 선적이 {num(Math.max(...fclWeek), 0)} FCL까지 튀는 주가
            있는가 하면 {num(Math.min(...fclWeek), 0)} FCL에 그치는 주도 있어, 소진 주수는
            잔량보다 <b>선적 능력</b>에 좌우됩니다.</>}
        >
          <Legend items={[
            { name: '주간 선적 FCL', color: 'var(--cosmo-s4)', box: true },
            { name: '소진 주수 (우축)', color: 'var(--cosmo-s2)' },
          ]} />
          <Chart
            data={burnRows} x="label" height={250} yFmt={(v) => num(v, 0)} y2Fmt={(v) => v.toFixed(0) + '주'} xInterval={2}
            series={[
              { key: 'fclWeek', name: '주간 선적 FCL', color: 'var(--cosmo-s4)', type: 'bar', fmt: fclFmt },
              { key: 'coverWeeks', name: '소진 주수', color: 'var(--cosmo-s2)', axis: 'right', fmt: wkFmt },
            ]}
          />
        </Card>
      </div>

      <SecHead>견적 마진</SecHead>
      <div className="grid g2">
        <Card
          span={2}
          title="견적 마진 분포"
          sub={`마진값이 기록된 견적 ${quoteStats.withMargin}건의 구간별 건수. 붉은 막대가 위험 구간.`}
          note={<>분포가 <b>{pct(quoteStats.min, 2)} ~ {pct(quoteStats.max, 2)}</b> 안에 전부 들어가고
            중앙값은 <b>{pct(quoteStats.median, 2)}</b>입니다. 마진 {pct(riskHi, 0)} 미만이
            <b> {riskCount}건({pct(riskCount / quoteStats.withMargin, 0)})</b>, 그중 역마진이 {quoteStats.negative}건.
            {breakevenMargin && <>경고색 기준은 임의의 3%가 아니라 <b>손익분기 마진
              {' '}{pct(breakevenMargin.required, 1)}</b>(판관 {pct(breakevenMargin.sgaRate, 2)} + 이자
              {' '}{pct(breakevenMargin.interestRate, 2)})입니다 — 이 선을 넘어야 영업외비용까지 덮습니다.
              구간 경계상 {pct(riskHi, 0)} 미만까지 칠했습니다. </>}
            건수보다 물량이 실질에 가깝습니다 — <b>물량가중 마진 {pct(quoteStats.weightedMargin, 2)}</b>,
            손익분기 미달 물량이 {pct(quoteStats.below3FclShare, 0)}로 건수 기준
            {' '}{pct(quoteStats.below3 / quoteStats.withMargin, 0)}보다 나쁩니다.
            상한 {pct(quoteStats.max, 2)}는 손익분기를 넘지만 그런 건이 드뭅니다 — 손익분기 이상 견적은 <b>{aboveBe.count}건 / 물량 {pct(aboveBe.share, 1)}</b>뿐이라 고마진 건으로 저마진을 상쇄할 여지가 없습니다.</>}
        >
          <Legend items={[
            { name: `마진 ${pct(riskHi, 0)} 미만`, color: 'var(--cosmo-bad)', box: true },
            { name: `마진 ${pct(riskHi, 0)} 이상`, color: 'var(--cosmo-s1)', box: true },
          ]} />
          <Chart
            data={bucketRows} x="label" height={240} yFmt={(v) => num(v, 0)} xInterval={0}
            series={[
              { key: 'risk', name: `마진 ${pct(riskHi, 0)} 미만`, color: 'var(--cosmo-bad)', type: 'bar', stackId: 'q', fmt: cntFmt },
              { key: 'safe', name: `마진 ${pct(riskHi, 0)} 이상`, color: 'var(--cosmo-s1)', type: 'bar', stackId: 'q', fmt: cntFmt },
            ]}
          />
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <Callout kind="warn" label="지금 읽히는 것">
          판매 규모는 버티고 있습니다. 누적 <b>{musd(last.salesCum)}</b>, 4주 평균 {musd(ma4(last))},
          수주잔량 {num(last.backlogFcl, 0)} FCL은 최근 4주 선적 속도로 <b>{wkFmt(n(coverNow))}</b>치 물량입니다.
          문제는 그 물량의 가격입니다. 주력 {fclItems.length}종이 매출의 {pct(fclShare, 1)}인데 단가는 박스권이고,
          잔량 내재 단가는 {usd(backlogUnit)}/FCL로 지금 팔리는 수준과 크게 다르지 않습니다.
          여기에 신규 견적의 <b>물량가중 마진이 {pct(quoteStats.weightedMargin, 2)}</b>, 최고치도 {pct(quoteStats.max, 2)}에 그칩니다.
          {breakevenMargin && <>손익분기에 필요한 {pct(breakevenMargin.required, 1)}에 못 미치는 물량이 {pct(quoteStats.below3FclShare, 0)}입니다. </>}
          수주가 늘면 적자 폭은 줄지만(현 판가도 공헌이익은 양(+)), <b>이 판가 수준으로는 흑자 전환에 이르지 못합니다</b> —
          판가 전가나 단위원가 인하가 함께 가야 합니다.
          이 숫자들은 선적 기준이라 회계 인식(손익 보드)과는 시점 차이가 있습니다.
        </Callout>
      </div>
    </>
  )
}
