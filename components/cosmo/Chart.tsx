'use client'
import { useEffect, useState } from 'react'
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

/* SVG presentation attribute(stroke/fill)에는 var() 가 먹지 않는다.
   토큰을 실제 색으로 풀어서 넘기고, 테마가 바뀌면 다시 읽는다. */
const TOKENS = [
  '--cosmo-s1', '--cosmo-s2', '--cosmo-s3', '--cosmo-s4', '--cosmo-s5',
  '--cosmo-ok', '--cosmo-warn', '--cosmo-bad', '--cosmo-grid', '--cosmo-axis', '--cosmo-line', '--cosmo-muted', '--cosmo-surface',
] as const

function readTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const root = document.querySelector<HTMLElement>('[data-cosmo-dashboard]')
  const cs = getComputedStyle(root ?? document.documentElement)
  const out: Record<string, string> = {}
  TOKENS.forEach((t) => { out[`var(${t})`] = cs.getPropertyValue(t).trim() })
  return out
}

export function useTokens() {
  const [map, setMap] = useState<Record<string, string>>({})
  useEffect(() => {
    const read = () => setMap(readTokens())
    read()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', read)
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => { mq.removeEventListener('change', read); mo.disconnect() }
  }, [])
  return map
}

export type Serie = {
  key: string
  name: string
  color: string                 // CSS var name, e.g. 'var(--cosmo-s1)'
  type?: 'line' | 'bar' | 'area'
  dash?: boolean
  axis?: 'left' | 'right'
  stackId?: string
  fmt?: (v: number) => string
  /** 값의 부호로 색을 바꿈 (손익 막대) */
  signColor?: [string, string]
}

const TICK_SIZE = 10

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0
}

/** 틱 문자열 폭. Recharts 3 는 이 폭이 YAxis.width 를 넘으면 왼쪽이 잘린다. */
export function measureTickPx(label: string, fontSize = TICK_SIZE, pad = 12): number {
  let w = 0
  for (const ch of label) {
    const code = ch.codePointAt(0) ?? 0
    if (code >= 0x1F300) w += fontSize * 1.2
    else if (code >= 0x2E80) w += fontSize
    else w += fontSize * 0.72
  }
  return Math.ceil(w + pad)
}

function numericExtent(
  data: Record<string, unknown>[],
  series: Serie[],
  side: 'left' | 'right',
): { min: number; max: number } {
  const cols = series.filter((s) => (s.axis ?? 'left') === side)
  const stacks = new Map<string, string[]>()
  const singles: string[] = []
  for (const s of cols) {
    if (s.stackId) {
      const keys = stacks.get(s.stackId) ?? []
      keys.push(s.key)
      stacks.set(s.stackId, keys)
    } else {
      singles.push(s.key)
    }
  }
  let min = 0
  let max = 0
  for (const row of data) {
    for (const keys of stacks.values()) {
      const sum = keys.reduce((n, key) => n + num(row[key]), 0)
      min = Math.min(min, sum)
      max = Math.max(max, sum)
    }
    for (const key of singles) {
      const value = num(row[key])
      min = Math.min(min, value)
      max = Math.max(max, value)
    }
  }
  return { min, max }
}

function niceCeil(n: number): number {
  const abs = Math.abs(n)
  if (abs === 0) return 0
  const exp = 10 ** Math.floor(Math.log10(abs))
  return Math.sign(n) * Math.ceil(abs / exp) * exp
}

/** 포맷된 틱이 들어가도록 Y축 폭을 잰다. 고정 58px 는 `20,000천불` 을 자른다. */
export function yAxisWidthForFmt(
  data: Record<string, unknown>[],
  series: Serie[],
  fmt?: (v: number) => string,
  side: 'left' | 'right' = 'left',
): number {
  const { min, max } = numericExtent(data, series, side)
  const values = [min, 0, max, niceCeil(max), niceCeil(min)]
  const samples = values.map((v) => (fmt ? fmt(v) : String(Math.round(v))))
  const widest = Math.max(...samples.map((label) => measureTickPx(label)))
  return Math.min(96, Math.max(56, widest))
}

type Props = {
  data: Record<string, unknown>[]
  x: string
  series: Serie[]
  height?: number
  yFmt?: (v: number) => string
  y2Fmt?: (v: number) => string
  yLabel?: string
  y2Label?: string
  zeroLine?: boolean
  refLines?: { y: number; axis?: 'left' | 'right'; color?: string; label?: string }[]
  domain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax']
  xInterval?: number
  /** 막대를 가로로 눕힌다. 항목이 적고 라벨이 길 때 세로 막대보다 공간 효율이 높다. */
  horizontal?: boolean
  /** 가로 막대일 때 라벨 열 폭 */
  labelWidth?: number
}

function TipBox({ active, payload, label, series }: {
  active?: boolean; payload?: { dataKey?: string | number; value?: number }[]; label?: string; series: Serie[]
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="tip">
      <span className="tk">{label}</span>
      {payload.map((p) => {
        const s = series.find((x) => x.key === p.dataKey)
        if (!s || p.value == null) return null
        return (
          <div className="tr" key={String(p.dataKey)}>
            <span>{s.name}</span>
            <b>{s.fmt ? s.fmt(p.value) : p.value.toLocaleString('en-US')}</b>
          </div>
        )
      })}
    </div>
  )
}

