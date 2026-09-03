'use client'
import { C } from '../palette'
import Chart, { Legend } from '../Chart'
import { PageHead, Card, Kpi, SignalCard, Callout, SecHead } from '../Ui'
import {
  signals, weeklySeries, monthlySeries, latest, latestMonth, meta,
  gapDecomposition, musd, num, pct, n, quoteStats, breakevenMargin, materialBurn, weeks, profitCash,
} from '@/lib/data/cosmo'
import { cosmoMonthlyReport as mr } from '@/lib/data/cosmo-monthly-report'
import { cosmoWeeklyReport as wr } from '@/lib/data/cosmo-weekly-report'

const f = (v: number) => v.toLocaleString('en-US')
const m1 = (v: number) => (v / 1e6).toFixed(1) + 'M'
const m2 = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M'
const mt = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' MT'

export default function Home() {
  const cbu = latest.production?.CBU
  const gap = gapDecomposition(cbu)
  const lossMonths = monthlySeries.filter((m) => n(m.net) < 0).length
  const last = weeklySeries[weeklySeries.length - 1]

  // 서사도 파생으로 — GP 마이너스 달, 매출 최고월을 데이터에서 직접 뽑는다 (인덱스·개월 수 하드코딩 제거)
  const gpNegMonths = monthlySeries.filter((m) => m.gp != null && n(m.gp) < 0).map((m) => m.month)
  const peakMonth = monthlySeries.reduce((a, m) => (n(m.revenue) > n(a.revenue) ? m : a), monthlySeries[0])

  // 수주잔량 계단 점프 — 주간 증가폭 상위 2개 주차 (7·28주차 하드코딩 제거)
  const backlogJumpWeeks = weeklySeries
    .map((s, i) => ({ week: s.week, d: i > 0 ? n(s.backlogUsd) - n(weeklySeries[i - 1].backlogUsd) : 0 }))
    .sort((a, b) => b.d - a.d).slice(0, 2).map((j) => j.week).sort((a, b) => a - b)
  const posSales = weeklySeries.map((s) => n(s.salesWeek)).filter((v) => v > 0)
  const salesSwing = posSales.length ? Math.max(...posSales) / Math.min(...posSales) : null

  // ponytail: $1M 초과 유출입만 «크게»로 센다 — 서사용 임계, 자금 보드가 전체를 보여준다
  const cashInMonths = profitCash.rows.filter((r) => r.cash > 1e6).map((r) => r.month)
  const cashOutMonths = profitCash.rows.filter((r) => r.cash < -1e6).map((r) => r.month)

  // 수주잔량 소진 주수 — 최근 4주 평균 주간 선적 FCL 로 나눈다(주간값 진폭이 커 단일 주는 못 쓴다)
  const fclWeeks = weeks.slice(-4).map((w) =>
    w.sales.filter((s) => s.unit === 'Fcl').reduce((a, s) => a + n(s.weekQty), 0))
  const avgFclWeek = fclWeeks.length ? fclWeeks.reduce((a, b) => a + b, 0) / fclWeeks.length : 0
  const backlogWeeks = avgFclWeek > 0 ? n(last.backlogFcl) / avgFclWeek : null

  // 갭이 좁혀진 주가 실제로 몇 번인지 센다 — "한 주도" 같은 전칭 주장은 쓰지 않는다
  const gapSeq = weeklySeries.map((s) => n(s.cbuGap))
  const gapSteps = Math.max(0, gapSeq.length - 1)
  const gapNarrow = gapSeq.filter((v, i) => i > 0 && v > gapSeq[i - 1]).length

  // 매출 계획은 원본에 없다(계획 필드는 생산에만 존재). 유일한 벤치마크인 전년 동기와 댄다.
  const revPrevSum = monthlySeries.reduce((a, m) => a + n(m.revenuePrev), 0)
  const revYoY = revPrevSum > 0 ? n(latestMonth.revenueYtd) / revPrevSum - 1 : null

  // 주간보고에 따라 「하역 중 + 차주 예정」이 있는 주도, 「완료분만」 있는 주도 있다 — 없는 항목은 문장에서 뺀다.
  const u = wr.operations.unloading;
  const done = 'completed' in u ? u.completed : [];
  const md = (d: string) => d.slice(5).replace('-', '/');
  const unloadingHeadline = done.length ? `${done.map((x) => x.vessel).join(' · ')} 하역 완료` : u.active;
  const unloadingDetail = [
    done.length
      ? done.map((x) => `${x.vessel} ${x.totalMt.toLocaleString('ko-KR')}톤`).join(' · ')
      : `${md(u.activeSince)}부터 하역`,
    u.next && u.nextDate ? `${u.next} ${md(u.nextDate)} 예정` : null,
    wr.nextActions.join(' · '),
  ].filter(Boolean).join(' · ');

  return (
    <>
      <PageHead
        title="경영요약"
        lead={`2026년 ${latest.week}주차 운영 지표와 ${latestMonth.month}월 손익을 한 화면에 놓습니다. 주간보고는 판매량을, 월별 손익은 마진을 보여주는데 두 축이 서로 다른 방향을 가리키고 있습니다.`}
        meta={[
          `주간 ${meta.weekRange[0]}~${meta.weekRange[1]}주 (${meta.weekCount}주, 결측 ${meta.missingWeeks.join(',') || '없음'})`,
          `손익 1~${latestMonth.month}월`,
          `견적 ${meta.quoteCount}건`,
          `검산 ${meta.checkCount}건 중 이상 ${meta.checkFailCount}건`,
          '판매 계획 없음 (계획대비 신호 불가)',
        ]}
      />

      <SecHead>이상 신호</SecHead>
      <div className="grid g3">
        {signals.map(({ key, ...s }) => <SignalCard key={key} {...s} />)}
      </div>

      <SecHead>핵심 수치</SecHead>
      <div className="grid g4">
        <Card>
          <Kpi k="누적 매출 (손익기준)" v={musd(latestMonth.revenueYtd)}
            d={`1~${latestMonth.month}월 · 회계 인식 기준`} />
        </Card>
        <Card>
          <Kpi k="누적 순손익" v={musd(latestMonth.netYtd)} tone={n(latestMonth.netYtd) < 0 ? 'down' : 'up'}
            d={`${lossMonths}/${monthlySeries.length}개월 적자`} />
        </Card>
        <Card>
          <Kpi k="누적 판매 (선적기준)" v={musd(last.salesCum)}
            d={`${latest.week}주차 · 주간 ${musd(last.salesWeek)}`} />
        </Card>
        <Card>
          <Kpi k="수주잔량" v={musd(last.backlogUsd)}
            d={`${num(last.backlogFcl, 0)} FCL · 연초 대비 ${pct((n(last.backlogFcl) / n(weeklySeries[0].backlogFcl)) - 1, 0)}`} />
        </Card>
        <Card>
          <Kpi k="총재고" v={musd(last.inventoryUsd)}
            d={`원어 ${num(last.rawStockMt, 0)}MT · 현금의 ${(n(last.inventoryUsd) / Math.max(1, n(last.cashUsd))).toFixed(1)}배`} />
        </Card>
        {/* 아래 4장은 신호등과 값이 겹치지 않는, 결정에 직접 쓰이는 지표만 둔다 */}
        {breakevenMargin && (
          <Card>
            <Kpi k="손익분기 격차" v={pct(breakevenMargin.realizedGpRate - breakevenMargin.required, 1)}
              tone="down"
              d={`실적 매출총이익률 ${pct(breakevenMargin.realizedGpRate, 2)} · 필요 ${pct(breakevenMargin.required, 1)}`} />
          </Card>
        )}
        <Card>
          <Kpi k="견적 마진 (물량가중)" v={pct(quoteStats.weightedMargin, 2)}
            tone={breakevenMargin && n(quoteStats.weightedMargin) < breakevenMargin.required ? 'down' : 'flat'}
            d={`중앙값 ${pct(quoteStats.median, 2)} · 손익분기 미달 물량 ${pct(quoteStats.below3FclShare, 0)}`} />
        </Card>
        <Card>
          <Kpi k="자재 최단 소진" v={materialBurn.shortest?.weeksLeft?.toFixed(1) ?? '-'} unit=" 주"
            tone={n(materialBurn.shortest?.weeksLeft) < 4 ? 'down' : 'flat'}
            d={materialBurn.shortest
              ? `${materialBurn.shortest.group}·${materialBurn.shortest.item} · 4주 미만 ${materialBurn.under4}종`
              : '-'} />
        </Card>
        <Card>
          <Kpi k="수주잔량 소진" v={backlogWeeks == null ? '-' : backlogWeeks.toFixed(1)} unit=" 주"
            d={`최근 4주 평균 선적 ${num(avgFclWeek, 1)} FCL/주 기준`} />
        </Card>
      </div>

      <SecHead>{latest.week}주차 업무 브리핑 ({wr.source.period.replace('2026-', '').replace('~2026-', ' ~ ')})</SecHead>
      <div className="grid g4">
        <Card>
          <Kpi
            k="영업·시장"
            v={`${num(latest.new_orders_fcl, 0)} FCL`}
            d={`${wr.market.productionSecuredThrough} 확보 · ${wr.market.summary}`}
          />
        </Card>
        <Card>
          <Kpi
            k="법무 위험"
            v={musd(wr.litigation.amountUsd)}
            d={`${wr.litigation.case} · ${wr.litigation.status}`}
            tone="down"
          />
        </Card>
        <Card>
          <Kpi
            k="품질·심사"
            v={wr.operations.audit.name}
            d={`${wr.operations.audit.start.slice(5).replace('-', '/')}~${wr.operations.audit.end.slice(5).replace('-', '/')}${'result' in wr.operations.audit ? ` · ${wr.operations.audit.result}` : ''} · ${wr.operations.qualityFocus}`}
          />
        </Card>
        <Card>
          <Kpi
            k="하역·차주"
            v={unloadingHeadline}
            d={unloadingDetail}
          />
        </Card>
      </div>

      <SecHead>수량과 수익성</SecHead>
      <div className="grid g2">
        <Card
          title="월별 손익"
          sub={`순손익은 ${lossMonths}/${monthlySeries.length}개월 적자.${gpNegMonths.length ? ` 매출총이익도 ${gpNegMonths.join('·')}월은 마이너스` : ''}${n(latestMonth.gp) > 0 ? ` - ${latestMonth.month}월은 플러스로 회복.` : ''}`}
          note={<>1~{latestMonth.month}월 누적 매출 <b>{musd(latestMonth.revenueYtd)}</b>, 누적 순손실 <b>{musd(latestMonth.netYtd)}</b>. {peakMonth.month}월은 매출 최고({musd(peakMonth.revenue)})인데도 순손실 - <b>규모가 아니라 마진 구조</b>의 문제.</>}
        >
          <Legend items={[
            { name: '매출총이익', color: C.s4, box: true },
            { name: '순손익', color: C.s2, box: true },
            { name: '매출 (오른쪽 축)', color: C.s1 },
          ]} />
          <Chart
            data={monthlySeries} x="label" zeroLine height={250}
            yFmt={m1} y2Fmt={m1}
            series={[
              { key: 'gp', name: '매출총이익', color: C.s4, type: 'bar', fmt: m2 },
              { key: 'net', name: '순손익', color: C.s2, type: 'bar', fmt: m2 },
              { key: 'revenue', name: '매출', color: C.s1, axis: 'right', fmt: m2 },
            ]}
          />
        </Card>

        <Card
          title="누적 판매 vs 수주잔량"
          sub="선적(회계) 기준 누적 판매액과 미선적 수주잔량 금액. 단위 백만 USD."
          note={<>수주잔량은 {backlogJumpWeeks.map((w) => `${w}주차`).join('·')}에 계단식으로 점프해 현재 <b>{musd(last.backlogUsd)}</b>. 주간 판매액은 선적 타이밍 때문에 최대 {salesSwing ? Math.round(salesSwing) : '-'}배까지 흔들려, 추세는 4주 이동평균으로 봅니다(판매·수주 보드).</>}
        >
          <Legend items={[
            { name: '누적 판매액', color: C.s1 },
            { name: '수주잔량 금액', color: C.s3 },
          ]} />
          <Chart
            data={weeklySeries} x="label" height={250} yFmt={m1} xInterval={3}
            series={[
              { key: 'salesCum', name: '누적 판매액', color: C.s1, fmt: m2 },
              { key: 'backlogUsd', name: '수주잔량', color: C.s3, fmt: m2 },
            ]}
          />
        </Card>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <Card
          title="누적 원어처리량 - 실적 vs 계획"
          sub={`CBU 기준. 주간 전환 ${gapSteps}회 중 ${gapNarrow}회만 축소 - 사실상 단조 확대.`}
          note={gap ? (
            <>격차 <b>{num(gap.total, 0)}MT</b> 중 생산일수 기여 {num(gap.byDays, 0)}MT
              ({Math.round((gap.byDays / gap.total) * 100)}%), <b>일 처리량 기여 {num(gap.byRate, 0)}MT
              ({Math.round((gap.byRate / gap.total) * 100)}%)</b> - 주원인은 처리 속도이고 생산일수도 함께 부족합니다.
              두 요인의 곱이라 교차항 배분에 따라 속도 비중은 81~83% 범위에서 움직입니다(생산 보드에서 분해식 확인).</>
          ) : null}
        >
          <Legend items={[
            { name: '실적', color: C.s1 },
            { name: '계획', color: C.s2, dash: true },
          ]} />
          <Chart
            data={weeklySeries} x="label" height={250} yFmt={(v) => (v / 1000).toFixed(0) + 'k'} xInterval={3}
            series={[
              { key: 'cbuRawCum', name: '실적', color: C.s1, fmt: mt },
              { key: 'cbuPlanCum', name: '계획', color: C.s2, dash: true, fmt: mt },
            ]}
          />
        </Card>

        <Card
          title="재고와 현금"
          sub="총재고 평가액과 현금잔액(전 통화 USD 환산)."
          note={<>재고 <b>{musd(last.inventoryUsd)}</b> · 현금 <b>{musd(last.cashUsd)}</b>. 재고가 현금의 약 {(n(last.inventoryUsd) / Math.max(1, n(last.cashUsd))).toFixed(1)}배로, 운전자본이 재고에 묶여 있습니다.</>}
        >
          <Legend items={[
            { name: '총재고', color: C.s5, box: true },
            { name: '현금잔액', color: C.s4 },
          ]} />
          <Chart
            data={weeklySeries} x="label" height={250} yFmt={m1} xInterval={3}
            series={[
              { key: 'inventoryUsd', name: '총재고', color: C.s5, type: 'area', fmt: m2 },
              { key: 'cashUsd', name: '현금잔액', color: C.s4, fmt: m2 },
            ]}
          />
        </Card>
      </div>

      <SecHead>손익과 현금이 갈리는 지점</SecHead>
      <div className="grid g2">
        <Card
          title="월별 순손익 vs 외부 순현금흐름"
          sub="현금은 계좌간 이동을 뺀 외부 유출입만. 손익은 발생주의라 둘은 원래 어긋난다."
          note={<>1~{profitCash.rows.length}월 누적으로 순손익 <b>{musd(profitCash.netSum)}</b>,
            외부 순현금 <b>{musd(profitCash.cashSum)}</b>로 방향은 같습니다.
            그런데 <b>현금잔액은 {musd(profitCash.cashStart)} → {musd(profitCash.cashEnd)}
            ({musd(profitCash.cashDelta)}) 늘었습니다</b> - 적자인데 잔액이 는 것은
            영업 현금이 아니라 <b>매입채무·차입 등 외부 조달</b>에서 왔다는 뜻입니다.
            같은 기간 재고가 {musd(profitCash.invStart)} → {musd(profitCash.invEnd)}
            ({musd(profitCash.invDelta)}) 늘어, 조달한 자금이 재고로 묶인 구조입니다.
            월별로는 {cashInMonths.join('·')}월에 현금이 크게 들어오고 {cashOutMonths.join('·')}월에 나가는 진폭이 손익보다 훨씬 큰데,
            이는 선적·결제 타이밍이 월 경계와 어긋나기 때문입니다.
            {!profitCash.coverage && ' 일부 주차는 외부 유출입 값이 없어 합계에서 빠졌습니다.'}</>}
        >
          <Legend items={[
            { name: '순손익', color: C.s2, box: true },
            { name: '외부 순현금흐름', color: C.s1, box: true },
          ]} />
          <Chart
            data={profitCash.rows} x="label" height={250} zeroLine yFmt={m1}
            series={[
              { key: 'net', name: '순손익', color: C.s2, type: 'bar', fmt: m2 },
              { key: 'cash', name: '외부 순현금흐름', color: C.s1, type: 'bar', fmt: m2 },
            ]}
          />
        </Card>

        <Card
          title="자금은 어디에 묶였나"
          sub="적자에도 현금이 는 이유를 재고·운전자본에서 찾는다."
          note={<>연초 대비 현금 <b>{musd(profitCash.cashDelta)}</b>, 재고 <b>{musd(profitCash.invDelta)}</b>.
            둘을 더하면 {musd(profitCash.cashDelta + profitCash.invDelta)}로,
            같은 기간 누적 순손실 {musd(profitCash.netSum)}보다 큽니다 -
            <b>손실을 내면서 동시에 자산을 늘린 만큼이 외부 조달</b>입니다.
            재고는 장부가라 그대로 현금화되지 않으므로, 이 구조가 길어지면
            상환 부담이 손익보다 먼저 문제가 됩니다(자금 보드).</>}
        >
          <div className="tw">
            <table>
              <thead><tr><th>구분</th><th className="n">연초</th><th className="n">{latest.week}주차</th><th className="n">증감</th></tr></thead>
              <tbody>
                <tr><td>현금잔액</td><td className="n">{musd(profitCash.cashStart)}</td>
                  <td className="n">{musd(profitCash.cashEnd)}</td>
                  <td className={`n ${profitCash.cashDelta >= 0 ? 'up' : 'down'}`}>{musd(profitCash.cashDelta)}</td></tr>
                <tr className="warn"><td>총재고</td><td className="n">{musd(profitCash.invStart)}</td>
                  <td className="n">{musd(profitCash.invEnd)}</td>
                  <td className="n down">{musd(profitCash.invDelta)}</td></tr>
                <tr><td>누적 순손익 <span className="tag">1~{profitCash.rows.length}월</span></td>
                  <td className="n">-</td><td className="n">{musd(profitCash.netSum)}</td>
                  <td className="n down">{musd(profitCash.netSum)}</td></tr>
                <tr className="bad"><td><b>외부 조달 추정</b> <span className="tag">현금증가+재고증가−손실</span></td>
                  <td className="n">-</td><td className="n">-</td>
                  <td className="n">{musd(profitCash.cashDelta + profitCash.invDelta - profitCash.netSum)}</td></tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SecHead>7월 업무보고 (2026-08-25)</SecHead>
      <div className="grid g2">
        <Card
          title="운전자본 스냅샷"
          sub={`월간 업무보고의 유동성·재고자산 - 연초(1.1) 대비 ${mr.liquidity.asOf} 잔액. 단위 만불.`}
          note={<>매입채무 <b>{f(mr.liquidity.ap.end)}만불</b>이 매출채권 {f(mr.liquidity.ar.end)}만불의
            {' '}<b>{(mr.liquidity.ap.end / mr.liquidity.ar.end).toFixed(1)}배</b>입니다. 표 밖에 PANOFI 어대금 잔액
            {' '}<b>{f(mr.panofiPayable.usd10k)}만불</b>({mr.panofiPayable.asOf})이 따로 있어, 실제 지급 부담은 표보다 큽니다.
            원어재고는 {mr.rawStock.asOf} 기준 <b>{f(mr.rawStock.sjMt + mr.rawStock.yfMt + mr.rawStock.mixMt)}톤</b>
            (SJ {f(mr.rawStock.sjMt)}·YF {mr.rawStock.yfMt}·믹스 {mr.rawStock.mixMt}).</>}
        >
          <div className="tw">
            <table>
              <thead><tr><th>구분</th><th className="n">연초</th><th className="n">{mr.liquidity.asOf}</th><th className="n">증감</th></tr></thead>
              <tbody>
                <tr><td>현금</td><td className="n">{f(mr.liquidity.cash.begin)}</td><td className="n">{f(mr.liquidity.cash.end)}</td>
                  <td className="n">+{f(mr.liquidity.cash.end - mr.liquidity.cash.begin)}</td></tr>
                <tr><td>매출채권</td><td className="n">{f(mr.liquidity.ar.begin)}</td><td className="n">{f(mr.liquidity.ar.end)}</td>
                  <td className="n">+{f(mr.liquidity.ar.end - mr.liquidity.ar.begin)}</td></tr>
                <tr className="warn"><td>매입채무</td><td className="n">{f(mr.liquidity.ap.begin)}</td><td className="n">{f(mr.liquidity.ap.end)}</td>
                  <td className="n">+{f(mr.liquidity.ap.end - mr.liquidity.ap.begin)}</td></tr>
                <tr className="bad"><td>현금부족</td><td className="n">{f(mr.liquidity.shortfall.begin)}</td><td className="n">{f(mr.liquidity.shortfall.end)}</td>
                  <td className="n">{f(mr.liquidity.shortfall.end - mr.liquidity.shortfall.begin)}</td></tr>
                <tr><td>재고자산 합계</td><td className="n">{f(mr.inventory.total.begin)}</td><td className="n">{f(mr.inventory.total.end)}</td>
                  <td className="n">{f(mr.inventory.total.end - mr.inventory.total.begin)}</td></tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="생산계획 개정과 수주 단가"
          sub="월간 업무보고에만 있는 선행 정보 - 연간 계획 하향과 인상 수주."
          note={<>수주는 어가 상승분을 반영해 <b>${mr.orderPrice.fromUsd.toFixed(1)} → ${mr.orderPrice.toUsd.toFixed(1)}</b>
            ({mr.orderPrice.basis})로 인상된 단가로 진행 중이며, 물량보다 단가·수익성을 우선해 리테일 Tender 참여는
            당분간 자제한다고 밝혔습니다. 9~10월 예정: {mr.agenda.map((a, i) => <span key={i}>{i > 0 && ' · '}{a}</span>)}.</>}
        >
          <div className="tw">
            <table>
              <thead><tr><th>구분</th><th className="n">계획</th><th className="n">변경</th><th className="n">차이</th></tr></thead>
              <tbody>
                <tr><td>8월 원어 처리 (MT)</td><td className="n">{f(mr.productionPlan.augustPlanMt)}</td>
                  <td className="n">{f(mr.productionPlan.augustRevisedMt)}</td>
                  <td className="n">{f(mr.productionPlan.augustRevisedMt - mr.productionPlan.augustPlanMt)}</td></tr>
                <tr className="warn"><td>연간 원어 처리 (MT)</td><td className="n">{f(mr.productionPlan.annualPlanMt)}</td>
                  <td className="n">{f(mr.productionPlan.annualRevisedMt)}</td>
                  <td className="n">{f(mr.productionPlan.annualRevisedMt - mr.productionPlan.annualPlanMt)}</td></tr>
                <tr><td>9월 계획 (MT)</td><td className="n">-</td>
                  <td className="n">{f(mr.productionPlan.september.totalMt)}</td>
                  <td className="n">{mr.productionPlan.september.days}일 × {mr.productionPlan.september.dailyMt}톤</td></tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <Callout kind="bad" label="지금 읽히는 것">
          매출은 <b>전년 동기 대비 {pct(revYoY, 1)}</b>로 이미 줄었고(원본에 판매 계획이 없어 계획대비는 산출 불가),
          <b>원어처리량은 계획 대비 {pct((n(cbu?.cumRawMt) - n(cbu?.planRawMt)) / n(cbu?.planRawMt), 1)}</b> 부족합니다.
          그 대부분이 <b>일 처리량 저하</b>에서 나옵니다. 고정비는 그대로인 채 처리량이 줄면 단위 원가가 오르고,
          실제로 손익은 <b>{lossMonths}개월 연속 적자</b>입니다.
          {n(latestMonth.gp) > 0 && (
            <> {latestMonth.month}월 들어 매출총이익은 플러스로 돌아섰지만,
              판관비·이자를 덮기에는 못 미쳐 적자가 이어졌습니다.</>
          )}
          {breakevenMargin && (
            <> 수주 쪽을 보면 견적 <b>물량가중 마진이 {pct(quoteStats.weightedMargin, 2)}</b>인데,
              판관비율 {pct(breakevenMargin.sgaRate, 2)} + 이자비율 {pct(breakevenMargin.interestRate, 2)} =
              {' '}<b>{pct(breakevenMargin.required, 1)}</b>를 넘겨야 손익분기입니다.
              판관비·이자는 <b>금액이 고정</b>({musd(breakevenMargin.fixedUsd)})이라 매출이 늘면 필요 마진율은 내려갑니다 -
              지금 마진을 유지한 채 흑자로 가려면 1~{latestMonth.month}월 매출이 <b>{musd(breakevenMargin.breakevenRevenueAt(n(quoteStats.weightedMargin)))}</b>
              (현재의 {((n(breakevenMargin.breakevenRevenueAt(n(quoteStats.weightedMargin))) / n(breakevenMargin.revenueYtd))).toFixed(1)}배)이어야 합니다.
              <b>도달 불가가 아니라 현 매출 규모에서 불가</b>이며, 판가 전가·단위원가 인하·규모 중 무엇으로 갈지가 결정 사항입니다.</>
          )}
        </Callout>
      </div>
    </>
  )
}
