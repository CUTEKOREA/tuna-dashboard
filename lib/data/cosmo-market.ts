import ex from '@/public/data/cosmo/cosmo_export.json'
import ts from '@/public/data/cosmo/trade_stats.json'
import { n } from './cosmo'

/* ------------------------------------------------------------------ types */

export type Grp = {
  key: string; containers: number; fcl: number; amountUsd: number
  qtyKg: number; cases: number; kgKnown: number; kgCoverage: number
  share: number; usdPerFcl: number | null; usdPerKg: number | null
}
export type ExportRow = {
  month: string | null; container: string; invoiceParty: string; buyer: string
  port: string; market: string; fcl: number; amountUsd: number
  cases: number | null; cansPerCase: number | null; netWeightG: number | null
  qtyKg: number | null; unitPricePerCase: number | null
  brand: string; specGroup: string; nwdw: string; style: string; media: string; liner: string
}
type Imp = {
  country: string; iso?: string; hs: string; year: number
  valueUsd: number; qtyKg: number; unitUsdKg: number
  source?: string; grade?: string; period?: string
}
type Sup = {
  country: string; hs: string; year: number; partner: string
  valueUsd: number; qtyKg?: number; share?: number; source?: string; grade?: string
  period?: string
}

export const exportMeta = ex.meta as {
  generated: string; source: string; sheet: string; sha256: string; scope: string
  containerRows: number; uniqueContainers: number; buyerCount: number
  marketCount: number; portCount: number; brandCount: number; unmappedPortFcl: number
}
export const totals = ex.totals as {
  containers: number; fcl: number; amountUsd: number; qtyKg: number; cases: number
  kgCoverage: number; usdPerFcl: number | null; usdPerKg: number | null
}
export const concentration = ex.concentration as {
  buyerHHI: number; marketHHI: number; top3BuyerShare: number; top5BuyerShare: number
  topBuyer: string | null; topBuyerShare: number | null
}
export const byMarket = ex.byMarket as unknown as Grp[]
export const byBuyer = ex.byBuyer as unknown as Grp[]
export const byInvoiceParty = ex.byInvoiceParty as unknown as Grp[]
export const bySpecGroup = ex.bySpecGroup as unknown as Grp[]
export const byMedia = ex.byMedia as unknown as Grp[]
export const byBrand = ex.byBrand as unknown as Grp[]
export const marketSpec = ex.marketSpec as { market: string; specGroup: string; fcl: number; amountUsd: number }[]
export const exportChecks = ex.checks as { name: string; got: number | null; expected: number; tolerance: number; ok: boolean }[]
export const exportRows = ex.rows as unknown as ExportRow[]
export const exportSources = ex.sources as { year: number; file: string; period: string
  sha256: string; rows: number; fcl: number; amountUsd: number }[]
const priorRaw = ex.prior as unknown as {
  years: number[]
  totals: { containers: number; fcl: number; amountUsd: number }
  byMarket: Grp[]; byBuyer: Grp[]; bySpecGroup: Grp[]
}

const imports = (ts.imports ?? []) as unknown as Imp[]
const suppliers = (ts.suppliers ?? []) as unknown as Sup[]
export const tradeMeta = {
  ...(ts.meta as {
    collected: string; hs: string[]; note: string
    coverage?: Record<string, string | string[]>
  }),
  coverage: ((ts.meta as { coverage?: Record<string, string | string[]> }).coverage ?? {}),
  /** 회귀 테스트가 원본 행을 직접 검산할 수 있도록 열어 둔다 (화면에서는 쓰지 않는다) */
  raw: { imports, suppliers },
}

