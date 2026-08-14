import raw from '@/public/data/cosmo/cosmo_2026.json'
import hist from '@/public/data/cosmo/cosmo_history.json'
import exp from '@/public/data/cosmo/cosmo_export.json'

/** CBU 수출 실현 단가($/kg). market.ts 를 import 하면 순환이라 원본에서 직접 읽는다. */
export const marketUsdPerKg = (exp.totals as { usdPerKg: number | null }).usdPerKg

/* ---------------------------------------------------------------- types */

export type SalesLine = {
  item: string; label: string; unit: string
  weekQty: number | null; weekPrice: number | null; weekUsd: number | null
  cumQty: number | null; cumPrice: number | null; cumUsd: number | null
}
export type ProdUnit = {
  weekDays: number | null; weekRawMt: number | null; weekYield: number | null; weekDaily: number | null
  cumDays: number | null; cumRawMt: number | null; cumYield: number | null; cumDaily: number | null
  planDays: number | null; planRawMt: number | null; planYield: number | null; planDaily: number | null
  gapDays: number | null; gapRawMt: number | null; gapYield: number | null; gapDaily: number | null
}
export type InvLine = {
  group: string; item: string; unit: string
  beginQty: number | null; beginUsd: number | null
  inQty: number | null; outQty: number | null
  endQty: number | null; endUsd: number | null
}
export type PurchaseLine = {
  unit: string; supplier: string | null; species: string
  weekMt: number | null; weekPrice: number | null; cumMt: number | null; cumPrice: number | null
}
export type Week = {
  year: number; week: number; source: string; sha256: string
  periodStart?: string; periodEnd?: string
  salesWeekUsd: number | null; salesCumUsd: number | null; salesCumUsdRaw?: number | null
  exportWeekUsd?: number | null; exportCumUsd?: number | null
  domesticWeekUsd?: number | null; domesticCumUsd?: number | null
  sales: SalesLine[]
  backlogItems: { item: string; label: string; qty: number | null; unitPrice: number | null; usd: number | null }[]
  newOrders: { item: string; label: string; qty: number | null; usd: number | null }[]
  backlog_total_fcl?: number | null; backlog_total_usd?: number | null
  new_orders_fcl?: number | null; new_orders_usd?: number | null
  production: Record<string, ProdUnit>
  purchase: { lines: PurchaseLine[]; weekMt?: number | null; weekUsd?: number | null
    cumMt?: number | null; cumUsd?: number | null; cumUnit?: number | null; panofiCumMt?: number | null }
  inventory: { lines: InvLine[]; totalBeginUsd?: number | null; totalInUsd?: number | null
    totalOutUsd?: number | null; totalEndUsd?: number | null }
  cash: { byCurrency: { ccy: string; beginUsd: number | null; endUsd: number | null }[]
    beginUsd?: number | null; inUsd?: number | null; outUsd?: number | null; endUsd?: number | null
    transferUsd?: number | null; externalInUsd?: number | null; externalOutUsd?: number | null }
  ghcRate?: number | null
}
export type Month = {
  month: number
  revenue: number | null; revenueYtd: number | null; revenuePrev: number | null
  cos: number | null; gp: number | null; gpYtd: number | null
  sga: number | null; op: number | null; opYtd: number | null
  nonop: number | null; interest: number | null
  net: number | null; netYtd: number | null; netPrev: number | null
  revenue_cannery: number | null; revenue_fishmeal: number | null
  revenue_cbu: number | null; revenue_fbu: number | null
  net_cbu: number | null; net_fbu: number | null
  costLines: Record<string, number>
  fishPriceSJ?: number | null; fishPriceYF?: number | null; forex?: number | null
}
export type Quote = {
  week: number; kind: string; customer: string; qty: string; expected: string
  fish: string; spec: string; style: string; media: string
  mfgCost: number | null; otherCost: number | null
  totalCost: number | null; sellPrice: number | null; margin: number | null
}
export type Check = { week: number; name: string; residual: number; ok: boolean; note?: string; gap?: boolean }
export type Annual = {
  year: number; revenueKrw: number | null; grossKrw: number | null; opKrw: number | null
  finKrw: number | null; netKrw: number | null
  cbuRawMt: number | null; days: number | null; daily: number | null; yield: number | null; fbuMt: number | null
  /** 금액(원화 결산)이 없고 생산 지표만 있는 해 — 출처가 달라 통화를 섞지 않았다 */
  productionOnly?: boolean
  source?: string
}