export default function Chart({
  data, x, series, height = 260, yFmt, y2Fmt, yLabel, y2Label,
  zeroLine, refLines, domain, xInterval, horizontal, labelWidth = 110,
}: Props) {
  const tok = useTokens()
  const c = (v: string) => tok[v] ?? v
  const TICK = { fontSize: TICK_SIZE, fontFamily: 'var(--cosmo-mono)', fill: c('var(--cosmo-muted)') }
  const hasRight = series.some((s) => s.axis === 'right')
  const leftWidth = yAxisWidthForFmt(data, series, yFmt, 'left')
  const rightWidth = hasRight ? yAxisWidthForFmt(data, series, y2Fmt, 'right') : 54
  return (
    <div className="chart" style={{ height }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 320, height }}
      >
        <ComposedChart data={data} layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: horizontal ? 40 : (hasRight ? 6 : 10), bottom: 4, left: 0 }}>
          <CartesianGrid stroke={c('var(--cosmo-grid)')} vertical={!!horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={TICK} tickLine={false} axisLine={{ stroke: c('var(--cosmo-line)') }}
                tickFormatter={yFmt} domain={domain} />
              <YAxis type="category" dataKey={x} tick={TICK} tickLine={false} axisLine={false}
                width={labelWidth} interval={0} />
            </>
          ) : (
            <>
              <XAxis dataKey={x} tick={TICK} tickLine={false} axisLine={{ stroke: c('var(--cosmo-line)') }}
                interval={xInterval ?? 'preserveStartEnd'} minTickGap={12} />
              <YAxis yAxisId="left" tick={TICK} tickLine={false} axisLine={false} width={leftWidth}
                tickFormatter={yFmt} domain={domain}
                label={yLabel ? { value: yLabel, position: 'insideTopLeft', offset: -2, style: TICK } : undefined} />
            </>
          )}
          {!horizontal && hasRight && (
            <YAxis yAxisId="right" orientation="right" tick={TICK} tickLine={false} axisLine={false} width={rightWidth}
              tickFormatter={y2Fmt}
              label={y2Label ? { value: y2Label, position: 'insideTopRight', offset: -2, style: TICK } : undefined} />
          )}
          <Tooltip content={<TipBox series={series} />} cursor={{ stroke: c('var(--cosmo-axis)'), strokeWidth: 1 }} />
          {zeroLine && (horizontal
            ? <ReferenceLine x={0} stroke={c('var(--cosmo-axis)')} strokeWidth={1.2} />
            : <ReferenceLine yAxisId="left" y={0} stroke={c('var(--cosmo-axis)')} strokeWidth={1.2} />)}
          {refLines?.map((r, i) => (
            <ReferenceLine key={i} yAxisId={horizontal ? undefined : (r.axis ?? 'left')}
              {...(horizontal ? { x: r.y } : { y: r.y })}
              stroke={c(r.color ?? 'var(--cosmo-muted)')} strokeDasharray="4 4"
              label={r.label ? { value: r.label, position: 'right', style: TICK } : undefined} />
          ))}
          {series.map((s) => {
            const axis = horizontal ? undefined : (s.axis ?? 'left')
            if (s.type === 'bar') {
              return (
                <Bar key={s.key} yAxisId={axis as string | undefined} dataKey={s.key} name={s.name}
                  fill={c(s.color)} radius={[2, 2, 0, 0]} stackId={s.stackId} maxBarSize={38}
                  isAnimationActive={false}>
                  {s.signColor &&
                    data.map((d, i) => (
                      <Cell key={i} fill={c((d[s.key] as number) >= 0 ? s.signColor![0] : s.signColor![1])} />
                    ))}
                </Bar>
              )
            }
            if (s.type === 'area') {
              return (
                <Area key={s.key} yAxisId={axis as string | undefined} dataKey={s.key} name={s.name} type="monotone"
                  stroke={c(s.color)} fill={c(s.color)} fillOpacity={0.18} strokeWidth={1.8}
                  stackId={s.stackId} connectNulls={false} dot={false} isAnimationActive={false} />
              )
            }
            return (
              <Line key={s.key} yAxisId={axis as string | undefined} dataKey={s.key} name={s.name} type="monotone"
                stroke={c(s.color)} strokeWidth={2.1} dot={false} connectNulls={false}
                strokeDasharray={s.dash ? '6 4' : undefined}
                activeDot={{ r: 3.5, strokeWidth: 2, stroke: c('var(--cosmo-surface)') }} isAnimationActive={false} />
            )
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Legend({ items }: { items: { name: string; color: string; box?: boolean; dash?: boolean }[] }) {
  return (
    <div className="legend">
      {items.map((it) => (
        <span key={it.name}>
          <i className={it.box ? 'box' : undefined}
            style={{ background: it.dash ? 'transparent' : it.color, borderTop: it.dash ? `2px dashed ${it.color}` : undefined }} />
          {it.name}
        </span>
      ))}
    </div>
  )
}