/* 원장의 시장명(한글) ↔ 무역통계의 국가명(영문) */
const MARKET_COUNTRY: Record<string, string> = {
  영국: 'United Kingdom', 독일: 'Germany', 이탈리아: 'Italy', 네덜란드: 'Netherlands',
  벨기에: 'Belgium', 아일랜드: 'Ireland', 스페인: 'Spain', 덴마크: 'Denmark',
  프랑스: 'France', 폴란드: 'Poland', 그리스: 'Greece',
  슬로베니아: 'Slovenia', 크로아티아: 'Croatia', 포르투갈: 'Portugal',
}
const HS_CAN = '160414'

/** 무역통계에 연도가 여러 개다. 전체가 있는 가장 최근 연도를 기준으로 쓴다
 *  (부분 연도는 `period` 가 붙어 있어 연간 비교의 분모로 못 쓴다). */
export const benchYear = (() => {
  const full = imports.filter((x) => x.hs === HS_CAN && !x.period)
  return full.length ? Math.max(...full.map((x) => x.year)) : null
})()

/** 창(window)이 여럿일 수 있다 — 원장과 맞춘 짧은 창, 발행 끝까지 간 긴 창.
 *  의도된 복수 창과 «출처마다 기간이 어긋난 상태»는 다르다. 후자는 비교가 성립하지 않으므로
 *  한 창 안에 모든 보고국이 같은 기간으로 들어와 있을 때만 그 창을 인정한다. */
function completeWindows(year: number): string[] {
  const rows = imports.filter((x) => x.hs === HS_CAN && x.year === year && x.period)
  const countries = new Set(rows.map((x) => x.country))
  const byPeriod = new Map<string, Set<string>>()
  for (const row of rows) {
    const set = byPeriod.get(row.period!) ?? new Set<string>()
    set.add(row.country)
    byPeriod.set(row.period!, set)
  }
  return [...byPeriod.entries()]
    .filter(([, seen]) => seen.size === countries.size)
    .map(([period]) => period)
    .sort()
}

/** 부분 연도 중 가장 최근 것. 창이 여럿이면 가장 긴 창을 쓴다. */
export const partialYear = (() => {
  const partial = imports.filter((x) => x.hs === HS_CAN && x.period)
  if (!partial.length) return null
  const year = Math.max(...partial.map((x) => x.year))
  const windows = completeWindows(year)
  return windows.length ? { year, period: windows[windows.length - 1] } : null
})()

/** 「2026-01..2026-06」을 「1~6월」로. 화면에는 한글 기간만 노출한다. */
export function periodLabelKo(period: string): string {
  const match = /^(\d{4})-(\d{2})\.\.(\d{4})-(\d{2})$/.exec(period)
  if (!match) return period
  const [, , from, , to] = match
  return `${Number(from)}~${Number(to)}월`
}

const impOf = (country: string, year: number | null, period?: string | null) =>
  imports.find((x) => x.hs === HS_CAN && x.country === country && x.year === year
    && (period ? x.period === period : !x.period))
const ghanaOf = (country: string, year: number | null, period?: string | null) =>
  suppliers.find((x) => x.hs === HS_CAN && x.country === country && x.year === year
    && (period ? x.period === period : !x.period) && /ghana/i.test(x.partner))

/** COSMO 원장이 덮는 달 수. 파일명이 아니라 행에 실제로 찍힌 월에서 센다 —
 *  원장이 한 달 늘어나면 환산 계수도 같이 움직여야 하기 때문이다. */
export const ledgerMonths = (() => {
  const NAMES = ['january','february','march','april','may','june',
    'july','august','september','october','november','december']
  const seen = new Set<number>()
  for (const row of ex.rows as { month?: string | null }[]) {
    const i = row.month ? NAMES.indexOf(row.month.trim().toLowerCase()) : -1
    if (i >= 0) seen.add(i + 1)
  }
  return seen.size || 5
})()

/** COSMO 실적은 원장이 덮는 달까지다. 연간 수입액과 대려면 연환산해야 한다.
 *  ⚠️ 계절성을 보정하지 않은 단순 환산이라 참고치다. */
export const ANNUALIZE = 12 / ledgerMonths