/* ------------------------------------------------------------- accessors */

export const meta = raw.meta as {
  generated: string; sourceDir: string; weekCount: number; weekRange: number[]
  missingWeeks: number[]; monthCount: number; quoteCount: number
  checkCount: number; checkFailCount: number
}
export const weeks = raw.weeks as unknown as Week[]
export const monthly = raw.monthly as unknown as Month[]
export const quotes = raw.quotes as unknown as Quote[]
export const checks = raw.checks as unknown as Check[]
export const pastWeeks = hist.weeks as unknown as Week[]
export const annual = hist.annual as unknown as Annual[]
/** 원화 결산이 있는 해만 (참고용 — 화면 기본은 USD) */
export const annualKrw = annual.filter((a) => a.revenueKrw != null)

/** USD 연간 계열 — 대시보드의 모든 금액은 USD 로 통일한다.
 *  2013~2022 는 '연도별' 시트(만불 → USD), 2023~ 은 결산 확정치.
 *  두 출처가 겹치는 구간에서 값이 이어지는지 확인했다(2022 $76.0M → 2023 $76.8M). */
export type AnnualUsd = {
  year: number; basis?: string
  revenue: number | null; cos?: number | null; gp: number | null
  op: number | null; net: number | null; interest?: number | null
  revenue_cbu?: number | null; revenue_fbu?: number | null
  net_cbu?: number | null; net_fbu?: number | null
  cbuRawMt?: number | null; days?: number | null; daily?: number | null
  yield?: number | null; fbuMt?: number | null
}
export const annualUsdSeries = ((hist as { annualUsdSeries?: unknown }).annualUsdSeries ?? []) as AnnualUsd[]
/** 생산 지표가 있는 해 — 생산성 차트용(통화 무관이라 더 길다) */
export const annualProd = annual.filter((a) => a.cbuRawMt != null)
/** 연간 확정 손익(USD). 원화 결산 계열(annual)과 통화가 달라 섞지 않는다.
 *  2026 월별 손익과 같은 USD라 직접 비교된다. */
export const annualUsd = (hist.annualUsd ?? []) as unknown as {
  year: number; source: string
  revenue: number | null; cos: number | null; gp: number | null
  sga: number | null; op: number | null; nonop: number | null
  interest: number | null; net: number | null
  [k: string]: unknown
}[]

export const latest = weeks[weeks.length - 1]
export const latestMonth = monthly[monthly.length - 1]

/* --------------------------------------------------------------- helpers */

export const n = (v: number | null | undefined) => (v == null || Number.isNaN(v) ? 0 : v)
export const usd = (v: number | null | undefined, d = 0) =>
  v == null ? '—' : '$' + v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
export const musd = (v: number | null | undefined, d = 2) =>
  v == null ? '—' : '$' + (v / 1e6).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + 'M'
export const num = (v: number | null | undefined, d = 0) =>
  v == null ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
export const pct = (v: number | null | undefined, d = 1) =>
  v == null ? '—' : (v * 100).toFixed(d) + '%'
export const eok = (v: number | null | undefined, d = 1) =>
  v == null ? '—' : (v / 1e8).toFixed(d) + '억'

/** 4주 이동평균 — 주간 판매액처럼 선적 타이밍에 크게 흔들리는 계열용 */
export function movingAvg(values: (number | null)[], window = 4) {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1).filter((v): v is number => v != null)
    return slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : null
  })
}

/* ------------------------------------------------------- derived series */

/** 생산 계획대비 갭을 '생산일수 탓'과 '일 처리량 탓'으로 분해한다.
 *  총갭 = 실적 − 계획
 *      = (실적일수 − 계획일수) × 계획일처리량   ← 일수 기여
 *      + 실적일수 × (실적일처리량 − 계획일처리량) ← 속도 기여 */
export function gapDecomposition(p: ProdUnit | undefined) {
  if (!p || p.cumDays == null || p.planDays == null || p.cumDaily == null || p.planDaily == null) return null
  const byDays = (p.cumDays - p.planDays) * p.planDaily
  const byRate = p.cumDays * (p.cumDaily - p.planDaily)
  const total = n(p.cumRawMt) - n(p.planRawMt)
  return { byDays, byRate, total, residual: total - byDays - byRate }
}

