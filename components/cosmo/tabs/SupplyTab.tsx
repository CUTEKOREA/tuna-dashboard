'use client'
import { C } from '../palette'
import Chart, { Legend } from '../Chart'
import { PageHead, Card, Kpi, Callout, SecHead } from '../Ui'
import { weeks, weeklySeries, latest, meta, musd, usd, num, pct, n } from '@/lib/data/cosmo'

const m1 = (v: number) => (v / 1e6).toFixed(1) + 'M'
const m2 = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M'
const perMt = (v: number) => '$' + Math.round(v).toLocaleString('en-US') + '/MT'
const mtF = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' MT'
const dayF = (v: number) => v.toFixed(0) + '일'
const wkF = (v: number) => v.toFixed(1) + '주'

/* 자재 소진 계산 대상 — 원어·제품을 뺀 부자재 3군 */
const MAT = ['공관', 'ENDS', '주입액']

/** 값 폭이 좁은 계열은 0 기준 축에서 한 선으로 뭉갠다 — 데이터 범위 ±pad 로 자른 축 */
const tightDomain = (vals: (number | null | undefined)[], pad = 0.3): [number, number] => {
  const v = vals.filter((x): x is number => typeof x === 'number')
  const lo = Math.min(...v)
  const hi = Math.max(...v)
  const m = (hi - lo) * pad
  return [lo - m, hi + m]
}

