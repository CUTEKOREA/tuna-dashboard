'use client'
import { C } from '../palette'
import Chart, { Legend } from '../Chart'
import { PageHead, Card, Kpi, Callout, SecHead } from '../Ui'
import type { Week, ProdUnit } from '@/lib/data/cosmo'
import { annualUsdSeries, annualProd, pastWeeks, weeks, latest, yoy, musd, num, pct, n } from '@/lib/data/cosmo'

const m0 = (v: number) => '$' + (v / 1e6).toFixed(0) + 'M'
const m2 = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M'
const mtd = (v: number) => num(v, 1) + ' MT/일'
const mt0 = (v: number) => num(v, 0) + ' MT'

/** 가동이 있었던 주만 평균에 넣는다 — 미가동 주(처리량 0)를 섞으면 평균이 내려앉는다 */
function cbuWeekAvg(ws: Week[]) {
  const p = ws
    .map((w) => w.production?.CBU)
    .filter((x): x is ProdUnit => !!x && n(x.weekRawMt) > 0)
  const avg = (f: (u: ProdUnit) => number) => (p.length ? p.reduce((a, u) => a + f(u), 0) / p.length : 0)
  return {
    count: p.length,
    yield: avg((u) => n(u.weekYield)),
    daily: avg((u) => n(u.weekDaily)),
    raw: avg((u) => n(u.weekRawMt)),
  }
}

const p25n = (v: number) => v.toFixed(1) + ' MT/일'