export const weeklySeries = weeks.map((w, i) => {
  const cbu = w.production?.CBU
  const fbu = w.production?.FBU
  const rawLines = w.inventory.lines.filter((l) => l.group === '원어')
  const rawStock = rawLines.reduce((a, l) => a + n(l.endQty), 0)
  // CBU 라인이 실제로 투입할 수 있는 원어만. 'FBU' 행은 FBU 전용이라 CBU 소진일수 분모와 짝이 맞지 않는다.
  const rawStockCbu = rawLines.filter((l) => l.item !== 'FBU').reduce((a, l) => a + n(l.endQty), 0)
  const productStock = w.inventory.lines
    .filter((l) => l.group.startsWith('제품'))
    .reduce((a, l) => a + n(l.endUsd), 0)
  return {
    week: w.week,
    label: `${w.week}주`,
    period: w.periodEnd ?? '',
    salesWeek: w.salesWeekUsd,
    salesCum: w.salesCumUsd,
    exportCum: w.exportCumUsd ?? null,
    domesticCum: w.domesticCumUsd ?? null,
    backlogFcl: w.backlog_total_fcl ?? null,
    backlogUsd: w.backlog_total_usd ?? null,
    newOrdersUsd: w.new_orders_usd ?? null,
    cbuRawWeek: cbu?.weekRawMt ?? null,
    cbuRawCum: cbu?.cumRawMt ?? null,
    cbuPlanCum: cbu?.planRawMt ?? null,
    cbuGap: cbu ? n(cbu.cumRawMt) - n(cbu.planRawMt) : null,
    cbuYieldWeek: cbu?.weekYield ?? null,
    cbuYieldCum: cbu?.cumYield ?? null,
    cbuYieldPlan: cbu?.planYield ?? null,
    cbuDaily: cbu?.cumDaily ?? null,
    cbuDailyPlan: cbu?.planDaily ?? null,
    fbuRawWeek: fbu?.weekRawMt ?? null,
    fbuYieldWeek: fbu?.weekYield ?? null,
    purchaseWeekMt: w.purchase.weekMt ?? null,
    purchaseCumUnit: w.purchase.cumUnit ?? null,
    purchaseWeekUnit:
      w.purchase.weekMt && w.purchase.weekUsd ? w.purchase.weekUsd / w.purchase.weekMt : null,
    panofiShare:
      w.purchase.cumMt && w.purchase.panofiCumMt ? w.purchase.panofiCumMt / w.purchase.cumMt : null,
    rawStockMt: rawStock,
    rawStockCbuMt: rawStockCbu,
    /** CBU 가용 원어 ÷ 누적 평균 일처리량. 분자에서 FBU 전용 원어를 뺀 값이 기본. */
    rawCoverDays: cbu?.cumDaily ? rawStockCbu / cbu.cumDaily : null,
    /** 최근 속도(당주 일처리량) 기준 — 누적평균은 연초 저조 구간을 끌고 다닌다 */
    rawCoverDaysRecent: cbu?.weekDaily ? rawStockCbu / cbu.weekDaily : null,
    /** 계획 속도로 돌렸을 때의 커버 — 정상 가동 시 며칠 버티는지 */
    rawCoverDaysAtPlan: cbu?.planDaily ? rawStockCbu / cbu.planDaily : null,
    productStockUsd: productStock,
    inventoryUsd: w.inventory.totalEndUsd ?? null,
    cashUsd: w.cash.endUsd ?? null,
    cashNet:
      w.cash.externalInUsd != null && w.cash.externalOutUsd != null
        ? w.cash.externalInUsd - w.cash.externalOutUsd
        : null,
    ghcRate: w.ghcRate ?? null,
    idx: i,
  }
})

const salesMA = movingAvg(weeklySeries.map((s) => s.salesWeek))
weeklySeries.forEach((s, i) => ((s as Record<string, unknown>).salesMA4 = salesMA[i]))