/** 원장과 같은 달 수를 덮는 시장 통계 구간. 없으면 null —
 *  기간이 다른 것을 단가로 대면 그 차이가 곧 가짜 격차가 된다. */
export const ledgerAlignedWindow = (() => {
  const partial = imports.filter((x) => x.hs === HS_CAN && x.period)
  if (!partial.length) return null
  const year = Math.max(...partial.map((x) => x.year))
  const periods = completeWindows(year)
  const match = periods.find((p) => {
    const m = /^(\d{4})-(\d{2})\.\.(\d{4})-(\d{2})$/.exec(p)
    return m ? Number(m[4]) - Number(m[2]) + 1 === ledgerMonths : false
  })
  return match ? { year, period: match } : null
})()

/* ----------------------------------------------------- 단가 포지션 (핵심) */

/** COSMO 실현 단가가 그 시장의 수입 평균 단가 대비 어디에 있는가.
 *  점유율이 "얼마나 파는가"라면 이건 "제값 받는가"에 답한다.
 *  물량 기준 $/kg 이라 통계의 NET MASS 와 축이 같다. */
/** 단가 비교의 기준 구간 — 원장과 달 수가 같은 창이 있으면 그것을, 없으면 직전 연간을 쓴다. */
export const priceBasis = ledgerAlignedWindow ?? { year: benchYear, period: null as string | null }

export const pricePosition = byMarket
  .map((m) => {
    const c = MARKET_COUNTRY[m.key]
    const imp = c ? impOf(c, priceBasis.year, priceBasis.period) : undefined
    const gh = c ? ghanaOf(c, priceBasis.year, priceBasis.period) : undefined
    const priorImp = c && priceBasis.period ? impOf(c, benchYear, null) : undefined
    const ghUnit = gh?.qtyKg ? gh.valueUsd / gh.qtyKg : null
    if (!imp || m.usdPerKg == null) return null
    return {
      market: m.key,
      cosmoUsdKg: m.usdPerKg,
      marketUsdKg: imp.unitUsdKg,
      priorMarketUsdKg: priorImp?.unitUsdKg ?? null,
      ghanaUsdKg: ghUnit,
      vsMarket: m.usdPerKg / imp.unitUsdKg - 1,
      vsGhana: ghUnit ? m.usdPerKg / ghUnit - 1 : null,
      fcl: m.fcl,
      amountUsd: m.amountUsd,
      grade: imp.grade ?? null,
      // 물량이 미미한 시장(수 FCL)은 단가가 한두 건에 좌우돼 대표값으로 못 쓴다
      material: m.share >= 0.02,
    }
  })
  .filter((x): x is NonNullable<typeof x> => x != null)
  .sort((a, b) => b.amountUsd - a.amountUsd)

/** 시장 평균 단가까지 올렸다면 얼마를 더 받았을까 — 재가격의 상단 추정.
 *  실제로는 그 단가에 물량이 그대로 유지되지 않으므로 **이론적 상한**이다. */
/** 최저·최고를 뽑을 때 쓰는 집합 — 매출 비중 2% 이상 시장만. */
export const pricePositionMaterial = pricePosition.filter((p) => p.material)

export const repricingUpside = (() => {
  const gap = pricePosition.reduce((a, p) => a + Math.max(0, (p.marketUsdKg - p.cosmoUsdKg)) * (p.amountUsd / p.cosmoUsdKg), 0)
  const base = pricePosition.reduce((a, p) => a + p.amountUsd, 0)
  return { upsideUsd: gap, baseUsd: base, ratio: base ? gap / base : null }
})()

/* --------------------------------------------------------------- 점유율 */

/** 가나 전체가 각 시장에서 차지하는 비중. 무역통계 내부에서 나온 값이라 신뢰도가 높다. */
/** 점유율은 기간 길이와 무관하게 비교되므로 가장 최근 구간(반기)을 쓴다. */
export const shareBasis = partialYear ?? { year: benchYear, period: null as string | null }

