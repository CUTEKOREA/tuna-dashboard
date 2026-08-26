'use client'
import { C, SERIES } from '../palette'
import Chart, { Legend } from '../Chart'
import { PageHead, Card, Kpi, Callout, SecHead } from '../Ui'
import { musd, num, pct, n, latest, latestMonth } from '@/lib/data/cosmo'
import {
  exportMeta, totals, concentration, byMarket, byBuyer, byInvoiceParty,
  bySpecGroup, byMedia, marketSpecCross, specGroups, buyerBand,
  pricePosition, pricePositionMaterial, repricingUpside, ghanaShare, aggregateShare, ghanaTrend,
  competitors, benchYear, tradeMeta, exportChecks, exportCheckFail, ANNUALIZE, sillaShare,
  exportYoY, exportSources,
} from '@/lib/data/cosmo-market'

const m1 = (v: number) => (v / 1e6).toFixed(1) + 'M'
const m2 = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M'
const kg2 = (v: number) => '$' + v.toFixed(2) + '/kg'
const k1 = (v: number) => '$' + (v / 1000).toFixed(1) + '천'
const p1 = (v: number) => (v * 100).toFixed(1) + '%'
const S = SERIES

export default function Market() {
  const top = byMarket.slice(0, 8)
  // 최저·최고는 매출 2% 이상 시장에서만 — 수 FCL 짜리 시장이 대표값이 되면 오해를 준다
  const M = pricePositionMaterial
  const worst = M.reduce((a, p) => (p.vsMarket < a.vsMarket ? p : a), M[0])
  const best = M.reduce((a, p) => (p.vsMarket > a.vsMarket ? p : a), M[0])
  const above = pricePosition.filter((p) => p.vsMarket >= 0).length
  const tiny = pricePosition.filter((p) => !p.material)
  const posRows = pricePosition.map((p) => ({
    label: p.market, cosmo: p.cosmoUsdKg, market: p.marketUsdKg, ghana: p.ghanaUsdKg,
  }))
  const gapRows = pricePosition.map((p) => ({ label: p.market, gap: p.vsMarket }))
  const trendRows = ghanaTrend
  const trendMarkets = ghanaShare.slice(0, 4).map((g) => g.market)

  return (
    <>
      <PageHead
        title="시장 · 바이어"
        lead={`CBU(캔) 수출 컨테이너 원장 ${exportMeta.containerRows}건을 시장·바이어·규격으로 집계하고, 각국 참치캔 수입통계(HS 160414)와 대면 우리 단가가 어디에 있는지 봅니다. 제값을 받고 있는지가 이 보드의 질문입니다.`}
        meta={[
          `${totals.fcl.toFixed(0)} FCL · ${musd(totals.amountUsd)} (1~5월 선적)`,
          `바이어 ${exportMeta.buyerCount}곳 · 시장 ${exportMeta.marketCount}개`,
          `수입통계 기준연도 ${benchYear} · 수집 ${tradeMeta.collected}`,
          `원장 ${exportSources.map((x) => `${x.year} ${x.period}`).join(' + ')}`,
          'CBU 수출만 - 내수·FBU 제외',
        ]}
      />

      <SecHead>핵심 수치</SecHead>
      <div className="grid g4">
        <Card>
          <Kpi k="수출 실적" v={musd(totals.amountUsd)}
            d={`${totals.fcl.toFixed(0)} FCL · 평균 ${k1(n(totals.usdPerFcl))}/FCL`} />
        </Card>
        <Card>
          <Kpi k="실현 단가" v={kg2(n(totals.usdPerKg))} tone="down"
            d={`FCL당 ${num(totals.qtyKg / totals.fcl, 0)}kg 환산 · kg 커버리지 ${pct(totals.kgCoverage, 0)}`} />
        </Card>
        <Card>
          <Kpi k="시장 평균 대비" v={p1(worst.vsMarket)} tone="down"
            d={`최저 ${worst.market} · 최고 ${best.market} ${p1(best.vsMarket)} · 평균 이상 ${above}/${pricePosition.length}개 시장 (매출 2%↑ 기준)`} />
        </Card>
        <Card>
          <Kpi k="바이어 집중도" v={pct(concentration.top3BuyerShare, 1)}
            tone={concentration.top3BuyerShare > 0.45 ? 'down' : 'flat'}
            d={`Top3 · Top5 ${pct(concentration.top5BuyerShare, 1)} · HHI ${num(concentration.buyerHHI, 0)}`} />
        </Card>
        <Card>
          <Kpi k="최대 바이어" v={pct(concentration.topBuyerShare, 1)}
            d={concentration.topBuyer ?? '-'} />
        </Card>
        <Card>
          <Kpi k="시장 집중도" v={num(concentration.marketHHI, 0)} unit=" HHI"
            tone={concentration.marketHHI > 2500 ? 'down' : 'flat'}
            d={`${byMarket[0].key}+${byMarket[1].key} ${pct(byMarket[0].share + byMarket[1].share, 1)} · 2500↑ = 고집중`} />
        </Card>
        <Card>
          <Kpi k="가나 유럽 점유율" v={pct(aggregateShare.ghanaInMarket, 2)}
            d={`대상 ${aggregateShare.markets}개 시장 수입 ${musd(aggregateShare.marketUsd)} 중`} />
        </Card>
        <Card>
          <Kpi k="신라교역 경유" v={pct(sillaShare, 1)}
            d="인보이스 상대 기준 - 매출채권의 실질 상대" />
        </Card>
      </div>

      <SecHead>제값을 받고 있는가</SecHead>
      <div className="grid g2">
        <Card
          title="단가 포지션 - COSMO vs 시장 평균 vs 가나 평균"
          sub={`kg당 실현 단가. 시장 평균은 ${benchYear}년 해당국 HS 160414 수입 총액 ÷ 총 물량.`}
          note={<>COSMO 평균 <b>{kg2(n(totals.usdPerKg))}</b>. 수입통계가 확보된 {pricePosition.length}개 시장 중
            <b> {above}곳만 시장 평균 이상</b>입니다. 주력 시장(매출 2% 이상) 가운데 최저는
            <b> {worst.market} {p1(worst.vsMarket)}</b>입니다
            {tiny.length > 0 && <> - {tiny.map((t) => t.market).join('·')}는 물량이 {num(tiny[0].fcl, 0)} FCL 수준이라
              단가가 한두 건에 좌우돼 대표값에서 제외했습니다</>}.
            {worst.market}는 시장 단가가 {kg2(worst.marketUsdKg)}로 가장 높은 축인데 우리는 {kg2(worst.cosmoUsdKg)}에
            팔고 있어, 프리미엄 시장에서 저가 포지션을 잡고 있습니다.
            가나 평균과 비교해도 대부분 아래라 <b>산지 요인이 아니라 우리 판가</b>의 문제로 읽힙니다.</>}
        >
          <Legend items={[
            { name: 'COSMO', color: C.cosmo, box: true },
            { name: '시장 평균', color: C.s4, box: true },
            { name: '가나 평균', color: C.s3, box: true },
          ]} />
          <Chart
            data={posRows} x="label" height={270} yFmt={(v) => '$' + v.toFixed(0)}
            series={[
              { key: 'cosmo', name: 'COSMO', color: C.cosmo, type: 'bar', fmt: kg2 },
              { key: 'market', name: '시장 평균', color: C.s4, type: 'bar', fmt: kg2 },
              { key: 'ghana', name: '가나 평균', color: C.s3, type: 'bar', fmt: kg2 },
            ]}
          />
        </Card>

        <Card
          title="시장 평균 대비 격차"
          sub="음(−)이면 시장 평균보다 싸게 팔고 있다는 뜻."
          note={<>모든 시장의 격차를 메워 시장 평균 단가까지 올렸다면 같은 물량에서
            <b> 약 {musd(repricingUpside.upsideUsd)}</b>(매출의 {pct(repricingUpside.ratio, 1)})를 더 받았을 계산입니다.
            <b>다만 이건 이론적 상한</b>입니다 - 판가를 올리면 물량이 그대로 유지되지 않고,
            우리 제품 믹스(규격·사양)가 시장 평균 믹스와 다르기 때문에 격차의 일부는 믹스 차이입니다.
            재가격 여지의 크기를 가늠하는 용도로만 읽어야 합니다.</>}
        >
          <Chart
            data={gapRows} x="label" height={270} zeroLine yFmt={(v) => (v * 100).toFixed(0) + '%'}
            series={[{
              key: 'gap', name: '시장 평균 대비', color: C.danger, type: 'bar', fmt: p1,
              signColor: C.sign,
            }]}
          />
        </Card>
      </div>

      <SecHead>시장 구조</SecHead>
      <div className="grid g2">
        <Card
          title="시장별 매출 구성"
          sub="양륙항 기준. 매출액 순."
          note={<><b>{byMarket[0].key} {pct(byMarket[0].share, 1)} + {byMarket[1].key} {pct(byMarket[1].share, 1)}
            = {pct(byMarket[0].share + byMarket[1].share, 1)}</b>로 두 시장에 몰려 있습니다.
            시장 HHI {num(concentration.marketHHI, 0)}은 고집중 기준선(2500)에 근접합니다.
            {byMarket[0].key}은 무관세 경쟁에 직접 노출된 시장이라, 이 집중이 곧 리스크입니다.</>}
        >
          <Chart
            data={top.map((m) => ({ label: m.key, amountUsd: m.amountUsd }))}
            x="label" height={250} yFmt={m1} xInterval={0}
            series={[{ key: 'amountUsd', name: '매출', color: C.rank, type: 'bar', fmt: m2 }]}
          />
        </Card>

        <Card
          title="규격군 × 시장"
          sub="상위 5개 시장의 규격군별 매출. 두 축이 서로 다른 바이어에 걸려 있는지 본다."
          note={<>주력은 <b>{bySpecGroup[0].key} {pct(bySpecGroup[0].share, 1)}</b>입니다.
            시장과 규격이 서로 다른 조합에 걸려 있으면 한 축이 무너져도 다른 축은 남습니다 -
            현재 {byMarket[0].key}은 소형 리테일에, {byMarket[1].key}은 캐터링에 치우쳐 있어
            충격이 같은 지점에 겹치지는 않습니다.</>}
        >
          <Legend items={specGroups.slice(0, 5).map((g, i) => ({ name: g, color: S[i % S.length], box: true }))} />
          <Chart
            data={marketSpecCross} x="label" height={250} yFmt={m1} xInterval={0}
            series={specGroups.slice(0, 5).map((g, i) => ({
              key: g, name: g, color: S[i % S.length], type: 'bar' as const, stackId: 'a', fmt: m2,
            }))}
          />
        </Card>
      </div>

      <SecHead>바이어</SecHead>
      <div className="grid g2">
        <Card
          title="바이어 Top10"
          sub={`전체 ${exportMeta.buyerCount}곳. 매출 비중과 FCL당 단가.`}
          note={<>Top3가 <b>{pct(concentration.top3BuyerShare, 1)}</b>, 최대 바이어 하나가
            <b> {pct(concentration.topBuyerShare, 1)}</b>입니다. 바이어 HHI {num(concentration.buyerHHI, 0)}는
            시장 HHI({num(concentration.marketHHI, 0)})보다 낮아 <b>바이어 분산이 시장 분산보다 낫습니다</b> -
            거래처는 43곳으로 흩어져 있지만 그 43곳이 소수 시장에 몰려 있는 구조입니다.</>}
        >
          <div className="tw">
            <table>
              <thead>
                <tr><th>바이어</th><th className="n">FCL</th><th className="n">매출</th>
                  <th className="n">비중</th><th className="n">$천/FCL</th></tr>
              </thead>
              <tbody>
                {byBuyer.slice(0, 10).map((b) => (
                  <tr key={b.key} className={b.share >= 0.2 ? 'bad' : b.share >= 0.1 ? 'warn' : undefined}>
                    <td>{b.key}</td>
                    <td className="n">{num(b.fcl, 0)}</td>
                    <td className="n">{musd(b.amountUsd)}</td>
                    <td className="n">{pct(b.share, 1)}</td>
                    <td className="n">{b.usdPerFcl ? (b.usdPerFcl / 1000).toFixed(1) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="단가 밴드 - 재가격 우선순위"
          sub="물량 3 FCL 이상 바이어. FCL당 단가 오름차순 - 위쪽이 재가격 1순위."
          note={<>평균 {k1(n(totals.usdPerFcl))}/FCL 대비 밴드 폭이 넓습니다
            ({k1(buyerBand[0].usdPerFcl)} ~ {k1(buyerBand[buyerBand.length - 1].usdPerFcl)}).
            같은 공장에서 같은 제품이 나가는데 단가가 이만큼 벌어진다는 건
            <b> 협상 여지가 바이어마다 다르다</b>는 뜻이고, 아래쪽 바이어가 손익분기 미달 물량의 실체입니다.</>}
        >
          <div className="tw">
            <table>
              <thead>
                <tr><th>바이어</th><th className="n">FCL</th><th className="n">$천/FCL</th><th className="n">평균 대비</th></tr>
              </thead>
              <tbody>
                {buyerBand.slice(0, 10).map((b) => {
                  const d = b.usdPerFcl / n(totals.usdPerFcl) - 1
                  return (
                    <tr key={b.buyer} className={d < -0.08 ? 'bad' : d < -0.03 ? 'warn' : undefined}>
                      <td>{b.buyer}</td>
                      <td className="n">{num(b.fcl, 0)}</td>
                      <td className="n">{(b.usdPerFcl / 1000).toFixed(1)}</td>
                      <td className="n">{p1(d)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SecHead>전년 대비 구조 변화</SecHead>
      {exportYoY && (
        <div className="grid g2">
          <Card
            title={`시장 구성 - ${exportYoY.years.join('·')}년 대비`}
            sub="비중(구성비)은 기간 길이와 무관해 그대로 비교한다. 금액은 연환산해야 비교된다."
            note={<>가장 큰 변화는 <b>{exportYoY.markets[0].key} {pct(exportYoY.markets[0].priorShare, 1)}
              → {pct(exportYoY.markets[0].share, 1)}({p1(exportYoY.markets[0].deltaPp)}p)</b>입니다.
              집중 리스크로 지목했던 시장의 비중이 실제로 내려갔고, 그만큼
              {' '}{exportYoY.markets.filter((m) => m.deltaPp > 0).slice(0, 2).map((m) => m.key).join('·')} 쪽으로 분산됐습니다.
              시장 HHI도 {num(exportYoY.priorMarketHHI, 0)} → {num(concentration.marketHHI, 0)}
              ({exportYoY.hhiDelta >= 0 ? '+' : ''}{num(exportYoY.hhiDelta, 0)})로 움직였습니다.
              <br />연환산 매출은 {musd(exportYoY.annualizedUsd)}로 전년 {musd(exportYoY.priorTotals.amountUsd)} 대비
              <b> {pct(exportYoY.revenueYoY, 1)}</b>, FCL당 단가는
              {' '}{k1(n(exportYoY.priorUsdPerFcl))} → {k1(n(totals.usdPerFcl))}({pct(exportYoY.unitYoY, 1)})입니다.
              <b>물량은 비슷한데 단가가 내려간</b> 구조입니다.</>}
          >
            <Legend items={[
              { name: `${exportYoY.years.join('·')} 비중`, color: C.s3, box: true },
              { name: '2026 비중', color: C.s1, box: true },
            ]} />
            <Chart
              data={exportYoY.markets.slice(0, 8).map((m) => ({
                label: m.key, prior: m.priorShare, now: m.share,
              }))}
              x="label" height={250} yFmt={(v) => (v * 100).toFixed(0) + '%'} xInterval={0}
              series={[
                { key: 'prior', name: `${exportYoY.years.join('·')}`, color: C.s3, type: 'bar', fmt: p1 },
                { key: 'now', name: '2026', color: C.s1, type: 'bar', fmt: p1 },
              ]}
            />
          </Card>

          <Card
            title="바이어 구성 변화"
            sub="Top10 기준. 전년에 없던 바이어와 사라진 바이어를 함께 본다."
            note={<>Top3 집중도가 <b>{pct(exportYoY.priorTop3BuyerShare, 1)} → {pct(concentration.top3BuyerShare, 1)}
              ({p1(exportYoY.top3Delta)}p)</b>로 낮아졌습니다.
              최대 바이어 {concentration.topBuyer}의 비중이
              {' '}{pct(exportYoY.buyers[0].priorShare, 1)} → {pct(exportYoY.buyers[0].share, 1)}로 내려간 것이 주된 이유입니다.
              {exportYoY.gone.length > 0 && <> 전년 대비 빠진 바이어는
                {' '}<b>{exportYoY.gone.length}곳</b>({exportYoY.gone.slice(0, 3).map((g) => g.key.split(' ')[0]).join('·')})
                이며 합계 {pct(exportYoY.gone.reduce((a, g) => a + g.priorShare, 0), 1)} 몫이었습니다.</>}
              {' '}집중이 완화된 것은 방어에 유리하지만, 동시에 <b>단가가 함께 내려간</b> 점은 분산의 대가일 수 있습니다.</>}
          >
            <div className="tw">
              <table>
                <thead>
                  <tr><th>바이어</th><th className="n">{exportYoY.years.join('·')}</th>
                    <th className="n">2026</th><th className="n">변화</th><th className="n">$천/FCL</th></tr>
                </thead>
                <tbody>
                  {exportYoY.buyers.map((b) => (
                    <tr key={b.key} className={Math.abs(b.deltaPp) >= 0.05 ? 'warn' : undefined}>
                      <td className="nowrap">{b.key}{b.isNew && <span className="tag" style={{ marginLeft: 6 }}>신규</span>}</td>
                      <td className="n">{b.priorShare ? pct(b.priorShare, 1) : '-'}</td>
                      <td className="n">{pct(b.share, 1)}</td>
                      <td className={`n ${b.deltaPp >= 0 ? 'up' : 'down'}`}>{p1(b.deltaPp)}p</td>
                      <td className="n">{b.usdPerFcl ? (b.usdPerFcl / 1000).toFixed(1) : '-'}</td>
                    </tr>
                  ))}
                  {exportYoY.gone.slice(0, 3).map((g) => (
                    <tr key={g.key} className="bad">
                      <td className="nowrap">{g.key} <span className="tag" style={{ marginLeft: 4 }}>이탈</span></td>
                      <td className="n">{pct(g.priorShare, 1)}</td>
                      <td className="n">-</td>
                      <td className="n down">{p1(-g.priorShare)}p</td>
                      <td className="n">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <SecHead>전체 시장 대비 우리 자리</SecHead>
      <div className="grid g2">
        <Card
          title={`가나 점유율 - ${benchYear}년`}
          sub="해당국 참치캔 수입(HS 160414) 총액 중 가나發 비중. 무역통계 내부 값이라 신뢰도가 높다."
          note={<>가나는 {aggregateShare.markets}개 시장 수입 {musd(aggregateShare.marketUsd)} 중
            <b> {musd(aggregateShare.ghanaUsd)}({pct(aggregateShare.ghanaInMarket, 2)})</b>를 공급합니다.
            COSMO 연환산 실적({musd(aggregateShare.cosmoAnnualUsd)})을 대면 <b>가나 물량의 약
            {' '}{pct(aggregateShare.cosmoInGhana, 0)}</b>가 COSMO 몫입니다 -
            가나에는 다른 참치캔 공장도 있으므로 이 비율이 곧 우리 위상입니다.</>}
        >
          <div className="tw">
            <table>
              <thead>
                <tr><th>시장</th><th className="n">시장 수입</th><th className="n">가나發</th>
                  <th className="n">가나 점유(금액)</th><th className="n">가나 점유(물량)</th></tr>
              </thead>
              <tbody>
                {ghanaShare.map((g) => (
                  <tr key={g.market} className={g.shareValue >= 0.08 ? 'warn' : undefined}>
                    <td>{g.market}</td>
                    <td className="n">{musd(g.marketValueUsd)}</td>
                    <td className="n">{musd(g.ghanaValueUsd)}</td>
                    <td className="n">{pct(g.shareValue, 2)}</td>
                    <td className="n">{g.shareQty != null ? pct(g.shareQty, 2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="가나 점유율 추이"
          sub={`상위 ${trendMarkets.length}개 시장. 금액 기준.`}
          note={<>우리 자리가 커지는지 줄어드는지를 보는 축입니다. 시장 규모가 커져도
            점유율이 내려가면 <b>성장하는 시장에서 밀리고 있다</b>는 뜻입니다.
            이 계열은 가나 전체이므로 COSMO 단독 추이와는 다를 수 있습니다.</>}
        >
          <Legend items={trendMarkets.map((m, i) => ({ name: m, color: S[i % S.length] }))} />
          <Chart
            data={trendRows} x="label" height={250} yFmt={(v) => (v * 100).toFixed(0) + '%'} xInterval={0}
            series={trendMarkets.map((m, i) => ({ key: m, name: m, color: S[i % S.length], fmt: p1 }))}
          />
        </Card>
      </div>

      <SecHead>경쟁 공급국</SecHead>
      <div className="grid g2">
        {competitors.slice(0, 4).map((c) => (
          <Card key={c.market}
            title={`${c.market} - 공급국 Top${c.topN}`}
            sub={`${benchYear}년 HS 160414 수입. 시장 평균 ${c.marketUsdKg ? kg2(c.marketUsdKg) : '-'}.`}
            note={(() => {
              const gh = c.rows.find((r) => r.isGhana)
              const cheap = c.rows.filter((r) => r.usdPerKg != null && gh?.usdPerKg != null && r.usdPerKg < gh.usdPerKg)
              if (!gh) return <>이 시장의 공급국 {c.supplierCount}곳 집계에 가나가 잡히지 않았습니다.</>
              return (
                <>가나는 <b>{c.supplierCount}개 공급국 중 {c.ghanaRank}위</b>,
                  점유 <b>{pct(gh.share, 2)}</b>({musd(gh.valueUsd)}), 단가 {gh.usdPerKg != null ? kg2(gh.usdPerKg) : '-'}
                  {c.marketUsdKg != null && gh.usdPerKg != null &&
                    <> - 시장 평균 대비 <b>{p1(gh.usdPerKg / c.marketUsdKg - 1)}</b></>}.
                  {c.ghanaOutsideTop && <> Top{c.topN} 밖이라 표 맨 아래에 따로 붙였습니다.</>}
                  {cheap.length > 0
                    ? <> 가나보다 싼 공급국이 <b>{cheap.length}곳</b>({cheap.slice(0, 3).map((r) => r.partner).join('·')})
                      으로, 저가 경쟁의 실체가 여기 있습니다.</>
                    : <> 표에 있는 공급국 중 가나보다 싼 곳은 없습니다.</>}
                </>
              )
            })()}
          >
            <div className="tw">
              <table>
                <thead>
                  <tr><th className="n">#</th><th>공급국</th><th className="n">금액</th>
                    <th className="n">점유</th><th className="n">$/kg</th><th className="n">평균대비</th></tr>
                </thead>
                <tbody>
                  {c.rows.map((r) => (
                    <tr key={r.partner} className={r.isGhana ? 'us' : undefined}>
                      <td className="n"><span className="rank">{r.rank}</span></td>
                      <td className="nowrap">{r.partner}</td>
                      <td className="n">{musd(r.valueUsd)}</td>
                      <td className="n">{r.share != null ? pct(r.share, 2) : '-'}</td>
                      <td className="n">{r.usdPerKg != null ? r.usdPerKg.toFixed(2) : '-'}</td>
                      <td className="n">{r.usdPerKg != null && c.marketUsdKg
                        ? p1(r.usdPerKg / c.marketUsdKg - 1) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>

      <SecHead>사양 · 유통 구조</SecHead>
      <div className="grid g2">
        <Card
          title="주입액별 단가"
          sub="사양 코드에서 추출. 프리미엄 구간이 어디인지 본다."
          note={<>{byMedia[0].key}가 물량 {pct(byMedia[0].share, 1)}로 주력입니다.
            단가가 높은 구간으로 믹스를 옮기는 것은 <b>판가 인상 없이 실현 단가를 올리는 방법</b>이라,
            재가격이 어려운 바이어에는 사양 전환을 대안으로 쓸 수 있습니다.</>}
        >
          <div className="tw">
            <table>
              <thead><tr><th>주입액</th><th className="n">FCL</th><th className="n">비중</th><th className="n">$천/FCL</th></tr></thead>
              <tbody>
                {byMedia.map((m) => (
                  <tr key={m.key}>
                    <td>{m.key}</td>
                    <td className="n">{num(m.fcl, 0)}</td>
                    <td className="n">{pct(m.share, 1)}</td>
                    <td className="n">{m.usdPerFcl ? (m.usdPerFcl / 1000).toFixed(1) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="인보이스 상대"
          sub="최종 바이어가 아니라 우리가 인보이스를 끊는 상대."
          note={<>신라교역 경유가 <b>{pct(sillaShare, 1)}</b>입니다. 매출채권의 실질 상대가 그룹 무역법인이라는 뜻이라,
            <b>자금 보드의 매출채권과 파노피 어대금을 같은 그룹 자금 캘린더에서 봐야</b> 합니다.
            직판 비중이 낮다는 것은 최종 바이어와의 가격 협상에 한 단계가 더 끼어 있다는 뜻이기도 합니다.</>}
        >
          <div className="tw">
            <table>
              <thead><tr><th>인보이스 상대</th><th className="n">FCL</th><th className="n">매출</th><th className="n">비중</th></tr></thead>
              <tbody>
                {byInvoiceParty.slice(0, 8).map((b) => (
                  <tr key={b.key} className={/silla/i.test(b.key) ? 'warn' : undefined}>
                    <td>{b.key}</td>
                    <td className="n">{num(b.fcl, 0)}</td>
                    <td className="n">{musd(b.amountUsd)}</td>
                    <td className="n">{pct(b.share, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <Callout kind="bad" label="지금 읽히는 것">
          우리는 <b>{pricePosition.length}개 시장 중 {above}곳에서만</b> 시장 평균 단가 이상을 받고 있습니다.
          평균 실현 단가 {kg2(n(totals.usdPerKg))}는 가나 평균과 비교해도 대부분 아래라,
          <b> 산지 조건이 아니라 우리 판가의 문제</b>로 읽힙니다. 손익분기 마진에 못 미치는 물량이 절반 가까운 이유가
          여기서 설명됩니다. 다만 격차의 일부는 제품 믹스 차이이므로 전부가 재가격 여지는 아닙니다.
          <br /><br />
          구조적으로는 <b>{byMarket[0].key}+{byMarket[1].key} {pct(byMarket[0].share + byMarket[1].share, 1)}</b>,
          최대 바이어 하나가 <b>{pct(concentration.topBuyerShare, 1)}</b>입니다. 시장 HHI {num(concentration.marketHHI, 0)}은
          고집중 구간에 근접하고, 바이어는 43곳으로 흩어져 있어도 그 43곳이 소수 시장에 몰려 있습니다.
          재가격을 시도할 때 <b>가장 큰 바이어가 가장 큰 협상력을 가진 구조</b>라는 점이 제약입니다.
        </Callout>
      </div>

      <div style={{ marginTop: 14 }}>
        <Callout kind="warn" label="이 보드의 한계 - 읽기 전에 알아야 할 것">
          <b>① 국가별 COSMO 점유율은 싣지 않았습니다.</b> 원장의 시장은 <b>양륙항</b> 기준이고 무역통계는
          <b> 신고 수입국</b> 기준입니다. Rotterdam·Antwerp로 양륙해 내륙으로 배송되는 물량 때문에
          국가 단위로 나누면 COSMO 물량이 가나 전체 물량을 넘는 곳이 생깁니다(실제로 4개 시장에서 100% 초과).
          그래서 점유율은 <b>가나 전체</b>와 <b>합계 수준</b>에서만 표시합니다.
          <br />
          <b>② 연환산은 단순 배수</b>입니다. 1~5월 실적 × {ANNUALIZE.toFixed(1)}로, 계절성을 보정하지 않았습니다.
          <br />
          <b>③ 시점이 서로 어긋납니다.</b> 수입통계는 기준연도 {benchYear}, 수출 원장은 <b>2026년 1~5월</b>에서
          멈춰 있는데, 손익은 {latestMonth.month}월·운영 주간은 {latest.week}주차까지 와 있습니다.
          이 보드의 단가·점유율은 5월까지의 이야기입니다.
          <br />
          <b>④ 단가 비교는 믹스 차이를 포함</b>합니다. 우리 제품 구성(규격·사양)이 시장 평균 구성과 다르므로
          격차 전부가 가격 문제는 아닙니다.
          <br />
          <b>⑤ CBU 수출만</b>입니다. 내수·FBU는 이 원장에 없습니다.
        </Callout>
      </div>

      <div style={{ marginTop: 14 }}>
        <Callout kind={exportCheckFail ? 'bad' : 'info'} label="검증">
          수출 원장 집계를 <b>하반기 전략보고서의 독립 실측치와 {exportChecks.length}건 대조</b>했고
          불일치는 <b>{exportCheckFail}건</b>입니다(총 FCL·시장별 FCL·매출·최대 바이어 비중·신라교역 경유 비중 등).
          양륙항 → 시장 매핑도 이 대조를 통과했습니다. 미매핑 물량은 {exportMeta.unmappedPortFcl} FCL입니다.
          <br />
          수입통계는 {tradeMeta.collected} 수집, 출처는 Eurostat COMEXT(EU)와 HMRC(영국)이며
          UN Comtrade로 교차확인했습니다. 상세는 <code>docs/TRADE_STATS.md</code>.
        </Callout>
      </div>
    </>
  )
}