export const monthlySeries = monthly.map((m) => {
  const fish = m.costLines?.Fish ?? null
  const material = ['Fish', 'Media', 'Ingredients', 'Can', 'End', 'Flat Pouch', 'Others']
    .reduce((a, k) => a + n(m.costLines?.[k]), 0)
  const labor = ['Salary (DL)', 'Benefits (DL)', 'Salary (IDL)', 'Benefits (IDL)']
    .reduce((a, k) => a + n(m.costLines?.[k]), 0)
  const energy = ['Electricity', 'RFO', 'Diesel', 'Water']
    .reduce((a, k) => a + n(m.costLines?.[k]), 0)
  const other = ['Consumables', 'Repair/Maintenance', 'Depreciation']
    .reduce((a, k) => a + n(m.costLines?.[k]), 0)
  return {
    month: m.month,
    label: `${m.month}월`,
    revenue: m.revenue, cos: m.cos, gp: m.gp, op: m.op, net: m.net,
    netPrev: m.netPrev, revenuePrev: m.revenuePrev,
    revenueYtd: m.revenueYtd, netYtd: m.netYtd,
    gpMargin: m.revenue && m.gp != null ? m.gp / m.revenue : null,
    netMargin: m.revenue && m.net != null ? m.net / m.revenue : null,
    cannery: m.revenue_cannery, fishmeal: m.revenue_fishmeal,
    cbu: m.revenue_cbu, fbu: m.revenue_fbu,
    fish, material, labor, energy, other,
    fishPriceSJ: m.fishPriceSJ ?? null,
    forex: m.forex ?? null,
    interest: m.interest,
  }
})

/** 월별 손익을 주간 생산량과 잇는다 — 원어 1MT 당 원가·손익 */
export function monthWeeks(month: number) {
  // 주차 종료일(m/d)로 월을 판정. periodEnd 가 없으면 제외.
  return weeks.filter((w) => {
    const m = w.periodEnd?.split('/')[0]
    return m ? Number(m) === month : false
  })
}
export const monthlyUnitCost = monthlySeries.map((m) => {
  const ws = monthWeeks(m.month)
  const mt = ws.reduce((a, w) => a + n(w.production?.CBU?.weekRawMt) + n(w.production?.FBU?.weekRawMt), 0)
  return {
    ...m,
    rawMt: mt || null,
    costPerMt: mt ? n(m.cos) / mt : null,
    fishPerMt: mt ? m.fish != null ? m.fish / mt : null : null,
    energyPerMt: mt ? m.energy / mt : null,
    laborPerMt: mt ? m.labor / mt : null,
  }
})

/* --------------------------------------------------------------- quotes */

/** "1 FCL", "0.85 FCL" 같은 표기에서 수량을 뽑는다. */
export const quoteQtyFcl = (q: Quote) => {
  const m = /(-?\d+(?:\.\d+)?)/.exec(q.qty ?? '')
  return m ? Number(m[1]) : null
}

export const quoteStats = (() => {
  const withMargin = quotes.filter((q): q is Quote & { margin: number } => q.margin != null)
  const sorted = [...withMargin].sort((a, b) => a.margin - b.margin)
  // 짝수 표본의 통계적 중앙값 — 가운데 두 값의 평균
  const mid = sorted.length / 2
  const median = sorted.length === 0 ? null
    : sorted.length % 2 ? sorted[Math.floor(mid)].margin
      : (sorted[mid - 1].margin + sorted[mid].margin) / 2

  // 건수 기준은 소액 건과 대형 건을 동등 취급한다 — 물량가중을 함께 본다
  const withQty = withMargin.map((q) => ({ q, fcl: quoteQtyFcl(q) }))
    .filter((x): x is { q: Quote & { margin: number }; fcl: number } => x.fcl != null && x.fcl > 0)
  const totalFcl = withQty.reduce((a, x) => a + x.fcl, 0)
  const weightedMargin = totalFcl
    ? withQty.reduce((a, x) => a + x.q.margin * x.fcl, 0) / totalFcl : null
  const below3Fcl = withQty.filter((x) => x.q.margin < 0.03).reduce((a, x) => a + x.fcl, 0)
  const negativeFcl = withQty.filter((x) => x.q.margin < 0).reduce((a, x) => a + x.fcl, 0)

  const byCustomer = new Map<string, number>()
  withMargin.forEach((q) => byCustomer.set(q.customer, (byCustomer.get(q.customer) ?? 0) + 1))
  const topCustomer = [...byCustomer.entries()].sort((a, b) => b[1] - a[1])[0] ?? null

  return {
    total: quotes.length,
    withMargin: withMargin.length,
    median,
    negative: withMargin.filter((q) => q.margin < 0).length,
    below3: withMargin.filter((q) => q.margin < 0.03).length,
    below5: withMargin.filter((q) => q.margin < 0.05).length,
    min: sorted.length ? sorted[0].margin : null,
    max: sorted.length ? sorted[sorted.length - 1].margin : null,
    sorted,
    totalFcl, weightedMargin,
    below3FclShare: totalFcl ? below3Fcl / totalFcl : null,
    negativeFcl,
    topCustomer,
    weekRange: withMargin.length
      ? [Math.min(...withMargin.map((q) => q.week)), Math.max(...withMargin.map((q) => q.week))] as [number, number]
      : null,
  }
})()