export const ghanaShare = byMarket
  .map((m) => {
    const c = MARKET_COUNTRY[m.key]
    const imp = c ? impOf(c, shareBasis.year, shareBasis.period) : undefined
    const gh = c ? ghanaOf(c, shareBasis.year, shareBasis.period) : undefined
    const priorImp = c && shareBasis.period ? impOf(c, benchYear, null) : undefined
    const priorGh = c && shareBasis.period ? ghanaOf(c, benchYear, null) : undefined
    if (!imp || !gh) return null
    const priorShareValue = priorImp && priorGh ? priorGh.valueUsd / priorImp.valueUsd : null
    return {
      market: m.key, country: c,
      priorShareValue,
      shareValueDelta: priorShareValue != null ? gh.valueUsd / imp.valueUsd - priorShareValue : null,
      marketValueUsd: imp.valueUsd, marketQtyKg: imp.qtyKg,
      ghanaValueUsd: gh.valueUsd, ghanaQtyKg: gh.qtyKg ?? null,
      shareValue: gh.valueUsd / imp.valueUsd,
      shareQty: gh.qtyKg && imp.qtyKg ? gh.qtyKg / imp.qtyKg : null,
      cosmoAnnualUsd: m.amountUsd * ANNUALIZE,
      grade: gh.grade ?? null,
    }
  })
  .filter((x): x is NonNullable<typeof x> => x != null)
  .sort((a, b) => b.ghanaValueUsd - a.ghanaValueUsd)

/** COSMO 의 유럽 합계 점유율.
 *  ⚠️ 국가별로는 쓰지 않는다 — 원장의 시장은 **양륙항** 기준이고 무역통계는 **신고 수입국** 기준이라,
 *  Rotterdam·Antwerp 로 양륙해 내륙 배송되는 물량 때문에 국가 단위로는 100% 를 넘는 곳이 생긴다.
 *  합계 수준에서만 의미가 있다. */
export const aggregateShare = (() => {
  const covered = ghanaShare.map((g) => g.market)
  const cosmo = byMarket.filter((m) => covered.includes(m.key)).reduce((a, m) => a + m.amountUsd, 0) * ANNUALIZE
  const ghana = ghanaShare.reduce((a, g) => a + g.ghanaValueUsd, 0)
  const market = ghanaShare.reduce((a, g) => a + g.marketValueUsd, 0)
  return {
    markets: covered.length,
    cosmoAnnualUsd: cosmo, ghanaUsd: ghana, marketUsd: market,
    cosmoInGhana: ghana ? cosmo / ghana : null,
    cosmoInMarket: market ? cosmo / market : null,
    ghanaInMarket: market ? ghana / market : null,
  }
})()

/** 가나 점유율 추이 — 연도별에 최신 부분 구간을 한 점 덧붙인다.
 *  점유율은 기간 길이에 좌우되지 않으므로 연간 옆에 반기를 놓아도 축이 어긋나지 않는다.
 *  다만 성격이 다른 점이라 `partial` 로 표시해 화면이 구분해 그리게 한다. */
export const ghanaTrend = (() => {
  const years = [...new Set(suppliers.filter((s) => s.hs === HS_CAN && /ghana/i.test(s.partner)).map((s) => s.year))]
    .filter((y) => imports.some((i) => i.hs === HS_CAN && i.year === y && !i.period))
    .sort()
  const markets = ghanaShare.slice(0, 4).map((g) => g.market)
  const point = (year: number | null, period: string | null, label: string, partial: boolean) => {
    const row: Record<string, unknown> = { year, label, partial }
    markets.forEach((mk) => {
      const c = MARKET_COUNTRY[mk]
      const imp = impOf(c, year, period)
      const gh = ghanaOf(c, year, period)
      row[mk] = imp && gh ? gh.valueUsd / imp.valueUsd : null
    })
    return row
  }
  const rows = years.map((y) => point(y, null, String(y), false))
  if (partialYear) {
    rows.push(point(partialYear.year, partialYear.period,
      `${partialYear.year} ${periodLabelKo(partialYear.period)}`, true))
  }
  return rows
})()

