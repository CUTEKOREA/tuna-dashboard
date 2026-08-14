'use client'

import type { ReactNode } from 'react'
import { cosmoTargetFromHref, useCosmoNavigation } from './CosmoNavigation'

export function PageHead({ title, lead, meta }: { title: string; lead: string; meta?: string[] }) {
  return (
    <div className="phead">
      <h1>{title}</h1>
      <p>{lead}</p>
      {meta && <div className="pmeta">{meta.map((m) => <span key={m}>{m}</span>)}</div>}
    </div>
  )
}

export function Card({ title, sub, note, children, span }: {
  title?: string; sub?: string; note?: ReactNode; children: ReactNode; span?: number
}) {
  return (
    <section className="card" style={span ? { gridColumn: `span ${span}` } : undefined}>
      {title && <h2>{title}</h2>}
      {sub && <p className="csub">{sub}</p>}
      {children}
      {note && <div className="cnote">{note}</div>}
    </section>
  )
}

export function Kpi({ k, v, unit, d, tone }: {
  k: string; v: string; unit?: string; d?: ReactNode; tone?: 'up' | 'down' | 'flat'
}) {
  return (
    <div className="kpi">
      <span className="k">{k}</span>
      <span className={`v ${tone ?? ''}`}>{v}{unit && <small>{unit}</small>}</span>
      {d && <span className="d">{d}</span>}
    </div>
  )
}

const DEST: Record<string, string> = {
  '/': '경영요약', '/profit': '손익 · 원가', '/sales': '판매 · 수주', '/production': '생산',
  '/supply': '구매 · 재고', '/cash': '자금', '/market': '시장 · 바이어',
  '/history': '장기 추이', '/quality': '데이터 품질',
}

export function SignalCard({ label, level, value, note, href }: {
  label: string; level: 'ok' | 'warn' | 'bad'; value: string; note: string; href: string
}) {
  const navigate = useCosmoNavigation()
  const text = { ok: '정상', warn: '주의', bad: '경보' }[level]
  const dest = DEST[href.split('#')[0]] ?? '상세'
  const target = cosmoTargetFromHref(href)
  return (
    <button
      type="button"
      className="card cosmo-link-card"
      style={{ display: 'block' }}
      onClick={() => navigate(target.tab, target.anchor)}
    >
      <div className={`sig ${level}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span className="k" style={{ font: '600 9px var(--cosmo-mono)', letterSpacing: '.11em', color: 'var(--cosmo-muted)' }}>
            {label}
          </span>
          <span className={`pill ${level}`}>{text}</span>
        </div>
        <span style={{ fontFamily: 'var(--cosmo-mono)', fontSize: 21, fontWeight: 700, letterSpacing: '-.03em' }}>{value}</span>
        <span style={{ fontSize: 11.5, color: 'var(--cosmo-ink-2)', lineHeight: 1.45 }}>{note}</span>
        <span style={{ font: '600 10px var(--cosmo-mono)', color: 'var(--cosmo-muted)', marginTop: 2 }}>{dest} →</span>
      </div>
    </button>
  )
}

export function Callout({ kind = 'info', label, children }: {
  kind?: 'info' | 'warn' | 'bad'; label: string; children: ReactNode
}) {
  return (
    <div className={`callout ${kind === 'info' ? '' : kind}`}>
      <span className="lab">{label}</span>
      {children}
    </div>
  )
}

export function SecHead({ children, id }: { children: ReactNode; id?: string }) {
  return <div className="sechead" id={id}>{children}</div>
}