/* ---------------------------------------------- 생산 갭의 금액 환산 */

/** 계획 대비 부족한 원어처리량이 금액으로 얼마인가.
 *  조치(라인 속도 회복)의 가치를 설비 투자·인력 투입과 비교하려면 금액이 필요하다.
 *
 *  두 기준을 **범위로** 낸다 — 어느 하나만 쓰면 오도한다:
 *   · 총원가 기준 = 부족분 × MT당 총원가. 고정비까지 포함한 '기회손실의 상한'
 *   · 매출 기준   = 부족분 × 수율 × 완제품 단가. 그 물량을 팔았을 때의 매출
 *  실제 손익 영향은 이 사이 어딘가다(추가 물량의 변동비만 더 드므로). */
export const gapValuation = (() => {
  const cbu = latest.production?.CBU
  const g = gapDecomposition(cbu)
  if (!g) return null
  const shortMt = Math.abs(g.total)

  // 월별 MT당 총원가 — 월 경계가 주 단위로 근사돼 편차가 크므로 중앙값을 쓴다
  const perMt = monthlyUnitCost.map((m) => m.costPerMt).filter((v): v is number => v != null).sort((a, b) => a - b)
  const medCost = perMt.length ? perMt[Math.floor(perMt.length / 2)] : null
  const costBasis = medCost ? shortMt * medCost : null

  // 매출 기준 — 부족 원어를 수율만큼 완제품으로 바꿔 실현 단가로 판다고 가정
  const yieldRate = n(cbu?.cumYield)
  const fgKg = shortMt * 1000 * yieldRate
  const usdPerKg = marketUsdPerKg
  const revBasis = usdPerKg ? fgKg * usdPerKg : null

  const lo = costBasis != null && revBasis != null ? Math.min(costBasis, revBasis) : (costBasis ?? revBasis)
  const hi = costBasis != null && revBasis != null ? Math.max(costBasis, revBasis) : (costBasis ?? revBasis)
  return {
    shortMt, medCostPerMt: medCost, costBasis, revBasis, lo, hi,
    yieldRate, fgKg, usdPerKg,
    perMtRange: perMt.length ? [perMt[0], perMt[perMt.length - 1]] as [number, number] : null,
  }
})()

/* ------------------------------------------- 연간 확정 손익 대비 (USD) */

/** 2026 상반기 실적을 전년 **확정 결산**과 같은 통화로 댄다.
 *  연환산은 계절성을 보정하지 않으므로 '진행률'과 '연환산' 둘 다 낸다. */
export const annualCompare = (() => {
  const prior = annualUsd[0]
  const m = monthly[monthly.length - 1]
  if (!prior?.revenue || !m) return null
  const months = monthly.length
  const ann = 12 / months
  const rate = (a: number | null | undefined, b: number | null | undefined) =>
    b ? n(a) / n(b) : null
  return {
    year: prior.year, months,
    revenueYtd: m.revenueYtd, netYtd: m.netYtd, gpYtd: m.gpYtd,
    priorRevenue: prior.revenue, priorNet: prior.net, priorGp: prior.gp,
    /** 전년 실적 대비 진행률 — 6/12=50% 를 넘으면 전년 페이스 이상 */
    revenueProgress: rate(m.revenueYtd, prior.revenue),
    netProgress: rate(m.netYtd, prior.net),
    /** 단순 연환산 (계절성 미보정) */
    revenueAnnualized: n(m.revenueYtd) * ann,
    netAnnualized: n(m.netYtd) * ann,
    revenueYoY: prior.revenue ? (n(m.revenueYtd) * ann) / prior.revenue - 1 : null,
    priorGpRate: prior.revenue ? n(prior.gp) / prior.revenue : null,
    gpRate: m.revenueYtd ? n(m.gpYtd) / n(m.revenueYtd) : null,
    priorNetRate: prior.revenue ? n(prior.net) / prior.revenue : null,
    netRate: m.revenueYtd ? n(m.netYtd) / n(m.revenueYtd) : null,
    priorInterest: prior.interest,
  }
})()

