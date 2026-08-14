'use client'
import Chart, { Legend } from '../Chart'
import { PageHead, Card, Kpi, Callout, SecHead } from '../Ui'
import {
  monthly, monthlySeries, monthlyUnitCost, latest, latestMonth, meta, monthWeeks,
  musd, usd, pct, n, breakevenMargin, annualCompare,
} from '@/lib/data/cosmo'

const m1 = (v: number) => (v / 1e6).toFixed(1) + 'M'
const m2 = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M'
const p1 = (v: number) => (v * 100).toFixed(1) + '%'
const d0 = (v: number) => '$' + Math.round(v).toLocaleString('en-US')
const dk = (v: number) => '$' + (v / 1000).toFixed(1) + 'k'
const mt = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' MT'
const div = (a: number, b: number) => (b ? a / b : null)

/** 값 폭이 좁은 계열은 0 기준 축에서 한 선으로 뭉갠다 — 데이터 범위 ±pad 로 자른 축 */
const tightDomain = (vals: (number | null | undefined)[], pad = 0.3): [number, number] => {
  const v = vals.filter((x): x is number => typeof x === 'number')
  const lo = Math.min(...v)
  const hi = Math.max(...v)
  const m = (hi - lo) * pad
  return [lo - m, hi + m]
}
const TOP = 3   // 표 note 에서 요약할 상위 계정 수

/** 원가 계정 → 원가군. lib/data 의 material/labor/energy/other 묶음과 같은 기준. */
const GROUP: Record<string, string> = {
  Fish: '재료', Media: '재료', Ingredients: '재료', Can: '재료', End: '재료',
  'Flat Pouch': '재료', Others: '재료',
  'Salary (DL)': '노무', 'Benefits (DL)': '노무', 'Salary (IDL)': '노무', 'Benefits (IDL)': '노무',
  Electricity: '에너지', RFO: '에너지', Diesel: '에너지', Water: '에너지',
  Consumables: '기타', 'Repair/Maintenance': '기타', Depreciation: '기타',
}