export default function History() {
  // 금액은 전부 USD 로 통일한다. 2013~2022 는 '연도별' 시트(만불), 2023~ 은 결산 확정치.
  const U = annualUsdSeries.map((a) => ({ ...a, label: `${a.year}` }))
  const A = U                                                          // 표·차트 공통
  const P = annualProd.map((a) => ({ ...a, label: `${a.year}` }))      // 생산 지표가 있는 해
  const last = U[U.length - 1]
  const prev = U[U.length - 2]
  const lastProd = P[P.length - 1]
  const settled = U.filter((a) => a.basis === '결산 확정')
  const lossYearsU = U.filter((a) => n(a.net) < 0).length
  const cbu = latest.production?.CBU
  const now = {
    raw: n(cbu?.cumRawMt), days: n(cbu?.cumDays),
    daily: n(cbu?.cumDaily), yield: n(cbu?.cumYield),
  }
  const lossYears = lossYearsU
  // 영업이익이 순이익으로 얼마나 남았나 — 나머지는 금융·영업외 몫
  const kept = n(last.op) ? n(last.net) / n(last.op) : null

  // 수율은 연도 간 차이가 1%p 미만이라 0 기준 막대로는 읽히지 않는다 → 축을 잘라 선으로
  const yVals = [...annualProd.map((a) => n(a.yield)), now.yield]
  const yLo = Math.floor(Math.min(...yVals) * 200) / 200
  const yHi = Math.ceil(Math.max(...yVals) * 200) / 200

  const p25 = cbuWeekAvg(pastWeeks)
  const p26 = cbuWeekAvg(weeks)
  const rows: { k: string; a: number; b: number; f: (v: number) => string }[] = [
    { k: 'CBU 주간 수율', a: p25.yield, b: p26.yield, f: (v) => pct(v, 2) },
    { k: 'CBU 주간 일처리량', a: p25.daily, b: p26.daily, f: mtd },
    { k: 'CBU 주간 원어처리량', a: p25.raw, b: p26.raw, f: mt0 },
  ]

  return (
    <>
      <PageHead
        title={`장기 추이 (${U[0].year}~${last.year})`}
        lead={`이 보드는 참조용입니다. 지금 수준이 지난 ${U.length}개년 안에서 어디쯤인지 대보는 화면입니다. 금액은 모두 USD 기준입니다 — ${U[0].year}~${settled[0].year - 1}년은 연도별 집계(만불), ${settled[0].year}년부터는 결산 확정치이며, 겹치는 구간에서 두 출처가 이어지는지 확인했습니다.`}
        meta={[
          `손익 ${U[0].year}~${last.year} (${U.length}개년, USD)`,
          `생산 ${P[0].year}~${lastProd.year} (${P.length}개년)`,
          `2025 주간 ${yoy.weeks2025Count}주 확보 — 동일 구간(1~${yoy.upTo}주) 대조`,
          `대비 기준 2026 ${latest.week}주차 누적`,
        ]}
      />

      <SecHead>{last.year}년 결산과 현재 위치</SecHead>
      <div className="grid g3">
        <Card>
          <Kpi k={`${last.year} 매출`} v={musd(last.revenue)}
            d={`전년 대비 ${pct((n(last.revenue) - n(prev.revenue)) / n(prev.revenue), 1)} · ${last.basis}`} />
        </Card>
        <Card>
          <Kpi k={`${last.year} 영업손익`} v={musd(last.op)}
            tone={n(last.op) >= 0 ? 'up' : 'down'}
            d={`전년 ${musd(prev.op)} → ${musd(n(last.op) - n(prev.op))}`} />
        </Card>
        <Card>
          <Kpi k={`${last.year} 순손익`} v={musd(last.net)}
            tone={n(last.net) >= 0 ? 'up' : 'down'}
            d={`${U.length}개년 중 적자 ${lossYears}개년 · 영업이익의 ${kept != null ? pct(kept, 0) : '—'}만 순이익으로 남음`} />
        </Card>
        <Card>
          <Kpi k={`${lastProd.year} CBU 원어처리량`} v={num(lastProd.cbuRawMt, 0)} unit=" MT"
            d={`2026 ${latest.week}주 누적 ${num(now.raw, 0)}MT (${pct(now.raw / n(lastProd.cbuRawMt), 0)} 진행) · 생산 ${num(now.days, 0)}/${num(lastProd.days, 0)}일`} />
        </Card>
        <Card>
          <Kpi k={`${lastProd.year} 일처리량`} v={num(lastProd.daily, 1)} unit=" MT/일"
            tone={now.daily >= n(lastProd.daily) ? 'up' : 'down'}
            d={`2026 누적 ${num(now.daily, 1)} MT/일 · ${pct((now.daily - n(lastProd.daily)) / n(lastProd.daily), 1)}`} />
        </Card>
        <Card>
          <Kpi k={`${lastProd.year} 수율`} v={pct(lastProd.yield, 2)}
            tone={now.yield >= n(lastProd.yield) ? 'up' : 'down'}
            d={`2026 누적 ${pct(now.yield, 2)} · ${((now.yield - n(lastProd.yield)) * 100).toFixed(2)}%p`} />
        </Card>
      </div>

      <SecHead>연간 손익 구조</SecHead>
      <div className="grid g2">
        <Card
          title="영업손익 · 순손익"
          sub={`USD 기준. ${U[0].year}~${settled[0].year - 1}년은 연도별 집계, ${settled[0].year}년부터는 결산 확정치.`}
          note={<>{U.length}개년 중 <b>{lossYears}개년이 순손실</b>입니다.
            흑자로 돌아선 것은 {U.filter((a) => n(a.net) > 0).map((a) => a.year).join('·')}년뿐이고
            그마저 {musd(U.filter((a) => n(a.net) > 0)[0]?.net)} 수준으로 얇습니다.
            {last.year}년 영업손익 <b>{musd(last.op)}</b> 중 순손익으로 남은 것은 {musd(last.net)}
            ({kept != null ? pct(kept, 0) : '—'})로, 나머지는 금융·영업외 비용이 가져갔습니다.
            영업이 개선돼도 순이익으로 남는 몫이 얇은 구조가 계속됩니다.</>}
        >
          <Legend items={[
            { name: '영업손익', color: C.s1, box: true },
            { name: '순손익', color: C.s4, box: true },
          ]} />
          <Chart
            data={U} x="label" height={250} zeroLine yFmt={m0} xInterval={0}
            series={[
              { key: 'op', name: '영업손익', color: C.s1, type: 'bar', fmt: m2 },
              { key: 'net', name: '순손익', color: C.s4, type: 'bar', fmt: m2 },
            ]}
          />
        </Card>

        <Card
          title="연간 매출 추이"
          sub="USD 기준."
          note={<>{U[0].year}년 {musd(U[0].revenue)}에서 시작해
            {U.reduce((mx, a) => (n(a.revenue) > n(mx.revenue) ? a : mx)).year}년
            <b> {musd(U.reduce((mx, a) => (n(a.revenue) > n(mx.revenue) ? a : mx)).revenue)}</b>이 최고였고,
            {last.year}년은 {musd(last.revenue)}입니다.
            매출이 정점 대비 내려온 상태에서 순손익만 간신히 흑자로 돌아섰으니,
            최근 개선은 <b>규모가 아니라 마진</b>에서 나온 것입니다.</>}
        >
          <Legend items={[{ name: '매출', color: C.rank, box: true }]} />
          <Chart
            data={U} x="label" height={250} yFmt={m0} xInterval={0}
            series={[{ key: 'revenue', name: '매출', color: C.rank, type: 'bar', fmt: m2 }]}
          />
        </Card>
      </div>

      <SecHead>연간 생산성 vs 2026 현재</SecHead>
      <div className="grid g2">
        <Card
          title="일처리량 — 연도별 vs 2026 누적"
          sub="CBU 기준. 가로 점선이 2026년 현재 누적 일처리량."
          note={<>2026 누적 일처리량 <b>{num(now.daily, 1)} MT/일</b>은 {P.length}개년 중
            <b> {P.filter((a) => n(a.daily) > now.daily).length}개년이 현재보다 높고</b>,
            가장 최근 확정치인 {lastProd.year}년은 <b>{num(lastProd.daily, 1)} MT/일</b>로 {P.length}개년 최고입니다 —
            지금 수준은 그보다 {num(n(lastProd.daily) - now.daily, 1)} 낮습니다.</>}
        >
          <Legend items={[
            { name: '연간 일처리량', color: C.rank, box: true },
            { name: `2026 ${latest.week}주 누적 ${num(now.daily, 1)}`, color: 'var(--cosmo-accent)', dash: true },
          ]} />
          <Chart
            data={P} x="label" height={250} yFmt={(v) => num(v, 0)}
            refLines={[{ y: now.daily, color: 'var(--cosmo-accent)' }]}
            series={[{ key: 'daily', name: '일처리량', color: C.rank, type: 'bar', fmt: mtd }]}
          />
        </Card>

        <Card
          title="수율 — 연도별 vs 2026 누적"
          sub={`CBU 기준. 연도 간 차이가 1%p 미만이라 축을 ${pct(yLo, 1)}부터 잘라 선으로 그렸습니다.`}
          note={<>2026 누적 수율 <b>{pct(now.yield, 2)}</b>는 {P.length}개년 중 가장 낮은
            {P.reduce((lo, a) => (n(a.yield) < n(lo.yield) ? a : lo)).year}년 {pct(P.reduce((lo, a) => (n(a.yield) < n(lo.yield) ? a : lo)).yield, 2)}보다도
            {((now.yield - n(P.reduce((lo, a) => (n(a.yield) < n(lo.yield) ? a : lo)).yield)) * 100).toFixed(2)}%p 낮습니다.
            일처리량과 수율이 <b>동시에</b> 과거 구간을 밑돌고 있어, 생산일수를 늘려도 회복되지 않는 자리입니다.</>}
        >
          <Legend items={[
            { name: '연간 수율', color: C.rank },
            { name: `2026 ${latest.week}주 누적 ${pct(now.yield, 2)}`, color: 'var(--cosmo-accent)', dash: true },
          ]} />
          <Chart
            data={P} x="label" height={250} domain={[yLo, yHi]} yFmt={(v) => pct(v, 1)}
            refLines={[{ y: now.yield, color: 'var(--cosmo-accent)' }]}
            series={[{ key: 'yield', name: '수율', color: C.rank, fmt: (v) => pct(v, 2) }]}
          />
        </Card>
      </div>

      <SecHead>연간 지표 · 전년 대비</SecHead>
      <div className="grid g2">
        <Card
          title={`${U[0].year}~${last.year} 연간 지표`}
          sub={`금액은 USD, 생산은 CBU 기준. ${settled[0].year}년부터는 결산 확정치.`}
          note={<>금액은 모두 <b>USD</b>입니다 — {U[0].year}~{settled[0].year - 1}년은 연도별 집계(만불 환산),
            {settled[0].year}년부터는 결산 확정치입니다. 두 출처가 겹치는 구간에서 값이 이어지는지 확인했습니다.
            생산 지표가 빈 해는 그 해 집계가 원본에 없는 경우입니다.
            영업손익이 흑자인 해는 {U.filter((a) => n(a.op) > 0).map((a) => a.year).join('·') || '없음'},
            순손익 흑자는 {U.filter((a) => n(a.net) > 0).map((a) => a.year).join('·') || '없음'}뿐입니다.</>}
        >
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>연도</th>
                  <th className="n">매출</th>
                  <th className="n">영업손익</th>
                  <th className="n">순손익</th>
                  <th className="n">출처</th>
                  <th className="n">CBU 처리량</th>
                  <th className="n">생산일수</th>
                  <th className="n">일처리량</th>
                  <th className="n">수율</th>
                  <th className="n">FBU 생산량</th>
                </tr>
              </thead>
              <tbody>
                {A.map((a) => (
                  <tr key={a.year} className={a.basis === '결산 확정' ? 'ok' : undefined}>
                    <td>{a.year}</td>
                    <td className="n">{musd(a.revenue)}</td>
                    <td className="n">{musd(a.op)}</td>
                    <td className={`n ${n(a.net) < 0 ? 'down' : 'up'}`}>{musd(a.net)}</td>
                    <td className="n"><span className="tag">{a.basis ?? '—'}</span></td>
                    <td className="n">{num(a.cbuRawMt, 0)} MT</td>
                    <td className="n">{num(a.days, 0)}일</td>
                    <td className="n">{num(a.daily, 1)}</td>
                    <td className="n">{pct(a.yield, 2)}</td>
                    <td className="n">{num(a.fbuMt, 0)} MT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card
          title={`2025 vs 2026 — 같은 1~${yoy.upTo}주 구간`}
          sub="같은 주간보고 양식에서 읽은 CBU 주간값. 일처리량은 Σ원어÷Σ생산일, 수율은 원어량 가중. 미가동 주 제외."
          note={<>2025년 전주차가 확보돼 <b>같은 1~{yoy.upTo}주 구간</b>으로 비교합니다 — 계절성이 통제된 값입니다.
            일처리량 <b>{p25n(yoy.daily2025)} → {p25n(yoy.daily2026)} ({yoy.dailyDelta.toFixed(1)} MT/일)</b>,
            수율 {pct(yoy.yield2025, 2)} → {pct(yoy.yield2026, 2)}({(yoy.yieldDelta * 100).toFixed(2)}%p),
            원어처리량 {num(yoy.rawMt2025, 0)} → {num(yoy.rawMt2026, 0)}MT.
            같은 시점 누적 판매액도 {musd(yoy.salesCum2025)} → {musd(yoy.salesCum2026)}
            ({yoy.salesYoY != null ? pct(yoy.salesYoY, 1) : '—'})입니다.
            <br />이전에는 2025 표본이 연말 13주뿐이라 일처리량이 2026 쪽이 높게 나왔는데,
            <b>그건 비교 구간이 어긋나서 생긴 착시</b>였습니다. 전주차로 맞추니 방향이 뒤집힙니다.
            2025년 결측은 {yoy.missing2025.map((w) => `W${w}`).join('·') || '없음'}입니다.</>}
        >
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>지표</th>
                  <th className="n">2025 ({p25.count}주)</th>
                  <th className="n">2026 ({p26.count}주)</th>
                  <th className="n">차이</th>
                  <th className="n">증감률</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.k} className={r.b < r.a ? 'warn' : undefined}>
                    <td>{r.k}</td>
                    <td className="n">{r.f(r.a)}</td>
                    <td className="n">{r.f(r.b)}</td>
                    <td className="n">{r.f(r.b - r.a)}</td>
                    <td className="n">{pct((r.b - r.a) / r.a, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>


      <div style={{ marginTop: 18 }}>
        <Callout kind="warn" label="참조로 읽는 법">
          직전 {lastProd.year}년은 일처리량 <b>{num(lastProd.daily, 1)} MT/일</b> · 수율 {pct(lastProd.yield, 2)}로
          {P.length}개년 최고였습니다. 2026년 {latest.week}주차 누적은
          <b> 일처리량 {num(now.daily, 1)}({pct((now.daily - n(lastProd.daily)) / n(lastProd.daily), 1)})</b>,
          <b>수율 {pct(now.yield, 2)}({((now.yield - n(lastProd.yield)) * 100).toFixed(2)}%p)</b>로
          그 기준선 아래에 있습니다 — 추세 하락이 아니라 <b>최고점에서의 급락</b>입니다.
          손익 쪽을 보면 {U.length}개년 중 순손익 흑자는
          {U.filter((a) => n(a.net) > 0).map((a) => a.year).join('·') || '없음'}뿐이고 규모도 {musd(last.net)} 수준입니다.
          영업손익이 개선돼도 순손익으로 남는 몫이 얇은 구조에서 생산성까지 밀리면 흑자 유지가 어렵습니다.
          <br />금액은 모두 USD로 통일했으나, 연간 결산은 <b>회계 인식</b> 기준이고
          2026 주간보고는 <b>선적</b> 기준이라 시점이 다릅니다. 연간 대비는 손익·원가 보드의 확정 결산 카드를 함께 보십시오.
        </Callout>
      </div>
    </>
  )
}