/* ------------------------------------------------ 손익 vs 현금 (괴리) */

/** "6개월 적자인데 현금은 왜 늘었나"에 답하는 계열.
 *  손익은 발생주의, 현금은 실제 유출입이라 둘은 원래 어긋난다 —
 *  어긋나는 **방향과 크기**가 어디서 오는지(재고·채권·채무) 보는 것이 목적이다.
 *  월 경계는 주차 종료일 기준이라 ±며칠 어긋날 수 있다. */
export const profitCash = (() => {
  const wOf = (m: number) => weeks.filter((w) => Number((w.periodEnd ?? '').split('/')[0]) === m)
  const rows = monthly.map((m) => {
    const ws = wOf(m.month)
    const cash = ws.reduce((a, w) => a + n(w.cash.externalInUsd) - n(w.cash.externalOutUsd), 0)
    const covered = ws.filter((w) => w.cash.externalInUsd != null).length
    return {
      month: m.month, label: `${m.month}월`,
      net: m.net, cash,
      gap: cash - n(m.net),
      weeks: ws.length, covered,
    }
  })
  const netSum = rows.reduce((a, r) => a + n(r.net), 0)
  const cashSum = rows.reduce((a, r) => a + r.cash, 0)
  const first = weeks[0], last = weeks[weeks.length - 1]
  return {
    rows, netSum, cashSum, gap: cashSum - netSum,
    cashStart: first?.cash.endUsd ?? null, cashEnd: last?.cash.endUsd ?? null,
    cashDelta: n(last?.cash.endUsd) - n(first?.cash.endUsd),
    invStart: first?.inventory.totalEndUsd ?? null, invEnd: last?.inventory.totalEndUsd ?? null,
    invDelta: n(last?.inventory.totalEndUsd) - n(first?.inventory.totalEndUsd),
    coverage: rows.every((r) => r.covered === r.weeks),
  }
})()

/* ------------------------------------------------- 전년 동기 비교 (2025) */

/** 미가동 주를 뺀 CBU 주간 집계.
 *  일처리량은 Σ원어 ÷ Σ생산일, 수율은 원어량 가중 — 부분가동 주가 과대 반영되지 않는다. */
export function cbuAggregate(ws: Week[]) {
  const r = ws.map((w) => w.production?.CBU).filter((p): p is ProdUnit => !!p && n(p.weekDays) > 0)
  const raw = r.reduce((a, p) => a + n(p.weekRawMt), 0)
  const days = r.reduce((a, p) => a + n(p.weekDays), 0)
  return {
    count: r.length, rawMt: raw, days,
    daily: days ? raw / days : 0,
    yield: raw ? r.reduce((a, p) => a + n(p.weekRawMt) * n(p.weekYield), 0) / raw : 0,
  }
}

export const weeks2025 = pastWeeks.filter((w) => w.year === 2025).sort((a, b) => a.week - b.week)

/** 2025년과 2026년을 **같은 주차 구간**에서 비교한다.
 *  구간을 맞추지 않으면 계절성이 그대로 섞여 결론이 뒤집힌다 —
 *  실제로 2025 표본이 연말 13주뿐이었을 때는 일처리량이 2026 쪽이 높게 나왔다. */
export const yoy = (() => {
  const upTo = latest.week
  const a25 = cbuAggregate(weeks2025.filter((w) => w.week <= upTo))
  const a26 = cbuAggregate(weeks)
  const s25 = weeks2025.find((w) => w.week === upTo)
  const s26 = weeks[weeks.length - 1]
  const have = new Set(weeks2025.map((w) => w.week))
  return {
    upTo,
    weeks2025Count: weeks2025.length,
    missing2025: Array.from({ length: 52 }, (_, i) => i + 1).filter((w) => !have.has(w)),
    /** 동일 구간(W1~현재주) 비교 — 계절성 통제됨 */
    daily2025: a25.daily, daily2026: a26.daily, dailyDelta: a26.daily - a25.daily,
    yield2025: a25.yield, yield2026: a26.yield, yieldDelta: a26.yield - a25.yield,
    rawMt2025: a25.rawMt, rawMt2026: a26.rawMt, rawMtDelta: a26.rawMt - a25.rawMt,
    days2025: a25.days, days2026: a26.days,
    sampleWeeks2025: a25.count, sampleWeeks2026: a26.count,
    /** 같은 주차의 누적 판매액 */
    salesCum2025: s25?.salesCumUsd ?? null,
    salesCum2026: s26?.salesCumUsd ?? null,
    salesYoY: s25?.salesCumUsd && s26?.salesCumUsd ? s26.salesCumUsd / s25.salesCumUsd - 1 : null,
    /** 2025 연간 전체 (참고) */
    fullYear2025: cbuAggregate(weeks2025),
  }
})()