export default function Profit() {
  const M = latestMonth
  const gpMarginYtd = div(n(M.gpYtd), n(M.revenueYtd))
  const netMarginYtd = div(n(M.netYtd), n(M.revenueYtd))
  const yoyNet = n(M.net) - n(M.netPrev)
  const lossMonths = monthlySeries.filter((m) => n(m.net) < 0).length
  const gpLossMonths = monthlySeries.filter((m) => n(m.gp) < 0).length
  const maxRevMonth = monthlySeries.reduce((a, b) => (n(a.revenue) >= n(b.revenue) ? a : b))
  /* interest·sga 는 월별 값이라 YTD 는 직접 합산 */
  const interestYtd = monthlySeries.reduce((a, m) => a + n(m.interest), 0)
  const sgaYtd = monthly.reduce((a, m) => a + n(m.sga), 0)

  /* 손익(월) 과 운영(주) 의 시차 */
  const lastProfitWeek = monthWeeks(M.month).at(-1)?.week ?? 0
  const lagWeeks = latest.week - lastProfitWeek

  /* 최신월 원가 계정 — 금액 내림차순 */
  const costRows = Object.entries(M.costLines).sort((a, b) => n(b[1]) - n(a[1]))
  const costTotal = costRows.reduce((a, [, v]) => a + n(v), 0)
  const topShare = div(n(costRows[0]?.[1]), costTotal)
  /* 원가 계정 합계와 매출원가의 월별 괴리 — 재고 변동·계정 마감 시점 차이 */
  const cosGapMax = Math.max(...monthly.map((m) =>
    Math.abs(n(div(n(m.cos) - Object.values(m.costLines).reduce((a, b) => a + n(b), 0), n(m.cos))))))

  /* 1MT당 원가 최고·최저 월 */
  const ucSorted = [...monthlyUnitCost]
    .filter((u) => u.costPerMt != null)
    .sort((a, b) => n(a.costPerMt) - n(b.costPerMt))
  const ucLo = ucSorted.at(0)
  const ucHi = ucSorted.at(-1)
  /* 고정비 전가 — 처리량 최저월 vs 최고월의 MT당 에너지+노무비 */
  const byMt = [...monthlyUnitCost].filter((u) => u.rawMt != null).sort((a, b) => n(a.rawMt) - n(b.rawMt))
  const mtLo = byMt.at(0)
  const mtHi = byMt.at(-1)
  const fixLo = n(mtLo?.energyPerMt) + n(mtLo?.laborPerMt)
  const fixHi = n(mtHi?.energyPerMt) + n(mtHi?.laborPerMt)

  /* 월별 주차 수 — 월 경계가 주 단위로 근사되는 정도 */
  const wkPerMonth = monthlySeries.map((m) => monthWeeks(m.month).length)
  const wkMin = Math.min(...wkPerMonth)
  const wkMax = Math.max(...wkPerMonth)
  const thinMonth = monthlySeries[wkPerMonth.indexOf(wkMin)]

  /* 원어가(SJ) 변화 */
  const sjRows = monthlySeries.filter((m) => m.fishPriceSJ != null)
  const sjFirst = sjRows.at(0)
  const sjLast = sjRows.at(-1)
  const sjChange = div(n(sjLast?.fishPriceSJ) - n(sjFirst?.fishPriceSJ), n(sjFirst?.fishPriceSJ))

  /* 사업부 구성 — CBU = Cannery + Fishmeal, 매출 = CBU + FBU */
  const fbuShare = div(n(M.revenue_fbu), n(M.revenue))
  const fishmealShare = div(n(M.revenue_fishmeal), n(M.revenue))
  const cannShares = monthlySeries.map((m) => n(div(n(m.cannery), n(m.revenue))))
  const cannLo = Math.min(...cannShares)
  const cannHi = Math.max(...cannShares)

  return (
    <>
      <PageHead
        title="손익 · 원가"
        lead={`매출은 ${monthlySeries.length}개월 내내 나오는데 순손익은 ${lossMonths}개월 모두 음(−)입니다. 규모가 아니라 원가 구조를 봅니다 — 어느 계정이, 그리고 처리량 대비 단위 원가가 어디서 무너지는지. 손익은 ${M.month}월(${lastProfitWeek}주차)까지, 운영은 ${latest.week}주차까지라 두 축 사이에 ${lagWeeks}주 시차가 있습니다.`}
        meta={[
          `손익 1~${M.month}월 (회계 인식)`,
          `운영 ~${latest.week}주차 (${latest.periodEnd ?? '—'})`,
          `원가 계정 ${costRows.length}개`,
          `결측 주차 ${meta.missingWeeks.join(',') || '없음'}`,
        ]}
      />

      <SecHead>누적 손익 (1~{M.month}월)</SecHead>
      <div className="grid g4">
        <Card>
          <Kpi k="누적 매출" v={musd(M.revenueYtd)} d={`월평균 ${musd(div(n(M.revenueYtd), monthlySeries.length))}`} />
        </Card>
        <Card>
          <Kpi k="누적 매출총이익" v={musd(M.gpYtd)} tone={n(M.gpYtd) < 0 ? 'down' : 'flat'}
            d={`매출총이익 음(−) ${gpLossMonths}/${monthlySeries.length}개월`} />
        </Card>
        <Card>
          <Kpi k="누적 영업손익" v={musd(M.opYtd)} tone={n(M.opYtd) < 0 ? 'down' : 'up'}
            d={`누적 판관비 ${musd(sgaYtd)} 차감 후`} />
        </Card>
        <Card>
          <Kpi k="누적 순손익" v={musd(M.netYtd)} tone={n(M.netYtd) < 0 ? 'down' : 'up'}
            d={`${lossMonths}/${monthlySeries.length}개월 적자`} />
        </Card>
        <Card>
          <Kpi k="매출총이익률 (YTD)" v={pct(gpMarginYtd, 2)}
            d={`매출총이익 ${musd(M.gpYtd)} ÷ 매출 ${musd(M.revenueYtd)}`} />
        </Card>
        <Card>
          <Kpi k="순이익률 (YTD)" v={pct(netMarginYtd, 2)} tone={n(netMarginYtd) < 0 ? 'down' : 'up'}
            d={`매출총이익률과 ${pct(n(gpMarginYtd) - n(netMarginYtd), 2)} 차이 — 판관비·금융비용`} />
        </Card>
        <Card>
          <Kpi k={`전년 동월 대비 순손익 (${M.month}월)`} v={musd(yoyNet)} tone={yoyNet < 0 ? 'down' : 'up'}
            d={`2026 ${musd(M.net)} vs 2025 ${musd(M.netPrev)}`} />
        </Card>
        <Card>
          <Kpi k="누적 이자비용" v={musd(interestYtd)} tone="down"
            d={`매출총이익 ${musd(M.gpYtd)}의 ${pct(div(Math.abs(interestYtd), n(M.gpYtd)), 0)}`} />
        </Card>
      </div>

      {annualCompare && (
        <>
          <SecHead>전년 확정 결산 대비</SecHead>
          <div className="grid g2">
            <Card
              span={2}
              title={`${annualCompare.year}년 확정 결산 vs 2026 상반기`}
              sub="대시보드의 모든 금액은 USD 기준이다. 장기추이 보드의 연간 계열과 같은 통화라 이어서 볼 수 있다."
              note={<>매출 진행률 <b>{pct(annualCompare.revenueProgress, 1)}</b>는
                {annualCompare.months}/12 = {pct(annualCompare.months / 12, 0)} 기준에
                {' '}{n(annualCompare.revenueProgress) < annualCompare.months / 12 ? <b>미달</b> : '부합'}합니다.
                문제는 속도가 아니라 마진입니다 — <b>매출총이익률 {pct(annualCompare.priorGpRate, 2)}
                → {pct(annualCompare.gpRate, 2)}</b>로 절반 아래로 내려앉았고,
                순이익률은 {pct(annualCompare.priorNetRate, 2)} → <b>{pct(annualCompare.netRate, 2)}</b>입니다.
                {annualCompare.year}년은 순이익 {musd(annualCompare.priorNet)}로 <b>간신히 흑자</b>였는데,
                그 얇은 마진이 올해 사라진 구조입니다.
                <br />단순 연환산({annualCompare.months}개월 × {(12 / annualCompare.months).toFixed(1)})으로는
                매출 {musd(annualCompare.revenueAnnualized)}({pct(annualCompare.revenueYoY, 1)}),
                순손익 {musd(annualCompare.netAnnualized)}입니다 —
                <b>계절성을 보정하지 않은 단순 배수</b>라 하반기 성수기를 반영하지 못합니다. 방향만 보십시오.</>}
            >
              <div className="tw">
                <table>
                  <thead>
                    <tr><th>항목</th><th className="n">{annualCompare.year} 확정(연간)</th>
                      <th className="n">2026 1~{annualCompare.months}월</th>
                      <th className="n">진행률</th><th className="n">비율 비교</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>매출</td>
                      <td className="n">{musd(annualCompare.priorRevenue)}</td>
                      <td className="n">{musd(annualCompare.revenueYtd)}</td>
                      <td className="n">{pct(annualCompare.revenueProgress, 1)}</td>
                      <td className="n">—</td>
                    </tr>
                    <tr className="warn">
                      <td>매출총이익</td>
                      <td className="n">{musd(annualCompare.priorGp)}</td>
                      <td className="n">{musd(annualCompare.gpYtd)}</td>
                      <td className="n">{pct(n(annualCompare.gpYtd) / n(annualCompare.priorGp), 1)}</td>
                      <td className="n">{pct(annualCompare.priorGpRate, 2)} → <b>{pct(annualCompare.gpRate, 2)}</b></td>
                    </tr>
                    <tr className="bad">
                      <td>순손익</td>
                      <td className="n">{musd(annualCompare.priorNet)}</td>
                      <td className="n">{musd(annualCompare.netYtd)}</td>
                      <td className="n">—</td>
                      <td className="n">{pct(annualCompare.priorNetRate, 2)} → <b>{pct(annualCompare.netRate, 2)}</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

        </>
      )}

      <SecHead id="sec-margin">매출은 나오는데 왜 적자인가</SecHead>
      <div className="grid g2">
        <Card
          title="월별 손익 추이"
          sub="매출(막대, 왼쪽 축)과 매출총이익률·순이익률(선, 오른쪽 축 %). 두 선 모두 0 근처에 붙어 있다."
          note={<>매출은 {maxRevMonth.label} {musd(maxRevMonth.revenue)}까지 오르지만 순이익률은 <b>{lossMonths}개월 모두 음(−)</b>이고, 매출총이익률도 {gpLossMonths}개월은 마이너스입니다. 매출 최고월의 순이익률조차 {pct(maxRevMonth.netMargin, 2)}라 <b>규모로는 해결되지 않는 구조</b>입니다. 매출총이익률과 순이익률의 YTD 격차 <b>{pct(n(gpMarginYtd) - n(netMarginYtd), 2)}</b>는 판관비·금융비용 몫이라, 매출총이익률이 그만큼은 나와야 손익분기입니다.</>}
        >
          <Legend items={[
            { name: '매출', color: 'var(--cosmo-s1)', box: true },
            { name: '매출총이익률', color: 'var(--cosmo-s4)' },
            { name: '순이익률', color: 'var(--cosmo-s2)' },
          ]} />
          <Chart
            data={monthlySeries} x="label" height={250} zeroLine
            yFmt={m1} y2Fmt={p1}
            refLines={[{ y: 0, axis: 'right' },
              ...(breakevenMargin ? [{ y: breakevenMargin.required, axis: 'right' as const,
                color: 'var(--cosmo-bad)', label: `손익분기 ${pct(breakevenMargin.required, 1)}` }] : [])]}
            series={[
              { key: 'revenue', name: '매출', color: 'var(--cosmo-s1)', type: 'bar', fmt: m2 },
              { key: 'gpMargin', name: '매출총이익률', color: 'var(--cosmo-s4)', axis: 'right', fmt: p1 },
              { key: 'netMargin', name: '순이익률', color: 'var(--cosmo-s2)', axis: 'right', fmt: p1 },
            ]}
          />
        </Card>

        <Card
          title="사업부별 매출 구성"
          sub="누적 막대는 Cannery + Fishmeal + FBU. CBU 선은 Cannery+Fishmeal 소계이므로 막대에 겹쳐 쌓지 않았다."
          note={<>매출 = CBU + FBU 이고 CBU = Cannery + Fishmeal 이라 네 계열을 모두 쌓으면 이중계상됩니다({M.month}월 검산 잔차 {usd(n(M.revenue) - (n(M.revenue_cannery) + n(M.revenue_fishmeal) + n(M.revenue_fbu)))}). Cannery가 매월 매출의 <b>{pct(cannLo, 0)}~{pct(cannHi, 0)}</b>를 차지해 손익은 사실상 Cannery 원가가 결정합니다. {M.month}월 기준 Fishmeal {pct(fishmealShare, 1)}, FBU {pct(fbuShare, 1)}로 <b>믹스를 바꿔 적자를 덮을 규모가 아닙니다</b>.</>}
        >
          <Legend items={[
            { name: 'Cannery', color: 'var(--cosmo-s1)', box: true },
            { name: 'Fishmeal', color: 'var(--cosmo-s3)', box: true },
            { name: 'FBU', color: 'var(--cosmo-s5)', box: true },
            { name: 'CBU 소계', color: 'var(--cosmo-s4)' },
          ]} />
          <Chart
            data={monthlySeries} x="label" height={250} yFmt={m1}
            series={[
              { key: 'cannery', name: 'Cannery', color: 'var(--cosmo-s1)', type: 'bar', stackId: 'rev', fmt: m2 },
              { key: 'fishmeal', name: 'Fishmeal', color: 'var(--cosmo-s3)', type: 'bar', stackId: 'rev', fmt: m2 },
              { key: 'fbu', name: 'FBU', color: 'var(--cosmo-s5)', type: 'bar', stackId: 'rev', fmt: m2 },
              { key: 'cbu', name: 'CBU 소계', color: 'var(--cosmo-s4)', fmt: m2 },
            ]}
          />
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <Card
          title="원가 구조 — 재료 · 노무 · 에너지 · 기타"
          sub="월별 원가 계정을 네 묶음으로 쌓았다. 재료비가 원가의 대부분을 차지한다."
          note={<>{M.month}월 원가 계정 합계 <b>{musd(costTotal)}</b> 중 최대 계정 하나가 <b>{pct(topShare, 1)}</b>({costRows[0]?.[0]})입니다. 노무·에너지·기타를 다 합쳐도 재료비에 못 미치므로, <b>원가 절감의 지렛대는 사실상 원어 매입가</b>입니다. 단, 계정 합계와 매출원가는 월별로 최대 <b>{pct(cosGapMax, 1)}</b> 어긋납니다(재고 변동·계정 마감 시점 차이). 이 차트는 수준이 아니라 <b>구성 변화</b>로 읽어야 합니다.</>}
        >
          <Legend items={[
            { name: '재료비', color: 'var(--cosmo-s1)', box: true },
            { name: '노무비', color: 'var(--cosmo-s3)', box: true },
            { name: '에너지', color: 'var(--cosmo-s2)', box: true },
            { name: '기타', color: 'var(--cosmo-s5)', box: true },
          ]} />
          <Chart
            data={monthlySeries} x="label" height={250} yFmt={m1}
            series={[
              { key: 'material', name: '재료비', color: 'var(--cosmo-s1)', type: 'bar', stackId: 'cost', fmt: m2 },
              { key: 'labor', name: '노무비', color: 'var(--cosmo-s3)', type: 'bar', stackId: 'cost', fmt: m2 },
              { key: 'energy', name: '에너지', color: 'var(--cosmo-s2)', type: 'bar', stackId: 'cost', fmt: m2 },
              { key: 'other', name: '기타', color: 'var(--cosmo-s5)', type: 'bar', stackId: 'cost', fmt: m2 },
            ]}
          />
        </Card>

        <Card
          title="원어 1MT당 원가"
          sub="매출원가 ÷ 해당 월 원어처리량(CBU+FBU). 총원가·원어비는 왼쪽 축, 에너지·노무비는 오른쪽 축."
          note={<>처리량 최저 {mtLo?.label}({mt(n(mtLo?.rawMt))})의 MT당 에너지+노무비는 <b>{d0(fixLo)}</b>, 최고 {mtHi?.label}({mt(n(mtHi?.rawMt))})은 {d0(fixHi)} — <b>{(fixLo / Math.max(1, fixHi)).toFixed(1)}배</b> 차이입니다. 매입가와 무관한 고정비가 <b>처리량이 줄면 MT당 원가로 전가</b>된다는 뜻입니다. MT당 총원가는 {ucLo?.label} {d0(n(ucLo?.costPerMt))} ~ {ucHi?.label} {d0(n(ucHi?.costPerMt))} 범위인데, 분자인 매출원가는 판매 기준·분모는 처리 기준이라 <b>재고 변동이 큰 달은 총원가 선이 튑니다</b>. 분모는 해당 월에 속한 주차(주차 종료일 기준) 합이라 월 경계가 주 단위로 근사됩니다 — 월별 {wkMin}~{wkMax}주차{wkMin !== wkMax ? `, 결측 ${meta.missingWeeks.join(',') || '없음'}주가 걸린 ${thinMonth?.label}은 ${wkMin}주치만 집계돼 MT당 원가가 과대` : ''}.</>}
        >
          <Legend items={[
            { name: 'MT당 총원가', color: 'var(--cosmo-s1)' },
            { name: 'MT당 원어비', color: 'var(--cosmo-s4)' },
            { name: 'MT당 에너지', color: 'var(--cosmo-s3)' },
            { name: 'MT당 노무비', color: 'var(--cosmo-s5)' },
          ]} />
          <Chart
            data={monthlyUnitCost} x="label" height={250} yFmt={dk} y2Fmt={d0}
            series={[
              { key: 'costPerMt', name: 'MT당 총원가', color: 'var(--cosmo-s1)', fmt: d0 },
              { key: 'fishPerMt', name: 'MT당 원어비', color: 'var(--cosmo-s4)', fmt: d0 },
              { key: 'energyPerMt', name: 'MT당 에너지', color: 'var(--cosmo-s3)', axis: 'right', fmt: d0 },
              { key: 'laborPerMt', name: 'MT당 노무비', color: 'var(--cosmo-s5)', axis: 'right', fmt: d0 },
            ]}
          />
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <Card
          title="원어가(Skipjack) vs 매출총이익률"
          sub="원어 매입단가(왼쪽 축 $/MT)와 매출총이익률(오른쪽 축 %). 축이 다르므로 방향만 본다. 단가 축은 변동 폭이 좁아 0 이 아니라 데이터 범위에서 시작한다."
          note={<>Skipjack 단가는 {sjFirst?.label} {d0(n(sjFirst?.fishPriceSJ))} → {sjLast?.label} <b>{d0(n(sjLast?.fishPriceSJ))}</b>로 <b>{pct(sjChange, 1)}</b> 올랐고, 같은 기간 매출총이익률은 {pct(sjFirst?.gpMargin, 2)} → <b>{pct(sjLast?.gpMargin, 2)}</b>입니다. 판가가 원어가 상승을 따라가지 못한다는 뜻입니다. 월 6개 관측치라 상관계수를 말할 표본은 아니고, <b>방향의 역행</b>만 읽습니다.</>}
        >
          <Legend items={[
            { name: '원어가 SJ ($/MT)', color: 'var(--cosmo-s3)' },
            { name: '매출총이익률', color: 'var(--cosmo-s4)' },
          ]} />
          <Chart
            data={monthlySeries} x="label" height={250} yFmt={d0} y2Fmt={p1}
            domain={tightDomain(monthlySeries.map((r) => r.fishPriceSJ))}
            refLines={[{ y: 0, axis: 'right' }]}
            series={[
              { key: 'fishPriceSJ', name: '원어가 SJ', color: 'var(--cosmo-s3)', fmt: d0 },
              { key: 'gpMargin', name: '매출총이익률', color: 'var(--cosmo-s4)', axis: 'right', fmt: p1 },
            ]}
          />
        </Card>

        <Card
          title="전년 동월 대비 순손익"
          sub="2026년 월별 순손익과 전년 동월(2025) 순손익. 0선 기준."
          note={<>{M.month}월 순손익은 <b>{musd(M.net)}</b>, 전년 동월은 {musd(M.netPrev)}로 <b>{musd(yoyNet)}</b> 악화됐습니다. 전년에는 흑자였던 달이 {monthlySeries.filter((m) => n(m.netPrev) > 0).length}개인데 2026년은 <b>{lossMonths}개월 전부 적자</b>라, 계절성이 아니라 <b>구조 변화</b>로 보입니다.</>}
        >
          <Legend items={[
            { name: '2026 순손익', color: 'var(--cosmo-s2)', box: true },
            { name: '2025 동월', color: 'var(--cosmo-s3)', box: true },
          ]} />
          <Chart
            data={monthlySeries} x="label" height={250} zeroLine yFmt={m1}
            series={[
              { key: 'net', name: '2026 순손익', color: 'var(--cosmo-s2)', type: 'bar', fmt: m2 },
              { key: 'netPrev', name: '2025 동월', color: 'var(--cosmo-s3)', type: 'bar', fmt: m2 },
            ]}
          />
        </Card>
      </div>

      <SecHead>원가 계정 상세 ({M.month}월)</SecHead>
      <div className="grid">
        <Card
          title={`${M.month}월 원가 계정 ${costRows.length}개`}
          sub="금액 내림차순. 구성비는 계정 합계 대비 비중."
          note={<>계정 합계 <b>{musd(costTotal)}</b> vs 매출원가 {musd(M.cos)} — 차이 <b>{usd(n(M.cos) - costTotal)}</b>({pct(div(n(M.cos) - costTotal, n(M.cos)), 1)}). 계정은 발생 기준, 매출원가는 재고 변동을 반영해 서로 맞지 않습니다. 상위 {Math.min(TOP, costRows.length)}개 계정({costRows.slice(0, TOP).map(([k]) => k).join(', ')})이 합계의 <b>{pct(div(costRows.slice(0, TOP).reduce((a, [, v]) => a + n(v), 0), costTotal), 1)}</b>를 차지합니다.</>}
        >
          <div className="tw" style={{ marginBottom: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>계정</th>
                  <th>구분</th>
                  <th className="n">금액</th>
                  <th className="n">구성비</th>
                </tr>
              </thead>
              <tbody>
                {costRows.map(([k, v]) => (
                  <tr key={k}>
                    <td>{k}</td>
                    <td><span className="tag">{GROUP[k] ?? '미분류'}</span></td>
                    <td className="n">{usd(v)}</td>
                    <td className="n">{pct(div(n(v), costTotal), 1)}</td>
                  </tr>
                ))}
                <tr>
                  <td><b>합계</b></td>
                  <td />
                  <td className="n"><b>{usd(costTotal)}</b></td>
                  <td className="n">{pct(div(costTotal, costTotal), 1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <Callout kind="bad" label="지금 읽히는 것">
          1~{M.month}월 매출 <b>{musd(M.revenueYtd)}</b>에서 매출총이익은 {musd(M.gpYtd)}(<b>{pct(gpMarginYtd, 2)}</b>)뿐이고,
          여기서 판관비와 이자비용을 빼면 순손실 <b>{musd(M.netYtd)}</b>({pct(netMarginYtd, 2)})입니다.
          누적 이자비용만 <b>{musd(interestYtd)}</b>로 매출총이익 {musd(M.gpYtd)}를 이미 {pct(div(Math.abs(interestYtd), n(M.gpYtd)), 0)} 잠식합니다.
          매출총이익률과 순이익률의 격차 {pct(n(gpMarginYtd) - n(netMarginYtd), 2)}가 고정적으로 붙으므로,
          매출총이익률이 그 수준을 넘지 못하는 한 매출이 늘어도 적자입니다.
          원가의 압도적 비중은 재료비이고 그중 {costRows[0]?.[0]} 한 계정이 <b>{pct(topShare, 1)}</b>인데,
          Skipjack 단가는 {pct(sjChange, 1)} 올랐습니다. 여기에 처리량이 적은 달({mtLo?.label}, {mt(n(mtLo?.rawMt))})은
          MT당 에너지+노무비가 {d0(fixLo)}로 최고월 대비 {(fixLo / Math.max(1, fixHi)).toFixed(1)}배까지 올라 <b>고정비가 단위 원가로 전가</b>됩니다.
          즉 <b>원어가 상승분을 판가에 전가하지 못한 것</b>과 <b>처리량 부족으로 단위 원가가 오른 것</b>이 겹쳤습니다.
          손익 데이터는 {M.month}월까지이고 운영 지표는 {latest.week}주차까지라, {M.month}월 이후 처리량이 회복됐는지는 이 보드에서 확인되지 않습니다.
        </Callout>
      </div>
    </>
  )
}
