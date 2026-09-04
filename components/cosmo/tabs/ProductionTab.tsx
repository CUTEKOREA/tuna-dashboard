'use client'
import { C } from '../palette'
import Chart, { Legend } from '../Chart'
import { PageHead, Card, Kpi, Callout, SecHead } from '../Ui'
import {
  weeks, weeklySeries, annual, latest, meta, yoy,
  gapDecomposition, gapValuation, musd, num, pct, n,
} from '@/lib/data/cosmo'
import { cosmoMonthlyReport as mr } from '@/lib/data/cosmo-monthly-report'
import { cosmoQualityReport as qr } from '@/lib/data/cosmo-quality-report'

const mt = (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' MT'
const n0 = (v: number) => v.toLocaleString('en-US')
const mtk = (v: number) => (v / 1000).toFixed(0) + 'k'
const dly = (v: number) => v.toFixed(1) + ' MT/일'
const day = (v: number) => v.toFixed(1) + '일'
const pp = (v: number | null | undefined) => (v == null ? '-' : (v * 100).toFixed(2) + '%p')
const usdFmt = (v: number | null | undefined) => (v == null ? '-' : '$' + num(v, 0))
const musdFmt = (v: number) => '$' + (v / 1e6).toFixed(2) + 'M'

/** 값 폭이 좁은 계열은 0 기준 축에서 한 선으로 뭉갠다 — 데이터 범위 ±pad 로 자른 축 */
const tightDomain = (vals: (number | null | undefined)[], pad = 0.3): [number, number] => {
  const v = vals.filter((x): x is number => typeof x === 'number')
  const lo = Math.min(...v)
  const hi = Math.max(...v)
  const m = (hi - lo) * pad
  return [lo - m, hi + m]
}

export default function Production() {
  // 월간 업무보고의 월별 표 — 계획 대비 변경계획을 12개월로 편다.
  // 1~mr.rawThroughput.actualThrough 월이 실적이고 그 뒤는 변경계획이라, 화면에서 구간을 갈라 표시한다.
  const tp = mr.rawThroughput
  const cn = mr.containers
  const monthRows = tp.plan.map((plan, i) => ({
    label: `${i + 1}월`,
    계획: plan,
    '실적·변경': tp.revised[i],
    gap: tp.revised[i] - plan,
    days: tp.days[i],
    daily: tp.dailyMt[i],
    actual: i < tp.actualThrough,
  }))
  const ctnRows = cn.cbuPlan.map((plan, i) => ({
    label: `${i + 1}월`,
    'CBU 계획': plan,
    'CBU 실적·변경': cn.cbuOnBoard[i],
    FBU: cn.fbu[i],
    gap: cn.cbuOnBoard[i] - plan,
    actual: i < cn.actualThrough,
  }))
  // 실적 구간(1~6월)만의 누적 — 변경계획을 실적처럼 읽지 않기 위해 따로 센다
  const actualPlan = tp.plan.slice(0, tp.actualThrough).reduce((a, b) => a + b, 0)
  const actualDone = tp.revised.slice(0, tp.actualThrough).reduce((a, b) => a + b, 0)
  const ctnActualPlan = cn.cbuPlan.slice(0, cn.actualThrough).reduce((a, b) => a + b, 0)
  const ctnActualDone = cn.cbuOnBoard.slice(0, cn.actualThrough).reduce((a, b) => a + b, 0)
  const cleanerDrop = qr.cleaners.rows[0].count - qr.cleaners.rows[2].count
  const cleaningClaims = qr.claims.filter((c) => c.defects.some((d) => d.includes('클리닝 부적합'))).length
  const freezerDays = qr.freezer.recovery.reduce((a, r) => a + (r.elapsedDays ?? 0), 0)
  const cbu = latest.production?.CBU
  const fbu = latest.production?.FBU
  const gap = gapDecomposition(cbu)
  const gTot = n(gap?.total), gDays = n(gap?.byDays), gRate = n(gap?.byRate), gRes = n(gap?.residual)
  const share = (v: number) => (gTot === 0 ? 0 : v / gTot)

  /** 계획 대비 부족분을 비율로도 분해 — 일수 −x% + 속도 −y% ≈ 총 −z% */
  const pctTotal = n(cbu?.planRawMt) ? gTot / n(cbu?.planRawMt) : 0
  const pctDays = n(cbu?.planDays) ? n(cbu?.gapDays) / n(cbu?.planDays) : 0
  const pctRate = n(cbu?.planDaily) ? n(cbu?.gapDaily) / n(cbu?.planDaily) : 0

  /** 결측 주차(W16)는 주간 계열에 행이 아예 없다. 누계에는 반영돼 있으므로
   *  직후 주의 누계 증가분에서 그 주 실적을 역산해 note 에 밝힌다. */
  const missWk = meta.missingWeeks[0]
  const iAfter = weeks.findIndex((w) => w.week === missWk + 1)
  const missMt = iAfter > 0
    ? n(weeks[iAfter].production?.CBU?.cumRawMt) - n(weeks[iAfter - 1].production?.CBU?.cumRawMt)
      - n(weeks[iAfter].production?.CBU?.weekRawMt)
    : null

  /** 미가동 주의 0 을 null 로 바꿔 비율 계열이 0 으로 끌려가지 않게 한다 */
  const prod = weeklySeries.map((s, i) => {
    const c = weeks[i].production?.CBU
    const f = weeks[i].production?.FBU
    const on = n(c?.weekDays) > 0
    return {
      ...s,
      cbuYieldWeek: on ? s.cbuYieldWeek : null,
      cbuYieldCum: on ? s.cbuYieldCum : null,
      cbuYieldPlan: on ? s.cbuYieldPlan : null,
      cbuDaily: on ? s.cbuDaily : null,
      cbuWeekDaily: on ? c?.weekDaily ?? null : null,
      cbuWeekDays: c?.weekDays ?? null,
      fbuYieldWeek: n(f?.weekDays) > 0 ? s.fbuYieldWeek : null,
    }
  })

  /** 갭이 주 단위로 좁혀진 적이 있는지 — '한 번도 안 좁혀졌다'를 그대로 쓰지 않고 세어본다 */
  const gapSeq = prod.map((s) => n(s.cbuGap))
  const narrowWeeks = gapSeq.filter((v, i) => i > 0 && v > gapSeq[i - 1]).length
  const stepCount = Math.max(0, gapSeq.length - 1)

  /** 생산일 3일 미만 = 부분 가동. 집계 중인 최신 주는 제외. */
  const partial = prod.filter((s) =>
    s.cbuWeekDays != null && s.cbuWeekDays > 0 && s.cbuWeekDays < 3 && s.week !== latest.week)
  const topYield = [...prod].sort((a, b) => n(b.cbuYieldWeek) - n(a.cbuYieldWeek))[0]

  const gapRows = [
    { label: '생산일수 기여', byDays: gDays, byRate: null as number | null, total: null as number | null },
    { label: '일 처리량 기여', byDays: null as number | null, byRate: gRate, total: null as number | null },
    { label: '총 갭', byDays: null as number | null, byRate: null as number | null, total: gTot },
  ]

  const cmpRows = [
    { k: '생산일수', u: '일',
      cw: num(cbu?.weekDays, 1), cc: num(cbu?.cumDays, 1), cp: num(cbu?.planDays, 1), cg: num(cbu?.gapDays, 1),
      fw: num(fbu?.weekDays, 1), fc: num(fbu?.cumDays, 1), fp: num(fbu?.planDays, 1), fg: num(fbu?.gapDays, 1) },
    { k: '원어처리량', u: 'MT',
      cw: num(cbu?.weekRawMt, 0), cc: num(cbu?.cumRawMt, 0), cp: num(cbu?.planRawMt, 0), cg: num(cbu?.gapRawMt, 0),
      fw: num(fbu?.weekRawMt, 0), fc: num(fbu?.cumRawMt, 0), fp: num(fbu?.planRawMt, 0), fg: num(fbu?.gapRawMt, 0) },
    { k: '수율', u: '%',
      cw: pct(cbu?.weekYield, 2), cc: pct(cbu?.cumYield, 2), cp: pct(cbu?.planYield, 2), cg: pp(cbu?.gapYield),
      fw: pct(fbu?.weekYield, 2), fc: pct(fbu?.cumYield, 2), fp: pct(fbu?.planYield, 2), fg: pp(fbu?.gapYield) },
    { k: '일 처리량', u: 'MT/일',
      cw: num(cbu?.weekDaily, 1), cc: num(cbu?.cumDaily, 1), cp: num(cbu?.planDaily, 1), cg: num(cbu?.gapDaily, 1),
      fw: num(fbu?.weekDaily, 1), fc: num(fbu?.cumDaily, 1), fp: num(fbu?.planDaily, 1), fg: num(fbu?.gapDaily, 1) },
  ]

  /* FBU 는 원본에 계획이 없다. 전부 '—' 인 계획·갭 열은 카드 폭만 넘치게 하므로 값이 있을 때만 낸다 */
  const hasFbuPlan = cmpRows.some((r) => r.fp !== '-' || r.fg !== '-')

  const lastAnnual = annual[annual.length - 1]

  /* 동일 주차 구간(1~현재주) 대조 — 계절성 통제 */
  const yrRows = [
    { k: '수율', sub: '원어량 가중', a: pct(yoy.yield2025, 2), b: pct(yoy.yield2026, 2),
      d: pp(yoy.yieldDelta), neg: yoy.yieldDelta < 0 },
    { k: '일 처리량', sub: 'Σ원어 ÷ Σ생산일', a: dly(yoy.daily2025), b: dly(yoy.daily2026),
      d: (yoy.dailyDelta >= 0 ? '+' : '') + yoy.dailyDelta.toFixed(1), neg: yoy.dailyDelta < 0 },
    { k: '원어처리량', sub: '구간 합계', a: mt(yoy.rawMt2025), b: mt(yoy.rawMt2026),
      d: (yoy.rawMtDelta >= 0 ? '+' : '') + num(yoy.rawMtDelta, 0) + ' MT', neg: yoy.rawMtDelta < 0 },
    { k: '생산일수', sub: '구간 합계', a: day(yoy.days2025), b: day(yoy.days2026),
      d: (yoy.days2026 - yoy.days2025 >= 0 ? '+' : '') + (yoy.days2026 - yoy.days2025).toFixed(1) + '일',
      neg: yoy.days2026 < yoy.days2025 },
    { k: '누적 판매액', sub: `${yoy.upTo}주차 시점`, a: musd(yoy.salesCum2025), b: musd(yoy.salesCum2026),
      d: yoy.salesYoY != null ? pct(yoy.salesYoY, 1) : '-', neg: (yoy.salesYoY ?? 0) < 0 },
  ]

  return (
    <>
      <PageHead
        title="생산"
        lead={`계획 대비 ${mt(Math.abs(gTot))} 부족이 어디서 왔는지 - 공장을 덜 돌려서인지, 돌아가는 동안 덜 처리해서인지 - 를 분해합니다. 별도 표기가 없으면 CBU(캔) 라인 기준입니다.`}
        meta={[
          `주간 ${meta.weekRange[0]}~${meta.weekRange[1]}주 (${meta.weekCount}주, 결측 ${meta.missingWeeks.join(',') || '없음'})`,
          `CBU 누적 ${num(cbu?.cumRawMt, 0)}MT / 계획 ${num(cbu?.planRawMt, 0)}MT`,
          `비교군 2025 전체 ${yoy.weeks2025Count}주 - 동일 구간(1~${yoy.upTo}주) 대조`,
        ]}
      />

      <SecHead>핵심 수치</SecHead>
      <div className="grid g4">
        <Card>
          <Kpi k="누적 원어처리량" v={num(cbu?.cumRawMt, 0)} unit=" MT" tone="down"
            d={`계획 ${num(cbu?.planRawMt, 0)}MT · 갭 ${num(gTot, 0)}MT (${pct(pctTotal, 1)})`} />
        </Card>
        <Card>
          <Kpi k="누적 생산일수" v={num(cbu?.cumDays, 0)} unit=" 일" tone="down"
            d={`계획 ${num(cbu?.planDays, 0)}일 · 갭 ${num(cbu?.gapDays, 1)}일 (${pct(pctDays, 1)})`} />
        </Card>
        <Card>
          <Kpi k="누적 일 처리량" v={num(cbu?.cumDaily, 1)} unit=" MT/일" tone="down"
            d={`계획 ${num(cbu?.planDaily, 1)} · 갭 ${num(cbu?.gapDaily, 1)} (${pct(pctRate, 1)})`} />
        </Card>
        <Card>
          <Kpi k="누적 수율" v={pct(cbu?.cumYield, 2)} tone="down"
            d={`계획 ${pct(cbu?.planYield, 2)} · 갭 ${pp(cbu?.gapYield)}`} />
        </Card>
      </div>

      <SecHead id="sec-gap">갭 요인 분해</SecHead>
      <div className="grid g2">
        <Card
          title="총 갭을 두 요인으로 가른다"
          sub="계획 대비 부족분을 '덜 돌린 날' 몫과 '느리게 돌아간 날' 몫으로 분리. 음(−)이 부족분."
          note={<>공식은 <b>일수 기여 = (실적일수−계획일수) × 계획 일처리량</b> =
            ({num(cbu?.cumDays, 0)}−{num(cbu?.planDays, 0)})×{num(cbu?.planDaily, 1)} = {num(gDays, 0)}MT,
            <b> 속도 기여 = 실적일수 × (실적 일처리량−계획 일처리량)</b> =
            {' '}{num(cbu?.cumDays, 0)}×({num(cbu?.cumDaily, 1)}−{num(cbu?.planDaily, 1)}) = {num(gRate, 0)}MT.
            두 항의 합과 실제 갭의 잔차는 {num(gRes, 1)}MT 로 반올림 수준입니다.</>}
        >
          <Legend items={[
            { name: '생산일수 기여', color: C.s1, box: true },
            { name: '일 처리량 기여', color: C.s3, box: true },
            { name: '총 갭', color: C.danger, box: true },
          ]} />
          <Chart
            data={gapRows} x="label" height={250} zeroLine yFmt={(v) => num(v, 0)}
            series={[
              { key: 'byDays', name: '생산일수 기여', color: C.s1, type: 'bar', stackId: 'g', fmt: mt },
              { key: 'byRate', name: '일 처리량 기여', color: C.s3, type: 'bar', stackId: 'g', fmt: mt },
              { key: 'total', name: '총 갭', color: C.danger, type: 'bar', stackId: 'g', fmt: mt },
            ]}
          />
        </Card>

        <Card
          title="기여도 - MT와 비중"
          sub="비중은 총 갭 대비. 계획 대비 비율은 참고값이다."
          note={<>부족분 {mt(Math.abs(gTot))} 중 <b>{pct(share(gRate), 1)}가 일 처리량 저하</b>,
            생산일수는 {pct(share(gDays), 1)}입니다. 날짜를 다 채웠어도 갭의 대부분은 남습니다.
            <br />두 가지 단서 - ① 처리량은 <b>일수 × 속도의 곱</b>이라 교차항을 어느 쪽에 붙이느냐로 비중이 달라집니다.
            위 식은 교차항을 속도에 귀속시킨 경로이고, 반대 경로에서는 속도 비중이 약 83%가 됩니다. 어느 경로든 주원인은 속도입니다.
            ② 계획 대비 비율(생산일수 {pct(pctDays, 1)}, 일 처리량 {pct(pctRate, 1)})은 곱셈 관계라
            더해도 총 갭 비율과 일치하지 않습니다. 합산하지 말고 각각으로 읽으십시오.</>}
        >
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>요인</th>
                  <th className="n">기여</th>
                  <th className="n">비중</th>
                  <th className="n">계획 대비</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>생산일수 <span className="tag">{num(cbu?.gapDays, 1)}일</span></td>
                  <td className="n">{num(gDays, 0)} MT</td>
                  <td className="n">{pct(share(gDays), 1)}</td>
                  <td className="n">{pct(pctDays, 1)}</td>
                </tr>
                <tr className="bad">
                  <td>일 처리량 <span className="tag">{num(cbu?.gapDaily, 1)} MT/일</span></td>
                  <td className="n">{num(gRate, 0)} MT</td>
                  <td className="n">{pct(share(gRate), 1)}</td>
                  <td className="n">{pct(pctRate, 1)}</td>
                </tr>
                <tr>
                  <td>잔차 (반올림)</td>
                  <td className="n">{num(gRes, 1)} MT</td>
                  <td className="n">-</td>
                  <td className="n">-</td>
                </tr>
                <tr>
                  <td><b>총 갭</b></td>
                  <td className="n"><b>{num(gTot, 0)} MT</b></td>
                  <td className="n"><b>{pct(1, 1)}</b></td>
                  <td className="n"><b>{pct(pctTotal, 1)}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SecHead>계획 대비 추이</SecHead>
      <div className="grid g2">
        <Card
          title="누적 원어처리량 - 실적 vs 계획"
          sub="왼쪽 축은 누적 처리량, 오른쪽 축은 갭(실적−계획)."
          note={<>{latest.week}주 현재 실적 <b>{mt(n(cbu?.cumRawMt))}</b>, 계획 {mt(n(cbu?.planRawMt))}.
            두 선은 초반부터 벌어지기 시작해 한 번도 다시 붙지 않습니다.
            {missMt != null && <> 결측된 {missWk}주는 행 자체가 없어 {missWk - 1}주와 {missWk + 1}주가
              바로 이어져 보이지만, 누계에는 반영돼 있습니다({missWk}주 실적 역산 약 {mt(missMt)}).</>}</>}
        >
          <Legend items={[
            { name: '실적', color: C.s1 },
            { name: '계획', color: C.s2, dash: true },
            { name: '갭 (우축)', color: C.danger, box: true },
          ]} />
          <Chart
            data={prod} x="label" height={250} xInterval={3}
            yFmt={mtk} y2Fmt={mtk}
            series={[
              { key: 'cbuRawCum', name: '실적', color: C.s1, fmt: mt },
              { key: 'cbuPlanCum', name: '계획', color: C.s2, dash: true, fmt: mt },
              { key: 'cbuGap', name: '갭', color: C.danger, type: 'area', axis: 'right', fmt: mt },
            ]}
          />
        </Card>

        <Card
          title="갭 확대 추이"
          sub="실적−계획 누적 갭만 따로. 0 위로 올라온 적이 없다."
          note={<>갭은 {latest.week}주에 <b>{mt(gTot)}</b>까지 벌어졌습니다. 주간 전환 {stepCount}회 중
            갭이 좁혀진 주는 {narrowWeeks}회뿐이고{missMt != null && <> (그중 {missWk + 1}주는 결측된
              {' '}{missWk}주 실적이 함께 반영된 착시)</>}, 나머지는 모두 확대입니다.
            {' '}0선 위로 올라온 주는 없어, 만회가 아니라 <b>누적 손실로 굳어지는 형태</b>입니다.</>}
        >
          <Legend items={[{ name: '누적 갭 (실적−계획)', color: C.danger, box: true }]} />
          <Chart
            data={prod} x="label" height={250} xInterval={3} zeroLine yFmt={mtk}
            series={[
              { key: 'cbuGap', name: '누적 갭', color: C.danger, type: 'area', fmt: mt },
            ]}
          />
        </Card>
      </div>

      <SecHead>생산일수인가 처리 속도인가</SecHead>
      <div className="grid g2">
        <Card
          title="일 처리량 추이"
          sub="누적 일처리량(연초부터의 평균)과 계획선, 그리고 그 주의 실제 일처리량."
          note={<>누적 일처리량은 {latest.week}주 현재 <b>{dly(n(cbu?.cumDaily))}</b>로 계획
            {' '}{dly(n(cbu?.planDaily))}에 {num(cbu?.gapDaily, 1)} 미달입니다. 주간 일처리량도 계획선을
            거의 넘지 못해, 한두 주의 사고가 아니라 <b>정상 운전 상태의 속도 자체가 계획보다 낮습니다</b>.
            계획선이 완만히 내려가는 것은 계획 자체가 누적 기준으로 재계산되기 때문입니다.</>}
        >
          <Legend items={[
            { name: '누적 일처리량', color: C.s1 },
            { name: '계획', color: C.s2, dash: true },
            { name: '주간 일처리량', color: C.s5 },
          ]} />
          <Chart
            data={prod} x="label" height={250} xInterval={3} yFmt={(v) => v.toFixed(0)}
            series={[
              { key: 'cbuWeekDaily', name: '주간 일처리량', color: C.s5, fmt: dly },
              { key: 'cbuDaily', name: '누적 일처리량', color: C.s1, fmt: dly },
              { key: 'cbuDailyPlan', name: '계획', color: C.s2, dash: true, fmt: dly },
            ]}
          />
        </Card>

        <Card
          title="수율 추이"
          sub="주간 수율과 누적 수율, 계획 수율(점선). 원어 1MT 투입 대비 제품 산출 비율. 세 계열 차이가 작아 축은 0 이 아니라 데이터 범위에서 시작한다."
          note={<>누적 수율 <b>{pct(cbu?.cumYield, 2)}</b>는 계획 {pct(cbu?.planYield, 2)}에
            {' '}{pp(cbu?.gapYield)} 못 미칩니다. 다만 이 폭은 처리량 갭({pct(pctRate, 1)})보다 훨씬 작아
            <b> 수율은 이번 갭의 주범이 아닙니다</b>.
            {partial.length > 0 && <> 주간 수율이 튀는 {partial.map((p) => p.label).join('·')}는 생산일이
              각각 {partial.map((p) => day(n(p.cbuWeekDays))).join('·')}뿐인 부분 가동 주로,
              투입과 산출의 시차가 비율에 그대로 얹힙니다{topYield && n(topYield.cbuWeekDays) < 3
                ? ` - 주간 최고치 ${pct(topYield.cbuYieldWeek, 2)}도 이 구간에서 나왔습니다`
                : ''}.</>}</>}
        >
          <Legend items={[
            { name: '주간 수율', color: C.s3 },
            { name: '누적 수율', color: C.s1 },
            { name: '계획 수율', color: C.s2, dash: true },
          ]} />
          <Chart
            data={prod} x="label" height={250} xInterval={3} yFmt={(v) => pct(v, 1)}
            domain={tightDomain(prod.flatMap((r) => [r.cbuYieldWeek, r.cbuYieldCum, r.cbuYieldPlan]), 0.15)}
            series={[
              { key: 'cbuYieldWeek', name: '주간 수율', color: C.s3, fmt: (v) => pct(v, 2) },
              { key: 'cbuYieldCum', name: '누적 수율', color: C.s1, fmt: (v) => pct(v, 2) },
              { key: 'cbuYieldPlan', name: '계획 수율', color: C.s2, dash: true, fmt: (v) => pct(v, 2) },
            ]}
          />
        </Card>
      </div>

      <SecHead>주간 처리량과 유닛 비교</SecHead>
      <div className="grid g2">
        <Card
          title="주간 원어처리량 - CBU + FBU"
          sub="두 라인의 주간 투입량을 쌓아 총 처리 규모를 본다."
          note={<>정상 주에는 CBU가 500MT 안팎으로 붙어 있고 FBU가 그 위에 얹힙니다.
            {partial.length > 0 && <> 눈에 띄게 낮은 {partial.map((p) => p.label).join('·')}는
              생산일 {partial.map((p) => day(n(p.cbuWeekDays))).join('·')}의 부분 가동 주이고,
              마지막 {latest.week}주도 생산일 {day(n(cbu?.weekDays))}로 아직 집계 중입니다.</>}
            {' '}CBU 누적 <b>{mt(n(cbu?.cumRawMt))}</b>, FBU 누적 {mt(n(fbu?.cumRawMt))}로
            FBU는 전체의 {pct(n(fbu?.cumRawMt) / Math.max(1, n(cbu?.cumRawMt) + n(fbu?.cumRawMt)), 1)} 규모입니다.</>}
        >
          <Legend items={[
            { name: 'CBU', color: C.s1, box: true },
            { name: 'FBU', color: C.s4, box: true },
          ]} />
          <Chart
            data={prod} x="label" height={250} xInterval={3} yFmt={(v) => v.toFixed(0)}
            series={[
              { key: 'cbuRawWeek', name: 'CBU', color: C.s1, type: 'bar', stackId: 'raw', fmt: mt },
              { key: 'fbuRawWeek', name: 'FBU', color: C.s4, type: 'bar', stackId: 'raw', fmt: mt },
            ]}
          />
        </Card>

        <Card
          title={`CBU vs FBU - ${latest.week}주 기준`}
          sub="주간·누적 실적과 계획·갭. FBU는 원본에 계획이 없어 갭을 산출할 수 없다."
          note={<>FBU는 누적 생산일 {day(n(fbu?.cumDays))}로 CBU의 {pct(n(fbu?.cumDays) / Math.max(1, n(cbu?.cumDays)), 0)}만
            돌았고 일처리량도 {dly(n(fbu?.cumDaily))} 수준입니다. 수율은 FBU가 <b>{pct(fbu?.cumYield, 2)}</b>로
            CBU {pct(cbu?.cumYield, 2)}보다 높지만, <b>FBU에는 계획치가 없어 계획 대비 평가는 CBU로만 가능합니다</b>.</>}
        >
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>지표</th>
                  <th className="n">CBU 주간</th>
                  <th className="n">CBU 누적</th>
                  <th className="n">CBU 계획</th>
                  <th className="n">CBU 갭</th>
                  <th className="n">FBU 주간</th>
                  <th className="n">FBU 누적</th>
                  {hasFbuPlan && <><th className="n">FBU 계획</th><th className="n">FBU 갭</th></>}
                </tr>
              </thead>
              <tbody>
                {cmpRows.map((r) => (
                  <tr key={r.k}>
                    <td>{r.k} <span className="tag">{r.u}</span></td>
                    <td className="n">{r.cw}</td>
                    <td className="n">{r.cc}</td>
                    <td className="n">{r.cp}</td>
                    <td className="n">{r.cg}</td>
                    <td className="n">{r.fw}</td>
                    <td className="n">{r.fc}</td>
                    {hasFbuPlan && <><td className="n">{r.fp}</td><td className="n">{r.fg}</td></>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SecHead>이 갭은 얼마짜리인가</SecHead>
      <div className="grid g2">
        {gapValuation && (
          <Card
            span={2}
            title={`부족분 ${mt(gapValuation.shortMt)}의 금액 환산`}
            sub="조치의 가치를 설비 투자·인력 투입과 비교하려면 금액이 필요하다. 두 기준을 범위로 놓는다."
            note={<>총원가 기준은 <b>{musd(gapValuation.costBasis)}</b>
              (MT당 총원가 중앙값 {usdFmt(gapValuation.medCostPerMt)},
              월별 범위 {usdFmt(gapValuation.perMtRange?.[0])}~{usdFmt(gapValuation.perMtRange?.[1])}),
              매출 기준은 <b>{musd(gapValuation.revBasis)}</b>
              (부족 원어를 수율 {pct(gapValuation.yieldRate, 2)}로 완제품 {num(gapValuation.fgKg / 1000, 0)}톤으로 바꿔
              실현 단가 ${gapValuation.usdPerKg?.toFixed(2)}/kg 로 판다고 가정)입니다.
              <br /><b>실제 손익 영향은 이 사이 어딘가</b>입니다 - 추가 물량에는 변동비만 더 들지
              고정비는 이미 발생했기 때문에 총원가 기준은 상한, 매출 기준은 매출 증가분일 뿐 이익이 아닙니다.
              어느 쪽으로 보든 <b>연간 설비·인력 투자와 비교할 만한 크기</b>라는 것이 요점입니다.
              MT당 원가의 월별 편차가 큰 것은 월 경계가 주 단위로 근사되기 때문이라 중앙값을 썼습니다.</>}
          >
            <Legend items={[
              { name: '총원가 기준 (상한)', color: C.s2, box: true },
              { name: '매출 기준', color: C.s1, box: true },
            ]} />
            <Chart
              horizontal labelWidth={104}
              data={[
                { label: '총원가 기준', v: gapValuation.costBasis, w: null },
                { label: '매출 기준', v: null, w: gapValuation.revBasis },
              ]}
              x="label" height={150} yFmt={(v) => '$' + (v / 1e6).toFixed(1) + 'M'}
              series={[
                { key: 'v', name: '총원가 기준', color: C.s2, type: 'bar', fmt: musdFmt },
                { key: 'w', name: '매출 기준', color: C.s1, type: 'bar', fmt: musdFmt },
              ]}
            />
          </Card>
        )}
      </div>

      <SecHead id="monthly-plan">월간 업무보고 — 월별 계획 대비</SecHead>
      <div className="grid g2">
        <Card
          title="월별 원어 처리량 — 계획 vs 실적·변경"
          sub={`${mr.docSource.file} 기준. 1~${tp.actualThrough}월은 실적, ${tp.actualThrough + 1}월 이후는 변경계획이다. 단위 MT.`}
          span={2}
          note={<>실적 구간 1~{tp.actualThrough}월만 보면 계획 {n0(actualPlan)} MT 대비 <b>{n0(actualDone)} MT</b>
            ({pct(actualDone / actualPlan - 1, 1)})입니다. 연간은 계획 {n0(tp.annual.planMt)} MT 를
            {' '}<b>{n0(tp.annual.revisedMt)} MT 로 하향</b>({n0(tp.annual.revisedMt - tp.annual.planMt)} MT) 개정했는데,
            {tp.actualThrough + 1}월 이후 변경계획의 일 처리량이 {tp.dailyMt[tp.actualThrough]}~{Math.max(...tp.dailyMt.slice(tp.actualThrough))}톤으로
            상반기 실적 일 처리량보다 높게 잡혀 있습니다 — <b>개정 계획 자체가 회복을 전제</b>합니다.
            연간 일 처리량 {tp.annual.dailyMt}톤 × {tp.annual.days}일이 개정치의 근거입니다.</>}
        >
          <Legend items={[
            { name: '계획', color: C.s3, box: true },
            { name: '실적·변경', color: C.s1, box: true },
          ]} />
          <Chart
            data={monthRows} x="label" height={230} yFmt={mtk}
            series={[
              { key: '계획', name: '계획', color: C.s3, type: 'bar', fmt: mt },
              { key: '실적·변경', name: '실적·변경', color: C.s1, type: 'bar', fmt: mt },
            ]}
          />
          <div className="tw" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>월</th><th className="n">계획 (MT)</th><th className="n">실적·변경 (MT)</th>
                  <th className="n">차이 (MT)</th><th className="n">생산일수</th><th className="n">일 처리량 (MT)</th>
                </tr>
              </thead>
              <tbody>
                {monthRows.map((r) => (
                  <tr key={r.label} className={r.gap <= -400 ? 'warn' : undefined}>
                    <td>{r.label} {!r.actual && <span className="tag">변경계획</span>}</td>
                    <td className="n">{n0(r.계획)}</td>
                    <td className="n">{n0(r['실적·변경'])}</td>
                    <td className={`n ${r.gap < 0 ? 'down' : r.gap > 0 ? 'up' : ''}`}>{r.gap === 0 ? '-' : n0(r.gap)}</td>
                    <td className="n">{r.days}일</td>
                    <td className="n">{r.daily}</td>
                  </tr>
                ))}
                <tr className="bad">
                  <td><b>연간</b></td>
                  <td className="n">{n0(tp.annual.planMt)}</td>
                  <td className="n">{n0(tp.annual.revisedMt)}</td>
                  <td className="n down">{n0(tp.annual.revisedMt - tp.annual.planMt)}</td>
                  <td className="n">{tp.annual.days}일</td>
                  <td className="n">{tp.annual.dailyMt}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="컨테이너 출고 — CBU 계획 대비 선적"
          sub={`CBU 는 계획 대비 On Board, FBU 는 계획 구분 없이 한 행이다. 단위 FCL.`}
          span={2}
          note={<>실적 구간 1~{cn.actualThrough}월 CBU 는 계획 {ctnActualPlan} FCL 대비 <b>{ctnActualDone} FCL</b>
            ({pct(ctnActualDone / ctnActualPlan - 1, 1)})입니다. 연간으로는 {n0(cn.annual.cbuPlan)} → {n0(cn.annual.cbuOnBoard)} FCL 로
            {' '}<b>{cn.annual.cbuGap} FCL</b> 부족합니다. 5월만 계획을 {cn.cbuOnBoard[4] - cn.cbuPlan[4]} FCL 넘겼는데,
            같은 달 원어 처리량은 계획 대비 {n0(tp.revised[4] - tp.plan[4])} MT 부족했습니다 —
            <b>출고는 생산이 아니라 재고와 선적 일정을 따릅니다</b>. 주간보고가 지적한 MSC 선박 출항 일정 변경도 같은 축의 변수입니다.
            FBU 는 연간 {cn.annual.fbu} FCL 로 CBU 의 {(cn.annual.fbu / cn.annual.cbuOnBoard * 100).toFixed(0)}% 규모입니다.</>}
        >
          <Legend items={[
            { name: 'CBU 계획', color: C.s3, box: true },
            { name: 'CBU 실적·변경', color: C.s1, box: true },
            { name: 'FBU', color: C.s5, box: true },
          ]} />
          <Chart
            data={ctnRows} x="label" height={210} yFmt={(v) => String(v)}
            series={[
              { key: 'CBU 계획', name: 'CBU 계획', color: C.s3, type: 'bar', fmt: (v) => v + ' FCL' },
              { key: 'CBU 실적·변경', name: 'CBU 실적·변경', color: C.s1, type: 'bar', fmt: (v) => v + ' FCL' },
              { key: 'FBU', name: 'FBU', color: C.s5, type: 'bar', fmt: (v) => v + ' FCL' },
            ]}
          />
        </Card>
      </div>

      <SecHead id="quality-claim">품질 클레임과 개선 대책</SecHead>
      <div className="grid g2">
        <Card
          title={`${qr.trigger.buyer} 클레임 접수 내역`}
          sub={`${qr.source.title} (${qr.source.reportDate}) 기준. 클레임 접수일과 해당 제품의 제조일자.`}
          note={<>{qr.trigger.date.replace(/-/g, '.')} 접수된 공문이 이 보고를 촉발했습니다.
            2025년 이후 <b>{qr.claims.length}건</b> 중 <b>{cleaningClaims}건이 클리닝 부적합</b>이고
            {' '}{qr.claims.filter((c) => c.defects.some((d) => d.includes('어두움'))).length}건이 색상 문제이며,
            모두 같은 제품({qr.claims[0].product})입니다. 접수와 제조 사이가
            {' '}{qr.claims.map((c) => Math.round((Date.parse(c.receivedAt) - Date.parse(c.producedAt[0])) / 86400000 / 30)).join('·')}개월로
            벌어져 있어, <b>불량은 생산 시점보다 한참 뒤에 드러납니다</b> — 지금 라인의 품질이 좋아져도 클레임은 당분간 더 들어옵니다.</>}
        >
          <div className="tw">
            <table>
              <thead><tr><th>접수일</th><th>클레임 내용</th><th>제품 제조일자</th></tr></thead>
              <tbody>
                {qr.claims.map((c) => (
                  <tr key={c.receivedAt} className={c.defects.some((d) => d.includes('클리닝 부적합')) ? 'warn' : undefined}>
                    <td>{c.receivedAt.replace(/-/g, '.')}</td>
                    <td>{c.defects.join(' · ')}{c.note && <span className="tag">{c.note}</span>}</td>
                    <td>{c.producedAt.map((d) => d.replace(/-/g, '.')).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="클리너 인원과 생산성"
          sub={`인원은 ${qr.cleaners.basis}, 생산성은 원어 사이즈가 비슷한 ${qr.productivity.basis} 비교다. 기준 월이 달라 두 표를 섞지 않는다.`}
          note={<>능숙한 클리너가 2024년 {qr.cleaners.rows[0].count}명에서 <b>{qr.cleaners.rows[2].count}명
            ({cleanerDrop}명, {pct(qr.cleaners.rows[2].count / qr.cleaners.rows[0].count - 1, 0)})</b>으로 줄었습니다.
            같은 기간 인당 생산성은 {qr.productivity.rows[0].kgPerManHour} → <b>{qr.productivity.rows[2].kgPerManHour} kg/인시</b>로 올랐는데,
            같은 기간 평균 원어 사이즈는 {qr.productivity.rows[0].kgPerFish} → {qr.productivity.rows[2].kgPerFish} kg/미로 거의 같아,
            어체가 커져서 오른 것이 아닙니다. <b>이 상승은 품질을 깎아 산 것</b>이라는 것이 보고의 진단입니다 — Bruise 를 표면만 제거하고 갈변 표층을 남기면 처리는 빨라집니다.
            대책(완전 제거·Deep Cleaning)은 그래서 <b>수율과 처리량을 동시에 떨어뜨립니다</b>.
            보고는 인센티브·등급제로 품질과 개인 생산성을 함께 걸어 상쇄를 노립니다.</>}
        >
          <div className="tw">
            <table>
              <thead>
                <tr><th>연도</th><th className="n">클리너 수</th>
                  <th className="n">생산성 (kg/인시)</th><th className="n">전년비</th></tr>
              </thead>
              <tbody>
                {qr.productivity.rows.map((r, i) => (
                  <tr key={r.year} className={i === 2 ? 'warn' : undefined}>
                    <td>{r.year}</td>
                    <td className="n">{n0(qr.cleaners.rows[i].count)}</td>
                    <td className="n">{r.kgPerManHour}</td>
                    <td className="n up">{r.yoy == null ? '-' : pct(r.yoy, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="공정별 원인과 개선 대책"
          sub={`입고보관부터 멸균까지 ${qr.processStages.length}개 공정. 핵심 관리 공정은 ${qr.criticalStage}이다.`}
          span={2}
        >
          <div className="tw">
            <table>
              <thead><tr><th>공정</th><th>불량 유형</th><th>현황·문제점</th><th>개선 대책</th></tr></thead>
              <tbody>
                {qr.processStages.map((st) => (
                  <tr key={st.stage} className={st.stage.includes('클리닝') ? 'warn' : undefined}>
                    <td>{st.stage}</td>
                    <td>{st.defect}</td>
                    <td>{st.problem}</td>
                    <td>{st.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="냉동창고 회복 기록과 보수 견적"
          sub={`${qr.freezer.unit} — 만창 ${n0(qr.freezer.capacityMt)}톤 상태의 온도 기록.`}
          note={<>{qr.freezer.issue} 만창에서 −18℃ 에 닿기까지 <b>{freezerDays}일</b> 걸렸습니다.
            콘덴서 1기 보수 견적은 <b>{(qr.freezer.quote.totalKrw / 1e6).toFixed(0)}백만원</b>
            (콘덴서 4EA {n0(qr.freezer.quote.items[0].unitKrw / 1e6)}백만원 등)입니다.
            원문 우선순위 표기가 «{qr.freezer.priorityRaw}» 로 #2가 두 번 나오는데, 원문 그대로 옮겼습니다 — <b>확인이 필요합니다</b>.
            Scow 는 가나 사업장 누적 {n0(qr.scows.total)}개 중 Plate Type 이 {n0(qr.scows.plateType)}개
            ({pct(qr.scows.plateType / qr.scows.total, 0)})뿐이라, 「Plate 우선 사용」은 당분간 물량 제약을 받습니다.</>}
        >
          <div className="tw">
            <table>
              <thead><tr><th>일자</th><th className="n">냉동고 온도</th><th className="n">소요일수</th></tr></thead>
              <tbody>
                {qr.freezer.recovery.map((r) => (
                  <tr key={r.date}>
                    <td>{r.date.replace(/-/g, '.')}</td>
                    <td className="n">{r.tempC} ℃</td>
                    <td className="n">{r.elapsedDays == null ? '-' : r.elapsedDays + '일'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="세부 실행 계획"
          sub={`보고가 낸 ${qr.actions.length}건. 이행 여부는 원자료에 없어 진척을 표시하지 않는다.`}
        >
          <div className="tw">
            <table>
              <thead><tr><th className="n">No</th><th>항목</th><th>내용</th></tr></thead>
              <tbody>
                {qr.actions.map((a) => (
                  <tr key={a.no}><td className="n">{a.no}</td><td>{a.title}</td><td>{a.detail}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SecHead>2025년 대비</SecHead>
      <div className="grid g2">
        <Card
          title="같은 공장, 낮아진 처리 성능"
          sub={`2025년 ${yoy.weeks2025Count}주 전체가 확보돼 **같은 주차 구간(1~${yoy.upTo}주)**으로 비교한다. 계절성이 통제된 비교다.`}
          span={2}
          note={<>같은 1~{yoy.upTo}주 구간에서 <b>일처리량 {dly(yoy.daily2025)} → {dly(yoy.daily2026)},
            {' '}{yoy.dailyDelta.toFixed(1)} MT/일</b>, 수율 {pp(yoy.yieldDelta)}, 원어처리량
            {' '}{mt(Math.abs(yoy.rawMtDelta))} 감소입니다.
            처리량 감소분({mt(Math.abs(yoy.rawMtDelta))})이 계획대비 갭({mt(Math.abs(gTot))})과 비슷한 크기라,
            <b>올해 계획이 사실상 전년 실적 수준으로 잡혀 있었고 그만큼을 못 채운 것</b>으로 읽힙니다.
            같은 구간 누적 판매도 {yoy.salesYoY != null && <b>{pct(yoy.salesYoY, 1)}</b>}입니다.
            {lastAnnual && <> 연간과 대면 <b>수율은 {annual.length}개년 최저</b>({pct(cbu?.cumYield, 2)} vs
              최저 {pct(Math.min(...annual.map((a) => n(a.yield))), 2)})이지만, 일처리량은
              {' '}{annual.filter((a) => n(a.daily) < n(cbu?.cumDaily)).length}개년보다 높고
              {' '}{annual.filter((a) => n(a.daily) >= n(cbu?.cumDaily)).map((a) => a.year).join('·')}년에는 미달입니다
              (장기 추이 보드).</>}
            {' '}2025년 결측은 {yoy.missing2025.map((w) => `W${w}`).join('·') || '없음'}이며 집계에서 제외했습니다.</>}
        >
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>기준</th>
                  <th className="n">2025 (1~{yoy.upTo}주)</th>
                  <th className="n">2026 (1~{latest.week}주)</th>
                  <th className="n">차이</th>
                </tr>
              </thead>
              <tbody>
                {yrRows.map((r) => (
                  <tr key={r.k}>
                    <td>{r.k} <span className="tag">{r.sub}</span></td>
                    <td className="n">{r.a}</td>
                    <td className="n">{r.b}</td>
                    <td className={`n ${r.neg ? 'down' : 'up'}`}>{r.d}</td>
                  </tr>
                ))}
                <tr>
                  <td>집계에 쓴 가동주 <span className="tag">0일 주 제외</span></td>
                  <td className="n">{yoy.sampleWeeks2025}주 / {day(yoy.days2025)}</td>
                  <td className="n">{yoy.sampleWeeks2026}주 / {day(yoy.days2026)}</td>
                  <td className="n">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 18 }}>
        <Callout kind="bad" label="지금 읽히는 것">
          계획 대비 <b>{mt(Math.abs(gTot))}({pct(pctTotal, 1)})</b> 부족의 원인은 생산일수가 아니라
          {' '}<b>처리 속도</b>입니다. 생산일수는 계획 {num(cbu?.planDays, 0)}일 대비
          {' '}{num(Math.abs(n(cbu?.gapDays)), 1)}일 부족해 갭의 {pct(share(gDays), 1)}만 설명하고,
          나머지 <b>{pct(share(gRate), 1)}</b>는
          일 처리량이 계획 {dly(n(cbu?.planDaily))} 대비 {dly(n(cbu?.cumDaily))}에 그친 데서 나옵니다.
          수율 미달({pp(cbu?.gapYield)})은 영향이 훨씬 작습니다.
          {' '}2025년 같은 구간(1~{yoy.upTo}주) 일처리량 {dly(yoy.daily2025)}과 비교하면
          {' '}<b>{yoy.dailyDelta.toFixed(1)} MT/일</b> 낮아, 올해만의 일시적 부진으로 보기 어렵습니다. 생산일을 계획대로 다 채워도 회수되는 양은
          {' '}{mt(Math.abs(gDays))}뿐이므로, <b>대책은 가동일 추가가 아니라 라인 속도 회복</b>에 있어야 합니다.
          고정비는 생산일수가 아니라 달력을 따라 발생하므로, 처리량 부족은 그대로 단위 원가 상승으로 넘어갑니다(손익·원가 보드).
        </Callout>
      </div>
    </>
  )
}