/* --------------------------------------------------------- 자재 소진 */

/** 공관·ENDS·주입액의 잔여 주수 = 잔량 ÷ 최근 4주 평균 출고.
 *  원어가 넉넉해도 자재가 먼저 떨어지면 라인이 선다 — 공급 신호는 둘 중 나쁜 쪽으로 판정해야 한다. */
export const materialBurn = (() => {
  const MAT = ['공관', 'ENDS', '주입액']
  const recent = weeks.slice(-4)
  const rows = latest.inventory.lines
    .filter((l) => MAT.includes(l.group))
    .map((l) => {
      const outs = recent
        .map((w) => w.inventory.lines.find((x) => x.group === l.group && x.item === l.item)?.outQty)
        .filter((v): v is number => v != null && v > 0)
      const avgOut = outs.length ? outs.reduce((a, b) => a + b, 0) / outs.length : 0
      return {
        group: l.group, item: l.item, unit: l.unit,
        endQty: l.endQty, avgOut,
        weeksLeft: avgOut > 0 ? n(l.endQty) / avgOut : null,
      }
    })
    .sort((a, b) => (a.weeksLeft ?? Infinity) - (b.weeksLeft ?? Infinity))
  const withLeft = rows.filter((r) => r.weeksLeft != null)
  return {
    rows,
    shortest: withLeft[0] ?? null,
    under4: withLeft.filter((r) => (r.weeksLeft as number) < 4).length,
    under8: withLeft.filter((r) => (r.weeksLeft as number) < 8).length,
  }
})()

/** 견적 마진이 넘어야 할 선 — 판관비율 + 이자비율 (YTD 실적 기준).
 *  3% 같은 임의 컷이 아니라 실제 손익분기 마진이 어디인지 보여준다. */
export const breakevenMargin = (() => {
  const m = monthly[monthly.length - 1]
  if (!m?.revenueYtd) return null
  const sga = Math.abs(n(m.sga ? monthly.reduce((a, x) => a + n(x.sga), 0) : 0))
  const interest = Math.abs(monthly.reduce((a, x) => a + n(x.interest), 0))
  const gpYtd = monthly.reduce((a, x) => a + n(x.gp), 0)
  const fixedUsd = sga + interest
  return {
    revenueYtd: m.revenueYtd,
    fixedUsd,                                   // 금액 고정 — 매출에 비례하지 않는다
    sgaRate: sga / m.revenueYtd,
    interestRate: interest / m.revenueYtd,
    required: fixedUsd / m.revenueYtd,          // '현 매출 규모에서' 필요한 마진율
    realizedGpRate: gpYtd / m.revenueYtd,
    /** 마진율을 고정했을 때 고정비를 덮는 매출 — 판가를 못 올리면 규모로 가야 하는 크기 */
    breakevenRevenueAt: (margin: number) => (margin > 0 ? fixedUsd / margin : null),
  }
})()

/** 마진 구간별 건수 — 히스토그램용 */
export const marginBuckets = (() => {
  const edges = [-0.02, 0, 0.02, 0.04, 0.06, 0.08, 0.1]
  const buckets = edges.slice(0, -1).map((lo, i) => ({
    label: `${(lo * 100).toFixed(0)}~${(edges[i + 1] * 100).toFixed(0)}%`,
    // 위험 기준은 임의의 3% 가 아니라 실제 손익분기 마진(판관+이자)이다.
    lo, hi: edges[i + 1], count: 0, risk: edges[i + 1] <= (breakevenMargin?.required ?? 0.03),
  }))
  quoteStats.sorted.forEach((q) => {
    const b = buckets.find((x) => q.margin >= x.lo && q.margin < x.hi) ?? buckets[buckets.length - 1]
    b.count += 1
  })
  return buckets
})()