export default function Supply() {
  const p = latest.purchase
  const inv = latest.inventory
  const last = weeklySeries[weeklySeries.length - 1]
  const prev = weeklySeries[weeklySeries.length - 2]
  const first = weeklySeries[0]

  /* 구매 */
  const buyWeeks = weeklySeries.filter((s) => s.purchaseWeekUnit != null).length
  const lastBuy = [...weeklySeries].reverse().find((s) => s.purchaseWeekUnit != null)
  const firstBuy = weeklySeries.find((s) => s.purchaseWeekUnit != null)
  const cumRise = n(first.purchaseCumUnit) ? n(last.purchaseCumUnit) / n(first.purchaseCumUnit) - 1 : null
  const weekRise = n(firstBuy?.purchaseWeekUnit)
    ? n(lastBuy?.purchaseWeekUnit) / n(firstBuy?.purchaseWeekUnit) - 1
    : null
  const otherMt = n(p.cumMt) - n(p.panofiCumMt)

  /* 어종별 누적 구매단가 — 파노피(PS) 라인만. SJ / YF/BE */
  const speciesPrice = weeks.map((w) => {
    const price = (sp: string) =>
      w.purchase.lines.find((l) => l.supplier === '파노피' && l.species === sp)?.cumPrice ?? null
    return { label: `${w.week}주`, sj: price('SJ'), yb: price('YF/BE') }
  })
  const spLast = speciesPrice[speciesPrice.length - 1]

  /* 원어재고 소진일수 — 바닥을 찍은 주차 */
  const covers = weeklySeries.filter((s) => s.rawCoverDays != null)
  const minCover = covers.reduce((a, b) => (n(b.rawCoverDays) < n(a.rawCoverDays) ? b : a), covers[0])

  /* 재고 구성 — 최신 주 group 별 평가액 합계 */
  const invGroups = (() => {
    const m = new Map<string, { group: string; items: number; usd: number }>()
    inv.lines.forEach((l) => {
      const g = m.get(l.group) ?? { group: l.group, items: 0, usd: 0 }
      g.items += 1
      g.usd += n(l.endUsd)
      m.set(l.group, g)
    })
    return [...m.values()].sort((a, b) => b.usd - a.usd)
  })()
  const invTotal = invGroups.reduce((a, g) => a + g.usd, 0)
  const rawGroup = invGroups.find((g) => g.group === '원어')
  const matTotal = invGroups.filter((g) => MAT.includes(g.group)).reduce((a, g) => a + g.usd, 0)

  /* 자재 소진 예상 — endQty ÷ 최근 4주 평균 주간 출고량 */
  const recent = weeks.slice(-4)
  const burn = inv.lines
    .filter((l) => MAT.includes(l.group))
    .map((l) => {
      const outs = recent.map((w) =>
        n(w.inventory.lines.find((x) => x.group === l.group && x.item === l.item)?.outQty))
      const avgOut = outs.length ? outs.reduce((a, b) => a + b, 0) / outs.length : 0
      return { ...l, avgOut, weeksLeft: avgOut > 0 ? n(l.endQty) / avgOut : null }
    })
    .sort((a, b) => (a.weeksLeft ?? Number.MAX_VALUE) - (b.weeksLeft ?? Number.MAX_VALUE))
  const burnBad = burn.filter((b) => b.weeksLeft != null && b.weeksLeft < 4)
  const burnWarn = burn.filter((b) => b.weeksLeft != null && b.weeksLeft >= 4 && b.weeksLeft < 8)
  const tightest = burn.find((b) => b.weeksLeft != null)

  /* 제품재고 vs 수주잔량 */
  const stockRatio = weeklySeries.map((s) => ({
    ...s,
    stockRatio: n(s.backlogUsd) > 0 ? n(s.productStockUsd) / n(s.backlogUsd) : null,
  }))
  const ratioLast = stockRatio[stockRatio.length - 1].stockRatio

  return (
    <>
      <PageHead
        title="구매 · 재고"
        lead={`원어를 얼마에 사고 있는지, 재고가 며칠분인지, 자재가 원어보다 먼저 떨어지지 않는지를 봅니다. 재고는 ${latest.week}주차 마감 기준이고, 자재 소진은 최근 ${recent.length}주 출고 속도로 환산했습니다.`}
        meta={[
          `주간 ${meta.weekRange[0]}~${meta.weekRange[1]}주 (결측 ${meta.missingWeeks.join(',') || '없음'})`,
          `매입 발생 ${buyWeeks}/${weeklySeries.length}주`,
          `재고 품목 ${inv.lines.length}종 · ${invGroups.length}군`,
          `기준 ${latest.periodEnd ?? '-'}`,
        ]}
      />

      <SecHead>핵심 수치</SecHead>
      <div className="grid g4">
        <Card>
          <Kpi k="누적 원어구매량" v={num(p.cumMt, 0)} unit=" MT"
            d={`주간 ${num(p.weekMt, 0)}MT · ${buyWeeks}개 주에서 매입`} />
        </Card>
        <Card>
          <Kpi k="누적 구매금액" v={musd(p.cumUsd)}
            d={`주간 ${musd(p.weekUsd)}`} />
        </Card>
        <Card>
          <Kpi k="누적 평균단가" v={usd(p.cumUnit)} unit=" /MT"
            tone={n(cumRise) > 0 ? 'down' : 'flat'}
            d={`연초 ${usd(first.purchaseCumUnit)} 대비 ${pct(cumRise)}`} />
        </Card>
        <Card>
          <Kpi k="최신 주간 구매단가" v={usd(lastBuy?.purchaseWeekUnit)} unit=" /MT"
            tone={n(lastBuy?.purchaseWeekUnit) > n(last.purchaseCumUnit) ? 'down' : 'up'}
            d={`${lastBuy?.week}주 · 누적평균 대비 ${pct(n(lastBuy?.purchaseWeekUnit) / n(last.purchaseCumUnit) - 1)}`} />
        </Card>
        <Card>
          <Kpi k="파노피 의존도" v={pct(last.panofiShare, 2)}
            d={`파노피 ${num(p.panofiCumMt, 0)}MT · 타선사 ${num(otherMt, 0)}MT`} />
        </Card>
        <Card>
          <Kpi k="원어재고" v={num(last.rawStockMt, 0)} unit=" MT"
            tone={n(last.rawStockMt) >= n(prev?.rawStockMt) ? 'up' : 'down'}
            d={`전주 대비 ${num(n(last.rawStockMt) - n(prev?.rawStockMt), 0)}MT`} />
        </Card>
        <Card>
          <Kpi k="재고 소진일수" v={last.rawCoverDays == null ? '-' : dayF(last.rawCoverDays)}
            tone={n(last.rawCoverDays) < 15 ? 'down' : n(last.rawCoverDays) < 25 ? 'flat' : 'up'}
            d={`일 처리량 ${num(latest.production?.CBU?.cumDaily, 0)}MT 기준`} />
        </Card>
        <Card>
          <Kpi k="총재고 평가액" v={musd(inv.totalEndUsd)}
            d={`원어 ${pct(n(rawGroup?.usd) / invTotal, 0)} · 자재 ${pct(matTotal / invTotal, 0)}`} />
        </Card>
      </div>

      <SecHead>원어를 얼마에 사고 있나</SecHead>
      <div className="grid g2">
        <Card
          title="원어 구매단가 추이"
          sub="누적 평균단가와 그 주에 실제로 지불한 주간 단가. 단위 USD/MT. 변동 폭이 좁아 축은 0 이 아니라 데이터 범위에서 시작한다."
          note={<>누적 평균단가는 연초 <b>{usd(first.purchaseCumUnit)}</b>에서 <b>{usd(last.purchaseCumUnit)}</b>로 {pct(cumRise)} {n(cumRise) >= 0 ? '상승' : '하락'}했습니다.
            누적선은 과거 매입을 섞어 완만해 보이지만, 최근 주간 단가는 <b>{usd(lastBuy?.purchaseWeekUnit)}</b>로 첫 매입가({usd(firstBuy?.purchaseWeekUnit)}) 대비 <b>{pct(weekRise)}</b>,
            누적평균보다 {pct(n(lastBuy?.purchaseWeekUnit) / n(last.purchaseCumUnit) - 1)} 높습니다. 앞으로 살 물량은 누적선이 아니라 이 가격에 붙습니다.
            매입이 없는 주는 주간 단가가 없어 선이 끊깁니다({weeklySeries.length}주 중 {buyWeeks}주만 매입).</>}
        >
          <Legend items={[
            { name: '누적 평균단가', color: C.s1 },
            { name: '주간 구매단가', color: C.s3 },
          ]} />
          <Chart
            data={weeklySeries} x="label" height={250} xInterval={3}
            yFmt={(v) => '$' + Math.round(v).toLocaleString('en-US')}
            domain={tightDomain(weeklySeries.flatMap((s) => [s.purchaseCumUnit, s.purchaseWeekUnit]))}
            series={[
              { key: 'purchaseCumUnit', name: '누적 평균단가', color: C.s1, fmt: perMt },
              { key: 'purchaseWeekUnit', name: '주간 구매단가', color: C.s3, fmt: perMt },
            ]}
          />
        </Card>

        <Card
          title="어종별 누적 구매단가"
          sub="파노피 매입분(PS) 기준. SJ(가다랑어)와 YF/BE(황다랑어·눈다랑어)의 누적 단가. 두 어종 차이가 작아 축은 0 이 아니라 데이터 범위에서 시작한다."
          note={<>{latest.week}주 기준 SJ <b>{usd(spLast?.sj)}</b>, YF/BE <b>{usd(spLast?.yb)}</b>로 YF/BE가 {usd(n(spLast?.yb) - n(spLast?.sj))} 비쌉니다.
            두 어종 모두 연초 대비 올랐고(SJ {pct(n(spLast?.sj) / n(speciesPrice[0]?.sj) - 1)}, YF/BE {pct(n(spLast?.yb) / n(speciesPrice[0]?.yb) - 1)}),
            누적단가라 평평한 구간은 그 주에 매입이 없었다는 뜻입니다. 물량은 SJ가 대부분이라 전체 평균단가는 SJ 곡선을 따라갑니다.</>}
        >
          <Legend items={[
            { name: 'SJ', color: C.s1 },
            { name: 'YF/BE', color: C.s4 },
          ]} />
          <Chart
            data={speciesPrice} x="label" height={250} xInterval={3}
            yFmt={(v) => '$' + Math.round(v).toLocaleString('en-US')}
            domain={tightDomain(speciesPrice.flatMap((r) => [r.sj, r.yb]))}
            series={[
              { key: 'sj', name: 'SJ', color: C.s1, fmt: perMt },
              { key: 'yb', name: 'YF/BE', color: C.s4, fmt: perMt },
            ]}
          />
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <Card
          title="파노피 의존도"
          sub="누적 매입량 중 파노피 선사분 비중. 나머지는 타선사·기타선사."
          note={<>전 기간 <b>{pct(last.panofiShare, 2)}</b> 수준입니다. 누적 {num(p.cumMt, 0)}MT 중 타선사분은 <b>{num(otherMt, 0)}MT</b>뿐으로,
            사실상 단일 공급처입니다. 가격 협상력·조달 리스크가 한 곳에 묶여 있고, 위 단가 상승분을 타 공급처로 검증할 기준선이 없습니다.
            비중이 낮았던 구간도 {pct(Math.min(...weeklySeries.map((s) => n(s.panofiShare) || 1)), 2)}가 최저입니다.</>}
        >
          <Legend items={[{ name: '파노피 비중', color: C.rank, box: true }]} />
          <Chart
            data={weeklySeries} x="label" height={250} xInterval={3}
            yFmt={(v) => pct(v, 1)}
            series={[
              { key: 'panofiShare', name: '파노피 비중', color: C.rank, type: 'area', fmt: (v) => pct(v, 2) },
            ]}
          />
        </Card>

        <Card
          title="원어재고와 소진일수"
          sub="원어 3품목(SJ·YF/BE·FBU) 재고량과 그 재고로 며칠 돌릴 수 있는지."
          note={<>소진일수 = <b>원어재고 MT ÷ CBU 누적 일 처리량</b>({num(latest.production?.CBU?.cumDaily, 0)}MT/일)이라 가동 속도가 바뀌면 같은 재고도 일수가 달라집니다.
            현재 {num(last.rawStockMt, 0)}MT · <b>{last.rawCoverDays == null ? '-' : dayF(last.rawCoverDays)}</b>분이지만,
            {minCover?.week}주에는 <b>{minCover?.rawCoverDays == null ? '-' : dayF(minCover.rawCoverDays)}</b>까지 떨어졌습니다.
            {' '}{covers.filter((s) => n(s.rawCoverDays) < 15).length}개 주가 15일선 아래였고, 대형 매입 한 번으로 30일대를 회복하는 톱니 패턴입니다.</>}
        >
          <Legend items={[
            { name: '원어재고 (MT, 좌)', color: C.s5, box: true },
            { name: '소진일수 (일, 우)', color: C.s3 },
            { name: '15일선', color: C.danger, dash: true },
          ]} />
          <Chart
            data={weeklySeries} x="label" height={250} xInterval={3}
            yFmt={(v) => (v / 1000).toFixed(1) + 'k'} y2Fmt={(v) => v.toFixed(0) + 'd'}
            refLines={[{ y: 15, axis: 'right', color: C.danger }]}
            series={[
              { key: 'rawStockMt', name: '원어재고', color: C.s5, type: 'area', fmt: mtF },
              { key: 'rawCoverDays', name: '소진일수', color: C.s3, axis: 'right', fmt: dayF },
            ]}
          />
        </Card>
      </div>

      <SecHead id="sec-material">재고에 무엇이 묶여 있나</SecHead>
      <div className="grid g2">
        <Card
          title="재고 구성"
          sub={`${latest.week}주차 마감 재고 평가액을 품목군별로 합산. 금액 기준.`}
          note={<>총 <b>{musd(invTotal)}</b> 중 제품(CBU+FBU)이 {pct((n(invGroups.find((g) => g.group === '제품(CBU)')?.usd) + n(invGroups.find((g) => g.group === '제품(FBU)')?.usd)) / invTotal, 0)},
            원어가 <b>{pct(n(rawGroup?.usd) / invTotal, 0)}</b>입니다. 자재 3군(공관·ENDS·주입액)은 합쳐도 {musd(matTotal)}({pct(matTotal / invTotal, 0)})로 금액은 작지만,
            <b>이 5%가 없으면 나머지 95%가 제품으로 못 나갑니다</b>. 금액이 아니라 소진 속도로 봐야 하는 이유입니다.</>}
        >
          <div className="tw" style={{ marginBottom: 0 }}>
            <table>
              <thead>
                <tr><th>품목군</th><th className="n">품목수</th><th className="n">평가액</th><th className="n">비중</th></tr>
              </thead>
              <tbody>
                {invGroups.map((g) => (
                  <tr key={g.group}>
                    <td>{g.group}{MAT.includes(g.group) && <span className="tag" style={{ marginLeft: 6 }}>자재</span>}</td>
                    <td className="n">{g.items}</td>
                    <td className="n">{usd(g.usd)}</td>
                    <td className="n">{pct(g.usd / invTotal, 1)}</td>
                  </tr>
                ))}
                <tr>
                  <td><b>합계</b></td>
                  <td className="n"><b>{inv.lines.length}</b></td>
                  <td className="n"><b>{usd(invTotal)}</b></td>
                  <td className="n"><b>{pct(1, 1)}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="자재 소진 예상"
          sub={`잔여 재고 ÷ 최근 ${recent.length}주(${recent[0]?.week}~${latest.week}주) 평균 주간 출고량 = 남은 주수. 4주 미만 적색, 8주 미만 황색.`}
          note={<>4주 안에 바닥나는 품목이 <b>{burnBad.length}개</b>, 8주 안이 {burnWarn.length}개입니다.
            {tightest && <> 가장 급한 건 {tightest.group} {tightest.item}으로 잔여 {num(tightest.endQty, 0)}{tightest.unit}에
              주간 출고 {num(tightest.avgOut, 0)}{tightest.unit} - <b>{tightest.weeksLeft == null ? '-' : wkF(tightest.weeksLeft)}</b>분입니다.</>}
            {' '}원어는 {last.rawCoverDays == null ? '-' : dayF(last.rawCoverDays)}분이 남았는데 자재가 먼저 끊기면 그 재고는 제품이 되지 못합니다.
            최근 {recent.length}주 출고가 0인 품목은 분모가 없어 &lsquo;-&rsquo;로 두었습니다(입고 중단분일 수도, 미사용분일 수도 있어 별도 확인 필요).</>}
        >
          <div className="tw" style={{ marginBottom: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>구분</th><th>품목</th><th className="n">잔여재고</th>
                  <th className="n">주간출고(4주평균)</th><th className="n">남은 주수</th><th className="n">평가액</th>
                </tr>
              </thead>
              <tbody>
                {burn.map((b) => (
                  <tr key={`${b.group}-${b.item}`}
                    className={b.weeksLeft == null ? '' : b.weeksLeft < 4 ? 'bad' : b.weeksLeft < 8 ? 'warn' : ''}>
                    <td>{b.group}</td>
                    <td>{b.item}</td>
                    <td className="n">{num(b.endQty, 0)} <small>{b.unit}</small></td>
                    <td className="n">{b.avgOut > 0 ? num(b.avgOut, 0) : '-'}</td>
                    <td className="n">{b.weeksLeft == null ? '-' : wkF(b.weeksLeft)}</td>
                    <td className="n">{usd(b.endUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <Card
          title="제품재고 vs 수주잔량"
          sub="제품(CBU+FBU) 재고 평가액과 미선적 수주잔량 금액, 그리고 그 배수(재고÷잔량)."
          note={<>현재 제품재고 <b>{musd(last.productStockUsd)}</b>, 수주잔량 <b>{musd(last.backlogUsd)}</b>로 배수는 <b>{ratioLast == null ? '-' : ratioLast.toFixed(2) + '배'}</b>입니다.
            잔량의 {pct(ratioLast, 0)}만 재고로 덮이므로 나머지는 앞으로 생산해야 채웁니다.
            연초 배수는 {stockRatio[0]?.stockRatio == null ? '-' : stockRatio[0].stockRatio.toFixed(2) + '배'}였고, 수주가 {latest.week}주까지 늘면서 배수는 낮아졌습니다.
            단, 재고는 원가 평가액이고 잔량은 판매가라 배수 1배가 곧 완전 충당을 뜻하지는 않습니다.</>}
        >
          <Legend items={[
            { name: '제품재고 (좌)', color: C.s4 },
            { name: '수주잔량 (좌)', color: C.s3 },
            { name: '배수 (우)', color: C.s2, dash: true },
          ]} />
          <Chart
            data={stockRatio} x="label" height={250} xInterval={3}
            yFmt={m1} y2Fmt={(v) => v.toFixed(1) + 'x'}
            series={[
              { key: 'productStockUsd', name: '제품재고', color: C.s4, fmt: m2 },
              { key: 'backlogUsd', name: '수주잔량', color: C.s3, fmt: m2 },
              { key: 'stockRatio', name: '배수', color: C.s2, axis: 'right', dash: true, fmt: (v) => v.toFixed(2) + '배' },
            ]}
          />
        </Card>

        <Card
          title="총재고 추이"
          sub="전 품목군 마감 평가액. 원어 매입 타이밍에 따라 계단식으로 움직입니다."
          note={<>연초 {musd(first.inventoryUsd)}에서 {latest.week}주 <b>{musd(last.inventoryUsd)}</b>({pct(n(last.inventoryUsd) / n(first.inventoryUsd) - 1)}).
            {minCover && <> 원어가 바닥났던 {minCover.week}주에는 {musd(minCover.inventoryUsd)}까지 내려갔다가 매입 재개로 되돌아왔습니다.</>}
            {' '}금액은 연초 대비 늘었고 구성도 원어 쪽으로 이동했습니다 - 단가가 {pct(cumRise)} 오른 만큼 같은 MT라도 평가액이 커집니다.</>}
        >
          <Legend items={[{ name: '총재고 평가액', color: C.rank, box: true }]} />
          <Chart
            data={weeklySeries} x="label" height={250} xInterval={3} yFmt={m1}
            series={[{ key: 'inventoryUsd', name: '총재고', color: C.rank, type: 'area', fmt: m2 }]}
          />
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <Callout kind="bad" label="지금 읽히는 것">
          원어 매입가는 오르는 방향입니다. 누적 평균단가가 {pct(cumRise)} 올랐고, 최근 주간 단가 <b>{usd(lastBuy?.purchaseWeekUnit)}</b>는
          누적평균보다 {pct(n(lastBuy?.purchaseWeekUnit) / n(last.purchaseCumUnit) - 1)} 높아 앞으로 투입될 원어의 원가는 지금 손익에 반영된 것보다 비쌉니다.
          매입의 <b>{pct(last.panofiShare, 2)}</b>가 파노피 한 곳이라 이 가격을 견제할 대안 견적도 없습니다.
          재고는 두 종류의 위험이 다릅니다. 원어는 {num(last.rawStockMt, 0)}MT · {last.rawCoverDays == null ? '-' : dayF(last.rawCoverDays)}분으로 지금은 여유가 있지만
          {minCover?.week}주에 {minCover?.rawCoverDays == null ? '-' : dayF(minCover.rawCoverDays)}까지 떨어진 이력이 있어 매입이 한 번 밀리면 즉시 가동이 걸립니다.
          반면 자재는 이미 걸려 있습니다 - <b>{burnBad.length}개 품목이 4주 미만</b>
          {tightest && <>, 그중 {tightest.group} {tightest.item}은 {tightest.weeksLeft == null ? '-' : wkF(tightest.weeksLeft)}분</>}.
          자재 금액은 총재고의 {pct(matTotal / invTotal, 0)}에 불과하지만, 결품이 나면 원어 {musd(rawGroup?.usd)}와 제품 생산이 함께 멈춥니다.
          발주 우선순위는 금액이 아니라 이 잔여 주수 순서여야 합니다.
        </Callout>
      </div>
    </>
  )
}