/** 경쟁 공급국 — 같은 시장에 누가 얼마나 들어오나.
 *  업무보고의 "영국 무관세로 태국·인니 저가 공세"를 정량화한다. */
type SupplierRow = {
  partner: string; valueUsd: number; qtyKg: number | null
  share: number | null; usdPerKg: number | null; isGhana: boolean; rank: number
}

/** 한 시장·한 기간의 공급국 순위표. 기간이 연간이든 반기든 계산은 같다. */
function rankSuppliers(country: string, year: number | null, period: string | null) {
  const imp = impOf(country, year, period)
  const all: SupplierRow[] = suppliers
    .filter((s) => s.hs === HS_CAN && s.country === country && s.year === year
      && (period ? s.period === period : !s.period))
    .map((s) => ({
      partner: s.partner,
      valueUsd: s.valueUsd,
      qtyKg: s.qtyKg ?? null,
      share: imp ? s.valueUsd / imp.valueUsd : null,
      usdPerKg: s.qtyKg ? s.valueUsd / s.qtyKg : null,
      isGhana: /ghana/i.test(s.partner),
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd)
    .map((r, i) => ({ ...r, rank: i + 1 }))
  return { imp, all }
}

export const competitors = (() => {
  const focus = ghanaShare.slice(0, 4).map((g) => ({ market: g.market, country: g.country }))
  // 화면 기준은 가장 최근 구간이다 - 부분 연도가 두 출처를 같은 기간으로 덮으면 그쪽을 쓴다.
  const head = partialYear ?? { year: benchYear, period: null as string | null }
  return focus.map(({ market, country }) => {
    const { imp, all } = rankSuppliers(country, head.year, head.period)
    // 비교축: 부분 연도를 보고 있을 때만 직전 «연간»을 함께 얹는다.
    const prior = head.period ? rankSuppliers(country, benchYear, null) : null

    const TOP_N = 10
    const top = all.slice(0, TOP_N)
    const gh = all.find((r) => r.isGhana)
    const rows = (gh && !top.some((r) => r.isGhana) ? [...top, gh] : top).map((r) => {
      const was = prior?.all.find((p) => p.partner === r.partner) ?? null
      return {
        ...r,
        priorShare: was?.share ?? null,
        priorRank: was?.rank ?? null,
        // 점유율은 기간 길이와 무관하게 비교된다. 금액은 반기 대 연간이라 비교하지 않는다.
        shareDelta: was?.share != null && r.share != null ? r.share - was.share : null,
        rankDelta: was ? was.rank - r.rank : null,
      }
    })
    const ghRow = rows.find((r) => r.isGhana) ?? null
    return {
      market, country, marketUsdKg: imp?.unitUsdKg ?? null, rows, topN: TOP_N,
      ghanaRank: gh?.rank ?? null, supplierCount: all.length,
      ghanaOutsideTop: !!gh && gh.rank > TOP_N,
      year: head.year, period: head.period,
      periodLabel: head.period ? periodLabelKo(head.period) : '연간',
      priorYear: prior ? benchYear : null,
      priorMarketUsdKg: prior?.imp?.unitUsdKg ?? null,
      ghanaShareDelta: ghRow?.shareDelta ?? null,
      ghanaRankDelta: ghRow?.rankDelta ?? null,
      priorSupplierCount: prior?.all.length ?? null,
    }
  })
})()

/* ------------------------------------------------------------ 파생 편의 */

export const marketSpecCross = (() => {
  const markets = byMarket.slice(0, 5).map((m) => m.key)
  const specs = [...new Set(marketSpec.map((x) => x.specGroup))]
  return markets.map((mk) => {
    const row: Record<string, unknown> = { label: mk }
    specs.forEach((sp) => {
      row[sp] = marketSpec.find((x) => x.market === mk && x.specGroup === sp)?.amountUsd ?? 0
    })
    return row
  })
})()
export const specGroups = [...new Set(marketSpec.map((x) => x.specGroup))]

/** 단가가 낮은 바이어 = 재가격 1순위. 물량 3 FCL 이상만 (단발 건 제외). */
export const buyerBand = byBuyer
  .filter((b) => b.fcl >= 3 && b.usdPerFcl != null)
  .map((b) => ({ buyer: b.key, fcl: b.fcl, amountUsd: b.amountUsd, usdPerFcl: b.usdPerFcl as number, share: b.share }))
  .sort((a, b) => a.usdPerFcl - b.usdPerFcl)

/* --------------------------------------------------- 전년 대비 (수출 구조) */

/** 2025년 연간 원장과 대면 시장·바이어 구성이 어떻게 움직였는지.
 *  ⚠️ 2026 은 1~5월분이라 **금액은 연환산**해 비교하고, **비중(구성비)은 그대로** 쓴다 —
 *  비중은 기간 길이에 영향받지 않으므로 환산이 필요 없고, 오히려 환산하면 왜곡된다. */
export const exportYoY = (() => {
  const P = priorRaw
  if (!P?.totals?.amountUsd) return null
  const annual = totals.amountUsd * ANNUALIZE
  const mk = byMarket.map((m) => {
    const p = P.byMarket.find((x) => x.key === m.key)
    return {
      key: m.key, share: m.share, priorShare: p?.share ?? 0,
      deltaPp: m.share - (p?.share ?? 0),
      amountUsd: m.amountUsd, priorAmountUsd: p?.amountUsd ?? 0,
      usdPerFcl: m.usdPerFcl, priorUsdPerFcl: p?.usdPerFcl ?? null,
    }
  })
  const bu = byBuyer.slice(0, 10).map((b) => {
    const p = P.byBuyer.find((x) => x.key === b.key)
    return {
      key: b.key, share: b.share, priorShare: p?.share ?? 0,
      deltaPp: b.share - (p?.share ?? 0), isNew: !p,
      usdPerFcl: b.usdPerFcl, priorUsdPerFcl: p?.usdPerFcl ?? null,
    }
  })
  // 전년에 있었는데 올해 사라진 바이어 — 물량 기준 상위만
  const gone = P.byBuyer
    .filter((p) => p.share >= 0.01 && !byBuyer.some((b) => b.key === p.key))
    .map((p) => ({ key: p.key, priorShare: p.share, priorAmountUsd: p.amountUsd }))
  const priorTop3 = P.byBuyer.slice(0, 3).reduce((a, b) => a + b.share, 0)
  const priorHHI = Math.round(P.byMarket.reduce((a, m) => a + (m.share * 100) ** 2, 0) * 10) / 10
  return {
    years: P.years, priorTotals: P.totals,
    annualizedUsd: annual,
    revenueYoY: annual / P.totals.amountUsd - 1,
    fclYoY: (totals.fcl * ANNUALIZE) / P.totals.fcl - 1,
    priorUsdPerFcl: P.totals.fcl ? P.totals.amountUsd / P.totals.fcl : null,
    unitYoY: P.totals.fcl && totals.usdPerFcl
      ? n(totals.usdPerFcl) / (P.totals.amountUsd / P.totals.fcl) - 1 : null,
    markets: mk, buyers: bu, gone,
    priorTop3BuyerShare: priorTop3,
    top3Delta: concentration.top3BuyerShare - priorTop3,
    priorMarketHHI: priorHHI, hhiDelta: concentration.marketHHI - priorHHI,
  }
})()

export const avgUsdPerFcl = n(totals.usdPerFcl)
export const sillaShare = byInvoiceParty.find((x) => /silla/i.test(x.key))?.share ?? null
export const exportCheckFail = exportChecks.filter((c) => !c.ok).length