/* ----------------------------------------------------------- 신호등 */

export type Signal = { key: string; label: string; level: 'ok' | 'warn' | 'bad'; value: string; note: string; href: string }

export const signals: Signal[] = (() => {
  const out: Signal[] = []
  const cbu = latest.production?.CBU
  const gap = gapDecomposition(cbu)

  const netYtd = latestMonth?.netYtd ?? null
  out.push({
    key: 'profit', label: '수익성',
    level: netYtd == null ? 'warn' : netYtd < 0 ? 'bad' : 'ok',
    value: musd(netYtd),
    note: `${latestMonth?.month}월 누적 순손익 · ${monthlySeries.filter((m) => n(m.net) < 0).length}/${monthlySeries.length}개월 적자`,
    href: '/profit#sec-margin',
  })

  const gapPct = cbu?.planRawMt ? (n(cbu.cumRawMt) - n(cbu.planRawMt)) / n(cbu.planRawMt) : null
  out.push({
    key: 'production', label: '생산 계획대비',
    level: gapPct == null ? 'warn' : gapPct < -0.1 ? 'bad' : gapPct < -0.03 ? 'warn' : 'ok',
    value: pct(gapPct),
    note: gap ? `${num(gap.total, 0)}MT · 속도 기여 ${Math.round((gap.byRate / gap.total) * 100)}%` : '',
    href: '/production#sec-gap',
  })

  // 손익분기 마진(판관+이자)에 못 미치는 물량 비중으로 판정 — 건수보다 물량이 실질에 가깝다
  const wm = quoteStats.weightedMargin
  const need = breakevenMargin?.required ?? null
  out.push({
    key: 'margin', label: '견적 마진',
    level: wm == null || need == null ? 'warn' : wm < need ? 'bad' : 'ok',
    value: pct(wm, 2),
    note: `물량가중 · 손익분기 ${pct(need, 1)} 필요 · 3% 미만 물량 ${pct(quoteStats.below3FclShare, 0)}`,
    href: '/sales#sec-repricing',
  })

  // 공급 신호는 원어와 자재 중 **나쁜 쪽**으로 판정한다.
  // 원어가 5주 남아도 주입액이 0.3주면 라인은 0.3주 뒤에 선다.
  const cover = weeklySeries[weeklySeries.length - 1].rawCoverDays
  const rawWeeks = cover == null ? null : cover / 7
  const matWeeks = materialBurn.shortest?.weeksLeft ?? null
  const binding = matWeeks == null ? rawWeeks
    : rawWeeks == null ? matWeeks : Math.min(rawWeeks, matWeeks)
  const shortName = materialBurn.shortest
    ? `${materialBurn.shortest.group}·${materialBurn.shortest.item}` : null
  out.push({
    key: 'supply', label: '공급 잔여 (원어·자재 중 단축)',
    level: binding == null ? 'warn' : binding < 1 ? 'bad' : binding < 3 ? 'warn' : 'ok',
    value: binding == null ? '—'
      : binding === matWeeks ? `${matWeeks.toFixed(1)}주` : `${cover!.toFixed(0)}일`,
    note: matWeeks != null && shortName
      ? `최단 ${shortName} ${matWeeks.toFixed(1)}주 · 원어 ${cover?.toFixed(0)}일 · 4주 미만 자재 ${materialBurn.under4}종`
      : 'CBU 가용 원어(FBU 전용 제외) ÷ 누적 일 처리량',
    href: '/supply#sec-material',
  })

  const cash = latest.cash.endUsd ?? null
  const cashPrev = weeks[weeks.length - 2]?.cash?.endUsd ?? null
  out.push({
    key: 'cash', label: '현금잔액',
    level: cash == null ? 'warn' : cash < 3e6 ? 'bad' : cash < 5e6 ? 'warn' : 'ok',
    value: musd(cash),
    note: cashPrev != null && cash != null ? `전주 대비 ${musd(cash - cashPrev)}` : '',
    href: '/cash#sec-flow',
  })

  out.push({
    key: 'quality', label: '데이터 정합성',
    level: meta.checkFailCount === 0 ? 'ok' : meta.checkFailCount > 10 ? 'bad' : 'warn',
    value: `${meta.checkFailCount}건`,
    note: `검산 ${meta.checkCount}건 중 잔차 초과`,
    href: '/quality#sec-fail',
  })
  return out
})()
